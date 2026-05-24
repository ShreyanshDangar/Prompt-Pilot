import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ChevronDown } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import {
  DEFAULT_THEME_STYLES,
  THEME_DISPLAY_NAMES,
  type ThemeStyleSettings,
} from "@/lib/theme/theme-registry";
import { getThemeFontOptions } from "@/lib/theme/fonts";

const THEME_COLOR_PRESETS: Record<string, string[]> = {
  default: ["#f9fafb", "#818cf8", "#a1a1aa", "#10b981", "#f59e0b"],
  aurora: ["#e8edf5", "#7dd3a8", "#a0b0cc", "#6ee7b7", "#fde68a"],
  cyber: ["#00f0ff", "#ff00ff", "#7de8f0", "#ff3366", "#00ff88"],
  zen: ["#2d3b28", "#4a8c5c", "#4a5e43", "#7a9070", "#c49a3c"],
  writer: ["#2c1810", "#8b5e3c", "#5c4030", "#5c8a50", "#c49a3c"],
  neural: ["#e0e8f8", "#4a90f0", "#8da0c4", "#4af0a0", "#f0c84a"],
};

function isStyleDefault(current: ThemeStyleSettings, theme: string): boolean {
  const defaults =
    DEFAULT_THEME_STYLES[theme] ?? DEFAULT_THEME_STYLES["default"];
  return (
    current.fontFamily === defaults.fontFamily &&
    current.fontSize === defaults.fontSize &&
    current.fontColor === defaults.fontColor &&
    current.lineHeight === defaults.lineHeight &&
    current.letterSpacing === defaults.letterSpacing
  );
}
function SliderRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="gpu-accelerated">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium tracking-wide text-text-secondary uppercase">
          {label}
        </span>
        <span className="rounded-md bg-bg-secondary px-2 py-0.5 text-[11px] font-mono text-accent tabular-nums">
          {displayValue}
        </span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-bg-secondary">
          <motion.div
            className="h-full rounded-full bg-accent/40"
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="range-slider relative z-10"
        />
      </div>
    </div>
  );
}

export function ThemeStyler() {
  const theme = useGlobalStore((s) => s.settings.websiteTheme);
  const style = useGlobalStore((s) => s.getActiveThemeStyle());
  const updateThemeStyle = useGlobalStore((s) => s.updateThemeStyle);
  const resetThemeStyle = useGlobalStore((s) => s.resetThemeStyle);

  const availableFonts = getThemeFontOptions(theme);
  const colorPresets =
    THEME_COLOR_PRESETS[theme] ?? THEME_COLOR_PRESETS["default"];
  const themeName = THEME_DISPLAY_NAMES[theme];

  const isDefault = useMemo(() => isStyleDefault(style, theme), [style, theme]);
  const update = (partial: Partial<ThemeStyleSettings>) => {
    updateThemeStyle(theme, partial);
  };

  return (
    <div className="flex flex-col p-4 scrollbar-thin gpu-accelerated">
      <div className="mb-4">
        <h3 className="text-xs font-semibold tracking-wider text-text-primary uppercase">
          Theme Styler
        </h3>
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <span className="text-[11px] font-medium text-accent">
            {themeName}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <span className="mb-2 block text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            Font Family
          </span>
          <div className="relative">
            <select
              value={style.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full appearance-none rounded-lg border border-border bg-bg-primary px-3 py-2 pr-8 text-xs text-text-primary transition-all duration-200 focus:border-accent focus:outline-none"
              style={{
                fontFamily: availableFonts.find(
                  (font) => font.name === style.fontFamily,
                )?.fontFamily,
              }}
            >
              {availableFonts.map((font) => (
                <option
                  key={font.name}
                  value={font.name}
                  style={{ fontFamily: font.fontFamily }}
                >
                  {font.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
        <SliderRow
          label="Font Size"
          value={style.fontSize}
          displayValue={`${style.fontSize}px`}
          min={12}
          max={28}
          onChange={(v) => update({ fontSize: v })}
        />
        <div>
          <span className="mb-2 block text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            Font Color
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {colorPresets.map((color) => (
              <motion.button
                key={color}
                onClick={() => update({ fontColor: color })}
                className={`relative h-7 w-7 rounded-full transition-all duration-200 ${
                  style.fontColor === color
                    ? "ring-2 ring-accent ring-offset-2 ring-offset-bg-primary"
                    : "ring-1 ring-border hover:ring-text-muted"
                }`}
                style={{ backgroundColor: color }}
                title={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={style.fontColor || colorPresets[0]}
                onChange={(e) => update({ fontColor: e.target.value })}
                className="absolute inset-0 h-7 w-7 cursor-pointer opacity-0"
                title="Custom color"
              />
              <div className="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-border">
                <div
                  className="h-4 w-4 rounded-sm"
                  style={{
                    background:
                      "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <SliderRow
          label="Line Height"
          value={style.lineHeight}
          displayValue={style.lineHeight.toFixed(1)}
          min={1}
          max={2.5}
          step={0.1}
          onChange={(v) => update({ lineHeight: v })}
        />

        <SliderRow
          label="Letter Spacing"
          value={style.letterSpacing}
          displayValue={`${style.letterSpacing}px`}
          min={-1}
          max={5}
          step={0.5}
          onChange={(v) => update({ letterSpacing: v })}
        />
      </div>

      <AnimatePresence>
        {!isDefault && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <button
              onClick={() => resetThemeStyle(theme)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-bg-secondary/50 px-4 py-2.5 text-xs font-medium text-text-secondary backdrop-blur-sm transition-all duration-200 hover:border-accent/30 hover:bg-accent/5 hover:text-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset {themeName} to Defaults
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
