import { create } from "zustand"
import { getFromIDB, setToIDB } from "@/lib/storage"
import { makeId } from "@/lib/id"
import { STORAGE_KEYS } from "@/lib/constants"

const CHAINS_KEY = STORAGE_KEYS.CHAINS

export interface ChainStep {
  id: string
  name: string
  promptText: string
  order: number
}

export interface PromptChain {
  id: string
  name: string
  steps: ChainStep[]
  createdAt: number
  updatedAt: number
}

interface ChainingStore {
  chains: PromptChain[]
  selectedChainId: string | null
  isOpen: boolean
  initialize: () => Promise<void>
  setOpen: (open: boolean) => void
  createChain: (name: string) => void
  deleteChain: (id: string) => void
  selectChain: (id: string | null) => void
  addStep: (chainId: string, name: string, promptText: string) => void
  updateStep: (chainId: string, stepId: string, updates: Partial<ChainStep>) => void
  removeStep: (chainId: string, stepId: string) => void
  reorderSteps: (chainId: string, stepIds: string[]) => void
  persist: () => void
}

export const useChainingStore = create<ChainingStore>((set, get) => ({
  chains: [],
  selectedChainId: null,
  isOpen: false,

  initialize: async () => {
    const chains = await getFromIDB<PromptChain[]>(CHAINS_KEY)
    if (chains) set({ chains })
  },

  setOpen: (open) => set({ isOpen: open }),

  createChain: (name) => {
    const chain: PromptChain = {
      id: makeId(),
      name,
      steps: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((s) => ({ chains: [...s.chains, chain], selectedChainId: chain.id }))
    get().persist()
  },

  deleteChain: (id) => {
    set((s) => ({
      chains: s.chains.filter((c) => c.id !== id),
      selectedChainId: s.selectedChainId === id ? null : s.selectedChainId,
    }))
    get().persist()
  },

  selectChain: (id) => set({ selectedChainId: id }),

  addStep: (chainId, name, promptText) => {
    const step: ChainStep = {
      id: makeId(),
      name,
      promptText,
      order: get().chains.find((c) => c.id === chainId)?.steps.length ?? 0,
    }
    set((s) => ({
      chains: s.chains.map((c) =>
        c.id === chainId
          ? { ...c, steps: [...c.steps, step], updatedAt: Date.now() }
          : c
      ),
    }))
    get().persist()
  },

  updateStep: (chainId, stepId, updates) => {
    set((s) => ({
      chains: s.chains.map((c) =>
        c.id === chainId
          ? {
              ...c,
              steps: c.steps.map((st) =>
                st.id === stepId ? { ...st, ...updates } : st
              ),
              updatedAt: Date.now(),
            }
          : c
      ),
    }))
    get().persist()
  },

  removeStep: (chainId, stepId) => {
    set((s) => ({
      chains: s.chains.map((c) =>
        c.id === chainId
          ? {
              ...c,
              steps: c.steps
                .filter((st) => st.id !== stepId)
                .map((st, i) => ({ ...st, order: i })),
              updatedAt: Date.now(),
            }
          : c
      ),
    }))
    get().persist()
  },

  reorderSteps: (chainId, stepIds) => {
    set((s) => ({
      chains: s.chains.map((c) => {
        if (c.id !== chainId) return c
        const reordered = stepIds
          .map((id, i) => {
            const step = c.steps.find((st) => st.id === id)
            return step ? { ...step, order: i } : null
          })
          .filter(Boolean) as ChainStep[]
        return { ...c, steps: reordered, updatedAt: Date.now() }
      }),
    }))
    get().persist()
  },

  persist: () => {
    setToIDB(CHAINS_KEY, get().chains)
  },
}))
