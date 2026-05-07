# components

Cross-feature, app-level components. Feature-specific UI lives under `src/features/*`; this folder is only for shared building blocks and the app layout.

| File | Exports | Description |
| --- | --- | --- |
| `ThemeVideo.tsx` | `ThemeVideo` (memo) | Renders the active theme's background video for a named slot. |

## Sub-folders

- `layout/` — the app shell, navbar, sidebar, and right-panel toggle (see `layout/index.md`).
- `modals/` — shared modal primitives: `CenteredModal`, `ConfirmDialog`, `GalleryModal` (see `modals/index.md`).

## Cross-references

- `ThemeVideo` reads `@/lib/theme/theme-video` (video paths/loading) and `@/stores/global-store` (`websiteTheme`).
- Consumed by `@/features/editor`, `@/features/virtual-keyboard`, and `layout/`.
