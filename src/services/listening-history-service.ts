import { createClient } from '@/lib/supabase/client'
import type { DeezerTrack, ListeningHistory, MoodEmoji } from '@/types'

export class ListeningHistoryService {
  private supabase = createClient()

  /**
   * Add a track to listening history
   */
  async addToHistory(
    track: DeezerTrack,
    mood?: {
      emoji: MoodEmoji | null
      energyLevel: number
      moodValence: number
    },
    listenDuration: number = 0
  ): Promise<ListeningHistory | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        // For anonymous users, could save to localStorage
        return null
      }

      const { data, error } = await this.supabase
        .from('listening_history')
        .insert({
          user_id: user.id,
          track_id: track.id.toString(),
          track_title: track.title,
          artist_name: track.artist.name,
          album_cover: track.album.cover_medium,
          mood_emoji: mood?.emoji || null,
          energy_level: mood?.energyLevel || null,
          mood_valence: mood?.moodValence || null,
          listen_duration: listenDuration,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        userId: data.user_id,
        trackId: data.track_id,
        trackTitle: data.track_title,
        artistName: data.artist_name,
        albumCover: data.album_cover,
        moodEmoji: data.mood_emoji,
        energyLevel: data.energy_level,
        moodValence: data.mood_valence,
        playedAt: data.played_at,
        listenDuration: data.listen_duration,
      }
    } catch (error) {
      console.error('Error adding to listening history:', error)
      return null
    }
  }

  /**
   * Get listening history for the current user
   */
  async getHistory(limit: number = 50): Promise<ListeningHistory[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await this.supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data.map((item) => ({
        id: item.id,
        userId: item.user_id,
        trackId: item.track_id,
        trackTitle: item.track_title,
        artistName: item.artist_name,
        albumCover: item.album_cover,
        moodEmoji: item.mood_emoji,
        energyLevel: item.energy_level,
        moodValence: item.mood_valence,
        playedAt: item.played_at,
        listenDuration: item.listen_duration,
      }))
    } catch (error) {
      console.error('Error getting listening history:', error)
      return []
    }
  }

  /**
   * Get recently played tracks (unique tracks only)
   */
  async getRecentlyPlayed(limit: number = 20): Promise<ListeningHistory[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) return []

      // Get distinct tracks ordered by most recent play
      const { data, error } = await this.supabase
        .from('listening_history')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })

      if (error) throw error

      // Deduplicate by track_id, keeping most recent
      const uniqueTracks = new Map<string, any>()
      data.forEach((item) => {
        if (!uniqueTracks.has(item.track_id)) {
          uniqueTracks.set(item.track_id, item)
        }
      })

      const result = Array.from(uniqueTracks.values())
        .slice(0, limit)
        .map((item) => ({
          id: item.id,
          userId: item.user_id,
          trackId: item.track_id,
          trackTitle: item.track_title,
          artistName: item.artist_name,
          albumCover: item.album_cover,
          moodEmoji: item.mood_emoji,
          energyLevel: item.energy_level,
          moodValence: item.mood_valence,
          playedAt: item.played_at,
          listenDuration: item.listen_duration,
        }))

      return result
    } catch (error) {
      console.error('Error getting recently played tracks:', error)
      return []
    }
  }

  /**
   * Clear all listening history for the current user
   */
  async clearHistory(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) return false

      const { error } = await this.supabase
        .from('listening_history')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error clearing listening history:', error)
      return false
    }
  }
}

// Export a singleton instance
export const listeningHistoryService = new ListeningHistoryService()
