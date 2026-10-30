// End-to-end inquiry form test against `npm run worker:dev` (local Worker + local database).
// Usage: node scripts/form-check.mjs http://127.0.0.1:8787/ <out dir>
// Turnstile's script loads from Cloudflare, so in the cloud session the browser goes through the agent proxy
// (set HTTPS_PROXY and SPKI_PIN as described in scripts/dev/README.md).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const url = process.argv[2] || 'http://127.0.0.1:8787/'
const out = process.argv[3] || '/tmp'
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined
const args = process.env.SPKI_PIN ? [`--ignore-certificate-errors-spki-list=${process.env.SPKI_PIN}`] : []
const browser = await chromium.launch({ proxy, args })
let problems = 0
const report = (ok, msg) => {
  if (!ok) problems++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`)
}

const fill = async (page, email) => {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.locator('#inquiry').scrollIntoViewIfNeeded()
  await page.fill('#f-name', 'Ana Silva')
  await page.fill('#f-email', email)
  await page.fill('#f-country', 'Portugal')
  await page.selectOption('#f-layout', 'Sliding doors')
  await page.fill('#f-sizes', '1400 x 2100 mm')
  await page.fill('#f-message', 'Quote for 20 sliding doors, matte black.')
}

for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })

  // A temporary address is refused with a message under the email field, and focus moves there.
  await fill(page, 'ana@mailinator.com')
  await page.click('form[name="inquiry"] button[type="submit"]')
  await page.waitForSelector('#e-email:not([hidden])', { timeout: 15000 })
  const msg = await page.textContent('#e-email')
  report(/temporary email/.test(msg), `${width}px: temporary address refused ("${msg.trim().slice(0, 60)}...")`)
  report((await page.evaluate(() => document.activeElement?.id)) === 'f-email', `${width}px: focus moves to the email field`)
  await page.locator('#inquiry').screenshot({ path: `${out}/form-error-${width}.png` })

  // A typo gets a suggestion.
  await page.fill('#f-email', 'ana@gmial.com')
  await page.click('form[name="inquiry"] button[type="submit"]')
  await page.waitForFunction(() => /Did you mean/.test(document.querySelector('#e-email')?.textContent || ''), null, { timeout: 15000 })
  report(true, `${width}px: typo gets "Did you mean ana@gmail.com?"`)

  // A real address goes through and the success panel replaces the form.
  await page.fill('#f-email', 'ana@gmail.com')
  await page.click('form[name="inquiry"] button[type="submit"]')
  await page.waitForSelector('.done:not([hidden])', { timeout: 15000 })
  const text = await page.textContent('.done-text')
  report(/ana@gmail\.com/.test(text) && /#\d+/.test(text), `${width}px: success shows the email and a reference number`)
  report(await page.evaluate(() => document.activeElement?.classList.contains('done-title')), `${width}px: focus moves to the thank-you heading`)
  await page.waitForTimeout(1200)
  await page.locator('#inquiry').screenshot({ path: `${out}/form-success-${width}.png` })

  await page.click('.done .again')
  report(await page.isVisible('form[name="inquiry"]'), `${width}px: "Send another inquiry" brings the form back`)
  await page.close()
}

await browser.close()
console.log(problems ? `\n${problems} problem(s)` : '\nAll form checks passed')
process.exit(problems ? 1 : 0)
