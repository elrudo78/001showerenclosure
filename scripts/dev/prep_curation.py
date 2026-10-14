import hashlib, json, os, subprocess, sys
from PIL import Image, ImageOps
import imagehash, pymupdf, imageio_ffmpeg

Image.MAX_IMAGE_PIXELS = None
root, out = os.path.realpath(sys.argv[1]), os.path.realpath(sys.argv[2])
prev_dir = os.path.join(out, 'previews')
MAX = 1024

def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for c in iter(lambda: f.read(1 << 20), b''): h.update(c)
    return h.hexdigest()

files = []
for d, _, fs in os.walk(root):
    for f in fs:
        full = os.path.join(d, f)
        files.append((os.path.relpath(full, os.path.dirname(root)), full))
files.sort()

by_hash = {}
for rel, full in files:
    by_hash.setdefault(sha(full), []).append((rel, full))

def canonical(paths):
    return sorted(paths, key=lambda x: ('/图册/设计图/' in x[0], x[0]))[0]

uniques = []
for h, paths in by_hash.items():
    rel, full = canonical(paths)
    uniques.append({'sha256': h, 'path': rel, 'full': full,
                    'exact_copies': [p for p, _ in paths if p != rel]})

def save_preview(img, name):
    img = ImageOps.exif_transpose(img).convert('RGB')
    img.thumbnail((MAX, MAX))
    path = os.path.join(prev_dir, name)
    img.save(path, 'JPEG', quality=82)
    return path

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
for u in uniques:
    ext = u['path'].rsplit('.', 1)[-1].lower()
    u['bytes'] = os.path.getsize(u['full'])
    try:
        if ext in ('png', 'jpg', 'jpeg'):
            with Image.open(u['full']) as im:
                u['kind'] = 'image'; u['width'], u['height'] = im.size
                u['_dhash'] = str(imagehash.dhash(im.convert('L'), hash_size=16))
                small = im.convert('RGB').resize((16, 16)); u['_rgb'] = [sum(c) / 256 for c in zip(*small.getdata())]
                u['_img'] = True
        elif ext == 'pdf':
            doc = pymupdf.open(u['full'])
            u['kind'] = 'pdf'; u['pages'] = doc.page_count
            page = doc[0]; zoom = MAX / max(page.rect.width, page.rect.height)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
            u['_pdf_img'] = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
            u['text_page1'] = page.get_text()[:600]
        elif ext == 'mp4':
            n, secs = imageio_ffmpeg.count_frames_and_secs(u['full'])
            u['kind'] = 'video'; u['duration_s'] = round(secs, 1)
            frames = []
            for i, t in enumerate((0.15, 0.5, 0.85)):
                fp = os.path.join(out, f'_frame{i}.jpg')
                subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-ss', str(secs * t), '-i', u['full'],
                                '-frames:v', '1', fp], check=True)
                frames.append(Image.open(fp).convert('RGB'))
            u['width'], u['height'] = frames[0].size
            h = 360; strip = [f.resize((int(f.width * h / f.height), h)) for f in frames]
            sheet = Image.new('RGB', (sum(s.width for s in strip) + 20, h), 'white')
            x = 0
            for s in strip: sheet.paste(s, (x, 0)); x += s.width + 10
            u['_pdf_img'] = sheet
        else:
            u['kind'] = 'other'
    except Exception as e:
        u['kind'] = 'unreadable'; u['error'] = str(e)

# near-duplicate grouping (strict): dhash16 distance <= 8 and same aspect ratio
imgs = [u for u in uniques if u.get('_img')]
parent = {id(u): u for u in imgs}
def find(u):
    while parent[id(u)] is not u: u = parent[id(u)]
    return u
for i, a in enumerate(imgs):
    ha = imagehash.hex_to_hash(a['_dhash'])
    for b in imgs[i + 1:]:
        if os.path.dirname(a['path']) != os.path.dirname(b['path']): continue
        if abs(a['width'] / a['height'] - b['width'] / b['height']) > 0.02: continue
        if sum((x - y) ** 2 for x, y in zip(a['_rgb'], b['_rgb'])) ** 0.5 > 12: continue
        if ha - imagehash.hex_to_hash(b['_dhash']) <= 8:
            ra, rb = find(a), find(b)
            if ra is not rb: parent[id(rb)] = ra
groups = {}
for u in imgs: groups.setdefault(id(find(u)), []).append(u)
for g in groups.values():
    rep = max(g, key=lambda x: (x['width'] * x['height'], x['bytes']))
    for u in g:
        u['near_duplicate_of'] = None if u is rep else rep['path']
    rep['near_duplicates'] = [u['path'] for u in g if u is not rep]

# assign review IDs + previews to representatives
review = [u for u in uniques if u['kind'] in ('image', 'pdf', 'video') and not u.get('near_duplicate_of')]
review.sort(key=lambda u: u['path'])
for n, u in enumerate(review, 1):
    u['id'] = f"{'V' if u['kind'] == 'video' else 'D' if u['kind'] == 'pdf' else 'P'}{n:04d}"
    if u.get('_img'):
        with Image.open(u['full']) as im: save_preview(im, u['id'] + '.jpg')
    else:
        save_preview(u['_pdf_img'], u['id'] + '.jpg')
    u['preview'] = os.path.join(prev_dir, u['id'] + '.jpg')

for u in uniques:
    for k in ('_dhash', '_rgb', '_img', '_pdf_img', 'full'): u.pop(k, None)
json.dump(uniques, open(os.path.join(out, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('unique files:', len(uniques), '| near-duplicates folded:', sum(1 for u in uniques if u.get('near_duplicate_of')),
      '| to review:', len(review), '| unreadable:', sum(1 for u in uniques if u['kind'] == 'unreadable'))
