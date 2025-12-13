<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import consola from 'consola'
import { toast } from 'vue-sonner'
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
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const fieldErrors = ref<Record<string, string>>({})

// Form ref for triggering submit from sticky header
const pageFormRef = ref<{ submit: () => void } | null>(null)

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
      toast.error('Validation errors', {
        description: 'Please fix the errors in the form below.'
      })

      if (import.meta.dev) {
        consola.warn('Validation errors:', fieldErrors.value)
      }
    } else if (statusCode === 409) {
      // Conflict error (e.g., slug already exists)
      const conflictMsg = errorMsg || 'A page with this slug already exists under the selected parent.'
      errorMessage.value = conflictMsg
      toast.error('Page already exists', { description: conflictMsg })
    } else if (statusCode === 401 || statusCode === 403) {
      // Authentication/authorization error
      const authMsg = 'You do not have permission to create pages. Please log in.'
      errorMessage.value = authMsg
      toast.error('Permission denied', { description: authMsg })
    } else {
      // Generic error
      const genericMsg = errorMsg || 'Failed to create page. Please try again.'
      errorMessage.value = genericMsg
      toast.error('Failed to create page', { description: genericMsg })
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
  <div>
    <!-- Sticky Header with Controls -->
    <div class="sticky top-0 z-10 -mx-4 px-4 py-4 mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold">Create New Page</h1>
          <p class="text-muted-foreground text-sm">Add a new page to your website</p>
        </div>
        <div class="flex items-center gap-3">
          <UiButton
            type="button"
            variant="outline"
            @click="handleCancel"
            :disabled="isSubmitting"
          >
            Cancel
          </UiButton>
          <UiButton
            @click="pageFormRef?.submit()"
            :disabled="isSubmitting"
          >
            <Icon v-if="isSubmitting" name="heroicons:arrow-path" class="size-4 animate-spin mr-2" />
            Create Page
          </UiButton>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <UiCard v-if="errorMessage" class="mb-6 border-destructive bg-destructive/10">
      <UiCardContent class="pt-6">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:exclamation-circle" class="size-5 text-destructive flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium text-destructive">
              Error Creating Page
            </h3>
            <p class="mt-1 text-sm text-destructive/80">
              {{ errorMessage }}
            </p>
          </div>
          <UiButton
            variant="ghost"
            size="icon-sm"
            @click="errorMessage = null"
          >
            <Icon name="heroicons:x-mark" class="size-5 text-destructive" />
          </UiButton>
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Form Card -->
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>Page Information</UiCardTitle>
        <p class="text-sm text-muted-foreground">
          Fill in all the details for your new page including content, template settings, and SEO options.
        </p>
      </UiCardHeader>
      <UiCardContent>
        <PageForm
          ref="pageFormRef"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </UiCardContent>
    </UiCard>

    <!-- Help Text -->
    <UiCard class="mt-6 border-primary/30 bg-primary/5">
      <UiCardContent class="pt-6">
        <div class="flex items-start gap-3">
          <Icon name="heroicons:information-circle" class="size-5 text-primary flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-sm font-medium">
              Form Sections
            </h3>
            <ul class="mt-2 text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>Core Fields:</strong> Title, slug, parent page, template, status, and description</li>
              <li><strong>Content:</strong> Rich text editor with formatting options</li>
              <li><strong>Template Settings:</strong> Template-specific options (varies by template)</li>
              <li><strong>SEO Settings:</strong> Meta tags, social media, and structured data</li>
            </ul>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

