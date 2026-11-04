# Work log

Newest first. After each meaningful step, add an entry: date, what changed and why, files, commit. Keep entries short; put lasting decisions in `docs/HANDOFF.md`.

## 2026-11-04: Security

- New `site/scripts/security-check.mjs` (4,361 checks), `site/scripts/repo-scan.mjs` (all 38 commits on every branch) and `docs/SECURITY.md` (what is protected, a launch checklist for the dashboards, limits, what to do if something goes wrong).
- Added: a strict **Content-Security-Policy**, built at the end of `npm run build` (`scripts/finish-headers.mjs`) from the exact inline scripts of that build, so it cannot go stale; only Cloudflare's spam check and Web Analytics are allowed from outside. More headers in `public/_headers` (HSTS one year, cross-origin-opener-policy, wider permissions-policy). The real-browser test proves injected scripts, `onclick` handlers, string-built code and scripts or images from other sites are refused, and that nothing of ours is blocked (desktop and phone).
- The test caught a mistake of mine: the first policy blocked the page-preparation hint (speculation rules) on every page, which would have silently turned off the smooth product opening in Chrome. Its fingerprint is now listed too.
- Worker: the spam check now has a 5 second limit; an IPv6 /64 block counts as one visitor for the rate limit (`worker/visitor.js`); unit tests for the spam check (no token, rejected token, accepted token, Cloudflare unreachable) and the limits.
- Dependencies: `npm audit` found 2 high (the image tool `sharp`, and `undici` inside the build tools and local test server) and 2 moderate; none run for visitors. Fixed without touching Astro: `sharp` 0.35.5, `wrangler` 4.157.0, locked `undici` refreshed; now 0 vulnerabilities. All suites re-run on a clean `npm ci`.
- Repository: **`.gitignore` protected the three subfolders of `client-materials/` but not the folder itself**, so a new file dropped straight into it (for example a note with the Drive link) could have been committed. Now the whole folder, `private-materials/`, keys, `.dev.vars*` and `.wrangler/` are ignored. Scan result: no keys, tokens, personal details, client files or Drive link in any commit (the Drive folder id, the user's email and any `drive.google.com` link: 0 matches).
- Not testable from here (listed in `docs/SECURITY.md` for launch): Cloudflare account and token settings, real Turnstile keys, email authentication (SPF, DKIM, DMARC), Cloudflare firewall rules, GitHub secret scanning, and the privacy notice, which needs the client's company name and contact address.

## 2026-11-04: Backend and traffic test of the inquiry Worker

- New `site/scripts/load-check.mjs` (57 live checks) starts the real Worker locally with a fresh database and a fake email service that can fail or hang on demand; Turnstile and the DNS lookup are switched off so it measures our code. New unit tests: `worker/db.test.js`, `worker/handler.test.js` (25 unit tests in all).
- First run on the existing code found 14 problems. Fixed in `worker/`:
  - **Rate limit leaked under bursts:** 60 simultaneous requests from one visitor saved 40 (limit 5), because the count and the save were two steps. Now one statement (`saveInquiry` in `worker/db.js`); exactly 5 get through, even when sent together.
  - A request body of `null` crashed the Worker (500); other non-form JSON gave confusing errors. Now a clean 400.
  - No size limit: a 5 MB body was fully processed. Now bodies over 64 KB get 413, and an upload with no declared size is cut off as soon as it passes 64 KB.
  - Forms posted from another website were accepted; now an `Origin` that is not our own site gets 403.
  - Line breaks in the name went into the email subject; the subject is now one line.
  - The no-JavaScript error page printed text without escaping it (not exploitable today, since email addresses are strictly checked, but now escaped), and now carries `nosniff` and a strict content-security-policy.
  - Control characters (a NUL cut saved text short) are removed; line breaks kept.
  - Email sending had no time limit; a stuck email service would leave a record on "pending" for ever. Now 10 seconds, then `failed` with the reason.
  - Visitor keys: optional secret `IP_SALT`; keys older than 30 days are blanked (privacy).
- What held up from the start: 300 inquiries in the same instant (all saved once, every reference number different, every email result recorded); email failures (40% failing, 10% hanging) never lose or hide an inquiry; 3,000 page loads with 100 inquiries at once, no errors; invalid forms always get the right message and save nothing; SQL and HTML typed into the form are stored as plain text and neutralised in the email; emoji, Arabic, Chinese and Cyrillic are kept exactly.
- Numbers (this machine, not Cloudflare's): about 330 page loads a second with 100 simultaneous visitors (median 280 ms, 99% under 470 ms); a steady 15 inquiries a second with a median reply of 11 ms; 300 at the very same instant all answered within 1.2 s. One inquiry costs about 0.6 ms of our own code (99% under 3 ms; Cloudflare's free plan allows about 10 ms); the Worker is 58 KB gzipped (limit 3 MB) and starts in 24 ms; the site is 1,395 files (limit 20,000), the largest 0.7 MB (limit 25 MB). Static pages never run the Worker, Cloudflare serves them from its own network.
- Limits to know: the free email plan is 100 a day (failed ones are listed by the SQL in `site/DEPLOY.md`); an uploaded body cut off halfway upsets the *local* test server for the next request on that connection (not the Worker); this test cannot measure Cloudflare's own capacity or the real Turnstile and DNS services (the form check covers those at low volume).

## 2026-11-04: Screen-size testing

- New `site/scripts/sizes-check.mjs`: 20 screens (phones 320 to 430, phones sideways, tablets, laptops 1280 to 1536, MacBook 1440 at 2x, Full HD, 2K, 4K) times 11 page kinds; checks sideways scroll, anything sticking out, cut-off text, tap targets under 40 px, soft pictures (real file width against screen pixels), header fit, words broken across lines, jump links hidden under the header, 200% text size on a 320 px phone, and every page at seven widths.
- Real problems found and fixed: footer links too short to tap (38 px, now about 46 px); the logo was soft on 3x phones (added a 3x file); product photos and the tablet and laptop studio image offered too few sizes (added 1280, 2000 and 2640 px candidates and accurate `sizes`); hardware close-ups sized up to 640 px; single-column grids that a long word could widen (`minmax(0, 1fr)` on 15 of them); the Products index put six boxes on a row at 1024 px, which broke "Panoramic" (now six only from 1280 px).
- My own regression, caught by the side-by-side view and then by a new broken-word check: letting headings break long words split "measurements" in the home heading. The heading now sizes itself to its column (`container-type`, `cqi`), so the word always fits; `check` now fails on any word broken across lines in headings, lead text, buttons and index names.
- Hover on the big layout headings: colour, sliding arrow and a 2 px underline (no box).
- Accepted limits: the D15131 room photo (710 px) and drawing (748 px) are as sharp as the client's files allow; on a phone held sideways at 3x the hero is 65% sharp (threshold 60% there).
- Result of the last full run: 2,496 checks, only the accepted picture limits left. Other suites pass; Lighthouse home 99, products and DLFC04 100.

## 2026-11-04: Catalog wording out, counts out, smooth jumps, contact spots

- Homepage: no line under the layout drawings.
- Products page: layout headings slightly smaller (26 to 44 px); no hover box behind them (`.title-link` opts out of the link box; colour and arrow only).
- Removed every visible "from our 2025 catalog" line (product spec note now "Need a size outside these ranges? Ask us.", comparison intro, homepage scene caption, "Catalog finishes", FAQ, `llms.txt`). The figures are unchanged and still come from the catalog; `check:site` now fails if "catalog" appears in visible text.
- Model counts gone from layout pages ("Compare models"; it said 15 on sliding doors because DLFC models have no printed specs) and product pages ("See all").
- Jump links glide: `scroll-behavior: smooth` (off for reduced motion), no JavaScript.
- Contact: `contact` in `site/src/data/site.ts` (email, WhatsApp, phone, address, social accounts). Empty until supplied; once filled it shows "Other ways to reach us" on Contact, social links in the footer, and email, telephone and `sameAs` in the Organization data. Tested with sample values, then emptied again.
- Tests: all checks pass (effects test: no box on big headings, no count on Compare). Lighthouse home 99, products and contact 100 across the board.

## 2026-11-04: Products page layout, scrollbar

- From the user's review: the index beside the heading had no breathing room and did not look clickable; the layout headings were small and crowded by their descriptions.
- Now: heading and intro full width; "Jump to a layout" index below it as six bordered boxes with each layout's drawing, name and a down arrow (counts and taglines removed; on phones one compact row each); a content-wide divider and a section of space before each layout; large layout headings (33 to 52 px) linking to the layout page with an arrow; "See all and compare" (or "See all") button in place of the description; four models below.
- Scrollbar: thin, sage on stone (`scrollbar-width`, `scrollbar-color`).
- Tests: all checks pass (effects test updated for the new button); Lighthouse products page 99 performance, 100 accessibility, best practices and SEO.

## 2026-11-04: Picture move fixed for real hosts; two copy changes

- The user saw the product picture move on page change only rarely on Netlify. Cause: the fallback added on 11-03 cancelled the move whenever the new page's picture was not loaded yet at the moment of the change, which on a real host is nearly always (measured: 0 of 6 moves with 600 ms picture delay, 6 of 6 without).
- Fix (`Base.astro` + `global.css`): if the new picture is not ready, the clicked picture makes the move on its own (class `vt-hold-old`), stays in place until the real picture loads (kept open by a script animation on the group, at most 1.5 s), then cross-fades to it. The moving element on a list page is found from the product we came back from (`navigation.activation.from`). Measured: 6 of 6 moves with the delay. New effects test for the slow case, opening and going back.
- Contact: removed "The more you send, the faster the quote" (read as pressure, promised a speed we cannot guarantee). Homepage layout drawings: the taglines replace the model counts.
- Tests: `check:site`, 10 unit tests, browser, form and effects checks all pass; Lighthouse home 99, D15131 and contact 100 across the board.

## 2026-11-03: Third round from the user's review

- Dark theme removed completely (tokens, header button, early script, theme-color pair, plates, logo filter, test); the user prefers the muted light page.
- FAQ: own page `/faq/` (FAQPage data moved there from Contact), FAQ link in the footer of every page, sitemap and `llms.txt` updated; Contact keeps a one-line link.
- Products page: filters removed. Now a vertical index of the six layouts (name, tagline from `catalog.ts`, model count), then four models per layout and "See all N models" (or "Compare the N models" where a layout has four or fewer). Its ItemList now lists the six layout pages.
- Layout pages: "Compare the N models" button (jumps to `#compare`) beside "Request a quote".
- Text links: light box (3px corners) rising from the bottom on hover, everywhere except cards, buttons, the logo, the homepage drawings and the top bar.
- Tests: `check:site` passed (56 pages); 10 unit tests; all browser checks; form check; effects check (now covers the products overview, the Compare button and the link hover). Lighthouse home 99, products, pivot layout and FAQ 100 across the board, CLS 0.

## 2026-11-03: Second round from the user's review

- Compared with the team's draft (lively-frangipane Netlify site). Taken: a WhatsApp field and "how it works" steps. Not taken until the team confirms: OEM/ODM wording and the glass suppliers' certificates. The rest of their copy is generic.
- Fixes the user asked for: Home in the top bar; nav hover and current-page pills; Products page categories as sticky filter pills (CSS `:target`); blurry DLFC thumbnails (cause: whole room shrunk into a small card, heavy compression) fixed with 4:5 crops on the door (`dlfc/card-*.jpg`) and larger, higher-quality photo card files; finish switcher made obvious (pill buttons, "Try the frame finishes", a one-time demo under 5 s, "4 finishes" tag on DLFC cards).
- Jerky product opening: on Netlify the product picture was not loaded when the page change ran, so it flew in empty and popped. Fix: speculation rules (Chrome/Edge prerender on hover) and a `pagereveal` fallback that lets an unloaded picture fade in. Prerender cannot be tested under Playwright (DevTools disables it); the rules parse (54 candidates).
- New: optional WhatsApp or phone field end to end (form, check, D1 `0002_whatsapp.sql`, sales email with a wa.me link, unit test); "How an order works" on Home and Contact; DLFC01 and DLFC04 hardware close-ups (client renders, trimmed by `prepare_images.py`) that switch with the finish; dark theme (device setting plus header button, remembered).
- Theme: recommended keeping sage; dark tokens in `docs/rebuild/PLAN.md`.
- Product videos reviewed and not used: S68422 has Chinese captions burned in; D15131, S41522 and S89022 show a person.
- Image tooling: the system Pillow is broken in this container; use a venv (`python3 -m venv`, `pip install pillow pymupdf`). Re-running `prepare_images.py` reproduced every existing image byte for byte.
- Tests: `check:site` passed; 10 unit tests; all browser checks (focus test now looks at the whole finish pill); form check; effects check extended (finish demo, hardware, filter, theme button). Lighthouse light and dark on home, products, DLFC04 and contact: 99 to 100 performance (one home run 94, three reruns 99 to 100), 100 accessibility, best practices and SEO.

## 2026-11-03: Subtle effects

- The user chose effects 1, 3, 5, 6 and 7. Dropped by the user: the DLFC-only black-to-gold card swap (would look odd on 5 of 42 products) and a photo viewer for project and factory photos (they are not links and look fine as they are).
- Built, all CSS except a 20-line scroll script: (1) linked pictures grow 4% on hover (product cards, homepage layout drawings; drawings grow upwards from the floor line; hover devices only); project and factory photos are not links, so they do not zoom. (3) Page changes fade across (cross-document View Transitions); the product picture moves from its card into place on the product page; the header stays put; off for reduced motion; browsers without support load normally. (5) Hero measuring lines already drew in on load; no change. (6) Header sticks, slides away on scroll down, returns on scroll up or keyboard focus; sticky columns move down to make room. (7) Buttons fill from the bottom on hover, plus a 1px press.
- Fixed an older bug found by the new test: "More ..." on product pages could list the same model twice in small layouts.
- Files: `global.css`, `Header.astro`, `ProductCard.astro`, `RangeLineup.astro`, `FinishGallery.astro`, `Specify.astro`, `InquiryForm.astro`, product page. New test `site/scripts/effects-check.mjs` (header, hover, button fill, transitions run, no duplicate transition names on all 53 sitemap pages, reduced motion, touch).
- Tests: `check:site` passed; 9 unit tests; 193 browser checks; form check; effects check; Lighthouse home 99/100/100/100, D15131 and products 100 all round, CLS 0.

## 2026-11-03: Sage theme applied; tools decision; next steps recorded

- The user asked about adding subtle effects and using 21st.dev (paid plan, API key). Agreed: no paid tools, no React components; libraries are inspiration only and effects are rebuilt in plain CSS. The 21st.dev key the user pasted in chat was not used or saved; advised to replace it.
- Proposed six subtle effects; the user liked them all and parked them until after the theme (list and Claude's picks in HANDOFF section 7, "Next").
- Theme: the user chose 21st.dev "Sage Garden" (light) as the mood, keeping our photos in mind. Mock-up made with an injected stylesheet (screenshots only), then the user approved all of Claude's picks: sage-tinted page #F5F6F1, deep sage #3E5547 buttons and accents, forest #2D3B32 form section, Archivo kept, 4px corners on buttons and fields. Product drawings use `mix-blend-mode: multiply`, so their white backgrounds take the page colour.
- Changed: `site/src/styles/global.css` (tokens, buttons), `InquiryForm.astro` (forest section, field colours, corners), `RangeLineup.astro`, `ProductCard.astro`, product page (multiply on drawings), `Base.astro` (theme colour), `worker/email.js` (sales email in the new colours). Tokens documented in `docs/rebuild/PLAN.md`.
- Tests: `check:site` 55 pages passed; 9 unit tests; 193 browser checks; form check; Lighthouse home, D15131 and contact 100/100/100/100 (one home run read 84, two reruns 100).
- Guides postponed by the user. The user does not need before/after screenshots for routine changes (saves tokens).

## 2026-11-02: Preview zip for Netlify; content plan

- Built a preview zip of `site/dist` (55 pages, noindex header added to the copy only) for the user to drag onto Netlify Drop. The inquiry form does not work there (it needs the Cloudflare Worker); everything else does.
- Added "Getting found faster" and a 14-topic content plan to `docs/rebuild/SEO-GEO-TRACKING.md`, plus the list of what only the client can supply.

## 2026-11-02: All pages built; SEO, GEO and tracking groundwork

- The user asked whether to use their old Cloudflare account. Advice: a new project-only email and accounts, so the whole bundle can be handed to the client (recorded in `site/DEPLOY.md`).
- Re-read all 37 product spec blocks from the 2025 catalog page images and wrote `site/src/data/catalog.ts` from them. The earlier transcription had errors (T93152 size 2400 × 1100 × 2300 mm and width 1000 to 1300 mm). "Swarovski crystal" handles are listed as "Crystal handle" (brand not verifiable); YS09's unclear handle name is left out.
- New pages: `/products/`, 6 layout pages with comparison tables, 42 product pages (spec table, room photos where they exist, related models, inquiry form with the product filled in, DLFC pages with a finish switcher), `/factory/`, `/projects/` (19 photos, including Fuli-folder photos as decided; the name never appears), `/contact/` with 7 FAQs.
- SEO and GEO: Organization on every page, Product, BreadcrumbList, ItemList and FAQPage data; share images; `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`; 301s from the old site's URLs; real 404s. Optional build settings for Cloudflare Web Analytics and Google/Bing verification. Plan in `docs/rebuild/SEO-GEO-TRACKING.md`.
- Images: `prepare_images.py` now also makes DLFC scenes, product room photos, factory and project sets, page 14 renders and 4:5 card crops.
- Tests: `check:site` passes on 55 pages (300 to 850 words each in raw HTML); browser checks 193 passed (9 page types at 390, 768, 1440, 1920 px); form check and 9 unit tests pass; Lighthouse mobile 98 to 100 performance and 100 accessibility, best practices and SEO on 7 page types.

## 2026-10-30: Cloudflare inquiry system built and tested

- Decisions (user): Cloudflare for hosting and inquiries; one email per inquiry (to sales only), with an on-page success panel instead of an email to the buyer; refuse addresses that cannot be used, with a clear message; manual stays off the site; finish within a few days.
- Scanned the team's live site: 18 project photos, 12 from the Fuli folder, never names Fuli or FANLY. User's rule: do the same (photos allowed, names never). Recorded with the original question list in `docs/client-answers-2026-10.md`.
- Built `site/worker/` (Cloudflare Worker): Turnstile check, email checks (format, typo hint, 8,883 throwaway domains, DNS mail check that lets inquiries through if DNS does not answer), D1 save, rate limit 5 per 10 minutes per visitor, branded HTML email to sales via Resend after the reply, result stored per inquiry. `site/migrations/0001_inquiries.sql`, `site/wrangler.jsonc` (Wrangler 4.149.0 pinned), `site/DEPLOY.md`.
- Form rewritten: posts to `/api/inquiry`, errors under the right field, form-level alerts, success panel with reference number, works without JavaScript (303 to /thank-you/). Turnstile loads only near the form.
- Tests: 9 unit tests (`npm test`); real DNS check (gmail, outlook, qq, 163 accepted; example.com and a made-up domain refused); local Worker with curl (valid, typo, throwaway, no-mail domain, bad format, spam trap, no-JS post, rate limit); `scripts/form-check.mjs` in a real browser at 1440 and 390 px; existing HTML and browser checks pass.
- Next: the user sets up Cloudflare and Resend access (`site/DEPLOY.md`), then deploy a preview; meanwhile build the remaining pages.

## 2026-10-30: Client answers; hosting and email options

- The user passed on the client's answers (received by the team on or after 2026-10-15). Saved with a translation in `docs/client-answers-2026-10.md`; HANDOFF section 3 and CLAUDE.md now point to it. Changes: Fuli and Dulifei are not to be linked; C01 to C05 become DLFC01 to DLFC05; catalog specs may be shown; use S26132 and YD62-31; part of the English installation manual may be offered as a download.
- Homepage: the three project photos from the Fuli folder (P0394, P0371, P0366) replaced with P0419, P0361, P0422 (P0424 kept); P0425 prepared as a spare. Hero alt text names DLFC05.
- Installation manual checked: it is an OCR scan of another brand's installation guide, carrying that brand's name, CE declaration and website, plus a personal name in the file properties. Not publishable as it is; raised with the user (details in chat, not in this public repo).
- The user re-shared the Drive link (not committed). All 903 files re-downloaded into `client-materials/`. Fixed: listing paths must not start with `./`.
- The user asked for guidance on hosting (unsure about Netlify vs Hostinger and others) and on a simple, robust inquiry email setup. Options compared in chat; waiting for the user's choice.

## 2026-10-30: Back after a break; status check

- The user was away for a few weeks and asked for a full recap of the project, which was given in chat.
- Checked: the team's repo has no new commits since 2026-09-29 (`a654bef`); the live Railway site and the old Netlify preview both still load.
- The cloud machine was reset: `client-materials/`, `site/node_modules` and the preview files are gone. The repo still has every index and the homepage images. Rebuilding the product pages needs the Drive link again (ask the user; never commit it).
- Still waiting on: the user's OK on the homepage (commit `9f863c9`), then team inputs (contact details, domain, hosting, analytics).

## 2026-10-14: Rebuild started: plan and homepage design

- The user gave the go for the rebuild. Wrote `docs/rebuild/PLAN.md`: pages, product line-up, homepage content, design tokens, tests.
- Found that every page of Dulifei's 2025 catalog is one 3477 x 2268 px image with a clean studio render of each of its 37 products on the same white background. These become the product images, so all product cards will match. Three full-room scenes (T98152, T93152, S88421) come from the same catalog.
- Design change from the handoff: accent is the green of a toughened-glass edge (#2E6B60) instead of brushed brass on warm stone, which is the most common "luxury template" look. Font: Archivo, wide for headings, normal for text.
- Built the homepage in a new `site/` folder (Astro 7.3.5, pinned): hero with "your width / your height" dimension lines and a four-finish switcher (pure CSS radios), layout line-up drawn like an elevation, "What you can specify" (catalog facts only), factory, installed projects, inquiry form (Netlify Forms, spam trap, thank-you page), 404.
- `site/scripts/prepare_images.py` makes the image masters from the client files and writes `site/src/assets/SOURCES.md` (each image traced to its source).
- Tests: `npm run check:site` (raw HTML: title, description, canonical, one h1, no Chinese, no em dashes, alt and sizes on every image) and `site/scripts/browser-check.mjs` (390/768/1440/1920 px, sideways scroll, broken images, small text, font loaded, console errors, finish switcher incl. arrow keys, phone menu, form errors, keyboard focus). All pass. Lighthouse mobile: 100/100/100/100, LCP 1.7 s (live site: 3.6 s).
- Waiting on: the user's OK on the homepage design before building the other pages. Nav links to Products, Factory, Projects and Contact are not built yet.

## 2026-10-14: Every shared client file indexed; rules auto-load

- The user asked that knowledge of all 987 shared items stays available as design context. Added complete indexes in `docs/asset-review/`: `public-materials-inventory.csv` (805 files: 562 reviewed, 82 near-identical, 161 exact copies), `reference-inventory.csv` (98 files; customer folder and file names removed), `catalog-pages-index.csv` (110 pages).
- Added `docs/asset-review/MATERIALS-GUIDE.md`: what each folder is good for, product range and finishes, strongest picks per site section, gaps and do-not-publish rules.
- `CLAUDE.md` now imports `AGENTS.md` and `docs/HANDOFF.md` so both load automatically every session (the new CLAUDE.md had replaced AGENTS.md as the auto-loaded file).

## 2026-10-14: Session memory moved into the repo

- Added `CLAUDE.md` (auto-loaded each session), `docs/HANDOFF.md` (who's who, decisions, plan, materials, environment) and this log, so work no longer depends on chat history.
- Copied the audit into `docs/audit/website-audit-2026-10-12.md` with its three screenshots.
- Moved the Dulifei 2025 catalog specs into `docs/asset-review/dulifei-2025-catalog-specs.md` (team cleared product details on 2026-10-12). Fixed a bug in the earlier export that cut off each finish list after "mirror steel".
- Committed the helper scripts to `scripts/dev/` with a README (Drive download, review prep, catalog rendering, audits, screenshots).
- Commit `8daf71e`. Waiting on: the user's go for the rebuild (plan in HANDOFF section 7).

## 2026-10-12: Audit of the live site; team answers

- The user clarified that the answers and requests came from **the team**, not the client: products all on sale, names our choice, codes are not specs, specs may be shown, no installation manuals, site is for display and lead capture, SEO/GEO is the priority, Fuli treated as associated.
- Audited the live Railway site: raw HTML per URL (737 bytes, 3 words, one title), robots/sitemap/llms (404), soft 404, compression and caching headers, Lighthouse 12 mobile on three pages, font loading, analytics, contact details, and element screenshots.
- Wrote the shared doc "Dulifei Website Audit" (Claude Docs) and corrected its attribution from "client" to "team".
- Proposed the rebuild: Astro + Netlify + Netlify Forms + Search Console/analytics; small page set; homepage design first.

## 2026-10-11 (late): Netlify preview and the user's verdict

- Built the branch, packaged `dist/` with a `_redirects` SPA rule, and sent the zip. The user deployed it via Netlify Drop: https://lively-frangipane-4d8b8a.netlify.app
- The user found the site unprofessional (layout, spacing, fonts, images, copy) and decided on a properly planned rebuild instead of polishing.
- Confirmed the 987 items on Drive = 903 files + 84 folders; nothing was skipped.

## 2026-10-11: Upstream merge, client materials, reviews, design skills, finish switcher

- `a05ac08`: project notes updated with the upstream sync preview.
- `d2f062b`: merged upstream `main` (Resend email form, mobile refinements, `server.mjs`); trial merge, build and endpoints checked first.
- Downloaded `public-materials` (805) and `reference` (98) from the user's Drive into git-ignored `client-materials/`.
- 10 Sonnet agents reviewed all 562 unique, non-duplicate public items, each checked for completeness; top picks spot-checked by hand. `5fc6563`: sanitized results in `docs/asset-review/public-materials-review.csv`.
- 4 Sonnet agents transcribed 110 catalog pages. Only the 2025 small catalog is Dulifei's own; 2020 is FANLY (Fuli). D15131 and S41522 specs hand-verified.
- `ec7a587`: vendored reviewed design skills into `.claude/skills/`; skipped 21st Magic MCP (needs a paid key) and two Taste sub-skills (they instruct inventing data).
- `3133cb0`: notes on intake, review results and open questions.
- `49b8a2a`: homepage finish switcher using the four C05 renders.

## 2026-09-29: Motion and hover work; team ships email

- Team (upstream): `ef423ca` mobile refinements; `808b3b6`, `9b0de0e`, `72f1e18`, `a654bef` contact form via Resend and `server.mjs`.
- `a7e6159`: slow hero zoom, photo swap on hover for three products, and removed `product-02.webp` / `product-16.webp` (uncropped Chinese catalog spreads).

## 2026-09-28

- `f7aa4c5`: scroll fade-ins, spec strip on product pages, gallery hover zoom.

## 2026-09-27

- `7b2fe96`: first full read of the repository and `docs/project-status-summary.md`.

## Before this branch (team, upstream)

- 2026-09-18: `b2767f1` V1 site; `c9c31ff` official logo; `5d717a2` Railway redeploy; `16ac4b6` metadata.
- 2026-09-21: `df0a1ac` V2 product experience (canonical product catalog, product detail pages, duplicate checker).
