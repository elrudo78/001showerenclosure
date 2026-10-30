// Cloudflare Worker: serves the static site, and handles POST /api/inquiry.
// Flow: spam checks -> email address checks -> save to the database -> one email to sales (after the reply is sent).
import { checkInquiry, normalise } from './validate.js'
import { notifySales } from './email.js'

const RATE_LIMIT = { count: 5, minutes: 10 }

const MESSAGES = {
  person: 'We could not confirm this was sent by a person. Please try again.',
  rate: 'You have sent several inquiries in a short time. Please wait a few minutes and try again.',
  server: 'Something went wrong on our side and your inquiry was not saved. Please try again in a moment.',
  method: 'Send the form to this address with POST.',
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  })

// Without JavaScript the browser posts the form directly, so answer with a page instead of JSON.
const page = (title, text, status) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Dulifei</title></head>
<body style="font-family:Arial,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#1f2124;line-height:1.6">
<h1 style="font-size:1.6rem">${title}</h1><p>${text}</p><p><a href="/#inquiry">Back to the form</a></p></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
  )

async function readForm(request) {
  const type = request.headers.get('content-type') || ''
  if (type.includes('application/json')) return request.json()
  const form = await request.formData()
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

  let raw
  try {
    raw = await readForm(request)
  } catch {
    return fail(400, { form: MESSAGES.server })
  }

  // Spam trap: people never see this field, bots fill it. Pretend it worked and save nothing.
  if (raw.company_url) {
    return wantsJson ? json({ ok: true, id: 0, name: normalise(raw).name }) : Response.redirect(new URL('/thank-you/', request.url), 303)
  }

  const ip = request.headers.get('cf-connecting-ip') || ''
  if (!(await verifyPerson(raw['cf-turnstile-response'], ip, env.TURNSTILE_SECRET))) return fail(400, { form: MESSAGES.person })

  const check = await checkInquiry(raw)
  if (!check.ok) return fail(422, check.errors)
  const d = check.data

  try {
    const ipHash = ip ? await hash(`${ip}|dulifei`) : null
    if (ipHash) {
      const recent = await env.DB.prepare(
        `SELECT COUNT(*) AS n FROM inquiries WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?)`,
      )
        .bind(ipHash, `-${RATE_LIMIT.minutes} minutes`)
        .first()
      if (recent && recent.n >= RATE_LIMIT.count) return fail(429, { form: MESSAGES.rate })
    }

    const saved = await env.DB.prepare(
      `INSERT INTO inquiries (name, email, company, country, layout, sizes, message, product, page, visitor_country, mail_check, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(d.name, d.email, d.company, d.country, d.layout, d.sizes, d.message, d.product, d.page, request.cf?.country || null, check.mail, ipHash)
      .first()
    const id = saved.id

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
