import { useCallback, useEffect, useRef, useState } from "react"

type WordAnimationPhase = "idle" | "entering" | "visible" | "exiting"

const WORD_IDLE_TIMEOUT = 4000
const WORD_ENTER_DURATION_MS = 150
const WORD_EXIT_DURATION_MS = 350

const NON_APPENDABLE_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab",
  "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
])

const FUNCTION_KEY_PATTERN = /^F([1-9]|1[0-2])$/

function isAppendableWordKey(key: string) {
  if (key === "Dead") return false
  if (NON_APPENDABLE_KEYS.has(key)) return false
  if (FUNCTION_KEY_PATTERN.test(key)) return false
  if (key === " " || key === "Enter" || key === "Backspace") return false
  if (key.length === 1) return true
  return false
}

export function WordPreview({ enabled }: { enabled: boolean }) {
  const [currentWord, setCurrentWord] = useState("")
  const [animationPhase, setAnimationPhase] =
    useState<WordAnimationPhase>("idle")

  const idleTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const enterTimerRef = useRef<number | null>(null)
  const currentWordRef = useRef("")
  const animationPhaseRef = useRef<WordAnimationPhase>("idle")
  const enabledRef = useRef(enabled)
  const exitWordRef = useRef<(() => void) | null>(null)

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current !== null) {
      window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current)
      exitTimerRef.current = null
    }
  }, [])

  const clearEnterTimer = useCallback(() => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current)
      enterTimerRef.current = null
    }
  }, [])

  const clearAllWordTimers = useCallback(() => {
    clearIdleTimer()
    clearExitTimer()
    clearEnterTimer()
  }, [clearEnterTimer, clearExitTimer, clearIdleTimer])

  const resetWordPreview = useCallback(() => {
    clearAllWordTimers()
    currentWordRef.current = ""
    animationPhaseRef.current = "idle"
    setCurrentWord("")
    setAnimationPhase("idle")
  }, [clearAllWordTimers])

  const finishWordExit = useCallback(() => {
    clearExitTimer()
    clearIdleTimer()
    currentWordRef.current = ""
    animationPhaseRef.current = "idle"
    setCurrentWord("")
    setAnimationPhase("idle")
  }, [clearExitTimer, clearIdleTimer])

  const scheduleIdleTimeout = useCallback(() => {
    clearIdleTimer()
    idleTimerRef.current = window.setTimeout(() => {
      if (!currentWordRef.current) return
      exitWordRef.current?.()
    }, WORD_IDLE_TIMEOUT)
  }, [clearIdleTimer])

  const beginWordEntrance = useCallback(
    (nextWord: string) => {
      clearExitTimer()
      clearEnterTimer()
      currentWordRef.current = nextWord
      setCurrentWord(nextWord)
      animationPhaseRef.current = "entering"
      setAnimationPhase("entering")
      enterTimerRef.current = window.setTimeout(() => {
        animationPhaseRef.current =
          animationPhaseRef.current === "entering"
            ? "visible"
            : animationPhaseRef.current
        setAnimationPhase((phase) =>
          phase === "entering" ? "visible" : phase,
        )
        enterTimerRef.current = null
      }, WORD_ENTER_DURATION_MS)
    },
    [clearEnterTimer, clearExitTimer],
  )

  const appendCharacter = useCallback(
    (value: string) => {
      clearExitTimer()

      const nextWord = `${currentWordRef.current}${value}`
      const isNewWord =
        currentWordRef.current.length === 0 ||
        animationPhaseRef.current === "idle" ||
        animationPhaseRef.current === "exiting"

      if (isNewWord) {
        beginWordEntrance(value)
      } else {
        currentWordRef.current = nextWord
        setCurrentWord(nextWord)

        if (animationPhaseRef.current !== "entering") {
          animationPhaseRef.current = "visible"
          setAnimationPhase("visible")
        }
      }

      scheduleIdleTimeout()
    },
    [beginWordEntrance, clearExitTimer, scheduleIdleTimeout],
  )

  const removeLastCharacter = useCallback(() => {
    if (!currentWordRef.current) return

    clearExitTimer()
    clearEnterTimer()

    const nextWord = currentWordRef.current.slice(0, -1)

    if (!nextWord) {
      clearIdleTimer()
      animationPhaseRef.current = "exiting"
      setAnimationPhase("exiting")
      exitTimerRef.current = window.setTimeout(() => {
        finishWordExit()
      }, WORD_EXIT_DURATION_MS)
      return
    }

    currentWordRef.current = nextWord
    setCurrentWord(nextWord)
    animationPhaseRef.current = "visible"
    setAnimationPhase("visible")
    scheduleIdleTimeout()
  }, [
    clearEnterTimer,
    clearExitTimer,
    clearIdleTimer,
    finishWordExit,
    scheduleIdleTimeout,
  ])

  const exitWord = useCallback(() => {
    if (!currentWordRef.current) return

    clearIdleTimer()
    clearExitTimer()
    clearEnterTimer()
    animationPhaseRef.current = "exiting"
    setAnimationPhase("exiting")
    exitTimerRef.current = window.setTimeout(() => {
      finishWordExit()
    }, WORD_EXIT_DURATION_MS)
  }, [clearEnterTimer, clearExitTimer, clearIdleTimer, finishWordExit])

  useEffect(() => {
    exitWordRef.current = exitWord
  }, [exitWord])

  useEffect(() => {
    enabledRef.current = enabled
    if (!enabled) {
      resetWordPreview()
    }
  }, [enabled, resetWordPreview])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === "Backspace") {
        removeLastCharacter()
        return
      }

      if (event.key === " " || event.key === "Enter") {
        exitWord()
        return
      }

      if (!isAppendableWordKey(event.key)) return

      appendCharacter(event.key)
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [appendCharacter, exitWord, removeLastCharacter])

  useEffect(() => {
    return () => {
      clearAllWordTimers()
    }
  }, [clearAllWordTimers])

  const visible = enabled && animationPhase !== "idle"

  return (
    <div className="flex min-h-[96px] w-full items-center justify-center px-4">
      <div
        className="flex h-24 w-full items-center justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          aria-hidden={!visible}
          className={`pointer-events-none flex min-h-10 w-full items-center justify-center transition-[opacity,transform] ease-out ${
            visible ? "opacity-100" : "opacity-0"
          } ${
            visible &&
            (animationPhase === "entering" || animationPhase === "visible")
              ? "translate-y-0"
              : animationPhase === "exiting"
                ? "-translate-y-1.5"
                : "translate-y-1.5"
          } ${
            animationPhase === "entering" ? "duration-150" : "duration-[350ms]"
          }`}
        >
          <div
            data-word-preview
            className={`max-w-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3 text-center text-4xl font-semibold tracking-wide text-white shadow-lg shadow-black/20 transition-[opacity,transform] ease-out ${
              visible &&
              (animationPhase === "entering" || animationPhase === "visible")
                ? "translate-y-0 opacity-100"
                : animationPhase === "exiting"
                  ? "-translate-y-1.5 opacity-0"
                  : "translate-y-1.5 opacity-0"
            } ${
              animationPhase === "entering"
                ? "duration-150"
                : "duration-[350ms]"
            }`}
          >
            <span className="block min-h-10 max-w-full truncate leading-10">
              {visible ? currentWord : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
