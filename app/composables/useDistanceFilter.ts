/**
 * useDistanceFilter composable
 *
 * Provides geolocation-aware distance filtering for contractor searches.
 * Uses VueUse's useGeolocation() to get user's position on-demand.
 * Auto-requests geolocation when a distance is selected.
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useGeolocation } from '@vueuse/core'
import { consola } from 'consola'
import type { FilterOption } from '~/components/ui/form/FilterSelect.vue'

export interface DistanceFilterReturn {
  /** Whether geolocation is supported in the browser */
  isSupported: ComputedRef<boolean>
  /** Whether geolocation permission has been granted */
  hasPermission: ComputedRef<boolean>
  /** Whether we're currently requesting location */
  isLocating: ComputedRef<boolean>
  /** Whether permission was denied */
  permissionDenied: ComputedRef<boolean>
  /** User's latitude (if available) */
  lat: ComputedRef<number | null>
  /** User's longitude (if available) */
  lng: ComputedRef<number | null>
  /** Error message if geolocation failed */
  error: ComputedRef<string | null>
  /** Selected distance in miles (null = any distance) */
  selectedDistance: Ref<number | null>
  /** Distance filter options (dynamically disabled based on permission) */
  distanceOptions: ComputedRef<FilterOption[]>
  /** Whether distance filtering is enabled (has location) */
  isEnabled: ComputedRef<boolean>
  /** Request geolocation permission and get position */
  requestLocation: () => Promise<void>
  /** Set the selected distance filter (auto-requests location if needed) */
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
  const permissionDeniedFlag = ref(false)

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

  const permissionDenied = computed(() => {
    // Check if error code 1 (permission denied) occurred
    if (geoError.value?.code === 1) {
      permissionDeniedFlag.value = true
    }
    return permissionDeniedFlag.value
  })

  const lat = computed(() => {
    if (!hasPermission.value || !coords.value) return null
    return coords.value.latitude
  })

  const lng = computed(() => {
    if (!hasPermission.value || !coords.value) return null
    return coords.value.longitude
  })

  const isLocating = computed(() => hasRequestedLocation.value && !hasPermission.value && !error.value)

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

  // Distance filter options - disable distance options if permission denied
  const distanceOptions = computed<FilterOption[]>(() => {
    const baseOptions: FilterOption[] = [
      { value: 'all', label: 'Any Distance' }
    ]

    const distanceChoices: FilterOption[] = [
      { value: '5', label: 'Within 5 miles', disabled: permissionDenied.value },
      { value: '10', label: 'Within 10 miles', disabled: permissionDenied.value },
      { value: '25', label: 'Within 25 miles', disabled: permissionDenied.value },
      { value: '50', label: 'Within 50 miles', disabled: permissionDenied.value },
      { value: '100', label: 'Within 100 miles', disabled: permissionDenied.value }
    ]

    return [...baseOptions, ...distanceChoices]
  })

  // Watch for geolocation errors to handle permission denial
  watch(geoError, (newError) => {
    if (newError?.code === 1) {
      permissionDeniedFlag.value = true
      // Reset the selected distance since we can't use it
      selectedDistance.value = null
      if (import.meta.dev) {
        consola.warn('Distance filter: Location permission denied, disabling distance options')
      }
    }
  })

  // Watch for successful location acquisition
  watch([lat, lng], ([newLat, newLng]) => {
    if (newLat !== null && newLng !== null) {
      if (import.meta.dev) {
        consola.success(`Distance filter: User location acquired - Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}`)
      }
    }
  })

  // Request geolocation permission
  async function requestLocation(): Promise<void> {
    if (!isSupported.value) {
      locationError.value = 'Geolocation is not supported by your browser'
      return
    }

    if (permissionDenied.value) {
      if (import.meta.dev) {
        consola.warn('Distance filter: Cannot request location - permission previously denied')
      }
      return
    }

    hasRequestedLocation.value = true
    locationError.value = null
    resume() // Start watching position
  }

  // Set selected distance (auto-requests location if needed)
  function setDistance(distance: number | null): void {
    selectedDistance.value = distance

    // Auto-request location when a distance is selected (not "all")
    if (distance !== null && !hasPermission.value && !permissionDenied.value) {
      if (import.meta.dev) {
        consola.info('Distance filter: Auto-requesting location for distance filter')
      }
      requestLocation()
    }
  }

  // Reset filter state
  function reset(): void {
    selectedDistance.value = null
    // Note: Don't reset permissionDeniedFlag - once denied, stays denied for session
    pause()
  }

  return {
    // State (reactive)
    isSupported,
    hasPermission,
    isLocating,
    permissionDenied,
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

