# Data Models - Vibe-Song

## Document Information
- **Created**: 2025-10-21
- **Status**: Initial Design
- **Version**: 1.0

---

## Overview

This document defines the data models for Vibe-Song, including database schemas, TypeScript interfaces, and data flow patterns.

---

## Database Schema (PostgreSQL/Supabase)

### ER Diagram

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth, built-in)
│  ─────────────  │
│  - id (PK)      │
│  - email        │
│  - created_at   │
└─────────────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐       ┌──────────────────┐
│ user_profiles   │       │ mood_sessions    │
│  ─────────────  │       │  ──────────────  │
│  - id (PK)      │       │  - id (PK)       │
│  - user_id (FK) │ 1:N   │  - user_id (FK)  │
│  - display_name │←──────│  - mood_emoji    │
│  - avatar_url   │       │  - energy_level  │
│  - created_at   │       │  - mood_valence  │
│  - updated_at   │       │  - created_at    │
└─────────────────┘       └──────────────────┘
         │
         │ 1:1
         ↓
┌─────────────────┐       ┌──────────────────┐
│user_preferences │       │listening_history │
│  ─────────────  │       │  ──────────────  │
│  - id (PK)      │       │  - id (PK)       │
│  - user_id (FK) │ 1:N   │  - user_id (FK)  │
│  - fav_genres   │←──────│  - track_id      │
│  - fav_artists  │       │  - track_name    │
│  - mood_prefs   │       │  - artist_name   │
│  - created_at   │       │  - album_name    │
│  - updated_at   │       │  - mood_context  │
└─────────────────┘       │  - played_at     │
         │                │  - duration      │
         │ 1:N            └──────────────────┘
         ↓
┌─────────────────┐
│  saved_tracks   │
│  ─────────────  │
│  - id (PK)      │
│  - user_id (FK) │
│  - track_id     │
│  - track_data   │
│  - created_at   │
└─────────────────┘
```

---

## Table Definitions

### 1. user_profiles

Extends Supabase auth.users with profile information.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Updated at trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**TypeScript Interface**:
```typescript
interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}
```

---

### 2. user_preferences

Stores user music preferences and listening patterns.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Favorite genres (array of genre IDs or names)
  favorite_genres TEXT[] DEFAULT '{}',

  -- Favorite artists (array of artist IDs)
  favorite_artists TEXT[] DEFAULT '{}',

  -- Mood preferences (JSONB for flexibility)
  mood_preferences JSONB DEFAULT '{}',

  -- Listening habits
  preferred_energy_range INT4RANGE DEFAULT '[1,10]',
  preferred_valence_range INT4RANGE DEFAULT '[1,10]',

  -- Settings
  explicit_content_allowed BOOLEAN DEFAULT false,
  autoplay BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_genres ON user_preferences USING GIN(favorite_genres);
CREATE INDEX idx_user_preferences_artists ON user_preferences USING GIN(favorite_artists);
```

**TypeScript Interface**:
```typescript
interface UserPreferences {
  id: string
  user_id: string
  favorite_genres: string[]
  favorite_artists: string[]
  mood_preferences: Record<string, any>
  preferred_energy_range: [number, number]
  preferred_valence_range: [number, number]
  explicit_content_allowed: boolean
  autoplay: boolean
  created_at: string
  updated_at: string
}

// Example mood_preferences structure
interface MoodPreferences {
  '😊': {
    genres: string[]
    artists: string[]
    playCount: number
  }
  '😢': {
    genres: string[]
    artists: string[]
    playCount: number
  }
  // ... other moods
}
```

---

### 3. listening_history

Tracks what users have listened to.

```sql
CREATE TABLE listening_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Track information (from Deezer)
  track_id TEXT NOT NULL,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_id TEXT,
  album_name TEXT,
  album_id TEXT,
  duration INTEGER, -- seconds
  preview_url TEXT,
  cover_url TEXT,

  -- Context
  mood_context JSONB, -- Mood when track was played
  source TEXT, -- 'recommendation', 'search', 'playlist', etc.

  -- Engagement
  play_duration INTEGER, -- How long they actually listened
  completed BOOLEAN DEFAULT false, -- Finished the track?
  liked BOOLEAN, -- User feedback

  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates within a short time
  CONSTRAINT unique_user_track_time UNIQUE (user_id, track_id, played_at)
);

-- RLS Policies
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON listening_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON listening_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX idx_listening_history_track_id ON listening_history(track_id);
CREATE INDEX idx_listening_history_played_at ON listening_history(played_at DESC);
CREATE INDEX idx_listening_history_mood ON listening_history USING GIN(mood_context);

-- Composite index for recent history
CREATE INDEX idx_listening_history_user_recent
  ON listening_history(user_id, played_at DESC);
```

**TypeScript Interface**:
```typescript
interface ListeningHistory {
  id: string
  user_id: string
  track_id: string
  track_name: string
  artist_name: string
  artist_id: string | null
  album_name: string | null
  album_id: string | null
  duration: number | null
  preview_url: string | null
  cover_url: string | null
  mood_context: MoodContext | null
  source: 'recommendation' | 'search' | 'playlist' | 'similar'
  play_duration: number | null
  completed: boolean
  liked: boolean | null
  played_at: string
}

interface MoodContext {
  emoji: string
  energyLevel: number
  moodValence: number
  timestamp: string
}
```

---

### 4. mood_sessions

Tracks mood selection sessions.

```sql
CREATE TABLE mood_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mood data
  mood_emoji TEXT NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_valence INTEGER NOT NULL CHECK (mood_valence >= 1 AND mood_valence <= 10),

  -- Context
  time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
  day_of_week INTEGER, -- 0-6

  -- Metadata
  tracks_played INTEGER DEFAULT 0,
  session_duration INTEGER, -- seconds

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies
ALTER TABLE mood_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON mood_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own sessions"
  ON mood_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sessions"
  ON mood_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes
CREATE INDEX idx_mood_sessions_user_id ON mood_sessions(user_id);
CREATE INDEX idx_mood_sessions_created_at ON mood_sessions(created_at DESC);
CREATE INDEX idx_mood_sessions_mood_emoji ON mood_sessions(mood_emoji);
```

**TypeScript Interface**:
```typescript
interface MoodSession {
  id: string
  user_id: string | null
  mood_emoji: string
  energy_level: number
  mood_valence: number
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night' | null
  day_of_week: number | null
  tracks_played: number
  session_duration: number | null
  created_at: string
  ended_at: string | null
}
```

---

### 5. saved_tracks

User's saved/favorited tracks.

```sql
CREATE TABLE saved_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Track data (denormalized from Deezer)
  track_id TEXT NOT NULL,
  track_data JSONB NOT NULL, -- Full track object from Deezer

  -- Metadata
  notes TEXT, -- User notes
  tags TEXT[], -- User-defined tags

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, track_id)
);

-- RLS Policies
ALTER TABLE saved_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved tracks"
  ON saved_tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved tracks"
  ON saved_tracks FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_saved_tracks_user_id ON saved_tracks(user_id);
CREATE INDEX idx_saved_tracks_track_id ON saved_tracks(track_id);
CREATE INDEX idx_saved_tracks_created_at ON saved_tracks(created_at DESC);
CREATE INDEX idx_saved_tracks_tags ON saved_tracks USING GIN(tags);
```

**TypeScript Interface**:
```typescript
interface SavedTrack {
  id: string
  user_id: string
  track_id: string
  track_data: DeezerTrack
  notes: string | null
  tags: string[]
  created_at: string
}
```

---

## External API Data Models

### Deezer API Models

```typescript
// Track from Deezer API
interface DeezerTrack {
  id: string
  title: string
  title_short: string
  duration: number // seconds
  rank: number // popularity
  explicit_lyrics: boolean
  preview: string // 30s preview URL
  artist: {
    id: string
    name: string
    picture: string
    picture_medium: string
    picture_big: string
  }
  album: {
    id: string
    title: string
    cover: string
    cover_medium: string
    cover_big: string
    release_date: string
  }
  type: 'track'
}

// Search results
interface DeezerSearchResult {
  data: DeezerTrack[]
  total: number
  next?: string
}

// Genre
interface DeezerGenre {
  id: number
  name: string
  picture: string
}
```

---

### Last.fm API Models

```typescript
// Track info from Last.fm
interface LastfmTrackInfo {
  name: string
  artist: {
    name: string
    mbid: string
  }
  album?: {
    title: string
    image: { '#text': string; size: string }[]
  }
  toptags: {
    tag: LastfmTag[]
  }
  wiki?: {
    summary: string
    content: string
  }
}

// Tag
interface LastfmTag {
  name: string
  url: string
  count?: number
}

// Similar tracks
interface LastfmSimilarTrack {
  name: string
  artist: {
    name: string
  }
  match: number // 0-1 similarity score
}
```

---

## Application Data Models

### Mood Input

```typescript
// User's mood input
interface MoodInput {
  emoji: string
  energyLevel: number // 1-10
  moodValence: number // 1-10
}

// Mood mapping configuration
interface MoodMapping {
  emoji: string
  keywords: string[]
  genres: string[]
  lastfmTags: string[]
  energyRange: [number, number]
  valenceRange: [number, number]
}

// Complete mood map
const MOOD_MAP: Record<string, MoodMapping> = {
  '😊': {
    emoji: '😊',
    keywords: ['happy', 'upbeat', 'cheerful', 'joyful'],
    genres: ['pop', 'dance', 'funk'],
    lastfmTags: ['happy', 'upbeat', 'feel-good', 'positive'],
    energyRange: [6, 10],
    valenceRange: [7, 10]
  },
  '😢': {
    emoji: '😢',
    keywords: ['sad', 'emotional', 'melancholic', 'heartbreak'],
    genres: ['ballad', 'acoustic', 'indie'],
    lastfmTags: ['sad', 'emotional', 'melancholy', 'heartbreak'],
    energyRange: [1, 4],
    valenceRange: [1, 4]
  },
  '😌': {
    emoji: '😌',
    keywords: ['calm', 'chill', 'relaxing', 'peaceful'],
    genres: ['ambient', 'chillout', 'lounge', 'classical'],
    lastfmTags: ['chill', 'relaxing', 'calm', 'peaceful'],
    energyRange: [2, 5],
    valenceRange: [5, 8]
  },
  '🔥': {
    emoji: '🔥',
    keywords: ['energetic', 'party', 'hype', 'intense'],
    genres: ['edm', 'dance', 'electronic', 'hip-hop'],
    lastfmTags: ['energetic', 'party', 'dance', 'hype'],
    energyRange: [8, 10],
    valenceRange: [6, 10]
  },
  '💭': {
    emoji: '💭',
    keywords: ['thoughtful', 'introspective', 'deep', 'contemplative'],
    genres: ['indie', 'alternative', 'folk', 'singer-songwriter'],
    lastfmTags: ['introspective', 'thoughtful', 'indie', 'melancholic'],
    energyRange: [3, 6],
    valenceRange: [4, 7]
  },
  '😴': {
    emoji: '😴',
    keywords: ['sleepy', 'dreamy', 'soft', 'lullaby'],
    genres: ['ambient', 'classical', 'new-age', 'acoustic'],
    lastfmTags: ['sleep', 'dreamy', 'soft', 'relaxing'],
    energyRange: [1, 3],
    valenceRange: [4, 7]
  },
  '💪': {
    emoji: '💪',
    keywords: ['workout', 'motivation', 'powerful', 'strong'],
    genres: ['rock', 'metal', 'hip-hop', 'electronic'],
    lastfmTags: ['workout', 'motivational', 'powerful', 'intense'],
    energyRange: [7, 10],
    valenceRange: [5, 9]
  },
  '🎉': {
    emoji: '🎉',
    keywords: ['party', 'celebration', 'fun', 'festive'],
    genres: ['pop', 'dance', 'latin', 'disco'],
    lastfmTags: ['party', 'dance', 'fun', 'upbeat'],
    energyRange: [8, 10],
    valenceRange: [8, 10]
  }
}
```

---

### Recommendation

```typescript
// Enriched track with scoring
interface EnrichedTrack extends DeezerTrack {
  lastfmTags: string[]
  score: number
  matchReason: string[]
}

// Recommendation result
interface RecommendationResult {
  tracks: EnrichedTrack[]
  moodContext: MoodInput
  totalResults: number
  generatedAt: string
}

// Recommendation request
interface RecommendationRequest {
  mood: MoodInput
  userId?: string
  limit?: number
  excludeIds?: string[] // Already played
  seedTrackId?: string // Base recommendations on this track
}
```

---

### Player State

```typescript
// Audio player state
interface PlayerState {
  currentTrack: DeezerTrack | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  queue: DeezerTrack[]
  queueIndex: number
  repeat: 'none' | 'one' | 'all'
  shuffle: boolean
}
```

---

## Database Functions & Triggers

### Update Timestamp Trigger

```sql
-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### User Stats Function

```sql
-- Get user listening statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  total_plays BIGINT,
  unique_tracks BIGINT,
  unique_artists BIGINT,
  total_duration BIGINT,
  favorite_mood TEXT,
  favorite_genre TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_plays,
    COUNT(DISTINCT track_id) as unique_tracks,
    COUNT(DISTINCT artist_id) as unique_artists,
    SUM(duration) as total_duration,
    (
      SELECT mood_context->>'emoji'
      FROM listening_history
      WHERE user_id = p_user_id
      GROUP BY mood_context->>'emoji'
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) as favorite_mood,
    (
      SELECT unnest(favorite_genres)
      FROM user_preferences
      WHERE user_id = p_user_id
      LIMIT 1
    ) as favorite_genre
  FROM listening_history
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

---

### Get Recommendations Based on History

```sql
-- Get track IDs user has already played
CREATE OR REPLACE FUNCTION get_played_track_ids(p_user_id UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT track_id
    FROM listening_history
    WHERE user_id = p_user_id
      AND played_at > NOW() - INTERVAL '7 days'
  );
END;
$$ LANGUAGE plpgsql;
```

---

## Views

### Recent Listening Activity

```sql
CREATE VIEW recent_listening_activity AS
SELECT
  lh.user_id,
  up.display_name,
  lh.track_name,
  lh.artist_name,
  lh.mood_context->>'emoji' as mood,
  lh.played_at,
  lh.completed
FROM listening_history lh
LEFT JOIN user_profiles up ON lh.user_id = up.user_id
WHERE lh.played_at > NOW() - INTERVAL '24 hours'
ORDER BY lh.played_at DESC;
```

---

### Popular Moods

```sql
CREATE MATERIALIZED VIEW popular_moods AS
SELECT
  mood_emoji,
  COUNT(*) as session_count,
  AVG(energy_level) as avg_energy,
  AVG(mood_valence) as avg_valence,
  COUNT(DISTINCT user_id) as unique_users
FROM mood_sessions
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY mood_emoji
ORDER BY session_count DESC;

-- Refresh periodically
CREATE INDEX idx_popular_moods_emoji ON popular_moods(mood_emoji);
```

---

## Data Migration Strategy

### Phase 1: Initial Schema
- Create tables
- Set up RLS policies
- Create indexes
- Create basic functions

### Phase 2: Seed Data
- Default mood mappings
- Genre mappings
- Sample data for testing

### Phase 3: Production Data
- User migration (if applicable)
- Data validation
- Performance tuning

---

## Data Retention Policy

### Active Data
- User profiles: Indefinite
- Preferences: Indefinite
- Saved tracks: Indefinite

### Historical Data
- Listening history: 1 year (archive older)
- Mood sessions: 6 months (archive older)

### Archived Data
- Move to separate table
- Compress and store
- Available for analytics

---

## Privacy & GDPR Compliance

### User Data Export
```sql
-- Export all user data
CREATE OR REPLACE FUNCTION export_user_data(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'profile', (SELECT row_to_json(up.*) FROM user_profiles up WHERE user_id = p_user_id),
    'preferences', (SELECT row_to_json(up.*) FROM user_preferences up WHERE user_id = p_user_id),
    'listening_history', (SELECT jsonb_agg(lh.*) FROM listening_history lh WHERE user_id = p_user_id),
    'saved_tracks', (SELECT jsonb_agg(st.*) FROM saved_tracks st WHERE user_id = p_user_id),
    'mood_sessions', (SELECT jsonb_agg(ms.*) FROM mood_sessions ms WHERE user_id = p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### User Data Deletion
```sql
-- Delete all user data (cascade handles related records)
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Soft delete or hard delete based on requirements
  DELETE FROM auth.users WHERE id = p_user_id;
  -- Cascades to all related tables
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Summary

This data model provides:
- ✅ **Normalized**: Efficient storage, no redundancy
- ✅ **Secure**: Row-Level Security on all tables
- ✅ **Scalable**: Proper indexing for performance
- ✅ **Flexible**: JSONB for extensibility
- ✅ **Privacy-Focused**: GDPR compliance built-in
- ✅ **Type-Safe**: Full TypeScript definitions

---

**Related Documents**:
- [Tech Stack](./tech-stack.md)
- [System Design](./system-design.md)
- [Initial Vision](../PRPs/001-initial-vision.md)

**Last Updated**: 2025-10-21
**Version**: 1.0
