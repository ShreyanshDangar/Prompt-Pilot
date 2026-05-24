import { create } from "zustand"
import { setToLocalStorage } from "@/lib/storage"
import { makeId } from "@/lib/id"
import {
  deleteAudioFile,
  deleteLocalTrack,
  deletePlaylist as deletePlaylistFromDb,
  getAllLocalTracks,
  getAllPlaylists,
  getAudioFile,
  getSetting,
  putAudioFile,
  putLocalTracks,
  putPlaylist,
  putSetting,
  SETTING_VOLUME,
  SETTING_SHUFFLE,
  SETTING_REPEAT,
  SETTING_TRACK_ORDER,
  type StoredLocalTrack,
  type StoredPlaylist,
} from "./audio-db"
import {
  migrateLegacyStorageOnce,
  LEGACY_MUSIC_STATE_KEY,
} from "./music-migration"
import type {
  Track,
  Playlist,
  MusicView,
  MusicTab,
  PersistedMusicState,
} from "./music-types"

interface MusicStore {
  tracks: Track[]
  currentTrackIndex: number
  isPlaying: boolean
  volume: number
  shuffle: boolean
  repeat: "off" | "single" | "all"
  isExpanded: boolean
  isActivated: boolean
  view: MusicView
  tab: MusicTab
  playlists: Playlist[]
  activePlaylistId: string | null
  multiSelectMode: boolean
  selectedTrackIds: string[]
  setActivated: () => void
  play: () => void
  pause: () => void
  toggle: () => void
  next: (scopeIds?: string[]) => void
  previous: (scopeIds?: string[]) => void
  setVolume: (v: number) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  toggleExpanded: () => void
  setTrackIndex: (i: number) => void
  activateTrack: (id: string, autoPlay?: boolean) => void
  renameTrack: (id: string, title: string) => void
  addLocalFile: (file: File) => Promise<void>
  setView: (v: MusicView) => void
  setTab: (t: MusicTab) => void
  reorderTrack: (fromIndex: number, toIndex: number) => void
  addPlaylist: (name: string) => Playlist | null
  deletePlaylist: (id: string) => void
  renamePlaylist: (id: string, name: string) => void
  setActivePlaylist: (id: string | null) => void
  addTrackToPlaylist: (playlistId: string, trackId: string) => void
  addTracksToPlaylists: (trackIds: string[], playlistIds: string[]) => void
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void
  reorderPlaylistTrack: (
    playlistId: string,
    fromIndex: number,
    toIndex: number,
  ) => void
  removeTrack: (id: string) => Promise<void>
  setMultiSelectMode: (enabled: boolean) => void
  toggleTrackSelection: (id: string) => void
  clearSelection: () => void
  initialize: () => Promise<void>
}

const BUNDLED_TRACKS: Track[] = [
  { id: "track-01", title: "Ambient Focus", src: "/audio/track-01.mp3" },
  { id: "track-02", title: "Deep Concentration", src: "/audio/track-02.mp3" },
  { id: "track-03", title: "Lo-fi Workspace", src: "/audio/track-03.mp3" },
  { id: "track-04", title: "Calm Synthesis", src: "/audio/track-04.mp3" },
  { id: "track-05", title: "Quiet Storm", src: "/audio/track-05.mp3" },
  { id: "track-06", title: "Night Coding", src: "/audio/track-06.mp3" },
  { id: "track-07", title: "Zen Flow", src: "/audio/track-07.mp3" },
]

function persistPlayerSettings(state: {
  volume: number
  shuffle: boolean
  repeat: "off" | "single" | "all"
  tracks: Track[]
}) {
  void putSetting(SETTING_VOLUME, state.volume).catch(() => {})
  void putSetting(SETTING_SHUFFLE, state.shuffle).catch(() => {})
  void putSetting(SETTING_REPEAT, state.repeat).catch(() => {})
  void putSetting(
    SETTING_TRACK_ORDER,
    state.tracks.map((t) => t.id),
  ).catch(() => {})
}

function persistLocalTracks(tracks: Track[]) {
  const local: StoredLocalTrack[] = tracks
    .filter((t): t is Track & { fileId: string } =>
      Boolean(t.isLocal && t.fileId),
    )
    .map((t, sortIndex) => ({
      id: t.id,
      title: t.title,
      fileId: t.fileId,
      mimeType: t.mimeType,
      sizeBytes: t.sizeBytes,
      sortIndex,
    }))
  void putLocalTracks(local).catch(() => {})
}

function persistPlaylist(playlist: Playlist): Promise<void> {
  const stored: StoredPlaylist = {
    id: playlist.id,
    name: playlist.name,
    trackIds: [...playlist.trackIds],
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  }
  return putPlaylist(stored).catch(() => {})
}

function titleFromFileName(name: string): string {
  const trimmed = name.trim()
  if (trimmed === "") return "Untitled audio"
  const lastDot = trimmed.lastIndexOf(".")
  if (lastDot <= 0) return trimmed
  const base = trimmed.slice(0, lastDot).trim()
  return base === "" ? trimmed : base
}

let initPromise: Promise<void> | null = null

export const useMusicStore = create<MusicStore>((set, get) => ({
  tracks: BUNDLED_TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.7,
  shuffle: false,
  repeat: "off" as const,
  isExpanded: false,
  isActivated: false,
  view: "collapsed" as MusicView,
  tab: "all" as MusicTab,
  playlists: [],
  activePlaylistId: null,
  multiSelectMode: false,
  selectedTrackIds: [],

  setActivated: () => set({ isActivated: true }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: (scopeIds) => {
    const { tracks, currentTrackIndex, shuffle } = get()
    const scope =
      scopeIds && scopeIds.length > 0
        ? tracks.filter((t) => scopeIds.includes(t.id))
        : tracks
    if (scope.length === 0) return
    if (shuffle) {
      const idx = Math.floor(Math.random() * scope.length)
      const targetId = scope[idx].id
      const targetIdx = tracks.findIndex((t) => t.id === targetId)
      set({ currentTrackIndex: targetIdx, isPlaying: true })
      return
    }
    const currentId = tracks[currentTrackIndex]?.id
    const cursorInScope = scope.findIndex((t) => t.id === currentId)
    const nextInScope =
      cursorInScope === -1
        ? scope[0]
        : scope[(cursorInScope + 1) % scope.length]
    const nextIdx = tracks.findIndex((t) => t.id === nextInScope.id)
    set({ currentTrackIndex: nextIdx, isPlaying: true })
  },

  previous: (scopeIds) => {
    const { tracks, currentTrackIndex } = get()
    const scope =
      scopeIds && scopeIds.length > 0
        ? tracks.filter((t) => scopeIds.includes(t.id))
        : tracks
    if (scope.length === 0) return
    const currentId = tracks[currentTrackIndex]?.id
    const cursorInScope = scope.findIndex((t) => t.id === currentId)
    const prevInScope =
      cursorInScope === -1
        ? scope[0]
        : scope[(cursorInScope - 1 + scope.length) % scope.length]
    const prevIdx = tracks.findIndex((t) => t.id === prevInScope.id)
    set({ currentTrackIndex: prevIdx, isPlaying: true })
  },

  activateTrack: (id, autoPlay = true) => {
    const { tracks, currentTrackIndex } = get()
    const idx = tracks.findIndex((t) => t.id === id)
    if (idx === -1) return
    if (idx !== currentTrackIndex) {
      set({ currentTrackIndex: idx, isPlaying: autoPlay })
    } else {
      set({ isPlaying: autoPlay })
    }
  },

  renameTrack: (id, title) => {
    const trimmed = title.trim()
    if (!trimmed) return
    const tracks = get().tracks.map((t) =>
      t.id === id ? { ...t, title: trimmed } : t,
    )
    set({ tracks })
    persistLocalTracks(tracks)
    persistPlayerSettings({
      volume: get().volume,
      shuffle: get().shuffle,
      repeat: get().repeat,
      tracks,
    })
  },

  setVolume: (volume) => {
    set({ volume })
    void putSetting(SETTING_VOLUME, volume).catch(() => {})
  },

  toggleShuffle: () => {
    const shuffle = !get().shuffle
    set({ shuffle })
    void putSetting(SETTING_SHUFFLE, shuffle).catch(() => {})
  },

  cycleRepeat: () => {
    const order: Array<"off" | "single" | "all"> = ["off", "single", "all"]
    const current = order.indexOf(get().repeat)
    const repeat = order[(current + 1) % order.length]
    set({ repeat })
    void putSetting(SETTING_REPEAT, repeat).catch(() => {})
  },

  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

  setTrackIndex: (i) => set({ currentTrackIndex: i, isPlaying: true }),

  addLocalFile: async (file: File) => {
    const fileId = makeId()
    await putAudioFile({
      id: fileId,
      file,
      name: file.name,
      type: file.type,
      size: file.size,
    })

    const objectUrl = URL.createObjectURL(file)
    const track: Track = {
      id: makeId(),
      title: titleFromFileName(file.name),
      src: objectUrl,
      isLocal: true,
      fileId,
      mimeType: file.type,
      sizeBytes: file.size,
    }

    const updated = [...get().tracks, track]
    set({ tracks: updated })
    persistLocalTracks(updated)
    persistPlayerSettings({
      volume: get().volume,
      shuffle: get().shuffle,
      repeat: get().repeat,
      tracks: updated,
    })
  },

  setView: (view) => set({ view }),
  setTab: (tab) => set({ tab }),

  reorderTrack: (fromIndex, toIndex) => {
    const tracks = [...get().tracks]
    const [moved] = tracks.splice(fromIndex, 1)
    tracks.splice(toIndex, 0, moved)
    let currentTrackIndex = get().currentTrackIndex
    if (currentTrackIndex === fromIndex) {
      currentTrackIndex = toIndex
    } else if (fromIndex < currentTrackIndex && toIndex >= currentTrackIndex) {
      currentTrackIndex--
    } else if (fromIndex > currentTrackIndex && toIndex <= currentTrackIndex) {
      currentTrackIndex++
    }
    set({ tracks, currentTrackIndex })
    persistLocalTracks(tracks)
    persistPlayerSettings({
      volume: get().volume,
      shuffle: get().shuffle,
      repeat: get().repeat,
      tracks,
    })
  },

  addPlaylist: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const now = Date.now()
    const playlist: Playlist = {
      id: makeId(),
      name: trimmed,
      trackIds: [],
      createdAt: now,
      updatedAt: now,
    }
    const playlists = [...get().playlists, playlist]
    set({ playlists })
    void persistPlaylist(playlist)
    return playlist
  },

  deletePlaylist: (id) => {
    const playlists = get().playlists.filter((p) => p.id !== id)
    const activePlaylistId =
      get().activePlaylistId === id ? null : get().activePlaylistId
    set({ playlists, activePlaylistId })
    void deletePlaylistFromDb(id).catch(() => {})
  },

  renamePlaylist: (id, name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const now = Date.now()
    const playlists = get().playlists.map((p) =>
      p.id === id ? { ...p, name: trimmed, updatedAt: now } : p,
    )
    set({ playlists })
    const updated = playlists.find((p) => p.id === id)
    if (updated) void persistPlaylist(updated)
  },

  setActivePlaylist: (id) => set({ activePlaylistId: id }),

  addTrackToPlaylist: (playlistId, trackId) => {
    const now = Date.now()
    const playlists = get().playlists.map((p) =>
      p.id === playlistId && !p.trackIds.includes(trackId)
        ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: now }
        : p,
    )
    set({ playlists })
    const updated = playlists.find((p) => p.id === playlistId)
    if (updated) void persistPlaylist(updated)
  },

  addTracksToPlaylists: (trackIds, playlistIds) => {
    if (trackIds.length === 0 || playlistIds.length === 0) return
    const now = Date.now()
    const playlists = get().playlists.map((p) => {
      if (!playlistIds.includes(p.id)) return p
      const existing = new Set(p.trackIds)
      let changed = false
      for (const tid of trackIds) {
        if (!existing.has(tid)) {
          existing.add(tid)
          changed = true
        }
      }
      return changed
        ? { ...p, trackIds: Array.from(existing), updatedAt: now }
        : p
    })
    set({ playlists })
    for (const p of playlists) {
      if (playlistIds.includes(p.id)) void persistPlaylist(p)
    }
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    const now = Date.now()
    const playlists = get().playlists.map((p) =>
      p.id === playlistId
        ? {
            ...p,
            trackIds: p.trackIds.filter((id) => id !== trackId),
            updatedAt: now,
          }
        : p,
    )
    set({ playlists })
    const updated = playlists.find((p) => p.id === playlistId)
    if (updated) void persistPlaylist(updated)
  },

  reorderPlaylistTrack: (playlistId, fromIndex, toIndex) => {
    const now = Date.now()
    const playlists = get().playlists.map((p) => {
      if (p.id !== playlistId) return p
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= p.trackIds.length ||
        toIndex >= p.trackIds.length ||
        fromIndex === toIndex
      ) {
        return p
      }
      const trackIds = [...p.trackIds]
      const [moved] = trackIds.splice(fromIndex, 1)
      trackIds.splice(toIndex, 0, moved)
      return { ...p, trackIds, updatedAt: now }
    })
    set({ playlists })
    const updated = playlists.find((p) => p.id === playlistId)
    if (updated) void persistPlaylist(updated)
  },

  removeTrack: async (id) => {
    const target = get().tracks.find((t) => t.id === id)
    const tracks = get().tracks.filter((t) => t.id !== id)
    let { currentTrackIndex } = get()
    if (currentTrackIndex >= tracks.length) {
      currentTrackIndex = Math.max(0, tracks.length - 1)
    }
    if (target?.isLocal && target.src.startsWith("blob:")) {
      URL.revokeObjectURL(target.src)
    }

    const now = Date.now()
    const playlists = get().playlists.map((p) =>
      p.trackIds.includes(id)
        ? {
            ...p,
            trackIds: p.trackIds.filter((tid) => tid !== id),
            updatedAt: now,
          }
        : p,
    )

    set({ tracks, currentTrackIndex, playlists })
    persistLocalTracks(tracks)
    persistPlayerSettings({
      volume: get().volume,
      shuffle: get().shuffle,
      repeat: get().repeat,
      tracks,
    })
    for (const p of playlists) {
      if (p.trackIds.indexOf(id) === -1) {
        void persistPlaylist(p)
      }
    }

    if (target?.isLocal) {
      try {
        await deleteLocalTrack(target.id)
      } catch {
        // best-effort: the track may already be removed
      }
      if (target.fileId) {
        try {
          await deleteAudioFile(target.fileId)
        } catch {
          // best-effort: the audio blob may already be removed
        }
      }
    }
  },

  setMultiSelectMode: (enabled) => {
    set({
      multiSelectMode: enabled,
      selectedTrackIds: enabled ? get().selectedTrackIds : [],
    })
  },

  toggleTrackSelection: (id) => {
    const current = get().selectedTrackIds
    const next = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id]
    set({ selectedTrackIds: next })
  },

  clearSelection: () => set({ selectedTrackIds: [] }),

  initialize: async () => {
    if (initPromise) return initPromise
    initPromise = (async () => {
      try {
        await migrateLegacyStorageOnce()
      } catch {
        // best-effort: legacy migration is non-critical
      }

      let tracks: Track[] = [...BUNDLED_TRACKS]

      try {
        const stored = await getAllLocalTracks()
        const rehydrated: Track[] = []
        for (const meta of stored) {
          try {
            const audio = await getAudioFile(meta.fileId)
            if (!audio) {
              await deleteLocalTrack(meta.id).catch(() => {})
              continue
            }
            rehydrated.push({
              id: meta.id,
              title: meta.title,
              src: URL.createObjectURL(audio.file),
              isLocal: true,
              fileId: meta.fileId,
              mimeType: meta.mimeType ?? audio.type,
              sizeBytes: meta.sizeBytes ?? audio.size,
            })
          } catch {
            // best-effort: skip tracks that fail to rehydrate
          }
        }
        tracks = [...tracks, ...rehydrated]
      } catch {
        // best-effort: fall back to the bundled tracks
      }

      let savedTrackOrder: string[] | undefined
      let savedVolume: number | undefined
      let savedShuffle: boolean | undefined
      let savedRepeat: "off" | "single" | "all" | undefined
      try {
        savedTrackOrder = await getSetting<string[]>(SETTING_TRACK_ORDER)
        savedVolume = await getSetting<number>(SETTING_VOLUME)
        savedShuffle = await getSetting<boolean>(SETTING_SHUFFLE)
        savedRepeat = await getSetting<"off" | "single" | "all">(
          SETTING_REPEAT,
        )
      } catch {
        // best-effort: fall back to default playback settings
      }

      if (Array.isArray(savedTrackOrder)) {
        const ordered: Track[] = []
        const trackMap = new Map(tracks.map((t) => [t.id, t]))
        for (const id of savedTrackOrder) {
          const track = trackMap.get(id)
          if (track) {
            ordered.push(track)
            trackMap.delete(id)
          }
        }
        trackMap.forEach((t) => ordered.push(t))
        tracks = ordered
      }

      let playlists: Playlist[] = []
      try {
        const stored = await getAllPlaylists()
        playlists = stored.map((p) => ({
          id: p.id,
          name: p.name,
          trackIds: [...p.trackIds],
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }))
      } catch {
        playlists = []
      }

      set({
        tracks,
        volume: typeof savedVolume === "number" ? savedVolume : 0.7,
        shuffle: typeof savedShuffle === "boolean" ? savedShuffle : false,
        repeat:
          savedRepeat === "single" || savedRepeat === "all" || savedRepeat === "off"
            ? savedRepeat
            : "off",
        playlists,
      })

      try {
        setToLocalStorage(LEGACY_MUSIC_STATE_KEY, {
          volume: typeof savedVolume === "number" ? savedVolume : 0.7,
          shuffle: typeof savedShuffle === "boolean" ? savedShuffle : false,
          repeat: savedRepeat ?? "off",
          trackOrder: tracks.map((t) => t.id),
        } satisfies PersistedMusicState)
      } catch {
        // best-effort: the legacy mirror is non-critical
      }
    })()
    try {
      await initPromise
    } finally {
      initPromise = null
    }
  },
}))
