# Prompt-Pilot Refactor — Execution Overview & Index

You are the **execution agent**. These plans were produced by a planning agent that
read the entire codebase. Do not trust this overview as a substitute for reading the
code yourself.

## Mandatory pre-flight (do before ANY edit)
1. Read the whole `src/` tree and the root configs (`package.json`,
   `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`,
   `index.html`). Re-confirm the "Verified facts" in each plan against the live code;
   if reality differs, trust the code and adapt.
2. Establish a baseline: run `npm install` (or the repo's package manager), then
   `npm run build` and `npm run lint`. Record the produced chunk names/sizes and the
   Rollup ">500 kB" warning. This baseline is the before-image for Plan 04. (The
   planning run already captured a confirmed baseline — vite 7.3.1, 8421 modules,
   `index` chunk 907.73 kB tripping the warning — reproduced verbatim in Plan 04;
   re-measure on your branch and confirm it matches before/after each change.)
3. Create the working branch only if not already on it (the repo convention is the
   `claude/*` feature branch already checked out). Commit per-plan.

## Global constraints (apply to every plan)
- **Preserve UI/UX.** Maintainability is the only driver. Pure refactors (extracting
  shared hooks/components/utils, splitting bundles, removing unused code) are allowed
  freely. Any change that alters rendered output, animation, timing, copy, or
  interaction is `[REQUIRES USER APPROVAL]` — stop and ask before applying it.
- **Behavior parity bar:** after each plan, `npm run build` and `npm run lint` must
  pass with no new errors, and the app must render and operate identically. TypeScript
  is `strict` with `noUnusedLocals`/`noUnusedParameters` — dead code removal must be
  complete (no orphaned imports).
- **Keep `index.md` truthful** (Plan 06). When a plan moves/renames/creates a module,
  update the affected `index.md` in the same commit.
- Match existing code style of each file you touch (note: semicolon usage is
  inconsistent across the repo and there is no Prettier config — do not mass-reformat;
  see Plan 03).

## Recommended execution order & dependencies
1. **Plan 01 — dead code & deps** (no dependencies; lowest risk; shrinks surface area
   first so later plans touch less).
2. **Plan 02 — shared abstractions / dedup** (depends on 01 for a clean tree). The
   largest body of work; do it in the sub-phases listed in that file, committing each.
3. **Plan 03 — store & code quality** (depends on 02 so store-pattern helpers are
   introduced once; some items overlap — 02 owns *extraction*, 03 owns *consistency
   /naming/typing/error-handling*).
4. **Plan 04 — performance & build** (independent of 02/03 but do after them so the
   final bundle measurement reflects the deduped tree; font-loader touches
   `global-store` so coordinate with 03).
5. **Plan 05 — testing** (do after 01–04 so tests assert the final shape; tests must
   pin behavior that 02–04 must not regress).
6. **Plan 06 — documentation** (last; reconcile all `index.md` + add entries for new
   shared modules; fix the known `ConfirmDialog`/`CenteredModal` doc drift).

Each plan has its own acceptance checks. Treat a plan as done only when its checks and
the global parity bar both pass.
