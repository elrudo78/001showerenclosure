"""Make the web image masters in site/src/assets from the client's files.

Dev-only. Needs the git-ignored client-materials/ folder (see scripts/dev/README.md)
and Pillow + PyMuPDF:  python3 -I site/scripts/prepare_images.py  (run from the repo root).

Each output records where it came from in site/src/assets/SOURCES.md, so every
web image can be traced back to the original file. Astro makes the final
AVIF/WebP sizes at build time; these masters only fix crop, size and background.
"""
import csv
import glob
import os

import pymupdf
from PIL import Image, ImageFilter, ImageOps

ROOT = os.getcwd()
PUBLIC = os.path.join(ROOT, 'client-materials', 'public-materials')
REVIEW = os.path.join(ROOT, 'docs', 'asset-review', 'public-materials-review.csv')
OUT = os.path.join(ROOT, 'site', 'src', 'assets')
CATALOG_GLOB = os.path.join(ROOT, 'client-materials', 'reference', '2025年小图册*.pdf')
MAX_SIDE = 2400

review = {r['review_id']: r for r in csv.DictReader(open(REVIEW, encoding='utf-8-sig')) if r['review_id']}
sources = []


def save(im, rel, note):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im = im.convert('RGB')
    if max(im.size) > MAX_SIDE:
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    if rel.endswith('.png'):
        im.save(path, optimize=True)
    else:
        im.save(path, quality=88, optimize=True, progressive=True)
    sources.append((rel, note, im.size))


def from_review(rid, rel, box=None):
    """box is (left, top, right, bottom) as fractions of the original image."""
    src = review[rid]['source_path']
    im = ImageOps.exif_transpose(Image.open(os.path.join(PUBLIC, src)))
    if box:
        w, h = im.size
        im = im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))
    save(im, rel, f'{rid}: public-materials/{src}')


# Hero finish switcher: the same C05 scene in four finishes. Crop drops the toilet at bottom left.
hero_box = (300 / 2643, 60 / 2160, 1, 1)
for rid, finish in [('P0139', 'black'), ('P0136', 'gold'), ('P0137', 'silver'), ('P0138', 'chrome')]:
    from_review(rid, f'hero/finish-{finish}.jpg', hero_box)

# Factory: no faces, no Chinese banners.
from_review('P0326', 'factory/glass-edges.jpg')
from_review('P0351', 'factory/profile-racks.jpg', (0.12, 0.10, 1, 0.92))
from_review('P0348', 'factory/packing-line.jpg')
from_review('P0345', 'factory/cartons.jpg')

# Installed projects, cropped as the review notes say. Photos from 落地案例图片/中山福立产品落地案例图 are allowed
# (user's decision 2026-10-30, as on the team's live site); the names Fuli and FANLY never appear on the site.
from_review('P0419', 'projects/pivot-black-bathtub.jpg')
from_review('P0424', 'projects/neo-angle-gold.jpg', (0, 0, 0.82, 1))
from_review('P0361', 'projects/corner-black.jpg')
from_review('P0422', 'projects/sliding-bronze.jpg')
from_review('P0425', 'projects/neo-angle-chrome.jpg')
from_review('P0382', 'projects/sliding-black-showroom.jpg')
from_review('P0394', 'projects/sliding-black-marble.jpg', (0.12, 0, 1, 1))
from_review('P0371', 'projects/multi-panel-black.jpg')
from_review('P0366', 'projects/hinged-gold-marble.jpg')
from_review('P0408', 'projects/sliding-black-niche.jpg', (0.12, 0, 1, 1))
from_review('P0385', 'projects/hinged-champagne.jpg', (0.18, 0, 1, 1))
from_review('P0387', 'projects/corner-gold-dark.jpg', (0, 0, 1, 0.92))
from_review('P0395', 'projects/double-hinged-black-marble.jpg')
from_review('P0380', 'projects/glass-wall-black.jpg')
from_review('P0413', 'projects/walk-in-black.jpg', (0, 0, 0.75, 1))
from_review('P0407', 'projects/corner-rain-glass.jpg')
from_review('P0374', 'projects/curved-black.jpg', (0, 0, 0.9, 0.94))
from_review('P0377', 'projects/corner-chrome.jpg')
from_review('P0399', 'projects/marble-chrome.jpg')

# Factory page: glass, profiles and packing. No faces; banners cropped as the review notes say.
from_review('P0327', 'factory/glass-corner.jpg')
from_review('P0355', 'factory/glass-racks.jpg')
from_review('P0356', 'factory/glass-trolleys.jpg')
from_review('P0358', 'factory/frame-profiles.jpg')
from_review('P0360', 'factory/parts-rack.jpg', (0, 0.2, 1, 1))
from_review('P0341', 'factory/foam-packaging.jpg')

# Room photos for product pages.
from_review('P0253', 'products/d15131-room.jpg')
from_review('P0305', 'products/yd63-room-black.jpg')
from_review('P0304', 'products/yd63-room-gold.jpg', (0, 0, 1, 0.9))


def trim_white(im, pad=0.0, edge=40):
    # Ignore a thin dark line along the outer edge of some catalog exports.
    im = im.crop((edge, edge, im.width - edge, im.height - edge))
    grey = im.convert('L').point(lambda v: 255 if v < 245 else 0)
    l, t, r, b = grey.getbbox()
    px, py = round((r - l) * pad), round((b - t) * pad)
    return im.crop((max(0, l - px), max(0, t - py), min(im.width, r + px), min(im.height, b + py)))


src = review['P0275']['source_path']
save(trim_white(ImageOps.exif_transpose(Image.open(os.path.join(PUBLIC, src)))), 'products/s26132-room.jpg', f'P0275: public-materials/{src}')

# DLFC01 to DLFC05 (the client's C01 to C05 renders), one scene per finish. DLFC05 reuses the hero images.
DLFC = os.path.join(PUBLIC, 'shower Enclosures', 'DLFEI -C01~C05产品效果图', 'C01-C05')
dlfc = {
    'dlfc01': {'black': 'C01最终效果/雅黑-主图.jpg', 'gold': 'C01最终效果/拉丝金-主图.jpg', 'silver': 'C01最终效果/拉丝银-主图.jpg', 'chrome': 'C01最终效果/镜光-主图.png'},
    'dlfc02': {'black': 'C02完成效果/Enscape_2025-02-27-13-44-52.png', 'gold': 'C02完成效果/Enscape_2025-02-27-11-20-37.png',
               'silver': 'C02完成效果/Enscape_2025-02-27-13-42-10.png', 'chrome': 'C02完成效果/Enscape_2025-02-27-13-43-55.png'},
    'dlfc03': {'black': 'C03完成效果/雅黑.png', 'gold': 'C03完成效果/拉丝金.jpg', 'silver': 'C03完成效果/拉丝银.jpg', 'chrome': 'C03完成效果/镜光.jpg'},
    'dlfc04': {'black': 'C04最终效果/雅黑.jpg', 'gold': 'C04最终效果/拉丝金.jpg', 'silver': 'C04最终效果/拉丝银.jpg', 'chrome': 'C04最终效果/镜光.jpg'},
}
def crop_frac(im, box):
    w, h = im.size
    return im.crop((round(box[0] * w), round(box[1] * h), round(box[2] * w), round(box[3] * h)))


# 4:5 product-card crops, tight on the shower door so it reads clearly at card size (fractions of each source).
dlfc_card = {'dlfc01': (0, 0.08, 0.81, 0.98), 'dlfc02': (0.235, 0, 0.685, 1), 'dlfc03': (0.205, 0, 0.655, 1),
             'dlfc04': (0.225, 0, 0.675, 1)}
for code, files in dlfc.items():
    for finish, rel in files.items():
        im = Image.open(os.path.join(DLFC, rel))
        if code == 'dlfc02' and im.width != 3840:
            im = im.resize((3840, round(im.height * 3840 / im.width)), Image.LANCZOS).crop((0, 0, 3840, 2160))
        note = f'public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/{rel}'
        save(im, f'dlfc/{code}-{finish}.jpg', note)
        if finish == 'black':
            save(crop_frac(im, dlfc_card[code]), f'dlfc/card-{code}.jpg', note)

# Hardware close-ups for DLFC01 and DLFC04 (the only models with them), every part in all four finishes.
# Transparent cut-outs: trimmed to the part, centred on a square with the same margin, kept transparent.
hw_folders = {
    'dlfc01': {'black': 'C01最终效果/雅黑-配件细节图', 'gold': 'C01最终效果/拉丝金-配件细节图',
               'silver': 'C01最终效果/拉丝银-配件细节图', 'chrome': 'C01最终效果/镜光-配件细节图'},
    'dlfc04': {'black': 'C04最终效果/配件：雅黑', 'gold': 'C04最终效果/配件：拉丝金',
               'silver': 'C04最终效果/配件：拉丝', 'chrome': 'C04最终效果/配件：镜光'},
}
# Part id: candidate file names (the client's names differ slightly between finish folders).
hw_parts = {
    'dlfc01': {'roller': ['轮子.png'],
               'wall-mount': ['墙套.png'], 'end-cap': ['挡水堵头.png']},
    'dlfc04': {'roller': ['60MM方轮.png'], 'handle': ['13X25方管拉手.png'], 'floor-guide': ['下滑块.png'],
               'wall-mount': ['墙套.png', 'WJ-029墙套.png']},
}
for code, folders in hw_folders.items():
    for finish, folder in folders.items():
        for part, names in hw_parts[code].items():
            rel = next(f'{folder}/{n}' for n in names if os.path.exists(os.path.join(DLFC, folder, n)))
            im = Image.open(os.path.join(DLFC, rel)).convert('RGBA')
            # Shrinking the mask first removes the stray specks some renders carry, so they do not widen the crop.
            l, t, r, b = im.getchannel('A').point(lambda a: 255 if a > 96 else 0).filter(ImageFilter.MinFilter(15)).getbbox()
            im = im.crop((max(0, l - 8), max(0, t - 8), min(im.width, r + 8), min(im.height, b + 8)))
            side = round(max(im.size) * 1.16)
            sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
            sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
            sq.thumbnail((640, 640), Image.LANCZOS)
            out = f'dlfc/hw-{code}-{part}-{finish}.png'
            os.makedirs(os.path.join(OUT, 'dlfc'), exist_ok=True)
            sq.save(os.path.join(OUT, out), optimize=True)
            sources.append((out, f'public-materials/shower Enclosures/DLFEI -C01~C05产品效果图/C01-C05/{rel}', sq.size))

# DLFC05 card: from the hero scene (already cropped by hero_box).
src = review['P0139']['source_path']
hero_im = ImageOps.exif_transpose(Image.open(os.path.join(PUBLIC, src)))
w, h = hero_im.size
hero_im = hero_im.crop((round(hero_box[0] * w), round(hero_box[1] * h), w, h))
save(crop_frac(hero_im, (0.02, 0.08, 0.65, 0.96)), 'dlfc/card-dlfc05.jpg', f'P0139: public-materials/{src}')


# Dulifei 2025 catalog: every page is one 3477 x 2268 image.
catalog = pymupdf.open(glob.glob(CATALOG_GLOB)[0])


def catalog_page(n):
    xref = catalog[n - 1].get_images(full=True)[0][0]
    data = catalog.extract_image(xref)['image']
    tmp = os.path.join(OUT, '.page.png')
    open(tmp, 'wb').write(data)
    im = Image.open(tmp).convert('RGB')
    im.load()
    os.remove(tmp)
    return im


# Room scenes (spec text below the floor is cropped away).
for page, code, box in [(3, 't98152', (150, 150, 3320, 1745)), (7, 't93152', (150, 150, 3320, 1745)),
                        (9, 's88421', (150, 150, 3095, 1785))]:
    save(catalog_page(page).crop(box), f'catalog/scene-{code}.jpg', f'2025 catalog page {page}: reference/2025年小图册-高端市场.pdf')

# 4:5 product-card crops of those scenes, centred on the enclosure (page coordinates).
for page, code, box in [(3, 't98152', (300, 150, 1576, 1745)), (7, 't93152', (210, 150, 1486, 1745)),
                        (9, 's88421', (281, 150, 1589, 1785))]:
    save(catalog_page(page).crop(box), f'catalog/card-{code}.jpg', f'2025 catalog page {page}: reference/2025年小图册-高端市场.pdf')

# Studio renders: four products per page, top-left, top-right, bottom-left, bottom-right.
pages = {
    4: 'S98231 L99131 L15431 S12231', 5: 'D15331 D12531 DR D15231', 6: 'D15131 YD63 DB HD',
    8: 'S93021 D81231 S93031 D54131', 10: 'S86821 FULLFRAME S68722 C52', 11: 'S88822 FANDU60 S68422 YS09',
    12: 'S1912 S41522 S41922 S26632', 13: 'S26132 S82431 FHL S890',
}
regions = [(60, 60, 1080, 1110), (1760, 60, 2820, 1110), (220, 1150, 1080, 2130), (1760, 1150, 2820, 2130)]
# Pale grey box behind each render becomes pure white, so renders sit on the page with no edge.
whiten = [255 if v >= 244 else v for v in range(256)] * 3



def studio(im, region, code, page):
    x0, y0, x1, y1 = region
    bb = im.convert('L').crop(region).point(lambda v: 255 if v < 225 else 0).getbbox()
    l, t, r, b = bb[0] + x0, bb[1] + y0, bb[2] + x0, bb[3] + y0
    crop = im.crop((l, t, r, b)).point(whiten)
    # Same canvas for every product: 4:5, render height 88% of the canvas, centred, bottom-aligned.
    canvas_h = round((b - t) / 0.88)
    canvas = Image.new('RGB', (round(canvas_h * 0.8), canvas_h), 'white')
    if crop.width > canvas.width * 0.92:
        scale = canvas.width * 0.92 / crop.width
        crop = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.LANCZOS)
    canvas.paste(crop, ((canvas.width - crop.width) // 2, canvas.height - crop.height - round(canvas_h * 0.06)))
    save(canvas, f'catalog/{code.lower()}.png', f'2025 catalog page {page}: reference/2025年小图册-高端市场.pdf')


for page, codes in pages.items():
    im = catalog_page(page)
    for code, region in zip(codes.split(), regions):
        studio(im, region, code, page)

# Page 14 has two products on the left half: a single-track panoramic door and a bathroom door.
p14 = catalog_page(14)
studio(p14, (220, 150, 1000, 1100), 'SINGLETRACK', 14)
studio(p14, (220, 1150, 1000, 2130), 'BATHROOMDOOR', 14)

with open(os.path.join(OUT, 'SOURCES.md'), 'w') as f:
    f.write('# Image sources\n\nGenerated by `site/scripts/prepare_images.py`. Review ids are in '
            '`docs/asset-review/public-materials-review.csv`.\n\n| File | Size | Source |\n| --- | --- | --- |\n')
    for rel, note, size in sorted(sources):
        f.write(f'| `{rel}` | {size[0]} x {size[1]} | {note} |\n')
print(len(sources), 'images written')
