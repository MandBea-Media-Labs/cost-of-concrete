<script setup lang="ts">
// Catch-All Route for Dynamic Page Rendering
// Handles all page paths and renders appropriate template based on database data

import DefaultTemplate from '~/components/templates/DefaultTemplate.vue'
import HubTemplate from '~/components/templates/HubTemplate.vue'

// Get route params
const route = useRoute()

// Build full path from slug params
const path = computed(() => {
  const slugArray = route.params.slug as string[]
  return '/' + (slugArray?.join('/') || '')
})

// Fetch page data from database
// We'll fetch children for all pages and let the template decide whether to use them
const { page, children, breadcrumbs, pending, error } = await usePage(path.value, {
  fetchChildren: true, // Always fetch children, templates will decide whether to display them
  fetchBreadcrumbs: true
})

// Handle errors
if (error.value) {
  if (import.meta.dev) {
    console.error('Error loading page:', error.value)
  }

  // Check if it's a 404 error
  if (error.value.message?.includes('not found') || error.value.message?.includes('404')) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      message: `The page "${path.value}" could not be found.`,
      fatal: true
    })
  }

  // Check if it's a 403 error (draft page, no access)
  if (error.value.message?.includes('permission') || error.value.message?.includes('403')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied',
      message: 'You do not have permission to view this page.',
      fatal: true
    })
  }

  // Generic server error
  throw createError({
    statusCode: 500,
    statusMessage: 'Server Error',
    message: 'An error occurred while loading the page.',
    fatal: true
  })
}

// Handle page not found
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: `The page "${path.value}" could not be found.`,
    fatal: true
  })
}

// Generate SEO meta tags from database data
usePageSeo(page.value)

// Dynamic template component selection based on page.template from database
const templateComponent = computed(() => {
  const template = page.value?.template || 'default'

  switch (template) {
    case 'hub':
      return HubTemplate
    case 'spoke':
      // return SpokeTemplate // Will be created in Batch 4
      return DefaultTemplate // Fallback for now
    case 'sub-spoke':
      // return SubSpokeTemplate // Will be created in Batch 4
      return DefaultTemplate // Fallback for now
    case 'article':
      // return ArticleTemplate // Will be created in Batch 5
      return DefaultTemplate // Fallback for now
    case 'custom':
      return DefaultTemplate // Custom templates use default for now
    case 'default':
    default:
      return DefaultTemplate
  }
})

// Log page load in development
if (import.meta.dev) {
  console.log('Page loaded:', {
    path: path.value,
    title: page.value?.title,
    template: page.value?.template,
    depth: page.value?.depth,
    status: page.value?.status
  })
}
</script>

<template>
  <div>
    <!-- Loading State -->
    <div v-if="pending" class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="animate-pulse space-y-4">
          <!-- Loading skeleton -->
          <div class="h-12 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div class="h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div class="space-y-3 pt-8">
            <div class="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div class="h-4 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div class="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      </div>
    </div>

    <!-- Page Content (Dynamic Template) -->
    <component
      v-else-if="page"
      :is="templateComponent"
      :page="page"
      :children="children"
      :breadcrumbs="breadcrumbs"
    />
  </div>
</template>

<style scoped>
/* No additional styles needed */
</style>

