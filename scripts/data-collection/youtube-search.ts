import axios from 'axios'
import type { Song, YouTubeSearchResult, YouTubeVideoDetails } from './types'
import { config } from './config'
import { sleep, log, loadCache, saveCache } from './utils'

export class YouTubeSearcher {
  private cacheFile = 'youtube-cache.json'
  private apiCallsToday = 0
  private maxCalls: number

  constructor(private apiKey: string) {
    this.maxCalls = config.youtube.quotaLimit
  }

  /**
   * Find YouTube video for a song
   */
  async findSong(title: string, artist: string): Promise<string | null> {
    const cacheKey = `${title}::${artist}`
    const cached = loadCache<string>(this.cacheFile, cacheKey)

    if (cached) {
      log(`✓ YouTube link cached: ${title}`)
      return cached
    }

    // Check quota
    if (this.apiCallsToday >= this.maxCalls) {
      log(`⚠ YouTube API quota limit reached (${this.maxCalls}/day)`)
      return null
    }

    // Try different search queries
    const queries = [
      `${title} ${artist} official`,
      `${title} ${artist} official video`,
      `${title} ${artist} karaoke`,
      `${title} ${artist}`,
    ]

    for (const query of queries) {
      const videoId = await this.search(query)
      if (videoId) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

        // Validate video
        const isValid = await this.validateVideo(videoId)
        if (isValid) {
          log(`✓ Found YouTube: ${title} - ${videoUrl}`)

          // Cache result
          saveCache(this.cacheFile, cacheKey, videoUrl)

          return videoUrl
        }
      }

      // Rate limiting
      await sleep(config.collection.rateLimits.youtube)
    }

    log(`✗ No YouTube video found for: ${title} - ${artist}`)
    return null
  }

  /**
   * Search YouTube for a query
   */
  private async search(query: string): Promise<string | null> {
    try {
      log(`Searching YouTube: "${query}"`)

      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 1,
            key: this.apiKey,
            videoCategoryId: '10', // Music category
          },
        }
      )

      this.apiCallsToday++

      if (response.data.items && response.data.items.length > 0) {
        const item: YouTubeSearchResult = response.data.items[0]
        return item.videoId || item.id?.videoId || null
      }

      return null
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        if (status === 403) {
          log('✗ YouTube API quota exceeded')
        } else {
          log(`✗ YouTube API error: ${status} ${error.message}`)
        }
      }
      return null
    }
  }

  /**
   * Validate that video is available and embeddable
   */
  private async validateVideo(videoId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            part: 'status,snippet',
            id: videoId,
            key: this.apiKey,
          },
        }
      )

      this.apiCallsToday++

      if (response.data.items && response.data.items.length > 0) {
        const video: YouTubeVideoDetails = response.data.items[0]

        // Check if video is private or unlisted
        if (video.status?.privacyStatus === 'private') {
          log(`⚠ Video ${videoId} is private`)
          return false
        }

        // Check if video is embeddable (nice to have)
        if (video.status?.embeddable === false) {
          log(`⚠ Video ${videoId} is not embeddable`)
          // Still return true, as we just want the link
        }

        return true
      }

      return false
    } catch (error) {
      log(`✗ Error validating video ${videoId}`)
      return false
    }
  }

  /**
   * Process multiple songs to find YouTube links
   */
  async processSongs(songs: Song[]): Promise<Song[]> {
    log(`\nProcessing ${songs.length} songs for YouTube links...`)

    const results: Song[] = []
    let found = 0
    let cached = 0
    let notFound = 0

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i]

      // Skip if already has YouTube URL
      if (song.youtubeUrl) {
        results.push(song)
        continue
      }

      log(`[${i + 1}/${songs.length}] ${song.title} - ${song.artist}`)

      const youtubeUrl = await this.findSong(song.title, song.artist)

      if (youtubeUrl) {
        if (loadCache(this.cacheFile, `${song.title}::${song.artist}`)) {
          cached++
        } else {
          found++
        }

        results.push({
          ...song,
          youtubeUrl,
        })
      } else {
        notFound++
        results.push(song)
      }

      // Check quota
      if (this.apiCallsToday >= this.maxCalls) {
        log(`\n⚠ Stopping: YouTube API quota limit reached`)
        log(`Processed: ${i + 1}/${songs.length}`)
        // Add remaining songs without YouTube URLs
        results.push(...songs.slice(i + 1))
        break
      }
    }

    log(`\n✓ YouTube processing complete:`)
    log(`  Found: ${found}`)
    log(`  Cached: ${cached}`)
    log(`  Not found: ${notFound}`)
    log(`  API calls: ${this.apiCallsToday}/${this.maxCalls}`)

    return results
  }

  /**
   * Extract video ID from YouTube URL
   */
  static extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match?.[1]) {
        return match[1]
      }
    }

    return null
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const run = async () => {
    const args = process.argv.slice(2)
    const inputFile = args.find((a) => a.startsWith('--input='))?.split('=')[1]
    const outputFile =
      args.find((a) => a.startsWith('--output='))?.split('=')[1] ||
      'data/with-youtube.json'

    if (!inputFile) {
      console.error('Usage: npm run youtube:search -- --input=<file> [--output=<file>]')
      process.exit(1)
    }

    const fs = await import('fs/promises')
    const songs: Song[] = JSON.parse(await fs.readFile(inputFile, 'utf-8'))

    const searcher = new YouTubeSearcher(config.youtube.apiKey)
    const results = await searcher.processSongs(songs)

    await fs.writeFile(outputFile, JSON.stringify(results, null, 2))
    log(`\n✓ Saved to: ${outputFile}`)
  }

  run().catch(console.error)
}
