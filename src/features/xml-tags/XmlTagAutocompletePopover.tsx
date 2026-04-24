import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Editor } from "@tiptap/react"
import { Tag } from "lucide-react"
import { useXmlTagsStore } from "./xml-tags-store"
import type { XmlTag } from "./xml-tag-data"

interface XmlTagAutocompletePopoverProps {
  editor: Editor
}

export const XmlTagAutocompletePopover = forwardRef<
  { handleKeyDown: (e: KeyboardEvent) => boolean },
  XmlTagAutocompletePopoverProps
>(function XmlTagAutocompletePopoverInner({ editor }, ref) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [triggerPos, setTriggerPos] = useState<number | null>(null)
  const searchTags = useXmlTagsStore((s) => s.searchTags)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  const results = searchTags(query).slice(0, 30)

  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex)
    if (el && listRef.current) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex])

  const updatePosition = useCallback(() => {
    try {
      const { view } = editor
      if (!view || !view.dom) return
      const pos =
        triggerPos !== null
          ? Math.min(triggerPos + 1, view.state.doc.content.size)
          : view.state.selection.from
      const coords = view.coordsAtPos(pos)
      let top = coords.bottom + 4
      let left = coords.left
      const popoverHeight = 320
      const popoverWidth = 288
      if (top + popoverHeight > window.innerHeight) {
        top = coords.top - popoverHeight - 4
      }
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 8
      }
      left = Math.max(8, left)
      top = Math.max(8, top)

      setPosition({ top, left })
    } catch {
      setPosition({ top: 100, left: 16 })
    }
  }, [editor, triggerPos])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
    setTriggerPos(null)
  }, [])

  const insertTag = useCallback(
    (tag: XmlTag) => {
      const currentPos = editor.state.selection.from
      const rangeFrom =
        triggerPos !== null
          ? triggerPos
          : Math.max(0, currentPos - query.length - 1)
      const range = { from: rangeFrom, to: currentPos }

      const openTag = `<${tag.name}>`
      const closeTag = `</${tag.name}>`
      const fullText = openTag + closeTag

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([{ type: "text", text: fullText }])
        .setTextSelection(rangeFrom + openTag.length)
        .run()

      close()
    },
    [editor, query, triggerPos, close]
  )

  useImperativeHandle(ref, () => ({
    handleKeyDown: (e: KeyboardEvent) => {
      if (e.key === "<" && !isOpen) {
        const { from } = editor.state.selection
        setTriggerPos(from)
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

      if (e.key === "Enter" || e.key === "Tab") {
        if (results[selectedIndex]) {
          insertTag(results[selectedIndex])
          return true
        }
        close()
        return true
      }

      if (e.key === "Backspace" && query === "") {
        close()
        return false
      }

      if (e.key === " " || e.key === ">") {
        close()
        return false
      }

      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        /[a-zA-Z0-9_-]/.test(e.key)
      ) {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      updatePosition()
    }
  }, [isOpen, updatePosition])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <motion.div
            data-popover="xml-tag"
            className="panel-surface fixed z-50 w-72 overflow-hidden rounded-xl border border-border shadow-2xl gpu-accelerated"
            style={{ top: position.top, left: position.left }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
              <Tag className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs text-text-secondary">
                {query ? `<${query}` : "Type an XML tag name..."}
              </span>
            </div>

            {results.length > 0 ? (
              <div
                ref={listRef}
                className="max-h-60 overflow-y-auto p-1 scrollbar-thin bg-bg-elevated"
              >
                {results.map((tag, index) => (
                  <button
                    key={tag.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(index, el)
                      else itemRefs.current.delete(index)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-accent/15 text-accent"
                        : "text-text-primary hover:bg-bg-secondary"
                    }`}
                    onClick={() => insertTag(tag)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {`<${tag.name}>`}
                        </span>
                        <span className="rounded bg-bg-primary px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                          {tag.category}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {tag.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bg-elevated px-3 py-4 text-center text-xs text-text-muted">
                No tags found
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})
