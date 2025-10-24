-- Karaoke AI - Initial Database Schema
-- Migration: 001_initial_schema
-- Description: Create core tables for songs, embeddings, chat sessions, and users

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- SONGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic metadata
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT NOT NULL,
  year INTEGER CHECK (year >= 1900 AND year <= 2100),
  tempo INTEGER CHECK (tempo >= 40 AND tempo <= 200),

  -- Language and dialect
  language TEXT NOT NULL CHECK (language IN ('Thai', 'English', 'Korean', 'Japanese', 'Chinese')),
  dialect TEXT CHECK (dialect IN ('Isaan', 'Southern', 'Central')),

  -- Lyrics and difficulty
  lyrics_snippet TEXT CHECK (LENGTH(lyrics_snippet) <= 150),
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),

  -- Tags (array of strings)
  tags TEXT[] DEFAULT '{}',

  -- External URLs
  youtube_url TEXT,
  spotify_url TEXT,
  deezer_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_song UNIQUE (title, artist)
);

-- Create indexes for common queries
CREATE INDEX idx_songs_language ON songs(language);
CREATE INDEX idx_songs_genre ON songs(genre);
CREATE INDEX idx_songs_difficulty ON songs(difficulty);
CREATE INDEX idx_songs_tags ON songs USING GIN(tags);
CREATE INDEX idx_songs_created_at ON songs(created_at DESC);

-- Full-text search index
CREATE INDEX idx_songs_search ON songs USING GIN(
  to_tsvector('english',
    COALESCE(title, '') || ' ' ||
    COALESCE(artist, '') || ' ' ||
    COALESCE(genre, '')
  )
);

-- ============================================================
-- SONG EMBEDDINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS song_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,

  -- Vector embedding (384 dimensions for all-MiniLM-L6-v2)
  embedding vector(384) NOT NULL,

  -- Metadata
  model_name TEXT DEFAULT 'Xenova/all-MiniLM-L6-v2',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- One embedding per song
  CONSTRAINT unique_song_embedding UNIQUE (song_id)
);

-- HNSW index for fast vector similarity search
CREATE INDEX idx_song_embeddings_vector ON song_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Authentication (managed by Supabase Auth)
  auth_id UUID UNIQUE, -- Reference to auth.users

  -- Profile
  email TEXT UNIQUE,
  display_name TEXT,

  -- Settings
  preferences JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- CHAT SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User (nullable for anonymous sessions)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Session metadata
  session_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX idx_chat_sessions_last_activity ON chat_sessions(last_activity_at DESC);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session reference
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,

  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- RAG metadata (for assistant messages)
  retrieved_songs UUID[], -- Array of song IDs used in response
  similarity_scores FLOAT[], -- Corresponding similarity scores

  -- AI provider info
  ai_provider TEXT, -- 'glm', 'gemini', 'openai', 'claude'
  model_name TEXT,

  -- Token usage
  prompt_tokens INTEGER,
  completion_tokens INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_similar_songs(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  song_id UUID,
  title TEXT,
  artist TEXT,
  genre TEXT,
  similarity float
) AS $$
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
  WHERE 1 - (se.embedding <=> query_embedding) > match_threshold
  ORDER BY se.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON TABLE songs IS 'Song catalog with metadata for karaoke recommendations';
COMMENT ON TABLE song_embeddings IS 'Vector embeddings for semantic song search';
COMMENT ON TABLE users IS 'User profiles and preferences';
COMMENT ON TABLE chat_sessions IS 'Chat conversation sessions (logged in and anonymous)';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';

COMMENT ON COLUMN songs.lyrics_snippet IS 'Short lyrics excerpt (max 150 chars) for preview';
COMMENT ON COLUMN songs.tags IS 'Array of descriptive tags (mood, style, occasion, etc.)';
COMMENT ON COLUMN song_embeddings.embedding IS '384-dimensional vector from all-MiniLM-L6-v2';
COMMENT ON COLUMN chat_messages.retrieved_songs IS 'Song IDs retrieved by RAG for this message';
COMMENT ON COLUMN chat_messages.similarity_scores IS 'Similarity scores corresponding to retrieved_songs';

-- ============================================================
-- SAMPLE DATA (for testing)
-- ============================================================

-- Insert a sample Thai song
INSERT INTO songs (
  title, artist, genre, year, tempo, language,
  lyrics_snippet, difficulty, tags, youtube_url
) VALUES (
  'ดอกไม้ในใจเธอ',
  'ไมค์ ภิรมย์พร',
  'ลูกทุ่ง',
  2020,
  120,
  'Thai',
  'ดอกไม้ในใจเธอ ฉันขอเก็บไว้... คนที่เธอรัก คงไม่ใช่ฉัน',
  'Easy',
  ARRAY['sad', 'love', 'heartbreak', 'thai-country'],
  'https://www.youtube.com/watch?v=example'
) ON CONFLICT (title, artist) DO NOTHING;

-- Insert a sample K-pop song
INSERT INTO songs (
  title, artist, genre, year, tempo, language,
  difficulty, tags, youtube_url
) VALUES (
  'Dynamite',
  'BTS',
  'K-pop',
  2020,
  114,
  'English',
  'Medium',
  ARRAY['upbeat', 'dance', 'happy', 'energetic'],
  'https://www.youtube.com/watch?v=gdZLi9oWNZg'
) ON CONFLICT (title, artist) DO NOTHING;

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Initial schema migration completed successfully!';
  RAISE NOTICE 'Tables created: songs, song_embeddings, users, chat_sessions, chat_messages';
  RAISE NOTICE 'Extensions enabled: uuid-ossp, vector';
  RAISE NOTICE 'Next step: Enable Row Level Security (RLS)';
END $$;
