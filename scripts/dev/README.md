# Dev helper scripts

Working tools used during the October 2026 review and audit. None of them run as part of the website build.

## Setup in a fresh cloud session

```bash
python3 -m venv /tmp/venv-tools
/tmp/venv-tools/bin/pip install pillow imagehash pymupdf imageio-ffmpeg
```

Playwright is preinstalled globally. Import it by full path (`/opt/node22/lib/node_modules/playwright/index.mjs`); `chromium-*` lives under `/opt/pw-browsers/`.

## Client materials from Google Drive

The Drive folder link is in the chat history only. Never commit it: the repository is public and the `reference` folder holds personal data.

1. `python3 -I drive_list.py <folder-id> <out.json> public-materials` lists every file recursively (uses Drive's `embeddedfolderview`, no 50-file limit).
2. `python3 -I drive_download.py <out.json> client-materials <manifest.json>` downloads into the git-ignored `client-materials/`, with retries and file-type checks.

Expected counts: `public-materials` 805 files (644 unique), `reference` 98 files. Drive shows 987 because it counts 84 folders too.

## Review helpers

- `prep_curation.py <public-materials dir> <out dir>`: SHA-256 dedupe, same-folder near-duplicate grouping, 1024px previews, video frame strips, PDF page 1.
- `render_catalogs.py <reference dir> <out dir>`: renders catalog PDF pages at 1600px and splits them into batches.

## Testing the live or preview site from the cloud session

External HTTPS goes through the agent proxy, which re-signs certificates, so headless Chromium must use the proxy and trust its CA by SPKI pin:

```bash
export SPKI_PIN=$(openssl x509 -in /root/.ccr/agent-proxy-ca.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64)
node audit-pages.mjs <out dir>      # uses $HTTPS_PROXY and $SPKI_PIN
```

The proxy port and CA change when the session restarts, so always read them from the environment.

- `audit-pages.mjs`: every page at 1440px and 390px; overflow, broken images, em dashes, tiny text, console errors, full-page screenshots.
- `audit-fonts.mjs`: checks whether web fonts actually load (do not trust `document.fonts.check`, which returns true for fonts that do not exist).
- `audit-evidence.mjs`: element screenshots used in `docs/audit/`.
- `screenshot-local.mjs <url> <prefix>`: desktop and mobile full-page screenshots of a local server.

Lighthouse: install into a scratch folder (`npm install lighthouse@12`) and run with `CHROME_PATH=/opt/pw-browsers/chromium-*/chrome-linux/chrome` and `--chrome-flags="--headless=new --no-sandbox --proxy-server=$HTTPS_PROXY --ignore-certificate-errors-spki-list=$SPKI_PIN"`.

## Gotchas

- The site uses `scroll-behavior: smooth`, so repeated `window.scrollTo` in a headless test skips scroll-triggered effects. Scroll with `page.mouse.wheel` before full-page screenshots.
- Do not stop processes with `pkill -f "<pattern>"` in the same command line that contains the pattern; it kills the shell running it. Find the PID first.
- Run Python on downloaded files with `python3 -I`, except `.claude/skills/ui-ux-pro-max/scripts/search.py`, which needs its own folder on the path.
