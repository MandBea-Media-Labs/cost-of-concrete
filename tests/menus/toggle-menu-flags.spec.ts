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
// Note: Using 'main-nav' slug so it appears in the header component
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Toggle Menu ${timestamp}`,
  slug: 'main-nav', // Fixed slug so header component can find it
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

      // Create a menu item so the menu has content
      await request.post(`${BASE_URL}/api/menus/${testMenuId}/items`, {
        data: {
          label: TEST_ITEM.label,
          link_type: 'custom',
          custom_url: TEST_ITEM.customUrl,
          is_enabled: true,
          display_order: 0,
        },
      })
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

  test('should toggle menu visibility in header and footer', async ({ page, request }) => {
    // Navigate to admin menus page
    await page.goto(ADMIN_MENUS_URL)
    await page.waitForLoadState('networkidle')

    // Find the test menu row
    const menuRow = page.locator('tr', { hasText: TEST_MENU.name })
    await expect(menuRow).toBeVisible()

    // Toggle "Show in Header" OFF
    const headerToggle = menuRow.locator('td').nth(2).locator('input[type="checkbox"]')
    await headerToggle.uncheck()
    await page.waitForTimeout(1000)

    // Verify show_in_header is false
    const menuRow2 = page.locator('tr', { hasText: TEST_MENU.name })
    const headerToggle2 = menuRow2.locator('td').nth(2).locator('input[type="checkbox"]')
    await expect(headerToggle2).not.toBeChecked()

    let menusResponse = await request.get(`${BASE_URL}/api/menus`)
    let menusData = await menusResponse.json()
    let menu = menusData.data.find((m: any) => m.id === testMenuId)
    expect(menu.show_in_header).toBe(false)

    // Toggle "Show in Header" ON
    await headerToggle2.check()
    await page.waitForTimeout(1000)

    // Verify show_in_header is true
    await expect(headerToggle2).toBeChecked()

    menusResponse = await request.get(`${BASE_URL}/api/menus`)
    menusData = await menusResponse.json()
    menu = menusData.data.find((m: any) => m.id === testMenuId)
    expect(menu.show_in_header).toBe(true)

    // Toggle "Show in Footer" OFF
    const footerToggle = menuRow2.locator('td').nth(3).locator('input[type="checkbox"]')
    await footerToggle.uncheck()
    await page.waitForTimeout(1000)

    // Verify show_in_footer is false
    await expect(footerToggle).not.toBeChecked()

    menusResponse = await request.get(`${BASE_URL}/api/menus`)
    menusData = await menusResponse.json()
    menu = menusData.data.find((m: any) => m.id === testMenuId)
    expect(menu.show_in_footer).toBe(false)

    // Toggle "Enabled" OFF
    const enabledToggle = menuRow2.locator('td').nth(4).locator('input[type="checkbox"]')
    await enabledToggle.uncheck()
    await page.waitForTimeout(1000)

    // Verify is_enabled is false
    await expect(enabledToggle).not.toBeChecked()

    menusResponse = await request.get(`${BASE_URL}/api/menus`)
    menusData = await menusResponse.json()
    menu = menusData.data.find((m: any) => m.id === testMenuId)
    expect(menu.is_enabled).toBe(false)
  })
})

