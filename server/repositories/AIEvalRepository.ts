/**
 * AI Eval Repository
 *
 * Data access layer for ai_article_evals table.
 * Handles CRUD operations for article evaluation scores (automated and human).
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import type {
  AIArticleEvalRow,
  AIArticleEvalInsert,
  AIArticleEvalUpdate,
  AIEvalType,
  EvalDimensionScores,
  EvalIssue,
} from '../schemas/ai.schemas'

export class AIEvalRepository {
  private client: SupabaseClient<Database>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  /**
   * Create a new evaluation
   */
  async create(data: {
    jobId: string
    stepId?: string
    evalType: AIEvalType
    iteration?: number
    overallScore?: number
    dimensionScores?: EvalDimensionScores
    passed?: boolean
    issues?: EvalIssue[]
    feedback?: string
  }): Promise<AIArticleEvalRow> {
    consola.debug(`Creating ${data.evalType} eval for job ${data.jobId}`)

    const insertData: AIArticleEvalInsert = {
      job_id: data.jobId,
      step_id: data.stepId ?? null,
      eval_type: data.evalType,
      iteration: data.iteration ?? 1,
      overall_score: data.overallScore ?? null,
      readability_score: data.dimensionScores?.readability ?? null,
      seo_score: data.dimensionScores?.seo ?? null,
      accuracy_score: data.dimensionScores?.accuracy ?? null,
      engagement_score: data.dimensionScores?.engagement ?? null,
      brand_voice_score: data.dimensionScores?.brandVoice ?? null,
      passed: data.passed ?? null,
      issues: (data.issues ?? []) as AIArticleEvalInsert['issues'],
      feedback: data.feedback ?? null,
    }

    const { data: evalRecord, error } = await this.client
      .from('ai_article_evals')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      consola.error('Failed to create eval:', error)
      throw error
    }

    return evalRecord
  }

  /**
   * Find eval by ID
   */
  async findById(id: string): Promise<AIArticleEvalRow | null> {
    const { data, error } = await this.client
      .from('ai_article_evals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  /**
   * Find all evals for a job
   */
  async findByJobId(jobId: string): Promise<AIArticleEvalRow[]> {
    const { data, error } = await this.client
      .from('ai_article_evals')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Find latest eval for a job
   */
  async findLatest(jobId: string, evalType?: AIEvalType): Promise<AIArticleEvalRow | null> {
    let query = this.client
      .from('ai_article_evals')
      .select('*')
      .eq('job_id', jobId)

    if (evalType) {
      query = query.eq('eval_type', evalType)
    }

    const { data, error } = await query
      .order('iteration', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  /**
   * Add human rating to an eval
   */
  async addHumanRating(id: string, data: {
    overallScore: number
    dimensionScores?: EvalDimensionScores
    feedback?: string
    ratedBy: string
  }): Promise<AIArticleEvalRow> {
    const updateData: AIArticleEvalUpdate = {
      overall_score: data.overallScore,
      feedback: data.feedback ?? null,
      rated_by: data.ratedBy,
      rated_at: new Date().toISOString(),
    }

    if (data.dimensionScores) {
      updateData.readability_score = data.dimensionScores.readability
      updateData.seo_score = data.dimensionScores.seo
      updateData.accuracy_score = data.dimensionScores.accuracy
      updateData.engagement_score = data.dimensionScores.engagement
      updateData.brand_voice_score = data.dimensionScores.brandVoice
    }

    const { data: evalRecord, error } = await this.client
      .from('ai_article_evals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return evalRecord
  }
}

