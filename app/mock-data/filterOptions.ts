import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'

/**
 * Mock filter options for the search page
 * Used for filtering contractor results
 */

export const serviceTypeOptions: FilterOption[] = [
  { value: 'all', label: 'All Services' },
  { value: 'driveways', label: 'Driveways' },
  { value: 'patios', label: 'Patios' },
  { value: 'foundations', label: 'Foundations' },
  { value: 'walkways', label: 'Walkways' },
  { value: 'stamped-decorative', label: 'Stamped & Decorative' }
]

export const distanceOptions: FilterOption[] = [
  { value: 'all', label: 'Any Distance' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' },
  { value: '50', label: 'Within 50 miles' }
]

export const ratingOptions: FilterOption[] = [
  { value: 'all', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4.8', label: '4.8+ Stars' }
]

export const availabilityOptions: FilterOption[] = [
  { value: 'all', label: 'Any Availability' },
  { value: 'available', label: 'Available Now' },
  { value: 'busy', label: 'Busy' }
]

export const sortByOptions: FilterOption[] = [
  { value: 'default', label: 'Top Rated' },
  { value: 'rating-high', label: 'Highest Rating' },
  { value: 'rating-low', label: 'Lowest Rating' },
  { value: 'distance-near', label: 'Nearest First' },
  { value: 'distance-far', label: 'Farthest First' },
  { value: 'reviews-most', label: 'Most Reviews' },
  { value: 'reviews-least', label: 'Least Reviews' }
]

