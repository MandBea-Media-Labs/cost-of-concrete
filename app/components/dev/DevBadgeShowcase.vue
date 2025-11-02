<script setup lang="ts">
// Badge component showcase demonstrating all variants and sizes
</script>

<template>
  <ComponentSection
    title="Badge Component"
    component-name="Badge"
    description="Pill-shaped label component with outline variants for tags and status indicators"
  >
    <div class="grid grid-cols-1 gap-8 @lg:grid-cols-2">
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
  </ComponentSection>
</template>

<style scoped>
</style>

