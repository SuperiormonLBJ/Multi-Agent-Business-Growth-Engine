import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LandingPage from './LandingPage'
import type { LeadData } from '../../../shared/types'

// Lead data injected via build-time define OR runtime lead-data.js
declare const __LEAD_DATA__: LeadData

const lead: LeadData =
  typeof __LEAD_DATA__ !== 'undefined'
    ? __LEAD_DATA__
    : (window as unknown as Record<string, unknown>).__LEAD_DATA__ as LeadData

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage lead={lead} />
  </StrictMode>
)
