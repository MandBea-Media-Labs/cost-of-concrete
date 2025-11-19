# Phase 5 – Batch 5: Submit & API Integration

**Goal:** Wire the create page form to real API endpoints with full error handling, loading states, and success feedback.

---

## 1. Summary

Batch 5 connects `PageForm` to `POST /api/pages` and makes page creation fully functional end‑to‑end.

Key outcomes:

- Real API call to `POST /api/pages`
- Mapping from `PageFormData` (35+ fields) to `CreatePageInput` server schema
- Comprehensive error handling for validation, conflict, auth, and server errors
- Robust loading states and success/error messaging
- Verified hybrid SEO persistence (columns + `metadata.seo` JSONB)

---

## 2. Behavior

On submit:

1. Run client‑side validation via VeeValidate + Zod.
2. If valid, send `POST /api/pages` request with mapped payload.
3. Disable form + buttons and show loading state while awaiting response.
4. On success:
   - Redirect to `/admin/pages?created=1` (or similar flag)
   - Show success message on list page and auto‑dismiss after 5 seconds
5. On error:
   - Display field‑specific messages for 400 validation errors
   - Show a top‑level error banner for 409 conflict (duplicate slug) and other failures
   - Re‑enable form for user corrections

---

## 3. Error Handling

Handled scenarios:

- **400 – Validation errors (Zod):**
  - Inline field errors shown under corresponding inputs.
- **409 – Conflict (slug already exists):**
  - Top banner error: "A page with this slug already exists under the selected parent."
- **401 / 403 – Auth errors:**
  - Generic "You do not have permission" style messaging (admin‑only context).
- **500 – Server errors:**
  - Generic error message to avoid leaking internals.

All cases use `consola` for dev logging while keeping user‑facing messages clean.

---

## 4. Files

**Modified:**

- `app/pages/admin/pages/new.vue` – form submit handler + API integration
- `app/pages/admin/pages/index.vue` – success message display and auto‑dismiss
- `docs/currently-working-on/admin-ui.md` – updated narrative for Batch 5

Server side:

- `server/api/pages/index.post.ts` – updated to accept and validate full SEO + metadata payload
- `server/services/PageService.ts` – transforms SEO fields into `metadata.seo` structure
- `server/schemas/page.schemas.ts` – extended with all 16 SEO fields

---

## 5. SEO Fix & Hybrid Storage

- Updated server schema and PageService to support all 16 SEO fields.
- Adopted hybrid storage:
  - Core SEO columns (e.g., `meta_title`, `description`, `canonical_url`, etc.) for direct querying.
  - Additional SEO/social/schema data under `metadata.seo` JSONB.
- Confirmed `usePageSeo` reads from `metadata.seo` correctly.

Known issue (tracked):

- JSON‑LD Schema.org markup is saved correctly but not rendered on frontend (**BAM-24**).

---

## 6. Testing

Detailed scenarios are captured in `docs/tests/batch-5-testing-procedures.md`:

- Test 1–7: Manual flows for draft/published creation, validation, slug behavior, template metadata
- Test 8: SEO fields submission and frontend verification (15/16 SEO fields rendered correctly)
- Test 9: Loading states and disabled form during submission
- Test 10: Cancel button behavior
- Test 11–12: Success and error message dismissal behavior

All 12 tests passed (with one minor JSON‑LD rendering issue logged separately).
