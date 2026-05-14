import { useEffect, useState, useMemo } from "react"
import { Command } from "cmdk"
import { FileText, Copy, Settings, Plus, Slash } from "lucide-react"
import { useGlobalStore } from "@/stores/global-store"
import { useEditorStore } from "@/features/editor/editor-store"
import { useSlashStore } from "@/features/slash-commands/slash-store"
import { useProjectsStore } from "@/features/projects/projects-store"
import { CenteredModal } from "@/components/modals/CenteredModal"
import { toast } from "sonner"
import { BUILT_IN_COMMANDS } from "@/features/slash-commands/built-in-commands"
import type { SlashCommand } from "@/features/slash-commands/slash-types"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const toggleSettingsPanel = useGlobalStore((s) => s.toggleSettingsPanel)
  const setActivePanel = useGlobalStore((s) => s.setActivePanel)
  const addTab = useEditorStore((s) => s.addTab)
  const getText = useEditorStore((s) => s.getText)
  const userCommands = useSlashStore((s) => s.userCommands)
  const incrementUsage = useSlashStore((s) => s.incrementUsage)
  const openCreateModal = useSlashStore((s) => s.openCreateModal)
  const openProjects = useProjectsStore((s) => s.setOpen)

  const commands = useMemo(
    () => [...BUILT_IN_COMMANDS, ...userCommands],
    [userCommands],
  )

  const runSlashCommand = (cmd: SlashCommand) => {
    if (cmd.name === "/create") {
      openCreateModal()
      setOpen(false)
      return
    }
    if (cmd.name === "/templates") {
      setActivePanel("templates")
      setOpen(false)
      return
    }
    if (cmd.name === "/projects") {
      openProjects(true)
      setOpen(false)
      return
    }
    if (cmd.name === "/help") {
      toast.info(
        "Type / in the editor to insert a slash command, or open the gallery to manage them.",
      )
      setOpen(false)
      return
    }
    if (cmd.content) {
      const editor = useEditorStore.getState().editor
      if (editor) {
        editor.chain().focus().insertContent(cmd.content).run()
        incrementUsage(cmd.name)
        toast.success(`Inserted ${cmd.name}`)
      } else {
        navigator.clipboard.writeText(cmd.content).catch(() => {})
        toast.success(`${cmd.name} content copied to clipboard`)
      }
    }
    setOpen(false)
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
      await navigator.clipboard.writeText(text)
      toast.success("Prompt copied to clipboard")
    }
    setOpen(false)
  }

  return (
    <CenteredModal
      open={open}
      onClose={() => setOpen(false)}
      ariaLabel="Command Palette"
    >
      <Command className="flex flex-col" label="Command Palette">
        <div className="border-b border-border px-4 py-3">
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="px-4 py-6 text-center text-sm text-text-muted">
            No results found.
          </Command.Empty>

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
  )
}
