<script setup lang="ts">
/**
 * AI Article Writing - Job List
 *
 * Create new article generation jobs and view/manage existing jobs.
 */
import { z } from 'zod'
import { toast } from 'vue-sonner'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  layout: 'admin'
})

// =====================================================
// FORM SCHEMA
// =====================================================

const createJobSchema = z.object({
  keyword: z.string().min(2, 'Keyword must be at least 2 characters').max(200),
  autoPost: z.boolean().default(false),
  targetWordCount: z.coerce.number().int().min(0).max(10000).default(0),
})

type CreateJobInput = z.infer<typeof createJobSchema>

// =====================================================
// FORM SETUP
// =====================================================

const { handleSubmit, errors, defineField, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createJobSchema),
  initialValues: {
    keyword: '',
    autoPost: false,
    targetWordCount: 0,
  }
})

const [keyword] = defineField('keyword')
const [autoPost] = defineField('autoPost')
const [targetWordCount] = defineField('targetWordCount')

// =====================================================
// DATA FETCHING
// =====================================================

// Status filter
const statusFilter = ref<string>('all')
const page = ref(1)
const limit = 20

// Fetch jobs
const { data: jobsData, pending, error, refresh } = await useFetch('/api/ai/articles', {
  query: computed(() => ({
    status: statusFilter.value === 'all' ? undefined : statusFilter.value,
    limit,
    offset: (page.value - 1) * limit,
  })),
  watch: [statusFilter, page],
  lazy: true,
})

// Fetch stats for counters
const { data: statsData } = await useFetch('/api/ai/stats', { lazy: true })

const jobs = computed(() => jobsData.value?.jobs ?? [])
const total = computed(() => jobsData.value?.total ?? 0)
const stats = computed(() => statsData.value?.stats ?? { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 })
const totalPages = computed(() => Math.ceil(total.value / limit))

// =====================================================
// JOB CREATION
// =====================================================

const onSubmit = handleSubmit(async (values: CreateJobInput) => {
  try {
    await $fetch('/api/ai/articles', {
      method: 'POST',
      body: {
        keyword: values.keyword,
        settings: {
          autoPost: values.autoPost,
          targetWordCount: values.targetWordCount,
        },
      },
    })
    toast.success('Article job created!', { description: `Keyword: ${values.keyword}` })
    resetForm()
    refresh()
  } catch (err: any) {
    toast.error('Failed to create job', { description: err?.data?.message || err?.message })
  }
})

// =====================================================
// JOB ACTIONS
// =====================================================

const cancellingId = ref<string | null>(null)

async function cancelJob(jobId: string) {
  try {
    cancellingId.value = jobId
    await $fetch(`/api/ai/articles/${jobId}/cancel`, { method: 'POST' })
    toast.success('Job cancelled')
    refresh()
  } catch (err: any) {
    toast.error('Failed to cancel job', { description: err?.data?.message || err?.message })
  } finally {
    cancellingId.value = null
  }
}

// =====================================================
// STATUS HELPERS
// =====================================================

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed': return 'success'
    case 'processing': return 'info'
    case 'pending': return 'secondary'
    case 'failed': return 'destructive'
    case 'cancelled': return 'outline'
    default: return 'secondary'
  }
}

function getAgentLabel(agent: string | null) {
  if (!agent) return '-'
  return agent.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Article Writing</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Create and manage AI-generated articles
      </p>
    </div>

    <!-- Stats Row -->
    <div class="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      <UiCard class="p-3">
        <div class="text-xs text-muted-foreground">Total</div>
        <div class="text-xl font-semibold tabular-nums"><NumberFlow :value="stats.total" /></div>
      </UiCard>
      <UiCard class="p-3">
        <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-blue-500" />
          </span>
          Processing
        </div>
        <div class="text-xl font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          <NumberFlow :value="stats.processing" />
        </div>
      </UiCard>
      <UiCard class="p-3">
        <div class="text-xs text-muted-foreground">Pending</div>
        <div class="text-xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
          <NumberFlow :value="stats.pending" />
        </div>
      </UiCard>
      <UiCard class="p-3">
        <div class="text-xs text-muted-foreground">Completed</div>
        <div class="text-xl font-semibold tabular-nums text-green-600 dark:text-green-400">
          <NumberFlow :value="stats.completed" />
        </div>
      </UiCard>
      <UiCard class="p-3">
        <div class="text-xs text-muted-foreground">Failed</div>
        <div class="text-xl font-semibold tabular-nums text-red-600 dark:text-red-400">
          <NumberFlow :value="stats.failed" />
        </div>
      </UiCard>
    </div>

    <!-- Create Job Form -->
    <UiCard class="mb-6">
      <UiCardHeader class="pb-4">
        <UiCardTitle class="text-base">Create New Article</UiCardTitle>
      </UiCardHeader>
      <UiCardContent>
        <form class="space-y-4" @submit="onSubmit">
          <div class="grid gap-4 md:grid-cols-3">
            <!-- Keyword -->
            <div class="md:col-span-2">
              <label for="keyword" class="mb-1.5 block text-sm font-medium">Target Keyword</label>
              <UiInput
                id="keyword"
                v-model="keyword"
                placeholder="e.g., concrete driveway cost"
                :class="{ 'border-destructive': errors.keyword }"
              />
              <p v-if="errors.keyword" class="mt-1 text-xs text-destructive">{{ errors.keyword }}</p>
            </div>

            <!-- Target Word Count -->
            <div>
              <label for="targetWordCount" class="mb-1.5 block text-sm font-medium">Word Count</label>
              <UiInput
                id="targetWordCount"
                v-model="targetWordCount"
                type="number"
                placeholder="0 = auto"
                min="0"
                max="10000"
              />
              <p class="mt-1 text-xs text-muted-foreground">0 = determined by research</p>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <!-- Auto-post toggle -->
            <label class="flex cursor-pointer items-center gap-2">
              <UiCheckbox v-model:checked="autoPost" />
              <span class="text-sm">Auto-publish when complete</span>
            </label>

            <UiButton type="submit" :disabled="isSubmitting">
              <Icon v-if="isSubmitting" name="i-lucide-loader-2" class="mr-1.5 size-4 animate-spin" />
              <Icon v-else name="i-lucide-plus" class="mr-1.5 size-4" />
              Create Job
            </UiButton>
          </div>
        </form>
      </UiCardContent>
    </UiCard>

    <!-- Jobs List -->
    <UiCard>
      <UiCardHeader class="flex-row items-center justify-between pb-4">
        <UiCardTitle class="text-base">Recent Jobs</UiCardTitle>
        <div class="flex items-center gap-2">
          <UiSelect v-model="statusFilter" class="w-32">
            <UiSelectTrigger>
              <UiSelectValue placeholder="Filter" />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="all">All</UiSelectItem>
              <UiSelectItem value="pending">Pending</UiSelectItem>
              <UiSelectItem value="processing">Processing</UiSelectItem>
              <UiSelectItem value="completed">Completed</UiSelectItem>
              <UiSelectItem value="failed">Failed</UiSelectItem>
              <UiSelectItem value="cancelled">Cancelled</UiSelectItem>
            </UiSelectContent>
          </UiSelect>
          <UiButton variant="outline" size="icon" :disabled="pending" @click="refresh()">
            <Icon name="i-lucide-refresh-cw" :class="['size-4', { 'animate-spin': pending }]" />
          </UiButton>
        </div>
      </UiCardHeader>
      <UiCardContent class="p-0">
        <!-- Error State -->
        <div v-if="error" class="p-6 text-center">
          <Icon name="i-lucide-alert-triangle" class="mx-auto mb-2 size-8 text-destructive" />
          <p class="text-sm text-destructive">{{ error.message }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!pending && jobs.length === 0" class="p-6 text-center">
          <Icon name="i-lucide-file-text" class="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p class="text-sm text-muted-foreground">No jobs found</p>
        </div>

        <!-- Jobs Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b bg-muted/50 text-left">
              <tr>
                <th class="px-4 py-2 font-medium">Keyword</th>
                <th class="px-4 py-2 font-medium">Status</th>
                <th class="px-4 py-2 font-medium">Agent</th>
                <th class="px-4 py-2 font-medium">Progress</th>
                <th class="px-4 py-2 font-medium">Created</th>
                <th class="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobs" :key="job.id" class="border-b last:border-0">
                <td class="px-4 py-3 font-medium">{{ job.keyword }}</td>
                <td class="px-4 py-3">
                  <Badge :variant="getStatusVariant(job.status)">{{ job.status }}</Badge>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{{ getAgentLabel(job.currentAgent) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full bg-primary transition-all"
                        :style="{ width: `${job.progressPercent}%` }"
                      />
                    </div>
                    <span class="text-xs text-muted-foreground">{{ job.progressPercent }}%</span>
                  </div>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {{ formatDate(job.createdAt) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <NuxtLink :to="`/admin/ai/article-writing/${job.id}`">
                      <UiButton variant="ghost" size="icon" class="size-8">
                        <Icon name="i-lucide-eye" class="size-4" />
                      </UiButton>
                    </NuxtLink>
                    <UiButton
                      v-if="job.status === 'pending' || job.status === 'processing'"
                      variant="ghost"
                      size="icon"
                      class="size-8 text-destructive hover:text-destructive"
                      :disabled="cancellingId === job.id"
                      @click="cancelJob(job.id)"
                    >
                      <Icon
                        :name="cancellingId === job.id ? 'i-lucide-loader-2' : 'i-lucide-x'"
                        :class="['size-4', { 'animate-spin': cancellingId === job.id }]"
                      />
                    </UiButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between border-t px-4 py-3">
          <p class="text-sm text-muted-foreground">
            Showing {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }} of {{ total }}
          </p>
          <div class="flex gap-1">
            <UiButton variant="outline" size="sm" :disabled="page <= 1" @click="page--">
              Previous
            </UiButton>
            <UiButton variant="outline" size="sm" :disabled="page >= totalPages" @click="page++">
              Next
            </UiButton>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

