<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
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

// Get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'pending':
      return 'warning'
    case 'suspended':
      return 'destructive'
    default:
      return 'secondary'
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
    <!-- Table -->
    <div class="overflow-x-auto rounded-md border">
      <table class="w-full text-sm">
        <!-- Table Header -->
        <thead class="border-b bg-muted/50">
          <tr>
            <th class="px-4 py-3 text-left font-medium">Company</th>
            <th class="hidden px-4 py-3 text-left font-medium md:table-cell">City</th>
            <th class="hidden px-4 py-3 text-left font-medium lg:table-cell">Rating</th>
            <th class="px-4 py-3 text-left font-medium">Status</th>
            <th class="hidden px-4 py-3 text-left font-medium xl:table-cell">Updated</th>
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody v-auto-animate>
          <!-- Loading State -->
          <tr v-if="loading && contractors.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
              <Icon name="heroicons:arrow-path" class="size-5 mx-auto mb-2 animate-spin" />
              Loading contractors...
            </td>
          </tr>
          <!-- Empty State -->
          <tr v-else-if="contractors.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
              No contractors found matching the filters.
            </td>
          </tr>
          <!-- Data Rows -->
          <tr v-for="contractor in contractors" :key="contractor.id" class="border-b last:border-0 hover:bg-muted/50">
            <!-- Company Name -->
            <td class="px-4 py-3">
              <div class="flex flex-col">
                <span class="max-w-xs truncate font-medium">{{ contractor.company_name }}</span>
                <span v-if="contractor.phone" class="text-xs text-muted-foreground">{{ contractor.phone }}</span>
              </div>
            </td>

            <!-- City -->
            <td class="hidden px-4 py-3 md:table-cell">
              <span class="text-muted-foreground">{{ getCityDisplay(contractor) }}</span>
            </td>

            <!-- Rating -->
            <td class="hidden px-4 py-3 lg:table-cell">
              <div class="flex items-center gap-1">
                <Icon v-if="contractor.rating" name="heroicons:star-solid" class="size-4 text-yellow-500" />
                <span class="text-muted-foreground">{{ formatRating(contractor.rating) }}</span>
                <span v-if="contractor.review_count" class="text-xs text-muted-foreground">({{ formatReviewCount(contractor.review_count) }})</span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-4 py-3">
              <UiBadge :variant="getStatusVariant(contractor.status)">
                {{ contractor.status }}
              </UiBadge>
            </td>

            <!-- Updated -->
            <td class="hidden px-4 py-3 xl:table-cell">
              <span class="text-muted-foreground">{{ formatDate(contractor.updated_at) }}</span>
            </td>

            <!-- Actions -->
            <td class="px-4 py-3 text-right">
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

