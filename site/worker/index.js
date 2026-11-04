// Cloudflare Worker: serves the static site, and handles POST /api/inquiry.
// Flow: spam checks -> email address checks -> save to the database -> one email to sales (after the reply is sent).
import { checkInquiry, normalise } from './validate.js'
import { notifySales } from './email.js'
import { saveInquiry, purgeOldIpHashes } from './db.js'

// Nothing a real visitor sends comes near this (the longest message is 5,000 characters).
const MAX_BODY = 64 * 1024

const MESSAGES = {
  person: 'We could not confirm this was sent by a person. Please try again.',
  rate: 'You have sent several inquiries in a short time. Please wait a few minutes and try again.',
  server: 'Something went wrong on our side and your inquiry was not saved. Please try again in a moment.',
  method: 'Send the form to this address with POST.',
  tooLarge: 'That is more than the form accepts. Please shorten your message and try again.',
  origin: 'This form can only be sent from our website.',
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers },
  })

const escapeHtml = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

// Without JavaScript the browser posts the form directly, so answer with a page instead of JSON.
const page = (title, text, status) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)} | Dulifei</title></head>
<body style="font-family:Arial,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#1f2124;line-height:1.6">
<h1 style="font-size:1.6rem">${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p><p><a href="/#inquiry">Back to the form</a></p></body></html>`,
    {
      status,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
        'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
      },
    },
  )

class TooLarge extends Error {}
class BadBody extends Error {}

/** Reads the body, but gives up as soon as it passes the limit, so a huge upload is never held in memory. */
async function readCapped(request) {
  if (Number(request.headers.get('content-length')) > MAX_BODY) throw new TooLarge()
  if (!request.body) return new Uint8Array(0)
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY) {
      await reader.cancel().catch(() => {})
      throw new TooLarge()
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let at = 0
  for (const c of chunks) {
    bytes.set(c, at)
    at += c.byteLength
  }
  return bytes
}

async function readForm(request) {
  const bytes = await readCapped(request)
  const type = request.headers.get('content-type') || ''
  if (type.includes('application/json')) {
    let value
    try {
      value = JSON.parse(new TextDecoder().decode(bytes))
    } catch {
      throw new BadBody()
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadBody()
    return value
  }
  let form
  try {
    form = await new Response(bytes, { headers: { 'content-type': type } }).formData()
  } catch {
    throw new BadBody()
  }
  const out = {}
  for (const [key, value] of form.entries()) if (typeof value === 'string') out[key] = value
  return out
}

async function hash(text) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPerson(token, ip, secret) {
  if (!secret) return true // local testing without Turnstile
  if (!token) return false
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
    const out = await res.json()
    return out.success === true
  } catch {
    return false
  }
}

export async function handleInquiry(request, env, ctx) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json')
  const fail = (status, errors) => {
    const first = Object.values(errors)[0]
    return wantsJson ? json({ ok: false, errors }, status) : page('Your inquiry was not sent', first, status)
  }

  // Browsers always say which site a form came from. A form from anywhere else is not ours.
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return fail(403, { form: MESSAGES.origin })

  let raw
  try {
    raw = await readForm(request)
  } catch (e) {
    return e instanceof TooLarge ? fail(413, { form: MESSAGES.tooLarge }) : fail(400, { form: MESSAGES.server })
  }

  // Spam trap: people never see this field, bots fill it. Pretend it worked and save nothing.
  if (raw.company_url) {
    return wantsJson ? json({ ok: true, id: 0, name: normalise(raw).name }) : Response.redirect(new URL('/thank-you/', request.url), 303)
  }

  const ip = request.headers.get('cf-connecting-ip') || ''
  if (!(await verifyPerson(raw['cf-turnstile-response'], ip, env.TURNSTILE_SECRET))) return fail(400, { form: MESSAGES.person })

  const check = await checkInquiry(raw, { skipDns: env.SKIP_MAIL_DNS === '1' }) // SKIP_MAIL_DNS is for load tests only
  if (!check.ok) return fail(422, check.errors)
  const d = check.data

  try {
    // The visitor key is a hash, never the address itself. IP_SALT (a secret) makes it impossible to rebuild from addresses.
    const ipHash = ip ? await hash(`${ip}|${env.IP_SALT || 'dulifei'}`) : null
    const id = await saveInquiry(env.DB, d, { visitorCountry: request.cf?.country || null, mailCheck: check.mail, ipHash })
    if (id === null) return fail(429, { form: MESSAGES.rate })

    // Now and then, blank old visitor keys (see purgeOldIpHashes). Runs after the reply, so nobody waits for it.
    if (Math.random() < 0.02) ctx.waitUntil(purgeOldIpHashes(env.DB).catch(() => {}))

    // The buyer gets their answer straight away; the email to sales goes out right after.
    ctx.waitUntil(
      notifySales(d, id, env)
        .catch((e) => ({ status: 'failed', error: String(e).slice(0, 300) }))
        .then((r) => env.DB.prepare('UPDATE inquiries SET email_status = ?, email_error = ? WHERE id = ?').bind(r.status, r.error || null, id).run()),
    )

    return wantsJson ? json({ ok: true, id, name: d.name, email: d.email }) : Response.redirect(new URL('/thank-you/', request.url), 303)
  } catch (e) {
    console.error('inquiry not saved', e)
    return fail(500, { form: MESSAGES.server })
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname === '/api/inquiry') {
      if (request.method !== 'POST') return json({ ok: false, errors: { form: MESSAGES.method } }, 405, { allow: 'POST' })
      return handleInquiry(request, env, ctx)
    }
    if (url.pathname.startsWith('/api/')) return json({ ok: false, errors: { form: 'Not found.' } }, 404)
    return env.ASSETS.fetch(request)
  },
}
