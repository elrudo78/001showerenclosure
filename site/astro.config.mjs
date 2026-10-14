// @ts-check
import { defineConfig } from 'astro/config'

// Netlify sets URL during its builds; locally the site runs on the dev server.
export default defineConfig({
  site: process.env.URL || 'http://localhost:4321',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
})
