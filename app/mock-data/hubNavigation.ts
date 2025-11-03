/**
 * Hub Page Navigation Mock Data
 * Used for sidebar navigation and topic cards on hub pages
 */

export interface NavigationLink {
  label: string
  to: string
}

export interface NavigationSection {
  title: string
  links: NavigationLink[]
}

export interface TopicCard {
  image: string
  title: string
  description: string
  to: string
}

/**
 * Stained Concrete Hub Navigation Sections
 */
export const stainingConcreteNavigation: NavigationSection[] = [
  {
    title: 'Stained Concrete Overview',
    links: [
      { label: 'Stained Concrete Home', to: '/staining-concrete' },
      { label: 'Stained Concrete Pictures', to: '/' },
      { label: 'Sample Stain Colors', to: '/' },
      { label: 'Design Ideas', to: '/' },
      { label: 'Stained Concrete FAQs', to: '/' },
      { label: 'Pricing Guide', to: '/' },
      { label: 'Comparison Chart', to: '/' }
    ]
  },
  {
    title: 'How-To Guides',
    links: [
      { label: 'Concrete Stain Application', to: '/' },
      { label: 'Sealing Stained Concrete', to: '/' },
      { label: 'DIY Tips & Tricks', to: '/' }
    ]
  },
  {
    title: 'Related Information',
    links: [
      { label: 'Video Tutorials', to: '/' },
      { label: 'Case Studies', to: '/' },
      { label: 'Before & After Gallery', to: '/' }
    ]
  },
  {
    title: 'Other Resources',
    links: [
      { label: 'Concrete Products', to: '/' },
      { label: 'Concrete Stains', to: '/' },
      { label: 'Design Inspiration', to: '/' }
    ]
  }
]

/**
 * Stained Concrete Topic Cards
 */
export const stainingConcreteTopicCards: TopicCard[] = [
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete Pictures',
    description: 'Browse a collection of indoor and outdoor concrete stains; a variety of colors and finishes.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete Cost',
    description: 'The price of stained concrete starts at $2 to $4 per square foot and increases with complexity.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete Color Chart',
    description: 'See your stain color choices for staining concrete floors and outdoor surfaces.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Compare Stained Concrete',
    description: 'Stained floors offer advantages that carpet, tile and other materials can\'t match.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete Projects',
    description: 'See pictures and get inside info on stained concrete projects from across the country.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Concrete Floor Info',
    description: 'Discover the benefits of concrete flooring, including staining, polishing and overlays.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete FAQs',
    description: 'Find answers to common questions about stained concrete benefits, performance and maintenance.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Staining Concrete Patios',
    description: 'Get tips and design ideas for using stains to enhance a concrete patio.',
    to: '/'
  },
  {
    image: 'https://placehold.co/600x400',
    title: 'Stained Concrete Driveways',
    description: 'Transform your driveway with decorative concrete staining techniques and patterns.',
    to: '/'
  }
]

