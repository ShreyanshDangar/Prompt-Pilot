/**
 * The 3-bar animated equalizer shown next to the track that is currently
 * playing. Render it gated on `isCurrent && isPlaying` at each call site.
 */
export function NowPlayingBars() {
  return (
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
  );
}
