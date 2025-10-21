# System Architecture - Vibe-Song

## Document Information
- **Created**: 2025-10-21
- **Status**: Initial Design
- **Version**: 1.0

---

## Overview

Vibe-Song is a serverless, full-stack web application that provides mood-based music recommendations using modern web technologies and free-tier services.

---

## High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     User Devices                           │
│         (Desktop, Tablet, Mobile Browsers)                 │
└────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                      │
│                      (Global CDN)                          │
└────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────────┐
│              Next.js Application (Vercel)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Frontend (React)                       │  │
│  │  - Server Components (SSR)                           │  │
│  │  - Client Components (Interactive UI)               │  │
│  │  - Tailwind CSS + shadcn/ui                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         API Routes (Serverless Functions)            │  │
│  │  - /api/music/*      - Music search & playback       │  │
│  │  - /api/recommend/*  - Recommendation engine         │  │
│  │  - /api/preferences/* - User preferences             │  │
│  │  - /api/history/*    - Listening history             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
            │                  │                  │
            ↓                  ↓                  ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Deezer API  │  │ Last.fm API  │  │  Supabase    │
    │              │  │              │  │              │
    │ - Search     │  │ - Tags       │  │ - PostgreSQL │
    │ - Tracks     │  │ - Similar    │  │ - Auth       │
    │ - Preview    │  │ - Metadata   │  │ - Storage    │
    │              │  │              │  │ - Real-time  │
    │  (Free)      │  │  (Free)      │  │  (Free Tier) │
    └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Architecture

### Frontend Layer

#### 1. Pages/Routes (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx          # Login page
│   └── signup/page.tsx         # Signup page
├── (main)/
│   ├── page.tsx                # Home/Landing page
│   ├── discover/page.tsx       # Mood input & recommendations
│   ├── library/page.tsx        # User's saved tracks/playlists
│   └── profile/page.tsx        # User profile & settings
├── layout.tsx                  # Root layout
└── error.tsx                   # Error handling
```

**Routing Strategy**:
- SSR for SEO-important pages (landing, public profiles)
- Client-side navigation for authenticated pages
- Loading states with Suspense
- Error boundaries for graceful failures

---

#### 2. Components Structure

```
components/
├── ui/                         # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── slider.tsx
│   └── ...
├── layout/
│   ├── header.tsx             # App header with navigation
│   ├── footer.tsx             # App footer
│   └── sidebar.tsx            # Mobile sidebar
├── mood/
│   ├── mood-selector.tsx      # Emoji mood selector
│   ├── mood-sliders.tsx       # Energy/valence sliders
│   └── mood-indicator.tsx     # Current mood display
├── music/
│   ├── track-card.tsx         # Individual track display
│   ├── track-list.tsx         # List of tracks
│   ├── player.tsx             # Audio player component
│   └── player-controls.tsx    # Playback controls
├── recommendations/
│   ├── recommendation-grid.tsx
│   ├── recommendation-filters.tsx
│   └── recommendation-loading.tsx
└── shared/
    ├── loading-spinner.tsx
    ├── error-message.tsx
    └── empty-state.tsx
```

---

#### 3. State Management

**Client State (Zustand)**:
```typescript
stores/
├── mood-store.ts              # Current mood selection
├── player-store.ts            # Audio player state
├── ui-store.ts                # UI state (modals, sidebar)
└── auth-store.ts              # Auth UI state
```

**Server State (TanStack Query)**:
```typescript
hooks/
├── use-recommendations.ts     # Fetch recommendations
├── use-track-search.ts        # Search tracks
├── use-user-preferences.ts    # User preferences
├── use-listening-history.ts   # Listening history
└── use-auth.ts                # Authentication
```

---

### API Layer (Next.js API Routes)

#### API Structure

```
app/api/
├── music/
│   ├── search/route.ts        # POST - Search tracks
│   ├── track/[id]/route.ts    # GET - Track details
│   └── preview/[id]/route.ts  # GET - Track preview URL
├── recommend/
│   ├── route.ts               # POST - Generate recommendations
│   └── similar/[id]/route.ts  # GET - Similar tracks
├── preferences/
│   ├── route.ts               # GET/POST - User preferences
│   └── genres/route.ts        # GET/PUT - Favorite genres
├── history/
│   ├── route.ts               # GET/POST - Listening history
│   └── recent/route.ts        # GET - Recent tracks
└── auth/
    ├── callback/route.ts      # OAuth callback
    └── session/route.ts       # Session management
```

---

#### API Implementation Example

```typescript
// app/api/music/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchDeezer } from '@/lib/deezer'
import { enrichWithLastfm } from '@/lib/lastfm'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20 } = await request.json()

    // Search Deezer
    const deezerResults = await searchDeezer(query, limit)

    // Enrich with Last.fm tags
    const enrichedResults = await enrichWithLastfm(deezerResults)

    return NextResponse.json({
      success: true,
      data: enrichedResults
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    )
  }
}
```

---

### Backend Services Layer

#### 1. Music Service (Deezer Integration)

```typescript
// lib/services/deezer.ts

export class DeezerService {
  private baseUrl = 'https://api.deezer.com'

  async searchTracks(query: string, limit: number = 20) {
    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    )
    return response.json()
  }

  async getTrack(trackId: string) {
    const response = await fetch(`${this.baseUrl}/track/${trackId}`)
    return response.json()
  }

  async getGenres() {
    const response = await fetch(`${this.baseUrl}/genre`)
    return response.json()
  }

  async searchByGenre(genreId: number, limit: number = 20) {
    const response = await fetch(
      `${this.baseUrl}/genre/${genreId}/artists?limit=${limit}`
    )
    return response.json()
  }
}
```

---

#### 2. Metadata Service (Last.fm Integration)

```typescript
// lib/services/lastfm.ts

export class LastfmService {
  private apiKey = process.env.LASTFM_API_KEY
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  async getTrackTags(artist: string, track: string) {
    const params = new URLSearchParams({
      method: 'track.getInfo',
      api_key: this.apiKey!,
      artist,
      track,
      format: 'json'
    })

    const response = await fetch(`${this.baseUrl}?${params}`)
    const data = await response.json()
    return data.track?.toptags?.tag || []
  }

  async getSimilarTracks(artist: string, track: string, limit: number = 10) {
    const params = new URLSearchParams({
      method: 'track.getSimilar',
      api_key: this.apiKey!,
      artist,
      track,
      limit: limit.toString(),
      format: 'json'
    })

    const response = await fetch(`${this.baseUrl}?${params}`)
    return response.json()
  }

  async getTopTracksByTag(tag: string, limit: number = 20) {
    const params = new URLSearchParams({
      method: 'tag.getTopTracks',
      api_key: this.apiKey!,
      tag,
      limit: limit.toString(),
      format: 'json'
    })

    const response = await fetch(`${this.baseUrl}?${params}`)
    return response.json()
  }
}
```

---

#### 3. Recommendation Engine

```typescript
// lib/services/recommendation-engine.ts

export class RecommendationEngine {
  constructor(
    private deezer: DeezerService,
    private lastfm: LastfmService,
    private supabase: SupabaseClient
  ) {}

  async generateRecommendations(
    mood: MoodInput,
    userId?: string
  ): Promise<Track[]> {
    // 1. Map mood to search parameters
    const searchParams = this.mapMoodToParams(mood)

    // 2. Search Deezer
    const deezerResults = await this.deezer.searchTracks(
      searchParams.keywords.join(' '),
      50
    )

    // 3. Get Last.fm tags for filtering
    const tracksWithTags = await Promise.all(
      deezerResults.data.map(async (track) => ({
        ...track,
        tags: await this.lastfm.getTrackTags(
          track.artist.name,
          track.title
        )
      }))
    )

    // 4. Filter by mood tags
    const filtered = this.filterByMoodTags(
      tracksWithTags,
      searchParams.tags
    )

    // 5. Personalize if user logged in
    let personalized = filtered
    if (userId) {
      personalized = await this.personalize(filtered, userId)
    }

    // 6. Score and rank
    const scored = this.scoreAndRank(personalized, mood)

    // 7. Return top N
    return scored.slice(0, 20)
  }

  private mapMoodToParams(mood: MoodInput): SearchParams {
    // Implementation in data-models.md
  }

  private async personalize(tracks: Track[], userId: string): Promise<Track[]> {
    // Get user preferences from Supabase
    const { data: prefs } = await this.supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Boost tracks matching user preferences
    return tracks.map(track => ({
      ...track,
      score: this.calculatePersonalizedScore(track, prefs)
    }))
  }

  private scoreAndRank(tracks: Track[], mood: MoodInput): Track[] {
    return tracks
      .map(track => ({
        ...track,
        finalScore: this.calculateFinalScore(track, mood)
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
  }
}
```

---

### Data Layer (Supabase)

#### Database Service

```typescript
// lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side client with service role
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

---

## Data Flow

### 1. User Selects Mood

```
User clicks emoji (😊)
    ↓
Client updates Zustand store
    ↓
Component re-renders with selected mood
    ↓
User adjusts sliders (energy, valence)
    ↓
Store updated with full mood context
```

---

### 2. Generate Recommendations

```
User clicks "Find Music"
    ↓
TanStack Query triggers API call
    ↓
POST /api/recommend
    ↓
Recommendation Engine:
  1. Map mood → search params
  2. Search Deezer API
  3. Fetch Last.fm tags
  4. Filter by mood tags
  5. Personalize (if logged in)
  6. Score & rank
    ↓
Return top 20 recommendations
    ↓
TanStack Query caches result
    ↓
UI displays recommendation grid
```

---

### 3. User Plays Track

```
User clicks play on track
    ↓
Player store updated (track, playing state)
    ↓
Audio component loads preview URL
    ↓
Playback starts
    ↓
Save to listening history (Supabase):
  - track_id
  - mood context
  - timestamp
    ↓
Update user preferences:
  - increment genre count
  - update artist affinity
```

---

### 4. Authentication Flow

```
User clicks "Sign In"
    ↓
Redirect to /login
    ↓
User enters credentials or OAuth
    ↓
Supabase Auth handles authentication
    ↓
Callback to /auth/callback
    ↓
Set session cookie
    ↓
Redirect to /discover
    ↓
Migrate anonymous data (if exists):
  - listening history
  - preferences
```

---

## Caching Strategy

### 1. Browser Cache
- Static assets (images, CSS, JS): Cache-Control headers
- Next.js automatic static optimization

### 2. API Response Cache
- Deezer search results: 5 minutes (TanStack Query)
- Last.fm tags: 1 hour (TanStack Query)
- User preferences: 10 minutes (TanStack Query)
- Recommendations: 5 minutes per mood combination

### 3. Database Query Cache
- Supabase client-side cache
- Postgres query cache (server-side)

### 4. Future: Redis/Upstash
- Hot recommendations (popular moods)
- User session data
- Rate limiting counters

---

## Security Architecture

### 1. Authentication
- Supabase Auth (JWT tokens)
- HTTP-only cookies for session
- Secure flag on production
- CSRF protection

### 2. Authorization
- Row Level Security (RLS) in Postgres
```sql
-- Example RLS policy
CREATE POLICY "Users can only see own data"
ON user_preferences
FOR SELECT
USING (auth.uid() = user_id);
```

### 3. API Security
- Rate limiting (Vercel built-in)
- Input validation (Zod schemas)
- Output sanitization
- CORS configuration

### 4. Data Privacy
- Encryption at rest (Supabase default)
- HTTPS everywhere (Vercel)
- No sensitive data in localStorage
- Audit logging for data access

---

## Performance Optimizations

### 1. Frontend
- Server Components for static content
- Client Components only when needed
- Code splitting by route
- Image optimization (next/image)
- Lazy loading components
- Prefetching critical routes

### 2. API
- Edge functions for low latency
- Parallel API calls where possible
- Request deduplication
- Response compression

### 3. Database
- Indexed columns (user_id, track_id, created_at)
- Materialized views for analytics
- Connection pooling (Supabase default)
- Query optimization

### 4. External APIs
- Batch requests when possible
- Respect rate limits
- Retry logic with exponential backoff
- Circuit breaker pattern

---

## Monitoring & Observability

### 1. Vercel Analytics
- Page views
- User sessions
- Core Web Vitals
- API response times

### 2. Supabase Dashboard
- Database queries
- Auth events
- API usage
- Error logs

### 3. Custom Metrics (Future)
- Recommendation acceptance rate
- User engagement metrics
- Mood distribution
- Popular genres/artists

### 4. Error Tracking
- Next.js error boundaries
- API error logging
- Supabase error logs
- User-facing error messages

---

## Scalability Considerations

### Current Architecture (Free Tier)
- **Users**: Up to 50,000 MAU (Supabase limit)
- **Requests**: Unlimited serverless functions (Vercel)
- **Database**: 500MB storage (Supabase)
- **Bandwidth**: 100GB/month (Vercel)

### Scaling Strategy

**Phase 1**: Current free tier
- Monitor usage metrics
- Optimize queries
- Implement caching

**Phase 2**: Upgrade to paid tiers (~$50/month)
- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Redis (Upstash): ~$5/month

**Phase 3**: Optimize architecture
- Database read replicas
- CDN for static assets
- Dedicated recommendation service
- Background job processing

**Phase 4**: Microservices (if needed)
- Separate recommendation engine
- Dedicated auth service
- Analytics pipeline
- Message queue for async tasks

---

## Deployment Architecture

### Development Environment
```
Local Development
├── Next.js dev server (localhost:3000)
├── Supabase local (via CLI)
└── Mock APIs (optional)
```

### Staging Environment
```
Vercel Preview Deployments
├── Unique URL per PR
├── Supabase preview branch
└── Test data
```

### Production Environment
```
Vercel Production
├── Custom domain
├── Edge network (global)
├── Production Supabase
└── Production API keys
```

---

## Disaster Recovery

### Backup Strategy
- **Database**: Supabase daily backups (automatic)
- **Code**: Git repository (GitHub)
- **Configuration**: Environment variables (Vercel)

### Recovery Plan
1. Database restore from Supabase backup
2. Redeploy from Git (latest stable tag)
3. Restore environment variables
4. Verify functionality

### Monitoring
- Uptime monitoring (Vercel)
- Error rate monitoring
- Alert thresholds
- Incident response plan

---

## Future Enhancements

### Phase 2
- Real-time collaborative playlists
- Social features (share moods)
- Advanced ML recommendations
- Mobile apps (React Native)

### Phase 3
- Spotify/Apple Music integration
- Podcast recommendations
- Mood journaling
- Analytics dashboard

### Phase 4
- AI chat interface
- Voice mood input
- Wearable integration
- Mood prediction

---

## Summary

This architecture provides:
- ✅ **Serverless**: Auto-scaling, no server management
- ✅ **Cost-Effective**: 100% free tier for MVP
- ✅ **Fast**: Edge network, optimized APIs
- ✅ **Secure**: Built-in security best practices
- ✅ **Scalable**: Clear path to scale
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Modern**: Latest technologies and patterns

---

**Related Documents**:
- [Tech Stack](./tech-stack.md)
- [Data Models](./data-models.md)
- [Initial Vision](../PRPs/001-initial-vision.md)

**Last Updated**: 2025-10-21
**Version**: 1.0
