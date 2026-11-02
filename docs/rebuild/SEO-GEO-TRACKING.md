# Search, AI answers and tracking: the plan

As of 2026-11-02. SEO means showing up in Google and Bing. GEO means being found and quoted by AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot). Tracking means knowing how many people come and how many leave an inquiry.

## Already built into the site

| What | Why it matters | Where |
| --- | --- | --- |
| Every page is finished HTML, 300 to 850 real words each | Google and AI crawlers read it without running scripts (the old site showed them 3 words) | All pages |
| Own title and description per page, canonical links, social preview image | Each page can rank and be shared on its own | `src/layouts/Base.astro` |
| 42 product pages with the printed specs, 6 layout pages with comparison tables | Buyers search for exact things ("neo-angle shower enclosure 1100 x 1100", "10 mm sliding shower door"); specs are what AI assistants quote | `src/data/catalog.ts` |
| Structured data: Organization, Product (with every spec), BreadcrumbList, FAQPage, ItemList | Machines read facts directly instead of guessing | Each page |
| `sitemap.xml`, `robots.txt` (crawlers welcome) | Search engines find every page | Generated at build |
| `llms.txt` and `llms-full.txt` | A plain-text summary and the full spec list for AI tools | Generated at build |
| FAQ with seven factual answers | Questions buyers ask AI assistants, answered with catalog facts | `/contact/`, `src/data/faq.ts` |
| Real 404 for unknown pages, 301 redirects from the old site's URLs | No "soft 404" penalty; old links keep working | `public/_redirects` |
| Fast pages (Lighthouse 98 to 100, main content in about 1.5 s on a phone) | Speed is a ranking signal and keeps visitors | Whole site |

## At launch (needs the client's domain)

1. **Set `SITE_URL`** to the real address and rebuild, so canonical links, the sitemap and `llms.txt` point at it.
2. **Google Search Console**: add the domain (DNS check in Cloudflare, or set `PUBLIC_GOOGLE_SITE_VERIFICATION`), submit `sitemap.xml`.
3. **Bing Webmaster Tools**: import from Search Console, submit the sitemap. ChatGPT search and Copilot draw on Bing's index, so this matters for GEO as much as Google does.
4. **Cloudflare Web Analytics**: free, no cookies, so no cookie banner is needed. Turn it on for the domain in the Cloudflare dashboard, or set `PUBLIC_CF_ANALYTICS_TOKEN`.
5. **Leads**: every inquiry is saved in the D1 database with its page, so the real number of leads, and which pages bring them, is always known. GA4 is optional and would need a cookie banner for visitors from Europe.

## The first three months

- Check Search Console every two weeks: which searches show the site, which pages get clicks. Improve titles and intros for pages that show but do not get clicked.
- Watch referrers in Cloudflare Web Analytics for `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com` and `gemini.google.com`: visits from AI answers.
- Ask the client for what only they can give, and add it: contact details (phone, WhatsApp, email, address), real project stories (country, building type, quantity), certificates that are their own, MOQ and lead times. Each one makes the site more trustworthy to buyers and to AI tools.
- Get the site linked from places buyers and AI tools already trust: the client's B2B marketplace profiles (Alibaba, Made-in-China and similar), trade fair listings, LinkedIn. Mentions on other sites are a large part of what makes AI assistants recommend a company.

## Getting found faster

- At launch, in Google Search Console: submit the sitemap, then "Request indexing" for the home page, `/products/` and the six layout pages (Google allows a handful of requests a day).
- Bing Webmaster Tools plus IndexNow: IndexNow tells Bing (which feeds ChatGPT search and Copilot) about new or changed pages within minutes. A key file and a ping after each deploy can be added to the site.
- Every place the client already has a presence should link to the site: B2B marketplace profiles, LinkedIn, Facebook, YouTube, trade fair listings, catalogs (print the web address), email signatures, WhatsApp Business profile.
- Short product videos on YouTube with the product page linked in the description (the client's material has a few; avoid the ones showing people's faces).

## Content plan

Articles answer the questions buyers type into Google and ask AI assistants. Each one links to the matching layout and product pages. Write only facts we can support; general how-to knowledge is fine.

**Buying guides (we can write these from the catalog):**
1. How to measure a shower opening for a made-to-measure enclosure
2. Sliding, pivot or hinged: choosing a shower door for a project
3. What is a neo-angle (diamond) shower enclosure, and what sizes fit
4. 8 mm or 10 mm, clear or extra-clear: choosing shower enclosure glass
5. Shower enclosure frame finishes explained (mirror steel, brushed gold, matte black and more)
6. Magnetic strip or rubber seal: what keeps water in
7. Standard and custom sizes: a table of every model's range
8. L-shape and T-shape enclosures for larger bathrooms and hotel rooms
9. Panoramic sliding systems as glass room dividers
10. A glossary of shower enclosure terms (pivot, hinge, return panel, top track, soft-close)

**For importers and project buyers:**
11. What to send a manufacturer for an accurate quote
12. Questions to ask a shower enclosure factory before ordering
13. How glass shower enclosures are packed for export (with the factory photos)
14. Specifying shower enclosures for hotel and apartment projects

**Only the client can supply (the most valuable content):**
- Real project stories: country, type of building, quantity, model, a photo
- Company facts: founding year, factory size, staff, output, export countries, MOQ, lead time, warranty
- Their own certificates and test reports
- Installation and product videos, trade fair photos, customer quotes

Pace: four to six guides at launch, then two a month. Each article needs one real photo and links to two or three product pages.

## Honest expectations

Google and AI tools take weeks to months to pick up a new site. The technical base is complete; what grows results from here is time, the client's real information, and links from other sites.
