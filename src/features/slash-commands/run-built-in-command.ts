/**
 * Centralises the routing of the built-in slash commands so the command palette
 * and the in-editor slash popover share one mapping.
 *
 * Each command is routed only when the caller supplies a handler for it, and the
 * function returns `true` only when it both matched a built-in *and* ran a
 * handler — letting the caller stop. Callers that omit a handler get `false`,
 * preserving their own fallback (the popover omits `showHelp`, so `/help` still
 * falls through to inserting its guide content there, exactly as before).
 */
export interface BuiltInCommandHandlers {
  openCreateModal?: () => void
  openTemplates?: () => void
  openProjects?: () => void
  showHelp?: () => void
}

export function runBuiltInCommand(
  name: string,
  handlers: BuiltInCommandHandlers,
): boolean {
  switch (name) {
    case "/create":
      if (!handlers.openCreateModal) return false
      handlers.openCreateModal()
      return true
    case "/templates":
      if (!handlers.openTemplates) return false
      handlers.openTemplates()
      return true
    case "/projects":
      if (!handlers.openProjects) return false
      handlers.openProjects()
      return true
    case "/help":
      if (!handlers.showHelp) return false
      handlers.showHelp()
      return true
    default:
      return false
  }
}
