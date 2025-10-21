# Product Requirements Prompt: Vibe-Song Initial Vision

## Document Information
- **Created**: 2025-10-21
- **Updated**: 2025-10-21
- **Status**: Decisions Made
- **Version**: 2.0

## Project Vision

**Vibe-Song** is a music/song recommendation system that helps users discover music based on their mood, preferences, and context.

## Problem Statement

Users often struggle to find the right music for their current mood or activity. Generic playlists don't account for individual emotional states, and searching through vast music libraries is time-consuming and frustrating.

## Solution Overview

Vibe-Song provides intelligent music recommendations by:
1. Understanding user's current mood/vibe
2. Analyzing listening history and preferences
3. Considering contextual factors (time of day, activity, etc.)
4. Delivering personalized song suggestions

## Target Users

### Primary Users
- Music enthusiasts who want mood-based recommendations
- People looking to discover new music aligned with their current state
- Users tired of manual playlist creation

### User Needs
- Quick access to mood-appropriate music
- Discovery of new songs matching their taste
- Seamless listening experience
- Privacy and data control

## Core Features (High-Level)

### Must Have (MVP)
1. **Mood Input**: Users can express their current mood/vibe
2. **Music Recommendation**: System suggests songs based on input
3. **Playback Interface**: Users can play recommended songs
4. **Basic Preferences**: Save user music preferences

### Should Have (Post-MVP)
1. **Learning System**: Improve recommendations based on feedback
2. **Playlist Generation**: Create full playlists from mood
3. **Social Features**: Share vibes and playlists
4. **Multi-platform**: Web, mobile, desktop

### Could Have (Future)
1. **Activity-Based**: Recommend music for specific activities
2. **Mood Tracking**: Track mood patterns over time
3. **Integration**: Spotify, Apple Music, etc. integration
4. **AI Chat**: Conversational interface for music discovery

## Success Metrics

### User Engagement
- Daily active users
- Session length
- Recommendation acceptance rate

### Quality
- User satisfaction rating
- Recommendation relevance score
- Repeat usage rate

### Technical
- Response time < 2s
- System uptime > 99%
- Successful recommendations > 80%

## Constraints

### Technical
- Must work on modern web browsers
- Should be responsive (mobile-friendly)
- Performance must be acceptable on slow connections

### Business
- Initial version should be cost-effective to run
- Must respect music licensing and copyright
- Privacy-first approach

### Timeline
- MVP should be achievable in reasonable timeframe
- Iterative development approach

## Out of Scope (for MVP)

- Music streaming infrastructure (use existing APIs)
- Music creation/editing features
- Social network features
- Mobile native apps (web-first)
- Offline playback

## Decisions Made ✅

### 1. **Music Source** - DECIDED
**Primary**: Deezer API
- 100% free, no API key required
- 90+ million tracks
- 30-second preview playback
- Rich metadata and search

**Secondary**: Last.fm API
- Free API (requires key)
- Mood tags and genre classification
- Similar track recommendations
- Enhance metadata with tags

**Optional**: Jamendo API (future)
- Creative Commons music
- Full-length playback
- Free and legal

### 2. **Mood Input Method** - DECIDED
**Combination Approach**:
- **Primary**: Emoji Selection (😊 😢 😌 🔥 💭)
- **Secondary**: Sliders (Energy Level, Mood Valence)
- **Optional**: Text Input (future enhancement)

### 3. **Tech Stack** - DECIDED

**Frontend**:
- Next.js 14+ (App Router)
- React 18+
- Tailwind CSS
- shadcn/ui
- TypeScript
- Zustand (client state)
- TanStack Query (server state)

**Backend**:
- Next.js API Routes
- Supabase (PostgreSQL + Auth + Storage)
- Node.js 18+

**Hosting**:
- Vercel (Frontend + API)
- Supabase Cloud (Database)

**Cost**: 100% Free (using free tiers)

See [tech-stack.md](../architecture/tech-stack.md) for details.

### 4. **Recommendation Engine** - DECIDED
**Hybrid Approach**:

**Phase 1 (MVP)**:
```
User Mood → Mood Mapping → Deezer Search → Last.fm Tags → Score & Rank
```

- Map mood/emoji to keywords and genres
- Search Deezer API with mood-specific parameters
- Enhance results with Last.fm tags
- Score and rank based on relevance
- Personalize using listening history (Supabase)

**Phase 2 (Future)**:
- Machine Learning model
- Collaborative filtering
- Advanced personalization

### 5. **User Authentication** - DECIDED
**Progressive Enhancement** (Supabase Auth):

**Phase 1**:
- Anonymous users (localStorage + temp sessions)
- Email/Password authentication

**Phase 2**:
- Google OAuth
- GitHub OAuth (optional)

**Features**:
- Row Level Security (RLS)
- Secure by default
- Easy migration from anonymous to authenticated

## Next Steps

1. ✅ **Decision Making**: Completed - All questions answered
2. ✅ **Tech Stack Selection**: Completed - See [tech-stack.md](../architecture/tech-stack.md)
3. 🔄 **Architecture Design**: In Progress - Create system architecture document
4. ⏳ **Data Models**: Define database schema
5. ⏳ **Feature Specification**: Create detailed specs for MVP features using `/specify`
6. ⏳ **Project Setup**: Initialize Next.js project
7. ⏳ **Supabase Setup**: Configure database and authentication
8. ⏳ **Development**: Begin MVP implementation

## Notes

This is a living document that will evolve as we learn more about user needs and technical constraints.

---

**To proceed**:
- ✅ Questions answered - See "Decisions Made" section above
- ✅ Tech stack documented - See [tech-stack.md](../architecture/tech-stack.md)
- Next: Use `/specify` to create detailed feature specifications
- Next: Use `/plan` to create technical implementation plans
- Next: Set up development environment
