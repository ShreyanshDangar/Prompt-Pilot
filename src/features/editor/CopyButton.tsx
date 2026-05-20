import { useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useEditorStore } from "./editor-store"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function CopyButton() {
  const getText = useEditorStore((s) => s.getText)
  const { copied, copy } = useCopyToClipboard()

  const handleCopy = useCallback(async () => {
    const text = getText()
    if (!text.trim()) {
      toast.error("Nothing to copy")
      return
    }
    await copy(text, {
      successMessage: "Prompt copied to clipboard",
      errorMessage: "Failed to copy to clipboard",
    })
  }, [getText, copy])

  return (
    <button
      onClick={handleCopy}
      className="flex h-9 items-center gap-2 rounded-lg border border-border bg-bg-primary px-3 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
      aria-label="Copy prompt to clipboard"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-4 w-4 text-success" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
    </button>
  )
}
