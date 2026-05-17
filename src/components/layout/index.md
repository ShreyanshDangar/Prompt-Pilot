# components / layout

The application shell and chrome: the composition root plus the navbar, sidebar, and right-panel toggle.

| File | Exports | Description |
| --- | --- | --- |
| `AppShell.tsx` | `AppShell` | Composition root: lays out navbar + sidebar + editor + right panel, mounts feature modals, and lazy-loads the music player. |
| `Navbar.tsx` | `Navbar` | Top bar: app title, global actions, and music-player launch. |
| `Sidebar.tsx` | `Sidebar` | Left panel: launchers for projects, chains, slash commands, xml tags, and keyboard. |
| `RightPanelToggle.tsx` | `RightPanelToggle`, `RightPanelSection` (type) | Toggle between the token calculator and theme styler in the right panel. |

## Cross-references

- **Stores:** `@/stores/global-store`, plus feature stores it mounts (`editor-store`, `music-store`, `projects-store`, `chaining-store`, `slash-store`, `xml-tags-store`, `keyboard-store`).
- **Shared:** `@/components/ThemeVideo`, `@/lib/constants`, `@/lib/storage`, `@/lib/platform`, `@/lib/panel-breakpoints` (`SIDEBAR_WIDTH`, breakpoint helpers), `@/lib/theme/theme-registry`.
- `AppShell` is the single place that mounts most feature entry components.
