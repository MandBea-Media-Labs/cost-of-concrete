<script setup lang="ts">
import { ref, computed } from 'vue'
import { consola } from 'consola'
import type { MenuItemFormData } from '~/schemas/admin/menu-item-form.schema'
import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']
type Page = Database['public']['Tables']['pages']['Row']

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Create Menu Item - Admin'
})

// =====================================================
// STATE
// =====================================================

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { listMenus } = useMenus()
const { createMenuItem } = useMenuItems()
const { pages: pagesComposable } = useAdminPages()

const menuId = computed(() => route.params.menuId as string)
const parentIdFromQuery = computed(() => route.query.parentId as string | undefined)

const menu = ref<Menu | null>(null)
const menuItems = ref<MenuItem[]>([])
const pages = ref<Page[]>([])
const loading = ref(true)
const isSubmitting = ref(false)

// =====================================================
// FETCH DATA
// =====================================================

async function fetchData() {
  try {
    loading.value = true

    // Fetch menu
    const menus = await listMenus()
    menu.value = menus.find(m => m.id === menuId.value) || null

    if (!menu.value) {
      toast.error('Menu not found')
      router.push('/admin/menus')
      return
    }

    // Fetch menu items (for parent dropdown)
    const itemsResponse = await $fetch<{ success: boolean; data: MenuItem[] }>(`/api/menus/${menuId.value}/items`)
    if (itemsResponse.success) {
      // Only show top-level items as parent options (1-level depth limit)
      menuItems.value = itemsResponse.data.filter(item => item.parent_id === null)
    }

    // Fetch published pages (for page link dropdown)
    await pagesComposable.fetchPages({ status: 'published', limit: 100 })
    pages.value = pagesComposable.pages.value
  } catch (error) {
    consola.error('[CreateMenuItem] Error fetching data:', error)
    toast.error('Failed to load data')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchData()
})

// =====================================================
// INITIAL FORM DATA
// =====================================================

const initialFormData = computed(() => {
  const data: Partial<MenuItemFormData> = {}

  // Set parent_id from query param if provided
  if (parentIdFromQuery.value) {
    data.parent_id = parentIdFromQuery.value
  }

  return data
})

// =====================================================
// FORM SUBMISSION
// =====================================================

/**
 * Map MenuItemFormData to CreateMenuItemInput for API
 */
function mapFormDataToApiInput(formData: MenuItemFormData) {
  return {
    link_type: formData.link_type,
    page_id: formData.page_id || undefined,
    custom_url: formData.custom_url || undefined,
    label: formData.label,
    description: formData.description || undefined,
    parent_id: formData.parent_id || undefined,
    open_in_new_tab: formData.open_in_new_tab,
    is_enabled: formData.is_enabled,
    display_order: formData.display_order || undefined,
    metadata: formData.metadata || undefined
  }
}

/**
 * Handle form submission
 */
async function handleSubmit(formData: MenuItemFormData) {
  if (import.meta.client && import.meta.dev) {
    consola.info('[CreateMenuItem] Form submitted:', formData)
  }

  isSubmitting.value = true

  try {
    const input = mapFormDataToApiInput(formData)

    if (import.meta.client && import.meta.dev) {
      consola.info('[CreateMenuItem] API input:', input)
    }

    const newItem = await createMenuItem(menuId.value, input)

    if (newItem) {
      toast.success('Menu item created successfully')

      // Redirect to menu items list
      router.push(`/admin/menus/${menuId.value}/items`)
    } else {
      toast.error('Failed to create menu item')
    }
  } catch (error: any) {
    consola.error('[CreateMenuItem] Error:', error)

    // Show user-friendly error message
    if (error?.message?.includes('depth') || error?.message?.includes('nested')) {
      toast.error('Cannot create nested items more than 1 level deep')
    } else {
      toast.error(error?.message || 'Failed to create menu item')
    }
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handle form cancellation
 */
function handleCancel() {
  router.push(`/admin/menus/${menuId.value}/items`)
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-12"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>

      <!-- Form -->
      <template v-else-if="menu">
        <!-- Breadcrumbs -->
        <AdminBreadcrumbs
          :items="[
            { label: 'Admin', href: '/admin' },
            { label: 'Menus', href: '/admin/menus' },
            { label: menu.name, href: `/admin/menus/${menu.id}/items` },
            { label: 'New Item', href: `/admin/menus/${menu.id}/items/new` }
          ]"
          class="mb-6"
        />

        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Create Menu Item
          </h1>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Add a new item to {{ menu.name }}
          </p>
        </div>

        <!-- Form Card -->
        <div class="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
          <MenuItemForm
            :menu-id="menuId"
            :initial-data="initialFormData"
            :parent-items="menuItems"
            :pages="pages"
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </div>
      </template>
    </div>
  </div>
</template>

