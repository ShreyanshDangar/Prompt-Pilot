import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash2, ArrowRight, GripVertical, Link2 } from "lucide-react"
import { useChainingStore } from "./chaining-store"
import type { PromptChain } from "./chaining-store"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { toast } from "sonner"

function ChainNode({
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

function ChainDetail({ chain }: { chain: PromptChain }) {
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

export function ChainingView() {
  const isOpen = useChainingStore((s) => s.isOpen)
  const setOpen = useChainingStore((s) => s.setOpen)
  const chains = useChainingStore((s) => s.chains)
  const selectedChainId = useChainingStore((s) => s.selectedChainId)
  const createChain = useChainingStore((s) => s.createChain)
  const deleteChain = useChainingStore((s) => s.deleteChain)
  const selectChain = useChainingStore((s) => s.selectChain)
  const initialize = useChainingStore((s) => s.initialize)
  const [newChainName, setNewChainName] = useState("")
  const [pendingChainDelete, setPendingChainDelete] = useState<string | null>(null)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, setOpen])

  const selectedChain = chains.find((c) => c.id === selectedChainId)
  const pendingChain = pendingChainDelete
    ? chains.find((c) => c.id === pendingChainDelete) ?? null
    : null

  return (
    <>
    <AnimatePresence>
      {isOpen && (
      <motion.div
        key="chaining-modal"
        className="fixed inset-0 z-40 flex items-center justify-center bg-bg-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={() => setOpen(false)}
      >
        <motion.div
          className="panel-surface flex h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">
                Prompt Chains
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex w-48 shrink-0 flex-col border-r border-border">
              <div className="border-b border-border p-3">
                <input
                  type="text"
                  value={newChainName}
                  onChange={(e) => setNewChainName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newChainName.trim()) {
                      createChain(newChainName.trim())
                      setNewChainName("")
                      toast.success("Chain created")
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-bg-primary px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors focus:border-accent"
                  placeholder="New chain name..."
                />
              </div>
              <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
                {chains.map((chain) => (
                  <div key={chain.id} className="group flex items-center">
                    <button
                      onClick={() => selectChain(chain.id)}
                      className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                        selectedChainId === chain.id
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-bg-secondary"
                      }`}
                    >
                      <Link2 className="h-3 w-3" />
                      <span className="truncate">{chain.name}</span>
                      <span className="ml-auto text-text-muted">
                        {chain.steps.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setPendingChainDelete(chain.id)}
                      className="mr-1 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-error/10 group-hover:opacity-100"
                      aria-label={`Delete ${chain.name}`}
                    >
                      <Trash2 className="h-3 w-3 text-error" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedChain ? (
              <ChainDetail chain={selectedChain} />
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
                Create or select a chain to get started
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
    <ConfirmDialog
      open={pendingChainDelete !== null}
      title={pendingChain ? `Delete chain "${pendingChain.name}"?` : "Delete chain?"}
      destructive
      confirmLabel="Delete chain"
      message={
        pendingChain
          ? `This will permanently remove the chain and all ${pendingChain.steps.length} step${pendingChain.steps.length === 1 ? "" : "s"} inside, including every prompt you wrote. This cannot be undone.`
          : "The chain and every step inside will be permanently removed. This cannot be undone."
      }
      onConfirm={() => {
        if (pendingChainDelete) {
          deleteChain(pendingChainDelete)
          toast.success("Chain deleted")
        }
        setPendingChainDelete(null)
      }}
      onCancel={() => setPendingChainDelete(null)}
    />
    </>
  )
}
