import { useMemo, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Command, FastForward, Globe,
  Mic, Moon, Search, SkipBack, SkipForward, Sun, SunDim, Table, Volume1, Volume2, VolumeX
} from "lucide-react"
import { cn } from "@/lib/cn"
import { Key, ModifierKey, OptionKey } from "./MacKeyboardKeys"
import { KeyboardProvider } from "./mac-keyboard-provider"
import { useKeyboardSound } from "./mac-keyboard-context"
import { getKeyDisplayLabel } from "./mac-keyboard-sounds"
import { useKeyboardStore } from "../keyboard-store"
import { getColorPreset, getFontPreset } from "../keyboard-presets"
import { useGlobalStore } from "@/stores/global-store"

// lucide-react has no Windows brand glyph; this 4-pane mark mirrors the
// previous Tabler brand-windows icon (kept local like OptionKey in MacKeyboardKeys).
function WindowsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="0.5" />
      <rect x="13" y="3" width="8" height="8" rx="0.5" />
      <rect x="3" y="13" width="8" height="8" rx="0.5" />
      <rect x="13" y="13" width="8" height="8" rx="0.5" />
    </svg>
  )
}

function KeystrokePreview() {
  const { lastPressedKey, lastPressedKeyValue } = useKeyboardSound()

  const displayKey = useMemo(() => {
    if (
      !lastPressedKey ||
      lastPressedKey === "Space" ||
      lastPressedKey === "ShiftLeft" ||
      lastPressedKey === "ShiftRight"
    ) {
      return null
    }

    if (lastPressedKeyValue && lastPressedKeyValue.length === 1) {
      return lastPressedKeyValue
    }

    return getKeyDisplayLabel(lastPressedKey)
  }, [lastPressedKey, lastPressedKeyValue])

  return (
    <div className="relative flex h-12 w-full items-center justify-center">
      {displayKey && (
        <motion.div
          initial={false}
          animate={{ scale: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 26,
            mass: 0.7,
          }}
          className="absolute flex items-center justify-center px-4 py-2 text-center text-4xl font-semibold tracking-wide text-white"
        >
          <span className="text-4xl font-semibold tracking-wide text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
            {displayKey}
          </span>
        </motion.div>
      )}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="mb-0.5 flex w-full shrink-0 gap-0.5">{children}</div>
}

function Keypad() {
  return (
    <div
      style={{ backgroundColor: "var(--kb-frame-bg, #e5e5e5)" }}
      className="h-full w-fit rounded-xl p-1 shadow-sm ring-1 shadow-black/5 ring-black/5"
    >
      <Row>
        <Key
          keyCode="Escape"
          containerClassName="rounded-tl-xl"
          className="w-10 rounded-tl-lg"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>esc</span>
        </Key>
        <Key keyCode="F1">
          <SunDim className="h-1.5 w-1.5" />
          <span className="mt-1">F1</span>
        </Key>
        <Key keyCode="F2">
          <Sun className="h-1.5 w-1.5" />
          <span className="mt-1">F2</span>
        </Key>
        <Key keyCode="F3">
          <Table className="h-1.5 w-1.5" />
          <span className="mt-1">F3</span>
        </Key>
        <Key keyCode="F4">
          <Search className="h-1.5 w-1.5" />
          <span className="mt-1">F4</span>
        </Key>
        <Key keyCode="F5">
          <Mic className="h-1.5 w-1.5" />
          <span className="mt-1">F5</span>
        </Key>
        <Key keyCode="F6">
          <Moon className="h-1.5 w-1.5" />
          <span className="mt-1">F6</span>
        </Key>
        <Key keyCode="F7">
          <SkipBack className="h-1.5 w-1.5" />
          <span className="mt-1">F7</span>
        </Key>
        <Key keyCode="F8">
          <FastForward className="h-1.5 w-1.5" />
          <span className="mt-1">F8</span>
        </Key>
        <Key keyCode="F9">
          <SkipForward className="h-1.5 w-1.5" />
          <span className="mt-1">F9</span>
        </Key>
        <Key keyCode="F10">
          <VolumeX className="h-1.5 w-1.5" />
          <span className="mt-1">F10</span>
        </Key>
        <Key keyCode="F11">
          <Volume1 className="h-1.5 w-1.5" />
          <span className="mt-1">F11</span>
        </Key>
        <Key keyCode="F12">
          <Volume2 className="h-1.5 w-1.5" />
          <span className="mt-1">F12</span>
        </Key>
        <Key containerClassName="rounded-tr-xl" className="rounded-tr-lg">
          <div className="h-4 w-4 rounded-full bg-linear-to-b from-neutral-300 via-neutral-200 to-neutral-300 p-px">
            <div className="h-full w-full rounded-full bg-neutral-100" />
          </div>
        </Key>
      </Row>

      <Row>
        <Key keyCode="Backquote">
          <span>~</span>
          <span>`</span>
        </Key>
        <Key keyCode="Digit1">
          <span>!</span>
          <span>1</span>
        </Key>
        <Key keyCode="Digit2">
          <span>@</span>
          <span>2</span>
        </Key>
        <Key keyCode="Digit3">
          <span>#</span>
          <span>3</span>
        </Key>
        <Key keyCode="Digit4">
          <span>$</span>
          <span>4</span>
        </Key>
        <Key keyCode="Digit5">
          <span>%</span>
          <span>5</span>
        </Key>
        <Key keyCode="Digit6">
          <span>^</span>
          <span>6</span>
        </Key>
        <Key keyCode="Digit7">
          <span>&</span>
          <span>7</span>
        </Key>
        <Key keyCode="Digit8">
          <span>*</span>
          <span>8</span>
        </Key>
        <Key keyCode="Digit9">
          <span>(</span>
          <span>9</span>
        </Key>
        <Key keyCode="Digit0">
          <span>)</span>
          <span>0</span>
        </Key>
        <Key keyCode="Minus">
          <span>—</span>
          <span>_</span>
        </Key>
        <Key keyCode="Equal">
          <span>+</span>
          <span>=</span>
        </Key>
        <Key
          keyCode="Backspace"
          className="w-10"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>delete</span>
        </Key>
      </Row>

      <Row>
        <Key
          keyCode="Tab"
          className="w-10"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>tab</span>
        </Key>
        {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((letter) => (
          <Key key={letter} keyCode={`Key${letter}`}>
            {letter}
          </Key>
        ))}
        <Key keyCode="BracketLeft">
          <span>{`{`}</span>
          <span>{`[`}</span>
        </Key>
        <Key keyCode="BracketRight">
          <span>{`}`}</span>
          <span>{`]`}</span>
        </Key>
        <Key keyCode="Backslash">
          <span>{`|`}</span>
          <span>{`\\`}</span>
        </Key>
      </Row>

      <Row>
        <Key
          keyCode="CapsLock"
          className="w-[2.8rem]"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>caps lock</span>
        </Key>
        {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((letter) => (
          <Key key={letter} keyCode={`Key${letter}`}>
            {letter}
          </Key>
        ))}
        <Key keyCode="Semicolon">
          <span>:</span>
          <span>;</span>
        </Key>
        <Key keyCode="Quote">
          <span>{`"`}</span>
          <span>{`'`}</span>
        </Key>
        <Key
          keyCode="Enter"
          className="w-[2.85rem]"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>return</span>
        </Key>
      </Row>

      <Row>
        <Key
          keyCode="ShiftLeft"
          className="w-[3.65rem]"
          childrenClassName="items-start justify-end pb-[2px] pl-[4px]"
        >
          <span>shift</span>
        </Key>
        {["Z", "X", "C", "V", "B", "N", "M"].map((letter) => (
          <Key key={letter} keyCode={`Key${letter}`}>
            {letter}
          </Key>
        ))}
        <Key keyCode="Comma">
          <span>{`<`}</span>
          <span>,</span>
        </Key>
        <Key keyCode="Period">
          <span>{`>`}</span>
          <span>.</span>
        </Key>
        <Key keyCode="Slash">
          <span>?</span>
          <span>/</span>
        </Key>
        <Key
          keyCode="ShiftRight"
          className="w-[3.65rem]"
          childrenClassName="items-end justify-end pr-[4px] pb-[2px]"
        >
          <span>shift</span>
        </Key>
      </Row>

      <BottomRow />
    </div>
  )
}

function MacBottomRow() {
  return (
    <>
      <ModifierKey
        keyCode="Fn"
        containerClassName="rounded-bl-xl"
        className="rounded-bl-lg"
      >
        <span>fn</span>
        <Globe className="h-1.5 w-1.5" />
      </ModifierKey>
      <ModifierKey keyCode="ControlLeft">
        <ChevronUp className="h-1.5 w-1.5" />
        <span>control</span>
      </ModifierKey>
      <ModifierKey keyCode="AltLeft">
        <OptionKey className="h-1.5 w-1.5" />
        <span>option</span>
      </ModifierKey>
      <ModifierKey keyCode="MetaLeft" className="w-8">
        <Command className="h-1.5 w-1.5" />
        <span>command</span>
      </ModifierKey>
      <Key keyCode="Space" className="w-[8.2rem]" />
      <ModifierKey keyCode="MetaRight" className="w-8">
        <Command className="h-1.5 w-1.5" />
        <span>command</span>
      </ModifierKey>
      <ModifierKey keyCode="AltRight">
        <OptionKey className="h-1.5 w-1.5" />
        <span>option</span>
      </ModifierKey>
    </>
  )
}

function WindowsBottomRow() {
  return (
    <>
      <ModifierKey
        keyCode="ControlLeft"
        containerClassName="rounded-bl-xl"
        className="rounded-bl-lg"
      >
        <span>Ctrl</span>
      </ModifierKey>
      <ModifierKey keyCode="MetaLeft">
        <WindowsLogo className="h-1.5 w-1.5" />
        <span>Win</span>
      </ModifierKey>
      <ModifierKey keyCode="AltLeft">
        <span>Alt</span>
      </ModifierKey>
      <Key keyCode="Space" className="w-[9.2rem]" />
      <ModifierKey keyCode="AltRight">
        <span>Alt</span>
      </ModifierKey>
      <ModifierKey keyCode="MetaRight">
        <WindowsLogo className="h-1.5 w-1.5" />
        <span>Win</span>
      </ModifierKey>
      <ModifierKey keyCode="ControlRight">
        <span>Ctrl</span>
      </ModifierKey>
    </>
  )
}

function BottomRow() {
  const keyboardPlatform = useKeyboardStore((s) => s.keyboardPlatform)
  const isWindows = keyboardPlatform === "windows"
  return (
    <Row>
      {isWindows ? <WindowsBottomRow /> : <MacBottomRow />}

      <div className="flex h-6 w-[4.9rem] items-center justify-end rounded-sm p-[0.5px]">
        <Key keyCode="ArrowLeft" className="h-6 w-6">
          <ChevronLeft className="h-1.5 w-1.5" />
        </Key>
        <div className="flex flex-col">
          <Key keyCode="ArrowUp" className="h-3 w-6">
            <ChevronUp className="h-1.5 w-1.5" />
          </Key>
          <Key keyCode="ArrowDown" className="h-3 w-6">
            <ChevronDown className="h-1.5 w-1.5" />
          </Key>
        </div>
        <Key
          keyCode="ArrowRight"
          containerClassName="rounded-br-xl"
          className="h-6 w-6 rounded-br-lg"
        >
          <ChevronRight className="h-1.5 w-1.5" />
        </Key>
      </div>
    </Row>
  )
}

export function MacKeyboard({
  className,
  enableSound = false,
  showPreview = false,
}: {
  className?: string
  enableSound?: boolean
  showPreview?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)
  const colorPresetId = useKeyboardStore(
    (s) => s.colorPresetByTheme[websiteTheme] ?? "default",
  )
  const fontPresetId = useKeyboardStore(
    (s) => s.fontPresetByTheme[websiteTheme] ?? "default",
  )
  const colorPreset = getColorPreset(websiteTheme, colorPresetId)
  const fontPreset = getFontPreset(websiteTheme, fontPresetId)

  const kbVars = useMemo(() => {
    const vars: Record<string, string> = {}
    if (colorPreset.frameBg) vars["--kb-frame-bg"] = colorPreset.frameBg
    if (colorPreset.keyBg) vars["--kb-key-bg"] = colorPreset.keyBg
    if (colorPreset.keyText) vars["--kb-key-text"] = colorPreset.keyText
    return vars
  }, [colorPreset.frameBg, colorPreset.keyBg, colorPreset.keyText])

  return (
    <KeyboardProvider enableSound={enableSound} containerRef={containerRef}>
      <div
        ref={containerRef}
        data-keyboard-root=""
        className={cn(
          "mx-auto w-fit [zoom:0.85] sm:[zoom:1.35] md:[zoom:1.6] lg:[zoom:1.9] xl:[zoom:2.15]",
          className,
        )}
        style={{
          ...(kbVars as React.CSSProperties),
          ...(fontPreset.fontFamily
            ? { fontFamily: fontPreset.fontFamily }
            : null),
        }}
      >
        {showPreview && <KeystrokePreview />}
        <Keypad />
      </div>
    </KeyboardProvider>
  )
}
