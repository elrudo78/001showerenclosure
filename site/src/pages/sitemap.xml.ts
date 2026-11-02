import type { APIRoute } from 'astro'
import { routes } from '../data/routes'

export const GET: APIRoute = ({ site }) => {
  const today = new Date().toISOString().slice(0, 10)
  const urls = routes()
    .map((path) => `  <url><loc>${new URL(path, site).href}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
