import { describe, it, expect } from "vitest"
import { textToParagraphNodes } from "./editor-insert"

describe("textToParagraphNodes", () => {
  it("produces one paragraph per line", () => {
    expect(textToParagraphNodes("a\nb")).toEqual([
      { type: "paragraph", content: [{ type: "text", text: "a" }] },
      { type: "paragraph", content: [{ type: "text", text: "b" }] },
    ])
  })

  it("drops blank lines by default (keepEmpty false)", () => {
    const nodes = textToParagraphNodes("a\n\nb")
    expect(nodes).toHaveLength(2)
    expect(nodes.map((n) => n.content[0]?.text)).toEqual(["a", "b"])
  })

  it("preserves blank lines as empty paragraphs when keepEmpty is true", () => {
    const nodes = textToParagraphNodes("a\n\nb", { keepEmpty: true })
    expect(nodes).toHaveLength(3)
    expect(nodes[1]).toEqual({ type: "paragraph", content: [] })
  })
})
