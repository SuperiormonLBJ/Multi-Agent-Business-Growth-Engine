import { motion } from 'framer-motion'
import type { LeadData } from '../../../../shared/types'
import { Camera } from 'lucide-react'

interface Props {
  lead: Pick<LeadData, 'businessName' | 'galleryPhotos'>
}

export default function PhotoGallery({ lead }: Props) {
  const { businessName, galleryPhotos } = lead
  if (!galleryPhotos?.length) return null

  return (
    <section className="bg-white py-20 px-6" aria-labelledby="gallery-heading">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-10">
          <div className="flex-1">
            <span className="text-xs font-semibold tracking-widest text-theme-primary uppercase flex items-center gap-2">
              <Camera className="w-3.5 h-3.5" aria-hidden />
              From Google
            </span>
            <h2 id="gallery-heading" className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
              Photo gallery
            </h2>
            <p className="mt-2 text-slate-600 text-sm max-w-xl">
              Recent photos from this business on Google Maps.
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 list-none p-0 m-0">
          {galleryPhotos.map((src, i) => (
            <motion.li
              key={`${src}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-sm"
            >
              <img
                src={src}
                alt={`${businessName} — photo ${i + 1}`}
                className="h-full w-full object-cover hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
