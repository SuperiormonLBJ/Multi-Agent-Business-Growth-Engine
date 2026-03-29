import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LandingPage from './src/LandingPage'
import type { LeadData } from '../../shared/types'

const MOCK_LEAD: LeadData = {
  businessName: 'Austin Pro Plumbing',
  category: 'Plumber',
  rating: 4.8,
  reviewCount: 312,
  reviews: [
    { reviewer: 'Sarah M.', rating: 5, text: 'Called at 9pm with a burst pipe. They fixed everything properly.', relativeTime: '2 weeks ago' },
    { reviewer: 'James T.', rating: 5, text: 'Fair price, explained everything before starting work.', relativeTime: '1 month ago' },
    { reviewer: 'R. Williams', rating: 5, text: 'Same day service, professional and honest.', relativeTime: '3 weeks ago' },
  ],
  phone: '(512) 555-0192',
  address: '4801 Research Blvd, Austin, TX 78759, USA',
  city: 'Austin, TX',
  lat: 30.4022,
  lng: -97.7205,
  galleryPhotos: [
    'https://example.com/g1.jpg',
    'https://example.com/g2.jpg',
  ],
  mapsUrl: 'https://www.google.com/maps',
  slug: 'austin-pro-plumbing',
}

describe('LandingPage', () => {
  it('renders the business name in the hero', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Austin Pro Plumbing')
  })

  it('renders the phone number as a callable link', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    const phoneLinks = screen.getAllByRole('link', { name: /512/ })
    expect(phoneLinks[0]).toHaveAttribute('href', 'tel:(512) 555-0192')
  })

  it('renders reviews from lead data', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    // Reviews contain specific text from MOCK_LEAD
    expect(screen.getAllByText(/burst pipe/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/fair price/i)).toBeInTheDocument()
  })

  it('renders service items for Plumber category', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByText('Drain Cleaning')).toBeInTheDocument()
    expect(screen.getByText('Pipe Repair')).toBeInTheDocument()
  })

  it('renders the contact section', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByText(/ready to help/i)).toBeInTheDocument()
  })

  it('renders the opt-out link in footer', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByRole('link', { name: /opt-out/i })).toBeInTheDocument()
  })

  it('uses fallback services for unknown category', () => {
    const lead = { ...MOCK_LEAD, category: 'Unknown Trade' }
    render(<LandingPage lead={lead} />)
    expect(screen.getByText('Repairs & Maintenance')).toBeInTheDocument()
  })

  it('shows city in trust bar', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getAllByText(/Austin, TX/).length).toBeGreaterThanOrEqual(1)
  })

  it('uses category-specific hero copy for Plumber', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    // Hero copy from themes.ts for Plumber category
    expect(screen.getByText(/leaking faucet/i)).toBeInTheDocument()
  })

  it('shows fallback reviews when no reviews scraped', () => {
    const lead = { ...MOCK_LEAD, reviews: [] }
    render(<LandingPage lead={lead} />)
    expect(screen.getByText(/excellent service/i)).toBeInTheDocument()
  })

  it('renders restaurant category with correct services', () => {
    const lead = { ...MOCK_LEAD, category: 'Restaurant' }
    render(<LandingPage lead={lead} />)
    expect(screen.getByText('Dine-In')).toBeInTheDocument()
    expect(screen.getByText('Delivery & Takeout')).toBeInTheDocument()
  })

  it('renders locksmith category with correct services', () => {
    const lead = { ...MOCK_LEAD, category: 'Locksmith' }
    render(<LandingPage lead={lead} />)
    expect(screen.getByText('Lockout Service')).toBeInTheDocument()
    expect(screen.getByText('Smart Locks')).toBeInTheDocument()
  })

  it('renders photo gallery when galleryPhotos are present', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByRole('heading', { name: /photo gallery/i })).toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /austin pro plumbing — photo/i })).toHaveLength(2)
  })

  it('renders map section with embedded map', () => {
    render(<LandingPage lead={MOCK_LEAD} />)
    expect(screen.getByRole('heading', { name: /find us on the map/i })).toBeInTheDocument()
    expect(screen.getByTitle(/map showing austin pro plumbing location/i)).toBeInTheDocument()
  })
})
