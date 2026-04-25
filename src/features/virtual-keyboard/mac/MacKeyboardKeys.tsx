import { useEffect, useRef, useState, useCallback, type ReactNode, type RefObject } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/cn"
import { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP, MAC_KEYBOARD_SOUND_URL, getKeyDisplayLabel } from "./mac-keyboard-sounds"
import { KeyboardContext, useKeyboardSound } from "./mac-keyboard-context"
import { useKeyboardStore } from "../keyboard-store"
import { detectPhysicalPlatform, CROSS_PLATFORM_TOAST_KEYS } from "../platform-utils"
import { useKeyState } from "../useKeyState"

export function KeyboardProvider({
  children,
  enableSound = false,
  containerRef,
}: {
  children: ReactNode
  enableSound?: boolean
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const { pressedKeys, pressKey, releaseKey } = useKeyState()
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null)
  const [lastPressedKeyValue, setLastPressedKeyValue] = useState<string | null>(
    null,
  )
  const [soundLoaded, setSoundLoaded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enableSound) return

    let cancelled = false

    const initAudio = async () => {
      try {
        const ctx = new AudioContext()
        audioContextRef.current = ctx
        const response = await fetch(MAC_KEYBOARD_SOUND_URL)
        if (!response.ok) {
          console.warn("Keyboard sound file not available")
          return
        }
        const arrayBuffer = await response.arrayBuffer()
        const buffer = await ctx.decodeAudioData(arrayBuffer)
        if (cancelled) return
        audioBufferRef.current = buffer
        setSoundLoaded(true)
      } catch (error) {
        console.warn("Failed to load keyboard sound:", error)
      }
    }

    initAudio()

    return () => {
      cancelled = true
      audioContextRef.current?.close()
      audioContextRef.current = null
      audioBufferRef.current = null
      setSoundLoaded(false)
    }
  }, [enableSound])

  const playSoundDown = useCallback(
    (keyCode: string) => {
      if (!enableSound || !soundLoaded) return
      if (!audioContextRef.current || !audioBufferRef.current) return

      const soundDef = SOUND_DEFINES_DOWN[keyCode]
      if (!soundDef) return

      const [startMs, durationMs] = soundDef
      const startTime = startMs / 1000
      const duration = durationMs / 1000

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBufferRef.current
      source.connect(audioContextRef.current.destination)
      source.start(0, startTime, duration)
    },
    [enableSound, soundLoaded],
  )

  const playSoundUp = useCallback(
    (keyCode: string) => {
      if (!enableSound || !soundLoaded) return
      if (!audioContextRef.current || !audioBufferRef.current) return

      const soundDef = SOUND_DEFINES_UP[keyCode]
      if (!soundDef) return

      const [startMs, durationMs] = soundDef
      const startTime = startMs / 1000
      const duration = durationMs / 1000

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume()
      }

      const source = audioContextRef.current.createBufferSource()
      source.buffer = audioBufferRef.current
      source.connect(audioContextRef.current.destination)
      source.start(0, startTime, duration)
    },
    [enableSound, soundLoaded],
  )

  const setPressed = useCallback(
    (keyCode: string, keyValue: string) => {
      pressKey(keyCode)
      setLastPressedKey(keyCode)
      setLastPressedKeyValue(keyValue)
    },
    [pressKey],
  )

  const setReleased = useCallback(
    (keyCode: string) => {
      releaseKey(keyCode)
    },
    [releaseKey],
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [containerRef])

  useEffect(() => {
    if (!isVisible) return

    const isCrossPlatformMetaMismatch = (keyCode: string): boolean => {
      if (keyCode !== "MetaLeft" && keyCode !== "MetaRight") return false
      const kbPlatform = useKeyboardStore.getState().keyboardPlatform
      const physical = detectPhysicalPlatform()
      return kbPlatform !== physical
    }

    const maybeShowCrossPlatformToast = () => {
      const kbPlatform = useKeyboardStore.getState().keyboardPlatform
      const suggest: "mac" | "windows" = kbPlatform === "windows" ? "mac" : "windows"
      const storageKey =
        suggest === "mac"
          ? CROSS_PLATFORM_TOAST_KEYS.suggestMac
          : CROSS_PLATFORM_TOAST_KEYS.suggestWindows
      try {
        if (sessionStorage.getItem(storageKey)) return
        sessionStorage.setItem(storageKey, "1")
      } catch {
        return
      }
      const setPlatform = useKeyboardStore.getState().setKeyboardPlatform
      toast(
        suggest === "mac"
          ? "Looks like you're using a Mac keyboard"
          : "Looks like you're using a Windows keyboard",
        {
          description:
            suggest === "mac"
              ? "Switch the on-screen keyboard to Mac for matching modifier keys."
              : "Switch the on-screen keyboard to Windows for matching modifier keys.",
          action: {
            label: suggest === "mac" ? "Switch to Mac" : "Switch to Windows",
            onClick: () => setPlatform(suggest),
          },
          duration: 6000,
        },
      )
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      const keyCode = e.code
      if (isCrossPlatformMetaMismatch(keyCode)) {
        maybeShowCrossPlatformToast()
        return
      }
      playSoundDown(keyCode)
      setPressed(keyCode, e.key)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyCode = e.code
      if (isCrossPlatformMetaMismatch(keyCode)) return
      playSoundUp(keyCode)
      setReleased(keyCode)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
    }
  }, [isVisible, playSoundDown, playSoundUp, setPressed, setReleased])

  return (
    <KeyboardContext.Provider
      value={{
        playSoundDown,
        playSoundUp,
        pressedKeys,
        setPressed,
        setReleased,
        lastPressedKey,
        lastPressedKeyValue,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  )
}

export function Key({
  className,
  childrenClassName,
  containerClassName,
  children,
  keyCode,
}: {
  className?: string
  childrenClassName?: string
  containerClassName?: string
  children?: ReactNode
  keyCode?: string
}) {
  const { playSoundDown, playSoundUp, pressedKeys, setPressed, setReleased } =
    useKeyboardSound()
  const isPressed = keyCode ? pressedKeys.has(keyCode) : false

  const handleMouseDown = () => {
    if (keyCode) {
      playSoundDown(keyCode)
      setPressed(keyCode, getKeyDisplayLabel(keyCode))
    }
  }

  const handleMouseUp = () => {
    if (keyCode && isPressed) {
      playSoundUp(keyCode)
      setReleased(keyCode)
    }
  }

  const handleMouseLeave = () => {
    if (keyCode && isPressed) {
      setReleased(keyCode)
    }
  }

  return (
    <div className={cn("rounded-sm p-[0.5px]", containerClassName)}>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ backgroundColor: "var(--kb-key-bg, #f3f4f6)" }}
        className={cn(
          "flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1)] transition-transform duration-75 active:scale-[0.98]",
          isPressed &&
            "scale-[0.98] brightness-90 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1)]",
          className,
        )}
      >
        <div
          style={{ color: "var(--kb-key-text, #404040)" }}
          className={cn(
            "flex h-full w-full flex-col items-center justify-center text-[5px]",
            childrenClassName,
          )}
        >
          {children}
        </div>
      </button>
    </div>
  )
}

export function ModifierKey({
  className,
  containerClassName,
  children,
  keyCode,
}: {
  className?: string
  containerClassName?: string
  children?: ReactNode
  keyCode?: string
}) {
  const { playSoundDown, playSoundUp, pressedKeys, setPressed, setReleased } =
    useKeyboardSound()
  const isPressed = keyCode ? pressedKeys.has(keyCode) : false

  const handleMouseDown = () => {
    if (keyCode) {
      playSoundDown(keyCode)
      setPressed(keyCode, getKeyDisplayLabel(keyCode))
    }
  }

  const handleMouseUp = () => {
    if (keyCode && isPressed) {
      playSoundUp(keyCode)
      setReleased(keyCode)
    }
  }

  const handleMouseLeave = () => {
    if (keyCode && isPressed) {
      setReleased(keyCode)
    }
  }

  return (
    <div className={cn("rounded-sm p-[0.5px]", containerClassName)}>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        data-key={keyCode}
        style={{ backgroundColor: "var(--kb-key-bg, #f3f4f6)" }}
        className={cn(
          "flex h-6 w-6 cursor-pointer items-center justify-center rounded-[3.5px] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1)] transition-transform duration-75 active:scale-[0.98]",
          isPressed &&
            "scale-[0.98] brightness-90 shadow-[0px_0px_1px_0px_rgba(0,0,0,0.5),0px_1px_1px_0px_rgba(0,0,0,0.1)]",
          className,
        )}
      >
        <div
          style={{ color: "var(--kb-key-text, #404040)" }}
          className="flex h-full w-full flex-col items-start justify-between p-1 text-[5px]"
        >
          {children}
        </div>
      </button>
    </div>
  )
}

export function OptionKey({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={className}
    >
      <rect
        stroke="currentColor"
        strokeWidth={2}
        x="18"
        y="5"
        width="10"
        height="2"
      />
      <polygon
        stroke="currentColor"
        strokeWidth={2}
        points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25"
      />
    </svg>
  )
}
