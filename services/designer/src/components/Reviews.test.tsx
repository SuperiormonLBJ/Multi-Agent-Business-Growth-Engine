import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Reviews from './Reviews'
import type { Review } from '../../../../shared/types'

describe('Reviews showcase', () => {
  it('renders up to 10 scraped reviews when provided', () => {
    const reviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      reviewer: `User${i}`,
      rating: 5,
      text: 'Excellent work done on time and very professional service here.',
      relativeTime: '1 month ago',
    }))
    render(
      <Reviews
        lead={{
          businessName: 'Test Co',
          rating: 5,
          reviewCount: 100,
          reviews,
        }}
      />
    )
    expect(screen.getByText('User0')).toBeInTheDocument()
    expect(screen.getByText('User9')).toBeInTheDocument()
  })

  it('uses fallback when no reviews', () => {
    render(
      <Reviews
        lead={{
          businessName: 'Test Co',
          rating: 4.5,
          reviewCount: 12,
          reviews: [],
        }}
      />
    )
    expect(screen.getByText('Verified Customer')).toBeInTheDocument()
  })
})
