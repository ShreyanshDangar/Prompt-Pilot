# stores

App-wide Zustand stores. Feature-scoped stores live with their feature (e.g. `features/editor/editor-store.ts`, `features/music-player/music-store.ts`); only truly global state belongs here.

| File | Exports | Description |
| --- | --- | --- |
| `global-store.ts` | `useGlobalStore`, `AutoCorrectRule` (type) | The global settings store: default model, website theme + per-theme style settings, autocorrect rules, panel/layout preferences, and `updateSettings`. |

## Cross-references

- Read widely: `@/features/settings`, `@/features/editor`, `@/features/theme-styler`, `@/features/token-calculator`, `@/features/virtual-keyboard`, `@/features/command-palette`, and `@/components/layout`.
- Theme settings pair with `@/lib/theme/*`; autocorrect rules feed `@/features/editor/editor-autocorrect`.
