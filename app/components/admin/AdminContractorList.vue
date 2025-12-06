<script setup lang="ts">
import type { ContractorWithCity } from '~/composables/useAdminContractors'

interface Props {
  /** Array of contractors to display */
  contractors: ContractorWithCity[]
  /** Loading state */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Emits
const emit = defineEmits<{
  edit: [contractorId: string]
  view: [contractorId: string]
  delete: [contractorId: string]
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

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400'
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400'
    case 'suspended':
      return 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400'
  }
}

// Format rating display
const formatRating = (rating: number | null) => {
  if (!rating) return '-'
  return rating.toFixed(1)
}

// Format review count
const formatReviewCount = (count: number | null) => {
  if (!count) return '-'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
  return count.toString()
}

// Get city display string
const getCityDisplay = (contractor: ContractorWithCity) => {
  if (!contractor.city) return '-'
  return `${contractor.city.name}, ${contractor.city.state_code}`
}

// Handle action clicks
const handleEdit = (id: string) => emit('edit', id)
const handleView = (id: string) => emit('view', id)
const handleDelete = (id: string) => emit('delete', id)
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-3">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
        <p class="text-sm text-neutral-600 dark:text-neutral-400">Loading contractors...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="contractors.length === 0" class="flex flex-col items-center justify-center py-12 px-4">
      <Icon name="heroicons:building-office-2" class="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4" />
      <h3 class="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No contractors found</h3>
      <p class="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md">
        No contractors match your current filters. Try adjusting your search or filters, or import new contractors.
      </p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
      <table class="w-full">
        <!-- Table Header -->
        <thead class="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Company</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden md:table-cell">City</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Rating</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider hidden xl:table-cell">Updated</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
          <tr v-for="contractor in contractors" :key="contractor.id" class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
            <!-- Company Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">{{ contractor.company_name }}</span>
                <span v-if="contractor.phone" class="text-xs text-neutral-500 dark:text-neutral-400">{{ contractor.phone }}</span>
              </div>
            </td>

            <!-- City -->
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ getCityDisplay(contractor) }}</span>
            </td>

            <!-- Rating -->
            <td class="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
              <div class="flex items-center gap-1">
                <Icon v-if="contractor.rating" name="heroicons:star-solid" class="h-4 w-4 text-yellow-500" />
                <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ formatRating(contractor.rating) }}</span>
                <span v-if="contractor.review_count" class="text-xs text-neutral-400 dark:text-neutral-500">({{ formatReviewCount(contractor.review_count) }})</span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <Badge :text="contractor.status" variant="ghost" size="sm" :class="getStatusColor(contractor.status)" />
            </td>

            <!-- Updated -->
            <td class="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
              <span class="text-sm text-neutral-600 dark:text-neutral-400">{{ formatDate(contractor.updated_at) }}</span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <TableActionsMenu
                :actions="[
                  { label: 'View', icon: 'heroicons:eye', onClick: () => handleView(contractor.id) },
                  { label: 'Edit', icon: 'heroicons:pencil', onClick: () => handleEdit(contractor.id) },
                  { label: 'Delete', icon: 'heroicons:trash', onClick: () => handleDelete(contractor.id), variant: 'danger' }
                ]"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

