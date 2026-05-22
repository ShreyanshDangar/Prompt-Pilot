import { useCallback, useState, forwardRef, useImperativeHandle } from "react"
import { Slash } from "lucide-react"
import type { Editor } from "@tiptap/react"
import { useSlashStore } from "./slash-store"
import { VariableFillModal } from "./VariableFillModal"
import { extractVariables } from "./variable-utils"
import { runBuiltInCommand } from "./run-built-in-command"
import { useGlobalStore } from "@/stores/global-store"
import { useProjectsStore } from "@/features/projects/projects-store"
import { textToParagraphNodes } from "@/features/editor/editor-insert"
import {
  useEditorAutocomplete,
  type PopoverRange,
} from "@/features/editor/useEditorAutocomplete"
import { EditorAutocompletePopover } from "@/features/editor/EditorAutocompletePopover"
import type { SlashCommand } from "./slash-types"

interface SlashCommandPopoverProps {
  editor: Editor
}

export const SlashCommandPopover = forwardRef<
  { handleKeyDown: (e: KeyboardEvent) => boolean },
  SlashCommandPopoverProps
>(function SlashCommandPopoverInner({ editor }, ref) {
  const [pendingCommand, setPendingCommand] = useState<SlashCommand | null>(null)
  const [deleteRange, setDeleteRange] = useState<{ from: number; to: number } | null>(null)
  const searchCommands = useSlashStore((s) => s.searchCommands)
  const incrementUsage = useSlashStore((s) => s.incrementUsage)
  const openCreateModal = useSlashStore((s) => s.openCreateModal)
  const slashInsertionMode = useGlobalStore((s) => s.settings.slashInsertionMode)

  const insertCommand = useCallback(
    (command: SlashCommand, range: PopoverRange) => {
      // /help intentionally has no handler here, so it falls through to the
      // content insertion below (the command palette routes /help to a toast).
      const handled = runBuiltInCommand(command.name, {
        openCreateModal: () => {
          editor.chain().focus().deleteRange(range).run()
          openCreateModal()
        },
        openTemplates: () => {
          editor.chain().focus().deleteRange(range).run()
          useGlobalStore.getState().setActivePanel("templates")
        },
        openProjects: () => {
          editor.chain().focus().deleteRange(range).run()
          useProjectsStore.getState().setOpen(true)
        },
      })
      if (handled) return

      if (command.content) {
        const variables = extractVariables(command.content)
        if (variables.length > 0) {
          setDeleteRange(range)
          setPendingCommand(command)
          return
        }

        const chain = editor.chain().focus().deleteRange(range)

        if (slashInsertionMode === "block") {
          chain.insertContent(textToParagraphNodes(command.content))
        } else {
          chain.insertContent(command.content)
        }

        chain.run()
        incrementUsage(command.name)
      }
    },
    [editor, incrementUsage, openCreateModal, slashInsertionMode]
  )

  const autocomplete = useEditorAutocomplete<SlashCommand>({
    editor,
    triggerKey: "/",
    isQueryChar: (e) => e.key.length === 1 && !e.ctrlKey && !e.metaKey,
    closeKeys: [" "],
    acceptKeys: ["Enter"],
    search: searchCommands,
    onAccept: insertCommand,
  })

  const handleVariableResolve = useCallback(
    (resolved: string) => {
      if (deleteRange) {
        editor
          .chain()
          .focus()
          .deleteRange(deleteRange)
          .insertContent(resolved)
          .run()
      } else {
        editor.chain().focus().insertContent(resolved).run()
      }
      if (pendingCommand) {
        incrementUsage(pendingCommand.name)
      }
      setPendingCommand(null)
      setDeleteRange(null)
    },
    [editor, deleteRange, pendingCommand, incrementUsage]
  )

  useImperativeHandle(ref, () => ({ handleKeyDown: autocomplete.handleKeyDown }))

  return (
    <>
      <EditorAutocompletePopover<SlashCommand>
        isOpen={autocomplete.isOpen}
        dataPopover="slash"
        icon={<Slash className="h-3.5 w-3.5 text-accent" />}
        headerText={autocomplete.query ? `/${autocomplete.query}` : "Type to filter commands..."}
        items={autocomplete.results}
        getItemKey={(command) => command.name}
        renderItem={(command) => (
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{command.name}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  command.category === "built-in"
                    ? "bg-accent/20 text-accent"
                    : "bg-bg-primary text-text-muted"
                }`}
              >
                {command.category}
              </span>
            </div>
            <span className="text-xs text-text-muted">{command.description}</span>
          </div>
        )}
        selectedIndex={autocomplete.selectedIndex}
        position={autocomplete.position}
        emptyText="No commands found"
        onSelect={autocomplete.accept}
        onHover={autocomplete.setSelectedIndex}
        onClose={autocomplete.close}
      />
      {pendingCommand && (
        <VariableFillModal
          commandName={pendingCommand.name}
          content={pendingCommand.content}
          onResolve={handleVariableResolve}
          onCancel={() => {
            setPendingCommand(null)
            setDeleteRange(null)
          }}
        />
      )}
    </>
  )
})
