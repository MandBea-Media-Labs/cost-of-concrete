<script setup lang="ts">
// Button Component Showcase
</script>

<template>
  <ComponentSection
    title="Button Component"
    component-name="Button"
    description="Versatile button component with multiple variants and sizes for all your UI needs"
  >
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <DevButtonVariantCard
        variant-title="Primary Variant"
        variant="primary"
        sample-text="For Contractors"
      />

      <DevButtonVariantCard
        variant-title="Primary Outline Variant"
        variant="primary-outline"
        sample-text="View Contractors"
      />

      <DevButtonVariantCard
        variant-title="Secondary Variant"
        variant="secondary"
        sample-text="Learn More"
      />

      <DevButtonVariantCard
        variant-title="Secondary Outline Variant"
        variant="secondary-outline"
        sample-text="Learn More"
      />
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

