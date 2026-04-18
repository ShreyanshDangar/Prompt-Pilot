export interface ModelInfo {
  id: string
  name: string
  provider: string
  contextWindow: number
  maxOutput: number
  charsPerToken: number
}

export const MODELS: ModelInfo[] = [
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    provider: "Anthropic",
    contextWindow: 200000,
    maxOutput: 64000,
    charsPerToken: 3.5,
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    contextWindow: 200000,
    maxOutput: 64000,
    charsPerToken: 3.5,
  },
  {
    id: "claude-haiku-3-5",
    name: "Claude Haiku 3.5",
    provider: "Anthropic",
    contextWindow: 200000,
    maxOutput: 64000,
    charsPerToken: 3.5,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: 128000,
    maxOutput: 64000,
    charsPerToken: 4.0,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    maxOutput: 64000,
    charsPerToken: 4.0,
  },
  {
    id: "o1",
    name: "o1",
    provider: "OpenAI",
    contextWindow: 200000,
    maxOutput: 100000,
    charsPerToken: 4.0,
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    contextWindow: 1048576,
    maxOutput: 64000,
    charsPerToken: 4.0,
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    contextWindow: 2097152,
    maxOutput: 64000,
    charsPerToken: 4.0,
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    contextWindow: 128000,
    maxOutput: 64000,
    charsPerToken: 4.0,
  },
]

export const PROVIDERS = [...new Set(MODELS.map((m) => m.provider))]

export function getModelById(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id)
}

export function estimateTokens(text: string, charsPerToken: number): number {
  if (!text) return 0
  return Math.ceil(text.length / charsPerToken)
}
