/**
 * Contractor Enrichment Service
 *
 * Orchestrates the contractor enrichment process:
 * 1. Crawl contractor website with WebCrawlerService
 * 2. Extract business info with AIExtractionService
 * 3. Update contractor metadata and service type associations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import { consola } from 'consola'
import { WebCrawlerService } from './WebCrawlerService'
import { AIExtractionService, type ExtractionResult, type ServiceType } from './AIExtractionService'
import { ContractorRepository } from '../repositories/ContractorRepository'

// =====================================================
// TYPES
// =====================================================

export interface EnrichmentResult {
  contractorId: string
  companyName: string
  status: 'success' | 'skipped' | 'failed'
  message: string
  serviceTypesAssigned: number
  tokensUsed?: number
}

export interface EnrichmentSummary {
  processed: number
  successful: number
  skipped: number
  failed: number
  totalTokens: number
}

export interface ContractorForEnrichment {
  id: string
  company_name: string
  website: string | null
  metadata: Record<string, unknown> | null
}

// Default service type slug when AI extraction fails
const DEFAULT_SERVICE_TYPE_SLUG = 'concrete-contractor'

// =====================================================
// SERVICE
// =====================================================

export class ContractorEnrichmentService {
  private client: SupabaseClient<Database>
  private contractorRepo: ContractorRepository
  private crawler: WebCrawlerService
  private aiExtractor: AIExtractionService
  private serviceTypes: ServiceType[] = []
  private defaultServiceTypeId: string | null = null

  constructor(client: SupabaseClient<Database>) {
    this.client = client
    this.contractorRepo = new ContractorRepository(client)
    this.crawler = new WebCrawlerService()
    this.aiExtractor = new AIExtractionService()
  }

  /**
   * Initialize service - load service types
   */
  async initialize(): Promise<void> {
    // Load all service types
    const { data, error } = await this.client
      .from('service_types')
      .select('id, name, slug')
      .order('name')

    if (error) {
      throw new Error(`Failed to load service types: ${error.message}`)
    }

    this.serviceTypes = data || []

    // Find default service type
    const defaultType = this.serviceTypes.find(st => st.slug === DEFAULT_SERVICE_TYPE_SLUG)
    this.defaultServiceTypeId = defaultType?.id || null

    consola.debug(`ContractorEnrichmentService: Loaded ${this.serviceTypes.length} service types`)
  }

  /**
   * Close resources
   */
  async close(): Promise<void> {
    await this.crawler.close()
  }

  /**
   * Enrich a single contractor
   */
  async enrichContractor(contractor: ContractorForEnrichment): Promise<EnrichmentResult> {
    const { id, company_name, website, metadata } = contractor

    // Check if no website
    if (!website) {
      await this.markAsNotApplicable(id, metadata)
      return {
        contractorId: id,
        companyName: company_name,
        status: 'skipped',
        message: 'No website URL',
        serviceTypesAssigned: 0,
      }
    }

    try {
      // 1. Crawl website
      consola.info(`ContractorEnrichmentService: Crawling ${website} for ${company_name}`)
      const crawlResult = await this.crawler.crawl(website)

      if (!crawlResult.success || !crawlResult.content) {
        await this.markAsFailed(id, metadata, crawlResult.error || 'Crawl failed')
        return {
          contractorId: id,
          companyName: company_name,
          status: 'failed',
          message: `Crawl failed: ${crawlResult.error}`,
          serviceTypesAssigned: 0,
        }
      }

      // 2. AI extraction
      consola.info(`ContractorEnrichmentService: AI extracting for ${company_name}`)
      const aiResult = await this.aiExtractor.extract({
        websiteContent: crawlResult.content,
        availableServiceTypes: this.serviceTypes,
        companyName: company_name,
      })

      if (!aiResult.success || !aiResult.result) {
        // Assign default service type on AI failure
        await this.assignDefaultServiceType(id)
        await this.markAsFailed(id, metadata, aiResult.error || 'AI extraction failed')
        return {
          contractorId: id,
          companyName: company_name,
          status: 'failed',
          message: `AI extraction failed: ${aiResult.error}`,
          serviceTypesAssigned: this.defaultServiceTypeId ? 1 : 0,
          tokensUsed: aiResult.tokensUsed,
        }
      }

      // 3. Update contractor and assign service types
      const serviceTypesAssigned = await this.applyEnrichmentResult(id, metadata, aiResult.result)

      return {
        contractorId: id,
        companyName: company_name,
        status: 'success',
        message: `Enriched successfully (${crawlResult.pagesCrawled} pages crawled)`,
        serviceTypesAssigned,
        tokensUsed: aiResult.tokensUsed,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await this.markAsFailed(id, metadata, message)
      return {
        contractorId: id,
        companyName: company_name,
        status: 'failed',
        message,
        serviceTypesAssigned: 0,
      }
    }
  }

  /**
   * Apply enrichment result to contractor
   */
  private async applyEnrichmentResult(
    contractorId: string,
    existingMetadata: Record<string, unknown> | null,
    result: ExtractionResult
  ): Promise<number> {
    const meta = existingMetadata || {}

    // Build enrichment metadata
    const enrichment = {
      status: 'completed',
      enriched_at: new Date().toISOString(),
      business_hours: result.business_hours,
      social_links: result.social_links,
    }

    // Update contractor with enriched data
    const updateData: Record<string, unknown> = {
      metadata: {
        ...meta,
        enrichment,
      },
    }

    // Only update email/phone if we found them and they're not already set
    if (result.email) {
      updateData.email = result.email
    }
    if (result.phone) {
      updateData.phone = result.phone
    }

    await this.client
      .from('contractors')
      .update(updateData)
      .eq('id', contractorId)

    // Assign service types
    let assignedCount = 0
    if (result.service_slugs.length > 0) {
      assignedCount = await this.assignServiceTypes(contractorId, result.service_slugs)
    }

    // If no service types found, assign default
    if (assignedCount === 0 && this.defaultServiceTypeId) {
      await this.assignDefaultServiceType(contractorId)
      assignedCount = 1
    }

    return assignedCount
  }

  /**
   * Assign service types to contractor
   */
  private async assignServiceTypes(contractorId: string, slugs: string[]): Promise<number> {
    // Map slugs to IDs
    const serviceTypeIds = slugs
      .map(slug => this.serviceTypes.find(st => st.slug === slug)?.id)
      .filter((id): id is string => !!id)

    if (serviceTypeIds.length === 0) return 0

    // Insert associations (ignore conflicts)
    const inserts = serviceTypeIds.map(serviceTypeId => ({
      contractor_id: contractorId,
      service_type_id: serviceTypeId,
      source: 'ai_enrichment' as const,
      confidence_score: 0.85,
    }))

    const { error } = await this.client
      .from('contractor_service_types')
      .upsert(inserts, { onConflict: 'contractor_id,service_type_id' })

    if (error) {
      consola.warn(`ContractorEnrichmentService: Failed to assign service types`, error)
      return 0
    }

    return serviceTypeIds.length
  }

  /**
   * Assign default service type
   */
  private async assignDefaultServiceType(contractorId: string): Promise<void> {
    if (!this.defaultServiceTypeId) return

    await this.client
      .from('contractor_service_types')
      .upsert({
        contractor_id: contractorId,
        service_type_id: this.defaultServiceTypeId,
        source: 'ai_enrichment',
        confidence_score: 1.0,
      }, { onConflict: 'contractor_id,service_type_id' })
  }

  /**
   * Mark contractor as not applicable for enrichment
   */
  private async markAsNotApplicable(
    contractorId: string,
    existingMetadata: Record<string, unknown> | null
  ): Promise<void> {
    const meta = existingMetadata || {}
    await this.client
      .from('contractors')
      .update({
        metadata: {
          ...meta,
          enrichment: {
            status: 'not_applicable',
            reason: 'No website URL',
            checked_at: new Date().toISOString(),
          },
        },
      })
      .eq('id', contractorId)
  }

  /**
   * Mark contractor enrichment as failed
   */
  private async markAsFailed(
    contractorId: string,
    existingMetadata: Record<string, unknown> | null,
    error: string
  ): Promise<void> {
    const meta = existingMetadata || {}
    await this.client
      .from('contractors')
      .update({
        metadata: {
          ...meta,
          enrichment: {
            status: 'failed',
            error,
            failed_at: new Date().toISOString(),
          },
        },
      })
      .eq('id', contractorId)
  }
}
