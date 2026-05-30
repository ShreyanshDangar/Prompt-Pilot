import { create } from "zustand"
import { toast } from "sonner"
import { getFromLocalStorage, safeSetLocalStorage } from "@/lib/storage"
import { STORAGE_KEYS, MAX_IMAGES } from "@/lib/constants"
import { makeId } from "@/lib/id"
import type { PromptImage } from "./image-types"

const IMAGES_KEY = STORAGE_KEYS.IMAGES

let quotaToastShown = false

function imageLabel(count: number) {
  return `image${count === 1 ? "" : "s"}`
}

interface ImageStore {
  images: PromptImage[]
  addImages: (newImages: PromptImage[]) => void
  addImageFiles: (files: FileList | File[]) => void
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

  addImageFiles: (files) => {
    const incoming = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    )
    if (incoming.length === 0) return
    const remaining = MAX_IMAGES - get().images.length
    if (remaining <= 0) {
      toast.info(
        `Per-prompt limit is ${MAX_IMAGES} ${imageLabel(MAX_IMAGES)}. Remove some to add more.`,
      )
      return
    }
    const imageFiles = incoming.slice(0, remaining)
    const skipped = incoming.length - imageFiles.length
    if (skipped > 0) {
      toast.info(
        `Added ${imageFiles.length} ${imageLabel(imageFiles.length)}. ${skipped} more weren't attached because the per-prompt limit is ${MAX_IMAGES}. Remove some to add more.`,
      )
    }
    Promise.all(
      imageFiles.map(
        (file) =>
          new Promise<PromptImage>((resolve, reject) => {
            const reader = new FileReader()
            reader.onerror = () => reject(reader.error)
            reader.onload = (e) => {
              const dataUrl = e.target?.result
              if (typeof dataUrl !== "string") {
                reject(new Error(`Could not read ${file.name}`))
                return
              }
              const img = new Image()
              img.onerror = () => reject(new Error(`Could not load ${file.name}`))
              img.onload = () => {
                resolve({
                  id: makeId(),
                  name: file.name,
                  dataUrl,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  size: file.size,
                })
              }
              img.src = dataUrl
            }
            reader.readAsDataURL(file)
          }),
      ),
    )
      .then((imgs) => get().addImages(imgs))
      .catch((error) => {
        console.error("Failed to process images:", error)
        toast.error("One or more images couldn't be processed.")
      })
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
