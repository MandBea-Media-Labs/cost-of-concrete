import { z } from 'zod'

/**
 * Link type enum
 * - dropdown: Label-only dropdown trigger (no link)
 * - page: Link to internal page
 * - custom: Link to custom URL
 */
export const linkTypeEnum = z.enum(['dropdown', 'page', 'custom'])

/**
 * Zod schema for menu item form validation
 */
export const menuItemFormSchema = z.object({
  label: z.string()
    .min(1, 'Label is required')
    .max(200, 'Label must be 200 characters or less'),

  link_type: linkTypeEnum,

  page_id: z.string()
    .uuid('Invalid page ID')
    .nullable()
    .optional(),

  custom_url: z.string()
    .url('Invalid URL')
    .nullable()
    .optional(),

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .nullable()
    .optional(),

  parent_id: z.string()
    .uuid('Invalid parent ID')
    .nullable()
    .optional(),

  open_in_new_tab: z.boolean(),

  is_enabled: z.boolean(),

  display_order: z.number()
    .int()
    .min(0)
    .nullable()
    .optional(),

  metadata: z.record(z.any()).nullable().optional()
}).refine(
  data => {
    // Dropdown: no link data, no parent
    if (data.link_type === 'dropdown') {
      return data.page_id === null && data.custom_url === null && data.parent_id === null
    }
    // Page link: page_id required, no custom_url
    if (data.link_type === 'page') {
      return data.page_id !== null && data.page_id !== undefined && data.custom_url === null
    }
    // Custom URL: custom_url required, no page_id
    if (data.link_type === 'custom') {
      return data.custom_url !== null && data.custom_url !== undefined && data.page_id === null
    }
    return false
  },
  {
    message: 'Invalid link configuration for the selected link type',
    path: ['link_type']
  }
)

/**
 * TypeScript type inferred from schema
 */
export type MenuItemFormData = z.infer<typeof menuItemFormSchema>

/**
 * Default values for new menu item form
 */
export const menuItemFormDefaultValues: MenuItemFormData = {
  label: '',
  link_type: 'page',
  page_id: null,
  custom_url: null,
  description: null,
  parent_id: null,
  open_in_new_tab: false,
  is_enabled: true,
  display_order: null,
  metadata: null
}

