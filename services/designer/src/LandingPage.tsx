import { useEffect } from 'react'
import type { LeadData } from '../../../shared/types'
import Hero from './components/Hero'
import TrustBar from './components/TrustBar'
import Services from './components/Services'
import Reviews from './components/Reviews'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'
import InstagramFab from './components/InstagramFab'
import { hasCallablePhone } from '../../../shared/socialContact'
import PhotoGallery from './components/PhotoGallery'
import MapSection from './components/MapSection'

interface Props {
  lead: LeadData
}

export default function LandingPage({ lead }: Props) {
  const hasPh = hasCallablePhone(lead.phone)

  useEffect(() => {
    document.title = `${lead.businessName} — ${lead.category} in ${lead.city || 'Your Area'}`
  }, [lead.businessName, lead.category, lead.city])

  return (
    <div className="min-h-screen">
      <Hero lead={lead} />
      <TrustBar lead={lead} />
      <Services lead={lead} />
      <Reviews lead={lead} />
      <PhotoGallery lead={lead} />
      <MapSection lead={lead} />
      <ContactSection lead={lead} />
      <Footer lead={lead} />
      <WhatsAppFab phone={lead.phone} />
      <InstagramFab instagramUrl={lead.instagramUrl} liftAboveWhatsApp={hasPh} />
    </div>
  )
}
