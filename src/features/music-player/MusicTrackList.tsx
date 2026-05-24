import { useState, useRef } from "react";
import {
  Upload, GripVertical, Trash2, CheckSquare, Square, BookmarkPlus,
} from "lucide-react";
import { useMusicStore } from "./music-store";
import { NowPlayingBars } from "./NowPlayingBars";
import { SaveToPlaylistPopover } from "./MusicPlaylists";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { usePendingConfirm } from "@/hooks/usePendingConfirm";
import { toast } from "sonner";

function DragHandle({
  index,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  index: number;
  onDragStart: (i: number) => void;
  onDragOver: (e: React.DragEvent, i: number) => void;
  onDrop: (i: number) => void;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      className="flex cursor-grab items-center text-text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
    >
      <GripVertical className="h-3.5 w-3.5" />
    </div>
  );
}

function SaveToPlaylistButton({
  trackId,
  disabled,
}: {
  trackId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:bg-bg-secondary hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Save to playlist"
        title="Save to playlist"
      >
        <BookmarkPlus className="h-3 w-3" />
      </button>
      {open && (
        <SaveToPlaylistPopover
          trackIds={[trackId]}
          onClose={() => setOpen(false)}
          triggerRef={triggerRef}
        />
      )}
    </div>
  );
}

export function MusicTrackList() {
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const tab = useMusicStore((s) => s.tab);
  const multiSelectMode = useMusicStore((s) => s.multiSelectMode);
  const selectedTrackIds = useMusicStore((s) => s.selectedTrackIds);
  const activateTrack = useMusicStore((s) => s.activateTrack);
  const removeTrack = useMusicStore((s) => s.removeTrack);
  const addLocalFile = useMusicStore((s) => s.addLocalFile);
  const reorderTrack = useMusicStore((s) => s.reorderTrack);
  const setMultiSelectMode = useMusicStore((s) => s.setMultiSelectMode);
  const toggleTrackSelection = useMusicStore((s) => s.toggleTrackSelection);
  const clearSelection = useMusicStore((s) => s.clearSelection);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [bulkPickerOpen, setBulkPickerOpen] = useState(false);
  const trackConfirm = usePendingConfirm();

  const showBulkPicker = bulkPickerOpen && multiSelectMode;
  const localTracks = tracks.filter((t) => t.isLocal);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        await addLocalFile(file);
      } catch {
        /* ignore individual file upload failures */
      }
    }
    e.target.value = "";
  };

  const handleDragStart = (i: number) => setDragIndex(i);
  const handleDragOver = (e: React.DragEvent, _i: number) => e.preventDefault();
  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex)
      reorderTrack(dragIndex, toIndex);
    setDragIndex(null);
  };

  return (
    <>
      {multiSelectMode && (
        <div className="relative mb-2 flex items-center gap-2 rounded-md border border-accent/30 bg-accent/5 px-2 py-1.5 text-[10px]">
          <span className="font-medium text-accent">
            {selectedTrackIds.length} selected
          </span>
          <span className="flex-1" />
          <button
            onClick={clearSelection}
            disabled={selectedTrackIds.length === 0}
            className="rounded px-1.5 py-0.5 text-text-muted hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
          <button
            ref={bulkTriggerRef}
            onClick={() => {
              if (selectedTrackIds.length === 0) return;
              setBulkPickerOpen((v) => !v);
            }}
            disabled={selectedTrackIds.length === 0}
            className="rounded bg-accent px-2 py-0.5 text-[10px] text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to Playlist
          </button>
          {showBulkPicker && selectedTrackIds.length > 0 && (
            <SaveToPlaylistPopover
              trackIds={selectedTrackIds}
              onClose={() => setBulkPickerOpen(false)}
              onSaved={() => {
                clearSelection();
                setMultiSelectMode(false);
                setBulkPickerOpen(false);
              }}
              triggerRef={bulkTriggerRef}
            />
          )}
        </div>
      )}

      {tab === "local" ? (
        <>
          <div className="max-h-32 space-y-0.5 overflow-y-auto scrollbar-thin">
            {localTracks.length === 0 ? (
              <div className="py-3 text-center text-[10px] text-text-muted">
                No local audio yet. Use &ldquo;Add local audio&rdquo;
                below to upload.
              </div>
            ) : (
              localTracks.map((track) => {
                const isCurrent =
                  tracks[currentTrackIndex]?.id === track.id;
                const isSelected = selectedTrackIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    className={`group flex items-center gap-1 rounded-md transition-colors ${
                      isCurrent
                        ? "bg-accent/10"
                        : isSelected
                          ? "bg-accent/5"
                          : "hover:bg-bg-secondary"
                    }`}
                  >
                    {multiSelectMode && (
                      <button
                        onClick={() => toggleTrackSelection(track.id)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center text-text-muted hover:text-accent"
                        aria-label={
                          isSelected
                            ? "Deselect track"
                            : "Select track"
                        }
                      >
                        {isSelected ? (
                          <CheckSquare className="h-3 w-3 text-accent" />
                        ) : (
                          <Square className="h-3 w-3" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (multiSelectMode) {
                          toggleTrackSelection(track.id);
                        } else {
                          activateTrack(track.id);
                        }
                      }}
                      className={`flex flex-1 items-center gap-2 px-2 py-1.5 text-xs ${isCurrent ? "text-accent" : "text-text-secondary"}`}
                    >
                      {isCurrent && isPlaying && <NowPlayingBars />}
                      <span className="truncate">{track.title}</span>
                      <span className="shrink-0 rounded bg-bg-secondary px-1 text-[10px] text-text-muted">
                        local
                      </span>
                    </button>
                    {!multiSelectMode && (
                      <>
                        <SaveToPlaylistButton trackId={track.id} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            trackConfirm.request(track.id);
                          }}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                          aria-label={`Delete ${track.title} from library`}
                          title="Delete from library"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-3 w-3" />
            Add local audio
          </button>
        </>
      ) : (
        <>
          <div className="max-h-32 space-y-0.5 overflow-y-auto scrollbar-thin">
            {tracks.map((track, i) => {
              const isSelected = selectedTrackIds.includes(track.id);
              const isCurrent = i === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  className={`group flex items-center gap-1 rounded-md transition-colors ${
                    isCurrent
                      ? "bg-accent/10"
                      : isSelected
                        ? "bg-accent/5"
                        : "hover:bg-bg-secondary"
                  } ${dragIndex === i ? "opacity-50" : ""}`}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                >
                  {!multiSelectMode && (
                    <DragHandle
                      index={i}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  )}
                  {multiSelectMode && (
                    <button
                      onClick={() => toggleTrackSelection(track.id)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center text-text-muted hover:text-accent"
                      aria-label={
                        isSelected ? "Deselect track" : "Select track"
                      }
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3 w-3 text-accent" />
                      ) : (
                        <Square className="h-3 w-3" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (multiSelectMode) {
                        toggleTrackSelection(track.id);
                      } else {
                        activateTrack(track.id);
                      }
                    }}
                    className={`flex flex-1 items-center gap-2 px-1 py-1.5 text-xs ${isCurrent ? "text-accent" : "text-text-secondary"}`}
                  >
                    {isCurrent && isPlaying && <NowPlayingBars />}
                    <span className="truncate">{track.title}</span>
                    {track.isLocal && (
                      <span className="shrink-0 rounded bg-bg-secondary px-1 text-[10px] text-text-muted">
                        local
                      </span>
                    )}
                  </button>
                  {!multiSelectMode && (
                    <SaveToPlaylistButton trackId={track.id} />
                  )}
                </div>
              );
            })}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-1.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Upload className="h-3 w-3" />
            Add local audio
          </button>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />
      <ConfirmDialog
        open={trackConfirm.isOpen}
        title={(() => {
          const t = tracks.find((t) => t.id === trackConfirm.pendingId);
          return t ? `Delete "${t.title}" from library?` : "Delete track?";
        })()}
        destructive
        confirmLabel="Delete"
        message="This will remove the audio file from your library and from any playlists it lives in. This cannot be undone."
        onConfirm={() => {
          if (trackConfirm.pendingId) {
            void removeTrack(trackConfirm.pendingId);
            toast.success("Track deleted");
          }
          trackConfirm.clear();
        }}
        onCancel={() => trackConfirm.clear()}
      />
    </>
  );
}
