import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
  extraContent?: ReactNode
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
  extraContent,
}: ConfirmDialogProps) {
  const mouseDownTargetRef = useRef<EventTarget | null>(null)
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
      if (e.key === "Enter") onConfirm()
    }
    window.addEventListener("keydown", onKey)
    confirmBtnRef.current?.focus()
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel, onConfirm])

  const handleBackdropMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (mouseDownTargetRef.current !== e.currentTarget) return
    mouseDownTargetRef.current = null
    onCancel()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-bg-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="panel-surface w-full max-w-md overflow-hidden rounded-xl border border-border shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start gap-3 px-5 pt-5">
              {destructive && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10">
                  <AlertTriangle className="h-4 w-4 text-error" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-base font-semibold text-text-primary">
                  {title}
                </h2>
                <div className="mt-1 text-sm text-text-secondary">{message}</div>
              </div>
            </div>
            {extraContent && <div className="px-5 pt-3">{extraContent}</div>}
            <div className="mt-5 flex justify-end gap-2 border-t border-border bg-bg-secondary/40 px-5 py-3">
              <button
                onClick={onCancel}
                className="rounded-lg border border-border px-4 py-1.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmBtnRef}
                onClick={onConfirm}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors ${
                  destructive
                    ? "bg-error hover:bg-error/90"
                    : "bg-accent hover:bg-accent-hover"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
