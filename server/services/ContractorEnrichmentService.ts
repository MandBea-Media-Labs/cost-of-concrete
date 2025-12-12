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
import { WebCrawlerService, SystemError } from './WebCrawlerService'
import { AIExtractionService, type ExtractionResult, type ServiceType } from './AIExtractionService'
import { ContractorRepository } from '../repositories/ContractorRepository'

// Re-export SystemError for callers
export { SystemError }

// =====================================================
// TYPES
// =====================================================

export interface EnrichmentResult {
  contractorId: string
  companyName: string
  status: 'success' | 'skipped' | 'failed' | 'not_applicable' | 'bot_blocked'
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
  phone: string | null
  street_address: string | null
  postal_code: string | null
  metadata: Record<string, unknown> | null
  city?: {
    name: string
    state_code: string
  } | null
}

export interface LocationContext {
  streetAddress: string | null
  city: string | null
  state: string | null
  postalCode: string | null
}

interface SiblingContractor {
  id: string
  company_name: string
  website: string
  matchType: 'phone' | 'name'
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
   * Find a sibling contractor with a website (same phone or similar company name)
   *
   * Matching priority:
   * 1. Same phone number (high confidence)
   * 2. Similar company name (medium confidence, requires exact match)
   */
  private async findSiblingContractor(contractor: ContractorForEnrichment): Promise<SiblingContractor | null> {
    const { id, phone, company_name } = contractor

    // Try phone match first (high confidence)
    if (phone && phone.trim()) {
      // Normalize phone for matching (remove non-digits)
      const normalizedPhone = phone.replace(/\D/g, '')

      if (normalizedPhone.length >= 10) {
        const { data: phoneMatches } = await this.client
          .from('contractors')
          .select('id, company_name, website')
          .neq('id', id)
          .not('website', 'is', null)
          .is('deleted_at', null)

        // Filter by normalized phone in application layer for flexibility
        const phoneMatch = phoneMatches?.find((c) => {
          const cPhone = c.website ? (c as unknown as { phone?: string }).phone : null
          return false // Phone not in this query, need separate approach
        })

        // Actually query with phone filter
        const { data: directPhoneMatches } = await this.client
          .from('contractors')
          .select('id, company_name, website, phone')
          .neq('id', id)
          .not('website', 'is', null)
          .not('phone', 'is', null)
          .is('deleted_at', null)
          .limit(50)

        if (directPhoneMatches) {
          for (const match of directPhoneMatches) {
            const matchPhone = (match.phone || '').replace(/\D/g, '')
            if (matchPhone === normalizedPhone && match.website) {
              consola.info(`ContractorEnrichmentService: Found sibling by phone for ${company_name}: ${match.company_name}`)
              return {
                id: match.id,
                company_name: match.company_name,
                website: match.website,
                matchType: 'phone',
              }
            }
          }
        }
      }
    }

    // Try exact company name match (medium confidence)
    if (company_name && company_name.trim()) {
      const { data: nameMatches } = await this.client
        .from('contractors')
        .select('id, company_name, website')
        .neq('id', id)
        .eq('company_name', company_name.trim())
        .not('website', 'is', null)
        .is('deleted_at', null)
        .limit(1)

      if (nameMatches && nameMatches.length > 0 && nameMatches[0].website) {
        consola.info(`ContractorEnrichmentService: Found sibling by name for ${company_name}: ${nameMatches[0].company_name}`)
        return {
          id: nameMatches[0].id,
          company_name: nameMatches[0].company_name,
          website: nameMatches[0].website,
          matchType: 'name',
        }
      }
    }

    return null
  }

  /**
   * Build location context from contractor data
   */
  private buildLocationContext(contractor: ContractorForEnrichment): LocationContext {
    return {
      streetAddress: contractor.street_address || null,
      city: contractor.city?.name || null,
      state: contractor.city?.state_code || null,
      postalCode: contractor.postal_code || null,
    }
  }

  /**
   * Enrich a single contractor
   */
  async enrichContractor(contractor: ContractorForEnrichment): Promise<EnrichmentResult> {
    const { id, company_name, website, metadata } = contractor

    // Check if no website - try to find sibling with website
    if (!website) {
      const sibling = await this.findSiblingContractor(contractor)

      if (!sibling) {
        await this.markAsNotApplicable(id, metadata)
        return {
          contractorId: id,
          companyName: company_name,
          status: 'skipped',
          message: 'No website URL and no sibling contractor found',
          serviceTypesAssigned: 0,
        }
      }

      // Use sibling's website with original contractor's location context
      consola.info(`ContractorEnrichmentService: Using sibling website ${sibling.website} for ${company_name} (matched by ${sibling.matchType})`)
      return this.enrichWithWebsite(contractor, sibling.website, true)
    }

    // Has website - enrich directly
    return this.enrichWithWebsite(contractor, website, false)
  }

  /**
   * Enrich contractor using a specific website URL
   */
  private async enrichWithWebsite(
    contractor: ContractorForEnrichment,
    websiteUrl: string,
    usingSiblingWebsite: boolean
  ): Promise<EnrichmentResult> {
    const { id, company_name, metadata } = contractor
    const locationContext = this.buildLocationContext(contractor)

    try {
      // 1. Crawl website
      consola.info(`ContractorEnrichmentService: Crawling ${websiteUrl} for ${company_name}${usingSiblingWebsite ? ' (sibling website)' : ''}`)
      const crawlResult = await this.crawler.crawl(websiteUrl)

      if (!crawlResult.success || !crawlResult.content) {
        // Handle bot protection separately - flag for elevated scraping (Bright Data)
        if (crawlResult.blockedByBotProtection) {
          await this.markAsBotBlocked(id, metadata, websiteUrl)
          return {
            contractorId: id,
            companyName: company_name,
            status: 'bot_blocked',
            message: 'Website has bot protection - queued for elevated scraping (Bright Data)',
            serviceTypesAssigned: 0,
          }
        }

        await this.markAsFailed(id, metadata, crawlResult.error || 'Crawl failed')
        return {
          contractorId: id,
          companyName: company_name,
          status: 'failed',
          message: `Crawl failed: ${crawlResult.error}`,
          serviceTypesAssigned: 0,
        }
      }

      // 2. AI extraction with location context
      consola.info(`ContractorEnrichmentService: AI extracting for ${company_name}${locationContext.city ? ` (location: ${locationContext.city}, ${locationContext.state})` : ''}`)
      const aiResult = await this.aiExtractor.extract({
        websiteContent: crawlResult.content,
        availableServiceTypes: this.serviceTypes,
        companyName: company_name,
        locationContext,
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
      const serviceTypesAssigned = await this.applyEnrichmentResult(id, metadata, aiResult.result, usingSiblingWebsite)

      return {
        contractorId: id,
        companyName: company_name,
        status: 'success',
        message: `Enriched successfully (${crawlResult.pagesCrawled} pages crawled)${usingSiblingWebsite ? ' using sibling website' : ''}`,
        serviceTypesAssigned,
        tokensUsed: aiResult.tokensUsed,
      }
    } catch (error) {
      // Re-throw system errors - don't mark contractor as failed for infrastructure issues
      if (error instanceof SystemError) {
        throw error
      }

      // Profile-specific error - mark contractor as failed
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
    result: ExtractionResult,
    usingSiblingWebsite = false
  ): Promise<number> {
    const meta = existingMetadata || {}

    // Build enrichment metadata
    const enrichment: Record<string, unknown> = {
      status: 'completed',
      enriched_at: new Date().toISOString(),
      business_hours: result.business_hours,
      social_links: result.social_links,
    }

    // Track if enriched via sibling website
    if (usingSiblingWebsite) {
      enrichment.source = 'sibling_website'
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

    // Always update description from AI enrichment
    if (result.description) {
      updateData.description = result.description
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
    existingMetadata: Record<string, unknown> | null,
    reason = 'No website URL'
  ): Promise<void> {
    const meta = existingMetadata || {}
    await this.client
      .from('contractors')
      .update({
        metadata: {
          ...meta,
          enrichment: {
            status: 'not_applicable',
            reason,
            checked_at: new Date().toISOString(),
          },
        },
      })
      .eq('id', contractorId)
  }

  /**
   * Mark contractor as blocked by bot protection - needs elevated scraping (Bright Data)
   */
  private async markAsBotBlocked(
    contractorId: string,
    existingMetadata: Record<string, unknown> | null,
    websiteUrl: string
  ): Promise<void> {
    const meta = existingMetadata || {}
    await this.client
      .from('contractors')
      .update({
        metadata: {
          ...meta,
          enrichment: {
            status: 'bot_blocked',
            reason: 'Website has bot protection (403/Cloudflare)',
            website_url: websiteUrl,
            requires_elevated_scraping: true,
            blocked_at: new Date().toISOString(),
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
