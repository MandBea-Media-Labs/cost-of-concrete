/**
 * GET /api/ai/stats
 *
 * Get AI article job statistics for the dashboard.
 * Requires admin authentication.
 *
 * @returns {Object} Job counts by status
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdmin(event)

    const client = await serverSupabaseClient(event)

    // Get counts for each status using parallel queries
    const [
      { count: totalCount },
      { count: pendingCount },
      { count: processingCount },
      { count: completedCount },
      { count: failedCount },
      { count: cancelledCount },
    ] = await Promise.all([
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }),
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      client.from('ai_article_jobs').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    ])

    return {
      success: true,
      stats: {
        total: totalCount ?? 0,
        pending: pendingCount ?? 0,
        processing: processingCount ?? 0,
        completed: completedCount ?? 0,
        failed: failedCount ?? 0,
        cancelled: cancelledCount ?? 0,
      },
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('GET /api/ai/stats - Error:', error)
    }

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch AI stats',
    })
  }
})

