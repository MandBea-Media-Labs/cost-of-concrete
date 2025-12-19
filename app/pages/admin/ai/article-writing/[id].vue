<script setup lang="ts">
/**
 * AI Article Writing - Job Detail / Agent Rooms
 *
 * Shows real-time progress of an AI article generation job.
 * Uses SSE (Server-Sent Events) for live updates.
 */
import { toast } from 'vue-sonner'
import ArticleRatingPanel from '~/components/admin-ui/ai/ArticleRatingPanel.vue'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const jobId = computed(() => route.params.id as string)

// =====================================================
// DATA FETCHING
// =====================================================

const { data: jobData, pending, error, refresh } = await useFetch(
  () => `/api/ai/articles/${jobId.value}`,
  { lazy: true }
)

const job = computed(() => jobData.value?.job ?? null)
const steps = computed(() => job.value?.steps ?? [])
const evals = computed(() => job.value?.evals ?? [])
const isTerminal = computed(() =>
  ['completed', 'failed', 'cancelled'].includes(job.value?.status ?? '')
)

// Render article markdown content
const articleContent = computed(() => job.value?.finalOutput?.finalArticle?.content ?? '')
const { html: renderedArticleContent } = useMarkdown(articleContent)

// Get QA recommendations (medium/low issues from latest automated eval)
const qaRecommendations = computed(() => {
  const automatedEvals = evals.value.filter((e: any) => e.evalType === 'automated')
  if (automatedEvals.length === 0) return []

  // Get the latest automated eval (highest iteration)
  const latestEval = automatedEvals.sort((a: any, b: any) => (b.iteration ?? 1) - (a.iteration ?? 1))[0]

  // Extract medium/low issues as recommendations
  const issues = latestEval.issues ?? []
  return issues
    .filter((i: any) => i.severity === 'medium' || i.severity === 'low')
    .map((i: any) => i.suggestion || i.description)
})

// =====================================================
// SSE CONNECTION
// =====================================================

const sseConnected = ref(false)
const sseError = ref<string | null>(null)
let eventSource: EventSource | null = null

function connectSSE() {
  if (isTerminal.value || eventSource) return

  try {
    eventSource = new EventSource(`/api/ai/articles/${jobId.value}/stream`)
    sseConnected.value = true
    sseError.value = null

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data)
      if (job.value) {
        job.value.progressPercent = data.progressPercent
        job.value.currentAgent = data.currentAgent
        job.value.currentIteration = data.currentIteration
        job.value.totalTokensUsed = data.totalTokensUsed
        job.value.estimatedCostUsd = data.estimatedCostUsd
      }
    })

    eventSource.addEventListener('step:start', () => {
      refresh()
    })

    eventSource.addEventListener('step:complete', () => {
      refresh()
    })

    const terminalEvents = ['complete', 'failed', 'cancelled']
    terminalEvents.forEach(eventType => {
      eventSource?.addEventListener(eventType, () => {
        refresh()
        disconnectSSE()
        toast.info(`Job ${eventType}`)
      })
    })

    eventSource.addEventListener('error', () => {
      sseError.value = 'Connection lost'
      disconnectSSE()
    })

    eventSource.onerror = () => {
      sseError.value = 'Connection error'
      disconnectSSE()
    }
  } catch (err) {
    sseError.value = 'Failed to connect'
  }
}

function disconnectSSE() {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  sseConnected.value = false
}

// Connect on mount, disconnect on unmount
onMounted(() => {
  if (!isTerminal.value) {
    connectSSE()
  }
})

onUnmounted(() => {
  disconnectSSE()
})

// Reconnect if job becomes non-terminal (e.g., retry)
watch(isTerminal, (terminal) => {
  if (!terminal) {
    connectSSE()
  } else {
    disconnectSSE()
  }
})

// =====================================================
// JOB ACTIONS
// =====================================================

const cancelling = ref(false)
const articleExpanded = ref(false)
const publishing = ref(false)

async function cancelJob() {
  try {
    cancelling.value = true
    await $fetch(`/api/ai/articles/${jobId.value}/cancel`, { method: 'POST' })
    toast.success('Job cancelled')
    refresh()
  } catch (err: any) {
    toast.error('Failed to cancel', { description: err?.data?.message || err?.message })
  } finally {
    cancelling.value = false
  }
}

async function publishArticle() {
  try {
    publishing.value = true
    const response = await $fetch(`/api/ai/articles/${jobId.value}/publish`, {
      method: 'POST',
      body: { status: 'draft' },
    })
    toast.success('Article published to CMS', { description: 'Page created as draft' })
    refresh()
    // Navigate to the edit page
    if (response.pageId) {
      navigateTo(`/admin/pages/${response.pageId}/edit`)
    }
  } catch (err: any) {
    toast.error('Failed to publish', { description: err?.data?.message || err?.message })
  } finally {
    publishing.value = false
  }
}

// =====================================================
// HELPERS
// =====================================================

const AGENT_ORDER = ['research', 'writer', 'seo', 'qa', 'project_manager']
const AGENT_INFO: Record<string, { label: string; icon: string; color: string }> = {
  research: { label: 'Research', icon: 'i-lucide-search', color: 'text-blue-500' },
  writer: { label: 'Writer', icon: 'i-lucide-pen-tool', color: 'text-purple-500' },
  seo: { label: 'SEO', icon: 'i-lucide-target', color: 'text-green-500' },
  qa: { label: 'QA', icon: 'i-lucide-check-circle', color: 'text-orange-500' },
  project_manager: { label: 'Project Manager', icon: 'i-lucide-folder-kanban', color: 'text-indigo-500' },
}

function getAgentSteps(agentType: string) {
  return steps.value.filter(s => s.agentType === agentType)
}

function getStepStatusVariant(status: string) {
  switch (status) {
    case 'completed': return 'success'
    case 'running': return 'info'
    case 'failed': return 'destructive'
    case 'skipped': return 'secondary'
    default: return 'outline'
  }
}
</script>

<template>
  <div>
    <!-- Back Button + Header -->
    <div class="mb-6">
      <NuxtLink
        to="/admin/ai/article-writing"
        class="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Icon name="i-lucide-arrow-left" class="size-4" />
        Back to Jobs
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="pending && !job" class="flex items-center gap-2">
        <Icon name="i-lucide-loader-2" class="size-5 animate-spin" />
        <span>Loading job...</span>
      </div>

      <!-- Error State -->
      <UiCard v-else-if="error" class="border-destructive bg-destructive/10">
        <UiCardContent class="py-4">
          <div class="flex items-center gap-3">
            <Icon name="i-lucide-alert-triangle" class="size-5 text-destructive" />
            <p class="text-destructive">{{ error.message }}</p>
            <UiButton variant="outline" size="sm" @click="router.back()">Go Back</UiButton>
          </div>
        </UiCardContent>
      </UiCard>

      <!-- Job Header -->
      <template v-else-if="job">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold">{{ job.keyword }}</h1>
            <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <UiBadge :variant="getStepStatusVariant(job.status)">{{ job.status }}</UiBadge>
              <span v-if="job.currentAgent">
                Agent: <strong>{{ AGENT_INFO[job.currentAgent]?.label || job.currentAgent }}</strong>
              </span>
              <span>Iteration {{ job.currentIteration }}/{{ job.maxIterations }}</span>
              <span v-if="sseConnected" class="flex items-center gap-1 text-green-600">
                <span class="relative flex size-2">
                  <span class="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span class="relative inline-flex size-2 rounded-full bg-green-500" />
                </span>
                Live
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UiButton
              v-if="!isTerminal"
              variant="outline"
              :disabled="cancelling"
              @click="cancelJob"
            >
              <Icon :name="cancelling ? 'i-lucide-loader-2' : 'i-lucide-x'" :class="['mr-1 size-4', { 'animate-spin': cancelling }]" />
              Cancel
            </UiButton>
            <NuxtLink v-if="job.pageId" :to="`/admin/pages/${job.pageId}/edit`">
              <UiButton variant="default">
                <Icon name="i-lucide-file-text" class="mr-1 size-4" />
                View Page
              </UiButton>
            </NuxtLink>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="mb-1 flex items-center justify-between text-sm">
            <span>Progress</span>
            <span class="font-medium">{{ job.progressPercent }}%</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full bg-primary transition-all duration-300"
              :style="{ width: `${job.progressPercent}%` }"
            />
          </div>
        </div>

        <!-- Stats Row -->
        <div class="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span class="text-muted-foreground">Tokens:</span>
            <span class="ml-1 font-medium">{{ job.totalTokensUsed.toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-muted-foreground">Est. Cost:</span>
            <span class="ml-1 font-medium">${{ job.estimatedCostUsd.toFixed(4) }}</span>
          </div>
          <div v-if="job.startedAt">
            <span class="text-muted-foreground">Started:</span>
            <span class="ml-1">{{ new Date(job.startedAt).toLocaleString() }}</span>
          </div>
          <div v-if="job.completedAt">
            <span class="text-muted-foreground">Completed:</span>
            <span class="ml-1">{{ new Date(job.completedAt).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Error Display -->
        <UiCard v-if="job.lastError" class="mt-4 border-destructive bg-destructive/10">
          <UiCardContent class="py-3">
            <div class="flex items-start gap-2">
              <Icon name="i-lucide-alert-circle" class="mt-0.5 size-4 text-destructive" />
              <p class="text-sm text-destructive">{{ job.lastError }}</p>
            </div>
          </UiCardContent>
        </UiCard>
      </template>
    </div>

    <!-- Agent Rooms -->
    <div v-if="job" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UiCard
        v-for="agentType in AGENT_ORDER"
        :key="agentType"
        :class="[
          'transition-all',
          job.currentAgent === agentType ? 'ring-2 ring-primary' : '',
        ]"
      >
        <UiCardHeader class="pb-3">
          <div class="flex items-center gap-2">
            <div class="rounded-lg bg-muted p-2">
              <Icon :name="AGENT_INFO[agentType].icon" :class="['size-5', AGENT_INFO[agentType].color]" />
            </div>
            <div class="flex-1">
              <UiCardTitle class="text-base">{{ AGENT_INFO[agentType].label }}</UiCardTitle>
              <UiCardDescription v-if="getAgentSteps(agentType).length > 0">
                {{ getAgentSteps(agentType).length }} step(s)
              </UiCardDescription>
              <UiCardDescription v-else class="italic">Waiting...</UiCardDescription>
            </div>
            <Icon
              v-if="job.currentAgent === agentType"
              name="i-lucide-loader-2"
              class="size-4 animate-spin text-primary"
            />
          </div>
        </UiCardHeader>

        <UiCardContent v-if="getAgentSteps(agentType).length > 0" class="space-y-2">
          <div
            v-for="step in getAgentSteps(agentType)"
            :key="step.id"
            class="rounded-md border bg-muted/30 p-2 text-xs"
          >
            <div class="flex items-center justify-between">
              <UiBadge :variant="getStepStatusVariant(step.status)" class="text-[10px]">
                {{ step.status }}
              </UiBadge>
              <span class="text-muted-foreground">
                {{ step.tokensUsed.toLocaleString() }} tokens
              </span>
            </div>
            <div v-if="step.durationMs" class="mt-1 text-muted-foreground">
              Duration: {{ (step.durationMs / 1000).toFixed(1) }}s
            </div>
            <div v-if="step.errorMessage" class="mt-1 text-destructive">
              {{ step.errorMessage }}
            </div>
          </div>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- SSE Reconnect -->
    <div v-if="sseError && !isTerminal" class="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
      <Icon name="i-lucide-wifi-off" class="size-4" />
      <span>{{ sseError }}</span>
      <UiButton variant="link" size="sm" class="h-auto p-0" @click="connectSSE">
        Reconnect
      </UiButton>
    </div>

    <!-- Article Preview (when completed) -->
    <UiCard v-if="job && job.status === 'completed' && job.finalOutput?.finalArticle" class="mt-6">
      <UiCardHeader>
        <div class="flex items-center justify-between">
          <div>
            <UiCardTitle class="flex items-center gap-2">
              <Icon name="i-lucide-file-text" class="size-5 text-primary" />
              Generated Article
            </UiCardTitle>
            <UiCardDescription>
              {{ job.finalOutput.finalArticle.wordCount?.toLocaleString() || 0 }} words
              <span v-if="job.finalOutput.readyForPublish" class="ml-2 text-green-600">✓ Ready for publish</span>
              <span v-else class="ml-2 text-yellow-600">⚠ Needs review</span>
            </UiCardDescription>
          </div>
          <div class="flex items-center gap-2">
            <!-- Publish Button (only if no page created yet) -->
            <UiButton
              v-if="!job.pageId"
              variant="default"
              size="sm"
              :disabled="publishing"
              @click="publishArticle"
            >
              <Icon :name="publishing ? 'i-lucide-loader-2' : 'i-lucide-upload'" :class="['mr-1 size-4', { 'animate-spin': publishing }]" />
              Publish to CMS
            </UiButton>
            <UiButton variant="outline" size="sm" @click="articleExpanded = !articleExpanded">
              <Icon :name="articleExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="mr-1 size-4" />
              {{ articleExpanded ? 'Collapse' : 'Expand' }}
            </UiButton>
          </div>
        </div>
      </UiCardHeader>

      <UiCardContent v-if="articleExpanded">
        <!-- Meta Info -->
        <div class="mb-4 space-y-2 rounded-lg bg-muted/50 p-4">
          <div><strong>Title:</strong> {{ job.finalOutput.finalArticle.title }}</div>
          <div><strong>Slug:</strong> {{ job.finalOutput.finalArticle.slug }}</div>
          <div><strong>Meta Title:</strong> {{ job.finalOutput.finalArticle.metaTitle }}</div>
          <div><strong>Meta Description:</strong> {{ job.finalOutput.finalArticle.metaDescription }}</div>
          <div><strong>Excerpt:</strong> {{ job.finalOutput.finalArticle.excerpt }}</div>
        </div>

        <!-- Validation Errors -->
        <div v-if="job.finalOutput.validationErrors?.length" class="mb-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div class="mb-2 flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400">
            <Icon name="i-lucide-alert-triangle" class="size-4" />
            Validation Issues
          </div>
          <ul class="list-inside list-disc space-y-1 text-sm">
            <li v-for="(err, i) in job.finalOutput.validationErrors" :key="i">{{ err }}</li>
          </ul>
        </div>

        <!-- QA Recommendations (medium/low issues from latest eval) -->
        <div v-if="qaRecommendations.length" class="mb-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
          <div class="mb-2 flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
            <Icon name="i-lucide-lightbulb" class="size-4" />
            Recommendations
            <span class="text-xs font-normal text-muted-foreground">(optional improvements from QA)</span>
          </div>
          <ul class="list-inside list-disc space-y-1 text-sm">
            <li v-for="(rec, i) in qaRecommendations" :key="i">{{ rec }}</li>
          </ul>
        </div>

        <!-- Article Content -->
        <div
          class="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-4"
          v-html="renderedArticleContent"
        />
      </UiCardContent>
    </UiCard>

    <!-- Human Evaluation Panel -->
    <div v-if="job" class="mt-6">
      <ArticleRatingPanel
        :job-id="jobId"
        :job-status="job.status"
        :keyword="job.keyword"
        :existing-evals="evals"
        @eval-created="refresh"
        @golden-created="refresh"
      />
    </div>
  </div>
</template>

