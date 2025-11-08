# Batch 1: Core Routing & Default Template - Testing Guide

**Date:** 2025-11-08  
**Status:** ✅ Implementation Complete - Ready for Testing

---

## 📋 What Was Implemented

### **1. Dependencies**
- ✅ Installed `marked` library for markdown rendering

### **2. Composables** (3 files)
- ✅ `app/composables/useMarkdown.ts` - Markdown rendering with sanitization
- ✅ `app/composables/usePageSeo.ts` - SEO meta tags generation
- ✅ `app/composables/usePage.ts` - Page data fetching with error handling

### **3. Template Components** (1 file)
- ✅ `app/components/templates/DefaultTemplate.vue` - Minimal fallback template

### **4. Pages** (1 file)
- ✅ `app/pages/[...slug].vue` - Catch-all route with dynamic template loading

### **5. Configuration**
- ✅ Updated `nuxt.config.ts` with runtime config for SEO

### **6. Test Data**
- ✅ Created `supabase/tests/test_phase4_routing.sql` with 3 test pages

---

## 🧪 Testing Steps

### **Step 1: Insert Test Data**

1. Open Supabase SQL Editor or connect via psql
2. Run the test script:
   ```sql
   -- Copy and paste contents of supabase/tests/test_phase4_routing.sql
   ```
3. Verify 3 test pages were created:
   - `/test-default` (depth 0, default template)
   - `/test-hub` (depth 0, hub template - fallback to default)
   - `/test-hub/test-spoke` (depth 1, spoke template - fallback to default)

### **Step 2: Start Development Server**

```powershell
pnpm dev
```

Server should start on `http://localhost:3019`

### **Step 3: Test Default Template Page**

**URL:** `http://localhost:3019/test-default`

**Expected Results:**
- ✅ Page loads without errors
- ✅ Title displays: "Test Default Template Page"
- ✅ Description displays below title
- ✅ Markdown content renders with proper formatting:
  - Headings (H1, H2, H3)
  - Bold and italic text
  - Lists (bulleted)
  - Links
  - Code blocks
- ✅ Published date displays
- ✅ No breadcrumbs (depth 0 page)
- ✅ Clean, styled layout with light/dark mode support

### **Step 4: Test Hub Template Page (Fallback)**

**URL:** `http://localhost:3019/test-hub`

**Expected Results:**
- ✅ Page loads without errors
- ✅ Renders with DefaultTemplate (fallback)
- ✅ Title displays: "Test Hub Template Page"
- ✅ Markdown content renders correctly
- ✅ Console log shows: `template: 'hub'` but renders DefaultTemplate

### **Step 5: Test Spoke Template Page (Child)**

**URL:** `http://localhost:3019/test-hub/test-spoke`

**Expected Results:**
- ✅ Page loads without errors
- ✅ Renders with DefaultTemplate (fallback)
- ✅ Title displays: "Test Spoke Template Page"
- ✅ **Breadcrumbs display** at top of page:
  - Should show navigation path
  - Links should be clickable
- ✅ Markdown content renders correctly
- ✅ Parent-child relationship working

### **Step 6: Test 404 Error Handling**

**URL:** `http://localhost:3019/non-existent-page`

**Expected Results:**
- ✅ 404 error page displays
- ✅ Error message: "Page Not Found"
- ✅ No console errors (expected 404)

**Note:** Custom 404 page will be created in Batch 6

### **Step 7: Test SEO Meta Tags**

**For any test page:**

1. Right-click → "View Page Source" (or `Ctrl+U`)
2. Search for meta tags in the `<head>` section

**Expected Meta Tags:**
```html
<!-- Basic SEO -->
<title>Test Default Template - Phase 4 Routing</title>
<meta name="description" content="This is a test page...">
<meta name="keywords" content="test, default template, phase 4, routing">
<meta name="robots" content="index, follow">

<!-- Canonical URL -->
<link rel="canonical" href="https://costofconcrete.com/test-default">

<!-- Open Graph -->
<meta property="og:title" content="Test Default Template Page">
<meta property="og:description" content="Testing Phase 4 dynamic routing...">
<meta property="og:type" content="website">
<meta property="og:url" content="https://costofconcrete.com/test-default">
<meta property="og:site_name" content="Cost of Concrete">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Test Default Template Page">
<meta name="twitter:description" content="Testing Phase 4 dynamic routing">

<!-- Schema.org JSON-LD -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Test Default Template Page",
  "description": "Testing Phase 4 dynamic routing with default template"
}
</script>
```

### **Step 8: Test Loading States**

1. Open browser DevTools → Network tab
2. Throttle network to "Slow 3G"
3. Navigate to `/test-default`

**Expected Results:**
- ✅ Loading skeleton displays while fetching
- ✅ Smooth transition to content when loaded
- ✅ No layout shift or flash of unstyled content

### **Step 9: Test Dark Mode**

1. Toggle dark mode (if you have a theme switcher)
2. Or manually add `dark` class to `<html>` element

**Expected Results:**
- ✅ Background changes to dark
- ✅ Text colors invert properly
- ✅ All elements readable in dark mode
- ✅ Proper contrast maintained

### **Step 10: Test SSR (Server-Side Rendering)**

1. Disable JavaScript in browser:
   - Chrome: DevTools → Settings → Debugger → Disable JavaScript
   - Firefox: about:config → javascript.enabled → false
2. Navigate to `/test-default`

**Expected Results:**
- ✅ Page still renders (content visible)
- ✅ Markdown content displays
- ✅ SEO meta tags present in source
- ✅ No JavaScript errors (since JS is disabled)

---

## ✅ Success Criteria

- [ ] All 3 test pages load without errors
- [ ] Markdown renders correctly with proper formatting
- [ ] Breadcrumbs display on child pages
- [ ] SEO meta tags present in page source
- [ ] 404 error displays for non-existent pages
- [ ] Loading states work correctly
- [ ] Dark mode works correctly
- [ ] SSR works (content visible without JavaScript)
- [ ] No console errors in development
- [ ] Dynamic template selection works (fallback to DefaultTemplate)

---

## 🐛 Common Issues & Solutions

### **Issue: Page not found (404)**
**Solution:** Verify test data was inserted correctly. Run the SQL script again.

### **Issue: Markdown not rendering**
**Solution:** Check browser console for errors. Verify `marked` library is installed.

### **Issue: SEO meta tags missing**
**Solution:** Check `nuxt.config.ts` has `runtimeConfig` with `siteUrl` and `siteName`.

### **Issue: Breadcrumbs not showing**
**Solution:** Breadcrumbs only show on child pages (depth > 0). Try `/test-hub/test-spoke`.

### **Issue: Dark mode not working**
**Solution:** Verify `@nuxtjs/color-mode` module is installed and configured.

---

## 📊 Next Steps

After all tests pass:

1. Mark Batch 1 tasks as complete
2. Proceed to **Batch 2: SEO & Breadcrumbs**
   - Create proper Breadcrumbs component
   - Enhance SEO meta tags
   - Test breadcrumb navigation

---

**Last Updated:** 2025-11-08  
**Tested By:** [Your Name]  
**Status:** [ ] All Tests Passed

