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
  variant?: 'primary' | 'secondary' | 'primary-outline' | 'secondary-outline' | 'ghost'

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Optional icon name (uses Nuxt Icon)
   * When provided, displays on the right side of the button text
   * Example: 'heroicons:arrow-right'
   */
  icon?: string | null

  /**
   * Optional custom colors as [normalColor, hoverColor] hex values
   * When provided, overrides all variant colors
   * Example: ['#FFFFFF', '#C0C0C0']
   * @default null
   */
  colors?: [string, string] | null

  /**
   * The border width for outline variants
   * Only applies to primary-outline and secondary-outline variants
   * @default 'thick'
   */
  borderWidth?: 'thin' | 'thick'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  location: null,
  variant: 'primary',
  disabled: false,
  icon: null,
  colors: null,
  borderWidth: 'thick'
})

// Size classes for different button sizes
const sizeClasses = computed(() => {
  // Ghost variant has no horizontal padding
  if (props.variant === 'ghost') {
    const sizes = {
      sm: 'py-2 text-sm rounded-4xl',
      md: 'py-3 text-base rounded-4xl',
      lg: 'py-3 text-lg rounded-4xl',
      xl: 'py-4 text-xl rounded-4xl'
    }
    return sizes[props.size]
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-4xl',
    md: 'px-6 py-3 text-base rounded-4xl',
    lg: 'px-8 py-3 text-lg rounded-4xl',
    xl: 'px-10 py-4 text-xl rounded-4xl'
  }
  return sizes[props.size]
})

// Icon size classes based on button size
const iconSizeClasses = computed(() => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7'
  }
  return sizes[props.size]
})

// Border width classes for outline variants
const borderWidthClasses = computed(() => {
  return props.borderWidth === 'thin' ? 'border' : 'border-2'
})

// Variant classes for primary and secondary styles
const variantClasses = computed(() => {
  // If custom colors are provided, use CSS custom properties
  if (props.colors) {
    return 'bg-transparent text-[var(--btn-color)] hover:text-[var(--btn-hover-color)] transition-colors'
  }

  const variants = {
    primary: 'bg-blue-500 text-neutral-50 hover:bg-blue-600 active:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: `bg-neutral-200 text-neutral-700 hover:bg-neutral-300 active:bg-neutral-400 ${borderWidthClasses.value} border-neutral-300 hover:border-neutral-400 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 dark:border-neutral-600 dark:hover:border-neutral-500`,
    'primary-outline': `bg-transparent text-blue-500 hover:bg-blue-50 active:bg-blue-100 ${borderWidthClasses.value} border-blue-500 hover:border-blue-600`,
    'secondary-outline': `bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 ${borderWidthClasses.value} border-neutral-400 hover:border-neutral-500 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:active:bg-neutral-700 dark:border-neutral-500 dark:hover:border-neutral-400`,
    'ghost': 'bg-transparent text-blue-500 hover:text-blue-600 active:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
  }
  return variants[props.variant]
})

// Custom styles for color overrides
const customStyles = computed(() => {
  if (!props.colors) return {}

  return {
    '--btn-color': props.colors[0],
    '--btn-hover-color': props.colors[1]
  }
})

// Combined button classes
const buttonClasses = computed(() => {
  return [
    'font-bold transition-all duration-200',
    'focus:outline-none focus:ring-4 focus:ring-blue-300',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md',
    'inline-flex items-center justify-center text-center no-underline',
    'leading-none',
    props.icon ? 'gap-2' : '',
    sizeClasses.value,
    variantClasses.value
  ].filter(Boolean).join(' ')
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
      :style="customStyles"
    >
      {{ text }}
      <Icon v-if="icon" :name="icon" :class="iconSizeClasses" />
    </NuxtLink>
  </Primitive>

  <button
    v-else
    type="button"
    :disabled="disabled"
    :class="buttonClasses"
    :style="customStyles"
  >
    {{ text }}
    <Icon v-if="icon" :name="icon" :class="iconSizeClasses" />
  </button>
</template>

<style scoped>
</style>

