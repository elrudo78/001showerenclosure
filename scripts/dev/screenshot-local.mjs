import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'

const url = process.argv[2]
const outPrefix = process.argv[3]

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
try {
  for (const [label, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    let prev = -1
    for (let i = 0; i < 60; i++) {
      await page.mouse.wheel(0, 400)
      await page.waitForTimeout(80)
      const y = await page.evaluate(() => window.scrollY)
      if (y === prev) break
      prev = y
    }
    await page.waitForTimeout(600)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(300)
    await page.screenshot({ path: `${outPrefix}-${label}.png`, fullPage: true })
    await page.close()
  }
} finally {
  await browser.close()
}
