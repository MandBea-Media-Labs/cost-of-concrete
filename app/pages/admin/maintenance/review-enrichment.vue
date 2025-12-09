<script setup lang="ts">
/**
 * Review Enrichment Page (Coming Soon)
 *
 * Placeholder for future AI-powered review analysis and enrichment.
 */

definePageMeta({
  layout: 'admin',
})

useSeoMeta({
  title: 'Review Enrichment',
})
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6 flex items-center gap-3">
      <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon name="heroicons:chat-bubble-left-right" class="size-5 text-primary" />
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Review Enrichment</h1>
        <p class="text-sm text-muted-foreground">
          AI-powered review analysis and enrichment
        </p>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <UiCard class="max-w-2xl">
      <UiCardContent class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Icon name="heroicons:wrench-screwdriver" class="size-8 text-muted-foreground" />
        </div>
        <h2 class="text-xl font-semibold">Coming Soon</h2>
        <p class="mt-2 max-w-md text-sm text-muted-foreground">
          This feature is under development. Review Enrichment will use AI to analyze
          customer reviews and extract insights, sentiment, and key themes.
        </p>
        <div class="mt-6 flex gap-3">
          <NuxtLink to="/admin/maintenance/import">
            <UiButton variant="outline">
              <Icon name="heroicons:arrow-up-tray" class="mr-2 size-4" />
              Import Contractors
            </UiButton>
          </NuxtLink>
          <NuxtLink to="/admin/maintenance/image-enrichment">
            <UiButton variant="outline">
              <Icon name="heroicons:photo" class="mr-2 size-4" />
              Image Enrichment
            </UiButton>
          </NuxtLink>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

