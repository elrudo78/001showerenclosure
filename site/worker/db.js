// Database steps for inquiries. Kept apart from the request handling so they can be tested on their own.

export const RATE_LIMIT = { count: 5, minutes: 10 }

/**
 * Saves an inquiry unless this visitor already sent too many recently. The count and the save are ONE statement, so a
 * burst of simultaneous requests cannot slip past the limit (counting first and saving second would let them through).
 * Returns the new reference number, or null when the visitor is over the limit.
 */
export async function saveInquiry(db, d, { visitorCountry = null, mailCheck = null, ipHash = null } = {}) {
  const row = await db
    .prepare(
      `INSERT INTO inquiries (name, email, whatsapp, company, country, layout, sizes, message, product, page, visitor_country, mail_check, ip_hash)
       SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
       WHERE ? IS NULL OR (SELECT COUNT(*) FROM inquiries WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?)) < ?
       RETURNING id`,
    )
    .bind(
      d.name, d.email, d.whatsapp || null, d.company, d.country, d.layout, d.sizes, d.message, d.product, d.page, visitorCountry, mailCheck, ipHash,
      ipHash, ipHash, `-${RATE_LIMIT.minutes} minutes`, RATE_LIMIT.count,
    )
    .first()
  return row ? row.id : null
}

/**
 * The visitor key is only needed for the rate limit (10 minutes). Older ones are blanked, so the inquiry list does not
 * keep an identifier for each visitor longer than 30 days. The inquiries themselves stay.
 */
export async function purgeOldIpHashes(db, days = 30) {
  await db
    .prepare(`UPDATE inquiries SET ip_hash = NULL WHERE ip_hash IS NOT NULL AND created_at < strftime('%Y-%m-%dT%H:%M:%SZ', 'now', ?)`)
    .bind(`-${days} days`)
    .run()
}
