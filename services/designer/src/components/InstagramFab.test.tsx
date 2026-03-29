import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import InstagramFab from './InstagramFab'

describe('InstagramFab', () => {
  it('renders Instagram link when URL provided', () => {
    render(<InstagramFab instagramUrl="https://www.instagram.com/foo/" />)
    const a = screen.getByRole('link', { name: /instagram/i })
    expect(a).toHaveAttribute('href', 'https://www.instagram.com/foo/')
    expect(a).toHaveAttribute('target', '_blank')
  })

  it('renders nothing without URL', () => {
    const { container } = render(<InstagramFab />)
    expect(container.firstChild).toBeNull()
  })
})
