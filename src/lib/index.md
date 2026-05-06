# lib

Framework-agnostic utilities, constants, and data tables shared across features. No React components live here.

| File | Exports | Description |
| --- | --- | --- |
| `cn.ts` | `cn` | `clsx` + `tailwind-merge` className combiner. |
| `constants.ts` | `APP_NAME`, `STORAGE_KEYS`, `SESSION_KEY`, `DEFAULT_EDITOR_PLACEHOLDER`, `AUTOSAVE_INTERVAL_MS`, `COPY_FEEDBACK_DURATION_MS`, `MAX_IMAGES` | App-wide constants and storage keys. |
| `model-data.ts` | `MODELS`, `PROVIDERS`, `ModelInfo` (type), `getModelById`, `estimateTokens`, `estimateImageTokens` | Model catalog and token/cost estimation helpers. |
| `panel-breakpoints.ts` | `SIDEBAR_WIDTH`, right-panel widths/breakpoints, `shouldDefaultOpenLeftPanel`, `shouldDefaultOpenRightPanel` | Layout width constants and default-open heuristics. |
| `platform.ts` | `detectPhysicalPlatform`, `PhysicalPlatform` (type) | Detects the user's physical Mac/Windows platform. |
| `storage.ts` | `getFromIDB`/`setToIDB`/`deleteFromIDB`, `getFromLocalStorage`, `setToLocalStorage` | Thin IndexedDB (`idb-keyval`) + localStorage helpers. |

## Sub-folders

- `theme/` — theme registry, fonts, and theme-video helpers (see `theme/index.md`).

## Cross-references

- `model-data` is consumed by `token-calculator`; `estimateImageTokens` pairs with `features/images`.
- `panel-breakpoints` + `platform` feed `components/layout`; `storage` underpins every persisted store.
