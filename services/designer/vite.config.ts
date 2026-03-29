import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Lead data is written by generate.ts before each build
const leadDataPath = resolve(__dirname, 'src/lead-data.json')
const leadData = JSON.parse(readFileSync(leadDataPath, 'utf-8'))

/** Vite adds `crossorigin` to bundled tags; with file:// that often blocks the module → blank page. */
function stripCrossoriginOnRelativeAssets(): Plugin {
  return {
    name: 'strip-crossorigin-relative-assets',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml(html) {
      const strip = (attrs: string) =>
        attrs.replace(/\s+crossorigin(?:=["'][^"']*["'])?/gi, '')
      return html
        .replace(/<script\b([^>]*)>/gi, (full, inner) => {
          if (!inner.includes('./assets/')) return full
          return `<script${strip(inner)}>`
        })
        .replace(/<link\b([^>]*)>/gi, (full, inner) => {
          if (!inner.includes('./assets/')) return full
          return `<link${strip(inner)}>`
        })
    },
  }
}

export default defineConfig({
  plugins: [react(), stripCrossoriginOnRelativeAssets()],
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
