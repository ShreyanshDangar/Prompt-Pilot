export interface EditorTab {
  id: string
  name: string
  content: string
  theme: string
  cursorPosition: number
  scrollPosition: number
  isDirty: boolean
  isRenamed: boolean
}

export interface EditorState {
  tabs: EditorTab[]
  activeTabId: string
}
