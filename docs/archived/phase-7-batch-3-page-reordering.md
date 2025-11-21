# Phase 7 - Batch 3: Page Reordering

**Priority:** 2 (Admin Workflow Enhancement)
**Status:** 🔜 Not Started
**Effort:** 4-6 hours
**Dependencies:** None

---

## 🎯 Goal

Enable drag-and-drop reordering of pages within the same parent to control display order in navigation and child page lists.

---

## 📋 Current State

**Problem:**
- Pages are ordered by `full_path` alphabetically
- No way to control display order
- Child pages appear in alphabetical order, not custom order
- No `order` or `position` field in database

**Use Case:**
Admin wants to display "Getting Started" before "Advanced Topics" even though alphabetically it comes after.

---

## 🎯 Objectives

1. Add `display_order` column to pages table
2. Create drag-and-drop UI in page list
3. Create API endpoint for reordering
4. Update queries to order by `display_order` then `full_path`
5. Auto-assign order when creating pages
6. Only allow reordering within same parent

---

## 📦 Tasks

### 1. Database Schema Update
- [ ] Create migration to add `display_order` integer column
- [ ] Set default value to 0
- [ ] Add index on `(parent_id, display_order)`
- [ ] Backfill existing pages with sequential order
- [ ] Update TypeScript types

### 2. Install Drag-and-Drop Library
- [ ] Research options: `@dnd-kit/core` vs `@vueuse/integrations` (sortable)
- [ ] Install chosen library: `pnpm add @dnd-kit/core @dnd-kit/sortable`
- [ ] Test basic drag-and-drop functionality

### 3. Update AdminPageList Component
- [ ] Add drag handles to each row
- [ ] Implement drag-and-drop with visual feedback
- [ ] Show drop indicator between rows
- [ ] Disable dragging across different parents
- [ ] Update local state optimistically
- [ ] Call API to persist new order

### 4. Create Reorder API Endpoint
- [ ] Create `PATCH /api/pages/reorder` endpoint
- [ ] Accept array of `{ id, display_order }` objects
- [ ] Validate all pages have same parent
- [ ] Update display_order in database
- [ ] Return updated pages

### 5. Update Page Queries
- [ ] Update `PageRepository.listPages()` to order by `display_order, full_path`
- [ ] Update `PageRepository.getChildren()` to order by `display_order`
- [ ] Update frontend queries to use new ordering

### 6. Auto-assign Order on Create
- [ ] Update `PageService.createPage()` to auto-assign display_order
- [ ] Set to `max(display_order) + 1` for siblings
- [ ] Default to 0 if no siblings

### 7. Testing
- [ ] Test drag-and-drop UI works
- [ ] Test reordering persists after page refresh
- [ ] Test cannot drag across different parents
- [ ] Test order maintained in child page lists
- [ ] Test order maintained in navigation
- [ ] Test new pages get correct order

---

## 🛠️ Technical Implementation

### Migration
```sql
-- Add display_order column
ALTER TABLE pages ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;

-- Add index for efficient ordering
CREATE INDEX idx_pages_parent_order ON pages(parent_id, display_order);

-- Backfill existing pages with sequential order
WITH ordered_pages AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY full_path) - 1 AS new_order
  FROM pages
  WHERE deleted_at IS NULL
)
UPDATE pages
SET display_order = ordered_pages.new_order
FROM ordered_pages
WHERE pages.id = ordered_pages.id;
```

### API Endpoint
```typescript
// server/api/pages/reorder.patch.ts
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const body = await readBody(event)
  const { pages } = reorderPagesSchema.parse(body)
  
  // Validate all pages have same parent
  const parentIds = new Set(pages.map(p => p.parent_id))
  if (parentIds.size > 1) {
    throw createError({ statusCode: 400, message: 'All pages must have same parent' })
  }
  
  // Update display_order
  const client = await serverSupabaseClient(event)
  for (const page of pages) {
    await client
      .from('pages')
      .update({ display_order: page.display_order })
      .eq('id', page.id)
  }
  
  return { success: true }
})
```

### Drag-and-Drop Component
```vue
<script setup lang="ts">
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'

const handleDragEnd = async (event) => {
  const { active, over } = event
  if (!over || active.id === over.id) return
  
  // Update local state
  const oldIndex = pages.value.findIndex(p => p.id === active.id)
  const newIndex = pages.value.findIndex(p => p.id === over.id)
  
  // Reorder array
  const reordered = arrayMove(pages.value, oldIndex, newIndex)
  pages.value = reordered
  
  // Persist to API
  await $fetch('/api/pages/reorder', {
    method: 'PATCH',
    body: {
      pages: reordered.map((p, i) => ({ id: p.id, display_order: i }))
    }
  })
}
</script>
```

---

## 📁 Files to Create

- `supabase/migrations/YYYYMMDDHHMMSS_add_display_order_to_pages.sql`
- `server/api/pages/reorder.patch.ts` (~80 lines)
- `server/schemas/reorder.schema.ts` (~30 lines)

## 📁 Files to Modify

- `app/components/admin/AdminPageList.vue` (add drag-and-drop)
- `server/repositories/PageRepository.ts` (update ordering)
- `types/supabase.ts` (regenerate types)

---

## ✅ Deliverables

1. ✅ `display_order` column in database
2. ✅ Drag-and-drop UI in page list
3. ✅ Reorder API endpoint
4. ✅ Pages ordered by custom order
5. ✅ Auto-assign order on create

---

## 🧪 Testing Strategy

1. Create 3 sibling pages (A, B, C)
2. Drag B above A → verify order changes
3. Refresh page → verify order persists
4. Try to drag page to different parent → verify blocked
5. Create new page → verify gets correct order
6. Check child page lists → verify custom order

---

## 🚀 Next Steps

After completion, proceed to Batch 4 (Page Duplication)

