# Phase 5 – Batch 4: Metadata & SEO

**Goal:** Add template‑specific metadata editing and a full SEO configuration section to the page form.

---

## 1. Summary

Batch 4 turns the create/edit page form into a complete metadata and SEO editor, with dynamic fields driven by template JSON schemas.

Key results:

- `TemplateMetadataFields.vue` – dynamic metadata form generator
- `useTemplateSchema.ts` – composable to fetch + normalize template schemas
- `SeoFieldsSection.vue` – expandable SEO configuration section
- Zod schemas for all SEO and social fields (35+ total form fields)

---

## 2. Template Metadata

**Implementation:**

- Templates (Hub, Spoke, Sub‑Spoke, Article, Custom, Default) define JSON schemas.
- `useTemplateSchema` maps these schemas into form field configs (type, label, help text).
- `TemplateMetadataFields` renders appropriate inputs (text, number, boolean, select, array, object) based on schema.

Outcome:

- Template‑specific fields (e.g. Hub columns, Spoke sidebar position) are generated dynamically.
- Form remains flexible for future template changes without schema rewrites in the UI.

---

## 3. SEO Fields Layout

SEO section is collapsed by default and split into logical groups:

- **Basic SEO:** Meta Title, Meta Description, Meta Keywords, Focus Keyword
- **Advanced SEO:** Canonical URL, Meta Robots, Sitemap Priority/Changefreq
- **Social:** Open Graph and Twitter Card fields
- **Schema.org:** Type selector (e.g. Article)

All inputs reuse shared UI components (`TextInput`, `FilterSelect`, etc.) for consistent size and spacing (e.g. `size="lg"` → `h-12`).

---

## 4. Validation & Architecture

- All SEO and metadata fields are validated via Zod schemas defined in `page-form.schema.ts`.
- Hybrid storage strategy:
  - Critical fields as columns
  - Extended SEO/social/schema data nested under `metadata.seo` JSONB.

**SeoFieldsSection refactor:**

- Original approach using `useField` and form context injection caused Zod context errors.
- Refactored to **props‑down/events‑up**:
  - Receives `values` and `errors` as props
  - Emits `update:field` events
- PageForm wires these props + events using `setFieldValue`.

Benefits:

- No nested `useField`/context issues
- Reusable, testable component structure
- Clear, predictable data flow

---

## 5. Files

**Created:**

- `app/composables/useTemplateSchema.ts`
- `app/components/admin/TemplateMetadataFields.vue`
- `app/components/admin/SeoFieldsSection.vue`

**Modified:**

- `app/schemas/admin/page-form.schema.ts` – added metadata + SEO schemas
- `app/components/admin/PageForm.vue` – integrated TemplateMetadataFields + SeoFieldsSection
- `app/pages/admin/pages/new.vue` – updated to use full `PageFormData`

---

## 6. Testing

Tests validated that:

- Template metadata fields appear and validate correctly for each template type.
- SEO sections expand/collapse correctly.
- All SEO fields bind through VeeValidate and map to the server schemas.
- Input sizing and spacing match design across all fields.

Further SEO behavior (database + frontend meta tags) is covered in Phase 5 testing docs and Batch 5 tests.

