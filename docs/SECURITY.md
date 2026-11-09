# Security: what is protected, and what to do at launch

As of 2026-11-04. The repository is public, so nothing secret may ever be in it. Everything below was tested; commands are at the end.

## What the site does to protect itself and its visitors

| Area | Protection | Tested by |
| --- | --- | --- |
| Pages | Every page is plain HTML. The browser is told to run only our own scripts: a Content-Security-Policy lists the exact fingerprint of each inline script (4 of them) and allows nothing else except Cloudflare's spam check. An attacker who found a way to inject a script, an `onclick`, `eval` code, or an image or script from another website would be refused by the browser. The site cannot be shown inside another website's page (clickjacking). | `security-check.mjs` D (real browser) |
| Headers | `nosniff`, strict referrer policy, no framing, `Permissions-Policy` (camera, microphone, location, payment off), HSTS for a year, `Cross-Origin-Opener-Policy`. Hashed files are cached for good. No cookies are set by the site. | `security-check.mjs` A |
| Outside services | Only Cloudflare's spam check (and Cloudflare Web Analytics if switched on). Fonts, pictures and scripts are our own. | `security-check.mjs` C |
| Files | Only the built site is published; source code, settings, notes, the database folder and client files cannot be reached, with or without `../` tricks. No open redirects. | `security-check.mjs` B |
| Inquiry form | Spam check (Turnstile) must pass or nothing is saved; if Cloudflare cannot answer, the inquiry is refused rather than let through. Forms from other websites are refused (`Origin` check). Body limit 64 KB, cut off while reading. Rate limit 5 per 10 minutes per visitor, exact even under a burst, and one IPv6 block (/64) counts as one visitor. Email address checks (format, typo, throwaway domains, can it receive mail). | `load-check.mjs`, `worker/*.test.js` |
| Data handling | All database queries use bound values (SQL typed into the form is stored as plain text). Everything typed is escaped in the sales email, and the subject is one line (no header injection). Control characters removed. Only a hash of the visitor's address is stored (rate limit key), blanked after 30 days; optional secret `IP_SALT` makes it impossible to rebuild. No email goes to the person who filled in the form, so the form cannot be used to send mail to other people. | `load-check.mjs`, `worker/db.test.js` |
| Failures | Every inquiry is saved before any email is sent. If email fails or hangs it is marked `failed` after 10 seconds with the reason, and listed by one SQL line (`site/DEPLOY.md`). | `load-check.mjs` 4, 4b |
| Supply chain | Every dependency pinned to an exact version, all from the npm registry, `npm audit` shows 0 known vulnerabilities (2026-11-04). | `repo-scan.mjs` 4 |
| Repository | No keys, tokens, personal details, client files or Drive link in any of the 38 commits on any branch. `client-materials/`, `private-materials/`, keys and local settings files are git-ignored. | `repo-scan.mjs` 1 to 3 |

## At launch (these cannot be tested from here; each takes a few minutes)

Accounts and keys
1. Two-step login on the project's Cloudflare, Resend and GitHub accounts (the new project email, not a personal one).
2. Cloudflare API token: only the permissions listed in `site/DEPLOY.md`, an expiry date, and kept only in the environment settings. Roll it (dashboard, API Tokens, Roll) after the first deploy and again at handover.
3. Secrets only through `npx wrangler secret put` (`TURNSTILE_SECRET`, `RESEND_API_KEY`, `SALES_EMAIL`, and `IP_SALT`, a long random text). The always-pass test keys must not be used live: create a real Turnstile widget for the real domain, put its site key in the build (`PUBLIC_TURNSTILE_SITEKEY`) and its secret in `TURNSTILE_SECRET`.
4. `RESEND_URL` and `SKIP_MAIL_DNS` must never be set on the live Worker (they exist for tests only).
5. The 21st.dev key pasted in chat on 2026-11-03: replace it on 21st.dev (it was never used or saved).

Email (so nobody can fake the client's address)
6. Verify the client's domain in Resend, then add the SPF and DKIM records Resend shows. Add a DMARC record (start with `v=DMARC1; p=none; rua=mailto:<an inbox the client reads>`; move to `p=quarantine` after a few weeks of clean reports).

Cloudflare dashboard (free plan)
7. SSL/TLS mode Full (strict), Always Use HTTPS on, Minimum TLS 1.2, DNSSEC on, a CAA record for the certificate authority in use.
8. Security, Bots: Bot Fight Mode on.
9. One rate-limiting rule as a second layer in front of the Worker: URL path equals `/api/inquiry`, more than 10 requests a minute from one address, then block for 10 minutes.
10. Keep HSTS as it is (one year, no `includeSubDomains`, no preload) until it is certain that every subdomain of the client's domain works over HTTPS.

GitHub (the repository is public)
11. Turn on secret scanning with push protection, Dependabot alerts, and branch protection for `main`.

Privacy (needs the client's input)
12. A privacy notice page. The site collects name, email, optional phone or WhatsApp, company, country, message, the page it was sent from, the visitor's country (from Cloudflare) and a hashed visitor key blanked after 30 days; Cloudflare and Resend process some of it. The notice must name the company and a contact address, so it cannot be written until the client supplies them. A draft can be prepared on request, for the client to check with whoever advises them.
13. Deleting someone's data on request: `npx wrangler d1 execute dulifei-inquiries --remote --command "DELETE FROM inquiries WHERE email = 'person@example.com'"`. Agree with the client how long inquiries are kept.

### Launch status (2026-11-09, night)

| # | State | Note |
| --- | --- | --- |
| 1 | To confirm | The user thinks 2-step login is on in Cloudflare and Resend; Namecheap and GitHub not confirmed. |
| 2 | Partly | Token has an expiry (2026-12-09) and is in the user's environment settings as a plain variable (see `docs/CLOUDFLARE-SETUP-LOG.md`). Roll it after launch. |
| 3 | Done | Real Turnstile keys, `TURNSTILE_SECRET`, `SALES_EMAIL`, `IP_SALT` set with wrangler, `RESEND_API_KEY` added by the user in the dashboard. |
| 4 | Done | Only four secrets exist on the Worker; the two test settings are not set. |
| 5 | To confirm | The user was advised to replace the 21st.dev key. |
| 6 | Done | Resend verified `updates.dlifei.com` (SPF, DKIM); Private Email has SPF and DKIM; DMARC added (monitor only, reports to the `dmarc` alias, which the user still has to create). |
| 7 | Partly | Always Use HTTPS is on (tested: http redirects to https). The user switched on SSL/TLS settings in the dashboard; exact modes not verified. DNSSEC and CAA not done. |
| 8 | Done (reported by the user) | Bot Fight Mode on. |
| 9 | Not done | The form limits itself (5 per visitor per 10 minutes); the extra Cloudflare rule is a second layer. |
| 10 | Done | HSTS one year, as built. |
| 11 | Open | The repository is public; moving to a private repository is planned. Secret scanning for private repositories needs a paid plan, so `node site/scripts/repo-scan.mjs` stays the check. |
| 12 | Interim | `/privacy/` is live; the company's legal name and a retention period are still to be added. |
| 13 | Documented | Command above. |

Live checks on 2026-11-09 (https://dlifei.com): every sensitive path returns 404 (headers and redirects files, source maps, `package.json`, `.env`, `.dev.vars`, `wrangler.jsonc`, `worker/`, `migrations/`, `.git`, `node_modules`); security headers present; the browser blocks an injected inline script, an onclick handler, code from a string, a script and an image from another site, and framing; `browser-check` passes. `security-check.mjs` speaks plain http for its path tests, so against https its path section reports false failures (it is a test artefact: http now redirects to https); use the curl list above for the live site.

## Limits to know

- Styles may be inline (the page builder writes them into each page), so the policy cannot forbid inline styles. Scripts, the thing that matters, are locked down.
- If Cloudflare's spam check is down, inquiries are refused until it is back (the safe choice; the page tells the visitor to try again).
- The free email plan sends 100 emails a day. Past that, emails fail but inquiries are still saved and listed by the SQL in `site/DEPLOY.md`.
- Local tests cannot show how Cloudflare's own network, firewall or the real Turnstile and DNS services behave under heavy load; the form check covers them at low volume. Cloudflare protects against network-level floods on every plan automatically.
- The tests prove the rules above; they cannot prove there is no unknown flaw. Re-run them after any change (below), and keep dependencies updated.

## If something goes wrong

- A key may have leaked: roll the Cloudflare token, create a new Resend key and Turnstile secret, `wrangler secret put` each, redeploy. Old values stop working immediately.
- Take the site offline: Cloudflare dashboard, Workers & Pages, the Worker, Settings, Domains & Routes, remove the route.
- Spam is getting through: lower `RATE_LIMIT.count` in `worker/db.js`, or tighten the Cloudflare rule in item 9.

## Commands

```bash
cd site
npm audit                                   # dependencies
node scripts/repo-scan.mjs                  # secrets, personal details, forbidden files, dependencies (all commits)
npm run build && npm run worker:dev         # then, in another terminal:
node scripts/security-check.mjs http://127.0.0.1:8787/   # headers, hidden files, built-site scan, real-browser policy test
npm test                                    # 35 unit tests, including the form's spam check and rate limit
node scripts/load-check.mjs                 # starts its own Worker: bursts, failures, hostile requests (57 checks)
```
