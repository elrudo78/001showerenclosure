# Cloudflare setup: what was done, what is stored where, and why

Written 2026-11-09, for the user and for any later reviewer (the user plans to have the whole first phase inspected). No secret, token value, account id or personal address is in this file. Names of variables and settings are.

## 1. Where things stand

| Part | State | Where it lives |
| --- | --- | --- |
| Domain `dlifei.com` | Registered at Namecheap. Nameservers point to Cloudflare (free plan). Cloudflare still showed "pending" a few hours later, although the nameservers answer; it re-checks on its own. | Namecheap, Cloudflare |
| Email | Namecheap Private Email on the same domain, mail records copied into Cloudflare DNS and set to "DNS only" (grey cloud). Four role aliases exist: sales, info, admin, website. | Namecheap, Cloudflare DNS |
| Old records | The root name still points to the team's old Railway site and `www` to a Namecheap parking address. Both are kept until launch, then deleted. | Cloudflare DNS |
| Site (test) | https://dulifei-website.dlifei.workers.dev, one Worker with the built pages and `POST /api/inquiry`. Not connected to any git repository. | Cloudflare account |
| Database | D1 `dulifei-inquiries`, both migrations applied (id in `site/wrangler.jsonc`). | Cloudflare account |
| Spam check | Turnstile widget "Dulifei website", hostnames: the workers.dev address, `dlifei.com`, `www.dlifei.com`. | Cloudflare account |
| Sending email | Resend (free plan), sender is Resend's test sender for now, so it only delivers to the Resend account's own address. | Resend account |
| First end-to-end test | The user sent a real inquiry from the live test address: saved as inquiry 1, `email_status = sent`, no error, email arrived (2026-11-09). | D1, Resend |

## 2. Credentials and settings: what, where, why

| Item | Where it is kept | Why there |
| --- | --- | --- |
| Cloudflare API token | Environment variable `CLOUDFLARE_API_TOKEN` in the user's personal cloud environment settings (the Default environment). Created with the template "Edit Cloudflare Workers" plus D1 Edit and Turnstile Edit. Expires 2026-12-09. | Needed so Claude can deploy. See section 3 for why it is a plain variable and not a protected network secret. |
| Cloudflare account id | Environment variable `CLOUDFLARE_ACCOUNT_ID`, same place. | Not a secret. Tells wrangler which account to use without a login prompt. |
| Resend API key | Worker secret `RESEND_API_KEY`, added by the user in the Cloudflare dashboard (Worker, Settings, Variables and Secrets, type Secret). | Chosen so the key never passes through the chat or the Claude machine. |
| Turnstile secret | Worker secret `TURNSTILE_SECRET`. The widget's first secret was discarded (it was written to a private temporary file that was deleted); a new one was made with the API's rotate call and piped straight into `wrangler secret put` without being printed. | The key pair must match the site key built into the pages. |
| Test inbox | Worker secret `SALES_EMAIL`, set to the admin alias for the test (Resend's test sender only reaches the Resend account's own address). Changes to the sales alias at launch. | Keeps real sales mail out of the test. |
| Visitor-key salt | Worker secret `IP_SALT`, random, generated and set in one step, never shown. | Makes the stored visitor key impossible to rebuild from IP addresses. |
| Turnstile site key | In the build (`PUBLIC_TURNSTILE_SITEKEY`) and in `docs/HANDOFF.md`. | Public by design. |
| Not stored anywhere | Namecheap login, Cloudflare login, Resend login. | Only the user has them. |

## 3. The environment-variable change, and why (the decision to review)

1. **First try (protected network secret).** The token was entered through the session's secure form, which stores it as a "network secret". The machine's proxy then adds it to requests to `api.cloudflare.com`; Claude never sees the value. Database creation, Turnstile setup and DNS-style API calls worked this way.
2. **It failed at the file upload.** `wrangler deploy` uploads the site's files in two steps. The second step authenticates with a short-lived key that Cloudflare returns in the first step, sent in the `Authorization` header. The proxy replaces that header with the saved token, so Cloudflare answers 401. Proven by hand with two direct calls (session start: 200; upload with its own key: 401), so it is not a token or site problem.
3. **Options put to the user.** (A) Let Cloudflare build from GitHub: no token inside the machine, but it connects a git repository to the live site and needs several dashboard fields. (B) Give the token as a plain environment variable. The user chose B, and said the site must not be connected to a repository (the repo is public, and the site may move to the client).
4. **What the user changed (2026-11-09).** Removed the Cloudflare entry from the environment's Network secrets. Added `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as environment variables. Started a new session so they take effect. The same token (same id) was reused. `wrangler whoami` then worked and the deploy succeeded.
5. **Cost of B, accepted.** The token value is now readable inside the machine and by any session using that environment. It is a personal environment, so only the user's sessions. Mitigations: it expires on 2026-12-09, it has no DNS or zone permission, and it is to be rolled after launch. The Default environment has unrestricted outbound network, which is the user's existing setting, not changed.
6. **Workarounds not used.** Sending the upload to a different spelling of the host, to dodge the proxy rule, was not tried: it would be getting round a security control.

## 4. Other decisions

- **Domain move first, DNS records checked.** The scan missed the Private Email signature record (`privateemail._domainkey`); it was added by hand from Namecheap's own DKIM display. Proxying (orange cloud) was switched off for the mail, autodiscover and autoconfig names and the old site names, because proxying breaks webmail and mail-app setup.
- **Resend sending domain.** At launch it will be the subdomain `updates` of the domain, not the bare domain, because the old setup already uses the names `send` and `rsend` there, and a separate subdomain keeps sales mail away from the mailbox's reputation.
- **AI crawler setting in Cloudflare.** Left at "Allow" for search, training and agents, matching the project's aim of being found and quoted by AI tools. The training setting is the client's business choice.
- **No repository connection on Cloudflare.** Deploys are made with `wrangler deploy` from the build output; updates are redeployed by hand.

- **Reference numbers.** The inquiry id is the reference number shown to buyers and in the sales email. Migration 0003 starts it at 205602 (first real number; set 2026-11-09), so the site does not look new. Inquiry 1 was the user's test.

## 5. Not done yet

- Domain still shows "pending" in Cloudflare; the token cannot trigger the check (no zone permission). Cloudflare re-checks by itself, or the user presses "Check nameservers now".
- Launch: delete the two old DNS records, attach the domain and `www` to the Worker, rebuild with the real address, verify the sending subdomain in Resend, switch `SALES_EMAIL` to the sales alias, add a DMARC record after mail works, turn off the workers.dev address, delete the test inquiry from the database.
- Contact details, social accounts, privacy notice, the logo question, and the items in `docs/HANDOFF.md` section 7 ("Inputs still needed").
- Roll the token after launch; Private Email auto-renew (ends 2027-09-29).

## 6. Questions for a reviewer

1. Is a personal, expiring, non-zone token in an environment variable an acceptable trade for deploying from this machine, or should the deploy move to the user's own computer or to a build service?
2. Are the Worker's protections adequate for a public form: Turnstile, 5 inquiries per visitor per 10 minutes, 64 KB body cap, origin check, strict content policy, hashed visitor key blanked after 30 days? (Detail and tests: `docs/SECURITY.md`, `site/scripts/load-check.mjs`, `site/scripts/security-check.mjs`.)
3. Does the domain's mail setup have everything it needs (two MX, SPF, the Private Email DKIM)? DMARC is still missing.
4. Is anything in the public repository that should not be? (`node site/scripts/repo-scan.mjs` scans every commit; last clean run 2026-11-04, rerun before moving the code to a private repository.)

## 7. How to roll or remove access

- **Token:** Cloudflare, My Profile, API Tokens, Roll (keeps permissions, gives a new value) or Delete. After a roll, replace the value in the environment settings.
- **Resend key:** Resend, API Keys, delete and create; then replace the Worker secret in the Cloudflare dashboard.
- **Turnstile secret:** rotate with the widget's rotate call and put the new value with `wrangler secret put TURNSTILE_SECRET`.
- **Hand the site to the client:** invite them to the Cloudflare account as Super Administrator, then remove the project login; or transfer the whole login. The repository is not involved.
