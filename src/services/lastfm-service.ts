import type { LastfmTag, LastfmTrackInfo } from '@/types'

export class LastfmService {
  private readonly BASE_URL = 'https://ws.audioscrobbler.com/2.0/'
  private readonly API_KEY = process.env.LASTFM_API_KEY || ''

  /**
   * Get track info including tags
   */
  async getTrackInfo(
    artist: string,
    track: string
  ): Promise<LastfmTrackInfo | null> {
    try {
      if (!this.API_KEY) {
        console.warn('Last.fm API key not configured')
        return null
      }

      const url = new URL(this.BASE_URL)
      url.searchParams.set('method', 'track.getInfo')
      url.searchParams.set('api_key', this.API_KEY)
      url.searchParams.set('artist', artist)
      url.searchParams.set('track', track)
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn('Last.fm API error:', data.message)
        return null
      }

      return data.track || null
    } catch (error) {
      console.error('Error getting Last.fm track info:', error)
      return null
    }
  }

  /**
   * Get top tags for a track
   */
  async getTrackTags(artist: string, track: string): Promise<LastfmTag[]> {
    try {
      const trackInfo = await this.getTrackInfo(artist, track)

      if (!trackInfo || !trackInfo.toptags) {
        return []
      }

      return trackInfo.toptags.tag || []
    } catch (error) {
      console.error('Error getting track tags:', error)
      return []
    }
  }

  /**
   * Search for tracks by tag
   */
  async searchByTag(
    tag: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Last.fm API key not configured')
        return []
      }

      const url = new URL(this.BASE_URL)
      url.searchParams.set('method', 'tag.getTopTracks')
      url.searchParams.set('api_key', this.API_KEY)
      url.searchParams.set('tag', tag)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn('Last.fm API error:', data.message)
        return []
      }

      return data.tracks?.track || []
    } catch (error) {
      console.error('Error searching Last.fm by tag:', error)
      return []
    }
  }

  /**
   * Get similar tracks
   */
  async getSimilarTracks(
    artist: string,
    track: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Last.fm API key not configured')
        return []
      }

      const url = new URL(this.BASE_URL)
      url.searchParams.set('method', 'track.getSimilar')
      url.searchParams.set('api_key', this.API_KEY)
      url.searchParams.set('artist', artist)
      url.searchParams.set('track', track)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn('Last.fm API error:', data.message)
        return []
      }

      return data.similartracks?.track || []
    } catch (error) {
      console.error('Error getting similar tracks:', error)
      return []
    }
  }

  /**
   * Get top artists by tag
   */
  async getTopArtistsByTag(tag: string, limit: number = 20): Promise<any[]> {
    try {
      if (!this.API_KEY) {
        console.warn('Last.fm API key not configured')
        return []
      }

      const url = new URL(this.BASE_URL)
      url.searchParams.set('method', 'tag.getTopArtists')
      url.searchParams.set('api_key', this.API_KEY)
      url.searchParams.set('tag', tag)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('format', 'json')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        console.warn('Last.fm API error:', data.message)
        return []
      }

      return data.topartists?.artist || []
    } catch (error) {
      console.error('Error getting top artists by tag:', error)
      return []
    }
  }

  /**
   * Calculate tag match score between track tags and target tags
   */
  calculateTagMatch(trackTags: LastfmTag[], targetTags: string[]): number {
    if (!trackTags || trackTags.length === 0) {
      return 0
    }

    const trackTagNames = trackTags.map((t) => t.name.toLowerCase())
    const normalizedTargets = targetTags.map((t) => t.toLowerCase())

    let score = 0
    let totalWeight = 0

    trackTags.forEach((tag, index) => {
      const weight = trackTags.length - index // Higher weight for top tags
      totalWeight += weight

      if (normalizedTargets.includes(tag.name.toLowerCase())) {
        score += weight
      }

      // Partial matches (e.g., "rock" matches "indie rock")
      normalizedTargets.forEach((targetTag) => {
        if (
          tag.name.toLowerCase().includes(targetTag) ||
          targetTag.includes(tag.name.toLowerCase())
        ) {
          score += weight * 0.5
        }
      })
    })

    return totalWeight > 0 ? score / totalWeight : 0
  }
}

// Export a singleton instance
export const lastfmService = new LastfmService()
