import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, type MouseEvent, type ReactNode } from "react"

interface CenteredModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  topOffsetClass?: string
}

export function CenteredModal({
  open,
  onClose,
  children,
  ariaLabel,
  topOffsetClass = "pt-[20vh]",
}: CenteredModalProps) {
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  const handleBackdropMouseDown = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      mouseDownTargetRef.current = e.target
    },
    [],
  )

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (mouseDownTargetRef.current !== e.currentTarget) return
      mouseDownTargetRef.current = null
      onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`modal-backdrop fixed inset-0 z-[100] flex items-start justify-center ${topOffsetClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          onMouseDown={handleBackdropMouseDown}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="panel-surface w-full max-w-lg overflow-hidden rounded-xl border border-border shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
