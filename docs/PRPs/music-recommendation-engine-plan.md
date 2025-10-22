# Technical Plan: Music Recommendation Engine

## Document Information
- **Specification**: [music-recommendation-engine.md](../../openspec/changes/music-recommendation-engine.md)
- **Created**: 2025-10-21
- **Status**: Ready for Implementation
- **Version**: 1.0

---

## Architecture Overview

The Music Recommendation Engine is a serverless API service that translates mood input into personalized music recommendations using Deezer and Last.fm APIs, with optional personalization from user data in Supabase.

```
Client Request (mood params)
    ↓
Next.js API Route: /api/recommend
    ↓
RecommendationService
    ├─> DeezerService (search)
    ├─> LastfmService (enrich tags)
    └─> PersonalizationService (user prefs)
    ↓
Scoring & Ranking Algorithm
    ↓
Return Top 20 Tracks
```

---

## API Routes

### POST /api/recommend

**Location**: `app/api/recommend/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { RecommendationService } from '@/lib/services/recommendation-service'
import { z } from 'zod'

const requestSchema = z.object({
  mood: z.string(),
  energyLevel: z.number().min(1).max(10),
  moodValence: z.number().min(1).max(10),
  userId: z.string().optional(),
  limit: z.number().default(20),
  excludeIds: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = requestSchema.parse(body)

    const recommendationService = new RecommendationService()
    const recommendations = await recommendationService.generate(validated)

    return NextResponse.json({
      success: true,
      data: recommendations,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Recommendation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// Rate limiting middleware (using Vercel rate limit or upstash)
export const config = {
  runtime: 'edge', // Use edge for faster response
}
```

---

### GET /api/recommend/similar/[id]

**Location**: `app/api/recommend/similar/[id]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trackId = params.id
  const { searchParams } = new URL(request.url)
  const mood = searchParams.get('mood')

  const service = new RecommendationService()
  const similar = await service.getSimilarTracks(trackId, mood)

  return NextResponse.json({ success: true, data: similar })
}
```

---

## Services

### RecommendationService

**Location**: `lib/services/recommendation-service.ts`

```typescript
import { DeezerService } from './deezer-service'
import { LastfmService } from './lastfm-service'
import { PersonalizationService } from './personalization-service'
import { MOOD_MAP } from '@/lib/constants/mood-map'
import type { DeezerTrack, EnrichedTrack, RecommendationRequest } from '@/types'

export class RecommendationService {
  private deezer: DeezerService
  private lastfm: LastfmService
  private personalization: PersonalizationService

  constructor() {
    this.deezer = new DeezerService()
    this.lastfm = new LastfmService()
    this.personalization = new PersonalizationService()
  }

  async generate(request: RecommendationRequest): Promise<EnrichedTrack[]> {
    // 1. Map mood to search parameters
    const searchParams = this.mapMoodToParams(request)

    // 2. Search Deezer API (parallel queries for better coverage)
    const deezerResults = await this.searchDeezer(searchParams)

    // 3. Enrich with Last.fm tags (batch processing)
    const enrichedTracks = await this.enrichWithLastfm(deezerResults)

    // 4. Filter tracks
    const filtered = this.filterTracks(enrichedTracks, request)

    // 5. Personalize if user is logged in
    let personalized = filtered
    if (request.userId) {
      personalized = await this.personalization.apply(
        filtered,
        request.userId,
        request.mood
      )
    }

    // 6. Score and rank
    const scored = this.scoreAndRank(personalized, request)

    // 7. Ensure diversity
    const diverse = this.ensureDiversity(scored)

    // 8. Return top N
    return diverse.slice(0, request.limit)
  }

  private mapMoodToParams(request: RecommendationRequest) {
    const config = MOOD_MAP[request.mood]
    if (!config) throw new Error('Invalid mood')

    return {
      keywords: config.keywords,
      genres: config.genres,
      lastfmTags: config.lastfmTags,
      energyRange: config.energyRange,
      valenceRange: config.valenceRange,
      userEnergy: request.energyLevel,
      userValence: request.moodValence
    }
  }

  private async searchDeezer(params: SearchParams): Promise<DeezerTrack[]> {
    // Parallel searches for better coverage
    const searches = await Promise.all([
      // Search by mood keywords
      this.deezer.search(params.keywords.join(' OR '), 30),

      // Search by genre
      ...params.genres.map(genre =>
        this.deezer.searchByGenre(genre, 10)
      )
    ])

    // Flatten and deduplicate
    const allTracks = searches.flat()
    const unique = this.deduplicateTracks(allTracks)

    return unique.slice(0, 50) // Top 50 for enrichment
  }

  private async enrichWithLastfm(
    tracks: DeezerTrack[]
  ): Promise<EnrichedTrack[]> {
    // Batch process with concurrency limit
    const batchSize = 5
    const enriched: EnrichedTrack[] = []

    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize)

      const batchResults = await Promise.allSettled(
        batch.map(async (track) => {
          try {
            const tags = await this.lastfm.getTrackTags(
              track.artist.name,
              track.title
            )
            return { ...track, lastfmTags: tags, score: 0 }
          } catch {
            // If Last.fm fails, continue without tags
            return { ...track, lastfmTags: [], score: 0 }
          }
        })
      )

      enriched.push(
        ...batchResults
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value)
      )
    }

    return enriched
  }

  private filterTracks(
    tracks: EnrichedTrack[],
    request: RecommendationRequest
  ): EnrichedTrack[] {
    return tracks.filter((track) => {
      // Exclude explicit content if needed
      if (request.explicitFilter && track.explicit_lyrics) {
        return false
      }

      // Exclude recently played tracks
      if (request.excludeIds?.includes(track.id)) {
        return false
      }

      // Must have preview URL
      if (!track.preview) {
        return false
      }

      return true
    })
  }

  private scoreAndRank(
    tracks: EnrichedTrack[],
    request: RecommendationRequest
  ): EnrichedTrack[] {
    const config = MOOD_MAP[request.mood]

    return tracks
      .map((track) => {
        let score = 0

        // Base score from Deezer popularity (0-1)
        score += track.rank / 1000000

        // Mood tag matching (0-5)
        const matchingTags = track.lastfmTags.filter((tag) =>
          config.lastfmTags.includes(tag.toLowerCase())
        )
        score += matchingTags.length * 0.5

        // Energy/valence alignment (0-2)
        // (This would use audio features if available, for now use tags as proxy)
        const hasHighEnergyTags = track.lastfmTags.some((tag) =>
          ['energetic', 'upbeat', 'intense', 'hype'].includes(tag.toLowerCase())
        )
        if (request.energyLevel > 7 && hasHighEnergyTags) score += 1

        // Recency boost (0-0.5)
        const releaseDate = new Date(track.album?.release_date || '')
        const daysSinceRelease = this.daysSince(releaseDate)
        if (daysSinceRelease < 90) score += 0.5

        return { ...track, score }
      })
      .sort((a, b) => b.score - a.score)
  }

  private ensureDiversity(tracks: EnrichedTrack[]): EnrichedTrack[] {
    const result: EnrichedTrack[] = []
    const artistCount: Record<string, number> = {}

    for (const track of tracks) {
      const artistId = track.artist.id
      const count = artistCount[artistId] || 0

      // Max 3 tracks per artist
      if (count < 3) {
        result.push(track)
        artistCount[artistId] = count + 1
      }
    }

    return result
  }

  private deduplicateTracks(tracks: DeezerTrack[]): DeezerTrack[] {
    const seen = new Set<string>()
    return tracks.filter((track) => {
      if (seen.has(track.id)) return false
      seen.add(track.id)
      return true
    })
  }

  private daysSince(date: Date): number {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  async getSimilarTracks(
    trackId: string,
    mood?: string
  ): Promise<EnrichedTrack[]> {
    // Get track details from Deezer
    const track = await this.deezer.getTrack(trackId)

    // Get similar tracks from Last.fm
    const similar = await this.lastfm.getSimilarTracks(
      track.artist.name,
      track.title,
      30
    )

    // Find on Deezer and enrich
    const deezerTracks = await Promise.all(
      similar.map((s) => this.deezer.search(`${s.artist} ${s.name}`, 1))
    )

    const enriched = await this.enrichWithLastfm(
      deezerTracks.flat().slice(0, 15)
    )

    return enriched
  }
}
```

---

### DeezerService

**Location**: `lib/services/deezer-service.ts`

```typescript
export class DeezerService {
  private baseUrl = 'https://api.deezer.com'

  async search(query: string, limit: number = 20): Promise<DeezerTrack[]> {
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Deezer API error')

    const data = await response.json()
    return data.data || []
  }

  async getTrack(trackId: string): Promise<DeezerTrack> {
    const url = `${this.baseUrl}/track/${trackId}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Track not found')

    return response.json()
  }

  async searchByGenre(genre: string, limit: number = 10): Promise<DeezerTrack[]> {
    // Deezer genre search (simplified)
    return this.search(`genre:"${genre}"`, limit)
  }

  async getGenres(): Promise<DeezerGenre[]> {
    const url = `${this.baseUrl}/genre`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch genres')

    const data = await response.json()
    return data.data || []
  }
}
```

---

### LastfmService

**Location**: `lib/services/lastfm-service.ts`

```typescript
export class LastfmService {
  private apiKey = process.env.LASTFM_API_KEY!
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  async getTrackTags(artist: string, track: string): Promise<string[]> {
    const params = new URLSearchParams({
      method: 'track.getInfo',
      api_key: this.apiKey,
      artist,
      track,
      format: 'json'
    })

    try {
      const response = await fetch(`${this.baseUrl}?${params}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (!response.ok) return []

      const data = await response.json()
      const tags = data.track?.toptags?.tag || []

      return tags.map((t: any) => t.name.toLowerCase()).slice(0, 10)
    } catch {
      return []
    }
  }

  async getSimilarTracks(
    artist: string,
    track: string,
    limit: number = 30
  ): Promise<Array<{ name: string; artist: string; match: number }>> {
    const params = new URLSearchParams({
      method: 'track.getSimilar',
      api_key: this.apiKey,
      artist,
      track,
      limit: limit.toString(),
      format: 'json'
    })

    try {
      const response = await fetch(`${this.baseUrl}?${params}`)
      if (!response.ok) return []

      const data = await response.json()
      const similar = data.similartracks?.track || []

      return similar.map((t: any) => ({
        name: t.name,
        artist: t.artist.name,
        match: parseFloat(t.match)
      }))
    } catch {
      return []
    }
  }

  async getTopTracksByTag(tag: string, limit: number = 20): Promise<any[]> {
    const params = new URLSearchParams({
      method: 'tag.getTopTracks',
      api_key: this.apiKey,
      tag,
      limit: limit.toString(),
      format: 'json'
    })

    const response = await fetch(`${this.baseUrl}?${params}`)
    if (!response.ok) return []

    const data = await response.json()
    return data.tracks?.track || []
  }
}
```

---

### PersonalizationService

**Location**: `lib/services/personalization-service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { EnrichedTrack } from '@/types'

export class PersonalizationService {
  async apply(
    tracks: EnrichedTrack[],
    userId: string,
    mood: string
  ): Promise<EnrichedTrack[]> {
    // Get user preferences
    const prefs = await this.getUserPreferences(userId)
    if (!prefs) return tracks

    return tracks.map((track) => {
      let personalizedScore = track.score

      // Boost favorite genres (+2)
      if (prefs.favorite_genres?.includes(track.genre)) {
        personalizedScore += 2
      }

      // Boost favorite artists (+1.5)
      if (prefs.favorite_artists?.includes(track.artist.id)) {
        personalizedScore += 1.5
      }

      // Boost previously listened artists (+0.5)
      if (prefs.listened_artists?.includes(track.artist.id)) {
        personalizedScore += 0.5
      }

      // Mood-specific preferences
      const moodPrefs = prefs.mood_preferences?.[mood]
      if (moodPrefs) {
        if (moodPrefs.genres?.includes(track.genre)) {
          personalizedScore += 1
        }
      }

      return { ...track, score: personalizedScore }
    })
  }

  private async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  async updateFromListeningHistory(userId: string): Promise<void> {
    // Update favorite genres/artists based on listening history
    // This runs as a background job or periodically

    const { data: history } = await supabase
      .from('listening_history')
      .select('artist_id, genre, track_id')
      .eq('user_id', userId)
      .gte('played_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (!history) return

    // Count frequency
    const genreCounts: Record<string, number> = {}
    const artistCounts: Record<string, number> = {}

    history.forEach((item) => {
      if (item.genre) {
        genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1
      }
      if (item.artist_id) {
        artistCounts[item.artist_id] = (artistCounts[item.artist_id] || 0) + 1
      }
    })

    // Top 5 genres and artists
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre)

    const topArtists = Object.entries(artistCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([artist]) => artist)

    // Update preferences
    await supabase
      .from('user_preferences')
      .update({
        favorite_genres: topGenres,
        favorite_artists: topArtists,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
  }
}
```

---

## Caching Strategy

### Cache Keys

```typescript
// lib/cache.ts
export function getCacheKey(
  mood: string,
  energy: number,
  valence: number
): string {
  return `rec:${mood}:${energy}:${valence}`
}

// Generic recommendations cache (5 minutes)
// Personalized recommendations not cached
```

### Using Vercel KV (Redis)

```typescript
import { kv } from '@vercel/kv'

async function getCachedRecommendations(cacheKey: string) {
  return await kv.get(cacheKey)
}

async function cacheRecommendations(
  cacheKey: string,
  recommendations: any[]
) {
  await kv.set(cacheKey, recommendations, { ex: 300 }) // 5 minutes
}
```

---

## Implementation Strategy

### Phase 1: Core API (Week 2, Days 1-2)
1. Create API routes
2. Implement DeezerService
3. Basic mood mapping
4. Return raw Deezer results

### Phase 2: Enrichment (Week 2, Days 3-4)
1. Implement LastfmService
2. Tag enrichment pipeline
3. Scoring algorithm
4. Diversity logic

### Phase 3: Personalization (Week 2, Day 5)
1. PersonalizationService
2. User preferences queries
3. Score adjustment

### Phase 4: Optimization (Week 3, Days 1-2)
1. Caching layer
2. Error handling
3. Rate limiting
4. Performance tuning

---

## Testing Strategy

### Unit Tests

```typescript
describe('RecommendationService', () => {
  it('maps mood to search parameters', () => {
    const service = new RecommendationService()
    const params = service['mapMoodToParams']({
      mood: '😊',
      energyLevel: 7,
      moodValence: 8
    })

    expect(params.keywords).toContain('happy')
    expect(params.genres).toContain('pop')
  })

  it('scores tracks correctly', () => {
    const track = {
      rank: 500000,
      lastfmTags: ['happy', 'upbeat'],
      score: 0
    }

    const scored = service['scoreTrack'](track, { mood: '😊' })
    expect(scored.score).toBeGreaterThan(0)
  })
})
```

### Integration Tests

```typescript
describe('POST /api/recommend', () => {
  it('returns recommendations for valid mood', async () => {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        mood: '😊',
        energyLevel: 7,
        moodValence: 8
      })
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(20)
  })
})
```

---

## Performance Targets

- **API Response Time**: < 2s (p95)
- **Deezer API**: < 800ms
- **Last.fm API**: < 500ms per request
- **Database Query**: < 200ms
- **Cache Hit Rate**: > 40% (for generic moods)

---

## Success Criteria

- [ ] Returns 20 relevant tracks
- [ ] < 2s response time (p95)
- [ ] Graceful degradation on API failures
- [ ] Personalization improves relevance (+20% satisfaction)
- [ ] All tests passing
- [ ] 99% uptime

---

**Status**: Ready for Implementation
**Estimated Effort**: 4-5 days
**Last Updated**: 2025-10-21
