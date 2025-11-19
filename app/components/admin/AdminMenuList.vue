<script setup lang="ts">
import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']

interface Props {
  /**
   * Array of menus to display
   */
  menus: Menu[]

  /**
   * Loading state
   */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  edit: [menuId: string]
  delete: [menuId: string]
  toggleHeader: [menuId: string, value: boolean]
  toggleFooter: [menuId: string, value: boolean]
  toggleEnabled: [menuId: string, value: boolean]
  manageItems: [menuId: string]
}>()

// Format date for display
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Never'

  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`

  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Handle action clicks
const handleEdit = (menuId: string) => {
  emit('edit', menuId)
}

const handleDelete = (menuId: string) => {
  emit('delete', menuId)
}

const handleManageItems = (menuId: string) => {
  emit('manageItems', menuId)
}

const handleToggleHeader = (menuId: string, value: boolean) => {
  emit('toggleHeader', menuId, value)
}

const handleToggleFooter = (menuId: string, value: boolean) => {
  emit('toggleFooter', menuId, value)
}

const handleToggleEnabled = (menuId: string, value: boolean) => {
  emit('toggleEnabled', menuId, value)
}
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading menus...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="menus.length === 0"
      class="flex flex-col items-center justify-center py-12 px-4"
    >
      <Icon
        name="heroicons:bars-3"
        class="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4"
      />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        No menus found
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-md">
        Get started by creating your first menu. Menus can be displayed in the header, footer, or both.
      </p>
    </div>

    <!-- Menu Table -->
    <div
      v-else
      class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700"
    >
      <table class="w-full">
        <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Slug
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Header
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Footer
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Enabled
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Updated
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
          <tr
            v-for="menu in menus"
            :key="menu.id"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <!-- Name -->
            <td class="px-6 py-4">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {{ menu.name }}
                </span>
                <span
                  v-if="menu.description"
                  class="text-xs text-neutral-500 dark:text-neutral-400 mt-1"
                >
                  {{ menu.description }}
                </span>
              </div>
            </td>

            <!-- Slug -->
            <td class="px-6 py-4">
              <code class="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-700 dark:text-neutral-300">
                {{ menu.slug }}
              </code>
            </td>

            <!-- Header Toggle -->
            <td class="px-6 py-4 text-center">
              <input
                type="checkbox"
                :checked="menu.show_in_header"
                @change="handleToggleHeader(menu.id, !menu.show_in_header)"
                class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </td>

            <!-- Footer Toggle -->
            <td class="px-6 py-4 text-center">
              <input
                type="checkbox"
                :checked="menu.show_in_footer"
                @change="handleToggleFooter(menu.id, !menu.show_in_footer)"
                class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </td>

            <!-- Enabled Toggle -->
            <td class="px-6 py-4 text-center">
              <input
                type="checkbox"
                :checked="menu.is_enabled"
                @change="handleToggleEnabled(menu.id, !menu.is_enabled)"
                class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </td>

            <!-- Updated -->
            <td class="px-6 py-4">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ formatDate(menu.updated_at) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="handleManageItems(menu.id)"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  title="Manage Items"
                >
                  Items
                </button>
                <button
                  @click="handleEdit(menu.id)"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  title="Edit Menu"
                >
                  Edit
                </button>
                <button
                  @click="handleDelete(menu.id)"
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  title="Delete Menu"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

