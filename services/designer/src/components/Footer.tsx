import type { LeadData } from '../../../../shared/types'
import { hasCallablePhone, instagramDisplayHandle } from '../../../../shared/socialContact'

interface Props {
  lead: Pick<LeadData, 'businessName' | 'phone' | 'address' | 'city' | 'instagramUrl'>
}

export default function Footer({ lead }: Props) {
  const { businessName, phone, city, instagramUrl } = lead
  const hasPh = hasCallablePhone(phone)
  const hasIg = Boolean(instagramUrl)
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-theme-primary/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{businessName}</p>
            <p className="text-slate-500 text-sm mt-0.5 flex flex-wrap items-center gap-x-1 gap-y-0.5">
              <span>{city || 'Local'}</span>
              {hasPh && (
                <>
                  <span aria-hidden>·</span>
                  <a href={`tel:${phone}`} className="hover:text-slate-400 transition-colors">
                    {phone}
                  </a>
                </>
              )}
              {hasIg && instagramUrl && (
                <>
                  <span aria-hidden>·</span>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-400 transition-colors"
                  >
                    {instagramDisplayHandle(instagramUrl)}
                  </a>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-600">
            <span>&copy; {year} {businessName}</span>
            <span>&middot;</span>
            <a
              href="mailto:optout@example.com?subject=Opt-out request"
              className="hover:text-slate-400 transition-colors underline underline-offset-4"
            >
              Opt-out
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
