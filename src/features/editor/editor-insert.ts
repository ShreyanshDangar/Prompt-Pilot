/**
 * Converts plain text into Tiptap paragraph nodes (one paragraph per line)
 * for `editor.chain()...insertContent(nodes)`. Shared by slash-command block
 * insertion and XML-tag insertion.
 *
 * `keepEmpty: true` turns blank lines into empty paragraphs (preserving spacing);
 * the default drops blank lines.
 */
export type ParagraphNode = {
  type: "paragraph"
  content: { type: "text"; text: string }[]
}

export function textToParagraphNodes(
  text: string,
  opts?: { keepEmpty?: boolean },
): ParagraphNode[] {
  const keepEmpty = opts?.keepEmpty ?? false
  const lines = keepEmpty ? text.split("\n") : text.split("\n").filter(Boolean)
  return lines.map((line) => ({
    type: "paragraph" as const,
    content: line ? [{ type: "text" as const, text: line }] : [],
  }))
}
