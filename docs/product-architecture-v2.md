# Dulifei Website V2 — Product Architecture Audit

Audit date: 2026-09-19  
Scope: approved files under `client-materials/public-materials/` only  
Status: Phase 1 architecture audit; no product detail pages were created

## Executive Summary

- Recommended public product categories: **3**
- Evidence-supported product families: **4**
- Named candidate products/series: **19**
- READY: **13**
- PARTIAL: **6**
- INSUFFICIENT: **1 legacy material pool** (not counted as a named product)
- Exact SHA-256 duplicate groups found: **26** (52 files)

`READY` means the approved public source pool contains enough coherent imagery for a high-quality individual page. It does not mean that specifications, marketing names, current-sale status, or public model codes have been verified.

## Audit Boundaries and Method

Primary sources:

- `client-materials/public-materials/产品图片/`
- `client-materials/public-materials/shower Enclosures/`

Supporting sources were permitted from `图册/` and `设计图/`, but were not required to determine the recommended first-batch architecture.

The audit used source directory structure, filenames, visible product geometry, full-product views, detail views, videos, finish variants, and SHA-256 duplicate detection. Original files were not renamed, moved, edited, converted, or overwritten. `private-materials/` and `reference/` were not accessed.

## A. Recommended Product Categories

### 1. Sliding Shower Doors

Proposed URL: `/products/sliding-shower-doors`

Supported by straight/alcove products with visually evident rails, rollers, or sliding panels. This category contains the largest coherent group of current named source folders.

### 2. Corner Shower Enclosures

Proposed URL: `/products/corner-shower-enclosures`

Supported by polygonal/neo-angle and curved/quadrant corner configurations. These should remain one stable public category initially, with the two forms represented as product families rather than thin SEO category pages.

### 3. Fixed Shower Screens

Proposed URL: `/products/fixed-shower-screens`

Supported by the explicitly named `DS20（单固玻）` source folder and visible single-panel installations. The current material is suitable for category/family presentation but not yet a strong individual detail page.

Do not add a separate `Hinged Shower Doors` category until the opening mechanisms are verified from approved product-specific material. Finish, frame color, glass appearance, alcove placement, and similar attributes should be filters or page content—not standalone categories.

## B. Product Families

| Product family | Parent category | Evidence-supported candidates | Notes |
|---|---|---|---|
| Straight / Alcove Sliding Systems | Sliding Shower Doors | C01–C05, 新款60, DS18/S41422, DS19/S26132, S1908-22, S41122, S41522, S68422, S89022 | Finish and hardware images belong to the same product gallery. |
| Neo-Angle / Polygon Corner Enclosures | Corner Shower Enclosures | D15131, DD33/YD62-31, DD34/D82031, YD63-31 | Similar geometry does not prove identical products. Do not merge without confirmation. |
| Curved / Quadrant Corner Enclosures | Corner Shower Enclosures | YR03-42 | Curved front and paired door geometry are visually clear. |
| Fixed Screens / Walk-In Panels | Fixed Shower Screens | DS20（单固玻） | Product identity is clear, but gallery consistency and detail coverage are incomplete. |

## C. Candidate Individual Products

### READY — 13

| Candidate | Proposed English product name | Category | Proposed URL | Evidence summary |
|---|---|---|---|---|
| C01 | C01 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/c01-sliding-shower-door` | 4 main finish views plus extensive finish-specific component details. |
| C02 | C02 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/c02-sliding-shower-door` | 5 full scene renders plus four finish/detail groups. |
| C03 | C03 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/c03-sliding-shower-door` | 4 main finish views plus extensive detail groups. |
| C04 | C04 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/c04-sliding-shower-door` | 4 main finish views, rail breakdown views, and component groups. |
| C05 | C05 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/c05-sliding-shower-door` | 8 full/focus finish views plus four component groups. |
| 新款60 | Sliding Shower Door (source label: 新款60) | Sliding Shower Doors | **Hold pending a verified public product code/name** | One high-resolution full scene plus 3 high-resolution structural/detail views. |
| D15131 | D15131 Corner Shower Enclosure | Corner Shower Enclosures | `/products/corner-shower-enclosures/d15131-corner-shower-enclosure` | Full-product scenes, presentation/detail views, and video. |
| DD33 / YD62-31 | DD33 / YD62-31 Corner Shower Enclosure | Corner Shower Enclosures | **Choose one canonical code before URL launch** | Complete installed and rendered views plus handle, bottom-track, and upper details. |
| S1908-22 | S1908-22 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s1908-22-sliding-shower-door` | Full scene and mechanism/detail presentation; public crops must remove embedded Chinese copy. |
| S41122 | S41122 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s41122-sliding-shower-door` | High-resolution render, installed view, and roller/hardware details. |
| S41522 | S41522 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s41522-sliding-shower-door` | Full installed/rendered views, track/roller/handle details, and video. |
| S89022 | S89022 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s89022-sliding-shower-door` | Full scene, handle/track details, and video; public crops must remove embedded Chinese copy. |
| YR03-42 | YR03-42 Quadrant Shower Enclosure | Corner Shower Enclosures | `/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure` | Complete curved enclosure scene plus structure/handle details. |

### PARTIAL — 6

| Candidate | Likely placement | Why it is not READY | Required next evidence |
|---|---|---|---|
| DD34 / D82031 | Corner Shower Enclosures | Only one small complete image; remaining files are hardware/track details. | Additional high-resolution complete views and confirmation of canonical code. |
| DS18 / S41422 | Sliding Shower Doors | Only one reasonably complete installed view; remaining images are isolated details. | At least 2–3 additional coherent full-product views. |
| DS19 / S26132 | Sliding Shower Doors | One strong full render, but supporting site images vary in quality and include prominent Chinese environmental text. | Clean alternate full view and clearer product-specific details; canonical code confirmation. |
| DS20（单固玻） | Fixed Shower Screens | Four application images, but two are only 800×800 and the visible hardware/configuration is not consistent enough to prove one exact product. | Confirm whether the images are one model or a family; add coherent connection/hardware details. |
| S68422 | Sliding Shower Doors | Complete view exists, but most supporting detail images are very low resolution. | Higher-resolution details and an additional complete view. |
| YD63-31 | Corner Shower Enclosures | Only two modest-resolution renders and no product-specific details; geometry is highly similar to D15131. | Confirm whether it is independent from D15131 and provide detail/alternate views. |

### INSUFFICIENT — 1 Legacy Pool

`client-materials/public-materials/shower Enclosures/老款产品图册-低端市场/`

- 182 files resolve to approximately 93 numbered image groups.
- Most groups contain a normal and `hi_*` version of the same catalog image, not two products.
- The files do not provide reliable current model names, codes, or folder-level product grouping.
- These images must not be converted into individual products or SEO URLs until the client provides a current-product and model-code mapping.

## D. Status Rules for Future Audits

### READY

- Reliable product/family identity from approved public materials.
- Preferably at least 4 genuinely distinct useful views: full product, alternate view, detail, and contextual/installed view.
- Repeated crops, finish recolors, or exact duplicate components do not increase the evidence count.

### PARTIAL

- Product can be recognized, but the gallery, naming, resolution, or same-product consistency is incomplete.
- Keep it on a category/family page until the missing evidence is supplied.

### INSUFFICIENT

- Cannot reliably identify or separate an individual product.
- Do not create an indexable detail page or permanent product URL.

## E. Source Material Mapping

All paths below are exact approved public source paths. “Detail directories” means the files remain part of the same product gallery; they are not separate products.

### C01

- Path: `client-materials/public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/C01最终效果/`
- Main files: `镜光-主图.png`, `拉丝金-主图.jpg`, `拉丝银-主图.jpg`, `雅黑-主图.jpg`
- Detail directories: `镜光-配件细节图/`, `拉丝金-配件细节图/`, `拉丝银-配件细节图/`, `雅黑-配件细节图/`

### C02

- Path: `client-materials/public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/C02完成效果/`
- Main files: `12.png`, `Enscape_2025-02-27-11-20-37.png`, `Enscape_2025-02-27-13-42-10.png`, `Enscape_2025-02-27-13-43-55.png`, `Enscape_2025-02-27-13-44-52.png`
- Detail directories: `镜光/`, `拉丝金/`, `拉丝银/`, `雅黑/`

### C03

- Path: `client-materials/public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/C03完成效果/`
- Main files: `镜光.jpg`, `拉丝金.jpg`, `拉丝银.jpg`, `雅黑.png`
- Detail directories: `镜光/`, `拉丝金/`, `拉丝银/`, `雅黑/`

### C04

- Path: `client-materials/public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/C04最终效果/`
- Main files: `镜光.jpg`, `拉丝金.jpg`, `拉丝银.jpg`, `雅黑.jpg`, `导轨剖解.png`, `导轨剖解2.png`
- Detail directories: `配件：镜光/`, `配件：拉丝/`, `配件：拉丝金/`, `配件：雅黑/`

### C05

- Path: `client-materials/public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/C05完成效果/完成稿/`
- Main files: `镜光.jpg`, `拉丝金.jpg`, `拉丝银.jpg`, `雅黑.jpg`, `焦点镜光.jpg`, `焦点拉丝金.jpg`, `焦点拉丝银.jpg`, `焦点雅黑.jpg`
- Detail directories: `镜光/`, `拉丝金2/`, `拉丝银/`, `雅黑/`

### 新款60

- Path: `client-materials/public-materials/产品图片/新款60/`
- Files: `高清新款60 (1).jpg`, `高清新款60 (2).jpg`, `高清新款60 (3).jpg`, `高清新款60 (4).jpg`

### D15131

- Path: `client-materials/public-materials/产品图片/D15131/`
- Files: `D15131 (1).png`, `D15131 (2).png`, `D15131 (3).png`, `D15131 (4).png`, `D15131 (1).mp4`

### DD33 / YD62-31

- Path: `client-materials/public-materials/产品图片/DD33（YD62-31）/`
- Files: `微信图片_20220412111626.jpg`, `微信图片_202204121116261.jpg`, `微信图片_202204121116263.jpg`, `微信图片_202204121116268.jpg`, `微信图片_20230421153449.jpg`

### S1908-22

- Path: `client-materials/public-materials/产品图片/S1908-22/`
- Files: `S1908-22 (1).png`, `S1908-22 (2).png`, `S1908-22 (3).png`

### S41122

- Path: `client-materials/public-materials/产品图片/S41122/`
- Files: `S41122 (1).jpg`, `S41122 (2).jpg`, `S41122 (3).jpg`, `S41122 (4).jpg`

### S41522

- Path: `client-materials/public-materials/产品图片/S41522/`
- Files: `S41522 (1).jpg`, `S41522 (1).png`, `S41522 (2).jpg`, `S41522 (3).jpg`, `S41522 (4).jpg`, `S41522 (1).mp4`

### S89022

- Path: `client-materials/public-materials/产品图片/S89022/`
- Files: `89022 (1).png`, `89022 (2).png`, `89022 (3).png`, `89022 (1).mp4`

### YR03-42

- Path: `client-materials/public-materials/产品图片/YR03-42/`
- Files: `YR03 (1).png`, `YR03 (2).png`, `YR03 (3).png`

## F. Duplicate / Same-Product Grouping

### Same product, not separate products

- Different views, installation scenes, component close-ups, and videos inside one named source folder form one product gallery.
- `镜光`, `拉丝金`, `拉丝银`, and `雅黑` are finish variants within C01–C05, not separate products.
- Parenthetical aliases such as `DD33（YD62-31）`, `DD34（D82031）`, `DS18（S41422）`, and `DS19（S26132）` represent one candidate family each until the client confirms a canonical public code.
- The four `新款60` files are one full view plus three details.

### Exact duplicates

SHA-256 identified 26 exact duplicate groups:

- 13 groups in the legacy catalog, where `图片 N.png` and the corresponding `hi_*_图片 N.png` are byte-identical for numbers including 2, 6, 18, 23, 27, 44, 60, 61, 64, 72, 73, 80, and 84.
- 13 shared component pairs across C-series folders. Examples:
  - `C02完成效果/拉丝金/下滑块.png` = `C04最终效果/配件：拉丝金/下滑块.png`
  - `C02完成效果/镜光/13X25方管拉手.png` = `C04最终效果/配件：镜光/13X25方管拉手.png`
  - `C01最终效果/镜光-配件细节图/挡水.png` = `C03完成效果/镜光/挡水.png`

Shared component imagery must not be treated as evidence for additional products. Before production curation, each product gallery should reference a canonical derived copy rather than creating multiple public copies of the same file.

## G. Proposed SEO URL Structure

```text
/products
/products/sliding-shower-doors
/products/corner-shower-enclosures
/products/fixed-shower-screens
/products/{category-slug}/{verified-product-slug}
```

Rules:

- Lowercase English paths with hyphen separation.
- Retain a verified public model/series code where it provides stable identity.
- Do not include finish, color, unverified specifications, or meaningless sequence IDs in canonical URLs.
- Do not create separate URLs for model-code aliases. Select one canonical public code first.
- Do not launch a URL for `新款60` until a stable customer-facing name/code is confirmed.
- Do not create URLs from the legacy `图片 N` filenames.
- If category or canonical-code decisions change after launch, add permanent redirects; therefore approve names before implementation.

## H. Proposed Product Detail Page Structure

Recommended order:

1. Breadcrumb: `Home / Products / [Verified Category] / [Verified Product Name]`
2. Product overview: dominant gallery, verified English name, short evidence-safe B2B description, `Get a Quote`, and `Request Product Information`
3. Product gallery: full view, alternate angle, detail, and installation/context views from the same confirmed product only
4. Key Features — only when at least three product-specific features are visually or documentarily verified
5. Applications — only when the approved imagery supports the context
6. Customization & OEM/ODM — inquiry-level wording only; do not list unverified options
7. Specifications — verified values only; otherwise show exactly: **Contact us for specifications.**
8. Related Products — 3–4 confirmed products from the same category/family; omit when fewer than two reliable relations exist
9. Product-aware inquiry CTA

Mobile requirements:

- Single-column composition with no horizontal overflow.
- Reserve image aspect ratios to prevent layout shift.
- Keep the product name and primary product image prominent in the first viewport.
- Full-width primary CTA with a secondary action 12–16px below it.
- Accessible gallery controls and minimum 44px touch targets.
- Stack specification term/value rows rather than forcing a wide table.

## I. Missing Information / Risks

The following items require human confirmation before public Product Detail Pages and permanent URLs are created:

1. Whether C01–C05 are released/current products and whether those series codes are approved public product names.
2. The canonical public code for DD33/YD62-31, DD34/D82031, DS18/S41422, and DS19/S26132.
3. A stable public product code/name for `新款60`.
4. Whether YD63-31 is independent from D15131, a finish/configuration variant, or a related render.
5. The exact opening mechanisms for any S-series where a still image does not make the operation unambiguous.
6. Whether embedded Chinese catalog text may be cropped out for derived production images. It must not appear in the English public UI.
7. Current-product/model mapping for the legacy low-end catalog pool.
8. Product-specific specifications. Until verified, every detail page must use `Contact us for specifications.`

Do not infer glass thickness, hardware material, dimensions, MOQ, lead time, warranty, product code, or performance from visual material.

## J. Recommended First Batch

Recommended first review batch: **12 Product Detail Pages**, subject to confirmation that the codes are public/current and that derived crops removing Chinese catalog copy are approved.

1. C01 Sliding Shower Door
2. C02 Sliding Shower Door
3. C03 Sliding Shower Door
4. C04 Sliding Shower Door
5. C05 Sliding Shower Door
6. D15131 Corner Shower Enclosure
7. DD33 / YD62-31 Corner Shower Enclosure — select canonical code first
8. S1908-22 Sliding Shower Door
9. S41122 Sliding Shower Door
10. S41522 Sliding Shower Door
11. S89022 Sliding Shower Door
12. YR03-42 Quadrant Shower Enclosure

`新款60` is materially READY but should remain out of the first URL batch until a stable public name/code is confirmed. It can replace any held candidate once naming is approved.

## Phase 1 Stop Point

This report is the complete V2 Phase 1 deliverable. No Product Detail Pages, SEO landing pages, homepage redesign, CRM/WhatsApp/Google Ads integrations, deployments, or production publication changes were made.

## L. V2 Phase 2 — First Product Detail Pages

### D15131 Corner Shower Enclosure

- URL: `/products/corner-shower-enclosures/d15131-corner-shower-enclosure`
- Chinese source path: `client-materials/public-materials/产品图片/D15131/`
- Source filenames: `D15131 (1).png`, `D15131 (2).png`, `D15131 (3).png`
- Derived assets: `src/assets/product-details/d15131/d15131-full.webp`, `d15131-handle-detail.webp`, `d15131-upper-detail.webp`, `d15131-lower-detail.webp`
- Evidence-supported content: polygonal corner configuration, framed glass-panel composition, elongated handle design, product-specific connection details
- Missing specifications: dimensions, glass specification, profile/hardware materials, finish options, exact opening mechanism, MOQ, lead time, warranty, and product-specific certifications

### S41122 Sliding Shower Door

- URL: `/products/sliding-shower-doors/s41122-sliding-shower-door`
- Chinese source path: `client-materials/public-materials/产品图片/S41122/`
- Source filenames: `S41122 (1).jpg`, `S41122 (2).jpg`, `S41122 (3).jpg`, `S41122 (4).jpg`
- Derived assets: `src/assets/product-details/s41122/s41122-context.webp`, `s41122-installed-roller.webp`, `s41122-roller-detail.webp`, `s41122-installed-full.webp`
- Evidence-supported content: straight alcove configuration, sliding-door format, visible upper roller detailing, paired horizontal handle design
- Missing specifications: dimensions, glass specification, frame/roller/handle materials, finish options, performance, installation requirements, MOQ, lead time, warranty, and product-specific certifications

### S41522 Sliding Shower Door

- URL: `/products/sliding-shower-doors/s41522-sliding-shower-door`
- Chinese source path: `client-materials/public-materials/产品图片/S41522/`
- Source filenames: `S41522 (1).jpg`, `S41522 (1).png`, `S41522 (2).jpg`, `S41522 (4).jpg`
- Derived assets: `src/assets/product-details/s41522/s41522-installed-full.webp`, `s41522-context.webp`, `s41522-track-profile.webp`, `s41522-handle-detail.webp`
- Evidence-supported content: straight alcove configuration, sliding-door format, enclosed track detailing, paired horizontal handle design
- Missing specifications: dimensions, glass specification, profile/handle/roller materials, finish options, performance, installation requirements, MOQ, lead time, warranty, and product-specific certifications

All three pages use `Contact us for specifications.` and pass the verified model code to the existing local-only Contact form. Catalog-derived crops contain no Chinese visitor-facing copy and do not publish embedded material or performance claims.

## M. V2.1 Product Status and Gallery Priority

Internal product status values are limited to `CONFIRMED` and `NEEDS_CONFIRMATION`.

- `NEEDS_CONFIRMATION`: Straight Sliding Shower Door public model name, DD33 / YD62-31 canonical code, and DS19 / S26132 canonical code. These remain non-linked portfolio candidates without formal SEO detail routes.
- `CONFIRMED`: D15131, S41122, and S41522 are the current reviewed detail-page set.

Product Detail gallery order follows this shared priority: real installed product photography, real product photography, high-quality product render, hardware/structural detail, then technical/reference imagery.

- S41122 primary: `S41122 (4).jpg` → `src/assets/product-details/s41122/s41122-installed-full.webp`. The contextual render remains second in the gallery.
- S41522 primary: `S41522 (1).png` → `src/assets/product-details/s41522/s41522-installed-full.webp`.
- D15131 primary: `D15131 (2).png` → `src/assets/product-details/d15131/d15131-full.webp`. No verified real installation photograph exists in its approved product folder, so the strongest complete render remains primary.

## K. Products Page V1.2 Live Selection

The V1.2 Products page uses ten independent product/family cards. No source file is rendered as more than one product card, and alternate views or detail images from one source folder are not presented as separate products.

### Hero

- English role: Products Hero
- Original source path: `client-materials/public-materials/落地案例图片/微信图片_20240328081629.jpg`
- Original source filename: `微信图片_20240328081629.jpg`
- Derived web asset: `src/assets/projects/project-02.webp`
- Evidence status: Approved public real-installation photograph; used for visual product presentation only, without inferring specifications

### Product Cards

| English display name | Category | Chinese source path | Original source filename | Derived web asset | Evidence status |
|---|---|---|---|---|---|
| Straight Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/新款60/` | `高清新款60 (1).jpg` | `src/assets/products/product-20.webp` | READY imagery; public model name/code NEEDS CONFIRMATION |
| D15131 Corner Shower Enclosure | Corner Shower Enclosures | `client-materials/public-materials/产品图片/D15131/` | `D15131 (2).png` | `src/assets/products/product-01.webp` | READY; evidence-safe code and visible corner configuration |
| DD33 / YD62-31 Corner Shower Enclosure | Corner Shower Enclosures | `client-materials/public-materials/产品图片/DD33（YD62-31）/` | `微信图片_20230421153449.jpg` | `src/assets/products/product-03.webp` | READY imagery; canonical public code NEEDS CONFIRMATION |
| DS19 / S26132 Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/DS19（S26132）/` | `22.jpg` | `src/assets/products/product-06.webp` | READY imagery; canonical public code NEEDS CONFIRMATION |
| Fixed Shower Screen Family | Fixed Shower Screens | `client-materials/public-materials/产品图片/DS20（单固玻）/` | `单固玻 (6).jpg` | `src/assets/products/product-07.webp` | PARTIAL; safe at family/category level, not approved as an individual detail product |
| S1908-22 Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/S1908-22/` | `S1908-22 (3).png` | `src/assets/products/product-11.webp` | READY; code and sliding configuration supported |
| S41122 Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/S41122/` | `S41122 (1).jpg` | `src/assets/products/product-12.webp` | READY; code and sliding configuration supported |
| S41522 Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/S41522/` | `S41522 (2).jpg` | `src/assets/products/product-13.webp` | READY; code and sliding configuration supported |
| S89022 Sliding Shower Door | Sliding Shower Doors | `client-materials/public-materials/产品图片/S89022/` | `89022 (1).png` | `src/assets/products/product-15.webp` | READY; code and sliding configuration supported |
| YR03-42 Quadrant Shower Enclosure | Corner Shower Enclosures | `client-materials/public-materials/产品图片/YR03-42/` | `YR03 (3).png` | `src/assets/products/product-19.webp` | READY; code and curved corner configuration supported |

### Category Visuals

| Category | Chinese source path | Original source filename | Derived web asset | Use |
|---|---|---|---|---|
| Sliding Shower Doors | `client-materials/public-materials/产品图片/S68422/` | `S68422 (1).jpg` | `src/assets/products/product-14.webp` | Category-level visual only; S68422 remains PARTIAL for an individual detail page |
| Corner Shower Enclosures | `client-materials/public-materials/产品图片/D15131/` | `D15131 (3).png` | `src/assets/products/product-02.webp` | Alternate D15131 view used only for category discovery |
| Fixed Shower Screens | `client-materials/public-materials/产品图片/DS20（单固玻）/` | `单固玻-西安 (2).jpg` | `src/assets/products/product-08.webp` | Category-level family visual only |

### Duplicate Groups Removed or Merged

The former 20-card array was replaced with explicit evidence-backed product records. Five clear same-product groups were merged into one product/family representation each:

1. `product-01.webp` + `product-02.webp` → one D15131 product.
2. `product-05.webp` + `product-06.webp` → one DS19 / S26132 product.
3. `product-07.webp` + `product-08.webp` + `product-09.webp` + `product-10.webp` → one DS20 fixed-screen family.
4. `product-15.webp` + `product-16.webp` → one S89022 product.
5. `product-17.webp` + `product-18.webp` → one YD63-31 product group; withheld from the live grid because its independence from D15131 still needs confirmation.

Unsupported position-based names such as `Hinged Door Enclosure`, `Pivot Door Enclosure`, `Bath Screen`, and `OEM & ODM Solution` were removed from the Products page. Category presentation uses only the three categories supported by this audit: Sliding Shower Doors, Corner Shower Enclosures, and Fixed Shower Screens.

## N. Global Product Rendering Deduplication Audit

### Root Cause and Canonical Source

The duplicate regression came from parallel, independently maintained presentation arrays. The Products grid had its own product records, the Home featured section generated six generic products by slicing numbered image assets, and each Product Detail page hard-coded separate related-product objects. Because numbered derived assets did not carry product identity, alternate views from one source folder could be presented as separate products under generic names.

All public product-card surfaces now resolve records from one canonical source:

- Canonical data: `src/data/product-catalog.json`
- Home Featured Products: canonical records selected by `featured`
- Products portfolio: all canonical records
- Products category visuals: canonical representative product IDs
- Product Detail Related Products: canonical product IDs only
- Validation: `npm run validate:products`

Before cleanup, 16 independently maintained public card records existed: ten in the Products portfolio and six additional legacy Home Featured records. After cleanup, there are ten canonical product/family records. Home and Related Products reuse those records and do not create additional product identities.

### Final Retained Canonical Products

| ID | Public name | Status | Source group | Primary original source | Derived primary asset | Formal detail URL |
|---|---|---|---|---|---|---|
| `straight-sliding-door` | Straight Sliding Shower Door | NEEDS_CONFIRMATION | `client-materials/public-materials/产品图片/新款60/` | `高清新款60 (1).jpg` | `src/assets/products/product-20.webp` | None |
| `d15131` | D15131 Corner Shower Enclosure | CONFIRMED | `client-materials/public-materials/产品图片/D15131/` | `D15131 (2).png` | `src/assets/products/product-01.webp` | `/products/corner-shower-enclosures/d15131-corner-shower-enclosure` |
| `dd33-yd62-31` | DD33 / YD62-31 Corner Shower Enclosure | NEEDS_CONFIRMATION | `client-materials/public-materials/产品图片/DD33（YD62-31）/` | `微信图片_20230421153449.jpg` | `src/assets/products/product-03.webp` | None |
| `ds19-s26132` | DS19 / S26132 Sliding Shower Door | NEEDS_CONFIRMATION | `client-materials/public-materials/产品图片/DS19（S26132）/` | `22.jpg` | `src/assets/products/product-06.webp` | None |
| `fixed-screen-family` | Fixed Shower Screen Family | CONFIRMED | `client-materials/public-materials/产品图片/DS20（单固玻）/` | `单固玻 (6).jpg` | `src/assets/products/product-07.webp` | `/products/fixed-shower-screens/fixed-shower-screen-family` |
| `s1908-22` | S1908-22 Sliding Shower Door | CONFIRMED | `client-materials/public-materials/产品图片/S1908-22/` | `S1908-22 (3).png` | `src/assets/products/product-11.webp` | `/products/sliding-shower-doors/s1908-22-sliding-shower-door` |
| `s41122` | S41122 Sliding Shower Door | CONFIRMED | `client-materials/public-materials/产品图片/S41122/` | `S41122 (1).jpg` | `src/assets/products/product-12.webp` | `/products/sliding-shower-doors/s41122-sliding-shower-door` |
| `s41522` | S41522 Sliding Shower Door | CONFIRMED | `client-materials/public-materials/产品图片/S41522/` | `S41522 (2).jpg` | `src/assets/products/product-13.webp` | `/products/sliding-shower-doors/s41522-sliding-shower-door` |
| `s89022` | S89022 Sliding Shower Door | CONFIRMED | `client-materials/public-materials/产品图片/S89022/` | `89022 (1).png` | `src/assets/products/product-15.webp` | `/products/sliding-shower-doors/s89022-sliding-shower-door` |
| `yr03-42` | YR03-42 Quadrant Shower Enclosure | CONFIRMED | `client-materials/public-materials/产品图片/YR03-42/` | `YR03 (3).png` | `src/assets/products/product-19.webp` | `/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure` |

Final status count: seven CONFIRMED and three NEEDS_CONFIRMATION. All seven CONFIRMED products have reviewed formal Product Detail routes. NEEDS_CONFIRMATION records remain non-linked and have no canonical product URL.

### Duplicate and Legacy Groups Removed or Merged

1. Legacy Home `Sliding Door Enclosure` used `product-02.webp`, an alternate D15131 view. It was merged into canonical D15131 and the generic product identity was removed.
2. Legacy Home `Corner Shower Enclosure` used `product-03.webp`. It was merged into canonical DD33 / YD62-31 and the generic product identity was removed.
3. Legacy Home `Hinged Door Enclosure` used `product-04.webp` from DD34 / D82031. This partial candidate was removed from public product-card rendering.
4. Legacy Home `Framed Shower Enclosure` used `product-05.webp`, an alternate DS19 / S26132 view. It was merged into the canonical DS19 / S26132 record.
5. Legacy Home `Minimal Shower Screen` used `product-06.webp`, the same DS19 / S26132 product. The duplicate identity was removed.
6. Legacy Home `Custom Enclosure Solution` used `product-07.webp` from the DS20 fixed-screen group. It was merged into the canonical Fixed Shower Screen Family.
7. The former Products-page duplicate groups remain consolidated: D15131 (`product-01` + `product-02`), DS19 / S26132 (`product-05` + `product-06`), DS20 (`product-07` through `product-10`), S89022 (`product-15` + `product-16`), and YD63-31 (`product-17` + `product-18`, still withheld pending identity confirmation).

Alternate angles, crops, installation views, renders, and hardware details remain valid gallery evidence, but they are not independent product-card records.

### Automated Regression Checks

`npm run validate:products` fails when it detects duplicate canonical IDs, detail URLs, primary derived assets, source groups, or primary original-source mappings. It also rejects formal detail URLs on NEEDS_CONFIRMATION records, invalid statuses, the former separate Products collection, legacy slice-generated Home cards, and known generic placeholder names.

### Human Confirmation Still Required

- Confirm the stable public model/name for `新款60` before creating a formal product URL.
- Confirm whether DD33 or YD62-31 is the canonical public code.
- Confirm whether DS19 or S26132 is the canonical public code.
- Confirm whether YD63-31 is independent from D15131 before restoring it as a public product record.
- Confirm DD34 / D82031 product identity and material completeness before considering it for the canonical portfolio.

## O. V2.2 Complete Confirmed Product Detail Pages

V2.2 completes the local Product Detail system for all seven canonical CONFIRMED products. The four additions below use only approved public files. Original customer materials remain unchanged; each web asset is a derived crop or optimized copy created to remove Chinese catalog text, unsupported marketing copy, and unrelated page layout.

### Fixed Shower Screen Family

- Category: Fixed Shower Screens
- URL: `/products/fixed-shower-screens/fixed-shower-screen-family`
- Chinese source path: `client-materials/public-materials/产品图片/DS20（单固玻）/`
- Original filenames used: `单固玻-西安 (3).jpg`, `单固玻 (6).jpg`, `单固玻-西安 (2).jpg`
- Derived assets: `src/assets/product-details/fixed-screen-family/fixed-screen-installed.webp`, `fixed-screen-context-01.webp`, `fixed-screen-context-02.webp`
- Evidence-supported information: fixed single-panel format, dark-framed presentation, vertically textured panel appearance, and bathroom applications shown in approved imagery
- Missing specifications: individual model code, configuration mapping, dimensions, glass specification, frame/hardware materials, finish options, installation requirements, MOQ, lead time, warranty, and product-specific certifications
- Evidence boundary: this is intentionally a family-level page. The source group does not prove that every image is one exact product model. `单固玻-西安 (5).jpg` was excluded because it is not a clear shower application and its configuration differs from the selected bathroom views.

### S1908-22 Sliding Shower Door

- Category: Sliding Shower Doors
- URL: `/products/sliding-shower-doors/s1908-22-sliding-shower-door`
- Chinese source path: `client-materials/public-materials/产品图片/S1908-22/`
- Original filenames used: `S1908-22 (3).png`, `S1908-22 (1).png`, `S1908-22 (2).png`
- Derived assets: `src/assets/product-details/s1908-22/s1908-22-full.webp`, `s1908-22-mechanism.webp`, `s1908-22-hardware.webp`
- Evidence-supported information: straight alcove configuration, sliding-door format, visible upper mechanism details, and paired horizontal pull handles
- Missing specifications: dimensions, glass specification, hardware/frame materials, finish options, installation requirements, MOQ, lead time, warranty, and product-specific certifications

### S89022 Sliding Shower Door

- Category: Sliding Shower Doors
- URL: `/products/sliding-shower-doors/s89022-sliding-shower-door`
- Chinese source path: `client-materials/public-materials/产品图片/S89022/`
- Original filenames used: `89022 (1).png`, `89022 (2).png`, `89022 (3).png`
- Derived assets: `src/assets/product-details/s89022/s89022-full.webp`, `s89022-handle.webp`, `s89022-frame-detail.webp`
- Evidence-supported information: straight alcove configuration, sliding-door format, framed glass-panel presentation, and rectangular pull-handle details
- Missing specifications: dimensions, glass specification, hardware/frame materials, finish options, installation requirements, MOQ, lead time, warranty, and product-specific certifications
- Duplicate control: the handle inset inside `89022 (3).png` was not reused; the frame crop excludes it because `89022 (2).png` supplies the dedicated handle view.

### YR03-42 Quadrant Shower Enclosure

- Category: Corner Shower Enclosures
- URL: `/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure`
- Chinese source path: `client-materials/public-materials/产品图片/YR03-42/`
- Original filenames used: `YR03 (3).png`, `YR03 (1).png`, `YR03 (2).png`
- Derived assets: `src/assets/product-details/yr03-42/yr03-42-full.webp`, `yr03-42-rail.webp`, `yr03-42-roller.webp`, `yr03-42-handle.webp`
- Evidence-supported information: curved quadrant corner configuration, paired front door panels, curved upper rail and roller details, and paired vertical pull handles
- Missing specifications: dimensions, glass specification, rail/roller/handle materials, finish options, installation requirements, MOQ, lead time, warranty, and product-specific certifications
- Duplicate control: the handle inset inside `YR03 (1).png` was excluded; `YR03 (2).png` supplies the dedicated handle view.

### V2.2 Confirmed Route Matrix

| Product | Category | URL |
|---|---|---|
| D15131 Corner Shower Enclosure | Corner Shower Enclosures | `/products/corner-shower-enclosures/d15131-corner-shower-enclosure` |
| Fixed Shower Screen Family | Fixed Shower Screens | `/products/fixed-shower-screens/fixed-shower-screen-family` |
| S1908-22 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s1908-22-sliding-shower-door` |
| S41122 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s41122-sliding-shower-door` |
| S41522 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s41522-sliding-shower-door` |
| S89022 Sliding Shower Door | Sliding Shower Doors | `/products/sliding-shower-doors/s89022-sliding-shower-door` |
| YR03-42 Quadrant Shower Enclosure | Corner Shower Enclosures | `/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure` |

The canonical product validator now requires exactly seven CONFIRMED products, a formal route and metadata entry for each, existing and unique gallery assets, and valid confirmed Related Product links. The three NEEDS_CONFIRMATION records remain without formal detail URLs.
