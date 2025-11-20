/**
 * Menu System E2E Tests - Toggle Menu Flags Workflow
 *
 * Priority: 1 (Critical)
 *
 * Tests the menu visibility toggle functionality including:
 * - Toggle "Show in Header" switch
 * - Verify menu appears/disappears in header
 * - Toggle "Show in Footer" switch
 * - Verify menu appears/disappears in footer
 * - Toggle "Enabled" switch
 * - Verify menu appears/disappears everywhere
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Toggle Menu ${timestamp}`,
  slug: `test-toggle-menu-${timestamp}`,
  description: 'Menu for testing toggle functionality',
}

const TEST_ITEM = {
  label: 'Toggle Test Link',
  customUrl: 'https://example.com',
}

test.describe('Workflow 3: Toggle Menu Flags', () => {
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

      // Create a menu item so the menu is visible
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

  test('should toggle menu visibility in header and footer', async ({ page }) => {
    console.log('🧪 Test: Toggle Menu Flags Workflow')

    // Step 1: Navigate to /admin/menus
    console.log('Step 1: Navigate to /admin/menus')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Find the test menu row
    const menuRow = page.locator('tr', { hasText: TEST_MENU.name })
    await expect(menuRow).toBeVisible()

    // Step 2: Toggle "Show in Header" switch OFF
    console.log('Step 2: Toggle "Show in Header" OFF')
    const headerToggle = menuRow.locator('input[type="checkbox"][data-toggle="header"]')
    await headerToggle.uncheck()

    // Wait for the toggle to complete
    await page.waitForTimeout(500)

    // Step 3: Verify menu disappears from header
    console.log('Step 3: Verify menu disappears from header')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const headerNav = page.locator('header nav')
    const headerMenuItem = headerNav.locator('a', { hasText: TEST_ITEM.label })
    await expect(headerMenuItem).not.toBeVisible()

    // Step 4: Toggle "Show in Header" switch ON
    console.log('Step 4: Toggle "Show in Header" ON')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    const menuRow2 = page.locator('tr', { hasText: TEST_MENU.name })
    const headerToggle2 = menuRow2.locator('input[type="checkbox"][data-toggle="header"]')
    await headerToggle2.check()

    await page.waitForTimeout(500)

    // Step 5: Verify menu appears in header
    console.log('Step 5: Verify menu appears in header')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const headerMenuItem2 = page.locator('header nav a', { hasText: TEST_ITEM.label })
    await expect(headerMenuItem2).toBeVisible()

    // Step 6: Toggle "Show in Footer" switch OFF
    console.log('Step 6: Toggle "Show in Footer" OFF')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    const menuRow3 = page.locator('tr', { hasText: TEST_MENU.name })
    const footerToggle = menuRow3.locator('input[type="checkbox"][data-toggle="footer"]')
    await footerToggle.uncheck()

    await page.waitForTimeout(500)

    // Step 7: Verify menu disappears from footer
    console.log('Step 7: Verify menu disappears from footer')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const footerNav = page.locator('footer nav')
    const footerMenuItem = footerNav.locator('a', { hasText: TEST_ITEM.label })
    await expect(footerMenuItem).not.toBeVisible()

    // Step 8: Toggle "Enabled" switch OFF
    console.log('Step 8: Toggle "Enabled" OFF')
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    const menuRow4 = page.locator('tr', { hasText: TEST_MENU.name })
    const enabledToggle = menuRow4.locator('input[type="checkbox"][data-toggle="enabled"]')
    await enabledToggle.uncheck()

    await page.waitForTimeout(500)

    // Step 9: Verify menu disappears everywhere
    console.log('Step 9: Verify menu disappears everywhere')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const anyMenuItem = page.locator('a', { hasText: TEST_ITEM.label })
    await expect(anyMenuItem).not.toBeVisible()

    console.log('✅ Test PASSED: Toggle functionality works correctly')
  })
})

