# slash-commands

Reusable slash commands: an in-editor autocomplete popover plus a management gallery, with variable-fill support.

| File | Exports | Description |
| --- | --- | --- |
| `SlashCommandGallery.tsx` | `SlashCommandGallery` | Gallery modal to browse/create/edit/delete commands. |
| `SlashCommandModal.tsx` | `SlashCommandModal` | Create/edit modal for a single command. |
| `SlashCommandPopover.tsx` | `SlashCommandPopover` (forwardRef) | In-editor `/`-triggered autocomplete popover, positioned at the cursor. |
| `VariableFillModal.tsx` | `VariableFillModal` | Prompts for `{{variable}}` values before inserting a command. |
| `slash-store.ts` | `useSlashStore` | Zustand store: user commands plus add/update/remove actions. |
| `slash-types.ts` | `SlashCommand` (type) | Shape of a slash command. |
| `built-in-commands.ts` | `BUILT_IN_COMMANDS`, `BUILT_IN_NAMES` | The shipped default commands. |
| `variable-utils.ts` | `extractVariables`, `resolveVariables` | Parse `{{vars}}` from text and substitute filled values. |

## Cross-references

- **Store:** `slash-store` (this folder)
- **Editor integration:** `@/features/editor/editor-insert`, `@/features/editor/editor-popover-position`
- **Shared:** `@/components/modals/GalleryModal`, `@/components/modals/ConfirmDialog`, `@/hooks/useEscapeKey`, `@/lib/storage`, `@/lib/constants`, `@/stores/global-store`
- Read by `command-palette` and `prompt-templates`.
