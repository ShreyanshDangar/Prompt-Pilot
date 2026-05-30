import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import type { Slice } from "@tiptap/pm/model";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Code2, Slash } from "lucide-react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useGlobalStore } from "@/stores/global-store";
import { useXmlTagsStore } from "@/features/xml-tags/xml-tags-store";
import { useSlashStore } from "@/features/slash-commands/slash-store";
import { resolveFontFamily } from "@/lib/theme/fonts";
import { DEFAULT_EDITOR_PLACEHOLDER } from "@/lib/constants";
import { applyAutoCorrect } from "./editor-autocorrect";
import { serializeSliceToMarkdown } from "./editor-markdown";

const EDITOR_ATTR_CLASS =
  "prose prose-sm dark:prose-invert max-w-none h-full min-h-full cursor-text outline-none px-6 py-4";

function htmlIsEmpty(html: string): boolean {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}

function buildEditorProps(spellcheck: boolean) {
  return {
    attributes: {
      class: EDITOR_ATTR_CLASS,
      spellcheck: spellcheck ? "true" : "false",
    },
    clipboardTextSerializer: (slice: Slice) => serializeSliceToMarkdown(slice),
  };
}

export function DefaultEditor({
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
  const [isEmpty, setIsEmpty] = useState(() => htmlIsEmpty(content));

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
        }),
        Placeholder.configure({ placeholder: DEFAULT_EDITOR_PLACEHOLDER }),
      ],
      content,
      editorProps: buildEditorProps(spellcheck),
      onSelectionUpdate: ({ editor: e }) => {
        onCursorChange(e.state.selection.from);
      },
      onUpdate: ({ editor: e }) => {
        isInternalUpdateRef.current = true;
        const html = e.getHTML();
        onUpdate(html);
        setIsEmpty(e.isEmpty);

        if (autoCorrectEnabled) {
          applyAutoCorrect(e, autoCorrectRules);
        }
      },
    },
    [],
  );

  useEffect(() => {
    if (editor) {
      editor.setOptions({ editorProps: buildEditorProps(spellcheck) });
    }
  }, [editor, spellcheck]);

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
      className="relative flex-1 overflow-auto bg-bg-primary scrollbar-thin"
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
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sparkles className="mb-2 h-8 w-8 text-accent" />
            <p className="mb-1 text-sm font-medium text-text-secondary">
              Start writing your prompt
            </p>
            <p className="mb-4 text-xs text-text-muted">
              Or jump in with one of these
            </p>
            <div className="flex w-full max-w-xs flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  useGlobalStore.getState().setActivePanel("templates")
                }
                className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-bg-primary/60 px-3 py-2 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                Browse the template gallery
              </button>
              <button
                type="button"
                onClick={() => useXmlTagsStore.getState().setOpen(true)}
                className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-bg-primary/60 px-3 py-2 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                <Code2 className="h-4 w-4 shrink-0" />
                Insert an XML tag
              </button>
              <button
                type="button"
                onClick={() => useSlashStore.getState().openCreateModal()}
                className="pointer-events-auto flex items-center gap-2 rounded-lg border border-border bg-bg-primary/60 px-3 py-2 text-xs text-text-secondary transition-colors hover:border-accent hover:text-accent"
              >
                <Slash className="h-4 w-4 shrink-0" />
                Create a slash command
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
