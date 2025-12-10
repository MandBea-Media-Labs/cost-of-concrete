/**
 * Job Schemas
 *
 * Zod validation schemas for background job queue.
 * Defines job types, payloads, and API request/response types.
 */

import { z } from 'zod'
import type { Database } from '../../app/types/supabase'

// =====================================================
// DATABASE TYPES
// =====================================================

export type BackgroundJobRow = Database['public']['Tables']['background_jobs']['Row']
export type BackgroundJobInsert = Database['public']['Tables']['background_jobs']['Insert']
export type BackgroundJobUpdate = Database['public']['Tables']['background_jobs']['Update']

export type SystemLogRow = Database['public']['Tables']['system_logs']['Row']
export type SystemLogInsert = Database['public']['Tables']['system_logs']['Insert']

// =====================================================
// JOB STATUS & TYPES
// =====================================================

export const JOB_STATUSES = ['pending', 'processing', 'completed', 'failed', 'cancelled'] as const
export type JobStatus = typeof JOB_STATUSES[number]

export const JOB_TYPES = ['image_enrichment'] as const // Extend as needed
export type JobType = typeof JOB_TYPES[number]

// =====================================================
// JOB PAYLOADS (per job type)
// =====================================================

/**
 * Image Enrichment Job Payload
 */
export const imageEnrichmentPayloadSchema = z.object({
  batchSize: z.number().int().min(1).max(100).default(10),
  // Future: could add filters like cityId, contractorIds, etc.
})

export type ImageEnrichmentPayload = z.infer<typeof imageEnrichmentPayloadSchema>

/**
 * Union of all job payloads
 */
export type JobPayload = ImageEnrichmentPayload // | OtherPayload in future

// =====================================================
// JOB RESULT TYPES (per job type)
// =====================================================

export interface ImageEnrichmentResult {
  processedContractors: number
  totalImages: number
  successfulImages: number
  failedImages: number
  contractorsRemaining: number
  errors: Array<{
    contractorId: string
    companyName: string
    message: string
  }>
}

export type JobResult = ImageEnrichmentResult // | OtherResult in future

// =====================================================
// API REQUEST SCHEMAS
// =====================================================

/**
 * Create job request
 */
export const createJobSchema = z.object({
  jobType: z.enum(JOB_TYPES),
  payload: z.record(z.unknown()).optional().default({}),
})

export type CreateJobInput = z.infer<typeof createJobSchema>

/**
 * List jobs query params
 */
export const listJobsQuerySchema = z.object({
  status: z.enum(JOB_STATUSES).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>

/**
 * Execute job (internal, called by pg_cron)
 */
export const executeJobHeaderSchema = z.object({
  'x-job-runner-secret': z.string().min(1),
})

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface JobResponse {
  id: string
  jobType: JobType
  status: JobStatus
  attempts: number
  maxAttempts: number
  totalItems: number | null
  processedItems: number
  failedItems: number
  payload: JobPayload
  result: JobResult | null
  lastError: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  createdBy: string | null
}

export interface CreateJobResponse {
  success: boolean
  job: JobResponse
}

export interface ListJobsResponse {
  success: boolean
  jobs: JobResponse[]
  total: number
}

export interface JobProgressResponse {
  success: boolean
  job: {
    id: string
    status: JobStatus
    totalItems: number | null
    processedItems: number
    failedItems: number
    percentComplete: number
  }
}

// =====================================================
// CONSTANTS
// =====================================================

/** Retry delays in minutes: 1 min, 5 min, 15 min */
export const RETRY_DELAYS_MINUTES = [1, 5, 15]

/** Maximum job execution time before considered stuck */
export const JOB_TIMEOUT_MINUTES = 30

/** Default batch size for image enrichment */
export const DEFAULT_IMAGE_BATCH_SIZE = 10

