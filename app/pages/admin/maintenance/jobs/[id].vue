<script setup lang="ts">
/**
 * Job Detail Page
 *
 * Full job details with real-time SSE progress, system logs, and actions.
 */

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const jobId = computed(() => route.params.id as string)

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

interface SystemLog {
  id: string
  log_type: string
  category: string
  action: string
  message: string | null
  level: string
  created_at: string
  metadata: Record<string, unknown> | null
}

// =====================================================
// STATE
// =====================================================

const isLoading = ref(true)
const job = ref<Job | null>(null)
const logs = ref<SystemLog[]>([])
const errorMessage = ref<string | null>(null)
const eventSource = ref<EventSource | null>(null)

// =====================================================
// COMPUTED
// =====================================================

const isActiveJob = computed(() => {
  return job.value && ['pending', 'processing'].includes(job.value.status)
})

const progressPercent = computed(() => {
  if (!job.value?.totalItems || job.value.totalItems === 0) return 0
  return Math.round((job.value.processedItems / job.value.totalItems) * 100)
})

const statusVariant = computed(() => {
  const variants: Record<string, string> = {
    pending: 'secondary',
    processing: 'default',
    completed: 'success',
    failed: 'destructive',
    cancelled: 'outline',
  }
  return variants[job.value?.status || ''] || 'secondary'
})

// =====================================================
// METHODS
// =====================================================

const fetchJob = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: Job }>(`/api/jobs/${jobId.value}`)
    job.value = response.data
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to load job'
  }
}

const fetchLogs = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: SystemLog[] }>(`/api/jobs/${jobId.value}/logs`)
    logs.value = response.data || []
  } catch {
    // Logs are optional - don't show error
  }
}

const startSSE = () => {
  if (!isActiveJob.value || eventSource.value) return

  eventSource.value = new EventSource(`/api/jobs/${jobId.value}/stream`)

  eventSource.value.addEventListener('progress', (e) => {
    const data = JSON.parse(e.data)
    if (job.value) {
      job.value.processedItems = data.processedItems
      job.value.failedItems = data.failedItems
      if (data.totalItems) job.value.totalItems = data.totalItems
    }
  })

  eventSource.value.addEventListener('complete', () => {
    closeSSE()
    fetchJob()
    fetchLogs()
  })

  eventSource.value.addEventListener('failed', () => {
    closeSSE()
    fetchJob()
    fetchLogs()
  })

  eventSource.value.addEventListener('cancelled', () => {
    closeSSE()
    fetchJob()
  })

  eventSource.value.onerror = () => {
    closeSSE()
  }
}

const closeSSE = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
}

const handleCancel = async () => {
  try {
    await $fetch(`/api/jobs/${jobId.value}/cancel`, { method: 'POST' })
    await fetchJob()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to cancel job'
  }
}

const handleRetry = async () => {
  try {
    await $fetch(`/api/jobs/${jobId.value}/retry`, { method: 'POST' })
    await fetchJob()
    startSSE()
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

const getLogLevelClass = (level: string) => {
  const classes: Record<string, string> = {
    error: 'text-destructive',
    warn: 'text-amber-600 dark:text-amber-400',
    info: 'text-muted-foreground',
    debug: 'text-muted-foreground/60',
  }
  return classes[level] || 'text-muted-foreground'
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(async () => {
  isLoading.value = true
  await Promise.all([fetchJob(), fetchLogs()])
  isLoading.value = false
  startSSE()
})

onUnmounted(() => {
  closeSSE()
})

// Watch for job becoming active
watch(isActiveJob, (active) => {
  if (active) startSSE()
  else closeSSE()
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="mb-6">
      <UiBreadcrumb>
        <UiBreadcrumbList>
          <UiBreadcrumbItem>
            <UiBreadcrumbLink as-child>
              <NuxtLink to="/admin/maintenance/jobs">Jobs</NuxtLink>
            </UiBreadcrumbLink>
          </UiBreadcrumbItem>
          <UiBreadcrumbSeparator />
          <UiBreadcrumbItem>
            <UiBreadcrumbPage>{{ job?.jobType ? formatJobType(job.jobType) : 'Loading...' }}</UiBreadcrumbPage>
          </UiBreadcrumbItem>
        </UiBreadcrumbList>
      </UiBreadcrumb>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Icon name="heroicons:arrow-path" class="size-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Error -->
    <UiAlert v-else-if="errorMessage" variant="destructive">
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
      <UiAlertTitle>Error</UiAlertTitle>
      <UiAlertDescription>{{ errorMessage }}</UiAlertDescription>
    </UiAlert>

    <!-- Job Details -->
    <template v-else-if="job">
      <!-- Header -->
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">{{ formatJobType(job.jobType) }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">Job ID: {{ job.id }}</p>
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
          <UiButton v-if="job.status === 'pending'" variant="outline" @click="handleCancel">
            <Icon name="heroicons:x-mark" class="mr-2 size-4" />
            Cancel
          </UiButton>
          <UiButton v-if="job.status === 'failed'" @click="handleRetry">
            <Icon name="heroicons:arrow-path" class="mr-2 size-4" />
            Retry
          </UiButton>
        </div>
      </div>

      <!-- Status Card -->
      <UiCard class="mb-6">
        <UiCardHeader>
          <UiCardTitle class="flex items-center gap-2">
            <UiBadge :variant="statusVariant">
              <Icon v-if="job.status === 'processing'" name="heroicons:arrow-path" class="mr-1 size-3 animate-spin" />
              {{ job.status }}
            </UiBadge>
            <span v-if="job.attempts > 1" class="text-sm text-muted-foreground">
              (Attempt {{ job.attempts }}/{{ job.maxAttempts }})
            </span>
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <!-- Progress Bar -->
          <div v-if="job.status === 'processing' && job.totalItems" class="mb-4">
            <div class="flex items-center justify-between text-sm text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{{ job.processedItems }}/{{ job.totalItems }} ({{ progressPercent }}%)</span>
            </div>
            <UiProgress :model-value="progressPercent" class="h-2" />
            <p v-if="job.failedItems > 0" class="mt-1 text-sm text-destructive">
              {{ job.failedItems }} items failed
            </p>
          </div>

          <!-- Metadata -->
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p class="text-sm text-muted-foreground">Created</p>
              <p class="font-medium">{{ formatDate(job.createdAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Started</p>
              <p class="font-medium">{{ formatDate(job.startedAt) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Completed</p>
              <p class="font-medium">{{ formatDate(job.completedAt) }}</p>
            </div>
            <div v-if="job.status === 'completed' && job.result">
              <p class="text-sm text-muted-foreground">Result</p>
              <p class="font-medium text-green-600 dark:text-green-400">
                {{ job.result.processedContractors || 0 }} contractors, {{ job.result.totalImages || 0 }} images
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <UiAlert v-if="job.lastError" variant="destructive" class="mt-4">
            <Icon name="heroicons:exclamation-triangle" class="size-4" />
            <UiAlertTitle>Last Error</UiAlertTitle>
            <UiAlertDescription>{{ job.lastError }}</UiAlertDescription>
          </UiAlert>
        </UiCardContent>
      </UiCard>

      <!-- System Logs -->
      <UiCard v-if="logs.length > 0">
        <UiCardHeader>
          <UiCardTitle>Activity Log</UiCardTitle>
        </UiCardHeader>
        <UiCardContent>
          <div class="space-y-2">
            <div v-for="log in logs" :key="log.id" class="flex gap-3 text-sm border-b pb-2 last:border-0">
              <span class="text-muted-foreground whitespace-nowrap">{{ formatDate(log.created_at) }}</span>
              <span :class="getLogLevelClass(log.level)">{{ log.message }}</span>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </template>
  </div>
</template>

