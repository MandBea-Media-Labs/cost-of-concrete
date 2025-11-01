<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variantTitle: string
  variant: 'white-blue' | 'blue-blue'
  sampleText: string
  background?: 'white' | 'light-blue'
}

const props = withDefaults(defineProps<Props>(), {
  background: 'white'
})

const backgroundClasses = computed(() => {
  const backgrounds = {
    white: 'bg-neutral-50 dark:bg-neutral-800',
    'light-blue': 'bg-blue-50 dark:bg-blue-900/30'
  }
  return backgrounds[props.background]
})

const sizes = [
  { name: 'Small (sm)', value: 'sm' },
  { name: 'Medium (md) - Default', value: 'md' },
  { name: 'Large (lg)', value: 'lg' }
] as const
</script>

<template>
  <div :class="['rounded-xl border-2 border-neutral-200 p-8 dark:border-neutral-700', backgroundClasses]">
    <h3 class="mb-6 font-heading text-xl font-bold text-neutral-700 dark:text-neutral-200">
      {{ variantTitle }}
    </h3>

    <div class="space-y-6">
      <div v-for="size in sizes" :key="size.value">
        <h4 class="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {{ size.name }}
        </h4>
        <div class="flex flex-wrap gap-4">
          <Eyebrow :text="sampleText" :size="size.value" :variant="variant" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

