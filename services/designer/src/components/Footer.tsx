import type { LeadData } from '../../../../shared/types'

interface Props {
  lead: Pick<LeadData, 'businessName' | 'phone' | 'address' | 'city'>
}

export default function Footer({ lead }: Props) {
  const { businessName, phone, city } = lead
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 border-t border-theme-primary/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{businessName}</p>
            <p className="text-slate-500 text-sm mt-0.5">
              {city || 'Local'} · {phone}
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
