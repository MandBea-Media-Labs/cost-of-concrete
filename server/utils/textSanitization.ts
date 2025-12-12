/**
 * Text Sanitization Utilities
 *
 * Provides functions for cleaning and normalizing text data during imports.
 * Used primarily by ImportService for contractor data.
 *
 * @see BAM-252 Import Service Refactoring
 */

/**
 * Remove punctuation characters from the start and end of a company name.
 *
 * @param name - The company name to sanitize
 * @returns The sanitized company name with leading/trailing punctuation removed
 *
 * @example
 * sanitizeCompanyName("Cruzen Concrete Inc,") // "Cruzen Concrete Inc"
 * sanitizeCompanyName("...ABC Company...") // "ABC Company"
 * sanitizeCompanyName("Normal Name") // "Normal Name"
 */
export function sanitizeCompanyName(name: string | null | undefined): string {
  if (!name) return ''

  // Trim whitespace first
  let result = name.trim()

  // Remove punctuation from start and end
  // Matches: . , ; : ! ? ' " ` ~ - _ ( ) [ ] { } < > / \ | @ # $ % ^ & * + =
  const punctuationPattern = /^[.,;:!?'""`~\-_()[\]{}<>/\\|@#$%^&*+=\s]+|[.,;:!?'""`~\-_()[\]{}<>/\\|@#$%^&*+=\s]+$/g

  result = result.replace(punctuationPattern, '')

  return result.trim()
}

/**
 * Check if a string is all lowercase letters (ignoring non-letter characters).
 */
function isAllLowercase(str: string): boolean {
  const letters = str.replace(/[^a-zA-Z]/g, '')
  if (letters.length === 0) return false
  return letters === letters.toLowerCase()
}

/**
 * Check if a string is all uppercase letters (ignoring non-letter characters).
 */
function isAllUppercase(str: string): boolean {
  const letters = str.replace(/[^a-zA-Z]/g, '')
  if (letters.length === 0) return false
  return letters === letters.toUpperCase()
}

/**
 * Convert a string to title case (first letter of each word capitalized).
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Normalize the case of a company name.
 * - If ALL LOWERCASE: convert to Title Case
 * - If ALL UPPERCASE: convert to Title Case
 * - If Mixed Case: leave unchanged
 *
 * @param name - The company name to normalize
 * @returns The case-normalized company name
 *
 * @example
 * normalizeCase("harbor stone concrete") // "Harbor Stone Concrete"
 * normalizeCase("ABC CONCRETE LLC") // "Abc Concrete Llc"
 * normalizeCase("Mixed Case Name") // "Mixed Case Name" (unchanged)
 */
export function normalizeCase(name: string | null | undefined): string {
  if (!name) return ''

  const trimmed = name.trim()
  if (trimmed.length === 0) return ''

  // Check if all lowercase or all uppercase
  if (isAllLowercase(trimmed) || isAllUppercase(trimmed)) {
    return toTitleCase(trimmed)
  }

  // Mixed case - return as-is
  return trimmed
}

/**
 * Remove query parameters from a website URL.
 *
 * @param url - The URL to sanitize
 * @returns The URL without query parameters
 *
 * @example
 * sanitizeWebsiteUrl("www.example.com/?utm_campaign=gmb") // "www.example.com/"
 * sanitizeWebsiteUrl("https://example.com/page?foo=bar") // "https://example.com/page"
 * sanitizeWebsiteUrl("example.com") // "example.com"
 */
export function sanitizeWebsiteUrl(url: string | null | undefined): string {
  if (!url) return ''

  const trimmed = url.trim()
  if (trimmed.length === 0) return ''

  // Find the query string start and remove everything after it
  const queryIndex = trimmed.indexOf('?')
  if (queryIndex === -1) {
    return trimmed
  }

  return trimmed.substring(0, queryIndex)
}

/**
 * Apply all sanitization to a company name in one call.
 * 1. Sanitize (remove punctuation from start/end)
 * 2. Normalize case (title case if all lowercase or all uppercase)
 *
 * @param name - The company name to process
 * @returns The fully sanitized and normalized company name
 */
export function processCompanyName(name: string | null | undefined): string {
  return normalizeCase(sanitizeCompanyName(name))
}

