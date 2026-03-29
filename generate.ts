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
 *
 * Pipeline:
 *   1. Resolves the place via Google Places API (GOOGLE_PLACES_API_KEY) from the Maps URL
 *   2. Writes lead-data.json for Vite build-time injection
 *   3. Runs `npm run build` in services/designer
 *   4. Copies built site to sites/[slug]/
 *   5. Writes theme.css (category-specific colors) into the site folder
 *   6. Writes lead-data.js for runtime fallback
 *   7. Prints the outreach message template
 */

import { execSync } from 'child_process'
import { writeFileSync, mkdirSync, cpSync } from 'fs'
import { scrapeGoogleMaps } from './services/scout/scraper'
import type { LeadData } from './shared/types'
import { getThemeCss } from './services/designer/src/data/themes'

const ROOT = resolve(__dirname)
const DESIGNER_DIR = join(ROOT, 'services', 'designer')
const SITES_DIR = join(ROOT, 'sites')
const LEAD_DATA_PATH = join(DESIGNER_DIR, 'src', 'lead-data.json')

async function run() {
  const url = process.argv[2]

  if (!url || !url.startsWith('http')) {
    console.error('Usage: npx ts-node generate.ts "<google-maps-url>"')
    console.error('Example: npx ts-node generate.ts "https://www.google.com/maps/place/..."')
    process.exit(1)
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

  console.log('✅  Found business:')
  console.log(`    Name:     ${lead.businessName}`)
  console.log(`    Category: ${lead.category}`)
  console.log(`    Rating:   ${lead.rating} (${lead.reviewCount} reviews)`)
  console.log(`    Phone:    ${lead.phone}`)
  console.log(`    City:     ${lead.city}`)
  console.log(`    Image:    ${lead.heroImage ? 'Yes' : 'No'}`)
  console.log(`    Reviews:  ${lead.reviews.length} five-star showcase (max 10 from API; Details returns up to 5)`)
  console.log(`    Slug:     ${lead.slug}\n`)

  // Write lead data for Vite build-time injection
  writeFileSync(LEAD_DATA_PATH, JSON.stringify(lead, null, 2))
  console.log('📝  Written lead-data.json')

  // Build the React app
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

  // Copy dist → sites/[slug]/
  const outDir = join(SITES_DIR, lead.slug)
  mkdirSync(outDir, { recursive: true })
  cpSync(join(DESIGNER_DIR, 'dist'), outDir, { recursive: true })

  // Write theme.css (category-specific colors)
  const themeCss = getThemeCss(lead.category)
  writeFileSync(join(outDir, 'theme.css'), themeCss)
  console.log(`🎨  Theme: ${lead.category}`)

  // Write lead-data.js (runtime data for pre-build template approach)
  const leadDataJs = `window.__LEAD_DATA__ = ${JSON.stringify(lead)};`
  writeFileSync(join(outDir, 'lead-data.js'), leadDataJs)

  console.log(`\n✨  Done! Site built at: sites/${lead.slug}/`)
  console.log(`\n📋  Next steps:`)
  console.log(
    `    1. Preview:  cd sites/${lead.slug} && python3 -m http.server 8080  →  http://localhost:8080/`
  )
  console.log(`       (Opening index.html as file:// often stays blank — ES modules need http(s).)`)
  console.log(`    2. Deploy:   push to Vercel (auto-serves from sites/ folder)`)
  console.log(`    3. Outreach: send WhatsApp to ${lead.phone}`)
  console.log(`\n    Message template:`)
  console.log(`    ─────────────────────────────────────────────────────────────`)
  console.log(`    Hi, I noticed ${lead.businessName} doesn't have a website.`)
  console.log(`    I built one for you — take a look: [your-vercel-url]/${lead.slug}`)
  console.log(`    $99 one-time setup · $9/mo hosting. Interested?`)
  console.log(`    ─────────────────────────────────────────────────────────────\n`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
