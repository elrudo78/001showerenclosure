import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkInquiry, emailFormatOk, isDisposable, mailCheck, phoneOk, typoSuggestion, MESSAGES } from './validate.js'
import { buildEmail } from './email.js'

// Fake DNS: answers like Cloudflare's DNS-over-HTTPS JSON API.
const dns = (table) => async (url) => {
  const u = new URL(url)
  const key = `${u.searchParams.get('name')} ${u.searchParams.get('type')}`
  if (table[key] === 'timeout') throw new Error('timeout')
  return new Response(JSON.stringify(table[key] || { Status: 0, Answer: [] }), { status: 200 })
}
const mx = (host) => ({ Status: 0, Answer: [{ type: 15, data: `10 ${host}.` }] })

const good = { name: 'Ana Silva', email: 'ana@company.pt', country: 'Portugal', message: 'Quote for 20 sliding doors.' }
const okDns = dns({ 'company.pt MX': mx('mail.company.pt') })

test('a complete inquiry with a working email domain passes', async () => {
  const r = await checkInquiry(good, { fetchImpl: okDns })
  assert.equal(r.ok, true)
  assert.equal(r.mail, 'ok')
})

test('required fields are reported one by one', async () => {
  const r = await checkInquiry({}, { fetchImpl: okDns })
  assert.deepEqual(Object.keys(r.errors).sort(), ['country', 'email', 'message', 'name'])
  assert.equal(r.errors.email, MESSAGES.emailMissing)
})

test('email format', () => {
  for (const e of ['ana@company.pt', 'a.b+c@sub.example.co.uk', "o'neil@example.ie"]) assert.equal(emailFormatOk(e), true, e)
  for (const e of ['ana', 'ana@', '@company.pt', 'ana@company', 'ana..b@company.pt', 'ana@company.p', 'ana @company.pt', 'ana@-company.pt'])
    assert.equal(emailFormatOk(e), false, e)
})

test('common typos get a suggestion, real look-alikes do not', () => {
  assert.equal(typoSuggestion('ana@gmial.com'), 'ana@gmail.com')
  assert.equal(typoSuggestion('ana@hotmial.com'), 'ana@hotmail.com')
  assert.equal(typoSuggestion('ana@yahooo.com'), 'ana@yahoo.com')
  for (const e of ['ana@gmail.com', 'ana@mail.com', 'ana@live.com', 'ana@company.pt']) assert.equal(typoSuggestion(e), null, e)
})

test('disposable addresses are refused, including subdomains', async () => {
  assert.equal(isDisposable('mailinator.com'), true)
  assert.equal(isDisposable('x.mailinator.com'), true)
  assert.equal(isDisposable('gmail.com'), false)
  const r = await checkInquiry({ ...good, email: 'ana@mailinator.com' }, { fetchImpl: okDns })
  assert.equal(r.errors.email, MESSAGES.emailDisposable)
})

test('domains that cannot receive mail are refused', async () => {
  const f = dns({
    'nothere.example MX': { Status: 3 },
    'nullmx.example MX': { Status: 0, Answer: [{ type: 15, data: '0 .' }] },
    'bare.example MX': { Status: 0, Answer: [] },
    'bare.example A': { Status: 0, Answer: [] },
    'aonly.example MX': { Status: 0, Answer: [] },
    'aonly.example A': { Status: 0, Answer: [{ type: 1, data: '192.0.2.1' }] },
  })
  assert.equal(await mailCheck('nothere.example', f), 'no-mail')
  assert.equal(await mailCheck('nullmx.example', f), 'no-mail')
  assert.equal(await mailCheck('bare.example', f), 'no-mail')
  assert.equal(await mailCheck('aonly.example', f), 'ok')
  const r = await checkInquiry({ ...good, email: 'ana@nothere.example' }, { fetchImpl: f })
  assert.equal(r.errors.email, MESSAGES.emailNoMail('nothere.example'))
})

test('if DNS does not answer, the inquiry is let through (a real lead is worth more)', async () => {
  const r = await checkInquiry(good, { fetchImpl: dns({ 'company.pt MX': 'timeout' }) })
  assert.equal(r.ok, true)
  assert.equal(r.mail, 'unchecked')
})

test('overlong fields are refused with a clear message', async () => {
  const r = await checkInquiry({ ...good, message: 'x'.repeat(5001) }, { fetchImpl: okDns })
  assert.match(r.errors.message, /too long/)
})

test('the sales email escapes what visitors type', () => {
  const { html, subject, text } = buildEmail({ ...good, name: '<script>x</script>', company: 'A & B' }, { id: 7, siteUrl: 'https://example.com' })
  assert.ok(!html.includes('<script>x'))
  assert.ok(html.includes('&lt;script&gt;'))
  assert.ok(html.includes('A &amp; B'))
  assert.match(subject, /^New inquiry #7: /)
  assert.ok(text.includes('Quote for 20 sliding doors.'))
})

test('the optional WhatsApp or phone number is checked only when given', async () => {
  for (const n of ['+44 7700 900123', '+86 (760) 8888-1234', '0086.760.88881234', '+1 555 010 9999']) assert.equal(phoneOk(n), true, n)
  for (const n of ['12345', 'call me', '+44 7700 900123 ext 5', '+1234567890123456']) assert.equal(phoneOk(n), false, n)
  assert.equal((await checkInquiry(good, { fetchImpl: okDns })).ok, true)
  const bad = await checkInquiry({ ...good, whatsapp: 'call me' }, { fetchImpl: okDns })
  assert.equal(bad.errors.whatsapp, MESSAGES.phone)
  const { html } = buildEmail({ ...good, whatsapp: '+44 7700 900123' }, { id: 8 })
  assert.ok(html.includes('https://wa.me/447700900123'))
})
