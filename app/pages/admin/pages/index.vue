<script setup lang="ts">
import type { AdminPagesFilters } from '~/composables/useAdminPages'

// Page metadata
definePageMeta({
  layout: false // We'll add admin layout in Batch 7
})

// Use admin pages composable
const { pages, pagination, pending, error, fetchPages, deletePage } = useAdminPages()

// Filter state
const filters = ref<AdminPagesFilters>({
  status: null,
  template: null,
  search: null,
  page: 1,
  limit: 50, // Increased to show more pages
  orderBy: 'full_path', // Sort by full_path to maintain hierarchy
  orderDirection: 'asc' // Ascending to show parents before children
})

// Status filter options
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

// Template filter options
const templateOptions = [
  { value: 'all', label: 'All Templates' },
  { value: 'hub', label: 'Hub' },
  { value: 'spoke', label: 'Spoke' },
  { value: 'sub-spoke', label: 'Sub-Spoke' },
  { value: 'article', label: 'Article' },
  { value: 'custom', label: 'Custom' },
  { value: 'default', label: 'Default' }
]

// Selected filter values (for FilterSelect v-model)
const selectedStatus = ref<string>('all')
const selectedTemplate = ref<string>('all')
const searchQuery = ref<string>('')

// Fetch pages on mount
onMounted(async () => {
  await fetchPages(filters.value)
})

// Watch for filter changes
watch([selectedStatus, selectedTemplate, searchQuery], async () => {
  // Update filters
  filters.value.status = selectedStatus.value === 'all' ? null : selectedStatus.value as any
  filters.value.template = selectedTemplate.value === 'all' ? null : selectedTemplate.value as any
  filters.value.search = searchQuery.value.trim().length > 0 ? searchQuery.value : null
  filters.value.page = 1 // Reset to first page when filters change

  // Fetch pages
  await fetchPages(filters.value)
})

// Handle pagination change
const handlePageChange = async (page: number) => {
  filters.value.page = page
  await fetchPages(filters.value)

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handle edit action
const handleEdit = (pageId: string) => {
  navigateTo(`/admin/pages/${pageId}/edit`)
}

// Handle view action
const handleView = (fullPath: string) => {
  // Open page in new tab
  window.open(fullPath, '_blank')
}

// Handle delete action
const showDeleteDialog = ref(false)
const pageToDelete = ref<string | null>(null)

const handleDelete = (pageId: string) => {
  pageToDelete.value = pageId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!pageToDelete.value) return

  const success = await deletePage(pageToDelete.value)

  if (success) {
    // Show success message (TODO: Add toast notification in future)
    if (import.meta.dev) {
      console.log('Page deleted successfully')
    }

    // Refresh page list
    await fetchPages(filters.value)
  } else {
    // Show error message (TODO: Add toast notification in future)
    if (import.meta.dev) {
      console.error('Failed to delete page')
    }
  }

  // Close dialog
  showDeleteDialog.value = false
  pageToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  pageToDelete.value = null
}

// Handle create new page
const handleCreatePage = () => {
  navigateTo('/admin/pages/new')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <div class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Pages
            </h1>
            <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Manage your website pages
            </p>
          </div>

          <Button
            text="Create Page"
            variant="primary"
            size="md"
            icon="heroicons:plus"
            @click="handleCreatePage"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Filters Section -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search Input -->
          <div class="md:col-span-1">
            <TextInput
              v-model="searchQuery"
              placeholder="Search pages..."
              icon="heroicons:magnifying-glass"
              clearable
              size="md"
            />
          </div>

          <!-- Status Filter -->
          <div class="md:col-span-1">
            <FilterSelect
              v-model="selectedStatus"
              label="Status"
              :options="statusOptions"
              placeholder="Filter by status"
              size="md"
            />
          </div>

          <!-- Template Filter -->
          <div class="md:col-span-1">
            <FilterSelect
              v-model="selectedTemplate"
              label="Template"
              :options="templateOptions"
              placeholder="Filter by template"
              size="md"
            />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <div class="flex items-start gap-3">
          <Icon
            name="heroicons:exclamation-triangle"
            class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              Error loading pages
            </h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
              {{ error.message }}
            </p>
          </div>
        </div>
      </div>

      <!-- Page List -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <AdminPageList
          :pages="pages"
          :loading="pending"
          @edit="handleEdit"
          @view="handleView"
          @delete="handleDelete"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="!pending && pages.length > 0"
        class="mt-6 flex justify-center"
      >
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
      <div
        v-if="!pending && pages.length > 0"
        class="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400"
      >
        Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
        {{ pagination.total }} pages
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:open="showDeleteDialog"
      title="Delete Page"
      description="Are you sure you want to delete this page? This action cannot be undone."
    >
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button
            text="Cancel"
            variant="ghost"
            size="md"
            @click="cancelDelete"
          />
          <Button
            text="Delete"
            variant="primary"
            size="md"
            @click="confirmDelete"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>

