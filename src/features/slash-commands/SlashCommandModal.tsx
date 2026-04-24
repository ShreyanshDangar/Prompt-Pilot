import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { useSlashStore } from "./slash-store"
import { BUILT_IN_NAMES } from "./built-in-commands"
import { toast } from "sonner"

export function SlashCommandModal() {
  const closeCreateModal = useSlashStore((s) => s.closeCreateModal)
  const addCommand = useSlashStore((s) => s.addCommand)
  const updateCommand = useSlashStore((s) => s.updateCommand)
  const editingCommand = useSlashStore((s) => s.editingCommand)

  const initialName = editingCommand?.name
    ? editingCommand.name.startsWith("/")
      ? editingCommand.name.slice(1)
      : editingCommand.name
    : ""
  const [name, setName] = useState(initialName)
  const [content, setContent] = useState(editingCommand?.content ?? "")
  const [description, setDescription] = useState(
    editingCommand?.description ?? ""
  )
  const [error, setError] = useState("")

  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const descriptionInputRef = useRef<HTMLInputElement | null>(null)
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCreateModal()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [closeCreateModal])

  const handleSave = () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Command name is too short")
      return
    }
    const fullName = `/${trimmedName}`
    if (fullName.length < 2) {
      setError("Command name is too short")
      return
    }
    if (BUILT_IN_NAMES.includes(fullName.toLowerCase())) {
      setError("This name is reserved for a built-in command")
      return
    }
    if (!content.trim()) {
      setError("Content cannot be empty")
      return
    }

    if (editingCommand) {
      const success = updateCommand(editingCommand.name, {
        name: fullName,
        content,
        description,
      })
      if (!success) {
        setError("A command with this name already exists")
        return
      }
      toast.success("Command updated")
    } else {
      const success = addCommand({ name: fullName, content, description })
      if (!success) {
        setError("A command with this name already exists")
        return
      }
      toast.success("Command created")
    }
    closeCreateModal()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay">
      <motion.div
        className="panel-surface w-full max-w-lg rounded-xl border border-border p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {editingCommand ? "Edit Command" : "Create Slash Command"}
          </h2>
          <button
            onClick={closeCreateModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Name
            </label>
            <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-border bg-bg-primary transition-colors focus-within:border-accent">
              <span
                aria-hidden="true"
                className="flex shrink-0 select-none items-center justify-center border-r border-border bg-bg-secondary px-3 text-sm font-medium text-text-secondary"
              >
                /
              </span>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value.replace(/^\/+/, ""))
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    descriptionInputRef.current?.focus()
                  }
                }}
                className="flex-1 bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none"
                placeholder="my-command"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Description
            </label>
            <input
              ref={descriptionInputRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  contentInputRef.current?.focus()
                }
              }}
              className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="What does this command do?"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Content
            </label>
            <textarea
              ref={contentInputRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError("")
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  handleSave()
                }
              }}
              rows={6}
              className="w-full resize-y rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
              placeholder="Enter the command content... (Cmd/Ctrl+Enter to submit)"
            />
          </div>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={closeCreateModal}
              className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {editingCommand ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
