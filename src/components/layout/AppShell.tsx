import { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calculator, Palette } from "lucide-react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { RightPanelToggle, type RightPanelSection } from "./RightPanelToggle";
import { Editor } from "@/features/editor/Editor";
import { TokenCalculator } from "@/features/token-calculator/TokenCalculator";
import { ThemeStyler } from "@/features/theme-styler/ThemeStyler";
import { SettingsPanel } from "@/features/settings/SettingsPanel";
import { XmlTagGallery } from "@/features/xml-tags/XmlTagGallery";
import { useGlobalStore } from "@/stores/global-store";
import { useProjectsStore } from "@/features/projects/projects-store";
import { useMusicStore } from "@/features/music-player/music-store";
import { useXmlTagsStore } from "@/features/xml-tags/xml-tags-store";
import { useEditorStore } from "@/features/editor/editor-store";
import { textToParagraphNodes } from "@/features/editor/editor-insert";
import { ThemeVideo } from "@/components/ThemeVideo";
import { getFromLocalStorage, setToLocalStorage, } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";

const VALID_RIGHT_PANEL_SECTIONS: RightPanelSection[] = [
  "calculator",
  "styler",
];

function loadRightPanelSections(): Set<RightPanelSection> {
  const saved = getFromLocalStorage<RightPanelSection[]>(
    STORAGE_KEYS.RIGHT_PANEL_SECTIONS,
  );
  if (Array.isArray(saved)) {
    const filtered = saved.filter((s): s is RightPanelSection =>
      VALID_RIGHT_PANEL_SECTIONS.includes(s as RightPanelSection),
    );
    return new Set(filtered);
  }
  return new Set(VALID_RIGHT_PANEL_SECTIONS);
}

const MusicPlayer = lazy(() =>
  import("@/features/music-player/MusicPlayer").then((m) => ({
    default: m.MusicPlayer,
  })),
);

const ProjectsPage = lazy(() =>
  import("@/features/projects/ProjectsPage").then((m) => ({
    default: m.ProjectsPage,
  })),
);

const VirtualKeyboard = lazy(() =>
  import("@/features/virtual-keyboard/VirtualKeyboard").then((m) => ({
    default: m.VirtualKeyboard,
  })),
);

const TemplateGallery = lazy(() =>
  import("@/features/prompt-templates/TemplateGallery").then((m) => ({
    default: m.TemplateGallery,
  })),
);

const ChainingView = lazy(() =>
  import("@/features/prompt-chaining/ChainingView").then((m) => ({
    default: m.ChainingView,
  })),
);

export function AppShell() {
  const rightPanelOpen = useGlobalStore((s) => s.rightPanelOpen);
  const activePanel = useGlobalStore((s) => s.activePanel);
  const projectsOpen = useProjectsStore((s) => s.isOpen);
  const musicActivated = useMusicStore((s) => s.isActivated);
  const themeBgClass = useGlobalStore((s) => s.getThemeBgClass());
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme);
  const xmlTagsOpen = useXmlTagsStore((s) => s.isOpen);
  const setXmlTagsOpen = useXmlTagsStore((s) => s.setOpen);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);
  const reduceMotion = useReducedMotion();
  const [rightPanelSections, setRightPanelSections] = useState<
    Set<RightPanelSection>
  >(() => loadRightPanelSections());
  const [panelWidth, setPanelWidth] = useState<number>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1280px)").matches
      ? 320
      : 288,
  );
  const [rightWillChange, setRightWillChange] = useState<string>("auto");
  // Mount the (lazy) Projects page only once it has first been opened, then keep
  // it mounted so GalleryModal's open/close animation plays exactly as before.
  // Adjusting state during render (the supported React pattern) latches it on the
  // first open without a set-state-in-effect.
  const [projectsMounted, setProjectsMounted] = useState(false);
  if (projectsOpen && !projectsMounted) {
    setProjectsMounted(true);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 1280px)");
    const onChange = () => setPanelWidth(mql.matches ? 320 : 288);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const templatesOpen = activePanel === "templates";

  const isThemed = websiteTheme !== "default";
  const glassClass = isThemed ? "glass-panel" : "";

  const toggleSection = (s: RightPanelSection) => {
    setRightPanelSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) {
        next.delete(s);
      } else {
        next.add(s);
      }
      setToLocalStorage(
        STORAGE_KEYS.RIGHT_PANEL_SECTIONS,
        Array.from(next),
      );
      return next;
    });
  };

  const handleInsertXmlTag = useCallback(
    (tagName: string) => {
      const { activeTabId, tabs, editor } = useEditorStore.getState();
      const activeTab = tabs.find((t) => t.id === activeTabId);
      if (!activeTab) return;
      const openTag = `<${tagName}>`;
      const closeTag = `</${tagName}>`;
      const snippet = `${openTag}\n\n${closeTag}`;
      if (editor) {
        const { from, to } = editor.state.selection;
        if (from !== to) {
          editor
            .chain()
            .focus()
            .insertContentAt(to, [{ type: "text", text: closeTag }])
            .insertContentAt(from, [{ type: "text", text: openTag }])
            .setTextSelection({
              from: from + openTag.length,
              to: to + openTag.length,
            })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .insertContent(textToParagraphNodes(snippet, { keepEmpty: true }))
            .run();
        }
        return;
      }
      const escape = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const htmlTag = snippet
        .split("\n")
        .map((line) => `<p>${escape(line) || "<br>"}</p>`)
        .join("");
      const newContent = activeTab.content
        ? activeTab.content + htmlTag
        : htmlTag;
      updateTabContent(activeTabId, newContent);
    },
    [updateTabContent],
  );

  const showRightPanel = rightPanelOpen;
  const showCalcContent = rightPanelSections.has("calculator");
  const showStylerContent = rightPanelSections.has("styler");

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${themeBgClass}`}>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex flex-1 flex-col overflow-hidden">
            <Editor />
            <Suspense fallback={null}>
              <VirtualKeyboard />
            </Suspense>
          </div>
          <AnimatePresence initial={false}>
            {showRightPanel && (
              <motion.aside
                key="right-panel"
                className={`pointer-events-auto absolute inset-y-0 right-0 z-20 flex flex-col overflow-hidden border-l border-border bg-bg-primary lg:relative lg:inset-auto lg:z-0 lg:shrink-0 ${glassClass}`}
                initial={
                  reduceMotion
                    ? { width: panelWidth, x: 0, opacity: 0 }
                    : { width: 0, x: panelWidth, opacity: 0.4 }
                }
                animate={{ width: panelWidth, x: 0, opacity: 1 }}
                exit={
                  reduceMotion
                    ? { width: 0, x: 0, opacity: 0 }
                    : { width: 0, x: panelWidth, opacity: 0.4 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
                }
                onAnimationStart={() =>
                  setRightWillChange("transform, opacity, width")
                }
                onAnimationComplete={() => setRightWillChange("auto")}
                style={{ willChange: rightWillChange }}
              >
                <ThemeVideo slot="right-panel" className="opacity-20 z-0" />
                <div
                  className="relative z-10 flex h-full flex-col"
                  style={{ width: panelWidth, flexShrink: 0 }}
                >
                  <RightPanelToggle
                    active={rightPanelSections}
                    sections={["calculator", "styler"]}
                    onToggle={toggleSection}
                  />
                  <div className="relative flex flex-1 flex-col overflow-y-auto scrollbar-thin">
                    <div
                      className={`grid ${
                        showCalcContent
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                      style={{
                        gridTemplateRows: showCalcContent ? "1fr" : "0fr",
                        opacity: showCalcContent ? 1 : 0,
                        transition: reduceMotion
                          ? "none"
                          : "grid-template-rows 280ms cubic-bezier(0.32,0.72,0,1), opacity 200ms ease",
                      }}
                      aria-hidden={!showCalcContent}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <TokenCalculator />
                      </div>
                    </div>
                    <div
                      className={`grid ${
                        showCalcContent && showStylerContent
                          ? "border-t border-border"
                          : ""
                      } ${
                        showStylerContent
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                      style={{
                        gridTemplateRows: showStylerContent ? "1fr" : "0fr",
                        opacity: showStylerContent ? 1 : 0,
                        transition: reduceMotion
                          ? "none"
                          : "grid-template-rows 280ms cubic-bezier(0.32,0.72,0,1), opacity 200ms ease",
                      }}
                      aria-hidden={!showStylerContent}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <ThemeStyler />
                      </div>
                    </div>
                    {!showCalcContent && !showStylerContent && (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                        <div className="flex gap-2 text-text-muted">
                          <Calculator className="h-6 w-6" />
                          <Palette className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-text-secondary">
                          Nothing selected
                        </p>
                        <p className="max-w-[16rem] text-xs text-text-muted">
                          Toggle{" "}
                          <span className="text-text-secondary">Tokens</span> to
                          estimate context usage, or{" "}
                          <span className="text-text-secondary">Styler</span> to
                          fine-tune the editor&rsquo;s look. Pick one above to
                          get started.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </main>
        <SettingsPanel />
      </div>
      {projectsMounted && (
        <Suspense fallback={null}>
          <ProjectsPage />
        </Suspense>
      )}
      <Suspense fallback={null}>
        <TemplateGallery
          isOpen={templatesOpen}
          onClose={() => {
            useGlobalStore.getState().setActivePanel("editor");
          }}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ChainingView />
      </Suspense>
      {musicActivated && (
        <Suspense fallback={null}>
          <MusicPlayer />
        </Suspense>
      )}
      <XmlTagGallery
        isOpen={xmlTagsOpen}
        onClose={() => setXmlTagsOpen(false)}
        onInsertTag={handleInsertXmlTag}
      />
    </div>
  );
}
