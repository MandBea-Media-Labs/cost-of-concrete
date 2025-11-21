# Phase 5 – Batch 1: Page List View

**Goal:** Implement a WordPress‑style page list with hierarchy, filters, search, and pagination for admin users.

---

## 1. Summary

- Flat list with indentation based on page depth (`depth × 20px`)
- Columns: Title, Slug, Template, Status, Last Modified, Actions
- Filters: Status + Template
- Search: Title, slug, and `full_path`
- Pagination: 50 items per page
- Quick actions: View, Edit, Delete
- Fully responsive with dark mode support

Batch 1 establishes the core admin listing UX used in later batches.

---

## 2. Key Tasks (Completed)

- Created **seed data** script (25 test pages – not strictly required now, original 13 pages were enough)
- Built **TextInput** component for search and general form usage
- Implemented **useAdminPages** composable for list fetching + filters + pagination
- Implemented **AdminPageList** component (table rendering, indentation, badges, actions)
- Implemented `/admin/pages/index.vue` route
- Wired up filters:
  - Status: All, Draft, Published, Archived
  - Template: Hub, Spoke, Sub-Spoke, Article, Custom, Default
- Implemented search box (title/slug/full_path)
- Implemented pagination (50 per page by default)
- Connected quick actions: Edit, View, Delete
- Applied Tailwind styling with dark mode + responsive layout
- Fixed hierarchical sorting using `full_path`
- Fixed RLS policies for admin access during this phase

---

## 3. Files

**Created:**

- `app/components/admin/AdminPageList.vue`
- `app/pages/admin/pages/index.vue`
- `app/components/ui/form/TextInput.vue`
- `app/composables/useAdminPages.ts`
- `supabase/tests/seed_admin_test_data.sql`

**Modified:**

- `server/schemas/page.schemas.ts` – Added `full_path` to orderBy enum
- `supabase/migrations/*` – Temporary RLS policy for admin development

---

## 4. Behavior & UX Notes

- Pages are ordered by `full_path` ascending for stable hierarchy.
- Indentation and chevron icons clearly show parent/child relationships.
- Status badges:
  - Published → green
  - Draft → yellow
  - Archived → gray
- Template badges:
  - Hub → blue
  - Spoke → purple
  - Sub-Spoke → pink
  - Article → orange
- Delete action opens a confirmation dialog using the shared `Dialog` component.

---

## 5. Testing

See `phase-5-testing-strategy-and-results.md` and `docs/currently-working-on/admin-ui.md` for detailed test notes.

Core checks for Batch 1:

- Component renders correctly in light/dark mode
- Filters work and combine correctly
- Search works across title, slug, and full_path
- Pagination works and preserves filters/search
- Quick actions fire appropriate events and routes
- Chevron and indentation logic reflect page hierarchy

All Batch 1 tests were completed successfully.

