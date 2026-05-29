import type { Fragment, Node as ProseMirrorNode, Slice } from "@tiptap/pm/model"

function applyMarks(text: string, node: ProseMirrorNode): string {
  let out = text
  for (const mark of node.marks) {
    switch (mark.type.name) {
      case "code":
        out = "`" + out + "`"
        break
      case "bold":
        out = "**" + out + "**"
        break
      case "italic":
        out = "*" + out + "*"
        break
      case "strike":
        out = "~~" + out + "~~"
        break
      default:
        break
    }
  }
  return out
}

function inlineText(node: ProseMirrorNode): string {
  let out = ""
  node.forEach((child) => {
    if (child.isText) {
      out += applyMarks(child.text ?? "", child)
    } else if (child.type.name === "hardBreak") {
      out += "\n"
    } else if (child.isInline) {
      out += inlineText(child)
    } else {
      out += blockText(child)
    }
  })
  return out
}

function listText(node: ProseMirrorNode, ordered: boolean): string {
  const lines: string[] = []
  let index = 1
  node.forEach((item) => {
    const marker = ordered ? `${index}. ` : "- "
    const itemLines = blocksText(item.content).split("\n")
    lines.push(marker + (itemLines[0] ?? ""))
    for (let i = 1; i < itemLines.length; i++) {
      lines.push("  " + itemLines[i])
    }
    index += 1
  })
  return lines.join("\n")
}

function blockText(node: ProseMirrorNode): string {
  switch (node.type.name) {
    case "heading": {
      const level = typeof node.attrs.level === "number" ? node.attrs.level : 1
      return "#".repeat(level) + " " + inlineText(node)
    }
    case "bulletList":
      return listText(node, false)
    case "orderedList":
      return listText(node, true)
    case "blockquote":
      return blocksText(node.content)
        .split("\n")
        .map((line) => (line.length > 0 ? "> " + line : ">"))
        .join("\n")
    case "codeBlock":
      return "```\n" + node.textContent + "\n```"
    case "horizontalRule":
      return "---"
    default:
      return inlineText(node)
  }
}

function blocksText(fragment: Fragment): string {
  const blocks: string[] = []
  fragment.forEach((node) => {
    blocks.push(blockText(node))
  })
  return blocks.join("\n\n")
}

export function serializeSliceToMarkdown(slice: Slice): string {
  return blocksText(slice.content)
}
