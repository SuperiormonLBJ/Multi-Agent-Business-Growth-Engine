import { motion } from 'framer-motion'
import type { LeadData } from '../../../../shared/types'
import { getTheme } from '../data/themes'
import { Phone, ChevronRight, ShieldCheck, Instagram } from 'lucide-react'
import { hasCallablePhone } from '../../../../shared/socialContact'
import { cn } from '../lib/utils'

interface Props {
  lead: LeadData
}

function heroFontSize(name: string): string {
  if (name.length <= 20) return 'text-5xl sm:text-6xl md:text-7xl'
  if (name.length <= 35) return 'text-4xl sm:text-5xl md:text-6xl'
  return 'text-3xl sm:text-4xl md:text-5xl'
}

export default function Hero({ lead }: Props) {
  const { businessName, category, phone, city, heroImage, instagramUrl } = lead
  const hasPh = hasCallablePhone(phone)
  const hasIg = Boolean(instagramUrl)
  const theme = getTheme(category)
  const HeroIcon = theme.heroIcon

  return (
    <section className="relative overflow-hidden">
      {/* Category-specific gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-theme-gradient-from to-slate-900" />

      {/* Hero image overlay (when GMB photo available) */}
      {heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
      )}

      {/* Category icon as background decoration */}
      <HeroIcon
        aria-hidden
        className="absolute -right-16 -bottom-16 w-80 h-80 text-white/[0.03]"
        strokeWidth={0.5}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8">
            <ShieldCheck className="w-4 h-4 text-theme-primary" />
            <span className="text-xs text-slate-300 font-medium tracking-wide">
              Licensed &amp; Insured · Serving {city || 'your area'}
            </span>
          </div>

          {/* Headline with accent line */}
          <div className="border-l-4 border-theme-primary pl-6">
            <h1 className={cn(
              heroFontSize(businessName),
              'font-black text-white leading-[1.05] tracking-tight max-w-4xl'
            )}>
              {businessName}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
              {theme.heroCopy}
            </p>
          </div>

          {/* CTAs — phone and/or Instagram; quote stays secondary */}
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-4">
            {hasPh && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center justify-center gap-3 bg-theme-primary hover:bg-theme-primary/90 text-white font-bold text-lg px-8 py-4 rounded-lg transition-all shadow-lg shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/30"
              >
                <Phone className="w-5 h-5" />
                {phone}
              </a>
            )}
            {hasIg && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-3 font-bold text-lg px-8 py-4 rounded-lg transition-all shadow-lg text-white ${
                  hasPh
                    ? 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743] hover:opacity-95 shadow-[#dc2743]/20'
                    : 'bg-theme-primary hover:bg-theme-primary/90 shadow-theme-primary/25 hover:shadow-xl hover:shadow-theme-primary/30'
                }`}
              >
                <Instagram className="w-5 h-5" />
                {hasPh ? 'Instagram' : 'Message on Instagram'}
              </a>
            )}
            {!hasPh && !hasIg && (
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-3 bg-theme-primary hover:bg-theme-primary/90 text-white font-bold text-lg px-8 py-4 rounded-lg transition-all shadow-lg shadow-theme-primary/25"
              >
                Get in touch
                <ChevronRight className="w-5 h-5" />
              </a>
            )}
            <a
              href="#contact"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all"
            >
              Get Free Quote
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
              Same-day service available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
              Upfront pricing, no surprises
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />
              100% satisfaction guaranteed
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
