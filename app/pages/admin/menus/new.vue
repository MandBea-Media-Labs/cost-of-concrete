<script setup lang="ts">
import { ref } from 'vue'
import { consola } from 'consola'
import type { MenuFormData } from '~/schemas/admin/menu-form.schema'

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Create New Menu - Admin'
})

// =====================================================
// STATE
// =====================================================

const router = useRouter()
const toast = useToast()
const { createMenu } = useMenus()
const isSubmitting = ref(false)

// =====================================================
// FORM SUBMISSION
// =====================================================

/**
 * Map MenuFormData to CreateMenuInput for API
 */
function mapFormDataToApiInput(formData: MenuFormData) {
  return {
    name: formData.name,
    slug: formData.slug,
    description: formData.description || undefined,
    show_in_header: formData.show_in_header,
    show_in_footer: formData.show_in_footer,
    is_enabled: formData.is_enabled,
    metadata: formData.metadata || undefined
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(formData: MenuFormData) {
  if (import.meta.client && import.meta.dev) {
    consola.info('[CreateMenu] Form submitted:', formData)
  }

  isSubmitting.value = true

  try {
    const input = mapFormDataToApiInput(formData)
    
    if (import.meta.client && import.meta.dev) {
      consola.info('[CreateMenu] API input:', input)
    }

    const newMenu = await createMenu(input)

    if (newMenu) {
      toast.success('Menu created successfully')
      
      // Redirect to menu list
      router.push('/admin/menus')
    } else {
      toast.error('Failed to create menu')
    }
  } catch (error: any) {
    consola.error('[CreateMenu] Error:', error)
    
    // Show user-friendly error message
    if (error?.message?.includes('duplicate')) {
      toast.error('A menu with this slug already exists')
    } else {
      toast.error(error?.message || 'Failed to create menu')
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  router.push('/admin/menus')
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Breadcrumbs -->
      <AdminBreadcrumbs
        :items="[
          { label: 'Admin', href: '/admin' },
          { label: 'Menus', href: '/admin/menus' },
          { label: 'New Menu', href: '/admin/menus/new' }
        ]"
        class="mb-6"
      />

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Create New Menu
        </h1>
        <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Create a new navigation menu for your site
        </p>
      </div>

      <!-- Form Card -->
      <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
        <MenuForm
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

