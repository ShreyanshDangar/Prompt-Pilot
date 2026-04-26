import { useEffect, lazy, Suspense } from "react"
import { useGlobalStore } from "@/stores/global-store"
import { useSlashStore } from "@/features/slash-commands/slash-store"
import { useKeyboardStore } from "@/features/virtual-keyboard/keyboard-store"
import { useImageStore } from "@/stores/image-store"
import { useMusicStore } from "@/features/music-player/music-store"
import { useXmlTagsStore } from "@/features/xml-tags/xml-tags-store"
import { useSessionRestore } from "@/hooks/useSessionRestore"
import { AppShell } from "@/components/layout/AppShell"
import { Toaster } from "sonner"

const CommandPalette = lazy(() =>
  import("@/features/command-palette/CommandPalette").then((m) => ({
    default: m.CommandPalette,
  }))
)

export function App() {
  const initializeSettings = useGlobalStore((s) => s.initializeSettings)
  const initializeSlash = useSlashStore((s) => s.initialize)
  const initializeKeyboard = useKeyboardStore((s) => s.initialize)
  const initializeImages = useImageStore((s) => s.initialize)
  const initializeMusic = useMusicStore((s) => s.initialize)
  const initializeXmlTags = useXmlTagsStore((s) => s.initialize)

  useEffect(() => {
    initializeSettings()
    initializeSlash()
    initializeKeyboard()
    initializeImages()
    initializeMusic()
    initializeXmlTags()
  }, [initializeSettings, initializeSlash, initializeKeyboard, initializeImages, initializeMusic, initializeXmlTags])

  useSessionRestore()

  return (
    <>
      <AppShell />
      <Suspense fallback={null}>
        <CommandPalette />
      </Suspense>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "panel-surface text-text-primary border border-border",
        }}
      />
    </>
  )
}
