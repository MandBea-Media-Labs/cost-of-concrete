/**
 * Vitest Global Setup
 *
 * Sets up test environment, mocks, and global utilities.
 * Loaded before all tests via vitest.config.ts setupFiles.
 */

import { vi } from 'vitest'

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

// Set test environment variables
process.env.DATAFORSEO_API_KEY = 'test-api-key-base64-encoded'
process.env.NODE_ENV = 'test'

// =====================================================
// GLOBAL MOCKS
// =====================================================

// Mock consola to prevent noisy logs during tests
vi.mock('consola', () => ({
  consola: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    log: vi.fn(),
  },
}))

// =====================================================
// GLOBAL TEST UTILITIES
// =====================================================

/**
 * Helper to create a mock DataForSEO API response
 */
export function createMockApiResponse<T>(data: T, cost = 0.001): T & { cost: number } {
  return { ...data, cost }
}

/**
 * Helper to create a failed API response
 */
export function createMockErrorResponse(statusCode: number, message: string) {
  return {
    status_code: statusCode,
    status_message: message,
    cost: 0,
    tasks: [],
  }
}

