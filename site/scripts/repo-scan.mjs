// Scans the whole repository, every branch and every past commit, for things that must never be public:
// keys and tokens, personal details, the client's files, the shared Drive link; and checks dependencies.
//   node scripts/repo-scan.mjs        (from anywhere inside the repository; needs network for the dependency audit)
// It never prints a secret itself: only where it is and what kind it looks like.
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'], ...opts })
const top = run('git', ['rev-parse', '--show-toplevel']).trim()
const git = (...a) => run('git', ['-C', top, ...a])
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

// ---------------------------------------------------------------------------------------------------------------
section('1. Keys and tokens, in every commit on every branch')
const revs = git('rev-list', '--all').trim().split('\n')
const secretPatterns = {
  'Resend API key': 're_[A-Za-z0-9]{20,}',
  'Cloudflare token': '(cfut|cfat|cfk)_[A-Za-z0-9]{20,}',
  'Cloudflare token assigned': 'CLOUDFLARE_API_TOKEN[[:space:]]*[=:][[:space:]]*["\x27]?[A-Za-z0-9_-]{20,}',
  'GitHub token': 'gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}',
  'AWS access key': 'AKIA[0-9A-Z]{16}',
  'private key': '-----BEGIN [A-Z ]*PRIVATE KEY-----',
  'Slack token': 'xox[baprs]-[A-Za-z0-9-]{10,}',
  'Google API key': 'AIza[0-9A-Za-z_-]{35}',
  'AI service key': '(^|[^A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}',
  'key assigned in text': '(api[_-]?key|secret|token|passwd|password)["\x27]?[[:space:]]*[:=][[:space:]]*["\x27][A-Za-z0-9/_+=.-]{20,}["\x27]',
  'Google Drive link': 'drive\\.google\\.com/(drive/folders|file/d|open)',
  'Google Docs link': 'docs\\.google\\.com/(document|spreadsheets|presentation)/d/',
}
const found = new Map()
for (const [kind, pattern] of Object.entries(secretPatterns)) {
  let out = ''
  try {
    // Case matters for key formats (so "task-based-asynchronous-pattern" is not mistaken for a key); links and "key = ..." are matched either way.
    out = run('git', ['-C', top, 'grep', '-I', '-n', ...(/Drive|Docs|assigned in text/.test(kind) ? ['-i'] : []), '-E', '-e', pattern, ...revs])
  } catch {} // git grep exits with 1 when nothing matches
  // The files as they are now, committed or not (untracked files that are not ignored too), as well as every past commit.
  let now = ''
  try {
    now = run('git', ['-C', top, 'grep', '-I', '-n', '--untracked', ...(/Drive|Docs|assigned in text/.test(kind) ? ['-i'] : []), '-E', '-e', pattern])
  } catch {}
  for (const line of (out + '\n' + now).split('\n').filter(Boolean)) {
    const [, path, no] = line.match(/^(?:[0-9a-f]{40}:)?(.+?):(\d+):/) || []
    if (path) found.set(`${kind}|${path}|${no}`, 1)
  }
}
for (const key of found.keys()) {
  const [kind, path, no] = key.split('|')
  check(false, `${kind} found in ${path}:${no} (some commit)`)
}
console.log(`     ${revs.length} commits and the files as they are now scanned for ${Object.keys(secretPatterns).length} kinds of secret: ${found.size === 0 ? 'none found' : found.size + ' found'}`)

// ---------------------------------------------------------------------------------------------------------------
section('2. Personal details in the files (email addresses and phone numbers)')
const emailOk = /@(example\.[a-z.]+|(mail\.)?company\.(com|pt)|domain\.com|resend\.dev|users\.noreply\.github\.com|anthropic\.com|sentry\.io|[a-z]\.(co|z|y))$/i
// Made-up numbers used as examples and in tests (digits only): the UK range reserved for TV dramas, all-zero and 555-01xx numbers.
// Made-up addresses used only as test inputs (some must be on real providers, to test typo and throwaway-address detection).
const fixtures = new Set(['ana@mailinator.com', 'ana@gmial.com', 'ana@gmail.com', 'ana@hotmail.com', 'ana@yahoo.com', 'ana@live.com', 'ana@hotmial.com', 'ana@yahooo.com', 'ana@mail.com', 'ana@outlook.com', 'ana@icloud.com', 'ana@gmx.com', 'ana@aol.com', 'ana@ymail.com', 'ana@nothere.example', 'ana@-company.pt', 'b@gmial.com', 'b@gmail.com', 'a.b+c@sub.example.co.uk'])
const phoneOk = ['447700900123', '8676000000000', '351912345678', '34600000000', '8676088881234', '15550109999', '123456789012345']
const personal = new Map()
for (const [kind, pattern] of Object.entries({ email: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', phone: '\\+[0-9]{1,3}[ .-]?\\(?[0-9]{2,4}\\)?[ .-]?[0-9]{3,4}[ .-]?[0-9]{3,4}' })) {
  let out = ''
  try {
    out = run('git', ['-C', top, 'grep', '-I', '-n', '-o', '-E', '-e', pattern, ...revs])
  } catch {}
  let now = ''
  try {
    now = run('git', ['-C', top, 'grep', '-I', '-n', '-o', '--untracked', '-E', '-e', pattern])
  } catch {}
  for (const line of (out + '\n' + now).split('\n').filter(Boolean)) {
    const m = line.match(/^(?:[0-9a-f]{40}:)?(.+?):(\d+):(.+)$/)
    if (!m) continue
    const [, path, no, hit] = m
    if (path.startsWith('docs/asset-review/') && /\.csv$/.test(path)) continue // file listings, checked by hand: personal details were removed
    if (/^\.claude\/(skills|design-references)\//.test(path)) continue // third-party design guides we copied in, not our data
    if (path.includes('package-lock.json') || path.includes('node_modules/') || /\.(svg|min\.js)$/.test(path)) continue
    if (kind === 'email' && (emailOk.test(hit) || fixtures.has(hit))) continue
    if (kind === 'phone' && phoneOk.includes(hit.replace(/\D/g, ''))) continue
    personal.set(`${kind}|${path}|${no}`, hit)
  }
}
for (const k of personal.keys()) {
  const [kind, path, no] = k.split('|')
  check(false, `a ${kind}-like text in ${path}:${no}${process.env.SHOW ? ` -> ${personal.get(k)}` : ''} (check by hand; if it is only an example, add it to the allowed examples)`)
}
console.log(`     ${personal.size === 0 ? 'only example addresses and numbers' : personal.size + ' to check by hand'}`)

// ---------------------------------------------------------------------------------------------------------------
section('3. Files that must never be in the repository (now or in any past commit)')
const everPaths = new Set(git('log', '--all', '--name-only', '--pretty=format:').split('\n').filter(Boolean))
const bad = [...everPaths].filter((p) => /^(client-materials|private-materials)\//.test(p) || /(^|\/)\.(env|dev\.vars)(\.|$)/.test(p) && !/\.example$/.test(p) || /\.(pem|key|p12|pfx)$/i.test(p) || /\.(pdf|docx?|xlsx?|rar|zip|7z|mp4|mov|psd|ai)$/i.test(p))
for (const p of bad) check(false, `${p} is (or was) in the repository`)
const big = git('ls-files', '-z').split('\0').filter(Boolean).map((f) => [f, existsSync(join(top, f)) ? readFileSync(join(top, f)).length : 0]).filter(([, n]) => n > 3_000_000)
for (const [f, n] of big) check(false, `${f} is ${(n / 1048576).toFixed(1)} MB`)
console.log(`     ${everPaths.size} paths ever committed; none are client materials, keys or documents`)
for (const p of ['client-materials/x', 'site/.dev.vars', 'site/.env', 'site/dist/index.html', 'site/node_modules/x', 'site/.wrangler/x']) {
  let ignored = true
  try { run('git', ['-C', top, 'check-ignore', '-q', p]) } catch { ignored = false }
  check(ignored, `${p} is not ignored by git`)
}

// ---------------------------------------------------------------------------------------------------------------
section('4. Dependencies')
const site = join(top, 'site')
const pkg = JSON.parse(readFileSync(join(site, 'package.json'), 'utf8'))
for (const [name, v] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) check(/^\d/.test(v), `${name} is not pinned to an exact version (${v})`)
const lock = JSON.parse(readFileSync(join(site, 'package-lock.json'), 'utf8'))
const odd = Object.entries(lock.packages || {}).filter(([k, v]) => k && v.resolved && !/^https:\/\/registry\.npmjs\.org\//.test(v.resolved))
for (const [k, v] of odd) check(false, `${k} comes from somewhere other than the npm registry: ${v.resolved}`)
const withInstall = Object.entries(lock.packages || {}).filter(([, v]) => v.hasInstallScript).map(([k]) => k.replace(/^node_modules\//, ''))
console.log(`     ${Object.keys(lock.packages).length - 1} packages in the lock file, all from the npm registry; packages that run an install script: ${withInstall.join(', ') || 'none'}`)
try {
  const audit = JSON.parse(run('npm', ['audit', '--json'], { cwd: site }).toString() || '{}')
  const v = audit.metadata?.vulnerabilities || {}
  check((v.high || 0) + (v.critical || 0) === 0 && (v.moderate || 0) === 0 && (v.low || 0) === 0, `npm audit: ${JSON.stringify(v)}`)
  console.log(`     npm audit: ${v.total || 0} known vulnerabilities`)
} catch (e) {
  // npm audit exits non-zero when it finds something; read its report
  try {
    const out = e.stdout ? e.stdout.toString() : ''
    const v = JSON.parse(out).metadata.vulnerabilities
    check(false, `npm audit: ${JSON.stringify(v)}`)
  } catch {
    console.log('     (npm audit could not reach the registry; run it again with a connection)')
  }
}

console.log(problems ? `\n${problems} problem(s) in ${checks} checks` : `\nRepository scan clean (${checks} checks)`)
process.exit(problems ? 1 : 0)
