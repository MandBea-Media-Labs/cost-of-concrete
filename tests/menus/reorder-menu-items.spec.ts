/**
 * Menu System E2E Tests - Reorder Menu Items Workflow
 *
 * Priority: 1 (Critical)
 *
 * Tests the drag-and-drop reordering functionality including:
 * - Navigate to menu items list
 * - Drag an item to a new position
 * - Verify visual feedback during drag
 * - Verify order updates in list
 * - Verify order persists after page refresh
 * - Verify order appears correctly in header/footer
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const ADMIN_MENUS_URL = `${BASE_URL}/admin/menus`

// Test data with timestamp for uniqueness
const timestamp = Date.now()
const TEST_MENU = {
  name: `Test Reorder Menu ${timestamp}`,
  slug: `test-reorder-menu-${timestamp}`,
  description: 'Menu for testing reorder functionality',
}

const TEST_ITEMS = [
  { label: 'First Item', customUrl: 'https://first.com' },
  { label: 'Second Item', customUrl: 'https://second.com' },
  { label: 'Third Item', customUrl: 'https://third.com' },
]

test.describe('Workflow 4: Reorder Menu Items', () => {
  let testMenuId: string
  let itemIds: string[] = []

  test.beforeEach(async ({ request }) => {
    // Setup: Create a test menu with multiple items
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

      // Create multiple menu items
      for (let i = 0; i < TEST_ITEMS.length; i++) {
        const itemResponse = await request.post(`${BASE_URL}/api/menus/${testMenuId}/items`, {
          data: {
            label: TEST_ITEMS[i].label,
            link_type: 'custom',
            custom_url: TEST_ITEMS[i].customUrl,
            is_enabled: true,
            display_order: i,
          },
        })

        const itemData = await itemResponse.json()
        if (itemData.success && itemData.data) {
          itemIds.push(itemData.data.id)
        }
      }
      console.log(`✅ Created ${TEST_ITEMS.length} test menu items`)
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

  test('should reorder menu items via drag-and-drop', async ({ page }) => {
    console.log('🧪 Test: Reorder Menu Items Workflow')

    // Step 1: Navigate to menu items list
    console.log('Step 1: Navigate to menu items list')
    await page.goto(`${BASE_URL}/admin/menus/${testMenuId}/items`)
    await page.waitForLoadState('networkidle')

    // Verify all items are visible in correct order
    const itemsList = page.locator('tbody tr')
    await expect(itemsList).toHaveCount(TEST_ITEMS.length)

    // Verify initial order
    for (let i = 0; i < TEST_ITEMS.length; i++) {
      const row = itemsList.nth(i)
      await expect(row).toContainText(TEST_ITEMS[i].label)
    }
    console.log('✅ Initial order verified')

    // Step 2: Drag the third item to the first position
    console.log('Step 2: Drag third item to first position')

    // Note: Drag-and-drop implementation depends on your UI library
    // This is a generic approach that might need adjustment
    const thirdItem = page.locator('tr', { hasText: TEST_ITEMS[2].label })
    const firstItem = page.locator('tr', { hasText: TEST_ITEMS[0].label })

    // Perform drag and drop
    await thirdItem.dragTo(firstItem)

    // Wait for reorder API call to complete
    await page.waitForTimeout(1000)

    // Step 3: Verify visual feedback and order update
    console.log('Step 3: Verify order updated in list')

    // Expected new order: Third, First, Second
    const updatedList = page.locator('tbody tr')
    await expect(updatedList.nth(0)).toContainText(TEST_ITEMS[2].label)
    await expect(updatedList.nth(1)).toContainText(TEST_ITEMS[0].label)
    await expect(updatedList.nth(2)).toContainText(TEST_ITEMS[1].label)

    // Step 4: Refresh page and verify order persists
    console.log('Step 4: Refresh page and verify order persists')
    await page.reload()
    await page.waitForLoadState('networkidle')

    const persistedList = page.locator('tbody tr')
    await expect(persistedList.nth(0)).toContainText(TEST_ITEMS[2].label)
    await expect(persistedList.nth(1)).toContainText(TEST_ITEMS[0].label)
    await expect(persistedList.nth(2)).toContainText(TEST_ITEMS[1].label)

    // Step 5: Verify order appears correctly in header
    console.log('Step 5: Verify order in header')
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    const headerLinks = page.locator('header nav a')

    // Verify the new order in header
    // Note: This assumes the menu items are rendered in order
    const linkTexts = await headerLinks.allTextContents()
    const menuLinkTexts = linkTexts.filter(text =>
      TEST_ITEMS.some(item => text.includes(item.label))
    )

    expect(menuLinkTexts[0]).toContain(TEST_ITEMS[2].label)
    expect(menuLinkTexts[1]).toContain(TEST_ITEMS[0].label)
    expect(menuLinkTexts[2]).toContain(TEST_ITEMS[1].label)

    console.log('✅ Test PASSED: Reorder functionality works correctly')
  })
})

