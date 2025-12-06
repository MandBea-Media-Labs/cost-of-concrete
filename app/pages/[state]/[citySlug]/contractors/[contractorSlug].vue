<script setup lang="ts">
/**
 * Contractor Profile Page
 * Route: /[state]/[citySlug]/contractors/[contractorSlug]
 *
 * Displays detailed contractor information with SEO-optimized LocalBusiness schema
 */

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const stateCode = computed(() => (route.params.state as string).toUpperCase())
const citySlug = computed(() => route.params.citySlug as string)
const contractorSlug = computed(() => route.params.contractorSlug as string)

// Fetch contractor data
const { data: contractor, error } = await useFetch(
  () => `/api/public/contractors/${citySlug.value}/${contractorSlug.value}`
)

// 404 if not found
if (error.value || !contractor.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Contractor Not Found',
    message: `The contractor "${contractorSlug.value}" was not found in ${citySlug.value}.`
  })
}

// Apply SEO with LocalBusiness schema
useContractorSeo({
  companyName: contractor.value.companyName,
  slug: contractor.value.slug,
  cityName: contractor.value.cityName,
  citySlug: citySlug.value,
  stateCode: contractor.value.stateCode,
  description: contractor.value.description,
  rating: contractor.value.rating,
  reviewCount: contractor.value.reviewCount,
  phone: contractor.value.phone,
  email: contractor.value.email,
  website: contractor.value.website,
  address: contractor.value.streetAddress,
  latitude: contractor.value.lat,
  longitude: contractor.value.lng,
  images: contractor.value.images || [],
  categories: contractor.value.categories || []
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  { id: 'state', title: contractor.value?.stateCode || '', full_path: `/${stateCode.value.toLowerCase()}` },
  { id: 'city', title: contractor.value?.cityName || '', full_path: `/${stateCode.value.toLowerCase()}/${citySlug.value}` },
  { id: 'contractor', title: contractor.value?.companyName || '', full_path: `/${stateCode.value.toLowerCase()}/${citySlug.value}/contractors/${contractorSlug.value}` }
])

// Tabs
const tabs = ['Overview', 'Products & Services', 'Photos', 'Reviews']
const activeTab = ref('Overview')

// Supabase client for building storage URLs
const supabase = useSupabaseClient()

// Build image URL from storage path (images are stored as paths like "placeId/hash.jpg")
function buildImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Get images from API response (stored as string paths, not objects)
const images = computed<string[]>(() => contractor.value?.images || [])
const heroImage = computed(() => images.value.length > 0 ? buildImageUrl(images.value[0]) : undefined)

// Get categories
const categories = computed(() => contractor.value?.categories || [])

// Get opening hours
const openingHours = computed(() => contractor.value?.openingHours || {})

// Format opening hours for display
const formattedHours = computed(() => {
  const hours = openingHours.value
  if (!hours || Object.keys(hours).length === 0) return 'Hours not available'
  // Return first available hours or default
  const firstDay = Object.entries(hours)[0]
  if (firstDay && firstDay[1]) {
    return `${firstDay[1]}`
  }
  return 'Hours vary'
})

// Contact form state
const fullName = ref<string | null>(null)
const email = ref<string | null>(null)
const phone = ref<string | null>(null)
const projectDetails = ref<string | null>(null)

// Services placeholder (would come from API in production)
const services = computed(() => {
  const cats = categories.value
  if (cats.length === 0) {
    return [
      { title: 'Concrete Services', description: 'Professional concrete installation and repair.', badge: 'Popular', badgeVariant: 'blue-blue' as const }
    ]
  }
  return cats.slice(0, 4).map((cat: string, index: number) => ({
    title: cat,
    description: `Professional ${cat.toLowerCase()} services with quality craftsmanship.`,
    badge: index === 0 ? 'Popular' : 'Service',
    badgeVariant: 'blue-blue' as const
  }))
})

// Service info cards
const serviceInfo = computed(() => [
  {
    title: 'Service Area',
    content: `${contractor.value?.cityName}, ${contractor.value?.stateCode} area`
  },
  {
    title: 'Lead Time',
    content: 'Contact for availability'
  },
  {
    title: 'Warranty',
    content: 'Ask about warranty options'
  }
])

// Photo gallery - build full URLs from storage paths
const photos = computed(() => {
  return images.value.map((path: string) => buildImageUrl(path))
})

// Lightbox state
const isLightboxOpen = ref(false)
const selectedImageIndex = ref(0)

const openLightbox = (index: number) => {
  selectedImageIndex.value = index
  isLightboxOpen.value = true
}

// Reviews placeholder (would come from API in production)
const allReviews = ref<{ id: string; authorName: string; authorInitials: string; rating: number; date: string; title: string; content: string; verified: boolean; serviceType: string; helpful: number }[]>([])

// Reviews logic
type ReviewSortOption = 'recent' | 'highest' | 'lowest'
const reviewSortBy = ref<ReviewSortOption>('recent')

const sortOptions: { value: ReviewSortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' }
]

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

const reviewsPerPage = 5
const currentReviewPage = ref(1)
const totalReviewPages = computed(() => Math.ceil(sortedReviews.value.length / reviewsPerPage))

const paginatedReviews = computed(() => {
  const start = (currentReviewPage.value - 1) * reviewsPerPage
  return sortedReviews.value.slice(start, start + reviewsPerPage)
})

watch(reviewSortBy, () => {
  currentReviewPage.value = 1
})

const handleReviewPageChange = (page: number) => {
  currentReviewPage.value = page
}

const overallRating = computed(() => {
  if (allReviews.value.length === 0) return contractor.value?.rating?.toFixed(1) || '0.0'
  const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / allReviews.value.length).toFixed(1)
})

const ratingDistribution = computed(() => {
  const total = allReviews.value.length
  if (total === 0) return []
  return [5, 4, 3, 2, 1].map(rating => {
    const count = allReviews.value.filter(r => r.rating === rating).length
    const percentage = Math.round((count / total) * 100)
    return { rating, count, percentage }
  })
})
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
            {{ contractor?.companyName }}
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div v-if="contractor?.rating" class="flex items-center text-yellow-500">
              <span class="mr-1 text-lg font-bold">{{ contractor.rating.toFixed(1) }}</span>
              <div class="flex">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  name="heroicons:star-solid"
                  :class="['h-4 w-4', i <= Math.round(contractor.rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600']"
                />
              </div>
            </div>
            <span v-if="contractor?.reviewCount">({{ contractor.reviewCount }})</span>
            <span class="mx-2">•</span>
            <span>{{ contractor?.cityName }}, {{ contractor?.stateCode }}</span>
          </div>

          <p v-if="contractor?.description" class="max-w-3xl text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
            {{ contractor.description }}
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-col">
          <Button
            v-if="contractor?.phone"
            :text="`Call ${contractor.phone}`"
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
              <span class="text-neutral-600 dark:text-neutral-400">{{ contractor?.cityName }}, {{ contractor?.stateCode }}</span>
            </div>
            <div class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Hours:</span>
              <span class="text-neutral-600 dark:text-neutral-400">{{ formattedHours }}</span>
            </div>
            <div v-if="contractor?.website" class="grid grid-cols-[90px_1fr] gap-2 sm:grid-cols-[100px_1fr]">
              <span class="font-bold text-neutral-900 dark:text-white">Website:</span>
              <a :href="contractor.website" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">
                {{ contractor.website.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
              </a>
            </div>
          </div>

          <div v-if="categories.length" class="mt-4 flex flex-wrap gap-2">
            <Badge
              v-for="cat in categories.slice(0, 4)"
              :key="cat"
              :text="cat"
              variant="primary-outline"
              size="sm"
              class="rounded-full"
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
            />

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
            type="button"
            :class="[
              'rounded-full px-6 py-2 text-sm font-bold transition-colors',
              activeTab === tab
                ? 'bg-blue-500 text-white dark:bg-blue-500'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
            ]"
            @click="activeTab = tab"
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
                <h2 class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">About {{ contractor?.companyName }}</h2>
                <p class="text-sm text-neutral-500">{{ contractor?.cityName }}, {{ contractor?.stateCode }}</p>
              </div>

              <div class="space-y-4 text-neutral-600 dark:text-neutral-300">
                <p>{{ contractor?.description || 'No description available.' }}</p>
                <div v-if="contractor?.rating" class="flex items-center gap-1 text-yellow-500">
                  <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="h-4 w-4" />
                  <span class="ml-1 text-neutral-600 dark:text-neutral-400">{{ contractor.rating.toFixed(1) }} ({{ contractor?.reviewCount || 0 }})</span>
                </div>
              </div>

              <div class="flex gap-4">
                <div v-if="contractor?.reviewCount" class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">{{ contractor.reviewCount }}</div>
                  <div class="text-sm text-neutral-500">Reviews</div>
                </div>
                <div v-if="contractor?.rating" class="rounded-2xl border border-neutral-200 p-4 text-center dark:border-neutral-700">
                  <div class="flex items-center justify-center gap-1 font-heading text-2xl font-bold text-neutral-900 dark:text-white">
                    {{ contractor.rating.toFixed(1) }} <Icon name="heroicons:star-solid" class="h-5 w-5" />
                  </div>
                  <div class="text-sm text-neutral-500">Average Rating</div>
                </div>
              </div>
            </div>

            <div v-if="heroImage" class="overflow-hidden rounded-2xl">
              <NuxtImg
                :src="heroImage"
                :alt="contractor?.companyName"
                class="h-full w-full object-cover"
              />
            </div>
            <div v-else class="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <Icon name="heroicons:building-office-2" class="h-24 w-24 text-neutral-400" />
            </div>
          </div>

          <!-- Products & Services Tab -->
          <div v-else-if="activeTab === 'Products & Services'" class="space-y-8">
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
            <div v-if="photos.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div
                v-for="(photo, index) in photos"
                :key="index"
                class="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 border-transparent transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:shadow-lg dark:hover:border-blue-400"
                @click="openLightbox(index)"
              >
                <NuxtImg
                  :src="photo"
                  :alt="`Photo ${index + 1}`"
                  class="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  loading="lazy"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
                  <Icon
                    name="heroicons:magnifying-glass-plus"
                    class="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
              </div>
            </div>
            <div v-else class="flex h-64 flex-col items-center justify-center text-neutral-500">
              <Icon name="heroicons:photo" class="mb-4 h-16 w-16" />
              <p>No photos available</p>
            </div>

            <Lightbox
              v-if="photos.length > 0"
              v-model:open="isLightboxOpen"
              :images="photos"
              :initial-index="selectedImageIndex"
            />
          </div>

          <!-- Reviews Tab -->
          <div v-else-if="activeTab === 'Reviews'" class="space-y-8">
            <div v-if="allReviews.length > 0">
              <!-- Summary Header -->
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div class="flex items-center gap-4">
                  <div class="flex flex-col items-center rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
                    <span class="font-heading text-5xl font-bold text-neutral-900 dark:text-white">
                      {{ overallRating }}
                    </span>
                    <div class="mt-2 flex items-center gap-0.5">
                      <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" class="h-5 w-5 text-yellow-400" />
                    </div>
                    <span class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {{ allReviews.length }} reviews
                    </span>
                  </div>
                </div>

                <div class="space-y-2">
                  <div v-for="item in ratingDistribution" :key="item.rating" class="flex items-center gap-3">
                    <span class="w-16 text-sm text-neutral-600 dark:text-neutral-400">{{ item.rating }} stars</span>
                    <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                      <div class="h-full rounded-full bg-yellow-400 transition-all duration-300" :style="{ width: `${item.percentage}%` }" />
                    </div>
                    <span class="w-12 text-right text-sm text-neutral-500 dark:text-neutral-400">{{ item.count }}</span>
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
                <ReviewCard v-for="review in paginatedReviews" :key="review.id" :review="review" />
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

            <!-- No individual reviews - show rating summary -->
            <div v-else class="space-y-8">
              <!-- Rating Summary Card -->
              <div v-if="contractor?.rating" class="flex flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800/50">
                <div class="flex items-center gap-4">
                  <div class="flex flex-col items-center">
                    <span class="font-heading text-6xl font-bold text-neutral-900 dark:text-white">
                      {{ contractor.rating.toFixed(1) }}
                    </span>
                    <div class="mt-2 flex items-center gap-0.5">
                      <Icon
                        v-for="i in 5"
                        :key="i"
                        name="heroicons:star-solid"
                        :class="['h-6 w-6', i <= Math.round(contractor.rating) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600']"
                      />
                    </div>
                    <span class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      Based on {{ contractor?.reviewCount || 0 }} reviews
                    </span>
                  </div>
                </div>
              </div>

              <!-- Message -->
              <div class="flex flex-col items-center justify-center py-8 text-center text-neutral-500">
                <Icon name="heroicons:chat-bubble-left-right" class="mb-4 h-12 w-12" />
                <p class="text-lg font-medium">Individual reviews coming soon</p>
                <p class="mt-2 max-w-md text-sm">
                  We're working on bringing detailed customer reviews to this page. In the meantime, you can contact the contractor directly for references.
                </p>
              </div>
            </div>
          </div>

          <!-- Fallback -->
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
/* Custom styles for contractor detail page */
</style>
