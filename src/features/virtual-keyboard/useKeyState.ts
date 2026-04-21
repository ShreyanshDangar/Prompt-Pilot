import { useCallback, useEffect, useRef, useState } from "react"

export const KEY_SAFETY_TIMEOUT_MS = 150

export function useKeyState() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set())
  const safetyTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const cancelSafetyTimer = useCallback((keyId: string) => {
    const timer = safetyTimers.current.get(keyId)
    if (timer !== undefined) {
      clearTimeout(timer)
      safetyTimers.current.delete(keyId)
    }
  }, [])

  const removePressed = useCallback((keyId: string) => {
    setPressedKeys((prev) => {
      if (!prev.has(keyId)) return prev
      const next = new Set(prev)
      next.delete(keyId)
      return next
    })
  }, [])

  const pressKey = useCallback(
    (keyId: string) => {
      cancelSafetyTimer(keyId)
      setPressedKeys((prev) => {
        if (prev.has(keyId)) return prev
        const next = new Set(prev)
        next.add(keyId)
        return next
      })
      const timer = setTimeout(() => {
        safetyTimers.current.delete(keyId)
        removePressed(keyId)
      }, KEY_SAFETY_TIMEOUT_MS)
      safetyTimers.current.set(keyId, timer)
    },
    [cancelSafetyTimer, removePressed],
  )

  const releaseKey = useCallback(
    (keyId: string) => {
      cancelSafetyTimer(keyId)
      removePressed(keyId)
    },
    [cancelSafetyTimer, removePressed],
  )

  const clearAll = useCallback(() => {
    safetyTimers.current.forEach((timer) => clearTimeout(timer))
    safetyTimers.current.clear()
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

  useEffect(() => {
    const timers = safetyTimers.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  return { pressedKeys, pressKey, releaseKey, clearAll }
}
