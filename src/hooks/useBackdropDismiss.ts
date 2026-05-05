import { useCallback, useRef, type MouseEvent } from "react"

/**
 * Backdrop dismissal that fires only when both the mousedown and the click
 * land on the backdrop element itself — so a drag that starts inside the
 * panel and releases on the backdrop does not close it. Spread the returned
 * handlers onto the backdrop element.
 */
export function useBackdropDismiss(onDismiss: () => void) {
  const mouseDownTargetRef = useRef<EventTarget | null>(null)

  const onMouseDown = useCallback((e: MouseEvent<HTMLElement>) => {
    mouseDownTargetRef.current = e.target
  }, [])

  const onClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return
      if (mouseDownTargetRef.current !== e.currentTarget) return
      mouseDownTargetRef.current = null
      onDismiss()
    },
    [onDismiss],
  )

  return { onMouseDown, onClick }
}
