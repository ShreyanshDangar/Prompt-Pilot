// Single source of truth for website-theme structural data: the theme id set,
// the canonical display name, the DOM class maps, the per-theme video folder, and
// the default editor styles. Sidebar icons + the styler's color presets stay with
// their components; keyboard appearance presets live in
// features/virtual-keyboard/keyboard-presets.ts.

export const WEBSITE_THEME_IDS = [
  "default",
  "aurora",
  "cyber",
  "zen",
  "writer",
  "neural",
] as const

export type WebsiteTheme = (typeof WEBSITE_THEME_IDS)[number]

// Canonical, user-facing label for each theme (consumed by the sidebar theme
// picker and the theme styler). One name per theme so the two surfaces never drift.
export const THEME_DISPLAY_NAMES: Record<WebsiteTheme, string> = {
  default: "Modern",
  aurora: "Aurora Borealis",
  cyber: "Neon Void",
  zen: "Zen Forest",
  writer: "Vintage Writer",
  neural: "Neural Workspace",
}

export interface ThemeStyleSettings {
  fontFamily: string
  fontSize: number
  fontColor: string
  lineHeight: number
  letterSpacing: number
}

export const DEFAULT_THEME_STYLES: Record<string, ThemeStyleSettings> = {
  default: {
    fontFamily: "Inter",
    fontSize: 16,
    fontColor: "#f9fafb",
    lineHeight: 1.6,
    letterSpacing: 0,
  },
  aurora: {
    fontFamily: "Inter",
    fontSize: 16,
    fontColor: "#e8edf5",
    lineHeight: 1.6,
    letterSpacing: 0,
  },
  cyber: {
    fontFamily: "JetBrains Mono",
    fontSize: 15,
    fontColor: "#00f0ff",
    lineHeight: 1.5,
    letterSpacing: 0.5,
  },
  zen: {
    fontFamily: "Georgia",
    fontSize: 17,
    fontColor: "#13200f",
    lineHeight: 1.8,
    letterSpacing: 0,
  },
  writer: {
    fontFamily: "Georgia",
    fontSize: 17,
    fontColor: "#170a05",
    lineHeight: 1.8,
    letterSpacing: 0.2,
  },
  neural: {
    fontFamily: "Inter",
    fontSize: 16,
    fontColor: "#e0e8f8",
    lineHeight: 1.6,
    letterSpacing: 0,
  },
}

export const THEME_CLASSES: Record<WebsiteTheme, string> = {
  default: "",
  aurora: "theme-aurora",
  cyber: "theme-cyber",
  zen: "theme-zen",
  writer: "theme-writer",
  neural: "theme-neural",
}

export const THEME_BG_CLASSES: Record<WebsiteTheme, string> = {
  default: "",
  aurora: "theme-bg-aurora",
  cyber: "theme-bg-cyber",
  zen: "theme-bg-zen",
  writer: "theme-bg-writer",
  neural: "theme-bg-neural",
}

export const THEME_FOLDER_MAP: Record<string, string> = {
  aurora: "aurora",
  cyber: "cyber",
  zen: "zen",
  writer: "writer",
  neural: "neural",
}
