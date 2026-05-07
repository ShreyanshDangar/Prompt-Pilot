import type { Editor } from "@tiptap/react"

/**
 * Screen position for a popover anchored at the editor caret (or `anchorPos`,
 * the trigger character's position). Flips above / clamps to the viewport so
 * the popover stays on-screen. Shared by the slash-command and XML-tag
 * autocomplete popovers.
 *
 * Returns `null` when the editor view isn't ready (caller keeps its last
 * position); returns a safe fallback if coordinate lookup throws.
 */
export function getCursorPopoverPosition(
  editor: Editor,
  anchorPos: number | null,
  size: { width: number; height: number },
): { top: number; left: number } | null {
  const { view } = editor
  if (!view || !view.dom) return null
  try {
    const pos =
      anchorPos !== null
        ? Math.min(anchorPos + 1, view.state.doc.content.size)
        : view.state.selection.from
    const coords = view.coordsAtPos(pos)
    let top = coords.bottom + 4
    let left = coords.left
    if (top + size.height > window.innerHeight) {
      top = coords.top - size.height - 4
    }
    if (left + size.width > window.innerWidth) {
      left = window.innerWidth - size.width - 8
    }
    left = Math.max(8, left)
    top = Math.max(8, top)
    return { top, left }
  } catch {
    return { top: 100, left: 16 }
  }
}
