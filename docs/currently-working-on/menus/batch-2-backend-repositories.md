# Batch 2: Backend Repositories

**Estimated Time:** 1.5 hours
**Priority:** Critical
**Dependencies:** Batch 1 (Database Foundation)

---

## 🎯 Objectives

1. Create `MenuRepository.ts` for menu CRUD operations
2. Create `MenuItemRepository.ts` for menu item CRUD operations
3. Follow existing `PageRepository` patterns
4. Implement methods: `list()`, `getById()`, `getBySlug()`, `create()`, `update()`, `delete()`
5. Add `getMenuWithItems()` method for fetching menu with nested items
6. Add `reorderItems()` method for drag-and-drop support

---

## 📋 Prerequisites

- Batch 1 completed (tables created)
- TypeScript types generated (`app/types/supabase.ts` updated)
- Existing `PageRepository.ts` available for reference

---

## 🔨 Implementation Steps

### Step 1: Create MenuRepository

Create file: `server/repositories/MenuRepository.ts`

This repository handles all database operations for the `menus` table.

### Step 2: Create MenuItemRepository

Create file: `server/repositories/MenuItemRepository.ts`

This repository handles all database operations for the `menu_items` table.

### Step 3: Test Repositories

Create simple test queries to verify repository methods work correctly.

---

## 📝 Implementation Code

### File 1: MenuRepository.ts

**Path:** `server/repositories/MenuRepository.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

type Menu = Database['public']['Tables']['menus']['Row']
type MenuInsert = Database['public']['Tables']['menus']['Insert']
type MenuUpdate = Database['public']['Tables']['menus']['Update']

export class MenuRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all menus (admin view - includes disabled)
   */
  async list(includeDeleted = false) {
    let query = this.client
      .from('menus')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) throw error
    return data as Menu[]
  }

  /**
   * List enabled menus for a specific location (public view)
   */
  async listByLocation(location: 'header' | 'footer') {
    const column = location === 'header' ? 'show_in_header' : 'show_in_footer'

    const { data, error } = await this.client
      .from('menus')
      .select('*')
      .eq(column, true)
      .eq('is_enabled', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as Menu[]
  }

  /**
   * Get menu by ID
   */
  async getById(id: string) {
    const { data, error } = await this.client
      .from('menus')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Menu
  }

  /**
   * Get menu by slug
   */
  async getBySlug(slug: string) {
    const { data, error } = await this.client
      .from('menus')
      .select('*')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as Menu
  }

  /**
   * Get menu with all its items (nested structure)
   */
  async getMenuWithItems(slug: string) {
    // Get menu
    const menu = await this.getBySlug(slug)

    // Get all items for this menu
    const { data: items, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('menu_id', menu.id)
      .eq('is_enabled', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) throw error

    // Build hierarchical structure
    const topLevel = items.filter(item => item.parent_id === null)
    const children = items.filter(item => item.parent_id !== null)

    const itemsWithChildren = topLevel.map(parent => ({
      ...parent,
      children: children.filter(child => child.parent_id === parent.id)
    }))

    return {
      ...menu,
      items: itemsWithChildren
    }
  }

  /**
   * Create new menu
   */
  async create(data: MenuInsert, userId: string) {
    const { data: menu, error } = await this.client
      .from('menus')
      .insert({
        ...data,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return menu as Menu
  }

  /**
   * Update existing menu
   */
  async update(id: string, data: MenuUpdate, userId: string) {
    const { data: menu, error } = await this.client
      .from('menus')
      .update({
        ...data,
        updated_by: userId
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return menu as Menu
  }

  /**
   * Soft delete menu
   */
  async delete(id: string) {
    const { data, error } = await this.client
      .from('menus')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Menu
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string) {
    let query = this.client
      .from('menus')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data.length === 0
  }
}
```

### File 2: MenuItemRepository.ts

**Path:** `server/repositories/MenuItemRepository.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuItemInsert = Database['public']['Tables']['menu_items']['Insert']
type MenuItemUpdate = Database['public']['Tables']['menu_items']['Update']

export class MenuItemRepository {
  constructor(private client: SupabaseClient<Database>) {}

  /**
   * List all items for a menu
   */
  async listByMenu(menuId: string, includeDeleted = false) {
    let query = this.client
      .from('menu_items')
      .select('*')
      .eq('menu_id', menuId)
      .order('parent_id', { ascending: true, nullsFirst: true })
      .order('display_order', { ascending: true })

    if (!includeDeleted) {
      query = query.is('deleted_at', null)
    }

    const { data, error } = await query

    if (error) throw error
    return data as MenuItem[]
  }

  /**
   * Get menu item by ID
   */
  async getById(id: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error) throw error
    return data as MenuItem
  }

  /**
   * Get children of a parent item
   */
  async getChildren(parentId: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_enabled', true)
      .is('deleted_at', null)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data as MenuItem[]
  }

  /**
   * Create new menu item
   */
  async create(data: MenuItemInsert, userId: string) {
    const { data: item, error } = await this.client
      .from('menu_items')
      .insert({
        ...data,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return item as MenuItem
  }

  /**
   * Update existing menu item
   */
  async update(id: string, data: MenuItemUpdate, userId: string) {
    const { data: item, error } = await this.client
      .from('menu_items')
      .update({
        ...data,
        updated_by: userId
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) throw error
    return item as MenuItem
  }

  /**
   * Soft delete menu item
   */
  async delete(id: string) {
    const { data, error } = await this.client
      .from('menu_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MenuItem
  }

  /**
   * Reorder menu items (for drag-and-drop)
   */
  async reorder(items: Array<{ id: string; display_order: number }>) {
    const updates = items.map(item =>
      this.client
        .from('menu_items')
        .update({ display_order: item.display_order })
        .eq('id', item.id)
    )

    const results = await Promise.all(updates)

    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      throw errors[0].error
    }

    return true
  }

  /**
   * Get next display order for a parent
   */
  async getNextDisplayOrder(menuId: string, parentId: string | null) {
    const { data, error } = await this.client
      .from('menu_items')
      .select('display_order')
      .eq('menu_id', menuId)
      .is('deleted_at', null)

    if (parentId) {
      const { data: parentData, error: parentError } = await this.client
        .from('menu_items')
        .select('display_order')
        .eq('menu_id', menuId)
        .eq('parent_id', parentId)
        .is('deleted_at', null)

      if (parentError) throw parentError

      if (!parentData || parentData.length === 0) return 0

      const maxOrder = Math.max(...parentData.map(item => item.display_order))
      return maxOrder + 1
    }

    if (error) throw error

    if (!data || data.length === 0) return 0

    const maxOrder = Math.max(...data.map(item => item.display_order))
    return maxOrder + 1
  }
}
```

---

## 🧪 Testing Instructions

### Test 1: Test MenuRepository - Create Menu

Create a test file or use Supabase MCP to test:

```typescript
// Test creating a menu
const supabase = await serverSupabaseClient(event)
const menuRepo = new MenuRepository(supabase)

const newMenu = await menuRepo.create({
  name: 'Test Navigation',
  slug: 'test-nav',
  show_in_header: true,
  show_in_footer: false,
  is_enabled: true
}, '<admin-user-id>')

console.log('Created menu:', newMenu)
// Expected: Menu object with auto-generated ID and timestamps
```

### Test 2: Test MenuRepository - Get by Slug

```typescript
const menu = await menuRepo.getBySlug('test-nav')
console.log('Found menu:', menu)
// Expected: Same menu object
```

### Test 3: Test MenuRepository - List Menus

```typescript
const allMenus = await menuRepo.list()
console.log('All menus:', allMenus)
// Expected: Array including test-nav
```

### Test 4: Test MenuItemRepository - Create Item

```typescript
const itemRepo = new MenuItemRepository(supabase)

// Get a published page ID
const { data: pages } = await supabase
  .from('pages')
  .select('id')
  .eq('status', 'published')
  .limit(1)

const pageId = pages[0].id

const newItem = await itemRepo.create({
  menu_id: newMenu.id,
  page_id: pageId,
  label: 'Test Link',
  display_order: 0,
  is_enabled: true
}, '<admin-user-id>')

console.log('Created item:', newItem)
// Expected: Menu item object
```

### Test 5: Test MenuItemRepository - Create Child Item

```typescript
const childItem = await itemRepo.create({
  menu_id: newMenu.id,
  parent_id: newItem.id,
  page_id: pageId,
  label: 'Child Link',
  description: 'This is a child item',
  display_order: 0,
  is_enabled: true
}, '<admin-user-id>')

console.log('Created child item:', childItem)
// Expected: Menu item with parent_id set
```

### Test 6: Test getMenuWithItems

```typescript
const menuWithItems = await menuRepo.getMenuWithItems('test-nav')
console.log('Menu with items:', JSON.stringify(menuWithItems, null, 2))
// Expected: Menu object with nested items array, children nested under parents
```

### Test 7: Test Reorder Items

```typescript
const items = await itemRepo.listByMenu(newMenu.id)

// Swap order
const reorderData = items.map((item, index) => ({
  id: item.id,
  display_order: items.length - index - 1
}))

await itemRepo.reorder(reorderData)

const reorderedItems = await itemRepo.listByMenu(newMenu.id)
console.log('Reordered items:', reorderedItems)
// Expected: Items in reverse order
```

### Test 8: Test Soft Delete

```typescript
await itemRepo.delete(childItem.id)
await itemRepo.delete(newItem.id)
await menuRepo.delete(newMenu.id)

const deletedMenu = await menuRepo.getById(newMenu.id)
// Expected: Error (menu not found because deleted_at is set)
```

---

## ✅ Success Criteria

- [ ] MenuRepository created with all CRUD methods
- [ ] MenuItemRepository created with all CRUD methods
- [ ] `getMenuWithItems()` returns nested structure
- [ ] `reorder()` updates display_order correctly
- [ ] `getNextDisplayOrder()` calculates correct next order
- [ ] All repository methods handle errors properly
- [ ] Soft delete works correctly
- [ ] All test cases pass

---

## 🚀 Next Steps

Once all tests pass, proceed to **Batch 3: Backend Services & Schemas**
```

