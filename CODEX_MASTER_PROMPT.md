# Dulifei Shower Enclosures

# International English B2B Website --- V1 Master Build Specification

## 1. Mission

Build the first production-quality design version of the Dulifei Shower
Enclosures international B2B website.

This is an overseas customer-acquisition website for a shower enclosure
manufacturer, not a Chinese corporate directory, generic factory
template, consumer e-commerce store, Alibaba-style storefront, or CRM.

Conversion journey: International Buyer → Products → Factory → Projects
→ Certifications → Trust → Get a Quote → Qualified Inquiry

Target visitors: importers, distributors, wholesalers,
bathroom/building-material buyers, developers, contractors, project
buyers, OEM and ODM customers.

The PUBLIC WEBSITE must be 100% ENGLISH. Follow `AGENTS.md` for all
safety, privacy, source-file, language, Git, context and Sub-agent
rules.

## 2. Critical Language Boundary

Public visitor-facing content must be English: navigation, hero,
headings, copy, product labels, buttons, CTAs, forms, messages, footer,
mobile UI, accessibility labels, alt text, SEO metadata, Open Graph,
404/loading/empty states.

Do not build a Chinese or bilingual website in V1.

Chinese local source directory names and filenames are valid and must
remain unchanged.

Original source location: `D:\BaiduNetdiskDownload`

Approved public source directories: -
`client-materials/public-materials/产品认证资料/` -
`client-materials/public-materials/产品图片/` -
`client-materials/public-materials/杜丽菲厂房图片/` -
`client-materials/public-materials/广告条/` -
`client-materials/public-materials/落地案例图片/` -
`client-materials/public-materials/设计图/` -
`client-materials/public-materials/图册/` -
`client-materials/public-materials/shower Enclosures/`

Do not rename original Chinese folders/files. Derived web copies may use
English filenames.

## 3. Material Safety

Only `client-materials/public-materials/` is automatically approved for
public use.

Never publish/import/copy to assets/commit/deploy/reference/expose
metadata from: `client-materials/private-materials/`

Known sensitive file:
`已注册证书-GPSR欧代-中山市杜丽菲卫浴有限公司-2024122020100560527.pdf`

Treat `client-materials/reference/` as private by default. Known
examples: - `2020年图册旧-高端市场.pdf` - `2025酷小白-中端市场.pdf` -
`2025年小图册-高端市场.pdf` - `安装说明书.docx` - patent/trademark
application material - product certification archives -
`郑州客户定制图纸` - ZIP/RAR technical archives - Shower Enclosures
PDF/RAR materials

If a reference file is valuable, report exact path, filename, proposed
use and reason, then wait for explicit approval. Never modify original
customer materials.

## 4. No Fabricated Facts

Do not invent founding year, factory area, employees, capacity, output,
revenue, export count, customer count, MOQ, lead time, dimensions, glass
thickness, hardware material, warranty, certifications, customer/project
names, hotel names, locations, contract values, contact details,
WhatsApp, address, or social accounts.

Avoid unsupported superlatives such as World's No.1, World's leading,
Largest manufacturer, Best manufacturer, Industry leader.

When specifications cannot be verified, use:
`Contact us for specifications.`

## 5. Design Direction

Premium, architectural, international, minimal, refined, modern,
professional, spacious, product-focused, manufacturing-focused.

Quality should come from real product/factory/project photography,
typography, whitespace, composition, grid, scale and spacing.

Avoid traditional Chinese corporate styling, Alibaba styling, cheap
templates, excessive gradients/cards/shadows/icons, SaaS-looking
sections everywhere, fake luxury effects, dense copy, random decoration,
heavy animation and stock-photo-heavy design.

Real client photography is the visual hero. Do not generate fake factory
photography.

## 6. Sitemap

-   `/` Home
-   `/products` Products
-   `/factory` Factory
-   `/projects` Projects
-   `/certifications` Certifications
-   `/about` About Us
-   `/contact` Contact / Get a Quote

## 7. Header

English public navigation: Logo / Home / Products / Factory / Projects /
Certifications / About / Contact Right CTA: `Get a Quote` Mobile
navigation must be clean. Do not invent contact information.

## 8. Homepage

Hero → Product Categories → Why Choose Us → Featured Products →
Manufacturing / Factory → Projects → Certifications → Customization /
OEM & ODM → Inquiry CTA → Footer.

The page must explain what the company makes, why B2B buyers can trust
it, what products/manufacturing capabilities exist, what real evidence
supports credibility, and how to inquire.

## 9. Hero

Preferred source pools: `client-materials/public-materials/产品图片/`
`client-materials/public-materials/shower Enclosures/`

Use real client product photography. Avoid generic stock when suitable
client material exists.

Possible direction: `Premium Shower Enclosures`
`Built for Global Markets`

Primary CTA: `Explore Products` Secondary CTA: `Get a Quote`

Requirements: strong 1440px composition, strong 390px crop, product
visibility, readable minimal copy, architectural feel, priority loading,
no careless layout shift.

## 10. Products

B2B manufacturing, not consumer e-commerce. Do not implement cart,
checkout, online payment, inventory, consumer accounts.

Focus on imagery, supported product families, highlights, applications,
customization, OEM/ODM, inquiry CTA. Never invent SKUs/specifications.

## 11. Factory

Source: `client-materials/public-materials/杜丽菲厂房图片/` About 42
candidates. Curate about 10--15 for Factory and 3--6 for Home. Show real
factory, production environment, manufacturing, equipment and quality
control. Do not invent factory statistics.

## 12. Projects

Only use `client-materials/public-materials/落地案例图片/`. About 70
candidates; curate about 15--25. Do not use reference customer drawings
or `郑州客户定制图纸` without approval.

If names are unknown use neutral labels: - Residential Installation -
Shower Enclosure Project - Custom Bathroom Installation

Never invent client, hotel, country, city, contract amount or project
value.

## 13. Certifications

Only use `client-materials/public-materials/产品认证资料/`. Inspect
actual documents before claims. Possible materials may involve CE, SGCC,
Australian Standards, product/design certifications, but claim only what
the approved documents actually prove. Do not create a raw PDF dump.

## 14. About

Concise international B2B English around professional manufacturing,
product development, quality, customization, OEM/ODM and global B2B
cooperation. No invented history/statistics.

## 15. Contact / Get a Quote

Recommended fields: Name / Company / Country or Region / Email /
WhatsApp / Product Interest / Message

CTA options: Get a Quote / Request Product Catalog / Discuss Your
Project / Contact Our Team

Do not collect unnecessary sensitive information or invent contact
details.

## 16. Asset Curation

Do not put all \~805 approved public candidates into production.

Sub-agent A should curate: Hero 3--5; Products 30--50; Factory 10--15;
Projects 15--25; Certifications only verified public material.

Prioritize resolution, composition, product clarity, international
quality, architectural feel, crop potential and manufacturing
credibility. Avoid duplicates, blur, screenshots, poor composition,
repetitive angles and unsuitable technical material.

## 17. Derived Web Assets

Never modify originals. Create optimized copies adapted to the existing
stack, e.g.: `src/assets/brand/` `src/assets/products/`
`src/assets/factory/` `src/assets/projects/`
`src/assets/certifications/`

Example: SOURCE
`client-materials/public-materials/杜丽菲厂房图片/[中文原始文件名].jpg`
DERIVED `src/assets/factory/dulifei-manufacturing-01.webp`

Maintain source-to-derived traceability where practical.

## 18. Image Performance

Use appropriate resize, compression, WebP, AVIF where supported,
responsive images and lazy loading. Prioritize Hero appropriately. Do
not ship huge originals or over-compress key product imagery.

## 19. UI / UX Design System

Sub-agent C establishes V1 typography, type scale, containers, grid,
spacing, section rhythm, header/navigation, buttons, product
presentation, image ratios, forms, CTA system, footer and responsive
behavior before major implementation.

Do not blindly accept component-library defaults. The site must feel
intentionally designed.

## 20. Animation

Allowed: subtle fade, small translate, hover, restrained gallery
transitions. Avoid heavy parallax, flying text, constant motion,
excessive scroll effects and performance-heavy animation.

## 21. Sub-agent Architecture

Use one Main Agent plus specialized Sub-agents where supported. Multiple
agents must NEVER modify the same file simultaneously.

Main Agent owns architecture, repository inspection, planning,
coordination, file ownership, integration, Git awareness, review, build,
browser validation and final V1 status.

Sub-agent A --- Asset Curator: Analyze only approved public materials;
select Hero/Product/Factory/Project candidates; verify usable public
certifications; identify duplicates/poor assets; preserve exact source
paths; do not modify originals.

Sub-agent B --- B2B Copywriter / Information Architecture: Refine
information architecture; write concise natural international English;
headings; CTA language; evidence-safe manufacturing/product copy; basic
SEO copy. Do not invent facts or write awkward literal translations.

Sub-agent C --- UI/UX Designer: Define visual direction, design system,
homepage composition, responsive behavior, image ratios, section rhythm
and template-like patterns to avoid.

Sub-agent D --- Frontend Developer: After A/B/C review, implement Home
and all V1 routes, curated assets, responsive behavior, inquiry UI and
metadata. Preserve good existing infrastructure and avoid unnecessary
rewrites.

Sub-agent E --- QA / Responsive / SEO: After implementation check
responsive behavior, browser issues, links/images, console/runtime, alt
text, headings, SEO basics, forms, mobile navigation, layout shift,
horizontal overflow, public Chinese-character residue and
material-safety sanity. Classify findings Critical/Major/Minor.

## 22. Parallel Execution

First parallel phase: A Asset Curator + B Copywriter/IA + C UI/UX, where
supported.

After they finish, Main Agent reviews: - no private use - no
unauthorized reference use - no fabricated facts - no unsupported
certification claims - no unnecessary duplicate imagery - English
quality - visual consistency - source traceability

Then establish V1 Homepage Direction. Only then proceed to primary
frontend implementation.

## 23. Implementation Sequence

1.  Inspect existing project and stack.
2.  Read `AGENTS.md` completely.
3.  Check Git status without destructive commands.
4.  Confirm material directories and safety boundaries.
5.  Run A/B/C parallel research where supported.
6.  Review findings and define homepage/design direction.
7.  Establish/refine Design System.
8.  Implement global Header/Footer.
9.  Implement Home.
10. Visually review Home before propagating patterns.
11. Implement Products.
12. Implement Factory.
13. Implement Projects.
14. Implement Certifications.
15. Implement About.
16. Implement Contact.
17. Integrate SEO basics.
18. Run responsive checks.
19. Run Sub-agent E QA.
20. Fix Critical and Major findings.
21. Run production build.
22. Run browser visual QA.
23. Produce required screenshots.
24. STOP before deployment.

## 24. SEO

Include English page titles, meta descriptions, Open Graph, semantic
heading hierarchy, semantic HTML and useful English alt text.

Natural keyword direction: Shower Enclosures / Shower Doors / Bathroom
Enclosures / Custom Shower Enclosures / Shower Enclosure Manufacturer

No keyword stuffing. Do not invent a production canonical URL if final
domain is unconfirmed.

## 25. Responsive Requirements

Validate at minimum: 390px / 768px / 1440px / 1920px

Check Header, mobile menu, Hero, text wrapping, CTAs, product grids,
image crops, galleries, Factory, Projects, Certifications, forms and
Footer.

No horizontal overflow.

## 26. Accessibility / UX Basics

Use semantic HTML, keyboard-accessible controls, visible focus states,
proper form labels, alt text, correct button/link semantics, reasonable
contrast and touch targets.

## 27. Build Validation

Development mode opening is not sufficient.

Run the appropriate production build and resolve: - Build errors -
Broken imports - Missing assets - Runtime-critical errors - Critical
console errors

Do not perform destructive Git operations.

## 28. Browser Visual QA

After a successful build, inspect all V1 pages in a real browser: Home /
Products / Factory / Projects / Certifications / About / Contact

Check desktop and mobile behavior, visual hierarchy, image crops,
spacing, text wrapping, navigation, forms, footer, broken assets,
console errors and public-language compliance.

## 29. English-Only QA

Before screenshots, scan the PUBLIC-FACING implementation for Chinese
characters.

Chinese source paths and internal filenames are allowed. Chinese
visitor-facing UI is not.

Any Chinese visitor-facing text is a bug and must be fixed before V1
review.

## 30. Required V1 Screenshots

Produce: 1. Home --- 1440px 2. Home --- 390px 3. Products 4. Factory 5.
Projects

Use browser screenshots of the actual implementation, not mockups.

## 31. V1 Review Gate --- NO DEPLOYMENT

After the required screenshots are produced:

STOP.

Do NOT: - deploy production - bind a production domain - push a
production release - invent production credentials - make external
publication changes

V1 requires human visual review first.

Continue to deployment only after explicit human approval.

## 32. Completion Report

At the end of V1, return a concise report containing: - pages
completed - key files changed - curated asset summary - build result -
responsive/browser QA result - unresolved Critical/Major/Minor issues -
any reference material awaiting approval - exact screenshot locations -
Git status - confirmation that deployment was NOT performed

Do not repeat the entire project history.

## 33. Decision Rules

Proceed autonomously on normal implementation details.

Pause and ask only when a real human decision is required, such as: -
approval to publicly use a specific `reference` file - an important
company fact cannot be verified but is necessary - a destructive
operation could lose existing work/data - production
deployment/publication is requested or required

Do not pause for routine coding decisions.

## 34. Final Success Criteria

V1 is complete only when: - public website is 100% English - only
approved public material is publicly used - original Chinese source
folders/files remain untouched - no sensitive/private material is
exposed - no unauthorized reference material is exposed - no fabricated
facts are presented - real client imagery drives the design - all seven
V1 routes work - responsive checks cover 390/768/1440/1920 - production
build succeeds - browser QA is completed - required five screenshots are
produced - no deployment has occurred

Begin execution only after reading both this file and `AGENTS.md`
completely.

