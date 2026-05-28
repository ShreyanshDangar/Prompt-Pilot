export const SIDEBAR_WIDTH = 224
const RIGHT_PANEL_WIDTH_XL = 320
const MIN_EDITOR_WIDTH = 480
const PANEL_INLINE_BREAKPOINT = 1024
const RIGHT_PANEL_WIDE_BREAKPOINT = 1280
const LEFT_PANEL_DEFAULT_OPEN_MIN = Math.max(
  PANEL_INLINE_BREAKPOINT,
  SIDEBAR_WIDTH + MIN_EDITOR_WIDTH,
)

const RIGHT_PANEL_DEFAULT_OPEN_MIN = Math.max(
  RIGHT_PANEL_WIDE_BREAKPOINT,
  SIDEBAR_WIDTH + RIGHT_PANEL_WIDTH_XL + MIN_EDITOR_WIDTH,
)

export function shouldDefaultOpenLeftPanel(viewportWidth: number): boolean {
  return viewportWidth >= LEFT_PANEL_DEFAULT_OPEN_MIN
}

export function shouldDefaultOpenRightPanel(viewportWidth: number): boolean {
  return viewportWidth >= RIGHT_PANEL_DEFAULT_OPEN_MIN
}
