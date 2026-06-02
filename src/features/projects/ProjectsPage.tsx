import { useState, useEffect } from "react"
import { FolderPlus, FilePlus, FileText, Trash2, Star,
  Search, ChevronRight, LayoutList, Columns3 } from "lucide-react"
import { useProjectsStore } from "./projects-store"
import { PROJECT_STATUS_META } from "./projects-types"
import type { Project } from "./projects-types"
import { ConfirmDialog } from "@/components/modals/ConfirmDialog"
import { GalleryModal } from "@/components/modals/GalleryModal"
import { usePendingConfirm } from "@/hooks/usePendingConfirm"
import { FolderRow } from "./FolderRow"
import { ProjectDetail } from "./ProjectDetail"
import { toast } from "sonner"
import { GalleryHeader } from "@/components/gallery/GalleryChrome"
import { useAutoFocusOnOpen } from "@/hooks/useAutoFocusOnOpen"

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
  const updateProject = useProjectsStore((s) => s.updateProject)

  const selectFolder = useProjectsStore((s) => s.selectFolder)
  const selectProject = useProjectsStore((s) => s.selectProject)
  const initialize = useProjectsStore((s) => s.initialize)
  const [searchQuery, setSearchQuery] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<
    Project["status"] | null
  >(null)
  const folderConfirm = usePendingConfirm()
  const projectConfirm = usePendingConfirm()
  const searchInputRef = useAutoFocusOnOpen(isOpen)

  useEffect(() => {
    initialize()
  }, [initialize])

  const pendingFolder = folderConfirm.pendingId
    ? folders.find((f) => f.id === folderConfirm.pendingId) ?? null
    : null
  const pendingFolderProjectCount = folderConfirm.pendingId
    ? projects.filter((p) => p.folderId === folderConfirm.pendingId).length
    : 0
  const pendingProject = projectConfirm.pendingId
    ? projects.find((p) => p.id === projectConfirm.pendingId) ?? null
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

  const boardProjects = searchQuery ? projects.filter(matchesQuery) : projects

  const totalCount = `${projects.length} project${projects.length !== 1 ? "s" : ""} in ${folders.length} folder${folders.length !== 1 ? "s" : ""}`

  const handleNewProject = () => {
    let targetFolderId = selectedFolderId ?? folders[0]?.id ?? null
    if (!targetFolderId) {
      targetFolderId = createFolder("My Projects").id
    }
    createProject(targetFolderId, `New Project ${projects.length + 1}`)
    toast.success("Project created")
  }

  return (
    <>
      <GalleryModal
        open={isOpen}
        onClose={() => setOpen(false)}
        ariaLabel="Projects"
      >
          <GalleryHeader
            title="Projects"
            subtitle={totalCount}
            onClose={() => setOpen(false)}
            closeLabel="Close projects"
          />

          <div className="flex items-center justify-end gap-1 border-b border-border px-4 py-2">
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors ${
                viewMode === "list"
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-bg-secondary"
              }`}
              aria-label="List view"
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs transition-colors ${
                viewMode === "board"
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-bg-secondary"
              }`}
              aria-label="Board view"
            >
              <Columns3 className="h-3.5 w-3.5" />
              Board
            </button>
          </div>

          {viewMode === "list" ? (
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
                    onRequestDelete={() => folderConfirm.request(folder.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-52 shrink-0 flex-col border-r border-border">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-text-secondary">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleNewProject}
                  className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:bg-bg-secondary"
                  aria-label="New project"
                >
                  <FilePlus className="h-3.5 w-3.5 text-text-muted" />
                </button>
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
                          projectConfirm.request(project.id)
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
          ) : (
          <div className="flex flex-1 gap-3 overflow-x-auto p-4 scrollbar-thin">
            {PROJECT_STATUS_META.map((col) => {
              const colProjects = boardProjects.filter(
                (p) => p.status === col.value,
              )
              return (
                <div
                  key={col.value}
                  onDragOver={(e) => {
                    e.preventDefault()
                    if (dragOverStatus !== col.value) setDragOverStatus(col.value)
                  }}
                  onDragLeave={() =>
                    setDragOverStatus((s) => (s === col.value ? null : s))
                  }
                  onDrop={() => {
                    if (draggedProjectId) {
                      updateProject(draggedProjectId, { status: col.value })
                    }
                    setDraggedProjectId(null)
                    setDragOverStatus(null)
                  }}
                  className={`flex w-64 shrink-0 flex-col rounded-lg border transition-colors ${
                    dragOverStatus === col.value
                      ? "border-accent bg-accent/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-xs font-medium text-text-secondary">
                      {col.label}
                    </span>
                    <span className="rounded-full bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted">
                      {colProjects.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin">
                    {colProjects.map((project) => (
                      <div
                        key={project.id}
                        draggable
                        onDragStart={() => setDraggedProjectId(project.id)}
                        onDragEnd={() => {
                          setDraggedProjectId(null)
                          setDragOverStatus(null)
                        }}
                        onClick={() => {
                          selectProject(project.id)
                          setViewMode("list")
                        }}
                        className={`cursor-grab rounded-lg border border-border bg-bg-primary p-2.5 transition-colors hover:bg-bg-secondary active:cursor-grabbing ${
                          draggedProjectId === project.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                          <span className="flex-1 truncate text-xs text-text-primary">
                            {project.name}
                          </span>
                        </div>
                        {project.rating > 0 && (
                          <div className="mt-1 flex items-center gap-0.5 text-[10px] text-text-muted">
                            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                            {project.rating}
                          </div>
                        )}
                      </div>
                    ))}
                    {colProjects.length === 0 && (
                      <div className="py-6 text-center text-[10px] text-text-muted">
                        No projects
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
      </GalleryModal>
    <ConfirmDialog
      open={folderConfirm.isOpen}
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
        if (folderConfirm.pendingId) {
          deleteFolder(folderConfirm.pendingId)
          toast.success("Folder deleted")
        }
        folderConfirm.clear()
      }}
      onCancel={() => folderConfirm.clear()}
    />
    <ConfirmDialog
      open={projectConfirm.isOpen}
      title={pendingProject ? `Delete "${pendingProject.name}"?` : "Delete project?"}
      destructive
      confirmLabel="Delete project"
      message="The project, every prompt version, rating, and note will be permanently removed. This cannot be undone."
      onConfirm={() => {
        if (projectConfirm.pendingId) {
          deleteProject(projectConfirm.pendingId)
          toast.success("Project deleted")
        }
        projectConfirm.clear()
      }}
      onCancel={() => projectConfirm.clear()}
    />
    </>
  )
}
