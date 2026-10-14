import os, sys, pymupdf
ref, out = sys.argv[1], sys.argv[2]
docs = [('C20', '图册/2020年图册旧-高端市场.pdf', None), ('C25', '图册/2025年小图册-高端市场.pdf', None),
        ('CKX', '图册/2025酷小白-中端市场.pdf', None), ('CUS', 'shower Enclosures/美国市场大吊轮款.pdf', None),
        ('CHW', 'shower Enclosures/财业五金.pdf', 6)]
rows = []
for code, rel, limit in docs:
    d = pymupdf.open(os.path.join(ref, rel))
    for i, page in enumerate(d):
        if limit and i >= limit: break
        zoom = 1600 / max(page.rect.width, page.rect.height)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
        pid = f"{code}-{i + 1:02d}"; path = os.path.join(out, 'pages', pid + '.jpg')
        pix.save(path, jpg_quality=85)
        rows.append((pid, path, rel, i + 1, d.page_count))
groups = {'1': [r for r in rows if r[0].startswith('C20') and r[3] <= 27],
          '2': [r for r in rows if r[0].startswith('C20') and 27 < r[3] <= 54],
          '3': [r for r in rows if r[0].startswith('C20') and r[3] > 54],
          '4': [r for r in rows if not r[0].startswith('C20')]}
for g, rs in groups.items():
    with open(os.path.join(out, 'batches', f'cat-{g}.tsv'), 'w', encoding='utf-8') as f:
        f.write('id\tpage_image\tsource_pdf\tpage\tof_pages\n')
        for r in rs: f.write('\t'.join(map(str, r)) + '\n')
    print(f"cat-{g}: {len(rs)} pages")
