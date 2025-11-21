<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import consola from 'consola'
import type { PageFormData } from '~/schemas/admin/page-form.schema'

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Edit Page - Admin'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const route = useRoute()
const toast = useToast()
const pageId = computed(() => route.params.id as string)

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const initialFormData = ref<Partial<PageFormData> | null>(null)
const currentPageStatus = ref<string>('draft')
const childrenCount = ref<number>(0)
const showArchiveDialog = ref(false)
const showDeleteDialog = ref(false)
const showUnarchiveDialog = ref(false)
const isArchiving = ref(false)
const isDeleting = ref(false)

// Smart button logic
const hasChildren = computed(() => childrenCount.value > 0)
const isArchived = computed(() => currentPageStatus.value === 'archived')
const showArchiveButton = computed(() => !isArchived.value && hasChildren.value)
const showDeleteButton = computed(() => !isArchived.value && !hasChildren.value)
const showUnarchiveButton = computed(() => isArchived.value)

// =====================================================
// FETCH PAGE DATA
// =====================================================

/**
 * Fetch page data from API
 */
async function fetchPageData() {
  try {
    isLoading.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info(`📥 Fetching page data for ID: ${pageId.value}`)
    }

    // Use $fetch on the client for a single-shot request instead of useFetch
    const response = await $fetch(`/api/pages/${pageId.value}`)

    if (!response) {
      throw new Error('Invalid response from server')
    }

    // Handle both wrapped { success, data } and direct page objects
    const page = (response as any).data ?? response

    if (!page) {
      throw new Error('Page not found')
    }

    if (import.meta.dev) {
      consola.success('📥 Page data fetched:', page.title)
    }

    // Store current page status for smart button logic
    currentPageStatus.value = page.status

    // Map API response to form data structure
    initialFormData.value = mapApiResponseToFormData(page)

    // Fetch children count for smart button logic
    await fetchChildrenCount()
  } catch (err) {
    if (import.meta.dev) {
      consola.error('❌ Error fetching page:', err)
    }
    errorMessage.value = err instanceof Error ? err.message : 'Failed to load page'
  } finally {
    isLoading.value = false
  }
}

/**
 * Fetch children count to determine which button to show
 */
async function fetchChildrenCount() {
  try {
    const response = await $fetch(`/api/pages/${pageId.value}/children`)
    const data = (response as any).data ?? response
    childrenCount.value = Array.isArray(data) ? data.length : (response as any).total ?? 0

    if (import.meta.dev) {
      consola.info(`📊 Children count: ${childrenCount.value}`)
    }
  } catch (err) {
    if (import.meta.dev) {
      consola.warn('Failed to fetch children count:', err)
    }
    childrenCount.value = 0
  }
}

/**
 * Map API response (Page) to PageFormData structure
 */
function mapApiResponseToFormData(page: any): Partial<PageFormData> {
  // Extract SEO data from metadata.seo if it exists
  const seoMetadata = page.metadata?.seo || {}

  return {
    // Core fields
    title: page.title,
    slug: page.slug,
    parentId: page.parent_id || null,
    template: page.template,
    status: page.status,
    description: page.description || null,
    content: page.content,

    // Basic SEO fields (from columns)
    metaTitle: page.meta_title || null,
    metaKeywords: page.meta_keywords || null,
    focusKeyword: page.focus_keyword || null,

    // Basic SEO fields (from metadata.seo)
    metaDescription: seoMetadata.metaDescription || null,

    // Open Graph fields (from metadata.seo)
    ogTitle: seoMetadata.ogTitle || null,
    ogDescription: seoMetadata.ogDescription || null,
    ogImage: page.og_image || null,
    ogType: seoMetadata.ogType || null,

    // Twitter Card fields (from metadata.seo)
    twitterCard: seoMetadata.twitterCard || null,
    twitterTitle: seoMetadata.twitterTitle || null,
    twitterDescription: seoMetadata.twitterDescription || null,
    twitterImage: seoMetadata.twitterImage || null,

    // Schema.org fields (from metadata.seo)
    schemaType: seoMetadata.schemaType || null,

    // Advanced SEO fields (from columns)
    metaRobots: page.meta_robots || null,
    sitemapPriority: page.sitemap_priority || null,
    sitemapChangefreq: page.sitemap_changefreq || null,
    canonicalUrl: page.canonical_url || null,
    redirectUrl: page.redirect_url || null,
    redirectType: page.redirect_type || null,

    // Template metadata (excluding seo)
    metadata: page.metadata && typeof page.metadata === 'object'
      ? Object.fromEntries(
          Object.entries(page.metadata).filter(([key]) => key !== 'seo')
        )
      : {}
  }
}

// Fetch page data on mount
onMounted(() => {
  fetchPageData()
})

// =====================================================
// FORM SUBMISSION
// =====================================================

/**
 * Map PageFormData to UpdatePageInput for API
 */
function mapFormDataToApiInput(formData: PageFormData) {
  return {
    // Core fields
    title: formData.title,
    content: formData.content,
    slug: formData.slug || undefined,
    template: formData.template,
    description: formData.description || undefined,
    status: formData.status,

    // Basic SEO fields
    metaTitle: formData.metaTitle || undefined,
    metaDescription: formData.metaDescription || undefined,
    metaKeywords: formData.metaKeywords || undefined,
    focusKeyword: formData.focusKeyword || undefined,

    // Open Graph fields
    ogTitle: formData.ogTitle || undefined,
    ogDescription: formData.ogDescription || undefined,
    ogImage: formData.ogImage || undefined,
    ogType: formData.ogType || undefined,

    // Twitter Card fields
    twitterCard: formData.twitterCard || undefined,
    twitterTitle: formData.twitterTitle || undefined,
    twitterDescription: formData.twitterDescription || undefined,
    twitterImage: formData.twitterImage || undefined,

    // Schema.org fields
    schemaType: formData.schemaType || undefined,

    // Advanced SEO fields
    metaRobots: formData.metaRobots || undefined,
    sitemapPriority: formData.sitemapPriority || undefined,
    sitemapChangefreq: formData.sitemapChangefreq || undefined,
    canonicalUrl: formData.canonicalUrl || undefined,
    redirectUrl: formData.redirectUrl || undefined,
    redirectType: formData.redirectType || undefined,

    // Template metadata
    metadata: formData.metadata || undefined
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(formData: PageFormData) {
  try {
    isSubmitting.value = true
    errorMessage.value = null
    fieldErrors.value = {}

    if (import.meta.dev) {
      consola.info('📝 Form submitted with data:', formData)
    }

    // Map form data to API input format
    const apiInput = mapFormDataToApiInput(formData)

    if (import.meta.dev) {
      consola.info('📤 Sending PATCH to API:', apiInput)
    }

    // Call PATCH endpoint
    const { data, error } = await useFetch(`/api/pages/${pageId.value}`, {
      method: 'PATCH',
      body: apiInput
    })

    if (error.value) {
      if (import.meta.dev) {
        consola.error('❌ API Error:', error.value)
      }

      // Handle different error types
      const statusCode = error.value.statusCode || 500

      if (statusCode === 400) {
        // Validation errors
        const validationMsg = 'Please check the form for errors'
        errorMessage.value = validationMsg
        toast.error('Validation errors', { message: validationMsg })
      } else if (statusCode === 409) {
        // Conflict (slug already exists)
        const conflictMsg = error.value.message || 'A page with this slug already exists'
        errorMessage.value = conflictMsg
        toast.error('Page already exists', { message: conflictMsg })
      } else if (statusCode === 401 || statusCode === 403) {
        // Auth errors
        const authMsg = 'You do not have permission to update this page'
        errorMessage.value = authMsg
        toast.error('Permission denied', { message: authMsg })
      } else {
        // Generic error
        const genericMsg = error.value.message || 'Failed to update page. Please try again.'
        errorMessage.value = genericMsg
        toast.error('Failed to update page', { message: genericMsg })
      }

      return
    }

    if (!data.value?.success) {
      const failMsg = 'Failed to update page. Please try again.'
      errorMessage.value = failMsg
      toast.error('Update failed', { message: failMsg })
      return
    }

    if (import.meta.dev) {
      consola.success('✅ Page updated successfully!')
    }

    // Show success toast and redirect
    toast.success('Page updated successfully!')
    router.push('/admin/pages')
  } catch (err) {
    if (import.meta.dev) {
      consola.error('❌ Unexpected error:', err)
    }
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle cancel button
 */
function handleCancel() {
  router.push('/admin/pages')
}

// =====================================================
// ARCHIVE / DELETE / UNARCHIVE HANDLERS
// =====================================================

/**
 * Open archive confirmation dialog
 */
function openArchiveDialog() {
  showArchiveDialog.value = true
}

/**
 * Open delete confirmation dialog
 */
function openDeleteDialog() {
  showDeleteDialog.value = true
}

/**
 * Open unarchive confirmation dialog
 */
function openUnarchiveDialog() {
  showUnarchiveDialog.value = true
}

/**
 * Handle archive action (cascade to descendants)
 */
async function handleArchive() {
  try {
    isArchiving.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info(`🗄️ Archiving page: ${pageId.value}`)
    }

    // Use PATCH endpoint to set status to 'archived'
    const { data, error } = await useFetch(`/api/pages/${pageId.value}`, {
      method: 'PATCH',
      body: { status: 'archived' }
    })

    if (error.value) {
      if (import.meta.dev) {
        consola.error('❌ Archive error:', error.value)
      }
      const archiveErrorMsg = error.value.message || 'Failed to archive page'
      errorMessage.value = archiveErrorMsg
      toast.error('Archive failed', { message: archiveErrorMsg })
      showArchiveDialog.value = false
      return
    }

    if (!data.value?.success) {
      const archiveFailMsg = 'Failed to archive page. Please try again.'
      errorMessage.value = archiveFailMsg
      toast.error('Archive failed', { message: archiveFailMsg })
      showArchiveDialog.value = false
      return
    }

    if (import.meta.dev) {
      consola.success('✅ Page archived successfully!')
    }

    // Show success toast and redirect
    const archiveMsg = childrenCount.value > 0
      ? `Page archived successfully! ${childrenCount.value} child page(s) also archived.`
      : 'Page archived successfully!'
    toast.success('Page archived', { message: archiveMsg })
    router.push('/admin/pages')
  } catch (err) {
    if (import.meta.dev) {
      consola.error('❌ Unexpected archive error:', err)
    }
    errorMessage.value = 'An unexpected error occurred while archiving.'
    showArchiveDialog.value = false
  } finally {
    isArchiving.value = false
  }
}

/**
 * Handle delete action (soft delete)
 */
async function handleDelete() {
  try {
    isDeleting.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info(`🗑️ Deleting page: ${pageId.value}`)
    }

    // Use DELETE endpoint for soft delete
    const { data, error } = await useFetch(`/api/pages/${pageId.value}`, {
      method: 'DELETE'
    })

    if (error.value) {
      if (import.meta.dev) {
        consola.error('❌ Delete error:', error.value)
      }
      const deleteErrorMsg = error.value.message || 'Failed to delete page'
      errorMessage.value = deleteErrorMsg
      toast.error('Delete failed', { message: deleteErrorMsg })
      showDeleteDialog.value = false
      return
    }

    if (!data.value?.success) {
      const deleteFailMsg = 'Failed to delete page. Please try again.'
      errorMessage.value = deleteFailMsg
      toast.error('Delete failed', { message: deleteFailMsg })
      showDeleteDialog.value = false
      return
    }

    if (import.meta.dev) {
      consola.success('✅ Page deleted successfully!')
    }

    // Show success toast and redirect
    toast.success('Page deleted successfully!')
    router.push('/admin/pages')
  } catch (err) {
    if (import.meta.dev) {
      consola.error('❌ Unexpected delete error:', err)
    }
    errorMessage.value = 'An unexpected error occurred while deleting.'
    showDeleteDialog.value = false
  } finally {
    isDeleting.value = false
  }
}

/**
 * Handle unarchive action
 */
async function handleUnarchive() {
  try {
    isArchiving.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info(`📂 Unarchiving page: ${pageId.value}`)
    }

    // Use PATCH endpoint to set status to 'draft'
    const { data, error } = await useFetch(`/api/pages/${pageId.value}`, {
      method: 'PATCH',
      body: { status: 'draft' }
    })

    if (error.value) {
      if (import.meta.dev) {
        consola.error('❌ Unarchive error:', error.value)
      }
      const unarchiveErrorMsg = error.value.message || 'Failed to restore page'
      errorMessage.value = unarchiveErrorMsg
      toast.error('Restore failed', { message: unarchiveErrorMsg })
      showUnarchiveDialog.value = false
      return
    }

    if (!data.value?.success) {
      const unarchiveFailMsg = 'Failed to restore page. Please try again.'
      errorMessage.value = unarchiveFailMsg
      toast.error('Restore failed', { message: unarchiveFailMsg })
      showUnarchiveDialog.value = false
      return
    }

    if (import.meta.dev) {
      consola.success('✅ Page unarchived successfully!')
    }

    // Show success toast and redirect
    toast.success('Page restored successfully!')
    router.push('/admin/pages')
  } catch (err) {
    if (import.meta.dev) {
      consola.error('❌ Unexpected unarchive error:', err)
    }
    errorMessage.value = 'An unexpected error occurred while unarchiving.'
    showUnarchiveDialog.value = false
  } finally {
    isArchiving.value = false
  }
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="mx-6 mt-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p class="text-gray-600 dark:text-gray-400">Loading page data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="mx-6 mt-6">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Page</h2>
        <p class="text-red-700 dark:text-red-300">{{ errorMessage }}</p>
        <Button @click="router.push('/admin/pages')" class="mt-4">
          Back to Pages
        </Button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="initialFormData">
      <div class="mb-6 px-6 pt-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Page</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Update page content, SEO settings, and metadata</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 mx-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start justify-between"
      >
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
        </div>
        <button
          @click="errorMessage = null"
          class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="mx-6">
        <PageForm
          :initial-data="initialFormData"
          :is-edit-mode="true"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>

      <!-- Archive / Delete / Unarchive Section -->
      <div class="mt-8 pt-8 mx-6 mb-6 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Danger Zone</h2>
        <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <!-- Archive Button (for pages with children) -->
          <div v-if="showArchiveButton" class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Archive this page</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This page has {{ childrenCount }} child page(s). Archiving will also archive all descendants.
              </p>
            </div>
            <Button
              text="Archive Page"
              variant="danger"
              @click="openArchiveDialog"
            />
          </div>

          <!-- Delete Button (for pages without children) -->
          <div v-if="showDeleteButton" class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete this page</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Permanently delete this page. This action cannot be undone.
              </p>
            </div>
            <Button
              text="Delete Page"
              variant="danger"
              @click="openDeleteDialog"
            />
          </div>

          <!-- Unarchive Button (for archived pages) -->
          <div v-if="showUnarchiveButton" class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Unarchive this page</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Restore this page from the archive and set it back to draft status.
              </p>
            </div>
            <Button
              text="Unarchive Page"
              variant="primary"
              @click="openUnarchiveDialog"
            />
          </div>
        </div>
      </div>

      <!-- Archive Confirmation Dialog -->
      <div
        v-if="showArchiveDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showArchiveDialog = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Archive Page?</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to archive this page? This will also archive {{ childrenCount }} child page(s).
          </p>
          <div class="flex justify-end gap-3">
            <Button
              text="Cancel"
              variant="secondary"
              @click="showArchiveDialog = false"
              :disabled="isArchiving"
            />
            <Button
              text="Archive"
              variant="danger"
              @click="handleArchive"
              :disabled="isArchiving"
            />
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div
        v-if="showDeleteDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showDeleteDialog = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Page?</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete this page? This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3">
            <Button
              text="Cancel"
              variant="secondary"
              @click="showDeleteDialog = false"
              :disabled="isDeleting"
            />
            <Button
              text="Delete"
              variant="danger"
              @click="handleDelete"
              :disabled="isDeleting"
            />
          </div>
        </div>
      </div>

      <!-- Unarchive Confirmation Dialog -->
      <div
        v-if="showUnarchiveDialog"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showUnarchiveDialog = false"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Unarchive Page?</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to unarchive this page? It will be restored to draft status.
          </p>
          <div class="flex justify-end gap-3">
            <Button
              text="Cancel"
              variant="secondary"
              @click="showUnarchiveDialog = false"
              :disabled="isArchiving"
            />
            <Button
              text="Unarchive"
              variant="primary"
              @click="handleUnarchive"
              :disabled="isArchiving"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

