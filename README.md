# WebPagew

## Current Site State

This repo now has a multi-page storefront + live Free Scripts feed setup.

## Main Pages

- `index.html`
  - Branded as **Roblox Tweaks**
  - Header logo placeholder uses `images/Logo.png` (falls back to `RT` if missing)
  - Hero title: `Roblox Tweaks`
  - Subtitle: `Beta`
  - Hero line: `Launching Soon!`
  - Rotating featured carousel (3 slides, 10s autoplay, prev/next arrows, clickable slides)
  - Footer: `© 2026 Roblox Tweaks. All rights reserved.`
- `roblox-scripts.html`
- `roblox-studio.html`
- `programs.html`
- `socials.html`
- `free-scripts.html`

All nav links open in the same tab (normal page navigation).

## Image Folder Structure

Created folder tree:

- `images/logo/Logo.svg`
- `images/roblox-scripts/Product A.svg`
- `images/roblox-scripts/Product B.svg`
- `images/roblox-scripts/Product C.svg`
- `images/roblox-studio/Product A.svg`
- `images/roblox-studio/Product B.svg`
- `images/roblox-studio/Product C.svg`
- `images/programs/Product A.svg`
- `images/programs/Product B.svg`
- `images/programs/Product C.svg`
- `images/socials/Product A.svg`
- `images/socials/Product B.svg`
- `images/socials/Product C.svg`
- `images/free-scripts/Product A.svg`
- `images/free-scripts/Product B.svg`
- `images/free-scripts/Product C.svg`

How to replace later:

- Keep the same file names and paths, then overwrite placeholders with your real images.
- If you change names, update the matching `src` path in the related page file.

## Theme System

- Shared theme engine: `theme.js`
- In-page settings modal on index + Free Scripts + the new section pages
- Theme selection persists across pages via localStorage key:
  - `webpage_theme`

## Free Scripts Feed

Feed files generated locally:

- `scriptblox-feed.json`
- `scriptblox-feed.js`

Updater script:

- `refresh-scriptblox-feed.ps1`

Free Scripts UI currently includes:

- live feed card grid
- image + title + tags + views (`👁` chip)
- pagination
- tabs:
  - `All Scripts`
  - `Trusted Scripts`
  - `Trending`
- search input (title/tags)
- anti-scam status line with rotating phrase styles
- branded footer `© 2026 Roblox Tweaks. All rights reserved.`

## Moderation (Title-Based)

Folder:

- `moderation/`

Files:

- `moderation/settings.json`
  - `max_posts_per_window`
  - `window_minutes`
- `moderation/blacklist-keywords.txt`
  - blocks scripts when keyword phrase rules match title text
- `moderation/trusted-keywords.txt`
  - marks scripts as trusted when rules match title text
- `moderation/auto-blacklist-titles.txt`
  - auto-detected repeated title keys
- `moderation/auto-blacklist-log.jsonl`
  - append-only event log

## Feed Refresh Commands

Regular safe refresh:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\spoll\WebPage\WebPagew\refresh-scriptblox-feed.ps1
```

Large refresh (restores many pages/items):

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\spoll\WebPage\WebPagew\refresh-scriptblox-feed.ps1 -Force -MaxPages 70 -DelayMs 1400 -MinIntervalMinutes 0
```

Safer two-pass refresh (bulk first, then owner enrichment):

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\spoll\WebPage\WebPagew\refresh-scriptblox-feed-two-pass.ps1 -BulkPages 40 -BulkDelayMs 2500 -EnrichPages 6 -EnrichLookups 20 -EnrichDelayMs 1800 -MinIntervalMinutes 30
```

## Rate-Limit Notes

- ScriptBlox can rate-limit heavy request bursts.
- Use delay/cooldown values in the refresh script.
- If rate-limited, wait before retrying.
