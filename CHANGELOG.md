# Changelog

All notable changes to the Vibe-Song project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-22 - MVP Release 🚀

### Overview
Complete MVP implementation with all 4 core features. Production-ready music recommendation application with mood-based discovery, audio playback, and user authentication.

### Added

#### Feature 1: Mood Input Interface
- **Emoji Selector** (`src/components/mood/emoji-selector.tsx`)
  - 8 mood options: Happy, Sad, Energetic, Calm, Anxious, Romantic, Angry, Nostalgic
  - Visual selection with descriptions
  - Integrated with Zustand mood store

- **Mood Sliders** (`src/components/mood/mood-sliders.tsx`)
  - Energy Level slider (1-10 scale)
  - Mood Valence slider (1-10 scale)
  - Dynamic labels that update with slider values

- **Find Music Button** (`src/components/mood/find-music-button.tsx`)
  - Triggers recommendation API
  - Saves mood session to database/localStorage
  - Loading state with spinner

- **Mood History** (`src/components/mood/mood-history.tsx`)
  - Shows 3 most recent mood selections
  - Click to reuse previous mood
  - localStorage persistence

- **Mood Input Interface** (`src/components/mood/mood-input-interface.tsx`)
  - Main composite component
  - Card-based responsive layout

- **Mood Service** (`src/services/mood-service.ts`)
  - Database persistence for authenticated users
  - localStorage fallback for anonymous users
  - Recent mood sessions retrieval

#### Feature 2: Music Recommendation Engine
- **Deezer API Service** (`src/services/deezer-service.ts`)
  - Search by genre with pagination
  - Search by query string
  - Multiple genre search
  - Popular tracks retrieval
  - Comprehensive error handling

- **Last.fm API Service** (`src/services/lastfm-service.ts`)
  - Track info and tags retrieval
  - Tag-based search
  - Tag matching algorithm
  - Similar tracks discovery

- **Recommendation Service** (`src/services/recommendation-service.ts`)
  - 4-factor scoring algorithm:
    - Popularity score (30%)
    - Mood match score (40%)
    - Tag match score (20%)
    - Recency score (10%)
  - Genre mapping for mood/energy levels
  - Tag recommendation logic
  - Randomization and diversity

- **API Routes** (`src/app/api/recommend/route.ts`)
  - POST endpoint for mood-based recommendations
  - GET endpoint for quick/genre recommendations
  - Zod schema validation
  - Comprehensive error handling

- **Track Card Component** (`src/components/recommendations/track-card.tsx`)
  - Album artwork display
  - Play button overlay
  - Track information (title, artist, album)
  - Duration formatting
  - Save/unsave functionality
  - More options menu

- **Recommendations List** (`src/components/recommendations/recommendations-list.tsx`)
  - Responsive grid layout
  - Loading and empty states
  - Integration with player queue
  - Play track handler

- **Recommendation Hooks** (`src/hooks/use-recommendations.ts`)
  - useRecommendations mutation
  - useQuickRecommendations query
  - React Query integration

#### Feature 3: Audio Player
- **Audio Player Hook** (`src/hooks/use-audio-player.ts`)
  - HTML5 Audio element management
  - Sync with Zustand PlayerStore
  - Event listeners (timeupdate, loadedmetadata, ended, error)
  - Auto-advance to next track
  - Playback state management

- **Keyboard Shortcuts Hook** (`src/hooks/use-keyboard-shortcuts.ts`)
  - Space: Play/Pause
  - Arrow Right: Next track
  - Arrow Left: Previous track
  - Arrow Up/Down: Volume control
  - M: Mute/Unmute
  - Input field detection (prevents conflicts)

- **Player Controls** (`src/components/player/player-controls.tsx`)
  - Play/Pause toggle button
  - Previous track button
  - Next track button
  - Disabled states for boundary tracks

- **Progress Bar** (`src/components/player/progress-bar.tsx`)
  - Visual progress indicator
  - Click-to-seek functionality
  - Current/total time display
  - Smooth animations

- **Volume Control** (`src/components/player/volume-control.tsx`)
  - Volume slider (0-100%)
  - Mute/unmute button with volume memory
  - Dynamic speaker icon states
  - Hidden on mobile devices

- **Audio Player Component** (`src/components/player/audio-player.tsx`)
  - Fixed bottom bar layout
  - Album artwork display
  - Track information
  - All playback controls
  - "30s Preview" badge
  - Backdrop blur effect

- **Client Layout** (`src/components/layout/client-layout.tsx`)
  - Wraps page content with padding for fixed player
  - Renders AudioPlayer at bottom

#### Feature 4: User Preferences & Authentication
- **Authentication Hook** (`src/hooks/use-auth.ts`)
  - Initialize auth state from Supabase
  - Listen to auth state changes
  - signUp method (email/password)
  - signIn method (email/password)
  - signInWithOAuth (Google, GitHub)
  - signOut method
  - resetPassword method

- **Auth Modal** (`src/components/auth/auth-modal.tsx`)
  - Dialog wrapper for auth forms
  - Toggle between login/signup views
  - Responsive design

- **Sign Up Form** (`src/components/auth/sign-up-form.tsx`)
  - Email/password registration
  - Password confirmation validation
  - OAuth buttons (Google, GitHub)
  - Error handling with toasts
  - Switch to login link

- **Login Form** (`src/components/auth/login-form.tsx`)
  - Email/password sign in
  - OAuth integration
  - Error handling
  - Switch to signup link

- **User Button** (`src/components/auth/user-button.tsx`)
  - "Sign In" button for anonymous users
  - Dropdown menu for authenticated users
  - Profile display (name, email)
  - Menu items: Saved Tracks, History, Sign Out

- **Dropdown Menu UI** (`src/components/ui/dropdown-menu.tsx`)
  - Full Radix UI dropdown implementation
  - All primitives: Menu, Item, Label, Separator, etc.
  - Accessible keyboard navigation

- **Header Component** (`src/components/layout/header.tsx`)
  - Sticky header with backdrop blur
  - Vibe-Song logo with Music icon
  - UserButton placement
  - Responsive layout

- **Saved Tracks Service** (`src/services/saved-tracks-service.ts`)
  - Save track to Supabase
  - Unsave track
  - Check if track is saved
  - Get all saved tracks
  - Get saved track IDs as Set

- **Listening History Service** (`src/services/listening-history-service.ts`)
  - Add track to history with mood context
  - Get full listening history
  - Get recently played (deduplicated)
  - Clear history

- **Saved Tracks Hooks** (`src/hooks/use-saved-tracks.ts`)
  - useSavedTracks query
  - useSavedTrackIds query
  - useSaveTrack mutation with auto-invalidation

#### Integration & Layout
- **Home Page** (`src/app/page.tsx`)
  - Client component with mood state
  - MoodInputInterface integration
  - RecommendationsList display
  - API call handling
  - Loading and error states

- **Layout Components** (`src/components/layout/`)
  - Header with authentication
  - ClientLayout with player space
  - Export barrel file

### Changed
- Updated `src/app/page.tsx` from server to client component
- Enhanced `track-card.tsx` with save/unsave functionality
- Updated `recommendations-list.tsx` to integrate with player queue

### Dependencies
- Added `@radix-ui/react-dropdown-menu@2.0.6` for user menu

### Technical Achievements
- TypeScript compilation: 0 errors
- Total files created: 48
- Total lines of feature code: 2,880+
- All 4 MVP features integrated and working together
- Progressive enhancement (anonymous → authenticated users)
- Full keyboard accessibility
- Responsive design for all screen sizes

---

## [0.0.2] - 2025-10-22 - Project Setup

### Added

#### Next.js Foundation
- Next.js 14+ with App Router
- TypeScript configuration
- Tailwind CSS setup
- ESLint and Prettier configuration

#### Supabase Integration
- Supabase client setup (`src/lib/supabase/client.ts`, `server.ts`)
- Database schema with migrations (`supabase/migrations/20251022000000_initial_schema.sql`)
- Row Level Security (RLS) policies for:
  - `mood_sessions` table
  - `saved_tracks` table
  - `listening_history` table
- Auth configuration

#### shadcn/ui Components
- Button component with variants
- Card component (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Slider component (dual-thumb support)
- Dialog component (full modal system)
- Label component
- Input component
- Toast/Sonner integration

#### State Management
- Zustand mood store (`src/store/mood-store.ts`)
- Zustand player store (`src/store/player-store.ts`)
- Zustand auth store (`src/store/auth-store.ts`)

#### TypeScript Types
- Comprehensive type definitions (`src/types/index.ts`):
  - Mood types (MoodEmoji, MoodData)
  - Music types (Track, Genre, etc.)
  - User types
  - Supabase database types
  - Deezer API types
  - Last.fm API types

#### Constants & Configuration
- Mood emoji definitions (`src/lib/constants/moods.ts`)
- Genre definitions (`src/lib/constants/genres.ts`)
- Utility functions (`src/lib/utils.ts`)

#### Infrastructure
- Environment variables configuration (`.env.example`)
- Git setup with proper `.gitignore`
- Package.json with all dependencies
- TypeScript strict mode enabled
- Code quality tools configured

### Technical Details
- Total files: 38
- Total lines: 9,400+
- All TypeScript compilation passing
- Database migrations ready to run
- Environment setup documented

---

## [0.0.1] - 2025-10-21 - Planning & Specifications

### Added

#### Documentation
- **Product Requirements** (265+ pages)
  - Mood Input Interface specification
  - Music Recommendation Engine specification
  - Audio Player specification
  - User Preferences & Authentication specification
  - MVP Features summary

- **Technical Plans** (190+ pages)
  - Mood Input Interface implementation plan
  - Music Recommendation Engine implementation plan
  - Audio Player implementation plan
  - User Preferences implementation plan

- **Architecture**
  - Tech stack decisions (`docs/architecture/tech-stack.md`)
  - System design (`docs/architecture/system-design.md`)
  - Data models (`docs/architecture/data-models.md`)

- **Research**
  - Development methodology research (`RESEARCH_ANALYSIS.md`)
  - Comparison of Spec-Kit, BMAD, Context Engineering, OpenSpec
  - Selected hybrid approach

#### Project Structure
- `.claude/` directory with project constitution
- `docs/` directory with PRPs and architecture
- `openspec/` directory for specifications
- Development workflow guides

### Decisions
- **Tech Stack**: Next.js + Supabase + shadcn/ui
- **State Management**: Zustand
- **APIs**: Deezer (music), Last.fm (metadata)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (app), Supabase Cloud (database)
- **Cost**: 100% Free tier

---

## Future Enhancements

### Planned for v0.2.0
- Playlist generation feature
- Enhanced mood input methods (camera, voice, text)
- Learning and recommendation improvement
- Performance optimization
- Advanced analytics

### Planned for v0.3.0
- Social features (share moods, playlists)
- Multi-platform support
- Third-party integrations
- Mobile app versions

---

**Convention**: [Version] - Date - Title
- **Version**: Semantic versioning (MAJOR.MINOR.PATCH)
- **Date**: YYYY-MM-DD format
- **Title**: Brief description of release
