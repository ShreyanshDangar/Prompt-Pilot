import { useEffect, useRef, type RefObject } from "react"

type AnyRef = RefObject<HTMLElement | null>

/**
 * Calls `handler` on a `mousedown` that lands outside every supplied ref.
 * Accepts a single ref or an array (e.g. a panel plus its trigger button).
 * Only listens while `active` is true.
 */
export function useClickOutside(
  refs: AnyRef | AnyRef[],
  handler: () => void,
  active = true,
) {
  const handlerRef = useRef(handler)
  const refsRef = useRef(refs)
  useEffect(() => {
    handlerRef.current = handler
    refsRef.current = refs
  })

  useEffect(() => {
    if (!active) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      const list = Array.isArray(refsRef.current)
        ? refsRef.current
        : [refsRef.current]
      for (const r of list) {
        if (r.current && r.current.contains(target)) return
      }
      handlerRef.current()
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [active])
}
