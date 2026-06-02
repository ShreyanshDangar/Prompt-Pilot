import { useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEditorStore } from "@/features/editor/editor-store"
import { useImageStore } from "@/features/images/image-store"
import {
  MODELS,
  PROVIDERS,
  getModelById,
  estimateTokens,
  estimateImageTokens,
  formatContextTokens,
} from "@/lib/model-data"
import { useGlobalStore } from "@/stores/global-store"
import { useClickOutside } from "@/hooks/useClickOutside"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useMinViewport } from "@/hooks/useMinViewport"

function ContextGauge({
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
  const cw = contextWindow || 1
  const used = textTokens + imageTokens + outputTokens
  const usagePercent = (used / cw) * 100
  const isWarning = usagePercent > 90 && usagePercent <= 100
  const isError = usagePercent > 100
  const remaining = Math.max(0, cw - used)

  const size = 132
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const clampFrac = (v: number) => Math.max(0, Math.min(v / cw, 1))
  const textFrac = clampFrac(textTokens)
  const imageFrac = Math.min(clampFrac(imageTokens), 1 - textFrac)
  const outputFrac = Math.min(clampFrac(outputTokens), 1 - textFrac - imageFrac)

  const textLen = textFrac * circumference
  const imageLen = imageFrac * circumference
  const outputLen = outputFrac * circumference

  const arc = (len: number, offset: number, color: string, key: string) =>
    len > 0 ? (
      <circle
        key={key}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${len} ${circumference - len}`}
        strokeDashoffset={-offset}
        style={{
          transition:
            "stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease",
        }}
      />
    ) : null

  const centerColor = isError
    ? "text-error"
    : isWarning
      ? "text-warning"
      : "text-text-primary"

  const legend = [
    { label: "Text", color: "bg-emerald-500" },
    { label: "Images", color: "bg-purple-500" },
    { label: "Output", color: "bg-orange-500" },
  ]

  return (
    <div className="mb-4">
      <div className="mb-2 text-xs font-medium text-text-secondary">
        Context Window
      </div>
      <div className="flex items-center gap-4">
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-bg-secondary)"
              strokeWidth={stroke}
            />
            {arc(textLen, 0, "#10b981", "text")}
            {arc(imageLen, textLen, "#a855f7", "image")}
            {arc(outputLen, textLen + imageLen, "#f97316", "output")}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono text-lg font-semibold ${centerColor}`}
            >
              {Math.min(usagePercent, 999).toFixed(0)}%
            </span>
            <span className="text-[10px] text-text-muted">
              {remaining.toLocaleString()} left
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {legend.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${seg.color}`}
              />
              <span className="text-text-muted">{seg.label}</span>
            </div>
          ))}
        </div>
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
  const isDesktop = useMinViewport(1024, 0)

  useClickOutside(
    modelDropdownRef,
    () => setModelDropdownOpen(false),
    modelDropdownOpen,
  )
  useEscapeKey(() => setModelDropdownOpen(false), modelDropdownOpen, document)

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
                      className={`flex w-full flex-col items-start rounded-md px-3 py-1.5 text-sm transition-colors ${
                        m.id === selectedModelId
                          ? "bg-accent/10 text-accent"
                          : "text-text-primary hover:bg-bg-secondary"
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-[10px] text-text-muted">
                        {formatContextTokens(m.contextWindow)} context
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ContextGauge
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
      {isDesktop ? (
        <>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">
            Token Calculator
          </h3>
          <div className="flex-1">{content}</div>
        </>
      ) : (
        <>
          <button
            onClick={() => setMobileExpanded((v) => !v)}
            className="mb-2 flex items-center justify-between"
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
          <AnimatePresence>
            {mobileExpanded && (
              <motion.div
                className="overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
