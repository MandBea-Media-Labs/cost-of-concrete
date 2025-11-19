# Phase 7 - Batch 2: JSON-LD Schema.org Fix

**Priority:** 1 (Critical UX Improvement)
**Status:** 🔜 Not Started
**Effort:** 1-2 hours
**Linear Ticket:** BAM-24

---

## 🎯 Goal

Fix JSON-LD Schema.org structured data rendering on frontend pages. Data is saved correctly in database but not rendering in `<script type="application/ld+json">` tags.

---

## 📋 Current State

**Problem:**
- Schema.org data saved correctly in `metadata.seo.schema` field
- `usePageSeo` composable reads the data
- But `<script type="application/ld+json">` tag is empty in page source
- Affects SEO completeness (15/16 SEO fields working)

**Example (Current Issue):**
```html
<!-- Expected -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Pour Concrete",
  "author": { "@type": "Person", "name": "John Doe" }
}
</script>

<!-- Actual -->
<script type="application/ld+json"></script>
```

---

## 🎯 Objectives

1. Fix `usePageSeo` composable to properly generate JSON-LD
2. Ensure all Schema.org types render correctly (Article, HowTo, FAQ, LocalBusiness)
3. Validate JSON-LD structure
4. Test on all templates
5. Verify in page source and Google Rich Results Test

---

## 📦 Tasks

### 1. Investigate Root Cause
- [ ] Review `app/composables/usePageSeo.ts` (lines 80-98)
- [ ] Check how `schemaOrgData` is computed
- [ ] Verify `metadata.seo.schema` data structure
- [ ] Check if data is reactive
- [ ] Identify why JSON-LD is not rendering

### 2. Fix usePageSeo Composable
- [ ] Update `schemaOrgData` computed property
- [ ] Ensure proper JSON stringification
- [ ] Handle all schema types (Article, HowTo, FAQ, LocalBusiness)
- [ ] Add default values for required fields
- [ ] Validate schema structure

### 3. Update Head Management
- [ ] Verify `useHead` call includes script tag
- [ ] Ensure proper script type (`application/ld+json`)
- [ ] Check SSR compatibility
- [ ] Validate JSON escaping

### 4. Testing
- [ ] Test Article schema (stamped-concrete-guide page)
- [ ] Test HowTo schema (if exists)
- [ ] Test FAQ schema (if exists)
- [ ] Test LocalBusiness schema (if exists)
- [ ] Verify in page source (View Source)
- [ ] Test with Google Rich Results Test
- [ ] Test SSR vs client-side rendering

---

## 🛠️ Technical Implementation

### Expected Schema.org Structure

**Article:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "description": "Page description",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-01-01",
  "dateModified": "2025-01-15"
}
```

**HowTo:**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Pour Concrete",
  "description": "Step-by-step guide",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Step 1",
      "text": "Prepare the area"
    }
  ]
}
```

### Fix in usePageSeo.ts

**Current (Broken):**
```typescript
const schemaOrgData = computed(() => {
  if (!page.value?.metadata?.seo?.schema) return null
  return page.value.metadata.seo.schema
})
```

**Fixed (Example):**
```typescript
const schemaOrgData = computed(() => {
  if (!page.value?.metadata?.seo?.schema) return null
  
  const schema = page.value.metadata.seo.schema
  
  // Ensure required fields
  return {
    '@context': 'https://schema.org',
    '@type': schema.type || 'Article',
    ...schema,
    // Add defaults for required fields
    headline: schema.headline || page.value.title,
    description: schema.description || page.value.description
  }
})

// In useHead call
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(schemaOrgData.value)
    }
  ]
})
```

---

## 📁 Files to Modify

- `app/composables/usePageSeo.ts` (fix schemaOrgData computation and useHead call)

---

## ✅ Deliverables

1. ✅ JSON-LD Schema.org renders in page source
2. ✅ All schema types supported (Article, HowTo, FAQ, LocalBusiness)
3. ✅ Validates in Google Rich Results Test
4. ✅ Works with SSR
5. ✅ All 16/16 SEO fields working

---

## 🧪 Testing Strategy

**Manual Testing:**
1. Navigate to `/stamped-concrete-guide` (Article schema)
2. View page source (Ctrl+U)
3. Search for `application/ld+json`
4. Verify JSON-LD is present and valid
5. Copy JSON-LD and validate at https://validator.schema.org/
6. Test with Google Rich Results Test: https://search.google.com/test/rich-results
7. Repeat for other schema types

**Automated Testing:**
- Add test to verify JSON-LD is in page source
- Validate JSON structure
- Check all required fields present

---

## 📊 Success Metrics

- ✅ JSON-LD renders in page source
- ✅ Validates with schema.org validator
- ✅ Passes Google Rich Results Test
- ✅ All schema types working
- ✅ No console errors
- ✅ SEO score: 16/16 fields working

---

## 🚀 Next Steps

After completion:
1. Close Linear ticket BAM-24
2. Update SEO testing documentation
3. Verify all test pages have correct schema
4. Proceed to Priority 2 (Batch 3 - Page Reordering)

