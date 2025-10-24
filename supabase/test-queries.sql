-- Karaoke AI - Test Queries
-- Use these queries to verify your database setup

-- ============================================================
-- BASIC SETUP VERIFICATION
-- ============================================================

-- 1. Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Expected: Should return 1 row with name 'vector'

-- 2. Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: songs, song_embeddings, users, chat_sessions, chat_messages

-- 3. Check if indexes exist
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: Multiple indexes including HNSW index on song_embeddings

-- 4. Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: All tables should have rowsecurity = true

-- ============================================================
-- SAMPLE DATA QUERIES
-- ============================================================

-- 5. Count songs by language
SELECT language, COUNT(*) as count
FROM songs
GROUP BY language
ORDER BY count DESC;

-- 6. Count songs by genre
SELECT genre, COUNT(*) as count
FROM songs
GROUP BY genre
ORDER BY count DESC;

-- 7. View sample songs
SELECT
  id,
  title,
  artist,
  genre,
  language,
  difficulty,
  youtube_url
FROM songs
LIMIT 10;

-- 8. Check songs with embeddings
SELECT
  COUNT(DISTINCT s.id) as total_songs,
  COUNT(DISTINCT se.song_id) as songs_with_embeddings,
  ROUND(
    COUNT(DISTINCT se.song_id)::NUMERIC / NULLIF(COUNT(DISTINCT s.id), 0) * 100,
    2
  ) as percentage_with_embeddings
FROM songs s
LEFT JOIN song_embeddings se ON se.song_id = s.id;

-- ============================================================
-- FULL-TEXT SEARCH TESTS
-- ============================================================

-- 9. Search songs by text (example: search for "love")
SELECT
  title,
  artist,
  genre,
  ts_rank(
    to_tsvector('english', title || ' ' || artist || ' ' || genre),
    plainto_tsquery('english', 'love')
  ) as rank
FROM songs
WHERE to_tsvector('english', title || ' ' || artist || ' ' || genre)
  @@ plainto_tsquery('english', 'love')
ORDER BY rank DESC
LIMIT 10;

-- 10. Search Thai songs
SELECT
  title,
  artist,
  genre,
  language,
  tags
FROM songs
WHERE language = 'Thai'
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- VECTOR SEARCH TESTS
-- ============================================================

-- 11. Test vector similarity function (requires embeddings)
-- Note: Replace the zeros with actual embedding values
SELECT * FROM search_similar_songs(
  query_embedding := ARRAY[0,0,0]::vector(384),  -- Replace with real embedding
  match_threshold := 0.5,
  match_count := 5
);

-- 12. Get similar songs to a specific song (after you have embeddings)
-- Replace 'SONG_ID_HERE' with an actual song ID
/*
SELECT * FROM get_similar_songs(
  source_song_id := 'SONG_ID_HERE'::UUID,
  match_count := 5
);
*/

-- ============================================================
-- TAG-BASED SEARCH TESTS
-- ============================================================

-- 13. Search songs by mood tags
SELECT * FROM search_songs_by_mood(
  mood_tags := ARRAY['sad', 'love'],
  match_count := 10
);

-- 14. Find upbeat/energetic songs
SELECT * FROM search_songs_by_mood(
  mood_tags := ARRAY['upbeat', 'energetic', 'happy', 'dance'],
  match_count := 10
);

-- ============================================================
-- STATISTICS TESTS
-- ============================================================

-- 15. Get comprehensive song statistics
SELECT * FROM get_song_statistics();

-- 16. Get chat statistics (if you have chat data)
SELECT * FROM get_chat_statistics(days_back := 30);

-- ============================================================
-- CHAT SESSION TESTS
-- ============================================================

-- 17. Create a test anonymous chat session
INSERT INTO chat_sessions (is_anonymous, session_name)
VALUES (true, 'Test Session')
RETURNING *;

-- 18. View all chat sessions
SELECT
  id,
  user_id,
  is_anonymous,
  session_name,
  created_at,
  last_activity_at
FROM chat_sessions
ORDER BY created_at DESC
LIMIT 10;

-- 19. View chat messages with session info
SELECT
  cs.session_name,
  cm.role,
  LEFT(cm.content, 50) as content_preview,
  cm.ai_provider,
  cm.created_at
FROM chat_messages cm
JOIN chat_sessions cs ON cs.id = cm.session_id
ORDER BY cm.created_at DESC
LIMIT 20;

-- ============================================================
-- BULK INSERT TEST
-- ============================================================

-- 20. Test bulk insert (example with 2 songs)
SELECT * FROM bulk_insert_songs('[
  {
    "title": "Test Song 1",
    "artist": "Test Artist",
    "genre": "Pop",
    "year": 2024,
    "language": "English",
    "tags": ["test", "pop"]
  },
  {
    "title": "Test Song 2",
    "artist": "Test Artist",
    "genre": "Rock",
    "year": 2024,
    "language": "English",
    "tags": ["test", "rock"]
  }
]'::jsonb);

-- Clean up test songs
DELETE FROM songs WHERE artist = 'Test Artist';

-- ============================================================
-- PERFORMANCE TESTS
-- ============================================================

-- 21. Check HNSW index usage (requires EXPLAIN ANALYZE)
-- Uncomment to test (requires actual embedding)
/*
EXPLAIN ANALYZE
SELECT
  s.title,
  s.artist,
  1 - (se.embedding <=> '[0,0,0,...]'::vector(384)) as similarity
FROM song_embeddings se
JOIN songs s ON s.id = se.song_id
ORDER BY se.embedding <=> '[0,0,0,...]'::vector(384)
LIMIT 10;
*/

-- 22. Check index sizes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================
-- CLEANUP TESTS
-- ============================================================

-- 23. Clean up old anonymous sessions (dry run - just count)
SELECT COUNT(*)
FROM chat_sessions
WHERE
  is_anonymous = true
  AND last_activity_at < NOW() - INTERVAL '7 days';

-- 24. Run cleanup (uncomment to execute)
/*
SELECT cleanup_old_anonymous_sessions(days_old := 7);
*/

-- ============================================================
-- DATA QUALITY CHECKS
-- ============================================================

-- 25. Find songs without YouTube URLs
SELECT COUNT(*) as songs_without_youtube
FROM songs
WHERE youtube_url IS NULL;

-- 26. Find songs without lyrics
SELECT COUNT(*) as songs_without_lyrics
FROM songs
WHERE lyrics_snippet IS NULL;

-- 27. Find duplicate songs (same title and artist)
SELECT title, artist, COUNT(*) as count
FROM songs
GROUP BY title, artist
HAVING COUNT(*) > 1;

-- 28. Check for invalid data
SELECT
  COUNT(*) FILTER (WHERE year < 1900 OR year > 2100) as invalid_years,
  COUNT(*) FILTER (WHERE tempo < 40 OR tempo > 200) as invalid_tempos,
  COUNT(*) FILTER (WHERE LENGTH(lyrics_snippet) > 150) as lyrics_too_long,
  COUNT(*) FILTER (WHERE language NOT IN ('Thai', 'English', 'Korean', 'Japanese', 'Chinese')) as invalid_languages
FROM songs;

-- ============================================================
-- ADVANCED QUERIES
-- ============================================================

-- 29. Get top 10 most common tags
SELECT tag, COUNT(*) as frequency
FROM songs, unnest(tags) as tag
GROUP BY tag
ORDER BY frequency DESC
LIMIT 10;

-- 30. Songs by decade
SELECT
  FLOOR(year / 10) * 10 as decade,
  COUNT(*) as song_count
FROM songs
WHERE year IS NOT NULL
GROUP BY decade
ORDER BY decade DESC;

-- ============================================================
-- MONITORING QUERIES
-- ============================================================

-- 31. Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 32. Recent activity
SELECT
  'songs' as table_name,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d,
  COUNT(*) as total
FROM songs
UNION ALL
SELECT
  'chat_sessions',
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
  COUNT(*)
FROM chat_sessions
UNION ALL
SELECT
  'chat_messages',
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
  COUNT(*)
FROM chat_messages;

-- ============================================================
-- COMPLETION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test queries loaded successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Run these queries to verify your setup:';
  RAISE NOTICE '  1-4:   Basic setup verification';
  RAISE NOTICE '  5-8:   Sample data queries';
  RAISE NOTICE '  9-14:  Search tests';
  RAISE NOTICE '  15-16: Statistics';
  RAISE NOTICE '  25-28: Data quality checks';
  RAISE NOTICE '  31-32: Monitoring';
END $$;
