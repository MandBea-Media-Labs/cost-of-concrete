# Phase 6: Admin Auth & RLS – Overview

**Project:** Cost of Concrete – Admin Interface for Page Management
**Phase:** 6 – Admin Auth & RLS
**Status:** ✅ Complete (All 5 batches delivered and tested)

---

## 1. Goals

Phase 6 builds on the Phase 5 Admin UI by adding **secure authentication** and **tight Supabase RLS** for admin operations. The main goals are:

- Provide a dedicated **admin login** flow at `/admin/login` using Supabase email+password auth.
- Introduce an explicit **admin role** via `account_profiles.account_type = 'admin'` (and computed `account_profiles.is_admin`).
- Harden RLS on `pages` so **only admins can manage pages**; public users only see published pages.
- Ensure that `/server/api/pages/*` **is not an open public API** – it should be callable only by authenticated/admin users (or the service role).
- Add clear **login entry** (header Login buttons) and **logout control** in the admin layout.

This phase is implemented in several small batches to stay testable.

---

## 2. Batches in Phase 6

Planned batches for Phase 6:

1. **Batch 1 – Schema & RLS Foundations** ✅
   - Create `account_profiles` table (initially `user_profiles`) with `is_admin` flag.
   - Tighten RLS on `pages` so only admins can select/insert/update/delete.
   - Keep the existing public policy for viewing published pages.

2. **Batch 2 – Login UI & Basic Flows** ✅
   - Add `/admin/login` page using shared UI components and Supabase auth.
   - Wire public header "Login" buttons (desktop + mobile) to `/admin/login`.
   - Add an admin **Logout** button in the admin layout header.

3. **Batch 3 – Route Protection & 403 Page** ✅
   - Global middleware protects all `/admin/*` routes via `app/middleware/admin-auth.global.ts` using an isomorphic (server + client) guard.
   - On the **server**, `getAuthUserAndIsAdmin(event)` (in `server/utils/auth.ts`) resolves the current user and admin flag from Supabase to keep SSR output aligned with client-side behavior.
   - Unauthenticated users are redirected to `/admin/login?redirect=...` both on SSR and SPA navigations.
   - Authenticated non-admin users receive a 403 handled by the global `app/error.vue` page using `account_profiles.is_admin`.
   - Verified via Playwright MCP: logged-out users hitting `/admin/pages` are redirected to the login page and admins land on `/admin/pages` with no hydration mismatches or console errors.

4. **Batch 4 – API Admin Enforcement** ✅
   - `requireAdmin` helper on the server side using `account_profiles.is_admin` / `account_type`.
   - Apply admin checks to `server/api/pages/*` endpoints.
   - All admin-only API endpoints now protected (GET, POST, PATCH, DELETE).

5. **Batch 5 – Auth & RLS Testing** ✅
   - Extended Playwright tests for API-level access control.
   - Fixed RLS enforcement on `pages` table.
   - Added public read policy for published pages only.
   - All tests passing (unauthenticated users receive 401, public users can view published pages).

---

## 3. Data Model & RLS

### 3.1 `account_profiles` table

Defined in:

- `supabase/migrations/20251119090000_add_user_profiles_and_pages_admin_rls.sql` (original creation as `user_profiles`).
- `supabase/migrations/20251119120000_rename_user_profiles_to_account_profiles.sql` (rename + account types + metadata + computed `is_admin`).

- **Table:** `account_profiles`
- **Primary key / FK:** `id UUID` → `auth.users(id)` (ON DELETE CASCADE).
- **Columns:**
  - `account_type TEXT NOT NULL DEFAULT 'business'` – current account type (`'admin'` or `'business'` for now).
  - `is_admin BOOLEAN GENERATED ALWAYS AS (account_type = 'admin') STORED` – computed flag indicating whether the account is an admin.
  - `metadata JSONB NOT NULL DEFAULT '{}'::jsonb` – flexible bag for per-account settings and future expansion.
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- Trigger `user_profiles_updated_at` (now attached to `account_profiles` after the rename) reuses the shared `update_updated_at_column()` function.
- RLS is **enabled** on `account_profiles`.
- Policies:
  - `"Users can view own profile"` (SELECT where `auth.uid() = id`).
  - (Future) admins may get broader access to all account profiles via additional policies.

### 3.2 `pages` RLS hardening

These migrations tighten `pages` RLS:

**Migrations:**
- `20251119134331_enable_rls_on_pages_table.sql` – Re-enabled RLS on pages table
- `20251119134414_remove_temporary_pages_read_policy.sql` – Removed overly permissive temporary policy
- `20251119135456_add_public_read_policy_for_published_pages.sql` – Added limited public read policy

**Final RLS Policies:**
- Drop the broad authenticated-user policies:
  `"Authenticated users can view/create/update/delete pages"`.
- Remove the temporary policy that allowed all users to read all non-deleted pages.
- Add admin-only policies based on `account_profiles`:
  - `"Admins can read all pages"` – SELECT allowed when there is a matching `account_profiles` row with `is_admin = TRUE`.
  - `"Admins can create pages"` – INSERT allowed only for admins.
  - `"Admins can update pages"` – UPDATE allowed only for admins (both USING and WITH CHECK).
  - `"Admins can delete pages"` – DELETE allowed only for admins.
- Add limited public read policy:
  - `"Public users can view published pages"` – SELECT allowed for published, non-deleted pages only.
- The Supabase **service_role** key continues to bypass RLS automatically for server-side operations where appropriate.

Result: RLS now enforces that **only admins** (accounts with `account_type = 'admin'`) can manage pages via Supabase, while public users can only read published content. Draft and archived pages remain admin-only.

---

## 4. Frontend Auth UX (Batches 1–2)

### 4.1 `/admin/login` page

- **File:** `app/pages/admin/login.vue`.
- **Route:** `/admin/login` (Nuxt page-based routing under `app/`).
- **Purpose:** Dedicated admin login page for the Cost of Concrete admin area.

Key behaviors:

- Uses Nuxt Supabase module composables: `useSupabaseClient()`, `useSupabaseUser()`, `useRoute()`, `useRouter()`.
- If a user is already logged in (`useSupabaseUser()` is truthy), they are **redirected to `/admin/pages`**.
- On submit:
  - Validates that **both email and password** are present; otherwise sets `errorMessage` to "Please enter both email and password."
  - Calls `supabase.auth.signInWithPassword({ email, password })`.
  - On success, redirects to:
    - the `redirect` query parameter (if it starts with `/`), or
    - `/admin/pages` as the default.
  - On failure, shows the generic error: `"Invalid email or password. Please try again."`.
- Dev-only logging uses **`consola`** and is gated by `import.meta.dev` so browser consoles stay clean in production.

UI details:

- Card-centered layout, mobile-first, using Tailwind with dark-mode variants.
- H1 heading: **"Welcome Back"**.
- Copy: **"Sign in with your credentials below."**
- Shared inputs: `TextInput` for Email and Password (with icons).
- Primary button: shared `Button` component with `text="Sign In"`.
- Helper text: **"Access is restricted to authorized users. If you need access, please contact the site owner."**

### 4.2 Public header Login buttons

- **File:** `app/components/ui/pages/Header.vue`.
- The global site header has **Login** buttons on desktop and mobile.
- Both now use the shared `Button` component with `location="/admin/login"`, which renders as `<NuxtLink>` under the hood.
- Behavior:
  - Clicking **Login** from any public page navigates to `/admin/login`.
  - This is the primary entry point into the admin area for authorized users.

### 4.3 Admin layout Logout button

- **File:** `app/layouts/admin.vue`.
- The admin layout header now includes a **Logout** button next to the dark mode toggle and avatar placeholder.

Behavior:

- Uses `useSupabaseClient()` and `useRouter()` in `<script setup>`.
- `handleLogout()`:
  - Calls `supabase.auth.signOut()` to clear the Supabase session.
  - Redirects to `/admin/login` using `router.replace('/admin/login')`.
  - Logs any unexpected errors to `console.error` **only in dev** (`import.meta.dev`).

This ensures admins have a clear way to end their session and land back on the login page.

---

## 5. Current Status & Next Steps

**✅ Phase 6 Complete (All 5 Batches Delivered):**

**Batch 1 – Schema & RLS Foundations:**
- `account_profiles` table with `account_type`, computed `is_admin`, `metadata` and self-view RLS.
- Initial RLS policies on `pages` table for admin-only management.

**Batch 2 – Login UI & Basic Flows:**
- `/admin/login` page wired to Supabase email+password auth with proper redirects and dev-only logging.
- Global header Login buttons wired to `/admin/login` for both desktop and mobile views.
- Admin layout Logout button that signs out via Supabase and redirects to `/admin/login`.

**Batch 3 – Route Protection & 403 Page:**
- Global admin route middleware protecting `/admin/*` with SSR-safe redirects and 403 handling for non-admins.
- Server-side `getAuthUserAndIsAdmin(event)` helper for SSR-compatible auth checks.
- At least one admin test user created in `auth.users` with a matching `account_profiles` row where `account_type = 'admin'`.

**Batch 4 – API Admin Enforcement:**
- Server-side `requireAdmin` helper using `account_profiles.is_admin` / `account_type`.
- Applied admin checks to all `server/api/pages/*` endpoints (GET, POST, PATCH, DELETE).
- Unauthenticated users now receive 401 errors when accessing admin-only endpoints.

**Batch 5 – Auth & RLS Testing:**
- Fixed RLS enforcement on `pages` table (re-enabled RLS, removed temporary policy).
- Added limited public read policy for published pages only.
- Created 3 new migrations to capture RLS changes:
  - `20251119134331_enable_rls_on_pages_table.sql`
  - `20251119134414_remove_temporary_pages_read_policy.sql`
  - `20251119135456_add_public_read_policy_for_published_pages.sql`
- Extended Playwright tests for API-level access control.
- All tests passing:
  - ✅ Unauthenticated users receive 401 for admin-only API endpoints
  - ✅ Public users can view published pages
  - ✅ Draft and archived pages remain admin-only

**Next Phase:**

Phase 6 is complete! The admin authentication and RLS system is fully functional and tested. Future enhancements could include:
- Additional account types (e.g., 'editor', 'viewer')
- More granular permissions
- Session management improvements
- Two-factor authentication

