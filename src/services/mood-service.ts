import { createClient } from '@/lib/supabase/client'
import type { MoodEmoji, MoodSession } from '@/types'

export class MoodService {
  private supabase = createClient()

  /**
   * Save a mood session to the database
   */
  async saveMoodSession(
    moodEmoji: MoodEmoji,
    energyLevel: number,
    moodValence: number,
    context?: Record<string, any>
  ): Promise<MoodSession | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        // For anonymous users, save to localStorage
        this.saveToLocalStorage({
          id: crypto.randomUUID(),
          userId: 'anonymous',
          moodEmoji,
          energyLevel,
          moodValence,
          context: context || null,
          createdAt: new Date().toISOString(),
        })
        return null
      }

      const { data, error } = await this.supabase
        .from('mood_sessions')
        .insert({
          user_id: user.id,
          mood_emoji: moodEmoji,
          energy_level: energyLevel,
          mood_valence: moodValence,
          context: context || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving mood session:', error)
        return null
      }

      // Also save to localStorage for quick access
      this.saveToLocalStorage({
        id: data.id,
        userId: data.user_id,
        moodEmoji: data.mood_emoji,
        energyLevel: data.energy_level,
        moodValence: data.mood_valence,
        context: data.context,
        createdAt: data.created_at,
      })

      return {
        id: data.id,
        userId: data.user_id,
        moodEmoji: data.mood_emoji,
        energyLevel: data.energy_level,
        moodValence: data.mood_valence,
        context: data.context,
        createdAt: data.created_at,
      }
    } catch (error) {
      console.error('Unexpected error saving mood session:', error)
      return null
    }
  }

  /**
   * Get recent mood sessions for the current user
   */
  async getRecentMoodSessions(limit: number = 5): Promise<MoodSession[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        // For anonymous users, return from localStorage
        return this.getFromLocalStorage()
      }

      const { data, error } = await this.supabase
        .from('mood_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching mood sessions:', error)
        return this.getFromLocalStorage()
      }

      return data.map((session) => ({
        id: session.id,
        userId: session.user_id,
        moodEmoji: session.mood_emoji,
        energyLevel: session.energy_level,
        moodValence: session.mood_valence,
        context: session.context,
        createdAt: session.created_at,
      }))
    } catch (error) {
      console.error('Unexpected error fetching mood sessions:', error)
      return this.getFromLocalStorage()
    }
  }

  /**
   * Save mood session to localStorage (fallback for anonymous users)
   */
  private saveToLocalStorage(session: MoodSession) {
    try {
      const existing = this.getFromLocalStorage()
      const updated = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 10)
      localStorage.setItem('vibe-song-mood-history', JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Get mood sessions from localStorage
   */
  private getFromLocalStorage(): MoodSession[] {
    try {
      const stored = localStorage.getItem('vibe-song-mood-history')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error)
    }
    return []
  }

  /**
   * Clear all mood sessions (for testing/development)
   */
  async clearMoodSessions(): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (user) {
        await this.supabase
          .from('mood_sessions')
          .delete()
          .eq('user_id', user.id)
      }

      localStorage.removeItem('vibe-song-mood-history')
    } catch (error) {
      console.error('Error clearing mood sessions:', error)
    }
  }
}

// Export a singleton instance
export const moodService = new MoodService()
