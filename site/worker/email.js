// The one email per inquiry: a notice to the sales team, with Reply going straight to the buyer.

const escape = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const ROWS = [
  ['Email', 'email'],
  ['Company', 'company'],
  ['Country', 'country'],
  ['Layout', 'layout'],
  ['Sizes', 'sizes'],
  ['Product page', 'product'],
]

export function buildEmail(inquiry, { id, siteUrl = '' }) {
  const subject = `New inquiry #${id}: ${inquiry.name}, ${inquiry.country}`
  const rows = ROWS.filter(([, key]) => inquiry[key])
  const logo = siteUrl ? `${siteUrl.replace(/\/$/, '')}/logo.png` : ''
  const replyHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent('Your inquiry to Dulifei')}`

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:#eeefec;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eeefec;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;font-family:Archivo,'Helvetica Neue',Arial,sans-serif;color:#1f2124;">
  <tr><td style="padding:28px 32px 20px;border-bottom:1px solid #d5d8d4;">
    ${logo ? `<img src="${escape(logo)}" width="120" alt="DLIFE" style="display:block;width:120px;height:auto;border:0;">` : `<strong style="font-size:18px;letter-spacing:0.04em;">DLIFE</strong>`}
  </td></tr>
  <tr><td style="padding:28px 32px 8px;">
    <p style="margin:0 0 6px;font-size:14px;color:#2e6b60;">New website inquiry #${id}</p>
    <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:600;">${escape(inquiry.name)}, ${escape(inquiry.country)}</h1>
  </td></tr>
  <tr><td style="padding:16px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5;border-top:1px solid #1f2124;">
      ${rows
        .map(
          ([label, key]) => `<tr>
        <td style="padding:10px 12px 10px 0;border-bottom:1px solid #d5d8d4;width:120px;vertical-align:top;font-weight:600;">${label}</td>
        <td style="padding:10px 0;border-bottom:1px solid #d5d8d4;vertical-align:top;color:#3d4145;">${escape(inquiry[key])}</td>
      </tr>`,
        )
        .join('')}
    </table>
  </td></tr>
  <tr><td style="padding:16px 32px 8px;">
    <p style="margin:0 0 8px;font-weight:600;font-size:15px;">Message</p>
    <div style="padding:16px;background:#f5f6f4;border-left:3px solid #2e6b60;font-size:15px;line-height:1.6;white-space:pre-wrap;color:#1f2124;">${escape(inquiry.message)}</div>
  </td></tr>
  <tr><td style="padding:24px 32px 32px;">
    <a href="${replyHref}" style="display:inline-block;background:#1f2124;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;">Reply to ${escape(inquiry.name)}</a>
    <p style="margin:16px 0 0;font-size:13px;color:#5a5e62;">Or just press Reply: it goes to ${escape(inquiry.email)}.</p>
  </td></tr>
  <tr><td style="padding:16px 32px;background:#1f2124;color:#c9ccce;font-size:12px;line-height:1.5;">
    Sent by the Dulifei website. This inquiry is also saved in the website's inquiry list as #${id}.
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    `New website inquiry #${id}`,
    `${inquiry.name}, ${inquiry.country}`,
    '',
    ...rows.map(([label, key]) => `${label}: ${inquiry[key]}`),
    '',
    'Message:',
    inquiry.message,
    '',
    `Reply to this email to answer ${inquiry.name} directly.`,
  ].join('\n')

  return { subject, html, text }
}

/** Sends through Resend. Without an API key (local testing) it only logs, so the rest of the flow can be tested. */
export async function notifySales(inquiry, id, env, fetchImpl = fetch) {
  const { subject, html, text } = buildEmail(inquiry, { id, siteUrl: env.SITE_URL })
  if (!env.RESEND_API_KEY || !env.SALES_EMAIL) {
    console.log(`[email skipped: no RESEND_API_KEY or SALES_EMAIL] ${subject}`)
    return { status: 'skipped' }
  }
  const res = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'Dulifei website <onboarding@resend.dev>',
      to: env.SALES_EMAIL.split(',').map((s) => s.trim()),
      reply_to: inquiry.email,
      subject,
      html,
      text,
    }),
  })
  if (!res.ok) return { status: 'failed', error: `${res.status} ${(await res.text()).slice(0, 300)}` }
  return { status: 'sent' }
}
