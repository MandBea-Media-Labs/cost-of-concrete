# Phase 5 – Batch 2: Create Page – Core Fields

**Goal:** Build the create page form with all core fields and client‑side validation.

---

## 1. Summary

Batch 2 introduces a reusable `PageForm` component and form schemas that will be reused throughout Phase 5.

Core achievements:

- Reusable `PageForm.vue` for create/edit
- Zod schemas for all core fields
- VeeValidate integration with inline errors
- Auto‑slug generation from title + manual override detection
- Parent page, template, and status dropdowns
- Tailwind + dark mode styling and responsive layout

---

## 2. Core Fields

Implemented fields:

- **Title** – text input (required)
- **Slug** – text input with format validation + auto‑generated from title
- **Parent Page** – nullable dropdown with hierarchical indentation
- **Template** – dropdown with human‑friendly labels and descriptions
- **Status** – Draft / Published / Archived
- **Description** – textarea for short summary

All fields show inline validation errors and required indicators where appropriate.

---

## 3. Validation Strategy

- **Client‑side:** VeeValidate + Zod (`page-form.schema.ts`)
- Validation triggers:
  - On blur + on submit
- Slug rules (applied both client + server later):
  - Lowercase letters, numbers, and hyphens only
  - No leading/trailing hyphens
  - No double hyphens

Auto‑slug:

- Title → slug transformation (`"My Page Title" → "my-page-title"`)
- Once user manually edits slug, auto‑generation stops to avoid overriding user input.

---

## 4. Files

**Created:**

- `app/schemas/admin/page-form.schema.ts`
- `app/components/admin/PageForm.vue`
- `app/pages/admin/pages/new.vue`

**Modified:**

- Minor change in `app/pages/admin/pages/new.vue` to replace `console.log` with `consola.log` for dev logging.

---

## 5. UX & Implementation Notes

- Parent page options are fetched via `useAdminPages` to stay DRY with the list view.
- Parent dropdown shows indentation for hierarchy (2 spaces per depth level).
- Required fields use clear asterisk indicators and helper text.
- Buttons:
  - **Cancel** – navigates back to `/admin/pages`
  - **Create Page** – submits form with loading spinner and disabled state
- Uses Composition API and strongly typed schemas for maintainability.

---

## 6. Testing

Core tests for Batch 2:

- Form renders with all core fields
- Client‑side validation blocks submission for missing required fields
- Auto‑slug generation and manual override behavior works as expected
- Parent dropdown populated with all pages and shows correct indentation
- Dark mode and responsiveness verified on mobile/tablet/desktop

Detailed test results are documented in:

- `docs/tests/batch-5-testing-procedures.md` (where Batch 2 behavior is reused)
- `docs/currently-working-on/admin-ui.md` (historical notes)

