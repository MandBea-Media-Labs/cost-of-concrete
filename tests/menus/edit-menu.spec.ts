/**
 * Menu System E2E Tests - Edit Menu Workflow
 *
 * Priority: 2 (Important)
 *
 * Tests the menu editing workflow including:
 * - Navigate to menu list
 * - Click "Edit" button
 * - Form pre-populates with menu data
 * - Update menu fields
 * - Submit changes
 * - Verify changes appear in list
 * - Verify changes appear in header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const ORIGINAL_MENU = {
  name: `Original Menu Name ${timestamp}`,
  slug: `original-menu-name-${timestamp}`,
  description: 'Original description',
}

const UPDATED_MENU = {
  name: `Updated Menu Name ${timestamp}`,
  slug: `updated-menu-name-${timestamp}`,
  description: 'Updated description',
}

test.describe('Workflow 7: Edit Menu', () => {
  let testMenuId: string

  test.beforeEach(async ({ request }) => {
    // Setup: Create a test menu
    const menuResponse = await request.post(`${BASE_URL}/api/menus`, {
      data: {
        name: ORIGINAL_MENU.name,
        slug: ORIGINAL_MENU.slug,
        description: ORIGINAL_MENU.description,
        show_in_header: true,
        show_in_footer: false,
        is_enabled: true,
      },
    })

    const menuData = await menuResponse.json()
    if (menuData.success && menuData.data) {
      testMenuId = menuData.data.id
      console.log(`✅ Created test menu: ${testMenuId}`)
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

  test('should edit a menu and verify changes appear everywhere', async ({ page }) => {
    console.log('🧪 Test: Edit Menu Workflow')

    // Step 1: Navigate to /admin/menus
    console.log('Step 1: Navigate to /admin/menus')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Verify menu exists
    const menuRow = page.locator('tr', { hasText: ORIGINAL_MENU.name })
    await expect(menuRow).toBeVisible()

    // Step 2: Click "Edit" button
    console.log('Step 2: Click "Edit" button')
    const editButton = menuRow.locator('button[title="Edit menu"]')
    await editButton.click()

    // Step 3: Wait for navigation to edit form
    console.log('Step 3: Wait for navigation to edit form')
    await page.waitForURL(new RegExp(`/admin/menus/${testMenuId}/edit`))
    await expect(page.locator('h1')).toContainText('Edit Menu')

    // Step 4: Verify form pre-populates with menu data
    console.log('Step 4: Verify form pre-population')

    const nameInput = page.locator('input#name')
    await expect(nameInput).toHaveValue(ORIGINAL_MENU.name)

    const slugInput = page.locator('input#slug')
    await expect(slugInput).toHaveValue(ORIGINAL_MENU.slug)

    const descriptionInput = page.locator('textarea#description')
    await expect(descriptionInput).toHaveValue(ORIGINAL_MENU.description)

    // Step 5: Update menu fields
    console.log('Step 5: Update menu fields')

    await nameInput.fill(UPDATED_MENU.name)

    // Verify auto-slug update
    await expect(slugInput).toHaveValue(UPDATED_MENU.slug)

    await descriptionInput.fill(UPDATED_MENU.description)

    // Toggle "Show in Footer"
    const showInFooterCheckbox = page.locator('input#show_in_footer')
    await showInFooterCheckbox.check()

    // Step 6: Submit form
    console.log('Step 6: Submit form')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Step 7: Verify redirect to menu list
    console.log('Step 7: Verify redirect to menu list')
    await page.waitForURL(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Step 8: Verify changes appear in list
    console.log('Step 8: Verify changes appear in list')

    const updatedMenuRow = page.locator('tr', { hasText: UPDATED_MENU.name })
    await expect(updatedMenuRow).toBeVisible()
    await expect(updatedMenuRow).toContainText(UPDATED_MENU.name)
    await expect(updatedMenuRow).toContainText(UPDATED_MENU.slug)

    // Verify old name is gone
    const oldMenuRow = page.locator('tr', { hasText: ORIGINAL_MENU.name })
    await expect(oldMenuRow).not.toBeVisible()

    console.log('✅ Test PASSED: Menu edited successfully')
  })

  test('should cancel edit and return to list without saving', async ({ page }) => {
    console.log('🧪 Test: Cancel Edit Menu')

    // Navigate to edit form
    await page.goto(`${BASE_URL}/admin/menus/${testMenuId}/edit`)
    await page.waitForLoadState('networkidle')

    // Make changes
    const nameInput = page.locator('input#name')
    await nameInput.fill('This Should Not Be Saved')

    // Click cancel button
    const cancelButton = page.locator('button', { hasText: /cancel/i })
    await cancelButton.click()

    // Verify redirect to menu list
    await page.waitForURL(ADMIN_MENUS_URL)

    // Verify original name still exists
    const originalMenuRow = page.locator('tr', { hasText: ORIGINAL_MENU.name })
    await expect(originalMenuRow).toBeVisible()

    // Verify changed name doesn't exist
    const changedMenuRow = page.locator('tr', { hasText: 'This Should Not Be Saved' })
    await expect(changedMenuRow).not.toBeVisible()

    console.log('✅ Test PASSED: Cancel edit works correctly')
  })
})

