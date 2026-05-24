import { useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useEditorStore } from "@/features/editor/editor-store"
import { useClickOutside } from "@/hooks/useClickOutside"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { PROVIDERS, MAX_URL_LENGTH, type Provider } from "./providers"

export function OpenInDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const getText = useEditorStore((s) => s.getText)
  const { copy } = useCopyToClipboard()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen)

  const handleOpenIn = useCallback(
    async (provider: Provider) => {
      const text = getText().trim()

      if (!text) {
        window.open(provider.blankUrl, "_blank", "noopener,noreferrer")
        setIsOpen(false)
        return
      }

      if (!provider.supportsPrefill) {
        await copy(text, {
          successMessage: `${provider.name} doesn't support prompt URLs. Copied to clipboard.`,
          errorMessage: "Failed to copy prompt to clipboard",
        })
        window.open(provider.blankUrl, "_blank", "noopener,noreferrer")
        setIsOpen(false)
        return
      }

      const url = provider.buildUrl(text)
      if (url.length > MAX_URL_LENGTH) {
        await copy(text, {
          successMessage: `Prompt too long for URL. Copied to clipboard — paste into ${provider.name}.`,
          errorMessage: "Failed to copy prompt to clipboard",
        })
        window.open(provider.blankUrl, "_blank", "noopener,noreferrer")
        setIsOpen(false)
        return
      }

      window.open(url, "_blank", "noopener,noreferrer")
      toast.success(`Opening ${provider.name}...`)
      setIsOpen(false)
    },
    [getText, copy],
  )

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg-primary px-3 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        aria-label="Open in AI chatbot"
        aria-expanded={isOpen}
      >
        <ExternalLink className="h-4 w-4" />
        <span className="hidden sm:inline">Open In</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="panel-surface absolute bottom-full left-0 z-50 mb-2 w-48 overflow-hidden rounded-lg border border-border shadow-lg"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-1">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleOpenIn(provider)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-secondary"
                >
                  <img
                    src={provider.icon}
                    alt=""
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0"
                  />
                  {provider.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
