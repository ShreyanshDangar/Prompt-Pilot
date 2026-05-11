# prompt-chaining

Prompt-chains modal: build ordered multi-step prompt sequences.

| File | Exports | Description |
| --- | --- | --- |
| `ChainingView.tsx` | `ChainingView` | Entry component: the chains modal (built on `GalleryModal`) — chain list, detail pane, and delete confirmation. |
| `ChainNode.tsx` | `ChainNode` | One draggable chain step card with inline prompt-text editing. |
| `ChainDetail.tsx` | `ChainDetail` | Detail pane for the selected chain: ordered steps (drag-reorder) plus the add-step form. |
| `chaining-store.ts` | `useChainingStore`, `PromptChain`, `ChainStep` (types) | Zustand store and chain/step domain types. |

## Cross-references

- **Store:** `chaining-store` (this folder)
- **Shared:** `@/components/modals/GalleryModal` (overlay + Escape/backdrop), `@/components/modals/ConfirmDialog`, `@/lib/storage`, `@/lib/constants`
- One-way boundary: `ChainDetail` imports `ChainNode`, never the reverse.
