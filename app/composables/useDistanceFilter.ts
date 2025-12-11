/**
 * useDistanceFilter composable
 *
 * Provides geolocation-aware distance filtering for contractor searches.
 * Uses VueUse's useGeolocation() to get user's position on-demand.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useGeolocation } from '@vueuse/core'
import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'

export interface DistanceFilterReturn {
  /** Whether geolocation is supported in the browser */
  isSupported: ComputedRef<boolean>
  /** Whether geolocation permission has been granted */
  hasPermission: ComputedRef<boolean>
  /** Whether we're currently requesting location */
  isLocating: ComputedRef<boolean>
  /** User's latitude (if available) */
  lat: ComputedRef<number | null>
  /** User's longitude (if available) */
  lng: ComputedRef<number | null>
  /** Error message if geolocation failed */
  error: ComputedRef<string | null>
  /** Selected distance in miles (null = any distance) */
  selectedDistance: Ref<number | null>
  /** Distance filter options */
  distanceOptions: FilterOption[]
  /** Whether distance filtering is enabled (has location) */
  isEnabled: ComputedRef<boolean>
  /** Request geolocation permission and get position */
  requestLocation: () => Promise<void>
  /** Set the selected distance filter */
  setDistance: (distance: number | null) => void
  /** Reset the filter state */
  reset: () => void
  /** Tooltip text when filter is disabled */
  disabledTooltip: string
}

export function useDistanceFilter(): DistanceFilterReturn {
  // Internal state
  const selectedDistance = ref<number | null>(null)
  const hasRequestedLocation = ref(false)
  const locationError = ref<string | null>(null)

  // VueUse geolocation (starts paused - on-demand only)
  const {
    coords,
    locatedAt,
    error: geoError,
    isSupported,
    pause,
    resume
  } = useGeolocation({
    enableHighAccuracy: true,
    immediate: false // Don't request location immediately
  })

  // Computed values
  const hasPermission = computed(() => locatedAt.value !== null)

  const lat = computed(() => {
    if (!hasPermission.value || !coords.value) return null
    return coords.value.latitude
  })

  const lng = computed(() => {
    if (!hasPermission.value || !coords.value) return null
    return coords.value.longitude
  })

  const isLocating = computed(() => hasRequestedLocation.value && !hasPermission.value && !locationError.value)

  const isEnabled = computed(() => hasPermission.value && lat.value !== null && lng.value !== null)

  const error = computed(() => {
    if (geoError.value) {
      switch (geoError.value.code) {
        case 1: return 'Location permission denied'
        case 2: return 'Position unavailable'
        case 3: return 'Location request timed out'
        default: return 'Failed to get location'
      }
    }
    return locationError.value
  })

  // Distance filter options
  const distanceOptions: FilterOption[] = [
    { value: 'all', label: 'Any Distance' },
    { value: '5', label: 'Within 5 miles' },
    { value: '10', label: 'Within 10 miles' },
    { value: '25', label: 'Within 25 miles' },
    { value: '50', label: 'Within 50 miles' },
    { value: '100', label: 'Within 100 miles' }
  ]

  // Request geolocation permission
  async function requestLocation(): Promise<void> {
    if (!isSupported.value) {
      locationError.value = 'Geolocation is not supported by your browser'
      return
    }

    hasRequestedLocation.value = true
    locationError.value = null
    resume() // Start watching position
  }

  // Set selected distance
  function setDistance(distance: number | null): void {
    selectedDistance.value = distance
  }

  // Reset filter state
  function reset(): void {
    selectedDistance.value = null
    pause()
  }

  return {
    // State (reactive)
    isSupported,
    hasPermission,
    isLocating,
    lat,
    lng,
    error,
    selectedDistance,
    // Computed
    distanceOptions,
    isEnabled,
    disabledTooltip: 'Enable location to use this filter',
    // Methods
    requestLocation,
    setDistance,
    reset
  }
}

