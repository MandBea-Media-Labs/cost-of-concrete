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
  variant?: 'primary-outline' | 'secondary-outline' | 'ghost'

  /**
   * The size of the badge
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Optional icon name (uses Nuxt Icon)
   * When provided, displays on the left side of the badge text
   * Example: 'heroicons:check-circle'
   */
  icon?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary-outline',
  size: 'md',
  icon: null
})

// Size classes for different badge sizes
const sizeClasses = computed(() => {
  // Reduce left padding when icon is present
  if (props.icon) {
    const sizes = {
      sm: 'pl-0.5 pr-2.5 py-1 text-sm',
      md: 'pl-0.5 pr-3.5 py-1 text-base',
      lg: 'pl-0.5 pr-4 py-1 text-lg'
    }
    return sizes[props.size]
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-1 text-base',
    lg: 'px-6 py-1 text-lg'
  }
  return sizes[props.size]
})

// Icon size classes based on badge size
const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7'
  }
  return sizes[props.size]
})

// Variant classes for different badge styles with light and dark mode
const variantClasses = computed(() => {
  const variants = {
    'primary-outline': 'border-2 border-blue-400 bg-transparent text-blue-500 dark:border-blue-500 dark:text-blue-400',
    'secondary-outline': 'border-2 border-neutral-500 bg-transparent text-neutral-700 dark:border-neutral-600 dark:text-neutral-300',
    'ghost': 'border-2 border-black bg-transparent text-black dark:border-white dark:text-white'
  }
  return variants[props.variant]
})

// Combined badge classes
const badgeClasses = computed(() => {
  return [
    'inline-flex items-center gap-2 rounded-full font-bold',
    sizeClasses.value,
    variantClasses.value
  ].join(' ')
})
</script>

<template>
  <span :class="badgeClasses">
    <Icon v-if="icon" :name="icon" :class="iconSizeClasses" />
    {{ text }}
  </span>
</template>

<style scoped>
</style>

