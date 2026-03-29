import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapSection from './MapSection'

const baseLead = {
  businessName: 'Acme Co',
  address: '1 Main St',
  mapsUrl: 'https://maps.google.com/?q=acme',
}

describe('MapSection', () => {
  it('embeds map with lat/lng in iframe src', () => {
    render(
      <MapSection
        lead={{
          ...baseLead,
          lat: 1.2868,
          lng: 103.8545,
        }}
      />
    )
    const frame = screen.getByTitle(/map showing acme co location/i)
    const src = frame.getAttribute('src') ?? ''
    expect(src).toContain(encodeURIComponent('1.2868,103.8545'))
    expect(src).toMatch(/maps\.google\.com/)
  })

  it('falls back to address query when coordinates missing', () => {
    render(
      <MapSection
        lead={{
          ...baseLead,
          address: '99 Orchard Rd, Singapore',
        }}
      />
    )
    const frame = screen.getByTitle(/map showing acme co location/i)
    expect(frame.getAttribute('src')).toContain(encodeURIComponent('99 Orchard Rd, Singapore'))
  })

  it('links to mapsUrl', () => {
    render(<MapSection lead={baseLead} />)
    const link = screen.getByRole('link', { name: /open in google maps/i })
    expect(link).toHaveAttribute('href', baseLead.mapsUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
