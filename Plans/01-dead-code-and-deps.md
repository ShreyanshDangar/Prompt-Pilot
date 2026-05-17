# Plan 01 — Dead Code & Unused Dependency Removal

**Goal:** remove confirmed-unused dependencies and dead exports. Lowest risk, do first.
**Verify-first:** before removing each dependency, re-run
`grep -rniE "<token>" src/` to reconfirm zero usage (tokens below). Trust the grep over
this document if they disagree.

## Task 1 — Remove dead dependencies (no UI/UX impact)
These have **zero** references anywhere under `src/` (verified):
- `nuqs` — search tokens: `nuqs`, `useQueryState`, `parseAs`.
- `howler` and `@types/howler` — tokens: `howler`, `Howl`, `new Howl`. (Music uses
  native `HTMLAudioElement`; keyboard sound uses Web Audio `AudioContext`.)
- `@floating-ui/dom` — tokens: `floating-ui`, `computePosition`, `autoUpdate`,
  `useFloating`. (Cursor popovers use `editor.view.coordsAtPos` in
  `src/features/editor/editor-popover-position.ts`.)
- `react-hotkeys-hook` — tokens: `react-hotkeys-hook`, `useHotkeys`. (Shortcuts are
  manual `document.addEventListener("keydown", …)`, e.g. `CommandPalette.tsx` Cmd/Ctrl-K.)

Steps:
1. Remove those 5 entries from `package.json` (`dependencies` + `devDependencies`).
2. Regenerate the lockfile with the repo's package manager (`npm install`) so
   `package-lock.json` matches. This is the one place this plan touches a lockfile —
   it is required, not optional.
3. `npm run build` + `npm run lint` must pass. `npx tsc -b` must be clean.

**Acceptance:** build/lint/type-check green; `grep -rniE "nuqs|howler|floating-ui|react-hotkeys-hook" src/` returns nothing; bundle no longer contains those modules.

## Task 2 — Remove dead exports
- `src/features/virtual-keyboard/legacy/VideoFrameController.ts`: delete
  `export const sharedVideoController = controllers.small` (line ~216). It is never
  imported; `getKeyController(size)` is the live accessor. Confirm with
  `grep -rn "sharedVideoController" src/`.
- `src/lib/theme/fonts.ts`: `ALL_FONT_STACKS` (line ~31) has no source importer
  (confirm `grep -rn "ALL_FONT_STACKS" src/`). Prefer **keeping** it only if Plan 04's
  font-loader will consume it; otherwise remove it and drop its mention from
  `src/lib/theme/index.md`. Decide based on Plan 04 (the font-loader needs a
  name→family-query map, which can build on `FONT_STACKS`/`ALL_FONT_STACKS`). If Plan
  04 consumes it, leave it and note that in this task's commit message.

**Acceptance:** type-check clean (strict `noUnusedLocals` will flag truly-dead locals);
no behavior change.

## Task 3 — `[REQUIRES USER APPROVAL]` Drop `@tabler/icons-react`
`@tabler/icons-react` is used only in
`src/features/virtual-keyboard/mac/MacKeyboard.tsx` (~20 icons: `IconBrightnessDown/Up`,
`IconCaret{Up,Down,Left,Right}Filled`, `IconChevronUp`, `IconCommand`, `IconMicrophone`,
`IconMoon`, `IconPlayer{SkipForward,TrackNext,TrackPrev}`, `IconSearch`, `IconTable`,
`IconVolume`/`Volume2`/`Volume3`, `IconWorld`, `IconBrandWindows`). Removing the whole
dependency requires substituting lucide-react equivalents. **Several glyphs differ
visually** (filled carets vs lucide chevrons; no exact `BrandWindows`), so this changes
the on-screen Mac-keyboard appearance → approval required.
- If approved: map each Tabler icon to the closest `lucide-react` icon (or an inline
  SVG matching the current glyph, in the spirit of the existing local `OptionKey` SVG
  in `MacKeyboardKeys.tsx`), then remove `@tabler/icons-react` from `package.json` and
  regenerate the lockfile.
- If not approved: leave `@tabler/icons-react` as-is (it is isolated to the lazy
  `VirtualKeyboard` chunk and does not bloat the `index` chunk).

**Acceptance (if approved):** keyboard renders with no missing/placeholder icons;
`grep -rn "@tabler" src/` empty; build/lint green.
