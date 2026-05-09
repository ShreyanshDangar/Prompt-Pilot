import { useEffect, useState, useCallback, memo } from "react";

function formatTimeDisplay(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export const ProgressAndSeek = memo(function ProgressAndSeek({
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
