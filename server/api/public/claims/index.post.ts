/**
 * POST /api/public/claims
 *
 * Public endpoint to submit a business claim request
 * Anyone can submit a claim for an unclaimed contractor
 */

import { z } from 'zod'
import { consola } from 'consola'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const claimRequestSchema = z.object({
  contractorId: z.string().uuid('Invalid contractor ID'),
  claimantName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  claimantEmail: z.string().email('Invalid email address'),
  claimantPhone: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Parse and validate request body
  const body = await readBody(event)
  const parsed = claimRequestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request',
      data: parsed.error.flatten().fieldErrors,
    })
  }

  const { contractorId, claimantName, claimantEmail, claimantPhone } = parsed.data

  // Get current user if authenticated (optional)
  let userId: string | null = null
  try {
    const user = await serverSupabaseUser(event)
    userId = user?.id || null
  } catch {
    // Not authenticated, that's fine
  }

  // Check contractor exists and is not already claimed
  const { data: contractor, error: contractorError } = await client
    .from('contractors')
    .select('id, company_name, email, is_claimed')
    .eq('id', contractorId)
    .single()

  if (contractorError || !contractor) {
    consola.error('Contractor lookup error:', contractorError)
    throw createError({
      statusCode: 404,
      message: 'Contractor not found',
    })
  }

  if (contractor.is_claimed) {
    throw createError({
      statusCode: 400,
      message: 'This business has already been claimed',
    })
  }

  // Check if there's already a pending claim for this contractor
  const { data: existingClaim } = await client
    .from('business_claims')
    .select('id, status')
    .eq('contractor_id', contractorId)
    .eq('status', 'pending')
    .single()

  if (existingClaim) {
    throw createError({
      statusCode: 400,
      message: 'A claim for this business is already pending review',
    })
  }

  // Determine verification method
  const emailMatch = contractor.email?.toLowerCase() === claimantEmail.toLowerCase()
  const verificationMethod = emailMatch ? 'email_match' : 'admin_approval'

  // Create the claim
  const { data: claim, error: claimError } = await client
    .from('business_claims')
    .insert({
      contractor_id: contractorId,
      claimant_user_id: userId,
      claimant_email: claimantEmail,
      claimant_name: claimantName,
      claimant_phone: claimantPhone || null,
      verification_method: verificationMethod,
      status: 'pending',
    })
    .select()
    .single()

  if (claimError) {
    consola.error('Failed to create claim:', claimError)
    throw createError({
      statusCode: 500,
      message: 'Failed to submit claim',
    })
  }

  consola.success(`Claim submitted for ${contractor.company_name} by ${claimantEmail}`)

  return {
    success: true,
    message: 'Your claim has been submitted for review',
    claimId: claim.id,
    verificationMethod,
  }
})

