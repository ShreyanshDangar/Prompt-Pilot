import { motion, AnimatePresence } from "framer-motion"
import { type ReactNode } from "react"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useBackdropDismiss } from "@/hooks/useBackdropDismiss"

const DEFAULT_PANEL_CLASS =
  "panel-surface w-full max-w-lg overflow-hidden rounded-xl border border-border shadow-2xl"

interface CenteredModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  topOffsetClass?: string
  panelClassName?: string
}

export function CenteredModal({
  open,
  onClose,
  children,
  ariaLabel,
  topOffsetClass = "pt-[20vh]",
  panelClassName = DEFAULT_PANEL_CLASS,
}: CenteredModalProps) {
  const backdrop = useBackdropDismiss(onClose)
  useEscapeKey(onClose, open)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`modal-backdrop fixed inset-0 z-[100] flex items-start justify-center ${topOffsetClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          onMouseDown={backdrop.onMouseDown}
          onClick={backdrop.onClick}
        >
          <motion.div
            className={panelClassName}
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
