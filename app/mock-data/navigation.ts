/**
 * Navigation Menu Mock Data
 * Used for both desktop and mobile navigation
 */

export interface NavigationItem {
  label: string
  link?: string
  children?: NavigationItem[]
}

export const navigationItems: NavigationItem[] = [
  {
    label: 'Find a Contractor',
    link: '/search'
  },
  {
    label: 'Applications',
    children: [
      { label: 'Staining Concrete', link: '/search' },
      { label: 'Stamping Concrete', link: '/search' },
      { label: 'Concrete Overlays', link: '/search' },
      { label: 'Concrete Resurfacing', link: '/search' },
      { label: 'Concrete Polishing', link: '/search' },
      { label: 'Concrete Dyes', link: '/search' },
      { label: 'Colored Concrete', link: '/search' }
    ]
  },
  {
    label: 'Indoor Concrete',
    children: [
      { label: 'Concrete Floors', link: '/search' },
      { label: 'Concrete Countertops', link: '/search' },
      { label: 'Garage Floor Coatings', link: '/search' },
      { label: 'Furniture, Sinks, Fire Bowls', link: '/search' },
      { label: 'Basement Floors', link: '/search' }
    ]
  },
  {
    label: 'Outdoor Concrete',
    children: [
      { label: 'Concrete Patios', link: '/search' },
      { label: 'Concrete Driveways', link: '/search' },
      { label: 'Concrete Pool Decks', link: '/search' },
      { label: 'Outdoor Kitchens', link: '/search' },
      { label: 'Outdoor Fireplace', link: '/search' },
      { label: 'Concrete Walkways', link: '/search' },
      { label: 'Concrete Pavers', link: '/search' },
      { label: 'Concrete Walls', link: '/search' }
    ]
  },
  {
    label: 'Repair & Maintenance',
    children: [
      { label: 'Foundation Repair', link: '/search' },
      { label: 'Concrete Crack Repair', link: '/search' },
      { label: 'Concrete Sealer', link: '/search' }
    ]
  }
]

