import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WhatsAppFab from './WhatsAppFab'

describe('WhatsAppFab', () => {
  it('renders a wa.me link with digits-only phone in a new tab', () => {
    render(<WhatsAppFab phone="+65 8314 1874" />)
    const link = screen.getByRole('link', { name: /chat on whatsapp/i })
    expect(link).toHaveAttribute('href', 'https://wa.me/6583141874')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders nothing when phone has no digits', () => {
    const { container } = render(<WhatsAppFab phone="n/a" />)
    expect(container.firstChild).toBeNull()
  })
})
