import { useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import { getCursorPopoverPosition } from "./editor-popover-position"

export interface PopoverPosition {
  top: number
  left: number
}

/**
 * Shared state machine for the editor's trigger-character autocomplete popovers
 * (slash commands `/`, XML tags `<`). Owns open/close, the typed query, the
 * selected index, the cursor-anchored popover position, and the live results
 * (via `search`); the call site keeps its own insertion behaviour in `onAccept`.
 *
 * Parameters capture the only differences between the two popovers:
 * - `triggerKey`  — the character that opens it (`"/"` vs `"<"`).
 * - `isQueryChar` — whether a key extends the query (slash: any single char;
 *                   xml: `[a-zA-Z0-9_-]`).
 * - `closeKeys`   — keys that close without accepting (slash: space; xml: space + `>`).
 * - `acceptKeys`  — keys that accept the selection (slash: Enter; xml: Enter + Tab).
 * - `search`      — maps the current query to results (xml caps to 30).
 * - `onAccept`    — invoked with the selected item and the editor range spanning
 *                   the trigger char + typed query, so the call site can replace it.
 */
export interface PopoverRange {
  from: number
  to: number
}

export interface EditorAutocompleteOptions<T> {
  editor: Editor
  triggerKey: string
  isQueryChar: (e: KeyboardEvent) => boolean
  closeKeys: string[]
  acceptKeys: string[]
  search: (query: string) => T[]
  onAccept: (item: T, range: PopoverRange) => void
}

export interface EditorAutocomplete<T> {
  isOpen: boolean
  query: string
  selectedIndex: number
  position: PopoverPosition
  results: T[]
  close: () => void
  accept: (item: T) => void
  handleKeyDown: (e: KeyboardEvent) => boolean
  setSelectedIndex: (index: number) => void
}

export function useEditorAutocomplete<T>({
  editor,
  triggerKey,
  isQueryChar,
  closeKeys,
  acceptKeys,
  search,
  onAccept,
}: EditorAutocompleteOptions<T>): EditorAutocomplete<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0 })
  const [triggerPos, setTriggerPos] = useState<number | null>(null)

  const results = search(query)

  const updatePosition = useCallback(() => {
    const next = getCursorPopoverPosition(editor, triggerPos, {
      width: 288,
      height: 320,
    })
    if (next) setPosition(next)
  }, [editor, triggerPos])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery("")
    setSelectedIndex(0)
    setTriggerPos(null)
  }, [])

  // Computes the editor range covering the trigger char + typed query (falling
  // back to a length-derived range when the trigger position was lost), hands it
  // to the call site, then closes — both call sites always closed after inserting.
  // Rebuilt each render to read the latest trigger/query.
  const accept = (item: T) => {
    const currentPos = editor.state.selection.from
    const rangeFrom =
      triggerPos !== null ? triggerPos : Math.max(0, currentPos - query.length - 1)
    onAccept(item, { from: rangeFrom, to: currentPos })
    close()
  }

  // Rebuilt every render (consumed via useImperativeHandle with no deps) so it
  // always reads the latest state/results — mirrors the original inline handlers.
  const handleKeyDown = (e: KeyboardEvent): boolean => {
    if (e.key === triggerKey && !isOpen) {
      setTriggerPos(editor.state.selection.from)
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

    if (acceptKeys.includes(e.key)) {
      const item = results[selectedIndex]
      if (item) {
        accept(item)
      } else {
        close()
      }
      return true
    }

    if (e.key === "Backspace" && query === "") {
      close()
      return false
    }

    if (closeKeys.includes(e.key)) {
      close()
      return false
    }

    if (isQueryChar(e)) {
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
  }

  // Position the popover when it opens. The setState is deferred into a
  // requestAnimationFrame callback (not the effect body) so it does not trip
  // react-hooks/set-state-in-effect; this matches the existing on-open rAF above
  // and is visually identical.
  useEffect(() => {
    if (!isOpen) return
    const raf = requestAnimationFrame(() => updatePosition())
    return () => cancelAnimationFrame(raf)
  }, [isOpen, updatePosition])

  return {
    isOpen,
    query,
    selectedIndex,
    position,
    results,
    close,
    accept,
    handleKeyDown,
    setSelectedIndex,
  }
}
