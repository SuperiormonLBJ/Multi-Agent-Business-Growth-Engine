import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    define: {
      // Provide mock lead data for tests (matches the real shape)
      __LEAD_DATA__: JSON.stringify({
        businessName: 'Test Business',
        category: 'Plumber',
        rating: 4.5,
        reviewCount: 100,
        reviews: [],
        phone: '(555) 000-0000',
        address: '123 Main St, Austin, TX 78701',
        city: 'Austin, TX',
        mapsUrl: 'https://maps.google.com',
        slug: 'test-business',
      }),
    },
  },
})
