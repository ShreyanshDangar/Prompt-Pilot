# lib / theme

Website-theme definitions and the assets that back them: the theme registry, font stacks, and per-theme background videos.

| File | Exports | Description |
| --- | --- | --- |
| `theme-registry.ts` | `WEBSITE_THEME_IDS`, `WebsiteTheme` (type), `ThemeStyleSettings` (type), `THEME_DISPLAY_NAMES`, `DEFAULT_THEME_STYLES`, `THEME_CLASSES`, `THEME_BG_CLASSES`, `THEME_FOLDER_MAP` | The catalog of website themes, their canonical display label, default style settings, and the CSS classes / asset folders each maps to. |
| `fonts.ts` | `AppFontOption` (type), `AppFontName` (type), `THEME_FONT_OPTIONS`, `resolveFontFamily`, `getThemeFontOptions` | Font stacks and the per-theme font option lists + resolution. |
| `font-loader.ts` | `ensureThemeFontsLoaded` | Injects/updates a single `<link>` so only the active theme's Google fonts are fetched at runtime (replaces the 16-family render-blocking `@import`). |
| `theme-video.ts` | `ThemeVideoSlot` (type), `getThemeVideoPath`, `loadThemeVideoSrc` | Resolves and loads the background-video source for a theme slot. |

## Cross-references

- Active theme lives in `@/stores/global-store` (`websiteTheme` + per-theme `ThemeStyleSettings`); `applyThemeFont` calls `ensureThemeFontsLoaded` on boot + every theme switch.
- Consumers: `@/features/theme-styler` (fonts + `THEME_DISPLAY_NAMES`), `@/features/editor` (fonts), `@/features/virtual-keyboard` (fonts + video), `@/components/ThemeVideo` (video), `@/components/layout/Sidebar` (registry + `THEME_DISPLAY_NAMES`).
- `theme-video` is also used by the legacy keyboard's `VideoFrameController`.
