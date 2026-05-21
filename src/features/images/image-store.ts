import { create } from "zustand"
import { toast } from "sonner"
import { getFromLocalStorage, safeSetLocalStorage } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/constants"
import type { PromptImage } from "./image-types"

const IMAGES_KEY = STORAGE_KEYS.IMAGES

let quotaToastShown = false

interface ImageStore {
  images: PromptImage[]
  addImages: (newImages: PromptImage[]) => void
  removeImage: (id: string) => void
  clearImages: () => void
  initialize: () => void
}

function persistImages(images: PromptImage[]) {
  const ok = safeSetLocalStorage(IMAGES_KEY, images, {
    onQuotaExceeded: () => {
      if (!quotaToastShown) {
        quotaToastShown = true
        toast.error(
          "Image storage is full. Newer images may not persist across reloads.",
        )
      }
    },
  })
  if (ok) quotaToastShown = false
}

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],

  addImages: (newImages) => {
    const updated = [...get().images, ...newImages]
    set({ images: updated })
    persistImages(updated)
  },

  removeImage: (id) => {
    const updated = get().images.filter((img) => img.id !== id)
    set({ images: updated })
    persistImages(updated)
  },

  clearImages: () => {
    set({ images: [] })
    persistImages([])
  },

  initialize: () => {
    const saved = getFromLocalStorage<PromptImage[]>(IMAGES_KEY)
    if (saved && saved.length > 0) {
      set({ images: saved })
    }
  },
}))
