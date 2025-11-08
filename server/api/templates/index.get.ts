/**
 * GET /api/templates
 *
 * List all available page templates with their configurations.
 *
 * @returns {Object} List of templates with metadata
 */

import { consola } from 'consola'
import { TEMPLATES, type TemplateType } from '../../config/templates'

export default defineEventHandler(async (event) => {
  try {
    if (import.meta.dev) {
      consola.info('GET /api/templates - Fetching all templates')
    }

    // Transform templates object into array format
    const templates = Object.entries(TEMPLATES).map(([key, config]) => ({
      type: key as TemplateType,
      name: config.name,
      description: config.description,
      allowedDepths: config.allowedDepths,
      defaultMetadata: config.defaultMetadata
    }))

    if (import.meta.dev) {
      consola.success(`GET /api/templates - Returning ${templates.length} templates`)
    }

    return {
      success: true,
      data: templates,
      total: templates.length
    }
  } catch (error) {
    if (import.meta.dev) {
      consola.error('GET /api/templates - Error:', error)
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'Failed to fetch templates'
    })
  }
})

