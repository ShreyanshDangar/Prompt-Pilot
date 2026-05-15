import { useEffect, useRef } from "react"
import { getFromIDB, setToIDB } from "@/lib/storage"
import { SESSION_KEY, AUTOSAVE_INTERVAL_MS } from "@/lib/constants"
import { useEditorStore } from "@/features/editor/editor-store"
import type { EditorTab } from "@/features/editor/editor-types"
import { useGlobalStore } from "@/stores/global-store"

interface SessionData {
  tabs: EditorTab[]
  activeTabId: string
  sidebarOpen: boolean
}

export function useSessionRestore() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const restore = async () => {
      const session = await getFromIDB<SessionData>(SESSION_KEY)
      if (!session) return

      if (session.tabs && session.tabs.length > 0) {
        const restoredTabs = session.tabs.map((t) => ({
          ...t,
          isRenamed: t.isRenamed ?? false,
        }))
        useEditorStore.setState({
          tabs: restoredTabs,
          activeTabId: session.activeTabId ?? session.tabs[0].id,
        })
      }

      if (session.sidebarOpen !== undefined) {
        useGlobalStore.setState({ sidebarOpen: session.sidebarOpen })
      }
    }

    restore()
  }, [])

  useEffect(() => {
    const save = () => {
      const editorState = useEditorStore.getState()
      const globalState = useGlobalStore.getState()

      const session: SessionData = {
        tabs: editorState.tabs,
        activeTabId: editorState.activeTabId,
        sidebarOpen: globalState.sidebarOpen,
      }

      setToIDB(SESSION_KEY, session)
    }

    const interval = setInterval(save, AUTOSAVE_INTERVAL_MS)
    const handleBeforeUnload = () => save()
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])
}
