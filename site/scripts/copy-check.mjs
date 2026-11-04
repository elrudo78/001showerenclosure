// "Does this look AI-made?" check on the built site: node scripts/copy-check.mjs [--dump]   (after `npm run build`)
// Reads the text and the styles of every page and looks for the usual tells: filler words, dashes, exclamation marks, emoji,
// Title Case headings, repeated sentences, thin or near-duplicate pages, keyword stuffing, weak alt text, titles and
// descriptions, and design clichés (purple gradients, frosted glass, gradient text, glowing blobs).
// --dump prints each distinct sentence of the site once, for reading it as a visitor would.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))
const files = walk(dist)
const pages = files.filter((f) => f.endsWith('.html')).map((f) => ({ file: f, path: '/' + f.slice(dist.length + 1).replace(/index\.html$/, ''), html: readFileSync(f, 'utf8') }))

let problems = 0
let checks = 0
const bad = (msg) => {
  problems++
  console.log(`FAIL ${msg}`)
}
const note = (msg) => console.log(`     ${msg}`)
const section = (t) => console.log(`\n${t}`)
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&times;/g, '×')

// ---- text of each page --------------------------------------------------------------------------------------------
const stripNoise = (h) => h.replace(/<script\b[\s\S]*?<\/script>/g, ' ').replace(/<style\b[\s\S]*?<\/style>/g, ' ').replace(/<svg\b[\s\S]*?<\/svg>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
// Inline tags (links, bold) are removed without a gap, so "a link." does not become "a link ."; other tags become a space.
const textOf = (h) => decode(stripNoise(h).replace(/<\/?(a|span|strong|em|b|i|code|abbr|small|sup|sub|mark|label)\b[^>]*>/g, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
for (const p of pages) {
  p.main = p.html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || ''
  p.mainText = textOf(p.main)
  p.title = decode(p.html.match(/<title>([^<]*)<\/title>/)?.[1] || '')
  p.description = decode(p.html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '')
  p.alts = [...p.html.matchAll(/<img\b[^>]*\balt="([^"]*)"/g)].map((m) => decode(m[1]))
  p.headings = [...stripNoise(p.main).matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({ level: +m[1], text: textOf(m[2]) }))
  // Everything a visitor can read: page text, title, description, picture descriptions, form labels.
  p.copy = [p.mainText, p.title, p.description, ...p.alts, ...[...p.html.matchAll(/(?:aria-label|placeholder)="([^"]+)"/g)].map((m) => decode(m[1]))].join(' \n ')
  p.sentences = p.mainText.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map((s) => s.trim()).filter((s) => s.split(' ').length >= 6)
}
const all = pages.filter((p) => !p.path.startsWith('/404'))

if (process.argv.includes('--dump')) {
  const seen = new Set()
  for (const p of all) {
    const fresh = p.sentences.filter((s) => !seen.has(s))
    fresh.forEach((s) => seen.add(s))
    if (fresh.length) console.log(`\n## ${p.path} (${p.title})\n${p.headings.map((h) => `${'#'.repeat(h.level)} ${h.text}`).join('\n')}\n${fresh.join('\n')}`)
  }
  process.exit(0)
}

// ---- 1. Words ----------------------------------------------------------------------------------------------------
section('1. Words and phrases that read as machine-written or as empty marketing')
const tells = [
  'delve', 'tapestry', 'elevate', 'elevating', 'seamless', 'seamlessly', 'unlock', 'unleash', 'revolutionize', 'revolutionary', 'cutting-edge', 'cutting edge', 'state-of-the-art', 'game-changer',
  'game changing', 'in today', 'fast-paced', 'ever-evolving', 'landscape', 'realm', 'testament', 'vibrant', 'bustling', 'navigate', 'navigating', 'journey', 'leverage', 'leveraging', 'robust',
  'comprehensive', 'holistic', 'streamline', 'empower', 'embark', 'foster', 'pivotal', 'crucial', 'paramount', 'meticulous', 'meticulously', 'intricate', 'nestled', 'boasts', 'curated', 'bespoke',
  'world-class', 'best-in-class', 'industry-leading', 'top-notch', 'second to none', 'unparalleled', 'unmatched', 'premium', 'luxurious', 'luxury', 'stunning', 'breathtaking', 'effortless', 'effortlessly',
  'hassle-free', 'one-stop', 'peace of mind', 'look no further', 'take your', 'whether you', 'not just', 'more than just', 'at the heart of', 'commitment to', 'dedicated to', 'passion for', 'crafted with',
  'attention to detail', 'high-quality', 'high quality', 'top-quality', 'finest', 'exceptional', 'elegant', 'sleek', 'timeless', 'sophisticated', 'transform your', 'transforming', 'discover the',
  'experience the', 'dive into', 'deep dive', 'ultimate', 'perfect for', 'ideal for', 'tailored', 'solutions', 'innovative', 'innovation', 'cater', 'catering', 'plays a', 'it is worth noting',
  "it's worth", 'when it comes to', 'a wide range of', 'a variety of', 'in order to', 'simply', 'basically', 'really', 'very', 'actually', 'incredibly', 'truly', 'ensure', 'ensuring', 'enhance',
  'enhancing', 'enhanced', 'optimal', 'optimum', 'state of the art', 'trusted by', 'award-winning', 'leading manufacturer', 'best', 'number one', '#1', 'click here', 'learn more', 'read more',
  'get started', 'welcome to', 'lorem ipsum', 'your company', 'coming soon', 'sample text', 'placeholder text', 'tbd', 'todo', 'fixme',
]

const counts = new Map()
for (const p of all) {
  for (const t of tells) {
    const re = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'gi')
    const hits = p.copy.match(re)
    if (hits) {
      const e = counts.get(t) || { n: 0, pages: new Set(), example: '' }
      e.n += hits.length
      e.pages.add(p.path)
      if (!e.example) e.example = (p.copy.match(new RegExp(`.{0,50}(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$).{0,40}`, 'i')) || [''])[0].trim()
      counts.set(t, e)
    }
  }
}
checks += tells.length
for (const [t, e] of [...counts].sort((a, b) => b[1].n - a[1].n)) bad(`"${t}" appears ${e.n} times on ${e.pages.size} page(s), e.g. "...${e.example}..."`)
note(`${tells.length} phrases checked on ${all.length} pages: ${counts.size === 0 ? 'none found' : counts.size + ' found'}`)

// ---- 2. Punctuation and typography -------------------------------------------------------------------------------
section('2. Punctuation and typography')
const punct = {
  'em dash': /—/, 'en dash': /–/, 'exclamation mark': /!/, 'ellipsis': /…|\.\.\./, 'emoji': /\p{Extended_Pictographic}/u, 'double space': /[^\s] {2,}[^\s]/,
  'space before comma or full stop': /\s[,.](\s|$)/, 'curly quote': /[‘’“”]/, 'semicolon': /;/, 'two exclamation or question marks': /[!?]{2,}/, 'shouting (3+ capitals in a row, not a code)': /\b[A-Z]{4,}\b(?!\d)/,
}
const allowedCaps = new Set(['DLIFE', 'DLFC', 'OEM', 'ODM', 'LED', 'HTML', 'FAQ', 'FANDU'])
for (const [name, re] of Object.entries(punct)) {
  checks++
  const where = []
  for (const p of all) {
    const m = (name.startsWith('shouting') ? [...p.copy.matchAll(/\b[A-Z]{4,}\b(?![0-9])/g)].filter((x) => !allowedCaps.has(x[0])).map((x) => x[0]) : p.copy.match(new RegExp(re.source, re.flags + 'g')))
    if (m && m.length) where.push(`${p.path} (${[...new Set(m)].slice(0, 3).join(' ')})`)
  }
  if (where.length) bad(`${name} on ${where.length} page(s): ${where.slice(0, 4).join(', ')}`)
}
{
  checks++
  const straight = all.filter((p) => /[^\w]'[a-z]|[a-z]'[a-z]/.test(p.copy)).length
  const curly = all.filter((p) => /’/.test(p.copy)).length
  if (straight && curly) bad(`apostrophes are mixed: straight on ${straight} page(s), curly on ${curly}`)
}

// ---- 3. Headings ---------------------------------------------------------------------------------------------------
section('3. Headings: one h1, no skipped levels, sentence case, no repeats')
for (const p of all) {
  checks += 4
  const h = p.headings
  if (h.filter((x) => x.level === 1).length !== 1) bad(`${p.path}: ${h.filter((x) => x.level === 1).length} h1 headings`)
  for (let i = 1; i < h.length; i++) if (h[i].level > h[i - 1].level + 1) bad(`${p.path}: heading jumps from h${h[i - 1].level} to h${h[i].level} ("${h[i].text.slice(0, 40)}")`)
  const texts = h.map((x) => x.text.toLowerCase())
  const dupes = texts.filter((t, i) => texts.indexOf(t) !== i && !/^(models|specifications)$/.test(t))
  if (dupes.length) bad(`${p.path}: repeated heading "${dupes[0]}"`)
  for (const x of h) {
    const words = x.text.split(/\s+/).filter((w) => w.length > 3 && /^[A-Za-z]/.test(w))
    const caps = words.slice(1).filter((w) => /^[A-Z]/.test(w)).length
    // Product names ("Framed Glass Bathroom Door") are written in Title Case on purpose; section headings are not.
    const productName = /\b(Door|Enclosure|Screen|System)$/.test(x.text)
    if (words.length >= 4 && caps / (words.length - 1) >= 0.7 && !productName && !/[A-Z]+\d{2,}|DLFC/.test(x.text)) bad(`${p.path}: heading in Title Case: "${x.text}"`)
  }
}
note('headings checked on every page')

// ---- 4. Titles, descriptions, picture descriptions --------------------------------------------------------------
section('4. Titles, descriptions and picture descriptions')
{
  const byTitle = new Map(), byDesc = new Map()
  for (const p of all) {
    checks += 5
    byTitle.set(p.title, [...(byTitle.get(p.title) || []), p.path])
    byDesc.set(p.description, [...(byDesc.get(p.description) || []), p.path])
    if (p.title.length > 70) bad(`${p.path}: title is ${p.title.length} characters (search results cut it at about 60): "${p.title}"`)
    if (p.description.length < 50 || p.description.length > 175) bad(`${p.path}: description is ${p.description.length} characters`)
    if (p.description.toLowerCase() === p.title.toLowerCase()) bad(`${p.path}: description repeats the title`)
    for (const a of p.alts) {
      if (/^(image|picture|photo|photograph|graphic|icon|screenshot)\b|\b(image|picture|photo) of\b|\.(jpg|jpeg|png|webp|avif)\b/i.test(a)) bad(`${p.path}: picture description reads like a label or file name: "${a}"`)
      if (a.length > 140) bad(`${p.path}: picture description is ${a.length} characters: "${a.slice(0, 60)}..."`)
    }
    const nonEmpty = p.alts.filter((a) => a && a !== 'DLIFE') // the logo appears in the header and the footer
    if (new Set(nonEmpty).size < nonEmpty.length && !/dlfc/.test(p.path)) bad(`${p.path}: two pictures share the same description`)
  }
  for (const [t, ps] of byTitle) if (ps.length > 1) bad(`the same title on ${ps.length} pages: "${t}" (${ps.slice(0, 3).join(', ')})`)
  for (const [d, ps] of byDesc) if (ps.length > 1) bad(`the same description on ${ps.length} pages (${ps.slice(0, 3).join(', ')})`)
  const lens = all.map((p) => p.title.length)
  note(`titles ${Math.min(...lens)} to ${Math.max(...lens)} characters; descriptions ${Math.min(...all.map((p) => p.description.length))} to ${Math.max(...all.map((p) => p.description.length))}; ${all.reduce((n, p) => n + p.alts.length, 0)} pictures described`)
}

// ---- 5. Repeated and near-duplicate content -------------------------------------------------------------------------
section('5. Repeated sentences, thin and near-duplicate pages')
{
  const freq = new Map()
  for (const p of all) for (const s of new Set(p.sentences)) freq.set(s, (freq.get(s) || 0) + 1)
  const shared = [...freq].filter(([, n]) => n >= 8).sort((a, b) => b[1] - a[1])
  note(`${shared.length} sentences appear on 8 or more pages${shared.length ? `; most repeated: "${shared[0][0].slice(0, 70)}..." (${shared[0][1]} pages)` : ''}`)
  const products = all.filter((p) => /^\/products\/[^/]+\/[^/]+\/$/.test(p.path))
  const shingles = (t) => { const w = t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean); const s = new Set(); for (let i = 0; i + 5 <= w.length; i++) s.add(w.slice(i, i + 5).join(' ')); return s }
  for (const p of products) p.sh = shingles(p.mainText.replace(/Request a quote for.*$/, ''))
  const uniques = products.map((p) => {
    const others = products.filter((q) => q !== p)
    const mine = [...p.sh]
    const unique = mine.filter((s) => others.filter((q) => q.sh.has(s)).length < 3)
    return { path: p.path, share: mine.length ? unique.length / mine.length : 0, words: p.mainText.split(' ').length }
  })
  checks += products.length
  for (const u of uniques.filter((u) => u.share < 0.2)) bad(`${u.path}: only ${Math.round(u.share * 100)}% of its wording is its own (thin or duplicate content)`)
  note(`${products.length} product pages: share of wording that is unique to the page, lowest ${Math.round(Math.min(...uniques.map((u) => u.share)) * 100)}%, median ${Math.round(uniques.map((u) => u.share).sort((a, b) => a - b)[Math.floor(uniques.length / 2)] * 100)}%; words per page ${Math.min(...uniques.map((u) => u.words))} to ${Math.max(...uniques.map((u) => u.words))}`)
  let maxSim = 0, pair = ''
  for (let i = 0; i < products.length; i++) for (let j = i + 1; j < products.length; j++) {
    const a = products[i].sh, b = products[j].sh
    let inter = 0
    for (const s of a) if (b.has(s)) inter++
    const sim = inter / (a.size + b.size - inter)
    if (sim > maxSim) { maxSim = sim; pair = `${products[i].path} and ${products[j].path}` }
  }
  checks++
  if (maxSim > 0.7) bad(`two product pages are ${Math.round(maxSim * 100)}% the same: ${pair}`)
  note(`most similar pair of product pages: ${Math.round(maxSim * 100)}% (${pair})`)
}

// ---- 6. Keyword stuffing -------------------------------------------------------------------------------------------
section('6. Keyword stuffing')
{
  let worst = { d: 0 }
  for (const p of all) {
    checks++
    const words = p.mainText.toLowerCase().match(/[a-z0-9-]+/g) || []
    const n = words.filter((w) => /^(shower|enclosures?)$/.test(w)).length
    const d = words.length ? n / words.length : 0
    if (d > worst.d) worst = { d, path: p.path, n, total: words.length }
    if (d > 0.08) bad(`${p.path}: "shower" and "enclosure" are ${Math.round(d * 100)}% of the words (${n} of ${words.length})`)
  }
  note(`densest page: ${worst.path}, ${Math.round(worst.d * 1000) / 10}% (${worst.n} of ${worst.total} words); a product list repeats the product names, so a little over 6% is normal there; 8% would be stuffing`)
}

// ---- 7. Leftovers in the code ----------------------------------------------------------------------------------------
section('7. Leftovers: comments, debug code, tool names, template remains')
{
  const text = files.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => ({ f: f.slice(dist.length + 1), t: readFileSync(f, 'utf8') }))
  for (const { f, t } of text) {
    checks += 4
    if (f.endsWith('.html') && /<!--(?!\s*-->)/.test(t.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/g, ''))) bad(`${f}: HTML comment left in the page`)
    if (f.endsWith('.html') && /<meta name="generator"/i.test(t)) bad(`${f}: announces the tool it was made with (generator tag)`)
    if (/console\.(log|debug|warn)\(|\bdebugger\b/.test(t)) bad(`${f}: debug code (console or debugger)`)
    if (/\b(TODO|FIXME|XXX|lorem|ipsum)\b/i.test(t.replace(/placeholder=/g, ''))) bad(`${f}: TODO, FIXME or placeholder text`)
  }
  const sitemapFavicon = readFileSync(join(dist, 'favicon.svg'), 'utf8')
  checks++
  if (/astro|vite|vercel|next|react/i.test(sitemapFavicon.slice(0, 400)) && /<title>/i.test(sitemapFavicon)) bad('favicon.svg still has a template title')
  note(`${text.length} built files checked`)
}

// ---- 8. Design clichés in the styles ------------------------------------------------------------------------------------
section('8. Design clichés in the styles (purple gradients, frosted glass, gradient text, glowing blobs, shouting labels)')
{
  const css = [...pages.map((p) => [...p.html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')), ...files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8'))].join('\n')
  const hue = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.length === 4 ? hex[(i + 1) / 2] + hex[(i + 1) / 2] : hex.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    if (max === min) return -1
    const d = max - min
    const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    return Math.round(((h * 60) + 360) % 360)
  }
  const gradients = [...css.matchAll(/(?:linear|radial|conic)-gradient\(([^;{}]*)\)/g)].map((m) => m[1])
  const purple = gradients.filter((g) => [...g.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi)].some((c) => { const h = hue(c[0]); return h >= 255 && h <= 320 }))
  const rules = {
    'purple or indigo gradient': purple.length,
    'frosted glass (backdrop-filter)': (css.match(/backdrop-filter\s*:/g) || []).length,
    'gradient text (background-clip: text)': (css.match(/background-clip\s*:\s*text/g) || []).length,
    'glowing blur blobs (filter: blur of 30px or more)': (css.match(/filter\s*:\s*blur\(\s*(\d{2,})px/g) || []).length,
    'large soft shadows (blur 30px or more)': (css.match(/box-shadow\s*:[^;}]*?\s(\d{2,})px\s+(\d{2,})px/g) || []).filter((s) => { const m = s.match(/(\d+)px\s+(\d+)px\s+(\d+)px/); return m && +m[3] >= 30 }).length,
    'very round corners (24px or more) on boxes': (css.match(/border-radius\s*:\s*(2[4-9]|[3-9]\d)px/g) || []).length + (css.match(/border-radius\s*:\s*(1\.[5-9]|[2-9])r?e?m/g) || []).length,
    'neon glows (text-shadow or drop-shadow of 10px or more)': (css.match(/(text-shadow|drop-shadow)\s*[:(][^;}]*\s\d{2,}px/g) || []).length,
  }
  for (const [name, n] of Object.entries(rules)) {
    checks++
    if (n) bad(`${name}: ${n} found`)
  }
  const upper = (css.match(/text-transform\s*:\s*uppercase/g) || []).length
  checks++
  if (upper > 3) bad(`text-transform: uppercase used ${upper} times (a small label above every heading is a template habit)`)
  const fonts = [...new Set([...css.matchAll(/font-family\s*:\s*([^;}]+)/g)].map((m) => m[1].split(',')[0].replace(/['"\s]/g, '')))]
  checks++
  if (fonts.some((f) => /^(Inter|Poppins|Roboto|OpenSans|Montserrat|Lato)$/i.test(f))) bad(`a default template font is used: ${fonts.join(', ')}`)
  const anim = [...new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))]
  const jsAll = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(f, 'utf8')).join('\n')
  const observers = (jsAll.match(/IntersectionObserver/g) || []).length
  note(`fonts: ${fonts.join(', ')}; animations: ${anim.join(', ') || 'none'}; ${gradients.length} gradients (the finish colour chips); ${upper} uppercase rule(s); scroll observers in our scripts: ${observers}`)
}

console.log(problems ? `\n${problems} problem(s) in ${checks} checks` : `\nNothing reads as machine-made (${checks} checks)`)
process.exit(problems ? 1 : 0)
