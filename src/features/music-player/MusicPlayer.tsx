import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, ChevronDown, Music, X, Minimize2,
} from "lucide-react";
import { useMusicStore } from "./music-store";
import { useMusicPlayerResize } from "./useMusicPlayerResize";
import { ProgressAndSeek } from "./MusicProgressBar";
import { MusicControls } from "./MusicControls";
import { PlaylistsTab } from "./MusicPlaylists";
import { MusicTrackList } from "./MusicTrackList";

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

export function MusicPlayer() {
  const tracks = useMusicStore((s) => s.tracks);
  const currentTrackIndex = useMusicStore((s) => s.currentTrackIndex);
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const volume = useMusicStore((s) => s.volume);
  const repeat = useMusicStore((s) => s.repeat);
  const isExpanded = useMusicStore((s) => s.isExpanded);
  const view = useMusicStore((s) => s.view);
  const tab = useMusicStore((s) => s.tab);
  const toggle = useMusicStore((s) => s.toggle);
  const next = useMusicStore((s) => s.next);
  const toggleExpanded = useMusicStore((s) => s.toggleExpanded);
  const setView = useMusicStore((s) => s.setView);
  const initialize = useMusicStore((s) => s.initialize);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { panelStyle, resizeHandles } = useMusicPlayerResize(panelRef);
  const currentTrack = tracks[currentTrackIndex];
  const [showVolumeWarning, setShowVolumeWarning] = useState(false);
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

  return (
    <>
      {audioElement}
      <motion.div
        ref={panelRef}
        style={panelStyle}
        className="panel-surface fixed bottom-4 right-4 z-30 w-72 overflow-hidden rounded-xl border border-border shadow-xl sm:w-80"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
      {resizeHandles}
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
              <MusicControls
                onPlay={handlePlay}
                navScope={navScope}
                sleepMinutes={sleepMinutes}
                onSleepChange={setSleepMinutes}
              />
              {tab === "playlists" ? (
                <PlaylistsTab />
              ) : (
                <MusicTrackList />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}
