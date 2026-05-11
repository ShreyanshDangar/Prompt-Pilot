import { useState } from "react"
import { Plus } from "lucide-react"
import { useChainingStore } from "./chaining-store"
import type { PromptChain } from "./chaining-store"
import { ConfirmDialog } from "@/components/modals/ConfirmDialog"
import { toast } from "sonner"
import { ChainNode } from "./ChainNode"

export function ChainDetail({ chain }: { chain: PromptChain }) {
  const addStep = useChainingStore((s) => s.addStep)
  const removeStep = useChainingStore((s) => s.removeStep)
  const reorderSteps = useChainingStore((s) => s.reorderSteps)
  const [newStepName, setNewStepName] = useState("")
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [pendingStepDelete, setPendingStepDelete] = useState<string | null>(null)
  const pendingStep = pendingStepDelete
    ? chain.steps.find((s) => s.id === pendingStepDelete) ?? null
    : null

  const orderedSteps = [...chain.steps].sort((a, b) => a.order - b.order)

  const handleDragStart = (i: number) => {
    setDragIndex(i)
  }
  const handleDragOver = (i: number, e: React.DragEvent) => {
    if (dragIndex === null) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== i) setDragOverIndex(i)
  }
  const handleDragLeave = () => {
    setDragOverIndex(null)
  }
  const handleDrop = (toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const ids = orderedSteps.map((s) => s.id)
    const [moved] = ids.splice(dragIndex, 1)
    ids.splice(toIndex, 0, moved)
    reorderSteps(chain.id, ids)
    setDragIndex(null)
    setDragOverIndex(null)
  }
  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {chain.name}
        </h3>
        <p className="text-xs text-text-muted">
          {chain.steps.length} step{chain.steps.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-1 flex-wrap items-start gap-2 overflow-auto p-4 scrollbar-thin">
        {orderedSteps.map((step, i) => (
            <ChainNode
              key={step.id}
              step={step}
              index={i}
              chainId={chain.id}
              isLast={i === orderedSteps.length - 1}
              isDragging={dragIndex === i}
              isDragOver={dragOverIndex === i && dragIndex !== i}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onRequestDelete={(id) => setPendingStepDelete(id)}
            />
          ))}
        <div className="flex items-start">
          <div className="flex w-48 flex-col gap-2 rounded-lg border border-dashed border-border p-3">
            <input
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newStepName.trim()) {
                  addStep(chain.id, newStepName.trim(), "")
                  setNewStepName("")
                }
              }}
              className="bg-transparent text-xs text-text-primary outline-none"
              placeholder="Step name..."
            />
            <button
              onClick={() => {
                if (newStepName.trim()) {
                  addStep(chain.id, newStepName.trim(), "")
                  setNewStepName("")
                }
              }}
              className="flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-1 text-xs text-accent transition-colors hover:bg-accent/20"
            >
              <Plus className="h-3 w-3" />
              Add Step
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={pendingStepDelete !== null}
        title={pendingStep ? `Delete step "${pendingStep.name}"?` : "Delete step?"}
        destructive
        confirmLabel="Delete step"
        message="The step and its prompt text will be permanently removed. This cannot be undone."
        onConfirm={() => {
          if (pendingStepDelete) {
            removeStep(chain.id, pendingStepDelete)
            toast.success("Step deleted")
          }
          setPendingStepDelete(null)
        }}
        onCancel={() => setPendingStepDelete(null)}
      />
    </div>
  )
}
