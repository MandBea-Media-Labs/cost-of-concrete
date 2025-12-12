/**
 * Web Crawler Service
 *
 * Uses Playwright to crawl contractor websites and extract clean text content.
 * Implements priority-based link crawling to ensure services and contact pages
 * are visited first.
 */

import { chromium, type Browser, type Page } from 'playwright-core'
import { consola } from 'consola'

// Enable verbose logging via environment variable
const VERBOSE = process.env.CRAWLER_VERBOSE === 'true'

function log(message: string, data?: unknown) {
  if (VERBOSE) {
    if (data) {
      consola.info(`[CRAWLER] ${message}`, data)
    } else {
      consola.info(`[CRAWLER] ${message}`)
    }
  } else {
    consola.debug(`WebCrawlerService: ${message}`)
  }
}

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
  /** Indicates if site has bot protection (403, Cloudflare challenge, etc.) */
  blockedByBotProtection?: boolean
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

// Human-like browser configuration
const BROWSER_CONFIG = {
  viewport: { width: 1280, height: 720 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  colorScheme: 'light' as const,
  // Extra headers to look more human
  extraHTTPHeaders: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
  },
}

// =====================================================
// SERVICE
// =====================================================

export class WebCrawlerService {
  private browser: Browser | null = null

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      log('Browser already initialized, skipping')
      return
    }

    log('Initializing browser...')
    try {
      // Use system Chrome/Chromium with human-like args
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled', // Hide automation
          '--disable-features=IsolateOrigins,site-per-process',
        ],
      })
      log('Browser initialized successfully')
    } catch (error) {
      log('Failed to launch browser', error)
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
      log('Browser closed')
    }
  }

  /**
   * Crawl a website and extract text content
   */
  async crawl(websiteUrl: string): Promise<CrawlResult> {
    log(`Starting crawl for: ${websiteUrl}`)

    if (!this.browser) {
      await this.initialize()
    }

    const baseUrl = this.normalizeUrl(websiteUrl)
    log(`Normalized URL: ${baseUrl}`)

    if (!baseUrl) {
      log('Invalid URL, aborting crawl')
      return {
        url: websiteUrl,
        success: false,
        content: '',
        pagesCrawled: 0,
        error: 'Invalid URL',
      }
    }

    log('Creating browser context with human-like settings...')
    const context = await this.browser!.newContext({
      ...BROWSER_CONFIG,
    })

    // Hide webdriver flag to look more human
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
    })

    const page = await context.newPage()
    log('Browser context and page created')

    const visitedUrls = new Set<string>()
    const allContent: string[] = []
    let pagesCrawled = 0

    try {
      // 1. Fetch homepage with human-like behavior
      log(`Fetching homepage: ${baseUrl}`)
      await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS })

      // Human-like: wait a bit and scroll to trigger lazy loading
      await this.humanDelay(500, 1000)
      await this.humanScroll(page)

      // Check for bot protection (403, Cloudflare, etc.)
      const pageTitle = await page.title()
      const isBotBlocked = this.detectBotProtection(pageTitle)

      if (isBotBlocked) {
        log(`Bot protection detected: ${pageTitle}`)
        await context.close()
        return {
          url: websiteUrl,
          success: false,
          content: '',
          pagesCrawled: 0,
          error: 'Site has bot protection (403/Cloudflare)',
          blockedByBotProtection: true,
        }
      }

      log('Homepage loaded, extracting content...')

      const homepageContent = await this.extractPageContent(page)
      log(`Homepage content extracted: ${homepageContent.length} chars`)
      allContent.push(`=== HOMEPAGE ===\n${homepageContent}`)
      visitedUrls.add(baseUrl)
      pagesCrawled++

      // 2. Extract and prioritize nav links
      log('Extracting nav links...')
      const navLinks = await this.extractNavLinks(page, baseUrl)
      log(`Found ${navLinks.length} nav links: ${navLinks.map(l => l.text).join(', ')}`)

      // 3. Crawl priority pages (up to MAX_PAGES total)
      for (const link of navLinks) {
        if (pagesCrawled >= MAX_PAGES) {
          log(`Reached max pages (${MAX_PAGES}), stopping`)
          break
        }
        if (visitedUrls.has(link.href)) {
          log(`Skipping already visited: ${link.href}`)
          continue
        }

        try {
          log(`Crawling: ${link.text} (${link.href})`)
          // Human-like delay between pages
          await this.humanDelay(PAGE_DELAY_MS, PAGE_DELAY_MS + 1000)
          await page.goto(link.href, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT_MS })

          // Human-like scroll
          await this.humanDelay(300, 600)
          await this.humanScroll(page)

          const pageContent = await this.extractPageContent(page)
          log(`Page content extracted: ${pageContent.length} chars`)
          allContent.push(`=== ${link.text.toUpperCase()} (${link.href}) ===\n${pageContent}`)
          visitedUrls.add(link.href)
          pagesCrawled++

          log(`Crawled ${link.href} (${pagesCrawled}/${MAX_PAGES})`)
        } catch (error) {
          log(`Failed to crawl ${link.href}`, error)
          consola.warn(`WebCrawlerService: Failed to crawl ${link.href}`, error)
        }
      }

      // 4. Concatenate and truncate content
      let finalContent = allContent.join('\n\n')
      log(`Total content: ${finalContent.length} chars from ${pagesCrawled} pages`)

      if (finalContent.length > MAX_CONTENT_LENGTH) {
        finalContent = finalContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[Content truncated...]'
        log(`Content truncated to ${MAX_CONTENT_LENGTH} chars`)
      }

      log(`Crawl complete: ${pagesCrawled} pages, ${finalContent.length} chars`)
      return {
        url: baseUrl,
        success: true,
        content: finalContent,
        pagesCrawled,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      log(`Crawl failed: ${message}`, error)
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

  /**
   * Human-like random delay between min and max milliseconds
   */
  private humanDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  /**
   * Human-like scrolling behavior
   */
  private async humanScroll(page: Page): Promise<void> {
    try {
      // Scroll down in steps like a human would
      const scrollSteps = 3
      for (let i = 0; i < scrollSteps; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight * 0.3)
        })
        await this.humanDelay(100, 300)
      }

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo(0, 0)
      })
    } catch {
      // Ignore scroll errors
    }
  }

  /**
   * Detect if page is blocked by bot protection
   */
  private detectBotProtection(pageTitle: string): boolean {
    const lowerTitle = pageTitle.toLowerCase()
    const blockedPatterns = [
      '403',
      'forbidden',
      'access denied',
      'attention required',
      'just a moment', // Cloudflare
      'checking your browser',
      'please wait',
      'ddos protection',
      'blocked',
    ]
    return blockedPatterns.some(pattern => lowerTitle.includes(pattern))
  }
}

