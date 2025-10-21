# Technology Stack - Vibe-Song

## Document Information
- **Created**: 2025-10-21
- **Status**: Approved
- **Version**: 1.0

---

## Overview

Vibe-Song uses a modern, full-stack JavaScript/TypeScript architecture optimized for rapid development, cost-effectiveness (100% free tier), and scalability.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           User Browser                      │
│  (Desktop, Mobile, Tablet)                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│   Next.js Application (Vercel)              │
│   ┌─────────────────────────────────────┐   │
│   │  Frontend (App Router)              │   │
│   │  - React Components                 │   │
│   │  - Tailwind CSS                     │   │
│   │  - shadcn/ui                        │   │
│   │  - Zustand (State)                  │   │
│   └─────────────────────────────────────┘   │
│   ┌─────────────────────────────────────┐   │
│   │  API Routes (Serverless)            │   │
│   │  - /api/music/*                     │   │
│   │  - /api/preferences/*               │   │
│   │  - /api/recommendations/*           │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         ↓              ↓              ↓
    ┌────────┐    ┌──────────┐   ┌──────────────┐
    │ Deezer │    │ Last.fm  │   │  Supabase    │
    │  API   │    │   API    │   │  ─────────   │
    │        │    │          │   │  - PostgreSQL│
    │ (Free) │    │  (Free)  │   │  - Auth      │
    │        │    │          │   │  - Storage   │
    │        │    │          │   │  - Real-time │
    └────────┘    └──────────┘   └──────────────┘
```

---

## Frontend Stack

### Next.js 14+ (App Router)

**Why Next.js?**
- ✅ **Full-stack Framework**: Frontend + API Routes in one
- ✅ **Server Components**: Better performance, less JavaScript
- ✅ **SEO Optimized**: SSR/SSG for search engines
- ✅ **Fast Refresh**: Instant feedback during development
- ✅ **TypeScript**: Built-in type safety
- ✅ **Image Optimization**: Automatic image optimization
- ✅ **API Routes**: Built-in serverless functions

**Version**: 14.x or later (App Router)

**Key Features We'll Use**:
- App Router (file-based routing)
- Server Components & Client Components
- API Routes
- Server Actions
- Middleware
- Image component

---

### React 18+

**Why React?**
- ✅ **Component-based**: Reusable UI components
- ✅ **Large Ecosystem**: Tons of libraries
- ✅ **Modern Features**: Hooks, Suspense, Concurrent rendering
- ✅ **Next.js Foundation**: Built on React

**Version**: 18.x (included with Next.js)

---

### Tailwind CSS

**Why Tailwind?**
- ✅ **Utility-first**: Fast development
- ✅ **Responsive**: Mobile-first by default
- ✅ **Customizable**: Easy theming
- ✅ **Small Bundle**: Purges unused CSS
- ✅ **Dark Mode**: Built-in dark mode support

**Version**: 3.x

**Configuration**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        vibe: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          // ... mood colors
        }
      }
    }
  }
}
```

---

### shadcn/ui

**Why shadcn/ui?**
- ✅ **Beautiful Components**: Professional UI
- ✅ **Accessible**: ARIA compliant
- ✅ **Customizable**: Copy-paste, modify as needed
- ✅ **Tailwind-based**: Consistent with our styling
- ✅ **TypeScript**: Full type safety

**Components We'll Use**:
- Button
- Card
- Slider
- Dialog
- Select
- Tabs
- Avatar
- Toast

**Installation**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card slider
```

---

### State Management

#### Zustand (Client State)

**Why Zustand?**
- ✅ **Simple**: Minimal boilerplate
- ✅ **TypeScript**: Excellent TS support
- ✅ **Small**: ~1KB
- ✅ **No Context**: Direct store access

**Use Cases**:
- Current mood selection
- UI state (modal open/close)
- Player state (playing/paused)

**Example Store**:
```typescript
// stores/mood-store.ts
import { create } from 'zustand'

interface MoodState {
  selectedMood: string
  energyLevel: number
  moodValence: number
  setMood: (mood: string) => void
}

export const useMoodStore = create<MoodState>((set) => ({
  selectedMood: '',
  energyLevel: 5,
  moodValence: 5,
  setMood: (mood) => set({ selectedMood: mood })
}))
```

---

#### TanStack Query (Server State)

**Why TanStack Query?**
- ✅ **Caching**: Automatic caching of API responses
- ✅ **Refetching**: Smart refetch strategies
- ✅ **Loading States**: Built-in loading/error states
- ✅ **TypeScript**: Full type safety

**Use Cases**:
- Fetching recommendations
- User preferences
- Listening history

**Example**:
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['recommendations', mood],
  queryFn: () => fetchRecommendations(mood)
})
```

---

## Backend Stack

### Next.js API Routes

**Why Next.js API Routes?**
- ✅ **Serverless**: Auto-scaling
- ✅ **Same Repo**: No separate backend
- ✅ **TypeScript**: Shared types with frontend
- ✅ **Edge Runtime**: Fast responses

**API Structure**:
```
app/api/
├── music/
│   ├── search/route.ts
│   ├── track/[id]/route.ts
│   └── recommend/route.ts
├── preferences/
│   ├── route.ts
│   └── [id]/route.ts
└── history/
    └── route.ts
```

**Example API Route**:
```typescript
// app/api/music/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  const results = await searchDeezer(query)
  return Response.json(results)
}
```

---

### Node.js Runtime

**Version**: 18.x or later
**Environment**: Serverless (Vercel Edge Functions)

---

## Database & Backend Services

### Supabase

**Why Supabase?**
- ✅ **Free Tier**: 500MB database, 2GB bandwidth
- ✅ **PostgreSQL**: Powerful relational database
- ✅ **Built-in Auth**: No need to build authentication
- ✅ **Real-time**: WebSocket subscriptions
- ✅ **Auto APIs**: RESTful & GraphQL auto-generated
- ✅ **TypeScript**: Type-safe client
- ✅ **Row Level Security**: Database-level security

**Free Tier Limits**:
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- 2 GB file storage

**Services We'll Use**:

#### 1. PostgreSQL Database
- User preferences
- Listening history
- Mood sessions
- Cached recommendations

#### 2. Authentication
- Email/Password
- OAuth (Google, GitHub)
- Anonymous users
- Session management

#### 3. Storage (Optional)
- User avatars
- Playlist covers

#### 4. Real-time (Future)
- Live playlist updates
- Social features

**Client Setup**:
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## External APIs

### 1. Deezer API (Primary Music Source)

**Why Deezer?**
- ✅ **100% Free**: No API key required for most endpoints
- ✅ **Large Catalog**: 90+ million tracks
- ✅ **Preview Playback**: 30-second previews
- ✅ **Rich Metadata**: Artist, album, genre info
- ✅ **Search**: Powerful search capabilities
- ✅ **No Rate Limit Issues**: ~50 req/5sec

**Base URL**: `https://api.deezer.com`

**Key Endpoints**:
```
GET /search?q={query}              # Search tracks
GET /track/{id}                    # Get track details
GET /genre                         # List genres
GET /genre/{id}/artists            # Artists by genre
GET /artist/{id}/top               # Artist top tracks
```

**Example Response**:
```json
{
  "data": [{
    "id": "3135556",
    "title": "Harder Better Faster Stronger",
    "duration": "224",
    "artist": {
      "id": "27",
      "name": "Daft Punk"
    },
    "album": {
      "id": "302127",
      "title": "Discovery",
      "cover": "https://..."
    },
    "preview": "https://cdns-preview-7.dzcdn.net/..."
  }]
}
```

**Rate Limit**: ~50 requests per 5 seconds

---

### 2. Last.fm API (Mood Tags & Metadata)

**Why Last.fm?**
- ✅ **Free API Key**: Easy to get
- ✅ **Rich Tags**: Genre, mood, style tags
- ✅ **Similar Tracks**: Find similar songs
- ✅ **Metadata**: Comprehensive track info

**Base URL**: `https://ws.audioscrobbler.com/2.0/`

**Key Methods**:
```
track.search          # Search tracks
track.getInfo         # Track details with tags
track.getSimilar      # Similar tracks
tag.getTopTracks      # Top tracks by tag
```

**Example Request**:
```
GET https://ws.audioscrobbler.com/2.0/
  ?method=track.getInfo
  &api_key={key}
  &artist=Daft Punk
  &track=Get Lucky
  &format=json
```

**Tags for Mood Mapping**:
- happy, sad, chill, energetic
- upbeat, melancholic, relaxing
- party, focus, workout, sleep

**Rate Limit**: 5 requests/second

---

### 3. Jamendo API (Optional - Free Full-Length Music)

**Why Jamendo?**
- ✅ **Creative Commons**: Legal to use
- ✅ **Full Playback**: Complete tracks
- ✅ **Free**: No cost
- ✅ **Mood Tags**: Built-in mood classification

**Use Case**: Fallback for full-length playback

**Base URL**: `https://api.jamendo.com/v3.0/`

---

## Development Tools

### TypeScript

**Version**: 5.x
**Configuration**: Strict mode enabled

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

### Package Manager: pnpm

**Why pnpm?**
- ✅ **Fast**: Faster than npm/yarn
- ✅ **Efficient**: Saves disk space
- ✅ **Strict**: Better dependency management

---

### Code Quality

#### ESLint
- Next.js recommended config
- TypeScript support
- React hooks rules

#### Prettier
- Consistent code formatting
- Tailwind CSS plugin

---

## Hosting & Deployment

### Vercel (Frontend + API)

**Why Vercel?**
- ✅ **Built for Next.js**: Created by Next.js team
- ✅ **Automatic Deployments**: Git push = deploy
- ✅ **Edge Network**: Fast global CDN
- ✅ **Serverless Functions**: Auto-scaling APIs
- ✅ **Free Tier**: Generous limits
- ✅ **Analytics**: Built-in analytics

**Free Tier Limits**:
- 100GB bandwidth
- Unlimited serverless function executions
- Automatic HTTPS
- Custom domains

**Deployment**:
```bash
# Install Vercel CLI
pnpm install -g vercel

# Deploy
vercel
```

---

### Supabase Cloud (Database)

**Hosting**: Supabase managed hosting
**Region**: Select closest to target users
**Backups**: Automatic backups included

---

## Development Workflow

### Local Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run with Supabase local
supabase start
pnpm dev

# Build for production
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
```

---

### Environment Variables

**Required Variables**:
```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Last.fm
LASTFM_API_KEY=your-lastfm-key

# Optional: Jamendo
JAMENDO_CLIENT_ID=your-client-id
```

---

## Recommendation Engine

### Algorithm Overview

```
User Input (Mood + Energy + Valence)
    ↓
Mood Mapping (Emoji → Keywords + Attributes)
    ↓
Search Deezer (by keywords + genre)
    ↓
Enrich with Last.fm Tags
    ↓
Filter & Score
    ↓
Personalize (using Supabase history)
    ↓
Return Top N Recommendations
```

### Mood Mapping Table

```typescript
const MOOD_MAP = {
  '😊': {
    keywords: ['happy', 'upbeat', 'cheerful'],
    genres: ['pop', 'dance'],
    lastfmTags: ['happy', 'upbeat', 'feel-good'],
    energyRange: [6, 10],
    valenceRange: [7, 10]
  },
  '😢': {
    keywords: ['sad', 'emotional', 'melancholic'],
    genres: ['ballad', 'acoustic'],
    lastfmTags: ['sad', 'emotional', 'melancholy'],
    energyRange: [1, 4],
    valenceRange: [1, 4]
  },
  '😌': {
    keywords: ['calm', 'chill', 'relaxing'],
    genres: ['ambient', 'chillout'],
    lastfmTags: ['chill', 'relaxing', 'calm'],
    energyRange: [2, 5],
    valenceRange: [5, 8]
  },
  '🔥': {
    keywords: ['energetic', 'party', 'hype'],
    genres: ['edm', 'dance', 'electronic'],
    lastfmTags: ['energetic', 'party', 'dance'],
    energyRange: [8, 10],
    valenceRange: [6, 10]
  },
  '💭': {
    keywords: ['thoughtful', 'introspective', 'deep'],
    genres: ['indie', 'alternative'],
    lastfmTags: ['introspective', 'thoughtful', 'indie'],
    energyRange: [3, 6],
    valenceRange: [4, 7]
  }
}
```

### Scoring Algorithm

```typescript
function scoreTrack(track, userPrefs, moodContext) {
  let score = 0

  // Base score from Deezer popularity
  score += track.rank / 1000000

  // Boost if genre matches preferences
  if (userPrefs.favoriteGenres.includes(track.genre)) {
    score += 2
  }

  // Boost if artist is in listening history
  if (userPrefs.listenedArtists.includes(track.artist.id)) {
    score += 1.5
  }

  // Last.fm tag matching
  const matchingTags = track.tags.filter(tag =>
    moodContext.lastfmTags.includes(tag)
  )
  score += matchingTags.length * 0.5

  // Recency boost (if recently released)
  const daysSinceRelease = getDaysSince(track.releaseDate)
  if (daysSinceRelease < 90) {
    score += 0.5
  }

  return score
}
```

---

## Performance Targets

### Response Times
- Page Load (First Contentful Paint): < 1.5s
- API Response: < 500ms
- Music Search: < 1s
- Recommendation Generation: < 2s

### Optimization Strategies
- Next.js Image Optimization
- API Response Caching (Redis or Vercel KV)
- Supabase Query Optimization
- Edge Functions for critical APIs
- Lazy Loading Components
- Code Splitting

---

## Security

### Authentication
- Supabase Auth (secure by default)
- Row Level Security (RLS) policies
- JWT tokens
- HTTP-only cookies

### API Security
- Rate limiting (Vercel rate limit)
- Input validation
- CORS configuration
- Environment variable security

### Data Privacy
- User data encrypted at rest (Supabase)
- HTTPS everywhere (Vercel)
- GDPR compliance ready
- User data export/delete capabilities

---

## Testing Strategy

### Unit Tests
- **Framework**: Vitest
- **Coverage**: Components, utilities, API logic

### Integration Tests
- **Framework**: Playwright
- **Coverage**: API routes, user flows

### E2E Tests
- **Framework**: Playwright
- **Coverage**: Critical user journeys

---

## Monitoring & Analytics

### Vercel Analytics
- Page views
- Performance metrics
- Web Vitals

### Supabase Dashboard
- Database performance
- API usage
- Auth metrics

### Custom Analytics
- Recommendation acceptance rate
- User engagement metrics
- Mood distribution

---

## Cost Breakdown (Free Tier)

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** | 100GB bandwidth | $0 |
| **Supabase** | 500MB DB, 2GB bandwidth | $0 |
| **Deezer API** | Unlimited (no key) | $0 |
| **Last.fm API** | 5 req/sec | $0 |
| **Domain** | (Optional) | ~$10/year |
| **Total Monthly** | - | **$0** |

---

## Scalability Path

### When to Upgrade?

**Vercel Pro ($20/month)**:
- > 100GB bandwidth
- Need password protection
- Advanced analytics

**Supabase Pro ($25/month)**:
- > 500MB database
- > 2GB bandwidth
- Need more compute

**Redis Cache (Upstash)**:
- High API call volume
- Need faster responses

---

## Future Considerations

### Phase 2 Enhancements
- Redis/Upstash for caching
- Machine Learning for recommendations
- Real-time collaborative playlists
- Mobile apps (React Native)
- Spotify/Apple Music integration

### Phase 3 Scale
- Microservices architecture
- Dedicated recommendation service
- Analytics pipeline
- A/B testing framework

---

## Summary

This tech stack provides:
- ✅ **100% Free**: All services have sufficient free tiers
- ✅ **Modern**: Latest technologies and best practices
- ✅ **Fast**: Optimized for performance
- ✅ **Scalable**: Can grow with user base
- ✅ **Type-Safe**: TypeScript throughout
- ✅ **Developer-Friendly**: Great DX with hot reload, etc.
- ✅ **Production-Ready**: Battle-tested technologies

---

**Next Steps**:
1. Set up Next.js project
2. Configure Supabase
3. Implement music API integrations
4. Build MVP features

**Last Updated**: 2025-10-21
**Version**: 1.0
