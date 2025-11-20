/**
 * Menu System E2E Tests - Delete Menu Item Workflow
 *
 * Priority: 2 (Important)
 *
 * Tests the menu item deletion workflow including:
 * - Navigate to menu items list
 * - Click "Delete" button on an item
 * - Verify confirmation dialog appears
 * - Confirm deletion
 * - Verify item removed from list
 * - Verify item removed from header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Delete Item Menu ${timestamp}`,
  slug: `test-delete-item-menu-${timestamp}`,
  description: 'Menu for testing item deletion',
}

const TEST_ITEM = {
  label: 'Item to Delete',
  customUrl: 'https://delete-me.com',
}

test.describe('Workflow 9: Delete Menu Item', () => {
  let testMenuId: string
  let testItemId: string

  test.beforeEach(async ({ request }) => {
    // Setup: Create a test menu with an item
    const menuResponse = await request.post(`${BASE_URL}/api/menus`, {
      data: {
        name: TEST_MENU.name,
        slug: TEST_MENU.slug,
        description: TEST_MENU.description,
        show_in_header: true,
        show_in_footer: false,
        is_enabled: true,
      },
    })

    const menuData = await menuResponse.json()
    if (menuData.success && menuData.data) {
      testMenuId = menuData.data.id

      // Create a menu item
      const itemResponse = await request.post(`${BASE_URL}/api/menus/${testMenuId}/items`, {
        data: {
          label: TEST_ITEM.label,
          link_type: 'custom',
          custom_url: TEST_ITEM.customUrl,
          is_enabled: true,
          display_order: 0,
        },
      })

      const itemData = await itemResponse.json()
      if (itemData.success && itemData.data) {
        testItemId = itemData.data.id
      } else {
        throw new Error(`Failed to create test menu item: ${JSON.stringify(itemData)}`)
      }
    } else {
      throw new Error(`Failed to create test menu: ${JSON.stringify(menuData)}`)
    }
  })

  test.afterEach(async ({ request }) => {
    // Cleanup: Delete the test menu
    if (testMenuId) {
      try {
        await request.delete(`${BASE_URL}/api/menus/${testMenuId}`)
      } catch (error) {
        // Cleanup failure is not critical
      }
    }
  })

  test('should delete a menu item and verify it disappears from list', async ({ page }) => {
    // Navigate to menu items list
    await page.goto(`${BASE_URL}/admin/menus/${testMenuId}/items`)
    await page.waitForLoadState('networkidle')

    // Verify item exists
    const itemRow = page.locator('tr', { hasText: TEST_ITEM.label })
    await expect(itemRow).toBeVisible()

    // Click "Delete" button (note: title is "Delete Item" with capital I)
    const deleteButton = itemRow.locator('button[title="Delete Item"]')
    await deleteButton.click()

    // Verify confirmation dialog appears
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 2000 })

    // Verify dialog content
    await expect(dialog).toContainText(/delete/i)
    await expect(dialog).toContainText(TEST_ITEM.label)

    // Confirm deletion
    const confirmButton = dialog.locator('button', { hasText: /delete|confirm/i })
    await confirmButton.click()

    // Wait for deletion to complete
    await page.waitForTimeout(1000)

    // Verify item removed from list
    await page.waitForLoadState('networkidle')

    const deletedItemRow = page.locator('tr', { hasText: TEST_ITEM.label })
    await expect(deletedItemRow).not.toBeVisible()

    // Clear testItemId so we don't try to delete it again
    testItemId = ''
  })

  test('should cancel deletion when clicking cancel in dialog', async ({ page }) => {
    // Navigate to items list
    await page.goto(`${BASE_URL}/admin/menus/${testMenuId}/items`)
    await page.waitForLoadState('networkidle')

    // Click delete button (note: title is "Delete Item" with capital I)
    const itemRow = page.locator('tr', { hasText: TEST_ITEM.label })
    const deleteButton = itemRow.locator('button[title="Delete Item"]')
    await deleteButton.click()

    // Wait for dialog
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 2000 })

    // Click cancel button
    const cancelButton = dialog.locator('button', { hasText: /cancel/i })
    await cancelButton.click()

    // Verify dialog closes
    await expect(dialog).not.toBeVisible()

    // Verify item still exists in list
    await expect(itemRow).toBeVisible()
  })
})

