// Screen-size checks against a running preview: node scripts/sizes-check.mjs http://127.0.0.1:8787/ <out dir>
// Phones, tablets, laptops, Full HD, 2K and 4K: sideways scroll, anything sticking out of the screen, clipped text,
// small tap targets, soft (low-resolution) pictures, header fit, jump links hidden under the header,
// and page reflow at 200% text size. Prints only problems, plus a summary and screenshots of key pages.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const url = process.argv[2] || 'http://127.0.0.1:8787/'
const out = process.argv[3] || '/tmp'

// name, width, height, device pixel ratio (phones and tablets are sharp screens; most desktops are not)
const sizes = [
  ['phone 320', 320, 568, 2], ['phone 360', 360, 800, 3], ['phone 375', 375, 667, 2], ['phone 390', 390, 844, 3],
  ['phone 414', 414, 896, 2], ['phone 430', 430, 932, 3], ['phone landscape', 844, 390, 3], ['small phone landscape', 667, 375, 2],
  ['tablet 600', 600, 960, 2], ['tablet 768', 768, 1024, 2], ['tablet 820', 820, 1180, 2], ['tablet 1024', 1024, 768, 2],
  ['tablet landscape 1180', 1180, 820, 2], ['laptop 1280', 1280, 720, 1], ['laptop 1366', 1366, 768, 1],
  ['MacBook 1440', 1440, 900, 2], ['laptop 1536', 1536, 864, 1.25], ['Full HD 1920', 1920, 1080, 1],
  ['2K 2560', 2560, 1440, 1], ['4K 3840', 3840, 2160, 1],
]
// One page of each kind (a sweep of every page at three widths follows).
const kinds = ['', 'products/', 'products/sliding-shower-doors/', 'products/neo-angle-shower-enclosures/d15131/',
  'products/sliding-shower-doors/dlfc04/', 'products/l-and-t-shape-enclosures/t98152/', 'factory/', 'projects/', 'contact/', 'faq/', 'thank-you/']
const shotKinds = new Set(['', 'products/', 'products/sliding-shower-doors/dlfc04/'])
const shotWidths = new Set([320, 390, 768, 1024, 1366, 1920, 2560, 3840])

const only = process.env.ONLY_SIZES ? process.env.ONLY_SIZES.split(',') : null // e.g. ONLY_SIZES='phone 390,MacBook 1440'
const browser = await chromium.launch()
let problems = 0
let checks = 0
const bad = (msg) => {
  problems++
  console.log(`FAIL ${msg}`)
}

const scrollThrough = async (page) => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 700) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(45)
  }
  await page.waitForTimeout(500)
}

/** Runs inside the page. */
const measure = async () => {
  const vw = window.innerWidth
  const label = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}${el.textContent ? ` "${el.textContent.trim().slice(0, 24)}"` : ''}`
  const visible = (el) => {
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0' && el.getClientRects().length > 0
  }
  const inScroller = (el) => {
    for (let p = el.parentElement; p; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX
      if ((o === 'auto' || o === 'scroll' || o === 'hidden') && p !== document.body && p !== document.documentElement) return true
    }
    return false
  }
  const sticking = [...document.querySelectorAll('body *')]
    .filter((el) => visible(el) && !inScroller(el) && !el.closest('.visually-hidden, .skip, .trap, [popover]:not(:popover-open), svg *'))
    .filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && (r.right > vw + 1 || r.left < -1)
    })
    .map(label)
  const clipped = [...document.querySelectorAll('h1, h2, h3, p, a, li, span, td, th, label, button, summary')]
    .filter((el) => visible(el) && el.scrollWidth > el.clientWidth + 2 && ['hidden', 'clip'].includes(getComputedStyle(el).overflowX) && !el.closest('.visually-hidden'))
    .map(label)
  const targets = [...document.querySelectorAll('button, .button, input:not([type=radio]):not([type=hidden]), select, textarea, summary, .swatch, .nav a, .menu a, .index a, footer a')]
    .filter((el) => visible(el) && !el.closest('.visually-hidden, [aria-hidden=true]') && !el.closest('label.honey, .honey'))
    .filter((el) => el.getBoundingClientRect().height < 40 && !(el.tagName === 'A' && getComputedStyle(el).display === 'inline'))
    .map((el) => `${label(el)} (${Math.round(el.getBoundingClientRect().height)}px)`)
  // The picture file's own width (an <img>'s naturalWidth is rescaled by srcset, so load the file by itself).
  const own = async (src) => {
    const im = new Image()
    im.src = src
    await im.decode().catch(() => {})
    return im.naturalWidth
  }
  const soft = []
  for (const i of [...document.images].filter((i) => i.complete && i.naturalWidth > 0 && visible(i) && !(i.currentSrc || i.src).endsWith('.svg') && i.getBoundingClientRect().width >= 80)) {
    const wanted = i.getBoundingClientRect().width * window.devicePixelRatio
    const have = await own(i.currentSrc || i.src)
    const file = (i.currentSrc || i.src).split('/').pop()
    // Known limits: the client's D15131 files are only 710 and 748 px wide (nothing sharper exists in their folder),
    // and a phone held sideways at 3x needs more pixels than any normal picture size, so it only has to be 60% sharp.
    if (/^d15131[.-]/.test(file) && have < 800) continue
    if (have / wanted < (window.innerWidth > window.innerHeight && window.innerWidth < 1000 ? 0.6 : 0.8)) soft.push(`${(i.currentSrc || i.src).split('/').pop()} (${have}px file for ${Math.round(wanted)}px of screen)`)
  }
  // Words in headings, lead text and buttons that wrap in the middle (an orphan letter looks broken).
  const broken = []
  for (const h of document.querySelectorAll('h1, h2, h3, .lead, .i-name, .button')) {
    if (!visible(h)) continue
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT)
    for (let n; (n = walker.nextNode()); ) {
      for (const m of n.textContent.matchAll(/[^\s-]{4,}/g)) {
        const r = document.createRange()
        r.setStart(n, m.index)
        r.setEnd(n, m.index + m[0].length)
        if (new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size > 1) broken.push(m[0])
      }
    }
  }
  const header = document.querySelector('.site-header .bar')
  const nav = document.querySelector('.nav')
  const navLinks = nav ? [...nav.querySelectorAll('a')] : []
  const navShown = nav && getComputedStyle(nav).display !== 'none'
  const menuShown = [...document.querySelectorAll('.bar > .menu-button')].some((b) => getComputedStyle(b).display !== 'none')
  const headerProblems = []
  if (header && header.scrollWidth > header.clientWidth + 1) headerProblems.push('header content wider than the header')
  if (navShown && navLinks.some((a) => a.getBoundingClientRect().height > 50)) headerProblems.push('top bar links wrap onto two lines')
  if (!navShown && !menuShown) headerProblems.push('no top bar links and no menu button')
  if (navShown && menuShown) headerProblems.push('top bar links and menu button both showing')
  return { overflow: document.documentElement.scrollWidth - vw, sticking: [...new Set(sticking)].slice(0, 5), clipped: [...new Set(clipped)].slice(0, 5), targets: [...new Set(targets)].slice(0, 6), soft: [...new Set(soft)].slice(0, 5), headerProblems, broken: [...new Set(broken)].slice(0, 5) }
}

for (const [name, width, height, dpr] of sizes.filter((s) => !only || only.includes(s[0]))) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: dpr, hasTouch: width <= 1180, isMobile: width <= 600 })
  for (const path of kinds) {
    const page = await ctx.newPage()
    await page.goto(url + path, { waitUntil: 'load' })
    await scrollThrough(page)
    const r = await page.evaluate(measure)
    const at = `${name} (${width}x${height}) /${path}`
    checks += 6
    if (r.overflow > 0) bad(`${at}: sideways scroll by ${r.overflow}px`)
    if (r.sticking.length) bad(`${at}: sticks out of the screen: ${r.sticking.join('; ')}`)
    if (r.clipped.length) bad(`${at}: text cut off: ${r.clipped.join('; ')}`)
    if (r.targets.length) bad(`${at}: tap targets under 40px: ${r.targets.join('; ')}`)
    if (r.soft.length) bad(`${at}: soft pictures: ${r.soft.join('; ')}`)
    for (const h of r.headerProblems) bad(`${at}: ${h}`)
    if (r.broken.length) bad(`${at}: word broken across lines: ${r.broken.join(', ')}`)
    if (shotKinds.has(path) && shotWidths.has(width)) {
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.waitForTimeout(500)
      await page.screenshot({ path: `${out}/${(path || 'home').replace(/\/$/, '').replace(/\//g, '_')}-${width}.png` })
    }
    await page.close()
  }
  await ctx.close()
}

// The extra checks below run on a full run (skipped when ONLY_SIZES picks a few sizes, unless WITH_EXTRA=1).
const extras = !only || process.env.WITH_EXTRA

// Jump links must not land under the header.
for (const [width, height] of extras ? [[390, 844], [768, 1024], [1440, 900], [1920, 1080]] : []) {
  const ctx = await browser.newContext({ viewport: { width, height } })
  for (const [path, id] of [['', 'inquiry'], ['products/', 'sliding-shower-doors'], ['products/', 'bathroom-doors'], ['products/neo-angle-shower-enclosures/', 'compare'], ['products/neo-angle-shower-enclosures/d15131/', 'inquiry']]) {
    const page = await ctx.newPage()
    await page.goto(`${url}${path}#${id}`, { waitUntil: 'load' })
    await page.waitForTimeout(1200)
    const r = await page.evaluate((id) => {
      const el = document.getElementById(id)
      const h = document.querySelector('.site-header')
      const hb = h.classList.contains('is-hidden') ? 0 : h.getBoundingClientRect().bottom
      return { top: Math.round(el.getBoundingClientRect().top), headerBottom: Math.round(hb) }
    }, id)
    checks++
    if (r.top < r.headerBottom - 1) bad(`${width}px /${path}#${id}: lands under the header (target ${r.top}px, header ends ${r.headerBottom}px)`)
    await page.close()
  }
  await ctx.close()
}

// Reflow: 200% text size on a small phone must still fit the screen.
if (extras) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2 })
  for (const path of kinds) {
    const page = await ctx.newPage()
    await page.goto(url + path, { waitUntil: 'load' })
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
    await page.waitForTimeout(400)
    const r = await page.evaluate(measure)
    checks += 2
    if (r.overflow > 0) bad(`200% text at 320px /${path}: sideways scroll by ${r.overflow}px`)
    if (r.sticking.length) bad(`200% text at 320px /${path}: sticks out: ${r.sticking.join('; ')}`)
    await page.close()
  }
  await ctx.close()
}

// Every page, at seven widths: sideways scroll, anything sticking out, and words broken across lines.
if (extras) {
  const sitemap = await (await fetch(`${url}sitemap.xml`)).text()
  const paths = [...sitemap.matchAll(/<loc>[^<]*?\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
  for (const width of [320, 390, 768, 1024, 1366, 1920, 3840]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } })
    const page = await ctx.newPage()
    for (const p of paths) {
      await page.goto(new URL(p, url).href, { waitUntil: 'load' })
      const r = await page.evaluate(measure)
      checks += 3
      if (r.overflow > 0) bad(`${width}px ${p}: sideways scroll by ${r.overflow}px`)
      if (r.sticking.length) bad(`${width}px ${p}: sticks out: ${r.sticking.join('; ')}`)
      if (r.broken.length) bad(`${width}px ${p}: word broken across lines: ${r.broken.join(', ')}`)
    }
    await ctx.close()
  }
  console.log(`swept ${paths.length} pages at 320, 390, 768, 1024, 1366, 1920 and 3840 px`)
}

await browser.close()
console.log(problems ? `\n${problems} problem(s) in ${checks} checks` : `\nAll size checks passed (${checks} checks)`)
process.exit(problems ? 1 : 0)
