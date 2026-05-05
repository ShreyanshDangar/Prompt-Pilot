import { useEffect, useRef } from "react"

/**
 * Calls `handler` when the Escape key is pressed while `active` is true.
 * The raw event is passed through so callers can `stopPropagation()` when
 * they listen on `document` (e.g. nested popovers). Defaults to `window`.
 */
export function useEscapeKey(
  handler: (e: KeyboardEvent) => void,
  active = true,
  target: Window | Document = window,
) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handlerRef.current(e)
    }
    target.addEventListener("keydown", onKey as EventListener)
    return () => target.removeEventListener("keydown", onKey as EventListener)
  }, [active, target])
}
