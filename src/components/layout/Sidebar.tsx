import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { FileText, Slash, FolderOpen, BookOpen, Link2, Keyboard, X, Palette, Sparkles, Zap, Leaf, PenLine,
  BrainCircuit, Monitor, Code2, ChevronRight } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import { useProjectsStore } from "@/features/projects/projects-store";
import { useChainingStore } from "@/features/prompt-chaining/chaining-store";
import { useKeyboardStore } from "@/features/virtual-keyboard/keyboard-store";
import { useSlashStore } from "@/features/slash-commands/slash-store";
import { SlashCommandModal } from "@/features/slash-commands/SlashCommandModal";
import { SlashCommandGallery } from "@/features/slash-commands/SlashCommandGallery";
import { useXmlTagsStore } from "@/features/xml-tags/xml-tags-store";
import { ThemeVideo } from "@/components/ThemeVideo";
import { SIDEBAR_WIDTH } from "@/lib/panel-breakpoints";
import { THEME_DISPLAY_NAMES, type WebsiteTheme } from "@/lib/theme/theme-registry";

const WEBSITE_THEMES: { id: WebsiteTheme; label: string; icon: typeof Monitor }[] = [
  { id: "default", label: THEME_DISPLAY_NAMES.default, icon: Monitor },
  { id: "aurora", label: THEME_DISPLAY_NAMES.aurora, icon: Sparkles },
  { id: "cyber", label: THEME_DISPLAY_NAMES.cyber, icon: Zap },
  { id: "zen", label: THEME_DISPLAY_NAMES.zen, icon: Leaf },
  { id: "writer", label: THEME_DISPLAY_NAMES.writer, icon: PenLine },
  { id: "neural", label: THEME_DISPLAY_NAMES.neural, icon: BrainCircuit },
];

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function Sidebar() {
  const sidebarOpen = useGlobalStore((s) => s.sidebarOpen);
  const toggleSidebar = useGlobalStore((s) => s.toggleSidebar);
  const setActivePanel = useGlobalStore((s) => s.setActivePanel);
  const activePanel = useGlobalStore((s) => s.activePanel);
  const setProjectsOpen = useProjectsStore((s) => s.setOpen);
  const setChainingOpen = useChainingStore((s) => s.setOpen);
  const toggleKeyboard = useKeyboardStore((s) => s.toggleVisible);
  const userCommands = useSlashStore((s) => s.userCommands);
  const isCreateModalOpen = useSlashStore((s) => s.isCreateModalOpen);
  const websiteTheme = useGlobalStore((s) => s.settings.websiteTheme);
  const updateSettings = useGlobalStore((s) => s.updateSettings);
  const setXmlTagsOpen = useXmlTagsStore((s) => s.setOpen);
  const themesExpanded = useGlobalStore((s) => s.themesExpanded);
  const toggleThemesExpanded = useGlobalStore((s) => s.toggleThemesExpanded);
  const [slashGalleryOpen, setSlashGalleryOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const [willChange, setWillChange] = useState<string>("auto");

  const isThemed = websiteTheme !== "default";
  const glassClass = isThemed ? "glass-panel" : "";

  const navItems: SidebarNavItem[] = [
    {
      id: "editor",
      label: "Editor",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => setActivePanel("editor"),
    },
    {
      id: "projects",
      label: "Projects",
      icon: <FolderOpen className="h-4 w-4" />,
      onClick: () => setProjectsOpen(true),
    },
    {
      id: "templates",
      label: "Templates",
      icon: <BookOpen className="h-4 w-4" />,
      onClick: () => setActivePanel("templates"),
    },
    {
      id: "chains",
      label: "Prompt Chains",
      icon: <Link2 className="h-4 w-4" />,
      onClick: () => setChainingOpen(true),
    },
    {
      id: "keyboard",
      label: "Virtual Keyboard",
      icon: <Keyboard className="h-4 w-4" />,
      onClick: toggleKeyboard,
    },
  ];

  return (
    <>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-bg-overlay lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className={`fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] flex-col border-r border-border bg-bg-primary lg:relative lg:top-0 lg:z-0 ${glassClass} overflow-hidden`}
            initial={
              reduceMotion
                ? { width: SIDEBAR_WIDTH, x: 0, opacity: 0 }
                : { width: 0, x: -SIDEBAR_WIDTH, opacity: 0.4 }
            }
            animate={{ width: SIDEBAR_WIDTH, x: 0, opacity: 1 }}
            exit={
              reduceMotion
                ? { width: 0, x: 0, opacity: 0 }
                : { width: 0, x: -SIDEBAR_WIDTH, opacity: 0.4 }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.28, ease: [0.32, 0.72, 0, 1] }
            }
            onAnimationStart={() => setWillChange("transform, opacity, width")}
            onAnimationComplete={() => setWillChange("auto")}
            style={{ willChange }}
          >
            <ThemeVideo slot="left-panel" className="opacity-30 z-0" />
            <div
              className="flex h-full flex-col"
              style={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}
            >
            <div className="flex items-center justify-between px-4 py-3 lg:hidden relative z-10">
              <span className="text-sm font-medium text-text-secondary">
                Navigation
              </span>
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-bg-secondary"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 text-text-muted" />
              </button>
            </div>
            <nav className="relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2 scrollbar-thin">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activePanel === item.id
                      ? "bg-accent/10 text-accent"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              <button
                onClick={() => setSlashGalleryOpen(true)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <Slash className="h-4 w-4" />
                Slash Commands
                {userCommands.length > 0 && (
                  <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                    {userCommands.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setXmlTagsOpen(true)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
              >
                <Code2 className="h-4 w-4" />
                XML Tags
              </button>

              <button
                onClick={toggleThemesExpanded}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  themesExpanded
                    ? "bg-accent/10 text-accent"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <Palette className="h-4 w-4" />
                Themes
                <motion.span
                  className={`ml-auto flex items-center text-text-secondary transition-opacity duration-150 ${
                    themesExpanded
                      ? "opacity-[0.65]"
                      : "opacity-0 group-hover:opacity-[0.65]"
                  }`}
                  animate={{ rotate: themesExpanded ? 90 : 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  aria-hidden="true"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.span>
              </button>

              <AnimatePresence>
                {themesExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 pl-4">
                      {WEBSITE_THEMES.map((theme) => {
                        const Icon = theme.icon;
                        const isActive = websiteTheme === theme.id;
                        return (
                          <motion.button
                            key={theme.id}
                            onClick={() =>
                              updateSettings({ websiteTheme: theme.id })
                            }
                            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition-all ${
                              isActive
                                ? "bg-accent/10 text-accent"
                                : "text-text-muted hover:bg-bg-secondary hover:text-text-secondary"
                            }`}
                            whileHover={{ x: 2 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{theme.label}</span>
                            {isActive && (
                              <motion.div
                                className="ml-auto h-1.5 w-1.5 rounded-full bg-accent"
                                layoutId="theme-indicator"
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      <SlashCommandGallery
        open={slashGalleryOpen}
        onClose={() => setSlashGalleryOpen(false)}
      />
      {isCreateModalOpen && <SlashCommandModal />}
    </>
  );
}
