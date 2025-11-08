# Phase 4: Dynamic Routing - Implementation Plan

**Date:** 2025-11-08  
**Status:** 🟡 Ready to Start  
**Previous Phase:** Phase 3 (API Endpoints) - ✅ Complete

---

## 📋 Overview

Phase 4 implements the **frontend page rendering system** for the Hub-and-Spoke CMS. This phase creates the catch-all route, template components, and all necessary utilities to render dynamic pages with full SEO support.

### Goals

- ✅ **SSR-first approach** for optimal SEO performance
- ✅ **Dynamic template loading** based on page.template field
- ✅ **Full SEO support** (Schema.org, Open Graph, Twitter Cards)
- ✅ **Markdown rendering** with sanitization
- ✅ **Breadcrumb navigation** for all pages
- ✅ **Child page display** for Hub/Spoke templates
- ✅ **Custom error handling** (404, 403, 500)
- ✅ **Loading states** for better UX

---

## 🏗️ Architecture Decisions

### 1. Markdown Rendering

**Decision:** Use `marked` library (lightweight, no syntax highlighting needed)

**Rationale:**
- ✅ Lightweight (~20KB minified)
- ✅ Fast parsing and rendering
- ✅ SSR-compatible
- ✅ No syntax highlighting overhead (not needed)
- ✅ Simple API, easy to sanitize output

**Alternative Considered:** `@nuxtjs/content` (too heavy for our use case)

### 2. SEO Meta Tags

**Decision:** Use `useHead()` and `useSeoMeta()` from `@nuxtjs/seo` (already installed)

**Rationale:**
- ✅ No additional dependencies
- ✅ Built-in SSR support
- ✅ Automatic meta tag deduplication
- ✅ Schema.org JSON-LD support
- ✅ Open Graph and Twitter Card support

### 3. Child Pages Fetching

**Decision:** Fetch children server-side via `/api/pages/[id]/children` endpoint

**Rationale:**
- ✅ Better SEO (children in initial HTML)
- ✅ Faster initial page load
- ✅ Consistent with SSR approach
- ✅ Leverages existing API endpoint

**Pagination:** Show all children initially (no pagination for now - can add later if needed)

### 4. Error Handling

**Decision:** Custom error pages using Nuxt's error.vue pattern

**Rationale:**
- ✅ Consistent with site design
- ✅ Better UX than default error pages
- ✅ Maintains light/dark mode support
- ✅ SEO-friendly error pages

---

## 📦 Implementation Batches

### Batch 1: Core Routing & Default Template
**Goal:** Get basic routing working end-to-end

**Tasks:**
1. Install `marked` for markdown rendering
2. Create `useMarkdown` composable
3. Create `usePageSeo` composable
4. Create `usePage` composable
5. Create catch-all route (`app/pages/[...slug].vue`)
6. Create `DefaultTemplate.vue` (minimal)
7. Test basic routing

**Deliverable:** Working catch-all route with default template

---

### Batch 2: SEO & Breadcrumbs
**Goal:** Add comprehensive SEO and navigation

**Tasks:**
1. Create `Breadcrumbs.vue` component
2. Integrate SEO meta tags in catch-all route
3. Add breadcrumbs to DefaultTemplate
4. Test SEO meta tags in page source

**Deliverable:** Full SEO support with breadcrumb navigation

---

### Batch 3: Hub Template & Child Pages
**Goal:** Create Hub template matching staining-concrete.vue design

**Tasks:**
1. Create `HubTemplate.vue` (sidebar + topic cards grid)
2. Fetch and display child pages as topic cards
3. Add dynamic component loading to catch-all route
4. Test Hub template with children

**Deliverable:** Working Hub template with child page grid

---

### Batch 4: Spoke & Sub-Spoke Templates
**Goal:** Create mid-level and detailed content templates

**Tasks:**
1. Create `SpokeTemplate.vue` (sidebar + content + optional child list)
2. Create `SubSpokeTemplate.vue` (TOC + detailed content)
3. Test both templates with metadata

**Deliverable:** Working Spoke and Sub-Spoke templates

---

### Batch 5: Article Template
**Goal:** Create deep-level article template

**Tasks:**
1. Create `ArticleTemplate.vue` (clean article layout)
2. Test Article template (depth 3+)

**Deliverable:** Working Article template

---

### Batch 6: Error Handling & 404
**Goal:** Custom error pages with proper styling

**Tasks:**
1. Create custom error layout
2. Create 404 error page
3. Add error handling to catch-all route
4. Test error scenarios (404, 403, 500)

**Deliverable:** Custom error pages matching site design

---

### Batch 7: Polish & Testing
**Goal:** Final polish and comprehensive testing

**Tasks:**
1. Add loading states
2. Test complete page hierarchy
3. Test all template metadata features
4. Verify SSR and SEO
5. Update documentation

**Deliverable:** Production-ready dynamic routing system

---

## 🎨 Template Component Structure

### File Organization

```
app/
├── components/
│   ├── templates/
│   │   ├── HubTemplate.vue          # Depth 0 - Grid layout
│   │   ├── SpokeTemplate.vue        # Depth 1 - Sidebar layout
│   │   ├── SubSpokeTemplate.vue     # Depth 2 - TOC layout
│   │   ├── ArticleTemplate.vue      # Depth 3+ - Article layout
│   │   └── DefaultTemplate.vue      # Fallback template
│   └── ui/
│       └── Breadcrumbs.vue          # Breadcrumb navigation
├── composables/
│   ├── useMarkdown.ts               # Markdown rendering
│   ├── usePageSeo.ts                # SEO meta tags
│   └── usePage.ts                   # Page data fetching
└── pages/
    └── [...slug].vue                # Catch-all route
```

### Template Component Pattern

Each template component follows this pattern:

```vue
<script setup lang="ts">
import type { Page } from '~/types/supabase'

interface Props {
  page: Page
  children?: Page[]
  breadcrumbs?: Breadcrumb[]
}

const props = defineProps<Props>()

// Parse markdown content
const { html } = useMarkdown(props.page.content)

// Template-specific metadata
const metadata = computed(() => props.page.metadata?.template || {})
</script>

<template>
  <div class="min-h-screen bg-neutral-50 dark:bg-neutral-900">
    <!-- Breadcrumbs -->
    <Breadcrumbs v-if="breadcrumbs" :items="breadcrumbs" />
    
    <!-- Template-specific layout -->
    <!-- ... -->
  </div>
</template>
```

---

## 🔍 SEO Implementation

### Meta Tags Structure

```typescript
// usePageSeo composable
export function usePageSeo(page: Page) {
  // Basic meta tags
  useSeoMeta({
    title: page.meta_title || page.title,
    description: page.description,
    keywords: page.meta_keywords?.join(', '),
    robots: page.meta_robots?.join(', '),
    
    // Open Graph
    ogTitle: page.metadata?.seo?.og?.title || page.meta_title || page.title,
    ogDescription: page.metadata?.seo?.og?.description || page.description,
    ogType: page.metadata?.seo?.og?.type || 'website',
    ogUrl: page.canonical_url,
    ogImage: page.og_image,
    
    // Twitter Card
    twitterCard: page.metadata?.seo?.twitter?.card || 'summary_large_image',
    twitterTitle: page.metadata?.seo?.twitter?.title || page.meta_title || page.title,
    twitterDescription: page.metadata?.seo?.twitter?.description || page.description,
    twitterImage: page.metadata?.seo?.twitter?.image || page.og_image,
  })
  
  // Schema.org JSON-LD
  if (page.metadata?.seo?.schema) {
    useHead({
      script: [{
        type: 'application/ld+json',
        children: JSON.stringify(page.metadata.seo.schema)
      }]
    })
  }
}
```

---

## 🧪 Testing Strategy

### Test Scenarios

1. **Basic Routing**
   - Navigate to `/test-page` → DefaultTemplate renders
   - Navigate to `/category` → HubTemplate renders
   - Navigate to `/category/sub-page` → SpokeTemplate renders

2. **SEO Verification**
   - View page source → All meta tags present
   - Check JSON-LD schema → Valid Schema.org markup
   - Verify canonical URLs → Correct canonical tags

3. **Error Handling**
   - Navigate to `/non-existent` → 404 page
   - Access draft page (public) → 403 page
   - Simulate API error → 500 page

4. **Template Features**
   - Hub: Child pages render as topic cards
   - Spoke: Sidebar and child list display
   - Sub-Spoke: TOC generates from headings
   - Article: Clean article layout

5. **SSR Verification**
   - Disable JavaScript → Pages still render
   - Check initial HTML → Content present
   - Verify hydration → No layout shifts

---

## 📊 Success Criteria

- [ ] All 5 template components created and working
- [ ] Catch-all route handles all page paths
- [ ] SEO meta tags render correctly (Schema.org, OG, Twitter)
- [ ] Breadcrumbs display on all pages
- [ ] Child pages display in Hub/Spoke templates
- [ ] Custom 404 and error pages working
- [ ] Loading states implemented
- [ ] SSR working correctly
- [ ] All tests passing
- [ ] Documentation updated

---

## 🚀 Next Steps After Phase 4

**Phase 5:** Admin UI (Basic)
- Create admin interface for page management
- CRUD operations for pages
- Template selector and metadata editor
- Markdown editor integration

---

**Last Updated:** 2025-11-08  
**Next Review:** After Batch 1 completion

