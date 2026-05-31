import { getFromLocalStorage } from "@/lib/storage"
import {
  putLocalTracks,
  putPlaylist,
  putSetting,
  SETTING_VOLUME,
  SETTING_SHUFFLE,
  SETTING_REPEAT,
  SETTING_TRACK_ORDER,
  type StoredLocalTrack,
} from "./audio-db"
import type { PersistedMusicState } from "./music-types"

// Pre-v2 localStorage keys, kept verbatim for one-time migration only (the live
// store persists to IndexedDB; see audio-db.ts). Not part of the active
// `STORAGE_KEYS`/`KEYBOARD_STORAGE_KEYS` registry in lib/constants.ts.
// The store also writes current state back to LEGACY_MUSIC_STATE_KEY on init for
// backward compatibility, so it is exported.
export const LEGACY_MUSIC_STATE_KEY = "prompt-pilot-music"
const LEGACY_LOCAL_TRACKS_KEY = "prompt-pilot-local-tracks"
const LEGACY_PLAYLISTS_KEY = "prompt-pilot-playlists"
const MIGRATION_FLAG_KEY = "prompt-pilot-music-migrated-v2"

/**
 * One-time migration of pre-v2 music data from localStorage into the
 * IndexedDB-backed store. Idempotent: guarded by a localStorage flag.
 */
export async function migrateLegacyStorageOnce(): Promise<void> {
  if (typeof window === "undefined") return
  try {
    if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return
  } catch {
    return
  }

  await migrateTracks()
  await migratePlaylists()
  await migrateSettings()

  try {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "1")
  } catch {
    return
  }
}

async function migrateTracks(): Promise<void> {
  try {
    const legacyTracksRaw = getFromLocalStorage<unknown>(LEGACY_LOCAL_TRACKS_KEY)
    if (!Array.isArray(legacyTracksRaw)) return
    const tracks: StoredLocalTrack[] = []
    legacyTracksRaw.forEach((entry, idx) => {
      if (!entry || typeof entry !== "object") return
      const meta = entry as Record<string, unknown>
      const id = typeof meta.id === "string" ? meta.id : null
      const title = typeof meta.title === "string" ? meta.title : null
      const fileId = typeof meta.fileId === "string" ? meta.fileId : null
      if (!id || !title || !fileId) return
      tracks.push({
        id,
        title,
        fileId,
        mimeType: typeof meta.mimeType === "string" ? meta.mimeType : undefined,
        sizeBytes:
          typeof meta.sizeBytes === "number" ? meta.sizeBytes : undefined,
        sortIndex: idx,
      })
    })
    if (tracks.length > 0) await putLocalTracks(tracks)
  } catch {
    return
  }
}

async function migratePlaylists(): Promise<void> {
  try {
    const legacyPlaylistsRaw = getFromLocalStorage<unknown>(LEGACY_PLAYLISTS_KEY)
    if (!Array.isArray(legacyPlaylistsRaw)) return
    const now = Date.now()
    for (const entry of legacyPlaylistsRaw) {
      if (!entry || typeof entry !== "object") continue
      const meta = entry as Record<string, unknown>
      const id = typeof meta.id === "string" ? meta.id : null
      const name = typeof meta.name === "string" ? meta.name : null
      const trackIds = Array.isArray(meta.trackIds)
        ? (meta.trackIds.filter((t) => typeof t === "string") as string[])
        : []
      if (!id || !name) continue
      await putPlaylist({
        id,
        name,
        trackIds,
        createdAt: now,
        updatedAt: now,
      })
    }
  } catch {
    return
  }
}

async function migrateSettings(): Promise<void> {
  try {
    const legacyState = getFromLocalStorage<PersistedMusicState>(
      LEGACY_MUSIC_STATE_KEY,
    )
    if (!legacyState) return
    if (typeof legacyState.volume === "number")
      await putSetting(SETTING_VOLUME, legacyState.volume)
    if (typeof legacyState.shuffle === "boolean")
      await putSetting(SETTING_SHUFFLE, legacyState.shuffle)
    if (
      legacyState.repeat === "off" ||
      legacyState.repeat === "single" ||
      legacyState.repeat === "all"
    )
      await putSetting(SETTING_REPEAT, legacyState.repeat)
    if (Array.isArray(legacyState.trackOrder))
      await putSetting(SETTING_TRACK_ORDER, legacyState.trackOrder)
  } catch {
    return
  }
}
