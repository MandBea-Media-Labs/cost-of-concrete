<script setup lang="ts">
import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'
import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { consola } from 'consola'

// TODO: Future AI enrichment will categorize contractors against service_types table
// Currently, service type filtering uses keyword matching against metadata.categories

// Service options for the search input dropdown
const serviceOptions: ServiceOption[] = [
  { id: null, name: 'All Services', slug: null },
  { id: 1, name: 'Driveways', slug: 'driveways' },
  { id: 2, name: 'Patios', slug: 'patios' },
  { id: 3, name: 'Foundations', slug: 'foundations' },
  { id: 4, name: 'Walkways', slug: 'walkways' },
  { id: 5, name: 'Stamped & Decorative', slug: 'stamped-decorative' }
]

// Rating filter options
const ratingOptions: FilterOption[] = [
  { value: 'all', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '5', label: '5 Stars Only' }
]

// Sort by filter options (matching the watcher logic)
const sortByOptions: FilterOption[] = [
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'most-reviews', label: 'Most Reviews' },
  { value: 'a-z', label: 'A-Z' }
]

// Pagination and filter state (defined early for SEO composable)
const currentPage = ref(1)
const limit = 12
const selectedCategory = ref<string | undefined>()
const minRating = ref<number | undefined>()
const sortBy = ref<'rating' | 'review_count' | 'company_name'>('rating')

// Distance filter composable (defined early for useFetch)
const distanceFilter = useDistanceFilter()

// Fetch contractors from API (supports coordinate-based or nationwide search)
const { data: contractorsData, pending } = await useFetch('/api/public/contractors', {
  query: computed(() => ({
    category: selectedCategory.value,
    minRating: minRating.value,
    // Include coordinates if distance filter is active and location is available
    lat: distanceFilter.isEnabled.value && distanceFilter.selectedDistance.value ? distanceFilter.lat.value : undefined,
    lng: distanceFilter.isEnabled.value && distanceFilter.selectedDistance.value ? distanceFilter.lng.value : undefined,
    radius: distanceFilter.selectedDistance.value ?? undefined,
    limit,
    offset: (currentPage.value - 1) * limit,
    orderBy: sortBy.value
  })),
  watch: [currentPage, selectedCategory, minRating, sortBy, distanceFilter.lat, distanceFilter.lng, distanceFilter.selectedDistance]
})

// Computed values for display
const contractors = computed(() => contractorsData.value?.contractors || [])
const totalContractors = computed(() => contractorsData.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalContractors.value / limit))

// SEO composable with Schema.org structured data
const { applySeoMeta } = useContractorSearchSeo({
  totalContractors
})
applySeoMeta()

// Future: Featured/sponsored contractors section for monetization
// TODO: Add "Top Rated" badge or premium listing indicator for sponsored contractors

// Supabase client for building storage URLs
const supabase = useSupabaseClient()

// Build image URL from storage path
function buildImageUrl(storagePath: string | undefined): string | undefined {
  if (!storagePath) return undefined
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Fetch service types for filter dropdown
const { data: serviceTypesData } = await useFetch<{ id: number; name: string; slug: string }[]>('/api/public/service-types')
const serviceTypeOptions = computed<FilterOption[]>(() => {
  const base: FilterOption[] = [{ value: 'all', label: 'All Services' }]
  if (serviceTypesData.value) {
    return [...base, ...serviceTypesData.value.map(st => ({ value: st.slug, label: st.name }))]
  }
  return base
})

// Unwrap distanceOptions for template binding (ComputedRef -> Array)
const distanceOptions = computed(() => distanceFilter.distanceOptions.value)

// Local filter state for UI
const filters = reactive({
  serviceType: null as string | null,
  distance: null as string | null,
  rating: null as string | null,
  sortBy: 'top-rated' as string
})

// Check if distance filter is active
const isDistanceFilterActive = computed(() => filters.distance !== null && filters.distance !== 'all')

// Clear only the distance filter
const clearDistanceFilter = () => {
  filters.distance = null
  distanceFilter.reset()
  currentPage.value = 1
}

// Expand distance filter to a larger radius
const expandDistanceFilter = (miles: number) => {
  filters.distance = String(miles)
  distanceFilter.setDistance(miles)
  currentPage.value = 1
}

// Reset all filters
const resetFilters = () => {
  selectedCategory.value = undefined
  minRating.value = undefined
  sortBy.value = 'rating'
  currentPage.value = 1
  filters.serviceType = null
  filters.distance = null
  filters.rating = null
  filters.sortBy = 'top-rated'
  distanceFilter.reset()
}

// Handle search submission from Hero - search is handled via SearchInput navigation
const handleHeroSearch = (value: { location: string, service: ServiceOption | null }) => {
  // Navigation is now handled by SearchInput.vue via navigateToLocation()
  // This handler is retained for any additional logic needed after search
  if (import.meta.dev) {
    consola.info('Search submitted:', value)
  }
}

// Watch for filter changes to update the API query
watch(() => filters.sortBy, (newValue) => {
  if (newValue === 'top-rated') sortBy.value = 'rating'
  else if (newValue === 'most-reviews') sortBy.value = 'review_count'
  else if (newValue === 'a-z') sortBy.value = 'company_name'
  currentPage.value = 1
})

watch(() => filters.serviceType, (newValue) => {
  // Handle 'all' as no filter, otherwise use the selected value
  selectedCategory.value = (newValue && newValue !== 'all') ? newValue : undefined
  currentPage.value = 1
})

watch(() => filters.rating, (newValue) => {
  // Parse rating filter (e.g., "4" -> 4), 'all' means no filter
  if (newValue && newValue !== 'all') {
    minRating.value = parseFloat(newValue)
  } else {
    minRating.value = undefined
  }
  currentPage.value = 1
})

// Distance filter watcher - triggers geolocation request via setDistance
watch(() => filters.distance, (newValue) => {
  if (newValue && newValue !== 'all') {
    // Handle test coordinates option (test-25) or regular distance values
    if (newValue.startsWith('test-')) {
      distanceFilter.setDistance(newValue) // Pass string for test mode
    } else {
      distanceFilter.setDistance(parseInt(newValue, 10))
    }
  } else {
    distanceFilter.setDistance(null)
  }
  currentPage.value = 1
})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Hero Section with filter bar -->
    <div class="container mx-auto mb-12 px-4 py-8">
      <SearchHero
        background-color="#edf2fc"
        :service-options="serviceOptions"
        :service-type-filter-options="serviceTypeOptions"
        :distance-filter-options="distanceOptions"
        :rating-filter-options="ratingOptions"
        :sort-by-filter-options="sortByOptions"
        v-model:service-type-filter="filters.serviceType"
        v-model:distance-filter="filters.distance"
        v-model:rating-filter="filters.rating"
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
          Showing <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ contractors.length }}</span>
          of <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ totalContractors }}</span> contractors
        </p>
      </div>

      <!-- Loading Overlay -->
      <div v-if="pending" class="relative min-h-[200px]">
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80">
          <div class="flex flex-col items-center gap-3">
            <Icon name="svg-spinners:ring-resize" class="h-12 w-12 text-blue-600 dark:text-blue-500" />
            <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Loading...</p>
          </div>
        </div>
      </div>

      <!-- Results Grid (with autoanimate for smooth transitions) -->
      <div v-else-if="contractors.length > 0" v-auto-animate class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ContractorCard
          v-for="contractor in contractors"
          :key="contractor.id"
          :image="buildImageUrl(contractor.metadata?.primary_image || contractor.metadata?.images?.[0])"
          :company-name="contractor.companyName"
          :location="`${contractor.cityName}, ${contractor.stateCode}`"
          :rating="contractor.rating || 0"
          :review-count="contractor.reviewCount || 0"
          :contractor-id="contractor.id"
          :contractor-slug="contractor.slug"
          :city-slug="contractor.citySlug || 'unknown'"
          :state-code="contractor.stateCode?.toLowerCase() || 'unknown'"
        >
          {{ contractor.description || contractor.metadata?.categories?.join(', ') || '' }}
        </ContractorCard>
      </div>

      <!-- No Results - Distance Filter Active -->
      <div v-else-if="isDistanceFilterActive" class="py-16 text-center">
        <Icon name="heroicons:map-pin" class="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h3 class="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          No contractors found within {{ filters.distance }} miles
        </h3>
        <p class="mb-6 text-neutral-600 dark:text-neutral-400">
          Try expanding your search radius or clear the distance filter
        </p>
        <div class="flex flex-col items-center gap-4">
          <!-- Expand radius options -->
          <div class="flex flex-wrap justify-center gap-2">
            <Button
              v-if="Number(filters.distance) < 25"
              text="Try 25 miles"
              variant="secondary"
              size="sm"
              @click="expandDistanceFilter(25)"
            />
            <Button
              v-if="Number(filters.distance) < 50"
              text="Try 50 miles"
              variant="secondary"
              size="sm"
              @click="expandDistanceFilter(50)"
            />
            <Button
              v-if="Number(filters.distance) < 100"
              text="Try 100 miles"
              variant="secondary"
              size="sm"
              @click="expandDistanceFilter(100)"
            />
          </div>
          <!-- Clear distance filter -->
          <Button text="Clear Distance Filter" variant="primary" size="md" @click="clearDistanceFilter" />
        </div>
      </div>

      <!-- No Results - Generic -->
      <div v-else class="py-16 text-center">
        <Icon name="heroicons:magnifying-glass" class="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
        <h3 class="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">No contractors found</h3>
        <p class="mb-6 text-neutral-600 dark:text-neutral-400">Try adjusting your filters to see more results</p>
        <Button text="Reset All Filters" variant="primary" size="md" @click="resetFilters" />
      </div>

      <!-- Pagination Controls -->
      <div v-if="contractors.length > 0 && totalPages > 1" class="mt-12">
        <Pagination v-model:current-page="currentPage" :total-pages="totalPages" size="sm" />
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

