<script setup lang="ts">
/**
 * ArticleRatingPanel - Human evaluation panel for AI articles
 *
 * Provides 5-star ratings for each dimension, issue tagging,
 * and ability to mark as golden example.
 */
import { toast } from 'vue-sonner'

interface EvalDimensionScores {
  readability: number
  seo: number
  accuracy: number
  engagement: number
  brandVoice: number
}

interface EvalIssue {
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggestion: string
}

interface ArticleEval {
  id: string
  evalType: 'automated' | 'human'
  overallScore: number | null
  dimensionScores: EvalDimensionScores | null
  passed: boolean | null
  feedback: string | null
  issues: EvalIssue[]
  ratedBy: string | null
  ratedAt: string | null
}

const props = defineProps<{
  jobId: string
  jobStatus: string
  keyword: string
  existingEvals: ArticleEval[]
}>()

const emit = defineEmits<{
  evalCreated: [eval: ArticleEval]
  goldenCreated: []
}>()

// Rating dimensions
const DIMENSIONS = [
  { key: 'readability', label: 'Readability', icon: 'i-lucide-book-open' },
  { key: 'seo', label: 'SEO', icon: 'i-lucide-search' },
  { key: 'accuracy', label: 'Accuracy', icon: 'i-lucide-check-circle' },
  { key: 'engagement', label: 'Engagement', icon: 'i-lucide-heart' },
  { key: 'brandVoice', label: 'Brand Voice', icon: 'i-lucide-megaphone' },
] as const

const ISSUE_CATEGORIES = ['readability', 'seo', 'accuracy', 'engagement', 'brand_voice', 'other']
const ISSUE_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const

// Form state - star ratings (1-5) converted to 0-100 scale
const ratings = ref<Record<string, number>>({
  readability: 0,
  seo: 0,
  accuracy: 0,
  engagement: 0,
  brandVoice: 0,
})

const feedback = ref('')
const issues = ref<EvalIssue[]>([])
const submitting = ref(false)
const markingGolden = ref(false)

// New issue form
const newIssue = ref({
  category: 'other',
  severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
  description: '',
  suggestion: '',
})

// Computed
const automatedEval = computed(() => props.existingEvals.find(e => e.evalType === 'automated'))
const humanEval = computed(() => props.existingEvals.find(e => e.evalType === 'human'))
const hasRated = computed(() => !!humanEval.value)
const canRate = computed(() => props.jobStatus === 'completed')
const canMarkGolden = computed(() =>
  props.jobStatus === 'completed' &&
  humanEval.value &&
  (humanEval.value.overallScore ?? 0) >= 80
)

const overallScore = computed(() => {
  const values = Object.values(ratings.value)
  if (values.every(v => v === 0)) return 0
  return Math.round(values.reduce((a, b) => a + b, 0) / 5)
})

// Convert stars (1-5) to 0-100 score
function starsToScore(stars: number): number {
  return stars * 20
}

// Convert 0-100 score to stars (1-5)
function scoreToStars(score: number): number {
  return Math.round(score / 20)
}

// Set rating for a dimension
function setRating(dimension: string, stars: number) {
  ratings.value[dimension] = starsToScore(stars)
}

// Get current star value for a dimension
function getStars(dimension: string): number {
  return scoreToStars(ratings.value[dimension])
}

// Add issue
function addIssue() {
  if (!newIssue.value.description.trim()) {
    toast.error('Please enter an issue description')
    return
  }
  issues.value.push({ ...newIssue.value })
  newIssue.value = { category: 'other', severity: 'medium', description: '', suggestion: '' }
}

// Remove issue
function removeIssue(index: number) {
  issues.value.splice(index, 1)
}

// Submit evaluation
async function submitEvaluation() {
  if (Object.values(ratings.value).every(v => v === 0)) {
    toast.error('Please rate at least one dimension')
    return
  }

  submitting.value = true
  try {
    const response = await $fetch(`/api/ai/articles/${props.jobId}/evals`, {
      method: 'POST',
      body: {
        dimensionScores: ratings.value as EvalDimensionScores,
        feedback: feedback.value || undefined,
        issues: issues.value.length > 0 ? issues.value : undefined,
      },
    })

    toast.success('Evaluation submitted')
    emit('evalCreated', (response as { eval: ArticleEval }).eval)
  } catch (err) {
    toast.error((err as Error).message || 'Failed to submit evaluation')
  } finally {
    submitting.value = false
  }
}

// Mark as golden example
async function markAsGolden() {
  markingGolden.value = true
  try {
    await $fetch(`/api/ai/articles/${props.jobId}/golden`, {
      method: 'POST',
      body: {
        title: props.keyword,
        description: `High-quality example for "${props.keyword}"`,
        tags: [props.keyword.split(' ')[0]],
      },
    })

    toast.success('Marked as golden example')
    emit('goldenCreated')
  } catch (err) {
    toast.error((err as Error).message || 'Failed to mark as golden')
  } finally {
    markingGolden.value = false
  }
}
</script>

<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle class="flex items-center gap-2">
        <Icon name="i-lucide-star" class="size-5 text-yellow-500" />
        Human Evaluation
      </UiCardTitle>
      <UiCardDescription>
        Rate the article quality across 5 dimensions
      </UiCardDescription>
    </UiCardHeader>

    <UiCardContent class="space-y-6">
      <!-- Existing Evaluations -->
      <div v-if="automatedEval || humanEval" class="grid gap-4 md:grid-cols-2">
        <!-- Automated Eval -->
        <div v-if="automatedEval" class="rounded-lg border bg-muted/30 p-3">
          <div class="mb-2 flex items-center gap-2 text-sm font-medium">
            <Icon name="i-lucide-bot" class="size-4" />
            Automated Score
          </div>
          <div class="text-2xl font-bold">{{ automatedEval.overallScore ?? 'N/A' }}</div>
          <div v-if="automatedEval.dimensionScores" class="mt-2 space-y-1 text-xs">
            <div v-for="dim in DIMENSIONS" :key="dim.key" class="flex justify-between">
              <span class="text-muted-foreground">{{ dim.label }}</span>
              <span>{{ automatedEval.dimensionScores[dim.key as keyof EvalDimensionScores] }}</span>
            </div>
          </div>
        </div>

        <!-- Human Eval -->
        <div v-if="humanEval" class="rounded-lg border bg-muted/30 p-3">
          <div class="mb-2 flex items-center gap-2 text-sm font-medium">
            <Icon name="i-lucide-user" class="size-4" />
            Human Score
          </div>
          <div class="text-2xl font-bold">{{ humanEval.overallScore ?? 'N/A' }}</div>
          <div v-if="humanEval.dimensionScores" class="mt-2 space-y-1 text-xs">
            <div v-for="dim in DIMENSIONS" :key="dim.key" class="flex justify-between">
              <span class="text-muted-foreground">{{ dim.label }}</span>
              <span>{{ humanEval.dimensionScores[dim.key as keyof EvalDimensionScores] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Form (if not yet rated) -->
      <template v-if="canRate && !hasRated">
        <UiSeparator v-if="automatedEval" />

        <!-- Star Ratings -->
        <div class="space-y-3">
          <div v-for="dim in DIMENSIONS" :key="dim.key" class="flex items-center gap-3">
            <div class="flex w-28 items-center gap-2">
              <Icon :name="dim.icon" class="size-4 text-muted-foreground" />
              <span class="text-sm">{{ dim.label }}</span>
            </div>
            <div class="flex gap-1">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="text-xl transition-colors hover:scale-110"
                @click="setRating(dim.key, star)"
              >
                <Icon
                  :name="star <= getStars(dim.key) ? 'i-lucide-star' : 'i-lucide-star'"
                  :class="star <= getStars(dim.key) ? 'text-yellow-500' : 'text-muted-foreground/30'"
                />
              </button>
            </div>
            <span class="text-sm text-muted-foreground">{{ ratings[dim.key] }}/100</span>
          </div>
        </div>

        <div class="text-center text-sm">
          Overall: <span class="font-bold">{{ overallScore }}</span>/100
        </div>

        <!-- Feedback -->
        <div class="space-y-2">
          <UiLabel>Feedback (optional)</UiLabel>
          <UiTextarea v-model="feedback" placeholder="Any additional feedback..." rows="2" />
        </div>

        <!-- Issues -->
        <div class="space-y-2">
          <UiLabel>Issues Found</UiLabel>
          <div v-if="issues.length > 0" class="space-y-2">
            <div
              v-for="(issue, idx) in issues"
              :key="idx"
              class="flex items-start gap-2 rounded border p-2 text-sm"
            >
              <Badge variant="outline" class="capitalize">{{ issue.category }}</Badge>
              <Badge
                :variant="issue.severity === 'critical' ? 'destructive' : 'secondary'"
                class="capitalize"
              >
                {{ issue.severity }}
              </Badge>
              <span class="flex-1">{{ issue.description }}</span>
              <button type="button" class="text-muted-foreground hover:text-destructive" @click="removeIssue(idx)">
                <Icon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <!-- Add issue form -->
          <div class="grid gap-2 rounded border p-2 md:grid-cols-4">
            <UiSelect v-model="newIssue.category">
              <UiSelectTrigger><UiSelectValue placeholder="Category" /></UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem v-for="cat in ISSUE_CATEGORIES" :key="cat" :value="cat" class="capitalize">
                  {{ cat.replace('_', ' ') }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <UiSelect v-model="newIssue.severity">
              <UiSelectTrigger><UiSelectValue placeholder="Severity" /></UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem v-for="sev in ISSUE_SEVERITIES" :key="sev" :value="sev" class="capitalize">
                  {{ sev }}
                </UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            <UiInput v-model="newIssue.description" placeholder="Description" />
            <UiButton type="button" variant="outline" size="sm" @click="addIssue">
              <Icon name="i-lucide-plus" class="mr-1 size-4" />
              Add
            </UiButton>
          </div>
        </div>

        <!-- Submit -->
        <UiButton :disabled="submitting" class="w-full" @click="submitEvaluation">
          <Icon :name="submitting ? 'i-lucide-loader-2' : 'i-lucide-check'" :class="['mr-2 size-4', { 'animate-spin': submitting }]" />
          Submit Evaluation
        </UiButton>
      </template>

      <!-- Not completed message -->
      <div v-else-if="!canRate" class="text-center text-sm text-muted-foreground">
        Evaluation available after job completes
      </div>

      <!-- Mark as Golden -->
      <div v-if="canMarkGolden" class="border-t pt-4">
        <UiButton variant="outline" class="w-full" :disabled="markingGolden" @click="markAsGolden">
          <Icon :name="markingGolden ? 'i-lucide-loader-2' : 'i-lucide-trophy'" :class="['mr-2 size-4 text-yellow-500', { 'animate-spin': markingGolden }]" />
          Mark as Golden Example
        </UiButton>
        <p class="mt-1 text-center text-xs text-muted-foreground">
          High-quality examples are used for few-shot learning
        </p>
      </div>
    </UiCardContent>
  </UiCard>
</template>

