# Phase 5: Admin UI – Overview

**Project:** Cost of Concrete – Admin Interface for Page Management
**Phase:** 5 – Admin UI (Pages CRUD + Layout)
**Status:** ✅ Complete (all batches delivered and tested)

---

## 1. Goals

Build a simple, WordPress‑style admin interface for managing content pages with:

- Page list with filters, search, pagination, and hierarchy indentation
- Create / Edit forms for all page fields (core, content, metadata, SEO)
- Archive / Delete / Unarchive workflows
- Admin layout with collapsible sidebar, breadcrumbs, and dark mode
- Full client + server validation, strong typing, and RLS‑aware API integration

Authentication and roles are re‑enabled in page API endpoints but **route‑level auth and proper RLS for admins** are deferred to the dedicated Auth phase.

---

## 2. Batches in Phase 5

Phase 5 is implemented through seven batches, each documented separately:

- **Batch 1 – Page List View** (`phase-5-batch-1-page-list-view.md`)
- **Batch 2 – Create Page: Core Fields** (`phase-5-batch-2-create-page-core-fields.md`)
- **Batch 3 – Content Editor (TipTap)** (`phase-5-batch-3-content-editor-tiptap.md`)
- **Batch 4 – Metadata & SEO** (`phase-5-batch-4-metadata-and-seo.md`)
- **Batch 5 – Submit & API Integration** (`phase-5-batch-5-submit-and-api-integration.md`)
- **Batch 6 – Edit, Archive, Delete, Unarchive** (`phase-5-batch-6-edit-archive-delete.md`)
- **Batch 7 – Admin Layout & Navigation** (`phase-5-batch-7-admin-layout-and-navigation.md`)

Testing procedures and results are consolidated in:

- **Phase 5 Testing Strategy & Results** (`phase-5-testing-strategy-and-results.md`)

For the original, fully detailed Phase 5 narrative (historical record), see:

- `docs/currently-working-on/admin-ui.md`

For the Auth/RLS work that extends this phase, see:

- `docs/admin-ui/phase-6-auth-and-rls-overview.md`

---

## 3. Architecture Decisions (Summarized)

### 3.1 UI Framework & Components

- **Framework:** Nuxt 4 (SSR for SEO) + Vue 3 Composition API
- **UI:** Reka UI + Tailwind CSS, mobile‑first with dark mode
- **Key reusable components:**
  - `Button.vue`, `Dialog.vue`, `Pagination.vue`, `Badge.vue`
  - `TextInput.vue`, `FilterSelect.vue` (form inputs)
  - `AdminPageList.vue`, `PageForm.vue`, `TipTapEditor.vue`
  - `TemplateMetadataFields.vue`, `SeoFieldsSection.vue`

### 3.2 Form Handling

- **VeeValidate + Zod** for strong typing and shared validation logic
- Parent form owns state via `useForm()`
- Child components follow **props‑down/events‑up** pattern
- Avoid `useField()` in deep children (caused Zod context issues in early iterations)

### 3.3 Content & SEO

- Content edited via **TipTap** (headless WYSIWYG) with StarterKit
- Template‑driven metadata via JSON schema → dynamic fields
- SEO implemented with a **hybrid strategy**:
  - Critical SEO fields as columns
  - Extended SEO/social/schema in `metadata.seo` JSONB
- Supports meta tags + Open Graph + Twitter Card; JSON‑LD schema wired but one rendering issue tracked as **BAM-24**

---

## 4. Technology Stack

- `nuxt` (v4)
- `reka-ui`
- `@vueuse/core`
- `zod`
- `consola`
- `@formkit/auto-animate`
- `vee-validate`, `@vee-validate/zod`
- `@tiptap/vue-3`, `@tiptap/starter-kit`, link + placeholder extensions

---

## 5. File Structure (High Level)

- `app/layouts/admin.vue` – Admin layout with sidebar + header + breadcrumbs
- `app/pages/admin/pages/index.vue` – Page list
- `app/pages/admin/pages/new.vue` – Create page
- `app/pages/admin/pages/[id]/edit.vue` – Edit/archive/delete/unarchive page
- `app/components/admin/*` – Admin UI components (sidebar, list, form, editor, metadata, SEO)
- `app/components/ui/form/*` – Shared form components
- `app/composables/useAdminPages.ts` – Admin CRUD & data fetching
- `app/composables/useTemplateSchema.ts` – Template schema utilities
- `app/schemas/admin/page-form.schema.ts` – Zod schemas for all 35 fields
- `server/api/pages/*` – Page CRUD endpoints

---

## 6. Success Criteria (Phase 5)

Phase 5 is considered successful when:

1. Admin can view all pages with filters, search, and correct hierarchy.
2. Admin can create, edit, archive, delete, and unarchive pages.
3. All forms use shared validation (client + server) with inline errors.
4. SEO and metadata fields are persisted and rendered correctly (except known JSON‑LD issue BAM-24).
5. Admin layout with collapsible sidebar, breadcrumbs, and dark mode is applied to all `/admin/pages/*` routes.
6. Tests in `phase-5-testing-strategy-and-results.md` and `docs/tests/batch-5-testing-procedures.md` are passing.

