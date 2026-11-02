// @ts-check
import { defineConfig } from 'astro/config'

// SITE_URL is the public address (workers.dev preview, later the client's domain); see DEPLOY.md.
export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  devToolbar: { enabled: false },
})
