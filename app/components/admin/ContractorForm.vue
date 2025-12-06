<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { consola } from 'consola'
import { contractorFormSchema, contractorFormDefaultValues, type ContractorFormData, type ContractorStatus } from '~/schemas/admin/contractor-form.schema'

interface City {
  id: string
  name: string
  state_code: string
  slug: string
}

interface ServiceType {
  id: string
  name: string
  slug: string
}

export interface ContractorImage {
  path: string
  url: string
  isPrimary: boolean
}

interface Props {
  initialData?: Partial<ContractorFormData>
  isEditMode?: boolean
  isSubmitting?: boolean
  /** Images from metadata.images (storage paths) */
  images?: string[]
  /** Primary image path from metadata */
  primaryImage?: string | null
  /** Google Place ID for storage bucket path */
  googlePlaceId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEditMode: false,
  isSubmitting: false,
  images: () => [],
  primaryImage: null,
  googlePlaceId: null,
})

const emit = defineEmits<{
  submit: [data: ContractorFormData]
  cancel: []
  setPrimaryImage: [path: string]
  deleteImage: [path: string]
}>()

// Supabase client for storage URLs
const supabase = useSupabaseClient()

// Image management
const localImages = ref<ContractorImage[]>([])
const deletedImages = ref<string[]>([])
const imageToDelete = ref<string | null>(null)
const showDeleteDialog = ref(false)

// Build image URLs from storage paths using Supabase storage
// Bucket name matches ImageEnrichmentService.bucketName
function buildImageUrl(storagePath: string): string {
  const { data } = supabase.storage.from('contractors').getPublicUrl(storagePath)
  return data.publicUrl
}

// Initialize images from props
watch(
  () => props.images,
  (newImages) => {
    if (newImages && newImages.length > 0) {
      localImages.value = newImages.map((path) => ({
        path,
        url: buildImageUrl(path),
        isPrimary: path === props.primaryImage,
      }))
    }
  },
  { immediate: true }
)

// Handle setting primary image
function handleSetPrimary(path: string) {
  localImages.value = localImages.value.map((img) => ({
    ...img,
    isPrimary: img.path === path,
  }))
  emit('setPrimaryImage', path)
}

// Handle delete image confirmation
function confirmDeleteImage(path: string) {
  imageToDelete.value = path
  showDeleteDialog.value = true
}

// Execute image deletion
function executeDeleteImage() {
  if (imageToDelete.value) {
    const pathToDelete = imageToDelete.value
    deletedImages.value.push(pathToDelete)
    localImages.value = localImages.value.filter((img) => img.path !== pathToDelete)
    emit('deleteImage', pathToDelete)
  }
  showDeleteDialog.value = false
  imageToDelete.value = null
}

// Cancel delete
function cancelDelete() {
  showDeleteDialog.value = false
  imageToDelete.value = null
}

// Merge initial data with defaults to ensure all fields have values
const mergedInitialValues = computed(() => ({
  ...contractorFormDefaultValues,
  ...(props.initialData || {}),
}))

// Form setup with VeeValidate
const { values, errors, defineField, handleSubmit, setFieldValue } = useForm({
  validationSchema: toTypedSchema(contractorFormSchema),
  initialValues: mergedInitialValues.value,
})

// Define form fields
const [companyName] = defineField('companyName')
const [slug] = defineField('slug')
const [cityId] = defineField('cityId')
const [streetAddress] = defineField('streetAddress')
const [postalCode] = defineField('postalCode')
const [phone] = defineField('phone')
const [website] = defineField('website')
const [email] = defineField('email')
const [description] = defineField('description')
const [status] = defineField('status')
const [categories] = defineField('categories')

// Social links fields
const [facebookUrl] = defineField('socialLinks.facebook')
const [instagramUrl] = defineField('socialLinks.instagram')
const [youtubeUrl] = defineField('socialLinks.youtube')
const [linkedinUrl] = defineField('socialLinks.linkedin')

// Lookup data
const cities = ref<City[]>([])
const serviceTypes = ref<ServiceType[]>([])
const isLoadingLookups = ref(true)

// City dropdown options
const cityOptions = computed(() => [
  { value: '', label: 'Select a city...' },
  ...cities.value.map(city => ({
    value: city.id,
    label: `${city.name}, ${city.state_code}`,
  })),
])

// Status options
const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

// Auto-generate slug from company name (in create mode only)
const isSlugManuallyEdited = ref(false)

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

watch(companyName, (newName) => {
  if (!props.isEditMode && !isSlugManuallyEdited.value && newName) {
    setFieldValue('slug', generateSlug(newName))
  }
})

// Handle manual slug edit
function handleSlugInput() {
  isSlugManuallyEdited.value = true
}

// Fetch lookup data
async function fetchLookups() {
  isLoadingLookups.value = true
  try {
    const [citiesRes, serviceTypesRes] = await Promise.all([
      $fetch<{ success: boolean; data: City[] }>('/api/cities'),
      $fetch<{ success: boolean; data: ServiceType[] }>('/api/service-types'),
    ])

    if (citiesRes.success) cities.value = citiesRes.data
    if (serviceTypesRes.success) serviceTypes.value = serviceTypesRes.data

    if (import.meta.dev) {
      consola.success(`[ContractorForm] Loaded ${cities.value.length} cities, ${serviceTypes.value.length} service types`)
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('[ContractorForm] Failed to fetch lookups:', error)
    }
  } finally {
    isLoadingLookups.value = false
  }
}

onMounted(() => {
  fetchLookups()
})

// Category checkbox toggle
function toggleCategory(slug: string) {
  const current = categories.value || []
  if (current.includes(slug)) {
    setFieldValue('categories', current.filter(c => c !== slug))
  } else {
    setFieldValue('categories', [...current, slug])
  }
}

function isCategorySelected(slug: string): boolean {
  return (categories.value || []).includes(slug)
}

// Form submission
const onSubmit = handleSubmit((formValues) => {
  if (import.meta.dev) {
    consola.info('[ContractorForm] Submitting:', formValues)
  }
  emit('submit', formValues as ContractorFormData)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-8">
    <!-- Loading state -->
    <div v-if="isLoadingLookups" class="flex items-center justify-center py-8">
      <div class="flex items-center gap-3">
        <div class="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600" />
        <span class="text-sm text-neutral-600 dark:text-neutral-400">Loading form data...</span>
      </div>
    </div>

    <template v-else>
      <!-- Basic Information -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Basic Information</h3>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- Company Name -->
          <div>
            <label for="companyName" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Company Name <span class="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              v-model="companyName"
              type="text"
              placeholder="ABC Concrete Services"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors.companyName }"
              :disabled="isSubmitting"
            />
            <p v-if="errors.companyName" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.companyName }}</p>
          </div>

          <!-- Slug -->
          <div>
            <label for="slug" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Slug</label>
            <input
              id="slug"
              v-model="slug"
              type="text"
              placeholder="abc-concrete-services"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors.slug }"
              :disabled="isSubmitting"
              @input="handleSlugInput"
            />
            <p v-if="errors.slug" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.slug }}</p>
            <p v-else class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Auto-generated from company name</p>
          </div>
        </div>

        <!-- Status -->
        <div class="max-w-xs">
          <label for="status" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
          <select
            id="status"
            v-model="status"
            class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            :disabled="isSubmitting"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
          <textarea
            id="description"
            v-model="description"
            rows="4"
            placeholder="Brief description of the contractor..."
            class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Location -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Location</h3>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <!-- City -->
          <div>
            <label for="cityId" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">City</label>
            <select
              id="cityId"
              v-model="cityId"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :disabled="isSubmitting"
            >
              <option v-for="opt in cityOptions" :key="opt.value" :value="opt.value || null">{{ opt.label }}</option>
            </select>
          </div>

          <!-- Postal Code -->
          <div>
            <label for="postalCode" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Postal Code</label>
            <input
              id="postalCode"
              v-model="postalCode"
              type="text"
              placeholder="12345"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :disabled="isSubmitting"
            />
          </div>
        </div>

        <!-- Street Address -->
        <div>
          <label for="streetAddress" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Street Address</label>
          <input
            id="streetAddress"
            v-model="streetAddress"
            type="text"
            placeholder="123 Main Street"
            class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            :disabled="isSubmitting"
          />
        </div>
      </div>

      <!-- Contact Information -->
      <div class="space-y-6">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <!-- Phone -->
          <div>
            <label for="phone" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Phone</label>
            <input
              id="phone"
              v-model="phone"
              type="tel"
              placeholder="(555) 123-4567"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :disabled="isSubmitting"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="info@example.com"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors.email }"
              :disabled="isSubmitting"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
          </div>

          <!-- Website -->
          <div>
            <label for="website" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Website</label>
            <input
              id="website"
              v-model="website"
              type="url"
              placeholder="https://example.com"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors.website }"
              :disabled="isSubmitting"
            />
            <p v-if="errors.website" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors.website }}</p>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Social Links</h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Add social media profile URLs.</p>

        <div class="grid gap-4 md:grid-cols-2">
          <!-- Facebook -->
          <div>
            <label for="facebook" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Facebook</label>
            <input
              id="facebook"
              v-model="facebookUrl"
              type="url"
              placeholder="https://facebook.com/company"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors['socialLinks.facebook'] }"
              :disabled="isSubmitting"
            />
            <p v-if="errors['socialLinks.facebook']" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors['socialLinks.facebook'] }}</p>
          </div>

          <!-- Instagram -->
          <div>
            <label for="instagram" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Instagram</label>
            <input
              id="instagram"
              v-model="instagramUrl"
              type="url"
              placeholder="https://instagram.com/company"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors['socialLinks.instagram'] }"
              :disabled="isSubmitting"
            />
            <p v-if="errors['socialLinks.instagram']" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors['socialLinks.instagram'] }}</p>
          </div>

          <!-- YouTube -->
          <div>
            <label for="youtube" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">YouTube</label>
            <input
              id="youtube"
              v-model="youtubeUrl"
              type="url"
              placeholder="https://youtube.com/@company"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors['socialLinks.youtube'] }"
              :disabled="isSubmitting"
            />
            <p v-if="errors['socialLinks.youtube']" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors['socialLinks.youtube'] }}</p>
          </div>

          <!-- LinkedIn -->
          <div>
            <label for="linkedin" class="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">LinkedIn</label>
            <input
              id="linkedin"
              v-model="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/company/name"
              class="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              :class="{ 'border-red-500': errors['socialLinks.linkedin'] }"
              :disabled="isSubmitting"
            />
            <p v-if="errors['socialLinks.linkedin']" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ errors['socialLinks.linkedin'] }}</p>
          </div>
        </div>
      </div>

      <!-- Images (Edit Mode Only) -->
      <div v-if="isEditMode && localImages.length > 0" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Images</h3>
          <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ localImages.length }} image{{ localImages.length !== 1 ? 's' : '' }}</span>
        </div>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Manage contractor images. Click the star to set as primary.</p>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="image in localImages"
            :key="image.path"
            class="group relative overflow-hidden rounded-lg border"
            :class="[
              image.isPrimary
                ? 'border-2 border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-800'
                : 'border-neutral-200 dark:border-neutral-700',
            ]"
          >
            <!-- Image -->
            <div class="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img :src="image.url" :alt="'Contractor image'" class="h-full w-full object-cover" loading="lazy" />
            </div>

            <!-- Primary badge -->
            <div
              v-if="image.isPrimary"
              class="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5 text-xs font-medium text-white shadow"
            >
              <Icon name="heroicons:star-solid" class="h-3 w-3" />
              Primary
            </div>

            <!-- Actions overlay -->
            <div
              class="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <!-- Set as primary -->
              <button
                v-if="!image.isPrimary"
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-yellow-600 shadow-lg transition-colors hover:bg-yellow-50"
                title="Set as primary"
                :disabled="isSubmitting"
                @click="handleSetPrimary(image.path)"
              >
                <Icon name="heroicons:star" class="h-5 w-5" />
              </button>

              <!-- Delete -->
              <button
                type="button"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-600 shadow-lg transition-colors hover:bg-red-50"
                title="Delete image"
                :disabled="isSubmitting"
                @click="confirmDeleteImage(image.path)"
              >
                <Icon name="heroicons:trash" class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No images message (Edit Mode) -->
      <div v-else-if="isEditMode" class="space-y-4">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Images</h3>
        <div class="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center dark:border-neutral-600 dark:bg-neutral-800/50">
          <Icon name="heroicons:photo" class="mx-auto h-12 w-12 text-neutral-400" />
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">No images available for this contractor.</p>
          <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-500">Images are added during the import process.</p>
        </div>
      </div>

      <!-- Categories -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Service Categories</h3>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Select all categories that apply to this contractor.</p>

        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <label
            v-for="type in serviceTypes"
            :key="type.id"
            class="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors"
            :class="[
              isCategorySelected(type.slug)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600',
            ]"
          >
            <input
              type="checkbox"
              :checked="isCategorySelected(type.slug)"
              class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              :disabled="isSubmitting"
              @change="toggleCategory(type.slug)"
            />
            <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ type.name }}</span>
          </label>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex items-center justify-end gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <Button text="Cancel" variant="ghost" size="md" :disabled="isSubmitting" @click="emit('cancel')" />
        <Button
          :text="isEditMode ? 'Update Contractor' : 'Create Contractor'"
          variant="primary"
          size="md"
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        />
      </div>
    </template>

    <!-- Delete Image Confirmation Dialog -->
    <Dialog
      v-model:open="showDeleteDialog"
      title="Delete Image"
      description="Are you sure you want to delete this image? This action cannot be undone."
    >
      <template #footer>
        <div class="flex justify-end gap-3">
          <Button text="Cancel" variant="ghost" size="sm" @click="cancelDelete" />
          <Button text="Delete" variant="danger" size="sm" @click="executeDeleteImage" />
        </div>
      </template>
    </Dialog>
  </form>
</template>

