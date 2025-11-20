/**
 * Menu System E2E Tests - Delete Menu Workflow
 *
 * Priority: 1 (Critical)
 *
 * Tests the menu deletion workflow including:
 * - Navigate to menu list
 * - Click "Delete" button
 * - Verify confirmation dialog appears
 * - Confirm deletion
 * - Verify menu removed from list
 * - Verify menu removed from header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Delete Menu ${timestamp}`,
  slug: `test-delete-menu-${timestamp}`,
  description: 'Menu for testing delete functionality',
}

const TEST_ITEM = {
  label: 'Delete Test Link',
  customUrl: 'https://example.com',
}

test.describe('Workflow 5: Delete Menu', () => {
  let testMenuId: string

  test.beforeEach(async ({ request }) => {
    // Setup: Create a test menu with an item
    const menuResponse = await request.post(`${BASE_URL}/api/menus`, {
      data: {
        name: TEST_MENU.name,
        slug: TEST_MENU.slug,
        description: TEST_MENU.description,
        show_in_header: true,
        show_in_footer: true,
        is_enabled: true,
      },
    })

    const menuData = await menuResponse.json()
    if (menuData.success && menuData.data) {
      testMenuId = menuData.data.id
      console.log(`✅ Created test menu: ${testMenuId}`)

      // Create a menu item
      await request.post(`${BASE_URL}/api/menus/${testMenuId}/items`, {
        data: {
          label: TEST_ITEM.label,
          link_type: 'custom',
          custom_url: TEST_ITEM.customUrl,
          is_enabled: true,
          display_order: 0,
        },
      })
      console.log(`✅ Created test menu item`)
    } else {
      throw new Error('Failed to create test menu')
    }
  })

  test('should delete a menu and verify it disappears from list and public pages', async ({ page }) => {
    console.log('🧪 Test: Delete Menu Workflow')

    // Step 1: Navigate to /admin/menus
    console.log('Step 1: Navigate to /admin/menus')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Verify menu exists in list
    const menuRow = page.locator('tr', { hasText: TEST_MENU.name })
    await expect(menuRow).toBeVisible()

    // Step 2: Click "Delete" button
    console.log('Step 2: Click "Delete" button')
    const deleteButton = menuRow.locator('button[title="Delete menu"]')
    await deleteButton.click()

    // Step 3: Verify confirmation dialog appears
    console.log('Step 3: Verify confirmation dialog appears')

    // Wait for dialog to appear
    // Note: Dialog implementation depends on your UI library (Reka UI Dialog)
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 2000 })

    // Verify dialog content
    await expect(dialog).toContainText(/delete/i)
    await expect(dialog).toContainText(TEST_MENU.name)

    // Step 4: Confirm deletion
    console.log('Step 4: Confirm deletion')
    const confirmButton = dialog.locator('button', { hasText: /delete|confirm/i })
    await confirmButton.click()

    // Wait for deletion to complete
    await page.waitForTimeout(1000)

    // Step 5: Verify menu removed from list
    console.log('Step 5: Verify menu removed from list')
    await page.waitForLoadState('networkidle')

    const deletedMenuRow = page.locator('tr', { hasText: TEST_MENU.name })
    await expect(deletedMenuRow).not.toBeVisible()

    // Step 6: Verify menu removed from header
    console.log('Step 6: Verify menu removed from header')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const headerMenuItem = page.locator('header nav a', { hasText: TEST_ITEM.label })
    await expect(headerMenuItem).not.toBeVisible()

    // Step 7: Verify menu removed from footer
    console.log('Step 7: Verify menu removed from footer')
    const footerMenuItem = page.locator('footer nav a', { hasText: TEST_ITEM.label })
    await expect(footerMenuItem).not.toBeVisible()

    console.log('✅ Test PASSED: Menu deleted successfully')

    // Clear testMenuId so afterEach doesn't try to delete again
    testMenuId = ''
  })

  test('should cancel deletion when clicking cancel in dialog', async ({ page }) => {
    console.log('🧪 Test: Cancel Delete Menu')

    // Navigate to menu list
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Click delete button
    const menuRow = page.locator('tr', { hasText: TEST_MENU.name })
    const deleteButton = menuRow.locator('button[title="Delete menu"]')
    await deleteButton.click()

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 2000 })

    // Click cancel button
    const cancelButton = dialog.locator('button', { hasText: /cancel/i })
    await cancelButton.click()

    // Verify dialog closes
    await expect(dialog).not.toBeVisible()

    // Verify menu still exists in list
    await expect(menuRow).toBeVisible()

    console.log('✅ Test PASSED: Delete cancellation works')
  })

  test.afterEach(async ({ request }) => {
    // Cleanup: Delete the test menu if it still exists
    if (testMenuId) {
      try {
        await request.delete(`${BASE_URL}/api/menus/${testMenuId}`)
        console.log(`✅ Cleaned up test menu: ${testMenuId}`)
      } catch (error) {
        console.log(`⚠️ Failed to cleanup test menu (might already be deleted): ${error}`)
      }
    }
  })
})

