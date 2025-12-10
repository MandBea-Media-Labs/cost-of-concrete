/**
 * Job Repository
 *
 * Data access layer for background_jobs table.
 * Handles CRUD operations, status transitions, and progress tracking.
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import type {
  BackgroundJobRow,
  BackgroundJobInsert,
  BackgroundJobUpdate,
  JobStatus,
  JobType,
  JobPayload,
  JobResult,
} from '../schemas/job.schemas'

export interface JobListOptions {
  status?: JobStatus | JobStatus[]
  jobType?: JobType
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'updated_at' | 'started_at'
  orderDirection?: 'asc' | 'desc'
}

export interface JobProgressUpdate {
  processedItems?: number
  failedItems?: number
  totalItems?: number
}

export class JobRepository {
  private client: SupabaseClient<Database>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
  }

  /**
   * Create a new background job
   */
  async create(data: {
    jobType: JobType
    payload?: JobPayload
    totalItems?: number
    createdBy?: string
  }): Promise<BackgroundJobRow> {
    consola.debug(`Creating background job: ${data.jobType}`)

    const insertData: BackgroundJobInsert = {
      job_type: data.jobType,
      payload: (data.payload || {}) as BackgroundJobInsert['payload'],
      total_items: data.totalItems ?? null,
      created_by: data.createdBy ?? null,
    }

    const { data: job, error } = await this.client
      .from('background_jobs')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      consola.error('Failed to create background job:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    consola.debug(`Created background job ${job.id}`)
    return job
  }

  /**
   * Find job by ID
   */
  async findById(id: string): Promise<BackgroundJobRow | null> {
    const { data, error } = await this.client
      .from('background_jobs')
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
   * List jobs with filters and pagination
   */
  async findAll(options: JobListOptions = {}): Promise<{ jobs: BackgroundJobRow[], total: number }> {
    const {
      status,
      jobType,
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'desc',
    } = options

    let query = this.client.from('background_jobs').select('*', { count: 'exact' })

    if (status) {
      if (Array.isArray(status)) {
        query = query.in('status', status)
      } else {
        query = query.eq('status', status)
      }
    }

    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    query = query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return { jobs: data || [], total: count || 0 }
  }

  /**
   * Update job status with optional timestamps
   */
  async setStatus(
    id: string,
    status: JobStatus,
    options: { error?: string, startedAt?: boolean, completedAt?: boolean } = {}
  ): Promise<BackgroundJobRow> {
    const updateData: BackgroundJobUpdate = { status }

    if (options.error) updateData.last_error = options.error
    if (options.startedAt) updateData.started_at = new Date().toISOString()
    if (options.completedAt) updateData.completed_at = new Date().toISOString()

    const { data, error } = await this.client
      .from('background_jobs')
      .update(updateData)
      .eq('id', id)
      .select()


  /**
   * Set job result (on completion)
   */
  async setResult(id: string, result: JobResult): Promise<BackgroundJobRow> {
    const { data, error } = await this.client
      .from('background_jobs')
      .update({
        result: result as BackgroundJobUpdate['result'],
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Increment attempts and set next retry time
   */
  async incrementAttempts(id: string, nextRetryAt: Date | null): Promise<BackgroundJobRow> {
    // Get current attempts
    const job = await this.findById(id)
    if (!job) throw new Error('Job not found')

    const { data, error } = await this.client
      .from('background_jobs')
      .update({
        attempts: job.attempts + 1,
        next_retry_at: nextRetryAt?.toISOString() ?? null,
        status: 'pending', // Reset to pending for retry
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Find active jobs (pending or processing)
   */
  async findActive(jobType?: JobType): Promise<BackgroundJobRow[]> {
    let query = this.client
      .from('background_jobs')
      .select('*')
      .in('status', ['pending', 'processing'])

    if (jobType) {
      query = query.eq('job_type', jobType)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Check if a job type is currently processing
   */
  async isJobTypeProcessing(jobType: JobType): Promise<boolean> {
    const { count, error } = await this.client
      .from('background_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('job_type', jobType)
      .eq('status', 'processing')

    if (error) throw error
    return (count || 0) > 0
  }
}
    const updateData: BackgroundJobUpdate = {}
    if (progress.processedItems !== undefined) updateData.processed_items = progress.processedItems
    if (progress.failedItems !== undefined) updateData.failed_items = progress.failedItems
    if (progress.totalItems !== undefined) updateData.total_items = progress.totalItems

    const { data, error } = await this.client
      .from('background_jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

