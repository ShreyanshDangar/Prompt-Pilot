// Theme video path resolution + blob-URL cache. Playback controllers live in
// components/ThemeVideo.tsx and
// features/virtual-keyboard/legacy/VideoFrameController.ts.
import { THEME_FOLDER_MAP } from "./theme-registry"

export type ThemeVideoSlot =
  | "left-panel"
  | "keyboard-keys"
  | "keyboard-bg"
  | "right-panel"
  | "editor"
  | "small-key-bg"
  | "medium-key-bg"
  | "space-key-bg"

export function getThemeVideoPath(
  theme: string,
  slot: ThemeVideoSlot,
): string | null {
  const folder = THEME_FOLDER_MAP[theme]
  if (!folder) return null
  return `/assets/themes/videos/${folder}/${slot}.mp4`
}

const objectUrlCache = new Map<string, Promise<string>>()

export function loadThemeVideoSrc(path: string): Promise<string> {
  const cached = objectUrlCache.get(path)
  if (cached) return cached
  const promise = fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
      return res.blob()
    })
    .then((blob) => URL.createObjectURL(blob))
    .catch((err) => {
      objectUrlCache.delete(path)
      throw err
    })
  objectUrlCache.set(path, promise)
  return promise
}
