<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import consola from 'consola'
import type { PageFormData } from '~/schemas/admin/page-form.schema'

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: false // Will use admin layout in Batch 7
})

useHead({
  title: 'Edit Page - Admin'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const route = useRoute()
const pageId = computed(() => route.params.id as string)

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})
const initialFormData = ref<Partial<PageFormData> | null>(null)

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

    // Map API response to form data structure
    initialFormData.value = mapApiResponseToFormData(page)
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
        errorMessage.value = 'Please check the form for errors'
        // TODO: Map field-level errors if available
      } else if (statusCode === 409) {
        // Conflict (slug already exists)
        errorMessage.value = error.value.message || 'A page with this slug already exists'
      } else if (statusCode === 401 || statusCode === 403) {
        // Auth errors
        errorMessage.value = 'You do not have permission to update this page'
      } else {
        // Generic error
        errorMessage.value = error.value.message || 'Failed to update page. Please try again.'
      }

      return
    }

    if (!data.value?.success) {
      errorMessage.value = 'Failed to update page. Please try again.'
      return
    }

    if (import.meta.dev) {
      consola.success('✅ Page updated successfully!')
    }

    // Redirect to page list with success message
    router.push({
      path: '/admin/pages',
      query: { success: 'Page updated successfully!' }
    })
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-5xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p class="text-gray-600 dark:text-gray-400">Loading page data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="max-w-5xl mx-auto">
      <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Error Loading Page</h2>
        <p class="text-red-700 dark:text-red-300">{{ errorMessage }}</p>
        <Button @click="router.push('/admin/pages')" class="mt-4">
          Back to Pages
        </Button>
      </div>
    </div>

    <!-- Edit Form -->
    <div v-else-if="initialFormData" class="max-w-5xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Edit Page</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Update page content, SEO settings, and metadata</p>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start justify-between"
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

      <PageForm
        :initial-data="initialFormData"
        :is-edit-mode="true"
        :is-submitting="isSubmitting"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

