<script setup lang="ts">
import { ref, computed } from 'vue'
import { consola } from 'consola'
import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']
type MenuItem = Database['public']['Tables']['menu_items']['Row']

// =====================================================
// PAGE METADATA
// =====================================================

definePageMeta({
  layout: 'admin'
})

useHead({
  title: 'Manage Menu Items - Admin'
})

// =====================================================
// STATE
// =====================================================

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { listMenus } = useMenus()
const { deleteMenuItem, reorderMenuItems } = useMenuItems()

const menuId = computed(() => route.params.id as string)
const menu = ref<Menu | null>(null)
const menuItems = ref<MenuItem[]>([])
const loading = ref(true)

// =====================================================
// FETCH DATA
// =====================================================

async function fetchMenuData() {
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

    // Fetch menu items
    await fetchMenuItems()
  } catch (error) {
    consola.error('[MenuItems] Error fetching data:', error)
    toast.error('Failed to load menu data')
  } finally {
    loading.value = false
  }
}

async function fetchMenuItems() {
  try {
    const response = await $fetch<{ success: boolean; data: MenuItem[] }>(`/api/menus/${menuId.value}/items`)
    if (response.success) {
      menuItems.value = response.data
    }
  } catch (error) {
    consola.error('[MenuItems] Error fetching items:', error)
    throw error
  }
}

onMounted(async () => {
  await fetchMenuData()
})

// =====================================================
// ACTIONS
// =====================================================

// Handle add dropdown menu (top-level, no link)
const handleAddDropdownMenu = () => {
  router.push(`/admin/menus/${menuId.value}/items/new?type=dropdown`)
}

// Handle add top-level link
const handleAddTopLevelLink = () => {
  router.push(`/admin/menus/${menuId.value}/items/new?type=link`)
}

// Handle add child link (under a dropdown)
const handleAddChildLink = (parentId: string) => {
  router.push(`/admin/menus/${menuId.value}/items/new?type=link&parentId=${parentId}`)
}

// Handle edit item
const handleEditItem = (itemId: string) => {
  router.push(`/admin/menus/${menuId.value}/items/${itemId}/edit`)
}

// Handle delete item
const showDeleteDialog = ref(false)
const itemToDelete = ref<string | null>(null)

const handleDeleteItem = (itemId: string) => {
  itemToDelete.value = itemId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return

  const success = await deleteMenuItem(itemToDelete.value)

  if (success) {
    toast.success('Menu item deleted successfully')
    await fetchMenuItems() // Refresh list
  } else {
    toast.error('Failed to delete menu item')
  }

  showDeleteDialog.value = false
  itemToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  itemToDelete.value = null
}

// Handle reorder
const handleReorder = async (updates: Array<{ id: string; display_order: number }>) => {
  try {
    await reorderMenuItems(updates)
    toast.success('Menu items reordered successfully')
    await fetchMenuItems() // Refresh list
  } catch (error) {
    consola.error('[MenuItems] Error reordering:', error)
    toast.error('Failed to reorder menu items')
  }
}

// Handle toggle enabled
const handleToggleEnabled = async (itemId: string, value: boolean) => {
  try {
    await $fetch(`/api/menu-items/${itemId}`, {
      method: 'PATCH',
      body: { is_enabled: value }
    })
    toast.success(`Menu item ${value ? 'enabled' : 'disabled'}`)
    await fetchMenuItems() // Refresh list
  } catch (error) {
    consola.error('[MenuItems] Error toggling enabled:', error)
    toast.error('Failed to update menu item')
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-12"
      >
        <div class="flex flex-col items-center gap-3">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
          <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading menu items...</p>
        </div>
      </div>

      <!-- Content -->
      <template v-else-if="menu">
        <!-- Breadcrumbs -->
        <AdminBreadcrumbs
          :items="[
            { label: 'Admin', href: '/admin' },
            { label: 'Menus', href: '/admin/menus' },
            { label: menu.name, href: `/admin/menus/${menu.id}/items` }
          ]"
          class="mb-6"
        />

        <!-- Header -->
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {{ menu.name }} - Menu Items
            </h1>
            <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Manage navigation items for this menu
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <!-- Hide "Add Dropdown Menu" button for footer menus -->
            <Button
              v-if="!menu.show_in_footer"
              text="Add Dropdown Menu"
              variant="secondary"
              size="md"
              @click="handleAddDropdownMenu"
            />
            <Button
              text="Add Link"
              variant="primary"
              size="md"
              @click="handleAddTopLevelLink"
            />
          </div>
        </div>

        <!-- Menu Item List -->
        <AdminMenuItemList
          :menu-items="menuItems"
          :loading="loading"
          @add-child-link="handleAddChildLink"
          @edit="handleEditItem"
          @delete="handleDeleteItem"
          @reorder="handleReorder"
          @toggle-enabled="handleToggleEnabled"
        />

        <!-- Delete Confirmation Dialog -->
        <Dialog
          :open="showDeleteDialog"
          title="Delete Menu Item"
          description="Are you sure you want to delete this menu item? This action cannot be undone."
          @close="cancelDelete"
        >
          <template #actions>
            <Button
              text="Cancel"
              variant="ghost"
              @click="cancelDelete"
            />
            <Button
              text="Delete"
              variant="danger"
              @click="confirmDelete"
            />
          </template>
        </Dialog>
      </template>
    </div>
  </div>
</template>

