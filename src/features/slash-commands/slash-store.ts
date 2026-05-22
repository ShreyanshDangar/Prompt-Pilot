import { create } from "zustand"
import type { SlashCommand } from "./slash-types"
import { BUILT_IN_COMMANDS, BUILT_IN_NAMES } from "./built-in-commands"
import { getFromLocalStorage, safeSetLocalStorage } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/constants"

interface SlashStore {
  userCommands: SlashCommand[]
  isCreateModalOpen: boolean
  editingCommand: SlashCommand | null
  initialize: () => void
  getAllCommands: () => SlashCommand[]
  addCommand: (command: Omit<SlashCommand, "category" | "usageCount">) => boolean
  updateCommand: (name: string, updates: Partial<SlashCommand>) => boolean
  deleteCommand: (name: string) => void
  incrementUsage: (name: string) => void
  searchCommands: (query: string) => SlashCommand[]
  openCreateModal: () => void
  closeCreateModal: () => void
  setEditingCommand: (command: SlashCommand | null) => void
}

export const useSlashStore = create<SlashStore>((set, get) => ({
  userCommands: [],
  isCreateModalOpen: false,
  editingCommand: null,

  initialize: () => {
    const saved = getFromLocalStorage<SlashCommand[]>(
      STORAGE_KEYS.SLASH_COMMANDS
    )
    if (saved) {
      set({ userCommands: saved })
    }
  },

  getAllCommands: () => {
    return [...BUILT_IN_COMMANDS, ...get().userCommands]
  },

  addCommand: (command) => {
    const normalizedName = command.name.toLowerCase()
    if (BUILT_IN_NAMES.map((n) => n.toLowerCase()).includes(normalizedName)) {
      return false
    }
    if (get().userCommands.some((c) => c.name === normalizedName)) {
      return false
    }
    const newCommand: SlashCommand = {
      ...command,
      name: normalizedName,
      category: "user",
      usageCount: 0,
    }
    const updated = [...get().userCommands, newCommand]
    set({ userCommands: updated })
    safeSetLocalStorage(STORAGE_KEYS.SLASH_COMMANDS, updated)
    return true
  },

  updateCommand: (name, updates) => {
    const nextNameRaw = updates.name
    if (typeof nextNameRaw === "string") {
      const nextName = nextNameRaw.toLowerCase()
      if (nextName !== name) {
        if (BUILT_IN_NAMES.includes(nextName)) {
          return false
        }
        if (get().userCommands.some((c) => c.name === nextName)) {
          return false
        }
        updates = { ...updates, name: nextName }
      } else {
        updates = { ...updates, name: nextName }
      }
    }
    const updated = get().userCommands.map((c) =>
      c.name === name ? { ...c, ...updates } : c
    )
    set({ userCommands: updated })
    safeSetLocalStorage(STORAGE_KEYS.SLASH_COMMANDS, updated)
    return true
  },

  deleteCommand: (name) => {
    const updated = get().userCommands.filter((c) => c.name !== name)
    set({ userCommands: updated })
    safeSetLocalStorage(STORAGE_KEYS.SLASH_COMMANDS, updated)
  },

  incrementUsage: (name) => {
    const updated = get().userCommands.map((c) =>
      c.name === name ? { ...c, usageCount: c.usageCount + 1 } : c
    )
    set({ userCommands: updated })
    safeSetLocalStorage(STORAGE_KEYS.SLASH_COMMANDS, updated)
  },

  searchCommands: (query) => {
    const all = get().getAllCommands()
    const lower = query.toLowerCase()
    return all.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.description.toLowerCase().includes(lower)
    )
  },

  openCreateModal: () => set({ isCreateModalOpen: true, editingCommand: null }),
  closeCreateModal: () =>
    set({ isCreateModalOpen: false, editingCommand: null }),
  setEditingCommand: (command) =>
    set({ editingCommand: command, isCreateModalOpen: true }),
}))
