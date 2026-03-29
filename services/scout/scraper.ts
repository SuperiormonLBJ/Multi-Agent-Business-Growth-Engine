import type { LeadData, Review } from '../../shared/types'
import { extractInstagramProfileUrl } from '../../shared/socialContact'

export type { LeadData, Review }

// ─── Public API ───────────────────────────────────────────────────────────────

export async function closeBrowser(): Promise<void> {
  /* no-op; kept for callers that used Playwright */
}

export async function scrapeGoogleMaps(mapsUrl: string): Promise<LeadData> {
  const key = getApiKey()
  const parsed = parseGoogleMapsUrl(mapsUrl)
  const placeId = await resolvePlaceId(parsed, key)
  const d = await fetchPlaceDetailsNew(placeId, key)

  const businessName = stripMapsIconChars(d.displayName?.text ?? parsed.nameHint)
  const address = stripMapsIconChars(d.formattedAddress ?? '')
  const phoneRaw = d.internationalPhoneNumber || d.nationalPhoneNumber || ''
  const phone = normalizePhoneForTel(phoneRaw)

  const mappedReviews: Review[] = (d.reviews ?? []).map((r) => ({
    reviewer: r.authorAttribution?.displayName ?? 'Customer',
    rating: typeof r.rating === 'number' ? Math.round(r.rating) : 0,
    text: r.text?.text ?? r.originalText?.text ?? '',
    relativeTime: r.relativePublishTimeDescription ?? '',
  }))

  const lat = d.location?.latitude
  const lng = d.location?.longitude
  const galleryPhotos = galleryPhotoMediaUrls(d.photos, key, 5)
  const website = d.websiteUri?.trim() || undefined
  const instagramUrl = extractInstagramProfileUrl(website)

  return {
    businessName,
    category: typesToCategory(d.types ?? [], businessName),
    rating: typeof d.rating === 'number' ? d.rating : 0,
    reviewCount: typeof d.userRatingCount === 'number' ? d.userRatingCount : 0,
    reviews: pickFiveStarShowcaseReviews(mappedReviews, 10),
    phone,
    address,
    city: parseCity(address),
    website,
    instagramUrl,
    heroImage: placePhotoMediaUrl(d.photos?.[0]?.name, key),
    placeId: d.id || undefined,
    lat: typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined,
    lng: typeof lng === 'number' && Number.isFinite(lng) ? lng : undefined,
    galleryPhotos: galleryPhotos.length > 0 ? galleryPhotos : undefined,
    mapsUrl: d.googleMapsUri ?? mapsUrl,
    slug: slugify(businessName),
  }
}

// ─── Places API ───────────────────────────────────────────────────────────────

function getApiKey(): string {
  const k =
    process.env.GOOGLE_PLACES_API_KEY?.trim() || process.env.GOOGLE_MAPS_API_KEY?.trim()
  if (!k) {
    throw new Error(
      'Set GOOGLE_PLACES_API_KEY (or GOOGLE_MAPS_API_KEY) in your environment — scraping is API-only.'
    )
  }
  return k
}

export interface ParsedMapsUrl {
  /** Decoded name from `/place/Name/` */
  nameHint: string
  lat: number | null
  lng: number | null
  placeId: string | null
}

export function parseGoogleMapsUrl(url: string): ParsedMapsUrl {
  let placeId: string | null = null
  let nameHint = ''
  let lat: number | null = null
  let lng: number | null = null

  try {
    const u = new URL(url)
    placeId =
      u.searchParams.get('place_id') ||
      u.searchParams.get('query_place_id') ||
      null
    const q = u.searchParams.get('q')
    if (!placeId && q?.startsWith('place_id:')) {
      placeId = q.slice('place_id:'.length).trim()
    }
  } catch {
    /* relative or odd URL — regex fallback below */
  }

  const placePath = url.match(/\/place\/([^/?@]+)/)
  if (placePath?.[1]) {
    try {
      nameHint = decodeURIComponent(placePath[1].replace(/\+/g, ' ')).trim()
    } catch {
      nameHint = placePath[1].replace(/\+/g, ' ').trim()
    }
  }

  const at = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d+)/)
  if (at) {
    lat = parseFloat(at[1])
    lng = parseFloat(at[2])
    if (Number.isNaN(lat)) lat = null
    if (Number.isNaN(lng)) lng = null
  }

  return { nameHint, lat, lng, placeId }
}

/** Places API (New) — legacy maps.googleapis.com JSON endpoints are often disabled on new projects. */
const PLACES_V1 = 'https://places.googleapis.com/v1'

function placesKeyTroubleshooting(msg: string): string {
  if (!/api key|not valid|invalid/i.test(msg)) return ''
  return (
    '\n  Hint: (1) API restrictions: if "Restrict key", add Places API (New) — not only Maps JavaScript or legacy Places. ' +
    '(2) Application: None or IP, not HTTP referrers. (3) Enable Places API (New) on the same GCP project + billing. ' +
    '(4) GOOGLE_PLACES_API_KEY in repo-root .env must be that key (no stray quotes/spaces).'
  )
}

interface LocalizedText {
  text?: string
}

interface NewPhoto {
  name?: string
  widthPx?: number
  heightPx?: number
}

interface NewReview {
  rating?: number
  text?: LocalizedText
  originalText?: LocalizedText
  relativePublishTimeDescription?: string
  authorAttribution?: { displayName?: string }
}

interface NewPlace {
  id?: string
  displayName?: LocalizedText
  formattedAddress?: string
  nationalPhoneNumber?: string
  internationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  reviews?: NewReview[]
  photos?: NewPhoto[]
  types?: string[]
  googleMapsUri?: string
  location?: { latitude?: number; longitude?: number }
}

function pickBestPlaceId(
  places: Array<{ id?: string; displayName?: LocalizedText }>,
  nameHint: string
): string {
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
  const hintNorm = norm(nameHint)
  const exact = places.find((p) => norm(p.displayName?.text ?? '') === hintNorm)
  if (exact?.id) return exact.id
  const partial = places.find(
    (p) =>
      norm(p.displayName?.text ?? '').includes(hintNorm) ||
      hintNorm.includes(norm(p.displayName?.text ?? ''))
  )
  return (partial?.id ?? places[0]?.id) as string
}

async function resolvePlaceId(parsed: ParsedMapsUrl, key: string): Promise<string> {
  if (parsed.placeId) return parsed.placeId

  if (!parsed.nameHint) {
    throw new Error(
      'Could not parse a place name from the URL. Use a Maps link that includes /place/Business+Name/ or add ?place_id=ChIJ...'
    )
  }

  const body: Record<string, unknown> = { textQuery: parsed.nameHint }
  if (parsed.lat != null && parsed.lng != null) {
    body.locationBias = {
      circle: {
        center: { latitude: parsed.lat, longitude: parsed.lng },
        radius: 5000,
      },
    }
  }

  const res = await fetch(`${PLACES_V1}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  })

  const data = (await res.json()) as {
    places?: Array<{ id?: string; displayName?: LocalizedText }>
    error?: { message?: string; status?: string }
  }

  if (!res.ok || data.error) {
    const msg = `${data.error?.status ?? res.status} ${data.error?.message ?? ''}`
    throw new Error(`Places Text Search failed: ${msg}${placesKeyTroubleshooting(msg)}`)
  }

  if (!data.places?.length || !data.places[0].id) {
    throw new Error('Places Text Search returned no results for this query and location bias.')
  }

  return pickBestPlaceId(data.places, parsed.nameHint)
}

async function fetchPlaceDetailsNew(placeId: string, key: string): Promise<NewPlace> {
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'nationalPhoneNumber',
    'internationalPhoneNumber',
    'websiteUri',
    'rating',
    'userRatingCount',
    'reviews',
    'photos',
    'googleMapsUri',
    'types',
    'location',
  ].join(',')

  const url = `${PLACES_V1}/places/${encodeURIComponent(placeId)}`
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': fieldMask,
    },
    signal: AbortSignal.timeout(20_000),
  })

  const data = (await res.json()) as NewPlace & {
    error?: { message?: string; status?: string }
  }

  if (!res.ok || data.error) {
    const msg = `${data.error?.status ?? res.status} ${data.error?.message ?? ''}`
    throw new Error(`Place Details (New) failed: ${msg}${placesKeyTroubleshooting(msg)}`)
  }

  return data
}

/** Photo media URL for Places API (New). `photo.name` is e.g. `places/ChIJ…/photos/…`. */
function placePhotoMediaUrl(photoName: string | undefined, key: string): string | undefined {
  return placePhotoMediaUrlSized(photoName, key, '800', '800')
}

function placePhotoMediaUrlSized(
  photoName: string | undefined,
  key: string,
  maxWidthPx: string,
  maxHeightPx: string
): string | undefined {
  if (!photoName) return undefined
  const q = new URLSearchParams({
    maxWidthPx,
    maxHeightPx,
    key,
  })
  return `${PLACES_V1}/${photoName}/media?${q.toString()}`
}

/** Up to `max` album photo URLs for the landing gallery (larger than hero thumb). */
function galleryPhotoMediaUrls(
  photos: NewPhoto[] | undefined,
  key: string,
  max: number
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const p of photos ?? []) {
    const url = placePhotoMediaUrlSized(p.name, key, '1200', '900')
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
    if (out.length >= max) break
  }
  return out
}

function normalizePhoneForTel(raw: string): string {
  const s = stripMapsIconChars(raw).trim()
  if (!s) return ''
  const digits = s.replace(/[^\d+]/g, '')
  return digits
}

// ─── Category / text helpers (themes + lead) ─────────────────────────────────

export function typesToCategory(types: string[], businessName: string): string {
  const t = new Set(types.map((x) => x.toLowerCase()))
  // Prefer generalist types when Places returns several (e.g. handyman + plumber).
  if (t.has('handyman') || t.has('general_contractor')) return 'Handyman'
  if (t.has('plumber')) return 'Plumber'
  if (t.has('electrician')) return 'Electrician'
  if (t.has('roofing_contractor')) return 'Roofing'
  if (t.has('painter')) return 'Painting'
  if (t.has('restaurant') || t.has('food')) return 'Restaurant'
  if (t.has('locksmith')) return 'Locksmith'
  if (t.has('car_repair') || t.has('car_dealer')) return 'Auto Repair'
  if (t.has('laundry')) return 'Cleaning Service'
  if (t.has('landscaper') || t.has('gardener')) return 'Landscaping'
  if (t.has('hvac_contractor')) return 'HVAC'
  if (t.has('pest_control_service')) return 'Pest Control'
  return inferCategory(businessName)
}

export function inferCategory(name: string): string {
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

/** Google Maps injects icon-font codepoints (BMP PUA) into labels; API text is usually clean. */
export function stripMapsIconChars(s: string): string {
  return s
    .replace(/[\uE000-\uF8FF]/g, '')
    .replace(/[\uFE00-\uFE0F]/g, '')
    .trim()
}

export function parseCity(address: string): string {
  const cleaned = stripMapsIconChars(address)
  const parts = cleaned.split(',').map((p) => p.trim())
  const last = parts[parts.length - 1] ?? ''

  if (/singapore/i.test(cleaned)) {
    return 'Singapore'
  }

  if (parts.length >= 3) {
    return `${parts[parts.length - 3]}, ${parts[parts.length - 2].replace(/\d{5}.*/, '').trim()}`
  }
  if (parts.length === 2) {
    return last
  }
  return parts[0] ?? ''
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

const MIN_REVIEW_TEXT_LEN = 12

/** Up to `max` five-star reviews with real text — for landing page showcase. */
export function pickFiveStarShowcaseReviews(reviews: Review[], max = 10): Review[] {
  return reviews
    .filter((r) => r.rating === 5 && r.text.trim().length >= MIN_REVIEW_TEXT_LEN)
    .slice(0, max)
}

/** @deprecated Maps DOM scraping removed — kept for tests / any legacy imports */
export function parseReviewCountFromText(s: string): number {
  const m = s.match(/(\d[\d,]*)\s+(?:Google\s+)?reviews?\b/i)
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0
}

/** @deprecated Maps DOM scraping removed */
export function parseStarRatingFromText(s: string): number {
  const m =
    s.match(/([\d.]+)\s+stars?\b/i) ||
    s.match(/Rated\s+([\d.]+)\s+out\s+of\s+5/i) ||
    s.match(/\b([\d.]+)\s*\/\s*5\b/)
  return m ? parseFloat(m[1]) : 0
}
