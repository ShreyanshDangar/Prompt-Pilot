import { create } from "zustand"
import type { Editor as TiptapEditor } from "@tiptap/react"
import { makeId } from "@/lib/id"
import type { EditorTab } from "./editor-types"

function createTab(index: number): EditorTab {
  const id = makeId()
  return {
    id,
    name: `Prompt ${index}`,
    content: "",
    theme: "modern",
    cursorPosition: 0,
    scrollPosition: 0,
    isDirty: false,
    isRenamed: false,
  }
}

function renumberUnrenamedTabs(tabs: EditorTab[]): EditorTab[] {
  let promptIndex = 1
  return tabs.map((t) => {
    if (!t.isRenamed) {
      return { ...t, name: `Prompt ${promptIndex++}` }
    }
    promptIndex++
    return t
  })
}

interface EditorStore {
  tabs: EditorTab[]
  activeTabId: string
  editor: TiptapEditor | null
  setEditor: (editor: TiptapEditor | null) => void
  setActiveTab: (id: string) => void
  updateTabContent: (id: string, content: string) => void
  updateTabName: (id: string, name: string) => void
  updateTabCursor: (id: string, cursorPosition: number) => void
  updateTabScroll: (id: string, scrollPosition: number) => void
  addTab: () => void
  closeTab: (id: string) => void
  reorderTab: (fromIndex: number, toIndex: number) => void
  getActiveTab: () => EditorTab | undefined
  updateTabTheme: (id: string, theme: string) => void
  getText: () => string
  markAllTabsSaved: () => void
  skipDirtyCloseConfirm: boolean
  setSkipDirtyCloseConfirm: (v: boolean) => void
}

const initialTab = createTab(1)

export const useEditorStore = create<EditorStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  editor: null,
  skipDirtyCloseConfirm: false,

  setEditor: (editor) => set({ editor }),

  setSkipDirtyCloseConfirm: (v) => set({ skipDirtyCloseConfirm: v }),

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, content, isDirty: true } : t
      ),
    })),

  updateTabName: (id, name) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, name, isRenamed: true } : t)),
    })),

  updateTabCursor: (id, cursorPosition) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, cursorPosition } : t,
      ),
    })),

  updateTabScroll: (id, scrollPosition) =>
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === id ? { ...t, scrollPosition } : t,
      ),
    })),

  addTab: () => {
    const newTab = createTab(get().tabs.length + 1)
    set((s) => ({
      tabs: [...s.tabs, newTab],
      activeTabId: newTab.id,
    }))
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get()
    if (tabs.length <= 1) return
    const filtered = tabs.filter((t) => t.id !== id)
    const newActiveId =
      activeTabId === id
        ? filtered[Math.max(0, tabs.findIndex((t) => t.id === id) - 1)].id
        : activeTabId
    const renumbered = renumberUnrenamedTabs(filtered)
    set({ tabs: renumbered, activeTabId: newActiveId })
  },

  reorderTab: (fromIndex, toIndex) =>
    set((s) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= s.tabs.length ||
        toIndex >= s.tabs.length
      ) {
        return {}
      }
      const tabs = [...s.tabs]
      const [moved] = tabs.splice(fromIndex, 1)
      tabs.splice(toIndex, 0, moved)
      return { tabs: renumberUnrenamedTabs(tabs) }
    }),

  updateTabTheme: (id, theme) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, theme } : t)),
    })),

  getActiveTab: () => {
    const { tabs, activeTabId } = get()
    return tabs.find((t) => t.id === activeTabId)
  },

  getText: () => get().editor?.getText() ?? "",

  markAllTabsSaved: () =>
    set((s) =>
      s.tabs.some((t) => t.isDirty)
        ? { tabs: s.tabs.map((t) => (t.isDirty ? { ...t, isDirty: false } : t)) }
        : {},
    ),
}))
