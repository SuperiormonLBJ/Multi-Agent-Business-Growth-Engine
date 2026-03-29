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
  mapsUrl: string
  slug: string
}
