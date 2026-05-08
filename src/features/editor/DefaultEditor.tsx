import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useGlobalStore } from "@/stores/global-store";
import { resolveFontFamily } from "@/lib/theme/fonts";
import { DEFAULT_EDITOR_PLACEHOLDER } from "@/lib/constants";
import { applyAutoCorrect } from "./editor-autocorrect";

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

        if (autoCorrectEnabled) {
          applyAutoCorrect(e, autoCorrectRules);
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
