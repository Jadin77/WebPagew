# ScriptBlox Integration Rules

Last updated: 2026-02-18

## Current Safe Data Contract (Do Not Expand Lightly)
As of this date, large stable pulls are optimized around these fields:

- `title`
- `slug`
- `image`
- `views`
- `createdAt`
- local flags: `trusted`, `trending`, moderation flags

Optional field (best-effort only):
- `ownerUsername` (from cache or limited detail lookup)

## Important Stability Rule
Do not increase heavy per-script detail lookups during bulk pulls unless testing carefully.

Reason:
- detail lookups reduce throughput
- can trigger rate limits
- can collapse large page pulls (100+ pages)

## Recommended Pull Modes
1. Bulk mode (daily/main refresh):
- `MaxPages` high
- `MaxDetailLookupsPerRun = 0`
- keeps very large catalog pulls stable

2. Enrichment mode (optional small pass):
- low `MaxPages`
- small `MaxDetailLookupsPerRun`
- used only when improving owner coverage

## Change Safety
Before changing ScriptBlox fetch logic:
1. Create restore point zip.
2. Test with low pages first.
3. Then test high-page run.
4. Roll back if pages drop or rate-limit warnings increase.

## Rollback Reference
- Latest restore snapshot is in `Webinfo/` (dated zip files).
