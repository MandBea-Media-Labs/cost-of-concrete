<script setup lang="ts">
import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'
import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'

interface Props {
  /**
   * Background color for the hero section
   * @default '#E8EBF3'
   */
  backgroundColor?: string

  /**
   * Service options for the SearchInput dropdown
   */
  serviceOptions?: ServiceOption[]

  /**
   * Filter options for Service Type
   */
  serviceTypeFilterOptions?: FilterOption[]

  /**
   * Filter options for Distance
   */
  distanceFilterOptions?: FilterOption[]

  /**
   * Filter options for Rating
   */
  ratingFilterOptions?: FilterOption[]

  /**
   * Filter options for Availability
   */
  availabilityFilterOptions?: FilterOption[]

  /**
   * Filter options for Sort By
   */
  sortByFilterOptions?: FilterOption[]
}

const props = withDefaults(defineProps<Props>(), {
  backgroundColor: '#E8EBF3',
  serviceOptions: () => [
    { id: null, name: 'All Services', slug: null },
    { id: 1, name: 'Driveways', slug: 'driveways' },
    { id: 2, name: 'Patios', slug: 'patios' },
    { id: 3, name: 'Foundations', slug: 'foundations' },
    { id: 4, name: 'Walkways', slug: 'walkways' },
    { id: 5, name: 'Stamped & Decorative', slug: 'stamped-decorative' }
  ],
  serviceTypeFilterOptions: () => [
    { value: 'all', label: 'Service Type' }
  ],
  distanceFilterOptions: () => [
    { value: 'all', label: 'Distance' }
  ],
  ratingFilterOptions: () => [
    { value: 'all', label: 'Rating' }
  ],
  availabilityFilterOptions: () => [
    { value: 'all', label: 'Availability' }
  ],
  sortByFilterOptions: () => [
    { value: 'default', label: 'Search By: Top Rated' }
  ]
})

// Emits
const emit = defineEmits<{
  search: [value: { location: string, service: ServiceOption | null }]
  'update:serviceTypeFilter': [value: string | number | null]
  'update:distanceFilter': [value: string | number | null]
  'update:ratingFilter': [value: string | number | null]
  'update:availabilityFilter': [value: string | number | null]
  'update:sortByFilter': [value: string | number | null]
}>()

// Filter state (v-model for parent)
const serviceTypeFilter = defineModel<string | number | null>('serviceTypeFilter', { default: null })
const distanceFilter = defineModel<string | number | null>('distanceFilter', { default: null })
const ratingFilter = defineModel<string | number | null>('ratingFilter', { default: null })
const availabilityFilter = defineModel<string | number | null>('availabilityFilter', { default: null })
const sortByFilter = defineModel<string | number | null>('sortByFilter', { default: null })

// Handle search submission
const handleSearch = (value: any) => {
  emit('search', value)
}
</script>

<template>
  <div
    class="rounded-3xl px-6 py-12 md:px-12 md:py-16"
    :style="{ backgroundColor }"
  >
    <div class="mx-auto max-w-4xl">
      <!-- Eyebrow -->
      <div class="mb-6 flex justify-center">
        <Eyebrow
          text="Homeowners Guide to Concrete"
          variant="white-blue"
          size="md"
        />
      </div>

      <!-- Heading -->
      <h1 class="mb-4 text-center font-heading text-4xl font-bold leading-tight text-neutral-900 md:text-5xl lg:text-6xl">
        Find Trusted Concrete Contractors Near You
      </h1>

      <!-- Subheadline -->
      <p class="mb-8 text-center text-base text-neutral-700 md:text-lg">
        Explore verified pros for driveways, patios, foundations, and decorative concrete. Compare services, reviews, and pricing—then contact your top choices with confidence.
      </p>

      <!-- SearchInput with Service Dropdown -->
      <div class="mx-auto mb-8 max-w-2xl">
        <SearchInput
          placeholder="ZIP Code"
          button="Find Contractors"
          :service-dropdown-values="serviceOptions"
          size="lg"
          variant="primary-outline"
          @submit="handleSearch"
        />
      </div>

      <!-- Filter Bar -->
      <div class="rounded-3xl bg-white px-6 py-5 shadow-sm dark:bg-neutral-800">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Service Type Filter -->
          <div class="w-full sm:w-auto sm:min-w-[140px]">
            <FilterSelect
              v-model="serviceTypeFilter"
              :options="serviceTypeFilterOptions"
              placeholder="Service Type"
              size="md"
            />
          </div>

          <!-- Distance Filter -->
          <div class="w-full sm:w-auto sm:min-w-[140px]">
            <FilterSelect
              v-model="distanceFilter"
              :options="distanceFilterOptions"
              placeholder="Distance"
              size="md"
            />
          </div>

          <!-- Rating Filter -->
          <div class="w-full sm:w-auto sm:min-w-[140px]">
            <FilterSelect
              v-model="ratingFilter"
              :options="ratingFilterOptions"
              placeholder="Rating"
              size="md"
            />
          </div>

          <!-- Availability Filter -->
          <div class="w-full sm:w-auto sm:min-w-[140px]">
            <FilterSelect
              v-model="availabilityFilter"
              :options="availabilityFilterOptions"
              placeholder="Availability"
              size="md"
            />
          </div>

          <!-- Sort By Filter -->
          <div class="w-full sm:w-auto sm:min-w-[180px]">
            <FilterSelect
              v-model="sortByFilter"
              :options="sortByFilterOptions"
              placeholder="Search By: Top Rated"
              size="md"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>

