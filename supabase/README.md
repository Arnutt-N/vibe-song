# Supabase Database Setup - Karaoke AI

Complete guide for setting up the Karaoke AI database on Supabase.

---

## 📋 Overview

This database setup includes:
- ✅ **pgvector extension** for semantic search
- ✅ **5 core tables**: songs, song_embeddings, users, chat_sessions, chat_messages
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Utility functions** for search, recommendations, and analytics
- ✅ **HNSW index** for fast vector similarity search

---

## 🚀 Quick Start

### Option 1: Supabase Dashboard (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Sign up / Login
   - Click "New Project"
   - Fill in:
     - **Name**: Karaoke AI
     - **Database Password**: (save this!)
     - **Region**: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

2. **Run Migrations**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**
   - Copy contents of `migrations/001_initial_schema.sql`
   - Paste and click **"Run"**
   - Repeat for:
     - `migrations/002_rls_policies.sql`
     - `migrations/003_utility_functions.sql`

3. **Verify Setup**
   - Open new query
   - Copy contents of `test-queries.sql` (queries 1-4)
   - Run to verify tables and extensions

✅ **Done!** Your database is ready.

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Check status
supabase db remote status
```

---

## 📊 Database Schema

### Core Tables

#### `songs` - Song Catalog
```sql
- id (UUID, PK)
- title, artist, genre
- year, tempo
- language, dialect
- lyrics_snippet (max 150 chars)
- difficulty (Easy/Medium/Hard)
- tags (array)
- youtube_url, spotify_url, deezer_url
- created_at, updated_at
```

#### `song_embeddings` - Vector Embeddings
```sql
- id (UUID, PK)
- song_id (FK → songs)
- embedding (vector(384))  -- all-MiniLM-L6-v2
- model_name
- created_at
```

#### `users` - User Profiles
```sql
- id (UUID, PK)
- auth_id (UUID) -- Links to Supabase Auth
- email, display_name
- preferences (JSONB)
- created_at, updated_at
```

#### `chat_sessions` - Chat Conversations
```sql
- id (UUID, PK)
- user_id (FK → users, nullable)
- session_name
- is_anonymous (boolean)
- created_at, updated_at, last_activity_at
```

#### `chat_messages` - Individual Messages
```sql
- id (UUID, PK)
- session_id (FK → chat_sessions)
- role (user/assistant/system)
- content (text)
- retrieved_songs (UUID[]) -- RAG context
- similarity_scores (float[])
- ai_provider, model_name
- prompt_tokens, completion_tokens
- created_at
```

---

## 🔍 Key Features

### 1. Vector Similarity Search

Uses **pgvector** with **HNSW index** for fast semantic search:

```sql
SELECT * FROM search_similar_songs(
  query_embedding := '[0.1, 0.2, ...]'::vector(384),
  match_threshold := 0.7,
  match_count := 10
);
```

**HNSW Index Parameters:**
- `m = 16`: Max connections per layer
- `ef_construction = 64`: Build-time accuracy

### 2. Hybrid Search

Combines vector search + full-text search:

```sql
SELECT * FROM hybrid_search_songs(
  query_text := 'sad love song',
  query_embedding := '[...]'::vector(384),
  filter_language := 'Thai',
  match_count := 10
);
```

### 3. Mood/Tag Search

```sql
SELECT * FROM search_songs_by_mood(
  mood_tags := ARRAY['sad', 'heartbreak', 'slow'],
  match_count := 10
);
```

### 4. Similar Songs Recommendation

```sql
SELECT * FROM get_similar_songs(
  source_song_id := 'song-uuid-here',
  match_count := 5,
  similarity_threshold := 0.7
);
```

---

## 🔐 Security (RLS Policies)

### Songs Table
- ✅ **Public Read**: Anyone can view songs
- 🔒 **Admin Write**: Only admins can add/edit/delete

### Users Table
- 🔒 **Own Profile**: Users can only see/edit their own profile

### Chat Sessions & Messages
- ✅ **Anonymous**: Anonymous users can create sessions
- 🔒 **Own Sessions**: Users can only access their own sessions
- ✅ **Logged In**: Full history saved for authenticated users

---

## 📈 Analytics Functions

### Song Statistics
```sql
SELECT * FROM get_song_statistics();
```

Returns:
- Total songs
- Songs with embeddings
- Distribution by language, genre, difficulty

### Chat Statistics
```sql
SELECT * FROM get_chat_statistics(days_back := 30);
```

Returns:
- Total sessions (anonymous vs authenticated)
- Total messages
- Average messages per session
- Top AI providers used

---

## 🛠️ Utility Functions

### Bulk Insert Songs

```sql
SELECT * FROM bulk_insert_songs('[
  {
    "title": "Song Title",
    "artist": "Artist Name",
    "genre": "Pop",
    "year": 2024,
    "language": "Thai",
    "tags": ["upbeat", "dance"]
  }
]'::jsonb);
```

### Cleanup Old Sessions

```sql
-- Delete anonymous sessions older than 7 days
SELECT cleanup_old_anonymous_sessions(days_old := 7);
```

---

## 🧪 Testing Your Setup

Run queries from `test-queries.sql`:

```sql
-- 1. Verify pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 4. View sample songs
SELECT title, artist, genre, language FROM songs LIMIT 10;

-- 5. Get statistics
SELECT * FROM get_song_statistics();
```

---

## 📥 Importing Song Data

### From CSV (after data collection)

```sql
-- Option 1: Supabase Dashboard
-- 1. Go to Table Editor → songs
-- 2. Click "Insert" → "Import from CSV"
-- 3. Upload your CSV file

-- Option 2: SQL COPY command
COPY songs (
  title, artist, genre, year, tempo, language, dialect,
  lyrics_snippet, difficulty, tags, youtube_url, spotify_url, deezer_url
)
FROM '/path/to/songs.csv'
DELIMITER ','
CSV HEADER;
```

### From JSON

```sql
SELECT * FROM bulk_insert_songs(
  pg_read_file('/path/to/songs.json')::jsonb
);
```

---

## 🔗 Get Connection Details

### For Next.js App

1. Go to **Project Settings** → **API**
2. Copy these values:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### For Database Connection

```env
# Direct PostgreSQL connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

---

## 📊 Monitoring

### Check Table Sizes

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size('public.' || tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.' || tablename) DESC;
```

### Check Index Performance

```sql
-- View index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Recent Activity

```sql
SELECT
  'songs' as table,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) as total
FROM songs
UNION ALL
SELECT 'sessions', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), COUNT(*) FROM chat_sessions
UNION ALL
SELECT 'messages', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'), COUNT(*) FROM chat_messages;
```

---

## ⚠️ Common Issues

### Issue: pgvector extension not found

**Solution:**
```sql
-- Enable in SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

If still fails, contact Supabase support (pgvector should be available on all projects).

### Issue: RLS blocking queries

**Solution:**
- Check if you're using service role key (bypasses RLS)
- Or disable RLS temporarily for testing:
  ```sql
  ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
  ```

### Issue: Vector index too slow

**Solutions:**
1. Tune HNSW parameters:
   ```sql
   DROP INDEX idx_song_embeddings_vector;
   CREATE INDEX idx_song_embeddings_vector ON song_embeddings
   USING hnsw (embedding vector_cosine_ops)
   WITH (m = 32, ef_construction = 128); -- Slower build, faster search
   ```

2. Increase `ef_search` for queries:
   ```sql
   SET hnsw.ef_search = 100; -- Default is 40
   ```

---

## 🚀 Next Steps

After setup:

1. ✅ **Import Songs**: Use data collection scripts to gather 200 songs
2. ✅ **Generate Embeddings**: Create embeddings for semantic search
3. ✅ **Test Queries**: Verify search and recommendations work
4. ✅ **Connect Next.js**: Link your app to Supabase
5. ✅ **Deploy**: Go live!

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **pgvector Docs**: https://github.com/pgvector/pgvector
- **Migration Files**: `supabase/migrations/`
- **Test Queries**: `supabase/test-queries.sql`

---

**Last Updated**: 2025-10-23
**Database Version**: 1.0
**pgvector Version**: 0.5.0+
