/**
 * POST /api/jobs/[id]/execute
 *
 * Internal worker endpoint called by pg_cron to execute a job.
 * This endpoint is NOT protected by admin auth - it uses a shared secret instead.
 *
 * Security:
 * - Validates X-Job-Runner-Secret header against JOB_RUNNER_SECRET env var
 * - Only executes jobs that are in 'processing' status (set by pg_cron SQL function)
 *
 * @returns {Object} Job execution result
 */

import { consola } from 'consola'
import { serverSupabaseServiceRole } from '#supabase/server'
import { JobService } from '../../../services/JobService'

export default defineEventHandler(async (event) => {
  try {
    // Get job ID from route params
    const jobId = getRouterParam(event, 'id')
    if (!jobId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Job ID is required'
      })
    }

    // Validate the job runner secret
    const secretHeader = getHeader(event, 'x-job-runner-secret')
    const expectedSecret = process.env.JOB_RUNNER_SECRET

    if (!expectedSecret) {
      consola.error('POST /api/jobs/[id]/execute - JOB_RUNNER_SECRET not configured')
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Job runner not configured'
      })
    }

    if (!secretHeader || secretHeader !== expectedSecret) {
      if (import.meta.dev) {
        consola.warn('POST /api/jobs/[id]/execute - Invalid secret', { jobId })
      }
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid job runner secret'
      })
    }

    consola.info(`POST /api/jobs/${jobId}/execute - Executing job`)

    // Use service role client (bypasses RLS) since this is an internal worker
    const client = serverSupabaseServiceRole(event)
    const jobService = new JobService(client)

    // Execute the job
    const result = await jobService.executeJob(jobId)

    consola.success(`POST /api/jobs/${jobId}/execute - Job completed successfully`)

    return {
      success: true,
      data: result
    }
  } catch (error) {
    // Log error but don't expose internal details
    consola.error('POST /api/jobs/[id]/execute - Error:', error)

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // For execution errors, return 500 but log the details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: `Job execution failed: ${errorMessage}`
    })
  }
})

