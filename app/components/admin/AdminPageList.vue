<script setup lang="ts">
import type { Database } from '~/types/supabase'
import { useSortable } from '@vueuse/integrations/useSortable'
import { ref, watch } from 'vue'

type Page = Database['public']['Tables']['pages']['Row']

interface Props {
  /**
   * Array of pages to display
   */
  pages: Page[]

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
  edit: [pageId: string]
  view: [fullPath: string]
  delete: [pageId: string]
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

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'published':
      return 'primary-outline'
    case 'draft':
      return 'secondary-outline'
    case 'archived':
      return 'ghost'
    default:
      return 'ghost'
  }
}

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
    case 'draft':
      return 'text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400'
    case 'archived':
      return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
    default:
      return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
  }
}

// Get template badge color
const getTemplateColor = (template: string) => {
  switch (template) {
    case 'hub':
      return 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
    case 'spoke':
      return 'text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400'
    case 'sub-spoke':
      return 'text-pink-600 dark:text-pink-400 border-pink-600 dark:border-pink-400'
    case 'article':
      return 'text-orange-600 dark:text-orange-400 border-orange-600 dark:border-orange-400'
    case 'custom':
      return 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400'
    case 'default':
      return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
    default:
      return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
  }
}

// Calculate indentation based on depth
const getIndentation = (depth: number) => {
  return depth * 20 // 20px per level
}

// Handle action clicks
const handleEdit = (pageId: string) => {
  emit('edit', pageId)
}

const handleView = (fullPath: string) => {
  emit('view', fullPath)
}

const handleDelete = (pageId: string) => {
  emit('delete', pageId)
}

// Drag and Drop Implementation
const el = ref<HTMLElement | null>(null)
const localPages = ref<Page[]>([...props.pages])
const isReordering = ref(false)

// Watch for prop changes to update local state
watch(() => props.pages, (newPages) => {
  localPages.value = [...newPages]
}, { deep: true })

const { sortable } = useSortable(el, localPages, {
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

    // Persist to backend
    isReordering.value = true
    try {
      // Prepare payload: we need to send the updated order for all pages
      // or at least the affected siblings.
      // The API expects an array of { id, display_order, parent_id }

      // We need to recalculate display_order for all pages in the affected group
      // But localPages contains ALL pages (flat list).
      // We need to find the parent group of the moved item.
      const movedItem = localPages.value[newIndex]
      const parentId = movedItem.parent_id

      // Filter pages that belong to this parent
      const siblings = localPages.value.filter(p => p.parent_id === parentId)

      const updates = siblings.map((page, index) => ({
        id: page.id,
        display_order: index,
        parent_id: page.parent_id
      }))

      await $fetch('/api/pages/reorder', {
        method: 'PATCH',
        body: { pages: updates }
      })
    } catch (error) {
      console.error('Failed to reorder pages:', error)
      // Revert changes if failed (reload from props)
      localPages.value = [...props.pages]
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
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading pages...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="pages.length === 0"
      class="flex flex-col items-center justify-center py-12 px-4"
    >
      <Icon
        name="heroicons:document-text"
        class="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4"
      />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        No pages found
      </h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
        No pages match your current filters. Try adjusting your search or filters, or create a new page.
      </p>
    </div>

    <!-- Table -->
    <div
      v-else
      class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700"
    >
      <table class="w-full">
        <!-- Table Header -->
        <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="w-10 px-3 py-3"></th> <!-- Drag handle column -->
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Title
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell">
              Slug
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden lg:table-cell">
              Template
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden xl:table-cell">
              Last Modified
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody
          ref="el"
          class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700"
        >
          <tr
            v-for="page in localPages"
            :key="page.id"
            :data-parent-id="page.parent_id || ''"
            class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
          >
            <!-- Drag Handle -->
            <td class="px-3 py-4 whitespace-nowrap text-center">
              <button
                type="button"
                class="drag-handle cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 p-1 rounded touch-none"
                title="Drag to reorder"
              >
                <Icon name="heroicons:bars-3" class="h-5 w-5" />
              </button>
            </td>
            <!-- Title (with indentation) -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                class="flex items-center gap-2"
                :style="{ paddingLeft: `${getIndentation(page.depth)}px` }"
              >
                <!-- Hierarchy indicator -->
                <Icon
                  v-if="page.depth > 0"
                  name="heroicons:chevron-right"
                  class="h-4 w-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0"
                />

                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                  {{ page.title }}
                </span>
              </div>
            </td>

            <!-- Slug -->
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400 font-mono truncate max-w-xs block">
                {{ page.slug }}
              </span>
            </td>

            <!-- Template -->
            <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
              <Badge
                :text="page.template"
                variant="ghost"
                size="sm"
                :class="getTemplateColor(page.template)"
              />
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <Badge
                :text="page.status"
                variant="ghost"
                size="sm"
                :class="getStatusColor(page.status)"
              />
            </td>

            <!-- Last Modified -->
            <td class="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">
                {{ formatDate(page.updated_at) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <TableActionsMenu
                :actions="[
                  {
                    label: 'View',
                    icon: 'heroicons:eye',
                    onClick: () => handleView(page.full_path)
                  },
                  {
                    label: 'Edit',
                    icon: 'heroicons:pencil',
                    onClick: () => handleEdit(page.id)
                  },
                  {
                    label: 'Delete',
                    icon: 'heroicons:trash',
                    onClick: () => handleDelete(page.id),
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

<style scoped>
/* Additional styles if needed */
</style>

