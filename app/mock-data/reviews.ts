import type { Review } from '~/composables/useSearchFilters'

/**
 * Service types for reviews based on contractor specialties
 */
const SERVICE_TYPES: Record<string, string[]> = {
  driveways: ['Driveway Replacement', 'Driveway Repair', 'New Driveway Installation', 'Driveway Resurfacing'],
  patios: ['Patio Installation', 'Patio Extension', 'Stamped Patio', 'Covered Patio'],
  foundations: ['Foundation Repair', 'New Foundation', 'Foundation Inspection', 'Slab Foundation'],
  walkways: ['Walkway Installation', 'Sidewalk Repair', 'Garden Path', 'Front Walkway'],
  'stamped-decorative': ['Stamped Concrete', 'Decorative Overlay', 'Colored Concrete', 'Pattern Stamping']
}

/**
 * Reviewer names for generating realistic reviews
 */
const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'David', 'Linda', 'William', 'Elizabeth',
  'Richard', 'Barbara', 'Joseph', 'Susan', 'Thomas', 'Jessica', 'Christopher', 'Sarah', 'Daniel', 'Karen',
  'Matthew', 'Nancy', 'Anthony', 'Lisa', 'Mark', 'Betty', 'Donald', 'Margaret', 'Steven', 'Sandra',
  'Paul', 'Ashley', 'Andrew', 'Dorothy', 'Joshua', 'Kimberly', 'Kenneth', 'Emily', 'Kevin', 'Donna'
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

/**
 * Review titles by rating
 */
const REVIEW_TITLES: Record<number, string[]> = {
  5: [
    'Absolutely outstanding work!',
    'Best concrete contractor in the area',
    'Exceeded all expectations',
    'Highly recommend!',
    'Professional and reliable',
    'Perfect results, couldn\'t be happier',
    'Top-notch craftsmanship',
    'Amazing attention to detail'
  ],
  4: [
    'Great job overall',
    'Very satisfied with the work',
    'Professional team',
    'Good quality, minor issues',
    'Would hire again',
    'Solid work, good value',
    'Happy with the results'
  ],
  3: [
    'Decent work, room for improvement',
    'Met basic expectations',
    'Average experience',
    'Some issues but resolved',
    'Acceptable quality'
  ],
  2: [
    'Disappointed with the results',
    'Below expectations',
    'Had some problems',
    'Not what I expected'
  ]
}

/**
 * Review content templates by length and rating
 */
const REVIEW_CONTENT = {
  short: {
    positive: [
      'Quick and professional. The team was courteous and cleaned up after themselves.',
      'Great communication throughout the project. Very happy with the final result.',
      'On time, on budget, and excellent quality. What more could you ask for?',
      'The crew was efficient and the finished product looks amazing.',
      'Fair pricing and quality workmanship. Would definitely use again.'
    ],
    neutral: [
      'Job was completed on schedule. A few minor touch-ups were needed.',
      'Decent work overall. Communication could have been better.',
      'The project took longer than expected but the end result is acceptable.'
    ],
    negative: [
      'Had to follow up multiple times. Work quality was average.',
      'Some issues with the finish. Took extra time to resolve.'
    ]
  },
  medium: {
    positive: [
      'From the initial quote to project completion, the team was professional and thorough. They took the time to explain the process and kept us updated throughout. The finished work exceeded our expectations and has held up beautifully.',
      'We got quotes from several contractors and chose this company based on their reputation. They did not disappoint! The crew arrived on time every day, kept the work area clean, and delivered exactly what was promised. Neighbors have already asked for their contact info.',
      'Outstanding experience from start to finish. The estimate was accurate, timeline was met, and the quality of work is exceptional. They even suggested some improvements that saved us money. Highly professional team.'
    ],
    neutral: [
      'The project was completed satisfactorily. There were a few scheduling delays due to weather, which was understandable. The crew was polite and the final result meets our needs, though a couple of minor details needed touch-ups.',
      'Overall a decent experience. The work quality is good, though there were some communication gaps during the project. They did address our concerns when we raised them.'
    ],
    negative: [
      'The project took longer than initially quoted and there were some quality issues that needed to be addressed. The company did eventually fix the problems, but it required more follow-up than expected.'
    ]
  },
  long: {
    positive: [
      'I cannot say enough good things about this company. We had a complex project that included removing an old cracked driveway and installing a new stamped concrete one with integrated drainage. From the first consultation, they demonstrated deep expertise and took the time to understand exactly what we wanted. The crew arrived punctually each day, worked efficiently, and maintained a clean job site throughout. The foreman kept us informed of progress and quickly addressed any concerns. The finished driveway is absolutely stunning - neighbors have been stopping by to compliment it. The quality of the concrete work, the precision of the stamping pattern, and the attention to proper curing have resulted in a driveway that looks like it belongs in a magazine. We also appreciated that they followed up a week later to ensure everything was perfect. This is a company that truly takes pride in their work.',
      'After getting multiple quotes and reading countless reviews, we chose this contractor for our patio project and it was the best decision we made for our home. The entire process was seamless - from the detailed estimate that explained every cost, to the 3D rendering they provided so we could visualize the end result, to the actual installation which was completed in less time than quoted. The crew was not only skilled but also respectful of our property and family. They protected our landscaping, cleaned up thoroughly each day, and even helped us with some design suggestions that improved the final layout. The stamped concrete patio with the decorative border has transformed our backyard into an entertainment space we\'re proud to show off. Six months later, it still looks as good as the day it was finished.'
    ],
    neutral: [
      'Our experience was mixed. The initial consultation and quoting process was professional, and the price was competitive. However, there were some scheduling issues that pushed our start date back by two weeks. Once work began, the crew was competent and the quality of the concrete work itself is good. There were a few minor cosmetic issues - some color variation in the stamped pattern that wasn\'t quite what we expected from the samples. The company did send someone out to assess and applied a tinted sealer to even things out, which helped considerably. Communication during the project could have been better - we sometimes had to reach out to get updates. That said, the foundation work they did is solid and functional, which is ultimately what matters most.'
    ]
  }
}

/**
 * Generate initials from a full name
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`
}

/**
 * Generate a random date within the past N months
 */
function randomDateInPastMonths(months: number): string {
  const now = new Date()
  const pastDate = new Date(now)
  const randomDays = Math.floor(Math.random() * (months * 30))
  pastDate.setDate(pastDate.getDate() - randomDays)
  return pastDate.toISOString()
}

/**
 * Get a random item from an array
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Generate a rating based on realistic distribution
 * ~60% 5-star, ~25% 4-star, ~10% 3-star, ~5% 2-star
 */
function generateRating(): number {
  const rand = Math.random()
  if (rand < 0.60) return 5
  if (rand < 0.85) return 4
  if (rand < 0.95) return 3
  return 2
}

/**
 * Generate reviews for a contractor
 */
export function generateReviews(contractorId: string, serviceType: string, count: number = 10): Review[] {
  const reviews: Review[] = []
  const serviceOptions = SERVICE_TYPES[serviceType] || SERVICE_TYPES.driveways

  for (let i = 0; i < count; i++) {
    const firstName = randomFrom(FIRST_NAMES)
    const lastName = randomFrom(LAST_NAMES)
    const rating = generateRating()
    
    // Determine content length and sentiment
    const lengthRand = Math.random()
    const length: 'short' | 'medium' | 'long' = lengthRand < 0.4 ? 'short' : lengthRand < 0.8 ? 'medium' : 'long'
    
    let sentiment: 'positive' | 'neutral' | 'negative'
    if (rating >= 4) sentiment = 'positive'
    else if (rating === 3) sentiment = 'neutral'
    else sentiment = 'negative'

    // Get content pool, fallback to positive if not available
    const contentPool = REVIEW_CONTENT[length][sentiment] || REVIEW_CONTENT[length].positive
    const titlePool = REVIEW_TITLES[rating] || REVIEW_TITLES[5]

    reviews.push({
      id: `${contractorId}-review-${i + 1}`,
      authorName: `${firstName} ${lastName}`,
      authorInitials: getInitials(firstName, lastName),
      rating,
      date: randomDateInPastMonths(12),
      title: randomFrom(titlePool),
      content: randomFrom(contentPool),
      verified: Math.random() > 0.3, // 70% verified
      serviceType: randomFrom(serviceOptions),
      helpful: Math.floor(Math.random() * 25)
    })
  }

  // Sort by date (most recent first)
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

