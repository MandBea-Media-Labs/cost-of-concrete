import type { ContractorResult } from '~/composables/useSearchFilters'

/**
 * Mock contractor data for development and testing
 * Replace with API call in production
 *
 * Images are stored in public/images/mock-data/contractors/
 */
export const contractors: ContractorResult[] = [
  {
    id: '1',
    companyName: 'ABC Concrete Solutions',
    serviceType: 'driveways',
    location: 'Los Angeles, CA',
    distance: 2.5,
    rating: 4.8,
    reviewCount: 127,
    availability: 'available',
    priceRange: '$$',
    image: '/images/mock-data/contractors/abc-concrete-solutions.png',
    slug: 'abc-concrete-solutions'
  },
  {
    id: '2',
    companyName: 'Premium Patio Builders',
    serviceType: 'patios',
    location: 'Los Angeles, CA',
    distance: 5.2,
    rating: 4.9,
    reviewCount: 203,
    availability: 'busy',
    priceRange: '$$$',
    image: '/images/mock-data/contractors/premium-patio-builders.png',
    slug: 'premium-patio-builders'
  },
  {
    id: '3',
    companyName: 'Foundation Experts Inc',
    serviceType: 'foundations',
    location: 'Los Angeles, CA',
    distance: 8.1,
    rating: 4.6,
    reviewCount: 89,
    availability: 'available',
    priceRange: '$$',
    image: '/images/mock-data/contractors/foundation-experts-inc.png',
    slug: 'foundation-experts-inc'
  },
  {
    id: '4',
    companyName: 'Walkway Wizards',
    serviceType: 'walkways',
    location: 'Los Angeles, CA',
    distance: 3.7,
    rating: 4.7,
    reviewCount: 156,
    availability: 'available',
    priceRange: '$',
    image: '/images/mock-data/contractors/walkway-wizards.png',
    slug: 'walkway-wizards'
  },
  {
    id: '5',
    companyName: 'Decorative Concrete Co',
    serviceType: 'stamped-decorative',
    location: 'Los Angeles, CA',
    distance: 12.3,
    rating: 4.9,
    reviewCount: 241,
    availability: 'busy',
    priceRange: '$$$',
    image: '/images/mock-data/contractors/decorative-concrete-co.png',
    slug: 'decorative-concrete-co'
  },
  {
    id: '6',
    companyName: 'Quick Driveway Pros',
    serviceType: 'driveways',
    location: 'Los Angeles, CA',
    distance: 6.8,
    rating: 4.5,
    reviewCount: 94,
    availability: 'available',
    priceRange: '$',
    image: '/images/mock-data/contractors/quick-driveway-pros.png',
    slug: 'quick-driveway-pros'
  }
]

