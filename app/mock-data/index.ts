/**
 * Mock Data Index
 * Central export point for all mock data used in the application
 */

// Service Options
export { serviceOptions } from './serviceOptions'

// Contractors
export { contractors } from './contractors'

// Filter Options
export {
  serviceTypeOptions,
  distanceOptions,
  ratingOptions,
  availabilityOptions,
  sortByOptions
} from './filterOptions'

// Navigation
export { navigationItems } from './navigation'
export type { NavigationItem } from './navigation'

// Hub Navigation
export {
  stainingConcreteNavigation,
  stainingConcreteTopicCards
} from './hubNavigation'
export type {
  NavigationLink,
  NavigationSection,
  TopicCard
} from './hubNavigation'

