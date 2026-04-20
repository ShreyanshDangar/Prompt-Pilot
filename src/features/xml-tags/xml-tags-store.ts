import { create } from "zustand"
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/constants"
import { BUILT_IN_XML_TAGS } from "./xml-tag-data"
import type { XmlTag } from "./xml-tag-data"

const XML_TAGS_KEY = STORAGE_KEYS.XML_TAGS

interface XmlTagsStore {
  customTags: XmlTag[]
  isOpen: boolean
  searchQuery: string
  setOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  addCustomTag: (tag: Omit<XmlTag, "id">) => boolean
  removeCustomTag: (id: string) => void
  getAllTags: () => XmlTag[]
  searchTags: (query: string) => XmlTag[]
  initialize: () => void
}

export const useXmlTagsStore = create<XmlTagsStore>((set, get) => ({
  customTags: [],
  isOpen: false,
  searchQuery: "",

  setOpen: (open) => set({ isOpen: open }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addCustomTag: (tagData) => {
    const all = get().getAllTags()
    const duplicate = all.some(
      (t) => t.name.toLowerCase() === tagData.name.toLowerCase()
    )
    if (duplicate) return false

    const tag: XmlTag = {
      id: `custom-${crypto.randomUUID()}`,
      ...tagData,
    }
    const updated = [...get().customTags, tag]
    set({ customTags: updated })
    setToLocalStorage(XML_TAGS_KEY, updated)
    return true
  },

  removeCustomTag: (id) => {
    const updated = get().customTags.filter((t) => t.id !== id)
    set({ customTags: updated })
    setToLocalStorage(XML_TAGS_KEY, updated)
  },

  getAllTags: () => [...BUILT_IN_XML_TAGS, ...get().customTags],

  searchTags: (query) => {
    const all = get().getAllTags()
    if (!query.trim()) return all
    const q = query.toLowerCase()
    return all.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  },

  initialize: () => {
    const saved = getFromLocalStorage<XmlTag[]>(XML_TAGS_KEY)
    if (saved) {
      set({ customTags: saved })
    }
  },
}))
