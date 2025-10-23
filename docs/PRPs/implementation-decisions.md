# Implementation Decisions

**Project**: Karaoke AI Chat Agent
**Date**: 2025-10-23
**Status**: Final - Ready for Implementation
**Version**: 1.0

---

## Purpose

This document records all critical implementation decisions made during the specification review phase. These decisions resolve technical uncertainties and provide clear direction for the development team.

---

## Decision Summary

| ID | Decision Area | Choice | Status |
|----|--------------|--------|--------|
| D1 | Data Source | Web scraping (100-200 songs) | ✅ Approved |
| D2 | Embedding Model | TypeScript/Node.js solution | ✅ Approved |
| D3 | Vector Store | Supabase pgvector | ✅ Approved |
| D4 | Anonymous Users | Session-only, no persistence | ✅ Approved |
| D5 | Social Sharing | Simple text share | ✅ Approved |
| D6 | Chat Streaming | Real-time responses | ✅ Approved |
| D7 | Lyrics Display | Snippet only (2-3 lines) | ✅ Approved |
| D8 | YouTube Validation | Validate on upload | ✅ Approved |
| D9 | AI Rate Limits | GLM 4.6 concurrency = 5 | ✅ Noted |

---

## D1: Data Source Strategy

### Question
How to acquire 10,000+ Thai songs with metadata and lyrics?

### Decision
**Web scraping legal sites for 100-200 songs as Phase 1 Mock Data**

### Rationale
- **Phase 1 MVP**: Start small with 100-200 high-quality songs
- **Legal compliance**: Only scrape publicly available data from legal sources
- **Quality over quantity**: Better to have 200 well-curated songs than 10,000 poor ones
- **Scalability**: Prove concept first, then scale to thousands

### Implementation Plan

**Phase 1 (Weeks 1-2): Mock Data - 100-200 Songs**
```typescript
// Data structure
interface SongData {
  id: string
  title: string
  artist: string
  genre: string
  year: number
  tempo: number
  language: 'Thai' | 'English' | 'Korean' | 'Japanese' | 'Chinese'
  dialect?: 'Isaan' | 'Southern' | 'Central'
  lyrics: string  // First 2-3 lines only
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
  youtubeUrl: string
}
```

**Sources (Suggested)**:
1. **Thai Songs** (60-80 songs):
   - Top charts from legal music sites
   - Popular karaoke songs (public lists)
   - Classic Thai songs (pre-1990s, public domain consideration)

2. **International Songs** (40-60 songs):
   - Top K-pop karaoke songs
   - Popular J-pop songs
   - Western classics

**Phase 2 (Week 3+): Scale to 1,000-3,000 Songs**
- API integration (Spotify, Deezer, MusicBrainz)
- Automated web scraping (with rate limiting)
- Data validation pipeline

**Phase 3 (Month 2+): Scale to 10,000+ Songs**
- Crowdsourcing platform
- Partnership with content providers
- User submissions with moderation

### Constraints
- ✅ Only public data
- ✅ Respect copyright (lyrics snippet only)
- ✅ Validate YouTube links
- ⚠️ Manual curation for Phase 1 (quality check)

---

## D2: Embedding Model Strategy

### Question
How to run sentence-transformers in Next.js/TypeScript environment?

### Decision
**Use TypeScript-compatible embedding solution: Transformers.js or API-based approach**

### Rationale
- **Spec used Python**: Original RAG spec showed Python `sentence-transformers`
- **Reality**: Next.js is TypeScript/Node.js, can't run Python directly
- **Need**: TypeScript-native solution

### Implementation Options

**Option A: Transformers.js (Recommended for MVP)** ✅
```typescript
import { pipeline, env } from '@xenova/transformers'

// Disable local model cache for serverless
env.cacheDir = '/tmp/transformers-cache'

class EmbeddingService {
  private embedder: any

  async initialize() {
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'  // Multilingual support
    )
  }

  async encode(text: string): Promise<number[]> {
    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true,
    })
    return Array.from(output.data)
  }

  async encodeBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.encode(text)))
  }
}
```

**Pros**:
- ✅ Pure TypeScript/JavaScript
- ✅ Runs in Node.js (Vercel serverless)
- ✅ No external API costs
- ✅ Multilingual support

**Cons**:
- ⚠️ Slower than native Python
- ⚠️ Larger bundle size (~50MB)
- ⚠️ Cold start time (~2-3 seconds first time)

**Option B: OpenAI Embeddings API** (Fallback)
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}
```

**Pros**:
- ✅ Fast and reliable
- ✅ High quality embeddings

**Cons**:
- ❌ Costs money ($0.02 per 1M tokens)
- ❌ Requires API key
- ❌ Network dependency

### Final Decision
**Use Transformers.js for Phase 1 MVP**, fallback to OpenAI if performance issues

### Migration Path
```typescript
// Abstraction layer for easy switching
interface EmbeddingProvider {
  encode(text: string): Promise<number[]>
  encodeBatch(texts: string[]): Promise<number[][]>
}

class TransformersJsProvider implements EmbeddingProvider {
  // Transformers.js implementation
}

class OpenAIProvider implements EmbeddingProvider {
  // OpenAI implementation
}

// Use environment variable to switch
const embedder: EmbeddingProvider =
  process.env.EMBEDDING_PROVIDER === 'openai'
    ? new OpenAIProvider()
    : new TransformersJsProvider()
```

---

## D3: Vector Store Solution

### Question
Chroma requires persistent storage, but Vercel serverless has ephemeral filesystem. What to use?

### Decision
**Use Supabase pgvector extension**

### Rationale
- ✅ **Already using Supabase**: No additional service needed
- ✅ **Persistent storage**: Data survives deployments
- ✅ **Free tier included**: Part of Supabase Free plan
- ✅ **SQL-based**: Familiar query language
- ✅ **Built-in filtering**: Easy to combine with metadata filters
- ✅ **Good performance**: HNSW and IVFFlat indexes

### Implementation

**Database Setup**:
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE song_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  embedding vector(384),  -- Dimension from all-MiniLM-L6-v2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast similarity search
CREATE INDEX ON song_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Alternative: HNSW index (better for small datasets)
CREATE INDEX ON song_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**TypeScript Service**:
```typescript
import { createServerClient } from '@/lib/supabase/server'

export class VectorSearchService {
  private supabase = createServerClient()

  async addSongEmbedding(songId: string, embedding: number[]) {
    const { error } = await this.supabase
      .from('song_embeddings')
      .insert({
        song_id: songId,
        embedding: `[${embedding.join(',)}]`,
      })

    if (error) throw error
  }

  async searchSimilar(
    queryEmbedding: number[],
    limit: number = 10,
    filters?: {
      genre?: string
      year?: { min?: number; max?: number }
    }
  ) {
    // Build SQL query with vector similarity + filters
    let query = this.supabase
      .rpc('search_songs', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_count: limit,
      })

    // Apply filters through joins with songs table
    if (filters?.genre) {
      query = query.eq('songs.genre', filters.genre)
    }

    const { data, error } = await query
    if (error) throw error

    return data
  }
}
```

**PostgreSQL Function**:
```sql
CREATE OR REPLACE FUNCTION search_songs(
  query_embedding vector(384),
  match_count int DEFAULT 10
)
RETURNS TABLE (
  song_id UUID,
  title TEXT,
  artist TEXT,
  genre TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.artist,
    s.genre,
    1 - (se.embedding <=> query_embedding) AS similarity
  FROM song_embeddings se
  JOIN songs s ON s.id = se.song_id
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Performance Considerations

**Index Types**:
1. **IVFFlat**: Good for larger datasets (10k+ vectors)
   - Faster inserts
   - Approximate search

2. **HNSW**: Better for smaller datasets (<10k vectors)
   - Slower inserts
   - More accurate search

**Recommendation**: Start with HNSW for Phase 1 (100-200 songs), migrate to IVFFlat at Phase 2 (3,000+ songs)

### Comparison with Chroma

| Feature | Supabase pgvector | Chroma |
|---------|------------------|--------|
| Persistence | ✅ Built-in | ⚠️ Needs external storage |
| Cost | ✅ Free (Supabase) | ⚠️ Chroma Cloud paid |
| Setup | ✅ Extension only | ⚠️ Separate service |
| Filtering | ✅ Native SQL | ⚠️ Limited |
| Performance | ✅ Good (with indexes) | ✅ Excellent |
| Ecosystem | ✅ PostgreSQL | ⚠️ Standalone |

**Winner**: Supabase pgvector ✅

---

## D4: Anonymous User Strategy

### Question
Should anonymous users have chat history? How to handle session vs persistence?

### Decision
**Anonymous: No history saved (session only) | Logged in: Full history + features**

### Rationale
- ✅ **Simpler implementation**: No localStorage complexity
- ✅ **Privacy-friendly**: Anonymous = truly anonymous
- ✅ **Clear value proposition**: Login to save history
- ✅ **Easier GDPR compliance**: No stored data = no issues
- ✅ **Encourages signup**: Users want to save → they signup

### Implementation

**Session Management**:
```typescript
// store/chat-store.ts
import { create } from 'zustand'

interface ChatState {
  isAnonymous: boolean
  sessionMessages: Message[]  // In-memory only
  persistedConversations: Conversation[]  // From Supabase

  // ... other state
}

export const useChatStore = create<ChatState>((set, get) => ({
  isAnonymous: true,  // Default
  sessionMessages: [],
  persistedConversations: [],

  // On user login
  handleLogin: async (userId: string) => {
    set({ isAnonymous: false })
    // Load persisted conversations
    await get().loadConversations()
  },

  // On user logout
  handleLogout: () => {
    set({
      isAnonymous: true,
      sessionMessages: [],  // Clear session
      persistedConversations: []
    })
  },
}))
```

**Message Persistence Logic**:
```typescript
async sendMessage(text: string) {
  const { isAnonymous, sessionMessages } = get()

  // Add to session (always)
  const userMessage = createMessage(text)
  set({ sessionMessages: [...sessionMessages, userMessage] })

  // Get AI response
  const aiResponse = await callAI(text)
  set({ sessionMessages: [...sessionMessages, userMessage, aiResponse] })

  // Save to database (only if logged in)
  if (!isAnonymous) {
    await saveToSupabase([userMessage, aiResponse])
  }

  // Anonymous users: messages lost on page refresh ⚠️
}
```

**UI Indicators**:
```typescript
// components/chat/header.tsx
export function ChatHeader() {
  const { isAnonymous } = useChatStore()

  return (
    <div className="flex items-center gap-2">
      {isAnonymous && (
        <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
          ⚠️ ไม่ได้บันทึกประวัติ - <button>เข้าสู่ระบบ</button>
        </div>
      )}
    </div>
  )
}
```

### Migration Path (Future)

If we want to add localStorage migration later:

```typescript
// Phase 2+ feature
async migrateAnonymousData() {
  // 1. Get messages from localStorage
  const localMessages = JSON.parse(
    localStorage.getItem('anonymous_messages') || '[]'
  )

  // 2. On signup, ask user
  if (localMessages.length > 0) {
    const confirmed = await confirm(
      'ต้องการย้ายประวัติการสนทนาไปยังบัญชีหรือไม่?'
    )

    if (confirmed) {
      // 3. Save to Supabase
      await saveMessagesToSupabase(localMessages)
      localStorage.removeItem('anonymous_messages')
    }
  }
}
```

But **NOT for Phase 1 MVP** ✅

---

## D5: Social Sharing Format

### Question
Should social share generate images or use simple text? Deep linking?

### Decision
**Simple text share with link**

### Rationale
- ✅ **Quick to implement**: No image generation needed
- ✅ **Works everywhere**: Text works on all platforms
- ✅ **Lower complexity**: No canvas/puppeteer dependencies
- ✅ **Fast**: No server-side rendering delays
- ✅ **Good enough for MVP**: Users can still share recommendations

### Implementation

**Share Function**:
```typescript
// lib/share.ts
export function generateShareText(songs: SongRecommendation[]): string {
  const songList = songs
    .slice(0, 5)  // Top 5 only
    .map((song, index) =>
      `${index + 1}. ${song.title} - ${song.artist}`
    )
    .join('\n')

  return `แนะนำเพลงจาก Karaoke AI 🎤

${songList}

ดูเพิ่มเติม: ${process.env.NEXT_PUBLIC_APP_URL}/songs
`
}

// Usage in component
function ShareButton({ songs }: { songs: SongRecommendation[] }) {
  const handleShare = async () => {
    const shareText = generateShareText(songs)

    if (navigator.share) {
      // Native share (mobile)
      await navigator.share({
        title: 'แนะนำเพลงจาก Karaoke AI',
        text: shareText,
      })
    } else {
      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(shareText)
      toast.success('คัดลอกลิงก์แล้ว!')
    }
  }

  return <button onClick={handleShare}>แชร์</button>
}
```

**Platform-Specific Shares**:
```typescript
// Share to specific platforms
export function shareToFacebook(text: string, url: string) {
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  window.open(fbUrl, '_blank')
}

export function shareToLine(text: string) {
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(text)}`
  window.open(lineUrl, '_blank')
}

export function shareToTwitter(text: string, url: string) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  window.open(twitterUrl, '_blank')
}
```

### Phase 2 Enhancement (Optional)

Add Open Graph meta tags for better preview:

```typescript
// app/layout.tsx or app/share/[id]/page.tsx
export const metadata = {
  openGraph: {
    title: 'แนะนำเพลงจาก Karaoke AI',
    description: 'รายการเพลงแนะนำจาก AI',
    images: ['/og-image.png'],  // Static image for now
  },
}
```

**NOT implementing** in Phase 1:
- ❌ Dynamic OG image generation
- ❌ Deep linking to specific conversations
- ❌ Share as image/screenshot

---

## D6: Chat Response Delivery

### Question
Should chat responses use polling, SSE (Server-Sent Events), or WebSocket?

### Decision
**Real-time streaming using Server-Sent Events (SSE)**

### Rationale
- ✅ **Better UX**: Tokens appear as they're generated (like ChatGPT)
- ✅ **Supported by LangChain**: `.stream()` method available
- ✅ **Simpler than WebSocket**: One-way communication is enough
- ✅ **Works with serverless**: Vercel supports streaming responses
- ✅ **Cancellable**: User can stop generation mid-stream

### Implementation

**API Route (Streaming)**:
```typescript
// app/api/chat/stream/route.ts
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { ChatOpenAI } from '@langchain/openai'

export const runtime = 'edge'  // Enable streaming

export async function POST(req: Request) {
  const { message, model } = await req.json()

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.ZAI_API_KEY,
    configuration: { baseURL: process.env.ZAI_BASE_URL },
    modelName: 'glm-4',
    streaming: true,  // Enable streaming
  })

  const stream = await llm.stream([
    ['system', getSystemPrompt()],
    ['human', message],
  ])

  // Convert LangChain stream to Response stream
  return new StreamingTextResponse(stream)
}
```

**Client (React Hook)**:
```typescript
// hooks/use-chat-stream.ts
import { useChat } from 'ai/react'

export function useChatStream() {
  const { messages, input, handleSubmit, isLoading } = useChat({
    api: '/api/chat/stream',
    onFinish: (message) => {
      // Save complete message to Supabase
      saveMessage(message)
    },
  })

  return { messages, input, handleSubmit, isLoading }
}

// Usage in component
function ChatInterface() {
  const { messages, input, handleSubmit } = useChatStream()

  return (
    <form onSubmit={handleSubmit}>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>  // Streams in real-time
      ))}
      <input value={input} />
    </form>
  )
}
```

**With Vercel AI SDK**:
```typescript
import { experimental_streamText } from 'ai'

export async function POST(req: Request) {
  const { message } = await req.json()

  const result = await experimental_streamText({
    model: yourModel,
    messages: [{ role: 'user', content: message }],
  })

  return result.toAIStreamResponse()
}
```

### Fallback for GLM 4.6 Concurrency

Since GLM has concurrency limit of 5:

```typescript
// Rate limiting for streaming
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),  // 5 concurrent
  analytics: true,
})

export async function POST(req: Request) {
  const userId = getUserId(req)
  const { success } = await ratelimit.limit(userId)

  if (!success) {
    return new Response('กรุณารอสักครู่ มีผู้ใช้งานพร้อมกัน', {
      status: 429
    })
  }

  // Continue with streaming...
}
```

---

## D7: Lyrics Display

### Question
Should we display full lyrics or just snippets? Copyright concerns?

### Decision
**Display snippet only (2-3 lines) to respect copyright**

### Rationale
- ✅ **Legal compliance**: Fair use - snippets for identification only
- ✅ **Copyright respect**: Don't reproduce entire copyrighted works
- ✅ **Sufficient for users**: Preview is enough to recognize song
- ✅ **Storage efficient**: Less data in database
- ⚠️ **Link to full lyrics**: Redirect to licensed providers

### Implementation

**Data Structure**:
```typescript
interface Song {
  // ... other fields
  lyricsSnippet: string  // First 2-3 lines only
  lyricsUrl?: string     // Link to licensed lyrics provider
}
```

**Display Component**:
```typescript
function SongCard({ song }: { song: Song }) {
  return (
    <div className="song-card">
      {/* ... other fields */}

      {song.lyricsSnippet && (
        <div className="lyrics-preview">
          <p className="text-sm text-gray-600 italic">
            {song.lyricsSnippet}
            {song.lyricsUrl && (
              <>
                ...{' '}
                <a
                  href={song.lyricsUrl}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  เนื้อเพลงเต็ม
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
```

**Data Validation**:
```typescript
// Limit lyrics to 150 characters (approx 2-3 lines)
function validateLyricsSnippet(lyrics: string): string {
  if (lyrics.length > 150) {
    return lyrics.substring(0, 147) + '...'
  }
  return lyrics
}
```

**Legal Notice**:
```typescript
// Add to footer or terms
const LyricsNotice = () => (
  <div className="text-xs text-gray-500">
    เนื้อเพลงที่แสดงเป็นตัวอย่างเท่านั้น
    เพื่อวัตถุประสงค์ในการระบุเพลง (Fair Use)
    สงวนลิขสิทธิ์เป็นของเจ้าของผลงาน
  </div>
)
```

---

## D8: YouTube Link Validation

### Question
When and how to validate YouTube links?

### Decision
**Validate on upload using YouTube Data API v3**

### Rationale
- ✅ **Prevent broken links**: Catch errors before saving
- ✅ **Better UX**: Admin gets immediate feedback
- ✅ **Data quality**: Ensure all songs have valid videos
- ✅ **YouTube API available**: Free tier sufficient (10k units/day)

### Implementation

**Validation Function**:
```typescript
// lib/youtube.ts
export async function validateYouTubeLink(url: string): Promise<{
  valid: boolean
  videoId?: string
  title?: string
  error?: string
}> {
  try {
    // Extract video ID
    const videoId = extractVideoId(url)
    if (!videoId) {
      return { valid: false, error: 'Invalid YouTube URL format' }
    }

    // Call YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `id=${videoId}&` +
      `key=${process.env.YOUTUBE_API_KEY}&` +
      `part=snippet,status`
    )

    if (!response.ok) {
      throw new Error('YouTube API error')
    }

    const data = await response.json()

    // Check if video exists and is available
    if (data.items?.length === 0) {
      return { valid: false, error: 'Video not found' }
    }

    const video = data.items[0]
    const isEmbeddable = video.status?.embeddable !== false
    const isPrivate = video.status?.privacyStatus === 'private'

    if (isPrivate) {
      return { valid: false, error: 'Video is private' }
    }

    return {
      valid: true,
      videoId,
      title: video.snippet.title,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

function extractVideoId(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}
```

**Usage in Admin Panel**:
```typescript
// components/admin/song-form.tsx
function SongForm() {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<{
    valid: boolean
    message: string
  } | null>(null)

  const handleYouTubeUrlChange = async (url: string) => {
    setYoutubeUrl(url)

    if (!url) {
      setValidation(null)
      return
    }

    setValidating(true)
    const result = await validateYouTubeLink(url)
    setValidating(false)

    setValidation({
      valid: result.valid,
      message: result.valid
        ? `✅ ${result.title}`
        : `❌ ${result.error}`,
    })
  }

  return (
    <div>
      <label>YouTube URL</label>
      <input
        value={youtubeUrl}
        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
      />
      {validating && <span>กำลังตรวจสอบ...</span>}
      {validation && (
        <div className={validation.valid ? 'text-green-600' : 'text-red-600'}>
          {validation.message}
        </div>
      )}
    </div>
  )
}
```

**Batch Validation (for CSV upload)**:
```typescript
async function validateSongBatch(songs: Song[]) {
  const results = await Promise.allSettled(
    songs.map(song => validateYouTubeLink(song.youtubeUrl))
  )

  const errors: Array<{ song: Song; error: string }> = []

  results.forEach((result, index) => {
    if (result.status === 'rejected' || !result.value.valid) {
      errors.push({
        song: songs[index],
        error: result.status === 'rejected'
          ? result.reason
          : result.value.error || 'Unknown',
      })
    }
  })

  return {
    valid: results.filter(r => r.status === 'fulfilled' && r.value.valid).length,
    invalid: errors.length,
    errors,
  }
}
```

**Rate Limiting**:
```typescript
// YouTube API quota: 10,000 units/day
// video.list costs 1 unit
// Limit: ~10,000 validations/day

// Implement batching with delay
async function validateWithRateLimit(urls: string[]) {
  const results = []
  const batchSize = 50  // 50 per batch

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(url => validateYouTubeLink(url))
    )
    results.push(...batchResults)

    // Delay between batches (avoid rate limit)
    if (i + batchSize < urls.length) {
      await sleep(1000)  // 1 second
    }
  }

  return results
}
```

---

## D9: AI Model Rate Limits

### Information
**GLM 4.6 (z.ai): Concurrency limit = 5**

### Impact Analysis

**What this means**:
- Maximum 5 simultaneous chat requests
- If 6th user tries while 5 are active → need to queue or reject

### Implementation Strategy

**Option A: Queue System** (Recommended)
```typescript
// lib/ai-queue.ts
class AIRequestQueue {
  private queue: Array<{
    request: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private activeCount = 0
  private maxConcurrent = 5  // GLM 4.6 limit

  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.activeCount++

    try {
      const result = await item.request()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.activeCount--
      this.processQueue()
    }
  }
}

export const glmQueue = new AIRequestQueue()

// Usage
const response = await glmQueue.enqueue(() =>
  callGLMAPI(message)
)
```

**Option B: Fallback to Gemini**
```typescript
async function callAI(message: string, model: AIModel) {
  if (model === 'glm-4.6') {
    try {
      // Try GLM first
      return await glmQueue.enqueue(() => callGLM(message))
    } catch (error) {
      if (error.message.includes('concurrency')) {
        console.warn('GLM concurrency limit, falling back to Gemini')
        return await callGemini(message)
      }
      throw error
    }
  }

  return await callGemini(message)
}
```

**Option C: User Communication**
```typescript
// Show queue position to user
function ChatInterface() {
  const [queuePosition, setQueuePosition] = useState(0)

  const sendMessage = async (text: string) => {
    // Get queue position
    const position = glmQueue.getPosition()
    setQueuePosition(position)

    if (position > 0) {
      toast.info(`กำลังรอคิว... (ลำดับที่ ${position})`)
    }

    const response = await glmQueue.enqueue(() => callAI(text))
    setQueuePosition(0)
  }
}
```

### Monitoring

```typescript
// Track concurrency metrics
import { trackEvent } from '@/lib/analytics'

class MonitoredQueue extends AIRequestQueue {
  async enqueue<T>(request: () => Promise<T>): Promise<T> {
    const startTime = Date.now()
    const queueLength = this.queue.length

    trackEvent('ai_request_queued', {
      queueLength,
      activeCount: this.activeCount,
    })

    try {
      const result = await super.enqueue(request)

      trackEvent('ai_request_completed', {
        waitTime: Date.now() - startTime,
      })

      return result
    } catch (error) {
      trackEvent('ai_request_failed', {
        error: error.message,
      })
      throw error
    }
  }
}
```

### Recommendation

**For Phase 1 MVP**:
1. ✅ Implement simple queue (Option A)
2. ✅ Show loading state to users
3. ✅ Add monitoring
4. ⚠️ Consider Gemini fallback if queue grows too long (>10)

**For Phase 2+**:
- Add more AI providers (OpenAI, Claude) to distribute load
- Implement intelligent routing based on availability
- Consider upgrading z.ai plan if available

---

## Implementation Checklist

### Phase 1 Pre-Implementation (Days -2 to 0)

- [ ] **Data Preparation**
  - [ ] Create list of 100-200 songs (CSV format)
  - [ ] Gather YouTube URLs for each song
  - [ ] Validate all YouTube links
  - [ ] Prepare lyrics snippets (2-3 lines)
  - [ ] Add metadata (genre, year, tempo, tags)

- [ ] **Environment Setup**
  - [ ] Setup Supabase project
  - [ ] Enable pgvector extension
  - [ ] Create all database tables
  - [ ] Setup RLS policies
  - [ ] Get YouTube Data API key
  - [ ] Test z.ai API key
  - [ ] Test Gemini API key

- [ ] **Technical Validation**
  - [ ] Test Transformers.js locally
  - [ ] Test pgvector similarity search
  - [ ] Test YouTube API validation
  - [ ] Test streaming responses

### Phase 1 Implementation (Days 1-7)

- [ ] **Core Infrastructure** (Days 1-2)
  - [ ] Setup Next.js 15 project
  - [ ] Install dependencies
  - [ ] Configure TypeScript
  - [ ] Setup Supabase client
  - [ ] Create type definitions

- [ ] **Chat Interface** (Days 3-4)
  - [ ] Build chat components
  - [ ] Implement Zustand store
  - [ ] Add streaming UI
  - [ ] Handle loading/error states

- [ ] **AI Integration** (Days 5-6)
  - [ ] Implement ChatService with GLM 4.6
  - [ ] Add queue system
  - [ ] Implement Gemini fallback
  - [ ] Test streaming responses

- [ ] **Testing & Polish** (Day 7)
  - [ ] Manual testing all flows
  - [ ] Fix bugs
  - [ ] UI/UX improvements
  - [ ] Deploy to Vercel

### Phase 2 Implementation (Days 8-10)

- [ ] **RAG System**
  - [ ] Implement Transformers.js embeddings
  - [ ] Setup pgvector search
  - [ ] Create indexing pipeline
  - [ ] Test search accuracy

### Phase 3 Implementation (Days 11-13)

- [ ] **Admin Panel**
  - [ ] Dashboard with stats
  - [ ] Song CRUD operations
  - [ ] CSV upload with validation
  - [ ] Analytics (basic)

---

## Success Metrics

### Technical Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Chat response time | < 2s (p95) | 🔄 To measure |
| Embedding generation | < 500ms | 🔄 To measure |
| Vector search | < 1s | 🔄 To measure |
| YouTube validation | < 1s | 🔄 To measure |
| Concurrent users | 5 (GLM limit) | ✅ Decided |

### Data Quality Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Mock songs | 100-200 | 📝 To create |
| YouTube links valid | 95%+ | 📝 To validate |
| Lyrics snippet coverage | 80%+ | 📝 To add |
| Metadata completeness | 100% | 📝 To verify |

### User Experience Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Search relevance | 85%+ | 🔄 To test |
| Response accuracy | 90%+ | 🔄 To test |
| UI responsiveness | 60fps | 🔄 To test |
| Error rate | < 2% | 🔄 To measure |

---

## Changes to Original Specification

### Documents Affected

1. **karaoke-ai-rag-system.md**
   - ❌ Remove Python `sentence-transformers`
   - ✅ Add TypeScript Transformers.js
   - ❌ Remove Chroma
   - ✅ Add Supabase pgvector

2. **karaoke-ai-chat-interface.md**
   - ✅ Add streaming UI components
   - ✅ Add queue position indicator
   - ✅ Update anonymous user behavior

3. **karaoke-ai-technical-plan.md**
   - ✅ Update Phase 1 with mock data approach
   - ✅ Add pgvector setup instead of Chroma
   - ✅ Add Transformers.js implementation
   - ✅ Add streaming implementation

4. **karaoke-ai-admin-panel.md**
   - ✅ Add YouTube validation on upload
   - ✅ Add lyrics snippet limitation
   - ✅ Add batch validation

### Breaking Changes

None - all decisions are compatible with original vision

### New Requirements

1. Transformers.js dependency (~50MB)
2. YouTube Data API key (free tier)
3. Supabase pgvector extension
4. Queue system for GLM concurrency

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Transformers.js too slow | Medium | High | Fallback to OpenAI embeddings API |
| pgvector insufficient | Low | Medium | Migrate to Pinecone/Chroma |
| GLM queue too long | Medium | Medium | Fallback to Gemini automatically |
| Mock data quality poor | Low | Medium | Manual curation + validation |
| YouTube API quota exceeded | Low | Low | Cache results, batch validation |

---

## Approval

**Specification Status**: ✅ **APPROVED FOR IMPLEMENTATION**

**Ready to Start**: 🚀 **YES**

**Blockers**: None

**Next Action**: Begin Phase 1 Pre-Implementation checklist

---

**Document Version**: 1.0
**Last Updated**: 2025-10-23
**Status**: Final
