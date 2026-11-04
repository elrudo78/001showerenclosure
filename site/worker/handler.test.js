import { test } from 'node:test'
import assert from 'node:assert/strict'
import worker from './index.js'
import { makeDb } from './test-helpers.js'

// The Worker's own entry point, called directly: no network, a stand-in database, no spam check, no DNS lookups.
const env = () => ({ DB: makeDb(), SKIP_MAIL_DNS: '1' })
const ctx = { waitUntil: () => {} }
const URL_ = 'https://example.com/api/inquiry'
const good = { name: 'Ana', email: 'ana@example.com', country: 'Spain', message: 'Hello' }
const send = (body, { headers = {}, e = env() } = {}) =>
  worker.fetch(new Request(URL_, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', 'cf-connecting-ip': '203.0.113.1', ...headers }, body, ...(typeof body === 'object' && body && 'getReader' in body ? { duplex: 'half' } : {}) }), e, ctx)
const rows = (e) => e.DB.sqlite.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n

test('a good inquiry is saved and answered with its reference number', async () => {
  const e = env()
  const res = await send(JSON.stringify(good), { e })
  const out = await res.json()
  assert.equal(res.status, 200)
  assert.ok(out.ok && out.id > 0)
  assert.equal(rows(e), 1)
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
})

test('a body with no declared size is cut off once it passes 64 KB, not read to the end', async () => {
  let pulled = 0
  const chunk = new TextEncoder().encode('x'.repeat(65536))
  const stream = new ReadableStream({ pull(c) { if (pulled < 200) { pulled++; c.enqueue(chunk) } else c.close() } })
  const e = env()
  const res = await send(stream, { e })
  assert.equal(res.status, 413)
  assert.ok(pulled <= 4, `read ${pulled} chunks of 64 KB before stopping`)
  assert.equal(rows(e), 0)
})

test('a declared size over the limit is refused without reading the body', async () => {
  const res = await worker.fetch(new Request(URL_, { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': '200000', accept: 'application/json' }, body: '{}' }), env(), ctx)
  assert.equal(res.status, 413)
})

test('bodies that are not a form are refused with 400, never a crash', async () => {
  for (const body of ['null', '[]', '123', '"x"', 'true', '{"name": ', '']) {
    const res = await send(body)
    assert.ok(res.status === 400 || res.status === 422, `${JSON.stringify(body)} gave ${res.status}`)
    assert.notEqual(res.status, 500)
  }
  assert.equal((await send('null')).status, 400)
})

test('a form posted from another website is refused, our own site is fine, no origin is fine', async () => {
  const e = env()
  assert.equal((await send(JSON.stringify(good), { headers: { origin: 'https://evil.example' }, e })).status, 403)
  assert.equal((await send(JSON.stringify(good), { headers: { origin: 'null' }, e })).status, 403)
  assert.equal(rows(e), 0)
  assert.equal((await send(JSON.stringify(good), { headers: { origin: 'https://example.com' }, e })).status, 200)
  assert.equal((await send(JSON.stringify({ ...good, email: 'b@example.com' }), { e })).status, 200)
})

test('the sixth inquiry from one visitor in a burst is refused, even when all are sent together', async () => {
  const e = env()
  const rs = await Promise.all(Array.from({ length: 20 }, (_, i) => send(JSON.stringify({ ...good, email: `u${i}@example.com` }), { e })))
  assert.equal(rs.filter((r) => r.status === 200).length, 5)
  assert.equal(rs.filter((r) => r.status === 429).length, 15)
  assert.equal(rows(e), 5)
})

test('the page shown without JavaScript escapes what it prints', async () => {
  const body = new URLSearchParams({ ...good, email: "a'b@gmial.com" }).toString()
  const res = await send(body, { headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' } })
  const html = await res.text()
  assert.equal(res.status, 422)
  assert.ok(html.includes('a&#39;b@gmail.com') && !html.includes("a'b@gmail.com"))
  assert.match(res.headers.get('content-security-policy'), /default-src 'none'/)
})

test('other methods and unknown /api addresses', async () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
    const res = await worker.fetch(new Request(URL_, { method }), env(), ctx)
    assert.equal(res.status, 405)
    assert.equal(res.headers.get('allow'), 'POST')
  }
  assert.equal((await worker.fetch(new Request('https://example.com/api/nothing'), env(), ctx)).status, 404)
})
