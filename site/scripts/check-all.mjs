// Runs every check in order and prints one table:  node scripts/check-all.mjs          (about 25 minutes)
//                                                   node scripts/check-all.mjs --quick  (about 10 minutes: 4 screen sizes instead of 20)
// It builds the site, starts it locally, runs the checks, stops it, then runs the backend test (which starts its own).
import { spawn, spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const quick = process.argv.includes('--quick')
const URL_ = 'http://127.0.0.1:8787/'
const out = '/tmp/check-all-shots'
const results = []

const run = (name, cmd, args, env = {}) => {
  const t0 = Date.now()
  process.stdout.write(`${name} ... `)
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...env } })
  const secs = Math.round((Date.now() - t0) / 1000)
  const ok = r.status === 0
  console.log(`${ok ? 'ok' : 'FAILED'} (${secs}s)`)
  results.push({ name, ok, secs, tail: ok ? '' : `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => /FAIL|problem|Error|error/.test(l)).slice(0, 15).join('\n') || `${r.stdout}\n${r.stderr}`.split('\n').slice(-12).join('\n') })
  return ok
}

run('1. unit tests (35)', 'npm', ['test', '--silent'])
if (!run('2. build', 'npm', ['run', 'build', '--silent'])) finish()

let server = spawn('npx', ['wrangler', 'dev', '--port', '8787'], { cwd: root, detached: true, stdio: 'ignore' })
let up = false
for (let i = 0; i < 90 && !up; i++) {
  try { up = (await fetch(URL_)).ok } catch {}
  if (!up) await sleep(1000)
}
if (!up) {
  console.log('The site did not start.')
  results.push({ name: 'start the site', ok: false, secs: 0, tail: '' })
  finish()
}
run('3. built pages: titles, links, text rules', 'node', ['scripts/check-built-site.mjs'])
run('4. every page type at 4 widths, menu, keyboard', 'node', ['scripts/browser-check.mjs', URL_, out])
run('5. inquiry form in a browser (real spam check)', 'node', ['scripts/form-check.mjs', URL_, out])
run('6. effects: zoom, header, transitions, filters', 'node', ['scripts/effects-check.mjs', URL_])
run('6b. link hover contrast, including the dark form band', 'node', ['scripts/hover-check.mjs', URL_])
run(`7. screen sizes${quick ? ' (4 sizes)' : ' (20 sizes, 4K to 320 px)'}`, 'node', ['scripts/sizes-check.mjs', URL_, out], quick ? { ONLY_SIZES: 'phone 390,tablet 768,MacBook 1440,4K 3840' } : {})
run('8. security: headers, hidden files, scripts blocked', 'node', ['scripts/security-check.mjs', URL_])
run('9. does it read as machine-made?', 'node', ['scripts/copy-check.mjs'])
try { process.kill(-server.pid, 'SIGKILL') } catch {}
await sleep(2000)
run('10. backend: bursts, failures, hostile requests', 'node', ['scripts/load-check.mjs'])
run('11. repository: secrets, personal data, dependencies', 'node', ['scripts/repo-scan.mjs'])
finish()

function finish() {
  try { if (server) process.kill(-server.pid, 'SIGKILL') } catch {}
  console.log('\n' + '-'.repeat(64))
  for (const r of results) console.log(`${r.ok ? 'ok    ' : 'FAILED'} ${r.name}`)
  const failed = results.filter((r) => !r.ok)
  for (const r of failed) console.log(`\n--- ${r.name}\n${r.tail}`)
  console.log(failed.length ? `\n${failed.length} of ${results.length} steps failed` : `\nEverything passed (${results.length} steps)`)
  process.exit(failed.length ? 1 : 0)
}
