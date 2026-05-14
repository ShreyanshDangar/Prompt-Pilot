# command-palette

Cmd/Ctrl-K command palette that fuzzy-searches actions, slash commands, and projects.

| File | Exports | Description |
| --- | --- | --- |
| `CommandPalette.tsx` | `CommandPalette` | The palette overlay (built on `cmdk`); aggregates built-in actions, slash commands, and project jumps into one searchable list. |

## Cross-references

- **Modal shell:** `@/components/modals/CenteredModal`
- **Stores read:** `@/stores/global-store`, `@/features/editor/editor-store`, `@/features/projects/projects-store`, `@/features/slash-commands/slash-store`
- **Command data:** `@/features/slash-commands/built-in-commands`, `@/features/slash-commands/slash-types`

This feature has no store of its own; it orchestrates other features' stores.
