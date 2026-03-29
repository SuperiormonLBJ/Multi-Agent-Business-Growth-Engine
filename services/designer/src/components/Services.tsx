import { motion } from 'framer-motion'
import type { LeadData } from '../../../../shared/types'
import { getServices } from '../data/categories'

interface Props {
  lead: Pick<LeadData, 'category' | 'businessName'>
}

export default function Services({ lead }: Props) {
  const services = getServices(lead.category)

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="text-xs font-semibold tracking-widest text-theme-primary uppercase">
            What We Do
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            Our Services
          </h2>
        </div>

        {/* 2-column list layout — no card grid, no emoji */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1">
          {services.map((svc, i) => {
            const Icon = svc.icon
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="group flex gap-4 py-5 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-theme-primary transition-colors">
                    {svc.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {svc.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
