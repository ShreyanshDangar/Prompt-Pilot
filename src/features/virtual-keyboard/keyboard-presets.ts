import { resolveFontFamily } from "@/lib/theme/fonts";

export interface KeyboardColorPreset {
  id: string;
  label: string;
  frameBg: string;
  keyBg: string;
  keyText: string;
}

export interface KeyboardFontPreset {
  id: string;
  label: string;
  fontFamily: string;
}

const DEFAULT_COLOR: KeyboardColorPreset = {
  id: "default",
  label: "Classic White",
  frameBg: "",
  keyBg: "",
  keyText: "",
};

const DEFAULT_FONT: KeyboardFontPreset = {
  id: "default",
  label: "Default",
  fontFamily: resolveFontFamily("Inter"),
};

export const KEYBOARD_COLOR_PRESETS: Record<string, KeyboardColorPreset[]> = {
  default: [
    DEFAULT_COLOR,
    {
      id: "graphite",
      label: "Graphite",
      frameBg: "#1f2937",
      keyBg: "#374151",
      keyText: "#f3f4f6",
    },
    {
      id: "indigo",
      label: "Indigo Ink",
      frameBg: "#312e81",
      keyBg: "#4338ca",
      keyText: "#e0e7ff",
    },
    {
      id: "slate",
      label: "Slate",
      frameBg: "#334155",
      keyBg: "#475569",
      keyText: "#f1f5f9",
    },
  ],
  aurora: [
    DEFAULT_COLOR,
    {
      id: "aurora-mint",
      label: "Aurora Mint",
      frameBg: "#0f3a2a",
      keyBg: "#1a5d42",
      keyText: "#d1fae5",
    },
    {
      id: "aurora-midnight",
      label: "Midnight Teal",
      frameBg: "#0b1f3a",
      keyBg: "#1e3a5f",
      keyText: "#a7f3d0",
    },
    {
      id: "aurora-frost",
      label: "Frost",
      frameBg: "#cfe3d4",
      keyBg: "#e6f2ea",
      keyText: "#1f3a2d",
    },
  ],
  cyber: [
    DEFAULT_COLOR,
    {
      id: "cyber-neon",
      label: "Neon Cyan",
      frameBg: "#030014",
      keyBg: "#050528",
      keyText: "#00f0ff",
    },
    {
      id: "cyber-carbon",
      label: "Carbon",
      frameBg: "#0a0a0f",
      keyBg: "#1a1a24",
      keyText: "#7de8f0",
    },
    {
      id: "cyber-magenta",
      label: "Magenta Void",
      frameBg: "#1a001a",
      keyBg: "#2a002a",
      keyText: "#ff00ff",
    },
  ],
  zen: [
    DEFAULT_COLOR,
    {
      id: "zen-sage",
      label: "Sage",
      frameBg: "#cfdcbf",
      keyBg: "#e4ecd6",
      keyText: "#2d3b28",
    },
    {
      id: "zen-forest",
      label: "Forest",
      frameBg: "#2d4a34",
      keyBg: "#4a7055",
      keyText: "#e8f1df",
    },
    {
      id: "zen-bamboo",
      label: "Bamboo",
      frameBg: "#d9c9a3",
      keyBg: "#ece1c4",
      keyText: "#3d3220",
    },
  ],
  writer: [
    DEFAULT_COLOR,
    {
      id: "writer-parchment",
      label: "Parchment",
      frameBg: "#c9b891",
      keyBg: "#ede1c2",
      keyText: "#3a2614",
    },
    {
      id: "writer-typewriter",
      label: "Typewriter",
      frameBg: "#2c1810",
      keyBg: "#f0e6d0",
      keyText: "#2c1810",
    },
    {
      id: "writer-manuscript",
      label: "Manuscript",
      frameBg: "#b8a078",
      keyBg: "#e6d8b5",
      keyText: "#4a2e14",
    },
  ],
  neural: [
    DEFAULT_COLOR,
    {
      id: "neural-azure",
      label: "Azure",
      frameBg: "#1a2847",
      keyBg: "#2a3f6b",
      keyText: "#cfd8f5",
    },
    {
      id: "neural-deep",
      label: "Deep Space",
      frameBg: "#050a1e",
      keyBg: "#0e1a36",
      keyText: "#8dbaf0",
    },
    {
      id: "neural-nebula",
      label: "Nebula",
      frameBg: "#1e1040",
      keyBg: "#3a2470",
      keyText: "#e0d6ff",
    },
  ],
};

export const KEYBOARD_FONT_PRESETS: Record<string, KeyboardFontPreset[]> = {
  default: [
    DEFAULT_FONT,
    {
      id: "space-grotesk",
      label: "Space Grotesk",
      fontFamily: resolveFontFamily("Space Grotesk"),
    },
    {
      id: "eb-garamond",
      label: "EB Garamond",
      fontFamily: resolveFontFamily("EB Garamond"),
    },
    {
      id: "mono",
      label: "JetBrains Mono",
      fontFamily: resolveFontFamily("JetBrains Mono"),
    },
  ],
  aurora: [
    DEFAULT_FONT,
    { id: "nunito", label: "Nunito", fontFamily: resolveFontFamily("Nunito") },
    {
      id: "poppins",
      label: "Poppins",
      fontFamily: resolveFontFamily("Poppins"),
    },
    {
      id: "space-grotesk",
      label: "Space Grotesk",
      fontFamily: resolveFontFamily("Space Grotesk"),
    },
  ],
  cyber: [
    DEFAULT_FONT,
    {
      id: "jetbrains",
      label: "JetBrains Mono",
      fontFamily: resolveFontFamily("JetBrains Mono"),
    },
    {
      id: "fira-code",
      label: "Fira Code",
      fontFamily: resolveFontFamily("Fira Code"),
    },
    { id: "vt323", label: "VT323", fontFamily: resolveFontFamily("VT323") },
  ],
  zen: [
    DEFAULT_FONT,
    { id: "lora", label: "Lora", fontFamily: resolveFontFamily("Lora") },
    {
      id: "merriweather",
      label: "Merriweather",
      fontFamily: resolveFontFamily("Merriweather"),
    },
    {
      id: "crimson-pro",
      label: "Crimson Pro",
      fontFamily: resolveFontFamily("Crimson Pro"),
    },
  ],
  writer: [
    DEFAULT_FONT,
    {
      id: "eb-garamond",
      label: "EB Garamond",
      fontFamily: resolveFontFamily("EB Garamond"),
    },
    {
      id: "playfair-display",
      label: "Playfair Display",
      fontFamily: resolveFontFamily("Playfair Display"),
    },
    {
      id: "times",
      label: "Times New Roman",
      fontFamily: resolveFontFamily("Times New Roman"),
    },
  ],
  neural: [
    DEFAULT_FONT,
    {
      id: "ibm-plex-mono",
      label: "IBM Plex Mono",
      fontFamily: resolveFontFamily("IBM Plex Mono"),
    },
    {
      id: "space-mono",
      label: "Space Mono",
      fontFamily: resolveFontFamily("Space Mono"),
    },
    {
      id: "inconsolata",
      label: "Inconsolata",
      fontFamily: resolveFontFamily("Inconsolata"),
    },
  ],
};

export function getColorPreset(
  theme: string,
  presetId: string,
): KeyboardColorPreset {
  const list = KEYBOARD_COLOR_PRESETS[theme] ?? KEYBOARD_COLOR_PRESETS.default;
  return list.find((p) => p.id === presetId) ?? list[0];
}

export function getFontPreset(
  theme: string,
  presetId: string,
): KeyboardFontPreset {
  const list = KEYBOARD_FONT_PRESETS[theme] ?? KEYBOARD_FONT_PRESETS.default;
  return list.find((p) => p.id === presetId) ?? list[0];
}

export function getColorPresets(theme: string): KeyboardColorPreset[] {
  return KEYBOARD_COLOR_PRESETS[theme] ?? KEYBOARD_COLOR_PRESETS.default;
}

export function getFontPresets(theme: string): KeyboardFontPreset[] {
  return KEYBOARD_FONT_PRESETS[theme] ?? KEYBOARD_FONT_PRESETS.default;
}
