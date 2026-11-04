# Going live on Cloudflare

The site runs as one Cloudflare Worker: the built pages in `dist/` plus the inquiry handler in `worker/`.

| Part | Service | Free allowance |
| --- | --- | --- |
| Pages, images | Cloudflare Workers static assets | Unlimited requests |
| Inquiry handler | Cloudflare Worker | 100,000 requests a day |
| Inquiry list | Cloudflare D1 database `dulifei-inquiries` | 5 GB, 100,000 writes a day |
| Spam check | Cloudflare Turnstile | Free |
| Email to the sales team | Resend | 100 emails a day, 3,000 a month |

## How an inquiry flows

1. Turnstile confirms a person sent it (invisible for most visitors).
2. The Worker checks the fields and the email address: format, common typos ("Did you mean ...gmail.com?"), throwaway-address domains, and whether the domain can receive mail at all (DNS lookup). If DNS does not answer, the inquiry is let through.
3. It is saved in D1. At most 5 inquiries per visitor per 10 minutes.
4. The visitor sees the thank-you panel with a reference number.
5. One email goes to `SALES_EMAIL`, with Reply going straight to the buyer. Its result (`sent`, `failed`, `skipped`) is stored with the inquiry, so nothing is lost if email fails.

## One-time setup

### 1. Accounts (the user)

Use one new email address made only for this project (for example a new Gmail), not a personal one. Sign up for everything with it: Cloudflare, Resend, Google Search Console, Bing Webmaster Tools. At handover the client either receives that whole login, or is invited to the Cloudflare account as Super Administrator and then removes us. Nothing personal is mixed in.

- Cloudflare account (free).
- Resend account (free). Until a domain is verified in Resend, its test sender can only deliver to the address the Resend account was created with, so test inquiries arrive in the project inbox.

### 2. Access for Claude (recommended)

In the Cloudflare dashboard, create an API token from the template "Edit Cloudflare Workers", and add D1 Edit and Turnstile Edit permissions. Create a Resend API key. Add both to the cloud environment settings (never in chat or in this repo) as environment variables:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID` (shown on the dashboard's Workers page)
- `RESEND_API_KEY`
- `SALES_EMAIL` (the test inbox for now)

A new session picks them up. Claude then runs the steps below.

### 3. Steps (Claude, or by hand)

```bash
cd site
npx wrangler d1 create dulifei-inquiries        # put the printed id into wrangler.jsonc
npx wrangler d1 migrations apply dulifei-inquiries --remote
# Turnstile: dashboard > Turnstile > Add widget, hostname = the workers.dev address (later the real domain)
npx wrangler secret put TURNSTILE_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put SALES_EMAIL
PUBLIC_TURNSTILE_SITEKEY=<site key> npm run build
npx wrangler deploy
```

### 4. When the client's domain is ready

- Add the domain to Cloudflare and attach it to the Worker (Settings > Domains & Routes).
- Add the domain to the Turnstile widget's hostnames.
- Verify the domain in Resend, set `FROM_EMAIL` in `wrangler.jsonc` to an address on it, and change `SALES_EMAIL` to the sales team's inbox. Mainland China note: use an inbox the team can open there (not Gmail).

## Checking inquiries and missed emails

Every inquiry is saved before any email is sent, so nothing is lost if email fails (Resend's free plan allows 100 emails a day; a stuck or refused email is marked `failed` after 10 seconds). To see the latest inquiries, and any whose email did not go out:

```bash
cd site
npx wrangler d1 execute dulifei-inquiries --remote --command "SELECT id, created_at, name, email, whatsapp, country, email_status FROM inquiries ORDER BY id DESC LIMIT 20"
npx wrangler d1 execute dulifei-inquiries --remote --command "SELECT id, created_at, name, email, email_error FROM inquiries WHERE email_status != 'sent' ORDER BY id DESC"
```

Reference numbers in the sales emails (#41, #42...) are the `id`: a gap in the numbers means an email did not arrive, so check the second query.

Optional secret: `npx wrangler secret put IP_SALT` (any long random text). The visitor key used for the spam limit is then impossible to rebuild from IP addresses. Visitor keys older than 30 days are blanked automatically; the inquiries stay.

`RESEND_URL` and `SKIP_MAIL_DNS` exist only so `scripts/load-check.mjs` can test without real services. Never set them on the live site.

## Build settings

Set these when building for the web (Cloudflare build variables, or in front of `npm run build`):

| Variable | What it does |
| --- | --- |
| `SITE_URL` | The public address. Canonical links, the sitemap and `llms.txt` use it. Required. |
| `PUBLIC_TURNSTILE_SITEKEY` | The spam check's site key. Without it the test key is used. Required. |
| `PUBLIC_CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics, if not switched on in the dashboard. Optional. |
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console check, if not verified through DNS. Optional. |
| `PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools check. Optional. |

`npm run check:site` warns when the build still points at localhost or uses the test spam key.

## Local testing

Before going live, and after any change to `worker/`: `npm run build && node scripts/load-check.mjs` (about 2 minutes, starts its own Worker and database; see `docs/WORKLOG.md`, 2026-11-04).

```bash
npm run worker:dev                      # builds, sets up the local database, runs on http://127.0.0.1:8787
npm test                                # inquiry checks (9 tests)
node scripts/form-check.mjs http://127.0.0.1:8787/ /tmp   # form in a real browser: errors, typo hint, success
npx wrangler d1 execute dulifei-inquiries --local --command "SELECT * FROM inquiries"
```

Locally, `.dev.vars` uses Turnstile's always-pass test secret and no Resend key, so emails are logged instead of sent.
