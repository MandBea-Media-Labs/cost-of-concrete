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

// Use the pagination composable
const {
  paginatedData: paginatedResults,
  currentPage,
  totalPages,
  isLoading
} = usePagination({
  mode: 'client',
  data: filteredResults,
  itemsPerPage: 8,
  syncUrl: true,
  scrollToTop: true,
  scrollTarget: '#results-section'
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
    <div id="results-section" class="container mx-auto px-4 pb-10 pt-2">
      <!-- Results Count -->
      <div class="mb-6">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Showing <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ resultCount }}</span>
          of <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ contractors.length }}</span> contractors
        </p>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="relative">
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80">
          <div class="flex flex-col items-center gap-3">
            <Icon name="svg-spinners:ring-resize" class="h-12 w-12 text-blue-600 dark:text-blue-500" />
            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Loading...</p>
          </div>
        </div>
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

      <!-- Pagination Controls -->
      <div v-if="filteredResults.length > 0 && totalPages > 1" class="mt-12">
        <Pagination
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          size="sm"
        />
      </div>
    </div>

    <!-- Popular Services Section -->
    <PopularServices />

    <!-- Browse by State Section -->
    <BrowseByState />

    <!-- Bottom CTA -->
    <BottomCta />
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>

