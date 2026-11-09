# Roadmap: what is done, what is next, who does it

As of 2026-11-09 (night). The new site is live at https://dlifei.com. This file is the plan from here. Keep it current; details of each step go in `docs/WORKLOG.md`, decisions in `docs/HANDOFF.md`.

## Where we are

- Live: all pages, the inquiry form (saved to the database, then one email), reference numbers from 205602, an interim privacy notice, redirects (http to https, www to the bare domain), security headers, Web Analytics switched on in the dashboard, Bot Fight Mode on.
- Email: Namecheap Private Email on the domain (sales, info, admin, website, and soon dmarc as aliases). Inquiry emails are sent through Resend from `website@updates.dlifei.com` to the sales address.
- All free tiers. Nothing here costs money except the yearly renewals of the domain and of Private Email.

## Phase A: finish the launch (this week)

| # | Step | Who |
| --- | --- | --- |
| A1 | Send one real inquiry from dlifei.com (it will be number 205602) and confirm the email arrives in the sales inbox, from the new sender. | User |
| A2 | Create the alias `dmarc` at Namecheap so the DMARC reports have somewhere to go. | User |
| A3 | Make a project Google account from the company address (sign-up, "use my existing email"), turn on 2-step login, then use it for Google Search Console: add the domain, send us the verification text, we add it to DNS, then submit the sitemap. Bing Webmaster Tools: sign in with the same account and import from Search Console. At handover, add the client's Google account as Owner in Search Console (Settings, Users and permissions) and remove ours; the DNS verification record stays, so ownership can always be re-proven. | User and Claude |
| A4 | Check that Web Analytics receives visits (the automatic setup may not add the script; if not, use the site token with `PUBLIC_CF_ANALYTICS_TOKEN`). | Claude |
| A5 | Delete the old Railway project and the old Resend domain. | Team |
| A6 | Delete the test inquiry (id 1) from the database. | Claude |
| A7 | Roll the Cloudflare token (it expires 2026-12-09 anyway), and set Namecheap auto-renew for the email (ends 2027-09-29) and check it for the domain. | User |
| A8 | Turn on 2-step login on Namecheap, Cloudflare, Resend and GitHub, and confirm it. | User |
| A9 | Remove the workers.dev name from the spam-check widget's hostnames. | Claude |
| A10 | Private repository: user creates an empty private repository (not a fork, no README); Claude attaches it and pushes this branch as `main`, checks it, then the user deletes the old public repository. No pull request is needed. | User and Claude |

## Phase B: get found (weeks 1 to 12)

Plan and reasons: `docs/rebuild/SEO-GEO-TRACKING.md`.

1. Week 1: Search Console and Bing set up (A3), sitemap submitted, IndexNow for Bing (instant notice of changes).
2. Every two weeks: look at Search Console (which searches show the site, which pages are clicked) and improve titles and first paragraphs of pages that show but are not clicked.
3. Watch referrers for `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com`: visits from AI answers.
4. Guides and articles (14 topics in the tracking file): postponed by the user until now. Start with the three buyers ask about most (sizes and standard dimensions, glass thickness and safety glass, sliding versus pivot). Each must use only facts we have.
5. Optional, needs the client: a Google Business Profile for the factory address, listings on B2B directories. Only with the client's agreement and real details.

## Phase C: content that needs the client

Detail and wording for the team: the pending list (`WHAT-IS-LEFT.md`, sent to the user). In short: phone, WhatsApp, address, social accounts; the company's legal name for the privacy notice; who reads inquiries; the logo question ("LONDON"); a bigger D15131 photo; what tells the neo-angle models apart; project stories; videos without captions or faces; OEM/ODM and certificate answers if the client wants them shown.

Every new fact goes in through `site/src/data/` or `site/src/data/site.ts`, then `node scripts/copy-check.mjs` and `npm run check:site`.

## Phase D: keep it healthy (monthly, then yearly)

- **Monthly:** look at inquiries and missed emails (queries in `site/DEPLOY.md`); back up the inquiry database: `cd site && npx wrangler d1 export dulifei-inquiries --remote --output=backup.sql` and keep the file somewhere private (it holds buyers' details); read the DMARC reports for anything that is not us; run `npm audit`.
- **Before any change:** `cd site && npm run check:quick`, after any change to `worker/` also `node scripts/load-check.mjs`.
- **Limits to watch (all free plans):** Resend 100 emails a day and 3,000 a month; the Worker 100,000 inquiry-form requests a day (pages do not count). Hitting either is unlikely at this size.
- **Dates:** Cloudflare token 2026-12-09; Private Email 2027-09-29; domain renewal date (check in Namecheap).
- **Uptime:** a free monitor (for example UptimeRobot) on https://dlifei.com/ that emails the team if the site stops answering.

## Phase E: moving it to the client (when the time comes)

1. Invite the client to the Cloudflare account as Super Administrator, then remove the project login, or hand over the whole login.
2. Namecheap: transfer the domain account (or push the domain and the mailbox to the client's account).
3. Resend: transfer or recreate with the client's own account, then replace the Worker secret.
4. Repository: a private repository the client can be added to (see below).
5. Roll every secret on the way out (`docs/CLOUDFLARE-SETUP-LOG.md`, section 7). Nothing needs the repository to keep running.

## Decisions still open

| Decision | Options | Leaning |
| --- | --- | --- |
| New private repository (not a fork) | Mirror the full history, or start from one fresh commit | Full history: logs and reasons stay; scan found no secrets |
| DNSSEC for the domain | Off now; on later through Cloudflare plus one record at Namecheap | Turn on once everything is stable |
| Rate-limit rule at Cloudflare in front of the form | The free plan allows one rule | Add it; the form already limits itself (5 per visitor per 10 minutes) |
| Privacy notice wording and retention period | Interim text now; client or adviser checks it | Replace with the legal name and a retention period when received |
| Where inquiries go | Sales alias only, or also an address the Chinese team already reads | Both, if Namecheap webmail is hard to reach in China |
| Inspection of the first phase by another reviewer | Use `docs/CLOUDFLARE-SETUP-LOG.md`, section 6, as the brief | Do it before the repository move |
