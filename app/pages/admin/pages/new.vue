<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import consola from 'consola'
import type { PageFormData } from '~/schemas/admin/page-form.schema'

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Create New Page - Admin'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const toast = useToast()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// =====================================================
// FORM SUBMISSION
// =====================================================

/**
 * Map PageFormData to CreatePageInput for API
 * All SEO fields are now supported by the API
 */
function mapFormDataToApiInput(formData: PageFormData) {
  return {
    // Required fields
    title: formData.title,
    content: formData.content,

    // Optional core fields
    parentId: formData.parentId || undefined,
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
    ogImage: formData.ogImage || undefined, // API only accepts ogImage, not other OG fields
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
      consola.info('📤 Sending to API:', apiInput)
    }

    // Call API to create page
    const response = await $fetch('/api/pages', {
      method: 'POST',
      body: apiInput
    })

    if (import.meta.dev) {
      consola.success('✅ Page created successfully:', response)
    }

    // Show success toast and redirect
    toast.success('Page created successfully!')
    router.push('/admin/pages')
  } catch (error: any) {
    if (import.meta.dev) {
      consola.error('❌ Error creating page:', error)
    }

    // Extract error message from various possible locations
    const errorMsg = error.data?.message || error.message || error.statusMessage
    const statusCode = error.statusCode || error.status

    // Handle different error types
    if (statusCode === 400 && error.data?.issues) {
      // Zod validation errors from server
      const issues = error.data.issues as Array<{ path: string[]; message: string }>
      fieldErrors.value = issues.reduce((acc, issue) => {
        const fieldName = issue.path.join('.')
        acc[fieldName] = issue.message
        return acc
      }, {} as Record<string, string>)

      errorMessage.value = 'Please fix the validation errors below.'
      toast.error('Validation errors', { message: 'Please fix the errors in the form below.' })

      if (import.meta.dev) {
        consola.warn('Validation errors:', fieldErrors.value)
      }
    } else if (statusCode === 409) {
      // Conflict error (e.g., slug already exists)
      const conflictMsg = errorMsg || 'A page with this slug already exists under the selected parent.'
      errorMessage.value = conflictMsg
      toast.error('Page already exists', { message: conflictMsg })
    } else if (statusCode === 401 || statusCode === 403) {
      // Authentication/authorization error
      const authMsg = 'You do not have permission to create pages. Please log in.'
      errorMessage.value = authMsg
      toast.error('Permission denied', { message: authMsg })
    } else {
      // Generic error
      const genericMsg = errorMsg || 'Failed to create page. Please try again.'
      errorMessage.value = genericMsg
      toast.error('Failed to create page', { message: genericMsg })
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  router.push('/admin/pages')
}
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Create New Page
          </h1>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Add a new page to your website
          </p>
        </div>
        <NuxtLink
          to="/admin/pages"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="h-4 w-4" />
          Back to Pages
        </NuxtLink>
      </div>
    </div>

    <!-- Content -->
      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex items-start gap-3">
          <Icon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
              Error Creating Page
            </h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">
              {{ errorMessage }}
            </p>
          </div>
          <button
            @click="errorMessage = null"
            class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <Icon name="heroicons:x-mark" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Form Card -->
      <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div class="p-6 sm:p-8">
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Page Information
            </h2>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Fill in all the details for your new page including content, template settings, and SEO options.
            </p>
          </div>

          <!-- Page Form Component -->
          <PageForm
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </div>

      <!-- Help Text -->
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100">
              Form Sections
            </h3>
            <ul class="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li><strong>Core Fields:</strong> Title, slug, parent page, template, status, and description</li>
              <li><strong>Content:</strong> Rich text editor with formatting options</li>
              <li><strong>Template Settings:</strong> Template-specific options (varies by template)</li>
              <li><strong>SEO Settings:</strong> Meta tags, social media, and structured data</li>
            </ul>
          </div>
        </div>
      </div>
  </div>
</template>

