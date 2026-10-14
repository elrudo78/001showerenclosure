import html, json, re, sys, time, urllib.request

ROOT = sys.argv[1]
OUT = sys.argv[2]

def fetch(fid):
    url = f"https://drive.google.com/embeddedfolderview?id={fid}"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"failed to list {fid}")

entry_re = re.compile(r'<div class="flip-entry" id="entry-([^"]+)".*?<a href="([^"]+)".*?<div class="flip-entry-title">(.*?)</div>', re.S)

def walk(fid, path, out):
    page = fetch(fid)
    for eid, href, title in entry_re.findall(page):
        name = html.unescape(title)
        if '/folders/' in href:
            walk(eid, f"{path}/{name}", out)
        else:
            out.append({"id": eid, "path": f"{path}/{name}"})

items = []
walk(ROOT, sys.argv[3] if len(sys.argv) > 3 else "public-materials", items)
json.dump(items, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print("files:", len(items))
