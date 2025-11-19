# Batch 3: Backend Services & Schemas

**Estimated Time:** 1.5 hours
**Priority:** Critical
**Dependencies:** Batch 2 (Backend Repositories)

---

## 🎯 Objectives

1. Create Zod validation schemas for menus and menu items
2. Create `MenuService.ts` with business logic
3. Enforce 1-level depth rule for menu items
4. Auto-assign `display_order` for new items
5. Validate slug uniqueness
6. Handle soft deletes properly

---

## 📋 Prerequisites

- Batch 2 completed (repositories created)
- Existing `page.schemas.ts` available for reference
- Existing `PageService.ts` available for reference

---

## 🔨 Implementation Steps

### Step 1: Create Validation Schemas

Create file: `server/schemas/menu.schemas.ts`

This file contains all Zod schemas for validating menu and menu item data.

### Step 2: Create Menu Service

Create file: `server/services/MenuService.ts`

This service contains business logic for menu operations.

---

## 📝 Implementation Code

### File 1: menu.schemas.ts

**Path:** `server/schemas/menu.schemas.ts`

```typescript
import { z } from 'zod'

// =====================================================
// MENU SCHEMAS
// =====================================================

// Slug validation (lowercase, alphanumeric, hyphens only)
const slugSchema = z.string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be 100 characters or less')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens only')

// Create menu schema
export const createMenuSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less'),

  slug: slugSchema,

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),

  show_in_header: z.boolean().default(false),
  show_in_footer: z.boolean().default(false),

  is_enabled: z.boolean().default(true),

  display_order: z.number().int().min(0).default(0),

  metadata: z.record(z.any()).optional().nullable()
}).refine(
  data => data.show_in_header || data.show_in_footer,
  { message: 'Menu must be shown in at least one location (header or footer)' }
)

// Update menu schema (all fields optional except what's being updated)
export const updateMenuSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(200, 'Name must be 200 characters or less')
    .optional(),

  slug: slugSchema.optional(),

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),

  show_in_header: z.boolean().optional(),
  show_in_footer: z.boolean().optional(),

  is_enabled: z.boolean().optional(),

  display_order: z.number().int().min(0).optional(),

  metadata: z.record(z.any()).optional().nullable()
})

// =====================================================
// MENU ITEM SCHEMAS
// =====================================================

// Link type enum
export const linkTypeSchema = z.enum(['page', 'custom'])

// Create menu item schema
export const createMenuItemSchema = z.object({
  menu_id: z.string().uuid('Invalid menu ID'),

  parent_id: z.string().uuid('Invalid parent ID').optional().nullable(),

  link_type: linkTypeSchema,

  page_id: z.string().uuid('Invalid page ID').optional().nullable(),

  custom_url: z.string().url('Invalid URL').optional().nullable(),

  label: z.string()
    .min(1, 'Label is required')
    .max(200, 'Label must be 200 characters or less'),

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),

  open_in_new_tab: z.boolean().default(false),

  is_enabled: z.boolean().default(true),

  display_order: z.number().int().min(0).optional(),

  metadata: z.record(z.any()).optional().nullable()
}).refine(
  data => {
    if (data.link_type === 'page') {
      return data.page_id !== null && data.page_id !== undefined && data.custom_url === null
    } else {
      return data.custom_url !== null && data.custom_url !== undefined && data.page_id === null
    }
  },
  { message: 'Must provide either page_id (for page links) or custom_url (for custom links), but not both' }
)

// Update menu item schema
export const updateMenuItemSchema = z.object({
  parent_id: z.string().uuid('Invalid parent ID').optional().nullable(),

  link_type: linkTypeSchema.optional(),

  page_id: z.string().uuid('Invalid page ID').optional().nullable(),

  custom_url: z.string().url('Invalid URL').optional().nullable(),

  label: z.string()
    .min(1, 'Label is required')
    .max(200, 'Label must be 200 characters or less')
    .optional(),

  description: z.string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .nullable(),

  open_in_new_tab: z.boolean().optional(),

  is_enabled: z.boolean().optional(),

  display_order: z.number().int().min(0).optional(),

  metadata: z.record(z.any()).optional().nullable()
})

// Reorder menu items schema
export const reorderMenuItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid('Invalid item ID'),
    display_order: z.number().int().min(0)
  })).min(1, 'At least one item is required')
})
```

### File 2: MenuService.ts

**Path:** `server/services/MenuService.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'
import { MenuRepository } from '../repositories/MenuRepository'
import { MenuItemRepository } from '../repositories/MenuItemRepository'

type MenuInsert = Database['public']['Tables']['menus']['Insert']
type MenuUpdate = Database['public']['Tables']['menus']['Update']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export class MenuService {
  private menuRepo: MenuRepository
  private menuItemRepo: MenuItemRepository

  constructor(private client: SupabaseClient<Database>) {
    this.menuRepo = new MenuRepository(client)
    this.menuItemRepo = new MenuItemRepository(client)
  }

  /**
   * Create a new menu
   */
  async createMenu(data: MenuInsert, userId: string) {
    // Validate slug is unique
    const isUnique = await this.menuRepo.isSlugUnique(data.slug)
    if (!isUnique) {
      throw createError({
        statusCode: 400,
        message: `Menu with slug "${data.slug}" already exists`
      })
    }

    return await this.menuRepo.create(data, userId)
  }

  /**
   * Update an existing menu
   */
  async updateMenu(id: string, data: MenuUpdate, userId: string) {
    // If slug is being updated, validate uniqueness
    if (data.slug) {
      const isUnique = await this.menuRepo.isSlugUnique(data.slug, id)
      if (!isUnique) {
        throw createError({
          statusCode: 400,
          message: `Menu with slug "${data.slug}" already exists`
        })
      }
    }

    return await this.menuRepo.update(id, data, userId)
  }

  /**
   * Delete a menu (soft delete)
   */
  async deleteMenu(id: string) {
    return await this.menuRepo.delete(id)
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(data: MenuItemInsert, userId: string) {
    // Enforce 1-level depth rule
    if (data.parent_id) {
      const parent = await this.menuItemRepo.getById(data.parent_id)

      // Check if parent already has a parent (would create 2-level depth)
      if (parent.parent_id !== null) {
        throw createError({
          statusCode: 400,
          message: 'Cannot create nested menu items more than 1 level deep. Child items cannot have children.'
        })
      }
    }

    // Auto-assign display_order if not provided
    if (data.display_order === undefined || data.display_order === null) {
      data.display_order = await this.menuItemRepo.getNextDisplayOrder(
        data.menu_id,
        data.parent_id || null
      )
    }

    return await this.menuItemRepo.create(data, userId)
  }

  /**
   * Update an existing menu item
   */
  async updateMenuItem(id: string, data: MenuItemUpdate, userId: string) {
    // If parent_id is being updated, enforce 1-level depth rule
    if (data.parent_id !== undefined) {
      const item = await this.menuItemRepo.getById(id)

      // Check if this item has children
      const children = await this.menuItemRepo.getChildren(id)
      if (children.length > 0 && data.parent_id !== null) {
        throw createError({
          statusCode: 400,
          message: 'Cannot make this item a child because it has children of its own. Remove children first.'
        })
      }

      // If setting a parent, check parent doesn't have a parent
      if (data.parent_id) {
        const parent = await this.menuItemRepo.getById(data.parent_id)
        if (parent.parent_id !== null) {
          throw createError({
            statusCode: 400,
            message: 'Cannot create nested menu items more than 1 level deep.'
          })
        }
      }
    }

    return await this.menuItemRepo.update(id, data, userId)
  }

  /**
   * Delete a menu item (soft delete)
   */
  async deleteMenuItem(id: string) {
    return await this.menuItemRepo.delete(id)
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(items: Array<{ id: string; display_order: number }>) {
    // Validate all items belong to same menu and parent
    const itemDetails = await Promise.all(
      items.map(item => this.menuItemRepo.getById(item.id))
    )

    const menuIds = new Set(itemDetails.map(item => item.menu_id))
    const parentIds = new Set(itemDetails.map(item => item.parent_id))

    if (menuIds.size > 1) {
      throw createError({
        statusCode: 400,
        message: 'All items must belong to the same menu'
      })
    }

    if (parentIds.size > 1) {
      throw createError({
        statusCode: 400,
        message: 'All items must have the same parent (or all be top-level)'
      })
    }

    return await this.menuItemRepo.reorder(items)
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Create Menu with Unique Slug

```typescript
const client = await serverSupabaseClient(event)
const menuService = new MenuService(client)

const menu = await menuService.createMenu({
  name: 'Test Menu',
  slug: 'test-menu',
  show_in_header: true,
  show_in_footer: false,
  is_enabled: true
}, '<admin-user-id>')

console.log('Created menu:', menu)
// Expected: Success
```

### Test 2: Create Menu with Duplicate Slug (Should Fail)

```typescript
const duplicateMenu = await menuService.createMenu({
  name: 'Another Menu',
  slug: 'test-menu', // Same slug
  show_in_header: true,
  show_in_footer: false
}, '<admin-user-id>')

// Expected: Error - "Menu with slug 'test-menu' already exists"
```

### Test 3: Create Parent Menu Item

```typescript
const parentItem = await menuService.createMenuItem({
  menu_id: menu.id,
  page_id: '<page-id>',
  label: 'Parent Item',
  is_enabled: true
}, '<admin-user-id>')

console.log('Created parent item:', parentItem)
// Expected: Success, display_order auto-assigned to 0
```

### Test 4: Create Child Menu Item

```typescript
const childItem = await menuService.createMenuItem({
  menu_id: menu.id,
  parent_id: parentItem.id,
  page_id: '<page-id>',
  label: 'Child Item',
  description: 'This is a child item',
  is_enabled: true
}, '<admin-user-id>')

console.log('Created child item:', childItem)
// Expected: Success, display_order auto-assigned
```

### Test 5: Try to Create Grandchild (Should Fail)

```typescript
const grandchildItem = await menuService.createMenuItem({
  menu_id: menu.id,
  parent_id: childItem.id, // Child of a child
  page_id: '<page-id>',
  label: 'Grandchild Item',
  is_enabled: true
}, '<admin-user-id>')

// Expected: Error - "Cannot create nested menu items more than 1 level deep"
```

### Test 6: Try to Make Parent a Child (Should Fail if it has children)

```typescript
const updateResult = await menuService.updateMenuItem(
  parentItem.id,
  { parent_id: '<another-parent-id>' },
  '<admin-user-id>'
)

// Expected: Error - "Cannot make this item a child because it has children of its own"
```

### Test 7: Reorder Menu Items

```typescript
const items = [
  { id: parentItem.id, display_order: 1 },
  { id: '<another-item-id>', display_order: 0 }
]

await menuService.reorderMenuItems(items)

// Expected: Success, items reordered
```

### Test 8: Try to Reorder Items from Different Menus (Should Fail)

```typescript
const mixedItems = [
  { id: parentItem.id, display_order: 0 },
  { id: '<item-from-different-menu>', display_order: 1 }
]

await menuService.reorderMenuItems(mixedItems)

// Expected: Error - "All items must belong to the same menu"
```

---

## ✅ Success Criteria

- [ ] `menu.schemas.ts` created with all validation schemas
- [ ] `MenuService.ts` created with business logic
- [ ] Slug uniqueness validated
- [ ] 1-level depth rule enforced
- [ ] `display_order` auto-assigned
- [ ] Reordering validates same menu/parent
- [ ] All test cases pass
- [ ] Error messages are clear and helpful

---

## 🚀 Next Steps

Once all tests pass, proceed to **Batch 4: Backend API Endpoints**

