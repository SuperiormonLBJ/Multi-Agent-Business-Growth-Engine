/**
 * Maps CLI / human input to canonical category keys used by themes + services.
 * Keep in sync with keys in services/designer/src/data/themes.ts (and categories.ts).
 */
export const CATEGORY_CANONICAL = [
  'Plumber',
  'Electrician',
  'HVAC',
  'Roofing',
  'Painting',
  'Restaurant',
  'Landscaping',
  'Cleaning Service',
  'Auto Repair',
  'Pest Control',
  'Locksmith',
  'Handyman',
  'Handyman/Handywoman/Handyperson',
  'Home Services',
] as const

export type CanonicalCategory = (typeof CATEGORY_CANONICAL)[number]

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ')
}

/** Normalized phrase → canonical category label */
const ALIASES: Record<string, string> = {
  plumber: 'Plumber',
  plumbing: 'Plumber',
  electrician: 'Electrician',
  electrical: 'Electrician',
  hvac: 'HVAC',
  heating: 'HVAC',
  cooling: 'HVAC',
  'air conditioning': 'HVAC',
  ac: 'HVAC',
  roofing: 'Roofing',
  roofer: 'Roofing',
  roof: 'Roofing',
  painting: 'Painting',
  painter: 'Painting',
  paint: 'Painting',
  restaurant: 'Restaurant',
  cafe: 'Restaurant',
  food: 'Restaurant',
  landscaping: 'Landscaping',
  landscape: 'Landscaping',
  lawn: 'Landscaping',
  gardener: 'Landscaping',
  'cleaning service': 'Cleaning Service',
  cleaning: 'Cleaning Service',
  cleaner: 'Cleaning Service',
  maid: 'Cleaning Service',
  janitorial: 'Cleaning Service',
  'auto repair': 'Auto Repair',
  auto: 'Auto Repair',
  mechanic: 'Auto Repair',
  automotive: 'Auto Repair',
  garage: 'Auto Repair',
  'pest control': 'Pest Control',
  pest: 'Pest Control',
  exterminator: 'Pest Control',
  termite: 'Pest Control',
  locksmith: 'Locksmith',
  locks: 'Locksmith',
  handyman: 'Handyman',
  handy: 'Handyman',
  handyperson: 'Handyman',
  'general contractor': 'Handyman',
  generalcontractor: 'Handyman',
  'handyman handywoman handyperson': 'Handyman/Handywoman/Handyperson',
  'home services': 'Home Services',
  home: 'Home Services',
  general: 'Home Services',
  default: 'Home Services',
}

export type ResolveCategoryResult =
  | { ok: true; category: string }
  | { ok: false; message: string }

/**
 * Resolve free-form category input to a canonical theme/services key.
 */
export function resolveCategoryInput(raw: string): ResolveCategoryResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { ok: false, message: 'Category is empty.' }
  }

  const n = norm(trimmed)
  const aliasHit = ALIASES[n]
  if (aliasHit) {
    return { ok: true, category: aliasHit }
  }

  for (const c of CATEGORY_CANONICAL) {
    if (norm(c) === n) {
      return { ok: true, category: c }
    }
  }

  // Slug-ish: "cleaning-service" → cleaning service
  const spaced = n.replace(/-/g, ' ')
  const fromSlug = ALIASES[spaced]
  if (fromSlug) {
    return { ok: true, category: fromSlug }
  }
  for (const c of CATEGORY_CANONICAL) {
    if (norm(c) === spaced) {
      return { ok: true, category: c }
    }
  }

  return {
    ok: false,
    message: `Unknown category "${trimmed}". Use a label like: ${CATEGORY_CANONICAL.join(', ')} (or common words: handyman, plumber, hvac, …).`,
  }
}
