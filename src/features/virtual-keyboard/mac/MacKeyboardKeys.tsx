import { type ReactNode } from "react"
import { cn } from "@/lib/cn"
import { getKeyDisplayLabel } from "./mac-keyboard-sounds"
import { useKeyboardSound } from "./mac-keyboard-context"

/**
 * Shared press behavior for on-screen keys: reads the keyboard sound context
 * and returns the pressed state plus the mouse handlers used identically by
 * both `Key` and `ModifierKey`.
 */
function useKeyPress(keyCode?: string) {
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

  return { isPressed, handleMouseDown, handleMouseUp, handleMouseLeave }
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
  const { isPressed, handleMouseDown, handleMouseUp, handleMouseLeave } =
    useKeyPress(keyCode)

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
  const { isPressed, handleMouseDown, handleMouseUp, handleMouseLeave } =
    useKeyPress(keyCode)

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
