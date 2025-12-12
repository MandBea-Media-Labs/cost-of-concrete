<script setup lang="ts">
import { toast } from 'vue-sonner'
import ContractorEditForm from '~/components/owner/ContractorEditForm.vue'
import type { OwnerContractorFormData } from '~/schemas/owner/contractor-form.schema'

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
const contractorId = computed(() => route.params.id as string)

interface ServiceType {
  id: string
  name: string
  slug: string
}

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
  serviceTypes?: ServiceType[]
}

// Fetch contractor data
const { data, pending, error } = await useFetch<{ contractor: ContractorData }>(`/api/owner/contractors/${contractorId.value}`)

const contractor = computed(() => data.value?.contractor)

useSeoMeta({
  title: () => contractor.value ? `Edit ${contractor.value.companyName}` : 'Edit Business',
  robots: 'noindex, nofollow'
})

// Submission
const isSubmitting = ref(false)

async function handleSubmit(formData: OwnerContractorFormData) {
  isSubmitting.value = true

  try {
    await $fetch(`/api/owner/contractors/${contractorId.value}`, {
      method: 'PATCH',
      body: {
        companyName: formData.companyName || undefined,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        businessHours: formData.businessHours || null,
        socialLinks: formData.socialLinks || null,
        serviceTypeIds: formData.serviceTypeIds || [],
      }
    })

    toast.success('Profile Updated', {
      description: 'Your business profile has been saved successfully.'
    })

    await router.push('/owner')
  } catch (err: any) {
    const errorMessage = err.data?.message || err.message || 'Failed to save changes'
    toast.error('Update Failed', {
      description: errorMessage
    })
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/owner')
}
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
      <p class="text-destructive">
        {{ error.data?.message || 'Failed to load contractor. You may not have permission to edit this profile.' }}
      </p>
      <NuxtLink to="/owner" class="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <Icon name="heroicons:arrow-left" class="h-4 w-4" />
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Edit Form -->
    <div v-else-if="contractor">
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/owner" class="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <Icon name="heroicons:arrow-left" class="h-4 w-4" />
          Back to My Businesses
        </NuxtLink>
        <h1 class="text-2xl font-bold">
          Edit {{ contractor.companyName }}
        </h1>
        <p v-if="contractor.city" class="mt-1 text-sm text-muted-foreground">
          {{ contractor.city.name }}, {{ contractor.city.stateCode }}
        </p>
      </div>

      <!-- Form Component -->
      <div class="rounded-lg border border-border bg-card p-6">
        <ContractorEditForm
          :contractor="contractor"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

