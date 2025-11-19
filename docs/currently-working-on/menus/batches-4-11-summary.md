# Batches 4-11: Implementation Summary

This document provides a condensed overview of the remaining implementation batches. For detailed code examples, refer to the existing patterns in the pages system.

---

## Batch 4: Backend API Endpoints (2 hours)

### Files to Create

1. **`server/api/menus/index.get.ts`** - List all menus (admin)
2. **`server/api/menus/[slug].get.ts`** - Get menu with items (public)
3. **`server/api/menus/index.post.ts`** - Create menu (admin)
4. **`server/api/menus/[id].patch.ts`** - Update menu (admin)
5. **`server/api/menus/[id].delete.ts`** - Soft delete menu (admin)
6. **`server/api/menus/[id]/items.post.ts`** - Create menu item (admin)
7. **`server/api/menu-items/[id].patch.ts`** - Update menu item (admin)
8. **`server/api/menu-items/[id].delete.ts`** - Soft delete menu item (admin)
9. **`server/api/menu-items/reorder.patch.ts`** - Reorder items (admin)

### Pattern to Follow

```typescript
// Example: server/api/menus/index.post.ts
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const body = await readBody(event)
  const validatedData = createMenuSchema.parse(body)
  
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  
  const menuService = new MenuService(client)
  const menu = await menuService.createMenu(validatedData, user!.id)
  
  return menu
})
```

### Testing
- Test each endpoint with valid/invalid data
- Verify admin-only endpoints reject non-admin users
- Test error handling

---

## Batch 5: Frontend Composables (1 hour)

### Files to Create

1. **`app/composables/useMenus.ts`** - Menu data fetching
2. **`app/composables/useMenuItems.ts`** - Menu item operations

### Pattern to Follow

```typescript
// app/composables/useMenus.ts
export const useMenus = () => {
  const fetchMenuBySlug = async (slug: string) => {
    const { data, error } = await useFetch(`/api/menus/${slug}`)
    if (error.value) throw error.value
    return data.value
  }

  const createMenu = async (menuData: any) => {
    const { data, error } = await useFetch('/api/menus', {
      method: 'POST',
      body: menuData
    })
    if (error.value) throw error.value
    return data.value
  }

  // ... more methods

  return {
    fetchMenuBySlug,
    createMenu,
    // ... more methods
  }
}
```

### Testing
- Test fetching menus by slug
- Test CRUD operations
- Verify error handling

---

## Batch 6: Update Header & Footer (1 hour)

### Files to Modify

1. **`app/components/ui/pages/Header.vue`**
2. **`app/components/ui/pages/Footer.vue`**

### Changes for Header.vue

```vue
<script setup lang="ts">
// Replace mock data import
// import { navigationItems } from '~/mock-data'

// Add composable
const { fetchMenuBySlug } = useMenus()

// Fetch header menu
const { data: headerMenu } = await useAsyncData('header-menu', () => 
  fetchMenuBySlug('main-nav')
)

// Use headerMenu.items instead of navigationItems
const navigationItems = computed(() => headerMenu.value?.items || [])
</script>
```

### Changes for Footer.vue

```vue
<script setup lang="ts">
const { fetchMenuBySlug } = useMenus()

const { data: footerMenu } = await useAsyncData('footer-menu', () => 
  fetchMenuBySlug('footer-links')
)

const quickLinks = computed(() => 
  footerMenu.value?.items?.map(item => ({
    text: item.label,
    to: item.page_id ? item.page?.full_path : item.custom_url
  })) || []
)
</script>
```

### Testing
- Verify header displays menu with dropdowns
- Verify footer displays flat links
- Test with no menu data (empty state)
- Check SSR (no hydration errors)

---

## Batch 7: Admin UI - Menu List (1.5 hours)

### Files to Create

1. **`app/pages/admin/menus/index.vue`** - Menu list page
2. **`app/components/admin/AdminMenuList.vue`** - Menu list component

### Files to Modify

1. **`app/components/admin/AdminSidebar.vue`** - Add "Menus" link

### Key Features

- Table with columns: Name, Slug, Header, Footer, Enabled, Actions
- Toggle switches for show_in_header, show_in_footer, is_enabled
- Edit and Delete buttons
- "Create Menu" button
- Empty state when no menus

### Pattern to Follow

Reference `AdminPageList.vue` for table structure and toggle switches.

### Testing
- Create a menu and verify it appears in list
- Toggle switches and verify updates
- Delete menu and verify soft delete
- Test empty state

---

## Batch 8: Admin UI - Menu Form (1 hour)

### Files to Create

1. **`app/pages/admin/menus/new.vue`** - Create menu page
2. **`app/pages/admin/menus/[id]/edit.vue`** - Edit menu page
3. **`app/components/admin/AdminMenuForm.vue`** - Menu form component

### Key Features

- Fields: Name, Slug, Description
- Checkboxes: Show in Header, Show in Footer
- Toggle: Enabled
- VeeValidate integration
- Client + server validation
- Redirect to `/admin/menus/:id/items` after save

### Pattern to Follow

Reference `AdminPageForm.vue` for form structure and validation.

### Testing
- Create menu with valid data
- Test validation errors
- Edit existing menu
- Verify redirect after save

---

## Batch 9: Admin UI - Menu Item List (2 hours)

### Files to Create

1. **`app/pages/admin/menus/[id]/items.vue`** - Menu items page
2. **`app/components/admin/AdminMenuItemList.vue`** - Menu items component

### Key Features

- Hierarchical view (parent → children indented)
- Drag-and-drop reordering within parent groups
- Visual indicators for parent vs child
- Show: Label, Link Type, Status, Actions
- "Add Parent Item" and "Add Child Item" buttons
- Edit and Delete buttons

### Dependencies

Install drag-and-drop library:
```bash
pnpm add @vueuse/integrations sortablejs
pnpm add -D @types/sortablejs
```

### Pattern to Follow

Reference page reordering implementation if available, or use basic sortablejs example.

### Testing
- Create parent and child items
- Drag-and-drop to reorder
- Verify order persists after refresh
- Test delete cascades to children

---

## Batch 10: Admin UI - Menu Item Form (1.5 hours)

### Files to Create

1. **`app/pages/admin/menus/[menuId]/items/new.vue`** - Create item page
2. **`app/pages/admin/menus/[menuId]/items/[id]/edit.vue`** - Edit item page
3. **`app/components/admin/AdminMenuItemForm.vue`** - Menu item form component

### Key Features

- Radio buttons: "Page Link" or "Custom URL"
- Conditional fields based on selection:
  - **Page Link**: Dropdown of published pages
  - **Custom URL**: Text input + "Open in new tab" checkbox
- Fields: Label (required)
- Conditional: Description (only if parent_id is set)
- Dropdown: Parent Item (optional)
- Toggle: Enabled
- VeeValidate integration

### Pattern to Follow

Reference `AdminPageForm.vue` for conditional field display.

### Testing
- Create page link item
- Create custom URL item
- Create child item with description
- Test validation
- Verify redirect after save

---

## Batch 11: Testing & Polish (1 hour)

### Testing Checklist

#### **Database**
- [ ] Tables created with correct schema
- [ ] Constraints working (slug format, link source, etc.)
- [ ] RLS policies active
- [ ] Indexes created

#### **API**
- [ ] All endpoints return correct data
- [ ] Admin-only endpoints reject non-admin
- [ ] Validation errors handled properly
- [ ] Soft delete works

#### **Frontend - Public**
- [ ] Header displays menu with dropdowns
- [ ] Footer displays flat links
- [ ] Links navigate correctly
- [ ] SSR works (no hydration errors)
- [ ] Empty state handled gracefully

#### **Frontend - Admin**
- [ ] Menu list displays correctly
- [ ] Toggle switches update database
- [ ] Menu form creates/edits menus
- [ ] Menu item list shows hierarchy
- [ ] Drag-and-drop reordering works
- [ ] Menu item form creates/edits items
- [ ] Page selector shows published pages only
- [ ] Custom URL validation works
- [ ] Description only shows for child items
- [ ] Delete confirmation works

#### **Integration**
- [ ] Create menu → appears in header/footer
- [ ] Disable menu → disappears from header/footer
- [ ] Reorder items → order updates in header/footer
- [ ] Delete menu → items cascade delete
- [ ] Page link → navigates to correct page
- [ ] Custom URL → opens in new tab if configured

### Create Linear Ticket

Create a ticket for future caching implementation:

**Title**: Implement server-side caching for dynamic menus

**Description**:
```
Add caching layer for menu API endpoints to improve performance.

Menus don't change frequently, so we should cache:
- Menu data fetched by slug
- Menu items for each menu

Implementation ideas:
- Use Nuxt's `useAsyncData` with caching
- Add Redis caching layer
- Implement cache invalidation on menu updates

Acceptance Criteria:
- [ ] Menu data is cached
- [ ] Cache invalidates on menu/item updates
- [ ] Performance improvement measured
```

**Labels**: enhancement, performance  
**Project**: Cost of Concrete

---

## ✅ Final Deliverables

- [ ] All 11 batches completed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Linear ticket created
- [ ] Ready for production deployment

---

## 🚀 Next Steps After Completion

1. Deploy to staging environment
2. User acceptance testing
3. Performance monitoring
4. Plan caching implementation (from Linear ticket)
5. Consider future enhancements:
   - Mega-menus (multi-column dropdowns)
   - Menu item icons
   - Role-based visibility
   - Analytics tracking

