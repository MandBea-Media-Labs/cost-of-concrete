/**
 * Job Service
 *
 * Business logic for background job management.
 * Handles job creation, execution, retries, and status management.
 */

import { consola } from 'consola'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../app/types/supabase'
import { JobRepository } from '../repositories/JobRepository'
import { SystemLogService } from './SystemLogService'
import { JobExecutorRegistry } from './JobExecutorRegistry'
import type {
  BackgroundJobRow,
  JobType,
  JobPayload,
  JobResult,
  JobResponse,
} from '../schemas/job.schemas'
import { RETRY_DELAYS_MINUTES } from '../schemas/job.schemas'

export class JobService {
  private repository: JobRepository
  private logService: SystemLogService
  private client: SupabaseClient<Database>

  constructor(client: SupabaseClient<Database>) {
    this.client = client
    this.repository = new JobRepository(client)
    this.logService = new SystemLogService(client)
  }

  /**
   * Create a new background job
   *
   * Uses database-level unique constraint (idx_one_active_job_per_type) to
   * atomically enforce one active job per type. This prevents race conditions
   * that could occur with application-level checks.
   */
  async createJob(
    jobType: JobType,
    payload: JobPayload,
    createdBy?: string
  ): Promise<BackgroundJobRow> {
    try {
      // Attempt to create the job - database constraint will prevent duplicates
      const job = await this.repository.create({
        jobType,
        payload,
        createdBy,
      })

      await this.logService.logJobCreated(job.id, jobType, createdBy)
      consola.info(`Created ${jobType} job: ${job.id}`)

      return job
    } catch (error) {
      // Handle unique constraint violation (PostgreSQL error code 23505)
      if (this.isUniqueConstraintViolation(error)) {
        throw new Error(`A ${jobType} job is already queued or processing. Please wait for it to complete.`)
      }
      throw error
    }
  }

  /**
   * Check if error is a PostgreSQL unique constraint violation
   */
  private isUniqueConstraintViolation(error: unknown): boolean {
    if (error && typeof error === 'object') {
      // Supabase/PostgreSQL error format
      const pgError = error as { code?: string; message?: string }
      // 23505 is PostgreSQL's unique_violation error code
      if (pgError.code === '23505') return true
      // Also check message for constraint name as fallback
      if (pgError.message?.includes('idx_one_active_job_per_type')) return true
    }
    return false
  }

  /**
   * Execute a job (called by pg_cron via API)
   */
  async executeJob(jobId: string): Promise<JobResult> {
    const job = await this.repository.findById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status !== 'processing') {
      throw new Error(`Job ${jobId} is not in processing status (current: ${job.status})`)
    }

    const jobType = job.job_type as JobType
    await this.logService.logJobStarted(jobId, jobType)
    consola.info(`Executing ${jobType} job: ${jobId}`)

    try {
      // Get executor from registry
      const executor = JobExecutorRegistry.get(jobType)
      if (!executor) {
        throw new Error(`No executor registered for job type: ${jobType}`)
      }

      // Execute the job
      const result = await executor.execute(job, this.client, (progress) => {
        // Progress callback - update database
        this.repository.updateProgress(jobId, progress).catch(err => {
          consola.warn(`Failed to update progress for job ${jobId}:`, err)
        })
      })

      // Mark as completed
      await this.repository.setResult(jobId, result)
      await this.logService.logJobCompleted(jobId, jobType, result as Record<string, unknown>)
      consola.info(`Completed ${jobType} job: ${jobId}`)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      await this.handleJobFailure(job, errorMessage)
      throw error
    }
  }

  /**
   * Handle job failure with retry logic
   */
  private async handleJobFailure(job: BackgroundJobRow, errorMessage: string): Promise<void> {
    const jobType = job.job_type as JobType
    const attempts = job.attempts
    const maxAttempts = job.max_attempts

    if (attempts < maxAttempts) {
      // Calculate next retry time with exponential backoff
      const delayMinutes = RETRY_DELAYS_MINUTES[attempts - 1] || RETRY_DELAYS_MINUTES[RETRY_DELAYS_MINUTES.length - 1]
      const nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000)

      await this.repository.setStatus(job.id, 'pending', { error: errorMessage })
      await this.repository.incrementAttempts(job.id, nextRetryAt)
      await this.logService.logJobFailed(job.id, jobType, errorMessage, true)

      consola.warn(`Job ${job.id} failed (attempt ${attempts}/${maxAttempts}), retrying in ${delayMinutes} minutes`)
    } else {
      // Max attempts reached - mark as failed
      await this.repository.setStatus(job.id, 'failed', { error: errorMessage, completedAt: true })
      await this.logService.logJobFailed(job.id, jobType, errorMessage, false)

      consola.error(`Job ${job.id} failed permanently after ${maxAttempts} attempts: ${errorMessage}`)
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string, cancelledBy?: string): Promise<BackgroundJobRow> {
    const job = await this.repository.findById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new Error(`Cannot cancel job with status: ${job.status}`)
    }

    const updatedJob = await this.repository.setStatus(jobId, 'cancelled', { completedAt: true })
    await this.logService.logJobCancelled(jobId, job.job_type, cancelledBy)

    consola.info(`Cancelled job: ${jobId}`)
    return updatedJob
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<BackgroundJobRow> {
    const job = await this.repository.findById(jobId)
    if (!job) {
      throw new Error(`Job ${jobId} not found`)
    }

    if (job.status !== 'failed') {
      throw new Error(`Can only retry failed jobs (current: ${job.status})`)
    }

    // Reset for retry
    const updatedJob = await this.repository.setStatus(jobId, 'pending')
    consola.info(`Queued job for retry: ${jobId}`)

    return updatedJob
  }

  /**
   * Get job details
   */
  async getJob(jobId: string): Promise<BackgroundJobRow | null> {
    return this.repository.findById(jobId)
  }

  /**
   * Get job progress
   */
  async getJobProgress(jobId: string): Promise<{
    id: string
    status: string
    totalItems: number | null
    processedItems: number
    failedItems: number
    percentComplete: number
  } | null> {
    const job = await this.repository.findById(jobId)
    if (!job) return null

    const percentComplete = job.total_items && job.total_items > 0
      ? Math.round((job.processed_items / job.total_items) * 100)
      : 0

    return {
      id: job.id,
      status: job.status,
      totalItems: job.total_items,
      processedItems: job.processed_items,
      failedItems: job.failed_items,
      percentComplete,
    }
  }

  /**
   * List jobs with filters
   */
  async listJobs(options: {
    status?: string
    jobType?: JobType
    limit?: number
    offset?: number
  } = {}): Promise<{ jobs: BackgroundJobRow[], total: number }> {
    return this.repository.findAll(options as Parameters<typeof this.repository.findAll>[0])
  }

  /**
   * Transform database row to API response
   */
  static toResponse(job: BackgroundJobRow): JobResponse {
    return {
      id: job.id,
      jobType: job.job_type as JobType,
      status: job.status as JobResponse['status'],
      attempts: job.attempts,
      maxAttempts: job.max_attempts,
      totalItems: job.total_items,
      processedItems: job.processed_items,
      failedItems: job.failed_items,
      payload: job.payload as JobPayload,
      result: job.result as JobResult | null,
      lastError: job.last_error,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
      createdBy: job.created_by,
    }
  }
}
