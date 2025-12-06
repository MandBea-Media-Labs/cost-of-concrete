<script setup lang="ts">
import { consola } from 'consola'
import type { AdminContractorsFilters } from '~/composables/useAdminContractors'

// City interface for dropdown
interface City {
  id: string
  name: string
  state_code: string
}

// ServiceType interface for dropdown
interface ServiceType {
  id: string
  name: string
  slug: string
  is_enabled: boolean
}

// Page metadata
definePageMeta({
  layout: 'admin',
})

// Use admin contractors composable
const { contractors, pagination, pending, error, fetchContractors, deleteContractor } = useAdminContractors()

// Use toast notifications
const toast = useToast()

// Get route for reading query params
const route = useRoute()
const router = useRouter()

// Cities state
const cities = ref<City[]>([])
const loadingCities = ref(false)

// Service types state
const serviceTypes = ref<ServiceType[]>([])
const loadingServiceTypes = ref(false)

// Status filter options
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

// City filter options (computed from fetched cities)
const cityOptions = computed(() => [
  { value: 'all', label: 'All Cities' },
  ...cities.value.map(city => ({
    value: city.id,
    label: `${city.name}, ${city.state_code}`,
  })),
])

// Category filter options (computed from fetched service types)
const categoryOptions = computed(() => [
  { value: 'all', label: 'All Categories' },
  ...serviceTypes.value.map(type => ({
    value: type.slug,
    label: type.name,
  })),
])

// Initialize from URL query params
const getInitialStatus = (): string => {
  const urlStatus = route.query.status as string | undefined
  if (urlStatus && ['pending', 'active', 'suspended'].includes(urlStatus)) {
    return urlStatus
  }
  return 'all'
}

const getInitialCity = (): string => {
  return (route.query.city as string) || 'all'
}

const getInitialCategory = (): string => {
  return (route.query.category as string) || 'all'
}

const getInitialSearch = (): string => {
  return (route.query.search as string) || ''
}

// Selected filter values - initialized from URL
const selectedStatus = ref<string>(getInitialStatus())
const selectedCity = ref<string>(getInitialCity())
const selectedCategory = ref<string>(getInitialCategory())
const searchQuery = ref<string>(getInitialSearch())

// Filter state - initialized from URL
const filters = ref<AdminContractorsFilters>({
  cityId: selectedCity.value === 'all' ? null : selectedCity.value,
  category: selectedCategory.value === 'all' ? null : selectedCategory.value,
  status: selectedStatus.value === 'all' ? null : selectedStatus.value as 'pending' | 'active' | 'suspended',
  search: searchQuery.value.trim().length > 0 ? searchQuery.value : null,
  page: 1,
  limit: 50,
  orderBy: 'company_name',
  orderDirection: 'asc',
})

// Fetch cities for dropdown
const fetchCities = async () => {
  try {
    loadingCities.value = true
    const response = await $fetch<{ success: boolean; data: City[] }>('/api/cities', {
      query: { limit: 500 },
    })
    if (response.success) {
      cities.value = response.data
    }
  } catch (err) {
    if (import.meta.dev) {
      consola.error('Failed to load cities:', err)
    }
  } finally {
    loadingCities.value = false
  }
}

// Fetch service types for dropdown
const fetchServiceTypes = async () => {
  try {
    loadingServiceTypes.value = true
    const response = await $fetch<{ success: boolean; data: ServiceType[] }>('/api/service-types')
    if (response.success) {
      serviceTypes.value = response.data
    }
  } catch (err) {
    if (import.meta.dev) {
      consola.error('Failed to load service types:', err)
    }
  } finally {
    loadingServiceTypes.value = false
  }
}

// Fetch contractors and lookup data on mount
onMounted(async () => {
  await Promise.all([
    fetchCities(),
    fetchServiceTypes(),
    fetchContractors(filters.value),
  ])
})

// Watch for filter changes and sync URL
watch([selectedStatus, selectedCity, selectedCategory, searchQuery], async () => {
  filters.value.status = selectedStatus.value === 'all' ? null : selectedStatus.value as 'pending' | 'active' | 'suspended'
  filters.value.cityId = selectedCity.value === 'all' ? null : selectedCity.value
  filters.value.category = selectedCategory.value === 'all' ? null : selectedCategory.value
  filters.value.search = searchQuery.value.trim().length > 0 ? searchQuery.value : null
  filters.value.page = 1

  // Update URL query params
  const query: Record<string, string> = {}
  if (selectedStatus.value !== 'all') {
    query.status = selectedStatus.value
  }
  if (selectedCity.value !== 'all') {
    query.city = selectedCity.value
  }
  if (selectedCategory.value !== 'all') {
    query.category = selectedCategory.value
  }
  if (searchQuery.value.trim()) {
    query.search = searchQuery.value.trim()
  }
  router.replace({ query })

  await fetchContractors(filters.value)
})

// Handle pagination change
const handlePageChange = async (page: number) => {
  filters.value.page = page
  await fetchContractors(filters.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle edit action
const handleEdit = (contractorId: string) => {
  navigateTo(`/admin/contractors/${contractorId}/edit`)
}

// Handle view action
const handleView = (contractorId: string) => {
  navigateTo(`/admin/contractors/${contractorId}`)
}

// Delete confirmation dialog
const showDeleteDialog = ref(false)
const contractorToDelete = ref<string | null>(null)

const handleDelete = (contractorId: string) => {
  contractorToDelete.value = contractorId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!contractorToDelete.value) return

  const success = await deleteContractor(contractorToDelete.value)

  if (success) {
    toast.success('Contractor deleted successfully')
    if (import.meta.dev) {
      consola.success('Contractor deleted successfully')
    }
    await fetchContractors(filters.value)
  } else {
    toast.error('Failed to delete contractor', { message: 'Please try again or contact support' })
    if (import.meta.dev) {
      consola.error('Failed to delete contractor')
    }
  }

  showDeleteDialog.value = false
  contractorToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  contractorToDelete.value = null
}

// Handle create new contractor
const handleCreateContractor = () => {
  navigateTo('/admin/contractors/new')
}

// Handle import contractors
const handleImport = () => {
  navigateTo('/admin/contractors/import')
}
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Contractors</h1>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Manage contractor profiles</p>
        </div>

        <div class="flex items-center gap-3">
          <Button text="Import" variant="secondary-outline" size="md" icon="heroicons:arrow-up-tray" @click="handleImport" />
          <Button text="Add Contractor" variant="primary" size="md" icon="heroicons:plus" @click="handleCreateContractor" />
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <!-- Search Input (full width) -->
      <div class="mb-4">
        <TextInput v-model="searchQuery" label="Search" placeholder="Search by company name..." icon="heroicons:magnifying-glass" clearable size="md" />
      </div>

      <!-- Filter Dropdowns -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <!-- City Filter -->
        <FilterSelect v-model="selectedCity" label="City" :options="cityOptions" placeholder="Filter by city" size="md" :disabled="loadingCities" />

        <!-- Category Filter -->
        <FilterSelect v-model="selectedCategory" label="Category" :options="categoryOptions" placeholder="Filter by category" size="md" :disabled="loadingServiceTypes" />

        <!-- Status Filter -->
        <FilterSelect v-model="selectedStatus" label="Status" :options="statusOptions" placeholder="Filter by status" size="md" />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading contractors</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <!-- Contractor List -->
    <div class="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
      <AdminContractorList :contractors="contractors" :loading="pending" @edit="handleEdit" @view="handleView" @delete="handleDelete" />
    </div>

    <!-- Pagination -->
    <div v-if="!pending && contractors.length > 0" class="mt-6 flex justify-center">
      <Pagination
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :max-visible-pages="5"
        size="md"
        :show-page-numbers="true"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Results Summary -->
    <div v-if="!pending && contractors.length > 0" class="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
      Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
      {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
      {{ pagination.total }} contractors
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:open="showDeleteDialog"
      title="Delete Contractor"
      description="Are you sure you want to delete this contractor? This action cannot be undone."
    >
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button text="Cancel" variant="ghost" size="md" @click="cancelDelete" />
          <Button text="Delete" variant="primary" size="md" @click="confirmDelete" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

