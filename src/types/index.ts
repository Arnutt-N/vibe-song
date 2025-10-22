// Mood Types
export type MoodEmoji = '😊' | '😢' | '😌' | '🔥' | '💭' | '😴' | '💪' | '🎉'

export interface MoodState {
  emoji: MoodEmoji | null
  energyLevel: number // 1-10
  moodValence: number // 1-10
}

export interface MoodConfig {
  emoji: MoodEmoji
  label: string
  description: string
  energyRange: [number, number]
  valenceRange: [number, number]
  genres: string[]
  tags: string[]
}

// Deezer API Types
export interface DeezerTrack {
  id: number
  title: string
  title_short: string
  link: string
  duration: number
  rank: number
  explicit_lyrics: boolean
  preview: string
  artist: {
    id: number
    name: string
    picture: string
    picture_small: string
    picture_medium: string
    picture_big: string
  }
  album: {
    id: number
    title: string
    cover: string
    cover_small: string
    cover_medium: string
    cover_big: string
    cover_xl: string
  }
}

export interface DeezerSearchResponse {
  data: DeezerTrack[]
  total: number
  next?: string
}

export interface DeezerGenre {
  id: number
  name: string
  picture: string
}

// Last.fm API Types
export interface LastfmTag {
  name: string
  count: number
}

export interface LastfmTrackInfo {
  name: string
  artist: {
    name: string
  }
  toptags: {
    tag: LastfmTag[]
  }
}

// Recommendation Types
export interface RecommendationRequest {
  mood: MoodState
  userId?: string
  limit?: number
  offset?: number
}

export interface RecommendationResponse {
  tracks: DeezerTrack[]
  total: number
  mood: MoodState
  requestId: string
}

// User Types
export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  avatarUrl: string | null
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  id: string
  userId: string
  favoriteGenres: string[]
  excludedGenres: string[]
  languagePreference: string | null
  explicitContent: boolean
  createdAt: string
  updatedAt: string
}

// Player Types
export interface PlayerState {
  currentTrack: DeezerTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: DeezerTrack[]
  queueIndex: number
}

// History Types
export interface ListeningHistory {
  id: string
  userId: string
  trackId: string
  trackTitle: string
  artistName: string
  albumCover: string | null
  moodEmoji: MoodEmoji | null
  energyLevel: number | null
  moodValence: number | null
  playedAt: string
  listenDuration: number
}

export interface SavedTrack {
  id: string
  userId: string
  trackId: string
  trackTitle: string
  artistName: string
  albumCover: string | null
  savedAt: string
}

export interface MoodSession {
  id: string
  userId: string
  moodEmoji: MoodEmoji
  energyLevel: number
  moodValence: number
  context: Record<string, any> | null
  createdAt: string
}
