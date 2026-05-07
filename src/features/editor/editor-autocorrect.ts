import type { Editor as TiptapEditor } from "@tiptap/react"
import type { AutoCorrectRule } from "@/stores/global-store"

/**
 * Looks at the word just typed before the caret and, if it matches an
 * auto-correct rule, replaces it in place. Called from the editor's
 * `onUpdate` when auto-correct is enabled. No-op when nothing matches.
 */
export function applyAutoCorrect(
  editor: TiptapEditor,
  rules: AutoCorrectRule[],
): void {
  if (rules.length === 0) return

  const { from } = editor.state.selection
  if (from < 2) return

  const textBefore = editor.state.doc.textBetween(
    Math.max(0, from - 50),
    from,
    "￼",
  )
  const lastChar = textBefore.slice(-1)
  if (!/[\s,.;:!?)\]]/.test(lastChar)) return

  const beforeTrigger = textBefore.slice(0, -1)
  const words = beforeTrigger.split(/[\s,.;:!?)\]]+/)
  const prevWord = words.pop() ?? ""
  if (prevWord.length < 2) return

  const rule = rules.find((r) => r.from === prevWord.toLowerCase())
  if (!rule || rule.to === prevWord) return

  const wordStart = from - 1 - prevWord.length
  const wordEnd = from - 1
  const lengthDiff = rule.to.length - prevWord.length
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.insertText(rule.to, wordStart, wordEnd)
      return true
    })
    .setTextSelection(from + lengthDiff)
    .run()
}
