# Supabase Database Setup

This directory contains the database schema and migrations for Vibe-Song.

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `migrations/20251022000000_initial_schema.sql`
4. Run the migration

### Option 2: Using Supabase CLI (Recommended for Development)

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations to your remote database
supabase db push

# Or start a local Supabase instance
supabase start

# Apply migrations to local instance
supabase db reset
```

## Database Schema

The schema includes the following tables:

### user_profiles
Stores user profile information including anonymous users.

### user_preferences
Stores user music preferences (genres, language, explicit content settings).

### listening_history
Tracks all songs played by users with mood context.

### mood_sessions
Records mood input sessions for analytics and personalization.

### saved_tracks
Stores user's saved/favorited tracks.

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Anonymous users are treated the same as authenticated users
- Proper isolation between user data

## Automatic Triggers

- **handle_new_user**: Automatically creates user profile and preferences when a new user signs up
- **update_updated_at_column**: Automatically updates the `updated_at` timestamp on profile/preferences changes

## Environment Setup

Make sure you have the following environment variables set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from: https://app.supabase.com/project/_/settings/api
