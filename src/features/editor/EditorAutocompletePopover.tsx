import { useEffect, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PopoverPosition } from "./useEditorAutocomplete"

/**
 * Presentational shell shared by the slash-command and XML-tag autocomplete
 * popovers: the fixed overlay, the cursor-anchored `panel-surface` panel, the
 * header line, and the scrollable results list (with `scrollIntoView` tracking
 * the selected item). Emits the same DOM/classes/motion props the call sites
 * used; `dataPopover` preserves the `[data-popover]` hook targeted by globals.css.
 */
interface EditorAutocompletePopoverProps<T> {
  isOpen: boolean
  dataPopover: string
  icon: ReactNode
  headerText: string
  items: T[]
  getItemKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  selectedIndex: number
  position: PopoverPosition
  emptyText: string
  onSelect: (item: T) => void
  onHover: (index: number) => void
  onClose: () => void
}

export function EditorAutocompletePopover<T>({
  isOpen,
  dataPopover,
  icon,
  headerText,
  items,
  getItemKey,
  renderItem,
  selectedIndex,
  position,
  emptyText,
  onSelect,
  onHover,
  onClose,
}: EditorAutocompletePopoverProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  useEffect(() => {
    const el = itemRefs.current.get(selectedIndex)
    if (el && listRef.current) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            data-popover={dataPopover}
            className="panel-surface fixed z-50 w-72 overflow-hidden rounded-xl border border-border shadow-2xl gpu-accelerated"
            style={{ top: position.top, left: position.left }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          >
            <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
              {icon}
              <span className="text-xs text-text-secondary">{headerText}</span>
            </div>

            {items.length > 0 ? (
              <div
                ref={listRef}
                className="max-h-60 overflow-y-auto p-1 scrollbar-thin bg-bg-elevated"
              >
                {items.map((item, index) => (
                  <button
                    key={getItemKey(item)}
                    ref={(el) => {
                      if (el) itemRefs.current.set(index, el)
                      else itemRefs.current.delete(index)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-accent/15 text-accent"
                        : "text-text-primary hover:bg-bg-secondary"
                    }`}
                    onClick={() => onSelect(item)}
                    onMouseEnter={() => onHover(index)}
                  >
                    {renderItem(item)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-bg-elevated px-3 py-4 text-center text-xs text-text-muted">
                {emptyText}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
