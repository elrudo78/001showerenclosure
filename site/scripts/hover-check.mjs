import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
// Hover contrast of text links, above all on the dark inquiry band (links once turned dark sage on dark green and vanished).
//   node scripts/hover-check.mjs <url>   (default http://127.0.0.1:8787)
const base = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '')
const pages = ['/', '/contact/', '/products/', '/products/sliding-shower-doors/', '/products/sliding-shower-doors/dlfc01/', '/products/neo-angle-shower-enclosures/', '/factory/', '/projects/', '/faq/', '/privacy/']
const b = await chromium.launch({ proxy: process.env.HTTPS_PROXY && !/127\.0\.0\.1|localhost/.test(base) ? { server: process.env.HTTPS_PROXY } : undefined, args: process.env.SPKI_PIN ? ['--ignore-certificate-errors-spki-list=' + process.env.SPKI_PIN] : [] })
let problems = 0, checked = 0
for (const w of [390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  for (const path of pages) {
    await p.goto(base + path, { waitUntil: 'networkidle' })
    // the form band's links, plus the first few other links (light page)
    const idx = await p.$$eval('a', (as) => as.map((a, i) => [i, !!a.closest('.inquiry'), a.offsetParent !== null]).filter((x) => x[2]).map((x) => [x[0], x[1]]))
    const picked = [...idx.filter((x) => x[1]), ...idx.filter((x) => !x[1]).slice(0, 8)]
    for (const [i] of picked) {
      const el = (await p.$$('a'))[i]
      await el.scrollIntoViewIfNeeded()
      await el.hover({ force: true, timeout: 2000 }).catch(() => {})
      await p.waitForTimeout(300)
      const r = await el.evaluate((a) => {
        const cv = document.createElement('canvas'); cv.width = cv.height = 1
        const ctx = cv.getContext('2d', { willReadFrequently: true })
        const rgba = (c) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = c; ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255] }
        const text = rgba(getComputedStyle(a).color)
        let bg = [255, 255, 255], el = a
        while (el) { const c = rgba(getComputedStyle(el).backgroundColor); if (c[3] > 0.95) { bg = c.slice(0, 3); break } el = el.parentElement }
        const cs = getComputedStyle(a)
        const m = cs.backgroundImage.match(/rgba?\([^)]*\)|color\([^)]*\)/)
        let eff = bg
        if (m && cs.backgroundSize.startsWith('100% 100%')) { const t = rgba(m[0]); eff = bg.map((v, k) => v * (1 - t[3]) + t[k] * t[3]) }
        return { text, bg: eff, label: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 30) }
      })
      const lum = (c) => { const [x, y, z] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }); return 0.2126 * x + 0.7152 * y + 0.0722 * z }
      const hi = Math.max(lum(r.text), lum(r.bg)), lo = Math.min(lum(r.text), lum(r.bg))
      const cr = (hi + 0.05) / (lo + 0.05)
      checked++
      if (cr < 4.5) { problems++; console.log(`LOW CONTRAST ${cr.toFixed(2)} on hover: "${r.label}" at ${path} (${w}px)`) }
      await p.mouse.move(0, 0)
    }
  }
  await p.close()
}
console.log(`${checked} link hovers checked, ${problems} problem(s)`)
await b.close()
process.exit(problems ? 1 : 0)
