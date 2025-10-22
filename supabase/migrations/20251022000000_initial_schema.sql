-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    favorite_genres TEXT[] DEFAULT '{}',
    excluded_genres TEXT[] DEFAULT '{}',
    language_preference TEXT,
    explicit_content BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create listening_history table
CREATE TABLE IF NOT EXISTS listening_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_cover TEXT,
    mood_emoji TEXT,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    mood_valence INTEGER CHECK (mood_valence >= 1 AND mood_valence <= 10),
    played_at TIMESTAMPTZ DEFAULT NOW(),
    listen_duration INTEGER DEFAULT 0
);

-- Create index on listening_history for faster queries
CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_history_played_at ON listening_history(played_at DESC);

-- Create mood_sessions table
CREATE TABLE IF NOT EXISTS mood_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    mood_emoji TEXT NOT NULL,
    energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
    mood_valence INTEGER NOT NULL CHECK (mood_valence >= 1 AND mood_valence <= 10),
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on mood_sessions
CREATE INDEX IF NOT EXISTS idx_mood_sessions_user_id ON mood_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_sessions_created_at ON mood_sessions(created_at DESC);

-- Create saved_tracks table
CREATE TABLE IF NOT EXISTS saved_tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    track_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_cover TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

-- Create index on saved_tracks
CREATE INDEX IF NOT EXISTS idx_saved_tracks_user_id ON saved_tracks(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE listening_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tracks ENABLE ROW LEVEL SECURITY;

-- user_profiles policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- user_preferences policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- listening_history policies
CREATE POLICY "Users can view their own listening history"
    ON listening_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listening history"
    ON listening_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listening history"
    ON listening_history FOR DELETE
    USING (auth.uid() = user_id);

-- mood_sessions policies
CREATE POLICY "Users can view their own mood sessions"
    ON mood_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood sessions"
    ON mood_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood sessions"
    ON mood_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- saved_tracks policies
CREATE POLICY "Users can view their own saved tracks"
    ON saved_tracks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved tracks"
    ON saved_tracks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved tracks"
    ON saved_tracks FOR DELETE
    USING (auth.uid() = user_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, is_anonymous)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN NEW.email IS NULL THEN true ELSE false END
    );

    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
