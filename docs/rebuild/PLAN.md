# Rebuild plan

As of 2026-10-14. Step 1 of the order of work in `docs/HANDOFF.md` section 7. The homepage design (step 2) follows this plan and needs the user's OK before the other pages are built.

## Goal

A small, fast site that search engines and AI tools can read in full, which gets overseas buyers to send their sizes and contact details. Built with real client material only.

## Tech

| Part | Choice |
| --- | --- |
| Site | Astro 7.3.5 (pinned), static output. Every page is finished HTML before any JavaScript runs. Lives in `site/`; the team's current app stays untouched until the switch. |
| Images | Astro's built-in image tools (sharp): AVIF and WebP in several sizes, width and height always set, lazy loading below the fold. |
| Fonts | Archivo (variable, width and weight axes), self-hosted from `@fontsource-variable/archivo`, preloaded. |
| Hosting | Netlify. Publish folder `site/dist`. Client's own domain later. |
| Form | Netlify Forms with a spam trap; success goes to `/thank-you/` so leads can be counted. Optional auto-reply later. |
| Analytics | Cloudflare Web Analytics or GA4, decided with the team. Plus Google Search Console. |
| JavaScript | Only for the finish switcher, the mobile menu and form checks. No framework on the client. |

## Pages

| URL | Purpose | Main content |
| --- | --- | --- |
| `/` | First impression, route to products, capture leads | Hero with finish switcher, the range by layout, what buyers can specify, factory, installed projects, inquiry form |
| `/products/` | Whole range at a glance | All products grouped by layout, same image style |
| `/products/<layout>/` | One page per layout (sliding, neo-angle, pivot, L and T, panoramic) | Intro, products in that layout, shared options |
| `/products/<layout>/<product>/` | One page per product | Studio image, room photo where one exists, catalog specifications, options, inquiry form with the product filled in |
| `/factory/` | Trust | Factory photos with true captions, what is made in house as the photos show it |
| `/projects/` | Proof | Real installations, captioned by what each photo shows |
| `/contact/` | Lead capture | Form, contact details once cleared |
| `/thank-you/` | Counted conversion | Confirmation and next step |
| `/404` | Real not-found page | Links back to products |

Plus `robots.txt`, `sitemap.xml`, `llms.txt`, Organization and Product structured data, one social image per page.

## Products

Source of truth: Dulifei's 2025 catalog (`reference/2025年小图册-高端市场.pdf`). Every page is one 3477 x 2268 px image, and every product has a studio render on the same white background (about 900 px tall). These become the product images, so every card matches. Specs come from `docs/asset-review/dulifei-2025-catalog-specs.md`, and each figure is checked against the page before it goes live.

| Layout | Catalog products | Room photos available (`产品图片`, `落地案例图片`) |
| --- | --- | --- |
| Sliding doors | S88421, S86821, full-frame bottom roller, S68722, C52, S88822, Fandu 60, S68422, YS09, S1912, S41522, S41922, S26632, S26132, FHL (15) | S26132 (P0275), S41522 (P0291), S68422, plus real installations |
| Neo-angle (diamond) | D15331, D12531, DR, D15231, D15131, YD63, DB, HD, D81231, D54131, S82431 (11) | D15131 (P0253), YD63 (P0304, P0305), P0364, P0424 |
| Pivot and hinged, straight | S98231, S12231, S93021, S93031 (4) | P0366, P0367, P0385 |
| L-shape and T-shape | L99131, L15431, T98152, T93152 (4) | P0361, P0371 |
| Panoramic sliding | S890, single track (2) | none |
| Bathroom door | 1 | none |

Products named in the catalog only by a Chinese title get plain English names we choose (team: names are our choice). Model codes appear as codes, never as specifications.

Products with photos but not in the 2025 catalog (S41122, S89022, S1908-22, YR03-42 curved, DS20 walk-in, DD33, DD34, 60 series) can be added later with "Contact us for specifications".

## Homepage content

1. **Hero.** Headline about made-to-measure shower enclosures. The C05 render (P0136 to P0139, same scene in four finishes) with thin dimension lines marked "your width" and "your height". Four finish buttons switch the frame finish. Buttons: Request a quote, See the range.
2. **The range by layout.** The catalog renders standing side by side like an architectural elevation, one per layout, each linking to its layout page.
3. **What you can specify.** Facts printed in the catalog: layout (straight, L, T, diamond), size within each model's custom range, glass (8 mm or 10 mm clear, 10 mm extra-clear, laminated for bathroom doors), frame finish, handle, seal, door opening.
4. **Factory.** Glass edge macro (P0326), profile racks (P0351), packing line (P0348), cartons (P0345). No faces, no Chinese banners.
5. **Installed projects.** P0394, P0382, P0424, P0371, P0366, P0408, captioned by what each shows.
6. **Inquiry form.** Name, email, country, company (optional), what you need, sizes (optional), with a spam trap.

No invented facts: no founding year, staff, factory size, output, export countries, MOQ, lead time or warranty until the client supplies them.

## Design

**Direction.** The site should feel like the product: precise aluminium profiles, clear glass, white bathrooms. Calm, technical, photo-first.

**Change from the handoff.** The handoff suggested a brushed-brass accent on warm stone. Warm stone with a gold accent is the most common "luxury" template look, and gold is only one of the four finishes. The accent is now the green you see on the edge of toughened glass (factory photo P0326): it belongs only to this subject, and it reads as glass on a white page.

| Token | Value | Use |
| --- | --- | --- |
| `--white` | #FFFFFF | Page, matches the catalog renders |
| `--stone` | #EEEFEC | Alternate bands, image placeholders |
| `--ink` | #1F2124 | Text, buttons; the matte-black frame |
| `--graphite` | #5A5E62 | Secondary text (6.4:1 on white) |
| `--glass` | #2E6B60 | Accent: dimension lines, links, focus, selected finish (6.2:1 on white) |
| `--glass-tint` | #DDE9E5 | Selected states, quiet highlights |

**Type.** One family, two widths: Archivo expanded (width 115, weight 560) for headings, Archivo normal (width 100, weight 400) for text. Tabular numbers for sizes. Scale 1.25: 14, 17, 21, 26, 33, 41, 52, 65 px. Body 17 px, line height 1.6, lines under 70 characters. Sentence case everywhere.

**Spacing.** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Content width 1320 px, 16 px side margin on phones, 32 px on desktop. Text left-aligned.

**One standout element.** The dimension lines: they draw once when the page loads and repeat as a quiet motif (product pages show real catalog ranges on the same lines). Everything else stays still. Motion only answers a click (finish switch) and is off for people who ask for reduced motion.

**Avoid.** All-caps labels, a label above every heading, arrows on every link, fade-in on every section, identical rounded cards with soft shadows, em dashes, generic copy.

## Testing before calling anything done

- Widths 390, 768, 1440 and 1920 px; no sideways scrolling.
- Keyboard only: every link, button and form field reachable, visible focus.
- Contrast at least 4.5:1 for text.
- Lighthouse mobile: performance 95 or more, main content under 2.5 s.
- Raw HTML per page: own title, description, canonical, real word count (checked without JavaScript).
- No Chinese characters, no em dashes, no broken links, no missing alt text in the built site.
- Form: required fields, error messages, spam trap, thank-you page.

## Open inputs

- Contact details to show (phone, WhatsApp, email, address). Not cleared yet, so the homepage design leaves them out.
- The client's domain, and hosting confirmed with the team.
