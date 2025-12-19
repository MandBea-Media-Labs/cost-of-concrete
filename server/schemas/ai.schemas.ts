/**
 * AI Article Writing System Schemas
 *
 * Zod validation schemas for the multi-agent AI article writing pipeline.
 * Defines agent types, job configurations, outputs, and API request/response types.
 */

import { z } from 'zod'
import type { Database } from '../../app/types/supabase'

// =====================================================
// DATABASE TYPES
// =====================================================

export type AIPersonaRow = Database['public']['Tables']['ai_personas']['Row']
export type AIPersonaInsert = Database['public']['Tables']['ai_personas']['Insert']
export type AIPersonaUpdate = Database['public']['Tables']['ai_personas']['Update']

export type AIArticleJobRow = Database['public']['Tables']['ai_article_jobs']['Row']
export type AIArticleJobInsert = Database['public']['Tables']['ai_article_jobs']['Insert']
export type AIArticleJobUpdate = Database['public']['Tables']['ai_article_jobs']['Update']

export type AIArticleJobStepRow = Database['public']['Tables']['ai_article_job_steps']['Row']
export type AIArticleJobStepInsert = Database['public']['Tables']['ai_article_job_steps']['Insert']
export type AIArticleJobStepUpdate = Database['public']['Tables']['ai_article_job_steps']['Update']

export type AIArticleEvalRow = Database['public']['Tables']['ai_article_evals']['Row']
export type AIArticleEvalInsert = Database['public']['Tables']['ai_article_evals']['Insert']
export type AIArticleEvalUpdate = Database['public']['Tables']['ai_article_evals']['Update']

export type AIGoldenExampleRow = Database['public']['Tables']['ai_golden_examples']['Row']
export type AIGoldenExampleInsert = Database['public']['Tables']['ai_golden_examples']['Insert']
export type AIGoldenExampleUpdate = Database['public']['Tables']['ai_golden_examples']['Update']

export type AIPromptVersionRow = Database['public']['Tables']['ai_prompt_versions']['Row']
export type AIPromptVersionInsert = Database['public']['Tables']['ai_prompt_versions']['Insert']
export type AIPromptVersionUpdate = Database['public']['Tables']['ai_prompt_versions']['Update']

// =====================================================
// AGENT TYPES & STATUSES
// =====================================================

export const AI_AGENT_TYPES = ['research', 'writer', 'seo', 'qa', 'project_manager'] as const
export type AIAgentType = typeof AI_AGENT_TYPES[number]

export const AI_JOB_STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled'] as const
export type AIJobStatus = typeof AI_JOB_STATUSES[number]

export const AI_STEP_STATUSES = ['pending', 'running', 'completed', 'failed', 'skipped'] as const
export type AIStepStatus = typeof AI_STEP_STATUSES[number]

export const LLM_PROVIDERS = ['anthropic', 'openai'] as const
export type LLMProvider = typeof LLM_PROVIDERS[number]

export const AI_EVAL_TYPES = ['automated', 'human'] as const
export type AIEvalType = typeof AI_EVAL_TYPES[number]

// =====================================================
// JOB SETTINGS SCHEMA
// =====================================================

/**
 * Article job settings (stored in ai_article_jobs.settings)
 */
export const aiArticleJobSettingsSchema = z.object({
  /** Auto-publish to CMS when complete */
  autoPost: z.boolean().default(false),
  /** Target word count (0 = auto from research) */
  targetWordCount: z.number().int().min(0).max(10000).default(0),
  /** Maximum QA feedback iterations (default: 5, see DEFAULT_MAX_ITERATIONS) */
  maxIterations: z.number().int().min(1).max(10).default(5),
  /** Template to use for the page */
  template: z.string().default('article'),
  /** Parent page ID for hierarchy */
  parentPageId: z.string().uuid().optional(),
  /** Custom persona overrides per agent */
  personaOverrides: z.record(z.enum(AI_AGENT_TYPES), z.string().uuid()).optional(),
  /** Skip specific agents */
  skipAgents: z.array(z.enum(AI_AGENT_TYPES)).optional(),
  /** Additional context for agents */
  context: z.string().max(2000).optional(),
})

export type AIArticleJobSettings = z.infer<typeof aiArticleJobSettingsSchema>

// =====================================================
// AGENT OUTPUT SCHEMAS
// =====================================================

/**
 * Research Agent Output
 */
export const researchOutputSchema = z.object({
  keyword: z.string(),
  keywordData: z.object({
    searchVolume: z.number().optional(),
    difficulty: z.number().optional(),
    intent: z.string().optional(),
    cpc: z.number().optional(),
  }),
  competitors: z.array(z.object({
    url: z.string(),
    title: z.string(),
    wordCount: z.number().optional(),
    headings: z.array(z.string()).optional(),
  })).max(10),
  relatedKeywords: z.array(z.string()),
  paaQuestions: z.array(z.string()),
  recommendedWordCount: z.number().int().min(300).max(10000),
  contentGaps: z.array(z.string()).optional(),
})

export type ResearchOutput = z.infer<typeof researchOutputSchema>

/**
 * Writer Agent Output
 */
export const writerOutputSchema = z.object({
  title: z.string().max(60),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().max(160),
  wordCount: z.number().int(),
  headings: z.array(z.object({
    level: z.number().int().min(2).max(4),
    text: z.string(),
  })),
})

export type WriterOutput = z.infer<typeof writerOutputSchema>

/**
 * SEO Agent Output
 */
export const seoOutputSchema = z.object({
  metaTitle: z.string().max(60),
  metaDescription: z.string().max(160),
  headingAnalysis: z.object({
    isValid: z.boolean(),
    issues: z.array(z.string()),
    suggestions: z.array(z.string()),
  }),
  keywordDensity: z.object({
    percentage: z.number(),
    analysis: z.string(),
  }),
  schemaMarkup: z.record(z.string(), z.unknown()),
  internalLinks: z.array(z.object({
    anchorText: z.string(),
    suggestedPath: z.string(),
    reason: z.string(),
  })).optional(),
  optimizationScore: z.number().int().min(0).max(100),
})

export type SEOOutput = z.infer<typeof seoOutputSchema>

/**
 * QA Issue with tracking ID
 */
export const qaIssueSchema = z.object({
  /** Unique ID for tracking across iterations (category-hash) */
  issueId: z.string().optional(),
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  suggestion: z.string(),
  location: z.string().optional(),
})

export type QAIssue = z.infer<typeof qaIssueSchema>

/**
 * QA Agent Output
 */
export const qaOutputSchema = z.object({
  passed: z.boolean(),
  overallScore: z.number().int().min(0).max(100),
  dimensionScores: z.object({
    readability: z.number().int().min(0).max(100),
    seo: z.number().int().min(0).max(100),
    accuracy: z.number().int().min(0).max(100),
    engagement: z.number().int().min(0).max(100),
    brandVoice: z.number().int().min(0).max(100),
  }),
  issues: z.array(qaIssueSchema),
  feedback: z.string(),
  /** Issues that were fixed from previous iteration */
  fixedIssueIds: z.array(z.string()).optional(),
  /** Issues that persist from previous iteration */
  persistingIssueIds: z.array(z.string()).optional(),
})

export type QAOutput = z.infer<typeof qaOutputSchema>

/**
 * Project Manager Agent Output
 */
export const projectManagerOutputSchema = z.object({
  readyForPublish: z.boolean(),
  validationErrors: z.array(z.string()),
  finalArticle: z.object({
    title: z.string(),
    slug: z.string(),
    content: z.string(),
    excerpt: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    schemaMarkup: z.record(z.string(), z.unknown()),
    template: z.string(),
    status: z.enum(['draft', 'published']),
    focusKeyword: z.string().optional(),
    wordCount: z.number().int(),
  }),
  summary: z.string(),
  recommendations: z.array(z.string()).optional(),
})

export type ProjectManagerOutput = z.infer<typeof projectManagerOutputSchema>

// =====================================================
// EVAL SCHEMAS
// =====================================================

/**
 * Evaluation issue (stored in ai_article_evals.issues)
 */
export const evalIssueSchema = z.object({
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  suggestion: z.string(),
})

export type EvalIssue = z.infer<typeof evalIssueSchema>

/**
 * Dimension scores for evaluation
 */
export const evalDimensionScoresSchema = z.object({
  readability: z.number().int().min(0).max(100),
  seo: z.number().int().min(0).max(100),
  accuracy: z.number().int().min(0).max(100),
  engagement: z.number().int().min(0).max(100),
  brandVoice: z.number().int().min(0).max(100),
})

export type EvalDimensionScores = z.infer<typeof evalDimensionScoresSchema>

// =====================================================
// API REQUEST SCHEMAS
// =====================================================

/**
 * Create article job request
 */
export const createArticleJobSchema = z.object({
  keyword: z.string().min(1).max(200),
  settings: aiArticleJobSettingsSchema.optional(),
  priority: z.number().int().min(0).max(100).default(0),
})

export type CreateArticleJobInput = z.infer<typeof createArticleJobSchema>

/**
 * List article jobs query params
 */
export const listArticleJobsQuerySchema = z.object({
  status: z.enum(AI_JOB_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  orderBy: z.enum(['created_at', 'updated_at', 'priority']).default('created_at'),
  orderDirection: z.enum(['asc', 'desc']).default('desc'),
})

export type ListArticleJobsQuery = z.infer<typeof listArticleJobsQuerySchema>

/**
 * Create/update persona request
 */
export const upsertPersonaSchema = z.object({
  agentType: z.enum(AI_AGENT_TYPES),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  systemPrompt: z.string().min(10).max(50000),
  provider: z.enum(LLM_PROVIDERS).default('anthropic'),
  model: z.string().min(1).max(100).default('claude-sonnet-4-20250514'),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().min(100).max(100000).default(4096),
  isDefault: z.boolean().default(false),
  isEnabled: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type UpsertPersonaInput = z.infer<typeof upsertPersonaSchema>

/**
 * List personas query params
 */
export const listPersonasQuerySchema = z.object({
  agentType: z.enum(AI_AGENT_TYPES).optional(),
  isEnabled: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
})

export type ListPersonasQuery = z.infer<typeof listPersonasQuerySchema>

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ArticleJobResponse {
  id: string
  keyword: string
  status: AIJobStatus
  currentAgent: AIAgentType | null
  progressPercent: number
  currentIteration: number
  maxIterations: number
  totalTokensUsed: number
  estimatedCostUsd: number
  priority: number
  settings: AIArticleJobSettings
  pageId: string | null
  lastError: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  createdBy: string | null
}

export interface ArticleJobDetailResponse extends ArticleJobResponse {
  steps: ArticleJobStepResponse[]
  evals: ArticleEvalResponse[]
  finalOutput: ProjectManagerOutput | null
}

export interface ArticleJobStepResponse {
  id: string
  agentType: AIAgentType
  iteration: number
  status: AIStepStatus
  tokensUsed: number
  promptTokens: number
  completionTokens: number
  durationMs: number | null
  input: unknown
  output: unknown
  logs: unknown[]
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface ArticleEvalResponse {
  id: string
  evalType: AIEvalType
  iteration: number
  overallScore: number | null
  dimensionScores: EvalDimensionScores | null
  passed: boolean | null
  issues: EvalIssue[]
  feedback: string | null
  ratedBy: string | null
  ratedAt: string | null
  createdAt: string
}

export interface PersonaResponse {
  id: string
  agentType: AIAgentType
  name: string
  description: string | null
  systemPrompt: string
  provider: LLMProvider
  model: string
  temperature: number | null
  maxTokens: number | null
  isDefault: boolean | null
  isEnabled: boolean | null
  createdAt: string
  updatedAt: string
}

export interface CreateArticleJobResponse {
  success: boolean
  job: ArticleJobResponse
}

export interface ListArticleJobsResponse {
  success: boolean
  jobs: ArticleJobResponse[]
  total: number
}

export interface ListPersonasResponse {
  success: boolean
  personas: PersonaResponse[]
}

// =====================================================
// CONSTANTS
// =====================================================

/** Maximum concurrent article jobs */
export const MAX_CONCURRENT_JOBS = 5

/** Default max QA iterations - increased to allow more revision cycles for issue resolution */
export const DEFAULT_MAX_ITERATIONS = 5

/** Minimum passing QA score */
export const MIN_PASSING_SCORE = 70

/** Agent pipeline order */
export const AGENT_PIPELINE_ORDER: AIAgentType[] = [
  'research',
  'writer',
  'seo',
  'qa',
  'project_manager',
]

/** Token costs per 1M tokens (USD) */
export const TOKEN_COSTS = {
  anthropic: {
    // Claude 4.5 (latest)
    'claude-opus-4-5': { input: 5.0, output: 25.0 },
    'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
    'claude-haiku-4-5': { input: 1.0, output: 5.0 },
    // Claude 4 (legacy)
    'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
    'claude-opus-4-20250514': { input: 15.0, output: 75.0 },
    // Claude 3.5 (legacy)
    'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 },
  },
  openai: {
    'gpt-4o': { input: 2.5, output: 10.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
  },
} as const

/** Default models per agent type */
export const DEFAULT_MODELS: Record<AIAgentType, { provider: LLMProvider; model: string }> = {
  research: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  writer: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  seo: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  qa: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
  project_manager: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
}

