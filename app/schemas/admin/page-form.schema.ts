/**
 * Page Form Validation Schemas
 *
 * Zod schemas for client-side form validation in admin UI.
 * These schemas mirror the server-side schemas but are optimized for form UX.
 */

import { z } from 'zod'

// =====================================================
// CORE FIELD SCHEMAS
// =====================================================

/**
 * Slug validation
 * - Lowercase letters, numbers, and hyphens only
 * - Cannot start or end with hyphen
 * - No consecutive hyphens
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or less')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), 'Slug cannot start or end with a hyphen')

/**
 * Title validation
 */
export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title must be 200 characters or less')

/**
 * Description validation
 */
export const descriptionSchema = z
  .string()
  .max(500, 'Description must be 500 characters or less')
  .optional()
  .nullable()

/**
 * Template validation
 */
export const templateSchema = z.enum(['hub', 'spoke', 'sub-spoke', 'article', 'custom', 'default'], {
  errorMap: () => ({ message: 'Please select a valid template' })
})

/**
 * Status validation
 */
export const statusSchema = z.enum(['draft', 'published', 'archived'], {
  errorMap: () => ({ message: 'Please select a valid status' })
})

/**
 * Parent page validation (UUID or null)
 */
export const parentIdSchema = z
  .string()
  .uuid('Invalid parent page ID')
  .optional()
  .nullable()

/**
 * Content validation (markdown)
 */
export const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(50000, 'Content must be 50,000 characters or less')

// =====================================================
// SEO FIELD SCHEMAS
// =====================================================

/**
 * Meta title validation
 */
export const metaTitleSchema = z
  .string()
  .max(60, 'Meta title should be 60 characters or less for optimal SEO')
  .optional()
  .nullable()

/**
 * Meta keywords validation
 */
export const metaKeywordsSchema = z
  .array(z.string())
  .max(10, 'Maximum 10 keywords allowed')
  .optional()
  .nullable()

/**
 * OG Image validation
 */
export const ogImageSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .nullable()

/**
 * Focus keyword validation
 */
export const focusKeywordSchema = z
  .string()
  .max(100, 'Focus keyword must be 100 characters or less')
  .optional()
  .nullable()

/**
 * Meta robots validation
 */
export const metaRobotsSchema = z
  .array(
    z.enum(['index', 'noindex', 'follow', 'nofollow', 'noarchive', 'nosnippet', 'noimageindex', 'notranslate', 'none', 'all'])
  )
  .optional()
  .nullable()

/**
 * Sitemap priority validation
 */
export const sitemapPrioritySchema = z
  .number()
  .min(0, 'Priority must be between 0 and 1')
  .max(1, 'Priority must be between 0 and 1')
  .optional()
  .nullable()

/**
 * Sitemap changefreq validation
 */
export const sitemapChangefreqSchema = z
  .enum(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'])
  .optional()
  .nullable()

/**
 * Canonical URL validation
 */
export const canonicalUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .nullable()

/**
 * Redirect URL validation
 */
export const redirectUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .nullable()

/**
 * Redirect type validation
 */
export const redirectTypeSchema = z
  .enum([301, 302, 307, 308])
  .optional()
  .nullable()

// =====================================================
// CORE FIELDS FORM SCHEMA (Batch 2)
// =====================================================

/**
 * Core fields form schema for Batch 2
 * Includes: title, slug, parent, template, status, description
 */
export const coreFieldsFormSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  parentId: parentIdSchema,
  template: templateSchema,
  status: statusSchema,
  description: descriptionSchema
})

export type CoreFieldsFormData = z.infer<typeof coreFieldsFormSchema>

export const coreFieldsDefaultValues: CoreFieldsFormData = {
  title: '',
  slug: '',
  parentId: null,
  template: 'default',
  status: 'draft',
  description: ''
}

// =====================================================
// CONTENT + CORE FIELDS FORM SCHEMA (Batch 3)
// =====================================================

/**
 * Content + core fields form schema for Batch 3
 * Adds content field to core fields
 */
export const contentFormSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  parentId: parentIdSchema,
  template: templateSchema,
  status: statusSchema,
  description: descriptionSchema,
  content: contentSchema
})

export type ContentFormData = z.infer<typeof contentFormSchema>

export const contentFormDefaultValues: ContentFormData = {
  title: '',
  slug: '',
  parentId: null,
  template: 'default',
  status: 'draft',
  description: '',
  content: ''
}

// =====================================================
// COMPLETE PAGE FORM SCHEMA (All Batches)
// =====================================================

/**
 * Complete page form schema (will be built across Batches 2-4)
 * This is the final schema that includes all fields
 */
export const pageFormSchema = z.object({
  // Core fields (Batch 2)
  title: titleSchema,
  slug: slugSchema,
  parentId: parentIdSchema,
  template: templateSchema,
  status: statusSchema,
  description: descriptionSchema,

  // Content field (Batch 3)
  content: contentSchema,

  // SEO fields (Batch 4)
  metaTitle: metaTitleSchema,
  metaKeywords: metaKeywordsSchema,
  ogImage: ogImageSchema,
  focusKeyword: focusKeywordSchema,
  metaRobots: metaRobotsSchema,
  sitemapPriority: sitemapPrioritySchema,
  sitemapChangefreq: sitemapChangefreqSchema,
  canonicalUrl: canonicalUrlSchema,
  redirectUrl: redirectUrlSchema,
  redirectType: redirectTypeSchema,

  // Metadata (Batch 4)
  metadata: z.record(z.any()).optional().nullable()
})

export type PageFormData = z.infer<typeof pageFormSchema>

// =====================================================
// DEFAULT VALUES
// =====================================================

/**
 * Default values for complete page form
 */
export const pageFormDefaultValues: PageFormData = {
  ...coreFieldsDefaultValues,
  content: '',
  metaTitle: null,
  metaKeywords: null,
  ogImage: null,
  focusKeyword: null,
  metaRobots: null,
  sitemapPriority: null,
  sitemapChangefreq: null,
  canonicalUrl: null,
  redirectUrl: null,
  redirectType: null,
  metadata: null
}

