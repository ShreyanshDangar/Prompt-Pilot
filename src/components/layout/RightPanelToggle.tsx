import { Calculator, Paintbrush } from "lucide-react";

export type RightPanelSection = "calculator" | "styler";

export function RightPanelToggle({
  active,
  sections,
  onToggle,
}: {
  active: Set<RightPanelSection>;
  sections: RightPanelSection[];
  onToggle: (s: RightPanelSection) => void;
}) {
  return (
    <div className="flex shrink-0 border-b border-border">
      {sections.map((s) => {
        const isActive = active.has(s);
        const icon =
          s === "calculator" ? (
            <Calculator className="h-3.5 w-3.5" />
          ) : (
            <Paintbrush className="h-3.5 w-3.5" />
          );
        const label = s === "calculator" ? "Tokens" : "Styler";

        return (
          <button
            key={s}
            onClick={() => onToggle(s)}
            className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 border-transparent px-2 py-2  text-[12px] font-medium transition-colors ${
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "text-text-muted hover:bg-bg-secondary hover:text-text-secondary"
            }`}
          >
            {icon}
            {label}
          </button>
        );
      })}
    </div>
  );
}
