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

// Get location text for badge
const getLocationText = (menu: Menu) => {
  if (menu.show_in_header) return 'Header'
  if (menu.show_in_footer) return 'Footer'
  return 'None'
}

// Get location color classes for badge
const getLocationColor = (menu: Menu) => {
  if (menu.show_in_header) {
    return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20'
  }
  if (menu.show_in_footer) {
    return 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/20'
  }
  return 'text-neutral-500 bg-neutral-100 dark:text-neutral-400 dark:bg-neutral-800'
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
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Location
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

            <!-- Location Badge -->
            <td class="px-6 py-4 whitespace-nowrap">
              <Badge
                :text="getLocationText(menu)"
                variant="ghost"
                size="sm"
                :class="getLocationColor(menu)"
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
              <TableActionsMenu
                :actions="[
                  {
                    label: 'Add Links',
                    icon: 'heroicons:list-bullet',
                    onClick: () => handleManageItems(menu.id)
                  },
                  {
                    label: 'Edit',
                    icon: 'heroicons:pencil',
                    onClick: () => handleEdit(menu.id)
                  },
                  {
                    label: 'Delete',
                    icon: 'heroicons:trash',
                    onClick: () => handleDelete(menu.id),
                    variant: 'danger'
                  }
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

