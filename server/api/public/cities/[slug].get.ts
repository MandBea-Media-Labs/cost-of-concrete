/**
 * GET /api/public/cities/[slug]
 *
 * Public endpoint to get city by slug
 * Used for page context (city name, state, etc.)
 */

import { consola } from 'consola'
import { LookupRepository } from '../../../repositories/LookupRepository'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'City slug is required'
    })
  }

  const client = await serverSupabaseClient(event)
  const lookupRepo = new LookupRepository(client)

  try {
    // Try to find city by slug (returns first match if multiple states)
    const city = await lookupRepo.cities.findBySlugOnly(slug)

    if (!city) {
      throw createError({
        statusCode: 404,
        message: `City not found: ${slug}`
      })
    }

    return {
      id: city.id,
      name: city.name,
      slug: city.slug,
      stateCode: city.state_code,
      lat: city.lat,
      lng: city.lng
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    consola.error('Error fetching city:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch city'
    })
  }
})

