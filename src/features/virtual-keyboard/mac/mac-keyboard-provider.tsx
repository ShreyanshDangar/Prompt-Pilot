import { useEffect, useRef, useState, useCallback, type ReactNode, type RefObject } from "react"
import { toast } from "sonner"
import { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP, MAC_KEYBOARD_SOUND_URL } from "./mac-keyboard-sounds"
import { KeyboardContext } from "./mac-keyboard-context"
import { useKeyboardStore } from "../keyboard-store"
import { detectPhysicalPlatform } from "@/lib/platform"
import { useKeyState } from "../useKeyState"

const CROSS_PLATFORM_TOAST_KEYS = {
  suggestMac: "promptPilot.kbToast.suggestMac.v1",
  suggestWindows: "promptPilot.kbToast.suggestWindows.v1",
} as const

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
