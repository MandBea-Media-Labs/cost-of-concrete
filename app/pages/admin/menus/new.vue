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

// Conflict dialog state
const showConflictDialog = ref(false)
const conflictingMenu = ref<{ id: string; name: string } | null>(null)
const pendingFormData = ref<MenuFormData | null>(null)

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

    // Get status code (can be statusCode or status depending on error type)
    const statusCode = error?.statusCode || error?.status

    // Handle location conflict (409)
    // Note: error.data.data.conflictingMenu because H3 error wraps data in another data property
    if (statusCode === 409 && error?.data?.data?.conflictingMenu) {
      if (import.meta.client && import.meta.dev) {
        consola.info('[CreateMenu] Location conflict detected:', error.data.data.conflictingMenu)
      }
      conflictingMenu.value = error.data.data.conflictingMenu
      pendingFormData.value = formData
      showConflictDialog.value = true
      isSubmitting.value = false
      return
    }

    // Handle footer dropdown validation error
    if (error?.data?.message?.includes('dropdown items') || error?.message?.includes('dropdown items')) {
      toast.error(error?.data?.message || error.message)
      isSubmitting.value = false
      return
    }

    // Show user-friendly error message
    const errorMessage = error?.data?.message || error?.message
    if (errorMessage?.includes('duplicate') || errorMessage?.includes('slug')) {
      toast.error('A menu with this slug already exists')
    } else {
      toast.error(errorMessage || 'Failed to create menu')
    }
  } finally {
    if (!showConflictDialog.value) {
      isSubmitting.value = false
    }
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  router.push('/admin/menus')
}

// =====================================================
// CONFLICT DIALOG HANDLERS
// =====================================================

/**
 * Handle force create when user confirms location conflict
 */
async function handleForceCreate() {
  if (!pendingFormData.value) return

  try {
    const input = mapFormDataToApiInput(pendingFormData.value)

    if (import.meta.client && import.meta.dev) {
      consola.info('[CreateMenu] Force creating with input:', input)
    }

    // Call API with force=true
    const newMenu = await createMenu(input, true)

    if (newMenu) {
      toast.success('Menu created successfully')
      router.push('/admin/menus')
    } else {
      toast.error('Failed to create menu')
    }
  } catch (error: any) {
    consola.error('[CreateMenu] Force create error:', error)
    toast.error(error?.message || 'Failed to create menu')
  } finally {
    showConflictDialog.value = false
    conflictingMenu.value = null
    pendingFormData.value = null
    isSubmitting.value = false
  }
}

/**
 * Handle conflict dialog cancellation
 */
function handleCancelConflict() {
  showConflictDialog.value = false
  conflictingMenu.value = null
  pendingFormData.value = null
  isSubmitting.value = false
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

      <!-- Location Conflict Dialog -->
      <Dialog
        :open="showConflictDialog"
        title="Location Conflict"
        :description="`Menu '${conflictingMenu?.name}' is currently assigned to this location. Assigning this menu will disable '${conflictingMenu?.name}'. Continue?`"
        @close="handleCancelConflict"
      >
        <template #actions>
          <Button
            text="Cancel"
            variant="ghost"
            @click="handleCancelConflict"
          />
          <Button
            text="Continue"
            variant="primary"
            @click="handleForceCreate"
          />
        </template>
      </Dialog>
    </div>
  </div>
</template>

