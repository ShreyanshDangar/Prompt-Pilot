import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { COPY_FEEDBACK_DURATION_MS } from "@/lib/constants"

interface CopyOptions {
  /** Toast shown on a successful write. Omit for no toast. */
  successMessage?: string
  /** Toast shown when the clipboard write fails. Omit for no toast. */
  errorMessage?: string
}

/**
 * Writes text to the clipboard and surfaces feedback: an optional success/error
 * toast plus a transient `copied` flag (true for `COPY_FEEDBACK_DURATION_MS`) for
 * Copy→Check button animations. Returns whether the write succeeded.
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    },
    [],
  )

  const copy = useCallback(
    async (text: string, opts?: CopyOptions): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (opts?.successMessage) toast.success(opts.successMessage)
        if (timerRef.current !== null) window.clearTimeout(timerRef.current)
        timerRef.current = window.setTimeout(() => {
          setCopied(false)
          timerRef.current = null
        }, COPY_FEEDBACK_DURATION_MS)
        return true
      } catch {
        if (opts?.errorMessage) toast.error(opts.errorMessage)
        return false
      }
    },
    [],
  )

  return { copied, copy }
}
