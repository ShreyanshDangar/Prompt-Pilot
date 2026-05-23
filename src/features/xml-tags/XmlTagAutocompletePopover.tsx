import { useCallback, forwardRef, useImperativeHandle } from "react"
import { Tag } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { useXmlTagsStore } from "./xml-tags-store"
import {
  useEditorAutocomplete,
  type PopoverRange,
} from "@/features/editor/useEditorAutocomplete"
import { EditorAutocompletePopover } from "@/features/editor/EditorAutocompletePopover"
import type { XmlTag } from "./xml-tag-data"

interface XmlTagAutocompletePopoverProps {
  editor: Editor
}

export const XmlTagAutocompletePopover = forwardRef<
  { handleKeyDown: (e: KeyboardEvent) => boolean },
  XmlTagAutocompletePopoverProps
>(function XmlTagAutocompletePopoverInner({ editor }, ref) {
  const searchTags = useXmlTagsStore((s) => s.searchTags)

  const insertTag = useCallback(
    (tag: XmlTag, range: PopoverRange) => {
      const openTag = `<${tag.name}>`
      const closeTag = `</${tag.name}>`
      const fullText = openTag + closeTag

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([{ type: "text", text: fullText }])
        .setTextSelection(range.from + openTag.length)
        .run()
    },
    [editor]
  )

  const autocomplete = useEditorAutocomplete<XmlTag>({
    editor,
    triggerKey: "<",
    isQueryChar: (e) =>
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      /[a-zA-Z0-9_-]/.test(e.key),
    closeKeys: [" ", ">"],
    acceptKeys: ["Enter", "Tab"],
    search: (query) => searchTags(query).slice(0, 30),
    onAccept: insertTag,
  })

  useImperativeHandle(ref, () => ({ handleKeyDown: autocomplete.handleKeyDown }))

  return (
    <EditorAutocompletePopover<XmlTag>
      isOpen={autocomplete.isOpen}
      dataPopover="xml-tag"
      icon={<Tag className="h-3.5 w-3.5 text-accent" />}
      headerText={autocomplete.query ? `<${autocomplete.query}` : "Type an XML tag name..."}
      items={autocomplete.results}
      getItemKey={(tag) => tag.id}
      renderItem={(tag) => (
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">
              {`<${tag.name}>`}
            </span>
            <span className="rounded bg-bg-primary px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
              {tag.category}
            </span>
          </div>
          <span className="text-xs text-text-muted">{tag.description}</span>
        </div>
      )}
      selectedIndex={autocomplete.selectedIndex}
      position={autocomplete.position}
      emptyText="No tags found"
      onSelect={autocomplete.accept}
      onHover={autocomplete.setSelectedIndex}
      onClose={autocomplete.close}
    />
  )
})
