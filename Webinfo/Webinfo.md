# Webinfo Memory Bank

Last updated: 2026-02-18

## Current Direction
- Keep GitHub Pages workflow and avoid backend dependencies.
- Prioritize stable UI polish, persistent user settings, and easy content updates.
- Keep Free Scripts feed reliable while preserving moderation/trending UX.

## Live Feature Set
- Theme system with expanded packs (includes `Dark Mode`, `Crimson Night`).
- Persistent settings (localStorage) across all pages:
  - Theme
  - Theme glow
  - Font
  - Text scale (`75%` to `105%`, default `85%`)
  - Sound preset
  - Website volume
- Global UI enhancer via `site-ui.js`:
  - Nav normalization/grouping
  - Home motion polish
  - Settings enhancements
  - Store nudge popup
- Content workflow via JSON:
  - `site-content.js` + `content/*.json`
- Free Scripts includes:
  - Search
  - All/Trusted/Trending tabs
  - Pagination
  - ScriptBlox local feed rendering

## Recent Changes (Newest)
- Store button text changed to `Store` with improved CTA styling.
- Store nudge popup timing updated:
  - Show every `120` seconds
  - Visible for `5` seconds
- Header scaling updated to reduce overlap risk:
  - tighter nav button padding and size
  - responsive text behavior
- `Webinfo.md` moved into `Webinfo/` folder.

## Key Files
- `theme.js` - theme/font/scale/glow persistence APIs
- `site-ui.js` - global nav/layout/settings behavior
- `ui-sounds.js` - sound presets + volume
- `site-content.js` - JSON page content rendering
- `content/home.json`
- `content/roblox-scripts.json`
- `content/roblox-studio.json`
- `content/programs.json`
- `content/socials.json`
- `free-scripts.html` - ScriptBlox feed page

## Next Good Steps
1. Add `Reset Settings` button (theme/font/scale/glow/sounds).
2. Add reduced-motion accessibility toggle.
3. Add publish checklist section to this file.
