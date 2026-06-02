import { useEffect, useState, useMemo } from "react"
import { Command } from "cmdk"
import { FileText, Copy, Settings, Plus, Slash } from "lucide-react"
import { useGlobalStore } from "@/stores/global-store"
import { useEditorStore } from "@/features/editor/editor-store"
import { useSlashStore } from "@/features/slash-commands/slash-store"
import { useProjectsStore } from "@/features/projects/projects-store"
import { CenteredModal } from "@/components/modals/CenteredModal"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { toast } from "sonner"
import { BUILT_IN_COMMANDS } from "@/features/slash-commands/built-in-commands"
import { runBuiltInCommand } from "@/features/slash-commands/run-built-in-command"
import { extractVariables } from "@/features/slash-commands/variable-utils"
import { VariableFillModal } from "@/features/slash-commands/VariableFillModal"
import type { SlashCommand } from "@/features/slash-commands/slash-types"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [pendingCommand, setPendingCommand] = useState<SlashCommand | null>(null)
  const [search, setSearch] = useState("")
  const toggleSettingsPanel = useGlobalStore((s) => s.toggleSettingsPanel)
  const setActivePanel = useGlobalStore((s) => s.setActivePanel)
  const addTab = useEditorStore((s) => s.addTab)
  const getText = useEditorStore((s) => s.getText)
  const userCommands = useSlashStore((s) => s.userCommands)
  const incrementUsage = useSlashStore((s) => s.incrementUsage)
  const openCreateModal = useSlashStore((s) => s.openCreateModal)
  const openProjects = useProjectsStore((s) => s.setOpen)
  const { copy } = useCopyToClipboard()

  const commands = useMemo(
    () => [...BUILT_IN_COMMANDS, ...userCommands],
    [userCommands],
  )

  const mostUsed = useMemo(
    () =>
      commands
        .filter((c) => c.usageCount > 0)
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
    [commands],
  )

  const runSlashCommand = (cmd: SlashCommand) => {
    const handled = runBuiltInCommand(cmd.name, {
      openCreateModal,
      openTemplates: () => setActivePanel("templates"),
      openProjects: () => openProjects(true),
      showHelp: () =>
        toast.info(
          "Type / in the editor to insert a slash command, or open the gallery to manage them.",
        ),
    })
    if (handled) {
      setOpen(false)
      return
    }
    if (cmd.content) {
      if (extractVariables(cmd.content).length > 0) {
        setOpen(false)
        setPendingCommand(cmd)
        return
      }
      insertCommandContent(cmd.name, cmd.content)
    }
    setOpen(false)
  }

  const insertCommandContent = (name: string, content: string) => {
    const editor = useEditorStore.getState().editor
    if (editor) {
      editor.chain().focus().insertContent(content).run()
      incrementUsage(name)
      toast.success(`Inserted ${name}`)
    } else {
      navigator.clipboard.writeText(content).catch(() => {})
      toast.success(`${name} content copied to clipboard`)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCopy = async () => {
    const text = getText()
    if (text.trim()) {
      await copy(text, { successMessage: "Prompt copied to clipboard" })
    }
    setOpen(false)
  }

  return (
    <>
      {pendingCommand && (
        <VariableFillModal
          commandName={pendingCommand.name}
          content={pendingCommand.content}
          onResolve={(resolved) => {
            insertCommandContent(pendingCommand.name, resolved)
            setPendingCommand(null)
          }}
          onCancel={() => setPendingCommand(null)}
        />
      )}
      <CenteredModal
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Command Palette"
      >
      <Command className="flex flex-col" label="Command Palette">
        <div className="border-b border-border px-4 py-3">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="px-4 py-6 text-center text-sm text-text-muted">
            No results found.
          </Command.Empty>

          {search.trim() === "" && mostUsed.length > 0 && (
            <Command.Group
              heading="Most used"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
            >
              {mostUsed.map((cmd) => (
                <Command.Item
                  key={`recent:${cmd.name}`}
                  value={`recent:${cmd.name}`}
                  onSelect={() => runSlashCommand(cmd)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
                >
                  <Slash className="h-4 w-4 text-text-muted" />
                  <span className="flex-1">{cmd.name}</span>
                  <span className="text-xs text-text-muted">
                    used {cmd.usageCount}&times;
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group
            heading="Actions"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
          >
            <Command.Item
              onSelect={() => {
                addTab()
                setOpen(false)
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              <Plus className="h-4 w-4 text-text-muted" />
              New Tab
            </Command.Item>
            <Command.Item
              onSelect={handleCopy}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              <Copy className="h-4 w-4 text-text-muted" />
              Copy Prompt
            </Command.Item>
            <Command.Item
              onSelect={() => {
                toggleSettingsPanel()
                setOpen(false)
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              <Settings className="h-4 w-4 text-text-muted" />
              Open Settings
            </Command.Item>
          </Command.Group>

          {commands.length > 0 && (
            <Command.Group
              heading="Slash Commands"
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
            >
              {commands.map((cmd) => (
                <Command.Item
                  key={cmd.name}
                  value={`${cmd.name} ${cmd.description}`}
                  onSelect={() => runSlashCommand(cmd)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
                >
                  <Slash className="h-4 w-4 text-text-muted" />
                  <div className="flex flex-col">
                    <span>{cmd.name}</span>
                    <span className="text-xs text-text-muted">
                      {cmd.description}
                    </span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group
            heading="Navigation"
            className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
          >
            <Command.Item
              onSelect={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-primary transition-colors data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent"
            >
              <FileText className="h-4 w-4 text-text-muted" />
              Go to Editor
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
      </CenteredModal>
    </>
  )
}
