export const APP_NAME = "Prompt Pilot"

export const STORAGE_KEYS = {
  SETTINGS: "prompt-pilot-settings",
  SLASH_COMMANDS: "prompt-pilot-slash-commands",
  IMAGES: "prompt-pilot-images",
  XML_TAGS: "prompt-pilot-xml-tags",
  PROJECTS: "prompt-pilot-projects",
  FOLDERS: "prompt-pilot-folders",
  CHAINS: "prompt-pilot-chains",
  RIGHT_PANEL_SECTIONS: "prompt-pilot-right-panel-sections",
} as const

// Keyboard settings use their own key namespace (kept verbatim — changing these
// strings would orphan persisted user settings). Registered here so the full set
// of localStorage keys is discoverable from one place; consumed by keyboard-store.
export const KEYBOARD_STORAGE_KEYS = {
  V1: "promptPilot.keyboardSettings.v1",
  LEGACY: "prompt-pilot-keyboard",
} as const

export const SESSION_KEY = "session-state"

export const DEFAULT_EDITOR_PLACEHOLDER = "Start writing your prompt..."

export const AUTOSAVE_INTERVAL_MS = 5000

export const COPY_FEEDBACK_DURATION_MS = 1500

export const MAX_IMAGES = 9
