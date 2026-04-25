import { useEffect, memo } from "react"
import { useKeyboardStore } from "../keyboard-store"
import { useGlobalStore } from "@/stores/global-store"
import { useCanvasVideo } from "../useCanvasVideo"
import { getKeyController } from "../VideoFrameController"
import type { KeySizeCategory } from "../VideoFrameController"
import { getThemeVideoPath, type ThemeVideoSlot } from "@/lib/theme-video-manager"
import { useKeyState } from "../useKeyState"

const MEDIUM_KEYS = new Set([
  "shiftleft",
  "shiftright",
  "capslock",
  "tab",
  "altleft",
  "altright",
  "metaleft",
  "metaright",
  "controlleft",
  "controlright",
  "\\",
  "backspace",
  "enter",
])

const KEY_SIZE_SLOT_MAP: Record<KeySizeCategory, ThemeVideoSlot> = {
  small: "small-key-bg",
  medium: "medium-key-bg",
  space: "space-key-bg",
}

function getKeyVideoPath(theme: string, size: KeySizeCategory): string | null {
  return getThemeVideoPath(theme, KEY_SIZE_SLOT_MAP[size])
}

function getKeySizeCategory(key: string): KeySizeCategory {
  const k = key.toLowerCase()
  if (k === " ") return "space"
  if (MEDIUM_KEYS.has(k)) return "medium"
  return "small"
}

function getKeyImage(key: string) {
  const k = key.toLowerCase()
  if (k === " ") return "/assets/B3.png"
  if (MEDIUM_KEYS.has(k)) return "/assets/B2.png"
  return "/assets/B1.png"
}

const SIDED_MODIFIER_FROM_CODE: Record<string, string> = {
  ShiftLeft: "shiftleft",
  ShiftRight: "shiftright",
  AltLeft: "altleft",
  AltRight: "altright",
  ControlLeft: "controlleft",
  ControlRight: "controlright",
  MetaLeft: "metaleft",
  MetaRight: "metaright",
}

const KEYBOARD_ROWS = [
  [
    { key: "`", w: 1 },
    { key: "1", w: 1 },
    { key: "2", w: 1 },
    { key: "3", w: 1 },
    { key: "4", w: 1 },
    { key: "5", w: 1 },
    { key: "6", w: 1 },
    { key: "7", w: 1 },
    { key: "8", w: 1 },
    { key: "9", w: 1 },
    { key: "0", w: 1 },
    { key: "-", w: 1 },
    { key: "=", w: 1 },
    { key: "backspace", w: 2, label: "Del" },
  ],
  [
    { key: "tab", w: 1.5, label: "Tab" },
    { key: "q", w: 1 },
    { key: "w", w: 1 },
    { key: "e", w: 1 },
    { key: "r", w: 1 },
    { key: "t", w: 1 },
    { key: "y", w: 1 },
    { key: "u", w: 1 },
    { key: "i", w: 1 },
    { key: "o", w: 1 },
    { key: "p", w: 1 },
    { key: "[", w: 1 },
    { key: "]", w: 1 },
    { key: "\\", w: 1.5 },
  ],
  [
    { key: "capslock", w: 1.75, label: "Caps" },
    { key: "a", w: 1 },
    { key: "s", w: 1 },
    { key: "d", w: 1 },
    { key: "f", w: 1 },
    { key: "g", w: 1 },
    { key: "h", w: 1 },
    { key: "j", w: 1 },
    { key: "k", w: 1 },
    { key: "l", w: 1 },
    { key: ";", w: 1 },
    { key: "'", w: 1 },
    { key: "enter", w: 2.25, label: "Enter" },
  ],
  [
    { key: "shiftleft", w: 2.25, label: "Shift" },
    { key: "z", w: 1 },
    { key: "x", w: 1 },
    { key: "c", w: 1 },
    { key: "v", w: 1 },
    { key: "b", w: 1 },
    { key: "n", w: 1 },
    { key: "m", w: 1 },
    { key: ",", w: 1 },
    { key: ".", w: 1 },
    { key: "/", w: 1 },
    { key: "shiftright", w: 2.75, label: "Shift" },
  ],
  [
    { key: "controlleft", w: 1.5, label: "Ctrl" },
    { key: "metaleft", w: 1.25, label: "Cmd" },
    { key: "altleft", w: 1.25, label: "Alt" },
    { key: " ", w: 6, label: "Space" },
    { key: "altright", w: 1.25, label: "Alt" },
    { key: "metaright", w: 1.25, label: "Cmd" },
    { key: "controlright", w: 1.5, label: "Ctrl" },
  ],
]

const VirtualKey = memo(function VirtualKey({
  keyDef,
  isPressed,
  scale,
  videoPath,
  sizeCategory,
}: {
  keyDef: { key: string; w: number; label?: string }
  isPressed: boolean
  scale: number
  videoPath: string | null
  sizeCategory: KeySizeCategory
}) {
  const label = keyDef.label ?? keyDef.key.toUpperCase()
  const widthRem = keyDef.w * 2.5 * (scale / 100)
  const heightRem = 2.25 * (scale / 100)
  const bgImage = getKeyImage(keyDef.key)
  const canvasRef = useCanvasVideo(videoPath, sizeCategory)

  return (
    <div
      className={`relative flex items-center justify-center rounded-md font-medium overflow-hidden transition-all duration-75 ${isPressed ? "brightness-90 scale-95" : ""}`}
      style={{
        width: `${widthRem}rem`,
        height: `${heightRem}rem`,
        fontSize: `${(keyDef.w > 1.5 ? 0.625 : 0.7) * (scale / 100)}rem`,
        backgroundImage: videoPath ? "none" : `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
        color: "white",
        textShadow: "0 1px 2px rgba(0,0,0,0.5)",
      }}
    >
      {videoPath && (
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="pointer-events-none absolute inset-0 h-full w-full rounded-md object-cover"
          aria-hidden="true"
        />
      )}
      <span className="z-10 relative">{label}</span>
    </div>
  )
})

export function LegacyKeyboard() {
  const { pressedKeys, pressKey, releaseKey } = useKeyState()
  const size = useKeyboardStore((s) => s.size)
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)

  const smallVideoPath = getKeyVideoPath(websiteTheme, "small")
  const mediumVideoPath = getKeyVideoPath(websiteTheme, "medium")
  const spaceVideoPath = getKeyVideoPath(websiteTheme, "space")

  useEffect(() => {
    getKeyController("small").setSource(smallVideoPath)
    getKeyController("medium").setSource(mediumVideoPath)
    getKeyController("space").setSource(spaceVideoPath)
  }, [smallVideoPath, mediumVideoPath, spaceVideoPath])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      const sided = SIDED_MODIFIER_FROM_CODE[e.code]
      pressKey(sided ?? e.key.toLowerCase())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      const sided = SIDED_MODIFIER_FROM_CODE[e.code]
      releaseKey(sided ?? e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [pressKey, releaseKey])

  return (
    <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-1">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 items-end justify-center">
          {row.map((keyDef, keyIndex) => {
            const sizeCategory = getKeySizeCategory(keyDef.key)
            const videoMap: Record<KeySizeCategory, string | null> = {
              small: smallVideoPath,
              medium: mediumVideoPath,
              space: spaceVideoPath,
            }
            return (
              <VirtualKey
                key={`${rowIndex}-${keyIndex}`}
                keyDef={keyDef}
                isPressed={pressedKeys.has(keyDef.key.toLowerCase())}
                scale={size}
                videoPath={videoMap[sizeCategory]}
                sizeCategory={sizeCategory}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
