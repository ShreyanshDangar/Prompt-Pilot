import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Plus, Trash2, Copy, Check } from "lucide-react"
import { useXmlTagsStore } from "./xml-tags-store"
import { XML_TAG_CATEGORIES } from "./xml-tag-data"
import type { XmlTag } from "./xml-tag-data"
import { toast } from "sonner"
import { GalleryModal } from "@/components/GalleryModal"
import { ConfirmDialog } from "@/components/ConfirmDialog"

function TagCard({
  tag,
  isCustom,
  onInsert,
  onDelete,
}: {
  tag: XmlTag
  isCustom: boolean
  onInsert: (tag: XmlTag) => void
  onDelete?: (id: string) => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const snippet = `<${tag.name}>\n\n</${tag.name}>`
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      toast.success(`<${tag.name}> copied`)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {
      toast.error("Failed to copy")
    })
  }

  return (
    <div className="group relative rounded-lg border border-border bg-bg-primary p-4 transition-colors hover:bg-bg-secondary">
      <div className="mb-1.5 flex items-start justify-between">
        <button
          onClick={() => onInsert(tag)}
          className="text-left text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          &lt;{tag.name}&gt;
        </button>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
            aria-label={`Copy <${tag.name}>`}
            title="Copy tag"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          {isCustom && onDelete && (
            <button
              onClick={() => onDelete(tag.id)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-error/10 hover:text-error"
              aria-label={`Delete <${tag.name}>`}
              title="Delete tag"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-text-muted">{tag.description}</p>
      <span className="mt-2 inline-block rounded bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
        {tag.category}
      </span>
    </div>
  )
}

interface XmlTagGalleryProps {
  isOpen: boolean
  onClose: () => void
  onInsertTag: (tagText: string) => void
}

export function XmlTagGallery({ isOpen, onClose, onInsertTag }: XmlTagGalleryProps) {
  const searchQuery = useXmlTagsStore((s) => s.searchQuery)
  const setSearchQuery = useXmlTagsStore((s) => s.setSearchQuery)
  const searchTags = useXmlTagsStore((s) => s.searchTags)
  const addCustomTag = useXmlTagsStore((s) => s.addCustomTag)
  const removeCustomTag = useXmlTagsStore((s) => s.removeCustomTag)
  const customTags = useXmlTagsStore((s) => s.customTags)
  const initialize = useXmlTagsStore((s) => s.initialize)

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagDescription, setNewTagDescription] = useState("")
  const [newTagCategory, setNewTagCategory] = useState("Basic Structure")
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])

  const filtered = useMemo(() => {
    let result = searchTags(searchQuery)
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory)
    }
    return result
  }, [searchQuery, selectedCategory, searchTags])

  const handleInsert = (tag: XmlTag) => {
    const snippet = `<${tag.name}>\n\n</${tag.name}>`
    onInsertTag(snippet)
    toast.success(`Inserted <${tag.name}>`)
  }

  const handleAddCustomTag = () => {
    const name = newTagName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_")
    if (!name) {
      toast.error("Tag name is required")
      return
    }
    const success = addCustomTag({
      name,
      description: newTagDescription.trim() || `Custom tag: ${name}`,
      category: newTagCategory,
    })
    if (success) {
      toast.success(`Added custom tag <${name}>`)
      setNewTagName("")
      setNewTagDescription("")
      setShowAddForm(false)
    } else {
      toast.error(`Tag <${name}> already exists`)
    }
  }

  const customTagIds = new Set(customTags.map((t) => t.id))
  const pendingTag = pendingDeleteId
    ? customTags.find((t) => t.id === pendingDeleteId) ?? null
    : null

  return (
    <>
    <GalleryModal open={isOpen} onClose={onClose} ariaLabel="XML Tags">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold text-text-primary">
              XML Tags
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
                placeholder="Search tags..."
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                showAddForm
                  ? "bg-accent text-white"
                  : "bg-accent/10 text-accent hover:bg-accent/20"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Custom Tag
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                className="border-b border-border px-4 py-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                    placeholder="Tag name (e.g. instructions)"
                  />
                  <input
                    type="text"
                    value={newTagDescription}
                    onChange={(e) => setNewTagDescription(e.target.value)}
                    className="flex-[2] rounded-lg border border-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                    placeholder="Description..."
                  />
                  <select
                    value={newTagCategory}
                    onChange={(e) => setNewTagCategory(e.target.value)}
                    className="rounded-lg border border-border bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
                  >
                    {XML_TAG_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!newTagName.trim()}
                    className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {XML_TAG_CATEGORIES.map((cat) => (
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tag) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  isCustom={customTagIds.has(tag.id)}
                  onInsert={handleInsert}
                  onDelete={(id) => setPendingDeleteId(id)}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-text-muted">
                No tags found
              </div>
            )}
          </div>
    </GalleryModal>
    <ConfirmDialog
      open={pendingDeleteId !== null}
      title={
        pendingTag
          ? `Delete <${pendingTag.name}>?`
          : "Delete custom tag?"
      }
      destructive
      confirmLabel="Delete"
      message="This custom XML tag will be permanently removed from your library."
      onConfirm={() => {
        if (pendingDeleteId) {
          removeCustomTag(pendingDeleteId)
          toast.success("Tag deleted")
        }
        setPendingDeleteId(null)
      }}
      onCancel={() => setPendingDeleteId(null)}
    />
    </>
  )
}
