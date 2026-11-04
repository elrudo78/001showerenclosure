import type { APIRoute } from 'astro'
import { layouts, layoutUrl, productsIn, productUrl, summary } from '../data/catalog'
import { company } from '../data/site'
import { faq } from '../data/faq'

// A plain-text summary of the site for AI assistants (https://llmstxt.org).
export const GET: APIRoute = ({ site }) => {
  const abs = (p: string) => new URL(p, site).href
  const lines = [
    '# Dulifei Shower Enclosures',
    '',
    `> ${company.description}`,
    '',
    'Products are grouped by layout. Each product page lists the standard size, the made-to-measure range, glass, seal, frame finishes and handle for that model. Buyers request quotes through the inquiry form; the sales team replies by email.',
    '',
    '## Main pages',
    '',
    `- [All products](${abs('/products/')}): the full range by layout`,
    `- [Factory](${abs('/factory/')}): glass, aluminium profiles and packing at the factory in Zhongshan`,
    `- [Projects](${abs('/projects/')}): photos of installed enclosures`,
    `- [Request a quote](${abs('/contact/')}): inquiry form`,
    `- [FAQ](${abs('/faq/')}): common questions about sizes, glass, finishes and ordering`,
    '',
  ]
  for (const l of layouts) {
    lines.push(`## ${l.name}`, '', `${l.intro} [${l.name}](${abs(layoutUrl(l))})`, '')
    for (const p of productsIn(l.id)) lines.push(`- [${p.name}](${abs(productUrl(p))}): ${summary(p)}`)
    lines.push('')
  }
  lines.push('## Common questions', '')
  for (const f of faq) lines.push(`### ${f.q}`, '', f.a, '')
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
