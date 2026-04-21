import { createContext, useContext } from "react"

export interface KeyboardContextValue {
  playSoundDown: (keyCode: string) => void
  playSoundUp: (keyCode: string) => void
  pressedKeys: Set<string>
  setPressed: (keyCode: string, keyValue: string) => void
  setReleased: (keyCode: string) => void
  lastPressedKey: string | null
  lastPressedKeyValue: string | null
}

export const KeyboardContext = createContext<KeyboardContextValue | null>(null)

export function useKeyboardSound() {
  const context = useContext(KeyboardContext)
  if (!context) {
    throw new Error("useKeyboardSound must be used within KeyboardProvider")
  }
  return context
}
