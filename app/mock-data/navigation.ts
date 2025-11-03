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
      { label: 'Staining Concrete', link: '/staining-concrete', description: 'Transform your concrete with beautiful acid or water-based stains.' },
      { label: 'Stamping Concrete', link: '/staining-concrete', description: 'Create decorative patterns that mimic stone, brick, or tile.' },
      { label: 'Concrete Overlays', link: '/staining-concrete', description: 'Resurface existing concrete with a thin decorative layer.' },
      { label: 'Concrete Resurfacing', link: '/staining-concrete', description: 'Restore and renew worn or damaged concrete surfaces.' },
      { label: 'Concrete Polishing', link: '/staining-concrete', description: 'Achieve a glossy, mirror-like finish on concrete floors.' },
      { label: 'Concrete Dyes', link: '/staining-concrete', description: 'Add vibrant, translucent color to your concrete projects.' },
      { label: 'Colored Concrete', link: '/staining-concrete', description: 'Integrate color throughout the concrete mix for lasting beauty.' }
    ]
  },
  {
    label: 'Indoor Concrete',
    children: [
      { label: 'Concrete Floors', link: '/staining-concrete', description: 'Durable and stylish flooring solutions for any interior space.' },
      { label: 'Concrete Countertops', link: '/staining-concrete', description: 'Custom countertops with unique designs and finishes.' },
      { label: 'Garage Floor Coatings', link: '/staining-concrete', description: 'Protective epoxy and polyurea coatings for garage floors.' },
      { label: 'Furniture, Sinks, Fire Bowls', link: '/staining-concrete', description: 'Artisan concrete pieces for modern living spaces.' },
      { label: 'Basement Floors', link: '/staining-concrete', description: 'Moisture-resistant flooring perfect for below-grade spaces.' }
    ]
  },
  {
    label: 'Outdoor Concrete',
    children: [
      { label: 'Concrete Patios', link: '/staining-concrete', description: 'Create beautiful outdoor living spaces with decorative concrete.' },
      { label: 'Concrete Driveways', link: '/staining-concrete', description: 'Enhance curb appeal with stamped or colored driveways.' },
      { label: 'Concrete Pool Decks', link: '/staining-concrete', description: 'Slip-resistant and stylish surfaces around your pool.' },
      { label: 'Outdoor Kitchens', link: '/staining-concrete', description: 'Durable concrete countertops and surfaces for outdoor cooking.' },
      { label: 'Outdoor Fireplace', link: '/staining-concrete', description: 'Custom concrete fireplaces and fire features for your yard.' },
      { label: 'Concrete Walkways', link: '/staining-concrete', description: 'Decorative pathways that complement your landscape.' },
      { label: 'Concrete Pavers', link: '/staining-concrete', description: 'Versatile paving stones for patios, walkways, and more.' },
      { label: 'Concrete Walls', link: '/staining-concrete', description: 'Retaining walls and decorative barriers for your property.' }
    ]
  },
  {
    label: 'Repair & Maintenance',
    children: [
      { label: 'Foundation Repair', link: '/staining-concrete', description: 'Expert solutions for foundation cracks and settling issues.' },
      { label: 'Concrete Crack Repair', link: '/staining-concrete', description: 'Professional repair services to restore structural integrity.' },
      { label: 'Concrete Sealer', link: '/staining-concrete', description: 'Protect and preserve your concrete with quality sealers.' }
    ]
  }
]

