import { useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useClickOutside } from "@/hooks/useClickOutside"
import { getPanelVariants, getChildVariants } from "./keyboard-popover-motion"

export function usePopover(direction: "left" | "right") {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  useEscapeKey(
    (e) => {
      e.stopPropagation()
      setOpen(false)
    },
    open,
    document,
  )
  useClickOutside([panelRef, triggerRef], () => setOpen(false), open)

  const panelVariants = getPanelVariants(reduceMotion, direction)
  const childVariants = getChildVariants(reduceMotion)

  return { open, setOpen, panelRef, triggerRef, reduceMotion, panelVariants, childVariants }
}
