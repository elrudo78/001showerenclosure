// Checks the built HTML in dist/ the way a crawler sees it (no JavaScript).
// Usage: npm run build && npm run check:site
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
const pages = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (name.endsWith('.html')) pages.push(path)
  }
}
walk(dist)

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const routeExists = (href) => {
  const clean = href.split('#')[0].split('?')[0]
  if (clean === '' || clean === '/') return existsSync(join(dist, 'index.html'))
  const p = join(dist, clean)
  return existsSync(p) && (statSync(p).isFile() || existsSync(join(p, 'index.html')))
}

let failures = 0
const fail = (page, msg) => {
  failures++
  console.log(`  FAIL ${msg}`)
}
const missingLinks = new Set()

for (const file of pages.sort()) {
  const html = readFileSync(file, 'utf8')
  const page = '/' + relative(dist, file).replace(/index\.html$/, '')
  const body = text(html)
  const words = body.split(' ').filter((w) => /[a-z0-9]/i.test(w)).length
  console.log(`${page}  ${(html.length / 1024).toFixed(1)} KB, ${words} words`)

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
  if (!title) fail(page, 'no <title>')
  if (!/<meta name="description" content="[^"]{50,}"/.test(html)) fail(page, 'missing or short meta description')
  if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(html) && !page.startsWith('/404')) fail(page, 'no canonical')
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(page, 'not exactly one <h1>')
  if (/[㐀-鿿豈-﫿]/.test(html)) fail(page, 'Chinese characters in HTML')
  if (/—/.test(body)) fail(page, 'em dash in text')
  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\balt="[^"]*"/.test(img)) fail(page, `image without alt: ${img.slice(0, 80)}`)
    if (!/\bwidth="\d+"/.test(img) || !/\bheight="\d+"/.test(img)) fail(page, `image without width/height: ${img.slice(0, 80)}`)
  }
  for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href) || href.startsWith('#')) continue
    if (!routeExists(href)) missingLinks.add(href)
  }
}

if (missingLinks.size) console.log(`\nLinks to pages not built yet: ${[...missingLinks].sort().join(', ')}`)
console.log(failures ? `\n${failures} problem(s)` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
