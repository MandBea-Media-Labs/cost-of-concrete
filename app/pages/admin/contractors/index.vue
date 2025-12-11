<script setup lang="ts">
import { consola } from 'consola'
import { toast } from 'vue-sonner'
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

// Quick filter options (subset with icons for quick access)
const quickFilterOptions = [
  { value: 'pending', label: 'Pending', icon: 'heroicons:clock' },
  { value: 'active', label: 'Active', icon: 'heroicons:check-circle' },
  { value: 'suspended', label: 'Suspended', icon: 'heroicons:x-circle' },
]

// Rows per page options
const rowsPerPageOptions = [10, 25, 50, 100]
const rowsPerPage = ref<string>('50')

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
    toast.error('Failed to delete contractor', { description: 'Please try again or contact support' })
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

// Computed: check if any filters are active
const hasActiveFilters = computed(() => {
  return selectedStatus.value !== 'all'
    || selectedCity.value !== 'all'
    || selectedCategory.value !== 'all'
    || searchQuery.value.trim().length > 0
})

// Clear all filters
const clearFilters = () => {
  selectedStatus.value = 'all'
  selectedCity.value = 'all'
  selectedCategory.value = 'all'
  searchQuery.value = ''
}

// Handle rows per page change
const handleRowsPerPageChange = async (value: string) => {
  filters.value.limit = Number.parseInt(value, 10)
  filters.value.page = 1
  await fetchContractors(filters.value)
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Contractor Profiles</h1>
          <p class="mt-1 text-sm text-muted-foreground">Manage contractor profiles</p>
        </div>

        <UiButton @click="handleCreateContractor">
          <Icon name="heroicons:plus" class="size-4" />
          Add Contractor
        </UiButton>
      </div>

      <!-- Quick Filters -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-muted-foreground">Quick Filters:</span>
        <UiButton
          v-for="option in quickFilterOptions"
          :key="option.value"
          :variant="selectedStatus === option.value ? 'default' : 'outline'"
          size="sm"
          class="h-7 rounded-full px-3"
          @click="selectedStatus = option.value"
        >
          <Icon v-if="option.icon" :name="option.icon" class="size-3.5" />
          {{ option.label }}
        </UiButton>
      </div>

      <!-- Filter Bar -->
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <!-- Search Input -->
        <div class="relative w-64">
          <Icon name="heroicons:magnifying-glass" class="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <UiInput
            id="search"
            v-model="searchQuery"
            placeholder="Search contractors..."
            class="h-9 pl-9"
          />
        </div>

        <!-- Filter Dropdowns as Pill Buttons -->
        <UiPopover>
          <UiPopoverTrigger as-child>
            <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed">
              <Icon name="heroicons:check-circle" class="size-4" />
              Status
              <UiBadge v-if="selectedStatus !== 'all'" variant="secondary" class="ml-1 h-5 px-1.5">
                {{ statusOptions.find(o => o.value === selectedStatus)?.label }}
              </UiBadge>
              <Icon name="heroicons:chevron-down" class="size-3.5 opacity-50" />
            </UiButton>
          </UiPopoverTrigger>
          <UiPopoverContent class="w-48 p-1" align="start">
            <div class="flex flex-col">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                :class="{ 'bg-accent': selectedStatus === option.value }"
                @click="selectedStatus = option.value"
              >
                {{ option.label }}
                <Icon v-if="selectedStatus === option.value" name="heroicons:check" class="size-4" />
              </button>
            </div>
          </UiPopoverContent>
        </UiPopover>

        <UiPopover>
          <UiPopoverTrigger as-child>
            <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed" :disabled="loadingCities">
              <Icon name="heroicons:map-pin" class="size-4" />
              City
              <UiBadge v-if="selectedCity !== 'all'" variant="secondary" class="max-w-24 ml-1 h-5 truncate px-1.5">
                {{ cityOptions.find(o => o.value === selectedCity)?.label }}
              </UiBadge>
              <Icon name="heroicons:chevron-down" class="size-3.5 opacity-50" />
            </UiButton>
          </UiPopoverTrigger>
          <UiPopoverContent class="w-64 p-1" align="start">
            <div class="max-h-64 overflow-y-auto">
              <div class="flex flex-col">
                <button
                  v-for="option in cityOptions"
                  :key="option.value"
                  class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  :class="{ 'bg-accent': selectedCity === option.value }"
                  @click="selectedCity = option.value"
                >
                  <span class="truncate">{{ option.label }}</span>
                  <Icon v-if="selectedCity === option.value" name="heroicons:check" class="size-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          </UiPopoverContent>
        </UiPopover>

        <UiPopover>
          <UiPopoverTrigger as-child>
            <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed" :disabled="loadingServiceTypes">
              <Icon name="heroicons:tag" class="size-4" />
              Category
              <UiBadge v-if="selectedCategory !== 'all'" variant="secondary" class="max-w-24 ml-1 h-5 truncate px-1.5">
                {{ categoryOptions.find(o => o.value === selectedCategory)?.label }}
              </UiBadge>
              <Icon name="heroicons:chevron-down" class="size-3.5 opacity-50" />
            </UiButton>
          </UiPopoverTrigger>
          <UiPopoverContent class="w-56 p-1" align="start">
            <div class="max-h-64 overflow-y-auto">
              <div class="flex flex-col">
                <button
                  v-for="option in categoryOptions"
                  :key="option.value"
                  class="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  :class="{ 'bg-accent': selectedCategory === option.value }"
                  @click="selectedCategory = option.value"
                >
                  <span class="truncate">{{ option.label }}</span>
                  <Icon v-if="selectedCategory === option.value" name="heroicons:check" class="size-4 flex-shrink-0" />
                </button>
              </div>
            </div>
          </UiPopoverContent>
        </UiPopover>

        <!-- Clear Filters -->
        <UiButton
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="h-9 text-muted-foreground"
          @click="clearFilters"
        >
          <Icon name="heroicons:x-mark" class="size-4" />
          Clear filters
        </UiButton>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Import Button -->
        <UiButton variant="outline" size="sm" class="h-9" @click="handleImport">
          <Icon name="heroicons:arrow-up-tray" class="size-4" />
          Import
        </UiButton>
      </div>
    </div>

    <!-- Error State -->
    <UiAlert v-if="error" variant="destructive" class="mb-6">
      <Icon name="heroicons:exclamation-triangle" class="size-4" />
      <UiAlertTitle>Error loading contractors</UiAlertTitle>
      <UiAlertDescription>{{ error.message }}</UiAlertDescription>
    </UiAlert>

    <!-- Contractor List -->
    <AdminContractorList :contractors="contractors" :loading="pending" @edit="handleEdit" @view="handleView" @delete="handleDelete" />

    <!-- Pagination Footer -->
    <div v-if="!pending && contractors.length > 0" class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <!-- Results Summary -->
      <div class="text-sm text-muted-foreground">
        Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
        {{ pagination.total }} contractors
      </div>

      <!-- Rows per page + Pagination -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Rows per page</span>
          <UiSelect v-model="rowsPerPage" @update:model-value="handleRowsPerPageChange">
            <UiSelectTrigger class="h-8 w-16">
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem v-for="opt in rowsPerPageOptions" :key="opt" :value="opt.toString()">
                {{ opt }}
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div class="flex items-center gap-1 text-sm text-muted-foreground">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </div>

        <div class="flex items-center gap-1">
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(1)"
          >
            <Icon name="heroicons:chevron-double-left" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(pagination.page - 1)"
          >
            <Icon name="heroicons:chevron-left" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page >= pagination.totalPages"
            @click="handlePageChange(pagination.page + 1)"
          >
            <Icon name="heroicons:chevron-right" class="size-4" />
          </UiButton>
          <UiButton
            variant="outline"
            size="icon"
            class="size-8"
            :disabled="pagination.page >= pagination.totalPages"
            @click="handlePageChange(pagination.totalPages)"
          >
            <Icon name="heroicons:chevron-double-right" class="size-4" />
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <UiAlertDialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Delete Contractor</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Are you sure you want to delete this contractor? This action cannot be undone.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel @click="cancelDelete">Cancel</UiAlertDialogCancel>
          <UiAlertDialogAction @click="confirmDelete">Delete</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

