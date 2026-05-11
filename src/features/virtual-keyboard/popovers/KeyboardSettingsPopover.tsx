import { useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Settings2, X, Eye, EyeOff, RotateCcw, Keyboard, Monitor, Apple } from "lucide-react"
import { useKeyboardStore } from "../keyboard-store"
import type { ActiveKeyboard, PreviewMode, KeyboardPlatform } from "../keyboard-store"
import { useEscapeKey } from "@/hooks/useEscapeKey"
import { useClickOutside } from "@/hooks/useClickOutside"
import { getPanelVariants, getChildVariants } from "./keyboard-popover-motion"

export function KeyboardSettingsPopover() {
  const isVisible = useKeyboardStore((s) => s.isVisible)
  const setVisible = useKeyboardStore((s) => s.setVisible)
  const activeKeyboard = useKeyboardStore((s) => s.activeKeyboard)
  const setActiveKeyboard = useKeyboardStore((s) => s.setActiveKeyboard)
  const keyboardPlatform = useKeyboardStore((s) => s.keyboardPlatform)
  const setKeyboardPlatform = useKeyboardStore((s) => s.setKeyboardPlatform)
  const soundEnabled = useKeyboardStore((s) => s.soundEnabled)
  const setSoundEnabled = useKeyboardStore((s) => s.setSoundEnabled)
  const previewEnabled = useKeyboardStore((s) => s.previewEnabled)
  const setPreviewEnabled = useKeyboardStore((s) => s.setPreviewEnabled)
  const previewMode = useKeyboardStore((s) => s.previewMode)
  const setPreviewMode = useKeyboardStore((s) => s.setPreviewMode)
  const resetToDefaults = useKeyboardStore((s) => s.resetToDefaults)
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  useEscapeKey(
    (e) => {
      e.stopPropagation()
      setOpen(false)
    },
    open,
    document,
  )
  useClickOutside([panelRef, triggerRef], () => setOpen(false), open)

  const panelVariants = getPanelVariants(reduceMotion, "right")
  const childVariants = getChildVariants(reduceMotion)

  return (
    <div className="absolute right-2 top-2 z-20">
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Keyboard settings"
        aria-expanded={open}
        className="gpu-accelerated flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-elevated/80 text-text-muted backdrop-blur-sm transition-colors hover:bg-bg-secondary hover:text-text-secondary"
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <Settings2 className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            data-popover="keyboard-settings"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top right" }}
            className="panel-surface gpu-accelerated absolute right-0 top-10 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-border p-4 shadow-2xl"
          >
            <motion.div
              variants={childVariants}
              className="mb-3 flex items-center justify-between"
            >
              <h3 className="text-sm font-semibold text-text-primary">
                Keyboard Settings
              </h3>
              <motion.button
                onClick={() => setOpen(false)}
                className="gpu-accelerated flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-secondary"
                aria-label="Close"
                whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            </motion.div>

            <div className="space-y-4">
              <motion.div variants={childVariants}>
                <div className="mb-1.5 text-[11px] font-medium text-text-secondary">
                  Keyboard
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg-secondary p-1">
                  <SwitcherButton
                    active={activeKeyboard === "mac"}
                    onClick={() => setActiveKeyboard("mac")}
                    label="Mac"
                    sub="Realistic"
                    icon={<Keyboard className="h-3 w-3" />}
                    reduceMotion={reduceMotion}
                  />
                  <SwitcherButton
                    active={activeKeyboard === "classic"}
                    onClick={() => setActiveKeyboard("classic")}
                    label="Classic"
                    sub="Themed"
                    icon={<Keyboard className="h-3 w-3" />}
                    reduceMotion={reduceMotion}
                  />
                </div>
              </motion.div>

              <motion.div variants={childVariants}>
                <div className="mb-1.5 text-[11px] font-medium text-text-secondary">
                  Platform
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg-secondary p-1">
                  <SwitcherButton
                    active={keyboardPlatform === "mac"}
                    onClick={() => setKeyboardPlatform("mac")}
                    label="Mac"
                    sub="⌘ Option"
                    icon={<Apple className="h-3 w-3" />}
                    reduceMotion={reduceMotion}
                  />
                  <SwitcherButton
                    active={keyboardPlatform === "windows"}
                    onClick={() => setKeyboardPlatform("windows")}
                    label="Windows"
                    sub="Ctrl Win Alt"
                    icon={<Monitor className="h-3 w-3" />}
                    reduceMotion={reduceMotion}
                  />
                </div>
              </motion.div>

              <motion.div variants={childVariants}>
                <SettingRow label="Visibility" description="Show the keyboard">
                  <motion.button
                    onClick={() => setVisible(!isVisible)}
                    className={`gpu-accelerated flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isVisible
                        ? "bg-accent/10 text-accent"
                        : "bg-bg-secondary text-text-muted"
                    }`}
                    aria-label={isVisible ? "Hide keyboard" : "Show keyboard"}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  >
                    {isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </motion.button>
                </SettingRow>
              </motion.div>

              <motion.div variants={childVariants}>
                <SettingRow label="Sound" description="Keystroke audio">
                  <Toggle
                    checked={soundEnabled}
                    onChange={setSoundEnabled}
                    ariaLabel={`Sound ${soundEnabled ? "on" : "off"}`}
                    reduceMotion={reduceMotion}
                  />
                </SettingRow>
              </motion.div>

              <motion.div variants={childVariants}>
                <SettingRow label="Preview" description="Show typed output">
                  <Toggle
                    checked={previewEnabled}
                    onChange={setPreviewEnabled}
                    ariaLabel={`Preview ${previewEnabled ? "on" : "off"}`}
                    reduceMotion={reduceMotion}
                  />
                </SettingRow>
              </motion.div>

              <motion.div variants={childVariants}>
                <div className="mb-1.5 text-[11px] font-medium text-text-secondary">
                  Preview Mode
                </div>
                <ModeSelect
                  value={previewMode}
                  onChange={setPreviewMode}
                  reduceMotion={reduceMotion}
                />
              </motion.div>

              <motion.button
                variants={childVariants}
                type="button"
                onClick={resetToDefaults}
                className="gpu-accelerated flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-primary hover:text-text-primary"
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset to defaults
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SwitcherButton({
  active,
  onClick,
  label,
  sub,
  icon,
  reduceMotion,
}: {
  active: boolean
  onClick: () => void
  label: string
  sub: string
  icon: React.ReactNode
  reduceMotion: boolean | null
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`gpu-accelerated flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-bg-elevated text-accent shadow-sm"
          : "text-text-muted hover:text-text-secondary"
      }`}
      aria-pressed={active}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="text-[9px] text-text-muted">{sub}</span>
    </motion.button>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-sm text-text-primary">{label}</div>
        <div className="text-[11px] text-text-muted">{description}</div>
      </div>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  ariaLabel,
  reduceMotion,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  ariaLabel: string
  reduceMotion: boolean | null
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`gpu-accelerated relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
        checked
          ? "border-accent/40 bg-accent/60"
          : "border-border bg-bg-secondary"
      }`}
      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </motion.button>
  )
}

function ModeSelect({
  value,
  onChange,
  reduceMotion,
}: {
  value: PreviewMode
  onChange: (m: PreviewMode) => void
  reduceMotion: boolean | null
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg-secondary p-1">
      {(["word", "letter"] as const).map((m) => (
        <motion.button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`gpu-accelerated rounded-md px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
            value === m
              ? "bg-bg-elevated text-accent shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
          aria-pressed={value === m}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
        >
          {m}
        </motion.button>
      ))}
    </div>
  )
}

export type { ActiveKeyboard, KeyboardPlatform }
