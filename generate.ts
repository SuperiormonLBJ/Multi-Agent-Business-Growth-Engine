#!/usr/bin/env ts-node
import { resolve, join } from 'path'
import { config as loadEnv } from 'dotenv'

// Repo-root .env must win over any GOOGLE_* keys already exported in the shell
// (dotenv default override:false leaves stale keys from ~/.zshrc and breaks Places).
loadEnv({ path: resolve(__dirname, '.env'), override: true })

/**
 * generate.ts — CLI orchestrator for Phase C/A
 *
 * Usage:
 *   npx ts-node generate.ts "https://www.google.com/maps/place/..."
 *   npx ts-node generate.ts "https://..." "<category>"
 *
 * Optional category (2nd arg) overrides Google Places–inferred type. Accepts canonical
 * names (e.g. Handyman, Plumber) or aliases (handyman, plumbing, hvac, …).
 *
 * Quote the URL: `npm run generate -- "https://maps..." handyman`. If you paste a redirect
 * or extra lines by mistake, the first line is trimmed when possible; zsh may still run any
 * lines that were pasted *outside* the quoted string — use Ctrl+C and paste again if so.
 *
 * Pipeline:
 *   1. Resolves the place via Google Places API (GOOGLE_PLACES_API_KEY) from the Maps URL
 *   2. Writes lead-data.json for Vite build-time injection
 *   3. Runs `npm run build` in services/designer
 *   4. Copies built site to sites/[slug]/
 *   5. Writes theme.css (category-specific colors) into the site folder
 *   6. Writes lead-data.js for runtime fallback
 *   7. Optional screenshot (Playwright + ephemeral local server on a dynamic port)
 *   8. Appends leads-tracker.csv (Phase C log)
 *   9. Prints the outreach message template (Phase C uses one shared Stripe Payment Link)
 */

import { execSync } from 'child_process'
import { appendFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { scrapeGoogleMaps } from './services/scout/scraper'
import type { LeadData } from './shared/types'
import { resolveCategoryInput } from './shared/resolveCategory'
import { sanitizeMapsUrlCliInput, validateMapsUrlForCli } from './shared/validateMapsUrl'
import { getThemeCss } from './services/designer/src/data/themes'
import { withEphemeralStaticSiteServer } from './shared/ephemeralStaticSiteServer'
import { hasCallablePhone } from './shared/socialContact'

const ROOT = resolve(__dirname)
const DESIGNER_DIR = join(ROOT, 'services', 'designer')
const SITES_DIR = join(ROOT, 'sites')
const LEAD_DATA_PATH = join(DESIGNER_DIR, 'src', 'lead-data.json')
const CSV_PATH = join(ROOT, 'leads-tracker.csv')
const CSV_HEADER =
  'slug,business_name,phone,city,category,site_url,screenshot_path,outreach_message,status,created_at\n'

function csvEscapeField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

/** First column (slug), supports optional surrounding quotes. */
function csvRowFirstCell(line: string): string {
  const trimmed = line.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('"')) {
    let out = ''
    for (let i = 1; i < trimmed.length; i++) {
      const c = trimmed[i]!
      if (c === '"') {
        if (trimmed[i + 1] === '"') {
          out += '"'
          i++
        } else break
      } else {
        out += c
      }
    }
    return out
  }
  const comma = trimmed.indexOf(',')
  return comma === -1 ? trimmed : trimmed.slice(0, comma)
}

function trackerHasSlug(slug: string): boolean {
  if (!existsSync(CSV_PATH)) return false
  const lines = readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  for (let i = 1; i < lines.length; i++) {
    if (csvRowFirstCell(lines[i]!) === slug) return true
  }
  return false
}

function phaseCSiteBase(): string {
  return process.env.ALBGE_VERCEL_SITE_BASE?.trim() || '[your-vercel-url]'
}

function phaseCSetupPaymentLink(): string {
  return (
    process.env.STRIPE_PHASE_C_PAYMENT_LINK?.trim() ||
    '[Create a $99 Payment Link in Stripe — set STRIPE_PHASE_C_PAYMENT_LINK in .env]'
  )
}

function buildOutreachParts(lead: LeadData): string[] {
  const siteBase = phaseCSiteBase()
  const paymentLink = phaseCSetupPaymentLink()
  return [
    `Hi, I noticed ${lead.businessName} doesn't have a website.`,
    `I built one for you — take a look: ${siteBase}/${lead.slug}`,
    `Pay $99 setup here: ${paymentLink}`,
    `$9/mo hosting after that. Interested?`,
  ]
}

function buildOutreachMessage(lead: LeadData): string {
  return buildOutreachParts(lead).join(' ')
}

function outreachChannelHint(lead: LeadData): string {
  const parts: string[] = []
  if (hasCallablePhone(lead.phone)) parts.push(`WhatsApp ${lead.phone}`)
  if (lead.instagramUrl) parts.push(`Instagram ${lead.instagramUrl}`)
  if (parts.length === 0) return 'use on-site contact'
  return parts.join(' · ')
}

async function tryCaptureScreenshot(outDir: string): Promise<boolean> {
  const outPng = join(outDir, 'screenshot.png')
  let ok = false
  try {
    await withEphemeralStaticSiteServer(outDir, async (origin) => {
      try {
        const pw = await import('playwright')
        const browser = await pw.chromium.launch({ headless: true })
        try {
          const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
          await page.goto(`${origin}/`, { waitUntil: 'domcontentloaded', timeout: 8000 })
          await page.screenshot({ path: outPng, type: 'png' })
          ok = true
        } finally {
          await browser.close()
        }
      } catch {
        ok = false
      }
    })
  } catch (err) {
    console.error('❌  Local preview server for screenshot failed:', (err as Error).message)
    return false
  }
  return ok
}

function appendLeadTrackerCsv(args: {
  lead: LeadData
  siteUrl: string
  screenshotPath: string
  outreachMessage: string
}): void {
  const { lead, siteUrl, screenshotPath, outreachMessage } = args
  if (trackerHasSlug(lead.slug)) {
    console.log(`⚠️  Lead ${lead.slug} already in tracker — skipping CSV write.`)
    return
  }
  const createdAt = new Date().toISOString()
  const row = [
    csvEscapeField(lead.slug),
    csvEscapeField(lead.businessName),
    csvEscapeField(lead.phone),
    csvEscapeField(lead.city),
    csvEscapeField(lead.category),
    csvEscapeField(siteUrl),
    csvEscapeField(screenshotPath),
    csvEscapeField(outreachMessage),
    csvEscapeField('outreach_ready'),
    csvEscapeField(createdAt),
  ].join(',')

  const empty = !existsSync(CSV_PATH) || readFileSync(CSV_PATH, 'utf8').trim() === ''
  if (empty) {
    writeFileSync(CSV_PATH, CSV_HEADER + row + '\n')
  } else {
    appendFileSync(CSV_PATH, row + '\n')
  }
}

async function run() {
  const urlRaw = process.argv[2]
  const categoryArg = process.argv[3]?.trim()

  if (!urlRaw?.trim()) {
    console.error('Usage: npx ts-node generate.ts "<google-maps-url>" [category]')
    console.error('Example: npx ts-node generate.ts "https://www.google.com/maps/place/..." handyman')
    process.exit(1)
  }

  const url = sanitizeMapsUrlCliInput(urlRaw)
  if (url !== urlRaw.trim()) {
    console.warn(
      '⚠️  Trimmed the Maps URL (extra lines and/or shell `>` / `<<` after the link). Check the URL below is complete.\n'
    )
  }

  if (!url.startsWith('http')) {
    console.error('❌  Could not find an http(s) Maps URL at the start of the first line.')
    process.exit(1)
  }

  const urlCheck = validateMapsUrlForCli(url)
  if (!urlCheck.ok) {
    console.error(`❌  ${urlCheck.message}`)
    process.exit(1)
  }

  let categoryOverride: string | undefined
  if (categoryArg) {
    const resolved = resolveCategoryInput(categoryArg)
    if (!resolved.ok) {
      console.error(`❌  ${resolved.message}`)
      process.exit(1)
    }
    categoryOverride = resolved.category
  }

  console.log('\n🔍  Resolving place (Google Places API)...')
  console.log(`    URL: ${url}\n`)

  let lead: LeadData
  try {
    lead = await scrapeGoogleMaps(url)
  } catch (err) {
    console.error('❌  Lead fetch failed:', err)
    process.exit(1)
  }

  const inferredCategory = lead.category
  if (categoryOverride) {
    lead = { ...lead, category: categoryOverride }
  }

  console.log('✅  Found business:')
  console.log(`    Name:     ${lead.businessName}`)
  if (categoryOverride && inferredCategory !== lead.category) {
    console.log(`    Category: ${lead.category} (overrides Places: ${inferredCategory})`)
  } else {
    console.log(`    Category: ${lead.category}`)
  }
  console.log(`    Rating:   ${lead.rating} (${lead.reviewCount} reviews)`)
  console.log(`    Phone:     ${lead.phone || '—'}`)
  console.log(`    Instagram: ${lead.instagramUrl || '—'}`)
  console.log(`    City:     ${lead.city}`)
  console.log(`    Image:    ${lead.heroImage ? 'Yes' : 'No'}`)
  console.log(`    Reviews:  ${lead.reviews.length} five-star showcase (max 10 from API; Details returns up to 5)`)
  console.log(`    Slug:     ${lead.slug}\n`)

  try {
    writeFileSync(LEAD_DATA_PATH, JSON.stringify(lead, null, 2))
  } catch (err) {
    console.error('❌  Could not write lead-data.json:', (err as Error).message)
    process.exit(1)
  }
  console.log('📝  Written lead-data.json')

  console.log('🏗   Building landing page...\n')
  try {
    execSync('npm run build', {
      cwd: DESIGNER_DIR,
      stdio: 'inherit',
    })
  } catch {
    console.error('\n❌  Build failed. Run `npm install` inside services/designer first.')
    process.exit(1)
  }

  const outDir = join(SITES_DIR, lead.slug)
  try {
    mkdirSync(outDir, { recursive: true })
    cpSync(join(DESIGNER_DIR, 'dist'), outDir, { recursive: true })
  } catch (err) {
    console.error('❌  Could not copy build output to sites/:', (err as Error).message)
    process.exit(1)
  }

  const themeCss = getThemeCss(lead.category)
  try {
    writeFileSync(join(outDir, 'theme.css'), themeCss)
  } catch (err) {
    console.error('❌  Could not write theme.css:', (err as Error).message)
    process.exit(1)
  }
  console.log(`🎨  Theme: ${lead.category}`)

  const leadDataJs = `window.__LEAD_DATA__ = ${JSON.stringify(lead)};`
  try {
    writeFileSync(join(outDir, 'lead-data.js'), leadDataJs)
  } catch (err) {
    console.error('❌  Could not write lead-data.js:', (err as Error).message)
    process.exit(1)
  }

  console.log('\n📷  Capturing screenshot (optional, Playwright + ephemeral port)...')
  const shotOk = await tryCaptureScreenshot(outDir)
  if (shotOk) {
    console.log(`    Saved: sites/${lead.slug}/screenshot.png`)
  } else {
    console.log('    screenshot unavailable (install root deps + run: npx playwright install chromium)')
  }

  const siteUrl = `${phaseCSiteBase()}/${lead.slug}`
  const screenshotRel = shotOk ? `sites/${lead.slug}/screenshot.png` : ''
  const outreachMessage = buildOutreachMessage(lead)

  try {
    appendLeadTrackerCsv({
      lead,
      siteUrl,
      screenshotPath: screenshotRel,
      outreachMessage,
    })
    console.log('📇  Updated leads-tracker.csv')
  } catch (err) {
    console.error('❌  Could not update leads-tracker.csv:', (err as Error).message)
    process.exit(1)
  }

  console.log(`\n✨  Done! Site built at: sites/${lead.slug}/`)
  console.log(`\n📋  Next steps:`)
  console.log(
    `    1. Preview:  cd sites/${lead.slug} && python3 -m http.server 8080  →  http://localhost:8080/`
  )
  console.log(`       (Opening index.html as file:// often stays blank — ES modules need http(s).)`)
  console.log(`    2. Deploy:   push to Vercel (auto-serves from sites/ folder)`)
  console.log(`    3. Outreach: ${outreachChannelHint(lead)}`)
  console.log(`\n    Message template:`)
  console.log(`    ─────────────────────────────────────────────────────────────`)
  for (const line of buildOutreachParts(lead)) {
    console.log(`    ${line}`)
  }
  console.log(`    ─────────────────────────────────────────────────────────────\n`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
