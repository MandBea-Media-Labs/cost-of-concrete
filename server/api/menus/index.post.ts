/**
 * POST /api/menus
 *
 * Create a new menu.
 * Requires admin authentication.
 *
 * Request Body:
 * - name: Menu name (required)
 * - slug: Menu slug (required, lowercase alphanumeric with hyphens)
 * - description: Menu description (optional)
 * - show_in_header: Show in header (default: false)
 * - show_in_footer: Show in footer (default: false)
 * - is_enabled: Enabled status (default: true)
 * - display_order: Display order (default: 0)
 * - metadata: Additional metadata (optional)
 *
 * @returns {Object} Created menu data
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { MenuService } from '../../services/MenuService'
import { createMenuSchema } from '../../schemas/menu.schemas'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    const userId = await requireAdmin(event)

    if (import.meta.dev) {
      consola.info('POST /api/menus - Creating new menu', { userId })
    }

    // Get and validate request body
    const body = await readBody(event)
    const validatedData = createMenuSchema.parse(body)

    if (import.meta.dev) {
      consola.info('POST /api/menus - Validated data:', {
        name: validatedData.name,
        slug: validatedData.slug,
        show_in_header: validatedData.show_in_header,
        show_in_footer: validatedData.show_in_footer
      })
    }

    // Get Supabase client and create service
    const client = await serverSupabaseClient(event)
    const menuService = new MenuService(client)

    // Create menu using service (handles slug uniqueness validation)
    const menu = await menuService.createMenu(validatedData, userId)

    if (import.meta.dev) {
      consola.success('POST /api/menus - Menu created:', {
        id: menu.id,
        name: menu.name,
        slug: menu.slug
      })
    }

    return {
      success: true,
      data: menu,
      message: 'Menu created successfully'
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('POST /api/menus - Error:', error)
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

    // Handle business logic errors (from MenuService)
    if (error instanceof Error) {
      if (error.message.includes('already exists') || error.message.includes('slug')) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Conflict',
          message: error.message
        })
      }

      if (error.message.includes('Invalid') || error.message.includes('location')) {
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
      message: 'Failed to create menu'
    })
  }
})

