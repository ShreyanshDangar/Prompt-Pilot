import { create } from "zustand"
import type { Project, ProjectFolder, PromptVersion } from "./projects-types"
import { getFromIDB, setToIDB } from "@/lib/storage"
import { makeId } from "@/lib/id"
import { STORAGE_KEYS } from "@/lib/constants"

const PROJECTS_KEY = STORAGE_KEYS.PROJECTS
const FOLDERS_KEY = STORAGE_KEYS.FOLDERS

interface ProjectsStore {
  folders: ProjectFolder[]
  projects: Project[]
  selectedFolderId: string | null
  selectedProjectId: string | null
  isOpen: boolean
  initialize: () => Promise<void>
  setOpen: (open: boolean) => void
  createFolder: (name: string) => ProjectFolder
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  createProject: (folderId: string, name: string) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addPromptVersion: (projectId: string, text: string) => void
  selectFolder: (id: string | null) => void
  selectProject: (id: string | null) => void
  persist: () => void
}

export const useProjectsStore = create<ProjectsStore>((set, get) => ({
  folders: [],
  projects: [],
  selectedFolderId: null,
  selectedProjectId: null,
  isOpen: false,

  initialize: async () => {
    const folders = await getFromIDB<ProjectFolder[]>(FOLDERS_KEY)
    const projects = await getFromIDB<Project[]>(PROJECTS_KEY)
    set({
      folders: folders ?? [],
      projects: projects ?? [],
    })
  },

  setOpen: (open) => set({ isOpen: open }),

  createFolder: (name) => {
    const folder: ProjectFolder = {
      id: makeId(),
      name,
      createdAt: Date.now(),
    }
    set((s) => ({ folders: [...s.folders, folder] }))
    get().persist()
    return folder
  },

  renameFolder: (id, name) => {
    set((s) => ({
      folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    }))
    get().persist()
  },

  deleteFolder: (id) => {
    set((s) => ({
      folders: s.folders.filter((f) => f.id !== id),
      projects: s.projects.filter((p) => p.folderId !== id),
      selectedFolderId:
        s.selectedFolderId === id ? null : s.selectedFolderId,
    }))
    get().persist()
  },

  createProject: (folderId, name) => {
    const project: Project = {
      id: makeId(),
      folderId,
      name,
      status: "draft",
      tags: [],
      modelUsed: "",
      promptVersions: [],
      outputSummary: "",
      rating: 0,
      notes: "",
      whatWorked: "",
      whatDidntWork: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((s) => ({ projects: [...s.projects, project] }))
    get().persist()
  },

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
      ),
    }))
    get().persist()
  },

  deleteProject: (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      selectedProjectId:
        s.selectedProjectId === id ? null : s.selectedProjectId,
    }))
    get().persist()
  },

  addPromptVersion: (projectId, text) => {
    const version: PromptVersion = {
      id: makeId(),
      text,
      createdAt: Date.now(),
    }
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              promptVersions: [...p.promptVersions, version],
              updatedAt: Date.now(),
            }
          : p
      ),
    }))
    get().persist()
  },

  selectFolder: (id) => set({ selectedFolderId: id, selectedProjectId: null }),
  selectProject: (id) => set({ selectedProjectId: id }),

  persist: () => {
    const { folders, projects } = get()
    setToIDB(FOLDERS_KEY, folders)
    setToIDB(PROJECTS_KEY, projects)
  },
}))
