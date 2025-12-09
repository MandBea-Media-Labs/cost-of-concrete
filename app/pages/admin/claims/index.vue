<script setup lang="ts">
import { consola } from 'consola'
import { toast } from 'vue-sonner'
import type { AdminClaimsFilters, ClaimWithContractor } from '~/composables/useAdminClaims'

// Page metadata
definePageMeta({
  layout: 'admin-new',
})

// Use admin claims composable
const { claims, pagination, pending, error, fetchClaims, updateClaimStatus } = useAdminClaims()

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
          <h1 class="text-2xl font-bold text-foreground">Business Claims</h1>
          <p class="mt-1 text-sm text-muted-foreground">Review and manage business claiming requests</p>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <UiCard class="mb-6">
      <UiCardContent class="pt-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Search Input -->
          <TextInput v-model="searchQuery" label="Search" placeholder="Search by claimant name or email..." icon="heroicons:magnifying-glass" clearable size="md" />

          <!-- Status Filter -->
          <FilterSelect v-model="selectedStatus" label="Status" :options="statusOptions" placeholder="Filter by status" size="md" />
        </div>
      </UiCardContent>
    </UiCard>

    <!-- Error State -->
    <div v-if="error" class="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:exclamation-triangle" class="mt-0.5 size-5 flex-shrink-0 text-destructive" />
        <div>
          <h3 class="text-sm font-medium text-destructive">Error loading claims</h3>
          <p class="mt-1 text-sm text-destructive/80">{{ error.message }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <UiSpinner class="size-8" />
    </div>

    <!-- Empty State -->
    <UiCard v-else-if="claims.length === 0" class="p-12 text-center">
      <Icon name="heroicons:inbox" class="mx-auto size-12 text-muted-foreground" />
      <h3 class="mt-4 text-lg font-medium text-foreground">No claims found</h3>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ selectedStatus === 'pending' ? 'No pending claims to review.' : 'No claims match your filters.' }}
      </p>
    </UiCard>

    <!-- Claims List -->
    <div v-else class="space-y-4">
      <UiCard v-for="claim in claims" :key="claim.id">
        <UiCardContent class="pt-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <!-- Claim Info -->
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-foreground">
                  {{ claim.contractor?.company_name || 'Unknown Business' }}
                </h3>
                <UiBadge :variant="claim.status === 'approved' ? 'default' : claim.status === 'rejected' ? 'destructive' : 'secondary'">
                  {{ claim.status }}
                </UiBadge>
              </div>

              <div class="mt-3 space-y-1 text-sm text-muted-foreground">
                <p><span class="font-medium">Claimant:</span> {{ claim.claimant_name || 'Not provided' }}</p>
                <p><span class="font-medium">Email:</span> {{ claim.claimant_email }}</p>
                <p v-if="claim.claimant_phone"><span class="font-medium">Phone:</span> {{ claim.claimant_phone }}</p>
                <p><span class="font-medium">Submitted:</span> {{ formatDate(claim.created_at) }}</p>
                <p v-if="claim.contractor?.email">
                  <span class="font-medium">Business Email:</span> {{ claim.contractor.email }}
                  <UiBadge v-if="claim.claimant_email === claim.contractor.email" variant="default" class="ml-2">
                    <Icon name="heroicons:check-circle" class="mr-0.5 size-3" /> Match
                  </UiBadge>
                </p>
                <p v-if="claim.admin_notes" class="mt-2 rounded bg-muted p-2">
                  <span class="font-medium">Admin Notes:</span> {{ claim.admin_notes }}
                </p>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="claim.status === 'pending'" class="flex gap-2 sm:flex-col">
              <UiButton size="sm" @click="handleApprove(claim)">
                <Icon name="heroicons:check" class="size-4 mr-1" />
                Approve
              </UiButton>
              <UiButton variant="outline" size="sm" @click="handleReject(claim)">
                <Icon name="heroicons:x-mark" class="size-4 mr-1" />
                Reject
              </UiButton>
            </div>
            <div v-else class="text-sm text-muted-foreground">
              <p>Reviewed: {{ formatDate(claim.reviewed_at) }}</p>
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Pagination -->
    <div v-if="!pending && claims.length > 0" class="mt-6 flex justify-center">
      <UiPagination
        :page="pagination.page"
        :total="pagination.total"
        :items-per-page="pagination.limit"
        :sibling-count="1"
        show-edges
        @update:page="handlePageChange"
      />
    </div>

    <!-- Results Summary -->
    <div v-if="!pending && claims.length > 0" class="mt-4 text-center text-sm text-muted-foreground">
      Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to
      {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
      {{ pagination.total }} claims
    </div>

    <!-- Approve Confirmation Dialog -->
    <UiAlertDialog :open="showApproveDialog" @update:open="(val) => !val && cancelDialog()">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Approve Claim</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Approve this claim for {{ claimToProcess?.contractor?.company_name || 'this business' }}? The business will be marked as claimed.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel :disabled="processing" @click="cancelDialog">Cancel</UiAlertDialogCancel>
          <UiAlertDialogAction :disabled="processing" @click="confirmApprove">Approve</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>

    <!-- Reject Confirmation Dialog -->
    <UiAlertDialog :open="showRejectDialog" @update:open="(val) => !val && cancelDialog()">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Reject Claim</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Reject this claim for {{ claimToProcess?.contractor?.company_name || 'this business' }}?
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <div class="py-4">
          <label class="block text-sm font-medium text-foreground mb-2">
            Rejection Notes (optional)
          </label>
          <UiTextarea
            v-model="rejectNotes"
            :rows="3"
            placeholder="Reason for rejection..."
          />
        </div>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel :disabled="processing" @click="cancelDialog">Cancel</UiAlertDialogCancel>
          <UiAlertDialogAction variant="destructive" :disabled="processing" @click="confirmReject">Reject</UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

