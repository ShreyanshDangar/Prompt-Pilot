import { useState, useEffect } from "react"
import { X, Trash2, Link2 } from "lucide-react"
import { useChainingStore } from "./chaining-store"
import { ConfirmDialog } from "@/components/modals/ConfirmDialog"
import { GalleryModal } from "@/components/modals/GalleryModal"
import { ChainDetail } from "./ChainDetail"
import { toast } from "sonner"

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

  const selectedChain = chains.find((c) => c.id === selectedChainId)
  const pendingChain = pendingChainDelete
    ? chains.find((c) => c.id === pendingChainDelete) ?? null
    : null

  return (
    <>
      <GalleryModal
        open={isOpen}
        onClose={() => setOpen(false)}
        ariaLabel="Prompt Chains"
        panelClassName="panel-surface flex h-[75vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border shadow-xl"
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
      </GalleryModal>
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
