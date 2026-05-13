# virtual-keyboard

The on-screen keyboard feature: a realistic Mac keyboard, a themed/legacy keyboard, live typing preview, and appearance/settings popovers. The root holds the entry point, store, and shared utilities; `mac/`, `legacy/`, and `popovers/` are scoped sub-folders.

| File | Exports | Description |
| --- | --- | --- |
| `VirtualKeyboard.tsx` | `VirtualKeyboard` | Entry component: slides the keyboard panel in/out and renders the Mac or legacy keyboard plus the two popovers and word preview. |
| `WordPreview.tsx` | `WordPreview` | Feature-root word-preview overlay (gated on `previewMode === "word"`, not on platform). |
| `keyboard-store.ts` | `useKeyboardStore`, `ActiveKeyboard`, `PreviewMode`, `KeyboardPlatform` (types) | Zustand store: visibility, active keyboard, platform, sound/preview toggles, per-theme presets. |
| `keyboard-presets.ts` | `KEYBOARD_COLOR_PRESETS`, `KEYBOARD_FONT_PRESETS`, `getColorPreset(s)`, `getFontPreset(s)`, preset types | Per-theme color/font preset catalogs and lookups. |
| `useKeyState.ts` | `useKeyState`, `KEY_SAFETY_TIMEOUT_MS` | Tracks the set of currently-pressed key codes with a safety auto-release timeout. |

## Sub-folders

- `mac/` — the realistic Mac keyboard: `MacKeyboard`, `MacKeyboardKeys` (`Key`/`ModifierKey`/`OptionKey`), `mac-keyboard-provider` (`KeyboardProvider`), `mac-keyboard-context`, `mac-keyboard-sounds`.
- `legacy/` — the themed/canvas keyboard (consumed only by `LegacyKeyboard`): `LegacyKeyboard`, `VideoFrameController`, `useCanvasVideo`.
- `popovers/` — the customize/settings popovers and their shared motion config (see `popovers/index.md`).

## Cross-references

- **Store:** `keyboard-store` (this folder)
- **Shared hooks:** `@/hooks/useClickOutside`, `@/hooks/useEscapeKey`
- **Shared:** `@/components/ThemeVideo`, `@/lib/cn`, `@/lib/platform` (`detectPhysicalPlatform`), `@/lib/storage`, `@/lib/theme/fonts`, `@/lib/theme/theme-video`, `@/stores/global-store` (`websiteTheme`)
