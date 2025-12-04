<script setup lang="ts">
import type { Review } from '~/composables/useSearchFilters'
import { contractors } from '~/mock-data/contractors'

const garageImage = "/images/contractors/solidstone-concrete-llc/overview.png"

const breadcrumbs = [
  { id: 'texas', title: 'Texas', full_path: '/texas' },
  { id: 'houston', title: 'Houston', full_path: '/houston' },
  { id: 'provider', title: 'SolidStone Concrete LLC', full_path: '/listing-details' }
]

const tabs = ['Overview', 'Products & Services', 'Photos', 'Reviews']
const activeTab = ref('Overview')

// ============================================
// Reviews Tab State & Logic
// ============================================

// Get reviews from first contractor (simulating current listing)
const allReviews = ref<Review[]>(contractors[0]?.reviews || [])

// Sorting state
type ReviewSortOption = 'recent' | 'highest' | 'lowest'
const reviewSortBy = ref<ReviewSortOption>('recent')

// Sort options
const sortOptions: { value: ReviewSortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' }
]

// Sorted reviews
const sortedReviews = computed(() => {
  const reviews = [...allReviews.value]
  switch (reviewSortBy.value) {
    case 'recent':
      return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    case 'highest':
      return reviews.sort((a, b) => b.rating - a.rating)
    case 'lowest':
      return reviews.sort((a, b) => a.rating - b.rating)
    default:
      return reviews
  }
})

// Pagination
const reviewsPerPage = 5
const currentReviewPage = ref(1)

const totalReviewPages = computed(() => Math.ceil(sortedReviews.value.length / reviewsPerPage))

const paginatedReviews = computed(() => {
  const start = (currentReviewPage.value - 1) * reviewsPerPage
  return sortedReviews.value.slice(start, start + reviewsPerPage)
})

// Reset to page 1 when sort changes
watch(reviewSortBy, () => {
  currentReviewPage.value = 1
})

// Handle page change
const handleReviewPageChange = (page: number) => {
  currentReviewPage.value = page
}

// Calculate overall rating
const overallRating = computed(() => {
  if (allReviews.value.length === 0) return 0
  const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / allReviews.value.length).toFixed(1)
})

// Calculate rating distribution
const ratingDistribution = computed(() => {
  const total = allReviews.value.length
  if (total === 0) return []

  return [5, 4, 3, 2, 1].map(rating => {
    const count = allReviews.value.filter(r => r.rating === rating).length
    const percentage = Math.round((count / total) * 100)
    return { rating, count, percentage }
  })
})

// Contact form state
const fullName = ref<string | null>(null)
const email = ref<string | null>(null)
const phone = ref<string | null>(null)
const projectDetails = ref<string | null>(null)

const services = [
  {
    title: 'Driveway Replacement',
    description: 'Removal, re-grade, compact base, forms, control joints, broom finish.',
    badge: 'Popular',
    badgeVariant: 'blue-blue' as const
  },
  {
    title: 'Stamped / Colored Patio',
    description: 'Patterns & integral color with premium sealing.',
    badge: 'Decorative',
    badgeVariant: 'blue-blue' as const
  },
  {
    title: 'Monolithic Slabs & Foundations',
    description: 'Rebar per plan, vapor barrier, anchor bolts.',
    badge: 'Structural',
    badgeVariant: 'blue-blue' as const
  },
  {
    title: 'Repair & Lifting',
    description: 'Crack repair, slab section replacement, grinding trip hazards.',
    badge: 'Safety',
    badgeVariant: 'blue-blue' as const
  }
]

const serviceInfo = [
  {
    title: 'Service Areas',
    content: 'Houston, Bellaire, Memorial, Spring Branch, Katy'
  },
  {
    title: 'Lead Time',
    content: 'Site visits within 3–5 days; installs within 2–3 weeks.'
  },
  {
    title: 'Warranty',
    content: '1-year workmanship warranty; materials per manufacturer.'
  }
]

// Photo gallery data - varying dimensions to simulate real-world photos
const photos = [
  'https://placehold.co/800x600',
  'https://placehold.co/1200x800',
  'https://placehold.co/600x800',
  'https://placehold.co/1000x750',
  'https://placehold.co/900x600',
  'https://placehold.co/700x900',
  'https://placehold.co/1100x700',
  'https://placehold.co/800x1000',
  'https://placehold.co/950x650',
  'https://placehold.co/750x750',
  'https://placehold.co/1000x600',
  'https://placehold.co/650x850'
]

// Lightbox state
const isLightboxOpen = ref(false)
const selectedImageIndex = ref(0)

// Function to open lightbox at specific image
const openLightbox = (index: number) => {
  selectedImageIndex.value = index
  isLightboxOpen.value = true
}
</script>

<template>
  <div class="pb-20">
    <!-- Hero Section -->
    <section class="mb-8 rounded-3xl bg-[#F2F6FA] px-4 py-12 dark:bg-blue-900/20 sm:px-6 md:px-8 lg:px-12 xl:px-20">
      <div class="mb-6 px-0 sm:px-2 md:px-4 lg:px-8 xl:px-20">
        <Breadcrumbs :items="breadcrumbs" />
      </div>

      <div class="flex flex-col justify-between gap-8 px-0 sm:px-2 md:px-4 lg:flex-row lg:items-start lg:px-8 xl:px-20">
        <div class="space-y-4">
          <h1 class="font-heading text-3xl font-bold text-neutral-900 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            SolidStone Concrete LLC
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div class="flex items-center text-yellow-500">
              <span class="mr-1 text-lg font-bold">4.9</span>
              <div class="flex">
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
                <Icon name="heroicons:star-solid" class="h-4 w-4" />
              </div>
            </div>
            <span>(124)</span>
            <span class="mx-2">•</span>
            <span>Houston, TX</span>
            <span class="mx-2">•</span>
            <span>Since 2008</span>
            <span class="mx-2">•</span>
            <span>Licensed & Insured</span>
          </div>

          <p class="max-w-3xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
            Explore verified pros for driveways, patios, foundations, and decorative concrete.
            Compare services, reviews, and pricing—then contact your top choices with confidence.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-col">
          <Button
            text="Call (833) 555-1234"
            variant="primary-outline"
            class="whitespace-nowrap bg-white hover:bg-blue-50 dark:bg-transparent"
          />
          <Button
            text="Request a Quote"
            variant="primary"
            class="whitespace-nowrap"
          />
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-8 px-4 sm:px-6 md:px-8 lg:grid-cols-12 lg:px-12 xl:px-20">
      <!-- Sidebar -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Company Info Card -->
        <Card
          :step="1"
          heading="Company Info"
          padding="p-6"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <div class="mt-5 space-y-3 text-sm">
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Service Area:</span>
              <span class="text-neutral-600 dark:text-neutral-400">Greater Houston</span>
            </div>
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Hours:</span>
              <span class="text-neutral-600 dark:text-neutral-400">Mon-Sat · 8am-6pm</span>
            </div>
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">License:</span>
              <span class="text-neutral-600 dark:text-neutral-400">TX-CON-44210</span>
            </div>
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Insurance:</span>
              <span class="text-neutral-600 dark:text-neutral-400">$2M liability</span>
            </div>
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Website:</span>
              <a href="#" class="text-blue-500 hover:underline">solidstone.example</a>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <Badge text="Residential" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Light Commercial" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Warranty" variant="primary-outline" size="sm" class="rounded-full" />
            <Badge text="Free Estimates" variant="primary-outline" size="sm" class="rounded-full" />
          </div>

          <div class="mt-6">
            <Button
              text="Company Brochure (PDF)"
              variant="primary"
              class="justify-between"
              icon="heroicons:arrow-down-tray"
            />
          </div>
        </Card>

        <!-- Contact Card -->
        <Card
          :step="2"
          heading="Contact"
          padding="p-6"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <p class="mb-4 text-xs text-neutral-500">Replies within 24 hours</p>

          <form class="space-y-4" @submit.prevent>
            <TextInput
              v-model="fullName"
              type="text"
              placeholder="Full Name"
              size="md"
            />
            <TextInput
              v-model="email"
              type="email"
              placeholder="Email"
              size="md"
            />
            <TextInput
              v-model="phone"
              type="tel"
              placeholder="Phone"
              size="md"
            />
            <textarea
              v-model="projectDetails"
              placeholder="What Can We Build For You"
              rows="4"
              class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
            ></textarea>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button text="Send" variant="primary" class="w-full" />
            </div>
          </form>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-8">
        <!-- Tabs -->
        <div class="mb-8 flex flex-wrap gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'rounded-full px-6 py-2 text-sm font-bold transition-colors',
              activeTab === tab
                ? 'bg-blue-500 text-white dark:bg-blue-500'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <Card
          padding="p-8"
          class="space-y-8"
          :background-colors="['#ffffff', '#171717']"
          border-width="thick"
          :border-color="['#e5e7eb', '#404040']"
        >
          <!-- Overview Tab -->
          <div v-if="activeTab === 'Overview'" class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div class="space-y-6">
              <div>
                <h2 class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">About SolidStone</h2>
                <p class="text-sm text-neutral-500">Phoenix, AZ</p>
              </div>

              <div class="space-y-4 text-neutral-600 dark:text-neutral-300">
                <p>
                  SolidStone Concrete LLC builds driveways, patios, and structural slabs that stand up to Gulf Coast weather.
                  Our prep work, base, and reinforcement deliver clean lines, proper drainage, and long-lasting performance.
                </p>
                <div class="flex items-center gap-1 text-yellow-500">
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <Icon name="heroicons:star-solid" class="h-4 w-4" />
                  <span class="ml-1 text-neutral-600 dark:text-neutral-400">4.9 (88)</span>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">15+ yrs</div>
                  <div class="text-sm text-neutral-500">Experience</div>
                </div>
                <div class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="flex items-center justify-center gap-1 font-heading text-2xl font-bold text-neutral-900 dark:text-white">
                    4.9 <Icon name="heroicons:star-solid" class="h-5 w-5" />
                  </div>
                  <div class="text-sm text-neutral-500">Average Rating</div>
                </div>
              </div>
            </div>

            <div class="overflow-hidden rounded-2xl">
              <img
                :src="garageImage"
                alt="Garage interior"
                class="h-full w-full object-cover"
              >
            </div>
          </div>

          <!-- Products & Services Tab -->
          <div v-else-if="activeTab === 'Products & Services'" class="space-y-8">
            <!-- Services List -->
            <div class="space-y-6">
              <div
                v-for="service in services"
                :key="service.title"
                class="flex items-start justify-between gap-4 border-b border-neutral-200 pb-6 last:border-b-0 dark:border-neutral-700"
              >
                <div class="flex-1 space-y-2">
                  <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">
                    {{ service.title }}
                  </h3>
                  <p class="text-neutral-600 dark:text-neutral-400">
                    {{ service.description }}
                  </p>
                </div>
                <Badge
                  :text="service.badge"
                  :variant="service.badgeVariant"
                  size="sm"
                  class="shrink-0"
                />
              </div>
            </div>

            <!-- Service Info Cards -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div
                v-for="info in serviceInfo"
                :key="info.title"
                class="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50"
              >
                <h4 class="mb-3 text-lg font-bold text-neutral-900 dark:text-white">
                  {{ info.title }}
                </h4>
                <p class="text-neutral-600 dark:text-neutral-400">
                  {{ info.content }}
                </p>
              </div>
            </div>
          </div>

          <!-- Photos Tab -->
          <div v-else-if="activeTab === 'Photos'" class="space-y-6">
            <!-- Photo Grid -->
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div
                v-for="(photo, index) in photos"
                :key="index"
                @click="openLightbox(index)"
                class="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg dark:hover:border-blue-400"
              >
                <img
                  :src="photo"
                  :alt="`Photo ${index + 1}`"
                  class="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  loading="lazy"
                />
                <!-- Overlay on hover -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                  <Icon
                    name="heroicons:magnifying-glass-plus"
                    class="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>

            <!-- Lightbox -->
            <Lightbox
              v-model:open="isLightboxOpen"
              :images="photos"
              :initial-index="selectedImageIndex"
            />
          </div>

          <!-- Reviews Tab -->
          <div v-else-if="activeTab === 'Reviews'" class="space-y-8">
            <!-- Summary Header -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Overall Rating -->
              <div class="flex items-center gap-4">
                <div class="flex flex-col items-center rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
                  <span class="font-heading text-5xl font-bold text-neutral-900 dark:text-white">
                    {{ overallRating }}
                  </span>
                  <div class="mt-2 flex items-center gap-0.5">
                    <Icon
                      v-for="i in 5"
                      :key="i"
                      name="heroicons:star-solid"
                      class="h-5 w-5 text-yellow-400"
                    />
                  </div>
                  <span class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {{ allReviews.length }} reviews
                  </span>
                </div>
              </div>

              <!-- Rating Distribution -->
              <div class="space-y-2">
                <div
                  v-for="item in ratingDistribution"
                  :key="item.rating"
                  class="flex items-center gap-3"
                >
                  <span class="w-16 text-sm text-neutral-600 dark:text-neutral-400">
                    {{ item.rating }} stars
                  </span>
                  <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                    <div
                      class="h-full rounded-full bg-yellow-400 transition-all duration-300"
                      :style="{ width: `${item.percentage}%` }"
                    />
                  </div>
                  <span class="w-12 text-right text-sm text-neutral-500 dark:text-neutral-400">
                    {{ item.count }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Sorting Controls -->
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <span class="text-sm text-neutral-500 dark:text-neutral-400">
                Showing {{ paginatedReviews.length }} of {{ allReviews.length }} reviews
              </span>
              <div class="flex items-center gap-2">
                <span class="text-sm text-neutral-600 dark:text-neutral-400">Sort by:</span>
                <div class="flex gap-1">
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    type="button"
                    :class="[
                      'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                      reviewSortBy === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                    ]"
                    @click="reviewSortBy = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Review List -->
            <div class="space-y-6">
              <ReviewCard
                v-for="review in paginatedReviews"
                :key="review.id"
                :review="review"
              />
            </div>

            <!-- Pagination -->
            <div v-if="totalReviewPages > 1" class="pt-4">
              <Pagination
                :current-page="currentReviewPage"
                :total-pages="totalReviewPages"
                size="md"
                @update:current-page="handleReviewPageChange"
              />
            </div>
          </div>

          <!-- Fallback for other tabs -->
          <div v-else class="flex h-64 items-center justify-center text-neutral-500">
            Content for {{ activeTab }} tab coming soon...
          </div>
        </Card>
      </div>
    </div>

    <!-- Bottom CTA -->
    <ListingBottomCta />
  </div>
</template>

<style scoped>
/* Custom styles to match specific design tweaks */
</style>
