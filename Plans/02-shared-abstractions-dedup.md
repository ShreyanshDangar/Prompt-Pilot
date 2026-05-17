# Plan 02 — Code Deduplication via Shared Abstractions

**Goal:** replace verified duplicate/near-duplicate sites with shared hooks,
components, and utils. **Behavior and markup must stay byte-equivalent** — extract,
don't redesign. Do each sub-phase as its own commit; after each, build + lint + smoke
the affected feature.

> Where a shared component changes class names or DOM nesting in a way that could alter
> rendered output, treat it as `[REQUIRES USER APPROVAL]`. The intent is that the
> extracted component emits the *same* DOM/classes the call sites emit today.

## Phase A — Editor autocomplete popover (highest value)
`src/features/slash-commands/SlashCommandPopover.tsx` (forwardRef, ~299 lines) and
`src/features/xml-tags/XmlTagAutocompletePopover.tsx` (forwardRef, ~227 lines) are
near-identical: same state (`isOpen`, `query`, `selectedIndex`, `position`,
`triggerPos`/`slashPos`), same `updatePosition` calling
`getCursorPopoverPosition(editor, pos, {width:288,height:320})`, same `close()`, same
`scrollIntoView` effect, same key state-machine (trigger char opens; Escape/Arrow/Enter;
Backspace-empty close; space close; char append/remove), and the same popover JSX
(`fixed inset-0 z-40` overlay + `motion.div panel-surface … w-72` with identical motion
props, header, results list, `bg-accent/15 text-accent` selection, empty-state).

Create `src/features/editor/useEditorAutocomplete.ts` (a hook) returning
`{ isOpen, query, selectedIndex, position, open, close, handleKeyDown, setSelectedIndex }`,
parameterized by:
- `triggerKey` (`"/"` vs `"<"`),
- `isQueryChar(e: KeyboardEvent): boolean` (slash: any single char; xml:
  `/[a-zA-Z0-9_-]/`),
- `closeKeys` (slash closes on `" "`; xml closes on `" "` and `">"`),
- `acceptKeys` (slash: `Enter`; xml: `Enter`+`Tab`),
- `resultsLength` (so Arrow clamping matches today).

Create a presentational `src/features/editor/EditorAutocompletePopover.tsx` that renders
the shared overlay+panel+list shell and takes `icon`, `headerText`, `items`,
`renderItem`, `selectedIndex`, `onSelect`, `onHover`, `position`, `emptyText`. Keep the
exact Tailwind classes and framer-motion props currently used (copy them verbatim).

Refactor both popovers to consume the hook + shell, preserving their unique bits:
- slash: built-in command routing (see Phase F), variable-fill via `VariableFillModal`,
  `slashInsertionMode` block/inline insert using `textToParagraphNodes`,
  `incrementUsage`.
- xml: insert `<tag></tag>` and place caret between tags.

**Acceptance:** typing `/` and `<` in the editor behaves identically (open, filter,
arrow nav, Enter/Tab/Escape, insertion); `data-popover="slash"` / `="xml-tag"`
attributes preserved (CSS in `globals.css:468-485` targets `[data-popover]`).

## Phase B — `usePendingConfirm` + ConfirmDialog (most widespread)
The pattern `const [pendingX, setPendingX] = useState<string|null>(null)` + a
`ConfirmDialog` whose `onConfirm` deletes + toasts appears in ~8 places:
`ProjectsPage.tsx` (folder + project), `ChainDetail.tsx` (step), `ChainingView.tsx`
(chain), `MusicTrackList.tsx` (track), `MusicPlaylists.tsx` `PlaylistsTab` (playlist),
`SlashCommandGallery.tsx` (command), `XmlTagGallery.tsx` (tag), `EditorTabBar.tsx` (tab
close, with extra "don't ask again").

Create `src/hooks/usePendingConfirm.ts`:
`const c = usePendingConfirm<TId>()` → `{ pendingId, request(id), clear(), isOpen }`.
Optionally a thin `src/components/modals/ConfirmDeleteDialog.tsx` wrapper that takes
`{ pending, getTitle(id), message, confirmLabel, onConfirm, onCancel, extraContent? }`
and renders `ConfirmDialog`. Keep `EditorTabBar`'s "don't ask again" via `extraContent`
(don't fold the `skipDirtyCloseConfirm` logic into the hook).

**Acceptance:** every delete/close confirm flow shows the same dialog text and performs
the same store mutation + toast.

## Phase C — Inline-rename hook
`EditorTabBar.tsx` (tab rename), `FolderRow.tsx`, and `MusicPlaylists.tsx` `PlaylistName`
all implement: `editing` + `draft` + `commit()` (trim, skip if unchanged) + Enter
commits / Escape reverts / blur commits / autoFocus input.

Create `src/hooks/useInlineRename.ts`:
`useInlineRename(initial, onCommit)` →
`{ editing, draft, setDraft, start(), commit(), cancel(), inputProps }` where
`inputProps` wires `value/onChange/onBlur/onKeyDown(Enter,Escape)/autoFocus`. Refactor
the three sites to use it; keep each site's surrounding markup and the
`toast.success("Folder renamed")` etc. at the call site.

**Acceptance:** rename interactions identical (Enter, Escape-revert, blur-commit).

## Phase D — Drag-reorder hook
HTML5 drag-reorder list logic is duplicated in `ChainDetail.tsx`/`ChainNode.tsx`
(`dragIndex`/`dragOverIndex` + start/over/leave/drop/end → `reorderSteps`),
`MusicTrackList.tsx` (`dragIndex` → `reorderTrack`), and `MusicPlaylists.tsx`
`PlaylistsTab` (`playlistDragIndex` → `reorderPlaylistTrack`).

Create `src/hooks/useDragReorder.ts`:
`useDragReorder(onReorder: (from:number,to:number)=>void)` →
`{ dragIndex, dragOverIndex, getItemProps(index) }` where `getItemProps` returns the
`draggable`/`onDragStart`/`onDragOver`/`onDragLeave`/`onDrop`/`onDragEnd` handlers and
the caller applies the existing `opacity-50`/`border-accent` classes from
`dragIndex`/`dragOverIndex`. Keep the chain's per-item `ChainNode` API; just source its
drag handlers from the hook in `ChainDetail`.

**Acceptance:** reordering steps/tracks/playlist-tracks works identically incl. the
drag-over highlight.

## Phase E — `useCopyToClipboard`
Copy-text-then-toast(+transient check) is duplicated in `CopyButton.tsx`,
`CommandPalette.tsx` (`handleCopy`), `OpenInDropdown.tsx` (clipboard fallback paths),
and `XmlTagGallery.tsx` `TagCard` (which hardcodes `1500` instead of
`COPY_FEEDBACK_DURATION_MS`).

Create `src/hooks/useCopyToClipboard.ts`:
`useCopyToClipboard()` → `{ copied, copy(text, opts?) }` where `copy` does
`navigator.clipboard.writeText`, sets `copied` true for `COPY_FEEDBACK_DURATION_MS`
(`src/lib/constants.ts`), and fires `opts.successMessage`/`opts.errorMessage` toasts.
Refactor the four sites; replace the hardcoded `1500` in `TagCard` with the constant.
Keep `CopyButton`'s framer-motion Copy/Check swap markup.

**Acceptance:** copy buttons show the same toast + check animation; feedback duration
unified to the constant.

## Phase F — Built-in slash-command routing util
`/create`, `/templates`, `/projects`, `/help` routing is implemented twice:
`CommandPalette.tsx` `runSlashCommand` and `SlashCommandPopover.tsx` `insertCommand`.

Create `src/features/slash-commands/run-built-in-command.ts` exporting a function that,
given a command name + callbacks (`openCreateModal`, `setActivePanel`, `openProjects`,
`helpToast`), performs the routing and returns whether it handled a built-in. Both call
sites delegate to it (the popover keeps its editor `deleteRange` step before calling).

**Acceptance:** built-in commands behave identically from both the palette and the
in-editor popover.

## Phase G — Migrate hand-rolled modals onto `CenteredModal`
`VariableFillModal.tsx` and `SlashCommandModal.tsx` hand-roll
`fixed inset-0 z-50 … bg-bg-overlay` + `motion.div panel-surface` instead of using
`src/components/modals/CenteredModal.tsx`. Refactor them to render their inner content
as `CenteredModal` children (CenteredModal already provides backdrop dismiss + Escape;
remove their now-redundant `useEscapeKey`). Verify z-index/stacking is unchanged
relative to the editor (CenteredModal is `z-[100]`); if the visual stacking or backdrop
blur differs from today, that is `[REQUIRES USER APPROVAL]`.
`ImagePreviewModal.tsx` is a specialized lightbox (arrow-key nav, `bg-black/80`,
full-bleed image) — keep its structure but replace its inline Escape handler with
`useEscapeKey` for consistency (no visual change).

**Acceptance:** modals open/close/Escape/backdrop-dismiss identically; same panel size
and animation.

## Phase H — `makeId` shared util
`crypto.randomUUID()` is called directly in `editor-store.ts`, `projects-store.ts`,
`chaining-store.ts`, `xml-tags-store.ts` (`custom-${…}`), and `ImageUploader.tsx`;
`music-store.ts` has a robust `makeId()` with fallback. Promote that to
`src/lib/id.ts` (`export function makeId()`), have `music-store` import it, and switch
the other sites to it (keep the `custom-` prefix at the xml-tags call site).

**Acceptance:** IDs still unique; no behavior change.

## Phase I — Gallery header primitives (medium priority)
`TemplateGallery`, `XmlTagGallery`, `ProjectsPage`, `SlashCommandGallery` repeat a
search-input header and (for templates/xml) an identical category-pill row
(`All` + mapped categories, same active classes). Extract
`src/components/gallery/GallerySearchInput.tsx` and
`src/components/gallery/CategoryPills.tsx` emitting the current markup verbatim, and
adopt them where the markup matches exactly. Skip any site whose markup differs (do not
force-fit). This phase is optional if diffs get risky — prioritize A–H.

**Acceptance:** gallery headers look and behave identically.

## Phase J — Toggle/Switch primitive (optional)
Two switch components exist: `ToggleSwitch` in `settings/SettingsPanel.tsx` and `Toggle`
in `popovers/KeyboardSettingsPopover.tsx` (also `RightPanelToggle` is a tab switch, not
this). They differ stylistically. Only unify if a single component can reproduce **both**
visuals via props without changing either's appearance; otherwise leave them and note
the decision. Visual change here is `[REQUIRES USER APPROVAL]`.

## Plan-02 acceptance (overall)
- `npm run build` + `npm run lint` + `npx tsc -b` green.
- New shared modules live in `src/hooks/`, `src/components/`, or the owning feature per
  the existing layering rules in `src/features/index.md`.
- Manual smoke of: slash + xml autocomplete, every delete-confirm, all renames, all
  drag-reorders, copy buttons, command-palette built-ins, the migrated modals.
- Update affected `index.md` (handed to Plan 06, but add the new files' rows now).
