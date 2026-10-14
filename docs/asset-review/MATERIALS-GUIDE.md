# Client materials guide: what we have to design with

As of 2026-10-14. The design should lead with the high-resolution product renders and the factory photos, use real installation photos at medium sizes, and redraw the configuration line drawings rather than use them as they are.

## Where every file is recorded

The client shared 987 items on Google Drive: 903 files in 84 folders (the 4 `private-materials` files were removed before sharing). Every file is indexed in this folder:

| File | What it covers |
| --- | --- |
| `public-materials-inventory.csv` | All 805 public files: size, pixel dimensions, fingerprint, review id, and which are exact copies (161) or near-identical versions (82) of another file |
| `public-materials-review.csv` | The 644 unique public files: what each shows, configuration, finish, quality, best use, crop note, do-not-publish flag, printed specs |
| `reference-inventory.csv` | All 98 reference files, with customer names and addresses removed |
| `catalog-pages-index.csv` | All 110 scanned catalog pages: brand, page type, model codes |
| `dulifei-2025-catalog-specs.md` | Specifications for 37 products from Dulifei's own 2025 catalog |

The files themselves are kept out of the repository (it is public). Re-download with `scripts/dev/` when a session needs them.

## What each folder is good for

| Folder | Unique items | Typical size (long side) | Avg quality (1 to 5) | Best use |
| --- | --- | --- | --- | --- |
| `shower Enclosures/DLFEI -C01~C05产品效果图` (C01 to C05 renders) | 155 | 3840 px | 3.8 | Hero, finish options, product galleries. Many are transparent hardware cut-outs that need a clean background. |
| `杜丽菲厂房图片` (factory) | 39 | 6720 px | 4.8 | Factory and quality section, alternative hero. Crop out worker faces, licence plates and Chinese banners. |
| `落地案例图片` (real installations) | 69 | 1450 px | 3.3 | Projects and trust. Phone photos: use at medium size. Some have watermarks or reflections of people. |
| `产品图片` (product photos, by model code) | 62 | 1467 px (up to 7000) | 3.3 | Product pages. Includes 4 short product videos; one shows a person in a face mask. |
| `设计图` (line drawings; `图册/设计图` is an exact copy) | 133 | 576 px | 1.9 | Reference for configuration diagrams. Redraw as clean line icons; several carry customer or company details. |
| `shower Enclosures/老款产品图册-低端市场` (old catalog) | 95 | 384 px | 1.7 | Thumbnails at most; mostly skip. |
| `产品认证资料` (certificates) | 6 | 2338 px | 4.3 | Glass suppliers' certificates, not Dulifei's; one expired in 2023. Do not present as Dulifei certifications. |
| `广告条` (banners) | 3 | 1920 px | 4.0 | Do not use: unverified claims and a typo. |

## The product range, as the material shows it

Configurations across the reviewed images: straight sliding (112), hinged or pivot door (74), neo-angle corner (57), curved quadrant (32), walk-in fixed panel (18), corner sliding (16), bathtub screen (12). The 2025 catalog adds T-shape and L-shape enclosures, three-door sliders, panoramic sliding systems and bathroom doors.

Finishes across the images: matte black (117), chrome (109), brushed silver (72), brushed gold (51). Finish names printed in the catalog: mirror steel, 37° grey, brushed zirconium gold, Italian matte gold, rose gold, champagne gold, black titanium.

The company works mainly to custom order and model codes are internal, so organise products by configuration (sliding, pivot and hinged, neo-angle, curved, walk-in) and show custom sizes and finishes as a strength.

## Strongest picks per section

Review ids; look up each one's path and notes in `public-materials-review.csv`.

| Section | Picks |
| --- | --- |
| Hero | P0136 (brushed gold, white bathroom), P0139 (same scene, matte black), P0087 (matte black, marble), P0382 and P0394 (real installations) |
| Finish switcher | P0136 to P0139 (identical scene, four finishes; already used); P0120, P0128, P0140, P0148 (C05 full scene); P0030 to P0032 (C02) |
| Product cards | P0148, P0253, P0275, P0374, P0385, P0408, P0424, P0016 |
| Projects | P0361, P0362, P0364, P0366, P0367, P0371, P0372, P0378, P0394, P0413 |
| Factory | P0326, P0327, P0344, P0345, P0348, P0349, P0350, P0351 |
| Configuration reference | P0538, P0541, P0549, P0453, P0442 |

## Gaps and constraints

- The only truly high-resolution product imagery is the C01 to C05 renders; real installation photos are phone quality.
- No usable photos of people or the team (faces would need consent).
- No verified company facts (founding year, factory size, staff, output). Keep copy to what the material shows.
- Contact details are not cleared yet. Dulifei's catalog cover prints an address, phone and fax; ask the team before using them.
- Never publish:
  - drawings with customer, designer or company contact details;
  - watermarked photos (FANLY, OPPO, HONOR);
  - identifiable faces and licence plates;
  - the supplier certificates as Dulifei's own;
  - the banners;
  - the installation manual (team decision).
