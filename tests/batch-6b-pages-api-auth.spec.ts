import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3019'
const PAGES_API_URL = `${BASE_URL}/api/pages`
const TEST_PAGE_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Batch 6B: Pages API auth behavior
 *
 * These tests verify that unauthenticated callers cannot access
 * admin-only pages endpoints which are now protected by requireAdmin.
 */
test.describe('Batch 6B: Pages API auth', () => {
  test('unauthenticated users receive 401 for admin pages endpoints', async ({ request }) => {
    // List pages (admin-only)
    const listResponse = await request.get(PAGES_API_URL)
    expect(listResponse.status()).toBe(401)

    // Get single page by ID (admin-only)
    const getResponse = await request.get(`${PAGES_API_URL}/${TEST_PAGE_ID}`)
    expect(getResponse.status()).toBe(401)

    // Create page (admin-only)
    const createResponse = await request.post(PAGES_API_URL, {
      data: {
        title: 'Unauthorized create attempt',
        slug: 'unauthorized-create-attempt',
        full_path: '/unauthorized-create-attempt',
        template: 'default',
        status: 'draft'
      }
    })
    expect(createResponse.status()).toBe(401)

    // Update page (admin-only)
    const updateResponse = await request.patch(`${PAGES_API_URL}/${TEST_PAGE_ID}`, {
      data: {
        title: 'Updated title should not be accepted'
      }
    })
    expect(updateResponse.status()).toBe(401)

    // Delete page (admin-only)
    const deleteResponse = await request.delete(`${PAGES_API_URL}/${TEST_PAGE_ID}`)
    expect(deleteResponse.status()).toBe(401)
  })
})

