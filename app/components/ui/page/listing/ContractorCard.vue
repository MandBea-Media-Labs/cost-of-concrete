<script setup lang="ts">
// ContractorCard component for displaying contractor listings
// Features clickable card with image, company info, rating, and CTA button
// Supports intelligent image rendering (NuxtImage vs standard img for webp)

interface Props {
  /**
   * The image URL or path to the contractor's image
   * @default null
   */
  image?: string | null

  /**
   * The contractor's company name
   */
  companyName: string

  /**
   * The contractor's location (e.g., "Houston, TX")
   */
  location: string

  /**
   * The contractor's rating (0-5)
   */
  rating: number

  /**
   * The number of reviews
   */
  reviewCount: number

  /**
   * The contractor's unique identifier (UUID)
   */
  contractorId: string

  /**
   * The contractor's SEO-friendly slug
   */
  contractorSlug: string

  /**
   * Whether to display a border around the card
   * @default true
   */
  border?: boolean

  /**
   * The width of the border (thin = 1px, thick = 2px)
   * @default 'thin'
   */
  borderWidth?: 'thin' | 'thick'

  /**
   * The visual variant of the card
   * @default 'secondary-light-outline'
   */
  variant?: 'primary' | 'secondary' | 'primary-outline' | 'secondary-outline' | 'secondary-light-outline'
}

const props = withDefaults(defineProps<Props>(), {
  image: null,
  border: true,
  borderWidth: 'thin',
  variant: 'secondary-light-outline'
})

// Check if image is webp format
const isWebp = computed(() => {
  if (!props.image) return false
  return props.image.toLowerCase().endsWith('.webp')
})

// Build contractor profile URL
const contractorUrl = computed(() => {
  return `/contractors/${props.contractorSlug}`
})

// Border width classes
const borderWidthClasses = computed(() => {
  if (!props.border) return ''

  const widths = {
    thin: 'border',
    thick: 'border-2'
  }
  return widths[props.borderWidth]
})

// Variant classes for card background and border colors
const variantClasses = computed(() => {
  const variants = {
    'primary': 'bg-white dark:bg-neutral-800 border-blue-500 dark:border-blue-400',
    'secondary': 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600',
    'primary-outline': 'bg-white dark:bg-neutral-800 border-blue-500 dark:border-blue-400',
    'secondary-outline': 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600',
    'secondary-light-outline': 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
  }
  return variants[props.variant]
})

// Combined card classes
const cardClasses = computed(() => {
  return [
    'flex flex-col overflow-hidden rounded-lg transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-1',
    borderWidthClasses.value,
    variantClasses.value
  ].filter(Boolean).join(' ')
})

// Calculate star rating display
const starRating = computed(() => {
  const fullStars = Math.floor(props.rating)
  const emptyStars = 5 - Math.ceil(props.rating)
  const hasHalfStar = props.rating % 1 >= 0.5

  return {
    full: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars
  }
})
</script>

<template>
  <NuxtLink :to="contractorUrl" :class="cardClasses">
    <!-- Image Section -->
    <div v-if="image" class="aspect-[16/10] w-full overflow-hidden">
      <!-- Use NuxtImage for non-webp images -->
      <NuxtImg
        v-if="!isWebp"
        :src="image"
        :alt="`${companyName} - ${location}`"
        class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
      <!-- Use standard img tag for webp images -->
      <img
        v-else
        :src="image"
        :alt="`${companyName} - ${location}`"
        class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>

    <!-- Content Section -->
    <div class="flex flex-col gap-3 p-6">
      <!-- Company Name -->
      <h3 class="font-heading text-xl font-bold text-neutral-900 dark:text-neutral-50">
        {{ companyName }}
      </h3>

      <!-- Location -->
      <p class="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
        <Icon name="heroicons:map-pin" class="h-4 w-4" />
        {{ location }}
      </p>

      <!-- Description Slot -->
      <div class="text-sm text-neutral-600 dark:text-neutral-300">
        <slot />
      </div>

      <!-- Rating Section -->
      <div class="flex items-center gap-2">
        <!-- Stars -->
        <div class="flex items-center gap-0.5">
          <!-- Full Stars -->
          <Icon
            v-for="i in starRating.full"
            :key="`full-${i}`"
            name="heroicons:star-solid"
            class="h-4 w-4 text-yellow-400"
          />
          <!-- Half Star -->
          <Icon
            v-if="starRating.half"
            name="heroicons:star-solid"
            class="h-4 w-4 text-yellow-400 opacity-50"
          />
          <!-- Empty Stars -->
          <Icon
            v-for="i in starRating.empty"
            :key="`empty-${i}`"
            name="heroicons:star"
            class="h-4 w-4 text-neutral-300 dark:text-neutral-600"
          />
        </div>

        <!-- Rating Number and Review Count -->
        <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {{ rating.toFixed(1) }}
        </span>
        <span class="text-sm text-neutral-500 dark:text-neutral-400">
          ({{ reviewCount }})
        </span>
      </div>

      <!-- View Profile Button -->
      <div class="mt-2">
        <Button
          text="View Profile"
          variant="primary-outline"
          size="md"
          icon="heroicons:arrow-right"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
</style>

