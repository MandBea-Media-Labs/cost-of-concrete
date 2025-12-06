/**
 * GET /api/contractors/[id]
 *
 * Get a specific contractor by ID (admin only).
 *
 * @param {string} id - Contractor UUID
 * @returns {Object} Contractor data with city info
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../../utils/auth'
import type { Database } from '../../../app/types/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Get contractor ID from route params
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Contractor ID is required',
      })
    }

    // Require admin authentication
    const userId = await requireAdmin(event)

    if (import.meta.dev) {
      consola.info(`GET /api/contractors/${id} - Fetching contractor`, { userId })
    }

    // Get Supabase client
    const client = await serverSupabaseClient<Database>(event)

    // Get contractor with city data
    const { data: contractor, error } = await client
      .from('contractors')
      .select(`
        *,
        city:cities!contractors_city_id_fkey (
          id,
          name,
          slug,
          state_code
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        if (import.meta.dev) {
          consola.warn(`GET /api/contractors/${id} - Contractor not found`)
        }

        throw createError({
          statusCode: 404,
          statusMessage: 'Not Found',
          message: `Contractor with ID '${id}' not found`,
        })
      }
      throw error
    }

    if (import.meta.dev) {
      consola.success(`GET /api/contractors/${id} - Returning contractor: ${contractor.company_name}`)
    }

    return {
      success: true,
      data: contractor,
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('GET /api/contractors/[id] - Error:', error)
    }

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch contractor',
    })
  }
})

