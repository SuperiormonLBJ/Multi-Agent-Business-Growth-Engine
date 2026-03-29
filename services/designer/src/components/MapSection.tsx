import { motion } from 'framer-motion'
import type { LeadData } from '../../../../shared/types'
import { ExternalLink, MapPin } from 'lucide-react'

interface Props {
  lead: Pick<LeadData, 'businessName' | 'address' | 'lat' | 'lng' | 'mapsUrl'>
}

function embedSrc(lead: Props['lead']): string | null {
  const { lat, lng, address } = lead
  if (typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`
  }
  if (address?.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&z=16&output=embed`
  }
  return null
}

export default function MapSection({ lead }: Props) {
  const { businessName, address, mapsUrl } = lead
  const src = embedSrc(lead)

  return (
    <section className="bg-slate-50 py-20 px-6" aria-labelledby="map-heading">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-semibold tracking-widest text-theme-primary uppercase flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            Location
          </span>
          <h2 id="map-heading" className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            Find us on the map
          </h2>
          {address ? (
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">{address}</p>
          ) : null}
        </div>

        {src ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-200 aspect-[16/10] sm:aspect-[21/9] min-h-[280px]"
          >
            <iframe
              title={`Map showing ${businessName} location`}
              src={src}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </motion.div>
        ) : (
          <p className="text-slate-600 text-sm">
            Map preview is not available. Open Google Maps for directions.
          </p>
        )}

        <div className="mt-6">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-theme-primary hover:opacity-80 transition-opacity"
          >
            Open in Google Maps
            <ExternalLink className="w-4 h-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}
