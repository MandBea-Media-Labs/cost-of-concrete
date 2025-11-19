# Phase 5 – Batch 7: Admin Layout & Navigation

**Goal:** Introduce a shared admin layout with collapsible sidebar, breadcrumbs, and dark‑mode aware navigation for all admin pages.

---

## 1. Summary

Batch 7 completes the admin UX by providing a consistent layout and navigation experience across `/admin/*` routes.

Key outcomes:

- `app/layouts/admin.vue` admin layout
- `AdminSidebar.vue` – collapsible sidebar (desktop) + drawer (mobile)
- `AdminBreadcrumbs.vue` – breadcrumbs derived from route path
- Admin layout applied to all relevant admin pages
- Dark mode toggle in header

Authentication was also **re‑enabled** in all page API endpoints as part of this batch.

---

## 2. Layout & Components

### 2.1 Admin Layout (`admin.vue`)

- Provides a standard frame for all admin routes (header + sidebar + content area).
- Uses mobile‑first responsive design:
  - On mobile: sidebar becomes a drawer
  - On desktop: collapsible sidebar
- Integrates dark mode toggle in header.

### 2.2 Sidebar (`AdminSidebar.vue`)

- Contains navigation items such as:
  - Dashboard (placeholder)
  - Pages (`/admin/pages`)
  - Settings (placeholder)
- Supports expand/collapse state, persisted in component state.

### 2.3 Breadcrumbs (`AdminBreadcrumbs.vue`)

- Auto‑generates breadcrumb trail based on current route path segments.
- Used on admin pages for context (e.g. `Admin / Pages / Edit`).

---

## 3. Integration

- Layout applied to:
  - `/admin/pages/index.vue`
  - `/admin/pages/new.vue`
  - `/admin/pages/[id]/edit.vue`
- Verified that existing form behavior (validation, submission, messages) remains intact under the new layout.

---

## 4. Files

**Created:**

- `app/layouts/admin.vue`
- `app/components/admin/AdminSidebar.vue`
- `app/components/admin/AdminBreadcrumbs.vue`

**Modified:**

- `app/pages/admin/pages/index.vue` – wrapped with admin layout
- `app/pages/admin/pages/new.vue` – wrapped with admin layout
- `app/pages/admin/pages/[id]/edit.vue` – wrapped with admin layout
- `server/api/pages/[id].get.ts` – auth optionally enforced for GET
- `server/api/pages/[id].patch.ts` – auth required for updates
- `server/api/pages/[id].delete.ts` – auth required for deletes

---

## 5. Testing

Manual testing via Playwright MCP verified:

- Layout renders correctly across all admin pages
- Sidebar collapse/expand behavior on desktop
- Drawer open/close behavior on mobile
- Breadcrumbs accurately reflect route hierarchy
- Dark mode toggle works without impacting existing page UI
- All existing form flows (create, edit, archive/delete/unarchive) remain functional

All checks passed; Phase 5 UI is considered feature‑complete and is now being extended in the dedicated Auth/RLS phase (see `phase-6-auth-and-rls-overview.md`).

