# Phase 7 - Batch 1: Toast Notifications

**Priority:** 1 (Critical UX Improvement)
**Status:** 🔜 Not Started
**Effort:** 2-3 hours
**Linear Ticket:** BAM-22

---

## 🎯 Goal

Replace query parameter success messages with a proper toast notification system for better user feedback across the admin interface.

---

## 📋 Current State

**Problem:**
- Success messages use query parameters (`?created=true`, `?updated=true`)
- No error toast notifications
- Inconsistent user feedback
- Query parameters pollute URL history

**Example (Current):**
```typescript
// app/pages/admin/pages/new.vue
router.push({
  path: '/admin/pages',
  query: { created: 'true' }
})
```

---

## 🎯 Objectives

1. Create reusable Toast component using Reka UI
2. Create useToast composable for global toast management
3. Replace all query parameter messages with toasts
4. Support multiple toast types (success, error, warning, info)
5. Auto-dismiss with configurable duration
6. Stack multiple toasts
7. Accessible (ARIA labels, keyboard navigation)

---

## 📦 Tasks

### 1. Create Toast Component
- [ ] Create `app/components/ui/Toast.vue` using Reka UI Toast primitive
- [ ] Support 4 types: success (green), error (red), warning (yellow), info (blue)
- [ ] Add icon for each type (checkmark, X, warning, info)
- [ ] Add close button
- [ ] Add auto-dismiss timer with progress bar
- [ ] Style with Tailwind + dark mode
- [ ] Add slide-in animation
- [ ] Make responsive (mobile-friendly)

### 2. Create useToast Composable
- [ ] Create `app/composables/useToast.ts`
- [ ] Implement toast queue management
- [ ] Add methods: `success()`, `error()`, `warning()`, `info()`
- [ ] Support custom duration (default: 5000ms)
- [ ] Support custom actions (optional button)
- [ ] Limit max toasts (default: 3)
- [ ] Auto-remove oldest when limit reached

### 3. Create ToastContainer Component
- [ ] Create `app/components/ui/ToastContainer.vue`
- [ ] Position: fixed bottom-right (desktop) or top-center (mobile)
- [ ] Stack toasts vertically with gap
- [ ] Add to admin layout

### 4. Replace Query Parameter Messages
- [ ] Update `app/pages/admin/pages/new.vue` (create success)
- [ ] Update `app/pages/admin/pages/[id]/edit.vue` (update, archive, delete success)
- [ ] Update `app/pages/admin/pages/index.vue` (remove query param handling)
- [ ] Add error toasts for API failures

### 5. Testing
- [ ] Test all toast types render correctly
- [ ] Test auto-dismiss works
- [ ] Test manual dismiss works
- [ ] Test multiple toasts stack correctly
- [ ] Test max toast limit
- [ ] Test dark mode styling
- [ ] Test mobile responsiveness
- [ ] Test accessibility (screen reader, keyboard)

---

## 🛠️ Technical Implementation

### Toast Component Props
```typescript
interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // milliseconds
  action?: {
    label: string
    onClick: () => void
  }
}
```

### useToast Composable API
```typescript
const toast = useToast()

// Simple usage
toast.success('Page created successfully!')
toast.error('Failed to save page')

// With options
toast.success('Page published!', {
  duration: 3000,
  action: {
    label: 'View',
    onClick: () => router.push('/page-url')
  }
})
```

---

## 📁 Files to Create

- `app/components/ui/Toast.vue` (~150 lines)
- `app/components/ui/ToastContainer.vue` (~80 lines)
- `app/composables/useToast.ts` (~120 lines)

## 📁 Files to Modify

- `app/layouts/admin.vue` (add ToastContainer)
- `app/pages/admin/pages/new.vue` (replace query param with toast)
- `app/pages/admin/pages/[id]/edit.vue` (replace query param with toast)
- `app/pages/admin/pages/index.vue` (remove query param handling)

---

## ✅ Deliverables

1. ✅ Reusable Toast component with 4 types
2. ✅ Global toast management via useToast composable
3. ✅ All success/error messages use toasts
4. ✅ No more query parameter pollution
5. ✅ Accessible and mobile-friendly
6. ✅ Dark mode support

---

## 🧪 Testing Strategy

**Manual Testing:**
1. Create a page → verify success toast appears
2. Edit a page → verify update toast appears
3. Archive a page → verify archive toast appears
4. Delete a page → verify delete toast appears
5. Trigger API error → verify error toast appears
6. Create multiple toasts → verify stacking works
7. Wait for auto-dismiss → verify toast disappears
8. Click close button → verify toast dismisses immediately

**Accessibility Testing:**
- Screen reader announces toast messages
- Keyboard navigation works (Tab to close button, Enter to dismiss)
- Focus management (doesn't trap focus)

---

## 📊 Success Metrics

- ✅ Zero query parameters in URL after actions
- ✅ All success/error messages use toasts
- ✅ Toast auto-dismisses after 5 seconds
- ✅ Multiple toasts stack without overlap
- ✅ Accessible to screen readers
- ✅ Works on mobile and desktop

---

## 🚀 Next Steps

After completion:
1. Close Linear ticket BAM-22
2. Update documentation
3. Proceed to Batch 2 (JSON-LD Schema Fix)

