/**
 * GET /api/contractors/review-enrichment-stats
 *
 * Returns statistics about contractor review enrichment status.
 * Used by the admin UI to display counts of enriched/unenriched contractors.
 *
 * Review enrichment status is determined by metadata.reviews_enrichment.status:
 * - null/undefined: Not started (no reviews)
 * - 'success': Successfully enriched
 * - 'failed': Enrichment failed
 * - 'not_applicable': Missing Google CID
 *
 * Also checks for 30-day cooldown period.
 *
 * @returns {Object} Review enrichment statistics
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../../utils/auth'
import { REVIEW_ENRICHMENT_COOLDOWN_DAYS } from '../../schemas/job.schemas'

interface ReviewEnrichmentStatsResponse {
  success: boolean
  stats: {
    total: number
    noReviews: number
    hasReviews: number
    recentlyEnriched: number
    noCid: number
    failed: number
  }
}

export default defineEventHandler(async (event): Promise<ReviewEnrichmentStatsResponse> => {
  // Require admin authentication
  await requireAdmin(event)

  try {
    const client = await serverSupabaseClient(event)

    // Get total contractor count (not deleted)
    const { count: total, error: totalError } = await client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    if (totalError) throw totalError

    // Get count with no Google CID (ineligible for enrichment)
    const { count: noCid, error: noCidError } = await client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .is('google_cid', null)

    if (noCidError) throw noCidError

    // Get count with reviews (has been enriched or imported)
    const { count: hasReviews, error: hasReviewsError } = await client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .gt('review_count', 0)

    if (hasReviewsError) throw hasReviewsError

    // Get count recently enriched (within cooldown period)
    const cooldownDate = new Date()
    cooldownDate.setDate(cooldownDate.getDate() - REVIEW_ENRICHMENT_COOLDOWN_DAYS)
    const cooldownDateStr = cooldownDate.toISOString()

    const { count: recentlyEnriched, error: recentlyError } = await client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .not('google_cid', 'is', null)
      .eq('metadata->reviews_enrichment->>status', 'success')
      .gte('metadata->reviews_enrichment->>last_attempt_at', cooldownDateStr)

    if (recentlyError) throw recentlyError

    // Get count with failed enrichment
    const { count: failed, error: failedError } = await client
      .from('contractors')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .eq('metadata->reviews_enrichment->>status', 'failed')

    if (failedError) throw failedError

    // Calculate no reviews (eligible for enrichment)
    const totalCount = total ?? 0
    const noCidCount = noCid ?? 0
    const hasReviewsCount = hasReviews ?? 0
    const recentlyEnrichedCount = recentlyEnriched ?? 0
    const failedCount = failed ?? 0

    // No reviews = total - noCid - hasReviews (doesn't have reviews yet and has CID)
    // Note: some overlap may exist, but this gives a rough estimate
    const noReviewsCount = Math.max(0, totalCount - noCidCount - hasReviewsCount)

    if (import.meta.dev) {
      consola.info('GET /api/contractors/review-enrichment-stats', {
        total: totalCount,
        noReviews: noReviewsCount,
        hasReviews: hasReviewsCount,
        recentlyEnriched: recentlyEnrichedCount,
        noCid: noCidCount,
        failed: failedCount,
      })
    }

    return {
      success: true,
      stats: {
        total: totalCount,
        noReviews: noReviewsCount,
        hasReviews: hasReviewsCount,
        recentlyEnriched: recentlyEnrichedCount,
        noCid: noCidCount,
        failed: failedCount,
      },
    }
  } catch (error) {
    consola.error('GET /api/contractors/review-enrichment-stats - Error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to get review enrichment stats',
    })
  }
})

