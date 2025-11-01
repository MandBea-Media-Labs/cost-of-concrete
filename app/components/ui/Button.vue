<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * The text to display on the button
   */
  text: string

  /**
   * The size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * The route to navigate to when clicked. If null, button does nothing on click.
   * @default null
   */
  location?: string | null

  /**
   * The visual variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'primary-outline' | 'secondary-outline'

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  location: null,
  variant: 'primary',
  disabled: false
})

// Size classes for different button sizes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-4xl',
    md: 'px-6 py-3 text-base rounded-4xl',
    lg: 'px-8 py-3 text-lg rounded-4xl',
    xl: 'px-10 py-4 text-xl rounded-4xl'
  }
  return sizes[props.size]
})

// Variant classes for primary and secondary styles
const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-blue-500 text-neutral-50 hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 active:bg-neutral-400 border-2 border-neutral-300 hover:border-neutral-400 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 dark:border-neutral-600 dark:hover:border-neutral-500',
    'primary-outline': 'bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100 border-2 border-blue-500 hover:border-blue-600',
    'secondary-outline': 'bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 border-2 border-neutral-400 hover:border-neutral-500 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:border-neutral-500 dark:hover:border-neutral-400'
  }
  return variants[props.variant]
})

// Combined button classes
const buttonClasses = computed(() => {
  return [
    'font-bold transition-all duration-200',
    'focus:outline-none focus:ring-4 focus:ring-blue-300',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md',
    'inline-flex items-center justify-center text-center no-underline',
    'leading-none',
    sizeClasses.value,
    variantClasses.value
  ].join(' ')
})

// Determine if this should be a link or button
const isLink = computed(() => props.location && !props.disabled)
</script>

<template>
  <Primitive
    v-if="isLink"
    as-child
  >
    <NuxtLink
      :to="location!"
      :class="buttonClasses"
    >
      {{ text }}
    </NuxtLink>
  </Primitive>

  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="buttonClasses"
  >
    {{ text }}
  </button>
</template>

<style scoped>
</style>

