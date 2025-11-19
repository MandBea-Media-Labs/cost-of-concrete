# Phase 5 – Batch 6: Edit, Archive, Delete, Unarchive

**Goal:** Enable editing existing pages and managing lifecycle actions (archive, soft delete, unarchive) from the admin UI.

---

## 1. Summary

Batch 6 is split conceptually into:

- **Batch 6A – Edit Page Form**
- **Batch 6B – Archive, Delete & Unarchive Functionality**

Combined, they deliver a robust edit screen at `/admin/pages/[id]/edit` with:

- Full form pre‑population for all 35+ fields
- PATCH integration with `/api/pages/[id]`
- Change detection warnings (slug, parent, template)
- Archive with cascade to descendants
- Soft delete for leaf pages
- Unarchive (restore to draft)

---

## 2. Edit Page (6A)

Features:

- New route: `app/pages/admin/pages/[id]/edit.vue`
- Reuse of `PageForm.vue` with `mode="edit"`
- Fetching page data from `GET /api/pages/[id]` using `$fetch` (replacing `useFetch` for reliability in Nuxt 4)
- Mapping API response → form values, including SEO + `metadata.seo`
- PATCH submission to `/api/pages/[id]` with same error handling patterns as create
- Inline warnings when:
  - Slug changes (SEO impact + descendant URLs)
  - Parent changes (hierarchy & descendants)
  - Template changes (metadata compatibility)
- Auto‑slug generation **disabled** in edit mode to respect existing slugs

---

## 3. Archive/Delete/Unarchive (6B)

Smart button logic based on page state and children:

- Non‑archived pages **with children** → show **Archive** button
- Non‑archived pages **without children** → show **Delete** button (soft delete)
- Archived pages → show **Unarchive** button

Supporting behavior:

- `GET /api/pages/[id]/children` endpoint used to compute children count.
- Archive:
  - Uses PATCH with `status: 'archived'`
  - Cascades to descendants automatically
  - Confirmation dialog shows children count and impact
- Delete:
  - Uses DELETE endpoint (soft delete via `deleted_at` timestamp)
  - Only available when there are no children
  - Confirmation dialog emphasizes permanence
- Unarchive:
  - Uses PATCH with `status: 'draft'` (for now)
  - Restores page from archived state

All three actions show success messages and redirect back to the page list.

---

## 4. Files

**Created:**

- `app/pages/admin/pages/[id]/edit.vue`
- `tests/batch-6a-edit-page.spec.ts` (not actively used but available)

**Modified:**

- `app/components/admin/PageForm.vue` – edit mode support, change detection, warnings
- `app/pages/admin/pages/[id]/edit.vue` – data fetching, action handlers, integration with admin layout
- `server/api/pages/[id].get.ts` – auth hooks (temporarily disabled during development, re‑enabled in Batch 7)
- `server/api/pages/[id].patch.ts` – auth enforcement for updates
- `server/api/pages/[id].delete.ts` – auth enforcement for soft deletes

---

## 5. Testing

Manual tests (via Playwright MCP) covered:

- Edit flow with minimal and full SEO data
- Correct pre‑population of all fields
- Warnings for slug/parent/template changes
- Archive behavior on a page with 1+ children
- Unarchive behavior
- Delete behavior on a childless page
- Correct button visibility per state (archive vs delete vs unarchive)

All tests passed with no TypeScript or build errors.

