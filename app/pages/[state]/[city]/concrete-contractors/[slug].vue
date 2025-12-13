<script setup lang="ts">
import { toast } from 'vue-sonner'
import { getStateBySlug } from '~/utils/usStates'

/**
 * Contractor Profile Page
 * Route: /[state]/[city]/concrete-contractors/[slug]
 *
 * SEO-optimized URL with LocalBusiness schema
 */

definePageMeta({
  layout: 'default',
  validate: async (route) => {
    const stateSlug = route.params.state as string
    const state = getStateBySlug(stateSlug)
    return !!state
  }
})

const route = useRoute()
const stateSlug = computed(() => route.params.state as string)
const citySlug = computed(() => route.params.city as string)
const contractorSlug = computed(() => route.params.slug as string)

// Get state data
const stateData = computed(() => getStateBySlug(stateSlug.value))

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

// Breadcrumbs with SEO-optimized URLs
const breadcrumbs = computed(() => [
  { id: 'home', title: 'Home', full_path: '/' },
  { id: 'state', title: stateData.value?.name || '', full_path: `/${stateSlug.value}` },
  { id: 'city', title: `${contractor.value?.cityName} Contractors`, full_path: `/${stateSlug.value}/${citySlug.value}/concrete-contractors` },
  { id: 'contractor', title: contractor.value?.companyName || '', full_path: `/${stateSlug.value}/${citySlug.value}/concrete-contractors/${contractorSlug.value}` }
])

// Tabs
const tabs = ['Overview', 'Products & Services', 'Photos', 'Reviews']
const activeTab = ref('Overview')

// Supabase client for building storage URLs
const supabase = useSupabaseClient()

// Build image URL from storage path
function buildImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Get images from API response
const images = computed<string[]>(() => contractor.value?.images || [])
const heroImage = computed(() => images.value.length > 0 ? buildImageUrl(images.value[0]) : undefined)

// Get categories
const categories = computed(() => contractor.value?.categories || [])

// Get social links
const socialLinks = computed(() => contractor.value?.socialLinks || {})
const hasSocialLinks = computed(() => {
  const links = socialLinks.value
  return Object.values(links).some(v => v && v !== 'null')
})

// Get opening hours (stored as array of {day, hours} objects)
const openingHours = computed(() => contractor.value?.openingHours || [])

// Format opening hours for display
const formattedHours = computed(() => {
  const hours = openingHours.value
  // Handle array format: [{day: "Monday", hours: "7 AM to 7 PM"}, ...]
  if (Array.isArray(hours) && hours.length > 0) {
    const firstEntry = hours[0]
    if (firstEntry && typeof firstEntry === 'object' && 'hours' in firstEntry) {
      return firstEntry.hours
    }
  }
  // Handle empty or missing hours
  if (!hours || (Array.isArray(hours) && hours.length === 0)) {
    return 'Hours not available'
  }
  return 'Hours vary'
})

// Contact form state
const fullName = ref<string | null>(null)
const email = ref<string | null>(null)
const phone = ref<string | null>(null)
const projectDetails = ref<string | null>(null)

// Services computed from categories
const services = computed(() => {
  const cats = categories.value
  if (cats.length === 0) {
    return [{ title: 'Concrete Services', description: 'Professional concrete installation and repair.', badge: 'Popular', badgeVariant: 'blue-blue' as const }]
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
  { title: 'Service Area', content: `${contractor.value?.cityName}, ${contractor.value?.stateCode} area` },
  { title: 'Lead Time', content: 'Contact for availability' },
  { title: 'Warranty', content: 'Ask about warranty options' }
])

// Photo gallery
const photos = computed(() => images.value.map((path: string) => buildImageUrl(path)))

// Lightbox state
const isLightboxOpen = ref(false)
const selectedImageIndex = ref(0)
const openLightbox = (index: number) => {
  selectedImageIndex.value = index
  isLightboxOpen.value = true
}

// Reviews placeholder
const allReviews = ref<{ id: string; authorName: string; authorInitials: string; rating: number; date: string; title: string; content: string; verified: boolean; serviceType: string; helpful: number }[]>([])
const overallRating = computed(() => {
  if (allReviews.value.length === 0) return contractor.value?.rating?.toFixed(1) || '0.0'
  const sum = allReviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / allReviews.value.length).toFixed(1)
})

// Auth state for claim flow
const user = useSupabaseUser()
const isAuthenticated = computed(() => !!user.value?.id)
const authenticatedEmail = computed(() => user.value?.email || '')
const authenticatedName = computed(() => user.value?.user_metadata?.display_name || user.value?.user_metadata?.full_name || '')

// Claim business state
const showClaimDialog = ref(false)
const isSubmittingClaim = ref(false)
const claimSubmitted = ref(false)
const claimName = ref('')
const claimEmail = ref('')
const claimPhone = ref('')
const claimError = ref<string | null>(null)

// Email check state (for unauthenticated users)
const isCheckingEmail = ref(false)
const emailRequiresSignIn = ref(false)
const emailCheckMessage = ref<string | null>(null)

const openClaimDialog = () => {
  showClaimDialog.value = true
  claimError.value = null
  emailRequiresSignIn.value = false
  emailCheckMessage.value = null
  // Pre-fill for authenticated users
  if (isAuthenticated.value) {
    claimEmail.value = authenticatedEmail.value
    claimName.value = authenticatedName.value
  }
}

const closeClaimDialog = () => {
  showClaimDialog.value = false
  claimName.value = ''
  claimEmail.value = ''
  claimPhone.value = ''
  claimError.value = null
  emailRequiresSignIn.value = false
  emailCheckMessage.value = null
}

// Check if email has existing account (for unauthenticated users only)
const checkEmail = async () => {
  // Skip check for authenticated users - they're using their own email
  if (isAuthenticated.value) return
  // Skip if email is empty or invalid format
  const email = claimEmail.value.trim()
  if (!email || !email.includes('@')) return

  isCheckingEmail.value = true
  emailRequiresSignIn.value = false
  emailCheckMessage.value = null

  try {
    const response = await $fetch('/api/public/claims/check-email', {
      method: 'POST',
      body: { email },
    })

    if (response.requiresSignIn) {
      emailRequiresSignIn.value = true
      emailCheckMessage.value = response.message || 'Please sign in to claim this profile.'
    } else if (!response.canClaim) {
      claimError.value = response.message || 'Unable to process claim with this email.'
    }
  } catch {
    // Silently fail - don't block the user, server-side validation will catch issues
  } finally {
    isCheckingEmail.value = false
  }
}

const submitClaim = async () => {
  if (!contractor.value?.id) return
  if (!claimName.value.trim() || !claimEmail.value.trim()) {
    claimError.value = 'Name and email are required'
    return
  }
  // Block submission if email requires sign in
  if (emailRequiresSignIn.value) {
    claimError.value = 'Please sign in to claim this profile with your existing account.'
    return
  }
  isSubmittingClaim.value = true
  claimError.value = null
  try {
    const response = await $fetch('/api/public/claims', {
      method: 'POST',
      body: {
        contractorId: contractor.value.id,
        claimantName: claimName.value.trim(),
        claimantEmail: claimEmail.value.trim(),
        claimantPhone: claimPhone.value.trim() || undefined,
        isAuthenticated: isAuthenticated.value,
      },
    })
    claimSubmitted.value = true
    // Different success message for authenticated vs unauthenticated
    if (response.skipVerification) {
      toast.success('Your claim has been submitted and is awaiting admin review.')
    } else {
      toast.success('Please check your email to verify your claim.')
    }
    closeClaimDialog()
  } catch (err: unknown) {
    const error = err as { data?: { message?: string } }
    claimError.value = error.data?.message || 'Failed to submit claim. Please try again.'
  } finally {
    isSubmittingClaim.value = false
  }
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
            {{ contractor?.companyName }}
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div v-if="contractor?.rating" class="flex items-center text-yellow-500">
              <span class="mr-1 text-lg font-bold">{{ contractor.rating.toFixed(1) }}</span>
              <div class="flex">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" :class="['h-4 w-4', i <= Math.round(contractor.rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600']" />
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
          <Button v-if="contractor?.phone" :text="`Call ${contractor.phone}`" variant="primary-outline" class="whitespace-nowrap bg-white hover:bg-blue-50 dark:bg-transparent" />
          <Button text="Request a Quote" variant="primary" class="whitespace-nowrap" />
          <Button v-if="!contractor?.isClaimed && !claimSubmitted" text="Claim this Business" variant="ghost" class="whitespace-nowrap text-neutral-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400" @click="openClaimDialog" />
          <span v-else-if="claimSubmitted" class="text-center text-sm text-green-600 dark:text-green-400">✓ Claim submitted</span>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 gap-8 px-4 sm:px-6 md:px-8 lg:grid-cols-12 lg:px-12 xl:px-20">
      <!-- Sidebar -->
      <div class="space-y-6 lg:col-span-4">
        <!-- Company Info Card -->
        <Card :step="1" heading="Company Info" padding="p-6" :background-colors="['#ffffff', '#171717']" border-width="thick" :border-color="['#e5e7eb', '#404040']">
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
            <Badge v-for="cat in categories.slice(0, 4)" :key="cat" :text="cat" variant="primary-outline" size="sm" class="rounded-full" />
          </div>
          <!-- Social Links -->
          <div v-if="hasSocialLinks" class="mt-4 flex flex-wrap gap-3">
            <a v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="Facebook">
              <Icon name="ion:logo-facebook" class="size-5" />
            </a>
            <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="Instagram">
              <Icon name="ion:logo-instagram" class="size-5" />
            </a>
            <a v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="X (Twitter)">
              <Icon name="ion:logo-twitter" class="size-5" />
            </a>
            <a v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="LinkedIn">
              <Icon name="ion:logo-linkedin" class="size-5" />
            </a>
            <a v-if="socialLinks.youtube" :href="socialLinks.youtube" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="YouTube">
              <Icon name="ion:logo-youtube" class="size-5" />
            </a>
            <a v-if="socialLinks.yelp" :href="socialLinks.yelp" target="_blank" rel="noopener noreferrer" class="text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300" title="Yelp">
              <Icon name="ion:logo-yelp" class="size-5" />
            </a>
          </div>
        </Card>

        <!-- Contact Card -->
        <Card :step="2" heading="Contact" padding="p-6" :background-colors="['#ffffff', '#171717']" border-width="thick" :border-color="['#e5e7eb', '#404040']">
          <p class="mb-4 text-xs text-neutral-500">Replies within 24 hours</p>
          <form class="space-y-4" @submit.prevent>
            <TextInput v-model="fullName" type="text" placeholder="Full Name" size="md" />
            <TextInput v-model="email" type="email" placeholder="Email" size="md" />
            <TextInput v-model="phone" type="tel" placeholder="Phone" size="md" />
            <textarea v-model="projectDetails" placeholder="What Can We Build For You" rows="4" class="w-full rounded-lg border border-blue-200 bg-white px-4 py-3 text-sm placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800" />
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
          <button v-for="tab in tabs" :key="tab" type="button" :class="['rounded-full px-6 py-2 text-sm font-bold transition-colors', activeTab === tab ? 'bg-blue-500 text-white dark:bg-blue-500' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700']" @click="activeTab = tab">
            {{ tab }}
          </button>
        </div>

        <Card padding="p-8" class="space-y-8" :background-colors="['#ffffff', '#171717']" border-width="thick" :border-color="['#e5e7eb', '#404040']">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'Overview'" class="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div class="space-y-6">
              <div>
                <h2 class="font-heading text-2xl font-bold text-neutral-900 dark:text-white">About {{ contractor?.companyName }}</h2>
                <p class="text-sm text-neutral-500">{{ contractor?.cityName }}, {{ contractor?.stateCode }}</p>
              </div>
              <div class="space-y-4 text-neutral-600 dark:text-neutral-300">
                <p>{{ contractor?.description || 'No description available.' }}</p>
              </div>
            </div>
            <div v-if="heroImage" class="overflow-hidden rounded-2xl">
              <NuxtImg :src="heroImage" :alt="contractor?.companyName" class="h-full w-full object-cover" />
            </div>
            <div v-else class="flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <Icon name="heroicons:building-office-2" class="h-24 w-24 text-neutral-400" />
            </div>
          </div>

          <!-- Products & Services Tab -->
          <div v-else-if="activeTab === 'Products & Services'" class="space-y-8">
            <div class="space-y-6">
              <div v-for="service in services" :key="service.title" class="flex items-start justify-between gap-4 border-b border-neutral-200 pb-6 last:border-b-0 dark:border-neutral-700">
                <div class="flex-1 space-y-2">
                  <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">{{ service.title }}</h3>
                  <p class="text-neutral-600 dark:text-neutral-400">{{ service.description }}</p>
                </div>
                <Badge :text="service.badge" :variant="service.badgeVariant" size="sm" class="shrink-0" />
              </div>
            </div>
          </div>

          <!-- Photos Tab -->
          <div v-else-if="activeTab === 'Photos'" class="space-y-6">
            <div v-if="photos.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div v-for="(photo, index) in photos" :key="index" class="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg" @click="openLightbox(index)">
                <NuxtImg :src="photo" :alt="`Photo ${index + 1}`" class="h-full w-full object-cover" loading="lazy" />
              </div>
            </div>
            <div v-else class="flex h-64 flex-col items-center justify-center text-neutral-500">
              <Icon name="heroicons:photo" class="mb-4 h-16 w-16" />
              <p>No photos available</p>
            </div>
            <Lightbox v-if="photos.length > 0" v-model:open="isLightboxOpen" :images="photos" :initial-index="selectedImageIndex" />
          </div>

          <!-- Reviews Tab -->
          <div v-else-if="activeTab === 'Reviews'" class="space-y-8">
            <div v-if="contractor?.rating" class="flex flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-8 dark:border-neutral-700 dark:bg-neutral-800/50">
              <span class="font-heading text-6xl font-bold text-neutral-900 dark:text-white">{{ overallRating }}</span>
              <div class="mt-2 flex items-center gap-0.5">
                <Icon v-for="i in 5" :key="i" name="heroicons:star-solid" :class="['h-6 w-6', i <= Math.round(contractor.rating) ? 'text-yellow-400' : 'text-neutral-300 dark:text-neutral-600']" />
              </div>
              <span class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Based on {{ contractor?.reviewCount || 0 }} reviews</span>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Bottom CTA -->
    <ListingBottomCta />

    <!-- Claim Business Dialog -->
    <Dialog v-model:open="showClaimDialog" title="Claim this Business" description="Submit a claim to manage this business profile." size="md" :close-on-overlay-click="false" @close="closeClaimDialog">
      <form class="mt-4 space-y-4" @submit.prevent="submitClaim">
        <!-- Authenticated user notice -->
        <div v-if="isAuthenticated" class="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          <Icon name="heroicons:check-badge" class="mr-1.5 inline-block h-4 w-4" />
          You're signed in. Your claim will go directly to admin review.
        </div>

        <div v-if="claimError" class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{{ claimError }}</div>

        <!-- Email requires sign-in notice -->
        <div v-if="emailRequiresSignIn" class="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
          <p class="text-sm text-amber-700 dark:text-amber-300">
            <Icon name="heroicons:exclamation-triangle" class="mr-1.5 inline-block h-4 w-4" />
            {{ emailCheckMessage }}
          </p>
          <NuxtLink
            :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
            class="mt-2 inline-flex items-center gap-1 text-sm font-medium text-site-blue hover:underline"
          >
            Sign in to your account
            <Icon name="heroicons:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>

        <TextInput v-model="claimName" type="text" placeholder="Your Full Name *" size="md" :disabled="isSubmittingClaim" />

        <!-- Email: read-only for authenticated users -->
        <div v-if="isAuthenticated" class="space-y-1">
          <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
          <input
            type="email"
            :value="claimEmail"
            disabled
            class="w-full rounded-md border border-neutral-300 bg-neutral-100 px-3 py-2 text-neutral-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
          >
          <p class="text-xs text-neutral-500 dark:text-neutral-400">Using your account email</p>
        </div>
        <!-- Email with blur check for unauthenticated users -->
        <div v-else class="space-y-1">
          <div class="relative">
            <TextInput
              v-model="claimEmail"
              type="email"
              placeholder="Your Email Address *"
              size="md"
              :disabled="isSubmittingClaim"
              @blur="checkEmail"
            />
            <div v-if="isCheckingEmail" class="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon name="heroicons:arrow-path" class="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          </div>
        </div>

        <TextInput v-model="claimPhone" type="tel" placeholder="Phone Number (optional)" size="md" :disabled="isSubmittingClaim" />
      </form>
      <template #actions>
        <Button text="Cancel" variant="ghost" :disabled="isSubmittingClaim" @click="closeClaimDialog" />
        <Button text="Submit Claim" variant="primary" :disabled="isSubmittingClaim || emailRequiresSignIn || !claimName.trim() || !claimEmail.trim()" @click="submitClaim" />
      </template>
    </Dialog>
  </div>
</template>

