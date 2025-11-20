/**
 * Authentication Setup for Playwright Tests
 *
 * This file handles authentication once and saves the state
 * so all tests can reuse it without logging in repeatedly.
 */

import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  console.log('🔐 Authenticating user...')

  // Navigate to login page
  await page.goto('http://localhost:3019/admin/login')
  await page.waitForLoadState('networkidle')

  // Fill in login form
  const emailInput = page.locator('input[type="email"]')
  await emailInput.fill('andy@ridedrivemedia.com')

  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.fill('password')

  // Submit form - click the Button component with "Sign In" text
  const submitButton = page.locator('button', { hasText: 'Sign In' })
  await submitButton.click()

  // Wait for redirect after login (usually to /admin/pages)
  await page.waitForURL(/\/admin\/pages/, { timeout: 10000 })

  // Wait for page to fully load and auth to settle
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)

  // Verify we're actually logged in by checking for admin content
  await expect(page.locator('h1')).toContainText('Pages')

  console.log('✅ Authentication successful')

  // Save authentication state (cookies + localStorage)
  await page.context().storageState({ path: authFile })
})

