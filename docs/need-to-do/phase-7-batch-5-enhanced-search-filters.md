# Phase 7 - Batch 5: Enhanced Search & Filters

**Priority:** 2 (Admin Workflow Enhancement)
**Status:** 🔜 Not Started
**Effort:** 3-4 hours
**Dependencies:** None

---

## 🎯 Goal

Enhance the admin page list with advanced search, date range filters, and bulk actions for improved productivity.

---

## 📋 Current State

**Current Features:**
- ✅ Search by title/slug/full_path
- ✅ Filter by status (All, Draft, Published, Archived)
- ✅ Filter by template
- ✅ Pagination

**Missing Features:**
- ❌ Date range filter (created_at, updated_at)
- ❌ "Created by me" filter
- ❌ Bulk select checkboxes
- ❌ Bulk actions (publish, archive, delete)

---

## 🎯 Objectives

1. Add date range filter for created_at and updated_at
2. Add "Created by me" filter (requires auth)
3. Add bulk select checkboxes
4. Add bulk actions dropdown (Publish, Archive, Delete)
5. Improve search with debouncing
6. Add "Clear all filters" button

---

## 📦 Tasks

### 1. Add Date Range Filter
- [ ] Install date picker: `pnpm add @vuepic/vue-datepicker`
- [ ] Create DateRangePicker component
- [ ] Add "Created" date range filter
- [ ] Add "Updated" date range filter
- [ ] Update API to support date range queries
- [ ] Update useAdminPages composable

### 2. Add "Created by Me" Filter
- [ ] Add checkbox: "Show only my pages"
- [ ] Get current user ID from auth
- [ ] Filter by created_by field
- [ ] Update API query

### 3. Add Bulk Select
- [ ] Add "Select All" checkbox in table header
- [ ] Add checkbox for each row
- [ ] Track selected page IDs in state
- [ ] Show selected count: "3 pages selected"
- [ ] Add "Clear selection" button

### 4. Add Bulk Actions
- [ ] Create bulk actions dropdown
- [ ] Add "Publish Selected" action
- [ ] Add "Archive Selected" action
- [ ] Add "Delete Selected" action (only if no children)
- [ ] Show confirmation dialog with count
- [ ] Call API for each selected page
- [ ] Show progress indicator
- [ ] Refresh list after completion

### 5. Improve Search
- [ ] Add debouncing (300ms delay)
- [ ] Show search loading indicator
- [ ] Add "Clear search" button (X icon)
- [ ] Highlight search terms in results (optional)

### 6. Add Clear Filters Button
- [ ] Add "Clear all filters" button
- [ ] Reset all filters to defaults
- [ ] Clear search input
- [ ] Refresh page list

### 7. Testing
- [ ] Test date range filter
- [ ] Test "Created by me" filter
- [ ] Test bulk select (select all, select individual)
- [ ] Test bulk publish
- [ ] Test bulk archive
- [ ] Test bulk delete (with validation)
- [ ] Test search debouncing
- [ ] Test clear filters

---

## 🛠️ Technical Implementation

### Date Range Filter
```vue
<template>
  <div class="flex gap-2">
    <DateRangePicker
      v-model="dateRange"
      placeholder="Filter by date"
      @update:model-value="handleDateChange"
    />
  </div>
</template>

<script setup lang="ts">
const dateRange = ref<[Date, Date] | null>(null)

const handleDateChange = () => {
  filters.value.created_from = dateRange.value?.[0]?.toISOString()
  filters.value.created_to = dateRange.value?.[1]?.toISOString()
  fetchPages()
}
</script>
```

### Bulk Actions
```vue
<template>
  <div v-if="selectedIds.length > 0" class="flex items-center gap-4">
    <span class="text-sm text-gray-600 dark:text-gray-400">
      {{ selectedIds.length }} page(s) selected
    </span>
    
    <FilterSelect
      v-model="bulkAction"
      :options="bulkActionOptions"
      placeholder="Bulk actions"
      @update:model-value="handleBulkAction"
    />
    
    <Button variant="ghost" @click="clearSelection">
      Clear selection
    </Button>
  </div>
</template>

<script setup lang="ts">
const selectedIds = ref<string[]>([])
const bulkAction = ref<string>('')

const bulkActionOptions = [
  { value: 'publish', label: 'Publish Selected' },
  { value: 'archive', label: 'Archive Selected' },
  { value: 'delete', label: 'Delete Selected' }
]

const handleBulkAction = async () => {
  const confirmed = await showConfirmDialog({
    title: `${bulkAction.value} ${selectedIds.value.length} pages?`,
    message: 'This action cannot be undone.',
    confirmText: bulkAction.value
  })
  
  if (!confirmed) return
  
  try {
    for (const id of selectedIds.value) {
      if (bulkAction.value === 'publish') {
        await $fetch(`/api/pages/${id}`, {
          method: 'PATCH',
          body: { status: 'published' }
        })
      } else if (bulkAction.value === 'archive') {
        await $fetch(`/api/pages/${id}`, {
          method: 'PATCH',
          body: { status: 'archived' }
        })
      } else if (bulkAction.value === 'delete') {
        await $fetch(`/api/pages/${id}`, { method: 'DELETE' })
      }
    }
    
    toast.success(`${selectedIds.value.length} pages ${bulkAction.value}ed`)
    clearSelection()
    fetchPages()
  } catch (error) {
    toast.error(`Failed to ${bulkAction.value} pages`)
  }
}
</script>
```

### API Updates
```typescript
// server/schemas/page.schemas.ts
export const listPagesQuerySchema = z.object({
  // ... existing fields
  created_from: z.string().datetime().optional(),
  created_to: z.string().datetime().optional(),
  updated_from: z.string().datetime().optional(),
  updated_to: z.string().datetime().optional(),
  created_by: z.string().uuid().optional()
})

// server/repositories/PageRepository.ts
if (filters.created_from) {
  query = query.gte('created_at', filters.created_from)
}
if (filters.created_to) {
  query = query.lte('created_at', filters.created_to)
}
if (filters.created_by) {
  query = query.eq('created_by', filters.created_by)
}
```

---

## 📁 Files to Create

- `app/components/ui/form/DateRangePicker.vue` (~120 lines)

## 📁 Files to Modify

- `app/components/admin/AdminPageList.vue` (add bulk select, bulk actions)
- `app/pages/admin/pages/index.vue` (add date filters, created by me)
- `app/composables/useAdminPages.ts` (add new filter params)
- `server/schemas/page.schemas.ts` (add date range fields)
- `server/repositories/PageRepository.ts` (add date range queries)

---

## ✅ Deliverables

1. ✅ Date range filter for created/updated dates
2. ✅ "Created by me" filter
3. ✅ Bulk select checkboxes
4. ✅ Bulk actions (publish, archive, delete)
5. ✅ Debounced search
6. ✅ Clear all filters button

---

## 🧪 Testing Strategy

1. Filter by date range → verify results
2. Filter by "Created by me" → verify only my pages
3. Select all pages → verify all selected
4. Bulk publish 3 pages → verify all published
5. Bulk archive 2 pages → verify all archived
6. Try bulk delete page with children → verify blocked
7. Search with debounce → verify 300ms delay
8. Clear all filters → verify reset to defaults

---

## 🚀 Next Steps

After completion, proceed to Priority 3 (Batch 6 - Preview Mode)

