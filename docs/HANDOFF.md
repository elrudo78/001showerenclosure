# Handoff: Dulifei website (read this first)

Last updated: 2026-10-14. Keep this file current; log every step in `docs/WORKLOG.md`.

## 1. Who's who

- **The user** (the person Claude works with): member of a small web team. This is the team's first project. They are doing it for portfolio value, as the pay is close to nothing.
- **The team** (the user's teammates, also called "the friend"): built V1/V2 of the site with an AI agent and run it. GitHub upstream: `sherry313/01showerenclosure`. Because the project is unpaid, the team is not invested in quality.
- **The client**: Dulifei (brand DLIFE / 杜丽菲), a shower-enclosure manufacturer in Zhongshan, China, working mainly to custom order.
- The answers in section 3 came from **the team**, not the client. Do not write "the client confirmed" for them.

## 2. What the user wants

A rebuild the team can show in its portfolio: good-looking, simple but solid backend, properly tested, with real SEO and GEO (visibility in Google and in AI answers such as ChatGPT, Claude and Perplexity). Keep scope small and quality high. The user prefers plain-language explanations, short messages and no jargon.

## 3. Team decisions and answers (2026-10-12)

- All products are on sale. Product names are our choice.
- Model numbers are just internal codes, not specifications. The company is mainly custom-order.
- Product details and specs may be shown on the website.
- **Do not put installation manuals on the website.**
- Purpose of the site: display and traffic, so visitors leave their contact details and the sales team follows up. It is not a shop.
- SEO and GEO matter most to the team. They asked the user to "do SEO on the website we sent you", i.e. the current site.
- FANLY / Zhongshan Fuli (福立): treat as associated with Dulifei; photos can be used either way. No formal client answer was received.

These override `AGENTS.md` where they conflict (for example, catalog specs from the `reference` folder may now be used). All other `AGENTS.md` rules still apply: English only, no invented facts, never publish `private-materials`.

## 4. Repositories and sites

| Item | Where |
| --- | --- |
| Our fork (PUBLIC repo) | `elrudo78/001showerenclosure`, work branch `claude/kind-noether-o7pgbu` |
| Team upstream (public) | `sherry313/01showerenclosure`, `main`; added locally as remote `upstream` |
| Live site (team's version) | https://01showerenclosure-production.up.railway.app (Railway, React app + `server.mjs` + Resend email form) |
| Preview of our branch | https://lively-frangipane-4d8b8a.netlify.app (user dragged a build zip onto Netlify Drop, 2026-10-11) |
| Audit (shared doc) | https://claude.ai/artifact/6Y8PtmhGFz7HZFgTdknP9V, copy in `docs/audit/` |

Our branch = upstream `main` (merged at `d2f062b`) + our commits. None of our changes are live.

## 5. Current state of our branch

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

## 7. The rebuild plan (waiting for the user's go)

**Pitch to the team:** "To do the SEO/GEO you asked for, the pages must be rebuilt so search and AI tools can read them. Same content, I'll handle it." Keep the audit as backup evidence.

**Stack (simple, free to run):**
- Astro static site: every page is complete HTML before any JavaScript.
- Netlify hosting (client's own domain later). No Railway, no server to maintain.
- Contact form: custom-designed by us. Netlify Forms delivers each inquiry to the sales team by email and keeps a lead list, with spam filtering, free up to 100 a month. An auto-reply via a small Netlify Function + Resend is optional, later.
- Google Search Console plus free analytics (GA4 or Cloudflare Web Analytics), and a thank-you page so leads can be counted.
- JavaScript only where it helps: mobile menu, finish switcher, gallery, form checks.
- Pinned dependency versions.

**Pages (kept few):** Home, Products overview, one page per product, Factory and Quality, Projects, Contact. About folds into Home and Factory.

**Design direction:** warm, architectural, photo-first "quiet luxury": stone and marble tones, matte black, a brushed-brass accent taken from the product finishes. Two fonts, self-hosted and actually loaded. One spacing scale. Every product image the same ratio and background. One standout interaction: the finish switcher. Avoid AI-template tells (see `.claude/skills/frontend-design/SKILL.md`): no all-caps label above every heading, no arrow on every link, no fade-in on every section, no em dashes in copy, no generic copy.

**Order of work:**
1. Short written plan (sitemap, content per page, design tokens).
2. Homepage design, for the user's OK before anything else.
3. Build all pages, in a new folder on the work branch; the current site stays untouched until the switch.
4. Test rigorously: 390, 768, 1440 and 1920 px; keyboard; contrast; Lighthouse; raw-HTML word count per page; no Chinese text; no em dashes; links; form.
5. Netlify preview link for the user.
6. Team OK.
7. Go live.
8. SEO and GEO: Search Console, sitemap, Organization and Product structured data, llms.txt, per-product content.

**Inputs still needed from the team or client:** contact details to show (phone, WhatsApp, email, address; the catalog cover has a tel/fax but it has not been cleared), the client's domain, and confirmation of hosting.

## 8. Client materials

- Source: a Google Drive folder the user shared in chat on 2026-10-11. **Never commit the link**: this repo is public and `reference` contains personal data. Ask the user for it if needed.
- Local copies live in the git-ignored `client-materials/` and are lost when the cloud container resets. Re-download with `scripts/dev/drive_*.py` (see `scripts/dev/README.md`).
- `public-materials`: 805 files = 644 unique (`图册/设计图` is an exact copy of `设计图`). Drive shows 987 because it also counts 84 folders; `private-materials` (4 files) was removed by the user.
- Review of every file: `docs/asset-review/public-materials-review.csv` (score, best use, crop notes, do-not-publish flag).
- Best material: C01 to C05 renders (2643 to 3840 px, four finishes each), real installed photos (review ids P0394, P0382, P0413, P0408), factory photos.
- Do not publish:
  - FANLY title-block drawings with customer, designer or company contact details;
  - photos with watermarks (FANLY, OPPO, HONOR);
  - photos with identifiable faces or licence plates;
  - third-party glass-supplier certificates (one 3C certificate expired 2023);
  - banners with unverified claims (factory size, staff count, "leading manufacturer").
- Specs: `docs/asset-review/dulifei-2025-catalog-specs.md`, 37 products from Dulifei's own 2025 catalog. D15131 and S41522 were hand-verified; check other figures against the page before publishing.
- Other catalogs in `reference`: 2020 catalog = FANLY; 酷小白 = GUXBAI (another brand); 美国市场大吊轮款 and 财业五金 = supplier catalogs. The English installation manual exists but must not go on the site.

## 9. Working environment notes

- See `scripts/dev/README.md` for: re-downloading materials, headless browser testing through the agent proxy (SPKI pin, read from the environment), Lighthouse, and known gotchas (smooth scrolling in tests, `pkill` killing its own shell).
- Design skills are vendored in `.claude/skills/` (reviewed, pinned; README there). `AGENTS.md` and section 3 above override any skill.
- Commit and push after each meaningful step to `claude/kind-noether-o7pgbu`. Never commit `client-materials/`, the Drive link, or personal names and contacts.
