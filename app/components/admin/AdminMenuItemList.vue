<script setup lang="ts">
import type { Database } from '~/types/supabase'
import { useSortable } from '@vueuse/integrations/useSortable'
import { ref, watch } from 'vue'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface Props {
  /**
   * Array of menu items to display
   */
  menuItems: MenuItem[]

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
  addChild: [parentId: string]
  edit: [itemId: string]
  delete: [itemId: string]
  reorder: [updates: Array<{ id: string; display_order: number }>]
  toggleEnabled: [itemId: string, value: boolean]
}>()

// Get link type display
const getLinkTypeDisplay = (item: MenuItem) => {
  if (item.page_id) return 'Page Link'
  if (item.custom_url) return 'Custom URL'
  return 'Unknown'
}

// Get link type color
const getLinkTypeColor = (item: MenuItem) => {
  if (item.page_id) return 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
  if (item.custom_url) return 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400'
  return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
}

// Calculate indentation based on parent_id
const getIndentation = (item: MenuItem) => {
  return item.parent_id ? 20 : 0 // 20px for children
}

// Handle action clicks
const handleAddChild = (parentId: string) => {
  emit('addChild', parentId)
}

const handleEdit = (itemId: string) => {
  emit('edit', itemId)
}

const handleDelete = (itemId: string) => {
  emit('delete', itemId)
}

const handleToggleEnabled = (itemId: string, value: boolean) => {
  emit('toggleEnabled', itemId, value)
}

// Drag and Drop Implementation
const el = ref<HTMLElement | null>(null)
const localItems = ref<MenuItem[]>([...props.menuItems])
const isReordering = ref(false)

// Watch for prop changes to update local state
watch(() => props.menuItems, (newItems) => {
  localItems.value = [...newItems]
}, { deep: true })

const { sortable } = useSortable(el, localItems, {
  handle: '.drag-handle',
  animation: 150,
  ghostClass: 'bg-blue-50',
  dragClass: 'opacity-50',
  onMove: (evt) => {
    // Only allow dragging within same parent
    const draggedParentId = evt.dragged.dataset.parentId || ''
    const targetParentId = evt.related.dataset.parentId || ''
    return draggedParentId === targetParentId
  },
  onEnd: async (evt) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) return

    isReordering.value = true
    try {
      // Get the moved item
      const movedItem = localItems.value[newIndex]
      const parentId = movedItem.parent_id

      // Filter items that belong to this parent
      const siblings = localItems.value.filter(item => item.parent_id === parentId)

      // Create updates array
      const updates = siblings.map((item, index) => ({
        id: item.id,
        display_order: index
      }))

      emit('reorder', updates)
    } catch (error) {
      console.error('Failed to reorder menu items:', error)
      // Revert changes if failed
      localItems.value = [...props.menuItems]
    } finally {
      isReordering.value = false
    }
  }
})
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
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading menu items...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="menuItems.length === 0"
      class="flex flex-col items-center justify-center py-12 px-4"
    >
      <Icon
        name="heroicons:list-bullet"
        class="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4"
      />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        No menu items found
      </h3>
      <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-md">
        Get started by adding your first menu item. You can create parent items and nest child items under them.
      </p>
    </div>

    <!-- Menu Item Table -->
    <div
      v-else
      class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700"
    >
      <table class="w-full">
        <!-- Table Header -->
        <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="w-10 px-3 py-3" />
            <!-- Drag handle column -->
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Label
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Link Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hidden md:table-cell">
              Link
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Enabled
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody
          ref="el"
          class="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900"
        >
          <tr
            v-for="item in localItems"
            :key="item.id"
            :data-parent-id="item.parent_id || ''"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <!-- Drag Handle -->
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <button
                type="button"
                class="drag-handle cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded touch-none"
                title="Drag to reorder"
              >
                <Icon
                  name="heroicons:bars-3"
                  class="h-5 w-5"
                />
              </button>
            </td>

            <!-- Label (with indentation) -->
            <td class="px-6 py-4">
              <div
                class="flex items-center gap-2"
                :style="{ paddingLeft: `${getIndentation(item)}px` }"
              >
                <!-- Hierarchy indicator -->
                <Icon
                  v-if="item.parent_id"
                  name="heroicons:chevron-right"
                  class="h-4 w-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
                />

                <div class="flex flex-col">
                  <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {{ item.label }}
                  </span>
                  <span
                    v-if="item.description"
                    class="text-xs text-neutral-500 dark:text-neutral-400 mt-1"
                  >
                    {{ item.description }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Link Type -->
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="getLinkTypeColor(item)"
              >
                {{ getLinkTypeDisplay(item) }}
              </span>
            </td>

            <!-- Link -->
            <td class="px-6 py-4 hidden md:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400 truncate max-w-xs block">
                {{ item.custom_url || 'Page Link' }}
              </span>
            </td>

            <!-- Enabled Toggle -->
            <td class="px-6 py-4 text-center">
              <input
                type="checkbox"
                :checked="item.is_enabled"
                @change="handleToggleEnabled(item.id, !item.is_enabled)"
                class="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
              />
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  v-if="!item.parent_id"
                  @click="handleAddChild(item.id)"
                  class="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
                  title="Add Child Item"
                >
                  Add Child
                </button>
                <button
                  @click="handleEdit(item.id)"
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  title="Edit Item"
                >
                  Edit
                </button>
                <button
                  @click="handleDelete(item.id)"
                  class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                  title="Delete Item"
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

