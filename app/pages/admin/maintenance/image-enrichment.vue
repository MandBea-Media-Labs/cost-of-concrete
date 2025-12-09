<script setup lang="ts">
/**
 * Image Enrichment Page
 *
 * Dedicated page for processing contractor image enrichment.
 * Downloads images from external URLs and uploads them to Supabase storage.
 */

definePageMeta({
  layout: 'admin',
})

// Page state
const enrichmentComplete = ref(false)
const lastSummary = ref<{
  processedContractors: number
  totalImages: number
  failedImages: number
  contractorsRemaining: number
} | null>(null)

// Handle enrichment completion
const handleComplete = (summary: typeof lastSummary.value) => {
  enrichmentComplete.value = true
  lastSummary.value = summary
}

// Handle enrichment error
const handleError = (message: string) => {
  if (import.meta.dev) {
    console.error('Enrichment error:', message)
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3">
        <div class="flex size-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Icon name="heroicons:photo" class="size-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Image Enrichment</h1>
          <p class="text-sm text-muted-foreground">
            Download and process contractor images from external sources
          </p>
        </div>
      </div>
    </div>

    <!-- Info Alert -->
    <UiAlert variant="info" class="mb-6">
      <Icon name="heroicons:information-circle" class="size-4" />
      <UiAlertTitle>How it works</UiAlertTitle>
      <UiAlertDescription>
        This tool processes contractors with pending external images. It downloads images from
        their original URLs and uploads them to our storage for faster, more reliable delivery.
      </UiAlertDescription>
    </UiAlert>

    <!-- Main Card -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle class="flex items-center gap-2">
          <Icon name="heroicons:cloud-arrow-down" class="size-5 text-muted-foreground" />
          Enrichment Queue
        </UiCardTitle>
        <UiCardDescription>
          Process pending contractor images in batches
        </UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <AdminEnrichmentProgress
          @complete="handleComplete"
          @error="handleError"
        />
      </UiCardContent>
    </UiCard>

    <!-- Success Summary Card (shown after completion) -->
    <UiCard v-if="enrichmentComplete && lastSummary" class="mt-6">
      <UiCardHeader>
        <UiCardTitle class="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Icon name="heroicons:check-circle" class="size-5" />
          Last Batch Summary
        </UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-lg border bg-muted/50 p-4 text-center">
            <div class="text-2xl font-bold text-foreground">
              {{ lastSummary.processedContractors }}
            </div>
            <div class="text-xs text-muted-foreground">Contractors</div>
          </div>
          <div class="rounded-lg border bg-muted/50 p-4 text-center">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ lastSummary.totalImages }}
            </div>
            <div class="text-xs text-muted-foreground">Downloaded</div>
          </div>
          <div class="rounded-lg border bg-muted/50 p-4 text-center">
            <div class="text-2xl font-bold" :class="lastSummary.failedImages > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'">
              {{ lastSummary.failedImages }}
            </div>
            <div class="text-xs text-muted-foreground">Failed</div>
          </div>
          <div class="rounded-lg border bg-muted/50 p-4 text-center">
            <div class="text-2xl font-bold" :class="lastSummary.contractorsRemaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'">
              {{ lastSummary.contractorsRemaining }}
            </div>
            <div class="text-xs text-muted-foreground">Remaining</div>
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
            <Icon name="heroicons:question-mark-circle" class="mr-2 inline size-4 text-muted-foreground" />
            What gets processed?
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="text-sm text-muted-foreground">
          <ul class="list-inside list-disc space-y-1">
            <li>Contractors with external image URLs</li>
            <li>Images not yet uploaded to storage</li>
            <li>Processed in batches of 10 contractors</li>
          </ul>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-base">
            <Icon name="heroicons:bolt" class="mr-2 inline size-4 text-muted-foreground" />
            Performance Tips
          </UiCardTitle>
        </UiCardHeader>
        <UiCardContent class="text-sm text-muted-foreground">
          <ul class="list-inside list-disc space-y-1">
            <li>Run during off-peak hours for best results</li>
            <li>Keep this tab open during processing</li>
            <li>Failed images can be retried later</li>
          </ul>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

