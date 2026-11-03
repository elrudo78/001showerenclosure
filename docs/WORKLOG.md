# Work log

Newest first. After each meaningful step, add an entry: date, what changed and why, files, commit. Keep entries short; put lasting decisions in `docs/HANDOFF.md`.

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
