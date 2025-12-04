<script setup lang="ts">
import type { Review } from '~/composables/useSearchFilters'

interface Props {
  /** The review data to display */
  review: Review
  /** Maximum characters before showing "Read more" */
  truncateAt?: number
}

const props = withDefaults(defineProps<Props>(), {
  truncateAt: 200
})

// Expand/collapse state for long reviews
const isExpanded = ref(false)

// Check if content needs truncation
const needsTruncation = computed(() => props.review.content.length > props.truncateAt)

// Displayed content (truncated or full)
const displayedContent = computed(() => {
  if (!needsTruncation.value || isExpanded.value) {
    return props.review.content
  }
  return props.review.content.slice(0, props.truncateAt) + '...'
})

// Format date as relative time (e.g., "2 months ago")
const relativeDate = computed(() => {
  const now = new Date()
  const reviewDate = new Date(props.review.date)
  const diffMs = now.getTime() - reviewDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'month' : 'months'} ago`
  }
  const years = Math.floor(diffDays / 365)
  return `${years} ${years === 1 ? 'year' : 'years'} ago`
})

// Generate avatar background color based on initials
const avatarColor = computed(() => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500'
  ]
  const index = props.review.authorName.charCodeAt(0) % colors.length
  return colors[index]
})

// Star rating calculation
const starRating = computed(() => {
  const rating = props.review.rating
  return {
    full: rating,
    empty: 5 - rating
  }
})

// Toggle expand/collapse
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <article class="border-b border-neutral-200 pb-6 last:border-b-0 dark:border-neutral-700">
    <!-- Header: Avatar, Name, Verified, Date -->
    <div class="mb-3 flex items-start justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div
          :class="[avatarColor, 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full']"
        >
          <span class="text-sm font-bold text-white">{{ review.authorInitials }}</span>
        </div>

        <!-- Name & Verified -->
        <div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-neutral-900 dark:text-white">
              {{ review.authorName }}
            </span>
            <span
              v-if="review.verified"
              class="flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
            >
              <Icon name="heroicons:check-badge-solid" class="h-4 w-4" />
              Verified
            </span>
          </div>
          <!-- Date -->
          <span class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ relativeDate }}
          </span>
        </div>
      </div>

      <!-- Star Rating -->
      <div class="flex items-center gap-0.5">
        <Icon
          v-for="i in starRating.full"
          :key="`full-${i}`"
          name="heroicons:star-solid"
          class="h-4 w-4 text-yellow-400"
        />
        <Icon
          v-for="i in starRating.empty"
          :key="`empty-${i}`"
          name="heroicons:star"
          class="h-4 w-4 text-neutral-300 dark:text-neutral-600"
        />
      </div>
    </div>

    <!-- Review Title -->
    <h4 class="mb-2 font-bold text-neutral-900 dark:text-white">
      {{ review.title }}
    </h4>

    <!-- Review Content -->
    <p class="mb-3 text-neutral-600 dark:text-neutral-300">
      {{ displayedContent }}
      <button
        v-if="needsTruncation"
        type="button"
        class="ml-1 font-medium text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400"
        @click="toggleExpand"
      >
        {{ isExpanded ? 'Read less' : 'Read more' }}
      </button>
    </p>

    <!-- Footer: Service Type & Helpful -->
    <div class="flex flex-wrap items-center gap-3">
      <Badge :text="review.serviceType" variant="blue-blue" size="sm" />

      <span
        v-if="review.helpful > 0"
        class="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400"
      >
        <Icon name="heroicons:hand-thumb-up" class="h-4 w-4" />
        {{ review.helpful }} found helpful
      </span>
    </div>
  </article>
</template>

<style scoped>
</style>

