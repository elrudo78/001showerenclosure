import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const BASE = 'https://01showerenclosure-production.up.railway.app', out = process.argv[2]
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY },
  args: ['--ignore-certificate-errors-spki-list=' + process.env.SPKI_PIN] })
async function open(path, w = 1440, h = 900) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 })
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(50) }
  await page.waitForTimeout(800); return page
}
let p = await open('/')
await p.locator('.product-grid.featured').screenshot({ path: `${out}/home-featured.png` })
await p.locator('.category-strip').screenshot({ path: `${out}/home-categories.png` })
await p.locator('.process-cta, .custom-section').last().scrollIntoViewIfNeeded()
const facts = await p.evaluate(() => {
  const t = document.body.innerText
  return { hasEmail: /@[a-z0-9-]+\./i.test(t), hasPhone: /\+?\d[\d\s-]{8,}/.test(t), cardTitleFont: getComputedStyle(document.querySelector('.product-card h3')).fontFamily }
})
console.log(JSON.stringify(facts)); await p.close()
p = await open('/products'); await p.locator('.products-all-grid').screenshot({ path: `${out}/products-grid.png` }); await p.close()
p = await open('/products/corner-shower-enclosures/d15131-corner-shower-enclosure')
await p.locator('.product-detail-overview').screenshot({ path: `${out}/detail-overview.png` })
await p.locator('.product-detail-specifications').screenshot({ path: `${out}/detail-specs.png` }); await p.close()
p = await open('/factory'); await p.locator('.factory-gallery').screenshot({ path: `${out}/factory-gallery.png` }); await p.close()
p = await open('/about'); const tail = await p.evaluate(() => { const s = [...document.querySelectorAll('main > section, footer > div')].slice(-4); return s.map(x => x.className) }); console.log('about page ends with:', JSON.stringify(tail))
await p.close(); await browser.close()
