# Plan 03 — Store Patterns, Error Handling, Naming & Typing

**Goal:** consistency and clarity in stores and shared code, without behavior change.

## Task 1 — Storage-key consistency
`src/lib/constants.ts` `STORAGE_KEYS` is the canonical registry, but several keys live
outside it:
- `keyboard-store.ts`: `KB_V1_KEY = "promptPilot.keyboardSettings.v1"`,
  `KB_LEGACY_KEY = "prompt-pilot-keyboard"`.
- `music-migration.ts`: `LEGACY_MUSIC_STATE_KEY = "prompt-pilot-music"`,
  `LEGACY_LOCAL_TRACKS_KEY`, `LEGACY_PLAYLISTS_KEY`, `MIGRATION_FLAG_KEY`.
- `mac-keyboard-provider.tsx`: `promptPilot.kbToast.*.v1` (sessionStorage).

Do **not** change the key string values (changing them orphans real user data — that is
a UX regression). Instead: add the current keyboard keys to `STORAGE_KEYS` (or a
documented `KEYBOARD_STORAGE_KEYS`/legacy group) **preserving the exact strings**, and
import from there so the registry is complete. Leave migration/sessionStorage legacy
keys where they are but add a one-line comment cross-referencing `STORAGE_KEYS`.

**Acceptance:** all persisted key literals are discoverable from `constants.ts`; no key
string changed; persistence still reads/writes the same slots.

## Task 2 — Store persistence helpers (coordinate with Plan 02)
localStorage-backed stores repeat `initialize(): const saved = getFromLocalStorage<T>(K); if (saved) set(...)`
(`slash-store`, `xml-tags-store`, `image-store`, `keyboard-store`) and persist-after-
mutation. IDB-backed stores (`projects-store`, `chaining-store`) repeat `persist()` +
`get().persist()` after each mutation. Introduce small helpers without changing
semantics:
- `src/lib/storage.ts`: add `createLocalStorageInitializer<T>(key)` /
  a `safeSetLocalStorage(key, value)` that centralizes the try/catch currently only
  done in `image-store` (`isQuotaExceededError`). Adopt in the localStorage stores so
  quota handling is uniform (image-store already shows the intended UX — a single toast).
- Keep `projects-store`/`chaining-store` `persist()` but consider a shared
  `persistAll(entries)` only if it does not obscure the store. Optional.

Do not over-abstract Zustand stores into a generic factory if it harms readability;
prefer targeted helpers.

**Acceptance:** store init/persist behavior identical; quota errors handled
consistently (no uncaught throw on localStorage write).

## Task 3 — Error-handling consistency
Empty `catch {}` blocks that silently swallow errors appear in `keyboard-store.ts`
(`persist`/`readPersisted`), `music-migration.ts`, and `music-store.ts`
(`void putSetting(...).catch(() => {})`). Where the swallow is intentional best-effort
persistence, add a short comment `// best-effort: persistence is non-critical` (match the
existing comment style in `MusicTrackList`'s upload loop). Where an error should surface
to the user (e.g. a failed *user-initiated* save), route through the same
`safeSetLocalStorage`/toast path from Task 2. Do not add noisy logging to hot paths.

**Acceptance:** no behavior change; intentional swallows are documented; user-facing
failures are not silently lost.

## Task 4 — Naming / dead-state / small clarity fixes
- `Editor.tsx` `CharWordCount`: the `void activeTabId; void activeTabContent;` hack
  forces recompute. Replace with an honest dependency: derive counts from
  `activeTabContent` (subscribe to the active tab's content) so the `useMemo` deps are
  real, or compute from `editor.getText()` keyed on a value that actually changes.
  Keep the displayed counts identical.
- `XmlTagGallery.tsx`: it calls `initialize()` in a `useEffect` even though `App.tsx`
  already calls `useXmlTagsStore`'s `initialize`. Remove the redundant call (or make
  `initialize` idempotent and document it). Verify custom tags still load.
- `keyboard-store.ts` `size`/`setSize`: `size` is fixed at 140 and `setSize` is unused
  by any caller (confirm via grep). If unused, remove `setSize` (and the `size` field
  only if no consumer reads it — `LegacyKeyboard` reads `size`, so keep the field).
- Audit each store's publicly-exposed `persist` (`projects`/`chaining`) — if only called
  internally, it can stay but note it; do not break the interface used elsewhere
  (confirm via grep before narrowing).

**Acceptance:** `npx tsc -b` clean under `noUnusedLocals`/`noUnusedParameters`; counts
and keyboard behavior unchanged.

## Task 5 — `[REQUIRES USER APPROVAL]` Theme display-name consolidation
`Sidebar.tsx` `WEBSITE_THEMES` labels ("Modern", "Aurora Borealis", "Neon Void", "Zen
Forest", "Vintage Writer", "Neural Workspace") diverge from `ThemeStyler.tsx`
`THEME_NAMES` ("Default", "Aurora", "Neon Void", "Zen Forest", "Vintage Writer",
"Neural"). The theme-registry comment intentionally keeps display strings with their
components, but they have drifted. Consolidating into one map in
`src/lib/theme/theme-registry.ts` would **change visible labels** in one surface or the
other → approval required to pick the canonical label per theme. If approved,
centralize; if not, leave both and add a comment noting the intentional divergence.

## Task 6 — Formatting (optional, low priority)
Semicolon usage is inconsistent (19 `.tsx` use trailing semicolons; many `.ts` do not);
there is no Prettier config. Do **not** mass-reformat (it churns the diff and obscures
review). Optionally add a Prettier config + `format` script as a separate, clearly
labeled commit, and only run it if the user opts in — formatting-only diffs are
`[REQUIRES USER APPROVAL]` because of review noise.
