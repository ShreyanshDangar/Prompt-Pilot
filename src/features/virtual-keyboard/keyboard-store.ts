import { create } from "zustand"
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage"

const KB_V1_KEY = "promptPilot.keyboardSettings.v1"
const KB_LEGACY_KEY = "prompt-pilot-keyboard"

export type ActiveKeyboard = "mac" | "classic"
export type PreviewMode = "word" | "letter"
export type KeyboardPlatform = "mac" | "windows"

interface PersistedState {
  isVisible: boolean
  activeKeyboard: ActiveKeyboard
  soundEnabled: boolean
  previewEnabled: boolean
  previewMode: PreviewMode
  keyboardPlatform: KeyboardPlatform
  colorPresetByTheme: Record<string, string>
  fontPresetByTheme: Record<string, string>
}

interface LegacyPersistedState {
  isVisible?: boolean
  size?: number
}

const DEFAULTS: PersistedState = {
  isVisible: true,
  activeKeyboard: "mac",
  soundEnabled: true,
  previewEnabled: true,
  previewMode: "word",
  keyboardPlatform: "mac",
  colorPresetByTheme: {},
  fontPresetByTheme: {},
}

interface KeyboardStore {
  isVisible: boolean
  size: number
  activeKeyboard: ActiveKeyboard
  soundEnabled: boolean
  previewEnabled: boolean
  previewMode: PreviewMode
  keyboardPlatform: KeyboardPlatform
  colorPresetByTheme: Record<string, string>
  fontPresetByTheme: Record<string, string>
  toggleVisible: () => void
  setVisible: (v: boolean) => void
  setSize: (s: number) => void
  setActiveKeyboard: (k: ActiveKeyboard) => void
  setSoundEnabled: (v: boolean) => void
  setPreviewEnabled: (v: boolean) => void
  setPreviewMode: (m: PreviewMode) => void
  setKeyboardPlatform: (p: KeyboardPlatform) => void
  setColorPreset: (theme: string, presetId: string) => void
  setFontPreset: (theme: string, presetId: string) => void
  resetToDefaults: () => void
  initialize: () => void
}

function persist(state: PersistedState) {
  try {
    setToLocalStorage(KB_V1_KEY, state)
  } catch { }
}

function readPersisted(): PersistedState {
  try {
    const v1 = getFromLocalStorage<Partial<PersistedState>>(KB_V1_KEY)
    if (v1) {
      return {
        isVisible: typeof v1.isVisible === "boolean" ? v1.isVisible : DEFAULTS.isVisible,
        activeKeyboard: v1.activeKeyboard === "classic" ? "classic" : "mac",
        soundEnabled: typeof v1.soundEnabled === "boolean" ? v1.soundEnabled : DEFAULTS.soundEnabled,
        previewEnabled: typeof v1.previewEnabled === "boolean" ? v1.previewEnabled : DEFAULTS.previewEnabled,
        previewMode: v1.previewMode === "letter" ? "letter" : "word",
        keyboardPlatform: v1.keyboardPlatform === "windows" ? "windows" : "mac",
        colorPresetByTheme:
          v1.colorPresetByTheme && typeof v1.colorPresetByTheme === "object"
            ? v1.colorPresetByTheme
            : {},
        fontPresetByTheme:
          v1.fontPresetByTheme && typeof v1.fontPresetByTheme === "object"
            ? v1.fontPresetByTheme
            : {},
      }
    }
    const legacy = getFromLocalStorage<LegacyPersistedState>(KB_LEGACY_KEY)
    if (legacy) {
      const migrated: PersistedState = {
        ...DEFAULTS,
        isVisible: typeof legacy.isVisible === "boolean" ? legacy.isVisible : DEFAULTS.isVisible,
      }
      persist(migrated)
      return migrated
    }
  } catch { }
  return { ...DEFAULTS }
}

function snapshot(get: () => KeyboardStore, overrides: Partial<PersistedState>): PersistedState {
  const s = get()
  return {
    isVisible: s.isVisible,
    activeKeyboard: s.activeKeyboard,
    soundEnabled: s.soundEnabled,
    previewEnabled: s.previewEnabled,
    previewMode: s.previewMode,
    keyboardPlatform: s.keyboardPlatform,
    colorPresetByTheme: s.colorPresetByTheme,
    fontPresetByTheme: s.fontPresetByTheme,
    ...overrides,
  }
}

export const useKeyboardStore = create<KeyboardStore>((set, get) => ({
  isVisible: DEFAULTS.isVisible,
  size: 140,
  activeKeyboard: DEFAULTS.activeKeyboard,
  soundEnabled: DEFAULTS.soundEnabled,
  previewEnabled: DEFAULTS.previewEnabled,
  previewMode: DEFAULTS.previewMode,
  keyboardPlatform: DEFAULTS.keyboardPlatform,
  colorPresetByTheme: { ...DEFAULTS.colorPresetByTheme },
  fontPresetByTheme: { ...DEFAULTS.fontPresetByTheme },

  toggleVisible: () => {
    const next = !get().isVisible
    set({ isVisible: next })
    persist(snapshot(get, { isVisible: next }))
  },

  setVisible: (v) => {
    set({ isVisible: v })
    persist(snapshot(get, { isVisible: v }))
  },

  setSize: (size) => {
    set({ size })
  },

  setActiveKeyboard: (k) => {
    set({ activeKeyboard: k })
    persist(snapshot(get, { activeKeyboard: k }))
  },

  setSoundEnabled: (v) => {
    set({ soundEnabled: v })
    persist(snapshot(get, { soundEnabled: v }))
  },

  setPreviewEnabled: (v) => {
    set({ previewEnabled: v })
    persist(snapshot(get, { previewEnabled: v }))
  },

  setPreviewMode: (m) => {
    set({ previewMode: m })
    persist(snapshot(get, { previewMode: m }))
  },

  setKeyboardPlatform: (p) => {
    set({ keyboardPlatform: p })
    persist(snapshot(get, { keyboardPlatform: p }))
  },

  setColorPreset: (theme, presetId) => {
    const next = { ...get().colorPresetByTheme, [theme]: presetId }
    set({ colorPresetByTheme: next })
    persist(snapshot(get, { colorPresetByTheme: next }))
  },

  setFontPreset: (theme, presetId) => {
    const next = { ...get().fontPresetByTheme, [theme]: presetId }
    set({ fontPresetByTheme: next })
    persist(snapshot(get, { fontPresetByTheme: next }))
  },

  resetToDefaults: () => {
    set({
      isVisible: DEFAULTS.isVisible,
      activeKeyboard: DEFAULTS.activeKeyboard,
      soundEnabled: DEFAULTS.soundEnabled,
      previewEnabled: DEFAULTS.previewEnabled,
      previewMode: DEFAULTS.previewMode,
      keyboardPlatform: DEFAULTS.keyboardPlatform,
      colorPresetByTheme: {},
      fontPresetByTheme: {},
    })
    persist({ ...DEFAULTS, colorPresetByTheme: {}, fontPresetByTheme: {} })
  },

  initialize: () => {
    const persisted = readPersisted()
    set({
      isVisible: persisted.isVisible,
      activeKeyboard: persisted.activeKeyboard,
      soundEnabled: persisted.soundEnabled,
      previewEnabled: persisted.previewEnabled,
      previewMode: persisted.previewMode,
      keyboardPlatform: persisted.keyboardPlatform,
      colorPresetByTheme: persisted.colorPresetByTheme,
      fontPresetByTheme: persisted.fontPresetByTheme,
      size: 140,
    })
  },
}))
