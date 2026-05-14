import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useGlobalStore } from "@/stores/global-store";
import { CenteredModal } from "@/components/modals/CenteredModal";

export function SettingsPanel() {
  const settingsPanelOpen = useGlobalStore((s) => s.settingsPanelOpen);
  const settings = useGlobalStore((s) => s.settings);
  const updateSettings = useGlobalStore((s) => s.updateSettings);
  const setSettingsPanelOpen = useGlobalStore((s) => s.setSettingsPanelOpen);
  const addAutoCorrectRule = useGlobalStore((s) => s.addAutoCorrectRule);
  const removeAutoCorrectRule = useGlobalStore((s) => s.removeAutoCorrectRule);
  const [newRuleFrom, setNewRuleFrom] = useState("");
  const [newRuleTo, setNewRuleTo] = useState("");

  const closePanel = useCallback(() => {
    setSettingsPanelOpen(false);
  }, [setSettingsPanelOpen]);

  const handleAddRule = useCallback(() => {
    if (newRuleFrom.trim() && newRuleTo.trim()) {
      addAutoCorrectRule(newRuleFrom.trim().toLowerCase(), newRuleTo.trim());
      setNewRuleFrom("");
      setNewRuleTo("");
    }
  }, [newRuleFrom, newRuleTo, addAutoCorrectRule]);

  return (
    <CenteredModal
      open={settingsPanelOpen}
      onClose={closePanel}
      ariaLabel="Settings"
      topOffsetClass="pt-[14vh]"
    >
      <div className="flex max-h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">
            Settings
          </h2>
          <button
            onClick={closePanel}
            type="button"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-text-muted transition-[background-color,border-color,color,transform] duration-150 ease-out hover:border-border hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-95"
            aria-label="Close settings"
          >
            <X className="h-[18px] w-[18px] transition-colors duration-150" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
          <SettingCard
            title="Spellcheck"
            description="Browser-native spellcheck for text input"
          >
            <div className="mt-3">
              <ToggleSwitch
                checked={settings.spellcheck}
                onChange={(v) => updateSettings({ spellcheck: v })}
              />
            </div>
          </SettingCard>

          <SettingCard
            title="Slash Insertion Mode"
            description="How slash command content is inserted into the editor"
          >
            <div className="mt-3 flex gap-2">
              <OptionButton
                active={settings.slashInsertionMode === "inline"}
                onClick={() => updateSettings({ slashInsertionMode: "inline" })}
                label="Inline"
                description="Continue on same line"
              />
              <OptionButton
                active={settings.slashInsertionMode === "block"}
                onClick={() => updateSettings({ slashInsertionMode: "block" })}
                label="Block"
                description="Insert on new line"
              />
            </div>
          </SettingCard>

          <SettingCard
            title="Auto-Correct"
            description="Automatically fix common punctuation and spelling as you type"
          >
            <div className="mt-3">
              <ToggleSwitch
                checked={settings.autoCorrectEnabled}
                onChange={(v) => updateSettings({ autoCorrectEnabled: v })}
              />
            </div>
          </SettingCard>

          {settings.autoCorrectEnabled && (
            <>
              <SettingCard
                title="Add Custom Rule"
                description="Define your own auto-correction replacements"
              >
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    <input
                      type="text"
                      placeholder="Type wrong..."
                      value={newRuleFrom}
                      onChange={(e) => setNewRuleFrom(e.target.value)}
                      className="w-full min-w-0 flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddRule();
                      }}
                    />
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-text-muted sm:block" />
                    <input
                      type="text"
                      placeholder="Corrected"
                      value={newRuleTo}
                      onChange={(e) => setNewRuleTo(e.target.value)}
                      className="w-full min-w-0 flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddRule();
                      }}
                    />
                  </div>
                  <button
                    onClick={handleAddRule}
                    disabled={!newRuleFrom.trim() || !newRuleTo.trim()}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Rule
                  </button>
                </div>
              </SettingCard>

              <SettingCard
                title={`Active Rules (${settings.autoCorrectRules.length})`}
                description="Words that will be auto-corrected"
              >
                <div className="mt-3 max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
                  {settings.autoCorrectRules.map((rule) => (
                    <div
                      key={rule.from}
                      className="flex items-center justify-between rounded-lg bg-bg-secondary px-3 py-1.5"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-xs">
                        <span className="truncate text-text-muted line-through">
                          {rule.from}
                        </span>
                        <ChevronRight className="h-3 w-3 shrink-0 text-text-muted" />
                        <span className="truncate font-medium text-text-primary">
                          {rule.to}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAutoCorrectRule(rule.from)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                        aria-label={`Remove rule for ${rule.from}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </SettingCard>
            </>
          )}
        </div>
      </div>
    </CenteredModal>
  );
}

function SettingCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-primary p-4">
      <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      <p className="mt-0.5 text-xs text-text-muted">{description}</p>
      {children}
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  label,
  description,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg border px-3 py-2.5 text-center transition-all ${
        active
          ? "border-accent bg-accent/10"
          : "border-border bg-bg-secondary hover:bg-bg-elevated"
      }`}
    >
      <span
        className={`text-sm font-medium ${active ? "text-accent" : "text-text-primary"}`}
      >
        {label}
      </span>
      <span className="text-[10px] text-text-muted">{description}</span>
    </button>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-bg-secondary border border-border"
      }`}
    >
      <motion.div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
