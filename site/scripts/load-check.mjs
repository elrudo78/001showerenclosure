// Backend traffic and abuse test for the inquiry Worker: node scripts/load-check.mjs   (run `npm run build` first)
// Starts the real Worker locally (wrangler dev) with a fresh database and a fake email service that can be made to
// fail on purpose, then checks: the rate limit under a burst, hundreds of visitors at once, email failures, bad and
// hostile requests, and page loads while inquiries are coming in. Spam check (Turnstile) and the DNS lookup are
// switched off here so the test measures our code, not outside services.
import { spawn, execFileSync } from 'node:child_process'
import { createServer } from 'node:http'
import { mkdtempSync, readdirSync, renameSync, existsSync, rmSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 8790
const MOCK_PORT = 9911
const base = `http://127.0.0.1:${PORT}`
const stateDir = mkdtempSync(join(tmpdir(), 'load-check-'))
const devVars = join(root, '.dev.vars')
const devVarsOff = join(root, '.dev.vars.load-check-off')

let failed = 0
let passed = 0
const check = (name, ok, detail = '') => {
  if (ok) passed++
  else failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `  (${detail})` : ''}`)
}
const pct = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b)
  return s.length ? Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]) : 0
}
const tally = (arr) => arr.reduce((m, x) => ((m[x] = (m[x] || 0) + 1), m), {})

// --- fake email service (stands in for Resend) --------------------------------------------------------------------
const mock = { received: [], ok: 0, failed: 0, mode: { failRate: 0, status: 500, slowRate: 0, slowMs: 0 } }
const mockServer = createServer(async (req, res) => {
  if (req.url.startsWith('/__mode')) {
    const q = new URL(req.url, 'http://x').searchParams
    mock.mode = { failRate: +(q.get('fail') || 0), status: +(q.get('status') || 500), slowRate: +(q.get('slow') || 0), slowMs: +(q.get('ms') || 0) }
    return res.end('ok')
  }
  let body = ''
  for await (const c of req) body += c
  let json = null
  try { json = JSON.parse(body) } catch {}
  mock.received.push({ auth: req.headers.authorization, body: json })
  if (Math.random() < mock.mode.slowRate) await sleep(mock.mode.slowMs)
  if (Math.random() < mock.mode.failRate) {
    mock.failed++
    res.statusCode = mock.mode.status
    return res.end('{"message":"mock failure"}')
  }
  mock.ok++
  res.end('{"id":"mock"}')
})
const setMode = (m) => fetch(`http://127.0.0.1:${MOCK_PORT}/__mode?${new URLSearchParams(m)}`)

// --- worker ---------------------------------------------------------------------------------------------------------
let worker
const restore = () => {
  if (existsSync(devVarsOff)) renameSync(devVarsOff, devVars)
}
const stopAll = () => {
  try { process.kill(-worker.pid, 'SIGKILL') } catch {}
  try { mockServer.close() } catch {}
  restore()
  try { rmSync(stateDir, { recursive: true, force: true }) } catch {}
}
process.on('exit', stopAll)
process.on('SIGINT', () => process.exit(130))

async function startWorker() {
  if (!existsSync(join(root, 'dist', 'index.html'))) throw new Error('Run `npm run build` first.')
  if (existsSync(devVars)) renameSync(devVars, devVarsOff) // Turnstile off: this test is about our code
  execFileSync('npx', ['wrangler', 'd1', 'migrations', 'apply', 'dulifei-inquiries', '--local', '--persist-to', stateDir], { cwd: root, stdio: 'ignore', input: 'y\n' })
  worker = spawn(
    'npx',
    ['wrangler', 'dev', '--port', String(PORT), '--persist-to', stateDir, '--var', `RESEND_URL:http://127.0.0.1:${MOCK_PORT}/emails`, '--var', 'RESEND_API_KEY:test-key', '--var', 'SALES_EMAIL:sales@example.com', '--var', 'SKIP_MAIL_DNS:1'],
    { cwd: root, detached: true, stdio: 'ignore' },
  )
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(`${base}/`)).ok) return
    } catch {}
    await sleep(1000)
  }
  throw new Error('Worker did not start')
}

// --- database (read only, straight from the local file) ------------------------------------------------------------
const { DatabaseSync } = await import('node:sqlite')
let db
function openDb() {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]))
  const file = walk(stateDir).find((f) => f.endsWith('.sqlite') && !f.endsWith('metadata.sqlite') && f.includes('d1'))
  db = new DatabaseSync(file, { readOnly: true })
}
const q = (sql, ...p) => db.prepare(sql).all(...p)
const count = (where = '1', ...p) => q(`SELECT COUNT(*) AS n FROM inquiries WHERE ${where}`, ...p)[0].n

// --- requests ----------------------------------------------------------------------------------------------------
let ipSeq = 1
const ipFor = (n) => `198.51.${(n >> 8) & 255}.${n & 255}`
const freshIp = () => ipFor(ipSeq++)
const valid = (i, extra = {}) => ({ name: `Buyer ${i}`, email: `buyer${i}@example.com`, country: 'Portugal', message: `Quote request ${i}`, whatsapp: '+351 912 345 678', ...extra })
async function post(fields, { ip = freshIp(), headers = {}, body, type = 'application/json', accept = 'application/json' } = {}) {
  const t0 = performance.now()
  try {
    const res = await fetch(`${base}/api/inquiry`, {
      method: 'POST',
      headers: { 'content-type': type, accept, 'cf-connecting-ip': ip, ...headers },
      body: body !== undefined ? body : JSON.stringify(fields),
      signal: AbortSignal.timeout(60000),
      ...(body && typeof body === 'object' && 'getReader' in body ? { duplex: 'half' } : {}),
    })
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    return { status: res.status, json, text, ms: performance.now() - t0, headers: res.headers }
  } catch (e) {
    return { status: 0, error: String(e), ms: performance.now() - t0 }
  }
}
const waitFor = async (fn, ms = 40000) => {
  const end = Date.now() + ms
  while (Date.now() < end) {
    if (fn()) return true
    await sleep(300)
  }
  return false
}

// =================================================================================================================
console.log('Starting the Worker with a fresh database...')
await new Promise((r) => mockServer.listen(MOCK_PORT, '127.0.0.1', r))
await startWorker()
openDb()

console.log('\n1. One normal inquiry, start to finish')
{
  const r = await post(valid('first'))
  check('a valid inquiry is accepted', r.status === 200 && r.json?.ok === true && r.json.id > 0, `status ${r.status}`)
  check('it is saved', count("email = 'buyerfirst@example.com'") === 1)
  const gotMail = await waitFor(() => mock.received.length >= 1, 15000)
  check('one email goes to the sales address with the right content', gotMail && mock.received[0].body.to?.[0] === 'sales@example.com' && /Buyer first/.test(mock.received[0].body.html) && mock.received[0].body.reply_to === 'buyerfirst@example.com')
  await waitFor(() => q("SELECT email_status FROM inquiries WHERE email = 'buyerfirst@example.com'")[0]?.email_status === 'sent', 15000)
  check('the saved record shows the email as sent', q("SELECT email_status FROM inquiries WHERE email = 'buyerfirst@example.com'")[0]?.email_status === 'sent')
}

console.log('\n2. Rate limit holds under a burst (60 requests at once from ONE visitor; limit is 5 per 10 minutes)')
{
  const ip = freshIp()
  const rs = await Promise.all(Array.from({ length: 60 }, (_, i) => post(valid(`burst${i}`), { ip })))
  const t = tally(rs.map((r) => r.status))
  const saved = count("email LIKE 'buyerburst%'")
  check('exactly 5 are accepted', t[200] === 5, JSON.stringify(t))
  check('the other 55 are told to wait (429)', t[429] === 55, JSON.stringify(t))
  check('exactly 5 are saved in the database', saved === 5, `${saved} saved`)
  const seq = []
  const ip2 = freshIp()
  for (let i = 0; i < 7; i++) seq.push((await post(valid(`seq${i}`), { ip: ip2 })).status)
  check('one at a time: 5 accepted, then blocked', seq.join() === '200,200,200,200,200,429,429', seq.join())
  const other = await post(valid('otherip'), { ip: freshIp() })
  check('a different visitor is not affected', other.status === 200)
}

console.log('\n3. Hundreds of visitors at once (300 different visitors, all at the same moment)')
{
  const before = count()
  mock.received.length = 0
  mock.ok = 0
  const rs = await Promise.all(Array.from({ length: 300 }, (_, i) => post(valid(`crowd${i}`))))
  const t = tally(rs.map((r) => r.status))
  const ms = rs.map((r) => r.ms)
  check('all 300 are accepted', t[200] === 300, JSON.stringify(t))
  check('no server errors', !Object.keys(t).some((s) => +s >= 500 || s === '0'), JSON.stringify(t))
  check('all 300 are saved, none twice', count() - before === 300 && count("email LIKE 'buyercrowd%'") === 300)
  const ids = rs.map((r) => r.json?.id)
  check('every reference number is different', new Set(ids).size === 300)
  console.log(`     reply time: median ${pct(ms, 50)} ms, 95% under ${pct(ms, 95)} ms, slowest ${pct(ms, 100)} ms`)
  const done = await waitFor(() => count("email LIKE 'buyercrowd%' AND email_status = 'pending'") === 0, 60000)
  check('every inquiry gets its email status filled in', done, `${count("email LIKE 'buyercrowd%' AND email_status = 'pending'")} still pending`)
  check('300 emails reached the email service, all marked sent', mock.ok === 300 && count("email LIKE 'buyercrowd%' AND email_status = 'sent'") === 300, `${mock.ok} received`)
}

console.log('\n4. The email service is failing and slow (40% fail, 10% hang 12 s): no inquiry may be lost')
{
  await setMode({ fail: 0.4, status: 500, slow: 0.1, ms: 12000 })
  const before = count()
  const rs = await Promise.all(Array.from({ length: 100 }, (_, i) => post(valid(`flaky${i}`))))
  const t = tally(rs.map((r) => r.status))
  check('visitors still see success for all 100', t[200] === 100, JSON.stringify(t))
  check('all 100 are saved', count() - before === 100)
  const settled = await waitFor(() => count("email LIKE 'buyerflaky%' AND email_status = 'pending'") === 0, 45000)
  const st = tally(q("SELECT email_status AS s FROM inquiries WHERE email LIKE 'buyerflaky%'").map((r) => r.s))
  check('every record ends as sent or failed, never stuck on pending', settled, JSON.stringify(st))
  const failedRows = q("SELECT email_error AS e FROM inquiries WHERE email LIKE 'buyerflaky%' AND email_status = 'failed'")
  check('failed ones say why, so sales can follow up', failedRows.length > 0 && failedRows.every((r) => r.e), `${failedRows.length} failed`)
  await setMode({ fail: 0 })
}

console.log('\n4b. The email service hangs for ever: the record must not stay "pending"')
{
  await setMode({ fail: 0, slow: 1, ms: 40000 })
  const rs = await Promise.all(Array.from({ length: 5 }, (_, i) => post(valid(`hang${i}`))))
  check('visitors are not kept waiting (all answered in under 5 seconds)', rs.every((r) => r.status === 200 && r.ms < 5000), `slowest ${pct(rs.map((r) => r.ms), 100)} ms`)
  const settled = await waitFor(() => count("email LIKE 'buyerhang%' AND email_status = 'pending'") === 0, 25000)
  const rows = q("SELECT email_status AS s, email_error AS e FROM inquiries WHERE email LIKE 'buyerhang%'")
  check('after the time limit (10 s) they are marked failed with a reason', settled && rows.every((r) => r.s === 'failed' && /timeout|abort/i.test(r.e || '')), JSON.stringify(rows[0]))
  await setMode({ fail: 0, slow: 0 })
}

console.log('\n5. Bad entries (200 invalid forms at once)')
{
  const before = count()
  const variants = [
    [(i) => valid(i, { name: '' }), 'name'], [(i) => valid(i, { email: 'not-an-email' }), 'email'], [(i) => valid(i, { email: `x${i}@gmial.com` }), 'email'],
    [(i) => valid(i, { email: `x${i}@mailinator.com` }), 'email'], [(i) => valid(i, { message: '' }), 'message'], [(i) => valid(i, { country: '' }), 'country'],
    [(i) => valid(i, { whatsapp: 'call me' }), 'whatsapp'], [(i) => valid(i, { message: 'x'.repeat(5001) }), 'message'],
  ]
  const rs = await Promise.all(Array.from({ length: 200 }, (_, i) => { const [f] = variants[i % variants.length]; return post(f(`bad${i}`)).then((r) => ({ r, key: variants[i % variants.length][1] })) }))
  check('every one is refused with the right message (422)', rs.every(({ r, key }) => r.status === 422 && r.json?.errors?.[key]), JSON.stringify(tally(rs.map(({ r }) => r.status))))
  check('nothing invalid is saved', count() === before)
}

console.log('\n6. Hostile and odd requests')
{
  const before = count()
  const notCrash = (name, r, want) => check(name, Array.isArray(want) ? want.includes(r.status) : r.status === want, `status ${r.status}`)
  for (const [label, body] of [['null', 'null'], ['a list', '[]'], ['a number', '123'], ['a string', '"hello"'], ['true', 'true']]) notCrash(`JSON body that is ${label} is refused cleanly (400)`, await post(null, { body }), 400)
  notCrash('broken JSON is refused cleanly (400)', await post(null, { body: '{"name": ' }), 400)
  notCrash('empty body is refused cleanly (not a crash)', await post(null, { body: '' }), [400, 422])
  notCrash('plain text body is refused cleanly', await post(null, { body: 'hello', type: 'text/plain' }), [400, 422])
  notCrash('a 100 KB body is refused as too large (413)', await post(valid('big', { message: 'x'.repeat(100_000) })), 413)
  notCrash('a 5 MB body is refused as too large (413)', await post(valid('huge', { message: 'x'.repeat(5_000_000) })), 413)
  // (An upload with no declared size is covered in worker/handler.test.js: the local test server mishandles cut-off uploads.)
  {
    const fd = new FormData()
    for (const [k, v] of Object.entries(valid('multipart'))) fd.append(k, v)
    fd.append('attachment', new Blob(['%PDF-fake'], { type: 'application/pdf' }), 'x.pdf')
    const res = await fetch(`${base}/api/inquiry`, { method: 'POST', headers: { accept: 'application/json', 'cf-connecting-ip': freshIp() }, body: fd })
    check('the real form format (multipart) works, and file parts are ignored', res.status === 200, `status ${res.status}`)
  }
  {
    const r = await post(valid('sql', { name: "Robert'); DROP TABLE inquiries;--", message: "1' OR '1'='1" }))
    check('SQL-looking text is saved as plain text and the table survives', r.status === 200 && count("name LIKE 'Robert%DROP TABLE%'") === 1 && count() > 0)
  }
  {
    mock.received.length = 0
    const r = await post(valid('xss', { name: '<script>alert(1)</script>', message: '<img src=x onerror=alert(1)>', company: '"><svg onload=alert(1)>' }))
    await waitFor(() => mock.received.some((m) => /alert\(1\)/.test(m.body?.html || '')), 10000)
    const html = mock.received.find((m) => /alert\(1\)/.test(m.body?.html || ''))?.body.html || ''
    check('HTML typed into the form is neutralised in the sales email', r.status === 200 && html && !/<script>|<img src=x|<svg onload/.test(html) && /&lt;script&gt;/.test(html))
  }
  {
    mock.received.length = 0
    const r = await post(valid('hdr', { name: 'Eve\r\nBcc: attacker@example.com', country: 'Spain\nX-Header: 1' }))
    await waitFor(() => mock.received.length > 0, 10000)
    const subject = mock.received[0]?.body.subject || ''
    check('line breaks in the name cannot inject email headers (subject is one line)', r.status === 200 && subject && !/[\r\n]/.test(subject), JSON.stringify(subject))
  }
  {
    const r = await post(valid('nul', { name: 'A\u0000B\u0007C', message: 'Hello\u0000there' }))
    const row = q("SELECT name, message FROM inquiries WHERE email = 'buyernul@example.com'")[0]
    check('control characters are stripped and the rest of the text is kept whole', r.status === 200 && row?.name === 'ABC' && row?.message === 'Hellothere', r.status !== 200 ? `status ${r.status}` : JSON.stringify(row))
  }
  {
    const text = '😀 مرحبا 你好 Привет ñ'
    const r = await post(valid('uni', { name: text, message: text }))
    check('emoji, Arabic, Chinese and Cyrillic are kept exactly', r.status === 200 && q("SELECT name FROM inquiries WHERE email = 'buyeruni@example.com'")[0]?.name === text)
  }
  {
    const r = await post(valid('longword', { message: 'a'.repeat(5000) }))
    check('a 5,000 character single word is accepted', r.status === 200)
  }
  notCrash('a form from another website is refused (403)', await post(valid('evil'), { headers: { origin: 'https://evil.example' } }), 403)
  notCrash('a form from our own site is accepted', await post(valid('own'), { headers: { origin: base } }), 200)
  {
    const r = await post(valid('trap', { company_url: 'http://spam.example' }))
    check('the hidden spam-trap field gets a fake success and saves nothing', r.status === 200 && r.json?.ok === true && count("email = 'buyertrap@example.com'") === 0)
  }
  {
    const body = new URLSearchParams({ ...valid('html'), email: "a'b@gmial.com" }).toString()
    const r = await post(null, { body, type: 'application/x-www-form-urlencoded', accept: 'text/html' })
    check('without JavaScript, errors come back as a page, with text escaped', r.status === 422 && /text\/html/.test(r.headers.get('content-type')) && !r.text.includes("a'b@gmail.com") && r.text.includes('a&#39;b@gmail.com'), `status ${r.status}`)
    const ok = await post(null, { body: new URLSearchParams(valid('nojs')).toString(), type: 'application/x-www-form-urlencoded', accept: 'text/html', headers: {} })
    check('without JavaScript, a good form redirects to the thank-you page', ok.status === 200 && /thank/i.test(ok.text) || ok.status === 303, `status ${ok.status}`)
  }
  for (const method of ['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
    const res = await fetch(`${base}/api/inquiry`, { method })
    check(`${method} on the form address is refused (405, says POST only)`, res.status === 405 && res.headers.get('allow') === 'POST', `status ${res.status}`)
  }
  check('an unknown /api address is a clean 404', (await fetch(`${base}/api/nothing`)).status === 404)
  check('the stored rate-limit key is a hash, never the visitor address', q('SELECT ip_hash AS h FROM inquiries WHERE ip_hash IS NOT NULL LIMIT 50').every((r) => /^[0-9a-f]{24}$/.test(r.h)))
  console.log(`     (${count() - before} valid test inquiries were saved by this section)`)
}

console.log('\n7. Page views while inquiries arrive (3,000 page loads and 100 inquiries together)')
{
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
  const paths = [...sitemap.matchAll(/<loc>[^<]*?\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1])
  const before = count()
  const lat = []
  const statuses = []
  let next = 0
  const total = 3000
  const worker_ = async () => {
    while (next < total) {
      const p = paths[next++ % paths.length]
      const t0 = performance.now()
      try {
        const res = await fetch(base + p)
        await res.arrayBuffer()
        statuses.push(res.status)
      } catch { statuses.push(0) }
      lat.push(performance.now() - t0)
    }
  }
  const t0 = performance.now()
  const posts = Promise.all(Array.from({ length: 100 }, (_, i) => sleep(i * 20).then(() => post(valid(`mixed${i}`)))))
  await Promise.all([...Array.from({ length: 100 }, worker_), posts])
  const secs = (performance.now() - t0) / 1000
  const t = tally(statuses)
  check('every page load succeeded', t[200] === total, JSON.stringify(t))
  check('all 100 inquiries made during the page load were saved', count() - before === 100, `${count() - before}`)
  console.log(`     ${Math.round(total / secs)} pages a second on this machine; median ${pct(lat, 50)} ms, 95% under ${pct(lat, 95)} ms, 99% under ${pct(lat, 99)} ms`)
}

console.log('\n8. Steady flow (15 inquiries a second for 20 seconds)')
{
  const rs = []
  const t0 = Date.now()
  const tasks = []
  for (let i = 0; i < 300; i++) {
    tasks.push(sleep(Math.floor(i / 15) * 1000 + (i % 15) * 60).then(() => post(valid(`steady${i}`)).then((r) => rs.push(r))))
  }
  await Promise.all(tasks)
  const t = tally(rs.map((r) => r.status))
  check('all 300 accepted with no errors', t[200] === 300, JSON.stringify(t))
  console.log(`     took ${Math.round((Date.now() - t0) / 1000)} s; reply median ${pct(rs.map((r) => r.ms), 50)} ms, slowest ${pct(rs.map((r) => r.ms), 100)} ms`)
}

console.log('\n9. Final state')
{
  const dupIds = q('SELECT COUNT(*) AS n FROM (SELECT id FROM inquiries GROUP BY id HAVING COUNT(*) > 1)')[0].n
  check('no duplicate reference numbers', dupIds === 0)
  await waitFor(() => count("email_status = 'pending'") === 0, 30000)
  check('nothing left waiting for its email result', count("email_status = 'pending'") === 0, `${count("email_status = 'pending'")} pending`)
  const log = (() => { try { return readFileSync(join(stateDir, 'wrangler.log'), 'utf8') } catch { return '' } })()
  void log
}

console.log(failed ? `\n${failed} problem(s), ${passed} passed` : `\nAll backend checks passed (${passed} checks)`)
process.exit(failed ? 1 : 0)
