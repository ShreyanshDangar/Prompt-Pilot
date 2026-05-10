import { useState } from "react"
import { motion } from "framer-motion"
import { Trash2, ArrowRight, GripVertical } from "lucide-react"
import { useChainingStore } from "./chaining-store"

export function ChainNode({
  step,
  index,
  chainId,
  isLast,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRequestDelete,
}: {
  step: { id: string; name: string; promptText: string }
  index: number
  chainId: string
  isLast: boolean
  isDragging: boolean
  isDragOver: boolean
  onDragStart: (index: number) => void
  onDragOver: (index: number, e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (index: number) => void
  onDragEnd: () => void
  onRequestDelete: (stepId: string) => void
}) {
  const updateStep = useChainingStore((s) => s.updateStep)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(step.promptText)

  return (
    <div
      className="flex items-start gap-3"
      onDragOver={(e) => onDragOver(index, e)}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(index)}
    >
      <motion.div
        className={`flex w-64 flex-col rounded-lg border bg-bg-primary p-3 shadow-sm transition-colors ${
          isDragOver ? "border-accent" : "border-border"
        } ${isDragging ? "opacity-50" : ""}`}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move"
                onDragStart(index)
              }}
              onDragEnd={onDragEnd}
              className="flex cursor-grab items-center text-text-muted active:cursor-grabbing"
              aria-label={`Reorder step ${index + 1}`}
            >
              <GripVertical className="h-3.5 w-3.5" />
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-[10px] font-medium text-accent">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-text-primary">
              {step.name}
            </span>
          </div>
          <button
            onClick={() => onRequestDelete(step.id)}
            className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-error/10 hover:text-error"
            aria-label="Remove step"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
        {editing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full resize-y rounded border border-border bg-bg-secondary px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
            />
            <div className="mt-1 flex justify-end gap-1">
              <button
                onClick={() => setEditing(false)}
                className="rounded px-2 py-0.5 text-xs text-text-muted hover:bg-bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStep(chainId, step.id, { promptText: editText })
                  setEditing(false)
                }}
                className="rounded bg-accent px-2 py-0.5 text-xs text-white hover:bg-accent-hover"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            {step.promptText
              ? step.promptText.slice(0, 80) + (step.promptText.length > 80 ? "..." : "")
              : "Click to add prompt text..."}
          </button>
        )}
      </motion.div>
      {!isLast && (
        <div className="flex h-16 items-center">
          <ArrowRight className="h-4 w-4 text-text-muted" />
        </div>
      )}
    </div>
  )
}
