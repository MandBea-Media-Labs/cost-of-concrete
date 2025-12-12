<script setup lang="ts">
/**
 * Contractor Enrichment Page
 *
 * Queue background jobs for AI-powered contractor profile enrichment.
 * Crawls contractor websites and extracts structured data using GPT-4.
 */
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import NumberFlow from '@number-flow/vue'
import type { EnrichmentStatus, ContractorEnrichmentFilters } from '~/composables/useContractorEnrichment'

definePageMeta({
  layout: 'admin',
})

useSeoMeta({
  title: 'Contractor Enrichment',
})

// =====================================================
// STATE
// =====================================================

const {
  contractors,
  pagination,
  stats,
  activeJob,
  pending,
  hasActiveJob,
  sseConnected,
  eventSource,
  fetchContractors,
  fetchStats,
  fetchActiveJob,
  queueEnrichmentJobs,
} = useContractorEnrichment()

const isLoading = ref(false)
const isQueuing = ref(false)
const errorMessage = ref<string | null>(null)
const selectedIds = ref<Set<string>>(new Set())

// Filters
const selectedEnrichmentStatus = ref<string>('not_started')
const selectedCity = ref<string>('all')
const searchQuery = ref<string>('')

// Cities for dropdown
interface City {
  id: string
  name: string
  state_code: string
}
const cities = ref<City[]>([])

// Polling
let pollInterval: ReturnType<typeof setInterval> | null = null
const POLL_INTERVAL_MS = 5000

// SSE throttle
let lastStatsFetch = 0
const STATS_THROTTLE_MS = 2000
let disconnectTimeout: ReturnType<typeof setTimeout> | null = null

// =====================================================
// COMPUTED
// =====================================================

const cityOptions = computed(() => [
  { value: 'all', label: 'All Cities' },
  ...cities.value.map(city => ({
    value: city.id,
    label: `${city.name}, ${city.state_code}`,
  })),
])

const enrichmentStatusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'not_applicable', label: 'No Website' },
]

const canQueueJob = computed(() => {
  return selectedIds.value.size > 0 && !isQueuing.value && !hasActiveJob.value
})

const allSelected = computed(() => {
  return contractors.value.length > 0 && contractors.value.every(c => selectedIds.value.has(c.id))
})

// =====================================================
// METHODS
// =====================================================

const buildFilters = (): ContractorEnrichmentFilters => ({
  enrichmentStatus: selectedEnrichmentStatus.value === 'all'
    ? null
    : selectedEnrichmentStatus.value as EnrichmentStatus,
  cityId: selectedCity.value === 'all' ? null : selectedCity.value,
  search: searchQuery.value.trim() || null,
  page: pagination.value.page,
  limit: pagination.value.limit,
})

const fetchCities = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: City[] }>('/api/cities', {
      query: { limit: 500 },
    })
    if (response.success) {
      cities.value = response.data
    }
  } catch {
    // Silently fail
  }
}

const refreshData = async (options: { showLoading?: boolean } = {}) => {
  const { showLoading = true } = options
  if (showLoading) isLoading.value = true
  await Promise.all([
    fetchContractors(buildFilters()),
    fetchStats(),
    fetchActiveJob(),
  ])
  if (showLoading) isLoading.value = false
}

const handleFilterChange = async () => {
  pagination.value.page = 1
  selectedIds.value.clear()
  await fetchContractors(buildFilters())
}

const handlePageChange = async (newPage: number) => {
  pagination.value.page = newPage
  selectedIds.value.clear()
  await fetchContractors(buildFilters())
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value.clear()
  } else {
    contractors.value.forEach(c => selectedIds.value.add(c.id))
  }
}

const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

const queueJobs = async () => {
  if (!canQueueJob.value) return

  isQueuing.value = true
  errorMessage.value = null

  try {
    const ids = Array.from(selectedIds.value)
    await queueEnrichmentJobs(ids)
    selectedIds.value.clear()
    await refreshData({ showLoading: false })
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to queue jobs'
  } finally {
    isQueuing.value = false
  }
}

// =====================================================
// SSE CONNECTION
// =====================================================

const connectSSE = () => {
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout)
    disconnectTimeout = null
  }

  if (!hasActiveJob.value || !activeJob.value) {
    disconnectSSE()
    return
  }

  if (eventSource.value) return

  eventSource.value = new EventSource(`/api/jobs/${activeJob.value.id}/stream`)

  eventSource.value.onopen = () => {
    sseConnected.value = true
  }

  eventSource.value.onerror = () => {
    sseConnected.value = false
    setTimeout(() => {
      if (hasActiveJob.value) {
        disconnectSSE()
        connectSSE()
      }
    }, 3000)
  }

  eventSource.value.addEventListener('progress', (e) => {
    const data = JSON.parse(e.data)
    if (activeJob.value) {
      activeJob.value.processedItems = data.processedItems
      activeJob.value.failedItems = data.failedItems
      if (data.totalItems) activeJob.value.totalItems = data.totalItems
      if (data.status) activeJob.value.status = data.status
    }
    const now = Date.now()
    if (now - lastStatsFetch >= STATS_THROTTLE_MS) {
      lastStatsFetch = now
      fetchStats()
    }
  })

  eventSource.value.addEventListener('complete', () => {
    disconnectSSE()
    refreshData({ showLoading: false })
  })

  eventSource.value.addEventListener('failed', () => {
    disconnectSSE()
    refreshData({ showLoading: false })
  })

  eventSource.value.addEventListener('cancelled', () => {
    disconnectSSE()
    refreshData({ showLoading: false })
  })
}

const disconnectSSE = (immediate = false) => {
  if (disconnectTimeout) {
    clearTimeout(disconnectTimeout)
    disconnectTimeout = null
  }

  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }

  if (immediate) {
    sseConnected.value = false
  } else {
    disconnectTimeout = setTimeout(() => {
      sseConnected.value = false
      disconnectTimeout = null
    }, 500)
  }
}

// =====================================================
// POLLING
// =====================================================

const startPolling = () => {
  if (pollInterval) return
  pollInterval = setInterval(async () => {
    await fetchActiveJob()
    await fetchStats()
  }, POLL_INTERVAL_MS)
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

watch(hasActiveJob, (hasJob) => {
  if (hasJob) {
    stopPolling()
    connectSSE()
  } else {
    disconnectSSE()
    startPolling()
  }
})

watch(
  () => activeJob.value?.id,
  (newId, oldId) => {
    if (newId && newId !== oldId && hasActiveJob.value) {
      disconnectSSE()
      connectSSE()
    }
  }
)

// Watch filters
watch([selectedEnrichmentStatus, selectedCity, searchQuery], handleFilterChange)

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {
  await fetchCities()
  await refreshData()
  if (hasActiveJob.value) {
    connectSSE()
  } else {
    startPolling()
  }
})

onUnmounted(() => {
  stopPolling()
  disconnectSSE(true)
})

// Helper to get enrichment status from contractor metadata
const getEnrichmentStatus = (contractor: (typeof contractors.value)[0]): string => {
  const meta = contractor.metadata as Record<string, unknown> | null
  const enrichment = meta?.enrichment as Record<string, unknown> | null
  return (enrichment?.status as string) || 'not_started'
}

const getEnrichmentBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default'
    case 'failed': return 'destructive'
    case 'not_applicable': return 'secondary'
    default: return 'outline'
  }
}

const getEnrichmentLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Enriched'
    case 'failed': return 'Failed'
    case 'not_applicable': return 'No Website'
    default: return 'Not Started'
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Contractor Enrichment</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            AI-powered contractor data enrichment via website crawling
          </p>
        </div>
        <UiButton variant="outline" size="sm" :disabled="isLoading" @click="refreshData">
          <Icon name="heroicons:arrow-path" class="size-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </UiButton>
      </div>
    </div>

    <!-- Error Alert -->
    <UiAlert v-if="errorMessage" variant="destructive" class="mb-6">
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
    </UiAlert>

    <!-- Stats Cards -->
    <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4" v-auto-animate>
      <div class="rounded-lg border bg-muted/50 p-4 text-center">
        <div class="text-2xl font-bold tabular-nums text-foreground">
          <NumberFlow :value="stats.unenriched" />
        </div>
        <div class="text-xs text-muted-foreground">Not Started</div>
      </div>
      <div class="rounded-lg border bg-muted/50 p-4 text-center">
        <div class="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
          <NumberFlow :value="stats.enriched" />
        </div>
        <div class="text-xs text-muted-foreground">Enriched</div>
      </div>
      <div class="rounded-lg border bg-muted/50 p-4 text-center">
        <div class="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
          <NumberFlow :value="stats.failed" />
        </div>
        <div class="text-xs text-muted-foreground">Failed</div>
      </div>
      <div class="rounded-lg border bg-muted/50 p-4 text-center">
        <div class="text-2xl font-bold tabular-nums text-muted-foreground">
          <NumberFlow :value="stats.noWebsite" />
        </div>
        <div class="text-xs text-muted-foreground">No Website</div>
      </div>
    </div>

    <!-- Active Job Status -->
    <div v-if="hasActiveJob && activeJob" class="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
      <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <Icon name="heroicons:arrow-path" class="size-4 animate-spin" />
        <span class="font-medium">Job {{ activeJob.status === 'pending' ? 'Queued' : 'Processing' }}</span>
        <span
          v-if="sseConnected"
          class="ml-auto flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400"
        >
          <span class="size-2 relative flex">
            <span class="size-full absolute inline-flex animate-ping rounded-full bg-green-400 opacity-75" />
            <span class="size-2 relative inline-flex rounded-full bg-green-500" />
          </span>
          Live
        </span>
      </div>
      <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
        <template v-if="activeJob.status === 'processing' && activeJob.totalItems">
          Processing {{ activeJob.processedItems }}/{{ activeJob.totalItems }} contractors
          <template v-if="activeJob.failedItems > 0">({{ activeJob.failedItems }} failed)</template>
        </template>
        <template v-else>
          Waiting for job runner to pick up this job...
        </template>
      </p>
      <NuxtLink
        :to="`/admin/maintenance/jobs/${activeJob.id}`"
        class="mt-2 inline-flex items-center gap-1 text-sm text-amber-600 hover:underline dark:text-amber-400"
      >
        View Details
        <Icon name="heroicons:arrow-right" class="size-3" />
      </NuxtLink>
    </div>

    <!-- Main Card -->
    <UiCard>
      <UiCardHeader>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <UiCardTitle>Contractors</UiCardTitle>
            <UiCardDescription>Select contractors to enrich with AI-extracted data</UiCardDescription>
          </div>
          <div class="flex items-center gap-2">
            <UiButton
              :disabled="!canQueueJob"
              @click="queueJobs"
            >
              <Icon v-if="isQueuing" name="heroicons:arrow-path" class="size-4 mr-2 animate-spin" />
              <Icon v-else name="heroicons:sparkles" class="size-4 mr-2" />
              Enrich {{ selectedIds.size > 0 ? `(${selectedIds.size})` : 'Selected' }}
            </UiButton>
          </div>
        </div>
      </UiCardHeader>
      <UiCardContent>
        <!-- Filters -->
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <UiSelect v-model="selectedEnrichmentStatus" class="w-full sm:w-48">
            <UiSelectTrigger>
              <UiSelectValue placeholder="Status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in enrichmentStatusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <UiSelect v-model="selectedCity" class="w-full sm:w-48">
            <UiSelectTrigger>
              <UiSelectValue placeholder="City" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem
                v-for="option in cityOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>

          <UiInput
            v-model="searchQuery"
            placeholder="Search by company name..."
            class="w-full sm:w-64"
          />
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-md border">
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/50">
              <tr>
                <th class="w-12 px-4 py-3 text-left">
                  <Checkbox
                    :checked="allSelected"
                    @update:checked="toggleSelectAll"
                  />
                </th>
                <th class="px-4 py-3 text-left font-medium">Company</th>
                <th class="px-4 py-3 text-left font-medium hidden sm:table-cell">City</th>
                <th class="px-4 py-3 text-left font-medium hidden md:table-cell">Website</th>
                <th class="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody v-auto-animate>
              <tr v-if="pending && contractors.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                  <Icon name="heroicons:arrow-path" class="size-5 animate-spin mx-auto mb-2" />
                  Loading contractors...
                </td>
              </tr>
              <tr v-else-if="contractors.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-muted-foreground">
                  No contractors found matching the filters.
                </td>
              </tr>
              <tr
                v-for="contractor in contractors"
                :key="contractor.id"
                class="border-b last:border-0 hover:bg-muted/50"
              >
                <td class="px-4 py-3">
                  <Checkbox
                    :checked="selectedIds.has(contractor.id)"
                    @update:checked="toggleSelect(contractor.id)"
                  />
                </td>
                <td class="px-4 py-3">
                  <div class="font-medium">{{ contractor.company_name }}</div>
                </td>
                <td class="px-4 py-3 hidden sm:table-cell">
                  <span v-if="contractor.city" class="text-muted-foreground">
                    {{ contractor.city.name }}, {{ contractor.city.state_code }}
                  </span>
                  <span v-else class="text-muted-foreground">-</span>
                </td>
                <td class="px-4 py-3 hidden md:table-cell">
                  <a
                    v-if="contractor.website"
                    :href="contractor.website"
                    target="_blank"
                    class="text-blue-600 hover:underline dark:text-blue-400 truncate block max-w-48"
                  >
                    {{ contractor.website.replace(/^https?:\/\//, '') }}
                  </a>
                  <span v-else class="text-muted-foreground">-</span>
                </td>
                <td class="px-4 py-3">
                  <UiBadge :variant="getEnrichmentBadgeVariant(getEnrichmentStatus(contractor))">
                    {{ getEnrichmentLabel(getEnrichmentStatus(contractor)) }}
                  </UiBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="mt-4 flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} -
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
          </p>
          <div class="flex gap-1">
            <UiButton
              variant="outline"
              size="sm"
              :disabled="pagination.page <= 1"
              @click="handlePageChange(pagination.page - 1)"
            >
              <Icon name="heroicons:chevron-left" class="size-4" />
            </UiButton>
            <UiButton
              variant="outline"
              size="sm"
              :disabled="pagination.page >= pagination.totalPages"
              @click="handlePageChange(pagination.page + 1)"
            >
              <Icon name="heroicons:chevron-right" class="size-4" />
            </UiButton>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Help Section -->
    <UiSeparator class="my-8" />

    <div class="grid gap-6 md:grid-cols-2">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">
            <Icon name="heroicons:question-mark-circle" class="size-4 mr-2 inline text-muted-foreground" />
            What gets enriched?
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="text-sm text-muted-foreground">
          <ul class="list-inside list-disc space-y-1">
            <li>AI extracts service categories from website</li>
            <li>Business description and specialties</li>
            <li>Contact information verification</li>
            <li>Service area coverage</li>
          </ul>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">
            <Icon name="heroicons:bolt" class="size-4 mr-2 inline text-muted-foreground" />
            Background Processing
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="text-sm text-muted-foreground">
          <ul class="list-inside list-disc space-y-1">
            <li>Jobs run via pg_cron every 15 seconds</li>
            <li>No need to keep browser tab open</li>
            <li>Batched in groups of 10 contractors</li>
          </ul>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>
