import type { LucideIcon } from 'lucide-react'
import {
  Droplets, Wrench, Flame, ShowerHead, Home, Siren,
  Zap, Plug, Lightbulb, Car, Cable,
  Thermometer, Wind, Fan, Gauge, Settings,
  HardHat, Search, CloudRain, Shield, FileCheck,
  Paintbrush, PaintBucket, Palette, Layers, Fence,
  UtensilsCrossed, Clock, Truck, Wine, Users,
  TreePine, Flower2, Scissors, Shovel, Sun,
  Sparkles, SprayCan, Shirt, Warehouse,
  CircleGauge, Cog, Fuel, CarFront,
  Bug, Rat, Leaf, Target,
  KeyRound, Lock, DoorOpen, Fingerprint,
  Hammer, ClipboardCheck, Star,
} from 'lucide-react'

export interface Service {
  icon: LucideIcon
  title: string
  description: string
}

const SERVICES: Record<string, Service[]> = {
  Plumber: [
    { icon: Droplets, title: 'Drain Cleaning', description: 'Kitchen, bathroom, and main line clogs cleared fast.' },
    { icon: Wrench, title: 'Pipe Repair', description: 'Burst pipes, leaks, and repiping. Emergency response available.' },
    { icon: Flame, title: 'Water Heater', description: 'Installation, repair, and replacement of all brands.' },
    { icon: ShowerHead, title: 'Fixture Repair', description: 'Running toilets, faucets, and bathroom fixture replacement.' },
    { icon: Home, title: 'Residential Plumbing', description: 'Full-service plumbing for homes and apartments.' },
    { icon: Siren, title: '24/7 Emergency', description: 'Available around the clock for urgent plumbing emergencies.' },
  ],
  Electrician: [
    { icon: Zap, title: 'Panel Upgrades', description: 'Electrical panel replacement and circuit breaker upgrades.' },
    { icon: Plug, title: 'Outlet Installation', description: 'New outlets, GFCI installation, and USB charging ports.' },
    { icon: Lightbulb, title: 'Lighting', description: 'Indoor/outdoor lighting, ceiling fans, and custom fixtures.' },
    { icon: Car, title: 'EV Charger', description: 'Level 2 home EV charger setup for all major vehicles.' },
    { icon: Cable, title: 'Home Rewiring', description: 'Full or partial rewiring for older homes and additions.' },
    { icon: Siren, title: '24/7 Emergency', description: 'Fast response for power outages and electrical emergencies.' },
  ],
  HVAC: [
    { icon: Thermometer, title: 'AC Repair', description: 'All makes and models. Fast diagnosis and same-day repair.' },
    { icon: Flame, title: 'Furnace & Heating', description: 'Furnace installation, repair, and seasonal tune-ups.' },
    { icon: Wind, title: 'Duct Cleaning', description: 'Professional duct cleaning for better air quality and efficiency.' },
    { icon: Fan, title: 'System Installation', description: 'Energy-efficient HVAC systems for homes and businesses.' },
    { icon: Settings, title: 'Preventive Maintenance', description: 'Annual service plans to keep your system running year-round.' },
    { icon: Siren, title: '24/7 Emergency', description: 'Available day and night when your system breaks down.' },
  ],
  Roofing: [
    { icon: Home, title: 'Roof Replacement', description: 'Full roof replacement with top-grade materials and warranty.' },
    { icon: Wrench, title: 'Roof Repair', description: 'Leak repair, missing shingles, and storm damage.' },
    { icon: Search, title: 'Roof Inspection', description: 'Thorough inspection with detailed report and photo documentation.' },
    { icon: CloudRain, title: 'Gutter Services', description: 'Gutter installation, cleaning, and repair.' },
    { icon: Shield, title: 'Insurance Claims', description: 'We help navigate insurance claims for storm damage.' },
    { icon: FileCheck, title: 'Free Estimates', description: 'No-obligation estimates for all roofing projects.' },
  ],
  Painting: [
    { icon: Paintbrush, title: 'Interior Painting', description: 'Walls, ceilings, trim, and cabinet painting.' },
    { icon: PaintBucket, title: 'Exterior Painting', description: 'Full exterior painting with weather-resistant coatings.' },
    { icon: Palette, title: 'Color Consultation', description: 'Expert color advice to transform your space.' },
    { icon: Layers, title: 'Surface Prep', description: 'Proper prep for long-lasting results. Patching, sanding, priming.' },
    { icon: Fence, title: 'Deck & Fence', description: 'Deck and fence staining and sealing services.' },
    { icon: FileCheck, title: 'Free Estimates', description: 'Detailed written estimates with no hidden costs.' },
  ],
  Restaurant: [
    { icon: UtensilsCrossed, title: 'Dine-In', description: 'Fresh dishes prepared daily with locally sourced ingredients.' },
    { icon: Clock, title: 'Reservations', description: 'Book a table for any occasion. Walk-ins welcome too.' },
    { icon: Truck, title: 'Delivery & Takeout', description: 'Order online or by phone. Fast delivery to your door.' },
    { icon: Wine, title: 'Drinks & Bar', description: 'Craft cocktails, wine selection, and local beers on tap.' },
    { icon: Users, title: 'Events & Catering', description: 'Private dining, group events, and off-site catering.' },
    { icon: Star, title: 'Specials', description: 'Daily specials and seasonal menu items. Ask your server.' },
  ],
  Landscaping: [
    { icon: TreePine, title: 'Lawn Care', description: 'Mowing, edging, fertilization, and weed control.' },
    { icon: Flower2, title: 'Planting & Gardens', description: 'Garden design, flower beds, shrubs, and tree planting.' },
    { icon: Scissors, title: 'Trimming & Pruning', description: 'Hedge trimming, tree pruning, and shape maintenance.' },
    { icon: Shovel, title: 'Hardscaping', description: 'Patios, walkways, retaining walls, and outdoor structures.' },
    { icon: Sun, title: 'Seasonal Cleanup', description: 'Spring and fall cleanups, leaf removal, and winterizing.' },
    { icon: Droplets, title: 'Irrigation', description: 'Sprinkler installation, repair, and system winterization.' },
  ],
  'Cleaning Service': [
    { icon: Sparkles, title: 'Deep Cleaning', description: 'Top-to-bottom deep clean for homes and offices.' },
    { icon: Home, title: 'Recurring Service', description: 'Weekly, bi-weekly, or monthly cleaning plans.' },
    { icon: SprayCan, title: 'Move-In / Move-Out', description: 'Get your deposit back. Full property cleaning.' },
    { icon: Shirt, title: 'Laundry Service', description: 'Wash, fold, and iron. Pickup and delivery available.' },
    { icon: Warehouse, title: 'Commercial Cleaning', description: 'Office, retail, and warehouse cleaning services.' },
    { icon: FileCheck, title: 'Free Estimates', description: 'Custom quotes based on your space. No obligations.' },
  ],
  'Auto Repair': [
    { icon: Wrench, title: 'General Repair', description: 'Engine, transmission, exhaust, and drivetrain repair.' },
    { icon: CircleGauge, title: 'Diagnostics', description: 'Computer diagnostics to find the problem fast.' },
    { icon: Cog, title: 'Brake Service', description: 'Brake pads, rotors, fluid, and full brake system repair.' },
    { icon: Fuel, title: 'Oil & Fluids', description: 'Oil changes, coolant flush, transmission fluid service.' },
    { icon: CarFront, title: 'Bodywork', description: 'Dent repair, paint touch-up, and collision work.' },
    { icon: FileCheck, title: 'Inspections', description: 'State inspections, pre-purchase checks, and safety audits.' },
  ],
  'Pest Control': [
    { icon: Bug, title: 'Insect Control', description: 'Ants, roaches, spiders, bed bugs, and wasps. Gone for good.' },
    { icon: Rat, title: 'Rodent Control', description: 'Mice and rat removal, exclusion, and prevention.' },
    { icon: Leaf, title: 'Termite Treatment', description: 'Inspection, treatment, and ongoing termite protection.' },
    { icon: Target, title: 'Preventive Service', description: 'Monthly and quarterly plans to keep pests away year-round.' },
    { icon: Home, title: 'Residential', description: 'Safe treatments for homes with kids and pets.' },
    { icon: Warehouse, title: 'Commercial', description: 'Restaurant, office, and warehouse pest management.' },
  ],
  Locksmith: [
    { icon: KeyRound, title: 'Lockout Service', description: 'Locked out of your home, car, or office? Fast response.' },
    { icon: Lock, title: 'Lock Installation', description: 'New locks, deadbolts, smart locks, and high-security systems.' },
    { icon: DoorOpen, title: 'Rekeying', description: 'Change your locks without replacing hardware. Same-day service.' },
    { icon: Car, title: 'Auto Locksmith', description: 'Car key cutting, fob programming, and ignition repair.' },
    { icon: Fingerprint, title: 'Smart Locks', description: 'Keypad, fingerprint, and app-controlled lock installation.' },
    { icon: Siren, title: '24/7 Emergency', description: 'Available around the clock. We come to you.' },
  ],
  'Handyman': [
    { icon: Hammer, title: 'General Repairs', description: 'Fixing what\'s broken — doors, walls, fixtures, furniture.' },
    { icon: Wrench, title: 'Plumbing Fixes', description: 'Leaky taps, running toilets, pipe connections.' },
    { icon: Plug, title: 'Electrical Work', description: 'Light fitting, switches, fans, and socket replacements.' },
    { icon: Paintbrush, title: 'Painting & Touch-Ups', description: 'Wall painting, touch-ups, and minor surface repairs.' },
    { icon: Home, title: 'Assembly & Mounting', description: 'Furniture assembly, TV mounting, shelving installation.' },
    { icon: ClipboardCheck, title: 'Free Quotes', description: 'No-obligation quotes for any job, big or small.' },
  ],
  'Handyman/Handywoman/Handyperson': [
    { icon: Hammer, title: 'General Repairs', description: 'Fixing what\'s broken — doors, walls, fixtures, furniture.' },
    { icon: Wrench, title: 'Plumbing Fixes', description: 'Leaky taps, running toilets, pipe connections.' },
    { icon: Plug, title: 'Electrical Work', description: 'Light fitting, switches, fans, and socket replacements.' },
    { icon: Paintbrush, title: 'Painting & Touch-Ups', description: 'Wall painting, touch-ups, and minor surface repairs.' },
    { icon: Home, title: 'Assembly & Mounting', description: 'Furniture assembly, TV mounting, shelving installation.' },
    { icon: ClipboardCheck, title: 'Free Quotes', description: 'No-obligation quotes for any job, big or small.' },
  ],
  'Home Services': [
    { icon: Hammer, title: 'Repairs & Maintenance', description: 'General home repairs and preventive maintenance.' },
    { icon: ClipboardCheck, title: 'Inspections', description: 'Thorough home inspections with detailed reports.' },
    { icon: Sparkles, title: 'Cleaning Services', description: 'Deep cleaning, move-in/move-out, and recurring service.' },
    { icon: TreePine, title: 'Landscaping', description: 'Lawn care, planting, and seasonal cleanups.' },
    { icon: Siren, title: 'Emergency Service', description: '24/7 emergency response for urgent home issues.' },
    { icon: FileCheck, title: 'Free Estimates', description: 'No-obligation quotes for all home service projects.' },
  ],
}

export function getServices(category: string): Service[] {
  return SERVICES[category] ?? SERVICES['Home Services']
}
