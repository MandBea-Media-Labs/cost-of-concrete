/**
 * GET /api/public/contractors/[citySlug]/[contractorSlug]
 *
 * Public endpoint to get a single contractor by city and contractor slug
 * Used for contractor profile pages
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { ContractorRepository } from '../../../../repositories/ContractorRepository'
import type { ContractorMetadata } from '../../../../repositories/ContractorRepository'

export default defineEventHandler(async (event) => {
  const citySlug = getRouterParam(event, 'citySlug')
  const contractorSlug = getRouterParam(event, 'contractorSlug')

  if (!citySlug || !contractorSlug) {
    throw createError({
      statusCode: 400,
      message: 'City slug and contractor slug are required'
    })
  }

  const client = await serverSupabaseClient(event)
  const contractorRepo = new ContractorRepository(client)

  try {
    const contractor = await contractorRepo.findBySlugPublic(citySlug, contractorSlug)

    if (!contractor) {
      throw createError({
        statusCode: 404,
        message: `Contractor not found: ${contractorSlug} in ${citySlug}`
      })
    }

    const metadata = (contractor.metadata || {}) as ContractorMetadata

    // Transform for public response
    return {
      id: contractor.id,
      companyName: contractor.company_name,
      slug: contractor.slug,
      description: contractor.description,
      streetAddress: contractor.street_address,
      postalCode: contractor.postal_code,
      phone: contractor.phone,
      email: contractor.email,
      website: contractor.website,
      rating: contractor.rating,
      reviewCount: contractor.review_count,
      cityName: contractor.city_name,
      citySlug: contractor.city_slug,
      stateCode: contractor.state_code,
      lat: contractor.lat,
      lng: contractor.lng,
      // Metadata fields
      images: metadata.images || [],
      categories: metadata.categories || [],
      socialLinks: metadata.social_links || {},
      openingHours: metadata.opening_hours || {}
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    consola.error('Error fetching contractor:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch contractor'
    })
  }
})

