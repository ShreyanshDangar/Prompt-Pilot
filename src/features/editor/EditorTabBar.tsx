import { useRef, useState, useLayoutEffect } from "react";
import { Plus, X } from "lucide-react";
import { useEditorStore } from "./editor-store";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { usePendingConfirm } from "@/hooks/usePendingConfirm";
import { useDragReorder } from "@/hooks/useDragReorder";

function TabNameDisplay({
  name,
  isActive,
}: {
  name: string;
  isActive: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const overflow = text.scrollWidth - container.clientWidth;
    const nextShouldScroll = overflow > 0;
    const nextScrollDistance = nextShouldScroll ? -overflow - 8 : 0;

    setShouldScroll((prev) =>
      prev === nextShouldScroll ? prev : nextShouldScroll,
    );
    setScrollDistance((prev) =>
      prev === nextScrollDistance ? prev : nextScrollDistance,
    );
  }, [name]);

  return (
    <div
      ref={containerRef}
      className="flex max-w-32 items-center justify-center overflow-hidden"
    >
      <span
        ref={textRef}
        className={`whitespace-nowrap ${shouldScroll && isActive ? "tab-scroll-animation" : ""}`}
        style={
          shouldScroll
            ? ({
                "--scroll-distance": `${scrollDistance}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {name}
      </span>
    </div>
  );
}

export function EditorTabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const addTab = useEditorStore((s) => s.addTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const updateTabName = useEditorStore((s) => s.updateTabName);
  const reorderTab = useEditorStore((s) => s.reorderTab);
  const skipDirtyCloseConfirm = useEditorStore((s) => s.skipDirtyCloseConfirm);
  const setSkipDirtyCloseConfirm = useEditorStore(
    (s) => s.setSkipDirtyCloseConfirm,
  );
  const drag = useDragReorder(reorderTab);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const closeConfirm = usePendingConfirm();
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const pendingTab = closeConfirm.pendingId
    ? tabs.find((t) => t.id === closeConfirm.pendingId)
    : null;

  const requestCloseTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    if (!tab.isDirty || skipDirtyCloseConfirm) {
      closeTab(tabId);
      return;
    }
    setDontAskAgain(false);
    closeConfirm.request(tabId);
  };

  const confirmClose = () => {
    if (dontAskAgain) setSkipDirtyCloseConfirm(true);
    if (closeConfirm.pendingId) closeTab(closeConfirm.pendingId);
    closeConfirm.clear();
  };

  const cancelClose = () => {
    closeConfirm.clear();
  };

  const handleDoubleClick = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditValue(currentName);
  };

  const commitRename = (tabId: string) => {
    if (editValue.trim()) {
      updateTabName(tabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  return (
    <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-b border-border bg-bg-secondary scrollbar-thin">
      {tabs.map((tab, index) => {
        const dragProps =
          editingTabId === tab.id ? {} : drag.getItemProps(index);
        const isDragging = drag.dragIndex === index;
        const isDropTarget =
          drag.dragOverIndex === index && drag.dragIndex !== index;
        return (
        <button
          key={tab.id}
          {...dragProps}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
          className={`group flex shrink-0 items-center gap-2 border-r border-border px-4 py-2 text-sm transition-colors ${
            tab.id === activeTabId
              ? "bg-bg-primary text-text-primary"
              : "text-text-muted hover:bg-bg-primary/50 hover:text-text-secondary"
          } ${isDragging ? "opacity-50" : ""} ${
            isDropTarget ? "ring-2 ring-inset ring-accent" : ""
          }`}
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitRename(tab.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename(tab.id);
                if (e.key === "Escape") setEditingTabId(null);
              }}
              className="w-28 bg-transparent text-center text-sm outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <TabNameDisplay name={tab.name} isActive={tab.id === activeTabId} />
          )}
          {tab.isDirty && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          )}
          {tabs.length > 1 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                requestCloseTab(tab.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.stopPropagation();
                  requestCloseTab(tab.id);
                }
              }}
              className="ml-1 rounded opacity-0 transition-opacity hover:bg-bg-secondary group-hover:opacity-100"
              aria-label={`Close ${tab.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>
        );
      })}
      <button
        onClick={addTab}
        className="flex h-full shrink-0 items-center px-3 py-2 text-text-muted transition-colors hover:text-text-secondary"
        aria-label="New tab"
      >
        <Plus className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={closeConfirm.isOpen}
        title={pendingTab ? `Close "${pendingTab.name}"?` : "Close tab?"}
        destructive
        confirmLabel="Close tab"
        cancelLabel="Keep editing"
        message="This tab has unsaved changes. Closing it will discard the latest edits. Are you sure?"
        extraContent={
          <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="h-3.5 w-3.5 accent-accent"
            />
            Don&rsquo;t ask again for this session
          </label>
        }
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </div>
  );
}
