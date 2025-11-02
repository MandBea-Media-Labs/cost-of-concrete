<script setup lang="ts">
// Badge Variant Card - Displays a single badge variant with all sizes

interface Props {
  /**
   * The display name for the badge variant (e.g., "Primary Outline Variant")
   */
  variantTitle: string

  /**
   * The badge variant type to demonstrate
   */
  variant: 'primary-outline' | 'secondary-outline'

  /**
   * Sample text to display in the badge
   */
  sampleText: string
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border border-neutral-300 bg-white p-6 dark:border-neutral-600 dark:bg-neutral-800">
    <!-- Variant Title -->
    <h3 class="mb-4 font-heading text-lg font-bold text-neutral-900 dark:text-neutral-100">
      {{ variantTitle }}
    </h3>

    <!-- Badge Sizes -->
    <div class="space-y-4">
      <!-- Small -->
      <div class="flex items-center gap-4">
        <span class="w-16 text-sm font-medium text-neutral-600 dark:text-neutral-400">Small</span>
        <Badge :text="sampleText" :variant="variant" size="sm" />
      </div>

      <!-- Medium -->
      <div class="flex items-center gap-4">
        <span class="w-16 text-sm font-medium text-neutral-600 dark:text-neutral-400">Medium</span>
        <Badge :text="sampleText" :variant="variant" size="md" />
      </div>

      <!-- Large -->
      <div class="flex items-center gap-4">
        <span class="w-16 text-sm font-medium text-neutral-600 dark:text-neutral-400">Large</span>
        <Badge :text="sampleText" :variant="variant" size="lg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

