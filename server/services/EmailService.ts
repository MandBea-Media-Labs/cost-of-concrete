/**
 * Email Service
 *
 * Handles sending transactional emails using the Resend SDK.
 * Used for business claim notifications.
 *
 * Email types:
 * - Claim submission confirmation (to claimant)
 * - Claim approved notification (to claimant)
 * - Claim rejected notification (to claimant)
 * - New claim alert (to admin)
 */

import { Resend } from 'resend'
import { consola } from 'consola'

interface EmailServiceConfig {
  apiKey: string
  fromEmail: string
  siteName: string
  siteUrl: string
}

interface ClaimEmailData {
  claimantEmail: string
  claimantName: string | null
  businessName: string
  businessSlug?: string
}

export class EmailService {
  private resend: Resend
  private fromEmail: string
  private siteName: string
  private siteUrl: string

  constructor(config: EmailServiceConfig) {
    this.resend = new Resend(config.apiKey)
    this.fromEmail = config.fromEmail
    this.siteName = config.siteName
    this.siteUrl = config.siteUrl
  }

  /**
   * Send claim submission confirmation to the claimant
   */
  async sendClaimSubmittedEmail(data: ClaimEmailData): Promise<boolean> {
    const { claimantEmail, claimantName, businessName } = data
    const displayName = claimantName || 'there'

    try {
      const { error } = await this.resend.emails.send({
        from: `${this.siteName} <${this.fromEmail}>`,
        to: claimantEmail,
        subject: `Your claim for ${businessName} has been submitted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Claim Submitted</h1>
            <p>Hi ${displayName},</p>
            <p>We have received your claim request for <strong>${businessName}</strong>.</p>
            <p>Our team will review your request and get back to you shortly. This typically takes 1-2 business days.</p>
            <p>If you have any questions, please reply to this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
            <p style="color: #666; font-size: 14px;">
              Best regards,<br />
              The ${this.siteName} Team
            </p>
          </div>
        `,
      })

      if (error) {
        consola.error('EmailService.sendClaimSubmittedEmail - Failed:', error)
        return false
      }

      if (import.meta.dev) {
        consola.success(`EmailService - Claim submitted email sent to ${claimantEmail}`)
      }
      return true
    } catch (err) {
      consola.error('EmailService.sendClaimSubmittedEmail - Error:', err)
      return false
    }
  }

  /**
   * Send claim approved notification to the claimant
   */
  async sendClaimApprovedEmail(data: ClaimEmailData): Promise<boolean> {
    const { claimantEmail, claimantName, businessName } = data
    const displayName = claimantName || 'there'
    const dashboardUrl = `${this.siteUrl}/owner`

    try {
      const { error } = await this.resend.emails.send({
        from: `${this.siteName} <${this.fromEmail}>`,
        to: claimantEmail,
        subject: `Your claim for ${businessName} has been approved!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Claim Approved!</h1>
            <p>Hi ${displayName},</p>
            <p>Great news! Your claim for <strong>${businessName}</strong> has been approved.</p>
            <p>You can now manage your business profile through your owner dashboard:</p>
            <p style="margin: 24px 0;">
              <a href="${dashboardUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Owner Dashboard
              </a>
            </p>
            <p>From your dashboard, you can:</p>
            <ul>
              <li>Update your business information</li>
              <li>Edit your company description</li>
              <li>Manage contact details</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
            <p style="color: #666; font-size: 14px;">
              Best regards,<br />
              The ${this.siteName} Team
            </p>
          </div>
        `,
      })

      if (error) {
        consola.error('EmailService.sendClaimApprovedEmail - Failed:', error)
        return false
      }

      if (import.meta.dev) {
        consola.success(`EmailService - Claim approved email sent to ${claimantEmail}`)
      }
      return true
    } catch (err) {
      consola.error('EmailService.sendClaimApprovedEmail - Error:', err)
      return false
    }
  }

  /**
   * Send claim rejected notification to the claimant
   */
  async sendClaimRejectedEmail(data: ClaimEmailData & { adminNotes?: string }): Promise<boolean> {
    const { claimantEmail, claimantName, businessName, adminNotes } = data
    const displayName = claimantName || 'there'

    try {
      const { error } = await this.resend.emails.send({
        from: `${this.siteName} <${this.fromEmail}>`,
        to: claimantEmail,
        subject: `Update on your claim for ${businessName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Claim Update</h1>
            <p>Hi ${displayName},</p>
            <p>Unfortunately, we were unable to approve your claim for <strong>${businessName}</strong> at this time.</p>
            ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
            <p>If you believe this was a mistake or have additional documentation to support your claim, please reply to this email.</p>
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
            <p style="color: #666; font-size: 14px;">
              Best regards,<br />
              The ${this.siteName} Team
            </p>
          </div>
        `,
      })

      if (error) {
        consola.error('EmailService.sendClaimRejectedEmail - Failed:', error)
        return false
      }

      if (import.meta.dev) {
        consola.success(`EmailService - Claim rejected email sent to ${claimantEmail}`)
      }
      return true
    } catch (err) {
      consola.error('EmailService.sendClaimRejectedEmail - Error:', err)
      return false
    }
  }
}

