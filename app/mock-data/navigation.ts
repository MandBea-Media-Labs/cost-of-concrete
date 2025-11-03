/**
 * Navigation Menu Mock Data
 * Used for both desktop and mobile navigation
 */

export interface NavigationItem {
  label: string
  link?: string
  description?: string
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
      { label: 'Staining Concrete', link: '/search', description: 'Transform your concrete with beautiful acid or water-based stains.' },
      { label: 'Stamping Concrete', link: '/search', description: 'Create decorative patterns that mimic stone, brick, or tile.' },
      { label: 'Concrete Overlays', link: '/search', description: 'Resurface existing concrete with a thin decorative layer.' },
      { label: 'Concrete Resurfacing', link: '/search', description: 'Restore and renew worn or damaged concrete surfaces.' },
      { label: 'Concrete Polishing', link: '/search', description: 'Achieve a glossy, mirror-like finish on concrete floors.' },
      { label: 'Concrete Dyes', link: '/search', description: 'Add vibrant, translucent color to your concrete projects.' },
      { label: 'Colored Concrete', link: '/search', description: 'Integrate color throughout the concrete mix for lasting beauty.' }
    ]
  },
  {
    label: 'Indoor Concrete',
    children: [
      { label: 'Concrete Floors', link: '/search', description: 'Durable and stylish flooring solutions for any interior space.' },
      { label: 'Concrete Countertops', link: '/search', description: 'Custom countertops with unique designs and finishes.' },
      { label: 'Garage Floor Coatings', link: '/search', description: 'Protective epoxy and polyurea coatings for garage floors.' },
      { label: 'Furniture, Sinks, Fire Bowls', link: '/search', description: 'Artisan concrete pieces for modern living spaces.' },
      { label: 'Basement Floors', link: '/search', description: 'Moisture-resistant flooring perfect for below-grade spaces.' }
    ]
  },
  {
    label: 'Outdoor Concrete',
    children: [
      { label: 'Concrete Patios', link: '/search', description: 'Create beautiful outdoor living spaces with decorative concrete.' },
      { label: 'Concrete Driveways', link: '/search', description: 'Enhance curb appeal with stamped or colored driveways.' },
      { label: 'Concrete Pool Decks', link: '/search', description: 'Slip-resistant and stylish surfaces around your pool.' },
      { label: 'Outdoor Kitchens', link: '/search', description: 'Durable concrete countertops and surfaces for outdoor cooking.' },
      { label: 'Outdoor Fireplace', link: '/search', description: 'Custom concrete fireplaces and fire features for your yard.' },
      { label: 'Concrete Walkways', link: '/search', description: 'Decorative pathways that complement your landscape.' },
      { label: 'Concrete Pavers', link: '/search', description: 'Versatile paving stones for patios, walkways, and more.' },
      { label: 'Concrete Walls', link: '/search', description: 'Retaining walls and decorative barriers for your property.' }
    ]
  },
  {
    label: 'Repair & Maintenance',
    children: [
      { label: 'Foundation Repair', link: '/search', description: 'Expert solutions for foundation cracks and settling issues.' },
      { label: 'Concrete Crack Repair', link: '/search', description: 'Professional repair services to restore structural integrity.' },
      { label: 'Concrete Sealer', link: '/search', description: 'Protect and preserve your concrete with quality sealers.' }
    ]
  }
]

