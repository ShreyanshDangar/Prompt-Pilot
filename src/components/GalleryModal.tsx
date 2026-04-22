import { motion, AnimatePresence } from "framer-motion"
import type { TargetAndTransition, Transition } from "framer-motion"
import { useEffect, type ReactNode } from "react"

interface GalleryModalPanelMotion {
  initial: TargetAndTransition
  animate: TargetAndTransition
  exit: TargetAndTransition
  transition: Transition
}

interface GalleryModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  panelClassName?: string
  zIndex?: string
  panelMotion?: GalleryModalPanelMotion
}

const DEFAULT_PANEL_CLASS =
  "panel-surface flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border shadow-xl"

const DEFAULT_PANEL_MOTION: GalleryModalPanelMotion = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
}

export function GalleryModal({
  open,
  onClose,
  children,
  ariaLabel,
  panelClassName = DEFAULT_PANEL_CLASS,
  zIndex = "z-40",
  panelMotion = DEFAULT_PANEL_MOTION,
}: GalleryModalProps) {
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
          className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-bg-overlay`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={panelClassName}
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={panelMotion.transition}
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
