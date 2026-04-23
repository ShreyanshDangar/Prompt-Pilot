import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEditorStore } from "@/features/editor/editor-store"
import { useImageStore } from "@/stores/image-store"
import { MODELS, PROVIDERS, getModelById, estimateTokens } from "@/lib/model-data"
import { useGlobalStore } from "@/stores/global-store"

function estimateImageTokens(width: number, height: number): number {
  return Math.ceil((width * height) / 750)
}

function ContextVisualizer({
  textTokens,
  imageTokens,
  outputTokens,
  contextWindow,
}: {
  textTokens: number
  imageTokens: number
  outputTokens: number
  contextWindow: number
}) {
  const total = contextWindow || 1
  const textPct = (textTokens / total) * 100
  const imagePct = (imageTokens / total) * 100
  const outputPct = (outputTokens / total) * 100
  const remainPct = Math.max(0, 100 - textPct - imagePct - outputPct)

  const segments = [
    { label: "Text", pct: textPct, color: "bg-emerald-500" },
    { label: "Images", pct: imagePct, color: "bg-purple-500" },
    { label: "Output", pct: outputPct, color: "bg-orange-500" },
    { label: "Remaining", pct: remainPct, color: "bg-bg-secondary" },
  ]

  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-medium text-text-secondary">
        Context Window
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-bg-secondary">
        {segments.map(
          (seg) =>
            seg.pct > 0 && (
              <motion.div
                key={seg.label}
                className={`h-full ${seg.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(seg.pct, 100)}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                title={`${seg.label}: ${seg.pct.toFixed(1)}%`}
              />
            )
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        {segments.slice(0, 3).map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-block h-2 w-2 rounded-full ${seg.color}`}
            />
            <span className="text-text-muted">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TokenCalculator() {
  const selectedModelId = useGlobalStore((s) => s.settings.defaultModel)
  const updateSettings = useGlobalStore((s) => s.updateSettings)
  const [outputSlider, setOutputSlider] = useState(100)
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const modelDropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!modelDropdownOpen) return
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (
        modelDropdownRef.current &&
        modelDropdownRef.current.contains(target)
      ) {
        return
      }
      setModelDropdownOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModelDropdownOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKey)
    }
  }, [modelDropdownOpen])

  const model = useMemo(
    () => getModelById(selectedModelId) ?? MODELS[0],
    [selectedModelId]
  )

  const activeTab = useEditorStore((s) => {
    return s.tabs.find((t) => t.id === s.activeTabId)
  })
  const tabContent = activeTab?.content

  const images = useImageStore((s) => s.images)

  const textTokens = useMemo(() => {
    if (!tabContent) return 0
    const div = document.createElement("div")
    div.innerHTML = tabContent
    const plain = div.textContent ?? ""
    return estimateTokens(plain, model.charsPerToken)
  }, [tabContent, model.charsPerToken])

  const imageTokens = useMemo(() => {
    return images.reduce(
      (sum, img) => sum + estimateImageTokens(img.width, img.height),
      0
    )
  }, [images])

  const expectedOutput = Math.round((outputSlider / 100) * model.maxOutput)
  const totalUsed = textTokens + imageTokens + expectedOutput
  const usagePercent = Math.min(
    (totalUsed / model.contextWindow) * 100,
    120
  )

  const isWarning = usagePercent > 90 && usagePercent <= 100
  const isError = usagePercent > 100

  const barColor = isError
    ? "bg-error"
    : isWarning
      ? "bg-warning"
      : "bg-accent"

  const content = (
    <>
      <div className="relative mb-4" ref={modelDropdownRef}>
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary transition-colors hover:bg-bg-secondary"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-text-muted">{model.provider}</span>
            <span>{model.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-text-muted" />
        </button>

        {modelDropdownOpen && (
          <div className="panel-surface absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border shadow-lg">
            <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin">
              {PROVIDERS.map((provider) => (
                <div key={provider}>
                  <div className="px-3 py-1.5 text-xs font-medium text-text-muted">
                    {provider}
                  </div>
                  {MODELS.filter((m) => m.provider === provider).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        updateSettings({ defaultModel: m.id })
                        setModelDropdownOpen(false)
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors ${
                        m.id === selectedModelId
                          ? "bg-accent/10 text-accent"
                          : "text-text-primary hover:bg-bg-secondary"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ContextVisualizer
        textTokens={textTokens}
        imageTokens={imageTokens}
        outputTokens={expectedOutput}
        contextWindow={model.contextWindow}
      />

      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Text Tokens</span>
          <span className="font-mono text-text-primary">
            {textTokens.toLocaleString()}
          </span>
        </div>
        {imageTokens > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Image Tokens ({images.length})
            </span>
            <span className="font-mono text-purple-500">
              {imageTokens.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Expected Output</span>
          <span className="font-mono text-text-primary">
            {expectedOutput.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-text-primary">Total</span>
          <span
            className={`font-mono ${isError ? "text-error" : isWarning ? "text-warning" : "text-text-primary"}`}
          >
            {totalUsed.toLocaleString()} / {model.contextWindow.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-text-secondary">Context Usage</span>
          <span className={`font-mono font-medium ${isError ? "text-error" : isWarning ? "text-warning" : "text-accent"}`}>
            {Math.min(usagePercent, 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-bg-secondary">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            animate={{ width: `${Math.min(usagePercent, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {isWarning && !isError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Approaching context limit</span>
        </div>
      )}

      {isError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-xs text-error">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Context window exceeded</span>
        </div>
      )}

      <div className="mt-auto">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-text-secondary">Expected Output Length</span>
          <span className="font-mono text-purple-400">{expectedOutput.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={outputSlider}
          onChange={(e) => setOutputSlider(Number(e.target.value))}
          className="range-output w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>0</span>
          <span>{model.maxOutput.toLocaleString()}</span>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 scrollbar-thin">
      <button
        onClick={() => setMobileExpanded((v) => !v)}
        className="mb-2 flex items-center justify-between lg:hidden"
      >
        <h3 className="text-sm font-semibold text-text-primary">
          Token Calculator
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">
            {Math.min(usagePercent, 100).toFixed(0)}%
          </span>
          {mobileExpanded ? (
            <ChevronUp className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          )}
        </div>
      </button>
      <h3 className="mb-4 hidden text-sm font-semibold text-text-primary lg:block">
        Token Calculator
      </h3>
      <div className="hidden lg:block lg:flex-1">{content}</div>
      <AnimatePresence>
        {mobileExpanded && (
          <motion.div
            className="overflow-hidden lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
