# Plan 06 — Documentation Truthfulness

**Goal:** keep the `index.md` system and inline docs accurate after Plans 01–05. Do this
last so docs match the final code.

## Task 1 — Fix the known doc drift
`src/components/modals/index.md` states `CenteredModal` is "Used by … `ConfirmDialog`"
and that `ConfirmDialog` is "built on `CenteredModal`". Today that is false
(`ConfirmDialog.tsx` implements its own backdrop at `z-[110]`). Either:
- (a) if Plan 02 Phase G did **not** refactor `ConfirmDialog` onto `CenteredModal`,
  correct the wording to describe `ConfirmDialog` as a standalone dialog using
  `useEscapeKey`+`useBackdropDismiss`; or
- (b) if a future change does build it on `CenteredModal`, keep the wording and ensure
  the code matches.
Pick the option that matches the shipped code.

## Task 2 — Reconcile every `index.md` touched by the refactor
For each module added/moved/renamed in Plans 01–05, update the owning directory's
`index.md` file table + cross-references. Specifically expect edits to:
- `src/hooks/index.md` — add new hooks: `usePendingConfirm`, `useInlineRename`,
  `useDragReorder`, `useCopyToClipboard` (Plan 02).
- `src/features/editor/index.md` — add `useEditorAutocomplete`,
  `EditorAutocompletePopover` (Plan 02 Phase A).
- `src/features/slash-commands/index.md` — add `run-built-in-command` (Phase F).
- `src/lib/index.md` — add `id.ts` (`makeId`, Phase H) and, if created,
  `theme/font-loader.ts` under `src/lib/theme/index.md` (Plan 04); adjust the
  `storage.ts` row for the new helpers (Plan 03).
- `src/lib/theme/index.md` — if `ALL_FONT_STACKS` was removed (Plan 01 Task 2), drop it
  from the `fonts.ts` row.
- `src/components/index.md` / a new `src/components/gallery/index.md` — if Plan 02 Phase
  I created gallery primitives.
- Any `index.md` whose "Cross-references" list changes because imports moved.

## Task 3 — Inline docs
- Keep/extend the JSDoc style already present on shared utils
  (`editor-insert.ts`, `editor-popover-position.ts`, hooks) for every new shared module:
  one short block explaining purpose + the parameters that capture call-site differences
  (e.g. `useEditorAutocomplete`'s `triggerKey`/`isQueryChar`).
- Add a one-paragraph note (in `src/lib/index.md` or `src/stores/index.md`) clarifying
  the **three** persistence layers and when to use each: synchronous `localStorage`
  (`lib/storage` `getFromLocalStorage`/`setToLocalStorage`), async key-value
  `idb-keyval` (`lib/storage` `getFromIDB`/`setToIDB`, used by `projects`/`chaining`/
  session restore), and the raw IndexedDB Blob driver (`music-player/audio-db.ts`).
- If Plan 03 added keyboard keys to `STORAGE_KEYS`, reflect that in
  `src/lib/index.md`'s `constants.ts` row.

## Acceptance
- Every statement in the touched `index.md` files is verifiable against the code
  (spot-check each "Exports" cell and cross-reference).
- No `index.md` references a removed symbol/dep (`nuqs`, `howler`, `@floating-ui/dom`,
  `react-hotkeys-hook`, `sharedVideoController`, and `ALL_FONT_STACKS` if removed).
- New shared modules each appear in exactly one directory `index.md`.
