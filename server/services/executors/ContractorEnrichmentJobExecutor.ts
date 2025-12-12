/**
 * Contractor Enrichment Job Executor
 *
 * Implements JobExecutor interface to run contractor enrichment as a background job.
 * Wraps the ContractorEnrichmentService and reports progress after each contractor.
 *
 * Features:
 * - Processes a batch of contractors by their IDs
 * - Crawls websites and extracts business info using AI
 * - Assigns service types based on AI inference
 * - Reports progress via SSE-compatible callbacks
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../app/types/supabase'
import type {
  BackgroundJobRow,
  JobResult,
  ContractorEnrichmentPayload,
  ContractorEnrichmentResult,
} from '../../schemas/job.schemas'
import { DEFAULT_CONTRACTOR_BATCH_SIZE } from '../../schemas/job.schemas'
import type { JobExecutor, ProgressCallback } from '../JobExecutorRegistry'
import { ContractorEnrichmentService, type EnrichmentResult } from '../ContractorEnrichmentService'
import { SystemLogService } from '../SystemLogService'
import { consola } from 'consola'

export class ContractorEnrichmentJobExecutor implements JobExecutor {
  /**
   * Execute the contractor enrichment job
   */
  async execute(
    job: BackgroundJobRow,
    client: SupabaseClient<Database>,
    onProgress: ProgressCallback
  ): Promise<JobResult> {
    const logService = new SystemLogService(client)
    const enrichmentService = new ContractorEnrichmentService(client)

    // Parse payload
    const payload = (job.payload || {}) as ContractorEnrichmentPayload
    const contractorIds = payload.contractorIds || []

    if (contractorIds.length === 0) {
      consola.warn(`ContractorEnrichmentJobExecutor: Job ${job.id} has no contractor IDs`)
      return this.buildResult([], 0)
    }

    // Limit to batch size
    const batchIds = contractorIds.slice(0, DEFAULT_CONTRACTOR_BATCH_SIZE)

    consola.info(`ContractorEnrichmentJobExecutor: Starting job ${job.id} with ${batchIds.length} contractors`)

    // Set total items for progress tracking
    onProgress({ totalItems: batchIds.length })

    // Log job start
    await logService.logJobEvent(job.id, 'batch_start', `Processing ${batchIds.length} contractors`, {
      contractorCount: batchIds.length,
      contractorIds: batchIds,
    })

    // Initialize service (loads service types)
    try {
      await enrichmentService.initialize()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize enrichment service'
      consola.error(`ContractorEnrichmentJobExecutor: Initialization failed`, error)
      await logService.logJobEvent(job.id, 'init_failed', message, {}, 'error')
      throw error
    }

    // Fetch contractors by IDs
    const { data: contractors, error: fetchError } = await client
      .from('contractors')
      .select('id, company_name, website, metadata')
      .in('id', batchIds)

    if (fetchError) {
      consola.error(`ContractorEnrichmentJobExecutor: Failed to fetch contractors`, fetchError)
      await logService.logJobEvent(job.id, 'fetch_failed', fetchError.message, {}, 'error')
      throw new Error(`Failed to fetch contractors: ${fetchError.message}`)
    }

    if (!contractors || contractors.length === 0) {
      consola.warn(`ContractorEnrichmentJobExecutor: No contractors found for IDs`)
      await enrichmentService.close()
      return this.buildResult([], 0)
    }

    // Update total items based on actual contractors found
    onProgress({ totalItems: contractors.length })

    // Process each contractor
    const results: EnrichmentResult[] = []
    let processedCount = 0
    let successCount = 0
    let skippedCount = 0
    let failedCount = 0
    let totalTokens = 0

    try {
      for (const contractor of contractors) {
        // Log contractor start
        await logService.logJobEvent(
          job.id,
          'contractor_start',
          `Processing: ${contractor.company_name}`,
          { contractorId: contractor.id }
        )

        // Enrich contractor
        const result = await enrichmentService.enrichContractor({
          id: contractor.id,
          company_name: contractor.company_name,
          website: contractor.website,
          metadata: contractor.metadata as Record<string, unknown> | null,
        })

        results.push(result)
        processedCount++
        totalTokens += result.tokensUsed || 0

        // Update counts
        if (result.status === 'success') {
          successCount++
        } else if (result.status === 'skipped') {
          skippedCount++
        } else {
          failedCount++
        }

        // Report progress
        onProgress({
          processedItems: processedCount,
          failedItems: failedCount,
        })

        // Log contractor complete
        await logService.logJobEvent(
          job.id,
          'contractor_complete',
          `${result.status}: ${contractor.company_name} - ${result.message}`,
          {
            contractorId: contractor.id,
            status: result.status,
            serviceTypesAssigned: result.serviceTypesAssigned,
            tokensUsed: result.tokensUsed,
          },
          result.status === 'failed' ? 'warn' : 'info'
        )

        consola.debug(`ContractorEnrichmentJobExecutor: [${processedCount}/${contractors.length}] ${contractor.company_name} - ${result.status}`)
      }
    } finally {
      // Always close the browser
      await enrichmentService.close()
    }

    // Log final summary
    await logService.logJobEvent(job.id, 'batch_complete', `Processed ${processedCount} contractors`, {
      processed: processedCount,
      successful: successCount,
      skipped: skippedCount,
      failed: failedCount,
      totalTokens,
    })

    consola.success(`ContractorEnrichmentJobExecutor: Job ${job.id} complete - ${successCount} success, ${skippedCount} skipped, ${failedCount} failed`)

    return this.buildResult(results, totalTokens)
  }

  /**
   * Build the job result from enrichment results
   */
  private buildResult(results: EnrichmentResult[], totalTokens: number): ContractorEnrichmentResult {
    return {
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
      totalTokens,
      results: results.map(r => ({
        contractorId: r.contractorId,
        companyName: r.companyName,
        status: r.status,
        message: r.message,
        serviceTypesAssigned: r.serviceTypesAssigned,
      })),
    }
  }
}

