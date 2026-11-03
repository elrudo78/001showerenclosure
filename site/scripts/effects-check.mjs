// Checks the subtle effects against a running preview: node scripts/effects-check.mjs http://127.0.0.1:8787/
// Header hides on scroll down and returns on scroll up, hover zoom, button fill, page-change transitions
// (they run, never break on duplicate names, and are off for reduced motion).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const url = process.argv[2] || 'http://127.0.0.1:8787/'
const browser = await chromium.launch()
let problems = 0
const report = (ok, msg) => {
  if (!ok) problems++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`)
}
const wait = (page, ms = 500) => page.waitForTimeout(ms)
const headerBottom = (page) => page.$eval('.site-header', (h) => Math.round(h.getBoundingClientRect().bottom))
const watchReveal = () =>
  addEventListener('pagereveal', (e) => {
    window.__vt = e.viewTransition ? 'pending' : 'none'
    e.viewTransition?.ready.then(() => (window.__vt = 'ran'), (err) => (window.__vt = `skipped: ${err.message}`))
  })

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

// Header
await page.goto(url, { waitUntil: 'load' })
report((await headerBottom(page)) > 60, 'header visible at the top')
await page.mouse.wheel(0, 1200)
await wait(page)
report((await headerBottom(page)) <= 1, 'header hides when scrolling down')
await page.focus('.nav a')
await wait(page)
report((await headerBottom(page)) > 60, 'header comes back when a header link has keyboard focus')
await page.$eval('.nav a', (a) => a.blur())
await page.mouse.wheel(0, 600)
await wait(page)
await page.mouse.wheel(0, -300)
await wait(page)
report((await headerBottom(page)) > 60, 'header comes back when scrolling up')

// Hover: layout drawings and buttons
await page.goto(url, { waitUntil: 'load' })
await page.hover('.lineup a')
await wait(page, 700)
report((await page.$eval('.lineup .render', (i) => getComputedStyle(i).scale)) === '1.04', 'layout drawing grows on hover')
await page.hover('.hero .button')
await wait(page, 500)
report((await page.$eval('.hero .button', (b) => getComputedStyle(b).backgroundSize)) === '100% 100%', 'button fills on hover')
await page.hover('.submit .button')
await wait(page, 500)
const submit = await page.$eval('.submit .button', (b) => [getComputedStyle(b).backgroundSize, getComputedStyle(b).color])
report(submit[0] === '100% 100%' && submit[1] === 'rgb(30, 36, 32)', 'form button fills and keeps dark text')

// Product card zoom, and the picture moving into the product page
await page.addInitScript(watchReveal)
await page.goto(`${url}products/`, { waitUntil: 'load' })
const card = page.locator('.card').first()
await card.hover()
await wait(page, 700)
report((await card.locator('.img').evaluate((i) => getComputedStyle(i).scale)) === '1.04', 'product picture grows on hover')
await card.click()
await page.waitForLoadState('load')
await wait(page, 600)
report((await page.evaluate(() => window.__vt)) === 'ran', `page change transition runs (${await page.evaluate(() => window.__vt)})`)

// Sticky product picture moves down to make room for the header
await page.goto(`${url}products/neo-angle-shower-enclosures/d15131/`, { waitUntil: 'load' })
const stickyTop = () => page.$eval('.media', (m) => getComputedStyle(m).top)
await page.mouse.wheel(0, 500)
await wait(page)
const downTop = await stickyTop()
await page.mouse.wheel(0, -100)
await wait(page)
const upTop = await stickyTop()
report(downTop === '24px' && upTop === '96px', `sticky product picture makes room for the header (${downTop}, then ${upTop})`)

// Every page: no duplicate transition names (a duplicate cancels the transition)
const sitemap = await (await fetch(`${url}sitemap.xml`)).text()
const paths = [...sitemap.matchAll(/<loc>[^<]*?\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
let dupes = 0
for (const p of paths) {
  await page.goto(new URL(p, url).href, { waitUntil: 'domcontentloaded' })
  const names = await page.$$eval('*', (els) => els.map((e) => getComputedStyle(e).viewTransitionName).filter((n) => n !== 'none'))
  const seen = names.filter((n, i) => names.indexOf(n) !== i)
  if (seen.length) {
    dupes++
    console.log(`     ${p}: ${seen.join(', ')}`)
  }
}
report(paths.length > 50 && dupes === 0, `no duplicate transition names on ${paths.length} pages`)

// Finish demo: the hero runs through the finishes once by itself, then rests on black
{
  const demo = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await demo.goto(url, { waitUntil: 'load' })
  const seen = new Set()
  for (let i = 0; i < 30; i++) {
    seen.add(await demo.$eval('.hero input:checked', (i) => i.value))
    await wait(demo, 250)
  }
  const end = await demo.$eval('.hero input:checked', (i) => i.value)
  report(seen.size === 4 && end === 'black', `finish demo shows all four finishes once (${[...seen].join(', ')}; ends on ${end})`)
  await demo.close()
}

// Hardware close-ups follow the chosen finish
await page.goto(`${url}products/sliding-shower-doors/dlfc04/`, { waitUntil: 'load' })
await page.click('.swatch-brushed-gold')
await wait(page, 600)
report((await page.$eval('.hw-list li .hw-brushed-gold', (i) => getComputedStyle(i).opacity)) === '1', 'hardware close-ups switch with the finish')

// Products page: an index, four models per layout and a link to the full layout page
await page.goto(`${url}products/`, { waitUntil: 'load' })
const groups = await page.$$eval('.group', (gs) => gs.map((g) => ({ id: g.id, cards: g.querySelectorAll('.card').length, more: g.querySelector('.more a')?.getAttribute('href') || '' })))
report(groups.length === 6 && groups.every((g) => g.cards <= 4), `products page shows at most 4 models per layout (${groups.map((g) => g.cards).join(', ')})`)
report(groups[0].more === '/products/sliding-shower-doors/', 'a long layout links to its full page')
report((await page.$$('.index li')).length === 6, 'products page has an index of the 6 layouts')

// Layout page: the Compare button jumps to the comparison table
await page.goto(`${url}products/neo-angle-shower-enclosures/`, { waitUntil: 'load' })
await page.click('a[href="#compare"]')
await wait(page, 900)
const tableTop = await page.$eval('#compare', (c) => Math.round(c.getBoundingClientRect().top))
report(tableTop >= 0 && tableTop < 200, `Compare button scrolls to the table (top at ${tableTop}px)`)

// Text links: a light box rises behind them on hover
await page.goto(`${url}faq/`, { waitUntil: 'load' })
await page.hover('footer a[href="/faq/"]')
await wait(page, 400)
report((await page.$eval('footer a[href="/faq/"]', (a) => getComputedStyle(a).backgroundSize)) === '100% 100%', 'text links show the hover box')

// Reduced motion: no transition, no zoom
const calm = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
await calm.addInitScript(watchReveal)
await calm.goto(`${url}products/`, { waitUntil: 'load' })
await calm.locator('.card').first().click()
await calm.waitForLoadState('load')
await wait(calm)
report((await calm.evaluate(() => window.__vt)) === 'none', 'no page change transition with reduced motion')

// Phone: tapping does not leave pictures zoomed
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await phone.goto(`${url}products/`, { waitUntil: 'load' })
report((await phone.$eval('.card .img', (i) => getComputedStyle(i).scale)) === 'none', 'no hover zoom on touch screens')

await browser.close()
console.log(problems ? `\n${problems} problem(s)` : '\nAll effects checks passed')
process.exit(problems ? 1 : 0)
