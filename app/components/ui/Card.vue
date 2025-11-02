<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * The visual variant of the card
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'primary-outline' | 'secondary-outline'

  /**
   * The border width of the card
   * @default 'thin'
   */
  borderWidth?: 'thin' | 'thick'

  /**
   * The padding class for the card (Tailwind class)
   * @default 'p-6'
   */
  padding?: string

  /**
   * Whether to apply shadow and transition effects
   * @default false
   */
  shadow?: boolean

  /**
   * Optional icon name (uses Nuxt Icon)
   * Example: 'heroicons:shield-check'
   */
  icon?: string

  /**
   * Optional heading text (displays as H2)
   */
  heading?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  borderWidth: 'thin',
  padding: 'p-6',
  shadow: false
})

// Check if we have icon or heading to show the header section
const hasHeader = computed(() => !!props.icon || !!props.heading)

// Variant classes for different card styles with light and dark mode
const variantClasses = computed(() => {
  const variants = {
    primary: 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30',
    secondary: 'border-neutral-500 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800',
    'primary-outline': 'border-blue-400 bg-transparent dark:border-blue-500 dark:bg-transparent',
    'secondary-outline': 'border-neutral-500 bg-transparent dark:border-neutral-600 dark:bg-transparent'
  }
  return variants[props.variant]
})

// Border width classes
const borderWidthClasses = computed(() => {
  const widths = {
    thin: 'border',
    thick: 'border-2'
  }
  return widths[props.borderWidth]
})

// Shadow classes (conditional)
const shadowClasses = computed(() => {
  return props.shadow ? 'shadow-md transition-shadow duration-300' : ''
})

// Combined card classes
const cardClasses = computed(() => {
  return [
    'rounded-lg',
    props.padding,
    borderWidthClasses.value,
    variantClasses.value,
    shadowClasses.value
  ].join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <!-- Header section with icon and/or heading -->
    <div v-if="hasHeader" class="mb-6 flex flex-col gap-4">
      <!-- Icon -->
      <div v-if="icon" class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500">
        <Icon :name="icon" class="h-8 w-8 text-white" />
      </div>

      <!-- Heading -->
      <h2 v-if="heading" class="font-heading text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {{ heading }}
      </h2>
    </div>

    <!-- Content slot (description/body) -->
    <div class="text-neutral-600 dark:text-neutral-300">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>

