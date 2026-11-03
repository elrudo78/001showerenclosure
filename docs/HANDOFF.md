# Handoff: Dulifei website (read this first)

Last updated: 2026-11-03. Keep this file current; log every step in `docs/WORKLOG.md`.

## 1. Who's who

- **The user** (the person Claude works with): member of a small web team. This is the team's first project. They are doing it for portfolio value, as the pay is close to nothing.
- **The team** (the user's teammates, also called "the friend"): built V1/V2 of the site with an AI agent and run it. GitHub upstream: `sherry313/01showerenclosure`. Because the project is unpaid, the team is not invested in quality.
- **The client**: Dulifei (brand DLIFE / 杜丽菲), a shower-enclosure manufacturer in Zhongshan, China, working mainly to custom order.
- The answers in section 3 came from **the team**, not the client. Do not write "the client confirmed" for them.

## 2. What the user wants

A rebuild the team can show in its portfolio: good-looking, simple but solid backend, properly tested, with real SEO and GEO (visibility in Google and in AI answers such as ChatGPT, Claude and Perplexity). Keep scope small and quality high. The user prefers plain-language explanations, short messages and no jargon.

## 3. Team decisions and answers (2026-10-12)

**Client answers arrived later (on or after 2026-10-15) and win where they differ: see `docs/client-answers-2026-10.md`.** In short: do NOT link Fuli and Dulifei (never name Fuli or FANLY; the user decided Fuli-folder photos may be used, as the team's live site does); C01 to C05 are named DLFC01 to DLFC05; catalog specs may be shown; use model codes S26132 and YD62-31; the installation manual stays off the site (user's decision: it is a scan of another brand's guide).


- All products are on sale. Product names are our choice.
- Model numbers are just internal codes, not specifications. The company is mainly custom-order.
- Product details and specs may be shown on the website.
- Do not put installation manuals on the website (the client allowed it, but the user decided against it on 2026-10-30).
- Purpose of the site: display and traffic, so visitors leave their contact details and the sales team follows up. It is not a shop.
- SEO and GEO matter most to the team. They asked the user to "do SEO on the website we sent you", i.e. the current site.
- ~~FANLY / Zhongshan Fuli (福立): treat as associated with Dulifei.~~ Overridden by the client: do not associate. Fuli-folder photos are still allowed (user's decision), the names never.

These override `AGENTS.md` where they conflict (for example, catalog specs from the `reference` folder may now be used). All other `AGENTS.md` rules still apply: English only, no invented facts, never publish `private-materials`.

## 4. Repositories and sites

| Item | Where |
| --- | --- |
| Our fork (PUBLIC repo) | `elrudo78/001showerenclosure`, work branch `claude/kind-noether-o7pgbu` |
| Team upstream (public) | `sherry313/01showerenclosure`, `main`; added locally as remote `upstream` |
| Live site (team's version) | https://01showerenclosure-production.up.railway.app (Railway, React app + `server.mjs` + Resend email form) |
| Preview of our branch | Old: https://lively-frangipane-4d8b8a.netlify.app (2026-10-11). New: the user uploaded the full new site zip to Netlify Drop on 2026-11-02 (link not shared yet; the inquiry form does not work there, it needs Cloudflare) |
| Audit (shared doc) | https://claude.ai/artifact/6Y8PtmhGFz7HZFgTdknP9V, copy in `docs/audit/` |

Our branch = upstream `main` (merged at `d2f062b`) + our commits. None of our changes are live.

## 5. Current state of our branch

**New site:** `site/` (Astro + Cloudflare Worker). Build with `cd site && npm ci && npm run build`. Checks: `npm test` (inquiry checks), `npm run check:site` (raw HTML), `node scripts/browser-check.mjs <url> <out dir>` and `node scripts/form-check.mjs <url> <out dir>` and `node scripts/effects-check.mjs <url>` against `npm run worker:dev`. Going live: `site/DEPLOY.md`.

**Old app (team's, untouched until the switch):**

On top of the team's site we added: scroll fade-ins, a filled spec strip on product pages, hover zoom on galleries, a slow hero zoom, a photo swap on hover for three products, and a four-finish switcher on the homepage (C05 renders). Plus design skills in `.claude/skills/`, the material review and catalog specs in `docs/asset-review/`, and the audit in `docs/audit/`.

The user judged the current site unprofessional, so we will **rebuild rather than keep polishing**. Our additions above are throwaway; the reviews and specs carry over.

## 6. Audit summary (details in `docs/audit/website-audit-2026-10-12.md`)

- AI crawlers see an empty 737-byte page with 3 words on every URL; all pages share one title.
- No robots.txt, sitemap, meta descriptions, canonical, social image or structured data. Unknown URLs return 200 (soft 404).
- Mobile LCP 3.6 to 4.3 s (Lighthouse 75 to 79); JavaScript sent uncompressed (313 KB); no cache headers.
- Fonts (Manrope, Inter) are declared but never loaded, so visitors see Arial and Times New Roman.
- Product photos inconsistent; product pages show a grey box and empty specs; captions rotate by position; generic AI-sounding copy.
- No phone, email or WhatsApp on the site; no analytics; no thank-you page.
- Fair note: Lighthouse SEO, accessibility and best practices all score 100; content rules were followed well.

## 7. The rebuild plan (started 2026-10-14)

**Status (2026-11-02):** all pages built and tested in `site/`: home, products overview, 6 layout pages, 42 product pages (37 from the 2025 catalog with specs re-checked against the printed pages, plus DLFC01 to DLFC05), Factory, Projects, Contact with FAQ, thank-you, 404. SEO and GEO base built in (see `docs/rebuild/SEO-GEO-TRACKING.md`). Next: the user creates the project accounts (`site/DEPLOY.md`) so we can deploy a preview; the user shows it to the team and asks about the domain and inbox.

**Pitch to the team:** "To do the SEO/GEO you asked for, the pages must be rebuilt so search and AI tools can read them. Same content, I'll handle it." Keep the audit as backup evidence.

**Decided (2026-10-30): Cloudflare for hosting and inquiries; Netlify is dropped.** Setup and steps: `site/DEPLOY.md`.

**Stack (simple, free to run):**
- Astro static site: every page is complete HTML before any JavaScript.
- One Cloudflare Worker serves the pages and handles `POST /api/inquiry` (`site/worker/`).
- Inquiries: Turnstile spam check, email address checks (format, typo hint, throwaway domains, domain can receive mail), saved to a D1 database, then ONE email to the sales team via Resend. No email to the buyer: the page shows a thank-you panel with a reference number instead (user's decision).
- Testing with the user's own old inbox until the client's domain and sales address are known.
- Google Search Console plus free analytics (Cloudflare Web Analytics or GA4) after launch.
- Pinned dependency versions.
- Deadline: the user wants the project finished within a few days.

**Second round (done 2026-11-03), from the user's review of the Netlify preview and the team's draft:** Home link and nav pills; Products page filter pills; sharp DLFC card crops plus a "4 finishes" tag; finish switcher as pill buttons with "Try the frame finishes" and a one-time demo; smooth product opening (Chrome/Edge prepare the next page on hover; pictures not yet loaded fade in instead of flying in empty); optional WhatsApp or phone field (D1 migration `0002_whatsapp.sql`, link in the sales email); "How an order works" (4 factual steps) on Home and Contact; hardware close-ups on DLFC01 and DLFC04 that follow the chosen finish; dark theme with a header button. Kept sage as the theme. Not used: the client's 4 product videos (Chinese captions burned in, or people's faces).

**Effects (done 2026-11-03):** hover zoom on linked pictures, smooth page changes with the product picture moving into place, hero lines drawing in, header that hides on scroll down and returns on scroll up, buttons that fill on hover. Dropped by the user: DLFC-only card finish swap, photo viewer. Test: `node scripts/effects-check.mjs <url>`.

**Next, agreed but not started (in this order):**
1. Guides and articles (14 topics in `docs/rebuild/SEO-GEO-TRACKING.md`): postponed by the user until the site work is done. Also offered: IndexNow for Bing.
2. Deploy to Cloudflare once the user has the project accounts (`site/DEPLOY.md`).

**Tools decision (2026-11-03):** no paid component libraries and no React. 21st.dev, shadcn, Magic UI, Aceternity, React Bits and similar are React + Tailwind; using them would slow the site and look templated. They are used only as inspiration: the user sends a link, Claude rebuilds the effect in plain CSS. No smooth-scroll hijacking (Lenis) and no fade-in-on-scroll everywhere (AOS). The user pasted a 21st.dev API key in chat on 2026-11-03: it was not used or saved anywhere; the user was advised to replace it and, if ever needed, add it as the environment variable `API_KEY_21ST`.

**Pages (kept few):** Home, Products overview, one page per product, Factory and Quality, Projects, Contact. About folds into Home and Factory.

**Design direction (current, 2026-11-03):** sage theme adapted from 21st.dev "Sage Garden": sage-tinted off-white page, deep sage buttons and accents, forest-green form section, Archivo font (wide for headings), 4px corners on buttons and fields. Product drawings blend into the page colour. Full tokens and reasons: `docs/rebuild/PLAN.md`, Design. One standout interaction: the measuring lines and finish switcher in the hero. Avoid AI-template tells (see `.claude/skills/frontend-design/SKILL.md`): no all-caps label above every heading, no arrow on every link, no fade-in on every section, no em dashes in copy, no generic copy.

**Order of work:**
1. Short written plan (sitemap, content per page, design tokens).
2. Homepage design, for the user's OK before anything else.
3. Build all pages, in a new folder on the work branch; the current site stays untouched until the switch.
4. Test rigorously: 390, 768, 1440 and 1920 px; keyboard; contrast; Lighthouse; raw-HTML word count per page; no Chinese text; no em dashes; links; form.
5. Cloudflare preview link (workers.dev) for the user.
6. Team OK.
7. Go live.
8. SEO and GEO: Search Console, sitemap, Organization and Product structured data, llms.txt, per-product content.

**Inputs still needed from the team or client:** contact details to show (phone, WhatsApp, email, address; the catalog cover has a tel/fax but it has not been cleared), the client's domain, the sales inbox, and confirmation of hosting. Also ask: can we say they do OEM/ODM (the team's draft says so, unconfirmed), and do they still use the glass suppliers whose certificates they sent (SGCC, AS/NZS 2208, EN 12150; one expired)? Until answered, neither appears on the site.

## 8. Client materials

- Source: a Google Drive folder the user shared in chat on 2026-10-11. **Never commit the link**: this repo is public and `reference` contains personal data. Ask the user for it if needed.
- Local copies live in the git-ignored `client-materials/` and are lost when the cloud container resets. Re-download with `scripts/dev/drive_*.py` (see `scripts/dev/README.md`).
- `public-materials`: 805 files = 644 unique (`图册/设计图` is an exact copy of `设计图`). Drive shows 987 because it also counts 84 folders; `private-materials` (4 files) was removed by the user.
- **Start with `docs/asset-review/MATERIALS-GUIDE.md`**: what each folder is good for, the product range and finishes the material shows, the strongest picks per website section, and gaps.
- Complete indexes, so every shared file is recorded even when the files are not on the machine: `public-materials-inventory.csv` (all 805, with copies), `public-materials-review.csv` (644 unique, reviewed), `reference-inventory.csv` (all 98, personal details removed), `catalog-pages-index.csv` (all 110 catalog pages), all in `docs/asset-review/`.
- Best material: C01 to C05 renders (2643 to 3840 px, four finishes each), real installed photos (review ids P0394, P0382, P0413, P0408), factory photos.
- Do not publish:
  - FANLY title-block drawings with customer, designer or company contact details;
  - photos with watermarks (FANLY, OPPO, HONOR);
  - photos with identifiable faces or licence plates;
  - third-party glass-supplier certificates (one 3C certificate expired 2023);
  - banners with unverified claims (factory size, staff count, "leading manufacturer").
- Specs: the site's source of truth is `site/src/data/catalog.ts`, every figure re-read from the printed catalog pages on 2026-11-02. The older agent transcription in `docs/asset-review/dulifei-2025-catalog-specs.md` had errors (for example T93152's size and width range); do not use it for publishing.
- Other catalogs in `reference`: 2020 catalog = FANLY; 酷小白 = GUXBAI (another brand); 美国市场大吊轮款 and 财业五金 = supplier catalogs. The English installation manual is a scan of another brand's guide and must not go on the site.

## 9. Working environment notes

- See `scripts/dev/README.md` for: re-downloading materials, headless browser testing through the agent proxy (SPKI pin, read from the environment), Lighthouse, and known gotchas (smooth scrolling in tests, `pkill` killing its own shell).
- Design skills are vendored in `.claude/skills/` (reviewed, pinned; README there). `AGENTS.md` and section 3 above override any skill.
- Commit and push after each meaningful step to `claude/kind-noether-o7pgbu`. Never commit `client-materials/`, the Drive link, or personal names and contacts.
