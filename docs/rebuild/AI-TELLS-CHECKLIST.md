# Does the site look machine-made? The checklist

As of 2026-11-04. Sites built quickly with AI share a set of habits that visitors, and search and AI tools, notice. This lists them, says which are checked automatically (`node scripts/copy-check.mjs`, part of `npm run check:all`), and which only a person can judge.

## Checked automatically (989 checks; the site passes)

**Words**
- 138 phrases that signal empty or machine-written marketing: "delve", "tapestry", "elevate", "seamless", "unlock", "cutting-edge", "state-of-the-art", "world-class", "premium", "bespoke", "crafted with", "passion for", "dedicated to", "whether you", "not just", "in today's", "look no further", "peace of mind", "high quality", "tailored", "solutions", "innovative", filler such as "really", "very", "simply", "ensure", "enhance", and template leftovers ("lorem ipsum", "your company", "coming soon", "click here", "learn more", "get started", "welcome to").
- Claims we cannot support: "best", "leading manufacturer", "award-winning", "trusted by", "number one".

**Punctuation and typography**
- No em dashes or en dashes, no exclamation marks, no ellipses, no emoji, no semicolons, no double spaces, no space before a comma or full stop, no shouting in capitals, one style of apostrophe.

**Structure**
- One `h1` per page, no skipped heading levels, no repeated headings, section headings in sentence case (product names keep their Title Case on purpose).
- Every page has its own title (70 characters at most) and its own description (50 to 175 characters, cut at a word boundary, never mid-word); picture descriptions never start with "image of", never look like file names, and are not repeated.

**Content**
- Repeated sentences, thin pages and near-copies: every product page must have at least 20% of its own wording, and no two pages may be more than 70% alike. Keyword stuffing (the words "shower" and "enclosure" over 8% of a page).
- No developer comments, debug code, "generator" tag or TODO text in the pages.

**Design**
- No purple or indigo gradients, frosted-glass panels, gradient text, glowing blurred blobs, neon glows, large soft drop shadows, very round corners, label-above-every-heading in capitals, or default template fonts. The site uses one font (Archivo), a sage palette, 4 px corners, no scroll-triggered fade-ins, and animation only where the visitor acts or on the one hero drawing.

## Already covered by other checks
- Pictures with sizes (no layout shift), alt text present, keyboard focus visible on every control, colour contrast, tap size, no sideways scroll: `check:site`, `browser-check`, `sizes-check`, Lighthouse (100 accessibility, best practices and SEO).
- Real 404, canonical links, structured data, sitemap, `robots.txt`, `llms.txt`: `check:site` and `docs/rebuild/SEO-GEO-TRACKING.md`.
- No invented facts: only numbers printed in the client's catalog, shown in `site/src/data/catalog.ts`; nothing about founding year, staff, output or certificates (rule in `AGENTS.md`).

## What the first run found, and what was done (2026-11-04)
- **Developer notes were visible in "view source" on every page** (two HTML comments in the page template). Moved out of the output.
- **A broken sentence on every page's source**: the hidden thank-you panel read "who will reply to . Your reference number is ." until someone sent a form. The sentence is now written only after sending, built from text (never HTML).
- **Unsupported claim**: the home page said aluminium profiles are "measured and drilled". Nothing in the photos shows that; it now says only what the photos show (stored on racks, packed for shipping).
- **Sentences that read badly**: "Bathroom door is a framed glass bathroom door", "Ask about Bathroom door", "Ask about l-shape and t-shape enclosures" (wrongly lowercased). Fixed; products known only by name are now called by name.
- **Near-identical product pages**: six neo-angle models were 17% their own wording, two pairs about 70% the same. Each page now names its own handle and, where it really differs, how it differs from the others in its range (glass, seal, door opening, size range), written only from the printed specifications. Lowest page now 23%, median 49%, most similar pair 58%.
- **Search-result text**: titles up to 95 characters and descriptions up to 300 (cut mid-word) are now 70 and 163 at most, cut at clause boundaries; FAQ, factory and products-overview descriptions tightened.
- **Small wording**: "very different bathrooms", three semicolons, "top" (kept: it is the real name of the top track).

## Only a person can judge (do this once, with the client's facts in hand)
1. **Truth**: every sentence against the client's own information. Anything unconfirmed stays out (OEM/ODM, certificates, factory size, years in business, number of countries, minimum order, lead time, warranty).
2. **Tone**: read the home, factory, contact and FAQ pages aloud. Plain, specific, no sentence that could sit on any other company's site. (Done once on 2026-11-04 for all hand-written copy.)
3. **Pictures**: no stock photos, no faces, no watermarks, nothing that is another brand's. All pictures come from the client's folder, traceable in `site/src/assets/SOURCES.md`.
4. **Sameness**: the six near-identical neo-angle models (D15331 and DR most of all) can only be told apart further with real information from the client: a photo of each, and what each is for.
5. **Repetition**: "Our sales team will reply by email." and similar lines appear on most pages (53). Harmless, but a sign the pages are template-built. Real project stories and product notes from the client are what will make the pages differ.
6. **After any new text**: run `node scripts/copy-check.mjs`. It takes seconds.
