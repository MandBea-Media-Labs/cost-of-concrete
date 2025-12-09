<script setup lang="ts">
/**
 * Admin Contractors Import Page
 *
 * Upload Apify Google Maps Scraper JSON exports to import contractor profiles.
 * Features:
 * - Drag-and-drop file upload
 * - File validation (JSON, max 100 rows)
 * - Import progress display
 * - Results summary with success/error counts
 */

definePageMeta({
  layout: 'admin',
})

// Reactive state
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const isEnriching = ref(false)
const selectedFile = ref<File | null>(null)
const importResult = ref<ImportResult | null>(null)
const enrichResult = ref<EnrichmentResult | null>(null)
const errorMessage = ref<string | null>(null)

// Types
interface ImportError {
  row: number
  placeId: string | null
  message: string
}

interface ImportSummary {
  total: number
  imported: number
  updated: number
  skipped: number
  skippedClaimed: number
  pendingImageCount: number
  errors: ImportError[]
}

interface ImportResult {
  success: boolean
  summary: ImportSummary
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

// Handle file selection via input
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectFile(target.files[0])
  }
}

// Handle drag events
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

// Validate and select file
const selectFile = (file: File) => {
  errorMessage.value = null
  importResult.value = null

  // Validate file type
  if (!file.name.endsWith('.json')) {
    errorMessage.value = 'Please select a JSON file'
    return
  }

  selectedFile.value = file
}

// Clear selection
const clearFile = () => {
  selectedFile.value = null
  importResult.value = null
  errorMessage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Upload and import file
const uploadFile = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  errorMessage.value = null
  importResult.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await $fetch<ImportResult>('/api/contractors/import', {
      method: 'POST',
      body: formData,
    })

    importResult.value = response
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Import failed'
  } finally {
    isUploading.value = false
  }
}

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value?.click()
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Enrich images (download and upload to storage)
const enrichImages = async () => {
  isEnriching.value = true
  enrichResult.value = null

  try {
    const response = await $fetch<EnrichmentResult>('/api/contractors/enrich-images', {
      method: 'POST',
    })

    enrichResult.value = response
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string }; message?: string }
    errorMessage.value = fetchError.data?.message || fetchError.message || 'Image enrichment failed'
  } finally {
    isEnriching.value = false
  }
}
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
              Maximum 100 rows per file
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

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mt-4 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          <Icon name="heroicons:exclamation-circle" class="mt-0.5 size-5 flex-shrink-0" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Upload Button -->
        <div v-if="selectedFile && !importResult" class="mt-6">
          <UiButton
            class="w-full"
            :disabled="isUploading"
            @click="uploadFile"
          >
            <Icon v-if="isUploading" name="heroicons:arrow-path" class="size-4 mr-2 animate-spin" />
            {{ isUploading ? 'Importing...' : 'Import Contractors' }}
          </UiButton>
        </div>

      <!-- Results -->
      <div v-if="importResult" class="mt-6 space-y-4">
        <!-- Success Summary -->
        <div
          class="flex items-start gap-3 rounded-lg p-4"
          :class="importResult.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'"
        >
          <Icon
            :name="importResult.success ? 'heroicons:check-circle' : 'heroicons:x-circle'"
            class="mt-0.5 h-6 w-6 flex-shrink-0"
            :class="importResult.success ? 'text-green-500' : 'text-red-500'"
          />
          <div>
            <p class="font-medium" :class="importResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'">
              {{ importResult.success ? 'Import Complete' : 'Import Failed' }}
            </p>
            <p class="mt-1 text-sm" :class="importResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
              Processed {{ importResult.summary.total }} rows
            </p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ importResult.summary.imported }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Imported
            </p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ importResult.summary.updated }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Updated
            </p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
            <p class="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
              {{ importResult.summary.skipped }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Skipped
            </p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ importResult.summary.skippedClaimed }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Claimed (Protected)
            </p>
          </div>
          <div class="rounded-lg bg-neutral-50 p-3 text-center dark:bg-neutral-900">
            <p class="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {{ importResult.summary.pendingImageCount }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400">
              Pending Images
            </p>
          </div>
        </div>

        <!-- Errors List -->
        <div v-if="importResult.summary.errors.length > 0" class="rounded-lg border border-red-200 dark:border-red-800">
          <div class="border-b border-red-200 bg-red-50 px-4 py-2 dark:border-red-800 dark:bg-red-900/30">
            <p class="text-sm font-medium text-red-800 dark:text-red-300">
              {{ importResult.summary.errors.length }} Error{{ importResult.summary.errors.length > 1 ? 's' : '' }}
            </p>
          </div>
          <div class="max-h-48 overflow-y-auto p-3">
            <ul class="space-y-2 text-sm">
              <li
                v-for="(error, index) in importResult.summary.errors"
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
        <div v-if="importResult.summary.pendingImageCount > 0" class="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:photo" class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div class="flex-1">
              <p class="font-medium text-amber-800 dark:text-amber-300">
                {{ importResult.summary.pendingImageCount }} Images Pending
              </p>
              <p class="mt-1 text-sm text-amber-700 dark:text-amber-400">
                Images are queued for download. Click below to process them now.
              </p>

              <!-- Enrich Button -->
              <UiButton
                class="mt-3"
                :disabled="isEnriching"
                @click="enrichImages"
              >
                <Icon :name="isEnriching ? 'heroicons:arrow-path' : 'heroicons:cloud-arrow-down'" class="size-4 mr-2" :class="{ 'animate-spin': isEnriching }" />
                {{ isEnriching ? 'Processing Images...' : 'Enrich Images Now' }}
              </UiButton>

              <!-- Enrichment Results -->
              <div v-if="enrichResult" class="mt-3 rounded border border-amber-300 bg-card p-3 dark:border-amber-600">
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span class="text-muted-foreground">Contractors:</span>
                    <span class="ml-1 font-medium text-foreground">{{ enrichResult.summary.processedContractors }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Downloaded:</span>
                    <span class="ml-1 font-medium text-green-600 dark:text-green-400">{{ enrichResult.summary.totalImages }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Failed:</span>
                    <span class="ml-1 font-medium" :class="enrichResult.summary.failedImages > 0 ? 'text-destructive' : 'text-muted-foreground'">
                      {{ enrichResult.summary.failedImages }}
                    </span>
                  </div>
                  <div>
                    <span class="text-muted-foreground">Remaining:</span>
                    <span class="ml-1 font-medium" :class="enrichResult.summary.contractorsRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'">
                      {{ enrichResult.summary.contractorsRemaining }}
                    </span>
                  </div>
                </div>
                <p v-if="enrichResult.summary.contractorsRemaining > 0" class="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Click "Enrich Images Now" again to process more contractors.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Import Another Button -->
        <UiButton
          variant="outline"
          class="w-full"
          @click="clearFile"
        >
          Import Another File
        </UiButton>
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
            Maximum 100 rows per file (split larger exports)
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

