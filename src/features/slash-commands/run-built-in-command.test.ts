import { describe, it, expect, vi } from "vitest"
import { runBuiltInCommand } from "./run-built-in-command"

describe("runBuiltInCommand", () => {
  it("routes each built-in to its handler and returns true", () => {
    const openCreateModal = vi.fn()
    const openTemplates = vi.fn()
    const openProjects = vi.fn()
    const showHelp = vi.fn()
    const handlers = { openCreateModal, openTemplates, openProjects, showHelp }

    expect(runBuiltInCommand("/create", handlers)).toBe(true)
    expect(runBuiltInCommand("/templates", handlers)).toBe(true)
    expect(runBuiltInCommand("/projects", handlers)).toBe(true)
    expect(runBuiltInCommand("/help", handlers)).toBe(true)

    expect(openCreateModal).toHaveBeenCalledTimes(1)
    expect(openTemplates).toHaveBeenCalledTimes(1)
    expect(openProjects).toHaveBeenCalledTimes(1)
    expect(showHelp).toHaveBeenCalledTimes(1)
  })

  it("returns false for unknown / user commands", () => {
    expect(runBuiltInCommand("/mycommand", { openCreateModal: vi.fn() })).toBe(
      false,
    )
  })

  it("returns false when the matching handler is omitted", () => {
    // The in-editor popover deliberately omits showHelp, so /help falls through
    // to its content insertion there (parity with the previous behaviour).
    expect(runBuiltInCommand("/help", { openCreateModal: vi.fn() })).toBe(false)
  })
})
