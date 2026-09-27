# Project Status Summary — Dulifei Shower Enclosures B2B Website

Compiled after reading every tracked file in the repository (`AGENTS.md`, `CODEX_MASTER_PROMPT.md`, `docs/`, `src/`, `scripts/`, config files, and git history) to establish a shared starting point before further contribution.

## 1. What this project is

An international, English-only B2B marketing website for **Dulifei Shower Enclosures**, a Chinese shower-enclosure manufacturer, aimed at overseas importers, distributors, wholesalers, developers, contractors, and OEM/ODM buyers. It is explicitly **not** a CRM, WhatsApp tool, or tracking system (see `AGENTS.md` §1) — those are separate, out-of-scope projects.

Two governing documents drive the work:
- `AGENTS.md` — the durable project rules (language boundary, material safety, no-fabrication policy, sub-agent roles, deployment gate).
- `CODEX_MASTER_PROMPT.md` — the original V1 build specification (sitemap, page-by-page content requirements, design direction, screenshot/QA gate).

## 2. Git history so far

On branch `claude/kind-noether-o7pgbu` (also mirrored on `main`), 5 commits:

1. `b2767f1` — Build Dulifei international B2B website V1
2. `c9c31ff` — Use official Dulifei logo across site
3. `5d717a2` — Trigger Railway redeploy for logo update
4. `16ac4b6` — Add website application metadata
5. `df0a1ac` — feat: complete Dulifei V2 product experience

So the site has gone through a V1 build and a V2 product-catalog overhaul. A Railway redeploy was triggered at some point (commit `5d717a2`), suggesting the site has been deployed at least once outside this repo's own "do not deploy" gate — worth confirming current live status before doing anything deployment-related.

## 3. Tech stack

- React + TypeScript + Vite (`vite.config.ts`, `tsconfig*.json`)
- React Router (`react-router-dom`) for client-side routing
- No CSS framework — a single hand-written `src/styles.css` (207 lines)
- No test runner configured; the only automated check is a custom Node validation script
- `npm run build` = `tsc -b && vite build`, gated by `npm run validate:products` (runs on `predev` and `prebuild`)

## 4. Repository structure (tracked files only)

```
AGENTS.md, CODEX_MASTER_PROMPT.md      — project rules & original spec
docs/
  asset-source-map.md                  — maps every derived web asset back to its original client file
  product-architecture-v2.md           — full product/category audit (sections A–O)
  project-status-summary.md            — this file
index.html, package.json, vite.config.ts, tsconfig*.json
scripts/validate-product-catalog.mjs   — CI-style guard against duplicate/legacy product records
src/
  App.tsx (418 lines)                  — entire app: routing, all 7 pages, product detail template
  main.tsx, styles.css, vite-env.d.ts
  data/product-catalog.json            — canonical list of 10 products (single source of truth)
  assets/{brand,hero,products,product-details,factory,projects,certifications}/  — 80 derived .webp/.png files
```

Note: `client-materials/` (the classified original source pool described in `AGENTS.md` §4–7) is **not present in this checkout** — it's fully git-ignored (`.gitignore` excludes `public-materials/`, `private-materials/`, and `reference/`). All work so far has operated on that material in a prior session and left only derived, English-safe assets under `src/assets/` plus the traceability docs. Anyone contributing further will need that original material available locally to curate more assets, per `AGENTS.md` §3.

## 5. What's implemented (routes)

All 7 sitemap routes from `CODEX_MASTER_PROMPT.md` §6 exist in `src/App.tsx`:

- `/` Home — hero, 3 category cards, "why choose us" principles, featured products, factory teaser, project preview, certifications teaser, OEM/ODM CTA
- `/products` — category strip + full portfolio grid (confirmed products only)
- `/products/:category/:product` — dynamic product detail page (gallery, features, applications, related products, quote CTA) — currently has hard-coded detail content (`productDetails` map) for the 7 CONFIRMED products
- `/factory` — 12 curated factory images
- `/projects` — 18 curated project images, generic captions (no invented client/location names, per the no-fabrication rule)
- `/certifications` — 3 supplier documents (SGCC, AS/NZS 2208, EN 12150), explicitly framed as supplier documentation, not corporate certification claims
- `/about` — evidence-free B2B narrative copy, no invented history/stats
- `/contact` — inquiry form (Name/Company/Region/Email/WhatsApp/Product Interest/Message) with client-side validation; **no real submission endpoint** — submitting shows a "not sent, no contact endpoint configured" message
- `*` → 404 page

SEO: per-route `<title>` + meta description + OG tags via a `pageMeta` map and a `Seo` component; product detail pages get product-specific metadata.

## 6. Product data model

`src/data/product-catalog.json` holds **10 canonical product records**, each with `id`, `model`, `name`, `status` (`CONFIRMED` | `NEEDS_CONFIRMATION`), `category`, `sourceGroup`/`originalSource` (traceability back to the original Chinese file), `primaryDerivedAsset`, `detailUrl`, `featured`.

- **7 CONFIRMED** products have full detail pages: D15131, S1908-22, S41122, S41522, S89022, YR03-42, Fixed Shower Screen Family.
- **3 NEEDS_CONFIRMATION** products (Straight Sliding Door / 新款60, DD33-YD62-31, DS19-S26132) are shown as portfolio-style records with no public detail URL, pending a human-confirmed canonical model code/name (see `docs/product-architecture-v2.md` §I and §N).

`scripts/validate-product-catalog.mjs` is a regression guard (not a general test suite) that fails the build if: legacy per-page product arrays reappear, known placeholder names come back, duplicate IDs/URLs/assets/source-groups appear, or a NEEDS_CONFIRMATION record gets a formal detail URL. This is the mechanism that prevented duplicate product cards after a documented "global product rendering deduplication" cleanup (`product-architecture-v2.md` §N).

## 7. Asset & material-safety status

- 80 derived `.webp`/`.png` files exist under `src/assets/`, each traceable to an original file via `docs/asset-source-map.md`.
- Only `client-materials/public-materials/` was ever used as a source (per `AGENTS.md` §5); `private-materials/` (4 files, contains identity documents and a GPSR registration certificate) and `reference/` (98 files) were never touched, per the audit notes in `product-architecture-v2.md`.
- Curated so far: 1 hero image, 20 product images (10 canonical + alternates), ~13 product-detail crops, 12 of ~42 factory candidates, 18 of ~70 project candidates, 3 of ~7 certification files. This is well within `CODEX_MASTER_PROMPT.md`'s suggested curation ranges but leaves headroom (e.g., only 3 of the ~805 approved public-materials pool's certification files, and none yet from `图册/`, `设计图/`, or `广告条/`).

## 8. Known open items (need a human decision, not just more coding)

These are explicitly flagged as unresolved in `docs/product-architecture-v2.md` and block further product-catalog growth:

1. Canonical public code: **DD33 vs YD62-31**.
2. Canonical public code: **DS19 vs S26132**.
3. Stable public name/code for the **新款60** ("new style 60") product before it can get a URL.
4. Whether **YD63-31** is an independent product or a variant/duplicate of D15131.
5. Identity/completeness of **DD34 / D82031** before it can join the canonical set.
6. Whether embedded Chinese catalog text in some source crops needs to be removed (policy says yes, but each image needs checking).
7. Product-specific specifications (dimensions, glass thickness, hardware materials, etc.) — none are available; every page correctly falls back to "Contact us for specifications."

## 9. Not yet done

- No live contact-form backend/integration — form is decorative only.
- No automated test suite (unit/e2e) — only the catalog-consistency script.
- No `README.md` at the repo root.
- V1's required QA artifacts (production build confirmation, responsive checks at 390/768/1440/1920, browser QA screenshots) aren't present as committed files in this checkout — unclear whether they were produced and discarded, or done in a prior session outside git tracking.
- Per `AGENTS.md` §12, **production deployment must wait for explicit human approval** — the earlier "Trigger Railway redeploy" commit suggests a deploy pipeline exists, so current live-deployment status should be confirmed with the project owner before touching it.

## 10. Suggested next steps for contributing

- Confirm current live/deployment state before any further Railway-related changes.
- If more products are wanted: resolve the open naming questions in §8 with the client, then extend `product-catalog.json` (the validator will keep it consistent).
- If more visual variety is wanted: curate additional assets from the remaining public-materials pool (`图册/`, `设计图/`, `广告条/`, more of `落地案例图片/` and `产品认证资料/`), following the existing derive-and-map pattern in `docs/asset-source-map.md`.
- Wire up a real contact-form submission path (email service, form backend, or CRM handoff) — currently explicitly stubbed out.
- Consider adding a root `README.md` and a minimal automated test/lint step for future contributors.
