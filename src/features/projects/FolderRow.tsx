import { Folder, Trash2, Pencil, Check } from "lucide-react"
import { useProjectsStore } from "./projects-store"
import { useInlineRename } from "@/hooks/useInlineRename"
import { toast } from "sonner"
import type { ProjectFolder } from "./projects-types"

export function FolderRow({
  folder,
  isSelected,
  onSelect,
  onRequestDelete,
}: {
  folder: ProjectFolder
  isSelected: boolean
  onSelect: () => void
  onRequestDelete: () => void
}) {
  const renameFolder = useProjectsStore((s) => s.renameFolder)
  const rename = useInlineRename(folder.name, (name) => {
    renameFolder(folder.id, name)
    toast.success("Folder renamed")
  })

  if (rename.editing) {
    return (
      <div className="group flex items-center gap-1 px-3 py-1.5">
        <Folder className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <input
          type="text"
          {...rename.inputProps}
          className="min-w-0 flex-1 rounded border border-border bg-bg-secondary px-1 py-0.5 text-xs text-text-primary focus:border-accent focus:outline-none"
        />
        <button
          onClick={rename.commit}
          className="flex h-4 w-4 items-center justify-center rounded text-text-muted hover:text-accent"
          aria-label="Save name"
        >
          <Check className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="group flex items-center">
      <button
        onClick={onSelect}
        className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
          isSelected
            ? "bg-accent/10 text-accent"
            : "text-text-secondary hover:bg-bg-secondary"
        }`}
      >
        <Folder className="h-3.5 w-3.5" />
        <span className="truncate">{folder.name}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          rename.start()
        }}
        className="mr-0.5 flex h-5 w-5 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:bg-bg-secondary hover:text-accent group-hover:opacity-100"
        aria-label={`Rename ${folder.name}`}
        title="Rename folder"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        onClick={onRequestDelete}
        className="mr-1 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-error/10 group-hover:opacity-100"
        aria-label={`Delete ${folder.name}`}
      >
        <Trash2 className="h-3 w-3 text-error" />
      </button>
    </div>
  )
}
