import { useCallback, useEffect, useRef, useState } from "react";
import { useMinViewport } from "@/hooks/useMinViewport";

const MAX_RESIZE_FACTOR = 1.4;
const MIN_RESIZE_FACTOR = 1.0;
const RESIZE_MIN_VIEWPORT_W = 1920;
const RESIZE_MIN_VIEWPORT_H = 1080;

function applyScaleToPanel(panel: HTMLDivElement, sx: number, sy: number) {
  panel.style.transform = `scale(${sx}, ${sy})`;
  panel.style.transformOrigin = "bottom right";
  panel.style.setProperty("--player-scale", String(sx));
}

/**
 * Owns the pointer-drag scale harness for the expanded music player panel.
 * The panel ref is created by the caller and attached to the panel element;
 * the default (unscaled) size is measured on mount via getBoundingClientRect,
 * and the resize handles are only meaningfully active once both exist.
 */
export function useMusicPlayerResize(panelRef: React.RefObject<HTMLDivElement | null>): {
  canResize: boolean;
  panelStyle: React.CSSProperties;
  resizeHandles: React.ReactElement | null;
} {
  const defaultSizeRef = useRef<{ w: number; h: number } | null>(null);
  const dragStateRef = useRef<{
    axis: "x" | "y" | "xy";
    startX: number;
    startY: number;
    startScaleX: number;
    startScaleY: number;
    rafId: number | null;
    abort: AbortController;
  } | null>(null);
  const [committedScale, setCommittedScale] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canResize = useMinViewport(
    RESIZE_MIN_VIEWPORT_W,
    RESIZE_MIN_VIEWPORT_H,
  );

  useEffect(() => {
    if (defaultSizeRef.current) return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    defaultSizeRef.current = { w: rect.width, h: rect.height };
  }, [panelRef]);

  const onResizePointerMove = useCallback((e: PointerEvent) => {
    const drag = dragStateRef.current;
    const panel = panelRef.current;
    const defaults = defaultSizeRef.current;
    if (!drag || !panel || !defaults) return;
    if (drag.rafId !== null) return;
    drag.rafId = window.requestAnimationFrame(() => {
      drag.rafId = null;
      const dx = drag.axis === "y" ? 0 : e.clientX - drag.startX;
      const dy = drag.axis === "x" ? 0 : e.clientY - drag.startY;
      const nextSx = Math.min(
        MAX_RESIZE_FACTOR,
        Math.max(MIN_RESIZE_FACTOR, drag.startScaleX + dx / defaults.w),
      );
      const nextSy = Math.min(
        MAX_RESIZE_FACTOR,
        Math.max(MIN_RESIZE_FACTOR, drag.startScaleY + dy / defaults.h),
      );
      applyScaleToPanel(panel, nextSx, nextSy);
    });
  }, [panelRef]);

  const onResizePointerUp = useCallback(() => {
    const drag = dragStateRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    if (drag.rafId !== null) window.cancelAnimationFrame(drag.rafId);
    drag.abort.abort();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
    const finalSx = matrix.a || 1;
    const finalSy = matrix.d || 1;
    setCommittedScale({ x: finalSx, y: finalSy });
    dragStateRef.current = null;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, [panelRef]);

  const startResize = (axis: "x" | "y" | "xy") => (e: React.PointerEvent) => {
    if (!canResize) return;
    const panel = panelRef.current;
    const defaults = defaultSizeRef.current;
    if (!panel || !defaults) return;
    e.preventDefault();
    const startSx = committedScale?.x ?? 1;
    const startSy = committedScale?.y ?? 1;
    const abort = new AbortController();
    dragStateRef.current = {
      axis,
      startX: e.clientX,
      startY: e.clientY,
      startScaleX: startSx,
      startScaleY: startSy,
      rafId: null,
      abort,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      axis === "x" ? "ew-resize" : axis === "y" ? "ns-resize" : "nwse-resize";
    window.addEventListener("pointermove", onResizePointerMove, {
      signal: abort.signal,
    });
    window.addEventListener("pointerup", onResizePointerUp, {
      signal: abort.signal,
    });
  };

  const panelStyle: React.CSSProperties = {};
  if (canResize && committedScale) {
    panelStyle.transform = `scale(${committedScale.x}, ${committedScale.y})`;
    panelStyle.transformOrigin = "bottom right";
    (panelStyle as React.CSSProperties & Record<string, string>)[
      "--player-scale"
    ] = String(committedScale.x);
  }

  const resizeHandles = canResize ? (
    <>
      <div
        onPointerDown={startResize("x")}
        className="absolute right-0 top-0 z-20 h-full w-2"
        style={{ cursor: "ew-resize" }}
        aria-label="Resize width"
        role="separator"
      />
      <div
        onPointerDown={startResize("y")}
        className="absolute bottom-0 left-0 z-20 h-2 w-full"
        style={{ cursor: "ns-resize" }}
        aria-label="Resize height"
        role="separator"
      />
      <div
        onPointerDown={startResize("xy")}
        className="absolute bottom-0 right-0 z-20 h-4 w-4"
        style={{ cursor: "nwse-resize" }}
        aria-label="Resize"
        role="separator"
      />
    </>
  ) : null;

  return { canResize, panelStyle, resizeHandles };
}
