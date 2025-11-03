<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { mockZipCodes, type ZipCodeData } from '~/mock-data/zipCodes'
import { consola } from 'consola'

interface Props {
  /**
   * Placeholder text for the input
   * @default "Search by ZIP Code"
   */
  placeholder?: string

  /**
   * The size of the input
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * The visual variant (border-based)
   * @default 'primary-outline'
   */
  variant?: 'primary-outline' | 'secondary-outline' | 'secondary-light-outline'

  /**
   * Maximum autocomplete results to show (autocomplete mode only)
   * @default 5
   */
  maxResults?: number

  /**
   * Minimum characters before autocomplete triggers (autocomplete mode only)
   * @default 2
   */
  minCharacters?: number

  /**
   * Loading state for future API integration
   * @default false
   */
  loading?: boolean

  /**
   * Button text. If provided, component shows button instead of autocomplete
   * @default null
   */
  button?: string | null

  /**
   * Custom background colors as [lightMode, darkMode] hex values
   * When provided, overrides the default background colors
   * Example: ['#FFFFFF', '#1F2937']
   * @default null
   */
  backgroundColor?: [string, string] | null
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search by ZIP Code',
  size: 'md',
  variant: 'primary-outline',
  maxResults: 5,
  minCharacters: 2,
  loading: false,
  button: null,
  backgroundColor: null
})

// Emits
const emit = defineEmits<{
  submit: [value: ZipCodeData | string]
  input: [value: string]
}>()

// State
const searchQuery = ref('')
const isOpen = ref(false)
const selectedIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

// Computed: Is button mode active
const isButtonMode = computed(() => props.button !== null && props.button !== undefined)

// Computed: Filtered results (autocomplete mode only)
const filteredResults = computed(() => {
  if (isButtonMode.value) return []
  if (searchQuery.value.length < props.minCharacters) return []

  const query = searchQuery.value.toLowerCase().trim()

  return mockZipCodes
    .filter(item => {
      return (
        item.zip.includes(query) ||
        item.city.toLowerCase().includes(query) ||
        item.state.toLowerCase().includes(query) ||
        item.stateAbbr.toLowerCase().includes(query)
      )
    })
    .slice(0, props.maxResults)
})

// Computed: Show dropdown
const showDropdown = computed(() => {
  return !isButtonMode.value && isOpen.value && searchQuery.value.length >= props.minCharacters
})

// Computed: Show "no results" message
const showNoResults = computed(() => {
  return showDropdown.value && filteredResults.value.length === 0
})

// Computed: Show clear button (autocomplete mode only)
const showClearButton = computed(() => {
  return !isButtonMode.value && searchQuery.value.length > 0
})

// Size classes
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'h-11 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  }
  return sizes[props.size]
})

// Variant classes
const variantClasses = computed(() => {
  const variants = {
    'primary-outline': 'border-blue-400 dark:border-blue-500 focus-within:border-blue-500 dark:focus-within:border-blue-400',
    'secondary-outline': 'border-neutral-600 dark:border-neutral-500 focus-within:border-neutral-700 dark:focus-within:border-neutral-400',
    'secondary-light-outline': 'border-neutral-300 dark:border-neutral-600 focus-within:border-neutral-400 dark:focus-within:border-neutral-500'
  }
  return variants[props.variant]
})

// Custom styles for background colors
const customStyles = computed(() => {
  const styles: Record<string, string> = {}

  if (props.backgroundColor) {
    styles['--search-bg-light'] = props.backgroundColor[0]
    styles['--search-bg-dark'] = props.backgroundColor[1]
  }

  return styles
})

// Container classes
const containerClasses = computed(() => {
  // In button mode: responsive right padding to contain button properly
  // Mobile container (< 448px): pr-2 (8px) for circular icon button
  // Tablet/Desktop container (≥ 448px): pr-1 (4px) for pill text button
  // In autocomplete mode: standard padding
  const paddingClasses = isButtonMode.value ? 'pl-4 pr-2 @md:pr-1' : 'pl-4 pr-4'

  // Background color classes
  const bgClasses = props.backgroundColor
    ? 'bg-[var(--search-bg-light)] dark:bg-[var(--search-bg-dark)]'
    : 'bg-gray-100 dark:bg-neutral-900'

  return [
    'relative flex items-center gap-3 rounded-full border transition-all',
    bgClasses,
    paddingClasses,
    sizeClasses.value,
    variantClasses.value
  ].join(' ')
})

// Input classes
const inputClasses = computed(() => {
  return [
    'flex-1 min-w-0 bg-transparent text-neutral-900 placeholder-neutral-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500'
  ].join(' ')
})

// Button classes (for button mode)
const buttonClasses = computed(() => {
  // Mobile container (< 448px): Round icon-only button with fixed size, no padding
  // Tablet/Desktop container (≥ 448px): Pill text button with auto size and padding
  // Button must fit within container with padding (container - 2*padding)
  // sm: h-11 container -> h-7 button (2px top/bottom margin) on mobile
  // md: h-12 container -> h-8 button (2px top/bottom margin) on mobile
  // lg: h-14 container -> h-10 button (2px top/bottom margin) on mobile
  const baseClasses = 'flex flex-shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold text-white transition-all hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500'

  // Mobile: No padding (icon centered in fixed w/h), Tablet/Desktop: Horizontal padding for text
  const responsiveClasses = '@md:px-5'

  const sizes = {
    sm: 'h-7 w-7 @md:h-auto @md:py-2 @md:w-auto text-sm',
    md: 'h-8 w-8 @md:h-auto @md:w-auto @md:py-2 text-base',
    lg: 'h-10 w-10 @md:h-auto @md:w-auto @md:py-2 text-lg'
  }

  return [baseClasses, responsiveClasses, sizes[props.size]].join(' ')
})

// Dropdown classes
const dropdownClasses = computed(() => {
  return [
    'absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800'
  ].join(' ')
})

// Handle input change
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  emit('input', searchQuery.value)

  if (!isButtonMode.value) {
    isOpen.value = true
    selectedIndex.value = -1
  }
}

// Handle result selection
const selectResult = (result: ZipCodeData) => {
  searchQuery.value = `${result.zip} - ${result.city}, ${result.stateAbbr}`
  isOpen.value = false
  selectedIndex.value = -1

  // Consola log for demo (only in dev mode)
  if (import.meta.dev) {
    consola.success('SearchInput (Autocomplete): Selected ZIP Code', {
      zip: result.zip,
      city: result.city,
      state: result.state,
      stateAbbr: result.stateAbbr
    })
  }

  emit('submit', result)
}

// Handle button click (button mode)
const handleButtonClick = () => {
  if (searchQuery.value.trim().length === 0) return

  // Consola log for demo (only in dev mode)
  if (import.meta.dev) {
    consola.info('SearchInput (Button Mode): Submitted value', {
      value: searchQuery.value,
      buttonText: props.button
    })
  }

  emit('submit', searchQuery.value)
}

// Handle clear button
const handleClear = () => {
  searchQuery.value = ''
  isOpen.value = false
  selectedIndex.value = -1
  inputRef.value?.focus()
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (isButtonMode.value) {
    // In button mode, Enter submits
    if (event.key === 'Enter') {
      event.preventDefault()
      handleButtonClick()
    }
    return
  }

  // Autocomplete mode keyboard navigation
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredResults.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        const result = filteredResults.value[selectedIndex.value]
        if (result) {
          selectResult(result)
        }
      }
      break
    case 'Escape':
      event.preventDefault()
      isOpen.value = false
      selectedIndex.value = -1
      break
    case 'Tab':
      isOpen.value = false
      selectedIndex.value = -1
      break
  }
}

// Click outside to close
onClickOutside(containerRef, () => {
  isOpen.value = false
  selectedIndex.value = -1
})

// Watch for selected index changes to scroll into view
watch(selectedIndex, (newIndex) => {
  if (newIndex >= 0) {
    const element = document.querySelector(`[data-result-index="${newIndex}"]`)
    element?.scrollIntoView({ block: 'nearest' })
  }
})
</script>

<template>
  <div ref="containerRef" class="@container relative w-full">
    <!-- Input Container -->
    <div :class="containerClasses" :style="customStyles">
      <!-- Search Icon -->
      <Icon name="heroicons:magnifying-glass" class="h-5 w-5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />

      <!-- Input Field -->
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="placeholder"
        :class="inputClasses"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <!-- Loading Spinner -->
      <Icon
        v-if="loading"
        name="heroicons:arrow-path"
        class="h-5 w-5 flex-shrink-0 animate-spin text-neutral-400 dark:text-neutral-500"
      />

      <!-- Clear Button (Autocomplete Mode Only) -->
      <button
        v-if="showClearButton"
        type="button"
        class="flex-shrink-0 text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        @click="handleClear"
        aria-label="Clear search"
      >
        <Icon name="heroicons:x-mark" class="h-5 w-5" />
      </button>

      <!-- Submit Button (Button Mode Only) -->
      <button
        v-if="isButtonMode"
        type="button"
        :class="buttonClasses"
        :disabled="searchQuery.trim().length === 0"
        @click="handleButtonClick"
        aria-label="Search"
      >
        <!-- Mobile container (< 448px): Show Icon, Tablet/Desktop (≥ 448px): Hidden -->
        <Icon name="heroicons:magnifying-glass" class="@md:hidden h-5 w-5" />

        <!-- Mobile container (< 448px): Hidden, Tablet/Desktop (≥ 448px): Show Text -->
        <span class="@md:inline hidden">{{ button }}</span>
      </button>
    </div>

    <!-- Autocomplete Dropdown -->
    <div
      v-if="showDropdown"
      v-auto-animate
      :class="dropdownClasses"
    >
      <!-- Results List -->
      <div v-if="filteredResults.length > 0">
        <button
          v-for="(result, index) in filteredResults"
          :key="result.zip"
          type="button"
          :data-result-index="index"
          :class="[
            'w-full px-4 py-3 text-left transition-colors',
            index === selectedIndex
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
          ]"
          @click="selectResult(result)"
        >
          <div class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {{ result.zip }} - {{ result.city }}, {{ result.stateAbbr }}
          </div>
        </button>
      </div>

      <!-- No Results Message -->
      <div v-if="showNoResults" class="px-4 py-6 text-center">
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          No results, try something else
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

