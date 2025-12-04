/**
 * Import Service
 *
 * Orchestrates Apify JSON file import for contractor profiles.
 * Handles validation, city auto-creation, geocoding fallback, and upsert logic.
 *
 * Key constraints:
 * - Max 100 rows per import (synchronous processing)
 * - Images stored as URLs in pending_images (no download during import)
 * - Each row processed independently (failures don't rollback others)
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import { ContractorRepository } from '../repositories/ContractorRepository'
import { LookupRepository } from '../repositories/LookupRepository'
import { GeocodingService } from './GeocodingService'
import { stateToAbbreviation } from '../utils/stateAbbreviations'
import {
  apifyImportFileSchema,
  MAX_IMPORT_ROWS,
  MAX_IMAGES_PER_CONTRACTOR,
  type ApifyRow,
  type ImportSummary,
  type ImportError,
} from '../schemas/import.schemas'

interface ImportServiceConfig {
  geocodingApiKey: string
  imageAllowlist: string[]
}

export class ImportService {
  private contractorRepo: ContractorRepository
  private lookupRepo: LookupRepository
  private geocodingService: GeocodingService
  private imageAllowlist: string[]

  constructor(
    client: SupabaseClient<Database>,
    config: ImportServiceConfig
  ) {
    this.contractorRepo = new ContractorRepository(client)
    this.lookupRepo = new LookupRepository(client)
    this.geocodingService = new GeocodingService(config.geocodingApiKey)
    this.imageAllowlist = config.imageAllowlist
  }

  /**
   * Process an Apify JSON import file
   */
  async processImport(jsonData: unknown): Promise<ImportSummary> {
    const summary: ImportSummary = {
      total: 0,
      imported: 0,
      updated: 0,
      skipped: 0,
      pendingImageCount: 0,
      errors: [],
    }

    // Validate JSON structure
    const parseResult = apifyImportFileSchema.safeParse(jsonData)
    if (!parseResult.success) {
      throw new Error(`Invalid JSON structure: ${parseResult.error.message}`)
    }

    const rows = parseResult.data
    summary.total = rows.length

    // Validate row count
    if (rows.length > MAX_IMPORT_ROWS) {
      throw new Error(`File exceeds ${MAX_IMPORT_ROWS} row limit (received ${rows.length} rows)`)
    }

    consola.info(`Starting import of ${rows.length} rows...`)

    // Process each row independently
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 1

      try {
        consola.debug(`Processing row ${rowNumber}: ${row.title || 'No title'} (placeId: ${row.placeId || 'none'})`)
        const result = await this.processRow(row, rowNumber, summary)
        if (result.isNew) {
          summary.imported++
        } else if (result.isUpdated) {
          summary.updated++
        }
        summary.pendingImageCount += result.pendingImageCount
      } catch (error: unknown) {
        // Extract error message from various error types
        let message = 'Unknown error'
        if (error instanceof Error) {
          message = error.message
        } else if (typeof error === 'object' && error !== null) {
          // Handle Supabase/Postgres errors which may have different shapes
          const errObj = error as Record<string, unknown>
          if (errObj.message) {
            message = String(errObj.message)
          } else if (errObj.details) {
            message = String(errObj.details)
          } else if (errObj.hint) {
            message = String(errObj.hint)
          } else if (errObj.code) {
            message = `Database error code: ${errObj.code}`
          } else {
            message = JSON.stringify(error)
          }
        } else if (typeof error === 'string') {
          message = error
        }

        summary.errors.push({
          row: rowNumber,
          placeId: row.placeId || null,
          message,
        })
        consola.error(`Import row ${rowNumber} failed for "${row.title || 'unknown'}":`, message)
        consola.debug('Full error object:', error)
      }
    }

    consola.success(`Import complete: ${summary.imported} new, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.errors.length} errors`)
    return summary
  }

  /**
   * Process a single row from the import file
   */
  private async processRow(
    row: ApifyRow,
    rowNumber: number,
    summary: ImportSummary
  ): Promise<{ isNew: boolean; isUpdated: boolean; pendingImageCount: number }> {
    // Skip permanently closed businesses
    if (row.permanentlyClosed) {
      summary.skipped++
      if (import.meta.dev) {
        consola.info(`Row ${rowNumber}: Skipped (permanently closed)`)
      }
      return { isNew: false, isUpdated: false, pendingImageCount: 0 }
    }

    // Check if contractor already exists
    const existing = await this.contractorRepo.findByGooglePlaceId(row.placeId)
    const isNew = !existing

    // Resolve city
    const cityId = await this.resolveCity(row)

    // Build contractor data
    const contractorData = await this.buildContractorData(row, cityId)

    // Upsert contractor
    await this.contractorRepo.upsertByGooglePlaceId(contractorData)

    const pendingImageCount = (contractorData.metadata as { pending_images?: string[] })?.pending_images?.length || 0

    if (import.meta.dev) {
      consola.success(`Row ${rowNumber}: ${isNew ? 'Created' : 'Updated'} contractor "${row.title}"`)
    }

    return { isNew, isUpdated: !isNew, pendingImageCount }
  }

  /**
   * Resolve or create city from row data
   */
  private async resolveCity(row: ApifyRow): Promise<string | null> {
    let cityName = row.city?.trim() || null
    let stateCode = stateToAbbreviation(row.state)

    // If missing city or state, try reverse geocoding
    if ((!cityName || !stateCode) && row.location?.lat && row.location?.lng) {
      const geoResult = await this.geocodingService.reverseGeocode(
        row.location.lat,
        row.location.lng
      )

      if (geoResult.success) {
        cityName = cityName || geoResult.city
        stateCode = stateCode || geoResult.stateCode
      }
    }

    // If still missing city or state, return null (geocoding failed will be flagged in metadata)
    if (!cityName || !stateCode) {
      return null
    }

    // Generate city slug
    const citySlug = this.slugify(cityName)

    // Find or create city
    const city = await this.lookupRepo.cities.findOrCreate({
      name: cityName,
      slug: citySlug,
      state_code: stateCode,
      lat: row.location?.lat ?? null,
      lng: row.location?.lng ?? null,
    })

    return city.id
  }

  /**
   * Build contractor data from Apify row
   */
  private async buildContractorData(row: ApifyRow, cityId: string | null) {
    const slug = this.slugify(row.title)

    // Extract categories
    const categories: string[] = []
    if (row.categoryName) categories.push(row.categoryName)
    if (row.categories) {
      for (const cat of row.categories) {
        if (!categories.includes(cat)) categories.push(cat)
      }
    }

    // Extract social links
    const socialLinks: Record<string, string | null> = {
      facebook: row.facebooks?.[0] || null,
      instagram: row.instagrams?.[0] || null,
      linkedin: row.linkedIns?.[0] || null,
      youtube: row.youtubes?.[0] || null,
    }

    // Extract opening hours
    const openingHours = row.openingHours?.map(h => ({
      day: h.day,
      hours: h.hours,
    })) || []

    // Filter and limit image URLs
    // Apify uses different formats:
    // - 'imageUrls': array of strings
    // - 'images': array of objects with imageUrl property, or strings
    const rawImageUrls = this.extractImageUrls(row)
    const pendingImages = this.filterImageUrls(rawImageUrls)

    // Build metadata
    const metadata = {
      categories,
      social_links: socialLinks,
      opening_hours: openingHours,
      pending_images: pendingImages,
      images: [],
      geocoding_failed: cityId === null && !!(row.location?.lat && row.location?.lng),
    }

    return {
      google_place_id: row.placeId,
      google_cid: row.cid || null,
      company_name: row.title,
      slug,
      description: row.description || null,
      city_id: cityId,
      street_address: row.street || null,
      postal_code: row.postalCode || null,
      lat: row.location?.lat ?? null,
      lng: row.location?.lng ?? null,
      phone: row.phone || null,
      website: row.website || null,
      email: row.emails?.[0] || null,
      rating: row.totalScore ?? null,
      review_count: row.reviewsCount ?? 0,
      status: 'pending' as const,
      images_processed: false,
      metadata,
    }
  }

  /**
   * Extract image URLs from Apify row (handles multiple formats)
   */
  private extractImageUrls(row: ApifyRow): string[] {
    const urls: string[] = []

    // Prefer imageUrls (simple string array)
    if (row.imageUrls && Array.isArray(row.imageUrls)) {
      urls.push(...row.imageUrls)
    }

    // Also check images (can be strings or objects with imageUrl)
    if (row.images && Array.isArray(row.images)) {
      for (const img of row.images) {
        if (typeof img === 'string') {
          urls.push(img)
        } else if (img && typeof img === 'object' && 'imageUrl' in img && typeof img.imageUrl === 'string') {
          urls.push(img.imageUrl)
        }
      }
    }

    // Deduplicate
    return [...new Set(urls)]
  }

  /**
   * Filter image URLs against allowlist and limit count
   */
  private filterImageUrls(urls: string[]): string[] {
    return urls
      .filter(url => {
        try {
          const urlObj = new URL(url)
          return this.imageAllowlist.some(domain => urlObj.hostname === domain)
        } catch {
          return false
        }
      })
      .slice(0, MAX_IMAGES_PER_CONTRACTOR)
  }

  /**
   * Convert string to URL-safe slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Trim hyphens from ends
  }
}

