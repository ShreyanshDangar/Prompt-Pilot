import type { Editor as TiptapEditor } from "@tiptap/react"
import type { AutoCorrectRule } from "@/stores/global-store"

function matchCase(source: string, target: string): string {
  if (source.length === 0) return target
  const isAllCaps =
    source.length > 1 &&
    source === source.toUpperCase() &&
    source !== source.toLowerCase()
  if (isAllCaps) return target.toUpperCase()
  const first = source[0]
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1)
  }
  return target
}

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
  if (!rule) return
  const replacement = matchCase(prevWord, rule.to)
  if (replacement === prevWord) return

  const wordStart = from - 1 - prevWord.length
  const wordEnd = from - 1
  const lengthDiff = replacement.length - prevWord.length
  editor
    .chain()
    .focus()
    .command(({ tr }) => {
      tr.insertText(replacement, wordStart, wordEnd)
      return true
    })
    .setTextSelection(from + lengthDiff)
    .run()
}
