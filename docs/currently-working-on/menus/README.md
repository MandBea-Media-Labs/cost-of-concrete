# Dynamic Menu System - Implementation Guide

This directory contains detailed implementation guides for building the dynamic menu system.

---

## 📋 Batch Overview

| Batch | Description | Time | Status |
|-------|-------------|------|--------|
| **Batch 1** | Database Foundation | 1h | ✅ Complete |
| **Batch 2** | Backend Repositories | 1.5h | ✅ Complete |
| **Batch 3** | Backend Services & Schemas | 1.5h | 🔄 In Progress |
| **Batch 4** | Backend API Endpoints | 2h | ⏳ Pending |
| **Batch 5** | Frontend Composables | 1h | ⏳ Pending |
| **Batch 6** | Update Header & Footer | 1h | ⏳ Pending |
| **Batch 7** | Admin UI - Menu List | 1.5h | ⏳ Pending |
| **Batch 8** | Admin UI - Menu Form | 1h | ⏳ Pending |
| **Batch 9** | Admin UI - Menu Item List | 2h | ⏳ Pending |
| **Batch 10** | Admin UI - Menu Item Form | 1.5h | ⏳ Pending |
| **Batch 11** | Testing & Polish | 1h | ⏳ Pending |

**Total Estimated Time:** 15 hours

---

## 🎯 Implementation Order

Follow the batches in sequential order. Each batch builds on the previous one.

### **Phase 1: Backend Foundation** (Batches 1-4)
Set up database, repositories, services, and API endpoints.

### **Phase 2: Frontend Integration** (Batches 5-6)
Create composables and update existing Header/Footer components.

### **Phase 3: Admin Interface** (Batches 7-10)
Build complete admin UI for menu management.

### **Phase 4: Testing & Deployment** (Batch 11)
Comprehensive testing and create Linear ticket for caching.

---

## 📁 Files Created

### **Database** (2 files)
- `supabase/migrations/YYYYMMDDHHMMSS_create_menus_table.sql`
- `supabase/migrations/YYYYMMDDHHMMSS_create_menu_items_table.sql`

### **Backend** (13 files)
- `server/repositories/MenuRepository.ts`
- `server/repositories/MenuItemRepository.ts`
- `server/services/MenuService.ts`
- `server/schemas/menu.schemas.ts`
- `server/api/menus/index.get.ts`
- `server/api/menus/[slug].get.ts`
- `server/api/menus/index.post.ts`
- `server/api/menus/[id].patch.ts`
- `server/api/menus/[id].delete.ts`
- `server/api/menus/[id]/items.post.ts`
- `server/api/menu-items/[id].patch.ts`
- `server/api/menu-items/[id].delete.ts`
- `server/api/menu-items/reorder.patch.ts`

### **Frontend** (8 files)
- `app/composables/useMenus.ts`
- `app/composables/useMenuItems.ts`
- `app/pages/admin/menus/index.vue`
- `app/pages/admin/menus/new.vue`
- `app/pages/admin/menus/[id]/edit.vue`
- `app/pages/admin/menus/[id]/items.vue`
- `app/pages/admin/menus/[menuId]/items/new.vue`
- `app/pages/admin/menus/[menuId]/items/[id]/edit.vue`

### **Components** (4 files)
- `app/components/admin/AdminMenuList.vue`
- `app/components/admin/AdminMenuForm.vue`
- `app/components/admin/AdminMenuItemList.vue`
- `app/components/admin/AdminMenuItemForm.vue`

### **Modified Files** (3 files)
- `app/components/ui/pages/Header.vue`
- `app/components/ui/pages/Footer.vue`
- `app/components/admin/AdminSidebar.vue`

---

## 🧪 Testing Strategy

Each batch includes specific testing instructions. Use manual testing for MVP:

1. **Database Tests**: Use Supabase MCP `execute_sql` tool
2. **API Tests**: Use browser DevTools or create simple test pages
3. **UI Tests**: Manual testing in browser
4. **Integration Tests**: End-to-end user flows

---

## 📝 Key Design Decisions

### **1-Level Depth Only**
- Parent items can have children
- Children cannot have children (enforced in service layer)

### **Link Types**
- **Page Link**: References `pages` table
- **Custom URL**: External or custom links

### **Placement**
- Menus can appear in header, footer, or both
- Header menus support dropdowns (2-column grid)
- Footer menus are flat links only

### **Soft Delete**
- All deletions are soft (recoverable)
- `deleted_at` timestamp marks deleted records

### **Ordering**
- `display_order` field for custom ordering
- Drag-and-drop support in admin UI

---

## 🚀 Getting Started

1. Start with **Batch 1: Database Foundation**
2. Follow each batch sequentially
3. Test thoroughly after each batch
4. Mark batch as complete before moving to next

---

## 📚 Additional Resources

- **Existing Patterns**: Reference `PageRepository`, `PageService`, and admin page components
- **UI Components**: Reuse Reka UI components (Button, Dialog, Select, etc.)
- **Validation**: Follow VeeValidate patterns from page forms
- **Drag-and-Drop**: Use `@vueuse/integrations` with `sortablejs`

---

## ✅ Success Criteria

- [ ] All 11 batches completed
- [ ] All tests passing
- [ ] Header displays dynamic menus with dropdowns
- [ ] Footer displays dynamic flat links
- [ ] Admin can create/edit/delete menus and items
- [ ] Drag-and-drop reordering works
- [ ] Toggle switches work (header/footer/enabled)
- [ ] Linear ticket created for caching feature

---

## 🐛 Troubleshooting

### **Database Issues**
- Verify migrations ran successfully
- Check RLS policies are active
- Ensure TypeScript types are regenerated

### **API Issues**
- Check `requireAdmin()` is working
- Verify Supabase client is authenticated
- Check error responses in browser DevTools

### **UI Issues**
- Verify composables are fetching data
- Check for hydration errors (SSR)
- Ensure loading states are handled

---

## 📞 Support

If you encounter issues:
1. Check the specific batch documentation
2. Review existing similar implementations (pages system)
3. Test in isolation (database → API → UI)
4. Ask for clarification before proceeding

---

**Ready to begin? Start with Batch 1!** 🚀

