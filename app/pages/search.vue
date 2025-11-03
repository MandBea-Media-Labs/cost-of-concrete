<script setup lang="ts">
import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'
// Import mock data
import {
  serviceOptions,
  contractors as mockContractors,
  serviceTypeOptions,
  distanceOptions,
  ratingOptions,
  availabilityOptions,
  sortByOptions
} from '~/mock-data'

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

// Use mock contractor data (replace with API call in production)
const contractors = ref(mockContractors)

// Use the search filters composable
const { filters, filteredResults, resultCount, resetFilters } = useSearchFilters(contractors.value)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 8

// Calculate paginated results
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredResults.value.slice(start, end)
})

// Calculate total pages
const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / itemsPerPage)
})

// Handle search submission from Hero
const handleHeroSearch = (value: { location: string, service: ServiceOption | null }) => {
  console.log('Search submitted:', value)
  // TODO: Implement search logic (e.g., fetch contractors based on location and service)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Hero Section with overlaying filter bar -->
    <div class="container mx-auto mb-12 px-4 py-8">
      <SearchHero
        background-color="#edf2fc"
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
        @reset-filters="resetFilters"
      />
    </div>

    <!-- Results Section -->
    <div class="container mx-auto px-4 py-8">
      <!-- Results Count -->
      <div class="mb-6">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ resultCount }}</span>
          of <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ contractors.length }}</span> contractors
        </p>
      </div>

      <!-- Results Grid - 4 columns, 8 items per page (2 rows) -->
      <div v-if="filteredResults.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ContractorCard
          v-for="contractor in paginatedResults"
          :key="contractor.id"
          :image="contractor.image"
          :company-name="contractor.companyName"
          :location="contractor.location"
          :rating="contractor.rating"
          :review-count="contractor.reviewCount"
          :contractor-id="contractor.id"
          :contractor-slug="contractor.slug"
        >
          {{ contractor.description }}
        </ContractorCard>
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

