# music-player

The floating music player: playback transport, playlists, local-file library, and a resizable expanded panel.

| File | Exports | Description |
| --- | --- | --- |
| `MusicPlayer.tsx` | `MusicPlayer` | View-mode shell (closed / iconified / collapsed / expanded): `<audio>`, header, volume warning, sleep-timer mechanism, and composition of the sub-views. |
| `MusicControls.tsx` | `MusicControls` | Expanded control deck: transport (shuffle/prev/play/next/repeat), volume, sleep select, and All/Playlists/Local tab nav. |
| `MusicProgressBar.tsx` | `ProgressAndSeek` | Memoized progress/seek bar (file-local `formatTimeDisplay`). |
| `MusicTrackList.tsx` | `MusicTrackList` | All Songs + Local lists, multi-select toolbar, per-track row, `SaveToPlaylistButton`, `DragHandle`. |
| `MusicPlaylists.tsx` | `PlaylistsTab`, `SaveToPlaylistPopover` | Playlists tab (list + active-playlist view) and the save-to-playlist popover (also used by the track list). |
| `NowPlayingBars.tsx` | `NowPlayingBars` | The 3-bar animated equalizer shown next to the playing track. |
| `useMusicPlayerResize.tsx` | `useMusicPlayerResize` | Pointer-drag scale harness; returns `{ canResize, panelStyle, resizeHandles }`. |
| `music-store.ts` | `useMusicStore` | Zustand store: tracks, playlists, view/tab, playback + selection state and actions. |
| `music-types.ts` | `Track`, `Playlist`, `PersistedLocalTrack`, `PersistedMusicState`, `MusicView`, `MusicTab` | Shared music types. |
| `music-migration.ts` | `migrateLegacyStorageOnce` | One-time migration of legacy localStorage music state into IndexedDB. |
| `audio-db.ts` | `getAudioFile`/`putAudioFile`/…, `SETTING_*` keys, stored-shape types | IndexedDB access layer for audio blobs, local tracks, playlists, and settings. |

## Cross-references

- **Store / data:** `music-store`, `audio-db`, `music-migration` (this folder)
- **Shared hooks:** `@/hooks/useClickOutside`, `@/hooks/useEscapeKey`, `@/hooks/useMinViewport`
- **Shared:** `@/components/modals/ConfirmDialog`, `@/lib/storage`
- One-way boundary: `MusicTrackList` imports from `MusicPlaylists`, never the reverse.
- Public entry point `<MusicPlayer />` is lazy-loaded by `@/components/layout/AppShell`.
