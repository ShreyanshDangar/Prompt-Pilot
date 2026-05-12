// Legacy keyboard — consumed only by LegacyKeyboard.tsx
import { useEffect, useRef } from "react"
import { getKeyController } from "./VideoFrameController"
import type { KeySizeCategory } from "./VideoFrameController"

export function useCanvasVideo(
  videoPath: string | null,
  sizeCategory: KeySizeCategory = "small"
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !videoPath) return

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })

    if (ctx) {
      const controller = getKeyController(sizeCategory)
      controller.subscribe(ctx)

      return () => {
        controller.unsubscribe(ctx)
      }
    }
  }, [videoPath, sizeCategory])

  return canvasRef
}
