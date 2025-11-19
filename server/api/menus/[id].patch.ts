/**
 * PATCH /api/menus/[id]
 *
 * Update an existing menu.
 * Requires admin authentication.
 *
 * @param {string} id - Menu UUID
 *
 * Request Body (all fields optional):
 * - name: Menu name
 * - slug: Menu slug
 * - description: Menu description
 * - show_in_header: Show in header
 * - show_in_footer: Show in footer
 * - is_enabled: Enabled status
 * - display_order: Display order
 * - metadata: Additional metadata
 *
 * @returns {Object} Updated menu data
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { MenuService } from '../../services/MenuService'
import { updateMenuSchema } from '../../schemas/menu.schemas'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    const userId = await requireAdmin(event)

    // Get menu ID from route params
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Menu ID is required'
      })
    }

    if (import.meta.dev) {
      consola.info(`PATCH /api/menus/${id} - Updating menu`, { userId })
    }

    // Get and validate request body
    const body = await readBody(event)
    const validatedData = updateMenuSchema.parse(body)

    if (import.meta.dev) {
      consola.info(`PATCH /api/menus/${id} - Validated data:`, validatedData)
    }

    // Get Supabase client and create service
    const client = await serverSupabaseClient(event)
    const menuService = new MenuService(client)

    // Update menu using service (handles slug uniqueness validation)
    const updatedMenu = await menuService.updateMenu(id, validatedData, userId)

    if (import.meta.dev) {
      consola.success(`PATCH /api/menus/${id} - Menu updated:`, {
        id: updatedMenu.id,
        name: updatedMenu.name,
        slug: updatedMenu.slug
      })
    }

    return {
      success: true,
      data: updatedMenu,
      message: 'Menu updated successfully'
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('PATCH /api/menus/[id] - Error:', error)
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
      message: 'Failed to update menu'
    })
  }
})

