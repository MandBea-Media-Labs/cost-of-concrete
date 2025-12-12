/**
 * AI Extraction Service
 *
 * Uses OpenAI GPT-4o-mini with structured outputs to extract business information
 * from crawled website content. Infers applicable service types from existing categories.
 */

import OpenAI from 'openai'
import { consola } from 'consola'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

// =====================================================
// TYPES & SCHEMAS
// =====================================================

export const businessHoursSchema = z.object({
  monday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  tuesday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  wednesday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  thursday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  friday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  saturday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
  sunday: z.object({ open: z.string().nullable(), close: z.string().nullable() }).nullable(),
})

export const socialLinksSchema = z.object({
  facebook: z.string().nullable(),
  instagram: z.string().nullable(),
  twitter: z.string().nullable(),
  linkedin: z.string().nullable(),
  youtube: z.string().nullable(),
  yelp: z.string().nullable(),
})

export const extractionResultSchema = z.object({
  business_hours: businessHoursSchema.nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  social_links: socialLinksSchema.nullable(),
  service_slugs: z.array(z.string()).describe('Array of service type slugs that match the business'),
})

export type ExtractionResult = z.infer<typeof extractionResultSchema>

export interface ServiceType {
  id: string
  name: string
  slug: string
}

export interface LocationContext {
  streetAddress: string | null
  city: string | null
  state: string | null
  postalCode: string | null
}

export interface AIExtractionInput {
  websiteContent: string
  availableServiceTypes: ServiceType[]
  companyName: string
  locationContext?: LocationContext
}

export interface AIExtractionOutput {
  success: boolean
  result: ExtractionResult | null
  error?: string
  tokensUsed?: number
}

// =====================================================
// SERVICE
// =====================================================

export class AIExtractionService {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.client = new OpenAI({ apiKey })
  }

  /**
   * Extract business information from website content
   */
  async extract(input: AIExtractionInput): Promise<AIExtractionOutput> {
    const { websiteContent, availableServiceTypes, companyName, locationContext } = input

    // Build service types reference for the prompt
    const serviceTypesList = availableServiceTypes
      .map(st => `- ${st.slug}: ${st.name}`)
      .join('\n')

    // Build location context string if provided
    let locationInstruction = ''
    if (locationContext) {
      const locationParts: string[] = []
      if (locationContext.streetAddress) locationParts.push(locationContext.streetAddress)
      if (locationContext.city) locationParts.push(locationContext.city)
      if (locationContext.state) locationParts.push(locationContext.state)
      if (locationContext.postalCode) locationParts.push(locationContext.postalCode)

      if (locationParts.length > 0) {
        locationInstruction = `
Target Location: ${locationParts.join(', ')}

IMPORTANT: This website may serve multiple locations. Focus your analysis on the target location above.
Look for location-specific pages, services, or information relevant to this area.
If the website mentions services or categories specific to this location, prioritize those.`
      }
    }

    const systemPrompt = `You are extracting business information from a contractor website.
Your task is to identify contact details, business hours, social media links, and applicable service categories.
${locationInstruction}

Available service type slugs to choose from:
${serviceTypesList}

Rules:
- Only return service_slugs from the list above
- For phone numbers, format as: (XXX) XXX-XXXX or leave as found
- For email, extract the primary business email
- For business hours, use 12-hour format (e.g., "8:00 AM", "5:00 PM")
- If information is not found, use null
- Be conservative - only extract information that is clearly present`

    const userPrompt = `Extract business information for "${companyName}" from this website content:

${websiteContent.substring(0, 40000)}`

    try {
      const completion = await this.client.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: zodResponseFormat(extractionResultSchema, 'extraction'),
        temperature: 0.1,
        max_tokens: 2000,
      })

      const result = completion.choices[0]?.message?.parsed
      const tokensUsed = completion.usage?.total_tokens

      if (!result) {
        return {
          success: false,
          result: null,
          error: 'No result returned from OpenAI',
          tokensUsed,
        }
      }

      consola.debug(`AIExtractionService: Extracted data for ${companyName}`, {
        servicesFound: result.service_slugs.length,
        hasEmail: !!result.email,
        hasPhone: !!result.phone,
        tokensUsed,
      })

      return {
        success: true,
        result,
        tokensUsed,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      consola.error(`AIExtractionService: Failed to extract for ${companyName}`, error)
      return {
        success: false,
        result: null,
        error: message,
      }
    }
  }
}

