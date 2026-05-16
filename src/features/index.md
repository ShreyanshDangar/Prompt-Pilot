# features

Each sub-folder is a self-contained feature: an entry component, an optional feature-scoped Zustand store, and supporting files. Cross-feature imports use the `@/...` alias; within a feature use relative paths. Every feature has its own `index.md` — start there. Shared building blocks live in `@/components`, `@/hooks`, `@/lib`, and `@/stores`.

| Feature | Entry component | Store | Commonly-needed files |
| --- | --- | --- | --- |
| `command-palette` | `CommandPalette` | — | `@/components/modals/CenteredModal`; reads `editor-store`, `slash-store`, `projects-store`, `global-store` |
| `editor` | `Editor` | `editor-store` | `editor-insert`, `editor-popover-position`, `editor-autocorrect`, `@/lib/theme/fonts`, `@/stores/global-store` |
| `images` | `ImageUploader` | `image-store` | `image-types`, `@/lib/storage`, `@/lib/constants` (`MAX_IMAGES`), `@/lib/model-data` (`estimateImageTokens`) |
| `music-player` | `MusicPlayer` | `music-store` | `audio-db`, `music-migration`, `music-types`, `useMusicPlayerResize`, `@/components/modals/ConfirmDialog` |
| `open-in` | `OpenInDropdown` | — | `providers`, `@/features/editor/editor-store`, `@/hooks/useClickOutside` |
| `projects` | `ProjectsPage` | `projects-store` | `projects-types`, `@/components/modals/GalleryModal`, `@/components/modals/ConfirmDialog`, `@/lib/storage` |
| `prompt-chaining` | `ChainingView` | `chaining-store` | `@/components/modals/GalleryModal`, `@/components/modals/ConfirmDialog`, `@/lib/storage` |
| `prompt-templates` | `TemplateGallery` | — (static `template-data`) | `@/components/modals/GalleryModal`, `@/features/slash-commands/slash-store` |
| `settings` | `SettingsPanel` | — (edits `global-store`) | `@/components/modals/CenteredModal`, `@/stores/global-store` |
| `slash-commands` | `SlashCommandGallery` (+ `SlashCommandPopover` in-editor) | `slash-store` | `built-in-commands`, `variable-utils`, `@/features/editor/editor-insert`, `@/features/editor/editor-popover-position` |
| `theme-styler` | `ThemeStyler` | — (edits `global-store`) | `@/lib/theme/theme-registry`, `@/lib/theme/fonts`, `@/stores/global-store` |
| `token-calculator` | `TokenCalculator` | — | `@/lib/model-data`, `@/features/editor/editor-store`, `@/features/images/image-store`, `@/stores/global-store` |
| `virtual-keyboard` | `VirtualKeyboard` | `keyboard-store` | `keyboard-presets`, `useKeyState`, `@/lib/platform`, `@/lib/theme/fonts`, `@/lib/theme/theme-video` |
| `xml-tags` | `XmlTagGallery` (+ `XmlTagAutocompletePopover` in-editor) | `xml-tags-store` | `xml-tag-data`, `@/features/editor/editor-popover-position`, `@/components/modals/GalleryModal` |

Most feature entry components are mounted by `@/components/layout/AppShell` (the music player is lazy-loaded there).
