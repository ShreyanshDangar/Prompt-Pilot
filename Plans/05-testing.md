# Plan 05 — Minimal High-Value Test Suite (~5 tests)

**Goal:** a deliberately small suite pinning the highest-risk logic — persistence,
store logic, and core pure utilities. **Not** broad coverage.

## Framework (executor decides; default given)
No test tooling exists. **Default recommendation: Vitest** (Vite-native, reuses
`vite.config.ts`, ESM/TS out of the box, jsdom env available for `localStorage`).
Alternatives the executor may choose instead: Jest (+ ts-jest/babel) or
node:test + tsx. If Vitest:
- `npm i -D vitest jsdom` (and `@testing-library/react` + `@testing-library/jest-dom`
  only if a component/hook render test is added — not required for the targets below).
- Add `"test": "vitest run"` (and `"test:watch": "vitest"`) to `package.json` scripts.
- Add a minimal `vitest` config (in `vite.config.ts` via `test: { environment: "jsdom" }`
  or a separate `vitest.config.ts`). Place specs next to sources as `*.test.ts`.

Leave the final framework choice to the executor; wire scripts/config to match it.

## The ~5 tests (pick these targets; all are pure or store-getState, no UI needed)
1. **Persistence round-trip — `src/lib/storage.ts`**: `setToLocalStorage`/
   `getFromLocalStorage` round-trips an object; `getFromLocalStorage` returns `null` on
   absent key and on invalid JSON (the `try/catch` path). (jsdom provides `localStorage`.)
2. **Core util — `src/features/slash-commands/variable-utils.ts`**: `extractVariables`
   returns unique names from `{{a}} {{b}} {{a}}`; `resolveVariables` substitutes provided
   values and leaves unknown vars as literal `{{name}}`.
3. **Core util — `src/features/editor/editor-insert.ts`**: `textToParagraphNodes`
   produces one paragraph per line; `keepEmpty:false` drops blank lines while
   `keepEmpty:true` preserves them as empty paragraphs.
4. **Store logic — `src/features/editor/editor-store.ts`**: drive
   `useEditorStore.getState()` actions: `addTab` appends + activates; `closeTab` keeps at
   least one tab and renumbers unrenamed tabs (`Prompt 1`, `Prompt 2`, …) while leaving
   renamed tabs intact. (This also guards the `closeTab` active-index selection.)
5. **Settings persistence/merge — `src/stores/global-store.ts`**: seed `localStorage`
   with a partial `STORAGE_KEYS.SETTINGS` payload, call `initializeSettings()`, and
   assert it deep-merges over `DEFAULT_SETTINGS` (e.g. `autoCorrectRules` falls back to
   defaults when absent, `perThemeStyles` merges). Guard the DOM calls in
   `applyThemeClasses`/`applyThemeFont` with jsdom (or stub `document.documentElement`).

If `localStorage`/DOM in tests is friction for #5, the executor may substitute the
**`audio-db.ts` round-trip** (put/get a setting via `withStore`) using
`fake-indexeddb` — but prefer the global-store test as the higher-risk surface.

## Constraints
- Keep it to ~4–5 tests. Do not add component-render or coverage sweeps.
- Tests must assert the **post-refactor** shape (run after Plans 01–04) and serve as the
  regression guard those plans must not break.
- `npm test` must pass in CI-less local run.

**Acceptance:** `npm test` green; each test fails if its target logic is broken
(sanity-check by temporarily inverting an assertion).
