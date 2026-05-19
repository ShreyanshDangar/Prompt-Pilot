export interface AppFontOption {
  name: string
  fontFamily: string
}

const FONT_STACKS = {
  Inter: '"Inter", ui-sans-serif, system-ui, sans-serif',
  "JetBrains Mono": '"JetBrains Mono", ui-monospace, monospace',
  "Fira Code": '"Fira Code", ui-monospace, monospace',
  "Source Code Pro": '"Source Code Pro", ui-monospace, monospace',
  "Space Grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
  Nunito: '"Nunito", ui-sans-serif, system-ui, sans-serif',
  Poppins: '"Poppins", ui-sans-serif, system-ui, sans-serif',
  Lora: '"Lora", Georgia, serif',
  Merriweather: '"Merriweather", Georgia, serif',
  "Crimson Pro": '"Crimson Pro", Georgia, serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  "EB Garamond": '"EB Garamond", Georgia, serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  "IBM Plex Mono": '"IBM Plex Mono", ui-monospace, monospace',
  "Space Mono": '"Space Mono", ui-monospace, monospace',
  Inconsolata: '"Inconsolata", ui-monospace, monospace',
  "system-ui": 'ui-sans-serif, system-ui, sans-serif',
  "Times New Roman": '"Times New Roman", Times, serif',
  "Courier New": '"Courier New", Courier, monospace',
  VT323: '"VT323", ui-monospace, monospace',
} as const

export type AppFontName = keyof typeof FONT_STACKS

export const THEME_FONT_OPTIONS: Record<string, AppFontName[]> = {
  default: [
    "Inter",
    "Space Grotesk",
    "JetBrains Mono",
    "Fira Code",
    "Source Code Pro",
  ],
  aurora: ["Inter", "Nunito", "Poppins", "Space Grotesk"],
  cyber: ["JetBrains Mono", "Fira Code", "Source Code Pro", "VT323"],
  zen: ["Lora", "Merriweather", "Crimson Pro", "Georgia"],
  writer: ["EB Garamond", "Playfair Display", "Georgia", "Times New Roman"],
  neural: ["Inter", "IBM Plex Mono", "Space Mono", "Inconsolata"],
}

export function resolveFontFamily(fontName: string): string {
  return FONT_STACKS[fontName as AppFontName] ?? fontName
}

export function getThemeFontOptions(theme: string): AppFontOption[] {
  const names = THEME_FONT_OPTIONS[theme] ?? THEME_FONT_OPTIONS.default
  return names.map((name) => ({
    name,
    fontFamily: resolveFontFamily(name),
  }))
}
