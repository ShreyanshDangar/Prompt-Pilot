import { describe, it, expect, beforeEach } from "vitest"
import { useEditorStore } from "./editor-store"
import type { EditorTab } from "./editor-types"

function makeTab(over: Partial<EditorTab> = {}): EditorTab {
  return {
    id: Math.random().toString(36).slice(2),
    name: "Prompt 1",
    content: "",
    theme: "modern",
    cursorPosition: 0,
    scrollPosition: 0,
    isDirty: false,
    isRenamed: false,
    ...over,
  }
}

describe("editor-store", () => {
  beforeEach(() => {
    const tab = makeTab({ name: "Prompt 1" })
    useEditorStore.setState({ tabs: [tab], activeTabId: tab.id, editor: null })
  })

  it("addTab appends a tab and activates it", () => {
    const before = useEditorStore.getState().tabs.length
    useEditorStore.getState().addTab()
    const { tabs, activeTabId } = useEditorStore.getState()
    expect(tabs).toHaveLength(before + 1)
    expect(activeTabId).toBe(tabs[tabs.length - 1].id)
  })

  it("closeTab keeps at least one tab", () => {
    const { tabs } = useEditorStore.getState()
    useEditorStore.getState().closeTab(tabs[0].id)
    expect(useEditorStore.getState().tabs).toHaveLength(1)
  })

  it("closeTab renumbers unrenamed tabs but leaves renamed ones intact", () => {
    const t1 = makeTab({ name: "Prompt 1" })
    const renamed = makeTab({ name: "My Notes", isRenamed: true })
    const t3 = makeTab({ name: "Prompt 3" })
    useEditorStore.setState({ tabs: [t1, renamed, t3], activeTabId: t1.id })

    useEditorStore.getState().closeTab(t1.id)

    const { tabs } = useEditorStore.getState()
    expect(tabs).toHaveLength(2)
    expect(tabs[0].name).toBe("My Notes") // renamed tab untouched
    expect(tabs[1].name).toBe("Prompt 2") // unrenamed tab renumbered (was Prompt 3)
  })
})
