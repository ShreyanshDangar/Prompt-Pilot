import { useCallback, useEffect, useState } from "react"

export function useKeyState() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set())

  const removePressed = useCallback((keyId: string) => {
    setPressedKeys((prev) => {
      if (!prev.has(keyId)) return prev
      const next = new Set(prev)
      next.delete(keyId)
      return next
    })
  }, [])

  const pressKey = useCallback((keyId: string) => {
    setPressedKeys((prev) => {
      if (prev.has(keyId)) return prev
      const next = new Set(prev)
      next.add(keyId)
      return next
    })
  }, [])

  const releaseKey = useCallback(
    (keyId: string) => {
      removePressed(keyId)
    },
    [removePressed],
  )

  const clearAll = useCallback(() => {
    setPressedKeys((prev) => (prev.size === 0 ? prev : new Set()))
  }, [])

  useEffect(() => {
    const handleBlur = () => clearAll()
    const handleFocus = () => clearAll()
    const handleVisibility = () => {
      if (document.hidden) clearAll()
    }
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [clearAll])

  return { pressedKeys, pressKey, releaseKey, clearAll }
}
