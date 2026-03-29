export interface Review {
  reviewer: string
  rating: number
  text: string
  relativeTime: string
}

export interface LeadData {
  businessName: string
  category: string
  rating: number
  reviewCount: number
  reviews: Review[]
  phone: string
  address: string
  city: string
  website?: string
  heroImage?: string
  /** Google Places place id (resource id), when available from Details */
  placeId?: string
  /** WGS84 latitude from Places Details `location` */
  lat?: number
  /** WGS84 longitude from Places Details `location` */
  lng?: number
  /** Up to 5 Places photo media URLs (album) */
  galleryPhotos?: string[]
  mapsUrl: string
  slug: string
}
