import { test } from 'node:test'
import assert from 'node:assert/strict'
import { saveInquiry, purgeOldIpHashes, RATE_LIMIT } from './db.js'
import { normalise } from './validate.js'
import { buildEmail } from './email.js'
import { makeDb } from './test-helpers.js'

const inquiry = (n) => ({ name: `Buyer ${n}`, email: `b${n}@example.com`, country: 'Spain', company: '', layout: '', sizes: '', message: 'Hi', product: '', page: '', whatsapp: '' })
const rowCount = (db, where = '1') => db.sqlite.prepare(`SELECT COUNT(*) AS n FROM inquiries WHERE ${where}`).get().n
const backdate = (db, ip, minutesAgo, n) => {
  for (let i = 0; i < n; i++)
    db.sqlite
      .prepare(`INSERT INTO inquiries (name, email, country, message, ip_hash, created_at) VALUES ('Old', 'o@example.com', 'ES', 'x', ?, strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?))`)
      .run(ip, `-${minutesAgo} minutes`)
}

test('saving returns a reference number, and the 6th from one visitor is refused', async () => {
  const db = makeDb()
  const ids = []
  for (let i = 0; i < RATE_LIMIT.count; i++) ids.push(await saveInquiry(db, inquiry(i), { ipHash: 'aaa' }))
  assert.ok(ids.every((id) => Number.isInteger(id) && id > 0))
  assert.equal(new Set(ids).size, RATE_LIMIT.count)
  assert.equal(await saveInquiry(db, inquiry(99), { ipHash: 'aaa' }), null)
  assert.equal(rowCount(db, "ip_hash = 'aaa'"), RATE_LIMIT.count)
})

test('another visitor is not affected, and a visitor with no key is never blocked', async () => {
  const db = makeDb()
  for (let i = 0; i < 5; i++) await saveInquiry(db, inquiry(i), { ipHash: 'aaa' })
  assert.ok(await saveInquiry(db, inquiry('x'), { ipHash: 'bbb' }))
  for (let i = 0; i < 8; i++) assert.ok(await saveInquiry(db, inquiry(`n${i}`), { ipHash: null }))
})

test('the limit counts only the last 10 minutes', async () => {
  const db = makeDb()
  backdate(db, 'old', 11, 5) // five from 11 minutes ago: all outside the window
  assert.ok(await saveInquiry(db, inquiry(1), { ipHash: 'old' }))
  backdate(db, 'recent', 9, 5) // five from 9 minutes ago: inside the window
  assert.equal(await saveInquiry(db, inquiry(2), { ipHash: 'recent' }), null)
})

test('everything is stored as given, including the country, mail check and WhatsApp number', async () => {
  const db = makeDb()
  const id = await saveInquiry(db, { ...inquiry(1), whatsapp: '+34 600 000 000', company: 'ACME' }, { ipHash: 'k', visitorCountry: 'ES', mailCheck: 'ok' })
  const r = db.sqlite.prepare('SELECT * FROM inquiries WHERE id = ?').get(id)
  assert.equal(r.whatsapp, '+34 600 000 000')
  assert.equal(r.visitor_country, 'ES')
  assert.equal(r.mail_check, 'ok')
  assert.equal(r.email_status, 'pending')
})

test('old visitor keys are blanked after 30 days, and the inquiries stay', async () => {
  const db = makeDb()
  backdate(db, 'ancient', 60 * 24 * 40, 3)
  backdate(db, 'fresh', 60 * 24 * 5, 2)
  await purgeOldIpHashes(db)
  assert.equal(rowCount(db), 5)
  assert.equal(rowCount(db, "ip_hash = 'ancient'"), 0)
  assert.equal(rowCount(db, "ip_hash = 'fresh'"), 2)
})

test('control characters are removed and line breaks kept', () => {
  const n = normalise({ name: 'A\u0000B\u0007C', message: 'one\r\ntwo\u000bthree\tfour' })
  assert.equal(n.name, 'ABC')
  assert.equal(n.message, 'one\ntwothree\tfour')
})

test('the email subject is always one line', () => {
  const { subject } = buildEmail({ ...inquiry(1), name: 'Eve\r\nBcc: x@y.z', country: 'Spain\nX: 1' }, { id: 3 })
  assert.ok(!/[\r\n]/.test(subject))
  assert.match(subject, /^New inquiry #3: Eve Bcc: x@y\.z, Spain X: 1$/)
})
