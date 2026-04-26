import { Search, Settings, Music, PanelLeftClose, PanelLeftOpen, PanelRight } from "lucide-react"
import { motion } from "framer-motion"
import { useGlobalStore } from "@/stores/global-store"
import { useMusicStore } from "@/features/music-player/music-store"
import { APP_NAME } from "@/lib/constants"
import { detectPhysicalPlatform } from "@/features/virtual-keyboard/platform-utils"

const IS_MAC_PLATFORM = detectPhysicalPlatform() === "mac"

export function Navbar() {
  const sidebarOpen = useGlobalStore((s) => s.sidebarOpen)
  const toggleSidebar = useGlobalStore((s) => s.toggleSidebar)
  const toggleSettingsPanel = useGlobalStore((s) => s.toggleSettingsPanel)
  const musicActivated = useMusicStore((s) => s.isActivated)
  const setMusicActivated = useMusicStore((s) => s.setActivated)
  const musicView = useMusicStore((s) => s.view)
  const setMusicView = useMusicStore((s) => s.setView)
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)
  const rightPanelOpen = useGlobalStore((s) => s.rightPanelOpen)
  const toggleRightPanel = useGlobalStore((s) => s.toggleRightPanel)

  const isThemed = websiteTheme !== "default"
  const glassClass = isThemed ? "glass-panel" : ""

  const openCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true })
    )
  }

  const handleMusicClick = () => {
    if (!musicActivated) {
      setMusicActivated()
      setMusicView("collapsed")
      return
    }
    if (musicView === "closed" || musicView === "iconified") {
      setMusicView("collapsed")
    } else {
      setMusicView("iconified")
    }
  }
  return (
    <header className={`flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-primary px-4 ${glassClass}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-text-secondary" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-text-secondary" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 32 32"
            className="text-accent"
            style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}

          >
            <rect width="32" height="32" rx="8" fill="currentColor" />
            <path
              d="M8 12 L16 8 L24 12 L16 16 Z"
              fill="white"
              opacity="0.95"
            />
            <path
              d="M8 16 L16 20 L24 16"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.75"
            />
            <path
              d="M8 20 L16 24 L24 20"
              stroke="white"
              strokeWidth="2"
              fill="none"
              opacity="0.55"
            />
          </svg>
          <span className="hidden text-sm font-semibold text-text-primary sm:inline">
            {APP_NAME}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={openCommandPalette}
          className="flex h-9 items-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary px-3 text-sm text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-secondary"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search...</span>
          <kbd
            className="hidden h-7 select-none items-center gap-1.5 rounded-md border border-border bg-bg-primary px-2 font-sans text-xs font-medium leading-none text-text-secondary shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)] md:inline-flex"
            aria-label={IS_MAC_PLATFORM ? "Command K" : "Control K"}
          >
            {IS_MAC_PLATFORM ? (
              <span
                aria-hidden="true"
                className="font-sans text-[16px] leading-none antialiased"
              >
                {"⌘"}
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="text-[12px] leading-none tracking-tight"
              >
                Ctrl
              </span>
            )}
            <span
              aria-hidden="true"
              className="text-[12px] font-semibold leading-none"
            >
              K
            </span>
          </kbd>
        </button>
                <motion.button
          onClick={toggleRightPanel}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary ${
            rightPanelOpen ? "text-accent" : ""
          }`}
          aria-label={rightPanelOpen ? "Hide right panel" : "Show right panel"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PanelRight className={`h-5 w-5 ${rightPanelOpen ? "text-accent" : "text-text-secondary"}`} />
        </motion.button>
        <button
          onClick={handleMusicClick}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary ${
            musicActivated && musicView !== "closed" ? "text-accent" : ""
          }`}
          aria-label="Toggle music player"
        >
          <Music className={`h-5 w-5 ${musicActivated && musicView !== "closed" ? "text-accent" : "text-text-secondary"}`} />
        </button>
        <button
          onClick={toggleSettingsPanel}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5 text-text-secondary" />
        </button>
      </div>
    </header>
  )
}
