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
from PIL import Image, ImageOps

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

# Installed projects, cropped as the review notes say.
from_review('P0394', 'projects/sliding-black-marble.jpg', (0.12, 0, 1, 1))
from_review('P0382', 'projects/sliding-black-showroom.jpg')
from_review('P0424', 'projects/neo-angle-gold.jpg', (0, 0, 0.82, 1))
from_review('P0371', 'projects/multi-panel-black.jpg')
from_review('P0366', 'projects/hinged-gold-marble.jpg')
from_review('P0408', 'projects/sliding-black-niche.jpg', (0.12, 0, 1, 1))

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

# Studio renders: four products per page, top-left, top-right, bottom-left, bottom-right.
pages = {
    4: 'S98231 L99131 L15431 S12231', 5: 'D15331 D12531 DR D15231', 6: 'D15131 YD63 DB HD',
    8: 'S93021 D81231 S93031 D54131', 10: 'S86821 FULLFRAME S68722 C52', 11: 'S88822 FANDU60 S68422 YS09',
    12: 'S1912 S41522 S41922 S26632', 13: 'S26132 S82431 FHL S890',
}
regions = [(60, 60, 1080, 1110), (1760, 60, 2820, 1110), (220, 1150, 1080, 2130), (1760, 1150, 2820, 2130)]
# Pale grey box behind each render becomes pure white, so renders sit on the page with no edge.
whiten = [255 if v >= 244 else v for v in range(256)] * 3

for page, codes in pages.items():
    im = catalog_page(page)
    grey = im.convert('L')
    for code, (x0, y0, x1, y1) in zip(codes.split(), regions):
        bb = grey.crop((x0, y0, x1, y1)).point(lambda v: 255 if v < 225 else 0).getbbox()
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

with open(os.path.join(OUT, 'SOURCES.md'), 'w') as f:
    f.write('# Image sources\n\nGenerated by `site/scripts/prepare_images.py`. Review ids are in '
            '`docs/asset-review/public-materials-review.csv`.\n\n| File | Size | Source |\n| --- | --- | --- |\n')
    for rel, note, size in sorted(sources):
        f.write(f'| `{rel}` | {size[0]} x {size[1]} | {note} |\n')
print(len(sources), 'images written')
