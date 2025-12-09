/**
 * Image Enrichment Service
 *
 * Processes pending images for contractors:
 * - Downloads images from metadata.pending_images[]
 * - Uploads to Supabase Storage
 * - Updates metadata.images[] with storage paths
 * - Sets images_processed = true
 *
 * Called asynchronously via POST /api/contractors/enrich-images
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import { ContractorRepository, type ContractorMetadata } from '../repositories/ContractorRepository'
import { IMAGE_DOWNLOAD_TIMEOUT_MS, type EnrichmentSummary } from '../schemas/import.schemas'
import { createHash } from 'crypto'

interface ProcessedImage {
  storage_path: string
  original_url: string
  display_order: number
  is_primary: boolean
  uploaded_at: string
}

export class ImageEnrichmentService {
  private client: SupabaseClient<Database>
  private contractorRepo: ContractorRepository
  private bucketName = 'contractors'

  constructor(client: SupabaseClient<Database>) {
    this.client = client
    this.contractorRepo = new ContractorRepository(client)
  }

  /**
   * Process all contractors with pending images
   */
  async processAllPendingImages(batchSize = 10): Promise<EnrichmentSummary> {
    const summary: EnrichmentSummary = {
      processedContractors: 0,
      totalImages: 0,
      failedImages: 0,
      contractorsRemaining: 0,
    }

    // Get total count of pending contractors first
    const { count: totalPending } = await this.client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .eq('images_processed', false)

    // Fetch contractors with pending images
    const contractors = await this.contractorRepo.findPendingImageProcessing(batchSize)

    if (contractors.length === 0) {
      consola.info('ImageEnrichmentService: No contractors with pending images')
      return summary
    }

    // Calculate remaining after this batch
    summary.contractorsRemaining = Math.max(0, (totalPending || 0) - contractors.length)

    consola.info(`ImageEnrichmentService: Processing ${contractors.length} contractors, ${summary.contractorsRemaining} remaining`)

    for (const contractor of contractors) {
      try {
        const result = await this.processContractorImages(contractor)
        summary.processedContractors++
        summary.totalImages += result.successCount
        summary.failedImages += result.failedCount
      } catch (error) {
        consola.error(`ImageEnrichmentService: Failed to process contractor ${contractor.id}`, error)
        summary.failedImages++
      }
    }

    consola.success(`ImageEnrichmentService: Processed ${summary.processedContractors} contractors, ${summary.totalImages} images, ${summary.failedImages} failed`)
    return summary
  }

  /**
   * Process images for a single contractor
   */
  private async processContractorImages(
    contractor: Database['public']['Tables']['contractors']['Row']
  ): Promise<{ successCount: number; failedCount: number }> {
    const metadata = (contractor.metadata || {}) as ContractorMetadata
    const pendingImages = metadata.pending_images || []

    if (pendingImages.length === 0) {
      // No pending images, just mark as processed
      await this.contractorRepo.markImagesProcessed(contractor.id, [])
      return { successCount: 0, failedCount: 0 }
    }

    const processedImages: ProcessedImage[] = []
    let failedCount = 0

    for (let i = 0; i < pendingImages.length; i++) {
      const imageUrl = pendingImages[i]

      try {
        const storagePath = await this.downloadAndUploadImage(
          imageUrl,
          contractor.google_place_id || contractor.id
        )

        if (storagePath) {
          processedImages.push({
            storage_path: storagePath,
            original_url: imageUrl,
            display_order: i,
            is_primary: i === 0,
            uploaded_at: new Date().toISOString(),
          })
        } else {
          failedCount++
        }
      } catch (error) {
        consola.warn(`ImageEnrichmentService: Failed to process image ${imageUrl}`, error)
        failedCount++
      }
    }

    // Update contractor with processed images
    await this.updateContractorImages(contractor.id, metadata, processedImages)

    return { successCount: processedImages.length, failedCount }
  }

  /**
   * Download image from URL and upload to Supabase Storage
   */
  private async downloadAndUploadImage(
    imageUrl: string,
    placeId: string
  ): Promise<string | null> {
    try {
      // Download with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), IMAGE_DOWNLOAD_TIMEOUT_MS)

      const response = await fetch(imageUrl, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        consola.warn(`ImageEnrichmentService: HTTP ${response.status} for ${imageUrl}`)
        return null
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg'
      const extension = this.getExtensionFromContentType(contentType)
      const buffer = await response.arrayBuffer()

      // Generate hash for filename
      const hash = createHash('md5').update(Buffer.from(buffer)).digest('hex').slice(0, 12)
      const storagePath = `${placeId}/${hash}.${extension}`

      // Upload to Supabase Storage
      const { error } = await this.client.storage
        .from(this.bucketName)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        })

      if (error) {
        consola.warn(`ImageEnrichmentService: Storage upload failed for ${storagePath}`, error)
        return null
      }

      if (import.meta.dev) {
        consola.success(`ImageEnrichmentService: Uploaded ${storagePath}`)
      }

      return storagePath
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        consola.warn(`ImageEnrichmentService: Timeout downloading ${imageUrl}`)
      } else {
        consola.warn(`ImageEnrichmentService: Error downloading ${imageUrl}`, error)
      }
      return null
    }
  }

  /**
   * Update contractor with processed images
   */
  private async updateContractorImages(
    contractorId: string,
    existingMetadata: ContractorMetadata,
    processedImages: ProcessedImage[]
  ): Promise<void> {
    const existingImages = existingMetadata.images || []

    const updatedMetadata: ContractorMetadata = {
      ...existingMetadata,
      images: [...existingImages, ...processedImages.map(img => img.storage_path)],
      pending_images: [],
    }

    const { error } = await this.client
      .from('contractors')
      .update({
        images_processed: true,
        metadata: updatedMetadata as unknown as Database['public']['Tables']['contractors']['Update']['metadata'],
      })
      .eq('id', contractorId)

    if (error) throw error
  }

  /**
   * Get file extension from content type
   */
  private getExtensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    }
    return map[contentType.toLowerCase()] || 'jpg'
  }
}

