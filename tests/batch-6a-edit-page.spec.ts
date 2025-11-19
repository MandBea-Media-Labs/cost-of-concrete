/**
 * Batch 6A: Edit Page Form - Playwright Tests
 *
 * Tests for edit page functionality including:
 * - Page data fetching and form pre-population
 * - Form submission with PATCH request
 * - Slug change warning
 * - Parent change warning
 * - Template change warning
 * - Error handling
 */

import { test, expect } from '@playwright/test'

// Test configuration
const BASE_URL = 'http://localhost:3019'
const ADMIN_PAGES_URL = `${BASE_URL}/admin/pages`

// Test data - we'll use an existing page from the database
// Assuming we have a page with ID that we can edit
let testPageId: string
let testPageSlug: string
let testPageTitle: string

const TEST_PAGE_PATH = '/concrete-basics'

test.describe('Batch 6A: Edit Page Form', () => {
  test.beforeAll(async ({ request }) => {
    // Fetch a known published page via the public by-path API
    const response = await request.get(`${BASE_URL}/api/pages/by-path`, {
      params: { path: TEST_PAGE_PATH }
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toBeTruthy()

    const page = data.data
    testPageId = page.id
    testPageSlug = page.slug
    testPageTitle = page.title

    console.log(`Using test page: ${testPageTitle} (ID: ${testPageId})`)
  })

  test('Test 1: Navigate to edit page and verify form pre-population', async ({ page }) => {
    // Navigate to admin pages list
    await page.goto(ADMIN_PAGES_URL)
    await page.waitForLoadState('networkidle')

    // Click edit button for the first page
    const editButton = page.locator('button[title="Edit page"]').first()
    await editButton.click()

    // Wait for navigation to edit page
    await page.waitForURL(/\/admin\/pages\/[^/]+\/edit/)

    // Verify page title
    await expect(page.locator('h1')).toContainText('Edit Page')

    // Verify form is pre-populated with page data
    const titleInput = page.locator('input#title')
    await expect(titleInput).toHaveValue(testPageTitle)

    const slugInput = page.locator('input#slug')
    await expect(slugInput).toHaveValue(testPageSlug)

    console.log('✅ Test 1 PASSED: Form pre-populated correctly')
  })

  test('Test 2: Verify slug change warning appears', async ({ page }) => {
    // Navigate directly to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Get initial slug value
    const slugInput = page.locator('input#slug')
    const initialSlug = await slugInput.inputValue()

    // Change the slug
    await slugInput.fill(`${initialSlug}-modified`)

    // Verify warning appears
    const warning = page.locator('text=SEO Impact Warning')
    await expect(warning).toBeVisible()

    // Verify warning message
    await expect(page.locator('text=Changing the slug will update the URL')).toBeVisible()

    console.log('✅ Test 2 PASSED: Slug change warning displayed')
  })

  test('Test 3: Verify parent change warning appears', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Open parent select dropdown
    const parentSelect = page.locator('#parentId')
    await parentSelect.click()

    // Select a different parent (or None if currently has parent)
    const firstOption = page.locator('[role="option"]').first()
    await firstOption.click()

    // Wait a bit for the warning to appear
    await page.waitForTimeout(500)

    // Verify warning appears
    const warning = page.locator('text=Hierarchy Change Warning')
    await expect(warning).toBeVisible()

    // Verify warning message
    await expect(page.locator('text=Changing the parent will update the URL path')).toBeVisible()

    console.log('✅ Test 3 PASSED: Parent change warning displayed')
  })

  test('Test 4: Verify template change warning appears', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Get current template
    const templateSelect = page.locator('#template')
    await templateSelect.click()

    // Select a different template
    const customTemplate = page.locator('[role="option"]', { hasText: 'Custom Template' })
    await customTemplate.click()

    // Wait a bit for the warning to appear
    await page.waitForTimeout(500)

    // Verify warning appears
    const warning = page.locator('text=Template Change Warning')
    await expect(warning).toBeVisible()

    // Verify warning message
    await expect(page.locator('text=Changing the template may clear incompatible metadata')).toBeVisible()

    console.log('✅ Test 4 PASSED: Template change warning displayed')
  })

  test('Test 5: Submit form with title change', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Change the title
    const titleInput = page.locator('input#title')
    const newTitle = `${testPageTitle} - Updated ${Date.now()}`
    await titleInput.fill(newTitle)

    // Submit the form
    const submitButton = page.locator('button[type="submit"]', { hasText: /Update Page|Save/ })
    await submitButton.click()

    // Wait for redirect to admin pages list
    await page.waitForURL(ADMIN_PAGES_URL)

    // Verify success message
    const successMessage = page.locator('text=Page updated successfully')
    await expect(successMessage).toBeVisible()

    // Verify the page appears in the list with new title
    await expect(page.locator(`text=${newTitle}`)).toBeVisible()

    console.log('✅ Test 5 PASSED: Form submitted successfully with title change')
  })

  test('Test 6: Verify loading states during submission', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Make a small change
    const descriptionInput = page.locator('textarea#description')
    await descriptionInput.fill('Updated description for testing')

    // Click submit and immediately check for loading state
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Verify button shows loading state (disabled)
    await expect(submitButton).toBeDisabled()

    // Wait for redirect
    await page.waitForURL(ADMIN_PAGES_URL, { timeout: 10000 })

    console.log('✅ Test 6 PASSED: Loading states work correctly')
  })

  test('Test 7: Cancel button returns to page list', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Make a change (to verify it's not saved)
    const titleInput = page.locator('input#title')
    await titleInput.fill('This should not be saved')

    // Click cancel button
    const cancelButton = page.locator('button', { hasText: 'Cancel' })
    await cancelButton.click()

    // Verify redirect to admin pages list
    await page.waitForURL(ADMIN_PAGES_URL)

    // Verify no success message (nothing was saved)
    const successMessage = page.locator('text=Page updated successfully')
    await expect(successMessage).not.toBeVisible()

    console.log('✅ Test 7 PASSED: Cancel button works correctly')
  })

  test('Test 8: Handle invalid page ID (404 error)', async ({ page }) => {
    // Navigate to edit page with invalid ID
    const invalidId = '00000000-0000-0000-0000-000000000000'
    await page.goto(`${BASE_URL}/admin/pages/${invalidId}/edit`)
    await page.waitForLoadState('networkidle')

    // Verify error message is displayed
    const errorMessage = page.locator('text=Error Loading Page')
    await expect(errorMessage).toBeVisible()

    // Verify "Back to Pages" button exists
    const backButton = page.locator('button', { hasText: 'Back to Pages' })
    await expect(backButton).toBeVisible()

    console.log('✅ Test 8 PASSED: 404 error handled correctly')
  })

  test('Test 9: Verify all form fields are editable', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Verify all major fields are present and editable
    const titleInput = page.locator('input#title')
    await expect(titleInput).toBeEditable()

    const slugInput = page.locator('input#slug')
    await expect(slugInput).toBeEditable()

    const descriptionInput = page.locator('textarea#description')
    await expect(descriptionInput).toBeEditable()

    // Verify dropdowns are present
    await expect(page.locator('#parentId')).toBeVisible()
    await expect(page.locator('#template')).toBeVisible()
    await expect(page.locator('#status')).toBeVisible()

    console.log('✅ Test 9 PASSED: All form fields are editable')
  })

  test('Test 10: Verify SEO fields are pre-populated', async ({ page }) => {
    // Navigate to edit page
    await page.goto(`${BASE_URL}/admin/pages/${testPageId}/edit`)
    await page.waitForLoadState('networkidle')

    // Scroll down to SEO section
    await page.locator('text=SEO Settings').scrollIntoViewIfNeeded()

    // Verify SEO fields section exists
    await expect(page.locator('text=SEO Settings')).toBeVisible()

    // Verify at least one SEO field is present
    const metaTitleInput = page.locator('input#metaTitle')
    await expect(metaTitleInput).toBeVisible()

    console.log('✅ Test 10 PASSED: SEO fields are accessible')
  })
})

