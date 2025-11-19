import { serverSupabaseClient } from '#supabase/server'
import { reorderPagesSchema } from '../../schemas/reorder.schema'
import { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  // Ensure user is admin
  await requireAdmin(event)

  const body = await readBody(event)
  const validation = reorderPagesSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: validation.error.errors
    })
  }

  const { pages } = validation.data

  // Validate all pages have same parent
  const parentIds = new Set(pages.map(p => p.parent_id))
  if (parentIds.size > 1) {
    throw createError({
      statusCode: 400,
      message: 'All pages must have same parent'
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  // Update display_order for each page
  // Note: Supabase doesn't support transactions via REST API yet,
  // so we update sequentially. In a real production app with high concurrency,
  // this should be an RPC call.
  const results = []
  const errors = []

  for (const page of pages) {
    const { error } = await client
      .from('pages')
      .update({ display_order: page.display_order })
      .eq('id', page.id)

    if (error) {
      errors.push({ id: page.id, error })
    } else {
      results.push(page.id)
    }
  }

  if (errors.length > 0) {
    console.error('Error reordering pages:', errors)
    throw createError({
      statusCode: 500,
      message: 'Failed to update some pages',
      data: errors
    })
  }

  return { success: true, updated: results.length }
})
