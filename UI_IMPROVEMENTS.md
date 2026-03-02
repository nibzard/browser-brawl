# UI Improvements — `mehul/ui-improvements` Branch

## Summary

This branch contains UI polish and branding changes to the Browser Brawl lobby and history page. Below is what was done, what still needs verification, and what a follow-up agent needs to know.

> Note (March 2026 cleanup): several experimental selector components referenced below were removed from `main` because they were unused.

---

## Changes Made (13 files modified)

### Branding: Cat/Mouse → Attacker/Defender

- **`src/lib/constants.ts`** — `WINNER_SHORT` changed from `{ attacker: 'Mouse', defender: 'Cat' }` to `{ attacker: 'Attacker', defender: 'Defender' }`. This is the critical fix — these labels appear in history tables.
- **`src/app/api/game/start/route.ts`** — Updated comments from "Playwright MCP/Stagehand" to "Claude+Playwright/Browserbase".
- **`src/lib/attacker-stagehand.ts`** — Updated comments and `[stagehand]` console.log tags to `[browserbase]`. Variable names referencing the `@browserbasehq/stagehand` npm package were left as-is (they come from the external package).
- **`src/lib/attacker-step-logger.ts`** — Updated comment referencing agent names.

### Stagehand → Browserbase Rename

- **`src/types/game.ts`** — `AttackerType` union: `'stagehand'` → `'browserbase'`
- **`src/lib/attacker-agent.ts`** — Dispatch branch: checks `'browserbase'` instead of `'stagehand'`. Import alias renamed from `runStagehand` to `runBrowserbase`. Still imports from `./attacker-stagehand` (file not renamed).
- **`src/components/lobby/FighterSelect.tsx`** — Fighter entry: `value: 'browserbase'`, `name: 'BROWSERBASE'`, updated description. **Image path kept as `/fighters/stagehand.jpg`** because no `browserbase.jpg` exists yet.
- **`src/components/arena/ArenaHeader.tsx`** — `ATTACKER_TYPE_LABELS`: key `'stagehand'` → `'browserbase'`, label `'Stagehand'` → `'Browserbase'`.

### Playwright MCP → Claude + Playwright Rename

- **`src/components/lobby/FighterSelect.tsx`** — `name: 'PLAYWRIGHT MCP'` → `'CLAUDE + PLAYWRIGHT'`, updated description.
- **`src/components/arena/ArenaHeader.tsx`** — `ATTACKER_TYPE_LABELS['playwright-mcp']`: `'Playwright MCP'` → `'Claude + Playwright'`.

### Lobby Page (`src/components/lobby/LobbyScreenV1.tsx`)

- **GitHub badge** — Top-right of title area (absolute positioned). SVG GitHub icon + "★ Star on GitHub" text linking to `https://github.com/RichardHruby/browser-brawl`.
- **Marketing tagline** — Three lines below "BROWSER BRAWL" title:
  - "Live adversarial browser-agent arena."
  - "Two AI agents battle on live websites. One completes tasks. The other sabotages the DOM."
  - "Learn more →" link to GitHub repo.
- **Sticky bottom bar** — Added `sticky bottom-0 z-10` to the bottom action bar.
- **Prior Traces link** — Changed `[ MATCH HISTORY ]` → `[ PRIOR TRACES ]`, bumped to `text-xs opacity-0.7` with hover underline.

### Arena Selector (`src/components/lobby/ArenaSelector.tsx`)

- **Custom Arena → Custom Task** — Renamed label and button text.
- **Hover tooltips** — Added on all arena rows + custom task row using Tailwind `group-hover` pattern. Tooltips show task description for preset arenas, static text for custom.

### Mode Toggle

- **Historical note** — A standalone `ModeToggle` component was used during experimentation, but the current lobby flow no longer imports it.

### History Page (`src/app/history/page.tsx`)

- **Heading** — `GAME HISTORY` → `PRIOR TRACES`.

---

## Known Issues & Remaining Work

### Must Fix
1. **BROWSERBASE fighter portrait uses `stagehand.jpg`** — The image path is `/fighters/stagehand.jpg` because no `/public/fighters/browserbase.jpg` exists. Either add a proper Browserbase image or rename the existing file.

### Should Verify Visually
2. **Tooltip positioning** — The arena and mode tooltips use `absolute left-full` positioning. On narrow screens or when the selector is near the right edge, tooltips may overflow. Needs visual check on mobile viewports.
3. **Sticky bottom bar on mobile** — Verify it doesn't overlap content on small screens.
4. **GitHub badge positioning** — Uses `absolute right-0 top-0` inside the title block. May need adjustment depending on viewport.

### Not Done (Out of Scope for This Pass)
5. **Full cat/mouse grep sweep** — `constants.ts` was fixed. There may be other cat/mouse references in non-UI files (comments, logs) that weren't caught. Run: `grep -ri "cat\|mouse" src/ --include="*.ts" --include="*.tsx"` to check.
6. **File rename: `attacker-stagehand.ts`** — The file is still named `attacker-stagehand.ts` even though it's now the "Browserbase" attacker. The import in `attacker-agent.ts` references `./attacker-stagehand`. Renaming the file would be cleaner but requires updating all imports.
7. **`CLAUDE.md` updates** — The project README still references "Stagehand" and "Playwright MCP" in many places. Should be updated to match the new naming.

---

## File Change Summary

| File | What Changed |
|------|-------------|
| `src/types/game.ts` | `AttackerType`: `'stagehand'` → `'browserbase'` |
| `src/lib/constants.ts` | `WINNER_SHORT`: Mouse/Cat → Attacker/Defender |
| `src/lib/attacker-agent.ts` | Dispatch: `'stagehand'` → `'browserbase'` |
| `src/lib/attacker-stagehand.ts` | Comments + log tags updated |
| `src/lib/attacker-step-logger.ts` | Comment updated |
| `src/components/lobby/LobbyScreenV1.tsx` | GitHub badge, tagline, sticky bar, Prior Traces |
| `src/components/lobby/FighterSelect.tsx` | CLAUDE+PLAYWRIGHT, BROWSERBASE renames |
| `src/components/lobby/ArenaSelector.tsx` | Custom Task rename, hover tooltips |
| `src/components/arena/ArenaHeader.tsx` | Display labels updated |
| `src/app/history/page.tsx` | GAME HISTORY → PRIOR TRACES |
| `src/app/api/game/start/route.ts` | Comments updated |
