import { useCallback, useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { resolveFontFamily } from "@/lib/fonts";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "./editor-store";
import { useGlobalStore } from "@/stores/global-store";
import { CopyButton } from "@/components/CopyButton";
import { OpenInDropdown } from "@/features/open-in/OpenInDropdown";
import { SlashCommandPopover } from "@/features/slash-commands/SlashCommandPopover";
import { XmlTagAutocompletePopover } from "@/features/xml-tags/XmlTagAutocompletePopover";
import { ImageUploader } from "@/components/ImageUploader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DEFAULT_EDITOR_PLACEHOLDER } from "@/lib/constants";
import { ThemeVideo } from "@/components/ThemeVideo";

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

let skipDirtyCloseConfirmThisSession = false;

function EditorTabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const addTab = useEditorStore((s) => s.addTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const updateTabName = useEditorStore((s) => s.updateTabName);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pendingCloseTabId, setPendingCloseTabId] = useState<string | null>(
    null,
  );
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const pendingTab = pendingCloseTabId
    ? tabs.find((t) => t.id === pendingCloseTabId)
    : null;

  const requestCloseTab = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    if (!tab.isDirty || skipDirtyCloseConfirmThisSession) {
      closeTab(tabId);
      return;
    }
    setDontAskAgain(false);
    setPendingCloseTabId(tabId);
  };

  const confirmClose = () => {
    if (dontAskAgain) skipDirtyCloseConfirmThisSession = true;
    if (pendingCloseTabId) closeTab(pendingCloseTabId);
    setPendingCloseTabId(null);
  };

  const cancelClose = () => {
    setPendingCloseTabId(null);
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
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
          className={`group flex shrink-0 items-center gap-2 border-r border-border px-4 py-2 text-sm transition-colors ${
            tab.id === activeTabId
              ? "bg-bg-primary text-text-primary"
              : "text-text-muted hover:bg-bg-primary/50 hover:text-text-secondary"
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
      ))}
      <button
        onClick={addTab}
        className="flex h-full shrink-0 items-center px-3 py-2 text-text-muted transition-colors hover:text-text-secondary"
        aria-label="New tab"
      >
        <Plus className="h-4 w-4" />
      </button>
      <ConfirmDialog
        open={pendingCloseTabId !== null}
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

function CharWordCount() {
  const editor = useEditorStore((s) => s.editor);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const activeTabContent = useEditorStore(
    (s) => s.tabs.find((t) => t.id === s.activeTabId)?.content,
  );

  const { chars, words } = useMemo(() => {
    if (!editor) return { chars: 0, words: 0 };
    void activeTabId;
    void activeTabContent;
    const text = editor.getText();
    return {
      chars: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
    };
  }, [editor, activeTabId, activeTabContent]);

  return (
    <span className="text-xs text-text-muted">
      {chars.toLocaleString()} chars / {words.toLocaleString()} words
    </span>
  );
}

function EditorToolbar() {
  return (
    <div className="flex shrink-0 items-center border-t border-border bg-bg-secondary px-3 py-1.5">
      <div className="flex items-center gap-2">
        <ImageUploader compact />
      </div>

      <div className="mx-3 flex flex-1 items-center justify-center">
        <CharWordCount />
      </div>

      <div className="flex items-center gap-2">
        <CopyButton />
        <OpenInDropdown />
      </div>
    </div>
  );
}

function DefaultEditor({
  content,
  onUpdate,
  spellcheck,
  fontFamily,
  fontSize,
  fontColor,
  lineHeight,
  letterSpacing,
  onEditorReady,
  onKeyDown,
  initialCursor,
  initialScroll,
  onCursorChange,
  onScrollChange,
}: {
  content: string;
  onUpdate: (html: string) => void;
  spellcheck: boolean;
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  lineHeight: number;
  letterSpacing: number;
  onEditorReady: (editor: TiptapEditor) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  initialCursor: number;
  initialScroll: number;
  onCursorChange: (pos: number) => void;
  onScrollChange: (pos: number) => void;
}) {
  const autoCorrectEnabled = useGlobalStore(
    (s) => s.settings.autoCorrectEnabled,
  );
  const autoCorrectRules = useGlobalStore((s) => s.settings.autoCorrectRules);
  const collapseThemesSubmenu = useGlobalStore((s) => s.collapseThemesSubmenu);
  const isInternalUpdateRef = useRef(false);
  const previousFontFamilyRef = useRef(fontFamily);
  const editorSurfaceRef = useRef<HTMLDivElement>(null);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({ placeholder: DEFAULT_EDITOR_PLACEHOLDER }),
      ],
      content,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm dark:prose-invert max-w-none h-full min-h-full cursor-text outline-none px-6 py-4",
          spellcheck: spellcheck ? "true" : "false",
        },
      },
      onSelectionUpdate: ({ editor: e }) => {
        onCursorChange(e.state.selection.from);
      },
      onUpdate: ({ editor: e }) => {
        isInternalUpdateRef.current = true;
        const html = e.getHTML();
        onUpdate(html);

        if (autoCorrectEnabled && autoCorrectRules.length > 0) {
          const { from } = e.state.selection;
          if (from < 2) return;
          const textBefore = e.state.doc.textBetween(
            Math.max(0, from - 50),
            from,
            "\ufffc",
          );
          const lastChar = textBefore.slice(-1);
          if (!/[\s,.;:!?)\]]/.test(lastChar)) return;

          const beforeTrigger = textBefore.slice(0, -1);
          const words = beforeTrigger.split(/[\s,.;:!?)\]]+/);
          const prevWord = words.pop() ?? "";

          if (prevWord.length >= 2) {
            const rule = autoCorrectRules.find(
              (r) => r.from === prevWord.toLowerCase(),
            );
            if (rule && rule.to !== prevWord) {
              const wordStart = from - 1 - prevWord.length;
              const wordEnd = from - 1;
              const lengthDiff = rule.to.length - prevWord.length;
              e.chain()
                .focus()
                .command(({ tr }) => {
                  tr.insertText(rule.to, wordStart, wordEnd);
                  return true;
                })
                .setTextSelection(from + lengthDiff)
                .run();
            }
          }
        }
      },
    },
    [],
  );

  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
      const docSize = editor.state.doc.content.size;
      const safeCursor = Math.min(Math.max(0, initialCursor), docSize);
      try {
        editor.commands.setTextSelection(safeCursor);
      } catch {
        editor.commands.focus();
      }
      const surface = editorSurfaceRef.current;
      if (surface && initialScroll > 0) {
        requestAnimationFrame(() => {
          if (editorSurfaceRef.current) {
            editorSurfaceRef.current.scrollTop = initialScroll;
          }
        });
      }
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor) {
      if (isInternalUpdateRef.current) {
        isInternalUpdateRef.current = false;
        return;
      }
      const currentContent = editor.getHTML();
      if (currentContent !== content && content !== undefined) {
        editor.commands.setContent(content || "");
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (previousFontFamilyRef.current === fontFamily) return;

    previousFontFamilyRef.current = fontFamily;

    const surface = editorSurfaceRef.current;
    if (!surface || typeof surface.animate !== "function") return;

    const animation = surface.animate([{ opacity: 0.985 }, { opacity: 1 }], {
      duration: 180,
      easing: "ease",
      fill: "both",
    });

    return () => {
      animation.cancel();
      surface.style.opacity = "";
    };
  }, [fontFamily]);

  return (
    <div
      ref={editorSurfaceRef}
      className="flex-1 overflow-auto bg-bg-primary scrollbar-thin"
      onKeyDown={onKeyDown}
      onScroll={(e) => onScrollChange((e.target as HTMLDivElement).scrollTop)}
      onMouseDown={(e) => {
        if (!editor) return;
        collapseThemesSubmenu();
        const target = e.target as HTMLElement;
        if (target.closest(".ProseMirror")) return;
        e.preventDefault();
        editor.commands.focus("end");
      }}
      style={{
        fontFamily: resolveFontFamily(fontFamily),
        fontSize: `${fontSize}px`,
        color: fontColor,
        lineHeight,
        letterSpacing: `${letterSpacing}px`,
        transition:
          "color 180ms ease, letter-spacing 180ms ease, line-height 180ms ease",
      }}
    >
      <EditorContent editor={editor} className="h-full min-h-full" />
    </div>
  );
}

export function Editor() {
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const tabs = useEditorStore((s) => s.tabs);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);
  const updateTabCursor = useEditorStore((s) => s.updateTabCursor);
  const updateTabScroll = useEditorStore((s) => s.updateTabScroll);
  const settings = useGlobalStore((s) => s.settings);
  const themeStyle = useGlobalStore((s) => s.getActiveThemeStyle());
  const slashRef = useRef<{ handleKeyDown: (e: KeyboardEvent) => boolean }>(
    null,
  );
  const xmlTagRef = useRef<{ handleKeyDown: (e: KeyboardEvent) => boolean }>(
    null,
  );
  const [editorInstance, setEditorInstance] = useState<TiptapEditor | null>(
    null,
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const initialCursor = activeTab?.cursorPosition ?? 0;
  const initialScroll = activeTab?.scrollPosition ?? 0;

  const handleUpdate = useCallback(
    (html: string) => {
      updateTabContent(activeTabId, html);
    },
    [activeTabId, updateTabContent],
  );

  const handleCursorChange = useCallback(
    (pos: number) => {
      updateTabCursor(activeTabId, pos);
    },
    [activeTabId, updateTabCursor],
  );

  const handleScrollChange = useCallback(
    (pos: number) => {
      updateTabScroll(activeTabId, pos);
    },
    [activeTabId, updateTabScroll],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (xmlTagRef.current?.handleKeyDown(e.nativeEvent)) {
      e.preventDefault();
      return;
    }
    if (slashRef.current?.handleKeyDown(e.nativeEvent)) {
      e.preventDefault();
    }
  }, []);

  const setStoreEditor = useEditorStore((s) => s.setEditor);

  const handleEditorReady = useCallback(
    (editor: TiptapEditor) => {
      setEditorInstance(editor);
      setStoreEditor(editor);
      editor.commands.focus();
    },
    [setStoreEditor],
  );

  useEffect(() => {
    return () => {
      setStoreEditor(null);
    };
  }, [setStoreEditor]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EditorTabBar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ThemeVideo slot="editor" className="opacity-20 z-0" />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            className="relative z-10 flex flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <DefaultEditor
              content={activeTab?.content ?? ""}
              onUpdate={handleUpdate}
              spellcheck={settings.spellcheck}
              fontFamily={themeStyle.fontFamily}
              fontSize={themeStyle.fontSize}
              fontColor={themeStyle.fontColor}
              lineHeight={themeStyle.lineHeight}
              letterSpacing={themeStyle.letterSpacing}
              onEditorReady={handleEditorReady}
              onKeyDown={handleKeyDown}
              initialCursor={initialCursor}
              initialScroll={initialScroll}
              onCursorChange={handleCursorChange}
              onScrollChange={handleScrollChange}
            />
          </motion.div>
        </AnimatePresence>
        {editorInstance && (
          <>
            <SlashCommandPopover ref={slashRef} editor={editorInstance} />
            <XmlTagAutocompletePopover
              ref={xmlTagRef}
              editor={editorInstance}
            />
          </>
        )}
      </div>
      <EditorToolbar />
    </div>
  );
}
