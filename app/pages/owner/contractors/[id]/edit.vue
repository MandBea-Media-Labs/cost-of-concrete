<script setup lang="ts">
/**
 * Owner Contractor Edit Page
 *
 * Allows business owners to edit their claimed contractor profile.
 */

definePageMeta({
  layout: 'owner'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()
const contractorId = computed(() => route.params.id as string)

interface ContractorData {
  id: string
  companyName: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  streetAddress: string | null
  postalCode: string | null
  metadata: Record<string, any> | null
  city: {
    name: string
    slug: string
    stateCode: string
  } | null
}

// Fetch contractor data
const { data, pending, error } = await useFetch<{ contractor: ContractorData }>(`/api/owner/contractors/${contractorId.value}`)

const contractor = computed(() => data.value?.contractor)

useSeoMeta({
  title: () => contractor.value ? `Edit ${contractor.value.companyName}` : 'Edit Business',
  robots: 'noindex, nofollow'
})

// Form state
const form = reactive({
  companyName: '',
  description: '',
  phone: '',
  email: '',
  website: '',
  streetAddress: '',
  postalCode: '',
})

// Initialize form with contractor data
watch(contractor, (c) => {
  if (c) {
    form.companyName = c.companyName || ''
    form.description = c.description || ''
    form.phone = c.phone || ''
    form.email = c.email || ''
    form.website = c.website || ''
    form.streetAddress = c.streetAddress || ''
    form.postalCode = c.postalCode || ''
  }
}, { immediate: true })

// Submission
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

async function handleSubmit() {
  isSubmitting.value = true
  submitError.value = null

  try {
    await $fetch(`/api/owner/contractors/${contractorId.value}`, {
      method: 'PATCH',
      body: {
        companyName: form.companyName || undefined,
        description: form.description || null,
        phone: form.phone || null,
        email: form.email || null,
        website: form.website || null,
        streetAddress: form.streetAddress || null,
        postalCode: form.postalCode || null,
      }
    })

    toast.success('Profile Updated', {
      message: 'Your business profile has been saved successfully.'
    })

    await router.push('/owner')
  } catch (err: any) {
    submitError.value = err.data?.message || err.message || 'Failed to save changes'
    toast.error('Update Failed', {
      message: submitError.value
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        {{ error.data?.message || 'Failed to load contractor. You may not have permission to edit this profile.' }}
      </p>
      <Button text="Back to Dashboard" variant="secondary-outline" size="sm" location="/owner" class="mt-4" />
    </div>

    <!-- Edit Form -->
    <div v-else-if="contractor">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <NuxtLink to="/owner" class="mb-2 flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400">
            <Icon name="heroicons:arrow-left" class="h-4 w-4" />
            Back to My Businesses
          </NuxtLink>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Edit {{ contractor.companyName }}
          </h1>
          <p v-if="contractor.city" class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {{ contractor.city.name }}, {{ contractor.city.stateCode }}
          </p>
        </div>
      </div>

      <!-- Form -->
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Error Message -->
        <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p class="text-sm text-red-600 dark:text-red-400">{{ submitError }}</p>
        </div>

        <!-- Basic Info Card -->
        <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Basic Information</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Company Name</label>
              <input
                v-model="form.companyName"
                type="text"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="Tell customers about your business..."
              />
            </div>
          </div>
        </div>

        <!-- Contact Info Card -->
        <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Website</label>
              <input
                v-model="form.website"
                type="url"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                placeholder="https://"
              />
            </div>
          </div>
        </div>

        <!-- Address Card -->
        <div class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
          <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Address</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Street Address</label>
              <input
                v-model="form.streetAddress"
                type="text"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Postal Code</label>
              <input
                v-model="form.postalCode"
                type="text"
                class="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
          <Button text="Cancel" variant="secondary-outline" location="/owner" />
          <Button
            :text="isSubmitting ? 'Saving...' : 'Save Changes'"
            type="submit"
            :disabled="isSubmitting"
          />
        </div>
      </form>
    </div>
  </div>
</template>

