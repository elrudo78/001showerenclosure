# Work log

Newest first. After each meaningful step, add an entry: date, what changed and why, files, commit. Keep entries short; put lasting decisions in `docs/HANDOFF.md`.

## 2026-10-14: Session memory moved into the repo

- Added `CLAUDE.md` (auto-loaded each session), `docs/HANDOFF.md` (who's who, decisions, plan, materials, environment) and this log, so work no longer depends on chat history.
- Copied the audit into `docs/audit/website-audit-2026-10-12.md` with its three screenshots.
- Moved the Dulifei 2025 catalog specs into `docs/asset-review/dulifei-2025-catalog-specs.md` (team cleared product details on 2026-10-12). Fixed a bug in the earlier export that cut off each finish list after "mirror steel".
- Committed the helper scripts to `scripts/dev/` with a README (Drive download, review prep, catalog rendering, audits, screenshots).
- Waiting on: the user's go for the rebuild (plan in HANDOFF section 7).

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
