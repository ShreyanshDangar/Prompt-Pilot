export type StoredAudioFile = {
  id: string
  file: Blob
  name: string
  type: string
  size: number
}

export type StoredLocalTrack = {
  id: string
  title: string
  fileId: string
  mimeType?: string
  sizeBytes?: number
  sortIndex?: number
}

export type StoredPlaylist = {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export type StoredSetting<T = unknown> = {
  key: string
  value: T
}

// Well-known keys for the settings object store.
export const SETTING_VOLUME = "volume"
export const SETTING_SHUFFLE = "shuffle"
export const SETTING_REPEAT = "repeat"
export const SETTING_TRACK_ORDER = "trackOrder"

const DB_NAME = "prompt-pilot-music-player"
const DB_VERSION = 2
const AUDIO_STORE = "audio-files"
const TRACKS_STORE = "local-tracks"
const PLAYLISTS_STORE = "playlists"
const SETTINGS_STORE = "settings"

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(AUDIO_STORE)) {
        database.createObjectStore(AUDIO_STORE, { keyPath: "id" })
      }
      if (!database.objectStoreNames.contains(TRACKS_STORE)) {
        database.createObjectStore(TRACKS_STORE, { keyPath: "id" })
      }
      if (!database.objectStoreNames.contains(PLAYLISTS_STORE)) {
        database.createObjectStore(PLAYLISTS_STORE, { keyPath: "id" })
      }
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: "key" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB."))
    request.onblocked = () =>
      reject(new Error("IndexedDB open request was blocked."))
  })
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."))
  })
}

function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T> | T,
): Promise<T> {
  return openDB().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(storeName, mode)
        const store = transaction.objectStore(storeName)
        let result: T | undefined
        try {
          const out = fn(store)
          if (out && typeof (out as IDBRequest<T>).onsuccess !== "undefined") {
            const req = out as IDBRequest<T>
            req.onsuccess = () => {
              result = req.result
            }
            req.onerror = () => {
              database.close()
              reject(req.error ?? new Error("IndexedDB request failed."))
            }
          } else {
            result = out as T
          }
          waitForTransaction(transaction)
            .then(() => resolve(result as T))
            .catch(reject)
            .finally(() => database.close())
        } catch (error) {
          database.close()
          reject(error)
        }
      }),
  )
}

export async function getAudioFile(
  id: string,
): Promise<StoredAudioFile | undefined> {
  return withStore(AUDIO_STORE, "readonly", (store) =>
    store.get(id),
  ) as Promise<StoredAudioFile | undefined>
}

export async function putAudioFile(record: StoredAudioFile): Promise<void> {
  await withStore(AUDIO_STORE, "readwrite", (store) => store.put(record))
}

export async function deleteAudioFile(id: string): Promise<void> {
  await withStore(AUDIO_STORE, "readwrite", (store) => store.delete(id))
}

export async function getAllLocalTracks(): Promise<StoredLocalTrack[]> {
  const result = await withStore(TRACKS_STORE, "readonly", (store) =>
    store.getAll(),
  )
  const list = (result ?? []) as StoredLocalTrack[]
  return list.sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0))
}

export async function putLocalTrack(track: StoredLocalTrack): Promise<void> {
  await withStore(TRACKS_STORE, "readwrite", (store) => store.put(track))
}

export async function putLocalTracks(
  tracks: StoredLocalTrack[],
): Promise<void> {
  if (tracks.length === 0) return
  const database = await openDB()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(TRACKS_STORE, "readwrite")
    const store = transaction.objectStore(TRACKS_STORE)
    for (const track of tracks) store.put(track)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Failed to write tracks."))
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Track write aborted."))
  }).finally(() => database.close())
}

export async function deleteLocalTrack(id: string): Promise<void> {
  await withStore(TRACKS_STORE, "readwrite", (store) => store.delete(id))
}

export async function getAllPlaylists(): Promise<StoredPlaylist[]> {
  const result = await withStore(PLAYLISTS_STORE, "readonly", (store) =>
    store.getAll(),
  )
  const list = (result ?? []) as StoredPlaylist[]
  return list.sort((a, b) => a.createdAt - b.createdAt)
}

export async function putPlaylist(playlist: StoredPlaylist): Promise<void> {
  await withStore(PLAYLISTS_STORE, "readwrite", (store) => store.put(playlist))
}

export async function deletePlaylist(id: string): Promise<void> {
  await withStore(PLAYLISTS_STORE, "readwrite", (store) => store.delete(id))
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const result = (await withStore(SETTINGS_STORE, "readonly", (store) =>
    store.get(key),
  )) as StoredSetting<T> | undefined
  return result?.value
}

export async function putSetting<T>(key: string, value: T): Promise<void> {
  await withStore(SETTINGS_STORE, "readwrite", (store) =>
    store.put({ key, value }),
  )
}
