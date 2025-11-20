# Menu System E2E Tests

This directory contains end-to-end tests for the dynamic menu system using Playwright.

## Test Structure

### Priority 1: Critical Workflows (Must Have)
These tests cover the most critical user workflows that must work for the feature to be viable.

1. **create-menu.spec.ts** - Test menu creation flow
2. **create-menu-item.spec.ts** - Test menu item creation flow
3. **toggle-menu-flags.spec.ts** - Test visibility toggle functionality
4. **reorder-menu-items.spec.ts** - Test drag-and-drop reordering
5. **delete-menu.spec.ts** - Test menu deletion flow

### Priority 2: Important Workflows (Should Have)
These tests cover important workflows that enhance the feature.

6. **create-child-item.spec.ts** - Test nested menu item creation
7. **edit-menu.spec.ts** - Test menu editing flow
8. **edit-menu-item.spec.ts** - Test menu item editing flow
9. **delete-menu-item.spec.ts** - Test menu item deletion flow

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests in UI mode (interactive)
pnpm test:e2e:ui

# Run tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# View test report
pnpm test:e2e:report

# Run specific test file
pnpm test:e2e tests/menus/create-menu.spec.ts

# Run tests matching a pattern
pnpm test:e2e --grep "create"
```

## Test Data

Tests use the following approach for test data:
- Create test menus/items at the start of each test
- Clean up test data after each test
- Use unique identifiers to avoid conflicts

## Test Patterns

All tests follow these patterns:
- Use `test.describe()` to group related tests
- Use `test.beforeEach()` for setup
- Use `test.afterEach()` for cleanup
- Use descriptive test names
- Verify both admin UI and public UI changes
- Use `page.waitForLoadState('networkidle')` for stability

## Coverage

These E2E tests provide coverage for:
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ Admin UI workflows
- ✅ Public UI rendering (header/footer)
- ✅ Toggle functionality
- ✅ Drag-and-drop reordering
- ✅ Form validation
- ✅ Navigation flows
- ✅ Database persistence

## What's NOT Covered (Deferred)

The following are covered by manual testing or deferred to future unit tests:
- Backend repository methods (unit tests)
- Backend service methods (unit tests)
- Composable functions (unit tests)
- Component rendering (component tests)
- Edge case validation (manual testing)
- Performance testing (manual testing)

