<script setup lang="ts">
import { consola } from 'consola'
import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']

// Page metadata
definePageMeta({
  layout: 'admin'
})

// Use composables
const { listMenus, updateMenu, deleteMenu } = useMenus()
const toast = useToast()

// State
const menus = ref<Menu[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

// Fetch menus on mount
const fetchMenus = async () => {
  try {
    loading.value = true
    error.value = null
    menus.value = await listMenus()
  } catch (err) {
    error.value = err as Error
    consola.error('Error fetching menus:', err)
    toast.error('Failed to load menus')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchMenus()
})

// Handle edit action
const handleEdit = (menuId: string) => {
  navigateTo(`/admin/menus/${menuId}/edit`)
}

// Handle manage items action
const handleManageItems = (menuId: string) => {
  navigateTo(`/admin/menus/${menuId}/items`)
}

// Handle delete action
const showDeleteDialog = ref(false)
const menuToDelete = ref<string | null>(null)

const handleDelete = (menuId: string) => {
  menuToDelete.value = menuId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!menuToDelete.value) return

  const success = await deleteMenu(menuToDelete.value)

  if (success) {
    toast.success('Menu deleted successfully')
    await fetchMenus() // Refresh list
  } else {
    toast.error('Failed to delete menu')
  }

  showDeleteDialog.value = false
  menuToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  menuToDelete.value = null
}

// Handle toggle actions
const handleToggleHeader = async (menuId: string, value: boolean) => {
  try {
    await updateMenu(menuId, { show_in_header: value })
    toast.success(`Menu ${value ? 'added to' : 'removed from'} header`)
    await fetchMenus() // Refresh list
  } catch (err) {
    consola.error('Error toggling header:', err)
    toast.error('Failed to update menu')
  }
}

const handleToggleFooter = async (menuId: string, value: boolean) => {
  try {
    await updateMenu(menuId, { show_in_footer: value })
    toast.success(`Menu ${value ? 'added to' : 'removed from'} footer`)
    await fetchMenus() // Refresh list
  } catch (err) {
    consola.error('Error toggling footer:', err)
    toast.error('Failed to update menu')
  }
}

const handleToggleEnabled = async (menuId: string, value: boolean) => {
  try {
    await updateMenu(menuId, { is_enabled: value })
    toast.success(`Menu ${value ? 'enabled' : 'disabled'}`)
    await fetchMenus() // Refresh list
  } catch (err) {
    consola.error('Error toggling enabled:', err)
    toast.error('Failed to update menu')
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Menus
          </h1>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Manage navigation menus for your site
          </p>
        </div>

        <!-- Create Menu Button -->
        <Button
          text="Create Menu"
          location="/admin/menus/new"
          variant="primary"
          size="md"
        />
      </div>

      <!-- Menu List -->
      <AdminMenuList
        :menus="menus"
        :loading="loading"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-header="handleToggleHeader"
        @toggle-footer="handleToggleFooter"
        @toggle-enabled="handleToggleEnabled"
        @manage-items="handleManageItems"
      />

      <!-- Delete Confirmation Dialog -->
      <Dialog
        :open="showDeleteDialog"
        title="Delete Menu"
        description="Are you sure you want to delete this menu? This action cannot be undone."
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
    </div>
  </div>
</template>

