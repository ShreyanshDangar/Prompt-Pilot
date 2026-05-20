import { describe, it, expect, beforeEach } from "vitest"
import { useGlobalStore } from "./global-store"
import { STORAGE_KEYS } from "@/lib/constants"

// The store is a module singleton; capture its initial (default) settings so each
// test starts from a clean slate (initializeSettings only writes settings when a
// payload exists — a fresh store already holds the defaults).
const DEFAULT_SETTINGS = useGlobalStore.getState().settings

describe("global-store initializeSettings", () => {
  beforeEach(() => {
    localStorage.clear()
    useGlobalStore.setState({ settings: DEFAULT_SETTINGS })
  })

  it("deep-merges a partial saved payload over the defaults", () => {
    localStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify({ websiteTheme: "cyber", spellcheck: false }),
    )

    useGlobalStore.getState().initializeSettings()

    const s = useGlobalStore.getState().settings
    expect(s.websiteTheme).toBe("cyber")
    expect(s.spellcheck).toBe(false)
    // Absent fields fall back to defaults.
    expect(s.tabBehavior).toBe("insert")
    expect(s.autoCorrectRules.length).toBeGreaterThan(0)
    // perThemeStyles is merged over the full default map, not replaced.
    expect(s.perThemeStyles.cyber).toBeDefined()
    expect(s.perThemeStyles.zen).toBeDefined()
  })

  it("uses defaults entirely when nothing is persisted", () => {
    useGlobalStore.getState().initializeSettings()

    const s = useGlobalStore.getState().settings
    expect(s.websiteTheme).toBe("default")
    expect(s.autoCorrectEnabled).toBe(true)
  })
})
