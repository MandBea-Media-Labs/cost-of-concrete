/**
 * JSON Repair Utility
 *
 * Handles malformed JSON responses from LLMs by attempting various repair strategies.
 * Common issues include:
 * - JSON wrapped in markdown code blocks
 * - Trailing commas
 * - Unescaped quotes
 * - Missing closing brackets
 */

import { consola } from 'consola'
import type { z } from 'zod'

/**
 * Result of JSON repair attempt
 */
export interface JSONRepairResult<T = unknown> {
  /** Whether repair was successful */
  success: boolean
  /** Parsed and validated data (if successful) */
  data?: T
  /** Error message (if failed) */
  error?: string
  /** Which repair strategy succeeded */
  strategy?: string
}

/**
 * Extract JSON from markdown code blocks
 * Handles: ```json\n{...}\n``` or ```\n{...}\n```
 */
function extractFromMarkdown(text: string): string {
  // Try to extract from code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find JSON object or array boundaries
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/m)
  if (jsonMatch) {
    return jsonMatch[1].trim()
  }

  return text.trim()
}

/**
 * Remove trailing commas from JSON string
 */
function removeTrailingCommas(text: string): string {
  // Remove trailing commas before closing brackets/braces
  return text
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/,(\s*$)/gm, '')
}

/**
 * Attempt to fix common JSON formatting issues
 */
function fixCommonIssues(text: string): string {
  let fixed = text

  // Remove trailing commas
  fixed = removeTrailingCommas(fixed)

  // Fix unescaped newlines in strings (common LLM issue)
  fixed = fixed.replace(/([^\\])\n/g, '$1\\n')

  // Remove BOM if present
  fixed = fixed.replace(/^\uFEFF/, '')

  return fixed
}

/**
 * Repair and validate JSON against a Zod schema
 *
 * Attempts multiple repair strategies in order:
 * 1. Parse as-is
 * 2. Extract from markdown code blocks
 * 3. Fix common issues (trailing commas, etc.)
 * 4. Combination of extraction + fixes
 *
 * @param text - Raw text that may contain JSON
 * @param schema - Zod schema to validate against
 * @returns Repair result with parsed data or error
 */
export function repairJSON<T>(text: string, schema: z.ZodSchema<T>): JSONRepairResult<T> {
  const strategies: Array<{ name: string; transform: (t: string) => string }> = [
    { name: 'as-is', transform: (t) => t },
    { name: 'extract-markdown', transform: extractFromMarkdown },
    { name: 'fix-common-issues', transform: fixCommonIssues },
    { name: 'extract-and-fix', transform: (t) => fixCommonIssues(extractFromMarkdown(t)) },
  ]

  const errors: Array<{ strategy: string; error: string }> = []

  for (const strategy of strategies) {
    try {
      const transformed = strategy.transform(text)
      const parsed = JSON.parse(transformed)
      const validated = schema.parse(parsed)

      consola.debug(`JSON repair succeeded with strategy: ${strategy.name}`)
      return {
        success: true,
        data: validated,
        strategy: strategy.name,
      }
    } catch (error) {
      // Capture the error for debugging
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push({ strategy: strategy.name, error: errorMsg })
      continue
    }
  }

  // All strategies failed - log detailed errors
  const errorMsg = 'Failed to repair JSON after trying all strategies'
  consola.error(errorMsg, { textPreview: text.substring(0, 200) })
  consola.info('JSON repair errors by strategy:', errors)

  // Log the end of the text to see if it's truncated
  consola.info('JSON text ending (last 500 chars):', text.substring(text.length - 500))

  return {
    success: false,
    error: errorMsg,
  }
}

/**
 * Validate JSON string against schema without repair attempts
 * Use this when you want strict validation without auto-repair
 */
export function validateJSON<T>(text: string, schema: z.ZodSchema<T>): JSONRepairResult<T> {
  try {
    const parsed = JSON.parse(text)
    const validated = schema.parse(parsed)

    return {
      success: true,
      data: validated,
      strategy: 'direct-parse',
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'JSON validation failed'
    return {
      success: false,
      error: errorMsg,
    }
  }
}

