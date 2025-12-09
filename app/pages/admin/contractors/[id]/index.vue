<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { consola } from 'consola'
import { toast } from 'vue-sonner'
import type { ContractorWithCity } from '~/composables/useAdminContractors'

// Page metadata
definePageMeta({
  layout: 'admin',
})

useHead({
  title: 'View Contractor - Admin',
})

// State
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const contractorId = computed(() => route.params.id as string)
const contractor = ref<ContractorWithCity | null>(null)
const loading = ref(true)

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
      consola.error('[ViewContractor] Error fetching:', error)
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

// Computed values for display
const metadata = computed(() => (contractor.value?.metadata as Record<string, any>) || {})
const categories = computed<string[]>(() => metadata.value.categories || [])
const socialLinks = computed(() => metadata.value.social_links || {})
const images = computed<string[]>(() => metadata.value.images || [])
const primaryImage = computed(() => metadata.value.primary_image || images.value[0] || null)

// Build image URL from storage path
function buildImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Format city display
const cityDisplay = computed(() => {
  if (!contractor.value?.city) return 'Not set'
  return `${contractor.value.city.name}, ${contractor.value.city.state_code}`
})

// Status badge styling
const statusConfig = computed(() => {
  switch (contractor.value?.status) {
    case 'active':
      return { label: 'Active', icon: 'heroicons:check-circle', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'suspended':
      return { label: 'Suspended', icon: 'heroicons:x-circle', class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    default:
      return { label: 'Pending', icon: 'heroicons:clock', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
  }
})

// Navigation
function handleEdit() {
  router.push(`/admin/contractors/${contractorId.value}/edit`)
}

function handleBack() {
  router.push('/admin/contractors')
}
</script>

<template>
  <div class="p-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <UiSpinner class="size-8" />
        <p class="text-sm text-muted-foreground">Loading contractor...</p>
      </div>
    </div>

    <template v-else-if="contractor">
      <!-- Header -->
      <div class="mb-8 flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-foreground">{{ contractor.company_name }}</h1>
            <UiBadge :variant="contractor.status === 'active' ? 'default' : contractor.status === 'suspended' ? 'destructive' : 'secondary'">
              <Icon :name="statusConfig.icon" class="size-3.5 mr-1" />
              {{ statusConfig.label }}
            </UiBadge>
          </div>
          <p class="mt-2 text-sm text-muted-foreground">{{ cityDisplay }}</p>
        </div>
        <div class="flex items-center gap-3">
          <UiButton variant="ghost" @click="handleBack">
            <Icon name="heroicons:arrow-left" class="size-4 mr-2" />
            Back
          </UiButton>
          <UiButton @click="handleEdit">
            <Icon name="heroicons:pencil" class="size-4 mr-2" />
            Edit
          </UiButton>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Main Content (2 cols) -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Description Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Description</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <p v-if="contractor.description" class="whitespace-pre-wrap text-foreground">{{ contractor.description }}</p>
              <p v-else class="italic text-muted-foreground">No description provided</p>
            </UiCardContent>
          </UiCard>

          <!-- Contact Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Contact Information</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd class="mt-1 text-foreground">
                    <a v-if="contractor.phone" :href="`tel:${contractor.phone}`" class="text-primary hover:underline">{{ contractor.phone }}</a>
                    <span v-else class="text-muted-foreground">—</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd class="mt-1 text-foreground">
                    <a v-if="contractor.email" :href="`mailto:${contractor.email}`" class="text-primary hover:underline">{{ contractor.email }}</a>
                    <span v-else class="text-muted-foreground">—</span>
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-muted-foreground">Website</dt>
                  <dd class="mt-1 text-foreground">
                    <a v-if="contractor.website" :href="contractor.website" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">{{ contractor.website }}</a>
                    <span v-else class="text-muted-foreground">—</span>
                  </dd>
                </div>
              </dl>
            </UiCardContent>
          </UiCard>

          <!-- Categories Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Categories</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <div v-if="categories.length" class="flex flex-wrap gap-2">
                <UiBadge v-for="category in categories" :key="category" variant="secondary">
                  {{ category }}
                </UiBadge>
              </div>
              <p v-else class="italic text-muted-foreground">No categories assigned</p>
            </UiCardContent>
          </UiCard>

          <!-- Images Gallery -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Images</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <div v-if="images.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="image in images"
                  :key="image"
                  class="group relative aspect-square overflow-hidden rounded-lg border"
                >
                  <img
                    :src="buildImageUrl(image)"
                    :alt="contractor.company_name"
                    class="h-full w-full object-cover"
                  />
                  <div v-if="image === primaryImage" class="absolute right-2 top-2">
                    <span class="rounded-full bg-yellow-500 p-1.5 text-white shadow-lg">
                      <Icon name="heroicons:star-solid" class="size-4" />
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="italic text-muted-foreground">No images available</p>
            </UiCardContent>
          </UiCard>
        </div>

        <!-- Sidebar (1 col) -->
        <div class="space-y-6">
          <!-- Location Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Location</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">City</dt>
                  <dd class="mt-1 text-foreground">{{ cityDisplay }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Street Address</dt>
                  <dd class="mt-1 text-foreground">{{ contractor.street_address || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Postal Code</dt>
                  <dd class="mt-1 text-foreground">{{ contractor.postal_code || '—' }}</dd>
                </div>
              </dl>
            </UiCardContent>
          </UiCard>

          <!-- Social Links Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Social Links</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <div v-if="socialLinks.facebook || socialLinks.instagram || socialLinks.youtube || socialLinks.linkedin" class="flex flex-wrap gap-3">
                <a v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" rel="noopener noreferrer" class="flex size-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700" title="Facebook">
                  <Icon name="mdi:facebook" class="size-5" />
                </a>
                <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" rel="noopener noreferrer" class="flex size-10 items-center justify-center rounded-full bg-pink-600 text-white transition-colors hover:bg-pink-700" title="Instagram">
                  <Icon name="mdi:instagram" class="size-5" />
                </a>
                <a v-if="socialLinks.youtube" :href="socialLinks.youtube" target="_blank" rel="noopener noreferrer" class="flex size-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700" title="YouTube">
                  <Icon name="mdi:youtube" class="size-5" />
                </a>
                <a v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" rel="noopener noreferrer" class="flex size-10 items-center justify-center rounded-full bg-blue-700 text-white transition-colors hover:bg-blue-800" title="LinkedIn">
                  <Icon name="mdi:linkedin" class="size-5" />
                </a>
              </div>
              <p v-else class="italic text-muted-foreground">No social links</p>
            </UiCardContent>
          </UiCard>

          <!-- Google Info Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Google Info</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Place ID</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-foreground">{{ contractor.google_place_id || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">CID</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-foreground">{{ contractor.google_cid || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Slug</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-foreground">{{ contractor.slug }}</dd>
                </div>
              </dl>
            </UiCardContent>
          </UiCard>

          <!-- Metadata Card -->
          <UiCard>
            <UiCardHeader>
              <UiCardTitle>Record Info</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">ID</dt>
                  <dd class="mt-1 break-all font-mono text-xs text-foreground">{{ contractor.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd class="mt-1 text-foreground">{{ new Date(contractor.created_at).toLocaleDateString() }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-muted-foreground">Updated</dt>
                  <dd class="mt-1 text-foreground">{{ new Date(contractor.updated_at).toLocaleDateString() }}</dd>
                </div>
              </dl>
            </UiCardContent>
          </UiCard>
        </div>
      </div>
    </template>
  </div>
</template>

