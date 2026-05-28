import { useEffect, useRef } from "react"

export function useAutoFocusOnOpen(isOpen: boolean) {
  const ref = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (isOpen) {
      const t = window.setTimeout(() => ref.current?.focus(), 50)
      return () => window.clearTimeout(t)
    }
  }, [isOpen])
  return ref
}
