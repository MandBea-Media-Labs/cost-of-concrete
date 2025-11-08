/**
 * GET /api/templates/[type]/schema
 *
 * Get the JSON Schema for a specific template's metadata.
 *
 * @param {string} type - Template type (hub, spoke, sub-spoke, article, custom, default)
 * @returns {Object} Template metadata schema
 */

import { consola } from 'consola'
import { TEMPLATES, type TemplateType } from '../../../config/templates'

export default defineEventHandler(async (event) => {
  try {
    // Get template type from route params
    const type = getRouterParam(event, 'type') as TemplateType

    if (import.meta.dev) {
      consola.info(`GET /api/templates/${type}/schema - Fetching schema`)
    }

    // Validate template type
    if (!type || !TEMPLATES[type]) {
      if (import.meta.dev) {
        consola.warn(`GET /api/templates/${type}/schema - Invalid template type`)
      }

      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `Template type '${type}' not found. Valid types: ${Object.keys(TEMPLATES).join(', ')}`
      })
    }

    const template = TEMPLATES[type]

    if (import.meta.dev) {
      consola.success(`GET /api/templates/${type}/schema - Returning schema`)
    }

    return {
      success: true,
      data: {
        type: type,
        name: template.name,
        description: template.description,
        allowedDepths: template.allowedDepths,
        schema: template.metadataSchema,
        defaultMetadata: template.defaultMetadata
      }
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('GET /api/templates/[type]/schema - Error:', error)
    }

    // Re-throw if already an H3Error
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch template schema'
    })
  }
})

