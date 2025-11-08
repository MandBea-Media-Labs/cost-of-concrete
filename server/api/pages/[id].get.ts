/**
 * GET /api/pages/[id]
 *
 * Get a specific page by ID.
 *
 * @param {string} id - Page UUID
 * @returns {Object} Page data
 */

import { consola } from 'consola'
import { PageService } from '../../services/PageService'

export default defineEventHandler(async (event) => {
  try {
    // Get page ID from route params
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Page ID is required'
      })
    }

    // Optional authentication - public can view published pages, authenticated users can view all
    const userId = await optionalAuth(event)

    if (import.meta.dev) {
      consola.info(`GET /api/pages/${id} - Fetching page`, { userId: userId || 'anonymous' })
    }

    // Get Supabase client and create service
    const client = await serverSupabaseClient(event)
    const pageService = new PageService(client)

    // Get page by ID
    const page = await pageService.repository.findById(id)

    if (!page) {
      if (import.meta.dev) {
        consola.warn(`GET /api/pages/${id} - Page not found`)
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Page with ID '${id}' not found`
      })
    }

    // Check if user can view this page
    // Public users can only view published pages
    if (!userId && page.status !== 'published') {
      if (import.meta.dev) {
        consola.warn(`GET /api/pages/${id} - Unauthorized access to ${page.status} page`)
      }

      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'You do not have permission to view this page'
      })
    }

    if (import.meta.dev) {
      consola.success(`GET /api/pages/${id} - Returning page: ${page.title}`)
    }

    return {
      success: true,
      data: page
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('GET /api/pages/[id] - Error:', error)
    }

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch page'
    })
  }
})

