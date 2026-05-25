# hooks/

App-wide React hooks. Feature-specific hooks live with their feature
(e.g. `features/virtual-keyboard/useKeyState.ts`,
`features/music-player/useMusicPlayerResize.tsx`).

| File | Exports | Purpose |
| --- | --- | --- |
| `useEscapeKey.ts` | `useEscapeKey(handler, active?, target?)` | Run a handler on Escape; passes the event through and supports `window`/`document` targets. |
| `useClickOutside.ts` | `useClickOutside(refs, handler, active?)` | Fire when a `mousedown` lands outside one or more refs (panel + trigger). |
| `useBackdropDismiss.ts` | `useBackdropDismiss(onDismiss)` | Backdrop close that ignores drags starting inside the panel; returns `{onMouseDown, onClick}`. |
| `useMinViewport.ts` | `useMinViewport(w, h)` | `true` when the viewport is at least `w × h`; re-evaluates on resize. |
| `useSessionRestore.ts` | `useSessionRestore()` | Restores/auto-saves editor tabs + sidebar state via IndexedDB (`@/lib/storage`). |
| `usePendingConfirm.ts` | `usePendingConfirm<TId>()` → `{pendingId, request, clear, isOpen}` | Tracks the id of an item awaiting a delete/close confirmation; pairs with `ConfirmDialog`. |
| `useInlineRename.ts` | `useInlineRename(initial, onCommit)` → `{editing, draft, setDraft, start, commit, cancel, inputProps}` | Inline rename state: trims + commits on Enter/blur (skipping when unchanged), reverts on Escape. |
| `useDragReorder.ts` | `useDragReorder(onReorder)` → `{dragIndex, dragOverIndex, getItemProps}` | HTML5 drag-to-reorder list state; `getItemProps(i)` returns the drag handlers, caller applies highlight classes. |
| `useCopyToClipboard.ts` | `useCopyToClipboard()` → `{copied, copy}` | Clipboard write with optional success/error toast + a transient `copied` flag (`COPY_FEEDBACK_DURATION_MS`). |

Overlay primitives in `components/modals/` are the main consumers of the
dismissal hooks; popovers across features use `useClickOutside` + `useEscapeKey`.
`usePendingConfirm` is used by every delete/close-confirm flow; `useInlineRename`,
`useDragReorder`, and `useCopyToClipboard` are shared by the projects, chaining,
music, slash-command, xml-tag, and editor features.
