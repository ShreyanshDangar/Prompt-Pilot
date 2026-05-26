# editor

The TipTap-based prompt editor: tabbed documents, autocorrect, slash/xml insertion, and copy.

| File | Exports | Description |
| --- | --- | --- |
| `Editor.tsx` | `Editor` | Top-level editor wrapper; wires the active tab's TipTap instance to the tab bar and default editor. |
| `EditorTabBar.tsx` | `EditorTabBar` | Renders the row of open tabs (add / close / rename / switch). |
| `DefaultEditor.tsx` | `DefaultEditor` | The TipTap editor surface for a single tab, including cursor/scroll restore. |
| `CopyButton.tsx` | `CopyButton` | Copy-to-clipboard button with transient "copied" feedback (via `useCopyToClipboard`). |
| `useEditorAutocomplete.ts` | `useEditorAutocomplete`, `EditorAutocomplete`/`EditorAutocompleteOptions`/`PopoverPosition`/`PopoverRange` (types) | Shared trigger-character autocomplete state machine (open/close, query, selection, position, results) for the slash + xml popovers. |
| `EditorAutocompletePopover.tsx` | `EditorAutocompletePopover` | Presentational overlay + cursor-anchored panel + results list shared by the slash + xml popovers. |
| `editor-store.ts` | `useEditorStore` | Zustand store: tabs, active tab, dirty tracking, `skipDirtyCloseConfirm`. |
| `editor-types.ts` | `EditorTab` (type) | Shape of a single editor tab. |
| `editor-autocorrect.ts` | `applyAutoCorrect` | Applies the user's autocorrect rules to typed text. |
| `editor-insert.ts` | `textToParagraphNodes`, `ParagraphNode` (type) | Converts plain text into TipTap paragraph nodes for insertion. |
| `editor-popover-position.ts` | `getCursorPopoverPosition` | Computes screen coordinates for cursor-anchored popovers (slash, xml). |

## Cross-references

- **Stores:** `editor-store` (this folder), `@/stores/global-store` (autocorrect rules, settings)
- **Embedded popovers/components:** `@/features/slash-commands/SlashCommandPopover`, `@/features/xml-tags/XmlTagAutocompletePopover`, `@/features/images/ImageUploader`, `@/features/open-in/OpenInDropdown`
- **Shared:** `@/components/modals/ConfirmDialog`, `@/components/ThemeVideo`, `@/lib/constants`, `@/lib/id`, `@/lib/theme/fonts`, and the hooks `@/hooks/useCopyToClipboard` (CopyButton) + `@/hooks/usePendingConfirm` (EditorTabBar close-confirm)
- `editor-insert` / `editor-popover-position` are also consumed by `slash-commands` and `xml-tags`.
- `useEditorAutocomplete` + `EditorAutocompletePopover` are consumed by `@/features/slash-commands/SlashCommandPopover` and `@/features/xml-tags/XmlTagAutocompletePopover`.
