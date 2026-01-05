/**
 * Badge SVG Generation Utility
 *
 * Generates verified contractor badge SVGs for embedding.
 * Uses #03a71e green to match the verified-badge.vue component.
 */

/**
 * Generate the verified contractor badge SVG
 */
export function generateBadgeSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
  <rect width="200" height="40" rx="4" fill="#f0fdf4"/>
  <circle cx="20" cy="20" r="10" fill="#03a71e"/>
  <path d="M16 20l3 3 5-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="38" y="25" font-family="system-ui, sans-serif" font-size="14" font-weight="500" fill="#03a71e">Verified Contractor</text>
</svg>`
}

/**
 * Generate a generic/placeholder badge SVG for invalid tokens
 */
export function generatePlaceholderBadgeSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="40" viewBox="0 0 200 40">
  <rect width="200" height="40" rx="4" fill="#f5f5f5"/>
  <text x="100" y="25" font-family="system-ui, sans-serif" font-size="12" fill="#999" text-anchor="middle">Cost of Concrete</text>
</svg>`
}
