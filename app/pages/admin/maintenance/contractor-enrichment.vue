<script setup lang="ts">
/**
 * Contractor Enrichment Page (Coming Soon)
 *
 * Placeholder for future AI-powered contractor data enrichment.
 */

definePageMeta({
  layout: 'admin',
})

useSeoMeta({
  title: 'Contractor Enrichment',
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Contractor Enrichment</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            AI-powered contractor data enrichment
          </p>
        </div>
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
          This feature is under development. Contractor Enrichment will use AI to automatically
          enhance contractor profiles with service categories, descriptions, and more.
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

