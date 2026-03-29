import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PhotoGallery from './PhotoGallery'

describe('PhotoGallery', () => {
  it('renders nothing when galleryPhotos is missing', () => {
    const { container } = render(
      <PhotoGallery lead={{ businessName: 'Acme', galleryPhotos: undefined }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when galleryPhotos is empty', () => {
    const { container } = render(
      <PhotoGallery lead={{ businessName: 'Acme', galleryPhotos: [] }} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders up to provided photos with alt text', () => {
    const urls = [
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
      'https://example.com/c.jpg',
    ]
    render(<PhotoGallery lead={{ businessName: 'Acme Co', galleryPhotos: urls }} />)
    expect(screen.getByRole('heading', { name: /photo gallery/i })).toBeInTheDocument()
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)
    expect(imgs[0]).toHaveAttribute('alt', 'Acme Co — photo 1')
    expect(imgs[2]).toHaveAttribute('src', urls[2])
  })
})
