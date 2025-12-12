/**
 * Composable for contractor enrichment management
 *
 * Handles:
 * - Fetching contractors for enrichment with filters
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

export type EnrichmentStatus = 'not_started' | 'completed' | 'failed' | 'not_applicable'

export interface ContractorEnrichmentFilters {
  enrichmentStatus?: EnrichmentStatus | null
  cityId?: string | null
  search?: string | null
  hasWebsite?: boolean | null
  page?: number
  limit?: number
}

export interface EnrichmentStats {
  total: number
  unenriched: number
  enriched: number
  failed: number
  noWebsite: number
}

export interface ActiveJob {
  id: string
  status: string
  processedItems: number
  totalItems: number | null
  failedItems: number
}

export function useContractorEnrichment() {
  // State
  const contractors = ref<Contractor[]>([])
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 50,
    offset: 0,
    totalPages: 0,
  })
  const stats = ref<EnrichmentStats>({
    total: 0,
    unenriched: 0,
    enriched: 0,
    failed: 0,
    noWebsite: 0,
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
  async function fetchContractors(filters: ContractorEnrichmentFilters = {}) {
    try {
      pending.value = true
      error.value = null

      const query: Record<string, unknown> = {}

      if (filters.enrichmentStatus) {
        query.enrichmentStatus = filters.enrichmentStatus
      }

      if (filters.cityId) {
        query.cityId = filters.cityId
      }

      if (filters.search) {
        query.search = filters.search
      }

      if (filters.hasWebsite !== undefined && filters.hasWebsite !== null) {
        query.hasWebsite = filters.hasWebsite
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
      console.error('Error fetching contractors for enrichment:', err)
    } finally {
      pending.value = false
    }
  }

  // Fetch enrichment stats
  async function fetchStats() {
    try {
      const response = await $fetch<{
        success: boolean
        stats: EnrichmentStats
      }>('/api/contractors/enrichment-stats')

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
        query: { jobType: 'contractor_enrichment', limit: 1 },
      })

      const active = response.data.find(j => ['pending', 'processing'].includes(j.status))
      activeJob.value = active || null
    } catch {
      // Silently fail
    }
  }

  // Queue enrichment jobs for selected contractors
  async function queueEnrichmentJobs(contractorIds: string[]): Promise<{ jobIds: string[] }> {
    const jobIds: string[] = []
    const batchSize = 10

    // Split into batches of 10
    for (let i = 0; i < contractorIds.length; i += batchSize) {
      const batch = contractorIds.slice(i, i + batchSize)

      const response = await $fetch<{ success: boolean; data: { id: string } }>('/api/jobs', {
        method: 'POST',
        body: {
          jobType: 'contractor_enrichment',
          payload: { contractorIds: batch },
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

