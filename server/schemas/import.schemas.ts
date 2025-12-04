/**
 * Import Schemas
 *
 * Zod validation schemas for Apify Google Maps Scraper JSON import.
 * Defines structure for incoming data and response types.
 */

import { z } from 'zod'

// =====================================================
// APIFY ROW SCHEMA
// =====================================================

/**
 * Schema for a single Apify export row
 * Based on Google Maps Scraper output format
 */
export const apifyRowSchema = z.object({
  // Required fields
  placeId: z.string().min(1, 'placeId is required'),
  title: z.string().min(1, 'title is required'),

  // Optional identifiers
  cid: z.string().optional().nullable(),

  // Location data
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional().nullable(),

  // Contact info
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  emails: z.array(z.string()).optional().nullable(),

  // Ratings
  totalScore: z.number().min(1).max(5).optional().nullable(),
  reviewsCount: z.number().int().min(0).optional().nullable(),

  // Categories
  categoryName: z.string().optional().nullable(),
  categories: z.array(z.string()).optional().nullable(),

  // Content
  description: z.string().optional().nullable(),
  openingHours: z.array(z.object({
    day: z.string(),
    hours: z.string(),
  })).optional().nullable(),

  // Images - Apify uses different formats:
  // - 'imageUrls': array of strings (simple format)
  // - 'images': array of objects with imageUrl property (detailed format)
  imageUrls: z.array(z.string()).optional().nullable(),
  images: z.array(
    z.union([
      z.string(),
      z.object({
        imageUrl: z.string(),
        authorName: z.string().optional().nullable(),
        authorUrl: z.string().optional().nullable(),
        uploadedAt: z.string().optional().nullable(),
      }),
    ])
  ).optional().nullable(),

  // Social links (from enrichment)
  facebooks: z.array(z.string()).optional().nullable(),
  instagrams: z.array(z.string()).optional().nullable(),
  linkedIns: z.array(z.string()).optional().nullable(),
  youtubes: z.array(z.string()).optional().nullable(),

  // Status
  permanentlyClosed: z.boolean().optional().nullable(),
})

export type ApifyRow = z.infer<typeof apifyRowSchema>

// =====================================================
// IMPORT FILE SCHEMA
// =====================================================

/**
 * Schema for the entire import file (array of rows)
 */
export const apifyImportFileSchema = z.array(apifyRowSchema)

export type ApifyImportFile = z.infer<typeof apifyImportFileSchema>

// =====================================================
// IMPORT RESPONSE TYPES
// =====================================================

export interface ImportError {
  row: number
  placeId: string | null
  message: string
}

export interface ImportSummary {
  total: number
  imported: number
  updated: number
  skipped: number
  pendingImageCount: number
  errors: ImportError[]
}

export interface ImportResponse {
  success: boolean
  summary: ImportSummary
}

// =====================================================
// ENRICHMENT RESPONSE TYPES
// =====================================================

export interface EnrichmentSummary {
  processedContractors: number
  totalImages: number
  failedImages: number
  contractorsRemaining: number
}

export interface EnrichmentResponse {
  success: boolean
  summary: EnrichmentSummary
}

// =====================================================
// CONSTANTS
// =====================================================

export const MAX_IMPORT_ROWS = 100
export const MAX_IMAGES_PER_CONTRACTOR = 5
export const IMAGE_DOWNLOAD_TIMEOUT_MS = 10000
export const GEOCODING_DELAY_MS = 100

