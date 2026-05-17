# Plan 04 — Performance & Build (bundle + fonts)

**Goal:** cut the oversized eager `index` chunk and the render-blocking font payload
while preserving the rendered result.

## Measured baseline (real `npm run build`, vite 7.3.1, 8421 modules transformed)
```
dist/assets/index-1q4ev5f5.js          907.73 kB │ gzip: 281.97 kB   ← trips >500 kB warning
dist/assets/index-CZjv1j0R.css          57.48 kB │ gzip:  10.95 kB   ← the 16-family fonts live here
dist/assets/VirtualKeyboard-*.js        79.85 kB │ gzip:  23.44 kB   (lazy)
dist/assets/CommandPalette-*.js         51.00 kB │ gzip:  16.58 kB   (lazy)
dist/assets/MusicPlayer-*.js            32.40 kB │ gzip:   8.59 kB   (lazy)
dist/assets/TemplateGallery-*.js        11.56 kB │ gzip:   4.02 kB   (lazy)
dist/assets/ChainingView-*.js            7.94 kB │ gzip:   2.66 kB   (lazy)
```
The single `index` chunk (907.73 kB) is the eager bundle and the only chunk over the
500 kB limit. Re-run `npm run build` after each task and compare to these exact numbers.

Heavy eager contributors (measured on disk; note lucide/@tabler tree-shake per-icon so
they are small in the bundle): `react-dom`, **TipTap + `@tiptap/pm` + 18 installed
`prosemirror-*` packages** (StarterKit pulls the full ProseMirror runtime — the largest
single contributor and not meaningfully tree-shakeable), and **framer-motion** (imported
in 28 files). These three groups are the split targets in Task 2.

## Task 1 — Per-theme font loading (replace the 16-family render-blocking import)
Current: `src/styles/globals.css:1` loads all 16 Google families up front
(render-blocking) with `display=swap` already set. Only the active theme's font subset
is ever used (`THEME_FONT_OPTIONS` in `src/lib/theme/fonts.ts`; ≤4 Google families per
theme, the rest system fonts). `body` already reads `var(--user-theme-font)`.

Plan:
1. Remove the `@import url("https://fonts.googleapis.com/css2?…")` line from
   `globals.css` (keep `@import "tailwindcss"`).
2. Create `src/lib/theme/font-loader.ts`:
   - A map from `AppFontName` → the Google `family=` query segment, derived from the
     exact weight specs in the current `globals.css` import (e.g. `Inter:wght@400;500;600;700`,
     `Merriweather:wght@400;700`, `Space Grotesk:wght@400;500;700`, `Space Mono:wght@400;700`,
     `VT323`). **Omit** system fonts (Georgia, Times New Roman, Courier New, system-ui).
   - `ensureThemeFontsLoaded(theme: string)`: compute the theme's Google font names from
     `THEME_FONT_OPTIONS[theme] ?? THEME_FONT_OPTIONS.default`, build one
     `https://fonts.googleapis.com/css2?family=…&display=swap` URL, and inject/update a
     single `<link id="theme-fonts" rel="stylesheet">` in `<head>` (idempotent; replace
     href when the theme changes). Include `<link rel="preconnect">` to
     `fonts.googleapis.com`/`fonts.gstatic.com` once.
3. Call `ensureThemeFontsLoaded(theme)` from `src/stores/global-store.ts` everywhere the
   theme/font can change: inside `applyThemeFont(...)` (already invoked by
   `initializeSettings`, `updateSettings(websiteTheme|perThemeStyles)`, and
   `resetThemeStyle`). This guarantees the active theme's fonts load on boot and on
   theme switch.

**UX note `[VERIFY — approval if regressed]`:** on first switch to a theme, its font is
fetched (brief `swap`). The default theme's fonts still load on boot, so initial render
is unchanged in appearance (just far less to download). `ThemeStyler`'s font `<select>`
only previews the *active* theme's options, all of which are in the loaded subset, so
previews still render in-font. Confirm: no FOIT/missing-glyph on load or on each theme
switch; if the brief swap on switch is judged a visible UX change, surface it.

**Acceptance:** Network shows only the active theme's font request (not 16 families);
fonts render identically for the default theme on first paint; the 57.48 kB CSS chunk no
longer carries the 16-family `@import` (the families are fetched at runtime per theme
instead). The default theme drops from 16 families to ~5 (Inter, Space Grotesk, JetBrains
Mono, Fira Code, Source Code Pro).

## Task 2 — Rollup `manualChunks` to break up the 907 kB `index` chunk
Add `build.rollupOptions.output.manualChunks` to `vite.config.ts`. Use a function form so
the whole ProseMirror tree (pulled by `@tiptap/pm`) is captured:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (!id.includes("node_modules")) return
        if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react-vendor"
        if (id.includes("@tiptap") || id.includes("prosemirror")) return "editor-vendor"
        if (id.includes("framer-motion") || id.includes("motion-dom") || id.includes("motion-utils")) return "motion"
        if (id.includes("lucide-react")) return "icons"
        if (id.includes("@tabler/icons-react")) return "tabler-icons"
        if (id.includes("cmdk")) return "cmdk"
        // everything else falls into Rollup's default vendor handling
      },
    },
  },
},
```

Notes: `manualChunks` only changes chunking, not runtime — behavior is unaffected.
`editor-vendor` (TipTap + 18 `prosemirror-*`) is expected to be the largest resulting
chunk and the main carve-out from the 907 kB index. `@tabler/icons-react` and `cmdk`
already sit in lazy chunks (`VirtualKeyboard`, `CommandPalette`); only split them out if
the build shows them inflating shared chunks (otherwise drop those two lines). `icons`
(lucide) is small after tree-shaking — keep the line only if it produces a non-trivial
chunk. Keep groups coarse to avoid request waterfalls.

**Acceptance:** the monolithic 907 kB `index` chunk is replaced by several cacheable
vendor chunks (notably `editor-vendor` for TipTap/ProseMirror and `react-vendor`); the
remaining `index` (app) chunk is materially smaller than 907 kB; the app still loads and
runs identically; no chunk graph cycles/load errors. Compare the new `npm run build`
output line-by-line to the baseline above.

## Task 3 — Lazy-load parity for always-mounted gated panels
`ChainingView` is `React.lazy` in `AppShell.tsx` (a 7.94 kB chunk), but the
structurally-similar `ProjectsPage` is eagerly imported and always mounted (gated by
`isOpen`), so it sits in the 907 kB `index` chunk. Convert `ProjectsPage` to
`React.lazy` + `<Suspense fallback={null}>` in `AppShell.tsx`, mounting it only when its
store `isOpen` is true (mirror how `MusicPlayer` is gated by `musicActivated`). This
removes `ProjectsPage` + `ProjectDetail` + `FolderRow` from the eager `index` chunk.
Consider the same for `XmlTagGallery` / `SettingsPanel` only if they prove heavy in the
build and can be gated on their open-flags without a flash; otherwise leave them.

**UX note:** gating render on `isOpen` matches the current effect (content is invisible
until opened). Verify there is no open/close flash and that focus-on-open
(`searchInputRef`) still fires.

**Acceptance:** opening Projects works identically (with a null fallback, imperceptible);
a new `ProjectsPage-*.js` lazy chunk appears and `index` shrinks accordingly.

## Task 4 — `chunkSizeWarningLimit` (only if justified)
After Tasks 2–3, re-build. If the **only** remaining >500 kB chunk is `editor-vendor`
(TipTap/ProseMirror is irreducible and eagerly required by the core editor), set
`build.chunkSizeWarningLimit` to just above that chunk's measured size (e.g. 600–700) so
the warning reflects reality rather than being globally silenced. Do **not** raise it if
other app chunks are large — those should be split instead. Document the measured number
in a config comment.

**Acceptance:** no spurious Rollup size warning; the limit is a measured, documented
value, not an arbitrary mute.

## Plan-04 acceptance (overall)
Compare against the measured baseline above: no single chunk near 907 kB; initial JS
payload (eager `index` + `react-vendor` is what loads first; `editor-vendor` loads with
the editor) and font payload both materially reduced; app renders/behaves identically
across at least two themes; `npm run build` + `npm run lint` green.
