<script setup lang="ts">
/**
 * Background Jobs Dashboard
 *
 * List and manage background jobs with filtering, progress tracking,
 * and actions for cancel/retry.
 */
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
})

// =====================================================
// TYPES
// =====================================================

interface Job {
  id: string
  jobType: string
  status: string
  attempts: number
  maxAttempts: number
  totalItems: number | null
  processedItems: number
  failedItems: number
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  lastError: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  createdBy: string | null
}

interface ApiResponse {
  success: boolean
  data: Job[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// =====================================================
// STATE
// =====================================================

const route = useRoute()
const router = useRouter()

const isLoading = ref(true)
const jobs = ref<Job[]>([])
const pagination = ref({ total: 0, page: 1, limit: 25, totalPages: 1 })
const errorMessage = ref<string | null>(null)
const eventSource = ref<EventSource | null>(null)

// Rows per page options
const rowsPerPageOptions = [10, 25, 50, 100]
const rowsPerPage = ref<string>('25')

// =====================================================
// FILTER OPTIONS
// =====================================================

const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const jobTypeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Image Enrichment', value: 'image_enrichment' },
]

// Quick filter options
const quickFilterOptions = [
  { value: 'pending', label: 'Pending', icon: 'heroicons:clock' },
  { value: 'processing', label: 'Processing', icon: 'heroicons:arrow-path' },
  { value: 'completed', label: 'Completed', icon: 'heroicons:check-circle' },
  { value: 'failed', label: 'Failed', icon: 'heroicons:x-circle' },
]

// =====================================================
// URL-SYNCED FILTERS
// =====================================================

const getInitialStatus = (): string => {
  const urlStatus = route.query.status as string | undefined
  if (urlStatus && ['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(urlStatus)) {
    return urlStatus
  }
  return 'all'
}

const getInitialType = (): string => {
  const urlType = route.query.type as string | undefined
  if (urlType && ['image_enrichment'].includes(urlType)) {
    return urlType
  }
  return 'all'
}

const selectedStatus = ref<string>(getInitialStatus())
const selectedType = ref<string>(getInitialType())

// =====================================================
// COMPUTED
// =====================================================

const hasActiveFilters = computed(() => {
  return selectedStatus.value !== 'all' || selectedType.value !== 'all'
})

// =====================================================
// METHODS
// =====================================================

const fetchJobs = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const query: Record<string, string | number> = {
      limit: pagination.value.limit,
      offset: (pagination.value.page - 1) * pagination.value.limit,
    }
    if (selectedStatus.value !== 'all') query.status = selectedStatus.value
    if (selectedType.value !== 'all') query.jobType = selectedType.value

    const response = await $fetch<ApiResponse>('/api/jobs', { query })
    jobs.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load jobs'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = async (jobId: string) => {
  try {
    await $fetch(`/api/jobs/${jobId}/cancel`, { method: 'POST' })
    toast.success('Job cancelled')
    await fetchJobs()
  } catch (error) {
    toast.error('Failed to cancel job')
    errorMessage.value = error instanceof Error ? error.message : 'Failed to cancel job'
  }
}

const handleRetry = async (jobId: string) => {
  try {
    await $fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' })
    toast.success('Job queued for retry')
    await fetchJobs()
  } catch (error) {
    toast.error('Failed to retry job')
    errorMessage.value = error instanceof Error ? error.message : 'Failed to retry job'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

const formatJobType = (type: string) => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const getStatusVariant = (status: string) => {
  const variants: Record<string, string> = {
    pending: 'secondary',
    processing: 'default',
    completed: 'success',
    failed: 'destructive',
    cancelled: 'outline',
  }
  return variants[status] || 'secondary'
}

const getProgressPercent = (job: Job) => {
  if (!job.totalItems || job.totalItems === 0) return 0
  return Math.round((job.processedItems / job.totalItems) * 100)
}

const navigateToJob = (jobId: string) => {
  router.push(`/admin/maintenance/jobs/${jobId}`)
}

const getJobActions = (job: Job) => {
  const actions = [
    {
      label: 'View',
      icon: 'heroicons:eye',
      onClick: () => navigateToJob(job.id),
    },
  ]

  if (job.status === 'pending') {
    actions.push({
      label: 'Cancel',
      icon: 'heroicons:x-mark',
      onClick: () => handleCancel(job.id),
    })
  }

  if (job.status === 'failed') {
    actions.push({
      label: 'Retry',
      icon: 'heroicons:arrow-path',
      onClick: () => handleRetry(job.id),
    })
  }

  return actions
}

const handlePageChange = async (page: number) => {
  pagination.value.page = page
  await fetchJobs()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleRowsPerPageChange = async (value: string) => {
  pagination.value.limit = Number.parseInt(value, 10)
  pagination.value.page = 1
  await fetchJobs()
}

const clearFilters = () => {
  selectedStatus.value = 'all'
  selectedType.value = 'all'
}

// =====================================================
// SSE REALTIME UPDATES
// =====================================================

const hasActiveJobs = computed(() => {
  return jobs.value.some(job => ['pending', 'processing'].includes(job.status))
})

const startSSE = () => {
  if (eventSource.value) return

  eventSource.value = new EventSource('/api/jobs/stream')

  eventSource.value.addEventListener('jobs', (e) => {
    const data = JSON.parse(e.data)
    const activeJobs = data.jobs as Job[]
    const removedJobIds = data.removedJobIds as string[] || []

    // If jobs completed/failed, refresh the full list to get final state
    if (removedJobIds.length > 0) {
      fetchJobs()
      return
    }

    // Update existing jobs in the table with new progress data
    jobs.value = jobs.value.map(job => {
      const activeJob = activeJobs.find(a => a.id === job.id)
      if (activeJob) {
        return { ...job, ...activeJob }
      }
      return job
    })
  })

  eventSource.value.onerror = () => {
    closeSSE()
    // Retry connection after 5 seconds
    setTimeout(() => {
      if (hasActiveJobs.value) {
        startSSE()
      }
    }, 5000)
  }
}

const closeSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
}

// Watch for active jobs and manage SSE connection
watch(hasActiveJobs, (hasActive) => {
  if (hasActive) {
    startSSE()
  } else {
    closeSSE()
  }
})

// Watch filters and sync to URL
watch([selectedStatus, selectedType], async () => {
  pagination.value.page = 1

  // Update URL query params
  const query: Record<string, string> = {}
  if (selectedStatus.value !== 'all') query.status = selectedStatus.value
  if (selectedType.value !== 'all') query.type = selectedType.value
  router.replace({ query })

  await fetchJobs()
})

// Initial fetch and SSE setup
onMounted(async () => {
  await fetchJobs()
  if (hasActiveJobs.value) {
    startSSE()
  }
})

onUnmounted(() => {
  closeSSE()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Background Jobs</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Monitor and manage background processing jobs
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- Realtime indicator -->
          <div v-if="eventSource" class="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live
          </div>
          <UiButton variant="outline" size="sm" :disabled="isLoading" @click="fetchJobs">
            <Icon name="heroicons:arrow-path" class="size-4" :class="{ 'animate-spin': isLoading }" />
            Refresh
          </UiButton>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-muted-foreground">Quick Filters:</span>
        <UiButton
          v-for="option in quickFilterOptions"
          :key="option.value"
          :variant="selectedStatus === option.value ? 'default' : 'outline'"
          size="sm"
          class="h-7 rounded-full px-3"
          @click="selectedStatus = option.value"
        >
          <Icon v-if="option.icon" :name="option.icon" class="size-3.5" />
          {{ option.label }}
        </UiButton>
      </div>

      <!-- Filter Bar -->
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <!-- Status Filter -->
        <UiPopover>
          <UiPopoverTrigger as-child>
            <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed">
              <Icon name="heroicons:check-circle" class="size-4" />
              Status
              <UiBadge v-if="selectedStatus !== 'all'" variant="secondary" class="ml-1 h-5 px-1.5">
                {{ statusOptions.find(o => o.value === selectedStatus)?.label }}
              </UiBadge>
              <Icon name="heroicons:chevron-down" class="size-3.5 opacity-50" />
            </UiButton>
          </UiPopoverTrigger>
          <UiPopoverContent class="w-48 p-1" align="start">
            <div class="flex flex-col">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                :class="{ 'bg-accent': selectedStatus === option.value }"
                @click="selectedStatus = option.value"
              >
                {{ option.label }}
                <Icon v-if="selectedStatus === option.value" name="heroicons:check" class="size-4" />
              </button>
            </div>
          </UiPopoverContent>
        </UiPopover>

        <!-- Job Type Filter -->
        <UiPopover>
          <UiPopoverTrigger as-child>
            <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed">
              <Icon name="heroicons:cog-6-tooth" class="size-4" />
              Type
              <UiBadge v-if="selectedType !== 'all'" variant="secondary" class="ml-1 h-5 px-1.5">
                {{ jobTypeOptions.find(o => o.value === selectedType)?.label }}
              </UiBadge>
              <Icon name="heroicons:chevron-down" class="size-3.5 opacity-50" />
            </UiButton>
          </UiPopoverTrigger>
          <UiPopoverContent class="w-48 p-1" align="start">
            <div class="flex flex-col">
              <button
                v-for="option in jobTypeOptions"
                :key="option.value"
                class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                :class="{ 'bg-accent': selectedType === option.value }"
                @click="selectedType = option.value"
              >
                {{ option.label }}
                <Icon v-if="selectedType === option.value" name="heroicons:check" class="size-4" />
              </button>
            </div>
          </UiPopoverContent>
        </UiPopover>

        <!-- Clear Filters -->
        <UiButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="h-9 text-muted-foreground"
          @click="clearFilters"
        >
          <Icon name="heroicons:x-mark" class="size-4" />
          Clear filters
        </UiButton>
      </div>
    </div>

    <!-- Error Alert -->
    <UiAlert v-if="errorMessage" variant="destructive" class="mb-6">
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
    </UiAlert>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading jobs...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="jobs.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
      <Icon name="heroicons:queue-list" class="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No jobs found</h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
        No jobs match your current filters. Try adjusting your search or filters, or queue a new job from the maintenance pages.
      </p>
    </div>

    <!-- Jobs Table -->
    <div v-else class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table class="w-full">
        <!-- Table Header -->
        <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell">Progress</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
          <tr v-for="job in jobs" :key="job.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
            <!-- Type -->
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink :to="`/admin/maintenance/jobs/${job.id}`" class="text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:underline">
                {{ formatJobType(job.jobType) }}
              </NuxtLink>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <UiBadge :variant="getStatusVariant(job.status)">
                <Icon v-if="job.status === 'processing'" name="heroicons:arrow-path" class="mr-1 size-3 animate-spin" />
                {{ job.status }}
              </UiBadge>
            </td>

            <!-- Progress -->
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <div v-if="job.status === 'processing' && job.totalItems" class="w-32">
                <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>{{ job.processedItems }}/{{ job.totalItems }}</span>
                  <span v-if="job.failedItems > 0" class="text-red-500">({{ job.failedItems }} failed)</span>
                </div>
                <UiProgress :model-value="getProgressPercent(job)" class="mt-1 h-1.5" />
              </div>
              <span v-else-if="job.status === 'completed'" class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ job.processedItems }} items
              </span>
              <span v-else class="text-sm text-neutral-500 dark:text-neutral-500">-</span>
            </td>

            <!-- Created -->
            <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ formatDate(job.createdAt) }}</span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <TableActionsMenu
                :actions="getJobActions(job)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Footer -->
    <div v-if="!isLoading && jobs.length > 0" class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <!-- Results Summary -->
      <div class="text-sm text-muted-foreground">
        Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
        {{ pagination.total }} jobs
      </div>

      <!-- Rows per page + Pagination -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Rows per page</span>
          <UiSelect v-model="rowsPerPage" @update:model-value="handleRowsPerPageChange">
            <UiSelectTrigger class="h-8 w-16">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="opt in rowsPerPageOptions" :key="opt" :value="opt.toString()">
                {{ opt }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </div>

        <div class="flex items-center gap-1">
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(1)"
          >
            <Icon name="heroicons:chevron-double-left" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(pagination.page - 1)"
          >
            <Icon name="heroicons:chevron-left" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page >= pagination.totalPages"
            @click="handlePageChange(pagination.page + 1)"
          >
            <Icon name="heroicons:chevron-right" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page >= pagination.totalPages"
            @click="handlePageChange(pagination.totalPages)"
          >
            <Icon name="heroicons:chevron-double-right" class="size-4" />
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

