# Quick Start Guide - Dynamic Menu System

This guide helps you get started with implementing the dynamic menu system.

---

## 📁 Files in This Directory

| File | Description |
|------|-------------|
| **README.md** | Overview and project structure |
| **QUICK-START.md** | This file - quick reference |
| **batch-1-database-foundation.md** | Database tables, indexes, RLS policies |
| **batch-2-backend-repositories.md** | Data access layer (repositories) |
| **batch-3-backend-services-schemas.md** | Business logic and validation |
| **batches-4-11-summary.md** | Condensed guide for remaining batches |

---

## 🚀 Getting Started

### Step 1: Read the Plan
1. Start with **README.md** to understand the overall architecture
2. Review the design decisions and file structure

### Step 2: Begin Implementation
1. Start with **Batch 1: Database Foundation**
2. Follow each batch sequentially
3. Test thoroughly after each batch
4. Don't skip ahead - each batch builds on the previous

### Step 3: Reference Existing Code
When implementing, reference these existing files:
- **Database**: `supabase/migrations/20251108035249_create_pages_table.sql`
- **Repository**: `server/repositories/PageRepository.ts`
- **Service**: `server/services/PageService.ts`
- **Schemas**: `server/schemas/page.schemas.ts`
- **API**: `server/api/pages/*.ts`
- **Composables**: `app/composables/usePages.ts` (if exists)
- **Admin Components**: `app/components/admin/AdminPage*.vue`

---

## 📋 Implementation Checklist

### Phase 1: Backend (Batches 1-4)
- [ ] **Batch 1**: Create database tables and RLS policies
- [ ] **Batch 2**: Create MenuRepository and MenuItemRepository
- [ ] **Batch 3**: Create validation schemas and MenuService
- [ ] **Batch 4**: Create all API endpoints

### Phase 2: Frontend (Batches 5-6)
- [ ] **Batch 5**: Create useMenus and useMenuItems composables
- [ ] **Batch 6**: Update Header.vue and Footer.vue

### Phase 3: Admin UI (Batches 7-10)
- [ ] **Batch 7**: Create menu list page and component
- [ ] **Batch 8**: Create menu form (create/edit)
- [ ] **Batch 9**: Create menu item list with drag-and-drop
- [ ] **Batch 10**: Create menu item form (create/edit)

### Phase 4: Testing (Batch 11)
- [ ] **Batch 11**: Comprehensive testing and Linear ticket

---

## 🧪 Testing Strategy

### After Each Batch
Run the specific tests outlined in that batch's documentation.

### Manual Testing Tools
- **Database**: Supabase MCP `execute_sql` tool
- **API**: Browser DevTools Network tab
- **UI**: Manual browser testing

### Key Test Scenarios
1. Create menu → appears in header/footer
2. Disable menu → disappears from public view
3. Reorder items → order updates everywhere
4. Delete menu → soft delete works
5. 1-level depth → enforced correctly

---

## 💡 Key Concepts

### Menu Structure
```
Menu (e.g., "Main Navigation")
├── Parent Item 1 (e.g., "Applications")
│   ├── Child Item 1 (e.g., "Staining Concrete")
│   ├── Child Item 2 (e.g., "Stamping Concrete")
│   └── Child Item 3 (e.g., "Polishing")
├── Parent Item 2 (e.g., "Indoor Concrete")
│   └── Child Items...
└── Single Item (e.g., "Find a Contractor")
```

### Link Types
- **Page Link**: References a page in the `pages` table
- **Custom URL**: External or custom link (e.g., "https://example.com")

### Placement
- **Header**: Supports dropdowns (2-column grid layout)
- **Footer**: Flat links only (no dropdowns)

### Ordering
- `display_order` field controls item order
- Drag-and-drop in admin UI updates `display_order`

---

## 🔧 Common Commands

### Database
```bash
# Generate TypeScript types after migrations
pnpm run db:types
```

### Install Dependencies
```bash
# For drag-and-drop (Batch 9)
pnpm add @vueuse/integrations sortablejs
pnpm add -D @types/sortablejs
```

### Development
```bash
# Start dev server (if needed for testing)
pnpm run dev
```

---

## 📞 Need Help?

### Stuck on a Batch?
1. Review the batch documentation carefully
2. Check the referenced existing code
3. Test in isolation (database → API → UI)
4. Ask for clarification

### Common Issues
- **TypeScript errors**: Regenerate types with `pnpm run db:types`
- **RLS errors**: Verify admin user has `is_admin = true` in `account_profiles`
- **Validation errors**: Check Zod schemas match your data
- **Hydration errors**: Ensure SSR compatibility with `useAsyncData`

---

## ✅ Success Indicators

You'll know you're on track when:
- [ ] Each batch's tests pass
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Menus display correctly in header/footer
- [ ] Admin UI is functional and intuitive
- [ ] Drag-and-drop works smoothly
- [ ] All CRUD operations work

---

## 🎯 Final Goal

A fully functional dynamic menu system where:
1. Admins can create/edit/delete menus and items
2. Menus appear in header with dropdowns
3. Menus appear in footer as flat links
4. Items can link to pages or custom URLs
5. Drag-and-drop reordering works
6. Everything is properly validated and secured

---

**Ready? Start with Batch 1!** 🚀

Good luck! Take it one batch at a time, test thoroughly, and you'll have a robust menu system in no time.

