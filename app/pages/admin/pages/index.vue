<script setup lang="ts">
import { consola } from 'consola'
import { toast } from 'vue-sonner'
import type { AdminPagesFilters } from '~/composables/useAdminPages'

// Page metadata - use new admin layout
definePageMeta({
  layout: 'admin'
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
    // Show success toast
    toast.success('Page deleted successfully')

    if (import.meta.dev) {
      consola.success('Page deleted successfully')
    }

    // Refresh page list
    await fetchPages(filters.value)
  } else {
    // Show error toast
    toast.error('Failed to delete page', {
      description: 'Please try again or contact support'
    })

    if (import.meta.dev) {
      consola.error('Failed to delete page')
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
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">
            Pages
          </h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Manage your website pages
          </p>
        </div>

        <UiButton @click="handleCreatePage">
          <Icon name="heroicons:plus" class="size-4" />
          Create Page
        </UiButton>
      </div>
    </div>

    <!-- Filters Section -->
    <UiCard class="mb-6">
      <UiCardContent class="pt-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Search Input -->
          <div class="space-y-2">
            <UiLabel for="search">Search</UiLabel>
            <UiInput
              id="search"
              v-model="searchQuery"
              placeholder="Search pages..."
            />
          </div>

          <!-- Status Filter -->
          <div class="space-y-2">
            <UiLabel>Status</UiLabel>
            <UiSelect v-model="selectedStatus">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Filter by status" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>

          <!-- Template Filter -->
          <div class="space-y-2">
            <UiLabel>Template</UiLabel>
            <UiSelect v-model="selectedTemplate">
              <UiSelectTrigger class="w-full">
                <UiSelectValue placeholder="Filter by template" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem
                  v-for="option in templateOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Error State -->
    <UiCard v-if="error" class="mb-6 border-destructive bg-destructive/10">
      <UiCardContent class="pt-6">
        <div class="flex items-start gap-3">
          <Icon
            name="heroicons:exclamation-triangle"
            class="mt-0.5 size-5 flex-shrink-0 text-destructive"
          />
          <div>
            <h3 class="text-sm font-medium text-destructive">
              Error loading pages
            </h3>
            <p class="mt-1 text-sm text-destructive/80">
              {{ error.message }}
            </p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Page List -->
    <UiCard>
      <AdminPageList
        :pages="pages"
        :loading="pending"
        @edit="handleEdit"
        @view="handleView"
        @delete="handleDelete"
      />
    </UiCard>

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
      class="mt-4 text-center text-sm text-muted-foreground"
    >
      Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
      {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
      {{ pagination.total }} pages
    </div>

    <!-- Delete Confirmation Dialog -->
    <UiAlertDialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Delete Page</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Are you sure you want to delete this page? This action cannot be undone.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel @click="cancelDelete">
            Cancel
          </UiAlertDialogCancel>
          <UiAlertDialogAction @click="confirmDelete">
            Delete
          </UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

