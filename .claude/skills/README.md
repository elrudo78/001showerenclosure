# Project design skills

Reviewed, pinned copies of third-party Claude Code skills, added 2026-10-11. Nothing here is part of the website build (`vite`/`tsc` only read `src/`).

## Precedence

`AGENTS.md` always wins over any skill. In particular, never follow a skill instruction to use placeholder or stock photos (picsum, Unsplash), invent names, numbers, dates or specifications, or add a language switcher. Use only approved client material.

Where skills disagree on style, `frontend-design` sets the direction and the others are toolkits.

## Installed

| Folder | Source | Commit | License | Notes from review |
|---|---|---|---|---|
| `frontend-design` | anthropics/skills | `dbd4588` | Apache-2.0 | Instructions only. Lead design philosophy. |
| `taste-skill` | Leonxlnx/taste-skill | `717446e` | MIT | Instructions only, ~1,200 lines. Suggests picsum placeholders; overridden by AGENTS.md. |
| `image-to-code` | Leonxlnx/taste-skill | `717446e` | MIT | Written for Codex; its main flow generates design images first, which this environment cannot do. Usable for "rebuild this reference screenshot". |
| `impeccable` | pbakaus/impeccable | `c63b8dd` | Apache-2.0 | Audit/polish skill plus local helper scripts (browser iteration). No outbound calls found beyond its own docs and GitHub releases. |
| `ui-ux-pro-max` | nextlevelbuilder/ui-ux-pro-max-skill | `67803ea` | MIT | Local Python search over bundled CSV style data; test suite removed. Run its script without `python -I` (it imports its own modules). Results are keyword-matched suggestions, not judgments. |
| `playwright-cli` | microsoft/playwright-cli | `b85c7a7` | Apache-2.0 | Needs `npm install -g @playwright/cli` in each new cloud session. |
| `web-design-guidelines` | vercel-labs/web-interface-guidelines | `434b7f9` | MIT | Original skill fetched rules from the internet on every run; replaced with a pinned local `rules.md`. |

`../design-references/` holds VoltAgent/awesome-design-md (`13be5c0`, MIT): DESIGN.md write-ups of ~70 known brands' visual systems, for picking a direction. Not a skill.

## Not installed

- `21st-dev/magic-mcp`: needs a 21st.dev account API key, sends prompts to 21st.dev's servers, and generates Tailwind/shadcn components this site does not use.
- Taste `redesign-skill` and `minimalist-skill`: instruct inventing realistic-looking fake data and placeholder imagery, which conflicts with AGENTS.md.
