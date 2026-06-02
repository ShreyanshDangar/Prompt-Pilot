import { useState } from "react"
import { Plus, Copy } from "lucide-react"
import { useChainingStore } from "./chaining-store"
import type { PromptChain } from "./chaining-store"
import { ConfirmDialog } from "@/components/modals/ConfirmDialog"
import { usePendingConfirm } from "@/hooks/usePendingConfirm"
import { useDragReorder } from "@/hooks/useDragReorder"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { toast } from "sonner"
import { ChainNode } from "./ChainNode"

export function ChainDetail({ chain }: { chain: PromptChain }) {
  const addStep = useChainingStore((s) => s.addStep)
  const removeStep = useChainingStore((s) => s.removeStep)
  const reorderSteps = useChainingStore((s) => s.reorderSteps)
  const [newStepName, setNewStepName] = useState("")
  const stepConfirm = usePendingConfirm()
  const { copy } = useCopyToClipboard()
  const pendingStep = stepConfirm.pendingId
    ? chain.steps.find((s) => s.id === stepConfirm.pendingId) ?? null
    : null

  const orderedSteps = [...chain.steps].sort((a, b) => a.order - b.order)

  const handleCopyChain = () => {
    if (orderedSteps.length === 0) return
    const text = orderedSteps
      .map((s, i) => `Step ${i + 1}: ${s.name}\n${s.promptText}`)
      .join("\n\n---\n\n")
    copy(text, {
      successMessage: "Chain copied to clipboard",
      errorMessage: "Failed to copy chain",
    })
  }

  const drag = useDragReorder((from, to) => {
    const ids = orderedSteps.map((s) => s.id)
    const [moved] = ids.splice(from, 1)
    ids.splice(to, 0, moved)
    reorderSteps(chain.id, ids)
  })

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            {chain.name}
          </h3>
          <p className="text-xs text-text-muted">
            {chain.steps.length} step{chain.steps.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={handleCopyChain}
          disabled={orderedSteps.length === 0}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-xs text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
          title="Copy entire chain"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy chain
        </button>
      </div>
      <div className="flex flex-1 flex-wrap items-start gap-2 overflow-auto p-4 scrollbar-thin">
        {orderedSteps.map((step, i) => {
          const dragProps = drag.getItemProps(i)
          return (
            <ChainNode
              key={step.id}
              step={step}
              index={i}
              chainId={chain.id}
              isLast={i === orderedSteps.length - 1}
              isDragging={drag.dragIndex === i}
              isDragOver={drag.dragOverIndex === i && drag.dragIndex !== i}
              onDragStart={() => dragProps.onDragStart()}
              onDragOver={(_, e) => dragProps.onDragOver(e)}
              onDragLeave={dragProps.onDragLeave}
              onDrop={() => dragProps.onDrop()}
              onDragEnd={dragProps.onDragEnd}
              onRequestDelete={(id) => stepConfirm.request(id)}
            />
          )
        })}
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
        open={stepConfirm.isOpen}
        title={pendingStep ? `Delete step "${pendingStep.name}"?` : "Delete step?"}
        destructive
        confirmLabel="Delete step"
        message="The step and its prompt text will be permanently removed. This cannot be undone."
        onConfirm={() => {
          if (stepConfirm.pendingId) {
            removeStep(chain.id, stepConfirm.pendingId)
            toast.success("Step deleted")
          }
          stepConfirm.clear()
        }}
        onCancel={() => stepConfirm.clear()}
      />
    </div>
  )
}
