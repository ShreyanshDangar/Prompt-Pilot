# projects

Projects modal: folders of saved prompts with ratings, notes, and prompt-version history.

| File | Exports | Description |
| --- | --- | --- |
| `ProjectsPage.tsx` | `ProjectsPage` | Entry component: the projects modal (built on `GalleryModal`) — search, folder column, project column, detail pane, and delete confirmations. |
| `FolderRow.tsx` | `FolderRow` | A single folder row with inline rename and delete. |
| `ProjectDetail.tsx` | `ProjectDetail` | Detail pane for the selected project: rating, summaries, notes, and prompt versions. |
| `projects-store.ts` | `useProjectsStore` | Zustand store: folders, projects, selection, and CRUD actions. |
| `projects-types.ts` | `ProjectFolder`, `Project`, `PromptVersion` (types) | Project domain types. |

## Cross-references

- **Store:** `projects-store` (this folder)
- **Shared:** `@/components/modals/GalleryModal` (overlay + Escape/backdrop), `@/components/modals/ConfirmDialog`, `@/lib/storage`, `@/lib/constants`
- Also read by `command-palette` (project jumps) and `slash-commands`.
