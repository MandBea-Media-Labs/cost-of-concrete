/**
 * GET /api/public/badges/[token].svg
 *
 * Serves verified contractor badge SVG and logs the request.
 * On first valid external referrer, auto-verifies the contractor.
 *
 * This endpoint:
 * 1. Validates the embed token (UUID format)
 * 2. Looks up the contractor by embed_token
 * 3. Logs the request (IP, referrer, user-agent)
 * 4. If not yet verified AND referrer is external, auto-verifies
 * 5. Returns the badge SVG
 */

import { consola } from 'consola'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/supabase'
import { getClientIP } from '../../../utils/clientIP'
import { generateBadgeSVG, generatePlaceholderBadgeSVG } from '../../../utils/badge'

// UUID regex for validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Our domains (not considered external)
const OUR_DOMAINS = ['costofconcrete.com', 'www.costofconcrete.com', 'localhost']

export default defineEventHandler(async (event) => {
  // Extract token from route param (remove .svg suffix if present)
  const rawToken = getRouterParam(event, 'token') || ''
  const token = rawToken.replace(/\.svg$/i, '')

  // Set SVG headers regardless of outcome
  setHeader(event, 'Content-Type', 'image/svg+xml')
  setHeader(event, 'Cache-Control', 'public, max-age=300')

  // Validate token format
  if (!token || !UUID_REGEX.test(token)) {
    return generatePlaceholderBadgeSVG()
  }

  // Get admin client for database operations
  const adminClient = serverSupabaseServiceRole<Database>(event)

  // Look up contractor by embed_token
  const { data: contractor, error: lookupError } = await adminClient
    .from('contractors')
    .select('id, embed_verified, embed_verified_at')
    .eq('embed_token', token)
    .maybeSingle()

  if (lookupError) {
    consola.error('[badge] Database error:', lookupError.message)
    return generatePlaceholderBadgeSVG()
  }

  if (!contractor) {
    return generatePlaceholderBadgeSVG()
  }

  // Extract request metadata
  const clientIP = getClientIP(event)
  const referrer = getHeader(event, 'referer') || getHeader(event, 'referrer') || null
  const userAgent = getHeader(event, 'user-agent') || null

  // Log the request (async, non-blocking)
  adminClient
    .from('badge_embed_logs')
    .insert({
      contractor_id: contractor.id,
      request_ip: clientIP,
      referrer_url: referrer,
      user_agent: userAgent,
    })
    .then(({ error }) => {
      if (error) {
        consola.error('[badge] Failed to log embed request:', error.message)
      }
    })

  // Check for auto-verification opportunity
  if (!contractor.embed_verified && referrer) {
    try {
      const referrerUrl = new URL(referrer)
      const referrerDomain = referrerUrl.hostname.toLowerCase()

      // Check if referrer is external
      const isExternal = !OUR_DOMAINS.some(
        domain => referrerDomain === domain || referrerDomain.endsWith(`.${domain}`)
      )

      if (isExternal) {
        // Auto-verify the contractor
        const { error: verifyError } = await adminClient
          .from('contractors')
          .update({
            embed_verified: true,
            embed_verified_at: new Date().toISOString(),
            embed_verified_domain: referrerDomain,
          })
          .eq('id', contractor.id)
          .is('embed_verified', false) // Only update if not already verified

        if (verifyError) {
          consola.error('[badge] Failed to auto-verify contractor:', verifyError.message)
        } else {
          consola.info(`[badge] Auto-verified contractor ${contractor.id} from domain: ${referrerDomain}`)
        }
      }
    } catch {
      // Invalid referrer URL, ignore
    }
  }

  return generateBadgeSVG()
})
