export interface ProjectFolder {
  id: string
  name: string
  createdAt: number
}

export interface Project {
  id: string
  folderId: string
  name: string
  status: "draft" | "active" | "archived"
  tags: string[]
  modelUsed: string
  promptVersions: PromptVersion[]
  outputSummary: string
  rating: number
  notes: string
  whatWorked: string
  whatDidntWork: string
  createdAt: number
  updatedAt: number
}

export interface PromptVersion {
  id: string
  text: string
  createdAt: number
}

export const PROJECT_STATUS_META: {
  value: Project["status"]
  label: string
}[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "In Progress" },
  { value: "archived", label: "Done" },
]
