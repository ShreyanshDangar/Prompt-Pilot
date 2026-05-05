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

Overlay primitives in `components/modals/` are the main consumers of the
dismissal hooks; popovers across features use `useClickOutside` + `useEscapeKey`.
