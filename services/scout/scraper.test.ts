import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  stripMapsIconChars,
  parseReviewCountFromText,
  parseStarRatingFromText,
  pickFiveStarShowcaseReviews,
  parseGoogleMapsUrl,
  slugify,
  inferCategory,
  parseCity,
  typesToCategory,
  scrapeGoogleMaps,
} from './scraper'
import type { Review } from '../../shared/types'
import { resolveCategoryInput } from '../../shared/resolveCategory'
import { sanitizeMapsUrlCliInput, validateMapsUrlForCli } from '../../shared/validateMapsUrl'
import {
  extractInstagramProfileUrl,
  hasCallablePhone,
  instagramDisplayHandle,
} from '../../shared/socialContact'

describe('parseGoogleMapsUrl', () => {
  it('parses place name and coordinates', () => {
    const u =
      'https://www.google.com/maps/place/Handyman+RPL/@1.3143063,103.8913348,17z/data=!3m1'
    const p = parseGoogleMapsUrl(u)
    expect(p.nameHint).toBe('Handyman RPL')
    expect(p.lat).toBeCloseTo(1.3143063)
    expect(p.lng).toBeCloseTo(103.8913348)
    expect(p.placeId).toBeNull()
  })

  it('reads place_id from query string', () => {
    const u =
      'https://www.google.com/maps/place?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4'
    const p = parseGoogleMapsUrl(u)
    expect(p.placeId).toBe('ChIJN1t_tDeuEmsRUsoyG83frY4')
  })
})

describe('slugify', () => {
  it('handles normal business names', () => {
    expect(slugify("Joe's Plumbing")).toBe('joe-s-plumbing')
  })

  it('handles special characters', () => {
    expect(slugify('A&B Electric Co.')).toBe('a-b-electric-co')
  })

  it('truncates at 60 chars', () => {
    expect(slugify('a'.repeat(80)).length).toBeLessThanOrEqual(60)
  })
})

describe('inferCategory', () => {
  it('detects plumber', () => {
    expect(inferCategory('Mike Plumbing LLC')).toBe('Plumber')
  })

  it('detects electrician', () => {
    expect(inferCategory('Fast Electric Services')).toBe('Electrician')
  })

  it('detects HVAC', () => {
    expect(inferCategory('Cool Air HVAC')).toBe('HVAC')
  })

  it('falls back to Home Services', () => {
    expect(inferCategory('Bob General Contracting')).toBe('Home Services')
  })
})

describe('typesToCategory', () => {
  it('maps plumber type', () => {
    expect(typesToCategory(['plumber', 'point_of_interest'], 'X')).toBe('Plumber')
  })

  it('prefers Handyman when Places lists both handyman and plumber', () => {
    expect(typesToCategory(['plumber', 'handyman', 'establishment'], 'X')).toBe('Handyman')
  })

  it('falls back to name inference', () => {
    expect(typesToCategory(['establishment'], 'Sam Handyman Pro')).toBe('Handyman')
  })
})

describe('sanitizeMapsUrlCliInput', () => {
  it('keeps a clean URL unchanged', () => {
    const u = 'https://www.google.com/maps/place/Foo/@1.2,103.8,14z/data=!3m1'
    expect(sanitizeMapsUrlCliInput(u)).toBe(u)
  })

  it('takes first line only', () => {
    expect(sanitizeMapsUrlCliInput('https://google.com/maps/x\n#!/usr/bin/env python3')).toBe(
      'https://google.com/maps/x'
    )
    expect(sanitizeMapsUrlCliInput('\nhttps://google.com/maps/x\nimport pytest')).toBe(
      'https://google.com/maps/x'
    )
  })

  it('strips redirect and heredoc on same line', () => {
    expect(sanitizeMapsUrlCliInput("https://google.com/maps/x > run_tests.py << 'EOF'")).toBe(
      'https://google.com/maps/x'
    )
  })
})

describe('validateMapsUrlForCli', () => {
  it('accepts a normal Google Maps URL', () => {
    expect(
      validateMapsUrlForCli(
        'https://www.google.com/maps/place/Foo/@1.2,103.8,14z/data=!3m1'
      ).ok
    ).toBe(true)
  })

  it('rejects newlines and heredoc paste (without sanitize)', () => {
    expect(validateMapsUrlForCli('https://google.com/maps/x\nimport pytest').ok).toBe(false)
    expect(validateMapsUrlForCli("https://google.com/maps/x << 'EOF'").ok).toBe(false)
  })

  it('rejects shell redirect after URL (without sanitize)', () => {
    const r = validateMapsUrlForCli('https://google.com/maps/x > run_tests.py')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toMatch(/redirect/)
  })

  it('accepts paste after sanitize (generate.ts pipeline)', () => {
    const messy = 'https://google.com/maps/x > run_tests.py << EOF\nimport pytest'
    expect(validateMapsUrlForCli(sanitizeMapsUrlCliInput(messy)).ok).toBe(true)
  })
})

describe('socialContact', () => {
  it('detects callable phone', () => {
    expect(hasCallablePhone('')).toBe(false)
    expect(hasCallablePhone('call me')).toBe(false)
    expect(hasCallablePhone('+65 8171 7195')).toBe(true)
  })

  it('extracts Instagram profile from Places website URI', () => {
    expect(extractInstagramProfileUrl('https://www.instagram.com/atriumelectrical/')).toBe(
      'https://www.instagram.com/atriumelectrical/'
    )
    expect(extractInstagramProfileUrl('https://instagram.com/foo/reels/')).toBe(
      'https://www.instagram.com/foo/'
    )
    expect(extractInstagramProfileUrl('https://example.com')).toBeUndefined()
    expect(extractInstagramProfileUrl('https://www.instagram.com/reel/abc123/')).toBeUndefined()
  })

  it('instagramDisplayHandle', () => {
    expect(instagramDisplayHandle('https://www.instagram.com/bar_biz/')).toBe('@bar_biz')
  })
})

describe('resolveCategoryInput', () => {
  it('accepts lowercase aliases', () => {
    expect(resolveCategoryInput('handyman')).toEqual({ ok: true, category: 'Handyman' })
    expect(resolveCategoryInput('plumbing')).toEqual({ ok: true, category: 'Plumber' })
  })

  it('accepts canonical labels with different casing', () => {
    expect(resolveCategoryInput('HVAC')).toEqual({ ok: true, category: 'HVAC' })
    expect(resolveCategoryInput('cleaning service')).toEqual({ ok: true, category: 'Cleaning Service' })
  })

  it('accepts kebab slug', () => {
    expect(resolveCategoryInput('auto-repair')).toEqual({ ok: true, category: 'Auto Repair' })
  })

  it('rejects unknown labels', () => {
    const r = resolveCategoryInput('not-a-real-trade')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.message).toContain('Unknown category')
  })
})

describe('pickFiveStarShowcaseReviews', () => {
  const r = (rating: number, text: string): Review => ({
    reviewer: 'A',
    rating,
    text,
    relativeTime: '1w ago',
  })

  it('keeps only 5-star reviews with enough text, max 10', () => {
    const list = [
      r(5, 'Great work very professional'),
      r(4, 'Good but pricey'),
      r(5, 'Perfect'),
      r(5, 'x'.repeat(20)),
    ]
    const out = pickFiveStarShowcaseReviews(list, 10)
    expect(out).toHaveLength(2)
    expect(out.every((x) => x.rating === 5)).toBe(true)
  })
})

describe('parseReviewCountFromText', () => {
  it('matches plural reviews', () => {
    expect(parseReviewCountFromText('5.0 stars · 49 reviews')).toBe(49)
  })

  it('matches Google reviews wording', () => {
    expect(parseReviewCountFromText('1,234 Google reviews')).toBe(1234)
  })

  it('does not treat singular review as reviews count when ambiguous', () => {
    expect(parseReviewCountFromText('Write a review')).toBe(0)
  })
})

describe('parseStarRatingFromText', () => {
  it('parses X stars', () => {
    expect(parseStarRatingFromText('4.7 stars')).toBe(4.7)
  })
})

describe('stripMapsIconChars', () => {
  it('removes BMP private-use glyphs Google uses for map icons', () => {
    const withPua = '\uE0B08314 1874'
    expect(stripMapsIconChars(withPua)).toBe('8314 1874')
  })
})

describe('parseCity', () => {
  it('extracts city from full US address', () => {
    expect(parseCity('123 Main St, Austin, TX 78701, USA')).toBe('Austin, TX')
  })

  it('uses Singapore when address is in Singapore', () => {
    expect(
      parseCity('511 Guillemard Rd, #02-14 Grandlink Square, Singapore 399849')
    ).toBe('Singapore')
  })

  it('handles short address gracefully', () => {
    expect(parseCity('Austin')).toBe('Austin')
  })
})

describe('scrapeGoogleMaps (mocked fetch)', () => {
  beforeEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = 'test-key'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.GOOGLE_PLACES_API_KEY
  })

  it('maps Place Details into lat, lng, placeId, hero image, and up to 5 gallery URLs', async () => {
    const mockDetails = {
      id: 'ChIJintegrationTest',
      displayName: { text: 'Test Biz Plumbing' },
      formattedAddress: '100 Test Ln, Austin, TX, USA',
      internationalPhoneNumber: '+1 555-0100',
      nationalPhoneNumber: '(555) 0100',
      rating: 4.9,
      userRatingCount: 99,
      reviews: [
        {
          authorAttribution: { displayName: 'Pat' },
          rating: 5,
          text: { text: 'Outstanding work and very professional crew here.' },
          relativePublishTimeDescription: '1 week ago',
        },
      ],
      photos: [
        { name: 'places/ChIJx/photos/A' },
        { name: 'places/ChIJx/photos/B' },
        { name: 'places/ChIJx/photos/C' },
        { name: 'places/ChIJx/photos/D' },
        { name: 'places/ChIJx/photos/E' },
        { name: 'places/ChIJx/photos/F' },
      ],
      googleMapsUri: 'https://www.google.com/maps/place/?q=test',
      types: ['plumber', 'point_of_interest'],
      location: { latitude: 30.2672, longitude: -97.7431 },
    }

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.includes('places:searchText')) {
          return new Response(
            JSON.stringify({
              places: [{ id: 'ChIJintegrationTest', displayName: { text: 'Test Biz Plumbing' } }],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          )
        }
        if (url.includes('/places/ChIJintegrationTest')) {
          return new Response(JSON.stringify(mockDetails), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return new Response(JSON.stringify({ error: { message: 'unexpected ' + url } }), {
          status: 404,
        })
      }) as typeof fetch
    )

    const lead = await scrapeGoogleMaps(
      'https://www.google.com/maps/place/Test+Biz+Plumbing/@30.2672,-97.7431,17z'
    )

    expect(lead.lat).toBeCloseTo(30.2672)
    expect(lead.lng).toBeCloseTo(-97.7431)
    expect(lead.placeId).toBe('ChIJintegrationTest')
    expect(lead.galleryPhotos).toHaveLength(5)
    expect(lead.galleryPhotos?.every((u) => u.includes('places.googleapis.com'))).toBe(true)
    expect(lead.galleryPhotos?.every((u) => u.includes('test-key'))).toBe(true)
    expect(lead.heroImage).toContain('test-key')
    expect(lead.slug).toBe('test-biz-plumbing')
  })
})
