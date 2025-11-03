import type { ServiceOption } from '~/components/ui/form/SearchInput.vue'

/**
 * Mock service options for the SearchInput dropdown
 * Used across the application for service type selection
 */
export const serviceOptions: ServiceOption[] = [
  { id: null, name: 'All Services', slug: null },
  { id: 1, name: 'Driveways', slug: 'driveways' },
  { id: 2, name: 'Patios', slug: 'patios' },
  { id: 3, name: 'Foundations', slug: 'foundations' },
  { id: 4, name: 'Walkways', slug: 'walkways' },
  { id: 5, name: 'Stamped & Decorative', slug: 'stamped-decorative' }
]

