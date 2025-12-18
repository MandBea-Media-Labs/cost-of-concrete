/**
 * Article Pipeline Orchestrator
 *
 * Manages the execution of the AI article writing pipeline:
 * Research → Writer → SEO → QA (→ Writer revision if QA fails) → PM
 *
 * Handles:
 * - Agent execution sequence
 * - QA feedback loops with configurable max iterations
 * - Job step recording
 * - Progress tracking
 * - Error handling and recovery
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../../app/types/supabase'
import type {
  AIArticleJobRow,
  AIAgentType,
  AIPersonaRow,
  ResearchOutput,
  WriterOutput,
  SEOOutput,
  QAOutput,
} from '../../schemas/ai.schemas'
import { DEFAULT_MAX_ITERATIONS } from '../../schemas/ai.schemas'
import { AIArticleJobRepository } from '../../repositories/AIArticleJobRepository'
import { AIJobStepRepository, type StepLogEntry } from '../../repositories/AIJobStepRepository'
import { AIPersonaRepository } from '../../repositories/AIPersonaRepository'
import { AgentRegistry } from './AgentRegistry'
import type { AgentContext, AgentResult, WriterAgentInput, SEOAgentInput, QAAgentInput } from './AIAgent'
import type { ILLMProvider } from './LLMProvider'

// =====================================================
// TYPES
// =====================================================

export interface PipelineResult {
  success: boolean
  job: AIArticleJobRow
  error?: string
  iterations: number
  totalTokens: number
}

export interface PipelineCallbacks {
  onProgress?: (agentType: AIAgentType, message: string, data?: unknown) => void
  onAgentStart?: (agentType: AIAgentType, iteration: number) => void
  onAgentComplete?: (agentType: AIAgentType, iteration: number, result: AgentResult) => void
}

// =====================================================
// ORCHESTRATOR
// =====================================================

export class ArticlePipelineOrchestrator {
  private client: SupabaseClient<Database>
  private llmProvider: ILLMProvider
  private jobRepo: AIArticleJobRepository
  private stepRepo: AIJobStepRepository
  private personaRepo: AIPersonaRepository
  private callbacks: PipelineCallbacks

  constructor(
    client: SupabaseClient<Database>,
    llmProvider: ILLMProvider,
    callbacks: PipelineCallbacks = {}
  ) {
    this.client = client
    this.llmProvider = llmProvider
    this.jobRepo = new AIArticleJobRepository(client)
    this.stepRepo = new AIJobStepRepository(client)
    this.personaRepo = new AIPersonaRepository(client)
    this.callbacks = callbacks
  }

  /**
   * Execute the full article pipeline for a job
   */
  async execute(job: AIArticleJobRow): Promise<PipelineResult> {
    const maxIterations = job.max_iterations ?? DEFAULT_MAX_ITERATIONS
    let currentIteration = job.current_iteration ?? 1
    let totalTokens = job.total_tokens_used ?? 0

    consola.info(`[Pipeline] Starting job ${job.id} for keyword: "${job.keyword}"`)

    try {
      // Mark job as processing
      await this.jobRepo.startProcessing(job.id)

      // Stage 1: Research (only once)
      const researchResult = await this.runAgent('research', { keyword: job.keyword }, job, currentIteration)
      if (!researchResult.success || !researchResult.output) {
        return this.failJob(job, researchResult.error ?? 'Research failed', currentIteration, totalTokens)
      }
      totalTokens += researchResult.usage.totalTokens
      const researchOutput = researchResult.output as ResearchOutput

      // Determine target word count
      const targetWordCount = (job.settings as { targetWordCount?: number })?.targetWordCount
        || researchOutput.recommendedWordCount
        || 1500

      // QA Feedback Loop: Writer → SEO → QA (repeat if QA fails, up to maxIterations)
      let writerOutput: WriterOutput | null = null
      let seoOutput: SEOOutput | null = null
      let qaOutput: QAOutput | null = null
      let qaFeedback: string | undefined

      while (currentIteration <= maxIterations) {
        consola.info(`[Pipeline] Starting iteration ${currentIteration}/${maxIterations}`)
        await this.jobRepo.updateProgress(job.id, { currentIteration })

        // Stage 2: Writer
        const writerInput: WriterAgentInput = {
          keyword: job.keyword,
          researchData: researchOutput,
          targetWordCount,
          qaFeedback,
          previousArticle: writerOutput ?? undefined,
          iteration: currentIteration,
        }
        const writerResult = await this.runAgent('writer', writerInput, job, currentIteration)
        if (!writerResult.success || !writerResult.output) {
          return this.failJob(job, writerResult.error ?? 'Writer failed', currentIteration, totalTokens)
        }
        totalTokens += writerResult.usage.totalTokens
        writerOutput = writerResult.output as WriterOutput

        // Stage 3: SEO
        const seoInput: SEOAgentInput = {
          keyword: job.keyword,
          article: writerOutput,
          researchData: researchOutput,
        }
        const seoResult = await this.runAgent('seo', seoInput, job, currentIteration)
        if (!seoResult.success || !seoResult.output) {
          return this.failJob(job, seoResult.error ?? 'SEO failed', currentIteration, totalTokens)
        }
        totalTokens += seoResult.usage.totalTokens
        seoOutput = seoResult.output as SEOOutput

        // Stage 4: QA
        const qaInput: QAAgentInput = {
          keyword: job.keyword,
          article: writerOutput,
          seoData: seoOutput,
          iteration: currentIteration,
        }
        const qaResult = await this.runAgent('qa', qaInput, job, currentIteration)
        if (!qaResult.success || !qaResult.output) {
          return this.failJob(job, qaResult.error ?? 'QA failed', currentIteration, totalTokens)
        }
        totalTokens += qaResult.usage.totalTokens
        qaOutput = qaResult.output as QAOutput

        // Check QA result
        if (qaOutput.passed) {
          consola.success(`[Pipeline] QA passed on iteration ${currentIteration}`)
          break
        }

        // QA failed - prepare for revision if iterations remain
        if (currentIteration < maxIterations) {
          consola.warn(`[Pipeline] QA failed (score: ${qaOutput.overallScore}), preparing revision...`)
          qaFeedback = qaResult.feedback ?? qaOutput.feedback
          currentIteration++
        } else {
          consola.warn(`[Pipeline] QA failed on final iteration, proceeding with best effort`)
          break
        }
      }

      // Stage 5: Project Manager (final assembly)
      // TODO: Implement PM agent when ready
      // For now, mark job as completed with final outputs

      const finalOutput = {
        research: researchOutput,
        article: writerOutput,
        seo: seoOutput,
        qa: qaOutput,
        iterations: currentIteration,
        passed: qaOutput?.passed ?? false,
      }

      await this.jobRepo.setFinalOutput(job.id, finalOutput)
      await this.jobRepo.updateProgress(job.id, {
        progressPercent: 100,
        currentAgent: null,
        totalTokensUsed: totalTokens,
      })

      consola.success(`[Pipeline] Job ${job.id} completed in ${currentIteration} iteration(s)`)

      const updatedJob = await this.jobRepo.findById(job.id)
      return {
        success: true,
        job: updatedJob!,
        iterations: currentIteration,
        totalTokens,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      consola.error(`[Pipeline] Job ${job.id} failed: ${message}`)
      return this.failJob(job, message, currentIteration, totalTokens)
    }
  }

  /**
   * Run a single agent with step recording
   */
  private async runAgent(
    agentType: AIAgentType,
    input: unknown,
    job: AIArticleJobRow,
    iteration: number
  ): Promise<AgentResult> {
    const agent = AgentRegistry.get(agentType)
    if (!agent) {
      return {
        success: false,
        output: null,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        error: `Agent not found: ${agentType}`,
        continueToNext: false,
      }
    }

    // Get persona for this agent
    const persona = await this.getPersonaForAgent(agentType, job)
    if (!persona) {
      return {
        success: false,
        output: null,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        error: `No persona found for agent: ${agentType}`,
        continueToNext: false,
      }
    }

    // Create job step record
    const step = await this.stepRepo.create({
      jobId: job.id,
      agentType,
      personaId: persona.id,
      iteration,
      input,
    })

    // Update job progress
    await this.jobRepo.updateProgress(job.id, { currentAgent: agentType })
    this.callbacks.onAgentStart?.(agentType, iteration)

    // Start step
    await this.stepRepo.start(step.id)

    // Build agent context with logging
    const context = this.buildContext(job, persona, iteration, step.id)

    try {
      // Validate input
      if (!agent.validateInput(input)) {
        throw new Error(`Invalid input for ${agentType} agent`)
      }

      // Execute agent
      const result = await agent.execute(input, context)

      // Record step completion
      if (result.success) {
        await this.stepRepo.complete(step.id, {
          output: result.output,
          tokensUsed: result.usage.totalTokens,
          promptTokens: result.usage.inputTokens,
          completionTokens: result.usage.outputTokens,
        })
      } else {
        await this.stepRepo.fail(step.id, result.error ?? 'Unknown error')
      }

      this.callbacks.onAgentComplete?.(agentType, iteration, result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await this.stepRepo.fail(step.id, message, error)
      return {
        success: false,
        output: null,
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
        error: message,
        continueToNext: false,
      }
    }
  }

  /**
   * Get persona for an agent type (with job setting overrides)
   */
  private async getPersonaForAgent(agentType: AIAgentType, job: AIArticleJobRow): Promise<AIPersonaRow | null> {
    const settings = job.settings as { personaOverrides?: Record<string, string> } | null
    const overrideId = settings?.personaOverrides?.[agentType]

    if (overrideId) {
      const persona = await this.personaRepo.findById(overrideId)
      if (persona) return persona
    }

    return this.personaRepo.findDefault(agentType)
  }

  /**
   * Build agent context with logging callbacks
   */
  private buildContext(
    job: AIArticleJobRow,
    persona: AIPersonaRow,
    iteration: number,
    stepId: string
  ): AgentContext {
    const log = async (
      level: 'debug' | 'info' | 'warn' | 'error',
      message: string,
      data?: unknown
    ) => {
      const entry: StepLogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
      }

      // Append to step logs (fire and forget)
      this.stepRepo.appendLog(stepId, entry).catch(err => {
        consola.warn('[Pipeline] Failed to append log:', err)
      })

      // Also log to console in dev
      if (import.meta.dev) {
        const logFn = level === 'error' ? consola.error
          : level === 'warn' ? consola.warn
            : level === 'info' ? consola.info
              : consola.debug
        logFn(`[${persona.agent_type}] ${message}`, data)
      }
    }

    const onProgress = (message: string, data?: unknown) => {
      this.callbacks.onProgress?.(persona.agent_type as AIAgentType, message, data)
    }

    return {
      client: this.client,
      llmProvider: this.llmProvider,
      job,
      persona,
      iteration,
      stepId,
      log,
      onProgress,
    }
  }

  /**
   * Mark job as failed
   */
  private async failJob(
    job: AIArticleJobRow,
    error: string,
    iterations: number,
    totalTokens: number
  ): Promise<PipelineResult> {
    await this.jobRepo.setStatus(job.id, 'failed', { error, completedAt: true })
    await this.jobRepo.updateProgress(job.id, { currentAgent: null, totalTokensUsed: totalTokens })

    const updatedJob = await this.jobRepo.findById(job.id)
    return {
      success: false,
      job: updatedJob!,
      error,
      iterations,
      totalTokens,
    }
  }
}

