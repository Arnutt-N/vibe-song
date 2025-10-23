import axios from 'axios'
import { nanoid } from 'nanoid'
import type {
  Song,
  SpotifyTrack,
  SpotifySearchResponse,
  SpotifyPlaylistResponse,
  DataCollector,
} from '../types'
import { config } from '../config'
import { sleep, log, loadCache, saveCache } from '../utils'

export class SpotifyCollector implements DataCollector {
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private cacheFile = 'spotify-cache.json'

  constructor(
    private credentials: {
      clientId: string
      clientSecret: string
    }
  ) {}

  /**
   * Get Spotify access token (OAuth 2.0 Client Credentials)
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    log('Requesting Spotify access token...')

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(
              `${this.credentials.clientId}:${this.credentials.clientSecret}`
            ).toString('base64'),
        },
      }
    )

    this.accessToken = response.data.access_token
    this.tokenExpiry = Date.now() + response.data.expires_in * 1000

    log('✓ Access token obtained')
    return this.accessToken
  }

  /**
   * Search for songs on Spotify
   */
  async collect(query: string, limit: number = 50): Promise<Song[]> {
    const cacheKey = `search:${query}:${limit}`
    const cached = loadCache<Song[]>(this.cacheFile, cacheKey)
    if (cached) {
      log(`✓ Using cached results for: ${query}`)
      return cached
    }

    const token = await this.getAccessToken()
    const songs: Song[] = []

    log(`Searching Spotify for: "${query}" (limit: ${limit})`)

    try {
      const response = await axios.get<SpotifySearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: query,
            type: 'track',
            limit: Math.min(limit, 50), // Spotify max = 50 per request
            market: 'TH', // Thai market
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      for (const track of response.data.tracks.items) {
        const song = this.convertTrackToSong(track)
        songs.push(song)
      }

      log(`✓ Found ${songs.length} songs`)

      // Cache results
      saveCache(this.cacheFile, cacheKey, songs)

      // Rate limiting
      await sleep(config.collection.rateLimits.spotify)

      return songs
    } catch (error) {
      if (axios.isAxiosError(error)) {
        log(`✗ Spotify API error: ${error.response?.status} ${error.message}`)
        throw new Error(`Spotify API error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Get songs from Spotify playlist
   */
  async fromPlaylist(playlistId: string): Promise<Song[]> {
    const cacheKey = `playlist:${playlistId}`
    const cached = loadCache<Song[]>(this.cacheFile, cacheKey)
    if (cached) {
      log(`✓ Using cached playlist: ${playlistId}`)
      return cached
    }

    const token = await this.getAccessToken()
    const songs: Song[] = []

    log(`Fetching Spotify playlist: ${playlistId}`)

    try {
      let offset = 0
      const limit = 100 // Max per request

      while (true) {
        const response = await axios.get<SpotifyPlaylistResponse>(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            params: { offset, limit },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        for (const item of response.data.items) {
          if (item.track) {
            const song = this.convertTrackToSong(item.track)
            songs.push(song)
          }
        }

        // Check if more pages
        if (response.data.items.length < limit) {
          break
        }
        offset += limit

        // Rate limiting
        await sleep(config.collection.rateLimits.spotify)
      }

      log(`✓ Got ${songs.length} songs from playlist`)

      // Cache results
      saveCache(this.cacheFile, cacheKey, songs)

      return songs
    } catch (error) {
      if (axios.isAxiosError(error)) {
        log(`✗ Spotify API error: ${error.response?.status} ${error.message}`)
        throw new Error(`Spotify API error: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Convert Spotify track to Song format
   */
  private convertTrackToSong(track: SpotifyTrack): Song {
    // Detect language from track name/artist
    const language = this.detectLanguage(track.name, track.artists[0].name)

    // Detect Thai genre
    const genre = this.detectGenre(track)

    // Extract year from release date
    const year = parseInt(track.album.release_date.substring(0, 4))

    // Detect difficulty (heuristic based on popularity)
    const difficulty = this.estimateDifficulty(track)

    // Generate tags
    const tags = this.generateTags(track, genre)

    return {
      id: `song_${nanoid(10)}`,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      genre,
      year,
      language,
      difficulty,
      tags,
      spotifyUrl: track.external_urls.spotify,
      imageUrl: track.album.images[0]?.url,
      metadata: {
        spotifyId: track.id,
        popularityScore: track.popularity,
        duration: track.duration_ms,
        explicit: track.explicit,
        addedDate: new Date().toISOString(),
      },
    }
  }

  /**
   * Detect language from text
   */
  private detectLanguage(title: string, artist: string): Song['language'] {
    const text = `${title} ${artist}`.toLowerCase()

    // Thai characters
    if (/[\u0E00-\u0E7F]/.test(text)) {
      return 'Thai'
    }

    // Korean characters
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
      return 'Korean'
    }

    // Japanese characters (Hiragana, Katakana, Kanji)
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      return 'Japanese'
    }

    // Chinese characters
    if (/[\u4E00-\u9FFF]/.test(text)) {
      return 'Chinese'
    }

    // Default to English
    return 'English'
  }

  /**
   * Detect genre (Thai-specific or general)
   */
  private detectGenre(track: SpotifyTrack): string {
    const title = track.name.toLowerCase()
    const artist = track.artists[0].name.toLowerCase()

    // Thai genres
    const thaiGenres = {
      ลูกทุ่ง: ['ลูกทุ่ง', 'luk thung'],
      ลูกกรุง: ['ลูกกรุง', 'luk krung'],
      สตริง: ['สตริง', 'string'],
      หมอลำ: ['หมอลำ', 'mor lam', 'molam'],
      เพลงใต้: ['เพลงใต้'],
      เพื่อชีวิต: ['เพื่อชีวิต', 'carabao'],
      สามช่า: ['สามช่า', '3cha'],
    }

    for (const [genre, keywords] of Object.entries(thaiGenres)) {
      if (keywords.some((kw) => title.includes(kw) || artist.includes(kw))) {
        return genre
      }
    }

    // International genres
    if (/k-?pop|korean/.test(title) || /k-?pop|korean/.test(artist)) {
      return 'K-pop'
    }
    if (/j-?pop|japanese|anime/.test(title) || /j-?pop|japanese/.test(artist)) {
      return 'J-pop'
    }
    if (/c-?pop|chinese|mandarin|cantonese/.test(title)) {
      return 'C-pop'
    }

    // Default based on language
    const language = this.detectLanguage(title, artist)
    if (language === 'Thai') return 'ลูกกรุง' // Default Thai genre
    if (language === 'Korean') return 'K-pop'
    if (language === 'Japanese') return 'J-pop'
    if (language === 'Chinese') return 'C-pop'

    return 'Pop' // Default
  }

  /**
   * Estimate difficulty based on popularity
   */
  private estimateDifficulty(track: SpotifyTrack): Song['difficulty'] {
    // High popularity = popular = likely easier to sing
    if (track.popularity >= 70) return 'Easy'
    if (track.popularity >= 40) return 'Medium'
    return 'Hard'
  }

  /**
   * Generate tags
   */
  private generateTags(track: SpotifyTrack, genre: string): string[] {
    const tags: string[] = []

    // Popularity tag
    if (track.popularity >= 80) {
      tags.push('ฮิต', 'ยอดนิยม')
    } else if (track.popularity >= 60) {
      tags.push('ฮิต')
    }

    // Genre tag
    tags.push(genre)

    // Year tag
    const year = parseInt(track.album.release_date.substring(0, 4))
    if (year >= 2023) {
      tags.push('ใหม่', 'เพลงใหม่')
    }

    // Explicit tag
    if (!track.explicit) {
      tags.push('เหมาะสำหรับทุกวัย')
    }

    return tags
  }
}
