/**
 * POST /api/pages
 *
 * Create a new page.
 * Requires authentication.
 *
 * Request Body:
 * - title: Page title (required)
 * - content: Page content (required)
 * - parentId: Parent page ID (optional, null for root pages)
 * - slug: Custom slug (optional, auto-generated from title if not provided)
 * - template: Template type (optional, auto-assigned based on depth)
 * - description: Page description (optional)
 * - status: Page status (optional, default: draft)
 * - SEO fields: metaTitle, metaKeywords, ogImage, focusKeyword, etc.
 * - metadata: Template-specific metadata (optional)
 *
 * @returns {Object} Created page data
 */

import { consola } from 'consola'
import { PageService } from '../../services/PageService'
import { createPageSchema } from '../../schemas/page.schemas'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication for creating pages
    const userId = await requireAuth(event)

    if (import.meta.dev) {
      consola.info('POST /api/pages - Creating new page', { userId })
    }

    // Get and validate request body
    const body = await readBody(event)
    const validatedData = createPageSchema.parse(body)

    if (import.meta.dev) {
      consola.info('POST /api/pages - Validated data:', {
        title: validatedData.title,
        parentId: validatedData.parentId,
        template: validatedData.template,
        status: validatedData.status
      })
    }

    // Get Supabase client and create service
    const client = await serverSupabaseClient(event)
    const pageService = new PageService(client)

    // Create page using service (handles all business logic)
    const page = await pageService.createPage({
      title: validatedData.title,
      content: validatedData.content,
      parentId: validatedData.parentId || undefined,
      slug: validatedData.slug,
      template: validatedData.template,
      description: validatedData.description || undefined,
      status: validatedData.status,
      metaTitle: validatedData.metaTitle || undefined,
      metaKeywords: validatedData.metaKeywords || undefined,
      ogImage: validatedData.ogImage || undefined,
      focusKeyword: validatedData.focusKeyword || undefined,
      metaRobots: validatedData.metaRobots,
      sitemapPriority: validatedData.sitemapPriority || undefined,
      sitemapChangefreq: validatedData.sitemapChangefreq,
      canonicalUrl: validatedData.canonicalUrl || undefined,
      redirectUrl: validatedData.redirectUrl || undefined,
      redirectType: validatedData.redirectType,
      metadata: validatedData.metadata || undefined
    })

    if (import.meta.dev) {
      consola.success('POST /api/pages - Page created:', {
        id: page.id,
        title: page.title,
        slug: page.slug,
        full_path: page.full_path,
        depth: page.depth,
        template: page.template
      })
    }

    return {
      success: true,
      data: page,
      message: 'Page created successfully'
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('POST /api/pages - Error:', error)
    }

    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid request data',
        data: error.issues
      })
    }

    // Handle business logic errors (from PageService)
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message.includes('already exists') || error.message.includes('Slug')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          message: error.message
        })
      }

      if (error.message.includes('Invalid') || error.message.includes('not allowed')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: error.message
        })
      }
    }

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to create page'
    })
  }
})

