<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { consola } from 'consola'
import type { ContractorFormData } from '~/schemas/admin/contractor-form.schema'
import type { ContractorWithCity } from '~/composables/useAdminContractors'

// Page metadata
definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Edit Contractor - Admin',
})

// State
const route = useRoute()
const router = useRouter()
const toast = useToast()
const supabase = useSupabaseClient()

const contractorId = computed(() => route.params.id as string)
const contractor = ref<ContractorWithCity | null>(null)
const loading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Fetch contractor data
async function fetchContractor() {
  try {
    loading.value = true
    const response = await $fetch<{ success: boolean; data: ContractorWithCity }>(`/api/contractors/${contractorId.value}`)

    if (response.success && response.data) {
      contractor.value = response.data
    } else {
      throw new Error('Contractor not found')
    }
  } catch (error: any) {
    if (import.meta.dev) {
      consola.error('[EditContractor] Error fetching:', error)
    }
    toast.error('Contractor not found')
    router.push('/admin/contractors')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContractor()
})

// Map contractor data to form initial values
const initialFormData = computed<Partial<ContractorFormData> | undefined>(() => {
  if (!contractor.value) return undefined

  const metadata = contractor.value.metadata as Record<string, any> || {}

  return {
    companyName: contractor.value.company_name,
    slug: contractor.value.slug,
    cityId: contractor.value.city_id,
    streetAddress: contractor.value.street_address || '',
    postalCode: contractor.value.postal_code || '',
    phone: contractor.value.phone || '',
    website: contractor.value.website || '',
    email: contractor.value.email || '',
    description: contractor.value.description || '',
    status: contractor.value.status as 'pending' | 'active' | 'suspended',
    categories: metadata.categories || [],
    socialLinks: metadata.social_links || { facebook: '', instagram: '', youtube: '', linkedin: '' },
    openingHours: metadata.opening_hours || null,
    googlePlaceId: contractor.value.google_place_id,
    googleCid: contractor.value.google_cid,
  }
})

// Image data from metadata
const contractorImages = computed<string[]>(() => {
  if (!contractor.value) return []
  const metadata = contractor.value.metadata as Record<string, any> || {}
  return metadata.images || []
})

const primaryImage = computed<string | null>(() => {
  if (!contractor.value) return null
  const metadata = contractor.value.metadata as Record<string, any> || {}
  return metadata.primary_image || (metadata.images?.[0] || null)
})

const googlePlaceId = computed<string | null>(() => {
  return contractor.value?.google_place_id || null
})

/**
 * Map form data to API input format
 */
function mapFormDataToApiInput(formData: ContractorFormData) {
  return {
    companyName: formData.companyName,
    slug: formData.slug || undefined,
    cityId: formData.cityId || null,
    streetAddress: formData.streetAddress || null,
    postalCode: formData.postalCode || null,
    phone: formData.phone || null,
    website: formData.website || null,
    email: formData.email || null,
    description: formData.description || null,
    status: formData.status,
    categories: formData.categories?.length ? formData.categories : [],
    socialLinks: formData.socialLinks || null,
    openingHours: formData.openingHours || null,
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(formData: ContractorFormData) {
  try {
    isSubmitting.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info('[EditContractor] Submitting:', formData)
    }

    const apiInput = mapFormDataToApiInput(formData)

    await $fetch(`/api/contractors/${contractorId.value}`, {
      method: 'PATCH',
      body: apiInput,
    })

    if (import.meta.dev) {
      consola.success('[EditContractor] Contractor updated successfully')
    }

    toast.success('Contractor updated successfully!')
    router.push('/admin/contractors')
  } catch (error: any) {
    if (import.meta.dev) {
      consola.error('[EditContractor] Error:', error)
    }

    const errorMsg = error.data?.message || error.message || 'Failed to update contractor'
    errorMessage.value = errorMsg
    toast.error('Failed to update contractor', { message: errorMsg })
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  router.push('/admin/contractors')
}

/**
 * Handle setting primary image
 */
async function handleSetPrimaryImage(path: string) {
  if (!contractor.value) return

  try {
    const metadata = (contractor.value.metadata as Record<string, any>) || {}
    await $fetch(`/api/contractors/${contractorId.value}`, {
      method: 'PATCH',
      body: {
        metadata: {
          ...metadata,
          primary_image: path,
        },
      },
    })
    toast.success('Primary image updated')
  } catch (error) {
    if (import.meta.dev) {
      consola.error('[EditContractor] Failed to set primary image:', error)
    }
    toast.error('Failed to update primary image')
  }
}

/**
 * Handle deleting an image
 */
async function handleDeleteImage(path: string) {
  if (!contractor.value) return

  try {
    // Delete from Supabase storage first
    const { error: storageError } = await supabase.storage
      .from('contractors')
      .remove([path])

    if (storageError) {
      if (import.meta.dev) {
        consola.warn('[EditContractor] Storage delete warning:', storageError)
      }
      // Continue anyway - file may already be deleted or not exist
    }

    const metadata = (contractor.value.metadata as Record<string, any>) || {}
    const currentImages = metadata.images || []
    const updatedImages = currentImages.filter((img: string) => img !== path)

    // If deleting the primary image, set new primary to first remaining image
    let updatedPrimaryImage = metadata.primary_image
    if (metadata.primary_image === path) {
      updatedPrimaryImage = updatedImages[0] || null
    }

    await $fetch(`/api/contractors/${contractorId.value}`, {
      method: 'PATCH',
      body: {
        metadata: {
          ...metadata,
          images: updatedImages,
          primary_image: updatedPrimaryImage,
        },
      },
    })

    // Update local state
    if (contractor.value) {
      contractor.value = {
        ...contractor.value,
        metadata: {
          ...metadata,
          images: updatedImages,
          primary_image: updatedPrimaryImage,
        },
      }
    }

    toast.success('Image deleted')
  } catch (error) {
    if (import.meta.dev) {
      consola.error('[EditContractor] Failed to delete image:', error)
    }
    toast.error('Failed to delete image')
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="flex flex-col items-center gap-3">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading contractor...</p>
        </div>
      </div>

      <template v-else-if="contractor">
        <!-- Breadcrumbs -->
        <AdminBreadcrumbs
          :items="[
            { label: 'Admin', href: '/admin' },
            { label: 'Contractors', href: '/admin/contractors' },
            { label: contractor.company_name, href: `/admin/contractors/${contractor.id}/edit` },
          ]"
          class="mb-6"
        />

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Edit Contractor</h1>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Update contractor profile details</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:exclamation-circle" class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div class="flex-1">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error Updating Contractor</h3>
              <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
            </div>
            <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200" @click="errorMessage = null">
              <Icon name="heroicons:x-mark" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Form Card -->
        <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <ContractorForm
            :initial-data="initialFormData"
            :is-edit-mode="true"
            :is-submitting="isSubmitting"
            :images="contractorImages"
            :primary-image="primaryImage"
            :google-place-id="googlePlaceId"
            @submit="handleSubmit"
            @cancel="handleCancel"
            @set-primary-image="handleSetPrimaryImage"
            @delete-image="handleDeleteImage"
          />
        </div>
      </template>
    </div>
  </div>
</template>

