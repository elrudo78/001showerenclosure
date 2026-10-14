import hashlib, json, os, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

listing, dest_root, manifest_out = sys.argv[1], os.path.realpath(sys.argv[2]), sys.argv[3]
items = json.load(open(listing, encoding='utf-8'))
IMG = [b'\x89PNG', b'\xff\xd8', b'RIFF', b'GIF8']
MAGIC = {'png': IMG, 'jpg': IMG, 'jpeg': IMG, 'pdf': [b'%PDF'], 'zip': [b'PK'], 'docx': [b'PK'], 'rar': [b'Rar!'], 'mp4': []}

def target_path(rel):
    parts = rel.split('/')
    if any(p in ('', '.', '..') for p in parts):
        raise ValueError(f"unsafe path: {rel}")
    full = os.path.realpath(os.path.join(dest_root, *parts))
    if not full.startswith(dest_root + os.sep):
        raise ValueError(f"escapes destination: {rel}")
    return full

def looks_right(path, ext, head):
    if ext == 'mp4':
        return head[4:8] == b'ftyp'
    sigs = MAGIC.get(ext)
    return True if sigs is None else any(head.startswith(s) for s in sigs)

def download(item):
    path = target_path(item['path'])
    ext = item['path'].rsplit('.', 1)[-1].lower()
    url = f"https://drive.usercontent.google.com/download?id={item['id']}&export=download&confirm=t"
    last = None
    for attempt in range(6):
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            h = hashlib.sha256(); size = 0; head = b''
            with urllib.request.urlopen(url, timeout=300) as r, open(path + '.part', 'wb') as f:
                while True:
                    chunk = r.read(1 << 20)
                    if not chunk: break
                    if len(head) < 16: head += chunk[:16]
                    h.update(chunk); size += len(chunk); f.write(chunk)
            if not looks_right(path, ext, head):
                raise ValueError(f"unexpected content (got {head[:12]!r})")
            os.replace(path + '.part', path)
            return {**item, 'size': size, 'sha256': h.hexdigest(), 'ok': True}
        except Exception as e:
            last = str(e)
            time.sleep(min(60, 3 * 2 ** attempt))
    return {**item, 'ok': False, 'error': last}

results = []
with ThreadPoolExecutor(max_workers=6) as pool:
    futures = [pool.submit(download, i) for i in items]
    for n, fut in enumerate(as_completed(futures), 1):
        results.append(fut.result())
        if n % 50 == 0:
            print(f"{n}/{len(items)} done, failures so far: {sum(not r['ok'] for r in results)}", flush=True)
json.dump(results, open(manifest_out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
bad = [r for r in results if not r['ok']]
print(f"FINISHED: {len(results) - len(bad)} ok, {len(bad)} failed, {sum(r.get('size', 0) for r in results) / 1e9:.2f} GB")
for r in bad[:20]: print("FAILED:", r['path'], r['error'])
