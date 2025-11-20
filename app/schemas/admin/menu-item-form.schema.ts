import { z } from 'zod'

/**
 * Link type enum
 */
export const linkTypeEnum = z.enum(['page', 'custom'])

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
    .optional()
    .nullable(),
  
  custom_url: z.string()
    .url('Invalid URL')
    .optional()
    .nullable(),
  
  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),
  
  parent_id: z.string()
    .uuid('Invalid parent ID')
    .optional()
    .nullable(),
  
  open_in_new_tab: z.boolean().default(false),
  
  is_enabled: z.boolean().default(true),
  
  display_order: z.number()
    .int()
    .min(0)
    .optional()
    .nullable(),
  
  metadata: z.record(z.any()).optional().nullable()
}).refine(
  data => {
    if (data.link_type === 'page') {
      return data.page_id !== null && data.page_id !== undefined && data.custom_url === null
    } else {
      return data.custom_url !== null && data.custom_url !== undefined && data.page_id === null
    }
  },
  {
    message: 'Must provide either page_id (for page links) or custom_url (for custom links), but not both',
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

