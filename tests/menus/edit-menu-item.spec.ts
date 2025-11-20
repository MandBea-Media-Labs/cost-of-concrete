/**
 * Menu System E2E Tests - Edit Menu Item Workflow
 *
 * Priority: 2 (Important)
 *
 * Tests the menu item editing workflow including:
 * - Navigate to menu items list
 * - Click "Edit" button on an item
 * - Form pre-populates with item data
 * - Update item fields
 * - Submit changes
 * - Verify changes appear in list
 * - Verify changes appear in header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Edit Item Menu ${timestamp}`,
  slug: `test-edit-item-menu-${timestamp}`,
  description: 'Menu for testing item editing',
}

const ORIGINAL_ITEM = {
  label: 'Original Label',
  customUrl: 'https://original.com',
}

const UPDATED_ITEM = {
  label: 'Updated Label',
  customUrl: 'https://updated.com',
}

test.describe('Workflow 8: Edit Menu Item', () => {
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
      console.log(`✅ Created test menu: ${testMenuId}`)

      // Create a menu item
      const itemResponse = await request.post(`${BASE_URL}/api/menus/${testMenuId}/items`, {
        data: {
          label: ORIGINAL_ITEM.label,
          link_type: 'custom',
          custom_url: ORIGINAL_ITEM.customUrl,
          is_enabled: true,
          display_order: 0,
        },
      })

      const itemData = await itemResponse.json()
      if (itemData.success && itemData.data) {
        testItemId = itemData.data.id
        console.log(`✅ Created test item: ${testItemId}`)
      }
    } else {
      throw new Error('Failed to create test menu')
    }
  })

  test.afterEach(async ({ request }) => {
    // Cleanup: Delete the test menu
    if (testMenuId) {
      try {
        await request.delete(`${BASE_URL}/api/menus/${testMenuId}`)
        console.log(`✅ Cleaned up test menu: ${testMenuId}`)
      } catch (error) {
        console.log(`⚠️ Failed to cleanup test menu: ${error}`)
      }
    }
  })

  test('should edit a menu item and verify changes appear everywhere', async ({ page }) => {
    console.log('🧪 Test: Edit Menu Item Workflow')

    // Step 1: Navigate to menu items list
    console.log('Step 1: Navigate to menu items list')
    await page.goto(`${BASE_URL}/admin/menus/${testMenuId}/items`)
    await page.waitForLoadState('networkidle')

    // Verify item exists
    const itemRow = page.locator('tr', { hasText: ORIGINAL_ITEM.label })
    await expect(itemRow).toBeVisible()

    // Step 2: Click "Edit" button
    console.log('Step 2: Click "Edit" button')
    const editButton = itemRow.locator('button[title="Edit item"]')
    await editButton.click()

    // Step 3: Wait for navigation to edit form
    console.log('Step 3: Wait for navigation to edit form')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/items/${testItemId}/edit`))
    await expect(page.locator('h1')).toContainText('Edit Menu Item')

    // Step 4: Verify form pre-populates with item data
    console.log('Step 4: Verify form pre-population')

    const labelInput = page.locator('input#label')
    await expect(labelInput).toHaveValue(ORIGINAL_ITEM.label)

    const customUrlInput = page.locator('input#custom_url')
    await expect(customUrlInput).toHaveValue(ORIGINAL_ITEM.customUrl)

    // Step 5: Update item fields
    console.log('Step 5: Update item fields')

    await labelInput.fill(UPDATED_ITEM.label)
    await customUrlInput.fill(UPDATED_ITEM.customUrl)

    // Step 6: Submit form
    console.log('Step 6: Submit form')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Step 7: Verify redirect to items list
    console.log('Step 7: Verify redirect to items list')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/items`))
    await page.waitForLoadState('networkidle')

    // Step 8: Verify changes appear in list
    console.log('Step 8: Verify changes appear in list')

    const updatedItemRow = page.locator('tr', { hasText: UPDATED_ITEM.label })
    await expect(updatedItemRow).toBeVisible()
    await expect(updatedItemRow).toContainText(UPDATED_ITEM.label)

    // Verify old label is gone
    const oldItemRow = page.locator('tr', { hasText: ORIGINAL_ITEM.label })
    await expect(oldItemRow).not.toBeVisible()

    // Step 9: Verify changes appear in header
    console.log('Step 9: Verify changes appear in header')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const headerLink = page.locator('header nav a', { hasText: UPDATED_ITEM.label })
    await expect(headerLink).toBeVisible()
    await expect(headerLink).toHaveAttribute('href', UPDATED_ITEM.customUrl)

    // Verify old label is not in header
    const oldHeaderLink = page.locator('header nav a', { hasText: ORIGINAL_ITEM.label })
    await expect(oldHeaderLink).not.toBeVisible()

    console.log('✅ Test PASSED: Menu item edited successfully')
  })
})

