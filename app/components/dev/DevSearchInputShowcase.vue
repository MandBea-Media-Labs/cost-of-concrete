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

      <!-- Custom Background Colors Section -->
      <div>
        <h3 class="mb-6 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          Custom Background Colors
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <!-- White/Dark Gray Background -->
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h4 class="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              White/Dark Gray Background
            </h4>
            <div class="space-y-4">
              <SearchInput
                placeholder="Search by ZIP Code"
                variant="primary-outline"
                size="md"
                :backgroundColor="['#FFFFFF', '#1F2937']"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                backgroundColor: ['#FFFFFF', '#1F2937']
              </p>
            </div>
          </div>

          <!-- Light Gray/Darker Gray Background -->
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h4 class="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Light Gray/Darker Gray Background
            </h4>
            <div class="space-y-4">
              <SearchInput
                placeholder="Search by ZIP Code"
                variant="secondary-outline"
                size="md"
                :backgroundColor="['#F3F4F6', '#374151']"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                backgroundColor: ['#F3F4F6', '#374151']
              </p>
            </div>
          </div>

          <!-- Button Mode with Custom Background -->
          <div class="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h4 class="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Button Mode with Custom Background
            </h4>
            <div class="space-y-4">
              <SearchInput
                placeholder="ZIP Code"
                variant="primary-outline"
                size="lg"
                button="Search"
                :backgroundColor="['#EFF6FF', '#1E3A8A']"
              />
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                backgroundColor: ['#EFF6FF', '#1E3A8A'] (Light Blue/Dark Blue)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

