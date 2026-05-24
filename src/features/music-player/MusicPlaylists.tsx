import { useState, useRef } from "react";
import {
  X, GripVertical, ListPlus, Plus, Trash2, ChevronLeft,
  CheckSquare, Square, Pencil, Check,
} from "lucide-react";
import { useMusicStore } from "./music-store";
import type { Playlist } from "./music-types";
import { NowPlayingBars } from "./NowPlayingBars";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { usePendingConfirm } from "@/hooks/usePendingConfirm";
import { useInlineRename } from "@/hooks/useInlineRename";
import { toast } from "sonner";

function PlaylistName({
  playlist,
  className,
}: {
  playlist: Playlist;
  className?: string;
}) {
  const renamePlaylist = useMusicStore((s) => s.renamePlaylist);
  const rename = useInlineRename(playlist.name, (name) => {
    renamePlaylist(playlist.id, name);
  });

  if (rename.editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          {...rename.inputProps}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 rounded border border-border bg-bg-secondary px-1 py-0.5 text-xs text-text-primary focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            rename.commit();
          }}
          className="flex h-4 w-4 items-center justify-center rounded text-text-muted hover:text-accent"
          aria-label="Save name"
        >
          <Check className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <span className={`flex min-w-0 items-center gap-1 ${className ?? ""}`}>
      <span className="truncate">{playlist.name}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          rename.start();
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
        aria-label="Rename playlist"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

export function SaveToPlaylistPopover({
  trackIds,
  onClose,
  onSaved,
  triggerRef,
}: {
  trackIds: string[];
  onClose: () => void;
  onSaved?: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}) {
  const playlists = useMusicStore((s) => s.playlists);
  const addPlaylist = useMusicStore((s) => s.addPlaylist);
  const addTracksToPlaylists = useMusicStore((s) => s.addTracksToPlaylists);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const init = new Set<string>();
    if (trackIds.length === 0) return init;
    for (const p of playlists) {
      if (trackIds.every((tid) => p.trackIds.includes(tid))) {
        init.add(p.id);
      }
    }
    return init;
  });
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useClickOutside([panelRef, triggerRef], onClose);
  useEscapeKey(onClose);

  const togglePlaylist = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const created = addPlaylist(trimmed);
    if (created) {
      setSelected((prev) => {
        const next = new Set(prev);
        next.add(created.id);
        return next;
      });
    }
    setNewName("");
    setCreating(false);
  };

  const handleSave = () => {
    const ids = Array.from(selected);
    if (ids.length > 0 && trackIds.length > 0) {
      addTracksToPlaylists(trackIds, ids);
    }
    onSaved?.();
    onClose();
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Save to playlist"
      className="panel-surface absolute bottom-full right-0 z-40 mb-1 w-56 rounded-md border border-border bg-bg-primary p-2 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-1 flex items-center justify-between gap-2 px-1">
        <span className="text-[11px] font-medium text-text-primary">
          Save {trackIds.length > 1 ? `${trackIds.length} tracks` : "track"} to…
        </span>
        <button
          onClick={onClose}
          className="flex h-4 w-4 items-center justify-center rounded text-text-muted hover:text-text-secondary"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="max-h-32 space-y-0.5 overflow-y-auto scrollbar-thin">
        {playlists.length === 0 && !creating && (
          <div className="px-1 py-2 text-center text-[10px] text-text-muted">
            No playlists yet. Create one below.
          </div>
        )}
        {playlists.map((p) => {
          const isSelected = selected.has(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePlaylist(p.id)}
              className={`flex w-full items-center gap-2 rounded px-1.5 py-1 text-[11px] transition-colors ${
                isSelected
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              {isSelected ? (
                <CheckSquare className="h-3 w-3 shrink-0" />
              ) : (
                <Square className="h-3 w-3 shrink-0" />
              )}
              <span className="flex-1 truncate text-left">{p.name}</span>
              <span className="text-[9px] text-text-muted">
                {p.trackIds.length}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-1 border-t border-border pt-1">
        {creating ? (
          <div className="flex gap-1">
            <input
              type="text"
              value={newName}
              autoFocus
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setCreating(false);
                  setNewName("");
                }
              }}
              placeholder="Playlist name…"
              className="min-w-0 flex-1 rounded border border-border bg-bg-secondary px-1.5 py-0.5 text-[11px] text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="rounded bg-accent px-1.5 py-0.5 text-[11px] text-white"
            >
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-border py-1 text-[10px] text-text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Plus className="h-3 w-3" />
            New Playlist
          </button>
        )}
      </div>
      <div className="mt-1 flex justify-end gap-1">
        <button
          onClick={onClose}
          className="rounded px-2 py-0.5 text-[11px] text-text-muted hover:text-text-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={selected.size === 0 || trackIds.length === 0}
          className="rounded bg-accent px-2 py-0.5 text-[11px] text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export function PlaylistsTab() {
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const playlists = useMusicStore((s) => s.playlists);
  const activePlaylistId = useMusicStore((s) => s.activePlaylistId);
  const setActivePlaylist = useMusicStore((s) => s.setActivePlaylist);
  const removeTrackFromPlaylist = useMusicStore((s) => s.removeTrackFromPlaylist);
  const reorderPlaylistTrack = useMusicStore((s) => s.reorderPlaylistTrack);
  const activateTrack = useMusicStore((s) => s.activateTrack);
  const addPlaylist = useMusicStore((s) => s.addPlaylist);
  const deletePlaylist = useMusicStore((s) => s.deletePlaylist);

  const [playlistDragIndex, setPlaylistDragIndex] = useState<number | null>(
    null,
  );
  const [showPlaylistInput, setShowPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const playlistConfirm = usePendingConfirm();

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const displayTracks = activePlaylist
    ? tracks.filter((t) => activePlaylist.trackIds.includes(t.id))
    : tracks;

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowPlaylistInput(false);
    }
  };

  return (
    <>
      <div className="space-y-1">
        {activePlaylist ? (
          <>
            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={() => setActivePlaylist(null)}
                className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:text-text-secondary"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="group flex min-w-0 flex-1 items-center text-xs font-medium text-text-primary">
                <PlaylistName playlist={activePlaylist} />
              </div>
              <span className="shrink-0 text-[10px] text-text-muted">
                {activePlaylist.trackIds.length} track
                {activePlaylist.trackIds.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="max-h-28 space-y-0.5 overflow-y-auto scrollbar-thin">
              {displayTracks.length === 0 ? (
                <div className="py-2 text-center text-[10px] text-text-muted">
                  No songs in this playlist
                </div>
              ) : (
                displayTracks.map((track, i) => {
                  const isCurrent =
                    tracks[currentTrackIndex]?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      className={`group flex items-center gap-1 rounded-md transition-colors ${
                        isCurrent
                          ? "bg-accent/10"
                          : "hover:bg-bg-secondary"
                      } ${playlistDragIndex === i ? "opacity-50" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={() => {
                        if (
                          playlistDragIndex !== null &&
                          playlistDragIndex !== i
                        ) {
                          reorderPlaylistTrack(
                            activePlaylist.id,
                            playlistDragIndex,
                            i,
                          );
                        }
                        setPlaylistDragIndex(null);
                      }}
                    >
                      <div
                        draggable
                        onDragStart={() => setPlaylistDragIndex(i)}
                        onDragEnd={() => setPlaylistDragIndex(null)}
                        className="flex cursor-grab items-center text-text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
                        aria-label="Reorder track"
                      >
                        <GripVertical className="h-3 w-3" />
                      </div>
                      <button
                        onClick={() => activateTrack(track.id)}
                        className={`flex flex-1 items-center gap-2 px-1 py-1.5 text-xs ${
                          isCurrent
                            ? "text-accent"
                            : "text-text-secondary"
                        }`}
                      >
                        {isCurrent && isPlaying && <NowPlayingBars />}
                        <span className="truncate">
                          {track.title}
                        </span>
                      </button>
                      <button
                        onClick={() =>
                          removeTrackFromPlaylist(
                            activePlaylist.id,
                            track.id,
                          )
                        }
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:text-error group-hover:opacity-100"
                        aria-label="Remove from playlist"
                        title="Remove from playlist"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <>
            <div className="max-h-28 space-y-0.5 overflow-y-auto scrollbar-thin">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  className="group flex items-center gap-2"
                >
                  <button
                    onClick={() => setActivePlaylist(pl.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-secondary"
                  >
                    <ListPlus className="h-3 w-3 shrink-0 text-text-muted" />
                    <span className="min-w-0 flex-1 text-left">
                      <PlaylistName playlist={pl} />
                    </span>
                    <span className="shrink-0 text-[10px] text-text-muted">
                      {pl.trackIds.length}
                    </span>
                  </button>
                  <button
                    onClick={() => playlistConfirm.request(pl.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-text-muted transition-colors hover:text-error"
                    aria-label="Delete playlist"
                    title="Delete playlist"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {playlists.length === 0 && (
                <div className="py-2 text-center text-[10px] text-text-muted">
                  No playlists yet
                </div>
              )}
            </div>
            {showPlaylistInput ? (
              <div className="mt-1 flex gap-1">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreatePlaylist();
                  }}
                  placeholder="Playlist name..."
                  className="flex-1 rounded-md border border-border bg-bg-secondary px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleCreatePlaylist}
                  className="rounded-md bg-accent px-2 py-1 text-xs text-white"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPlaylistInput(true)}
                className="mt-1 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-1 text-[10px] text-text-muted transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-3 w-3" />
                New Playlist
              </button>
            )}
          </>
        )}
      </div>
      <ConfirmDialog
        open={playlistConfirm.isOpen}
        title={(() => {
          const pl = playlists.find((p) => p.id === playlistConfirm.pendingId);
          return pl ? `Delete playlist "${pl.name}"?` : "Delete playlist?";
        })()}
        destructive
        confirmLabel="Delete"
        message="The playlist will be removed. The underlying tracks stay in your library."
        onConfirm={() => {
          if (playlistConfirm.pendingId) {
            deletePlaylist(playlistConfirm.pendingId);
            toast.success("Playlist deleted");
          }
          playlistConfirm.clear();
        }}
        onCancel={() => playlistConfirm.clear()}
      />
    </>
  );
}
