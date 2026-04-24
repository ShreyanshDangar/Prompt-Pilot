import { useState, useMemo, useRef, useEffect } from "react"
import { X, Search, GitFork, Grid3x3, List } from "lucide-react"
import { TEMPLATES, TEMPLATE_CATEGORIES } from "./template-data"
import type { PromptTemplate } from "./template-data"
import { useSlashStore } from "@/features/slash-commands/slash-store"
import { toast } from "sonner"
import { GalleryModal } from "@/components/GalleryModal"

interface TemplateGalleryProps {
  isOpen: boolean
  onClose: () => void
}

function TemplateCard({
  template,
  onFork,
  viewMode,
}: {
  template: PromptTemplate
  onFork: (t: PromptTemplate) => void
  viewMode: "grid" | "list"
}) {
  const [expanded, setExpanded] = useState(false)

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-primary px-4 py-3 transition-colors hover:bg-bg-secondary">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary">
              {template.name}
            </span>
            <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
              {template.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {template.description}
          </p>
        </div>
        <button
          onClick={() => onFork(template)}
          className="flex h-7 items-center gap-1.5 rounded-md bg-accent/10 px-2.5 text-xs text-accent transition-colors hover:bg-accent/20"
        >
          <GitFork className="h-3 w-3" />
          Fork
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-lg border border-border bg-bg-primary p-4 transition-colors hover:bg-bg-secondary">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className="text-sm font-medium text-text-primary">
            {template.name}
          </h4>
          <span className="mt-0.5 inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
            {template.category}
          </span>
        </div>
        <button
          onClick={() => onFork(template)}
          className="flex h-7 items-center gap-1.5 rounded-md bg-accent/10 px-2.5 text-xs text-accent transition-colors hover:bg-accent/20"
          title="Fork as slash command"
        >
          <GitFork className="h-3 w-3" />
          Fork
        </button>
      </div>
      <p className="mb-3 text-xs text-text-muted">{template.description}</p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-auto text-left text-xs text-accent hover:underline"
      >
        {expanded ? "Hide preview" : "Show preview"}
      </button>
      {expanded && (
        <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-bg-secondary p-3 text-xs text-text-secondary scrollbar-thin">
          {template.content}
        </pre>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {template.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-bg-secondary px-1.5 py-0.5 text-[10px] text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TemplateGallery({ isOpen, onClose }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const addCommand = useSlashStore((s) => s.addCommand)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])

  const filtered = useMemo(() => {
    let result = TEMPLATES
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }
    return result
  }, [searchQuery, selectedCategory])

  const handleFork = (template: PromptTemplate) => {
    const name = `/${template.id}`
    const success = addCommand({
      name,
      content: template.content,
      description: `Forked from template: ${template.name}`,
    })
    if (success) {
      toast.success(`Forked "${template.name}" as ${name}`)
    } else {
      toast.error(`Command ${name} already exists`)
    }
  }

  return (
    <GalleryModal open={isOpen} onClose={onClose} ariaLabel="Prompt Templates">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold text-text-primary">
              Prompt Templates
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 py-1.5">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-text-primary outline-none"
                placeholder="Search templates..."
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:bg-bg-secondary"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-accent/10 text-accent"
                    : "text-text-muted hover:bg-bg-secondary"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                selectedCategory === null
                  ? "bg-accent text-white"
                  : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
              }`}
            >
              All
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                  selectedCategory === cat
                    ? "bg-accent text-white"
                    : "bg-bg-secondary text-text-secondary hover:bg-bg-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
                  : "flex flex-col gap-2"
              }
            >
              {filtered.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onFork={handleFork}
                  viewMode={viewMode}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-text-muted">
                No templates found
              </div>
            )}
          </div>
    </GalleryModal>
  )
}
