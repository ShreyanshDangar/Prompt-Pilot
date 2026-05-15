# settings

The settings panel: app-wide preferences (model, theme, autocorrect, etc.).

| File | Exports | Description |
| --- | --- | --- |
| `SettingsPanel.tsx` | `SettingsPanel` | Entry component: the settings modal (built on `CenteredModal`) that reads and writes global settings. |

## Cross-references

- **Modal shell:** `@/components/modals/CenteredModal`
- **Store:** `@/stores/global-store` (all app settings live here)

This feature has no store of its own; it edits `global-store`.
