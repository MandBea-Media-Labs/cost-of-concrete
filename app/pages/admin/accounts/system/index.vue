<script setup lang="ts">
import { consola } from 'consola'
import { toast } from 'vue-sonner'
import type { SystemAccountsFilters, AccountStatus } from '~/types/accounts'

definePageMeta({
  layout: 'admin',
})

const {
  accounts,
  pagination,
  pending,
  fetchAccounts,
  updateAccountStatus,
  deleteAccount,
} = useAdminSystemAccounts()

// Filter state
const filters = ref<SystemAccountsFilters>({
  status: 'all',
  search: null,
  page: 1,
  limit: 20,
  orderBy: 'created_at',
  orderDirection: 'desc',
})

// Selected filter values
const selectedStatus = ref<string>('all')
const searchQuery = ref<string>('')

// Status options
const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deleted', label: 'Deleted' },
]

// Fetch on mount
onMounted(async () => {
  await fetchAccounts(filters.value)
})

// Watch for filter changes
watch([selectedStatus, searchQuery], async () => {
  filters.value.status = selectedStatus.value as AccountStatus | 'all'
  filters.value.search = searchQuery.value.trim() || null
  filters.value.page = 1
  await fetchAccounts(filters.value)
})

// Pagination
const handlePageChange = async (page: number) => {
  filters.value.page = page
  await fetchAccounts(filters.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Dialog state
const showSuspendDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedAccountId = ref<string | null>(null)
const selectedAccountEmail = ref<string>('')
const selectedAccountStatus = ref<AccountStatus>('active')

// Actions
const handleSuspend = (id: string, email: string, currentStatus: AccountStatus) => {
  selectedAccountId.value = id
  selectedAccountEmail.value = email
  selectedAccountStatus.value = currentStatus
  showSuspendDialog.value = true
}

const confirmSuspend = async () => {
  if (!selectedAccountId.value) return
  const newStatus = selectedAccountStatus.value === 'active' ? 'suspended' : 'active'
  const result = await updateAccountStatus(selectedAccountId.value, newStatus)

  if (result.success) {
    toast.success(result.message)
    await fetchAccounts(filters.value)
  } else {
    toast.error(result.message)
  }
  showSuspendDialog.value = false
  selectedAccountId.value = null
}

const handleDelete = (id: string, email: string) => {
  selectedAccountId.value = id
  selectedAccountEmail.value = email
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedAccountId.value) return
  const result = await deleteAccount(selectedAccountId.value)

  if (result.success) {
    toast.success(result.message)
    await fetchAccounts(filters.value)
  } else {
    toast.error(result.message)
  }
  showDeleteDialog.value = false
  selectedAccountId.value = null
}

const handleEdit = (id: string) => {
  navigateTo(`/admin/accounts/system/${id}`)
}

const handleInvite = () => {
  navigateTo('/admin/accounts/system/invite')
}

// Format date
const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active': return 'default'
    case 'suspended': return 'secondary'
    case 'deleted': return 'destructive'
    default: return 'outline'
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">System Accounts</h1>
          <p class="mt-1 text-sm text-muted-foreground">
            Manage CoC staff user accounts
          </p>
        </div>
        <UiButton @click="handleInvite">
          <Icon name="heroicons:user-plus" class="mr-2 size-4" />
          Invite User
        </UiButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <!-- Search -->
      <div class="relative w-64">
        <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <UiInput v-model="searchQuery" placeholder="Search by email..." class="pl-9" />
      </div>

      <!-- Status Filter -->
      <UiPopover>
        <UiPopoverTrigger as-child>
          <UiButton variant="outline" size="sm" class="h-9 gap-1.5 border-dashed">
            <Icon name="heroicons:funnel" class="size-4" />
            Status
            <UiBadge v-if="selectedStatus !== 'all'" variant="secondary" class="ml-1 h-5 px-1.5">
              {{ statusOptions.find(o => o.value === selectedStatus)?.label }}
            </UiBadge>
          </UiButton>
        </UiPopoverTrigger>
        <UiPopoverContent class="w-48 p-1" align="start">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            :class="{ 'bg-accent': selectedStatus === option.value }"
            @click="selectedStatus = option.value"
          >
            <Icon v-if="selectedStatus === option.value" name="heroicons:check" class="size-4" />
            <span :class="{ 'ml-6': selectedStatus !== option.value }">{{ option.label }}</span>
          </button>
        </UiPopoverContent>
      </UiPopover>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-12">
      <Icon name="heroicons:arrow-path" class="size-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Table -->
    <div v-else-if="accounts.length > 0" class="rounded-md border">
      <UiTable>
        <UiTableHeader>
          <UiTableRow>
            <UiTableHead>Email</UiTableHead>
            <UiTableHead>Display Name</UiTableHead>
            <UiTableHead>Status</UiTableHead>
            <UiTableHead>Last Sign In</UiTableHead>
            <UiTableHead>Created</UiTableHead>
            <UiTableHead class="w-[100px]">Actions</UiTableHead>
          </UiTableRow>
        </UiTableHeader>
        <UiTableBody>
          <UiTableRow v-for="account in accounts" :key="account.id">
            <UiTableCell class="font-medium">{{ account.email }}</UiTableCell>
            <UiTableCell>{{ account.displayName || '—' }}</UiTableCell>
            <UiTableCell>
              <UiBadge :variant="getStatusVariant(account.status)">
                {{ account.status }}
              </UiBadge>
            </UiTableCell>
            <UiTableCell>{{ formatDate(account.lastSignInAt || null) }}</UiTableCell>
            <UiTableCell>{{ formatDate(account.created_at) }}</UiTableCell>
            <UiTableCell>
              <UiDropdownMenu>
                <UiDropdownMenuTrigger as-child>
                  <UiButton variant="ghost" size="icon" class="size-8">
                    <Icon name="heroicons:ellipsis-horizontal" class="size-4" />
                  </UiButton>
                </UiDropdownMenuTrigger>
                <UiDropdownMenuContent align="end">
                  <UiDropdownMenuItem @click="handleEdit(account.id)">
                    <Icon name="heroicons:pencil" class="mr-2 size-4" />
                    Edit
                  </UiDropdownMenuItem>
                  <UiDropdownMenuItem
                    v-if="account.status !== 'deleted'"
                    @click="handleSuspend(account.id, account.email, account.status as AccountStatus)"
                  >
                    <Icon :name="account.status === 'suspended' ? 'heroicons:play' : 'heroicons:pause'" class="mr-2 size-4" />
                    {{ account.status === 'suspended' ? 'Reactivate' : 'Suspend' }}
                  </UiDropdownMenuItem>
                  <UiDropdownMenuSeparator v-if="account.status !== 'deleted'" />
                  <UiDropdownMenuItem
                    v-if="account.status !== 'deleted'"
                    class="text-destructive focus:text-destructive"
                    @click="handleDelete(account.id, account.email)"
                  >
                    <Icon name="heroicons:trash" class="mr-2 size-4" />
                    Delete
                  </UiDropdownMenuItem>
                </UiDropdownMenuContent>
              </UiDropdownMenu>
            </UiTableCell>
          </UiTableRow>
        </UiTableBody>
      </UiTable>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
      <Icon name="heroicons:users" class="size-12 text-muted-foreground" />
      <h3 class="mt-4 text-lg font-semibold">No system accounts found</h3>
      <p class="mt-1 text-sm text-muted-foreground">
        {{ searchQuery ? 'Try adjusting your search.' : 'Invite a user to get started.' }}
      </p>
      <UiButton v-if="!searchQuery" class="mt-4" @click="handleInvite">
        <Icon name="heroicons:user-plus" class="mr-2 size-4" />
        Invite User
      </UiButton>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="mt-4 flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {{ pagination.offset + 1 }} to {{ Math.min(pagination.offset + pagination.limit, pagination.total) }} of {{ pagination.total }}
      </p>
      <div class="flex gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          Previous
        </UiButton>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          Next
        </UiButton>
      </div>
    </div>

    <!-- Suspend/Reactivate Dialog -->
    <UiAlertDialog :open="showSuspendDialog" @update:open="showSuspendDialog = $event">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>
            {{ selectedAccountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account' }}
          </UiAlertDialogTitle>
          <UiAlertDialogDescription>
            {{ selectedAccountStatus === 'active'
              ? `Are you sure you want to suspend ${selectedAccountEmail}? They will not be able to access the admin panel.`
              : `Are you sure you want to reactivate ${selectedAccountEmail}? They will regain access to the admin panel.`
            }}
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Cancel</UiAlertDialogCancel>
          <UiAlertDialogAction @click="confirmSuspend">
            {{ selectedAccountStatus === 'active' ? 'Suspend' : 'Reactivate' }}
          </UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>

    <!-- Delete Dialog -->
    <UiAlertDialog :open="showDeleteDialog" @update:open="showDeleteDialog = $event">
      <UiAlertDialogContent>
        <UiAlertDialogHeader>
          <UiAlertDialogTitle>Delete Account</UiAlertDialogTitle>
          <UiAlertDialogDescription>
            Are you sure you want to delete {{ selectedAccountEmail }}? This action cannot be undone.
          </UiAlertDialogDescription>
        </UiAlertDialogHeader>
        <UiAlertDialogFooter>
          <UiAlertDialogCancel>Cancel</UiAlertDialogCancel>
          <UiAlertDialogAction
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete"
          >
            Delete
          </UiAlertDialogAction>
        </UiAlertDialogFooter>
      </UiAlertDialogContent>
    </UiAlertDialog>
  </div>
</template>

