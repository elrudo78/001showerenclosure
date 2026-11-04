// The key a visitor is limited by. IPv4: the address. IPv6: the first 64 bits, because one home or office is handed
// a whole /64 block (about 18 quintillion addresses), so counting single addresses would let a bot rotate past the limit.
export function visitorKey(ip) {
  if (!ip) return ''
  const clean = String(ip).trim().toLowerCase().split('%')[0]
  if (!clean.includes(':')) return clean
  const mapped = clean.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/) // an IPv4 address written the IPv6 way
  if (mapped) return mapped[1]
  const [left, right] = clean.split('::')
  const l = left ? left.split(':') : []
  const r = right ? right.split(':') : []
  if (right === undefined && l.length !== 8) return clean // not an address we understand: use it as written
  const groups = right === undefined ? l : [...l, ...Array(Math.max(0, 8 - l.length - r.length)).fill('0'), ...r]
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return clean
  return `${groups.slice(0, 4).map((g) => g.padStart(4, '0')).join(':')}::/64`
}
