import { useState } from "react";
import { motion } from "framer-motion";
import { Slash, Plus, PenLine, X } from "lucide-react";
import { useSlashStore } from "./slash-store";
import { GalleryModal } from "@/components/modals/GalleryModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { toast } from "sonner";

interface SlashCommandGalleryProps {
  open: boolean;
  onClose: () => void;
}

const SLASH_GALLERY_PANEL_CLASS =
  "panel-surface w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-xl border border-border shadow-2xl gpu-accelerated";

const SLASH_GALLERY_PANEL_MOTION = {
  initial: { opacity: 0, scale: 0.95, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 12 },
  transition: { type: "spring", stiffness: 400, damping: 30 },
} as const;

export function SlashCommandGallery({ open, onClose }: SlashCommandGalleryProps) {
  const openCreateModal = useSlashStore((s) => s.openCreateModal);
  const getAllCommands = useSlashStore((s) => s.getAllCommands);
  const setEditingCommand = useSlashStore((s) => s.setEditingCommand);
  const deleteCommand = useSlashStore((s) => s.deleteCommand);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(
    null,
  );

  return (
    <>
    <GalleryModal
      open={open}
      onClose={onClose}
      ariaLabel="Slash Commands"
      zIndex="z-50"
      panelClassName={SLASH_GALLERY_PANEL_CLASS}
      panelMotion={SLASH_GALLERY_PANEL_MOTION}
    >
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-bg-elevated">
              <h2 className="text-base font-semibold text-text-primary">
                Slash Commands
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    openCreateModal();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Command
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-bg-secondary"
                  aria-label="Close gallery"
                >
                  <X className="h-4 w-4 text-text-muted" />
                </button>
              </div>
            </div>
            <div
              className="overflow-y-auto p-4 scrollbar-thin bg-bg-elevated"
              style={{ maxHeight: "calc(80vh - 65px)" }}
            >
              <div className="grid grid-cols-3 gap-3">
                {getAllCommands().map((cmd) => (
                  <motion.div
                    key={cmd.name}
                    className="group relative flex flex-col items-center gap-2 rounded-xl border border-border bg-bg-primary p-4 text-center transition-all hover:border-accent/30 hover:bg-bg-secondary cursor-pointer"
                    whileHover={{ y: -2 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Slash className="h-5 w-5 text-accent" />
                    </div>
                    <div className="w-full">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-semibold text-text-primary truncate">
                          {cmd.name}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium leading-none ${
                            cmd.category === "built-in"
                              ? "bg-accent/20 text-accent"
                              : "bg-bg-secondary text-text-muted"
                          }`}
                        >
                          {cmd.category === "built-in" ? "core" : "custom"}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-text-muted leading-tight line-clamp-2">
                        {cmd.description || "No description"}
                      </p>
                    </div>
                    {cmd.category === "user" && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            setEditingCommand(cmd);
                          }}
                          className="rounded bg-bg-secondary p-1 text-[10px] text-text-muted hover:text-accent"
                          title="Edit"
                        >
                          <PenLine className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteName(cmd.name);
                          }}
                          className="rounded bg-bg-secondary p-1 text-[10px] text-text-muted hover:text-error"
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
    </GalleryModal>
    <ConfirmDialog
      open={pendingDeleteName !== null}
      title={
        pendingDeleteName
          ? `Delete ${pendingDeleteName}?`
          : "Delete slash command?"
      }
      destructive
      confirmLabel="Delete"
      message="This slash command will be permanently removed. This cannot be undone."
      onConfirm={() => {
        if (pendingDeleteName) {
          deleteCommand(pendingDeleteName);
          toast.success("Command deleted");
        }
        setPendingDeleteName(null);
      }}
      onCancel={() => setPendingDeleteName(null)}
    />
    </>
  );
}
