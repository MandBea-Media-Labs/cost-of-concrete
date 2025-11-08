<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import consola from 'consola'
import type { PageFormData } from '~/schemas/admin/page-form.schema'

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: false // Will use admin layout in Batch 7
})

useHead({
  title: 'Create New Page - Admin'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// =====================================================
// FORM SUBMISSION
// =====================================================

/**
 * Handle form submission
 * TODO: Implement API call in Batch 5
 */
async function handleSubmit(formData: PageFormData) {
  try {
    isSubmitting.value = true
    errorMessage.value = null

    if (import.meta.dev) {
      consola.info('📝 Form submitted with data:', formData)
    }

    // TODO: Implement API call in Batch 5
    // const response = await $fetch('/api/pages', {
    //   method: 'POST',
    //   body: {
    //     ...formData,
    //     content: '' // Will be added in Batch 3
    //   }
    // })

    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (import.meta.dev) {
      consola.success('✅ Page created successfully (simulated)')
    }

    // TODO: Show success toast in Batch 5
    // TODO: Redirect to edit page or list page
    // router.push(`/admin/pages/${response.id}/edit`)
    router.push('/admin/pages')
  } catch (error: any) {
    if (import.meta.dev) {
      consola.error('❌ Error creating page:', error)
    }
    errorMessage.value = error.message || 'Failed to create page. Please try again.'
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
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Header -->
    <div class="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
  </div>
</template>

