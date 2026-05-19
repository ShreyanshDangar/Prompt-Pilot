import { useState } from "react"
import type { DragEvent } from "react"

/**
 * HTML5 drag-to-reorder state for a list. Tracks the dragged item (`dragIndex`)
 * and the current drop target (`dragOverIndex`); `getItemProps(index)` returns
 * the `draggable` + drag event handlers to spread onto each item (or to wire
 * into a per-item component). On a valid drop it calls `onReorder(from, to)`.
 * The caller applies its own highlight classes from `dragIndex`/`dragOverIndex`.
 */
export function useDragReorder(onReorder: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const reset = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const getItemProps = (index: number) => ({
    draggable: true,
    onDragStart: () => setDragIndex(index),
    onDragOver: (e: DragEvent) => {
      if (dragIndex === null) return
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      if (dragOverIndex !== index) setDragOverIndex(index)
    },
    onDragLeave: () => setDragOverIndex(null),
    onDrop: () => {
      if (dragIndex === null || dragIndex === index) {
        reset()
        return
      }
      onReorder(dragIndex, index)
      reset()
    },
    onDragEnd: reset,
  })

  return { dragIndex, dragOverIndex, getItemProps }
}
