import { useState } from "react"
import { X, Star, Plus } from "lucide-react"
import { useProjectsStore } from "./projects-store"
import { toast } from "sonner"

export function ProjectDetail() {
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
