# components / modals

Shared modal primitives. Features should reach for these instead of hand-rolling overlays, backdrop dismiss, or Escape handling.

| File | Exports | Description |
| --- | --- | --- |
| `CenteredModal.tsx` | `CenteredModal` | Top-anchored modal (`pt-[20vh]` default) at `z-[100]` with backdrop + Escape dismiss. Used by command palette, settings, and `ConfirmDialog`. |
| `ConfirmDialog.tsx` | `ConfirmDialog` | Confirm/cancel dialog (optionally `destructive`) built on `CenteredModal`. |
| `GalleryModal.tsx` | `GalleryModal` | Centered full-panel modal at `z-40`; default panel `h-[80vh] max-w-4xl`, spring 300/30. Pass `panelClassName` to override (it replaces, not merges). |

## Cross-references

- Dismiss behavior comes from `@/hooks/useEscapeKey` and `@/hooks/useBackdropDismiss`.
- `GalleryModal` is used by `projects`, `prompt-chaining`, `prompt-templates`, `slash-commands`, `xml-tags`.
- `ConfirmDialog` is used broadly (music-player, projects, prompt-chaining, slash-commands, xml-tags, editor).
