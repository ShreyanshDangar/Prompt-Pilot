const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g

export function extractVariables(content: string): string[] {
  const matches = content.matchAll(VARIABLE_PATTERN)
  const names = new Set<string>()
  for (const match of matches) {
    names.add(match[1])
  }
  return Array.from(names)
}

export function resolveVariables(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(VARIABLE_PATTERN, (_, name: string) => {
    return values[name] ?? `{{${name}}}`
  })
}
