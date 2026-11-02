import type { APIRoute } from 'astro'

// Search engines and AI assistants are welcome: the site exists to be found.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
