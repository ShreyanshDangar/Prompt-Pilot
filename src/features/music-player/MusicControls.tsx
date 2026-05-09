import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Volume1, Shuffle,
  Repeat, Repeat1, ListPlus, CheckSquare,
} from "lucide-react";
import { useMusicStore } from "./music-store";

/**
 * The expanded music-player control deck: transport (shuffle / prev / play /
 * next / repeat), volume, sleep-timer select, and the All / Playlists / Local
 * tab navigation. The sleep-timer mechanism and the volume-zero warning live in
 * the parent shell; this component is the control surface above the sub-views.
 */
export function MusicControls({
  onPlay,
  navScope,
  sleepMinutes,
  onSleepChange,
}: {
  onPlay: () => void;
  navScope: string[] | undefined;
  sleepMinutes: number | null;
  onSleepChange: (v: number | null) => void;
}) {
  const isPlaying = useMusicStore((s) => s.isPlaying);
  const shuffle = useMusicStore((s) => s.shuffle);
  const repeat = useMusicStore((s) => s.repeat);
  const volume = useMusicStore((s) => s.volume);
  const tab = useMusicStore((s) => s.tab);
  const multiSelectMode = useMusicStore((s) => s.multiSelectMode);
  const toggleShuffle = useMusicStore((s) => s.toggleShuffle);
  const previous = useMusicStore((s) => s.previous);
  const next = useMusicStore((s) => s.next);
  const cycleRepeat = useMusicStore((s) => s.cycleRepeat);
  const setVolume = useMusicStore((s) => s.setVolume);
  const setTab = useMusicStore((s) => s.setTab);
  const setActivePlaylist = useMusicStore((s) => s.setActivePlaylist);
  const setMultiSelectMode = useMusicStore((s) => s.setMultiSelectMode);

  const RepeatIcon = repeat === "single" ? Repeat1 : Repeat;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
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
          onClick={onPlay}
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
            onSleepChange(v > 0 ? v : null);
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
    </>
  );
}
