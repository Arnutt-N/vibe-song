import { z } from 'zod'

// Song data structure (matches database schema)
export const SongSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  artist: z.string().min(1),
  genre: z.string().min(1),
  year: z.number().int().min(1900).max(2100).optional(),
  tempo: z.number().int().min(40).max(200).optional(),
  language: z.enum(['Thai', 'English', 'Korean', 'Japanese', 'Chinese']),
  dialect: z.enum(['Isaan', 'Southern', 'Central']).optional(),
  lyricsSnippet: z.string().max(150).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tags: z.array(z.string()),
  youtubeUrl: z.string().url().optional(),
  spotifyUrl: z.string().url().optional(),
  deezerUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  metadata: z
    .object({
      spotifyId: z.string().optional(),
      deezerArtistId: z.string().optional(),
      popularityScore: z.number().min(0).max(100).optional(),
      duration: z.number().optional(),
      explicit: z.boolean().optional(),
      addedDate: z.string().optional(),
    })
    .optional(),
})

export type Song = z.infer<typeof SongSchema>

// Spotify API types
export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string; id: string }>
  album: {
    name: string
    release_date: string
    images: Array<{ url: string; height: number; width: number }>
  }
  duration_ms: number
  popularity: number
  explicit: boolean
  external_urls: { spotify: string }
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
  }
}

export interface SpotifyPlaylistResponse {
  items: Array<{
    track: SpotifyTrack
  }>
}

// YouTube API types
export interface YouTubeSearchResult {
  videoId: string
  title: string
  channelTitle: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
}

export interface YouTubeVideoDetails {
  id: string
  title: string
  channelTitle: string
  embeddable: boolean
  privacyStatus: string
}

// Deezer API types
export interface DeezerTrack {
  id: number
  title: string
  artist: {
    name: string
    id: number
  }
  album: {
    title: string
    cover: string
    release_date: string
  }
  duration: number
  bpm?: number
  link: string
}

// Collection result
export interface CollectionResult {
  songs: Song[]
  errors: Array<{
    song?: Partial<Song>
    error: string
  }>
  stats: {
    collected: number
    failed: number
    cached: number
    apiCalls: number
  }
}

// Validation result
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Data collector interface
export interface DataCollector {
  collect(query: string, limit: number): Promise<Song[]>
  fromPlaylist(playlistId: string): Promise<Song[]>
}
