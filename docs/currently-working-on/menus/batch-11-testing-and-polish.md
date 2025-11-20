# Batch 11: Testing & Polish

**Status:** Ready to Start
**Estimated Time:** 1 hour
**Priority:** High
**Dependencies:** Batches 1-10 (all complete)

---

## 📋 Overview

This batch focuses on comprehensive testing of the entire dynamic menu system, identifying and documenting any issues, creating Linear tickets for bugs/improvements, and finalizing the deliverables.

---

## 🎯 Objectives

1. **Comprehensive Testing** - Test all features end-to-end
2. **Bug Documentation** - Document any issues found
3. **Linear Ticket Creation** - Create tickets for bugs and future improvements
4. **Final Deliverables** - Ensure all documentation is complete
5. **Code Review** - Review code quality and consistency

---

## ✅ Testing Checklist

### 1. Database & Backend Testing

#### Database Schema
- [ ] Verify `menus` table structure and constraints
- [ ] Verify `menu_items` table structure and constraints
- [ ] Test RLS policies (public read for enabled, admin write)
- [ ] Test soft delete functionality (deleted_at)
- [ ] Test unique constraints (menu slug, etc.)
- [ ] Test CHECK constraints (page_id XOR custom_url)
- [ ] Test foreign key relationships
- [ ] Test indexes are working correctly

#### Backend Repositories
- [ ] Test MenuRepository.list() - returns all non-deleted menus
- [ ] Test MenuRepository.findById() - returns correct menu
- [ ] Test MenuRepository.findBySlug() - returns correct menu
- [ ] Test MenuRepository.create() - creates menu with audit fields
- [ ] Test MenuRepository.update() - updates menu correctly
- [ ] Test MenuRepository.delete() - soft deletes menu
- [ ] Test MenuItemRepository.listByMenu() - returns items in order
- [ ] Test MenuItemRepository.findById() - returns correct item
- [ ] Test MenuItemRepository.create() - creates item with audit fields
- [ ] Test MenuItemRepository.update() - updates item correctly
- [ ] Test MenuItemRepository.delete() - soft deletes item
- [ ] Test MenuItemRepository.reorder() - updates display_order

#### Backend Services
- [ ] Test MenuService.validateSlugUniqueness() - prevents duplicates
- [ ] Test MenuService depth enforcement (1-level max)
- [ ] Test MenuService.getNextDisplayOrder() - auto-assigns order
- [ ] Test MenuService validation rules

#### API Endpoints
- [ ] Test GET /api/menus - returns all menus
- [ ] Test POST /api/menus - creates menu (admin only)
- [ ] Test PATCH /api/menus/[id] - updates menu (admin only)
- [ ] Test DELETE /api/menus/[id] - deletes menu (admin only)
- [ ] Test PATCH /api/menus/[id]/toggle - toggles flags (admin only)
- [ ] Test GET /api/menus/[id]/items - returns menu items (admin only)
- [ ] Test POST /api/menus/[id]/items - creates item (admin only)
- [ ] Test PATCH /api/menus/items/[id] - updates item (admin only)
- [ ] Test DELETE /api/menus/items/[id] - deletes item (admin only)
- [ ] Test PATCH /api/menus/items/reorder - reorders items (admin only)
- [ ] Test authentication enforcement on all admin endpoints
- [ ] Test Zod validation on all endpoints
- [ ] Test error handling and error messages

### 2. Frontend Composables Testing

#### useMenus Composable
- [ ] Test listMenus() - fetches all menus
- [ ] Test createMenu() - creates menu via API
- [ ] Test updateMenu() - updates menu via API
- [ ] Test deleteMenu() - deletes menu via API
- [ ] Test toggleMenuHeader() - toggles show_in_header
- [ ] Test toggleMenuFooter() - toggles show_in_footer
- [ ] Test toggleMenuEnabled() - toggles is_enabled

#### useMenuItems Composable
- [ ] Test createMenuItem() - creates item via API
- [ ] Test updateMenuItem() - updates item via API
- [ ] Test deleteMenuItem() - deletes item via API
- [ ] Test reorderMenuItems() - reorders items via API

### 3. Public-Facing UI Testing

#### Header Component
- [ ] Verify header menu loads from database
- [ ] Test menu items display correctly
- [ ] Test parent items show correctly
- [ ] Test child items show in dropdown
- [ ] Test page links navigate correctly
- [ ] Test custom URLs open correctly
- [ ] Test "open in new tab" works for custom URLs
- [ ] Test only enabled menus/items show
- [ ] Test only menus with show_in_header=true appear
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test dark mode styling
- [ ] Test SSR compatibility (no hydration errors)

#### Footer Component
- [ ] Verify footer menu loads from database
- [ ] Test menu items display correctly
- [ ] Test parent items show correctly
- [ ] Test child items show correctly
- [ ] Test page links navigate correctly
- [ ] Test custom URLs open correctly
- [ ] Test "open in new tab" works for custom URLs
- [ ] Test only enabled menus/items show
- [ ] Test only menus with show_in_footer=true appear
- [ ] Test responsive design (mobile/tablet/desktop)
- [ ] Test dark mode styling
- [ ] Test SSR compatibility (no hydration errors)

### 4. Admin UI Testing

#### Menu List (/admin/menus)
- [ ] Test menu list loads correctly
- [ ] Test "Create Menu" button navigates to new form
- [ ] Test toggle switches (header/footer/enabled) work
- [ ] Test "Items" button navigates to items list
- [ ] Test "Edit" button navigates to edit form
- [ ] Test "Delete" button shows confirmation dialog
- [ ] Test delete confirmation works
- [ ] Test delete cancellation works
- [ ] Test list refreshes after updates
- [ ] Test loading state displays
- [ ] Test empty state displays
- [ ] Test dark mode styling
- [ ] Test responsive design

#### Menu Form (/admin/menus/new & /admin/menus/[id]/edit)
- [ ] Test form loads correctly
- [ ] Test auto-slug generation from name (create mode)
- [ ] Test manual slug editing stops auto-generation
- [ ] Test slug validation (lowercase, hyphens only)
- [ ] Test name validation (required)
- [ ] Test description field (optional)
- [ ] Test "Show in Header" checkbox
- [ ] Test "Show in Footer" checkbox
- [ ] Test "Enabled" checkbox
- [ ] Test at least one location required validation
- [ ] Test inline validation errors display
- [ ] Test form submission (create)
- [ ] Test form submission (edit)
- [ ] Test redirect after successful save
- [ ] Test cancel button returns to list
- [ ] Test dark mode styling
- [ ] Test responsive design

#### Menu Item List (/admin/menus/[id]/items)
- [ ] Test menu items list loads correctly
- [ ] Test hierarchical display (parent/child indentation)
- [ ] Test "Add Parent Item" button navigates to new form
- [ ] Test "Add Child" button navigates to new form with parent_id
- [ ] Test drag-and-drop reordering works
- [ ] Test reordering only within same parent group
- [ ] Test visual feedback during drag
- [ ] Test order persists after reorder
- [ ] Test "Edit" button navigates to edit form
- [ ] Test "Delete" button shows confirmation dialog
- [ ] Test delete confirmation works
- [ ] Test delete cancellation works
- [ ] Test toggle enabled checkbox works
- [ ] Test list refreshes after updates
- [ ] Test loading state displays
- [ ] Test empty state displays
- [ ] Test link type badges display correctly
- [ ] Test dark mode styling
- [ ] Test responsive design

#### Menu Item Form (/admin/menus/[menuId]/items/new & /admin/menus/[menuId]/items/[id]/edit)
- [ ] Test form loads correctly
- [ ] Test label validation (required)
- [ ] Test link type radio buttons work
- [ ] Test page dropdown shows when link_type='page'
- [ ] Test custom URL field shows when link_type='custom'
- [ ] Test page dropdown populated with published pages
- [ ] Test custom URL validation (valid URL format)
- [ ] Test "Open in new tab" checkbox (custom URLs only)
- [ ] Test parent dropdown populated with top-level items
- [ ] Test parent dropdown excludes current item (edit mode)
- [ ] Test description field shows when parent selected
- [ ] Test enabled checkbox
- [ ] Test switching link types clears opposite field
- [ ] Test inline validation errors display
- [ ] Test form submission (create)
- [ ] Test form submission (edit)
- [ ] Test depth validation error message
- [ ] Test redirect after successful save
- [ ] Test cancel button returns to items list
- [ ] Test dark mode styling
- [ ] Test responsive design

### 5. Integration Testing

#### End-to-End Workflows
- [ ] **Create Menu Workflow:**
  1. Navigate to /admin/menus
  2. Click "Create Menu"
  3. Fill in form (name, slug, description)
  4. Select locations (header/footer)
  5. Enable menu
  6. Submit form
  7. Verify redirect to menu list
  8. Verify menu appears in list
  9. Verify menu appears in header/footer (if enabled)

- [ ] **Create Menu Item Workflow:**
  1. Navigate to /admin/menus
  2. Click "Items" on a menu
  3. Click "Add Parent Item"
  4. Fill in form (label, link type, page/URL)
  5. Enable item
  6. Submit form
  7. Verify redirect to items list
  8. Verify item appears in list
  9. Verify item appears in header/footer menu

- [ ] **Create Child Item Workflow:**
  1. Navigate to menu items list
  2. Click "Add Child" on a parent item
  3. Verify parent_id is pre-filled
  4. Fill in form
  5. Submit form
  6. Verify child appears indented under parent
  7. Verify child appears in header/footer dropdown

- [ ] **Edit Menu Workflow:**
  1. Navigate to menu list
  2. Click "Edit" on a menu
  3. Modify fields
  4. Submit form
  5. Verify changes appear in list
  6. Verify changes appear in header/footer

- [ ] **Edit Menu Item Workflow:**
  1. Navigate to menu items list
  2. Click "Edit" on an item
  3. Modify fields
  4. Submit form
  5. Verify changes appear in list
  6. Verify changes appear in header/footer

- [ ] **Delete Menu Workflow:**
  1. Navigate to menu list
  2. Click "Delete" on a menu
  3. Confirm deletion
  4. Verify menu removed from list
  5. Verify menu removed from header/footer

- [ ] **Delete Menu Item Workflow:**
  1. Navigate to menu items list
  2. Click "Delete" on an item
  3. Confirm deletion
  4. Verify item removed from list
  5. Verify item removed from header/footer

- [ ] **Reorder Menu Items Workflow:**
  1. Navigate to menu items list
  2. Drag an item to new position
  3. Verify visual feedback
  4. Verify order persists after page refresh
  5. Verify order appears in header/footer

- [ ] **Toggle Menu Flags Workflow:**
  1. Navigate to menu list
  2. Toggle "Show in Header" switch
  3. Verify menu appears/disappears in header
  4. Toggle "Show in Footer" switch
  5. Verify menu appears/disappears in footer
  6. Toggle "Enabled" switch
  7. Verify menu appears/disappears everywhere

### 6. Edge Cases & Error Handling

#### Validation Edge Cases
- [ ] Test creating menu with duplicate slug
- [ ] Test creating menu with invalid slug (uppercase, spaces, special chars)
- [ ] Test creating menu with no locations selected
- [ ] Test creating menu item with no link type
- [ ] Test creating menu item with both page_id and custom_url
- [ ] Test creating menu item with neither page_id nor custom_url
- [ ] Test creating menu item with invalid URL
- [ ] Test creating child item under another child (depth > 1)
- [ ] Test creating menu item with very long label (>200 chars)
- [ ] Test creating menu item with very long description (>500 chars)

#### Authentication & Authorization
- [ ] Test accessing admin pages without authentication
- [ ] Test accessing admin API endpoints without authentication
- [ ] Test accessing admin pages as non-admin user
- [ ] Test accessing admin API endpoints as non-admin user

#### Data Integrity
- [ ] Test deleting menu with items (should soft delete)
- [ ] Test deleting parent item with children
- [ ] Test changing parent item to child (circular reference)
- [ ] Test reordering with concurrent updates
- [ ] Test updating deleted menu/item

#### Performance
- [ ] Test menu list with 50+ menus
- [ ] Test menu items list with 50+ items
- [ ] Test header/footer with multiple menus and items
- [ ] Test page load time with menus enabled
- [ ] Test SSR performance

---

## 🐛 Known Issues & Bugs

### Critical Issues
*Document any critical bugs found during testing*

### Medium Priority Issues
*Document any medium priority bugs found during testing*

### Low Priority Issues
*Document any low priority bugs found during testing*

---

## 📝 Linear Ticket Creation

### Bug Tickets
*Create Linear tickets for each bug found with:*
- **Title:** Clear, concise description
- **Description:** Steps to reproduce, expected vs actual behavior
- **Priority:** Based on severity
- **Labels:** `bug`, `menu-system`
- **Project:** Cost of Concrete

### Enhancement Tickets
*Create Linear tickets for future improvements:*

**Potential Enhancements:**
1. **Menu Item Icons** - Add icon field to menu items
2. **Menu Item Badges** - Add badge/label field (e.g., "New", "Hot")
3. **Menu Item Permissions** - Role-based visibility
4. **Menu Templates** - Pre-built menu templates
5. **Menu Preview** - Live preview in admin
6. **Menu Analytics** - Track menu item clicks
7. **Menu A/B Testing** - Test different menu configurations
8. **Menu Scheduling** - Schedule menu visibility
9. **Menu Localization** - Multi-language support
10. **Menu Item Images** - Add thumbnail images to menu items

---

## 📦 Final Deliverables

### Code Deliverables
- [x] Database migrations (menus, menu_items)
- [x] Backend repositories (MenuRepository, MenuItemRepository)
- [x] Backend services (MenuService)
- [x] Backend API endpoints (9 endpoints)
- [x] Frontend composables (useMenus, useMenuItems)
- [x] Public UI components (Header, Footer)
- [x] Admin UI components (MenuList, MenuForm, MenuItemList, MenuItemForm)
- [x] Admin pages (menu CRUD, menu item CRUD)
- [x] Zod validation schemas
- [x] TypeScript types

### Documentation Deliverables
- [x] Batch 1-11 documentation
- [x] Database schema documentation
- [x] API endpoint documentation
- [x] Testing checklist (this document)
- [ ] Final summary document
- [ ] Linear tickets for bugs/enhancements

### Testing Deliverables
- [ ] All tests completed
- [ ] All bugs documented
- [ ] All Linear tickets created
- [ ] Code review completed
- [ ] Final sign-off

---

## ✅ Completion Criteria

**Batch 11 is complete when:**
1. ✅ All testing checklist items are completed
2. ✅ All bugs are documented
3. ✅ All Linear tickets are created
4. ✅ All critical bugs are fixed (or tickets created)
5. ✅ Final summary document is created
6. ✅ Code review is completed
7. ✅ All deliverables are committed and pushed

---

## 🎯 Next Steps After Batch 11

1. **Review Linear tickets** - Prioritize bugs and enhancements
2. **Plan future iterations** - Schedule bug fixes and enhancements
3. **Monitor production** - Watch for issues after deployment
4. **Gather feedback** - Collect user feedback on menu system
5. **Iterate** - Implement improvements based on feedback

---

## 📊 Success Metrics

**The menu system is successful if:**
- ✅ All menus load correctly in header/footer
- ✅ All menu items display correctly
- ✅ All admin CRUD operations work
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ No hydration errors
- ✅ Performance is acceptable (<100ms load time)
- ✅ Dark mode works correctly
- ✅ Responsive design works on all devices
- ✅ Authentication/authorization works correctly

---

**Estimated Time:** 1 hour
**Actual Time:** _TBD_
**Status:** Ready to Start

