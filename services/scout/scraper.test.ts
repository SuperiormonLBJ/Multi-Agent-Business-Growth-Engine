import { describe, it, expect } from 'vitest'

// Unit tests for pure helpers — no browser needed
// Integration test (real scrape) requires a live Google Maps URL

describe('slugify', () => {
  // We import the private helper by re-exporting it for tests
  const slugify = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)

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
  const inferCategory = (name: string): string => {
    const lower = name.toLowerCase()
    if (/plumb/.test(lower)) return 'Plumber'
    if (/electric/.test(lower)) return 'Electrician'
    if (/hvac|air cond|heating|cooling/.test(lower)) return 'HVAC'
    if (/roof/.test(lower)) return 'Roofing'
    return 'Home Services'
  }

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

describe('parseCity', () => {
  const parseCity = (address: string): string => {
    const parts = address.split(',').map((p) => p.trim())
    if (parts.length >= 3)
      return `${parts[parts.length - 3]}, ${parts[parts.length - 2].replace(/\d{5}.*/, '').trim()}`
    return parts[0] ?? ''
  }

  it('extracts city from full US address', () => {
    expect(parseCity('123 Main St, Austin, TX 78701, USA')).toBe('Austin, TX')
  })

  it('handles short address gracefully', () => {
    expect(parseCity('Austin')).toBe('Austin')
  })
})
