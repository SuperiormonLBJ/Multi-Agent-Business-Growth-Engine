import { chromium, type Page, type BrowserContext } from 'playwright'
import type { LeadData, Review } from '../../shared/types'

export type { LeadData, Review }

// Single persistent context per process (CLAUDE.md: browser persistence rule)
let _context: BrowserContext | null = null

async function getContext(): Promise<BrowserContext> {
  if (_context) return _context
  const browser = await chromium.launch({ headless: true })
  _context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  })
  return _context
}

export async function closeBrowser(): Promise<void> {
  if (_context) {
    await _context.browser()?.close()
    _context = null
  }
}

export async function scrapeGoogleMaps(url: string): Promise<LeadData> {
  const context = await getContext()
  const page = await context.newPage()

  try {
    // Dismiss any dialogs (cookie consent etc.)
    page.on('dialog', (d: import('playwright').Dialog) => d.dismiss().catch(() => {}))

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    // Wait for the business panel h1 specifically — not the search results "Results" h1
    await page.waitForSelector('h1.DUwDvf', { timeout: 20_000 })

    const businessName = await extractBusinessName(page)
    const category = await extractCategory(page)
    const { rating, reviewCount } = await extractRating(page)
    const phone = await extractPhone(page)
    const address = await extractAddress(page)
    const city = parseCity(address)
    const website = await extractWebsite(page)
    const reviews = await extractReviews(page)

    return {
      businessName,
      category: category || inferCategory(businessName),
      rating,
      reviewCount,
      reviews,
      phone,
      address,
      city,
      heroImage: await extractHeroImage(page) || undefined,
      website: website || undefined,
      mapsUrl: page.url(),
      slug: slugify(businessName),
    }
  } finally {
    await page.close()
  }
}

// ─── Extraction helpers ────────────────────────────────────────────────────────

async function extractBusinessName(page: Page): Promise<string> {
  // Try specific class first — avoids grabbing "Results" search panel h1
  const withClass = await page
    .$eval('h1.DUwDvf', (el: Element) => el.textContent?.trim() ?? '')
    .catch(() => '')
  if (withClass) return withClass

  const withAttr = await page
    .$eval('h1[data-attrid]', (el: Element) => el.textContent?.trim() ?? '')
    .catch(() => '')
  if (withAttr) return withAttr

  // Last resort: first h1 that isn't a UI chrome element
  const SKIP = new Set(['Results', 'Sponsored', ''])
  const all = await page.$$eval('h1', (els: Element[]) =>
    els.map((el: Element) => el.textContent?.trim() ?? '')
  )
  return all.find((t) => !SKIP.has(t)) ?? ''
}

async function extractCategory(page: Page): Promise<string> {
  return page
    .$eval(
      'button.DkEaL, [data-attrid="kc:/location/location:category"] span',
      (el: Element) => el.textContent?.trim() ?? ''
    )
    .catch(() => '')
}

async function extractRating(
  page: Page
): Promise<{ rating: number; reviewCount: number }> {
  try {
    const ariaLabel = await page.$eval(
      'div.F7nice span[aria-label], span.Aq14fc',
      (el: Element) => el.getAttribute('aria-label') ?? el.textContent ?? ''
    )
    const ratingMatch = ariaLabel.match(/([\d.]+)\s*star/)
    const countMatch = ariaLabel.match(/([\d,]+)\s*(review|Google review)/)

    const ratingText = await page
      .$eval('span.MW4etd', (el: Element) => el.textContent?.trim() ?? '')
      .catch(() => '')
    const countText = await page
      .$eval('span.UY7F9', (el: Element) =>
        el.textContent?.replace(/[^0-9]/g, '') ?? ''
      )
      .catch(() => '')

    return {
      rating: parseFloat(ratingMatch?.[1] ?? ratingText) || 0,
      reviewCount: parseInt(countMatch?.[1]?.replace(',', '') ?? countText, 10) || 0,
    }
  } catch {
    return { rating: 0, reviewCount: 0 }
  }
}

async function extractPhone(page: Page): Promise<string> {
  const fromTooltip = await page
    .$eval(
      '[data-tooltip="Copy phone number"], [aria-label*="phone" i] + span',
      (el: Element) => el.textContent?.trim() ?? ''
    )
    .catch(() => '')

  if (fromTooltip) return fromTooltip

  const bodyText = await page.evaluate(() => document.body.innerText)
  const match = bodyText.match(/(\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4})/)
  return match?.[1] ?? ''
}

async function extractAddress(page: Page): Promise<string> {
  return page
    .$eval(
      '[data-tooltip="Copy address"], [aria-label*="address" i]',
      (el: Element) => el.textContent?.trim() ?? ''
    )
    .catch(async () => {
      return page
        .$eval('.rogA2c .Io6YTe', (el: Element) => el.textContent?.trim() ?? '')
        .catch(() => '')
    })
}

async function extractWebsite(page: Page): Promise<string> {
  return page
    .$eval(
      'a[data-tooltip="Open website"], a[aria-label*="website" i]',
      (el: Element) => (el as HTMLAnchorElement).href ?? ''
    )
    .catch(() => '')
}

async function extractHeroImage(page: Page): Promise<string> {
  // Try to get the first GMB business photo
  return page
    .$eval(
      'button[jsaction*="heroHeaderImage"] img, img.p2b7Lc, [data-photo-index="0"] img',
      (el: Element) => (el as HTMLImageElement).src ?? ''
    )
    .catch(() => '')
}

async function extractReviews(page: Page): Promise<Review[]> {
  try {
    const reviewTab = await page.$(
      '[role="tab"]:nth-child(2), button[aria-label*="Reviews"]'
    )
    if (reviewTab) {
      await reviewTab.click()
      await page.waitForTimeout(1500)
    }

    const moreButtons = await page.$$('button.w8nwRe, button[aria-label*="more"]')
    for (const btn of moreButtons.slice(0, 6)) {
      await btn.click().catch(() => {})
    }

    await page.waitForSelector('.jftiEf, .GHT2ce', { timeout: 5000 })

    const raw = await page.$$eval('.jftiEf, .GHT2ce', (els: Element[]) =>
      els.slice(0, 5).map((el) => ({
        reviewer:
          el.querySelector('.d4r55, .TSUbDb')?.textContent?.trim() ?? 'Customer',
        rating:
          el.querySelectorAll('.hCCjke.vzX5Ic, img[src*="star_active"]').length || 5,
        text:
          el.querySelector('.wiI7pd, .MyEned span')?.textContent?.trim() ?? '',
        relativeTime:
          el.querySelector('.rsqaWe, .dehysf')?.textContent?.trim() ?? '',
      }))
    )

    return raw.filter((r: { text: string }) => r.text.length > 15)
  } catch {
    return []
  }
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function parseCity(address: string): string {
  // "123 Main St, Austin, TX 78701, USA" → "Austin, TX"
  const parts = address.split(',').map((p) => p.trim())
  if (parts.length >= 3) return `${parts[parts.length - 3]}, ${parts[parts.length - 2].replace(/\d{5}.*/, '').trim()}`
  return parts[0] ?? ''
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

function inferCategory(name: string): string {
  const lower = name.toLowerCase()
  if (/plumb/.test(lower)) return 'Plumber'
  if (/electric/.test(lower)) return 'Electrician'
  if (/hvac|air cond|heating|cooling/.test(lower)) return 'HVAC'
  if (/roof/.test(lower)) return 'Roofing'
  if (/paint/.test(lower)) return 'Painting'
  if (/restaurant|cafe|bistro|diner|grill|kitchen|food/.test(lower)) return 'Restaurant'
  if (/landscap|lawn|garden/.test(lower)) return 'Landscaping'
  if (/clean|maid|janitorial/.test(lower)) return 'Cleaning Service'
  if (/auto|mechanic|garage|car repair/.test(lower)) return 'Auto Repair'
  if (/pest|exterminator|termite/.test(lower)) return 'Pest Control'
  if (/locksmith|lock|key/.test(lower)) return 'Locksmith'
  if (/handyman|handy/.test(lower)) return 'Handyman'
  return 'Home Services'
}
