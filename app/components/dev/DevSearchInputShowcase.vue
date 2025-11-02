<script setup lang="ts">
// SearchInput Component Showcase
</script>

<template>
  <ComponentSection
    title="SearchInput Component"
    component-name="SearchInput"
    description="Versatile search input with autocomplete dropdown or button submit modes"
  >
    <div class="space-y-12">
      <!-- Autocomplete Mode Section -->
      <div>
        <h3 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Autocomplete Mode (No Button)
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <DevSearchInputVariantCard
            variant-title="Primary Outline Variant"
            variant="primary-outline"
          />

          <DevSearchInputVariantCard
            variant-title="Secondary Outline Variant"
            variant="secondary-outline"
          />

          <DevSearchInputVariantCard
            variant-title="Secondary Light Outline Variant"
            variant="secondary-light-outline"
          />
        </div>
      </div>

      <!-- Button Mode Section -->
      <div>
        <h3 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Button Mode (With Submit Button)
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <DevSearchInputVariantCard
            variant-title="Primary Outline Variant"
            variant="primary-outline"
            :button-mode="true"
            button-text="Find Contractors"
          />

          <DevSearchInputVariantCard
            variant-title="Secondary Outline Variant"
            variant="secondary-outline"
            :button-mode="true"
            button-text="Find Contractors"
          />

          <DevSearchInputVariantCard
            variant-title="Secondary Light Outline Variant"
            variant="secondary-light-outline"
            :button-mode="true"
            button-text="Find Contractors"
          />
        </div>
      </div>
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

