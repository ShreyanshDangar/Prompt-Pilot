export interface SlashCommand {
  name: string
  content: string
  category: "built-in" | "user"
  description: string
  usageCount: number
}
