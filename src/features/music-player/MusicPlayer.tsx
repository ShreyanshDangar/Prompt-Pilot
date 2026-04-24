import { useEffect, useRef, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMinViewport } from "@/hooks/useMinViewport";
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Volume1, Shuffle, Repeat,
  Repeat1, ChevronDown, Music, Upload, X, GripVertical, ListPlus, Minimize2, Plus,
  Trash2, ChevronLeft, BookmarkPlus, CheckSquare,
  Square, Pencil, Check
} from "lucide-react";
import { useMusicStore, type Playlist } from "./music-store";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "sonner";

const MAX_RESIZE_FACTOR = 1.4;
const MIN_RESIZE_FACTOR = 1.0;
const RESIZE_MIN_VIEWPORT_W = 1920;
const RESIZE_MIN_VIEWPORT_H = 1080;

function TruncatedTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [isHover, setIsHover] = useState(false);
  return (
    <span
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="relative inline-block min-w-0 max-w-full"
    >
      <span className={`block truncate ${className ?? ""}`}>{text}</span>
      <AnimatePresence>
        {isHover && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="panel-surface pointer-events-none absolute left-0 top-full z-40 mt-1 max-w-[18rem] whitespace-normal rounded-md border border-border px-2 py-1 text-[11px] text-text-primary shadow-lg"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function formatTimeDisplay(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ProgressAndSeek = memo(function ProgressAndSeek({
  audioRef,
  trackId,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  trackId: string | undefined;
}) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      if (!seeking) setProgress(el.currentTime);
    };
    const onLoaded = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
    };
    const onLoadStart = () => {
      setProgress(0);
      setDuration(0);
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("loadstart", onLoadStart);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("loadstart", onLoadStart);
    };
  }, [audioRef, seeking, trackId]);

  const handleSeek = useCallback((value: number) => {
    setSeeking(true);
    setProgress(value);
  }, []);

  const handleSeekCommit = useCallback(
    (value: number) => {
      const el = audioRef.current;
      if (el) el.currentTime = value;
      setProgress(value);
      setSeeking(false);
    },
    [audioRef],
  );

  return (
    <>
      {duration > 0 && (
        <span className="text-[10px] text-text-muted">
          {formatTimeDisplay(progress)} / {formatTimeDisplay(duration)}
        </span>
      )}
      <div className="px-3 pb-2 -mx-3 mt-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={progress}
          onChange={(e) => handleSeek(Number(e.target.value))}
          onMouseUp={(e) =>
            handleSeekCommit(Number((e.target as HTMLInputElement).value))
          }
          onTouchEnd={(e) =>
            handleSeekCommit(Number((e.target as HTMLInputElement).value))
          }
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-bg-secondary accent-accent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
        />
      </div>
    </>
  );
});

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

function SaveToPlaylistPopover({
  trackIds,
  onClose,
  onSaved,
}: {
  trackIds: string[];
  onClose: () => void;
  onSaved?: () => void;
}) {
  const playlists = useMusicStore((s) => s.playlists);
  const addPlaylist = useMusicStore((s) => s.addPlaylist);
  const addTracksToPlaylists = useMusicStore((s) => s.addTracksToPlaylists);
  const containerRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) return;
      onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

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
      ref={containerRef}
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

function SaveToPlaylistButton({
  trackId,
  disabled,
}: {
  trackId: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button
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
        />
      )}
    </div>
  );
}

function PlaylistName({
  playlist,
  className,
}: {
  playlist: Playlist;
  className?: string;
}) {
  const renamePlaylist = useMusicStore((s) => s.renamePlaylist);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(playlist.name);

  const startEdit = () => {
    setDraft(playlist.name);
    setEditing(true);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== playlist.name) {
      renamePlaylist(playlist.id, trimmed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setEditing(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 rounded border border-border bg-bg-secondary px-1 py-0.5 text-xs text-text-primary focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            commit();
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
          startEdit();
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-text-muted opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
        aria-label="Rename playlist"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

export function MusicPlayer() {
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const volume = useMusicStore((s) => s.volume);
  const shuffle = useMusicStore((s) => s.shuffle);
  const repeat = useMusicStore((s) => s.repeat);
  const isExpanded = useMusicStore((s) => s.isExpanded);
  const view = useMusicStore((s) => s.view);
  const tab = useMusicStore((s) => s.tab);
  const playlists = useMusicStore((s) => s.playlists);
  const activePlaylistId = useMusicStore((s) => s.activePlaylistId);
  const multiSelectMode = useMusicStore((s) => s.multiSelectMode);
  const selectedTrackIds = useMusicStore((s) => s.selectedTrackIds);
  const toggle = useMusicStore((s) => s.toggle);
  const next = useMusicStore((s) => s.next);
  const previous = useMusicStore((s) => s.previous);
  const setVolume = useMusicStore((s) => s.setVolume);
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle);
  const cycleRepeat = useMusicStore((s) => s.cycleRepeat);
  const toggleExpanded = useMusicStore((s) => s.toggleExpanded);
  const addLocalFile = useMusicStore((s) => s.addLocalFile);
  const setView = useMusicStore((s) => s.setView);
  const setTab = useMusicStore((s) => s.setTab);
  const reorderTrack = useMusicStore((s) => s.reorderTrack);
  const addPlaylist = useMusicStore((s) => s.addPlaylist);
  const deletePlaylist = useMusicStore((s) => s.deletePlaylist);
  const setActivePlaylist = useMusicStore((s) => s.setActivePlaylist);
  const removeTrackFromPlaylist = useMusicStore((s) => s.removeTrackFromPlaylist);
  const reorderPlaylistTrack = useMusicStore((s) => s.reorderPlaylistTrack);
  const activateTrack = useMusicStore((s) => s.activateTrack);
  const removeTrack = useMusicStore((s) => s.removeTrack);
  const setMultiSelectMode = useMusicStore((s) => s.setMultiSelectMode);
  const toggleTrackSelection = useMusicStore((s) => s.toggleTrackSelection);
  const clearSelection = useMusicStore((s) => s.clearSelection);
  const initialize = useMusicStore((s) => s.initialize);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const defaultSizeRef = useRef<{ w: number; h: number } | null>(null);
  const dragStateRef = useRef<{
    axis: "x" | "y" | "xy";
    startX: number;
    startY: number;
    startScaleX: number;
    startScaleY: number;
    rafId: number | null;
    abort: AbortController;
  } | null>(null);
  const [committedScale, setCommittedScale] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const canResize = useMinViewport(
    RESIZE_MIN_VIEWPORT_W,
    RESIZE_MIN_VIEWPORT_H,
  );
  const currentTrack = tracks[currentTrackIndex];
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showPlaylistInput, setShowPlaylistInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [pendingPlaylistDelete, setPendingPlaylistDelete] = useState<
    string | null
  >(null);
  const [pendingTrackDelete, setPendingTrackDelete] = useState<string | null>(
    null,
  );
  const [bulkPickerOpen, setBulkPickerOpen] = useState(false);
  const [playlistDragIndex, setPlaylistDragIndex] = useState<number | null>(
    null,
  );
  const showBulkPicker = bulkPickerOpen && multiSelectMode;
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepMinutes && sleepMinutes > 0) {
      sleepTimerRef.current = setTimeout(
        () => {
          useMusicStore.setState({ isPlaying: false });
          setSleepMinutes(null);
        },
        sleepMinutes * 60 * 1000,
      );
    }
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepMinutes]);

  const localTracks = tracks.filter((t) => t.isLocal);
  const localScopeIds = localTracks.map((t) => t.id);
  const navScope = tab === "local" ? localScopeIds : undefined;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (defaultSizeRef.current) return;
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    defaultSizeRef.current = { w: rect.width, h: rect.height };
  }, []);

  const applyScaleToPanel = (panel: HTMLDivElement, sx: number, sy: number) => {
    panel.style.transform = `scale(${sx}, ${sy})`;
    panel.style.transformOrigin = "bottom right";
    panel.style.setProperty("--player-scale", String(sx));
  };

  const onResizePointerMove = useCallback((e: PointerEvent) => {
    const drag = dragStateRef.current;
    const panel = panelRef.current;
    const defaults = defaultSizeRef.current;
    if (!drag || !panel || !defaults) return;
    if (drag.rafId !== null) return;
    drag.rafId = window.requestAnimationFrame(() => {
      drag.rafId = null;
      const dx = drag.axis === "y" ? 0 : e.clientX - drag.startX;
      const dy = drag.axis === "x" ? 0 : e.clientY - drag.startY;
      const nextSx = Math.min(
        MAX_RESIZE_FACTOR,
        Math.max(MIN_RESIZE_FACTOR, drag.startScaleX + dx / defaults.w),
      );
      const nextSy = Math.min(
        MAX_RESIZE_FACTOR,
        Math.max(MIN_RESIZE_FACTOR, drag.startScaleY + dy / defaults.h),
      );
      applyScaleToPanel(panel, nextSx, nextSy);
    });
  }, []);

  const onResizePointerUp = useCallback(() => {
    const drag = dragStateRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    if (drag.rafId !== null) window.cancelAnimationFrame(drag.rafId);
    drag.abort.abort();
    const matrix = new DOMMatrixReadOnly(getComputedStyle(panel).transform);
    const finalSx = matrix.a || 1;
    const finalSy = matrix.d || 1;
    setCommittedScale({ x: finalSx, y: finalSy });
    dragStateRef.current = null;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  const startResize = (axis: "x" | "y" | "xy") => (e: React.PointerEvent) => {
    if (!canResize) return;
    const panel = panelRef.current;
    const defaults = defaultSizeRef.current;
    if (!panel || !defaults) return;
    e.preventDefault();
    const startSx = committedScale?.x ?? 1;
    const startSy = committedScale?.y ?? 1;
    const abort = new AbortController();
    dragStateRef.current = {
      axis,
      startX: e.clientX,
      startY: e.clientY,
      startScaleX: startSx,
      startScaleY: startSy,
      rafId: null,
      abort,
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor =
      axis === "x" ? "ew-resize" : axis === "y" ? "ns-resize" : "nwse-resize";
    window.addEventListener("pointermove", onResizePointerMove, {
      signal: abort.signal,
    });
    window.addEventListener("pointerup", onResizePointerUp, {
      signal: abort.signal,
    });
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      el.pause();
    }
  }, [isPlaying, currentTrack?.src]);

  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
  }, [volume]);

  const handleAudioEnded = () => {
    if (repeat === "single") {
      const el = audioRef.current;
      if (el) {
        el.currentTime = 0;
        el.play().catch(() => {});
      }
      return;
    }
    const scope = tab === "local" ? localScopeIds : undefined;
    if (repeat === "all" || currentTrackIndex < tracks.length - 1) {
      next(scope);
    } else {
      useMusicStore.setState({ isPlaying: false });
    }
  };

  const handlePlay = () => {
    if (volume === 0) {
      setShowVolumeWarning(true);
      setTimeout(() => setShowVolumeWarning(false), 3000);
    }
    toggle();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        await addLocalFile(file);
      } catch {}
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

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setShowPlaylistInput(false);
    }
  };

  const RepeatIcon = repeat === "single" ? Repeat1 : Repeat;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId);
  const displayTracks = activePlaylist
    ? tracks.filter((t) => activePlaylist.trackIds.includes(t.id))
    : tracks;

  if (view === "closed") return null;

  const audioElement = (
    <audio
      ref={audioRef}
      src={currentTrack?.src}
      preload="metadata"
      onEnded={handleAudioEnded}
      onError={() => {
        if (currentTrackIndex < tracks.length - 1) next();
      }}
    />
  );

  if (view === "iconified") {
    return (
      <>
        {audioElement}
        <button
          onClick={() => setView("collapsed")}
          className="panel-surface fixed bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-border text-accent shadow-lg transition-all hover:scale-110 hover:bg-bg-secondary"
          aria-label="Show music player"
          title={
            isPlaying && currentTrack
              ? `Now playing: ${currentTrack.title}`
              : "Show music player"
          }
        >
          <Music className="h-4 w-4" />
          {isPlaying && (
            <span
              className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-accent"
              aria-hidden="true"
            />
          )}
        </button>
      </>
    );
  }

  const panelStyle: React.CSSProperties = {};
  if (canResize && committedScale) {
    panelStyle.transform = `scale(${committedScale.x}, ${committedScale.y})`;
    panelStyle.transformOrigin = "bottom right";
    (panelStyle as React.CSSProperties & Record<string, string>)[
      "--player-scale"
    ] = String(committedScale.x);
  }

  return (
    <>
      {audioElement}
      <motion.div
        ref={panelRef}
        style={panelStyle}
        className="panel-surface fixed bottom-4 right-4 z-30 w-72 overflow-hidden rounded-xl border border-border shadow-xl sm:w-80"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
      {canResize && (
        <>
          <div
            onPointerDown={startResize("x")}
            className="absolute right-0 top-0 z-20 h-full w-2"
            style={{ cursor: "ew-resize" }}
            aria-label="Resize width"
            role="separator"
          />
          <div
            onPointerDown={startResize("y")}
            className="absolute bottom-0 left-0 z-20 h-2 w-full"
            style={{ cursor: "ns-resize" }}
            aria-label="Resize height"
            role="separator"
          />
          <div
            onPointerDown={startResize("xy")}
            className="absolute bottom-0 right-0 z-20 h-4 w-4"
            style={{ cursor: "nwse-resize" }}
            aria-label="Resize"
            role="separator"
          />
        </>
      )}
      <AnimatePresence>
        {showVolumeWarning && (
          <motion.div
            className="absolute -top-10 left-0 right-0 z-10 rounded-lg bg-warning/90 px-3 py-1.5 text-center text-xs font-medium text-black"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            Volume is at 0. Increase to hear music.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <Music className="h-4 w-4 text-accent" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <TruncatedTitle
            text={currentTrack?.title ?? "No track"}
            className="text-sm font-medium text-text-primary"
          />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={handlePlay}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>
          <button
            onClick={toggleExpanded}
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-secondary"
            aria-label="Collapse"
            title="Collapse"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={() => setView("iconified")}
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-secondary"
            aria-label="Iconify"
            title="Iconify"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setView("closed");
              useMusicStore.setState({ isPlaying: false });
              const el = audioRef.current;
              if (el) el.pause();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-secondary hover:text-error"
            aria-label="Close music player"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <ProgressAndSeek audioRef={audioRef} trackId={currentTrack?.id} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-border px-3 py-3">
              <div className="mb-3 flex items-center justify-center gap-2">
                <button
                  onClick={toggleShuffle}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${shuffle ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"}`}
                  aria-label="Toggle shuffle"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => previous(navScope)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-secondary"
                  aria-label="Previous"
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={handlePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => next(navScope)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-secondary"
                  aria-label="Next"
                >
                  <SkipForward className="h-4 w-4" />
                </button>
                <button
                  onClick={cycleRepeat}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${repeat !== "off" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"}`}
                  aria-label="Toggle repeat"
                >
                  <RepeatIcon className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                  className="shrink-0 text-text-muted"
                  aria-label="Toggle mute"
                >
                  <VolumeIcon className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="flex-1 accent-accent"
                />
                <span className="w-8 text-right text-[10px] text-text-muted">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <div className="mb-3 flex items-center gap-2 text-[10px] text-text-muted">
                <span className="shrink-0">Sleep</span>
                <select
                  value={sleepMinutes ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setSleepMinutes(v > 0 ? v : null);
                  }}
                  className="flex-1 rounded-md border border-border bg-bg-secondary px-2 py-1 text-[10px] text-text-primary focus:border-accent focus:outline-none"
                  aria-label="Sleep timer"
                >
                  <option value={0}>Off</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
                {sleepMinutes && (
                  <span className="shrink-0 rounded bg-accent/10 px-1.5 py-0.5 text-accent">
                    {sleepMinutes}m
                  </span>
                )}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setTab("all");
                    setActivePlaylist(null);
                  }}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${tab === "all" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"}`}
                >
                  All Songs
                </button>
                <button
                  onClick={() => setTab("playlists")}
                  className={`flex items-center rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${tab === "playlists" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"}`}
                >
                  <ListPlus className="mr-1 h-3 w-3" />
                  Playlists
                </button>
                <button
                  onClick={() => {
                    setTab("local");
                    setActivePlaylist(null);
                  }}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${tab === "local" ? "bg-accent/10 text-accent" : "text-text-muted hover:text-text-secondary"}`}
                >
                  Local
                </button>
                {tab !== "playlists" && (
                  <button
                    onClick={() => {
                      const next = !multiSelectMode;
                      setMultiSelectMode(next);
                    }}
                    className={`ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                      multiSelectMode
                        ? "bg-accent/10 text-accent"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                    title={
                      multiSelectMode
                        ? "Exit multi-select"
                        : "Select multiple tracks"
                    }
                    aria-pressed={multiSelectMode}
                  >
                    <CheckSquare className="h-3 w-3" />
                    {multiSelectMode ? "Cancel" : "Select"}
                  </button>
                )}
              </div>

              {multiSelectMode && tab !== "playlists" && (
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
                    />
                  )}
                </div>
              )}

              {tab === "playlists" ? (
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
                                  {isCurrent && isPlaying && (
                                    <span className="flex items-end gap-px">
                                      <span className="inline-block h-2 w-0.5 animate-pulse rounded-full bg-accent" />
                                      <span
                                        className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-accent"
                                        style={{ animationDelay: "0.1s" }}
                                      />
                                      <span
                                        className="inline-block h-1.5 w-0.5 animate-pulse rounded-full bg-accent"
                                        style={{ animationDelay: "0.2s" }}
                                      />
                                    </span>
                                  )}
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
                              onClick={() => setPendingPlaylistDelete(pl.id)}
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
              ) : tab === "local" ? (
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
                              {isCurrent && isPlaying && (
                                <span className="flex items-end gap-px">
                                  <span className="inline-block h-2 w-0.5 animate-pulse rounded-full bg-accent" />
                                  <span
                                    className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-accent"
                                    style={{ animationDelay: "0.1s" }}
                                  />
                                  <span
                                    className="inline-block h-1.5 w-0.5 animate-pulse rounded-full bg-accent"
                                    style={{ animationDelay: "0.2s" }}
                                  />
                                </span>
                              )}
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
                                    setPendingTrackDelete(track.id);
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
                            {isCurrent && isPlaying && (
                              <span className="flex items-end gap-px">
                                <span className="inline-block h-2 w-0.5 animate-pulse rounded-full bg-accent" />
                                <span
                                  className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-accent"
                                  style={{ animationDelay: "0.1s" }}
                                />
                                <span
                                  className="inline-block h-1.5 w-0.5 animate-pulse rounded-full bg-accent"
                                  style={{ animationDelay: "0.2s" }}
                                />
                              </span>
                            )}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
      <ConfirmDialog
        open={pendingPlaylistDelete !== null}
        title={(() => {
          const pl = playlists.find((p) => p.id === pendingPlaylistDelete);
          return pl ? `Delete playlist "${pl.name}"?` : "Delete playlist?";
        })()}
        destructive
        confirmLabel="Delete"
        message="The playlist will be removed. The underlying tracks stay in your library."
        onConfirm={() => {
          if (pendingPlaylistDelete) {
            deletePlaylist(pendingPlaylistDelete);
            toast.success("Playlist deleted");
          }
          setPendingPlaylistDelete(null);
        }}
        onCancel={() => setPendingPlaylistDelete(null)}
      />
      <ConfirmDialog
        open={pendingTrackDelete !== null}
        title={(() => {
          const t = tracks.find((t) => t.id === pendingTrackDelete);
          return t ? `Delete "${t.title}" from library?` : "Delete track?";
        })()}
        destructive
        confirmLabel="Delete"
        message="This will remove the audio file from your library and from any playlists it lives in. This cannot be undone."
        onConfirm={() => {
          if (pendingTrackDelete) {
            void removeTrack(pendingTrackDelete);
            toast.success("Track deleted");
          }
          setPendingTrackDelete(null);
        }}
        onCancel={() => setPendingTrackDelete(null)}
      />
    </>
  );
}
