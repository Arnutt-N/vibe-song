import type { DeezerTrack, MoodEmoji, MoodState, RecommendationRequest } from '@/types'
import { MOOD_MAP } from '@/lib/constants'
import { deezerService } from './deezer-service'
import { lastfmService } from './lastfm-service'

interface ScoredTrack extends DeezerTrack {
  score: number
  scoreBreakdown?: {
    popularity: number
    moodMatch: number
    tagMatch: number
    recency: number
  }
}

export class RecommendationService {
  /**
   * Generate music recommendations based on mood
   */
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<DeezerTrack[]> {
    const { mood, limit = 20 } = request

    if (!mood.emoji) {
      throw new Error('Mood emoji is required')
    }

    try {
      // Get mood configuration
      const moodConfig = MOOD_MAP[mood.emoji as MoodEmoji]

      // Search for tracks based on mood genres
      const searchResults = await deezerService.searchMultipleGenres(
        moodConfig.genres,
        limit * 2 // Get more tracks than needed for better filtering
      )

      // Score and rank tracks
      const scoredTracks = await this.scoreAndRankTracks(
        searchResults.data,
        mood,
        moodConfig.tags
      )

      // Return top tracks
      return scoredTracks.slice(0, limit)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw error
    }
  }

  /**
   * Score and rank tracks based on mood matching
   */
  private async scoreAndRankTracks(
    tracks: DeezerTrack[],
    mood: MoodState,
    targetTags: string[]
  ): Promise<DeezerTrack[]> {
    const scoredTracks: ScoredTrack[] = []

    for (const track of tracks) {
      const score = await this.calculateTrackScore(track, mood, targetTags)

      scoredTracks.push({
        ...track,
        score: score.total,
        scoreBreakdown: score.breakdown,
      })
    }

    // Sort by score descending
    scoredTracks.sort((a, b) => b.score - a.score)

    return scoredTracks
  }

  /**
   * Calculate overall score for a track
   */
  private async calculateTrackScore(
    track: DeezerTrack,
    mood: MoodState,
    targetTags: string[]
  ): Promise<{ total: number; breakdown: any }> {
    // 1. Popularity score (0-1)
    const popularityScore = this.calculatePopularityScore(track.rank)

    // 2. Mood match score (0-1)
    const moodMatchScore = this.calculateMoodMatchScore(track, mood)

    // 3. Tag match score (0-1) - Optional, requires Last.fm API
    let tagMatchScore = 0
    if (process.env.LASTFM_API_KEY) {
      try {
        const tags = await lastfmService.getTrackTags(
          track.artist.name,
          track.title
        )
        tagMatchScore = lastfmService.calculateTagMatch(tags, targetTags)
      } catch (error) {
        // Silently fail if Last.fm is not available
        tagMatchScore = 0.5 // Default to neutral score
      }
    }

    // 4. Recency score (0-1) - Based on track rank as proxy
    const recencyScore = this.calculateRecencyScore(track)

    // Weighted average
    const weights = {
      popularity: 0.3,
      moodMatch: 0.4,
      tagMatch: 0.2,
      recency: 0.1,
    }

    const total =
      popularityScore * weights.popularity +
      moodMatchScore * weights.moodMatch +
      tagMatchScore * weights.tagMatch +
      recencyScore * weights.recency

    return {
      total,
      breakdown: {
        popularity: popularityScore,
        moodMatch: moodMatchScore,
        tagMatch: tagMatchScore,
        recency: recencyScore,
      },
    }
  }

  /**
   * Calculate popularity score based on Deezer rank
   */
  private calculatePopularityScore(rank: number): number {
    // Deezer rank: higher is more popular (0-1000000)
    // Normalize to 0-1 scale with logarithmic scaling
    const normalized = Math.log10(rank + 1) / Math.log10(1000000)
    return Math.max(0, Math.min(1, normalized))
  }

  /**
   * Calculate mood match score based on energy and valence
   */
  private calculateMoodMatchScore(track: DeezerTrack, mood: MoodState): number {
    // Use track duration and rank as proxies for energy
    // Longer tracks tend to be more mellow, shorter more energetic
    const avgDuration = 240 // 4 minutes average
    const durationScore = track.duration < avgDuration ? 0.6 : 0.4

    // Use explicit lyrics as proxy for intensity
    const explicitScore = track.explicit_lyrics ? 0.7 : 0.5

    // Combine proxies
    const energyScore = (durationScore + explicitScore) / 2

    // Energy match
    const energyDiff = Math.abs(energyScore * 10 - mood.energyLevel) / 10
    const energyMatch = 1 - energyDiff

    // For valence, use rank as proxy (popular = positive)
    const valenceScore = this.calculatePopularityScore(track.rank)
    const valenceDiff = Math.abs(valenceScore * 10 - mood.moodValence) / 10
    const valenceMatch = 1 - valenceDiff

    // Average of energy and valence match
    return (energyMatch + valenceMatch) / 2
  }

  /**
   * Calculate recency score
   */
  private calculateRecencyScore(track: DeezerTrack): number {
    // Use rank as proxy for recency (higher rank = more recent/trending)
    return this.calculatePopularityScore(track.rank)
  }

  /**
   * Get recommendations for quick access (cached or popular)
   */
  async getQuickRecommendations(limit: number = 20): Promise<DeezerTrack[]> {
    try {
      const response = await deezerService.getPopularTracks(limit)
      return response.data
    } catch (error) {
      console.error('Error getting quick recommendations:', error)
      return []
    }
  }

  /**
   * Get recommendations by genre
   */
  async getRecommendationsByGenre(
    genre: string,
    limit: number = 20
  ): Promise<DeezerTrack[]> {
    try {
      const response = await deezerService.searchByGenre(genre, limit)
      return response.data
    } catch (error) {
      console.error('Error getting recommendations by genre:', error)
      return []
    }
  }

  /**
   * Ensure diversity in recommendations
   */
  private ensureDiversity(tracks: DeezerTrack[]): DeezerTrack[] {
    const diverse: DeezerTrack[] = []
    const artistIds = new Set<number>()
    const albumIds = new Set<number>()

    // First pass: one track per artist
    for (const track of tracks) {
      if (!artistIds.has(track.artist.id)) {
        diverse.push(track)
        artistIds.add(track.artist.id)
        albumIds.add(track.album.id)
      }
    }

    // Second pass: fill remaining slots
    for (const track of tracks) {
      if (diverse.length >= tracks.length) break

      if (!diverse.find((t) => t.id === track.id)) {
        diverse.push(track)
      }
    }

    return diverse
  }
}

// Export a singleton instance
export const recommendationService = new RecommendationService()
