/**
 * Template Configuration
 * 
 * Defines all page templates with their metadata schemas and validation rules.
 * Templates are auto-assigned based on page depth but can be manually overridden.
 */

import type { PageMetadata } from './seo-schemas'

// =====================================================
// TEMPLATE TYPES
// =====================================================

export type TemplateType = 'hub' | 'spoke' | 'sub-spoke' | 'article' | 'custom' | 'default'

// =====================================================
// TEMPLATE METADATA SCHEMAS
// =====================================================

/**
 * Hub Template Metadata (Depth 0)
 * Top-level category pages with child grid display
 */
export interface HubTemplateMetadata {
  layout: 'grid' | 'list' | 'featured'
  columns?: 2 | 3 | 4
  showChildGrid: boolean
  heroImage?: string
  featuredPages?: string[] // Array of page IDs
  callToAction?: {
    text: string
    url: string
    style?: 'primary' | 'secondary' | 'outline'
  }
}

/**
 * Spoke Template Metadata (Depth 1)
 * Mid-level content pages with sidebar
 */
export interface SpokeTemplateMetadata {
  showSidebar: boolean
  sidebarPosition?: 'left' | 'right'
  sidebarContent?: 'toc' | 'related' | 'custom'
  relatedPages?: string[] // Array of page IDs
  showChildList: boolean
  callToAction?: {
    text: string
    url: string
    style?: 'primary' | 'secondary' | 'outline'
  }
}

/**
 * Sub-Spoke Template Metadata (Depth 2)
 * Detailed content pages with table of contents
 */
export interface SubSpokeTemplateMetadata {
  showTableOfContents: boolean
  tocPosition?: 'sidebar' | 'top' | 'floating'
  showBreadcrumbs: boolean
  showChildList: boolean
  relatedPages?: string[] // Array of page IDs
  showAuthor?: boolean
  showPublishDate?: boolean
}

/**
 * Article Template Metadata (Depth 3+)
 * Deep-level article pages
 */
export interface ArticleTemplateMetadata {
  showTableOfContents: boolean
  showBreadcrumbs: boolean
  showAuthor?: boolean
  showPublishDate?: boolean
  showReadingTime?: boolean
  relatedArticles?: string[] // Array of page IDs
  tags?: string[]
}

/**
 * Custom Template Metadata
 * Fully customizable template
 */
export interface CustomTemplateMetadata {
  [key: string]: any
}

/**
 * Default Template Metadata
 * Basic fallback template
 */
export interface DefaultTemplateMetadata {
  showBreadcrumbs?: boolean
  showChildList?: boolean
}

// =====================================================
// TEMPLATE CONFIGURATION
// =====================================================

export interface TemplateConfig {
  type: TemplateType
  name: string
  description: string
  allowedDepths: number[] | 'any'
  defaultMetadata: HubTemplateMetadata | SpokeTemplateMetadata | SubSpokeTemplateMetadata | ArticleTemplateMetadata | CustomTemplateMetadata | DefaultTemplateMetadata
  metadataSchema: object // JSON Schema for validation
}

export const TEMPLATES: Record<TemplateType, TemplateConfig> = {
  hub: {
    type: 'hub',
    name: 'Hub Template',
    description: 'Top-level category page with child grid display',
    allowedDepths: [0],
    defaultMetadata: {
      layout: 'grid',
      columns: 3,
      showChildGrid: true
    },
    metadataSchema: {
      type: 'object',
      properties: {
        layout: { type: 'string', enum: ['grid', 'list', 'featured'] },
        columns: { type: 'number', enum: [2, 3, 4] },
        showChildGrid: { type: 'boolean' },
        heroImage: { type: 'string', format: 'uri' },
        featuredPages: { type: 'array', items: { type: 'string', format: 'uuid' } },
        callToAction: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            url: { type: 'string' },
            style: { type: 'string', enum: ['primary', 'secondary', 'outline'] }
          },
          required: ['text', 'url']
        }
      },
      required: ['layout', 'showChildGrid']
    }
  },

  spoke: {
    type: 'spoke',
    name: 'Spoke Template',
    description: 'Mid-level content page with sidebar',
    allowedDepths: [1],
    defaultMetadata: {
      showSidebar: true,
      sidebarPosition: 'right',
      sidebarContent: 'toc',
      showChildList: true
    },
    metadataSchema: {
      type: 'object',
      properties: {
        showSidebar: { type: 'boolean' },
        sidebarPosition: { type: 'string', enum: ['left', 'right'] },
        sidebarContent: { type: 'string', enum: ['toc', 'related', 'custom'] },
        relatedPages: { type: 'array', items: { type: 'string', format: 'uuid' } },
        showChildList: { type: 'boolean' },
        callToAction: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            url: { type: 'string' },
            style: { type: 'string', enum: ['primary', 'secondary', 'outline'] }
          },
          required: ['text', 'url']
        }
      },
      required: ['showSidebar', 'showChildList']
    }
  },

  'sub-spoke': {
    type: 'sub-spoke',
    name: 'Sub-Spoke Template',
    description: 'Detailed content page with table of contents',
    allowedDepths: [2],
    defaultMetadata: {
      showTableOfContents: true,
      tocPosition: 'sidebar',
      showBreadcrumbs: true,
      showChildList: true
    },
    metadataSchema: {
      type: 'object',
      properties: {
        showTableOfContents: { type: 'boolean' },
        tocPosition: { type: 'string', enum: ['sidebar', 'top', 'floating'] },
        showBreadcrumbs: { type: 'boolean' },
        showChildList: { type: 'boolean' },
        relatedPages: { type: 'array', items: { type: 'string', format: 'uuid' } },
        showAuthor: { type: 'boolean' },
        showPublishDate: { type: 'boolean' }
      },
      required: ['showTableOfContents', 'showBreadcrumbs', 'showChildList']
    }
  },

  article: {
    type: 'article',
    name: 'Article Template',
    description: 'Deep-level article page',
    allowedDepths: 'any', // Can be used at any depth 3+
    defaultMetadata: {
      showTableOfContents: true,
      showBreadcrumbs: true,
      showAuthor: true,
      showPublishDate: true,
      showReadingTime: true
    },
    metadataSchema: {
      type: 'object',
      properties: {
        showTableOfContents: { type: 'boolean' },
        showBreadcrumbs: { type: 'boolean' },
        showAuthor: { type: 'boolean' },
        showPublishDate: { type: 'boolean' },
        showReadingTime: { type: 'boolean' },
        relatedArticles: { type: 'array', items: { type: 'string', format: 'uuid' } },
        tags: { type: 'array', items: { type: 'string' } }
      },
      required: ['showTableOfContents', 'showBreadcrumbs']
    }
  },

  custom: {
    type: 'custom',
    name: 'Custom Template',
    description: 'Fully customizable template',
    allowedDepths: 'any',
    defaultMetadata: {},
    metadataSchema: {
      type: 'object',
      additionalProperties: true
    }
  },

  default: {
    type: 'default',
    name: 'Default Template',
    description: 'Basic fallback template',
    allowedDepths: 'any',
    defaultMetadata: {
      showBreadcrumbs: true,
      showChildList: false
    },
    metadataSchema: {
      type: 'object',
      properties: {
        showBreadcrumbs: { type: 'boolean' },
        showChildList: { type: 'boolean' }
      }
    }
  }
}

// =====================================================
// TEMPLATE UTILITIES
// =====================================================

/**
 * Determine the default template based on page depth
 */
export function getDefaultTemplateForDepth(depth: number): TemplateType {
  if (depth === 0) return 'hub'
  if (depth === 1) return 'spoke'
  if (depth === 2) return 'sub-spoke'
  return 'article' // depth 3+
}

/**
 * Get available templates for a specific depth
 */
export function getAvailableTemplatesForDepth(depth: number): TemplateType[] {
  return Object.entries(TEMPLATES)
    .filter(([_, config]) => {
      if (config.allowedDepths === 'any') return true
      return config.allowedDepths.includes(depth)
    })
    .map(([type]) => type as TemplateType)
}

/**
 * Validate if a template is allowed at a specific depth
 */
export function isTemplateAllowedAtDepth(template: TemplateType, depth: number): boolean {
  const config = TEMPLATES[template]
  if (!config) return false
  if (config.allowedDepths === 'any') return true
  return config.allowedDepths.includes(depth)
}

/**
 * Get template configuration
 */
export function getTemplateConfig(template: TemplateType): TemplateConfig | null {
  return TEMPLATES[template] || null
}

/**
 * Get default metadata for a template
 */
export function getDefaultMetadata(template: TemplateType): PageMetadata['template'] {
  const config = TEMPLATES[template]
  return config ? config.defaultMetadata : {}
}

