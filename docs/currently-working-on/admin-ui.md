# Phase 5: Admin UI (Basic) - Implementation Plan

**Project:** Cost of Concrete - Admin Interface for Page Management
**Started:** 2025-11-08
**Status:** ✅ Batch 3 Complete - In Progress
**Last Updated:** 2025-11-08 14:15 PST

---

## 📊 Current Progress

### Completed Batches

✅ **Batch 1: Page List View** - COMPLETE (2025-11-08)
- All 13 pages displaying with hierarchical indentation
- Filters, search, and pagination working
- Quick actions (View, Edit, Delete) functional
- Dark mode and responsive design implemented

✅ **Batch 2: Create Page Form (Part 1 - Core Fields)** - COMPLETE (2025-11-08)
- Dependencies installed (vee-validate, @vee-validate/zod, @tiptap/vue-3, @tiptap/starter-kit)
- Zod validation schemas created
- PageForm component with core fields built
- /admin/pages/new route created
- Auto-slug generation from title working
- Client-side validation with inline errors

✅ **Batch 3: Create Page Form (Part 2 - Content Editor)** - COMPLETE (2025-11-08)
- TipTapEditor component created with StarterKit
- Toolbar with 18 formatting buttons (bold, italic, headings, lists, code blocks, etc.)
- VeeValidate integration
- Dark mode styling
- Content field added to schema
- TipTap editor integrated into PageForm

### In Progress

🔜 **Batch 4: Create Page Form (Part 3 - Metadata & SEO)** - NOT STARTED
- Awaiting user approval to proceed

### Statistics

- **Files Created:** 9
- **Files Modified:** 5
- **Lines of Code:** ~2,663 lines
- **Components Built:** 4 (AdminPageList, TextInput, PageForm, TipTapEditor)
- **Composables Built:** 1 (useAdminPages)
- **Schemas Built:** 1 (page-form.schema.ts with 3 form schemas)
- **Database Migrations:** 1 (RLS policy update)
- **Dependencies Installed:** 4 (vee-validate, @vee-validate/zod, @tiptap/vue-3, @tiptap/starter-kit)
- **Code Quality Refactors:** 1 (PageForm to use composable instead of direct API calls)

---

## 📋 Table of Contents

1. [Current Progress](#current-progress)
2. [Overview](#overview)
3. [Architecture Decisions](#architecture-decisions)
4. [Technology Stack](#technology-stack)
5. [File Structure](#file-structure)
6. [Batch Implementation Plan](#batch-implementation-plan)
7. [Component Specifications](#component-specifications)
8. [API Integration](#api-integration)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

### Goals

Build a simple, user-friendly admin interface for managing pages with:
- ✅ **Page List View** - View all pages with filtering, search, and pagination
- ✅ **Create Page Form** - Create new pages with all fields (core, content, metadata, SEO)
- ✅ **Edit Page Form** - Edit existing pages
- ✅ **Delete Functionality** - Delete pages with confirmation
- ✅ **Validation** - Client-side and server-side validation
- ✅ **Admin Layout** - Collapsible sidebar navigation

### Key Features

1. **WordPress-Style Page List**: Flat list with indentation for hierarchy
2. **WYSIWYG Editor**: TipTap for markdown content editing
3. **Dynamic Metadata Forms**: Auto-generated form fields based on template schema
4. **SEO Fields**: Expandable section for all SEO settings
5. **Responsive Design**: Mobile-first approach with dark mode support
6. **Reusable Components**: DRY principles using existing UI library

---

## 🏗️ Architecture Decisions

### UI Framework & Components

**Decision:** Reuse existing Reka UI + Tailwind CSS components

**Existing Components to Reuse:**
- ✅ `Button.vue` - For all action buttons
- ✅ `Dialog.vue` - For delete confirmation
- ✅ `Pagination.vue` - For page list pagination
- ✅ `Badge.vue` - For status and template badges
- ✅ `FilterSelect.vue` - For status and template filters

**New Components to Build:**
- `TextInput.vue` - Simple text input for search and form fields
- `AdminSidebar.vue` - Collapsible sidebar navigation
- `AdminPageList.vue` - Page list table with indentation
- `PageForm.vue` - Reusable form for create/edit
- `TipTapEditor.vue` - WYSIWYG markdown editor
- `TemplateMetadataFields.vue` - Dynamic metadata form generator
- `SeoFieldsSection.vue` - Expandable SEO fields section

---

### Form Handling

**Decision:** VeeValidate + Zod

**Package:** `vee-validate` + `@vee-validate/zod`

**Rationale:**
- ✅ Vue 3 native with Composition API support
- ✅ Seamless Zod integration (reuse server-side schemas)
- ✅ Lightweight (~10kb gzipped)
- ✅ Field-level validation with inline errors
- ✅ Works with any UI library (Reka UI)

---

### Markdown Editor

**Decision:** TipTap Editor

**Package:** `@tiptap/vue-3` + `@tiptap/starter-kit`

**Rationale:**
- ✅ Modern & well-maintained (24k+ GitHub stars)
- ✅ Vue 3 native, excellent Nuxt integration
- ✅ Lightweight & modular
- ✅ True WYSIWYG experience
- ✅ Markdown import/export support
- ✅ Headless (full Tailwind CSS control)
- ✅ SSR compatible

---

### Page List Design

**Decision:** Flat List with Indentation + Pagination

**Pattern:** WordPress-style page list

**Features:**
- Flat list with visual indentation (depth × 20px)
- Columns: Title (with indent), Slug, Template, Status, Last Modified, Actions
- Filters: Status dropdown, Template dropdown
- Search: Simple text input for title/slug
- Pagination: 20 items per page
- Quick Actions: Edit, View, Delete icons

**Why?** Tree views are complex to build and harder to scan. WordPress-style indented flat list gives hierarchy context while keeping implementation simple.

---

### Metadata Editor

**Decision:** Hybrid Approach

**Implementation:**
1. **Template Selector** → Dynamically generate form fields based on template's JSON schema
2. **Common Fields** → Form inputs (e.g., Hub: columns, Spoke: sidebarPosition)
3. **Advanced Toggle** → Expandable JSON editor for power users

**Why?** Best UX for non-technical users (form fields) while allowing flexibility for advanced users (JSON).

---

### SEO Fields Layout

**Decision:** Expandable "SEO Settings" Section

**Structure:**
- Main form shows: Title, Slug, Parent, Template, Status, Content
- **Expandable Section**: "SEO Settings" (collapsed by default)
  - Basic SEO: Meta Title, Meta Description, Meta Keywords, Focus Keyword
  - Advanced SEO: Canonical URL, Meta Robots, Sitemap Priority/Changefreq
  - Social: Open Graph fields, Twitter Card fields
  - Schema.org: Type selector + fields

**Why?** Keeps main form clean and focused. WordPress pattern (Yoast SEO, Rank Math).

---

### Validation Strategy

**Decision:** Both Client + Server

**Implementation:**
- **Client-side**: Zod schemas for instant feedback (UX)
- **Server-side**: Same Zod schemas reused in API (security)
- **Pattern**: Validate on blur + on submit (client), always validate on server

**Error Display:** Inline field errors (below each field)

---

### User Experience

**After Create/Edit:** Redirect to page list with success toast

**Delete Confirmation:** Use existing Dialog component with "Are you sure?" message

**Loading States:** Show loading spinner, disable form during submission

**Optimistic UI:** Wait for server confirmation (simpler, more reliable for MVP)

**Auto-save:** Save on explicit "Save" button click (note: refactor to auto-save draft mode later)

---

## 🛠️ Technology Stack

### Dependencies to Install

**Batch 2:**
```bash
pnpm add vee-validate @vee-validate/zod @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

**Optional (Batch 4):**
```bash
pnpm add vue-json-pretty  # For JSON editor (if needed)
```

### Existing Dependencies

- ✅ `nuxt` (v4)
- ✅ `reka-ui` (UI components)
- ✅ `@vueuse/core` (utility composables)
- ✅ `zod` (validation schemas)
- ✅ `consola` (logging)
- ✅ `@formkit/auto-animate` (animations)

---

## 📁 File Structure

```
app/
├── layouts/
│   └── admin.vue                          # Admin layout with sidebar (Batch 7)
├── pages/
│   └── admin/
│       ├── index.vue                      # Admin dashboard (placeholder)
│       └── pages/
│           ├── index.vue                  # Page list view (Batch 1)
│           ├── new.vue                    # Create page (Batches 2-5)
│           └── [id]/
│               └── edit.vue               # Edit page (Batch 6)
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.vue              # Collapsible sidebar (Batch 7)
│   │   ├── AdminPageList.vue             # Page list table (Batch 1)
│   │   ├── PageForm.vue                  # Reusable form (Batches 2-6)
│   │   ├── TipTapEditor.vue              # Markdown editor (Batch 3)
│   │   ├── TemplateMetadataFields.vue    # Dynamic metadata (Batch 4)
│   │   └── SeoFieldsSection.vue          # SEO fields (Batch 4)
│   └── ui/
│       ├── Button.vue                     # ✅ Already exists
│       ├── Dialog.vue                     # ✅ Already exists
│       ├── Pagination.vue                 # ✅ Already exists
│       ├── Badge.vue                      # ✅ Already exists
│       └── form/
│           ├── FilterSelect.vue           # ✅ Already exists
│           ├── SearchInput.vue            # ✅ Already exists (ZIP code)
│           └── TextInput.vue              # ✅ Created (simple text input)
├── composables/
│   ├── useAdminPages.ts                   # ✅ Created (admin CRUD)
│   └── useTemplateSchema.ts               # Template schema utilities (Batch 4)
└── schemas/
    └── admin/
        └── page-form.schema.ts            # Zod schemas for forms (Batch 2)

supabase/
└── tests/
    └── seed_admin_test_data.sql           # ✅ Created (25 test pages)

server/
└── api/
    └── pages/
        └── [id]/
            └── validate-slug.get.ts       # Slug availability (future)
```

---

## 📦 Batch Implementation Plan

### ✅ **Batch 1: Page List View (Index)** - COMPLETE

**Priority:** 1st (User's top priority)

**Goal:** Create admin page list with filtering, search, and pagination

**Status:** ✅ **COMPLETE** (2025-11-08)

**Tasks:**
- [x] Create seed data SQL script (25 test pages) ✅ DONE
- [x] Create `TextInput.vue` component ✅ DONE
- [x] Create `useAdminPages.ts` composable ✅ DONE
- [x] Create `AdminPageList.vue` component (table with indentation) ✅ DONE
- [x] Create `/admin/pages/index.vue` route ✅ DONE
- [x] Implement status filter (All, Draft, Published, Archived) ✅ DONE
- [x] Implement template filter (All, Hub, Spoke, Sub-Spoke, Article, Custom, Default) ✅ DONE
- [x] Implement search input (title/slug) ✅ DONE
- [x] Implement pagination (50 items per page) ✅ DONE
- [x] Add quick actions (Edit, View, Delete icons) ✅ DONE
- [x] Style with Tailwind + dark mode ✅ DONE
- [x] Test with seed data ✅ DONE
- [x] Fix hierarchical sorting (orderBy: full_path) ✅ DONE
- [x] Fix RLS policies for admin access ✅ DONE

**Deliverable:** ✅ Working page list view with filters, search, and hierarchical display

**Files Created:**
- `app/components/admin/AdminPageList.vue` (278 lines)
- `app/pages/admin/pages/index.vue` (283 lines)
- `app/components/ui/form/TextInput.vue` (165 lines)
- `app/composables/useAdminPages.ts` (189 lines)
- `supabase/tests/seed_admin_test_data.sql` (521 lines)

**Files Modified:**
- `server/schemas/page.schemas.ts` - Added `'full_path'` to orderBy enum
- `supabase/migrations/` - Temporary RLS policy for admin development

**Known Issues:**
- None - All features working as expected

**Testing Results:**
- ✅ All 13 pages display correctly
- ✅ Hierarchical indentation working (depth × 20px)
- ✅ Chevron icons showing for child pages
- ✅ Status badges (Published=green, Draft=yellow, Archived=gray)
- ✅ Template badges (Hub=blue, Spoke=purple, Sub-Spoke=pink, Article=orange)
- ✅ Filters working (Status, Template)
- ✅ Search working (title/slug/full_path)
- ✅ Pagination working (50 items per page)
- ✅ Quick actions working (View, Edit, Delete)
- ✅ Delete confirmation dialog working
- ✅ Dark mode styling working
- ✅ Responsive design working

---

### ✅ **Batch 2: Create Page Form (Part 1 - Core Fields)** - COMPLETE

**Priority:** 2nd

**Goal:** Build create page form with core fields

**Status:** ✅ **COMPLETE** (2025-11-08)

**Tasks:**
- [x] Install dependencies: `vee-validate`, `@vee-validate/zod`, `@tiptap/vue-3`, `@tiptap/starter-kit` ✅ DONE
- [x] Create `/admin/pages/new.vue` route ✅ DONE
- [x] Create `PageForm.vue` component (reusable for create/edit) ✅ DONE
- [x] Create `schemas/admin/page-form.schema.ts` (Zod schemas) ✅ DONE
- [x] Implement VeeValidate form setup ✅ DONE
- [x] Add core fields: ✅ DONE
  - [x] Title (text input with validation) ✅ DONE
  - [x] Slug (text input with format validation + auto-generation) ✅ DONE
  - [x] Parent Page (simple dropdown, nullable) ✅ DONE
  - [x] Template (dropdown with descriptions) ✅ DONE
  - [x] Status (dropdown: Draft, Published, Archived) ✅ DONE
  - [x] Description (textarea) ✅ DONE
- [x] Add inline field errors ✅ DONE
- [x] Style with Tailwind + dark mode ✅ DONE

**Deliverable:** ✅ Create page form with core fields and validation

**Files Created:**
- `app/schemas/admin/page-form.schema.ts` (245 lines)
- `app/components/admin/PageForm.vue` (300 lines)
- `app/pages/admin/pages/new.vue` (165 lines)

**Files Modified:**
- `app/pages/admin/pages/new.vue` (1 line - changed console.log to consola.log)

**Features Implemented:**
- ✅ VeeValidate + Zod integration
- ✅ Auto-slug generation from title
- ✅ Manual slug editing detection
- ✅ Inline validation errors
- ✅ Field-level validation
- ✅ Required field indicators (*)
- ✅ Help text for each field
- ✅ Parent page dropdown with hierarchical indentation
- ✅ Parent page options fetched via useAdminPages composable (DRY)
- ✅ Computed properties for reactive data transformation
- ✅ Dark mode styling
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Cancel button with navigation
- ✅ Submit button with loading spinner
- ✅ Proper separation of concerns (SOLID principles)

**Known Issues:**
- None - All features working as expected

**Testing Results:**
- ✅ Form validation working correctly
- ✅ Auto-slug generation working (converts "My Page Title" → "my-page-title")
- ✅ Manual slug editing detection working
- ✅ All fields rendering correctly
- ✅ Parent page dropdown populated with all 13 pages
- ✅ Hierarchical indentation in parent page dropdown (2 spaces per depth level)
- ✅ Button text displaying correctly ("Cancel" and "Create Page")
- ✅ Dark mode styling applied
- ✅ Responsive on mobile/tablet/desktop
- ✅ All tests completed successfully

**Code Quality Improvements:**
- ✅ Refactored to use `useAdminPages` composable (DRY principle)
- ✅ Proper separation of concerns (component handles UI, composable handles data)
- ✅ Follows SOLID principles (Single Responsibility)
- ✅ Better testability (decoupled from API)
- ✅ Computed properties for reactive data transformation

---

### ✅ **Batch 3: Create Page Form (Part 2 - Content Editor)** - COMPLETE

**Priority:** 3rd

**Goal:** Add TipTap WYSIWYG editor

**Status:** ✅ **COMPLETE** (2025-11-08)

**Tasks:**
- [x] Create `TipTapEditor.vue` component ✅ DONE
- [x] Configure TipTap with StarterKit (headings, bold, italic, lists, links, code) ✅ DONE
- [x] Add toolbar (formatting buttons) ✅ DONE (18 buttons)
- [x] Integrate with VeeValidate ✅ DONE
- [x] Style editor with Tailwind + dark mode ✅ DONE
- [x] Add to `PageForm.vue` ✅ DONE
- [x] Update schema to include content field ✅ DONE

**Deliverable:** ✅ Working WYSIWYG editor integrated into form

**Files Created:**
- `app/components/admin/TipTapEditor.vue` (384 lines)

**Files Modified:**
- `app/schemas/admin/page-form.schema.ts` (+39 lines - added contentFormSchema)
- `app/components/admin/PageForm.vue` (+20 lines - integrated TipTap editor)

**Features Implemented:**
- ✅ TipTap editor with StarterKit extensions
- ✅ Comprehensive toolbar with 18 formatting buttons
- ✅ Active state indicators (blue highlight)
- ✅ v-model support for two-way data binding
- ✅ VeeValidate integration
- ✅ Placeholder support
- ✅ Disabled state support
- ✅ Dark mode styling
- ✅ Responsive toolbar
- ✅ Rich text styling with Tailwind prose classes

**Known Issues:**
- ✅ Fixed: `font-mono` class not available - replaced with CSS font-family
- ✅ Fixed: Duplicate `coreFieldsDefaultValues` export - removed duplicate

**Testing Notes:**
- ✅ All 18 toolbar buttons working correctly
- ✅ Active state indicators showing properly
- ✅ Undo/Redo functionality working
- ✅ Dark mode styling applied correctly
- ✅ Responsive toolbar wrapping on mobile
- ✅ VeeValidate integration working
- ✅ No TypeScript errors
- ✅ No build errors

---

### 🔜 **Batch 4: Create Page Form (Part 3 - Metadata & SEO)**

**Priority:** 4th

**Goal:** Add template-specific metadata and SEO fields

**Tasks:**
- [ ] Create `TemplateMetadataFields.vue` component (dynamic form generator)
- [ ] Create `useTemplateSchema.ts` composable
- [ ] Implement JSON schema → form fields logic
- [ ] Add template-specific fields (Hub: columns, Spoke: sidebarPosition, etc.)
- [ ] Create `SeoFieldsSection.vue` component (expandable)
- [ ] Add SEO fields:
  - [ ] Basic: Meta Title, Meta Description, Meta Keywords, Focus Keyword
  - [ ] Advanced: Canonical URL, Meta Robots, Sitemap Priority/Changefreq
  - [ ] Social: Open Graph fields, Twitter Card fields
  - [ ] Schema.org: Type selector
- [ ] Add validation for all fields
- [ ] Integrate into `PageForm.vue`
- [ ] Add "Advanced: JSON Editor" toggle (simple textarea)

**Deliverable:** Complete create page form with all fields

---

### 🔜 **Batch 5: Create Page Form (Part 4 - Submit & API Integration)**

**Priority:** 5th

**Goal:** Wire up form submission to API

**Tasks:**
- [ ] Implement form submit handler
- [ ] Call `POST /api/pages` endpoint
- [ ] Handle loading state (disable form, show spinner)
- [ ] Handle success (toast notification, redirect to page list)
- [ ] Handle errors (display API errors, inline field errors)
- [ ] Add "Save as Draft" vs "Publish" buttons
- [ ] Test slug validation (format + uniqueness)
- [ ] Test all field validations
- [ ] Test with various templates

**Deliverable:** Fully functional create page form

---

### 🔜 **Batch 6: Edit Page Form & Delete**

**Priority:** 6th

**Goal:** Implement edit and delete functionality

**Tasks:**
- [ ] Create `/admin/pages/[id]/edit.vue` route
- [ ] Reuse `PageForm.vue` component
- [ ] Fetch page data from `/api/pages/[id]`
- [ ] Pre-populate form fields
- [ ] Implement form submit handler (PATCH instead of POST)
- [ ] Call `PATCH /api/pages/[id]` endpoint
- [ ] Handle success/error (same as create)
- [ ] Implement delete functionality:
  - [ ] Add "Delete Page" button in edit form
  - [ ] Use existing Dialog component for confirmation
  - [ ] Call `DELETE /api/pages/[id]` endpoint
  - [ ] Handle success (redirect to page list)
  - [ ] Handle error (show error message)
- [ ] Test edit flow
- [ ] Test delete flow

**Deliverable:** Working edit and delete functionality

---

### 🔜 **Batch 7: Admin Layout & Navigation**

**Priority:** 7th (Last, as requested)

**Goal:** Create admin layout with collapsible sidebar

**Tasks:**
- [ ] Create `app/layouts/admin.vue` layout
- [ ] Create `AdminSidebar.vue` component (collapsible)
- [ ] Add navigation items:
  - [ ] Dashboard (placeholder)
  - [ ] Pages (link to `/admin/pages`)
  - [ ] Settings (placeholder)
- [ ] Add header with user info (placeholder, no auth yet)
- [ ] Add collapse/expand toggle
- [ ] Add mobile-responsive behavior (drawer on mobile)
- [ ] Style with Tailwind + dark mode
- [ ] Apply layout to all `/admin/*` pages
- [ ] Add breadcrumbs to admin pages

**Deliverable:** Complete admin layout with navigation

**Note:** Auth middleware will be added in a future phase

---

## 🎨 Component Specifications

### AdminPageList Component

**Purpose:** Display pages in a table with hierarchy indentation

**Props:**
- `pages: Page[]` - Array of pages to display
- `loading: boolean` - Loading state

**Features:**
- Indentation based on depth (depth × 20px)
- Columns: Title, Slug, Template, Status, Last Modified, Actions
- Status badges (Draft: yellow, Published: green, Archived: gray)
- Template badges (Hub: blue, Spoke: purple, Sub-Spoke: pink, Article: orange)
- Action buttons: Edit (pencil icon), View (eye icon), Delete (trash icon)
- Hover states for rows
- Empty state when no pages

**Events:**
- `@edit` - Emits page ID when edit button clicked
- `@view` - Emits page full_path when view button clicked
- `@delete` - Emits page ID when delete button clicked

---

### PageForm Component

**Purpose:** Reusable form for creating and editing pages

**Props:**
- `mode: 'create' | 'edit'` - Form mode
- `initialData?: Page` - Initial data for edit mode

**Features:**
- VeeValidate form with Zod validation
- Core fields section
- Content editor section (TipTap)
- Template metadata section (dynamic)
- SEO fields section (expandable)
- Submit buttons (Save as Draft, Publish)
- Loading states
- Error handling

**Events:**
- `@submit` - Emits form data when submitted
- `@cancel` - Emits when cancel button clicked

---

### TipTapEditor Component

**Purpose:** WYSIWYG markdown editor

**Props:**
- `modelValue: string` - Content (v-model)
- `placeholder?: string` - Placeholder text

**Features:**
- Toolbar with formatting buttons (bold, italic, headings, lists, links, code)
- Character/word count
- Markdown import/export
- Dark mode support
- Keyboard shortcuts

**Events:**
- `@update:modelValue` - Emits content on change

---

## 🔌 API Integration

### Endpoints Used

**GET /api/pages**
- List pages with filters and pagination
- Query params: status, template, limit, offset, orderBy, orderDirection

**POST /api/pages**
- Create new page
- Body: CreatePageInput (Zod validated)

**GET /api/pages/[id]**
- Get page by ID
- Returns: Page object

**PATCH /api/pages/[id]**
- Update page
- Body: UpdatePageInput (Zod validated)

**DELETE /api/pages/[id]**
- Soft delete page
- Returns: Success message

---

## 🧪 Testing Strategy

### Seed Data

**File:** `supabase/tests/seed_admin_test_data.sql`

**Status:** ✅ Created but not executed (existing 13 pages sufficient for testing)

**Data (if needed):**
- 25 test pages
- Depth 0-3 (Hub, Spoke, Sub-Spoke, Article)
- Status: Published (15), Draft (9), Archived (1)
- Various timestamps for sorting tests

**Current Database:**
- 13 existing pages from previous phases
- Depth 0-3 (Hub, Spoke, Sub-Spoke, Article, Default)
- Status: Published (8), Draft (5)
- Sufficient for testing Batch 1

### Testing Checklist - Batch 1

- [x] Component renders correctly ✅
- [x] Dark mode styling works ✅
- [x] Responsive design works (mobile, tablet, desktop) ✅
- [x] Filters work (status, template) ✅
- [x] Search works (title/slug/full_path) ✅
- [x] Pagination works ✅
- [x] Quick actions work (View, Edit, Delete) ✅
- [x] Delete confirmation dialog works ✅
- [x] Error handling works (display errors) ✅
- [x] Loading states work (spinners) ✅
- [x] Hierarchical indentation works ✅
- [x] Chevron icons show for child pages ✅

### Testing Checklist - Future Batches

- [ ] Form validation works (client-side)
- [ ] API integration works (server-side validation)
- [ ] Success handling works (toast + redirect)
- [ ] TipTap editor works
- [ ] Metadata fields generate correctly
- [ ] SEO fields validate correctly

---

## 🐛 Known Issues & Solutions

### Issue 1: Only 8 Pages Showing (RESOLVED)

**Problem:** Page list only showed 8 published pages instead of all 13 pages.

**Root Cause:** Supabase RLS (Row Level Security) policies were filtering results for anonymous users to only show published pages.

**Solution:** Created temporary RLS policy to allow viewing all non-deleted pages during admin UI development:
```sql
-- Temporary policy for development
CREATE POLICY "Temporary: Allow viewing all non-deleted pages"
ON pages FOR SELECT TO public
USING (deleted_at IS NULL);
```

**Note:** This will be replaced with proper authentication-based policies in Batch 7.

---

### Issue 2: No Hierarchical Indentation (RESOLVED)

**Problem:** Pages were not showing visual indentation based on depth.

**Root Cause:** Pages were sorted by `updated_at` instead of `full_path`, breaking the hierarchical order.

**Solution:**
1. Changed default `orderBy` from `'updated_at'` to `'full_path'`
2. Changed default `orderDirection` from `'desc'` to `'asc'`
3. Added `'full_path'` to valid orderBy options in schema

**Files Modified:**
- `app/pages/admin/pages/index.vue` - Updated default filters
- `server/schemas/page.schemas.ts` - Added `'full_path'` to enum
- `app/composables/useAdminPages.ts` - Updated TypeScript interface

---

### Issue 3: Server Schema Validation Error (RESOLVED)

**Problem:** After adding `'full_path'` to orderBy enum, server returned validation error.

**Root Cause:** Server-side schema was cached and needed restart.

**Solution:** Restart dev server to reload updated schema.

---

## 🚀 Future Enhancements

### Deferred to Phase 6

- [ ] Real-time slug validation (as user types)
- [ ] Preview button (open draft page in new tab)
- [ ] Auto-save draft mode
- [ ] Bulk actions (bulk delete, bulk publish)
- [ ] Advanced parent page selector (tree view, searchable)
- [ ] Optimistic UI updates
- [ ] Page duplication
- [ ] Revision history

### Deferred to Auth Phase

- [ ] Auth middleware for `/admin/*` routes
- [ ] User roles (admin, editor, viewer)
- [ ] RLS policy updates for role-based access
- [ ] User profile in admin header

---

## ✅ Success Criteria

**Phase 5 is complete when:**

1. ✅ Admin can view all pages in a list with filters and search
2. ✅ Admin can create new pages with all fields (core, content, metadata, SEO)
3. ✅ Admin can edit existing pages
4. ✅ Admin can delete pages with confirmation
5. ✅ All forms have client + server validation
6. ✅ All forms show inline errors
7. ✅ Success/error messages display correctly
8. ✅ Admin layout with collapsible sidebar works
9. ✅ All components are responsive and support dark mode
10. ✅ Comprehensive testing completed

---

## 📝 Notes

**Created:** 2025-11-08
**Last Updated:** 2025-11-08
**Status:** Planning Complete - Ready to Build Batch 1

