/**
 * PATCH /api/owner/contractors/[id]
 *
 * Update a contractor profile by the owner.
 * Verifies ownership before allowing updates.
 */

import { consola } from 'consola'
import { z } from 'zod'
import { serverSupabaseClient } from '#supabase/server'
import { requireOwner } from '../../../utils/auth'

// Schema for updatable fields
const updateContractorSchema = z.object({
  companyName: z.string().min(2).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  website: z.string().url().max(500).optional().nullable(),
  streetAddress: z.string().max(500).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  // Metadata fields
  businessHours: z.record(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  socialLinks: z.record(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  const contractorId = getRouterParam(event, 'id')

  if (!contractorId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Contractor ID is required'
    })
  }

  // Verify ownership
  const userId = await requireOwner(event, contractorId)

  // Parse and validate request body
  const body = await readBody(event)
  const validationResult = updateContractorSchema.safeParse(body)

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: validationResult.error.errors[0]?.message || 'Invalid input'
    })
  }

  const updates = validationResult.data

  if (import.meta.dev) {
    consola.info('PATCH /api/owner/contractors/[id] - Updating contractor', { contractorId, userId, updates })
  }

  const client = await serverSupabaseClient(event)

  // Build update object
  const dbUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }

  // Map camelCase to snake_case for direct columns
  if (updates.companyName !== undefined) dbUpdates.company_name = updates.companyName
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.website !== undefined) dbUpdates.website = updates.website
  if (updates.streetAddress !== undefined) dbUpdates.street_address = updates.streetAddress
  if (updates.postalCode !== undefined) dbUpdates.postal_code = updates.postalCode

  // Handle metadata updates (merge with existing)
  if (updates.businessHours || updates.categories || updates.socialLinks) {
    // First fetch existing metadata
    const { data: existing } = await client
      .from('contractors')
      .select('metadata')
      .eq('id', contractorId)
      .single()

    const existingMetadata = (existing?.metadata as Record<string, unknown>) || {}
    const newMetadata = { ...existingMetadata }

    if (updates.businessHours !== undefined) newMetadata.business_hours = updates.businessHours
    if (updates.categories !== undefined) newMetadata.categories = updates.categories
    if (updates.socialLinks !== undefined) newMetadata.social_links = updates.socialLinks

    dbUpdates.metadata = newMetadata
  }

  // Perform update
  const { data: contractor, error } = await client
    .from('contractors')
    .update(dbUpdates)
    .eq('id', contractorId)
    .select('id, company_name, updated_at')
    .single()

  if (error) {
    consola.error('PATCH /api/owner/contractors/[id] - Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to update contractor'
    })
  }

  if (import.meta.dev) {
    consola.success('PATCH /api/owner/contractors/[id] - Contractor updated successfully')
  }

  return {
    success: true,
    contractor: {
      id: contractor.id,
      companyName: contractor.company_name,
      updatedAt: contractor.updated_at
    }
  }
})

