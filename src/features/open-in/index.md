# open-in

"Open in…" dropdown that hands the current prompt off to an external AI chat provider.

| File | Exports | Description |
| --- | --- | --- |
| `OpenInDropdown.tsx` | `OpenInDropdown` | Entry component: a dropdown of providers that opens the editor's text in the chosen provider (URL or clipboard handoff). |
| `providers.ts` | `PROVIDERS`, `MAX_URL_LENGTH`, `Provider` (type) | Provider definitions and the URL-length cap that decides URL vs. copy handoff. |

## Cross-references

- **Stores read:** `@/features/editor/editor-store` (current prompt text)
- **Shared:** `@/hooks/useClickOutside` (dropdown dismiss)

This feature has no store of its own.
