/**
 * PATCH /api/claims/[id]
 *
 * Approve or reject a business claim (admin only).
 *
 * When approved:
 * - Updates claim status to 'approved'
 * - Sets contractor.is_claimed = true
 * - Sets contractor.claimed_by = claimant_user_id (if exists)
 * - Sets contractor.claimed_at = now()
 *
 * @param {string} id - Claim UUID
 *
 * Request Body:
 * - status: 'approved' | 'rejected' (required)
 * - adminNotes: Optional notes about the decision
 *
 * @returns {Object} Updated claim data
 */

import { consola } from 'consola'
import { serverSupabaseClient } from '#supabase/server'
import { requireAdmin } from '../../utils/auth'
import type { Database } from '../../../app/types/supabase'
import { z } from 'zod'
import { EmailService } from '../../services/EmailService'

// Request body schema
const updateClaimSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  adminNotes: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    // Get claim ID from route params
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Claim ID is required',
      })
    }

    // Require admin authentication
    const adminUserId = await requireAdmin(event)

    if (import.meta.dev) {
      consola.info(`PATCH /api/claims/${id} - Updating claim`, { adminUserId })
    }

    // Get and validate request body
    const body = await readBody(event)
    const validatedData = updateClaimSchema.parse(body)

    if (import.meta.dev) {
      consola.info(`PATCH /api/claims/${id} - Validated data:`, validatedData)
    }

    // Get Supabase client
    const client = await serverSupabaseClient<Database>(event)

    // Get the claim first to check it exists and get contractor_id
    const { data: existingClaim, error: fetchError } = await client
      .from('business_claims')
      .select('*, contractor:contractors!business_claims_contractor_id_fkey (id, company_name)')
      .eq('id', id)
      .single()

    if (fetchError || !existingClaim) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'Claim not found',
      })
    }

    // Check claim is still pending
    if (existingClaim.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: `Claim has already been ${existingClaim.status}`,
      })
    }

    // Update the claim
    const { data: updatedClaim, error: updateError } = await client
      .from('business_claims')
      .update({
        status: validatedData.status,
        admin_notes: validatedData.adminNotes || null,
        reviewed_by: adminUserId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, contractor:contractors!business_claims_contractor_id_fkey (id, company_name, slug)')
      .single()

    if (updateError) {
      consola.error(`PATCH /api/claims/${id} - Update error:`, updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to update claim',
      })
    }

    // If approved, update the contractor
    if (validatedData.status === 'approved') {
      const { error: contractorError } = await client
        .from('contractors')
        .update({
          is_claimed: true,
          claimed_by: existingClaim.claimant_user_id || null,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingClaim.contractor_id)

      if (contractorError) {
        consola.error(`PATCH /api/claims/${id} - Contractor update error:`, contractorError)
        // Don't throw - claim was updated, just log the error
      } else if (import.meta.dev) {
        consola.success(`PATCH /api/claims/${id} - Contractor marked as claimed`)
      }
    }

    if (import.meta.dev) {
      consola.success(`PATCH /api/claims/${id} - Claim ${validatedData.status}`)
    }

    // Send notification email to claimant (non-blocking)
    const config = useRuntimeConfig()
    if (config.resendApiKey && existingClaim.claimant_email) {
      const emailService = new EmailService({
        apiKey: config.resendApiKey,
        fromEmail: 'claims@mail.costofconcrete.com',
        siteName: config.public.siteName || 'Cost of Concrete',
        siteUrl: config.public.siteUrl || 'https://costofconcrete.com',
      })

      const emailData = {
        claimantEmail: existingClaim.claimant_email,
        claimantName: existingClaim.claimant_name,
        businessName: (existingClaim.contractor as { company_name: string })?.company_name || 'your business',
      }

      // Fire and forget - don't block the response
      if (validatedData.status === 'approved') {
        emailService.sendClaimApprovedEmail(emailData).catch((err) => {
          consola.error('Failed to send claim approved email:', err)
        })
      } else {
        emailService.sendClaimRejectedEmail({
          ...emailData,
          adminNotes: validatedData.adminNotes,
        }).catch((err) => {
          consola.error('Failed to send claim rejected email:', err)
        })
      }
    }

    return {
      success: true,
      data: updatedClaim,
      message: `Claim ${validatedData.status} successfully`,
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('PATCH /api/claims/[id] - Error:', error)
    }

    // Re-throw HTTP errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Invalid request body',
        data: error.errors,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  }
})

