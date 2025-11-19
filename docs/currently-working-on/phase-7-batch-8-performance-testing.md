# Phase 7 - Batch 8: Performance Testing

**Priority:** 4 (Performance & Scale)
**Status:** 🔜 Not Started
**Effort:** 4-6 hours
**Dependencies:** None

---

## 🎯 Goal

Test system performance with 100+ pages and deep nesting (10+ levels) to identify bottlenecks and optimize queries before implementing caching.

---

## 📋 Current State

**Current Data:**
- ~13 test pages
- Max depth: 3 levels
- No performance benchmarks
- Unknown query performance at scale

**Questions to Answer:**
- How does page list perform with 100+ pages?
- How does deep nesting (10+ levels) affect queries?
- What are the slowest queries?
- Where should we add indexes?
- What should we cache?

---

## 🎯 Objectives

1. Create 100+ test pages with realistic data
2. Create deep nesting (10+ levels)
3. Benchmark all critical queries
4. Identify performance bottlenecks
5. Optimize slow queries
6. Add database indexes where needed
7. Document performance metrics

---

## 📦 Tasks

### 1. Create Test Data Script
- [ ] Create SQL script to generate 100+ pages
- [ ] Include variety of templates (Hub, Spoke, Article, etc.)
- [ ] Include variety of statuses (Draft, Published, Archived)
- [ ] Create realistic content (lorem ipsum)
- [ ] Create deep nesting (10+ levels)
- [ ] Include SEO metadata
- [ ] Distribute pages across hierarchy

### 2. Benchmark Page List Query
- [ ] Measure query time with 100+ pages
- [ ] Test with different filters (status, template)
- [ ] Test with search
- [ ] Test with pagination (page 1, 5, 10)
- [ ] Test with different sort orders
- [ ] Record results

### 3. Benchmark Hierarchy Queries
- [ ] Measure getChildren() with 50+ children
- [ ] Measure getAncestors() at depth 10
- [ ] Measure getDescendants() with 100+ descendants
- [ ] Measure getBreadcrumbs() at depth 10
- [ ] Record results

### 4. Benchmark Page Rendering
- [ ] Measure page load time for Hub template
- [ ] Measure page load time for Article template
- [ ] Measure time to render 50+ child pages
- [ ] Measure time to render breadcrumbs at depth 10
- [ ] Record results

### 5. Identify Bottlenecks
- [ ] Analyze query execution plans (EXPLAIN ANALYZE)
- [ ] Identify N+1 query problems
- [ ] Identify missing indexes
- [ ] Identify slow queries (>100ms)
- [ ] Document findings

### 6. Optimize Queries
- [ ] Add indexes for slow queries
- [ ] Optimize N+1 queries (use joins)
- [ ] Add database views if needed
- [ ] Re-benchmark after optimizations
- [ ] Document improvements

### 7. Document Performance Metrics
- [ ] Create performance report
- [ ] Include before/after metrics
- [ ] Include recommendations for caching
- [ ] Include recommendations for future optimizations

---

## 🛠️ Technical Implementation

### Test Data Script
```sql
-- Generate 100 pages with realistic hierarchy
DO $$
DECLARE
  hub_id UUID;
  spoke_id UUID;
  sub_spoke_id UUID;
  i INTEGER;
BEGIN
  -- Create 5 hub pages (depth 0)
  FOR i IN 1..5 LOOP
    INSERT INTO pages (title, slug, full_path, template, status, content, description)
    VALUES (
      'Hub Page ' || i,
      'hub-' || i,
      '/hub-' || i,
      'hub',
      CASE WHEN i % 3 = 0 THEN 'draft' ELSE 'published' END,
      'Lorem ipsum dolor sit amet...',
      'Hub page description ' || i
    )
    RETURNING id INTO hub_id;
    
    -- Create 10 spoke pages per hub (depth 1)
    FOR j IN 1..10 LOOP
      INSERT INTO pages (title, slug, full_path, parent_id, template, status, content)
      VALUES (
        'Spoke Page ' || i || '-' || j,
        'spoke-' || i || '-' || j,
        '/hub-' || i || '/spoke-' || i || '-' || j,
        hub_id,
        'spoke',
        CASE WHEN j % 2 = 0 THEN 'published' ELSE 'draft' END,
        'Lorem ipsum dolor sit amet...'
      )
      RETURNING id INTO spoke_id;
      
      -- Create 2 sub-spoke pages per spoke (depth 2)
      FOR k IN 1..2 LOOP
        INSERT INTO pages (title, slug, full_path, parent_id, template, status, content)
        VALUES (
          'Sub-Spoke ' || i || '-' || j || '-' || k,
          'sub-spoke-' || i || '-' || j || '-' || k,
          '/hub-' || i || '/spoke-' || i || '-' || j || '/sub-spoke-' || i || '-' || j || '-' || k,
          spoke_id,
          'sub-spoke',
          'published',
          'Lorem ipsum dolor sit amet...'
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Total: 5 hubs + 50 spokes + 100 sub-spokes = 155 pages
```

### Benchmark Queries
```typescript
// Benchmark script
async function benchmarkQuery(name: string, fn: () => Promise<any>) {
  const start = performance.now()
  await fn()
  const end = performance.now()
  const duration = end - start
  
  console.log(`${name}: ${duration.toFixed(2)}ms`)
  
  return duration
}

// Run benchmarks
const results = {
  listPages: await benchmarkQuery('List Pages (100+)', () => 
    pageService.listPages({ limit: 50, offset: 0 })
  ),
  
  listPagesWithSearch: await benchmarkQuery('List Pages with Search', () =>
    pageService.listPages({ search: 'concrete', limit: 50 })
  ),
  
  getChildren: await benchmarkQuery('Get Children (50+)', () =>
    pageService.getChildren(hubId)
  ),
  
  getAncestors: await benchmarkQuery('Get Ancestors (depth 10)', () =>
    pageService.getAncestors(deepPageId)
  ),
  
  getBreadcrumbs: await benchmarkQuery('Get Breadcrumbs (depth 10)', () =>
    pageService.getBreadcrumbs(deepPageId)
  )
}

console.table(results)
```

### Query Optimization Example
```sql
-- Before: Slow query (N+1 problem)
SELECT * FROM pages WHERE parent_id = 'xxx';
-- Then for each page, fetch children...

-- After: Optimized with CTE
WITH RECURSIVE page_tree AS (
  SELECT *, 0 as depth
  FROM pages
  WHERE id = 'xxx'
  
  UNION ALL
  
  SELECT p.*, pt.depth + 1
  FROM pages p
  INNER JOIN page_tree pt ON p.parent_id = pt.id
  WHERE pt.depth < 10
)
SELECT * FROM page_tree;
```

---

## 📁 Files to Create

- `supabase/tests/generate_performance_test_data.sql` (~200 lines)
- `scripts/benchmark-queries.ts` (~150 lines)
- `docs/performance-report.md` (results documentation)

## 📁 Files to Modify

- `supabase/migrations/` (add indexes based on findings)
- `server/repositories/PageRepository.ts` (optimize queries)

---

## ✅ Deliverables

1. ✅ 100+ test pages created
2. ✅ Deep nesting (10+ levels) tested
3. ✅ All queries benchmarked
4. ✅ Bottlenecks identified
5. ✅ Optimizations implemented
6. ✅ Performance report documented

---

## 🧪 Testing Strategy

1. Run test data script → verify 100+ pages created
2. Run benchmark script → record baseline metrics
3. Identify slowest queries (>100ms)
4. Add indexes and optimize
5. Re-run benchmarks → verify improvements
6. Document before/after metrics

---

## 📊 Success Metrics

**Target Performance:**
- List pages (100+): <100ms
- Get children (50+): <50ms
- Get ancestors (depth 10): <30ms
- Get breadcrumbs (depth 10): <30ms
- Page render: <200ms

---

## 🚀 Next Steps

After completion, use findings to implement Batch 9 (Caching Strategy)

