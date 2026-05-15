import { create } from "zustand";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";
import { STORAGE_KEYS } from "@/lib/constants";
import { resolveFontFamily } from "@/lib/theme/fonts";
import {
  THEME_CLASSES,
  THEME_BG_CLASSES,
  DEFAULT_THEME_STYLES,
  type WebsiteTheme,
  type ThemeStyleSettings,
} from "@/lib/theme/theme-registry";
import { shouldDefaultOpenLeftPanel, shouldDefaultOpenRightPanel } from "@/lib/panel-breakpoints";

export interface AutoCorrectRule {
  from: string;
  to: string;
}

interface Settings {
  websiteTheme: WebsiteTheme;
  spellcheck: boolean;
  tabBehavior: "insert" | "focus";
  defaultEditorTheme: string;
  slashInsertionMode: "inline" | "block";
  autoSaveInterval: number;
  defaultModel: string;
  autoCorrectEnabled: boolean;
  autoCorrectRules: AutoCorrectRule[];
  themeFontFamily: string;
  themeFontSize: number;
  themeFontColor: string;
  themeLineHeight: number;
  themeLetterSpacing: number;
  perThemeStyles: Record<string, ThemeStyleSettings>;
}

const DEFAULT_AUTO_CORRECT_RULES: AutoCorrectRule[] = [
  { from: "doesnt", to: "doesn't" },
  { from: "dont", to: "don't" },
  { from: "isnt", to: "isn't" },
  { from: "aint", to: "ain't" },
  { from: "cant", to: "can't" },
  { from: "wont", to: "won't" },
  { from: "wouldnt", to: "wouldn't" },
  { from: "couldnt", to: "couldn't" },
  { from: "shouldnt", to: "shouldn't" },
  { from: "didnt", to: "didn't" },
  { from: "hasnt", to: "hasn't" },
  { from: "hadnt", to: "hadn't" },
  { from: "wasnt", to: "wasn't" },
  { from: "werent", to: "weren't" },
  { from: "youre", to: "you're" },
  { from: "theyre", to: "they're" },
  { from: "hes", to: "he's" },
  { from: "shes", to: "she's" },
  { from: "thats", to: "that's" },
  { from: "whats", to: "what's" },
  { from: "whos", to: "who's" },
  { from: "wheres", to: "where's" },
  { from: "heres", to: "here's" },
  { from: "theres", to: "there's" },
  { from: "ive", to: "I've" },
  { from: "youve", to: "you've" },
  { from: "weve", to: "we've" },
  { from: "theyve", to: "they've" },
  { from: "youll", to: "you'll" },
  { from: "theyll", to: "they'll" },
  { from: "im", to: "I'm" },
];

const DEFAULT_SETTINGS: Settings = {
  websiteTheme: "default",
  spellcheck: true,
  tabBehavior: "insert",
  defaultEditorTheme: "modern",
  slashInsertionMode: "block",
  autoSaveInterval: 5,
  defaultModel: "claude-opus-4-5",
  autoCorrectEnabled: true,
  autoCorrectRules: DEFAULT_AUTO_CORRECT_RULES,
  themeFontFamily: "",
  themeFontSize: 16,
  themeFontColor: "",
  themeLineHeight: 1.6,
  themeLetterSpacing: 0,
  perThemeStyles: { ...DEFAULT_THEME_STYLES },
};

interface GlobalState {
  settings: Settings;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  userOverrodeSidebar: boolean;
  userOverrodeRightPanel: boolean;
  settingsPanelOpen: boolean;
  activePanel: string;
  themesExpanded: boolean;
  updateSettings: (partial: Partial<Settings>) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  toggleRightPanel: () => void;
  setRightPanelOpen: (v: boolean) => void;
  toggleSettingsPanel: () => void;
  setSettingsPanelOpen: (v: boolean) => void;
  setActivePanel: (panel: string) => void;
  setThemesExpanded: (expanded: boolean) => void;
  toggleThemesExpanded: () => void;
  collapseThemesSubmenu: () => void;
  addAutoCorrectRule: (from: string, to: string) => void;
  removeAutoCorrectRule: (from: string) => void;
  initializeSettings: () => void;
  getThemeClass: () => string;
  getThemeBgClass: () => string;
  updateThemeStyle: (
    theme: string,
    partial: Partial<ThemeStyleSettings>,
  ) => void;
  resetThemeStyle: (theme: string) => void;
  getActiveThemeStyle: () => ThemeStyleSettings;
}

function applyThemeClasses(websiteTheme: WebsiteTheme) {
  const el = document.documentElement;
  Object.values(THEME_CLASSES).forEach((cls) => {
    if (cls) el.classList.remove(cls);
  });

  if (websiteTheme !== "default") {
    const themeClass = THEME_CLASSES[websiteTheme];
    if (themeClass) el.classList.add(themeClass);
    el.classList.remove("dark");
  } else {
    el.classList.add("dark");
  }
}
function applyThemeFont(settings: Settings) {
  const theme = settings.websiteTheme;
  const style =
    settings.perThemeStyles[theme] ??
    DEFAULT_THEME_STYLES[theme] ??
    DEFAULT_THEME_STYLES["default"];
  const el = document.documentElement;
  el.style.setProperty(
    "--user-theme-font",
    resolveFontFamily(style.fontFamily),
  );
}

function initialSidebarOpen(): boolean {
  if (typeof window === "undefined") return true;
  return shouldDefaultOpenLeftPanel(window.innerWidth);
}

function initialRightPanelOpen(): boolean {
  if (typeof window === "undefined") return true;
  return shouldDefaultOpenRightPanel(window.innerWidth);
}

export const useGlobalStore = create<GlobalState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  sidebarOpen: initialSidebarOpen(),
  rightPanelOpen: initialRightPanelOpen(),
  userOverrodeSidebar: false,
  userOverrodeRightPanel: false,
  settingsPanelOpen: false,
  activePanel: "editor",
  themesExpanded: false,

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    setToLocalStorage(STORAGE_KEYS.SETTINGS, updated);

    if (partial.websiteTheme !== undefined) {
      applyThemeClasses(updated.websiteTheme);
    }
    if (
      partial.websiteTheme !== undefined ||
      partial.perThemeStyles !== undefined
    ) {
      applyThemeFont(updated);
    }
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarOpen: !s.sidebarOpen, userOverrodeSidebar: true }));
  },

  setSidebarOpen: (v) => {
    set({ sidebarOpen: v, userOverrodeSidebar: true });
  },

  toggleRightPanel: () => {
    set((s) => ({
      rightPanelOpen: !s.rightPanelOpen,
      userOverrodeRightPanel: true,
    }));
  },

  setRightPanelOpen: (v) => {
    set({ rightPanelOpen: v, userOverrodeRightPanel: true });
  },

  toggleSettingsPanel: () =>
    set((s) => ({ settingsPanelOpen: !s.settingsPanelOpen })),

  setSettingsPanelOpen: (v) => set({ settingsPanelOpen: v }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setThemesExpanded: (expanded) => set({ themesExpanded: expanded }),

  toggleThemesExpanded: () =>
    set((s) => ({ themesExpanded: !s.themesExpanded })),

  collapseThemesSubmenu: () => {
    if (get().themesExpanded) {
      set({ themesExpanded: false });
    }
  },

  addAutoCorrectRule: (from, to) => {
    const rules = [...get().settings.autoCorrectRules, { from, to }];
    get().updateSettings({ autoCorrectRules: rules });
  },

  removeAutoCorrectRule: (from) => {
    const rules = get().settings.autoCorrectRules.filter(
      (r) => r.from !== from,
    );
    get().updateSettings({ autoCorrectRules: rules });
  },

  getThemeClass: () => THEME_CLASSES[get().settings.websiteTheme] || "",
  getThemeBgClass: () => THEME_BG_CLASSES[get().settings.websiteTheme] || "",

  updateThemeStyle: (theme, partial) => {
    const current =
      get().settings.perThemeStyles[theme] ??
      DEFAULT_THEME_STYLES[theme] ??
      DEFAULT_THEME_STYLES["default"];
    const updated = { ...current, ...partial };
    const perThemeStyles = {
      ...get().settings.perThemeStyles,
      [theme]: updated,
    };
    get().updateSettings({ perThemeStyles });
  },

  resetThemeStyle: (theme) => {
    const defaults =
      DEFAULT_THEME_STYLES[theme] ?? DEFAULT_THEME_STYLES["default"];
    const perThemeStyles = {
      ...get().settings.perThemeStyles,
      [theme]: { ...defaults },
    };
    const newSettings = { ...get().settings, perThemeStyles };
    set({ settings: newSettings });
    setToLocalStorage(STORAGE_KEYS.SETTINGS, newSettings);
    applyThemeFont(newSettings);
  },

  getActiveThemeStyle: () => {
    const theme = get().settings.websiteTheme;
    return (
      get().settings.perThemeStyles[theme] ??
      DEFAULT_THEME_STYLES[theme] ??
      DEFAULT_THEME_STYLES["default"]
    );
  },

  initializeSettings: () => {
    const saved = getFromLocalStorage<Partial<Settings>>(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const merged: Settings = {
        ...DEFAULT_SETTINGS,
        ...saved,
        autoCorrectRules: saved.autoCorrectRules ?? DEFAULT_AUTO_CORRECT_RULES,
        websiteTheme: saved.websiteTheme ?? "default",
        perThemeStyles: {
          ...DEFAULT_THEME_STYLES,
          ...(saved.perThemeStyles ?? {}),
        },
      };
      set({ settings: merged });
      applyThemeClasses(merged.websiteTheme);
      applyThemeFont(merged);
    } else {
      applyThemeClasses(DEFAULT_SETTINGS.websiteTheme);
      applyThemeFont(DEFAULT_SETTINGS);
    }

    if (typeof window === "undefined") return;

    set({
      sidebarOpen: shouldDefaultOpenLeftPanel(window.innerWidth),
      rightPanelOpen: shouldDefaultOpenRightPanel(window.innerWidth),
      userOverrodeSidebar: false,
      userOverrodeRightPanel: false,
    });

    const handleResize = () => {
      const state = get();
      const w = window.innerWidth;
      const patch: Partial<GlobalState> = {};
      if (!state.userOverrodeSidebar) {
        const next = shouldDefaultOpenLeftPanel(w);
        if (next !== state.sidebarOpen) patch.sidebarOpen = next;
      }
      if (!state.userOverrodeRightPanel) {
        const next = shouldDefaultOpenRightPanel(w);
        if (next !== state.rightPanelOpen) patch.rightPanelOpen = next;
      }
      if (Object.keys(patch).length > 0) set(patch);
    };
    window.addEventListener("resize", handleResize);
  },
}));
