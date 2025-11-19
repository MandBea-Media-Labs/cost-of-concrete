# Phase 7 - Batch 4: Page Duplication

**Priority:** 2 (Admin Workflow Enhancement)
**Status:** 🔜 Not Started
**Effort:** 2-3 hours
**Dependencies:** None

---

## 🎯 Goal

Enable one-click page duplication to quickly create similar pages without manual copying of content and settings.

---

## 📋 Current State

**Problem:**
- No way to duplicate existing pages
- Must manually copy all fields when creating similar pages
- Time-consuming for pages with extensive SEO and metadata

**Use Case:**
Admin wants to create "Stamped Concrete in Los Angeles" based on existing "Stamped Concrete in San Diego" page.

---

## 🎯 Objectives

1. Add "Duplicate" button to edit page
2. Create API endpoint for duplication
3. Auto-generate unique slug with suffix
4. Copy all fields except unique identifiers
5. Set status to 'draft' for review
6. Redirect to edit page of duplicated page

---

## 📦 Tasks

### 1. Create Duplicate API Endpoint
- [ ] Create `POST /api/pages/[id]/duplicate` endpoint
- [ ] Require admin authentication
- [ ] Fetch source page by ID
- [ ] Generate new slug with suffix (e.g., "page-slug-copy", "page-slug-copy-2")
- [ ] Copy all fields except: id, slug, full_path, created_at, updated_at
- [ ] Set status to 'draft'
- [ ] Set display_order to max + 1 (if Batch 3 complete)
- [ ] Create new page
- [ ] Return new page ID

### 2. Add Duplicate Button to Edit Page
- [ ] Add "Duplicate" button next to "Archive/Delete" buttons
- [ ] Show confirmation dialog: "Duplicate this page?"
- [ ] Call duplicate API endpoint
- [ ] Show loading state during duplication
- [ ] Redirect to edit page of new page
- [ ] Show success toast: "Page duplicated successfully"

### 3. Slug Generation Logic
- [ ] Check if slug exists
- [ ] If exists, append "-copy"
- [ ] If "-copy" exists, append "-copy-2", "-copy-3", etc.
- [ ] Validate slug format
- [ ] Ensure uniqueness

### 4. Update AdminPageList
- [ ] Add "Duplicate" action to quick actions menu
- [ ] Show confirmation dialog
- [ ] Call duplicate API
- [ ] Refresh page list
- [ ] Show success toast

### 5. Testing
- [ ] Test duplicate from edit page
- [ ] Test duplicate from page list
- [ ] Test slug generation (original, -copy, -copy-2)
- [ ] Verify all fields copied correctly
- [ ] Verify status set to 'draft'
- [ ] Verify unique fields not copied (id, timestamps)
- [ ] Test with pages that have children (should not copy children)

---

## 🛠️ Technical Implementation

### API Endpoint
```typescript
// server/api/pages/[id]/duplicate.post.ts
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const pageId = getRouterParam(event, 'id')
  const client = await serverSupabaseClient(event)
  const pageService = new PageService(client)
  
  // Get source page
  const sourcePage = await pageService.getPageById(pageId)
  if (!sourcePage) {
    throw createError({ statusCode: 404, message: 'Page not found' })
  }
  
  // Generate unique slug
  let newSlug = `${sourcePage.slug}-copy`
  let counter = 2
  while (await pageService.getPageBySlug(newSlug)) {
    newSlug = `${sourcePage.slug}-copy-${counter}`
    counter++
  }
  
  // Create duplicate
  const duplicateData = {
    title: `${sourcePage.title} (Copy)`,
    slug: newSlug,
    parent_id: sourcePage.parent_id,
    template: sourcePage.template,
    status: 'draft' as const,
    description: sourcePage.description,
    content: sourcePage.content,
    metadata: sourcePage.metadata,
    // SEO fields
    meta_title: sourcePage.meta_title,
    meta_description: sourcePage.meta_description,
    meta_keywords: sourcePage.meta_keywords,
    canonical_url: null, // Will be auto-generated
    meta_robots: sourcePage.meta_robots,
    og_image: sourcePage.og_image,
    sitemap_priority: sourcePage.sitemap_priority,
    sitemap_changefreq: sourcePage.sitemap_changefreq
  }
  
  const newPage = await pageService.createPage(duplicateData)
  
  return {
    success: true,
    data: newPage
  }
})
```

### Edit Page Button
```vue
<template>
  <div class="flex gap-2">
    <Button
      variant="outline"
      @click="handleDuplicate"
      :disabled="isLoading"
    >
      <Icon name="lucide:copy" class="w-4 h-4 mr-2" />
      Duplicate
    </Button>
  </div>
</template>

<script setup lang="ts">
const handleDuplicate = async () => {
  const confirmed = await showConfirmDialog({
    title: 'Duplicate Page',
    message: 'Create a copy of this page?',
    confirmText: 'Duplicate'
  })
  
  if (!confirmed) return
  
  try {
    isLoading.value = true
    const response = await $fetch(`/api/pages/${pageId.value}/duplicate`, {
      method: 'POST'
    })
    
    toast.success('Page duplicated successfully')
    router.push(`/admin/pages/${response.data.id}/edit`)
  } catch (error) {
    toast.error('Failed to duplicate page')
  } finally {
    isLoading.value = false
  }
}
</script>
```

---

## 📁 Files to Create

- `server/api/pages/[id]/duplicate.post.ts` (~100 lines)

## 📁 Files to Modify

- `app/pages/admin/pages/[id]/edit.vue` (add Duplicate button)
- `app/components/admin/AdminPageList.vue` (add Duplicate action)

---

## ✅ Deliverables

1. ✅ Duplicate button in edit page
2. ✅ Duplicate action in page list
3. ✅ API endpoint for duplication
4. ✅ Auto-generated unique slugs
5. ✅ All fields copied correctly
6. ✅ Status set to 'draft'

---

## 🧪 Testing Strategy

1. Duplicate a simple page → verify all fields copied
2. Duplicate a page with SEO data → verify SEO fields copied
3. Duplicate a page with metadata → verify metadata copied
4. Duplicate same page twice → verify slug suffixes (-copy, -copy-2)
5. Duplicate from edit page → verify redirects to new page
6. Duplicate from page list → verify list refreshes

---

## 🚀 Next Steps

After completion, proceed to Batch 5 (Enhanced Search & Filters)

