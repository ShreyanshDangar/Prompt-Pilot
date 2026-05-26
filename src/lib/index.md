# lib

Framework-agnostic utilities, constants, and data tables shared across features. No React components live here.

| File | Exports | Description |
| --- | --- | --- |
| `cn.ts` | `cn` | `clsx` + `tailwind-merge` className combiner. |
| `constants.ts` | `APP_NAME`, `STORAGE_KEYS`, `KEYBOARD_STORAGE_KEYS`, `SESSION_KEY`, `DEFAULT_EDITOR_PLACEHOLDER`, `AUTOSAVE_INTERVAL_MS`, `COPY_FEEDBACK_DURATION_MS`, `MAX_IMAGES` | App-wide constants and the localStorage key registry (incl. the keyboard keys). |
| `id.ts` | `makeId` | Unique id generator (`crypto.randomUUID` with a fallback); used by every store/feature that mints entity ids. |
| `model-data.ts` | `MODELS`, `PROVIDERS`, `ModelInfo` (type), `getModelById`, `estimateTokens`, `estimateImageTokens` | Model catalog and token/cost estimation helpers. |
| `panel-breakpoints.ts` | `SIDEBAR_WIDTH`, right-panel widths/breakpoints, `shouldDefaultOpenLeftPanel`, `shouldDefaultOpenRightPanel` | Layout width constants and default-open heuristics. |
| `platform.ts` | `detectPhysicalPlatform`, `PhysicalPlatform` (type) | Detects the user's physical Mac/Windows platform. |
| `storage.ts` | `getFromIDB`/`setToIDB`/`deleteFromIDB`, `getFromLocalStorage`, `setToLocalStorage`, `safeSetLocalStorage` | Thin IndexedDB (`idb-keyval`) + localStorage helpers; `safeSetLocalStorage` centralises quota-safe writes. |

## Sub-folders

- `theme/` — theme registry, fonts, font-loader, and theme-video helpers (see `theme/index.md`).

## Persistence layers

The app uses three persistence mechanisms — choose by data shape:

- **Synchronous `localStorage`** — `storage.ts` `getFromLocalStorage`/`setToLocalStorage`/`safeSetLocalStorage`, for small JSON settings (global settings, slash commands, xml tags, images, keyboard, right-panel sections).
- **Async key-value `idb-keyval`** — `storage.ts` `getFromIDB`/`setToIDB`/`deleteFromIDB`, for larger structured data (projects, chains, session restore).
- **Raw IndexedDB Blob driver** — `features/music-player/audio-db.ts`, for audio file blobs + music settings that are too large for localStorage.

## Cross-references

- `model-data` is consumed by `token-calculator`; `estimateImageTokens` pairs with `features/images`.
- `panel-breakpoints` + `platform` feed `components/layout`; `storage` + `id` underpin every persisted store.
