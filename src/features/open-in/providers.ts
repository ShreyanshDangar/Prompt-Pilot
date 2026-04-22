const chatgptSvg = "/assets/providers/ChatGPT.svg"
const claudeSvg = "/assets/providers/Claude.svg"
const geminiSvg = "/assets/providers/Gemini.svg"
const perplexitySvg = "/assets/providers/Perplexity.svg"
const mistralSvg = "/assets/providers/Mistral.svg"

export interface Provider {
  id: string
  name: string
  icon: string
  blankUrl: string
  buildUrl: (prompt: string) => string
  supportsPrefill: boolean
}

export const PROVIDERS: Provider[] = [
  {
    id: "claude",
    name: "Claude",
    icon: claudeSvg,
    blankUrl: "https://claude.ai/new",
    buildUrl: () => "https://claude.ai/new",
    supportsPrefill: false,
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: chatgptSvg,
    blankUrl: "https://chatgpt.com/",
    buildUrl: (prompt) =>
      `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`,
    supportsPrefill: true,
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: geminiSvg,
    blankUrl: "https://gemini.google.com/app",
    buildUrl: () => "https://gemini.google.com/app",
    supportsPrefill: false,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: perplexitySvg,
    blankUrl: "https://www.perplexity.ai/",
    buildUrl: (prompt) =>
      `https://www.perplexity.ai/?q=${encodeURIComponent(prompt)}`,
    supportsPrefill: true,
  },
  {
    id: "mistral",
    name: "Mistral",
    icon: mistralSvg,
    blankUrl: "https://chat.mistral.ai/",
    buildUrl: () => "https://chat.mistral.ai/",
    supportsPrefill: false,
  },
]

export const MAX_URL_LENGTH = 2000
