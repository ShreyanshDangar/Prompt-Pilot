import { useCallback, useState } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"

/**
 * Inline text-rename state for a single item. `start()` enters edit mode seeded
 * with `initial`; `commit()` trims and calls `onCommit` only when the value
 * changed and is non-empty; `cancel()` exits without committing. Spread
 * `inputProps` onto the edit `<input>` for the standard
 * value / onChange / blur-commits / Enter-commits / Escape-cancels / autoFocus
 * wiring.
 */
export function useInlineRename(
  initial: string,
  onCommit: (value: string) => void,
) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initial)

  const start = useCallback(() => {
    setDraft(initial)
    setEditing(true)
  }, [initial])

  const cancel = useCallback(() => {
    setEditing(false)
  }, [])

  const commit = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== initial) {
      onCommit(trimmed)
    }
    setEditing(false)
  }, [draft, initial, onCommit])

  const inputProps = {
    value: draft,
    autoFocus: true,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value),
    onBlur: () => commit(),
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commit()
      if (e.key === "Escape") cancel()
    },
  }

  return { editing, draft, setDraft, start, commit, cancel, inputProps }
}
