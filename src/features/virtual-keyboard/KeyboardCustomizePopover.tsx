import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion, type Transition, type Variants } from "framer-motion"
import { X } from "lucide-react"
import { useKeyboardStore } from "./keyboard-store"
import { getColorPresets, getFontPresets } from "./keyboard-presets"
import { useGlobalStore } from "@/stores/global-store"

const ENTER_EASE = [0.16, 1, 0.3, 1] as const
const EXIT_EASE = [0.4, 0, 1, 1] as const

function PaletteBrushIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3.25c-4.83 0-8.75 3.58-8.75 8 0 2.9 2.1 5 4.75 5h1.75a1.5 1.5 0 0 1 1.5 1.5v.5a2 2 0 0 0 2 2c4.83 0 8.5-3.58 8.5-8 0-4.97-4.17-9-9.75-9Z" />
      <circle cx="7.75" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="11.25" cy="7.25" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.25" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="17.75" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="m14.2 14.8 5.35-5.35a1.6 1.6 0 0 1 2.26 2.26l-5.35 5.35" />
      <path d="m14.2 14.8-1.55 1.55a1.2 1.2 0 0 0 0 1.7l.3.3a1.2 1.2 0 0 0 1.7 0l1.55-1.55" />
    </svg>
  )
}

export function KeyboardCustomizePopover() {
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)
  const colorPresetId = useKeyboardStore(
    (s) => s.colorPresetByTheme[websiteTheme] ?? "default",
  )
  const fontPresetId = useKeyboardStore(
    (s) => s.fontPresetByTheme[websiteTheme] ?? "default",
  )
  const setColorPreset = useKeyboardStore((s) => s.setColorPreset)
  const setFontPreset = useKeyboardStore((s) => s.setFontPreset)
  const colorPresets = getColorPresets(websiteTheme)
  const fontPresets = getFontPresets(websiteTheme)

  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        setOpen(false)
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const panelVariants: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, x: -24, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.26,
            ease: ENTER_EASE,
            when: "beforeChildren",
            staggerChildren: 0.028,
            delayChildren: 0.04,
          } as Transition,
        },
        exit: {
          opacity: 0,
          x: -16,
          filter: "blur(4px)",
          transition: { duration: 0.2, ease: EXIT_EASE } as Transition,
        },
      }

  const childVariants: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.24, ease: ENTER_EASE } as Transition,
        },
      }

  return (
    <div className="absolute left-2 top-2 z-20">
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Customize keyboard appearance"
        aria-expanded={open}
        className="gpu-accelerated flex h-8 w-8 items-center justify-center rounded-md border border-border bg-bg-elevated/80 text-text-muted backdrop-blur-sm transition-colors hover:bg-bg-secondary hover:text-text-secondary"
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <PaletteBrushIcon className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            data-popover="keyboard-customize"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top left" }}
            className="panel-surface gpu-accelerated absolute left-0 top-10 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-border p-4 shadow-2xl"
          >
            <motion.div
              variants={childVariants}
              className="mb-3 flex items-center justify-between"
            >
              <h3 className="text-sm font-semibold text-text-primary">
                Appearance
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
                  Keyboard Color
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {colorPresets.map((p) => {
                    const isDefault = p.id === "default"
                    const active = colorPresetId === p.id
                    return (
                      <motion.button
                        key={p.id}
                        type="button"
                        onClick={() => setColorPreset(websiteTheme, p.id)}
                        aria-pressed={active}
                        aria-label={p.label}
                        title={p.label}
                        className={`gpu-accelerated relative h-7 w-7 overflow-hidden rounded-full transition-all ${
                          active
                            ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-elevated"
                            : "ring-1 ring-border hover:ring-text-muted"
                        }`}
                        whileTap={reduceMotion ? undefined : { scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28 }}
                      >
                        {isDefault ? (
                          <span
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #f3f4f6 0 50%, #e5e5e5 50% 100%)",
                            }}
                          />
                        ) : (
                          <>
                            <span
                              className="absolute inset-0"
                              style={{ backgroundColor: p.frameBg }}
                            />
                            <span
                              className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                              style={{ backgroundColor: p.keyBg }}
                            />
                          </>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div variants={childVariants}>
                <div className="mb-1.5 text-[11px] font-medium text-text-secondary">
                  Keyboard Font
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg-secondary p-1">
                  {fontPresets.map((p) => (
                    <motion.button
                      key={p.id}
                      type="button"
                      onClick={() => setFontPreset(websiteTheme, p.id)}
                      aria-pressed={fontPresetId === p.id}
                      title={p.label}
                      className={`gpu-accelerated truncate rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                        fontPresetId === p.id
                          ? "bg-bg-elevated text-accent shadow-sm"
                          : "text-text-muted hover:text-text-secondary"
                      }`}
                      style={
                        p.fontFamily ? { fontFamily: p.fontFamily } : undefined
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
