import type { SlashCommand } from "./slash-types"

export const BUILT_IN_COMMANDS: SlashCommand[] = [
  {
    name: "/create",
    content: "",
    category: "built-in",
    description: "Create a new slash command",
    usageCount: 0,
  },
  {
    name: "/templates",
    content: "",
    category: "built-in",
    description: "Open the prompt templates gallery",
    usageCount: 0,
  },
  {
    name: "/projects",
    content: "",
    category: "built-in",
    description: "Open the projects panel",
    usageCount: 0,
  },
  {
    name: "/help",
    content:
      "Slash Commands:\n- Type / to trigger the command palette\n- Arrow keys to navigate, Enter to select\n- Create custom commands from the Slash Commands panel\n- Use {{variable}} for dynamic placeholders",
    category: "built-in",
    description: "Show slash command usage guide",
    usageCount: 0,
  },
]

export const BUILT_IN_NAMES = BUILT_IN_COMMANDS.map((c) => c.name)
