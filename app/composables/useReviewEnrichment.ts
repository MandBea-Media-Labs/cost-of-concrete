/**
 * Composable for review enrichment management
 *
 * Handles:
 * - Fetching contractors for review enrichment with filters
 * - Loading enrichment statistics
 * - Managing active job state and SSE connection
 * - Batch job creation (splits into 10-contractor jobs)
 */

import type { Database } from '~/types/supabase'

type Contractor = Database['public']['Tables']['contractors']['Row'] & {
  city?: {
    id: string
    name: string
    slug: string
    state_code: string
  } | null
}

export type ReviewEnrichmentStatus = 'all' | 'no_reviews' | 'has_reviews' | 'recently_enriched' | 'failed' | 'no_cid'

export interface ReviewEnrichmentFilters {
  enrichmentStatus?: ReviewEnrichmentStatus | null
  cityId?: string | null
  search?: string | null
  hasGoogleCid?: boolean | null
  page?: number
  limit?: number
}

export interface ReviewEnrichmentStats {
  total: number
  noReviews: number
  hasReviews: number
  recentlyEnriched: number
  noCid: number
  failed: number
}

export interface ActiveJob {
  id: string
  status: string
  processedItems: number
  totalItems: number | null
  failedItems: number
}

export function useReviewEnrichment() {
  // State
  const contractors = ref<Contractor[]>([])
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 50,
    offset: 0,
    totalPages: 0,
  })
  const stats = ref<ReviewEnrichmentStats>({
    total: 0,
    noReviews: 0,
    hasReviews: 0,
    recentlyEnriched: 0,
    noCid: 0,
    failed: 0,
  })
  const activeJob = ref<ActiveJob | null>(null)
  const pending = ref(false)
  const error = ref<Error | null>(null)
  const sseConnected = ref(false)
  const eventSource = ref<EventSource | null>(null)

  // Computed
  const hasActiveJob = computed(() => {
    return activeJob.value && ['pending', 'processing'].includes(activeJob.value.status)
  })

  // Fetch contractors with filters
  async function fetchContractors(filters: ReviewEnrichmentFilters = {}) {
    try {
      pending.value = true
      error.value = null

      const query: Record<string, unknown> = {}

      // Filter by enrichment status
      if (filters.enrichmentStatus && filters.enrichmentStatus !== 'all') {
        switch (filters.enrichmentStatus) {
          case 'no_reviews':
            query.hasReviews = false
            query.hasGoogleCid = true
            break
          case 'has_reviews':
            query.hasReviews = true
            break
          case 'no_cid':
            query.hasGoogleCid = false
            break
          case 'failed':
            query.reviewEnrichmentStatus = 'failed'
            break
          case 'recently_enriched':
            query.reviewEnrichmentStatus = 'success'
            break
        }
      }

      if (filters.cityId) {
        query.cityId = filters.cityId
      }

      if (filters.search) {
        query.search = filters.search
      }

      if (filters.hasGoogleCid !== undefined && filters.hasGoogleCid !== null) {
        query.hasGoogleCid = filters.hasGoogleCid
      }

      const page = filters.page || 1
      const limit = filters.limit || 50
      query.limit = limit
      query.offset = (page - 1) * limit

      const response = await $fetch<{
        success: boolean
        data: Contractor[]
        pagination: typeof pagination.value
      }>('/api/contractors', { query })

      if (response.success) {
        contractors.value = response.data
        pagination.value = response.pagination
      }
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching contractors for review enrichment:', err)
    } finally {
      pending.value = false
    }
  }

  // Fetch enrichment stats
  async function fetchStats() {
    try {
      const response = await $fetch<{
        success: boolean
        stats: ReviewEnrichmentStats
      }>('/api/contractors/review-enrichment-stats')

      if (response.success) {
        stats.value = response.stats
      }
    } catch {
      // Stats are informational, don't throw
    }
  }

  // Fetch active job
  async function fetchActiveJob() {
    try {
      const response = await $fetch<{
        success: boolean
        data: ActiveJob[]
      }>('/api/jobs', {
        query: { jobType: 'review_enrichment', limit: 1 },
      })

      const active = response.data.find(j => ['pending', 'processing'].includes(j.status))
      activeJob.value = active || null
    } catch {
      // Silently fail
    }
  }

  // Queue enrichment jobs for selected contractors
  // Splits into batches of 10 contractors per job
  async function queueEnrichmentJobs(
    contractorIds: string[],
    options: { maxDepth?: number; continuous?: boolean } = {}
  ): Promise<{ jobIds: string[] }> {
    const jobIds: string[] = []
    const batchSize = 10

    // Split into batches
    for (let i = 0; i < contractorIds.length; i += batchSize) {
      const batch = contractorIds.slice(i, i + batchSize)

      const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/jobs', {
        method: 'POST',
        body: {
          jobType: 'review_enrichment',
          payload: {
            contractorIds: batch,
            maxDepth: options.maxDepth || 50,
            continuous: options.continuous || false,
          },
        },
      })

      if (response.success && response.data?.id) {
        jobIds.push(response.data.id)
      }
    }

    // Refresh active job state
    await fetchActiveJob()

    return { jobIds }
  }

  return {
    // State
    contractors,
    pagination,
    stats,
    activeJob,
    pending,
    error,
    sseConnected,
    eventSource,

    // Computed
    hasActiveJob,

    // Methods
    fetchContractors,
    fetchStats,
    fetchActiveJob,
    queueEnrichmentJobs,
  }
}
