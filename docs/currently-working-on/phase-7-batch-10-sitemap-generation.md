# Phase 7 - Batch 10: Sitemap Generation

**Priority:** 5 (SEO & Analytics)
**Status:** 🔜 Not Started
**Effort:** 3-4 hours
**Dependencies:** None

---

## 🎯 Goal

Auto-generate XML sitemap from published pages to improve SEO and help search engines discover content.

---

## 📋 Current State

**Problem:**
- No sitemap.xml file
- Search engines can't efficiently crawl site
- No automatic sitemap updates
- Missing SEO best practice

**SEO Impact:**
- Helps Google discover pages faster
- Improves crawl efficiency
- Signals page priority and update frequency

---

## 🎯 Objectives

1. Create `/sitemap.xml` endpoint
2. Generate sitemap from published pages only
3. Include lastmod, changefreq, priority
4. Auto-update on page publish/unpublish
5. Support sitemap index for 1000+ pages
6. Add to robots.txt
7. Submit to Google Search Console

---

## 📦 Tasks

### 1. Create Sitemap Endpoint
- [ ] Create `server/routes/sitemap.xml.get.ts`
- [ ] Fetch all published, non-deleted pages
- [ ] Generate XML sitemap format
- [ ] Include: loc, lastmod, changefreq, priority
- [ ] Set proper content-type: `application/xml`
- [ ] Add cache headers (1 hour)

### 2. Generate Sitemap XML
- [ ] Use XML builder or template
- [ ] Include homepage (priority: 1.0)
- [ ] Include all published pages
- [ ] Set priority based on depth (0: 1.0, 1: 0.8, 2: 0.6, 3+: 0.4)
- [ ] Set changefreq based on template (Hub: weekly, Article: monthly)
- [ ] Use updated_at for lastmod

### 3. Handle Large Sitemaps
- [ ] If >50,000 URLs, create sitemap index
- [ ] Split into multiple sitemaps (50,000 URLs each)
- [ ] Create `/sitemap-1.xml`, `/sitemap-2.xml`, etc.
- [ ] Create `/sitemap-index.xml` pointing to all sitemaps

### 4. Add Sitemap to Robots.txt
- [ ] Update robots.txt to include sitemap URL
- [ ] Add: `Sitemap: https://example.com/sitemap.xml`

### 5. Cache Sitemap
- [ ] Cache sitemap for 1 hour
- [ ] Invalidate cache on page publish/unpublish
- [ ] Add cache headers for CDN

### 6. Testing
- [ ] Test sitemap generates correctly
- [ ] Test all published pages included
- [ ] Test draft/archived pages excluded
- [ ] Test XML format is valid
- [ ] Test sitemap index (if >50,000 pages)
- [ ] Validate with Google Search Console
- [ ] Test cache invalidation

---

## 🛠️ Technical Implementation

### Sitemap Endpoint
```typescript
// server/routes/sitemap.xml.get.ts
export default defineEventHandler(async (event) => {
  // Check cache
  const cached = await useStorage('cache').getItem('sitemap:xml')
  if (cached) {
    setHeader(event, 'Content-Type', 'application/xml')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return cached
  }
  
  // Fetch published pages
  const client = await serverSupabaseClient(event)
  const { data: pages } = await client
    .from('pages')
    .select('full_path, updated_at, depth, template, sitemap_priority, sitemap_changefreq')
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('full_path')
  
  // Generate sitemap XML
  const siteUrl = useRuntimeConfig().public.siteUrl
  
  const urls = pages.map(page => {
    const priority = page.sitemap_priority || getPriorityByDepth(page.depth)
    const changefreq = page.sitemap_changefreq || getChangefreqByTemplate(page.template)
    
    return `
    <url>
      <loc>${siteUrl}${page.full_path}</loc>
      <lastmod>${new Date(page.updated_at).toISOString()}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
    </url>`
  }).join('')
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`
  
  // Cache for 1 hour
  await useStorage('cache').setItem('sitemap:xml', sitemap, { ttl: 3600 })
  
  setHeader(event, 'Content-Type', 'application/xml')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  
  return sitemap
})

function getPriorityByDepth(depth: number): number {
  switch (depth) {
    case 0: return 1.0
    case 1: return 0.8
    case 2: return 0.6
    default: return 0.4
  }
}

function getChangefreqByTemplate(template: string): string {
  switch (template) {
    case 'hub': return 'weekly'
    case 'spoke': return 'weekly'
    case 'article': return 'monthly'
    default: return 'monthly'
  }
}
```

### Sitemap Index (for large sites)
```typescript
// server/routes/sitemap-index.xml.get.ts
export default defineEventHandler(async (event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl
  
  // Get total page count
  const client = await serverSupabaseClient(event)
  const { count } = await client
    .from('pages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .is('deleted_at', null)
  
  // If less than 50,000, redirect to single sitemap
  if (count < 50000) {
    return sendRedirect(event, '/sitemap.xml')
  }
  
  // Generate sitemap index
  const numSitemaps = Math.ceil(count / 50000)
  const sitemaps = Array.from({ length: numSitemaps }, (_, i) => `
    <sitemap>
      <loc>${siteUrl}/sitemap-${i + 1}.xml</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`
  ).join('')
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`
  
  setHeader(event, 'Content-Type', 'application/xml')
  return sitemapIndex
})
```

### Cache Invalidation
```typescript
// server/utils/cache.ts
export async function invalidateSitemap() {
  await useStorage('cache').removeItem('sitemap:xml')
  
  if (import.meta.dev) {
    consola.info('Sitemap cache invalidated')
  }
}

// Call in page update/create/delete endpoints
await invalidateSitemap()
```

### Update Robots.txt
```typescript
// server/routes/robots.txt.get.ts
export default defineEventHandler((event) => {
  const siteUrl = useRuntimeConfig().public.siteUrl
  
  const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml`
  
  setHeader(event, 'Content-Type', 'text/plain')
  return robots
})
```

---

## 📁 Files to Create

- `server/routes/sitemap.xml.get.ts` (~150 lines)
- `server/routes/sitemap-index.xml.get.ts` (~80 lines)
- `server/routes/sitemap-[id].xml.get.ts` (~100 lines, for pagination)

## 📁 Files to Modify

- `server/utils/cache.ts` (add invalidateSitemap function)
- `server/api/pages/[id].patch.ts` (invalidate sitemap on update)
- `server/api/pages/index.post.ts` (invalidate sitemap on create)
- `server/api/pages/[id].delete.ts` (invalidate sitemap on delete)

---

## ✅ Deliverables

1. ✅ `/sitemap.xml` endpoint
2. ✅ Auto-generated from published pages
3. ✅ Includes SEO metadata (lastmod, changefreq, priority)
4. ✅ Auto-updates on page changes
5. ✅ Sitemap index for large sites
6. ✅ Added to robots.txt

---

## 🧪 Testing Strategy

1. Navigate to `/sitemap.xml` → verify XML renders
2. Check all published pages included
3. Verify draft/archived pages excluded
4. Validate XML format at https://www.xml-sitemaps.com/validate-xml-sitemap.html
5. Submit to Google Search Console
6. Publish new page → verify sitemap updates
7. Test cache invalidation

---

## 📊 Success Metrics

- ✅ Valid XML sitemap
- ✅ All published pages included
- ✅ Accepted by Google Search Console
- ✅ Auto-updates on page changes
- ✅ Cached for performance

---

## 🚀 Next Steps

After completion, proceed to Batch 11 (Robots.txt Management)

