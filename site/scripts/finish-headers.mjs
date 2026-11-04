// Runs after `astro build`: adds the Content-Security-Policy to dist/_headers.
// The policy lists the exact fingerprint (sha256) of every inline script the build produced, so the browser runs
// those and refuses any other script that might be injected. Nothing else is allowed except Cloudflare's spam check
// and (optionally) Cloudflare Web Analytics. Styles may be inline (Astro writes scoped CSS into the pages).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const walk = (d) => readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]))

const hashes = new Set()
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
  for (const [, attrs, body] of readFileSync(file, 'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs)) continue
    const type = attrs.match(/\btype="([^"]*)"/)?.[1]
    // JSON-LD is only data. The page-preparation hints (speculation rules) are checked against the policy like a script, so they are listed too.
    if (type && type !== 'module' && type !== 'speculationrules') continue
    hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
  }
}

const cloudflare = 'https://challenges.cloudflare.com'
const csp = [
  `default-src 'self'`,
  `script-src 'self' ${[...hashes].sort().join(' ')} 'inline-speculation-rules' ${cloudflare} https://static.cloudflareinsights.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  `connect-src 'self' ${cloudflare} https://cloudflareinsights.com`,
  `frame-src ${cloudflare}`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join('; ')

// Cloudflare reads at most 2,000 characters per header line.
if (csp.length > 1900) throw new Error(`Content-Security-Policy is ${csp.length} characters, over the 2,000 limit`)

const path = join(dist, '_headers')
const headers = readFileSync(path, 'utf8')
if (!/^\/\*\n/m.test(headers)) throw new Error('dist/_headers has no /* block')
writeFileSync(path, headers.replace(/^\/\*\n/m, `/*\n  Content-Security-Policy: ${csp}\n`))
console.log(`Content-Security-Policy added (${hashes.size} inline scripts allowed by fingerprint, ${csp.length} characters)`)
