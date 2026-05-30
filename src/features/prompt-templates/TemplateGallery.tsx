import { useState, useMemo } from "react"
import { GitFork, Grid3x3, List, Import } from "lucide-react"
import { TEMPLATES, TEMPLATE_CATEGORIES } from "./template-data"
import type { PromptTemplate } from "./template-data"
import { useSlashStore } from "@/features/slash-commands/slash-store"
import { useEditorStore } from "@/features/editor/editor-store"
import { textToParagraphNodes } from "@/features/editor/editor-insert"
import { VariableFillModal } from "@/features/slash-commands/VariableFillModal"
import { extractVariables } from "@/features/slash-commands/variable-utils"
import { toast } from "sonner"
import { GalleryModal } from "@/components/modals/GalleryModal"
import {
  GalleryHeader,
  GallerySearchField,
  GalleryCategoryPills,
  GalleryEmptyState,
} from "@/components/gallery/GalleryChrome"
import { useAutoFocusOnOpen } from "@/hooks/useAutoFocusOnOpen"

interface TemplateGalleryProps {
  isOpen: boolean
  onClose: () => void
}

function TemplateCard({
  template,
  onFork,
  onInsert,
  viewMode,
}: {
  template: PromptTemplate
  onFork: (t: PromptTemplate) => void
  onInsert: (t: PromptTemplate) => void
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
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onInsert(template)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs text-white transition-colors hover:bg-accent-hover"
            title="Insert into editor"
          >
            <Import className="h-3 w-3" />
            Insert
          </button>
          <button
            onClick={() => onFork(template)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-accent/10 px-2.5 text-xs text-accent transition-colors hover:bg-accent/20"
          >
            <GitFork className="h-3 w-3" />
            Fork
          </button>
        </div>
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
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => onInsert(template)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-xs text-white transition-colors hover:bg-accent-hover"
            title="Insert into editor"
          >
            <Import className="h-3 w-3" />
            Insert
          </button>
          <button
            onClick={() => onFork(template)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-accent/10 px-2.5 text-xs text-accent transition-colors hover:bg-accent/20"
            title="Fork as slash command"
          >
            <GitFork className="h-3 w-3" />
            Fork
          </button>
        </div>
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
  const [insertTemplate, setInsertTemplate] = useState<PromptTemplate | null>(
    null,
  )
  const addCommand = useSlashStore((s) => s.addCommand)
  const searchInputRef = useAutoFocusOnOpen(isOpen)

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

  const doInsert = (text: string, name: string) => {
    const { activeTabId, tabs, editor, updateTabContent } =
      useEditorStore.getState()
    if (editor) {
      editor
        .chain()
        .focus()
        .insertContent(textToParagraphNodes(text, { keepEmpty: true }))
        .run()
    } else {
      const activeTab = tabs.find((t) => t.id === activeTabId)
      if (activeTab) {
        const escape = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        const html = text
          .split("\n")
          .map((line) => `<p>${escape(line) || "<br>"}</p>`)
          .join("")
        updateTabContent(
          activeTabId,
          activeTab.content ? activeTab.content + html : html,
        )
      }
    }
    onClose()
    toast.success(`Inserted "${name}"`)
  }

  const handleInsert = (template: PromptTemplate) => {
    if (extractVariables(template.content).length > 0) {
      setInsertTemplate(template)
      return
    }
    doInsert(template.content, template.name)
  }

  return (
    <>
      {insertTemplate && (
        <VariableFillModal
          commandName={insertTemplate.name}
          content={insertTemplate.content}
          onResolve={(resolved) => {
            doInsert(resolved, insertTemplate.name)
            setInsertTemplate(null)
          }}
          onCancel={() => setInsertTemplate(null)}
        />
      )}
      <GalleryModal open={isOpen} onClose={onClose} ariaLabel="Prompt Templates">
          <GalleryHeader title="Prompt Templates" onClose={onClose} />

          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <GallerySearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search templates..."
              inputRef={searchInputRef}
            />
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

          <GalleryCategoryPills
            categories={TEMPLATE_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

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
                  onInsert={handleInsert}
                  viewMode={viewMode}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <GalleryEmptyState>No templates found</GalleryEmptyState>
            )}
          </div>
      </GalleryModal>
    </>
  )
}
