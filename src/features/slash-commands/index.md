# slash-commands

Reusable slash commands: an in-editor autocomplete popover plus a management gallery, with variable-fill support.

| File | Exports | Description |
| --- | --- | --- |
| `SlashCommandGallery.tsx` | `SlashCommandGallery` | Gallery modal to browse/create/edit/delete commands. |
| `SlashCommandModal.tsx` | `SlashCommandModal` | Create/edit modal for a single command (built on `CenteredModal`). |
| `SlashCommandPopover.tsx` | `SlashCommandPopover` (forwardRef) | In-editor `/`-triggered autocomplete popover; built on the shared `useEditorAutocomplete` hook + `EditorAutocompletePopover` shell, with built-in routing + variable fill. |
| `VariableFillModal.tsx` | `VariableFillModal` | Prompts for `{{variable}}` values before inserting a command (built on `CenteredModal`). |
| `slash-store.ts` | `useSlashStore` | Zustand store: user commands plus add/update/remove actions. |
| `slash-types.ts` | `SlashCommand` (type) | Shape of a slash command. |
| `built-in-commands.ts` | `BUILT_IN_COMMANDS`, `BUILT_IN_NAMES` | The shipped default commands. |
| `run-built-in-command.ts` | `runBuiltInCommand`, `BuiltInCommandHandlers` (type) | Routes the built-in commands (`/create`, `/templates`, `/projects`, `/help`) to caller-supplied handlers; shared by the palette and the in-editor popover. |
| `variable-utils.ts` | `extractVariables`, `resolveVariables` | Parse `{{vars}}` from text and substitute filled values. |

## Cross-references

- **Store:** `slash-store` (this folder)
- **Editor integration:** `@/features/editor/editor-insert`, `@/features/editor/useEditorAutocomplete`, `@/features/editor/EditorAutocompletePopover`
- **Shared:** `@/components/modals/GalleryModal`, `@/components/modals/CenteredModal`, `@/components/modals/ConfirmDialog`, `@/hooks/usePendingConfirm`, `@/lib/storage` (`safeSetLocalStorage`), `@/lib/id`, `@/lib/constants`, `@/stores/global-store`
- `run-built-in-command` is also consumed by `@/features/command-palette`.
- Read by `command-palette` and `prompt-templates`.
