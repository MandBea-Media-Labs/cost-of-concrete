<script setup lang="ts">
import { ref } from 'vue'
import { consola } from 'consola'
import type { ContractorFormData } from '~/schemas/admin/contractor-form.schema'

// Page metadata
definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'Add Contractor - Admin',
})

// State
const router = useRouter()
const toast = useToast()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

/**
 * Map form data to API input format
 */
function mapFormDataToApiInput(formData: ContractorFormData) {
  return {
    companyName: formData.companyName,
    slug: formData.slug || undefined,
    cityId: formData.cityId || undefined,
    streetAddress: formData.streetAddress || undefined,
    postalCode: formData.postalCode || undefined,
    phone: formData.phone || undefined,
    website: formData.website || undefined,
    email: formData.email || undefined,
    description: formData.description || undefined,
    status: formData.status,
    categories: formData.categories?.length ? formData.categories : undefined,
    socialLinks: formData.socialLinks || undefined,
    openingHours: formData.openingHours || undefined,
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
      consola.info('[NewContractor] Submitting:', formData)
    }

    const apiInput = mapFormDataToApiInput(formData)

    await $fetch('/api/contractors', {
      method: 'POST',
      body: apiInput,
    })

    if (import.meta.dev) {
      consola.success('[NewContractor] Contractor created successfully')
    }

    toast.success('Contractor created successfully!')
    router.push('/admin/contractors')
  } catch (error: any) {
    if (import.meta.dev) {
      consola.error('[NewContractor] Error:', error)
    }

    const errorMsg = error.data?.message || error.message || 'Failed to create contractor'
    errorMessage.value = errorMsg
    toast.error('Failed to create contractor', { message: errorMsg })
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
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <AdminBreadcrumbs
        :items="[
          { label: 'Admin', href: '/admin' },
          { label: 'Contractors', href: '/admin/contractors' },
          { label: 'Add Contractor', href: '/admin/contractors/new' },
        ]"
        class="mb-6"
      />

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Add Contractor</h1>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Create a new contractor profile manually</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:exclamation-circle" class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error Creating Contractor</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</p>
          </div>
          <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200" @click="errorMessage = null">
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Form Card -->
      <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <ContractorForm :is-submitting="isSubmitting" @submit="handleSubmit" @cancel="handleCancel" />
      </div>
    </div>
  </div>
</template>

