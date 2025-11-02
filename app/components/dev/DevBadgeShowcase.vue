<script setup lang="ts">
// Badge component showcase demonstrating all variants and sizes
</script>

<template>
  <ComponentSection
    title="Badge Component"
    component-name="Badge"
    description="Pill-shaped label component with outline variants for tags and status indicators"
  >
    <div class="space-y-8">
      <!-- Standard Variants -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Standard Variants
        </h3>
        <div class="grid grid-cols-1 gap-8 @5xl:grid-cols-2">
          <DevBadgeVariantCard
            variant-title="Primary Outline Variant"
            variant="primary-outline"
            sample-text="Featured"
          />

          <DevBadgeVariantCard
            variant-title="Secondary Outline Variant"
            variant="secondary-outline"
            sample-text="New"
          />
        </div>
      </div>

      <!-- Ghost Variant -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Ghost Variant
        </h3>
        <div class="grid grid-cols-1 gap-8 @5xl:grid-cols-2">
          <DevBadgeVariantCard
            variant-title="Ghost Variant"
            variant="ghost"
            sample-text="Top Rated"
          />

          <DevBadgeVariantCard
            variant-title="Ghost Variant with Icon"
            variant="ghost"
            sample-text="Top Rated"
            icon="heroicons:check-circle"
          />
        </div>
      </div>

      <!-- Badges with Icons -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Badges with Icons
        </h3>
        <div class="grid grid-cols-1 gap-8 @5xl:grid-cols-2">
          <DevBadgeVariantCard
            variant-title="Primary with Icon"
            variant="primary-outline"
            sample-text="Verified"
            icon="heroicons:check-circle"
          />

          <DevBadgeVariantCard
            variant-title="Secondary with Icon"
            variant="secondary-outline"
            sample-text="Premium"
            icon="heroicons:star"
          />
        </div>
      </div>

      <!-- Mixed Examples -->
      <div>
        <h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Mixed Examples
        </h3>
        <div class="rounded-lg border border-neutral-300 bg-white p-6 dark:border-neutral-600 dark:bg-neutral-800">
          <div class="flex flex-wrap gap-3">
            <Badge text="Featured" variant="primary-outline" size="md" />
            <Badge text="New" variant="secondary-outline" size="md" />
            <Badge text="Top Rated" variant="ghost" size="md" icon="heroicons:check-circle" />
            <Badge text="Verified" variant="primary-outline" size="md" icon="heroicons:shield-check" />
            <Badge text="Premium" variant="secondary-outline" size="sm" icon="heroicons:star" />
            <Badge text="Best Seller" variant="ghost" size="lg" icon="heroicons:fire" />
          </div>
        </div>
      </div>
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

