<script setup lang="ts">
import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'
import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'
import type { ContractorResult } from '~/composables/useSearchFilters'

// SEO Meta
useHead({
  title: 'Find Concrete Contractors Near You | Cost of Concrete',
  meta: [
    {
      name: 'description',
      content: 'Search and filter local concrete contractors. Compare ratings, prices, and availability to find the perfect contractor for your project.'
    }
  ]
})

// Service options for SearchInput dropdown
const serviceOptions: ServiceOption[] = [
  { id: null, name: 'All Services', slug: null },
  { id: 1, name: 'Driveways', slug: 'driveways' },
  { id: 2, name: 'Patios', slug: 'patios' },
  { id: 3, name: 'Foundations', slug: 'foundations' },
  { id: 4, name: 'Walkways', slug: 'walkways' },
  { id: 5, name: 'Stamped & Decorative', slug: 'stamped-decorative' }
]

// Mock contractor data (replace with API call in production)
const contractors = ref<ContractorResult[]>([
  {
    id: '1',
    companyName: 'ABC Concrete Solutions',
    serviceType: 'driveways',
    location: 'Los Angeles, CA',
    distance: 2.5,
    rating: 4.8,
    reviewCount: 127,
    availability: 'available',
    priceRange: '$$',
    image: '/images/contractors/abc-concrete.webp',
    slug: 'abc-concrete-solutions'
  },
  {
    id: '2',
    companyName: 'Premium Patio Builders',
    serviceType: 'patios',
    location: 'Los Angeles, CA',
    distance: 5.2,
    rating: 4.9,
    reviewCount: 203,
    availability: 'busy',
    priceRange: '$$$',
    image: '/images/contractors/premium-patio.webp',
    slug: 'premium-patio-builders'
  },
  {
    id: '3',
    companyName: 'Foundation Experts Inc',
    serviceType: 'foundations',
    location: 'Los Angeles, CA',
    distance: 8.1,
    rating: 4.6,
    reviewCount: 89,
    availability: 'available',
    priceRange: '$$',
    image: '/images/contractors/foundation-experts.webp',
    slug: 'foundation-experts-inc'
  },
  {
    id: '4',
    companyName: 'Walkway Wizards',
    serviceType: 'walkways',
    location: 'Los Angeles, CA',
    distance: 3.7,
    rating: 4.7,
    reviewCount: 156,
    availability: 'available',
    priceRange: '$',
    image: '/images/contractors/walkway-wizards.webp',
    slug: 'walkway-wizards'
  },
  {
    id: '5',
    companyName: 'Decorative Concrete Co',
    serviceType: 'stamped-decorative',
    location: 'Los Angeles, CA',
    distance: 12.3,
    rating: 4.9,
    reviewCount: 241,
    availability: 'busy',
    priceRange: '$$$',
    image: '/images/contractors/decorative-concrete.webp',
    slug: 'decorative-concrete-co'
  },
  {
    id: '6',
    companyName: 'Quick Driveway Pros',
    serviceType: 'driveways',
    location: 'Los Angeles, CA',
    distance: 6.8,
    rating: 4.5,
    reviewCount: 94,
    availability: 'available',
    priceRange: '$',
    image: '/images/contractors/quick-driveway.webp',
    slug: 'quick-driveway-pros'
  }
])

// Use the search filters composable
const { filters, filteredResults, resultCount, resetFilters, hasActiveFilters } = useSearchFilters(contractors.value)

// Filter options
const serviceTypeOptions: FilterOption[] = [
  { value: 'all', label: 'All Services' },
  { value: 'driveways', label: 'Driveways' },
  { value: 'patios', label: 'Patios' },
  { value: 'foundations', label: 'Foundations' },
  { value: 'walkways', label: 'Walkways' },
  { value: 'stamped-decorative', label: 'Stamped & Decorative' }
]

const distanceOptions: FilterOption[] = [
  { value: 'all', label: 'Any Distance' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' },
  { value: '50', label: 'Within 50 miles' }
]

const ratingOptions: FilterOption[] = [
  { value: 'all', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4.8', label: '4.8+ Stars' }
]

const availabilityOptions: FilterOption[] = [
  { value: 'all', label: 'Any Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' }
]

const sortByOptions: FilterOption[] = [
  { value: 'default', label: 'Top Rated' },
  { value: 'rating-high', label: 'Highest Rating' },
  { value: 'rating-low', label: 'Lowest Rating' },
  { value: 'distance-near', label: 'Nearest First' },
  { value: 'distance-far', label: 'Farthest First' },
  { value: 'reviews-most', label: 'Most Reviews' },
  { value: 'reviews-least', label: 'Least Reviews' }
]

// Handle search submission from Hero
const handleHeroSearch = (value: { location: string, service: ServiceOption | null }) => {
  consola.info('Search submitted:', value)
  // TODO: Implement search logic (e.g., fetch contractors based on location and service)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-8">
      <SearchHero
        background-color="#E8EBF3"
        :service-options="serviceOptions"
        :service-type-filter-options="serviceTypeOptions"
        :distance-filter-options="distanceOptions"
        :rating-filter-options="ratingOptions"
        :availability-filter-options="availabilityOptions"
        :sort-by-filter-options="sortByOptions"
        v-model:service-type-filter="filters.serviceType"
        v-model:distance-filter="filters.distance"
        v-model:rating-filter="filters.rating"
        v-model:availability-filter="filters.availability"
        v-model:sort-by-filter="filters.sortBy"
        @search="handleHeroSearch"
      />
    </div>

    <!-- Results Section -->
    <div class="container mx-auto px-4 py-8">
      <!-- Results Count & Reset Button -->
      <div class="mb-6 flex items-center justify-between">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ resultCount }}</span>
          of <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ contractors.length }}</span> contractors
        </p>

        <!-- Reset Button (only show when filters are active) -->
        <Button
          v-if="hasActiveFilters"
          text="Reset Filters"
          variant="secondary-outline"
          size="sm"
          @click="resetFilters"
        />
      </div>

      <!-- Results Grid -->
      <div v-if="filteredResults.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ContractorCard
          v-for="contractor in filteredResults"
          :key="contractor.id"
          :image="contractor.image"
          :company-name="contractor.companyName"
          :location="contractor.location"
          :rating="contractor.rating"
          :review-count="contractor.reviewCount"
          :contractor-id="contractor.id"
          :contractor-slug="contractor.slug"
        />
      </div>

      <!-- No Results -->
      <div v-else class="py-16 text-center">
        <Icon name="heroicons:magnifying-glass" class="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h3 class="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          No contractors found
        </h3>
        <p class="mb-6 text-neutral-600 dark:text-neutral-400">
          Try adjusting your filters to see more results
        </p>
        <Button
          text="Reset All Filters"
          variant="primary"
          size="md"
          @click="resetFilters"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>

