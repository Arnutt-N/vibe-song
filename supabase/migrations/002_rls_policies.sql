-- Karaoke AI - Row Level Security (RLS) Policies
-- Migration: 002_rls_policies
-- Description: Enable RLS and create security policies for all tables

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SONGS TABLE POLICIES
-- ============================================================

-- Public read access to all songs
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT
  USING (true);

-- Only authenticated admins can insert songs
CREATE POLICY "Only admins can insert songs"
  ON songs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.preferences->>'is_admin' = 'true'
    )
  );

-- Only authenticated admins can update songs
CREATE POLICY "Only admins can update songs"
  ON songs FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.preferences->>'is_admin' = 'true'
    )
  );

-- Only authenticated admins can delete songs
CREATE POLICY "Only admins can delete songs"
  ON songs FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.preferences->>'is_admin' = 'true'
    )
  );

-- ============================================================
-- SONG EMBEDDINGS TABLE POLICIES
-- ============================================================

-- Public read access to embeddings (needed for search)
CREATE POLICY "Embeddings are viewable by everyone"
  ON song_embeddings FOR SELECT
  USING (true);

-- Only service role can insert/update/delete embeddings
-- (These operations are done by backend scripts, not users)

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- New users can be created on signup
CREATE POLICY "Users can be created on signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- ============================================================
-- CHAT SESSIONS TABLE POLICIES
-- ============================================================

-- Anonymous users can create sessions
CREATE POLICY "Anyone can create chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (true);

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (
    -- Own authenticated sessions
    (auth.uid() IS NOT NULL AND user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ))
    OR
    -- Anonymous sessions (no user_id or is_anonymous = true)
    (user_id IS NULL OR is_anonymous = true)
  );

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    ))
    OR
    (user_id IS NULL OR is_anonymous = true)
  );

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON chat_sessions FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- ============================================================
-- CHAT MESSAGES TABLE POLICIES
-- ============================================================

-- Users can insert messages to their own sessions
CREATE POLICY "Users can insert messages to own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = session_id
      AND (
        -- Own authenticated sessions
        (auth.uid() IS NOT NULL AND cs.user_id IN (
          SELECT id FROM users WHERE auth_id = auth.uid()
        ))
        OR
        -- Anonymous sessions
        (cs.user_id IS NULL OR cs.is_anonymous = true)
      )
    )
  );

-- Users can view messages from their own sessions
CREATE POLICY "Users can view messages from own sessions"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions cs
      WHERE cs.id = session_id
      AND (
        -- Own authenticated sessions
        (auth.uid() IS NOT NULL AND cs.user_id IN (
          SELECT id FROM users WHERE auth_id = auth.uid()
        ))
        OR
        -- Anonymous sessions
        (cs.user_id IS NULL OR cs.is_anonymous = true)
      )
    )
  );

-- Messages cannot be updated or deleted (immutable chat history)
-- If needed, can add policies for admins only

-- ============================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.preferences->>'is_admin' = 'true'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a session
CREATE OR REPLACE FUNCTION owns_session(session_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM chat_sessions cs
    JOIN users u ON u.id = cs.user_id
    WHERE cs.id = session_uuid
    AND u.auth_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT SELECT ON songs TO anon, authenticated;
GRANT SELECT ON song_embeddings TO anon, authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON chat_sessions TO anon, authenticated;
GRANT ALL ON chat_messages TO anon, authenticated;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON POLICY "Songs are viewable by everyone" ON songs IS
  'All songs are publicly readable for search and display';

COMMENT ON POLICY "Users can view own profile" ON users IS
  'Users can only see their own profile data';

COMMENT ON POLICY "Anyone can create chat sessions" ON chat_sessions IS
  'Anonymous and authenticated users can create chat sessions';

COMMENT ON POLICY "Users can insert messages to own sessions" ON chat_messages IS
  'Users can only add messages to sessions they own or anonymous sessions';

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies migration completed successfully!';
  RAISE NOTICE 'All tables now have Row Level Security enabled';
  RAISE NOTICE 'Public read access: songs, song_embeddings';
  RAISE NOTICE 'User-scoped access: users, chat_sessions, chat_messages';
  RAISE NOTICE 'Admin-only write: songs';
END $$;
