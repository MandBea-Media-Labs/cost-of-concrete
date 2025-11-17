/**
 * PATCH /api/pages/[id]
 *
 * Update an existing page.
 * Requires authentication.
 *
 * @param {string} id - Page UUID
 *
 * Request Body (all fields optional):
 * - title: Page title
 * - content: Page content
 * - slug: Custom slug
 * - template: Template type
 * - description: Page description
 * - status: Page status
 * - SEO fields: metaTitle, metaKeywords, ogImage, focusKeyword, etc.
 * - metadata: Template-specific metadata
 *
 * @returns {Object} Updated page data
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { PageService } from '../../services/PageService'
import { updatePageSchema } from '../../schemas/page.schemas'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication for updates
    const userId = await requireAuth(event)

    // Get page ID from route params
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Page ID is required'
      })
    }

    if (import.meta.dev) {
      consola.info(`PATCH /api/pages/${id} - Updating page (auth temporarily disabled for testing)`)
    }

    // Get and validate request body
    const body = await readBody(event)
    const validatedData = updatePageSchema.parse(body)

    if (import.meta.dev) {
      consola.info(`PATCH /api/pages/${id} - Validated data:`, validatedData)
    }

    // Get Supabase client and create service
    const client = await serverSupabaseClient(event)
    const pageService = new PageService(client)

    // Verify page exists
    const existingPage = await pageService.repository.findById(id)

    if (!existingPage) {
      if (import.meta.dev) {
        consola.warn(`PATCH /api/pages/${id} - Page not found`)
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Page with ID '${id}' not found`
      })
    }

    // Update page using service
    const updatedPage = await pageService.updatePage(id, {
      title: validatedData.title,
      content: validatedData.content,
      slug: validatedData.slug,
      template: validatedData.template,
      description: validatedData.description,
      status: validatedData.status,
      metaTitle: validatedData.metaTitle,
      metaKeywords: validatedData.metaKeywords,
      ogImage: validatedData.ogImage,
      focusKeyword: validatedData.focusKeyword,
      metaRobots: validatedData.metaRobots,
      sitemapPriority: validatedData.sitemapPriority,
      sitemapChangefreq: validatedData.sitemapChangefreq,
      canonicalUrl: validatedData.canonicalUrl,
      redirectUrl: validatedData.redirectUrl,
      redirectType: validatedData.redirectType,
      metadata: validatedData.metadata
    })

    if (import.meta.dev) {
      consola.success(`PATCH /api/pages/${id} - Page updated:`, {
        id: updatedPage.id,
        title: updatedPage.title,
        status: updatedPage.status
      })
    }

    return {
      success: true,
      data: updatedPage,
      message: 'Page updated successfully'
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('PATCH /api/pages/[id] - Error:', error)
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

    // Handle business logic errors
    if (error instanceof Error) {
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
      message: 'Failed to update page'
    })
  }
})

