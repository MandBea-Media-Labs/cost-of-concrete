/**
 * Menu System E2E Tests - Create Menu Item Workflow
 *
 * Priority: 1 (Critical)
 *
 * Tests the complete menu item creation workflow including:
 * - Navigation to menu items list
 * - Click "Add Parent Item" button
 * - Form filling and validation
 * - Menu item creation via API
 * - Redirect after creation
 * - Item appears in admin list
 * - Item appears in public header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Menu for Items ${timestamp}`,
  slug: `test-menu-for-items-${timestamp}`,
  description: 'Test menu for item creation',
}

const TEST_ITEM = {
  label: 'Home',
  linkType: 'custom',
  customUrl: 'https://example.com',
}

test.describe('Workflow 2: Create Menu Item', () => {
  let testMenuId: string
  let createdItemId: string

  test.beforeEach(async ({ request }) => {
    // Setup: Create a test menu first
    const response = await request.post(`${BASE_URL}/api/menus`, {
      data: {
        name: TEST_MENU.name,
        slug: TEST_MENU.slug,
        description: TEST_MENU.description,
        show_in_header: true,
        show_in_footer: false,
        is_enabled: true,
      },
    })

    const data = await response.json()
    if (data.success && data.data) {
      testMenuId = data.data.id
      console.log(`✅ Created test menu: ${testMenuId}`)
    } else {
      throw new Error('Failed to create test menu')
    }
  })

  test.afterEach(async ({ request }) => {
    // Cleanup: Delete the test menu (will cascade delete items)
    if (testMenuId) {
      try {
        await request.delete(`${BASE_URL}/api/menus/${testMenuId}`)
        console.log(`✅ Cleaned up test menu: ${testMenuId}`)
      } catch (error) {
        console.log(`⚠️ Failed to cleanup test menu: ${error}`)
      }
    }
  })

  test('should create a new menu item and verify it appears in list and header', async ({ page }) => {
    console.log('🧪 Test: Create Menu Item Workflow')

    // Step 1: Navigate to /admin/menus
    console.log('Step 1: Navigate to /admin/menus')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Step 2: Click "Items" button on the test menu
    console.log('Step 2: Click "Items" button')
    const menuRow = page.locator('tr', { hasText: TEST_MENU.name })
    const itemsButton = menuRow.locator('button[title="Manage items"]')
    await itemsButton.click()

    // Step 3: Wait for navigation to items list
    console.log('Step 3: Wait for navigation to items list')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/items`))
    await page.waitForLoadState('networkidle')

    // Verify we're on the items page
    await expect(page.locator('h1')).toContainText('Menu Items')

    // Step 4: Click "Add Parent Item" button
    console.log('Step 4: Click "Add Parent Item" button')
    const addParentButton = page.locator('button', { hasText: 'Add Parent Item' })
    await addParentButton.click()

    // Step 5: Wait for navigation to new item form
    console.log('Step 5: Wait for navigation to new item form')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/items/new`))
    await expect(page.locator('h1')).toContainText('Create Menu Item')

    // Step 6: Fill in form
    console.log('Step 6: Fill in form')

    // Fill in label
    const labelInput = page.locator('input#label')
    await labelInput.fill(TEST_ITEM.label)

    // Select link type: Custom URL
    const customUrlRadio = page.locator('input[type="radio"][value="custom"]')
    await customUrlRadio.check()

    // Fill in custom URL
    const customUrlInput = page.locator('input#custom_url')
    await customUrlInput.fill(TEST_ITEM.customUrl)

    // Check "Enabled"
    const enabledCheckbox = page.locator('input#is_enabled')
    await enabledCheckbox.check()

    // Step 7: Submit form
    console.log('Step 7: Submit form')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Step 8: Verify redirect to items list
    console.log('Step 8: Verify redirect to items list')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/items`))
    await page.waitForLoadState('networkidle')

    // Step 9: Verify item appears in list
    console.log('Step 9: Verify item appears in list')
    const itemRow = page.locator('tr', { hasText: TEST_ITEM.label })
    await expect(itemRow).toBeVisible()
    await expect(itemRow).toContainText(TEST_ITEM.label)
    await expect(itemRow).toContainText('Custom URL')

    // Step 10: Verify item appears in header menu
    console.log('Step 10: Verify item appears in header menu')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    // Check if header contains the menu item
    const headerNav = page.locator('header nav')
    const menuItem = headerNav.locator('a', { hasText: TEST_ITEM.label })
    await expect(menuItem).toBeVisible()

    // Verify the link has correct href
    await expect(menuItem).toHaveAttribute('href', TEST_ITEM.customUrl)

    console.log('✅ Test PASSED: Menu item created successfully')
  })
})

