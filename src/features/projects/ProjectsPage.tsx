import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FolderPlus, FilePlus, Folder, FileText, Trash2, Star,
  Search, ChevronRight, Pencil, Check, Plus } from "lucide-react"
import { useProjectsStore } from "./projects-store"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { toast } from "sonner"
import type { ProjectFolder } from "./projects-types"

function ProjectDetail() {
  const projects = useProjectsStore((s) => s.projects)
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId)
  const updateProject = useProjectsStore((s) => s.updateProject)
  const addPromptVersion = useProjectsStore((s) => s.addPromptVersion)
  const project = projects.find((p) => p.id === selectedProjectId)
  const [showVersionInput, setShowVersionInput] = useState(false)
  const [versionText, setVersionText] = useState("")

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
        Select a project to view details
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 scrollbar-thin">
      <h3 className="mb-1 text-lg font-semibold text-text-primary">
        {project.name}
      </h3>
      <div className="mb-4 flex items-center gap-2 text-xs text-text-muted">
        <span className="rounded bg-bg-secondary px-2 py-0.5">{project.status}</span>
        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => updateProject(project.id, { rating: star })}
              className="transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`h-5 w-5 ${star <= project.rating
                    ? "fill-warning text-warning"
                    : "text-text-muted"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          Output Summary
        </label>
        <textarea
          value={project.outputSummary}
          onChange={(e) =>
            updateProject(project.id, { outputSummary: e.target.value })
          }
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          placeholder="Summarize the AI response..."
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          What Worked
        </label>
        <textarea
          value={project.whatWorked}
          onChange={(e) =>
            updateProject(project.id, { whatWorked: e.target.value })
          }
          rows={2}
          className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          placeholder="What produced good results..."
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          What Didn't Work
        </label>
        <textarea
          value={project.whatDidntWork}
          onChange={(e) =>
            updateProject(project.id, { whatDidntWork: e.target.value })
          }
          rows={2}
          className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          placeholder="What needs improvement..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-secondary">
          General Notes
        </label>
        <textarea
          value={project.notes}
          onChange={(e) =>
            updateProject(project.id, { notes: e.target.value })
          }
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
          placeholder="Additional notes..."
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium text-text-secondary">
            {project.promptVersions.length} version{project.promptVersions.length !== 1 ? "s" : ""}
          </div>
          <button
            onClick={() => setShowVersionInput((v) => !v)}
            className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[10px] font-medium text-accent transition-colors hover:bg-accent/20"
            aria-label="Add prompt version"
          >
            <Plus className="h-3 w-3" />
            Add version
          </button>
        </div>
        {showVersionInput && (
          <div className="mb-2 flex flex-col gap-1.5">
            <textarea
              value={versionText}
              onChange={(e) => setVersionText(e.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"
              placeholder="Paste prompt text for this version..."
            />
            <div className="flex justify-end gap-1">
              <button
                onClick={() => {
                  setShowVersionInput(false)
                  setVersionText("")
                }}
                className="rounded px-2 py-0.5 text-xs text-text-muted hover:bg-bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (versionText.trim()) {
                    addPromptVersion(project.id, versionText.trim())
                    setVersionText("")
                    setShowVersionInput(false)
                    toast.success("Version added")
                  }
                }}
                className="rounded bg-accent px-2 py-0.5 text-xs text-white hover:bg-accent-hover"
              >
                Save
              </button>
            </div>
          </div>
        )}
        <div className="space-y-1">
          {project.promptVersions.map((v, idx) => (
            <div
              key={v.id}
              className="group flex items-start gap-2 rounded-md border border-border bg-bg-primary px-2.5 py-1.5"
            >
              <span className="mt-0.5 shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                v{idx + 1}
              </span>
              <span className="flex-1 truncate text-xs text-text-secondary">
                {v.text}
              </span>
              <button
                onClick={() =>
                  updateProject(project.id, {
                    promptVersions: project.promptVersions.filter((pv) => pv.id !== v.id),
                  })
                }
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                aria-label="Remove version"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FolderRow({
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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(folder.name)

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== folder.name) {
      renameFolder(folder.id, trimmed)
      toast.success("Folder renamed")
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="group flex items-center gap-1 px-3 py-1.5">
        <Folder className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        <input
          type="text"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit()
            if (e.key === "Escape") {
              setDraft(folder.name)
              setEditing(false)
            }
          }}
          className="min-w-0 flex-1 rounded border border-border bg-bg-secondary px-1 py-0.5 text-xs text-text-primary focus:border-accent focus:outline-none"
        />
        <button
          onClick={commit}
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
          setDraft(folder.name)
          setEditing(true)
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

export function ProjectsPage() {
  const isOpen = useProjectsStore((s) => s.isOpen)
  const setOpen = useProjectsStore((s) => s.setOpen)
  const folders = useProjectsStore((s) => s.folders)
  const projects = useProjectsStore((s) => s.projects)
  const selectedFolderId = useProjectsStore((s) => s.selectedFolderId)
  const selectedProjectId = useProjectsStore((s) => s.selectedProjectId)
  const createFolder = useProjectsStore((s) => s.createFolder)
  const deleteFolder = useProjectsStore((s) => s.deleteFolder)
  const createProject = useProjectsStore((s) => s.createProject)
  const deleteProject = useProjectsStore((s) => s.deleteProject)

  const selectFolder = useProjectsStore((s) => s.selectFolder)
  const selectProject = useProjectsStore((s) => s.selectProject)
  const initialize = useProjectsStore((s) => s.initialize)
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [folderPendingDelete, setFolderPendingDelete] = useState<string | null>(
    null,
  )
  const [projectPendingDelete, setProjectPendingDelete] = useState<string | null>(
    null,
  )
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, setOpen])

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])

  const pendingFolder = folderPendingDelete
    ? folders.find((f) => f.id === folderPendingDelete) ?? null
    : null
  const pendingFolderProjectCount = folderPendingDelete
    ? projects.filter((p) => p.folderId === folderPendingDelete).length
    : 0
  const pendingProject = projectPendingDelete
    ? projects.find((p) => p.id === projectPendingDelete) ?? null
    : null

  const lowerQuery = searchQuery.toLowerCase()
  const matchesQuery = (p: { name: string; tags: string[] }) =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.tags.some((t) => t.toLowerCase().includes(lowerQuery))

  const filteredProjects = searchQuery
    ? projects.filter(matchesQuery)
    : selectedFolderId
      ? projects.filter((p) => p.folderId === selectedFolderId)
      : projects

  const totalCount = `${projects.length} project${projects.length !== 1 ? "s" : ""} in ${folders.length} folder${folders.length !== 1 ? "s" : ""}`

  return (
    <>
    <AnimatePresence>
      {isOpen && (
      <motion.div
        key="projects-modal"
        className="fixed inset-0 z-40 flex items-center justify-center bg-bg-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          className="panel-surface flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Projects
              </h2>
              <p className="text-xs text-text-muted">{totalCount}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
              aria-label="Close projects"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-56 shrink-0 flex-col border-r border-border">
              <div className="flex items-center gap-2 border-b border-border p-3">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-bg-primary px-2 py-1.5">
                  <Search className="h-3.5 w-3.5 text-text-muted" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-text-primary outline-none"
                    placeholder="Search projects..."
                  />
                </div>
                <button
                  onClick={() => setShowNewFolder(true)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
                  aria-label="New folder"
                  title="New folder"
                >
                  <FolderPlus className="h-4 w-4 text-text-muted" />
                </button>
              </div>

              {showNewFolder && (
                <div className="flex items-center gap-1 border-b border-border px-3 py-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newFolderName.trim()) {
                        createFolder(newFolderName.trim())
                        setNewFolderName("")
                        setShowNewFolder(false)
                      }
                      if (e.key === "Escape") setShowNewFolder(false)
                    }}
                    className="flex-1 bg-transparent text-xs text-text-primary outline-none"
                    placeholder="Folder name..."
                    autoFocus
                  />
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                <button
                  onClick={() => selectFolder(null)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${selectedFolderId === null
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-bg-secondary"
                    }`}
                >
                  All Projects
                </button>
                {folders.map((folder) => (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    isSelected={selectedFolderId === folder.id}
                    onSelect={() => selectFolder(folder.id)}
                    onRequestDelete={() => setFolderPendingDelete(folder.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-52 shrink-0 flex-col border-r border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-text-secondary">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
                </span>
                {selectedFolderId && (
                  <button
                    onClick={() => {
                      createProject(selectedFolderId, `New Project ${projects.length + 1}`)
                      toast.success("Project created")
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-bg-secondary"
                    aria-label="New project"
                  >
                    <FilePlus className="h-3.5 w-3.5 text-text-muted" />
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {filteredProjects.map((project) => {
                  const isSelected = selectedProjectId === project.id
                  return (
                    <div
                      key={project.id}
                      className={`group mb-1 flex w-full items-stretch rounded-lg transition-colors ${
                        isSelected
                          ? "bg-accent/10 ring-1 ring-accent/40"
                          : "hover:bg-bg-secondary"
                      }`}
                    >
                      <button
                        onClick={() => selectProject(project.id)}
                        className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-xs"
                      >
                        <FileText
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isSelected ? "text-accent" : "text-text-muted"
                          }`}
                        />
                        <div className="flex-1 truncate">
                          <div
                            className={`truncate ${
                              isSelected ? "text-accent" : "text-text-primary"
                            }`}
                          >
                            {project.name}
                          </div>
                          <div className="flex items-center gap-1 text-text-muted">
                            {project.rating > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                                {project.rating}
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <ChevronRight className="h-3 w-3 text-accent" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-text-muted" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectPendingDelete(project.id)
                        }}
                        className="mr-1 flex w-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-error/10 group-hover:opacity-100"
                        aria-label={`Delete ${project.name}`}
                        title="Delete project"
                      >
                        <Trash2 className="h-3 w-3 text-error" />
                      </button>
                    </div>
                  )
                })}
                {filteredProjects.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-text-muted">
                    {searchQuery
                      ? "No projects match your search"
                      : selectedFolderId
                        ? "No projects in this folder"
                        : "No projects yet"}
                  </div>
                )}
              </div>
            </div>

            <ProjectDetail />
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
    <ConfirmDialog
      open={folderPendingDelete !== null}
      title={pendingFolder ? `Delete "${pendingFolder.name}"?` : "Delete folder?"}
      destructive
      confirmLabel="Delete folder"
      message={
        pendingFolderProjectCount > 0
          ? `This will permanently delete ${pendingFolderProjectCount} project${
              pendingFolderProjectCount === 1 ? "" : "s"
            } inside, including every prompt version, rating, and note. This cannot be undone.`
          : "This folder is empty. Are you sure you want to delete it?"
      }
      onConfirm={() => {
        if (folderPendingDelete) {
          deleteFolder(folderPendingDelete)
          toast.success("Folder deleted")
        }
        setFolderPendingDelete(null)
      }}
      onCancel={() => setFolderPendingDelete(null)}
    />
    <ConfirmDialog
      open={projectPendingDelete !== null}
      title={pendingProject ? `Delete "${pendingProject.name}"?` : "Delete project?"}
      destructive
      confirmLabel="Delete project"
      message="The project, every prompt version, rating, and note will be permanently removed. This cannot be undone."
      onConfirm={() => {
        if (projectPendingDelete) {
          deleteProject(projectPendingDelete)
          toast.success("Project deleted")
        }
        setProjectPendingDelete(null)
      }}
      onCancel={() => setProjectPendingDelete(null)}
    />
    </>
  )
}
