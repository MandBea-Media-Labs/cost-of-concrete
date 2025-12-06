<script setup lang="ts">
/**
 * Contractor Profile Page
 * Route: /[citySlug]/contractors/[contractorSlug]
 *
 * Displays full contractor profile with contact info, ratings, images
 */

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const citySlug = computed(() => route.params.citySlug as string)
const contractorSlug = computed(() => route.params.contractorSlug as string)

// Fetch contractor data
const { data: contractor, error } = await useFetch(
  () => `/api/public/contractors/${citySlug.value}/${contractorSlug.value}`
)

// Apply SEO if contractor exists
if (contractor.value) {
  useContractorSeo({
    companyName: contractor.value.companyName,
    slug: contractor.value.slug,
    description: contractor.value.description,
    streetAddress: contractor.value.streetAddress,
    postalCode: contractor.value.postalCode,
    phone: contractor.value.phone,
    email: contractor.value.email,
    website: contractor.value.website,
    rating: contractor.value.rating,
    reviewCount: contractor.value.reviewCount,
    cityName: contractor.value.cityName,
    citySlug: contractor.value.citySlug,
    stateCode: contractor.value.stateCode,
    lat: contractor.value.lat,
    lng: contractor.value.lng,
    images: contractor.value.images,
    categories: contractor.value.categories,
    openingHours: contractor.value.openingHours
  })
}

// Star rating helper
const starRating = computed(() => {
  const rating = contractor.value?.rating || 0
  return {
    full: Math.floor(rating),
    half: rating % 1 >= 0.5 ? 1 : 0,
    empty: 5 - Math.ceil(rating)
  }
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-900">
    <!-- Error State -->
    <div v-if="error" class="flex min-h-[50vh] items-center justify-center px-4">
      <div class="text-center">
        <Icon name="heroicons:exclamation-circle" class="mx-auto h-16 w-16 text-red-500" />
        <h1 class="mt-4 text-2xl font-bold text-neutral-900 dark:text-white">
          Contractor Not Found
        </h1>
        <p class="mt-2 text-neutral-600 dark:text-neutral-400">
          We couldn't find a contractor matching your request.
        </p>
        <NuxtLink
          :to="`/${citySlug}`"
          class="mt-4 inline-block text-blue-600 hover:underline"
        >
          View all contractors in this area
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="contractor" class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        <NuxtLink to="/" class="hover:text-blue-600">Home</NuxtLink>
        <span class="mx-2">/</span>
        <NuxtLink :to="`/${contractor.citySlug}`" class="hover:text-blue-600">
          {{ contractor.cityName }}
        </NuxtLink>
        <span class="mx-2">/</span>
        <span class="text-neutral-900 dark:text-white">{{ contractor.companyName }}</span>
      </nav>

      <!-- Hero Section -->
      <div class="grid gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Image Gallery -->
          <div v-if="contractor.images?.length" class="mb-6">
            <div class="aspect-video overflow-hidden rounded-2xl">
              <img
                :src="contractor.images[0]?.url"
                :alt="contractor.companyName"
                class="h-full w-full object-cover"
              />
            </div>
            <div v-if="contractor.images.length > 1" class="mt-4 grid grid-cols-4 gap-2">
              <div
                v-for="(img, idx) in contractor.images.slice(1, 5)"
                :key="idx"
                class="aspect-square overflow-hidden rounded-lg"
              >
                <img :src="img.url" :alt="`${contractor.companyName} ${idx + 2}`" class="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Company Name & Rating -->
          <h1 class="font-heading text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
            {{ contractor.companyName }}
          </h1>

          <!-- Rating -->
          <div v-if="contractor.rating" class="mt-3 flex items-center gap-2">
            <div class="flex items-center gap-0.5">
              <Icon v-for="i in starRating.full" :key="`f-${i}`" name="heroicons:star-solid" class="h-5 w-5 text-yellow-400" />
              <Icon v-if="starRating.half" name="heroicons:star-solid" class="h-5 w-5 text-yellow-400 opacity-50" />
              <Icon v-for="i in starRating.empty" :key="`e-${i}`" name="heroicons:star" class="h-5 w-5 text-neutral-300" />
            </div>
            <span class="font-semibold text-neutral-900 dark:text-white">{{ contractor.rating.toFixed(1) }}</span>
            <span class="text-neutral-500">({{ contractor.reviewCount }} reviews)</span>
          </div>

          <!-- Location -->
          <p class="mt-3 flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Icon name="heroicons:map-pin" class="h-5 w-5" />
            {{ contractor.streetAddress }}, {{ contractor.cityName }}, {{ contractor.stateCode }} {{ contractor.postalCode }}
          </p>

          <!-- Description -->
          <div v-if="contractor.description" class="mt-6">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white">About</h2>
            <p class="mt-2 whitespace-pre-line text-neutral-600 dark:text-neutral-300">
              {{ contractor.description }}
            </p>
          </div>

          <!-- Categories -->
          <div v-if="contractor.categories?.length" class="mt-6">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Services</h2>
            <div class="mt-2 flex flex-wrap gap-2">
              <span v-for="cat in contractor.categories" :key="cat" class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {{ cat }}
              </span>
            </div>
          </div>
        </div>

        <!-- Contact Sidebar -->
        <div class="lg:col-span-1">
          <div class="sticky top-24 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
            <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Contact</h2>

            <!-- Phone -->
            <a
              v-if="contractor.phone"
              :href="`tel:${contractor.phone}`"
              class="mt-4 flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white transition hover:bg-blue-700"
            >
              <Icon name="heroicons:phone" class="h-5 w-5" />
              <span class="font-medium">{{ contractor.phone }}</span>
            </a>

            <!-- Website -->
            <a
              v-if="contractor.website"
              :href="contractor.website"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-3 flex items-center gap-3 rounded-lg border border-neutral-300 px-4 py-3 text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700"
            >
              <Icon name="heroicons:globe-alt" class="h-5 w-5" />
              <span class="font-medium">Visit Website</span>
            </a>

            <!-- Email -->
            <a
              v-if="contractor.email"
              :href="`mailto:${contractor.email}`"
              class="mt-3 flex items-center gap-3 rounded-lg border border-neutral-300 px-4 py-3 text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-600 dark:text-white dark:hover:bg-neutral-700"
            >
              <Icon name="heroicons:envelope" class="h-5 w-5" />
              <span class="font-medium">Send Email</span>
            </a>

            <!-- Address -->
            <div class="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <h3 class="font-medium text-neutral-900 dark:text-white">Address</h3>
              <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {{ contractor.streetAddress }}<br />
                {{ contractor.cityName }}, {{ contractor.stateCode }} {{ contractor.postalCode }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

