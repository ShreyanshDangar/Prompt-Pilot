export interface Track {
  id: string
  title: string
  src: string
  isLocal?: boolean
  fileId?: string
  mimeType?: string
  sizeBytes?: number
}

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
  createdAt: number
  updatedAt: number
}

export interface PersistedMusicState {
  volume: number
  shuffle: boolean
  repeat: "off" | "single" | "all"
  trackOrder: string[]
}

export type MusicView = "collapsed" | "iconified" | "closed"
export type MusicTab = "all" | "playlists" | "local"
