// Checks an inquiry before it is saved: required fields, lengths, and whether the email address can receive mail.
import blocklist from 'disposable-email-domains-js/dist/dict/disposable_email_blocklist.json' with { type: 'json' }

const disposable = new Set(blocklist)

export const LIMITS = {
  name: 100,
  email: 254,
  company: 150,
  country: 80,
  layout: 60,
  sizes: 200,
  message: 5000,
  product: 120,
  page: 200,
}

export const MESSAGES = {
  name: 'Enter your name.',
  country: 'Enter the country the enclosures are for.',
  message: 'Tell us briefly what you need.',
  emailMissing: 'Enter your email address.',
  emailFormat: 'Enter an email address like name@company.com.',
  emailDisposable:
    'This looks like a temporary email address. Please use one you check regularly, so our sales team can reply.',
  emailNoMail: (domain) =>
    `This email address cannot receive messages: ${domain} does not accept email. Check for a typo, or use another address.`,
  emailTypo: (suggestion) => `Did you mean ${suggestion}? Check the address and try again.`,
  tooLong: (label, max) => `${label} is too long. Please keep it under ${max} characters.`,
}

const LABELS = { name: 'Your name', company: 'Company', country: 'Country', layout: 'Layout', sizes: 'Sizes', message: 'Message' }

// Big free providers, to catch typos such as gmial.com. Legitimate look-alikes are listed so they are never flagged.
const POPULAR = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
const KNOWN_GOOD = new Set([...POPULAR, 'mail.com', 'gmx.com', 'ymail.com', 'live.com', 'me.com', 'mac.com', 'aim.com', 'aol.com', 'msn.com'])

/** Trim every field, collapse missing ones to '', and keep only the fields we know. */
export function normalise(input) {
  const out = {}
  for (const key of Object.keys(LIMITS)) {
    const value = input[key]
    out[key] = typeof value === 'string' ? value.trim().replace(/\r\n?/g, '\n') : ''
  }
  out.email = out.email.toLowerCase()
  return out
}

/** Edit distance with adjacent swaps counted as one change. */
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  }
  return d[a.length][b.length]
}

export function typoSuggestion(email) {
  const [local, domain] = email.split('@')
  if (!domain || KNOWN_GOOD.has(domain)) return null
  const match = POPULAR.find((p) => distance(domain, p) === 1)
  return match ? `${local}@${match}` : null
}

export function emailFormatOk(email) {
  if (email.length > LIMITS.email) return false
  const at = email.lastIndexOf('@')
  if (at < 1) return false
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (local.length > 64 || /\.\./.test(email) || local.startsWith('.') || local.endsWith('.')) return false
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false
  return /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain)
}

export function isDisposable(domain) {
  const parts = domain.split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    if (disposable.has(parts.slice(i).join('.'))) return true
  }
  return false
}

/**
 * Ask public DNS whether the domain accepts email.
 * Returns 'ok', 'no-mail' (domain missing, or no mail server and no address), or 'unchecked' (DNS did not answer in time).
 * When DNS cannot be reached we let the inquiry through rather than lose a real lead.
 */
export async function mailCheck(domain, fetchImpl = fetch, timeoutMs = 2500) {
  const ask = async (type) => {
    const res = await fetchImpl(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, {
      headers: { accept: 'application/dns-json' },
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) throw new Error(`DNS ${res.status}`)
    return res.json()
  }
  try {
    const mx = await ask('MX')
    if (mx.Status === 3) return 'no-mail' // the domain does not exist
    const records = (mx.Answer || []).filter((r) => r.type === 15).map((r) => String(r.data).trim())
    if (records.length) {
      // A "null MX" (priority 0, host ".") means the domain says it never accepts email.
      return records.every((r) => /^0\s+\.?$/.test(r)) ? 'no-mail' : 'ok'
    }
    // No mail server listed: mail falls back to the domain's own address, if it has one.
    const a = await ask('A')
    return (a.Answer || []).some((r) => r.type === 1) ? 'ok' : 'no-mail'
  } catch {
    return 'unchecked'
  }
}

/** Returns { ok, data, errors, mail } where errors maps a field name to a message. */
export async function checkInquiry(input, { fetchImpl = fetch } = {}) {
  const data = normalise(input)
  const errors = {}

  for (const field of ['name', 'country', 'message']) {
    if (!data[field]) errors[field] = MESSAGES[field]
  }
  for (const [field, max] of Object.entries(LIMITS)) {
    if (field !== 'email' && data[field].length > max) errors[field] = MESSAGES.tooLong(LABELS[field] || field, max)
  }

  let mail = 'not-run'
  if (!data.email) errors.email = MESSAGES.emailMissing
  else if (!emailFormatOk(data.email)) errors.email = MESSAGES.emailFormat
  else {
    const domain = data.email.split('@')[1]
    const suggestion = typoSuggestion(data.email)
    if (suggestion) errors.email = MESSAGES.emailTypo(suggestion)
    else if (isDisposable(domain)) errors.email = MESSAGES.emailDisposable
    else {
      mail = await mailCheck(domain, fetchImpl)
      if (mail === 'no-mail') errors.email = MESSAGES.emailNoMail(domain)
    }
  }

  return { ok: Object.keys(errors).length === 0, data, errors, mail }
}
