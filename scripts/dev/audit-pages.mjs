import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const BASE = 'https://lively-frangipane-4d8b8a.netlify.app'
const out = process.argv[2]
const pages = ['/', '/products', '/products/corner-shower-enclosures/d15131-corner-shower-enclosure', '/factory', '/projects', '/certifications', '/about', '/contact']
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY },
  args: ['--ignore-certificate-errors-spki-list=' + process.env.SPKI_PIN + ''] })
const report = []
for (const [label, w, h] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  for (const path of pages) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    const errors = []
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)) })
    page.on('pageerror', e => errors.push(String(e).slice(0, 120)))
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 })
    for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60) }
    await page.waitForTimeout(700)
    const info = await page.evaluate(() => {
      const fam = s => { const el = document.querySelector(s); return el ? getComputedStyle(el).fontFamily : null }
      const text = document.body.innerText
      return {
        title: document.title,
        overflowX: document.documentElement.scrollWidth - window.innerWidth,
        brokenImgs: [...document.images].filter(i => i.complete && i.naturalWidth === 0).length,
        emDashes: (text.match(/—/g) || []).length,
        fontsLoaded: { Manrope: document.fonts.check('16px Manrope'), Inter: document.fonts.check('16px Inter') },
        declared: { h1: fam('h1'), h2: fam('h2'), body: fam('body'), cardTitle: fam('.product-card h3, .category-card > span, .principles h3'), footerH2: fam('.footer-lead h2') },
        tinyText: [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 12).length,
        allCapsLabels: document.querySelectorAll('.eyebrow').length,
      }
    })
    report.push({ label, path, errors: errors.slice(0, 3), ...info })
    await page.screenshot({ path: `${out}/${label}${path.replace(/\//g, '_') || '_home'}.png`, fullPage: true })
    await page.close()
  }
}
await browser.close()
console.log(JSON.stringify(report, null, 1))
