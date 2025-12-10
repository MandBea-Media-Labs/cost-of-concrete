<script setup lang="ts">
/**
 * Background Jobs Dashboard
 *
 * List and manage background jobs with filtering, progress tracking,
 * and actions for cancel/retry.
 */

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

const isLoading = ref(true)
const jobs = ref<Job[]>([])
const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
const errorMessage = ref<string | null>(null)

// Filters
const statusFilter = ref<string>('all')
const jobTypeFilter = ref<string>('all')

// =====================================================
// COMPUTED
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
    if (statusFilter.value && statusFilter.value !== 'all') query.status = statusFilter.value
    if (jobTypeFilter.value && jobTypeFilter.value !== 'all') query.jobType = jobTypeFilter.value

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
    await fetchJobs()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to cancel job'
  }
}

const handleRetry = async (jobId: string) => {
  try {
    await $fetch(`/api/jobs/${jobId}/retry`, { method: 'POST' })
    await fetchJobs()
  } catch (error) {
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

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchJobs()
}

// Watch filters
watch([statusFilter, jobTypeFilter], () => {
  pagination.value.page = 1
  fetchJobs()
})

// Initial fetch
onMounted(() => {
  fetchJobs()
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
        <UiButton variant="ghost" size="sm" :disabled="isLoading" @click="fetchJobs">
          <Icon name="heroicons:arrow-path" class="size-4" :class="{ 'animate-spin': isLoading }" />
        </UiButton>
      </div>
    </div>

    <!-- Error Alert -->
    <UiAlert v-if="errorMessage" variant="destructive" class="mb-6">
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
    </UiAlert>

    <!-- Filters -->
    <UiCard class="mb-6">
      <UiCardContent class="flex flex-wrap gap-4 pt-6">
        <div class="w-48">
          <UiSelect v-model="statusFilter">
            <UiSelectTrigger>
              <UiSelectValue placeholder="Filter by status" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
        <div class="w-48">
          <UiSelect v-model="jobTypeFilter">
            <UiSelectTrigger>
              <UiSelectValue placeholder="Filter by type" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="opt in jobTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Jobs Table -->
    <UiCard>
      <UiTable>
        <UiTableHeader>
          <UiTableRow>
            <UiTableHead>Type</UiTableHead>
            <UiTableHead>Status</UiTableHead>
            <UiTableHead>Progress</UiTableHead>
            <UiTableHead>Created</UiTableHead>
            <UiTableHead class="text-right">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <!-- Loading State -->
          <UiTableRow v-if="isLoading">
            <UiTableCell colspan="5" class="text-center py-8">
              <Icon name="heroicons:arrow-path" class="size-5 animate-spin text-muted-foreground" />
            </UiTableCell>
          </UiTableRow>

          <!-- Empty State -->
          <UiTableRow v-else-if="jobs.length === 0">
            <UiTableCell colspan="5" class="text-center py-8 text-muted-foreground">
              No jobs found
            </UiTableCell>
          </UiTableRow>

          <!-- Job Rows -->
          <UiTableRow v-for="job in jobs" v-else :key="job.id">
            <UiTableCell>
              <NuxtLink :to="`/admin/maintenance/jobs/${job.id}`" class="font-medium hover:underline">
                {{ formatJobType(job.jobType) }}
              </NuxtLink>
            </UiTableCell>
            <UiTableCell>
              <UiBadge :variant="getStatusVariant(job.status)">
                <Icon v-if="job.status === 'processing'" name="heroicons:arrow-path" class="mr-1 size-3 animate-spin" />
                {{ job.status }}
              </UiBadge>
            </UiTableCell>
            <UiTableCell>
              <div v-if="job.status === 'processing' && job.totalItems" class="w-32">
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{{ job.processedItems }}/{{ job.totalItems }}</span>
                  <span v-if="job.failedItems > 0" class="text-destructive">({{ job.failedItems }} failed)</span>
                </div>
                <UiProgress :model-value="getProgressPercent(job)" class="mt-1 h-1.5" />
              </div>
              <span v-else-if="job.status === 'completed'" class="text-sm text-muted-foreground">
                {{ job.processedItems }} items
              </span>
              <span v-else class="text-sm text-muted-foreground">-</span>
            </UiTableCell>
            <UiTableCell class="text-sm text-muted-foreground">
              {{ formatDate(job.createdAt) }}
            </UiTableCell>
            <UiTableCell class="text-right">
              <div class="flex justify-end gap-2">
                <NuxtLink :to="`/admin/maintenance/jobs/${job.id}`">
                  <UiButton variant="ghost" size="sm">
                    <Icon name="heroicons:eye" class="size-4" />
                  </UiButton>
                </NuxtLink>
                <UiButton
                  v-if="job.status === 'pending'"
                  variant="ghost"
                  size="sm"
                  @click="handleCancel(job.id)"
                >
                  <Icon name="heroicons:x-mark" class="size-4" />
                </UiButton>
                <UiButton
                  v-if="job.status === 'failed'"
                  variant="ghost"
                  size="sm"
                  @click="handleRetry(job.id)"
                >
                  <Icon name="heroicons:arrow-path" class="size-4" />
                </UiButton>
              </div>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </UiCard>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-4 flex justify-center">
      <UiPagination
        :page="pagination.page"
        :total="pagination.total"
        :items-per-page="pagination.limit"
        :sibling-count="1"
        show-edges
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

