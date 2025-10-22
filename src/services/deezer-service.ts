import type { DeezerTrack, DeezerSearchResponse, DeezerGenre } from '@/types'

export class DeezerService {
  private readonly BASE_URL = 'https://api.deezer.com'

  /**
   * Search for tracks by genre
   */
  async searchByGenre(
    genre: string,
    limit: number = 25,
    offset: number = 0
  ): Promise<DeezerSearchResponse> {
    try {
      const url = `${this.BASE_URL}/search?q=genre:"${encodeURIComponent(genre)}"&limit=${limit}&index=${offset}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        data: data.data || [],
        total: data.total || 0,
        next: data.next,
      }
    } catch (error) {
      console.error('Error searching Deezer by genre:', error)
      return { data: [], total: 0 }
    }
  }

  /**
   * Search for tracks by query string
   */
  async searchByQuery(
    query: string,
    limit: number = 25,
    offset: number = 0
  ): Promise<DeezerSearchResponse> {
    try {
      const url = `${this.BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&index=${offset}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        data: data.data || [],
        total: data.total || 0,
        next: data.next,
      }
    } catch (error) {
      console.error('Error searching Deezer by query:', error)
      return { data: [], total: 0 }
    }
  }

  /**
   * Search tracks with advanced filters
   */
  async searchAdvanced(params: {
    genre?: string
    artist?: string
    bpm?: { min?: number; max?: number }
    limit?: number
    offset?: number
  }): Promise<DeezerSearchResponse> {
    try {
      const queryParts: string[] = []

      if (params.genre) {
        queryParts.push(`genre:"${params.genre}"`)
      }

      if (params.artist) {
        queryParts.push(`artist:"${params.artist}"`)
      }

      if (params.bpm) {
        if (params.bpm.min) {
          queryParts.push(`bpm_min:${params.bpm.min}`)
        }
        if (params.bpm.max) {
          queryParts.push(`bpm_max:${params.bpm.max}`)
        }
      }

      const query = queryParts.join(' ')
      const limit = params.limit || 25
      const offset = params.offset || 0

      if (!query) {
        // If no query, get popular tracks
        return this.getPopularTracks(limit)
      }

      const url = `${this.BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}&index=${offset}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        data: data.data || [],
        total: data.total || 0,
        next: data.next,
      }
    } catch (error) {
      console.error('Error searching Deezer advanced:', error)
      return { data: [], total: 0 }
    }
  }

  /**
   * Get popular/trending tracks
   */
  async getPopularTracks(limit: number = 25): Promise<DeezerSearchResponse> {
    try {
      // Get tracks from a popular chart
      const url = `${this.BASE_URL}/chart/0/tracks?limit=${limit}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()

      return {
        data: data.data || [],
        total: data.total || 0,
        next: data.next,
      }
    } catch (error) {
      console.error('Error getting popular tracks:', error)
      return { data: [], total: 0 }
    }
  }

  /**
   * Get track details by ID
   */
  async getTrackById(trackId: number): Promise<DeezerTrack | null> {
    try {
      const url = `${this.BASE_URL}/track/${trackId}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting track by ID:', error)
      return null
    }
  }

  /**
   * Get available genres
   */
  async getGenres(): Promise<DeezerGenre[]> {
    try {
      const url = `${this.BASE_URL}/genre`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Deezer API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error getting genres:', error)
      return []
    }
  }

  /**
   * Search for multiple genres and combine results
   */
  async searchMultipleGenres(
    genres: string[],
    limit: number = 25
  ): Promise<DeezerSearchResponse> {
    try {
      const limitPerGenre = Math.ceil(limit / genres.length)
      const promises = genres.map((genre) =>
        this.searchByGenre(genre, limitPerGenre)
      )

      const results = await Promise.all(promises)

      // Combine and deduplicate results
      const allTracks: DeezerTrack[] = []
      const trackIds = new Set<number>()

      results.forEach((result) => {
        result.data.forEach((track) => {
          if (!trackIds.has(track.id)) {
            trackIds.add(track.id)
            allTracks.push(track)
          }
        })
      })

      // Shuffle for diversity
      const shuffled = allTracks.sort(() => Math.random() - 0.5)

      return {
        data: shuffled.slice(0, limit),
        total: allTracks.length,
      }
    } catch (error) {
      console.error('Error searching multiple genres:', error)
      return { data: [], total: 0 }
    }
  }
}

// Export a singleton instance
export const deezerService = new DeezerService()
