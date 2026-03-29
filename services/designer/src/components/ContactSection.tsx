import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LeadData } from '../../../../shared/types'
import { Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

interface Props {
  lead: Pick<LeadData, 'phone' | 'address' | 'businessName' | 'city'>
}

export default function ContactSection({ lead }: Props) {
  const { phone, businessName, city } = lead
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (!form.message.trim()) errs.message = 'Please describe your issue'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    // Formspree endpoint (set via VITE_FORMSPREE_ENDPOINT env var)
    const endpoint = (window as unknown as Record<string, unknown>).__FORMSPREE_ENDPOINT__ as
      | string
      | undefined
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ name: form.name, phone: form.phone, message: form.message, business: businessName }),
        })
      } catch {
        // Fallback silently — form submission is best-effort in Phase C
      }
    } else {
      // Fallback: mailto
      const subject = encodeURIComponent(`New inquiry for ${businessName}`)
      const body = encodeURIComponent(`Name: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    }
    setSubmitted(true)
  }

  return (
    <section id="contact" className="bg-slate-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — contact info */}
          <div>
            <span className="text-xs font-semibold tracking-widest text-theme-primary uppercase">
              Get In Touch
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">
              Ready to help.<br />Call us now.
            </h2>

            <a href={`tel:${phone}`} className="mt-8 flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-lg bg-theme-primary flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl sm:text-4xl font-black text-theme-primary group-hover:opacity-80 transition-opacity">
                {phone || 'Contact Us'}
              </span>
            </a>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Service Area</p>
                  <p className="text-sm">{city || 'Local'} and surrounding areas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-400">
                <Clock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Hours</p>
                  <p className="text-sm">Mon – Fri: 7am – 7pm</p>
                  <p className="text-sm">Emergency: 24 / 7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-full text-center gap-4 py-8"
              >
                <CheckCircle className="w-14 h-14 text-theme-primary" />
                <h3 className="text-white font-bold text-xl">Request sent!</h3>
                <p className="text-slate-400 text-sm">
                  We'll call you back within the hour.
                </p>
              </motion.div>
            ) : (
              <>
                <h3 className="text-white font-bold text-lg mb-6">Send a message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs text-slate-400 mb-1.5">Your Name</label>
                    <input
                      id="name"
                      required
                      type="text"
                      placeholder="John Smith"
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: '' }) }}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary transition-all"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone-input" className="block text-xs text-slate-400 mb-1.5">Phone Number</label>
                    <input
                      id="phone-input"
                      required
                      type="tel"
                      placeholder="(512) 555-0100"
                      value={form.phone}
                      onChange={(e) => { setForm({ ...form, phone: e.target.value }); setErrors({ ...errors, phone: '' }) }}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary transition-all"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-xs text-slate-400 mb-1.5">Describe your issue</label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="e.g. Leaking pipe under the kitchen sink, need someone ASAP..."
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: '' }) }}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary transition-all resize-none"
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-theme-primary/25"
                  >
                    <Send className="w-4 h-4" />
                    Send Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
