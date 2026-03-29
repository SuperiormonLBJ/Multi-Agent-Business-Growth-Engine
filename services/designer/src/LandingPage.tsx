import { useEffect } from 'react'
import type { LeadData } from '../../../shared/types'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import Reviews from './components/Reviews'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

interface Props {
  lead: LeadData
}

export default function LandingPage({ lead }: Props) {
  useEffect(() => {
    document.title = `${lead.businessName} — ${lead.category} in ${lead.city || 'Your Area'}`
  }, [lead.businessName, lead.category, lead.city])

  return (
    <div className="min-h-screen">
      <Hero lead={lead} />
      <TrustBar lead={lead} />
      <Services lead={lead} />
      <Reviews lead={lead} />
      <ContactSection lead={lead} />
      <Footer lead={lead} />
    </div>
  )
}
