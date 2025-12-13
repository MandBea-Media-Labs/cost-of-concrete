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

export const JOB_TYPES = ['image_enrichment', 'contractor_enrichment', 'review_enrichment'] as const
export type JobType = typeof JOB_TYPES[number]

// =====================================================
// JOB PAYLOADS (per job type)
// =====================================================

/**
 * Image Enrichment Job Payload
 */
export const imageEnrichmentPayloadSchema = z.object({
  batchSize: z.number().int().min(1).max(100).default(10),
  continuous: z.boolean().default(false), // Auto-queue next batch on completion
  // Future: could add filters like cityId, contractorIds, etc.
})

export type ImageEnrichmentPayload = z.infer<typeof imageEnrichmentPayloadSchema>

/**
 * Contractor Enrichment Job Payload
 */
export const contractorEnrichmentPayloadSchema = z.object({
  contractorIds: z.array(z.string().uuid()).min(1).max(10),
  // Future: could add filters, retry options, etc.
})

export type ContractorEnrichmentPayload = z.infer<typeof contractorEnrichmentPayloadSchema>

/**
 * Review Enrichment Job Payload
 * Fetches Google reviews via DataForSEO API
 */
export const reviewEnrichmentPayloadSchema = z.object({
  contractorIds: z.array(z.string().uuid()).min(1).max(10),
  maxDepth: z.number().int().min(1).max(1500).default(50), // Max reviews per contractor
  continuous: z.boolean().default(false), // Auto-queue next batch on completion
})

export type ReviewEnrichmentPayload = z.infer<typeof reviewEnrichmentPayloadSchema>

/**
 * Union of all job payloads
 */
export type JobPayload = ImageEnrichmentPayload | ContractorEnrichmentPayload | ReviewEnrichmentPayload

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
  /** Flag indicating if continuous mode should queue next batch */
  shouldContinue?: boolean
}

export interface ContractorEnrichmentResult {
  processed: number
  successful: number
  skipped: number
  failed: number
  totalTokens: number
  results: Array<{
    contractorId: string
    companyName: string
    status: 'success' | 'skipped' | 'failed'
    message: string
    serviceTypesAssigned: number
  }>
}

export interface ReviewEnrichmentResult {
  processed: number
  successful: number
  skipped: number
  failed: number
  totalReviewsFetched: number
  totalReviewsSaved: number
  apiCost: number
  results: Array<{
    contractorId: string
    companyName: string
    status: 'success' | 'skipped' | 'failed'
    reason?: string
    reviewsFetched: number
    reviewsSaved: number
  }>
  /** Flag indicating if continuous mode should queue next batch */
  shouldContinue?: boolean
}

export type JobResult = ImageEnrichmentResult | ContractorEnrichmentResult | ReviewEnrichmentResult

// =====================================================
// API REQUEST SCHEMAS
// =====================================================

/**
 * Create job request
 */
export const createJobSchema = z.object({
  jobType: z.enum(JOB_TYPES),
  payload: z.record(z.string(), z.any()).optional().default({}),
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

/** Default batch size for contractor enrichment (max contractors per job) */
export const DEFAULT_CONTRACTOR_BATCH_SIZE = 10

/** Default batch size for review enrichment (max contractors per job) */
export const DEFAULT_REVIEW_BATCH_SIZE = 10

/** Default max reviews to fetch per contractor */
export const DEFAULT_REVIEW_MAX_DEPTH = 50

/** Maximum reviews per contractor (cost control) */
export const MAX_REVIEW_DEPTH = 1500

/** Re-enrichment cooldown in days */
export const REVIEW_ENRICHMENT_COOLDOWN_DAYS = 30

