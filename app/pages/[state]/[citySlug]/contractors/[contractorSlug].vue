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
  address: contractor.value.address,
  latitude: contractor.value.lat,
  longitude: contractor.value.lng,
  images: contractor.value.metadata?.images || [],
  categories: contractor.value.metadata?.categories || []
})

// Get images from metadata
const images = computed(() => contractor.value?.metadata?.images || [])
const heroImage = computed(() => images.value[0]?.url)

// Get categories
const categories = computed(() => contractor.value?.metadata?.categories || [])

// Get social links
const socialLinks = computed(() => contractor.value?.metadata?.social_links || {})

// Format opening hours
const openingHours = computed(() => contractor.value?.metadata?.opening_hours || {})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-neutral-900">
    <!-- Hero Section -->
    <div class="relative h-64 bg-neutral-200 dark:bg-neutral-800 md:h-80">
      <NuxtImg
        v-if="heroImage"
        :src="heroImage"
        :alt="contractor?.companyName"
        class="h-full w-full object-cover"
      />
      <div v-else class="flex h-full items-center justify-center">
        <Icon name="heroicons:building-office-2" class="h-24 w-24 text-neutral-400" />
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="lg:grid lg:grid-cols-3 lg:gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- Header -->
          <header class="mb-6">
            <h1 class="font-heading text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
              {{ contractor?.companyName }}
            </h1>
            <p class="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
              {{ contractor?.cityName }}, {{ contractor?.stateCode }}
            </p>

            <!-- Rating -->
            <div v-if="contractor?.rating" class="mt-3 flex items-center gap-2">
              <div class="flex items-center">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  name="heroicons:star-solid"
                  :class="[
                    'h-5 w-5',
                    i <= Math.round(contractor.rating)
                      ? 'text-yellow-400'
                      : 'text-neutral-300 dark:text-neutral-600'
                  ]"
                />
              </div>
              <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {{ contractor.rating.toFixed(1) }}
              </span>
              <span v-if="contractor?.reviewCount" class="text-sm text-neutral-500">
                ({{ contractor.reviewCount }} reviews)
              </span>
            </div>
          </header>

          <!-- Categories/Services -->
          <div v-if="categories.length" class="mb-6 flex flex-wrap gap-2">
            <span
              v-for="cat in categories"
              :key="cat"
              class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {{ cat }}
            </span>
          </div>

          <!-- Description -->
          <div v-if="contractor?.description" class="prose prose-lg dark:prose-invert max-w-none">
            <h2>About {{ contractor.companyName }}</h2>
            <p>{{ contractor.description }}</p>
          </div>
        </div>

        <!-- Sidebar - Contact Info -->
        <aside class="mt-8 lg:mt-0">
          <div class="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <h3 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Contact Information</h3>

            <div class="space-y-4">
              <!-- Phone -->
              <a v-if="contractor?.phone" :href="`tel:${contractor.phone}`" class="flex items-center gap-3 text-blue-600 hover:underline dark:text-blue-400">
                <Icon name="heroicons:phone" class="h-5 w-5" />
                <span>{{ contractor.phone }}</span>
              </a>

              <!-- Email -->
              <a v-if="contractor?.email" :href="`mailto:${contractor.email}`" class="flex items-center gap-3 text-blue-600 hover:underline dark:text-blue-400">
                <Icon name="heroicons:envelope" class="h-5 w-5" />
                <span>{{ contractor.email }}</span>
              </a>

              <!-- Website -->
              <a v-if="contractor?.website" :href="contractor.website" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-blue-600 hover:underline dark:text-blue-400">
                <Icon name="heroicons:globe-alt" class="h-5 w-5" />
                <span>Visit Website</span>
              </a>

              <!-- Address -->
              <p v-if="contractor?.address" class="flex items-start gap-3 text-neutral-600 dark:text-neutral-400">
                <Icon name="heroicons:map-pin" class="mt-0.5 h-5 w-5 shrink-0" />
                <span>{{ contractor.address }}</span>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

