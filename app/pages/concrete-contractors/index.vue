<script setup lang="ts">
import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'
import {
  serviceOptions,
  serviceTypeOptions,
  distanceOptions,
  ratingOptions,
  availabilityOptions,
  sortByOptions
} from '~/mock-data'

// Runtime config for site URL
const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://costofconcrete.com'
const siteName = config.public.siteName || 'Cost of Concrete'

// SEO Meta
const pageTitle = `Find Concrete Contractors Near You | ${siteName}`
const pageDescription = 'Search and compare top-rated concrete contractors across the United States. Get quotes for driveways, patios, foundations, stamped concrete, and more.'
const canonicalUrl = `${siteUrl}/concrete-contractors/`

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogTitle: 'Find Concrete Contractors Near You',
  ogDescription: pageDescription,
  ogType: 'website',
  ogUrl: canonicalUrl,
  ogSiteName: siteName,
  ogLocale: 'en_US',
  twitterCard: 'summary',
  twitterTitle: 'Find Concrete Contractors Near You',
  twitterDescription: pageDescription
})

useHead({
  title: pageTitle,
  link: [{ rel: 'canonical', href: canonicalUrl }]
})

// Supabase client for building storage URLs
const supabase = useSupabaseClient()

// Build image URL from storage path
function buildImageUrl(storagePath: string | undefined): string | undefined {
  if (!storagePath) return undefined
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Pagination and filter state
const currentPage = ref(1)
const limit = 12
const selectedCategory = ref<string | undefined>()
const minRating = ref<number | undefined>()
const sortBy = ref<'rating' | 'review_count' | 'company_name'>('rating')

// Local filter state for UI
const filters = reactive({
  serviceType: null as string | null,
  distance: null as string | null,
  rating: null as string | null,
  availability: null as string | null,
  sortBy: 'top-rated' as string
})

// Fetch contractors from API (nationwide - no location filter)
const { data: contractorsData, pending } = await useFetch('/api/public/contractors', {
  query: computed(() => ({
    category: selectedCategory.value,
    minRating: minRating.value,
    limit,
    offset: (currentPage.value - 1) * limit,
    orderBy: sortBy.value
  })),
  watch: [currentPage, selectedCategory, minRating, sortBy]
})

// Computed values for display
const contractors = computed(() => contractorsData.value?.contractors || [])
const totalContractors = computed(() => contractorsData.value?.total || 0)
const totalPages = computed(() => Math.ceil(totalContractors.value / limit))

// Reset filters
const resetFilters = () => {
  selectedCategory.value = undefined
  minRating.value = undefined
  sortBy.value = 'rating'
  currentPage.value = 1
  filters.serviceType = null
  filters.distance = null
  filters.rating = null
  filters.availability = null
  filters.sortBy = 'top-rated'
}

// Handle search submission from Hero - navigate to city/state page
const handleHeroSearch = (value: { location: string, service: ServiceOption | null }) => {
  // TODO (Phase 3): Implement navigation to city/state pages based on location search
  console.log('Search submitted:', value)
}

// Watch for filter changes to update the API query
watch(() => filters.sortBy, (newValue) => {
  if (newValue === 'top-rated') sortBy.value = 'rating'
  else if (newValue === 'most-reviews') sortBy.value = 'review_count'
  else if (newValue === 'a-z') sortBy.value = 'company_name'
  currentPage.value = 1
})

watch(() => filters.serviceType, (newValue) => {
  selectedCategory.value = newValue || undefined
  currentPage.value = 1
})

watch(() => filters.rating, (newValue) => {
  // Parse rating filter (e.g., "4" -> 4)
  minRating.value = newValue ? parseInt(newValue) : undefined
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

      <!-- Results Grid -->
      <div v-else-if="contractors.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <!-- No Results -->
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

