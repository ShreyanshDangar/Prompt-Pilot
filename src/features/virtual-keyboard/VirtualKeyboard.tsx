import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useKeyboardStore } from "./keyboard-store"
import { useGlobalStore } from "@/stores/global-store"
import { ThemeVideo } from "@/components/ThemeVideo"
import { MacKeyboard } from "./mac/MacKeyboard"
import { WordPreview } from "./mac/WordPreview"
import { LegacyKeyboard } from "./legacy/LegacyKeyboard"
import { KeyboardSettingsPopover } from "./KeyboardSettingsPopover"
import { KeyboardCustomizePopover } from "./KeyboardCustomizePopover"

export function VirtualKeyboard() {
  const isVisible = useKeyboardStore((s) => s.isVisible)
  const activeKeyboard = useKeyboardStore((s) => s.activeKeyboard)
  const soundEnabled = useKeyboardStore((s) => s.soundEnabled)
  const previewEnabled = useKeyboardStore((s) => s.previewEnabled)
  const previewMode = useKeyboardStore((s) => s.previewMode)
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)
  const reduceMotion = useReducedMotion()

  const isMac = activeKeyboard === "mac"
  const showLetter = previewEnabled && previewMode === "letter"
  const showWord = previewEnabled && previewMode === "word"

  const slideTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 38, mass: 0.9 }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="kb-outer"
          className="hidden shrink-0 overflow-hidden lg:block"
          initial={reduceMotion ? { height: "auto" } : { height: 0 }}
          animate={{ height: "auto" }}
          exit={reduceMotion ? { height: 0 } : { height: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
          }
        >
          <motion.div
            className="relative border-t border-border bg-bg-primary px-4 py-8"
            style={
              !isMac && websiteTheme === "default"
                ? {
                    backgroundImage: "url(/assets/keyboard-bg.png)",
                    backgroundPosition: "bottom",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    willChange: "transform, opacity",
                  }
                : { willChange: "transform, opacity" }
            }
            initial={
              reduceMotion ? { y: 0, opacity: 0 } : { y: "100%", opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            exit={
              reduceMotion ? { y: 0, opacity: 0 } : { y: "100%", opacity: 0 }
            }
            transition={slideTransition}
          >
            {!isMac && <ThemeVideo slot="keyboard-bg" className="opacity-50" />}
            <KeyboardCustomizePopover />
            <KeyboardSettingsPopover />
            <div className="relative z-10 flex flex-col items-center">
              <WordPreview enabled={showWord} />
              {isMac ? (
                <MacKeyboard enableSound={soundEnabled} showPreview={showLetter} />
              ) : (
                <>
                  <div aria-hidden className="h-12 w-full" />
                  <LegacyKeyboard />
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
