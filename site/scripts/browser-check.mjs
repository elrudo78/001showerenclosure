// Browser checks against a running preview: node scripts/browser-check.mjs http://localhost:4321/ <out dir>
// Widths, sideways scroll, broken images, small text, console errors, finish switcher, menu, form errors, keyboard focus.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const url = process.argv[2] || 'http://localhost:4321/'
const out = process.argv[3] || '/tmp'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
let problems = 0
const report = (ok, msg) => {
  if (!ok) problems++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`)
}

const scrollThrough = async (page) => {
  let prev = -1
  for (let i = 0; i < 80; i++) {
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(60)
    const y = await page.evaluate(() => window.scrollY)
    if (y === prev) break
    prev = y
  }
  await page.waitForTimeout(500)
}

for (const width of [390, 768, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(url, { waitUntil: 'networkidle' })
  await scrollThrough(page)
  const r = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - window.innerWidth
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)
    const tiny = [...document.querySelectorAll('body *')].filter((el) => {
      if (!el.childNodes.length || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return false
      const cs = getComputedStyle(el)
      return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.fontSize) < 12 && el.getClientRects().length
    }).length
    const font = getComputedStyle(document.body).fontFamily
    const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family)
    return { overflow, broken, tiny, font, loaded }
  })
  report(r.overflow <= 0, `${width}px: no sideways scroll (${r.overflow}px)`)
  report(r.broken.length === 0, `${width}px: no broken images ${r.broken.join(' ')}`)
  report(r.tiny === 0, `${width}px: no text under 12px (${r.tiny})`)
  report(r.loaded.includes('Archivo'), `${width}px: Archivo font loaded (${r.loaded.join(', ')})`)
  report(errors.length === 0, `${width}px: no console errors ${errors.join(' | ')}`)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${out}/home-${width}.png`, fullPage: true })
  await page.close()
}

// Finish switcher: clicking a finish shows that image.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  for (const f of ['gold', 'silver', 'chrome', 'black']) {
    await page.click(`.swatch-${f}`)
    await page.waitForTimeout(600)
    const op = await page.$eval(`.pic-${f}`, (el) => getComputedStyle(el).opacity)
    report(op === '1', `finish switcher shows ${f}`)
  }
  await page.click('.swatch-gold')
  await page.waitForTimeout(700)
  await page.locator('.stage').screenshot({ path: `${out}/hero-gold.png` })
  // Keyboard: arrow keys move between finishes.
  await page.focus('.swatch-gold input')
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(600)
  report((await page.$eval('.pic-silver', (el) => getComputedStyle(el).opacity)) === '1', 'arrow key moves to the next finish')
  await page.close()
}

// Mobile menu opens and closes.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.click('.bar > .menu-button')
  await page.waitForTimeout(200)
  report(await page.isVisible('#menu a[href="/products/"]'), 'mobile menu opens')
  await page.screenshot({ path: `${out}/menu-390.png` })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  report(!(await page.isVisible('#menu a[href="/products/"]')), 'Escape closes the mobile menu')
  await page.close()
}

// Form: empty submit shows errors and stays on the page; focus goes to the first problem.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.click('form[name="inquiry"] button[type="submit"]')
  await page.waitForTimeout(200)
  report(page.url() === url, 'empty form is not sent')
  report(await page.isVisible('#e-name'), 'name error is shown')
  report((await page.evaluate(() => document.activeElement?.id)) === 'f-name', 'focus moves to the first problem')
  await page.fill('#f-email', 'not-an-email')
  await page.click('form[name="inquiry"] button[type="submit"]')
  report(await page.isVisible('#e-email'), 'invalid email error is shown')
  await page.locator('#inquiry').screenshot({ path: `${out}/form-errors.png` })
  await page.close()
}

// Keyboard: Tab reaches the skip link first, then the logo, with a visible focus ring.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  report((await page.evaluate(() => document.activeElement?.textContent?.trim())) === 'Skip to content', 'first Tab reaches the skip link')
  const stops = []
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab')
    stops.push(
      await page.evaluate(() => {
        const el = document.activeElement
        const cs = getComputedStyle(el.type === 'radio' ? el.nextElementSibling : el)
        return { tag: el.tagName, text: (el.textContent || el.getAttribute('aria-label') || el.name || '').trim().slice(0, 30), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 }
      }),
    )
  }
  const noRing = stops.filter((s) => !s.ring && s.tag !== 'BODY')
  report(noRing.length === 0, `visible focus on every Tab stop (${noRing.map((s) => s.text).join(', ')})`)
  await page.close()
}

await browser.close()
console.log(problems ? `\n${problems} problem(s)` : '\nAll browser checks passed')
process.exit(problems ? 1 : 0)
