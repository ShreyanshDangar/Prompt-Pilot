import { useCallback, useState } from "react"

/**
 * Tracks the id of an item awaiting delete/close confirmation. Pairs with a
 * `<ConfirmDialog open={c.isOpen} …>`: `request(id)` arms the dialog (recording
 * which item), `clear()` dismisses it, and `pendingId` looks the item back up.
 */
export function usePendingConfirm<TId = string>() {
  const [pendingId, setPendingId] = useState<TId | null>(null)
  const request = useCallback((id: TId) => setPendingId(id), [])
  const clear = useCallback(() => setPendingId(null), [])
  return { pendingId, request, clear, isOpen: pendingId !== null }
}
