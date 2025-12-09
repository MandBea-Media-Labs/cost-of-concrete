<script setup lang="ts">
/**
 * Admin Contractors Import Page
 *
 * Upload Apify Google Maps Scraper JSON exports to import contractor profiles.
 * Features:
 * - Drag-and-drop file upload
 * - Batch processing for large files (no row limit)
 * - Real-time progress tracking
 * - Results summary with success/error counts
 */

definePageMeta({
  layout: 'admin',
})

// =====================================================
// TYPES
// =====================================================

interface ImportError {
  row: number
  placeId: string | null
  message: string
}

interface ImportJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  filename: string | null
  totalRows: number
  processedRows: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  skippedClaimedCount: number
  errorCount: number
  pendingImageCount: number
  errors: ImportError[]
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

interface EnrichmentSummary {
  processedContractors: number
  totalImages: number
  failedImages: number
  contractorsRemaining: number
}

interface EnrichmentResult {
  success: boolean
  summary: EnrichmentSummary
}

type UIState = 'upload' | 'ready' | 'processing' | 'paused' | 'complete' | 'error'

// =====================================================
// STATE
// =====================================================

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isCreatingJob = ref(false)
const isEnriching = ref(false)
const selectedFile = ref<File | null>(null)
const errorMessage = ref<string | null>(null)
const enrichResult = ref<EnrichmentResult | null>(null)

// Job state
const currentJob = ref<ImportJob | null>(null)
const uiState = ref<UIState>('upload')
const processingInterval = ref<ReturnType<typeof setInterval> | null>(null)

// =====================================================
// COMPUTED
// =====================================================

const progressPercent = computed(() => {
  if (!currentJob.value || currentJob.value.totalRows === 0) return 0
  return Math.round((currentJob.value.processedRows / currentJob.value.totalRows) * 100)
})

const canStartImport = computed(() => {
  return selectedFile.value && !isCreatingJob.value && uiState.value === 'ready'
})

// =====================================================
// FILE HANDLING
// =====================================================

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectFile(target.files[0])
  }
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectFile(event.dataTransfer.files[0])
  }
}

const selectFile = (file: File) => {
  errorMessage.value = null
  currentJob.value = null

  if (!file.name.endsWith('.json')) {
    errorMessage.value = 'Please select a JSON file'
    return
  }

  selectedFile.value = file
  uiState.value = 'ready'
}

const clearFile = () => {
  stopProcessing()
  selectedFile.value = null
  currentJob.value = null
  errorMessage.value = null
  enrichResult.value = null
  uiState.value = 'upload'
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// =====================================================
// JOB MANAGEMENT
// =====================================================

const createJob = async () => {
  if (!selectedFile.value) return

  isCreatingJob.value = true
  errorMessage.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await $fetch<{ success: boolean; jobId: string; totalRows: number }>(
      '/api/contractors/import-jobs',
      { method: 'POST', body: formData }
    )

    // Fetch full job details
    await fetchJobStatus(response.jobId)
    uiState.value = 'processing'
    startProcessing()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Failed to create import job'
    uiState.value = 'error'
  } finally {
    isCreatingJob.value = false
  }
}

const fetchJobStatus = async (jobId: string) => {
  try {
    const response = await $fetch<{ success: boolean; job: ImportJob }>(
      `/api/contractors/import-jobs/${jobId}`
    )
    currentJob.value = response.job

    // Update UI state based on job status
    if (response.job.status === 'completed') {
      uiState.value = 'complete'
      stopProcessing()
    } else if (response.job.status === 'failed' || response.job.status === 'cancelled') {
      uiState.value = 'error'
      stopProcessing()
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Failed to fetch job status'
  }
}

const processBatch = async () => {
  if (!currentJob.value) return

  // Don't process if already completed
  if (currentJob.value.status === 'completed' || currentJob.value.status === 'failed' || currentJob.value.status === 'cancelled') {
    stopProcessing()
    return
  }

  try {
    const response = await $fetch<{
      success: boolean
      jobId: string
      job: { status: string; totalRows: number; processedRows: number; isComplete: boolean }
    }>(`/api/contractors/import-jobs/${currentJob.value.id}/process`, { method: 'POST' })

    // Update local state with latest
    await fetchJobStatus(response.jobId)

    if (response.job.isComplete) {
      uiState.value = 'complete'
      stopProcessing()
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    // Ignore "already completed" errors - just stop processing
    if (fetchError.data?.message?.includes('completed') || fetchError.data?.message?.includes('cancelled')) {
      await fetchJobStatus(currentJob.value.id)
      stopProcessing()
      return
    }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Batch processing failed'
    uiState.value = 'error'
    stopProcessing()
  }
}

// =====================================================
// PROCESSING CONTROL
// =====================================================

const startProcessing = () => {
  if (processingInterval.value) return

  // Process immediately, then poll
  processBatch()

  processingInterval.value = setInterval(() => {
    if (uiState.value === 'processing') {
      processBatch()
    }
  }, 2000) // Process batch every 2 seconds
}

const stopProcessing = () => {
  if (processingInterval.value) {
    clearInterval(processingInterval.value)
    processingInterval.value = null
  }
}

const pauseProcessing = () => {
  stopProcessing()
  uiState.value = 'paused'
}

const resumeProcessing = () => {
  uiState.value = 'processing'
  startProcessing()
}

// =====================================================
// IMAGE ENRICHMENT
// =====================================================

const pendingImageCount = ref(0)

const checkPendingImages = async () => {
  try {
    const response = await $fetch<{ success: boolean; pendingCount: number }>(
      '/api/contractors/pending-images'
    )
    pendingImageCount.value = response.pendingCount
  } catch {
    // Silently fail - not critical
    pendingImageCount.value = 0
  }
}

const enrichImages = async () => {
  isEnriching.value = true
  enrichResult.value = null

  try {
    const response = await $fetch<EnrichmentResult>('/api/contractors/enrich-images', {
      method: 'POST',
    })
    enrichResult.value = response

    // Update pending count after enrichment
    if (response.summary) {
      pendingImageCount.value = response.summary.contractorsRemaining
    }
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Image enrichment failed'
  } finally {
    isEnriching.value = false
  }
}

// =====================================================
// LIFECYCLE
// =====================================================

onMounted(() => {
  // Check for pending images on page load
  checkPendingImages()
})

onUnmounted(() => {
  stopProcessing()
})
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-foreground">
        Import Contractors
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Upload Apify Google Maps Scraper JSON exports to import contractor profiles.
      </p>
    </div>

    <!-- Upload Card -->
    <UiCard class="max-w-2xl">
      <UiCardContent class="pt-6">
        <!-- STATE: Upload / Ready -->
        <template v-if="uiState === 'upload' || uiState === 'ready'">
          <!-- Drop Zone -->
          <div
            class="relative rounded-lg border-2 border-dashed p-8 text-center transition-colors"
            :class="[
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            ]"
            @dragenter="handleDragEnter"
            @dragleave="handleDragLeave"
            @dragover="handleDragOver"
            @drop="handleDrop"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleFileSelect"
            />

            <!-- No file selected -->
            <div v-if="!selectedFile">
              <Icon
                name="heroicons:cloud-arrow-up"
                class="mx-auto size-12 text-muted-foreground"
              />
              <p class="mt-4 text-sm font-medium text-foreground">
                Drag and drop your JSON file here
              </p>
              <p class="mt-1 text-xs text-muted-foreground">
                or
              </p>
              <UiButton
                variant="outline"
                size="sm"
                class="mt-3"
                @click="triggerFileInput"
              >
                Browse Files
              </UiButton>
              <p class="mt-3 text-xs text-muted-foreground">
                No row limit - large files processed in batches
              </p>
            </div>

            <!-- File selected -->
            <div v-else class="flex items-center justify-center gap-4">
              <Icon
                name="heroicons:document-text"
                class="size-10 text-primary"
              />
              <div class="text-left">
                <p class="text-sm font-medium text-foreground">
                  {{ selectedFile.name }}
                </p>
                <p class="text-xs text-muted-foreground">
                  {{ formatFileSize(selectedFile.size) }}
                </p>
              </div>
              <UiButton
                variant="ghost"
                size="sm"
                class="ml-2"
                @click.stop="clearFile"
              >
                <Icon name="heroicons:x-mark" class="size-5" />
              </UiButton>
            </div>
          </div>

          <!-- Start Import Button -->
          <div v-if="canStartImport" class="mt-6">
            <UiButton
              class="w-full"
              :disabled="isCreatingJob"
              @click="createJob"
            >
              <Icon v-if="isCreatingJob" name="heroicons:arrow-path" class="size-4 mr-2 animate-spin" />
              {{ isCreatingJob ? 'Creating Job...' : 'Start Import' }}
            </UiButton>
          </div>

          <!-- Pending Images Section (shown on upload/ready state) -->
          <div v-if="pendingImageCount > 0" class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
            <div class="flex items-start gap-3">
              <Icon name="heroicons:photo" class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div class="flex-1">
                <p class="font-medium text-amber-800 dark:text-amber-300">
                  {{ pendingImageCount }} Contractors with Pending Images
                </p>
                <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  Images are queued for download from previous imports.
                </p>
                <UiButton class="mt-3" :disabled="isEnriching" @click="enrichImages">
                  <Icon :name="isEnriching ? 'heroicons:arrow-path' : 'heroicons:cloud-arrow-down'" class="size-4 mr-2" :class="{ 'animate-spin': isEnriching }" />
                  {{ isEnriching ? 'Processing...' : 'Enrich Images Now' }}
                </UiButton>

                <!-- Enrichment Results -->
                <div v-if="enrichResult" class="mt-3 rounded border border-amber-300 bg-card p-3 dark:border-amber-600">
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><span class="text-muted-foreground">Contractors:</span> <span class="ml-1 font-medium">{{ enrichResult.summary.processedContractors }}</span></div>
                    <div><span class="text-muted-foreground">Downloaded:</span> <span class="ml-1 font-medium text-green-600 dark:text-green-400">{{ enrichResult.summary.totalImages }}</span></div>
                    <div><span class="text-muted-foreground">Failed:</span> <span class="ml-1 font-medium" :class="enrichResult.summary.failedImages > 0 ? 'text-destructive' : 'text-muted-foreground'">{{ enrichResult.summary.failedImages }}</span></div>
                    <div><span class="text-muted-foreground">Remaining:</span> <span class="ml-1 font-medium" :class="enrichResult.summary.contractorsRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">{{ enrichResult.summary.contractorsRemaining }}</span></div>
                  </div>
                  <p v-if="enrichResult.summary.contractorsRemaining > 0" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Click "Enrich Images Now" again to process more contractors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- STATE: Processing / Paused -->
        <template v-if="(uiState === 'processing' || uiState === 'paused') && currentJob">
          <div class="space-y-4">
            <!-- Status Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon
                  :name="uiState === 'processing' ? 'heroicons:arrow-path' : 'heroicons:pause'"
                  class="size-5"
                  :class="uiState === 'processing' ? 'animate-spin text-primary' : 'text-amber-500'"
                />
                <span class="font-medium text-foreground">
                  {{ uiState === 'processing' ? 'Processing...' : 'Paused' }}
                </span>
              </div>
              <span class="text-sm text-muted-foreground">
                {{ currentJob.processedRows }} / {{ currentJob.totalRows }} rows
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="relative h-4 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                class="h-full rounded-full bg-primary transition-all duration-300"
                :style="{ width: `${progressPercent}%` }"
              />
              <span class="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                {{ progressPercent }}%
              </span>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-green-600 dark:text-green-400">
                  {{ currentJob.importedCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Imported</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {{ currentJob.updatedCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Updated</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-neutral-600 dark:text-neutral-400">
                  {{ currentJob.skippedCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Skipped</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {{ currentJob.skippedClaimedCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Claimed</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-red-600 dark:text-red-400">
                  {{ currentJob.errorCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Errors</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {{ currentJob.pendingImageCount }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Images</p>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex gap-3">
              <UiButton
                v-if="uiState === 'processing'"
                variant="outline"
                class="flex-1"
                @click="pauseProcessing"
              >
                <Icon name="heroicons:pause" class="size-4 mr-2" />
                Pause
              </UiButton>
              <UiButton
                v-else
                class="flex-1"
                @click="resumeProcessing"
              >
                <Icon name="heroicons:play" class="size-4 mr-2" />
                Resume
              </UiButton>
              <UiButton
                variant="destructive"
                @click="clearFile"
              >
                <Icon name="heroicons:x-mark" class="size-4 mr-2" />
                Cancel
              </UiButton>
            </div>
          </div>
        </template>

        <!-- STATE: Complete -->
        <template v-if="uiState === 'complete' && currentJob">
          <div class="space-y-4">
            <!-- Success Header -->
            <div class="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <Icon name="heroicons:check-circle" class="mt-0.5 h-6 w-6 flex-shrink-0 text-green-500" />
              <div>
                <p class="font-medium text-green-800 dark:text-green-300">Import Complete</p>
                <p class="mt-1 text-sm text-green-700 dark:text-green-400">
                  Processed {{ currentJob.totalRows }} rows
                </p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ currentJob.importedCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Imported</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ currentJob.updatedCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Updated</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-neutral-600 dark:text-neutral-400">{{ currentJob.skippedCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Skipped</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ currentJob.skippedClaimedCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Claimed</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ currentJob.errorCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Errors</p>
              </div>
              <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
                <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{{ currentJob.pendingImageCount }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">Images</p>
              </div>
            </div>

            <!-- Errors List -->
            <div v-if="currentJob.errors.length > 0" class="rounded-lg border border-red-200 dark:border-red-800">
              <div class="border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/30">
                <p class="text-sm font-medium text-red-800 dark:text-red-300">
                  {{ currentJob.errors.length }} Error{{ currentJob.errors.length > 1 ? 's' : '' }}
                </p>
              </div>
              <div class="max-h-48 overflow-y-auto p-3">
                <ul class="space-y-2 text-sm">
                  <li
                    v-for="(error, index) in currentJob.errors"
                    :key="index"
                    class="flex gap-2 text-red-700 dark:text-red-400"
                  >
                    <span class="font-mono text-xs">Row {{ error.row }}:</span>
                    <span>{{ error.message }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Enrich Images Section -->
            <div v-if="currentJob.pendingImageCount > 0" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <div class="flex items-start gap-3">
                <Icon name="heroicons:photo" class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div class="flex-1">
                  <p class="font-medium text-amber-800 dark:text-amber-300">
                    {{ currentJob.pendingImageCount }} Images Pending
                  </p>
                  <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    Images are queued for download. Click below to process them now.
                  </p>
                  <UiButton class="mt-3" :disabled="isEnriching" @click="enrichImages">
                    <Icon :name="isEnriching ? 'heroicons:arrow-path' : 'heroicons:cloud-arrow-down'" class="size-4 mr-2" :class="{ 'animate-spin': isEnriching }" />
                    {{ isEnriching ? 'Processing...' : 'Enrich Images Now' }}
                  </UiButton>

                  <!-- Enrichment Results -->
                  <div v-if="enrichResult" class="mt-3 rounded border border-amber-300 bg-card p-3 dark:border-amber-600">
                    <div class="grid grid-cols-2 gap-2 text-sm">
                      <div><span class="text-muted-foreground">Contractors:</span> <span class="ml-1 font-medium">{{ enrichResult.summary.processedContractors }}</span></div>
                      <div><span class="text-muted-foreground">Downloaded:</span> <span class="ml-1 font-medium text-green-600 dark:text-green-400">{{ enrichResult.summary.totalImages }}</span></div>
                      <div><span class="text-muted-foreground">Failed:</span> <span class="ml-1 font-medium" :class="enrichResult.summary.failedImages > 0 ? 'text-destructive' : 'text-muted-foreground'">{{ enrichResult.summary.failedImages }}</span></div>
                      <div><span class="text-muted-foreground">Remaining:</span> <span class="ml-1 font-medium" :class="enrichResult.summary.contractorsRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">{{ enrichResult.summary.contractorsRemaining }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Import Another Button -->
            <UiButton variant="outline" class="w-full" @click="clearFile">
              Import Another File
            </UiButton>
          </div>
        </template>

        <!-- Error Message (shown in any state) -->
        <div
          v-if="errorMessage"
          class="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <Icon name="heroicons:exclamation-circle" class="mt-0.5 size-5 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Instructions -->
    <UiCard class="mt-6 max-w-2xl">
      <UiCardHeader>
        <UiCardTitle>Instructions</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li class="flex gap-2">
            <Icon name="heroicons:check" class="mt-0.5 size-4 flex-shrink-0 text-green-500" />
            Export data from Apify Google Maps Scraper as JSON
          </li>
          <li class="flex gap-2">
            <Icon name="heroicons:check" class="mt-0.5 size-4 flex-shrink-0 text-green-500" />
            No row limit - large files are processed in batches of 50
          </li>
          <li class="flex gap-2">
            <Icon name="heroicons:check" class="mt-0.5 size-4 flex-shrink-0 text-green-500" />
            Duplicate businesses will be updated (matched by Google Place ID)
          </li>
          <li class="flex gap-2">
            <Icon name="heroicons:check" class="mt-0.5 size-4 flex-shrink-0 text-green-500" />
            Permanently closed businesses are automatically skipped
          </li>
          <li class="flex gap-2">
            <Icon name="heroicons:check" class="mt-0.5 size-4 flex-shrink-0 text-green-500" />
            Images are queued for processing (run "Enrich Images" after import)
          </li>
        </ul>
      </UiCardContent>
    </UiCard>
  </div>
</template>

