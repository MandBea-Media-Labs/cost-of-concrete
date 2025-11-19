/**
 * Authentication Utility
 *
 * Universal, lightweight authentication for API endpoints.
 * Backed by Supabase RLS policies for defense in depth.
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import type { H3Event } from 'h3'

/**
 * Require authentication for an API endpoint
 *
 * This function ensures that:
 * 1. A valid Supabase session exists
 * 2. The user is authenticated
 * 3. RLS policies will be enforced at the database level
 *
 * @param event - H3 event object
 * @throws {Error} - 401 Unauthorized if not authenticated
 * @returns {Promise<string>} - User ID of authenticated user
 *
 * @example
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   const userId = await requireAuth(event)
 *   // User is authenticated, proceed with logic
 * })
 * ```
 */
export async function requireAuth(event: H3Event): Promise<string> {
  try {
    // Get Supabase client from event context
    const client = await serverSupabaseClient(event)

    // Get current user session
    const { data: { user }, error } = await client.auth.getUser()

    if (error || !user) {
      if (import.meta.dev) {
        consola.warn('Authentication failed:', error?.message || 'No user session')
      }

      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Authentication required. Please log in.'
      })
    }

    if (import.meta.dev) {
      consola.success('User authenticated:', user.id)
    }

    return user.id
  } catch (error) {
    if (import.meta.dev) {
      consola.error('Auth error:', error)
    }

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Otherwise create a new error
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication failed'
    })
  }
}

/**
 * Optional authentication for an API endpoint
 *
 * Returns user ID if authenticated, null otherwise.
 * Useful for endpoints that have different behavior for authenticated vs anonymous users.
 *
 * @param event - H3 event object
 * @returns {Promise<string | null>} - User ID if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * export default defineEventHandler(async (event) => {
 *   const userId = await optionalAuth(event)
 *   if (userId) {
 *     // Show personalized content
 *   } else {
 *     // Show public content
 *   }
 * })
 * ```
 */
export async function optionalAuth(event: H3Event): Promise<string | null> {
  try {
    const client = await serverSupabaseClient(event)
    const { data: { user } } = await client.auth.getUser()

    if (user) {
      if (import.meta.dev) {
        consola.info('Optional auth: User authenticated:', user.id)
      }
      return user.id
    }

    if (import.meta.dev) {
      consola.info('Optional auth: Anonymous user')
    }

    return null
  } catch (error) {
    if (import.meta.dev) {
      consola.warn('Optional auth error:', error)
    }
    return null
  }
}

/**
 * Get authenticated user and admin flag for server-side route guards
 *
 * Returns both the user ID (or null if unauthenticated) and the is_admin flag
 * from the user_profiles table. This is intentionally non-throwing so that
 * callers (like route middleware) can decide whether to redirect or throw.
 */
export async function getAuthUserAndIsAdmin(event: H3Event): Promise<{ userId: string | null; isAdmin: boolean | null }> {
  try {
    const client = await serverSupabaseClient(event)
    const { data: { user }, error } = await client.auth.getUser()

    if (error || !user) {
      if (import.meta.dev) {
        consola.warn('getAuthUserAndIsAdmin: no authenticated user', error?.message || 'No user')
      }
      return { userId: null, isAdmin: null }
    }

    const { data, error: profileError } = await client
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError && import.meta.dev) {
      consola.warn('getAuthUserAndIsAdmin: error fetching user_profiles row', profileError.message)
    }

    const isAdmin = data ? !!data.is_admin : false

    if (import.meta.dev) {
      consola.info('getAuthUserAndIsAdmin: resolved admin flag', { userId: user.id, isAdmin })
    }

    return { userId: user.id, isAdmin }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('getAuthUserAndIsAdmin: unexpected error', error)
    }
    return { userId: null, isAdmin: null }
  }
}

