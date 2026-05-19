import { THEME_FONT_OPTIONS, type AppFontName } from "./fonts"

/**
 * Google Fonts `family=` query segment for each web font the themes use, with the
 * exact weights the app needs (these were previously hard-coded in the 16-family
 * `@import` at the top of globals.css). System fonts (Georgia, Times New Roman,
 * Courier New, system-ui) are intentionally omitted — they need no network fetch.
 */
const GOOGLE_FONT_QUERIES: Partial<Record<AppFontName, string>> = {
  Inter: "Inter:wght@400;500;600;700",
  "JetBrains Mono": "JetBrains+Mono:wght@400;500;600;700",
  "Fira Code": "Fira+Code:wght@400;500;600;700",
  "Source Code Pro": "Source+Code+Pro:wght@400;500;600;700",
  "Space Grotesk": "Space+Grotesk:wght@400;500;700",
  Nunito: "Nunito:wght@400;500;600;700",
  Poppins: "Poppins:wght@400;500;600;700",
  Lora: "Lora:wght@400;500;600;700",
  Merriweather: "Merriweather:wght@400;700",
  "Crimson Pro": "Crimson+Pro:wght@400;500;600;700",
  "EB Garamond": "EB+Garamond:wght@400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;500;600;700",
  "IBM Plex Mono": "IBM+Plex+Mono:wght@400;500;600;700",
  "Space Mono": "Space+Mono:wght@400;700",
  Inconsolata: "Inconsolata:wght@400;500;600;700",
  VT323: "VT323",
}

const THEME_FONTS_LINK_ID = "theme-fonts"

let preconnectAdded = false
let currentHref: string | null = null

function ensurePreconnect() {
  if (preconnectAdded || typeof document === "undefined") return
  const hosts: Array<[string, boolean]> = [
    ["https://fonts.googleapis.com", false],
    ["https://fonts.gstatic.com", true],
  ]
  for (const [host, crossOrigin] of hosts) {
    const link = document.createElement("link")
    link.rel = "preconnect"
    link.href = host
    if (crossOrigin) link.crossOrigin = "anonymous"
    document.head.appendChild(link)
  }
  preconnectAdded = true
}

/**
 * Loads only the active theme's Google fonts by injecting/updating a single
 * `<link id="theme-fonts" rel="stylesheet">` in `<head>`. Idempotent: the href is
 * rebuilt only when the theme's web-font set changes, so switching themes fetches
 * just that theme's families (≤4) instead of all 16 up front. Themes whose fonts
 * are all system fonts make no request. Safe to call when `document` is undefined.
 */
export function ensureThemeFontsLoaded(theme: string): void {
  if (typeof document === "undefined") return

  const names = THEME_FONT_OPTIONS[theme] ?? THEME_FONT_OPTIONS.default
  const segments = names
    .map((name) => GOOGLE_FONT_QUERIES[name])
    .filter((seg): seg is string => Boolean(seg))

  if (segments.length === 0) return

  const href =
    "https://fonts.googleapis.com/css2?" +
    segments.map((seg) => `family=${seg}`).join("&") +
    "&display=swap"

  if (href === currentHref) return
  currentHref = href

  ensurePreconnect()

  let link = document.getElementById(
    THEME_FONTS_LINK_ID,
  ) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement("link")
    link.id = THEME_FONTS_LINK_ID
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }
  link.href = href
}
