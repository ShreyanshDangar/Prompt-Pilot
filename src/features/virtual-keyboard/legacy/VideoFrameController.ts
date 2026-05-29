// Legacy keyboard — consumed only by LegacyKeyboard.tsx
import { loadThemeVideoSrc } from "@/lib/theme/theme-video"

interface SubscriberEntry {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback: (cb: () => void) => number
  cancelVideoFrameCallback: (id: number) => void
}

export type KeySizeCategory = "small" | "medium" | "space"

class VideoFrameController {
  private video: HTMLVideoElement
  private subscribers = new Map<CanvasRenderingContext2D, SubscriberEntry>()
  private animationFrameId: number | null = null
  private videoFrameCallbackId: number | null = null
  private isPlaying = false
  private offscreen: OffscreenCanvas | null = null
  private offscreenCtx: OffscreenCanvasRenderingContext2D | null = null
  private currentSrc: string | null = null
  private useVideoFrameCallback: boolean
  private lastFrameTime = 0
  // Throttle RAF to ~30fps (33ms) to reduce CPU while maintaining smooth visuals
  private readonly frameInterval = 33

  private readonly zoomScale = 1.2

  constructor() {
    this.video = document.createElement("video")
    this.video.muted = true
    this.video.playsInline = true
    this.video.preload = "auto"
    this.video.setAttribute("playsinline", "")

    this.useVideoFrameCallback = "requestVideoFrameCallback" in HTMLVideoElement.prototype

    // Use 'ended' event for seamless looping instead of polling timeupdate
    this.video.addEventListener("ended", this.handleEnded)
    document.addEventListener("visibilitychange", this.handleVisibility)

    try {
      this.offscreen = new OffscreenCanvas(320, 240)
      this.offscreenCtx = this.offscreen.getContext("2d", {
        alpha: false,
        desynchronized: true,
      }) as OffscreenCanvasRenderingContext2D | null
    } catch {
      this.offscreen = null
      this.offscreenCtx = null
    }
  }

  private handleEnded = () => {
    this.video.currentTime = 0
    this.video.play().catch(() => {})
  }

  private handleVisibility = () => {
    if (document.hidden) {
      this.pauseInternal()
    } else if (this.subscribers.size > 0 && this.currentSrc) {
      this.playInternal()
    }
  }

  public setSource(src: string | null) {
    if (!src) {
      this.pauseInternal()
      this.video.removeAttribute("src")
      this.video.load()
      this.currentSrc = null
      return
    }

    if (this.currentSrc === src) return
    this.currentSrc = src

    loadThemeVideoSrc(src)
      .then((objectUrl) => {
        if (this.currentSrc !== src) return
        this.video.src = objectUrl
        this.video.load()
        if (this.subscribers.size > 0) {
          this.playInternal()
        }
      })
      .catch(() => {})
  }

  public subscribe(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    this.subscribers.set(ctx, { ctx, width, height })

    if (this.subscribers.size === 1 && this.currentSrc) {
      this.playInternal()
    }
  }

  public unsubscribe(ctx: CanvasRenderingContext2D) {
    this.subscribers.delete(ctx)
    if (this.subscribers.size === 0) {
      this.pauseInternal()
    }
  }

  private playInternal() {
    if (this.isPlaying) return
    this.isPlaying = true

    this.video.play().catch(() => {})

    if (this.useVideoFrameCallback) {
      this.scheduleVideoFrameCallback()
    } else {
      this.scheduleRAF()
    }
  }

  private pauseInternal() {
    if (!this.isPlaying) return
    this.isPlaying = false
    this.video.pause()

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.videoFrameCallbackId !== null && this.useVideoFrameCallback) {
      try {
        (this.video as VideoWithFrameCallback).cancelVideoFrameCallback(this.videoFrameCallbackId)
      } catch { /* */ }
      this.videoFrameCallbackId = null
    }
  }

  private scheduleVideoFrameCallback() {
    if (!this.isPlaying) return
    this.videoFrameCallbackId = (this.video as VideoWithFrameCallback).requestVideoFrameCallback(
      () => {
        this.distributeFrame()
        this.scheduleVideoFrameCallback()
      }
    )
  }

  private scheduleRAF() {
    if (!this.isPlaying) return
    this.animationFrameId = requestAnimationFrame(this.rafLoop)
  }

  private rafLoop = (timestamp: number) => {
    if (!this.isPlaying) return
    // Throttle to ~30fps when using RAF fallback
    if (timestamp - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = timestamp
      this.distributeFrame()
    }
    this.animationFrameId = requestAnimationFrame(this.rafLoop)
  }

  private distributeFrame() {
    if (this.video.readyState < 2) return
    if (this.subscribers.size === 0) return

    const vw = this.video.videoWidth
    const vh = this.video.videoHeight
    if (vw === 0 || vh === 0) return

    const source = (this.offscreenCtx && this.offscreen) ? this.getBufferedFrame(vw, vh) : this.video

    this.subscribers.forEach((entry) => {
      const { ctx, width, height } = entry
      const sw = width * this.zoomScale
      const sh = height * this.zoomScale
      const ox = (width - sw) / 2
      const oy = (height - sh) / 2
      ctx.drawImage(source, ox, oy, sw, sh)
    })
  }

  private getBufferedFrame(vw: number, vh: number): OffscreenCanvas {
    if (this.offscreen!.width !== vw || this.offscreen!.height !== vh) {
      this.offscreen!.width = vw
      this.offscreen!.height = vh
    }
    this.offscreenCtx!.drawImage(this.video, 0, 0, vw, vh)
    return this.offscreen!
  }

  public destroy() {
    this.pauseInternal()
    this.video.removeEventListener("ended", this.handleEnded)
    document.removeEventListener("visibilitychange", this.handleVisibility)
    this.subscribers.clear()
    this.video.removeAttribute("src")
    this.video.load()
  }
}

const controllers: Record<KeySizeCategory, VideoFrameController> = {
  small: new VideoFrameController(),
  medium: new VideoFrameController(),
  space: new VideoFrameController(),
}

export function getKeyController(size: KeySizeCategory): VideoFrameController {
  return controllers[size]
}
