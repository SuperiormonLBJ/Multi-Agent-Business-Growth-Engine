import type { LeadData } from '../../../../shared/types'
import { Star, MapPin, Clock, BadgeCheck } from 'lucide-react'

interface Props {
  lead: Pick<LeadData, 'rating' | 'reviewCount' | 'city'>
}

export default function TrustBar({ lead }: Props) {
  const { rating, reviewCount, city } = lead

  return (
    <div className="bg-theme-accent-bg border-y border-theme-primary/10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 md:gap-10 text-sm">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-theme-primary fill-theme-primary'
                      : 'text-slate-300 fill-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
            <span className="text-slate-500">
              ({reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <div className="hidden md:block w-px h-5 bg-theme-primary/20" />

          {/* Location */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-4 h-4 text-theme-primary" />
            <span>{city || 'Local'} &amp; nearby</span>
          </div>

          <div className="hidden md:block w-px h-5 bg-theme-primary/20" />

          {/* Emergency */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-theme-primary" />
            <span>24/7 Emergency</span>
          </div>

          <div className="hidden md:block w-px h-5 bg-theme-primary/20" />

          {/* Licensed */}
          <div className="flex items-center gap-1.5 text-slate-600">
            <BadgeCheck className="w-4 h-4 text-theme-primary" />
            <span>Licensed &amp; Insured</span>
          </div>
        </div>
      </div>
    </div>
  )
}
