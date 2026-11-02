import type { APIRoute } from 'astro'
import { layouts, productsIn, productUrl, summary } from '../data/catalog'
import { company } from '../data/site'

// Every product with its full printed specifications, for AI assistants that want the detail.
export const GET: APIRoute = ({ site }) => {
  const lines = ['# Dulifei Shower Enclosures: full product specifications', '', `> ${company.description}`, '']
  for (const l of layouts) {
    lines.push(`## ${l.name}`, '')
    for (const p of productsIn(l.id)) {
      lines.push(`### ${p.name}`, '', `URL: ${new URL(productUrl(p), site).href}`, '', summary(p), '')
      const s = p.specs
      if (s) {
        const rows: [string, string | undefined][] = [
          ['Can be made as', s.shapes?.join(', ')],
          ['Door', s.door],
          ['Glass', s.glass],
          ['Seal', s.seal],
          ['Standard size', s.standard],
          ['Made to measure', s.custom],
          ['Frame finishes', s.finishes.join(', ')],
          ['Handle', s.handle],
        ]
        for (const [k, v] of rows) if (v) lines.push(`- ${k}: ${v}`)
        lines.push('')
      }
    }
  }
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
