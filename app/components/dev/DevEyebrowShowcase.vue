<script setup lang="ts">
// Eyebrow component showcase demonstrating all variants and sizes
</script>

<template>
  <ComponentSection
    title="Eyebrow Component"
    component-name="Eyebrow"
    description="Pill-shaped label component for section headers and category tags"
  >
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <DevEyebrowVariantCard
        variant-title="White-Blue Variant"
        variant="white-blue"
        sample-text="Homeowners Guide to Concrete"
        background="light-blue"
      />

      <DevEyebrowVariantCard
        variant-title="Blue-Blue Variant"
        variant="blue-blue"
        sample-text="How It Works"
      />
    </div>
  </ComponentSection>
</template>

<style scoped>
</style>

