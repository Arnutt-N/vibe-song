export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          is_anonymous?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_genres: string[]
          excluded_genres: string[]
          language_preference: string | null
          explicit_content: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_genres?: string[]
          excluded_genres?: string[]
          language_preference?: string | null
          explicit_content?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_genres?: string[]
          excluded_genres?: string[]
          language_preference?: string | null
          explicit_content?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      listening_history: {
        Row: {
          id: string
          user_id: string
          track_id: string
          track_title: string
          artist_name: string
          album_cover: string | null
          mood_emoji: string | null
          energy_level: number | null
          mood_valence: number | null
          played_at: string
          listen_duration: number
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          track_title: string
          artist_name: string
          album_cover?: string | null
          mood_emoji?: string | null
          energy_level?: number | null
          mood_valence?: number | null
          played_at?: string
          listen_duration?: number
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          track_title?: string
          artist_name?: string
          album_cover?: string | null
          mood_emoji?: string | null
          energy_level?: number | null
          mood_valence?: number | null
          played_at?: string
          listen_duration?: number
        }
      }
      mood_sessions: {
        Row: {
          id: string
          user_id: string
          mood_emoji: string
          energy_level: number
          mood_valence: number
          context: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood_emoji: string
          energy_level: number
          mood_valence: number
          context?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood_emoji?: string
          energy_level?: number
          mood_valence?: number
          context?: Json | null
          created_at?: string
        }
      }
      saved_tracks: {
        Row: {
          id: string
          user_id: string
          track_id: string
          track_title: string
          artist_name: string
          album_cover: string | null
          saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          track_title: string
          artist_name: string
          album_cover?: string | null
          saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          track_title?: string
          artist_name?: string
          album_cover?: string | null
          saved_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
