import { useRef, useEffect, useState, memo } from "react"
import { useGlobalStore } from "@/stores/global-store"
import { getThemeVideoPath, loadThemeVideoSrc, type ThemeVideoSlot } from "@/lib/theme-video-manager"

interface ThemeVideoProps {
  slot: ThemeVideoSlot
  className?: string
}

export const ThemeVideo = memo(function ThemeVideo({ slot, className = "" }: ThemeVideoProps) {
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoPath = getThemeVideoPath(websiteTheme, slot)
  const [loaded, setLoaded] = useState<{ path: string; url: string } | null>(
    null,
  )
  const isVisibleRef = useRef(false)

  useEffect(() => {
    if (!videoPath) return
    let cancelled = false
    loadThemeVideoSrc(videoPath)
      .then((url) => {
        if (!cancelled) setLoaded({ path: videoPath, url })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [videoPath])

  const objectUrl = loaded?.path === videoPath ? loaded.url : null

  useEffect(() => {
    const video = videoRef.current
    if (!video || !objectUrl) return

    video.playbackRate = 1
    video.load()

    const handleEnded = () => {
      video.currentTime = 0
      video.play().catch(() => {})
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting
        if (entry.isIntersecting && !document.hidden) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.1 }
    )

    video.addEventListener("ended", handleEnded)
    observer.observe(video)

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause()
      } else if (isVisibleRef.current) {
        video.play().catch(() => {})
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      video.removeEventListener("ended", handleEnded)
      document.removeEventListener("visibilitychange", handleVisibility)
      observer.disconnect()
      video.pause()
    }
  }, [objectUrl])

  if (!videoPath || !objectUrl || websiteTheme === "default") return null

  return (
    <video
      ref={videoRef}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
      src={objectUrl}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  )
})
