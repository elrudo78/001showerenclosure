import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', proxy: { server: process.env.HTTPS_PROXY },
  args: ['--ignore-certificate-errors-spki-list=' + process.env.SPKI_PIN] })
const page = await browser.newPage()
await page.goto('https://lively-frangipane-4d8b8a.netlify.app/', { waitUntil: 'networkidle' })
console.log(JSON.stringify(await page.evaluate(() => {
  const w = f => { const c = document.createElement('canvas').getContext('2d'); c.font = `40px ${f}`; return c.measureText('Shower Enclosures Wq').width }
  const fontFaces = [...document.fonts].map(f => f.family)
  return { manropeInstalled: w('Manrope, monospace') !== w('monospace'), interInstalled: w('Inter, monospace') !== w('monospace'),
    webfontsLoadedByPage: fontFaces, stylesheets: [...document.styleSheets].map(s => s.href) }
}), null, 1))
await browser.close()
