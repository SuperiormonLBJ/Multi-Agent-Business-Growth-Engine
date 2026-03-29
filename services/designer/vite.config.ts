import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Lead data is written by generate.ts before each build
const leadDataPath = resolve(__dirname, 'src/lead-data.json')
const leadData = JSON.parse(readFileSync(leadDataPath, 'utf-8'))

export default defineConfig({
  plugins: [react()],
  define: {
    // Inject lead data at build time — no runtime fetch needed
    __LEAD_DATA__: JSON.stringify(leadData),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  base: './',
})
