import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Editor } from "@tiptap/react"
import { Slash } from "lucide-react"
import { useSlashStore } from "./slash-store"
import { VariableFillModal } from "./VariableFillModal"
import { extractVariables } from "./variable-utils"
import { useGlobalStore } from "@/stores/global-store"
import { useProjectsStore } from "@/features/projects/projects-store"
import { textToParagraphNodes } from "@/features/editor/editor-insert"
import { getCursorPopoverPosition } from "@/features/editor/editor-popover-position"
import type { SlashCommand } from "./slash-types"

interface SlashCommandPopoverProps {
  editor: Editor
}

export const SlashCommandPopover = forwardRef<
  { handleKeyDown: (e: KeyboardEvent) => boolean },
  SlashCommandPopoverProps
>(function SlashCommandPopoverInner({ editor }, ref) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [pendingCommand, setPendingCommand] = useState<SlashCommand | null>(null)
  const [deleteRange, setDeleteRange] = useState<{ from: number; to: number } | null>(null)
  const [slashPos, setSlashPos] = useState<number | null>(null)
  const searchCommands = useSlashStore((s) => s.searchCommands)
  const incrementUsage = useSlashStore((s) => s.incrementUsage)
  const openCreateModal = useSlashStore((s) => s.openCreateModal)
  const slashInsertionMode = useGlobalStore((s) => s.settings.slashInsertionMode)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const results = searchCommands(query)

  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex)
    if (el && listRef.current) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex])

  const updatePosition = useCallback(() => {
    const next = getCursorPopoverPosition(editor, slashPos, {
      width: 288,
      height: 320,
    })
    if (next) setPosition(next)
  }, [editor, slashPos])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
    setSlashPos(null)
  }, [])

  const insertCommand = useCallback(
    (command: SlashCommand) => {
      const currentPos = editor.state.selection.from
      const rangeFrom = slashPos !== null ? slashPos : Math.max(0, currentPos - query.length - 1)
      const range = { from: rangeFrom, to: currentPos }

      if (command.name === "/create") {
        editor.chain().focus().deleteRange(range).run()
        openCreateModal()
        close()
        return
      }

      if (command.name === "/templates") {
        editor.chain().focus().deleteRange(range).run()
        useGlobalStore.getState().setActivePanel("templates")
        close()
        return
      }

      if (command.name === "/projects") {
        editor.chain().focus().deleteRange(range).run()
        useProjectsStore.getState().setOpen(true)
        close()
        return
      }

      if (command.content) {
        const variables = extractVariables(command.content)
        if (variables.length > 0) {
          setDeleteRange(range)
          setPendingCommand(command)
          close()
          return
        }

        const chain = editor.chain().focus().deleteRange(range)

        if (slashInsertionMode === "block") {
          chain.insertContent(textToParagraphNodes(command.content))
        } else {
          chain.insertContent(command.content)
        }

        chain.run()
        incrementUsage(command.name)
      }

      close()
    },
    [editor, query, slashPos, incrementUsage, openCreateModal, close, slashInsertionMode]
  )

  const handleVariableResolve = useCallback(
    (resolved: string) => {
      if (deleteRange) {
        editor
          .chain()
          .focus()
          .deleteRange(deleteRange)
          .insertContent(resolved)
          .run()
      } else {
        editor.chain().focus().insertContent(resolved).run()
      }
      if (pendingCommand) {
        incrementUsage(pendingCommand.name)
      }
      setPendingCommand(null)
      setDeleteRange(null)
    },
    [editor, deleteRange, pendingCommand, incrementUsage]
  )

  useImperativeHandle(ref, () => ({
    handleKeyDown: (e: KeyboardEvent) => {
      if (e.key === "/" && !isOpen) {
        const { from } = editor.state.selection
        setSlashPos(from)
        setIsOpen(true)
        setQuery("")
        setSelectedIndex(0)
        requestAnimationFrame(() => {
          updatePosition()
        })
        return false
      }

      if (!isOpen) return false

      if (e.key === "Escape") {
        close()
        return true
      }

      if (e.key === "ArrowDown") {
        setSelectedIndex((i) => {
          const next = i + 1
          return next >= results.length ? results.length - 1 : next
        })
        return true
      }

      if (e.key === "ArrowUp") {
        setSelectedIndex((i) => {
          const prev = i - 1
          return prev < 0 ? 0 : prev
        })
        return true
      }

      if (e.key === "Enter") {
        if (results[selectedIndex]) {
          insertCommand(results[selectedIndex])
        } else {
          close()
        }
        return true
      }

      if (e.key === "Backspace" && query === "") {
        close()
        return false
      }

      if (e.key === " ") {
        close()
        return false
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setQuery((q) => q + e.key)
        setSelectedIndex(0)
        return false
      }

      if (e.key === "Backspace") {
        setQuery((q) => q.slice(0, -1))
        setSelectedIndex(0)
        return false
      }

      return false
    },
  }))

  useEffect(() => {
    if (isOpen) {
      updatePosition()
    }
  }, [isOpen, updatePosition])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={close}
            />
            <motion.div
              data-popover="slash"
              className="panel-surface fixed z-50 w-72 overflow-hidden rounded-xl border border-border shadow-2xl gpu-accelerated"
              style={{ top: position.top, left: position.left }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            >
              <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
                <Slash className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-text-secondary">
                  {query ? `/${query}` : "Type to filter commands..."}
                </span>
              </div>

              {results.length > 0 ? (
                <div
                  ref={listRef}
                  className="max-h-60 overflow-y-auto p-1 scrollbar-thin bg-bg-elevated"
                >
                  {results.map((command, index) => (
                    <button
                      key={command.name}
                      ref={(el) => {
                        if (el) itemRefs.current.set(index, el)
                        else itemRefs.current.delete(index)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-accent/15 text-accent"
                          : "text-text-primary hover:bg-bg-secondary"
                      }`}
                      onClick={() => insertCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex flex-1 flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{command.name}</span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              command.category === "built-in"
                                ? "bg-accent/20 text-accent"
                                : "bg-bg-primary text-text-muted"
                            }`}
                          >
                            {command.category}
                          </span>
                        </div>
                        <span className="text-xs text-text-muted">
                          {command.description}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-bg-elevated px-3 py-4 text-center text-xs text-text-muted">
                  No commands found
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {pendingCommand && (
        <VariableFillModal
          commandName={pendingCommand.name}
          content={pendingCommand.content}
          onResolve={handleVariableResolve}
          onCancel={() => {
            setPendingCommand(null)
            setDeleteRange(null)
          }}
        />
      )}
    </>
  )
})
