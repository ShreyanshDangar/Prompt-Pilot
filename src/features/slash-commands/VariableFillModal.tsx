import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { extractVariables, resolveVariables } from "./variable-utils"

interface VariableFillModalProps {
  commandName: string
  content: string
  onResolve: (resolved: string) => void
  onCancel: () => void
}

export function VariableFillModal({
  commandName,
  content,
  onResolve,
  onCancel,
}: VariableFillModalProps) {
  const variables = useMemo(() => extractVariables(content), [content])
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(variables.map((v) => [v, ""]))
  )

  const handleSubmit = () => {
    const resolved = resolveVariables(content, values)
    onResolve(resolved)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  const allFilled = variables.every((v) => values[v]?.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay">
      <motion.div
        className="panel-surface w-full max-w-md rounded-xl border border-border p-6 shadow-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Fill Variables
            </h2>
            <p className="mt-0.5 text-sm text-text-muted">{commandName}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-text-muted" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {variables.map((varName) => (
            <div key={varName}>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                {varName}
              </label>
              <input
                type="text"
                value={values[varName]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [varName]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && allFilled) handleSubmit()
                }}
                className="w-full rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                placeholder={`Enter value for {{${varName}}}`}
                autoFocus={variables[0] === varName}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            Insert
          </button>
        </div>
      </motion.div>
    </div>
  )
}
