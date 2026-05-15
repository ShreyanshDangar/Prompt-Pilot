# theme-styler

Right-panel control for the active website theme's style settings (fonts, accent, etc.).

| File | Exports | Description |
| --- | --- | --- |
| `ThemeStyler.tsx` | `ThemeStyler` | Entry component: editors for the current theme's style settings, persisted to global settings. |

## Cross-references

- **Store:** `@/stores/global-store` (`websiteTheme` + per-theme style settings)
- **Theme lib:** `@/lib/theme/theme-registry` (theme ids, defaults, classes), `@/lib/theme/fonts` (font options/resolution)

This feature has no store of its own.
