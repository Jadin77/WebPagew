# Webpage Status + Roadmap

Last updated: 2026-02-18

## Current Success State
- Free Scripts feed is stable again on high pulls.
- Bulk run tested at `MaxPages=100` and produced large visible dataset.
- UI system is centralized in shared scripts:
  - `theme.js`
  - `site-ui.js`
  - `ui-sounds.js`
  - `site-content.js`

## Active Data Strategy
- Bulk data for performance:
  - `title`, `slug`, `image`, `views`, `createdAt`
- Optional owner enrichment:
  - `ownerUsername` only when safe/limited
- Keep bulk mode fast first, enrichment second.

## Live UX Features
- Theme packs, font presets, glow slider, text scale
- Persistent settings across pages
- Store CTA and timed store nudge popup
- Unified nav scaling/compaction rules
- Free Scripts tabs with search + pagination

## Important Files
- `refresh-scriptblox-feed.ps1` (feed generation + moderation + optional owner enrichment)
- `scriptblox-feed.json` (main rendered data source)
- `scriptblox-owner-cache.json` (owner cache)
- `free-scripts.html` (feed UI)

## Next Planned Update (Requested)
Build stronger anti-scam moderation by username:

1. Add username-based blacklist (hide all posts by blocked users)
2. Add trusted-users list
3. Rename current tab:
- `Trusted` -> `Recommend Scripts`
4. Add new tab:
- `Trusted` (real trusted users)
5. New trusted tab behavior:
- list trusted users with profile image
- click user -> ScriptBlox profile
6. Seed trusted user:
- `IHeartCoding`
7. Seed blacklist users:
- `prokhenzu`
- `afkk`
- `ccapi1337`
- `PalaceScriptz`
- `xtvoo`
- `xwxwzxwxwzx`

## Safety Note
- Username-based moderation depends on owner username coverage.
- Keep bulk pull stable; enrich owner data in controlled passes only.
