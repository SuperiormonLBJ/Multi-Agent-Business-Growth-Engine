import type { LucideIcon } from 'lucide-react'
import {
  Droplets, Zap, Thermometer, Home, Paintbrush,
  UtensilsCrossed, TreePine, Sparkles, Wrench,
  Bug, KeyRound, Hammer,
} from 'lucide-react'

export interface ThemeConfig {
  primary: string
  primaryDark: string
  primaryLight: string
  gradientFrom: string
  accentBg: string
  heroIcon: LucideIcon
  heroCopy: string
}

const THEMES: Record<string, ThemeConfig> = {
  Plumber: {
    primary: '59 130 246',
    primaryDark: '30 64 175',
    primaryLight: '191 219 254',
    gradientFrom: '30 58 138',
    accentBg: '239 246 255',
    heroIcon: Droplets,
    heroCopy: 'Burst pipe? Leaking faucet? We\'ll be there today.',
  },
  Electrician: {
    primary: '245 158 11',
    primaryDark: '217 119 6',
    primaryLight: '254 243 199',
    gradientFrom: '120 53 15',
    accentBg: '255 251 235',
    heroIcon: Zap,
    heroCopy: 'Panels, outlets, EV chargers. Licensed and on call.',
  },
  HVAC: {
    primary: '6 182 212',
    primaryDark: '14 116 144',
    primaryLight: '165 243 252',
    gradientFrom: '22 78 99',
    accentBg: '236 254 255',
    heroIcon: Thermometer,
    heroCopy: 'AC down? Heat out? Same-day diagnosis and repair.',
  },
  Roofing: {
    primary: '132 204 22',
    primaryDark: '77 124 15',
    primaryLight: '217 249 157',
    gradientFrom: '26 46 5',
    accentBg: '247 254 231',
    heroIcon: Home,
    heroCopy: 'Storm damage? Missing shingles? Free inspection today.',
  },
  Painting: {
    primary: '168 85 247',
    primaryDark: '107 33 168',
    primaryLight: '233 213 255',
    gradientFrom: '59 7 100',
    accentBg: '250 245 255',
    heroIcon: Paintbrush,
    heroCopy: 'Transform your space. Interior and exterior, done right.',
  },
  Restaurant: {
    primary: '239 68 68',
    primaryDark: '185 28 28',
    primaryLight: '254 202 202',
    gradientFrom: '127 29 29',
    accentBg: '254 242 242',
    heroIcon: UtensilsCrossed,
    heroCopy: 'Fresh food, fast service. See our menu and order now.',
  },
  Landscaping: {
    primary: '34 197 94',
    primaryDark: '21 128 61',
    primaryLight: '187 247 208',
    gradientFrom: '5 46 22',
    accentBg: '240 253 244',
    heroIcon: TreePine,
    heroCopy: 'Lawn care, planting, seasonal cleanups. Your yard, perfected.',
  },
  'Cleaning Service': {
    primary: '14 165 233',
    primaryDark: '3 105 161',
    primaryLight: '186 230 253',
    gradientFrom: '12 74 110',
    accentBg: '240 249 255',
    heroIcon: Sparkles,
    heroCopy: 'Deep cleaning, move-in/out, recurring service. Spotless guaranteed.',
  },
  'Auto Repair': {
    primary: '249 115 22',
    primaryDark: '194 65 12',
    primaryLight: '254 215 170',
    gradientFrom: '124 45 18',
    accentBg: '255 247 237',
    heroIcon: Wrench,
    heroCopy: 'Engine trouble? Brakes squealing? Drive in, drive out fixed.',
  },
  'Pest Control': {
    primary: '234 179 8',
    primaryDark: '161 98 7',
    primaryLight: '254 240 138',
    gradientFrom: '113 63 18',
    accentBg: '254 252 232',
    heroIcon: Bug,
    heroCopy: 'Ants, roaches, termites, rodents. Gone for good.',
  },
  Locksmith: {
    primary: '99 102 241',
    primaryDark: '67 56 202',
    primaryLight: '199 210 254',
    gradientFrom: '49 46 129',
    accentBg: '238 242 255',
    heroIcon: KeyRound,
    heroCopy: 'Locked out? New locks? Rekeying? Fast, licensed, 24/7.',
  },
  'Handyman': {
    primary: '245 158 11',
    primaryDark: '217 119 6',
    primaryLight: '254 243 199',
    gradientFrom: '120 53 15',
    accentBg: '255 251 235',
    heroIcon: Hammer,
    heroCopy: 'No job too small. Repairs, installs, and fixes — done right.',
  },
  'Handyman/Handywoman/Handyperson': {
    primary: '245 158 11',
    primaryDark: '217 119 6',
    primaryLight: '254 243 199',
    gradientFrom: '120 53 15',
    accentBg: '255 251 235',
    heroIcon: Hammer,
    heroCopy: 'No job too small. Repairs, installs, and fixes — done right.',
  },
  'Home Services': {
    primary: '245 158 11',
    primaryDark: '217 119 6',
    primaryLight: '254 243 199',
    gradientFrom: '120 53 15',
    accentBg: '255 251 235',
    heroIcon: Hammer,
    heroCopy: 'Repairs, maintenance, and improvements. One call does it all.',
  },
}

export function getTheme(category: string): ThemeConfig {
  return THEMES[category] ?? THEMES['Home Services']
}

export function getThemeCss(category: string): string {
  const t = getTheme(category)
  return `:root {
  --color-primary: ${t.primary};
  --color-primary-dark: ${t.primaryDark};
  --color-primary-light: ${t.primaryLight};
  --color-gradient-from: ${t.gradientFrom};
  --color-accent-bg: ${t.accentBg};
}`
}
