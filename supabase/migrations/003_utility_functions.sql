-- Karaoke AI - Utility Functions
-- Migration: 003_utility_functions
-- Description: Helper functions for common operations

-- ============================================================
-- SEARCH FUNCTIONS
-- ============================================================

-- Multi-modal search: combine vector similarity and text search
CREATE OR REPLACE FUNCTION hybrid_search_songs(
  query_text TEXT DEFAULT NULL,
  query_embedding vector(384) DEFAULT NULL,
  filter_language TEXT DEFAULT NULL,
  filter_genre TEXT DEFAULT NULL,
  filter_difficulty TEXT DEFAULT NULL,
  match_count INT DEFAULT 10,
  similarity_threshold FLOAT DEFAULT 0.5
)
RETURNS TABLE (
  song_id UUID,
  title TEXT,
  artist TEXT,
  genre TEXT,
  language TEXT,
  difficulty TEXT,
  youtube_url TEXT,
  similarity_score FLOAT,
  text_rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT
      s.id,
      s.title,
      s.artist,
      s.genre,
      s.language,
      s.difficulty,
      s.youtube_url,
      CASE
        WHEN query_embedding IS NOT NULL
        THEN 1 - (se.embedding <=> query_embedding)
        ELSE 0
      END AS similarity
    FROM songs s
    LEFT JOIN song_embeddings se ON se.song_id = s.id
    WHERE
      (filter_language IS NULL OR s.language = filter_language)
      AND (filter_genre IS NULL OR s.genre = filter_genre)
      AND (filter_difficulty IS NULL OR s.difficulty = filter_difficulty)
      AND (
        query_embedding IS NULL
        OR (1 - (se.embedding <=> query_embedding)) > similarity_threshold
      )
  ),
  text_results AS (
    SELECT
      s.id,
      CASE
        WHEN query_text IS NOT NULL
        THEN ts_rank(
          to_tsvector('english',
            COALESCE(s.title, '') || ' ' ||
            COALESCE(s.artist, '') || ' ' ||
            COALESCE(s.genre, '')
          ),
          plainto_tsquery('english', query_text)
        )
        ELSE 0
      END AS rank
    FROM songs s
    WHERE
      query_text IS NULL
      OR to_tsvector('english',
        COALESCE(s.title, '') || ' ' ||
        COALESCE(s.artist, '') || ' ' ||
        COALESCE(s.genre, '')
      ) @@ plainto_tsquery('english', query_text)
  )
  SELECT
    vr.id,
    vr.title,
    vr.artist,
    vr.genre,
    vr.language,
    vr.difficulty,
    vr.youtube_url,
    vr.similarity,
    COALESCE(tr.rank, 0) AS text_rank
  FROM vector_results vr
  LEFT JOIN text_results tr ON tr.id = vr.id
  ORDER BY
    (vr.similarity * 0.7 + COALESCE(tr.rank, 0) * 0.3) DESC,
    vr.similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Search songs by mood/tags
CREATE OR REPLACE FUNCTION search_songs_by_mood(
  mood_tags TEXT[],
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  song_id UUID,
  title TEXT,
  artist TEXT,
  genre TEXT,
  matching_tags TEXT[],
  tag_match_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.artist,
    s.genre,
    s.tags && mood_tags AS matching_tags,
    (
      SELECT COUNT(*)
      FROM unnest(s.tags) AS tag
      WHERE tag = ANY(mood_tags)
    )::INT AS matches
  FROM songs s
  WHERE s.tags && mood_tags
  ORDER BY matches DESC, s.created_at DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RECOMMENDATION FUNCTIONS
-- ============================================================

-- Get similar songs based on a given song
CREATE OR REPLACE FUNCTION get_similar_songs(
  source_song_id UUID,
  match_count INT DEFAULT 5,
  similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  song_id UUID,
  title TEXT,
  artist TEXT,
  genre TEXT,
  similarity FLOAT
) AS $$
DECLARE
  source_embedding vector(384);
BEGIN
  -- Get embedding of source song
  SELECT embedding INTO source_embedding
  FROM song_embeddings
  WHERE song_id = source_song_id;

  IF source_embedding IS NULL THEN
    RAISE EXCEPTION 'Song embedding not found for ID: %', source_song_id;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.title,
    s.artist,
    s.genre,
    1 - (se.embedding <=> source_embedding) AS similarity
  FROM song_embeddings se
  JOIN songs s ON s.id = se.song_id
  WHERE
    se.song_id != source_song_id
    AND (1 - (se.embedding <=> source_embedding)) > similarity_threshold
  ORDER BY se.embedding <=> source_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ANALYTICS FUNCTIONS
-- ============================================================

-- Get song statistics
CREATE OR REPLACE FUNCTION get_song_statistics()
RETURNS TABLE (
  total_songs BIGINT,
  songs_with_embeddings BIGINT,
  songs_by_language JSONB,
  songs_by_genre JSONB,
  songs_by_difficulty JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_songs,
    COUNT(se.id)::BIGINT AS songs_with_embeddings,
    (
      SELECT jsonb_object_agg(language, count)
      FROM (
        SELECT language, COUNT(*) as count
        FROM songs
        GROUP BY language
      ) lang_counts
    ) AS songs_by_language,
    (
      SELECT jsonb_object_agg(genre, count)
      FROM (
        SELECT genre, COUNT(*) as count
        FROM songs
        GROUP BY genre
        ORDER BY count DESC
      ) genre_counts
    ) AS songs_by_genre,
    (
      SELECT jsonb_object_agg(difficulty, count)
      FROM (
        SELECT difficulty, COUNT(*) as count
        FROM songs
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
      ) diff_counts
    ) AS songs_by_difficulty
  FROM songs s
  LEFT JOIN song_embeddings se ON se.song_id = s.id;
END;
$$ LANGUAGE plpgsql;

-- Get chat session statistics
CREATE OR REPLACE FUNCTION get_chat_statistics(
  days_back INT DEFAULT 30
)
RETURNS TABLE (
  total_sessions BIGINT,
  anonymous_sessions BIGINT,
  authenticated_sessions BIGINT,
  total_messages BIGINT,
  avg_messages_per_session NUMERIC,
  top_ai_providers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT cs.id)::BIGINT AS total_sessions,
    COUNT(DISTINCT cs.id) FILTER (WHERE cs.is_anonymous = true)::BIGINT AS anonymous_sessions,
    COUNT(DISTINCT cs.id) FILTER (WHERE cs.is_anonymous = false)::BIGINT AS authenticated_sessions,
    COUNT(cm.id)::BIGINT AS total_messages,
    ROUND(
      CASE
        WHEN COUNT(DISTINCT cs.id) > 0
        THEN COUNT(cm.id)::NUMERIC / COUNT(DISTINCT cs.id)::NUMERIC
        ELSE 0
      END,
      2
    ) AS avg_messages_per_session,
    (
      SELECT jsonb_object_agg(ai_provider, count)
      FROM (
        SELECT
          COALESCE(ai_provider, 'unknown') as ai_provider,
          COUNT(*) as count
        FROM chat_messages
        WHERE
          role = 'assistant'
          AND created_at > NOW() - (days_back || ' days')::INTERVAL
        GROUP BY ai_provider
        ORDER BY count DESC
        LIMIT 5
      ) provider_counts
    ) AS top_ai_providers
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cm.session_id = cs.id
  WHERE cs.created_at > NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================

-- Clean up old anonymous sessions
CREATE OR REPLACE FUNCTION cleanup_old_anonymous_sessions(
  days_old INT DEFAULT 7
)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM chat_sessions
  WHERE
    is_anonymous = true
    AND last_activity_at < NOW() - (days_old || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Refresh song statistics materialized view (if we add one later)
CREATE OR REPLACE FUNCTION refresh_song_stats()
RETURNS VOID AS $$
BEGIN
  -- Placeholder for future materialized view refresh
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY song_stats_mv;
  RAISE NOTICE 'Song statistics refreshed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- BATCH OPERATIONS
-- ============================================================

-- Bulk insert songs from JSON
CREATE OR REPLACE FUNCTION bulk_insert_songs(songs_json JSONB)
RETURNS TABLE (
  inserted_count INT,
  skipped_count INT,
  error_count INT
) AS $$
DECLARE
  song_record RECORD;
  inserted INT := 0;
  skipped INT := 0;
  errors INT := 0;
BEGIN
  FOR song_record IN
    SELECT * FROM jsonb_to_recordset(songs_json) AS (
      title TEXT,
      artist TEXT,
      genre TEXT,
      year INT,
      tempo INT,
      language TEXT,
      dialect TEXT,
      lyrics_snippet TEXT,
      difficulty TEXT,
      tags TEXT[],
      youtube_url TEXT,
      spotify_url TEXT,
      deezer_url TEXT
    )
  LOOP
    BEGIN
      INSERT INTO songs (
        title, artist, genre, year, tempo, language, dialect,
        lyrics_snippet, difficulty, tags, youtube_url, spotify_url, deezer_url
      ) VALUES (
        song_record.title,
        song_record.artist,
        song_record.genre,
        song_record.year,
        song_record.tempo,
        song_record.language,
        song_record.dialect,
        song_record.lyrics_snippet,
        song_record.difficulty,
        song_record.tags,
        song_record.youtube_url,
        song_record.spotify_url,
        song_record.deezer_url
      )
      ON CONFLICT (title, artist) DO NOTHING;

      IF FOUND THEN
        inserted := inserted + 1;
      ELSE
        skipped := skipped + 1;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      errors := errors + 1;
      RAISE WARNING 'Error inserting song: % - %', song_record.title, SQLERRM;
    END;
  END LOOP;

  RETURN QUERY SELECT inserted, skipped, errors;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION hybrid_search_songs IS
  'Combines vector similarity search with full-text search for better results';

COMMENT ON FUNCTION search_songs_by_mood IS
  'Search songs by matching mood/emotion tags';

COMMENT ON FUNCTION get_similar_songs IS
  'Find similar songs based on vector similarity to a source song';

COMMENT ON FUNCTION get_song_statistics IS
  'Get comprehensive statistics about the song catalog';

COMMENT ON FUNCTION get_chat_statistics IS
  'Get analytics about chat sessions and usage';

COMMENT ON FUNCTION cleanup_old_anonymous_sessions IS
  'Delete anonymous chat sessions older than N days to save space';

COMMENT ON FUNCTION bulk_insert_songs IS
  'Bulk insert songs from JSON array with conflict handling';

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'Utility functions migration completed successfully!';
  RAISE NOTICE 'Search functions: hybrid_search_songs, search_songs_by_mood, get_similar_songs';
  RAISE NOTICE 'Analytics: get_song_statistics, get_chat_statistics';
  RAISE NOTICE 'Maintenance: cleanup_old_anonymous_sessions, bulk_insert_songs';
END $$;
