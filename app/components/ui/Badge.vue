<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * The text to display in the badge
   */
  text: string

  /**
   * The visual variant of the badge
   * @default 'primary-outline'
   */
  variant?: 'primary-outline' | 'secondary-outline'

  /**
   * The size of the badge
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary-outline',
  size: 'md'
})

// Size classes for different badge sizes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-1 text-base',
    lg: 'px-6 py-1 text-lg'
  }
  return sizes[props.size]
})

// Variant classes for different badge styles with light and dark mode
const variantClasses = computed(() => {
  const variants = {
    'primary-outline': 'border-2 border-blue-400 bg-transparent text-blue-500 dark:border-blue-500 dark:text-blue-400',
    'secondary-outline': 'border-2 border-neutral-500 bg-transparent text-neutral-700 dark:border-neutral-600 dark:text-neutral-300'
  }
  return variants[props.variant]
})

// Combined badge classes
const badgeClasses = computed(() => {
  return [
    'inline-block rounded-full font-bold',
    sizeClasses.value,
    variantClasses.value
  ].join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    {{ text }}
  </span>
</template>

<style scoped>
</style>

