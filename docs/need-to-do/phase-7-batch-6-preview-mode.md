# Phase 7 - Batch 6: Preview Mode

**Priority:** 3 (Content Management Feature)
**Status:** 🔜 Not Started
**Effort:** 4-6 hours
**Dependencies:** None

---

## 🎯 Goal

Enable admins to preview draft pages before publishing, allowing them to see exactly how the page will look without making it public.

---

## 📋 Current State

**Problem:**
- No way to preview draft pages
- Must publish to see final result
- Risk of publishing incomplete content
- No preview for unpublished changes

**Use Case:**
Admin edits a published page but wants to preview changes before updating the live version.

---

## 🎯 Objectives

1. Add "Preview" button to edit page
2. Generate secure preview tokens
3. Create preview middleware to bypass RLS
4. Show preview banner on preview pages
5. Support preview for draft and published pages
6. Auto-expire preview tokens after 1 hour

---

## 📦 Tasks

### 1. Create Preview Token System
- [ ] Create `preview_tokens` table in database
- [ ] Store: token (UUID), page_id, expires_at, created_by
- [ ] Create API endpoint to generate tokens: `POST /api/pages/[id]/preview`
- [ ] Auto-expire tokens after 1 hour
- [ ] Clean up expired tokens (cron job or on-demand)

### 2. Add Preview Button to Edit Page
- [ ] Add "Preview" button next to "Save" button
- [ ] Generate preview token on click
- [ ] Open preview in new tab: `/preview?token=xxx`
- [ ] Show loading state during token generation

### 3. Create Preview Middleware
- [ ] Create `app/middleware/preview.global.ts`
- [ ] Check for `?token=xxx` query parameter
- [ ] Validate token in database
- [ ] If valid, set preview mode in state
- [ ] Bypass RLS for preview requests

### 4. Update Page Fetching for Preview
- [ ] Modify `app/pages/[...slug].vue` to check preview mode
- [ ] If preview mode, fetch page by ID (from token) instead of slug
- [ ] Allow fetching draft/archived pages in preview mode
- [ ] Show preview banner at top of page

### 5. Create Preview Banner Component
- [ ] Create `app/components/PreviewBanner.vue`
- [ ] Show: "Preview Mode - This is how the page will look when published"
- [ ] Add "Exit Preview" button
- [ ] Style with yellow/orange background
- [ ] Make sticky at top

### 6. Update API for Preview
- [ ] Create `GET /api/pages/preview?token=xxx` endpoint
- [ ] Validate token
- [ ] Return page data (bypass RLS)
- [ ] Include token expiry info

### 7. Testing
- [ ] Test preview from edit page
- [ ] Test preview token generation
- [ ] Test preview of draft page
- [ ] Test preview of published page with changes
- [ ] Test token expiration (after 1 hour)
- [ ] Test invalid token handling
- [ ] Test preview banner display
- [ ] Test exit preview button

---

## 🛠️ Technical Implementation

### Database Migration
```sql
-- Create preview_tokens table
CREATE TABLE preview_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX idx_preview_tokens_token ON preview_tokens(token);
CREATE INDEX idx_preview_tokens_expires ON preview_tokens(expires_at);

-- RLS policies
ALTER TABLE preview_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage preview tokens"
  ON preview_tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM account_profiles
      WHERE account_profiles.id = auth.uid()
      AND account_profiles.is_admin = true
    )
  );
```

### Generate Preview Token API
```typescript
// server/api/pages/[id]/preview.post.ts
export default defineEventHandler(async (event) => {
  const userId = await requireAdmin(event)
  const pageId = getRouterParam(event, 'id')
  
  const client = await serverSupabaseClient(event)
  
  // Create preview token
  const { data, error } = await client
    .from('preview_tokens')
    .insert({
      page_id: pageId,
      created_by: userId,
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    })
    .select('token')
    .single()
  
  if (error) throw createError({ statusCode: 500, message: 'Failed to create preview token' })
  
  return {
    success: true,
    data: {
      token: data.token,
      preview_url: `/preview?token=${data.token}`
    }
  }
})
```

### Preview Middleware
```typescript
// app/middleware/preview.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const token = to.query.token as string
  if (!token) return
  
  try {
    const response = await $fetch(`/api/pages/preview?token=${token}`)
    
    // Set preview mode in state
    useState('previewMode', () => true)
    useState('previewToken', () => token)
    useState('previewPage', () => response.data)
  } catch (error) {
    // Invalid or expired token
    return navigateTo('/')
  }
})
```

### Preview Banner Component
```vue
<template>
  <div v-if="isPreviewMode" class="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-3 sticky top-0 z-50">
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Icon name="lucide:eye" class="w-5 h-5" />
        <span class="font-medium">Preview Mode</span>
        <span class="text-sm opacity-90">This is how the page will look when published</span>
      </div>
      <Button variant="ghost" size="sm" @click="exitPreview">
        Exit Preview
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
const isPreviewMode = useState('previewMode', () => false)

const exitPreview = () => {
  useState('previewMode', () => false)
  useState('previewToken', () => null)
  navigateTo('/')
}
</script>
```

---

## 📁 Files to Create

- `supabase/migrations/YYYYMMDDHHMMSS_create_preview_tokens.sql`
- `server/api/pages/[id]/preview.post.ts` (~60 lines)
- `server/api/pages/preview.get.ts` (~80 lines)
- `app/middleware/preview.global.ts` (~40 lines)
- `app/components/PreviewBanner.vue` (~60 lines)

## 📁 Files to Modify

- `app/pages/admin/pages/[id]/edit.vue` (add Preview button)
- `app/pages/[...slug].vue` (support preview mode)
- `app/layouts/default.vue` (add PreviewBanner)

---

## ✅ Deliverables

1. ✅ Preview button in edit page
2. ✅ Secure preview token system
3. ✅ Preview middleware
4. ✅ Preview banner component
5. ✅ Preview works for draft pages
6. ✅ Tokens auto-expire after 1 hour

---

## 🧪 Testing Strategy

1. Edit draft page → click Preview → verify opens in new tab
2. Verify preview URL contains token
3. Verify preview banner shows
4. Verify page content displays correctly
5. Click "Exit Preview" → verify returns to home
6. Wait 1 hour → verify token expires
7. Try invalid token → verify redirects to home

---

## 🚀 Next Steps

After completion, proceed to Batch 7 (Auto-save Drafts)

