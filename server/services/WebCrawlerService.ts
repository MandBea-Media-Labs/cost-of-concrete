/**
 * Web Crawler Service
 *
 * Uses Playwright to crawl contractor websites and extract clean text content.
 * Implements priority-based link crawling to ensure services and contact pages
 * are visited first.
 */

import { chromium, type Browser, type Page } from 'playwright-core'
import { consola } from 'consola'

// =====================================================
// ERRORS
// =====================================================

/**
 * System-level error that indicates infrastructure/environment issues
 * These should NOT mark individual contractor profiles as failed
 */
export class SystemError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SystemError'
  }
}

// =====================================================
// TYPES
// =====================================================

export interface CrawlResult {
  url: string
  success: boolean
  content: string
  pagesCrawled: number
  error?: string
}

interface NavLink {
  href: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

// =====================================================
// PRIORITY PATTERNS
// =====================================================

const HIGH_PRIORITY_PATTERNS = [
  /service/i, /what-we-do/i, /our-work/i, /offerings/i,
  /contact/i, /reach/i, /get-in-touch/i, /connect/i,
  /about/i, /who-we-are/i, /our-team/i, /company/i,
]

const MEDIUM_PRIORITY_PATTERNS = [
  /project/i, /portfolio/i, /gallery/i, /work/i,
  /testimonial/i, /review/i, /customer/i,
  /area/i, /location/i, /serving/i,
]

// Skip these patterns entirely
const SKIP_PATTERNS = [
  /blog/i, /news/i, /article/i, /post/i,
  /career/i, /job/i, /hiring/i,
  /privacy/i, /terms/i, /cookie/i, /legal/i,
  /login/i, /sign-?in/i, /register/i, /account/i,
  /cart/i, /checkout/i, /shop/i, /store/i,
  /\.pdf$/i, /\.jpg$/i, /\.png$/i, /\.gif$/i,
  /facebook\.com/i, /twitter\.com/i, /instagram\.com/i, /linkedin\.com/i,
  /youtube\.com/i, /yelp\.com/i, /google\.com/i,
  /tel:/i, /mailto:/i, /#/,
]

// =====================================================
// CONSTANTS
// =====================================================

const MAX_PAGES = 10
const PAGE_DELAY_MS = 1500
const PAGE_TIMEOUT_MS = 15000
const MAX_CONTENT_LENGTH = 50000

// =====================================================
// SERVICE
// =====================================================

export class WebCrawlerService {
  private browser: Browser | null = null

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) return

    try {
      // Use system Chrome/Chromium
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      consola.debug('WebCrawlerService: Browser initialized')
    } catch (error) {
      consola.error('WebCrawlerService: Failed to launch browser', error)
      throw new SystemError('Failed to initialize browser. Ensure Chrome/Chromium is installed.')
    }
  }

  /**
   * Close the browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      consola.debug('WebCrawlerService: Browser closed')
    }
  }

  /**
   * Crawl a website and extract text content
   */
  async crawl(websiteUrl: string): Promise<CrawlResult> {
    if (!this.browser) {
      await this.initialize()
    }

    const baseUrl = this.normalizeUrl(websiteUrl)
    if (!baseUrl) {
      return {
        url: websiteUrl,
        success: false,
        content: '',
        pagesCrawled: 0,
        error: 'Invalid URL',
      }
    }

    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })
    const page = await context.newPage()

    const visitedUrls = new Set<string>()
    const allContent: string[] = []
    let pagesCrawled = 0

    try {
      // 1. Fetch homepage
      consola.debug(`WebCrawlerService: Fetching homepage: ${baseUrl}`)
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS })

      const homepageContent = await this.extractPageContent(page)
      allContent.push(`=== HOMEPAGE ===\n${homepageContent}`)
      visitedUrls.add(baseUrl)
      pagesCrawled++

      // 2. Extract and prioritize nav links
      const navLinks = await this.extractNavLinks(page, baseUrl)
      consola.debug(`WebCrawlerService: Found ${navLinks.length} nav links`)

      // 3. Crawl priority pages (up to MAX_PAGES total)
      for (const link of navLinks) {
        if (pagesCrawled >= MAX_PAGES) break
        if (visitedUrls.has(link.href)) continue

        try {
          await this.delay(PAGE_DELAY_MS)
          await page.goto(link.href, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS })

          const pageContent = await this.extractPageContent(page)
          allContent.push(`=== ${link.text.toUpperCase()} (${link.href}) ===\n${pageContent}`)
          visitedUrls.add(link.href)
          pagesCrawled++

          consola.debug(`WebCrawlerService: Crawled ${link.href} (${pagesCrawled}/${MAX_PAGES})`)
        } catch (error) {
          consola.warn(`WebCrawlerService: Failed to crawl ${link.href}`, error)
        }
      }

      // 4. Concatenate and truncate content
      let finalContent = allContent.join('\n\n')
      if (finalContent.length > MAX_CONTENT_LENGTH) {
        finalContent = finalContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated...]'
      }

      return {
        url: baseUrl,
        success: true,
        content: finalContent,
        pagesCrawled,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      consola.error(`WebCrawlerService: Failed to crawl ${baseUrl}`, error)
      return {
        url: baseUrl,
        success: false,
        content: allContent.join('\n\n'),
        pagesCrawled,
        error: message,
      }
    } finally {
      await context.close()
    }
  }

  /**
   * Extract clean text content from a page
   */
  private async extractPageContent(page: Page): Promise<string> {
    return page.evaluate(() => {
      // Remove noise elements
      const selectorsToRemove = [
        'script', 'style', 'noscript', 'iframe', 'svg',
        'nav', 'header', 'footer', 'aside',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '.cookie-banner', '.popup', '.modal', '.advertisement',
      ]

      selectorsToRemove.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove())
      })

      // Get clean text
      const text = document.body.innerText || ''

      // Clean up whitespace
      return text
        .replace(/\s+/g, ' ')
        .replace(/\n\s*\n/g, '\n')
        .trim()
    })
  }

  /**
   * Extract and prioritize navigation links
   */
  private async extractNavLinks(page: Page, baseUrl: string): Promise<NavLink[]> {
    const baseHost = new URL(baseUrl).host

    const rawLinks = await page.evaluate(() => {
      const links: Array<{ href: string; text: string }> = []

      // Get all anchor tags
      document.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href')
        const text = a.textContent?.trim() || ''
        if (href && text) {
          links.push({ href, text })
        }
      })

      return links
    })

    // Filter, normalize, and prioritize
    const navLinks: NavLink[] = []
    const seen = new Set<string>()

    for (const link of rawLinks) {
      // Skip external links and patterns
      const absoluteUrl = this.resolveUrl(link.href, baseUrl)
      if (!absoluteUrl) continue

      try {
        const linkHost = new URL(absoluteUrl).host
        if (linkHost !== baseHost) continue
      } catch {
        continue
      }

      // Skip if matches skip patterns
      const combinedText = `${link.href} ${link.text}`
      if (SKIP_PATTERNS.some(p => p.test(combinedText))) continue

      // Dedupe
      if (seen.has(absoluteUrl)) continue
      seen.add(absoluteUrl)

      // Determine priority
      let priority: NavLink['priority'] = 'low'
      if (HIGH_PRIORITY_PATTERNS.some(p => p.test(combinedText))) {
        priority = 'high'
      } else if (MEDIUM_PRIORITY_PATTERNS.some(p => p.test(combinedText))) {
        priority = 'medium'
      }

      navLinks.push({
        href: absoluteUrl,
        text: link.text.substring(0, 50),
        priority,
      })
    }

    // Sort by priority: high first, then medium, then low
    return navLinks.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return order[a.priority] - order[b.priority]
    })
  }

  /**
   * Normalize a URL to a standard format
   */
  private normalizeUrl(url: string): string | null {
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }
      const parsed = new URL(url)
      // Return base URL without trailing slash
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, '')
    } catch {
      return null
    }
  }

  /**
   * Resolve a relative URL to absolute
   */
  private resolveUrl(href: string, base: string): string | null {
    try {
      return new URL(href, base).toString()
    } catch {
      return null
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

