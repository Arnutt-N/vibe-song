import { createClient } from '@/lib/supabase/client'
import type { DeezerTrack, SavedTrack } from '@/types'

export class SavedTracksService {
  private supabase = createClient()

  /**
   * Save a track for the current user
   */
  async saveTrack(track: DeezerTrack): Promise<SavedTrack | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error('User must be authenticated to save tracks')
      }

      const { data, error } = await this.supabase
        .from('saved_tracks')
        .insert({
          user_id: user.id,
          track_id: track.id.toString(),
          track_title: track.title,
          artist_name: track.artist.name,
          album_cover: track.album.cover_medium,
        })
        .select()
        .single()

      if (error) {
        // Handle duplicate key error (track already saved)
        if (error.code === '23505') {
          console.log('Track already saved')
          return null
        }
        throw error
      }

      return {
        id: data.id,
        userId: data.user_id,
        trackId: data.track_id,
        trackTitle: data.track_title,
        artistName: data.artist_name,
        albumCover: data.album_cover,
        savedAt: data.saved_at,
      }
    } catch (error) {
      console.error('Error saving track:', error)
      return null
    }
  }

  /**
   * Remove a saved track
   */
  async unsaveTrack(trackId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error('User must be authenticated')
      }

      const { error } = await this.supabase
        .from('saved_tracks')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error unsaving track:', error)
      return false
    }
  }

  /**
   * Check if a track is saved
   */
  async isTrackSaved(trackId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) return false

      const { data, error } = await this.supabase
        .from('saved_tracks')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking if track is saved:', error)
      return false
    }
  }

  /**
   * Get all saved tracks for the current user
   */
  async getSavedTracks(): Promise<SavedTrack[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) return []

      const { data, error } = await this.supabase
        .from('saved_tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (error) throw error

      return data.map((track) => ({
        id: track.id,
        userId: track.user_id,
        trackId: track.track_id,
        trackTitle: track.track_title,
        artistName: track.artist_name,
        albumCover: track.album_cover,
        savedAt: track.saved_at,
      }))
    } catch (error) {
      console.error('Error getting saved tracks:', error)
      return []
    }
  }

  /**
   * Get saved track IDs as a Set for quick lookup
   */
  async getSavedTrackIds(): Promise<Set<number>> {
    try {
      const tracks = await this.getSavedTracks()
      return new Set(tracks.map((t) => parseInt(t.trackId)))
    } catch (error) {
      console.error('Error getting saved track IDs:', error)
      return new Set()
    }
  }
}

// Export a singleton instance
export const savedTracksService = new SavedTracksService()
