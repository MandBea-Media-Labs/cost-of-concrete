<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { consola } from 'consola'
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
const toast = useToast()
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
            { label: contractor.company_name },
          ]"
          class="mb-6"
        />

        <!-- Header -->
        <div class="mb-8 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{{ contractor.company_name }}</h1>
              <span :class="['inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium', statusConfig.class]">
                <Icon :name="statusConfig.icon" class="h-4 w-4" />
                {{ statusConfig.label }}
              </span>
            </div>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{{ cityDisplay }}</p>
          </div>
          <div class="flex items-center gap-3">
            <Button text="Back" variant="ghost" size="md" icon="heroicons:arrow-left" @click="handleBack" />
            <Button text="Edit" variant="primary" size="md" icon="heroicons:pencil" @click="handleEdit" />
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Main Content (2 cols) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Description Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Description</h2>
              <p v-if="contractor.description" class="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{{ contractor.description }}</p>
              <p v-else class="italic text-neutral-500 dark:text-neutral-400">No description provided</p>
            </div>

            <!-- Contact Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h2>
              <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Phone</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">
                    <a v-if="contractor.phone" :href="`tel:${contractor.phone}`" class="text-blue-600 hover:underline dark:text-blue-400">{{ contractor.phone }}</a>
                    <span v-else class="text-neutral-400">—</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">
                    <a v-if="contractor.email" :href="`mailto:${contractor.email}`" class="text-blue-600 hover:underline dark:text-blue-400">{{ contractor.email }}</a>
                    <span v-else class="text-neutral-400">—</span>
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Website</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">
                    <a v-if="contractor.website" :href="contractor.website" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline dark:text-blue-400">{{ contractor.website }}</a>
                    <span v-else class="text-neutral-400">—</span>
                  </dd>
                </div>
              </dl>
            </div>

            <!-- Categories Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Categories</h2>
              <div v-if="categories.length" class="flex flex-wrap gap-2">
                <span
                  v-for="category in categories"
                  :key="category"
                  class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {{ category }}
                </span>
              </div>
              <p v-else class="italic text-neutral-500 dark:text-neutral-400">No categories assigned</p>
            </div>

            <!-- Images Gallery -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Images</h2>
              <div v-if="images.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="image in images"
                  :key="image"
                  class="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <img
                    :src="buildImageUrl(image)"
                    :alt="contractor.company_name"
                    class="h-full w-full object-cover"
                  />
                  <div v-if="image === primaryImage" class="absolute right-2 top-2">
                    <span class="rounded-full bg-yellow-500 p-1.5 text-white shadow-lg">
                      <Icon name="heroicons:star-solid" class="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
              <p v-else class="italic text-neutral-500 dark:text-neutral-400">No images available</p>
            </div>
          </div>

          <!-- Sidebar (1 col) -->
          <div class="space-y-6">
            <!-- Location Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Location</h2>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">City</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">{{ cityDisplay }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Street Address</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">{{ contractor.street_address || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Postal Code</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">{{ contractor.postal_code || '—' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Social Links Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Social Links</h2>
              <div v-if="socialLinks.facebook || socialLinks.instagram || socialLinks.youtube || socialLinks.linkedin" class="flex flex-wrap gap-3">
                <a v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700" title="Facebook">
                  <Icon name="mdi:facebook" class="h-5 w-5" />
                </a>
                <a v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-white transition-colors hover:bg-pink-700" title="Instagram">
                  <Icon name="mdi:instagram" class="h-5 w-5" />
                </a>
                <a v-if="socialLinks.youtube" :href="socialLinks.youtube" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700" title="YouTube">
                  <Icon name="mdi:youtube" class="h-5 w-5" />
                </a>
                <a v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white transition-colors hover:bg-blue-800" title="LinkedIn">
                  <Icon name="mdi:linkedin" class="h-5 w-5" />
                </a>
              </div>
              <p v-else class="italic text-neutral-500 dark:text-neutral-400">No social links</p>
            </div>

            <!-- Google Info Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Google Info</h2>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Place ID</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ contractor.google_place_id || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">CID</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ contractor.google_cid || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Slug</dt>
                  <dd class="mt-1 break-all font-mono text-sm text-neutral-900 dark:text-neutral-100">{{ contractor.slug }}</dd>
                </div>
              </dl>
            </div>

            <!-- Metadata Card -->
            <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
              <h2 class="mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Record Info</h2>
              <dl class="space-y-3">
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">ID</dt>
                  <dd class="mt-1 break-all font-mono text-xs text-neutral-900 dark:text-neutral-100">{{ contractor.id }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Created</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">{{ new Date(contractor.created_at).toLocaleDateString() }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Updated</dt>
                  <dd class="mt-1 text-neutral-900 dark:text-neutral-100">{{ new Date(contractor.updated_at).toLocaleDateString() }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

