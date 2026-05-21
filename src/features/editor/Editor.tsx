import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "./editor-store";
import { useGlobalStore } from "@/stores/global-store";
import { EditorTabBar } from "./EditorTabBar";
import { DefaultEditor } from "./DefaultEditor";
import { CopyButton } from "./CopyButton";
import { OpenInDropdown } from "@/features/open-in/OpenInDropdown";
import { SlashCommandPopover } from "@/features/slash-commands/SlashCommandPopover";
import { XmlTagAutocompletePopover } from "@/features/xml-tags/XmlTagAutocompletePopover";
import { ImageUploader } from "@/features/images/ImageUploader";
import { ThemeVideo } from "@/components/ThemeVideo";

function CharWordCount() {
  const editor = useEditorStore((s) => s.editor);
  // The active tab's stored content is the reactive recompute trigger: it changes
  // on every edit and on tab switch. The displayed counts still come from the
  // editor's plain text (TipTap's getText), since the stored content is HTML.
  const activeTabContent = useEditorStore(
    (s) => s.tabs.find((t) => t.id === s.activeTabId)?.content,
  );

  const { chars, words } = useMemo(() => {
    if (!editor || activeTabContent === undefined) return { chars: 0, words: 0 };
    const text = editor.getText();
    return {
      chars: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
    };
  }, [editor, activeTabContent]);

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
