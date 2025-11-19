# Phase 7 - Batch 9: Caching Strategy

**Priority:** 4 (Performance & Scale)
**Status:** 🔜 Not Started
**Effort:** 6-8 hours
**Dependencies:** Batch 8 (Performance Testing)

---

## 🎯 Goal

Implement caching strategy to reduce database load and improve response times based on performance testing findings.

---

## 📋 Current State

**Problem:**
- Every request hits database
- Repeated queries for same data
- No caching layer
- Slow response times at scale

**From Batch 8 Findings:**
- Identify which queries are slowest
- Identify which data changes infrequently
- Determine optimal cache TTL

---

## 🎯 Objectives

1. Implement caching for page list queries
2. Implement caching for individual pages
3. Implement caching for template schemas
4. Implement caching for breadcrumbs/ancestors
5. Add cache invalidation on updates
6. Use Nuxt's built-in cache or Redis
7. Monitor cache hit rates

---

## 📦 Tasks

### 1. Choose Caching Solution
- [ ] Evaluate Nuxt's built-in cache (Nitro storage)
- [ ] Evaluate Redis (if needed for production)
- [ ] Install dependencies if needed
- [ ] Configure cache storage
- [ ] Set up cache keys strategy

### 2. Cache Page List Queries
- [ ] Cache GET /api/pages results
- [ ] Use cache key: `pages:list:${filters}:${page}`
- [ ] Set TTL: 5 minutes
- [ ] Invalidate on page create/update/delete
- [ ] Add cache headers (ETag, Last-Modified)

### 3. Cache Individual Pages
- [ ] Cache GET /api/pages/[id] results
- [ ] Use cache key: `pages:${id}`
- [ ] Set TTL: 10 minutes
- [ ] Invalidate on page update
- [ ] Cache by slug as well: `pages:slug:${slug}`

### 4. Cache Template Schemas
- [ ] Cache GET /api/templates results
- [ ] Use cache key: `templates:all`
- [ ] Set TTL: 1 hour (rarely changes)
- [ ] No invalidation needed (static data)

### 5. Cache Hierarchy Queries
- [ ] Cache getChildren() results
- [ ] Cache getAncestors() results
- [ ] Cache getBreadcrumbs() results
- [ ] Use cache keys: `pages:${id}:children`, `pages:${id}:ancestors`
- [ ] Set TTL: 10 minutes
- [ ] Invalidate on hierarchy changes

### 6. Implement Cache Invalidation
- [ ] Invalidate on page create
- [ ] Invalidate on page update
- [ ] Invalidate on page delete
- [ ] Invalidate parent/children caches on hierarchy change
- [ ] Use cache tags for bulk invalidation

### 7. Add Cache Monitoring
- [ ] Log cache hits/misses
- [ ] Track cache hit rate
- [ ] Monitor cache size
- [ ] Add cache stats endpoint (admin only)

### 8. Testing
- [ ] Test cache hit on repeated requests
- [ ] Test cache invalidation on update
- [ ] Test cache expiration (TTL)
- [ ] Test cache with different filters
- [ ] Measure performance improvement
- [ ] Test cache stats endpoint

---

## 🛠️ Technical Implementation

### Nuxt Cache (Nitro Storage)
```typescript
// server/api/pages/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const cacheKey = `pages:list:${JSON.stringify(query)}`
  
  // Try to get from cache
  const cached = await useStorage('cache').getItem(cacheKey)
  if (cached) {
    if (import.meta.dev) {
      consola.info('Cache HIT:', cacheKey)
    }
    return cached
  }
  
  // Cache miss - fetch from database
  if (import.meta.dev) {
    consola.info('Cache MISS:', cacheKey)
  }
  
  const client = await serverSupabaseClient(event)
  const pageService = new PageService(client)
  const result = await pageService.listPages(query)
  
  // Store in cache (5 minutes)
  await useStorage('cache').setItem(cacheKey, result, {
    ttl: 60 * 5
  })
  
  return result
})
```

### Cache Invalidation
```typescript
// server/utils/cache.ts
export async function invalidatePageCache(pageId: string) {
  const storage = useStorage('cache')
  
  // Invalidate specific page
  await storage.removeItem(`pages:${pageId}`)
  
  // Invalidate page list (all variations)
  const keys = await storage.getKeys('pages:list:')
  for (const key of keys) {
    await storage.removeItem(key)
  }
  
  // Invalidate hierarchy caches
  await storage.removeItem(`pages:${pageId}:children`)
  await storage.removeItem(`pages:${pageId}:ancestors`)
  
  if (import.meta.dev) {
    consola.info('Cache invalidated for page:', pageId)
  }
}

// Use in update endpoint
export default defineEventHandler(async (event) => {
  // ... update page logic
  
  // Invalidate cache
  await invalidatePageCache(pageId)
  
  return result
})
```

### Redis Alternative (Production)
```typescript
// server/utils/redis.ts
import { createClient } from 'redis'

const redis = createClient({
  url: process.env.REDIS_URL
})

await redis.connect()

export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number
): Promise<void> {
  await redis.setEx(key, ttl, JSON.stringify(value))
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(keys)
  }
}
```

### Cache Stats Endpoint
```typescript
// server/api/admin/cache/stats.get.ts
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  
  const storage = useStorage('cache')
  const keys = await storage.getKeys()
  
  const stats = {
    total_keys: keys.length,
    keys_by_type: {
      pages: keys.filter(k => k.startsWith('pages:')).length,
      templates: keys.filter(k => k.startsWith('templates:')).length
    },
    sample_keys: keys.slice(0, 10)
  }
  
  return { success: true, data: stats }
})
```

### Cache Headers
```typescript
// Add cache headers for CDN
export default defineEventHandler(async (event) => {
  const result = await pageService.getPageById(pageId)
  
  // Set cache headers
  setHeader(event, 'Cache-Control', 'public, max-age=300') // 5 minutes
  setHeader(event, 'ETag', `"${result.updated_at}"`)
  
  return result
})
```

---

## 📁 Files to Create

- `server/utils/cache.ts` (~150 lines)
- `server/api/admin/cache/stats.get.ts` (~60 lines)
- `server/api/admin/cache/clear.post.ts` (~40 lines)

## 📁 Files to Modify

- `server/api/pages/index.get.ts` (add caching)
- `server/api/pages/[id].get.ts` (add caching)
- `server/api/pages/[id].patch.ts` (add invalidation)
- `server/api/pages/[id].delete.ts` (add invalidation)
- `server/api/pages/index.post.ts` (add invalidation)
- `server/api/templates/index.get.ts` (add caching)
- `nuxt.config.ts` (configure cache storage)

---

## ✅ Deliverables

1. ✅ Caching for all read queries
2. ✅ Cache invalidation on updates
3. ✅ Cache monitoring/stats
4. ✅ Improved response times
5. ✅ Reduced database load

---

## 🧪 Testing Strategy

1. Make request → check cache miss
2. Make same request → check cache hit
3. Update page → verify cache invalidated
4. Make request → check cache miss (new data)
5. Check cache stats → verify hit rate
6. Measure performance improvement

---

## 📊 Success Metrics

**Target Improvements:**
- Cache hit rate: >80%
- Response time: 50% faster for cached requests
- Database queries: 50% reduction
- Page list load time: <50ms (cached)

---

## 🚀 Next Steps

After completion, proceed to Priority 5 (Batch 10 - Sitemap Generation)

