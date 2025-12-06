<script setup lang="ts">
import { consola } from 'consola'
import type { AdminClaimsFilters, ClaimWithContractor } from '~/composables/useAdminClaims'

// Page metadata
definePageMeta({
  layout: 'admin',
})

// Use admin claims composable
const { claims, pagination, pending, error, fetchClaims, updateClaimStatus } = useAdminClaims()

// Use toast notifications
const toast = useToast()

// Get route for reading query params
const route = useRoute()
const router = useRouter()

// Status filter options
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

// Initialize from URL query params
const getInitialStatus = (): string => {
  const urlStatus = route.query.status as string | undefined
  if (urlStatus && ['pending', 'approved', 'rejected'].includes(urlStatus)) {
    return urlStatus
  }
  return 'pending' // Default to pending for claims
}

const getInitialSearch = (): string => {
  return (route.query.search as string) || ''
}

// Selected filter values - initialized from URL
const selectedStatus = ref<string>(getInitialStatus())
const searchQuery = ref<string>(getInitialSearch())

// Filter state - initialized from URL
const initialSearch = searchQuery.value ?? ''
const filters = ref<AdminClaimsFilters>({
  status: selectedStatus.value === 'all' ? null : selectedStatus.value as 'pending' | 'approved' | 'rejected',
  search: initialSearch.trim().length > 0 ? initialSearch : null,
  page: 1,
  limit: 20,
  orderBy: 'created_at',
  orderDirection: 'desc',
})

// Fetch claims on mount
onMounted(async () => {
  await fetchClaims(filters.value)
})

// Watch for filter changes and sync URL
watch([selectedStatus, searchQuery], async () => {
  const searchValue = searchQuery.value ?? ''
  filters.value.status = selectedStatus.value === 'all' ? null : selectedStatus.value as 'pending' | 'approved' | 'rejected'
  filters.value.search = searchValue.trim().length > 0 ? searchValue : null
  filters.value.page = 1

  // Update URL query params
  const query: Record<string, string> = {}
  if (selectedStatus.value !== 'all') {
    query.status = selectedStatus.value
  }
  if (searchValue.trim()) {
    query.search = searchValue.trim()
  }
  router.replace({ query })

  await fetchClaims(filters.value)
})

// Handle pagination change
const handlePageChange = async (page: number) => {
  filters.value.page = page
  await fetchClaims(filters.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Approve/Reject dialogs
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const claimToProcess = ref<ClaimWithContractor | null>(null)
const rejectNotes = ref('')
const processing = ref(false)

const handleApprove = (claim: ClaimWithContractor) => {
  claimToProcess.value = claim
  showApproveDialog.value = true
}

const handleReject = (claim: ClaimWithContractor) => {
  claimToProcess.value = claim
  rejectNotes.value = ''
  showRejectDialog.value = true
}

const confirmApprove = async () => {
  if (!claimToProcess.value) return
  processing.value = true

  const success = await updateClaimStatus(claimToProcess.value.id, 'approved')

  if (success) {
    toast.success('Claim approved successfully')
    if (import.meta.dev) {
      consola.success('Claim approved:', claimToProcess.value.id)
    }
    await fetchClaims(filters.value)
  } else {
    toast.error('Failed to approve claim')
  }

  processing.value = false
  showApproveDialog.value = false
  claimToProcess.value = null
}

const confirmReject = async () => {
  if (!claimToProcess.value) return
  processing.value = true

  const success = await updateClaimStatus(claimToProcess.value.id, 'rejected', rejectNotes.value || undefined)

  if (success) {
    toast.success('Claim rejected')
    if (import.meta.dev) {
      consola.success('Claim rejected:', claimToProcess.value.id)
    }
    await fetchClaims(filters.value)
  } else {
    toast.error('Failed to reject claim')
  }

  processing.value = false
  showRejectDialog.value = false
  claimToProcess.value = null
  rejectNotes.value = ''
}

const cancelDialog = () => {
  showApproveDialog.value = false
  showRejectDialog.value = false
  claimToProcess.value = null
  rejectNotes.value = ''
}

// Format date helper
const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Status badge styling
const getStatusClasses = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
  }
}
</script>

<template>
  <div class="p-6">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Business Claims</h1>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Review and manage business claiming requests</p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Search Input -->
        <TextInput v-model="searchQuery" label="Search" placeholder="Search by claimant name or email..." icon="heroicons:magnifying-glass" clearable size="md" />

        <!-- Status Filter -->
        <FilterSelect v-model="selectedStatus" label="Status" :options="statusOptions" placeholder="Filter by status" size="md" />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:exclamation-triangle" class="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <h3 class="text-sm font-medium text-red-800 dark:text-red-200">Error loading claims</h3>
          <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <Icon name="heroicons:arrow-path" class="h-8 w-8 animate-spin text-neutral-400" />
    </div>

    <!-- Empty State -->
    <div v-else-if="claims.length === 0" class="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-800">
      <Icon name="heroicons:inbox" class="mx-auto h-12 w-12 text-neutral-400" />
      <h3 class="mt-4 text-lg font-medium text-neutral-900 dark:text-neutral-100">No claims found</h3>
      <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        {{ selectedStatus === 'pending' ? 'No pending claims to review.' : 'No claims match your filters.' }}
      </p>
    </div>

    <!-- Claims List -->
    <div v-else class="space-y-4">
      <div
        v-for="claim in claims"
        :key="claim.id"
        class="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <!-- Claim Info -->
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {{ claim.contractor?.company_name || 'Unknown Business' }}
              </h3>
              <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', getStatusClasses(claim.status)]">
                {{ claim.status }}
              </span>
            </div>

            <div class="mt-3 space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
              <p><span class="font-medium">Claimant:</span> {{ claim.claimant_name || 'Not provided' }}</p>
              <p><span class="font-medium">Email:</span> {{ claim.claimant_email }}</p>
              <p v-if="claim.claimant_phone"><span class="font-medium">Phone:</span> {{ claim.claimant_phone }}</p>
              <p><span class="font-medium">Submitted:</span> {{ formatDate(claim.created_at) }}</p>
              <p v-if="claim.contractor?.email">
                <span class="font-medium">Business Email:</span> {{ claim.contractor.email }}
                <span v-if="claim.claimant_email === claim.contractor.email" class="ml-2 inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <Icon name="heroicons:check-circle" class="mr-0.5 h-3 w-3" /> Match
                </span>
              </p>
              <p v-if="claim.admin_notes" class="mt-2 rounded bg-neutral-100 p-2 dark:bg-neutral-700">
                <span class="font-medium">Admin Notes:</span> {{ claim.admin_notes }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="claim.status === 'pending'" class="flex gap-2 sm:flex-col">
            <Button text="Approve" variant="primary" size="sm" icon="heroicons:check" @click="handleApprove(claim)" />
            <Button text="Reject" variant="secondary-outline" size="sm" icon="heroicons:x-mark" @click="handleReject(claim)" />
          </div>
          <div v-else class="text-sm text-neutral-500 dark:text-neutral-400">
            <p>Reviewed: {{ formatDate(claim.reviewed_at) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!pending && claims.length > 0" class="mt-6 flex justify-center">
      <Pagination
        :current-page="pagination.page"
        :total-pages="pagination.totalPages"
        :max-visible-pages="5"
        size="md"
        :show-page-numbers="true"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Results Summary -->
    <div v-if="!pending && claims.length > 0" class="mt-4 text-center text-sm text-neutral-600 dark:text-neutral-400">
      Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
      {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
      {{ pagination.total }} claims
    </div>

    <!-- Approve Confirmation Dialog -->
    <Dialog v-model:open="showApproveDialog" title="Approve Claim" :description="`Approve this claim for ${claimToProcess?.contractor?.company_name || 'this business'}? The business will be marked as claimed.`">
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button text="Cancel" variant="ghost" size="md" :disabled="processing" @click="cancelDialog" />
          <Button text="Approve" variant="primary" size="md" :disabled="processing" @click="confirmApprove" />
        </div>
      </template>
    </Dialog>

    <!-- Reject Confirmation Dialog -->
    <Dialog v-model:open="showRejectDialog" title="Reject Claim" :description="`Reject this claim for ${claimToProcess?.contractor?.company_name || 'this business'}?`">
      <div class="mt-4">
        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Rejection Notes (optional)
        </label>
        <textarea
          v-model="rejectNotes"
          rows="3"
          class="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-500"
          placeholder="Reason for rejection..."
        />
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <Button text="Cancel" variant="ghost" size="md" :disabled="processing" @click="cancelDialog" />
          <Button text="Reject" variant="primary" size="md" :disabled="processing" @click="confirmReject" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

