# Vibe-Song 🎵

> Discover music that matches your vibe

**Status**: ✅ Setup Complete - Ready for MVP Implementation

## Overview

Vibe-Song is a music recommendation system that helps users discover songs based on their current mood, preferences, and context. Instead of searching through endless playlists, let Vibe-Song understand your vibe and suggest the perfect tracks.

## Project Status

Project setup is complete! The Next.js + Supabase foundation is ready, and we're now moving into MVP feature implementation.

### Current Phase: Project Setup Complete ✅

**Phase 1: Foundation** - ✅ Complete
- ✅ Research completed on development methodologies
- ✅ Project structure established
- ✅ Development workflow defined
- ✅ Tech stack selected and documented
- ✅ Architecture designed
- ✅ Data models defined

**Phase 2: MVP Specifications** - ✅ Complete
- ✅ Mood Input Interface specification
- ✅ Music Recommendation Engine specification
- ✅ Audio Player specification
- ✅ User Preferences & Authentication specification
- ✅ MVP Features summary document

**Phase 3: Technical Plans** - ✅ Complete
- ✅ Mood Input Interface technical plan (3-4 days)
- ✅ Music Recommendation Engine technical plan (4-5 days)
- ✅ Audio Player technical plan (4-5 days)
- ✅ User Preferences technical plan (5-6 days)

**Phase 4: Project Setup** - ✅ Complete
- ✅ Next.js 14+ with TypeScript and Tailwind CSS
- ✅ Supabase authentication and database client
- ✅ shadcn/ui components (Button, Card, Slider, Dialog, etc.)
- ✅ Zustand stores (mood, player, auth)
- ✅ Database schema with RLS policies
- ✅ TypeScript types and constants
- ✅ Environment configuration

**Next Phase: MVP Implementation**
- ⏳ Implement mood input interface (3-4 days)
- ⏳ Implement recommendation engine (4-5 days)
- ⏳ Implement audio player (4-5 days)
- ⏳ Implement user preferences (5-6 days)
- ⏳ Integration testing and MVP launch

## Development Approach

This project uses a hybrid methodology combining best practices from:
- **Spec-Kit**: Specification-driven development
- **BMAD Method**: Agile AI-driven development concepts
- **Context Engineering**: High-quality context for AI assistance
- **OpenSpec**: Intent-locking and specification tracking

See [RESEARCH_ANALYSIS.md](./RESEARCH_ANALYSIS.md) for detailed methodology documentation (in Thai).

## Project Structure

```
vibe-song/
├── .claude/              # AI assistant configuration
│   ├── CLAUDE.md         # Project constitution and rules
│   ├── commands/         # Custom commands
│   └── examples/         # Code and test examples
├── docs/                 # Documentation
│   ├── PRPs/            # Product Requirements Prompts
│   ├── architecture/    # Architecture documentation
│   └── guides/          # Development guides
├── openspec/            # Specifications
│   ├── specs/          # Current specifications (source of truth)
│   └── changes/        # Proposed specification changes
├── src/                 # Source code
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   │   └── ui/        # shadcn/ui components
│   ├── lib/           # Utilities and configurations
│   │   └── supabase/  # Supabase client setup
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript types
│   └── services/      # API services
├── supabase/           # Supabase configuration
│   └── migrations/    # Database migrations
└── tests/             # Tests
```

## Development Workflow

### For New Features

1. **Specify**: Use `/specify [feature-name]` to create detailed specification
2. **Plan**: Use `/plan [feature-name]` to create technical implementation plan
3. **Implement**: Use `/implement [feature-name]` to develop the feature
4. **Review**: Verify implementation meets specifications
5. **Archive**: Move specs from changes to current truth

### Key Principles

- **Specification First**: Always define what before how
- **Context Rich**: Maintain examples and documentation
- **Consistent Quality**: Follow project constitution
- **Iterative**: Build incrementally, learn continuously

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier)
- A Last.fm API account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arnutt-N/vibe-song.git
   cd vibe-song
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then fill in your Supabase and Last.fm credentials in `.env.local`

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration in `supabase/migrations/20251022000000_initial_schema.sql`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Usage

The MVP is currently under development. Once implemented, you'll be able to:
- Select your current mood using emoji and sliders
- Get personalized music recommendations
- Play 30-second previews of tracks
- Save favorite tracks and build listening history

## Documentation

### Product & Planning
- **Initial Vision**: [docs/PRPs/001-initial-vision.md](./docs/PRPs/001-initial-vision.md)
- **MVP Features Summary**: [docs/PRPs/002-mvp-features.md](./docs/PRPs/002-mvp-features.md)
- **Development Methodology**: [RESEARCH_ANALYSIS.md](./RESEARCH_ANALYSIS.md) (Thai)
- **Project Constitution**: [.claude/CLAUDE.md](./.claude/CLAUDE.md)

### Feature Specifications & Plans
- **Mood Input Interface**: [Spec](./openspec/changes/mood-input-interface.md) • [Plan](./docs/PRPs/mood-input-interface-plan.md)
- **Music Recommendation Engine**: [Spec](./openspec/changes/music-recommendation-engine.md) • [Plan](./docs/PRPs/music-recommendation-engine-plan.md)
- **Audio Player**: [Spec](./openspec/changes/audio-player.md) • [Plan](./docs/PRPs/audio-player-plan.md)
- **User Preferences & Auth**: [Spec](./openspec/changes/user-preferences.md) • [Plan](./docs/PRPs/user-preferences-plan.md)

### Architecture
- **Tech Stack**: [docs/architecture/tech-stack.md](./docs/architecture/tech-stack.md)
- **System Design**: [docs/architecture/system-design.md](./docs/architecture/system-design.md)
- **Data Models**: [docs/architecture/data-models.md](./docs/architecture/data-models.md)

### Guides
- **Development Workflow**: [docs/guides/development-workflow.md](./docs/guides/development-workflow.md)

## Contributing

This project is in early development. Contribution guidelines will be established as the project matures.

## Tech Stack

**Frontend**: Next.js 14+ • React 18+ • TypeScript • Tailwind CSS • shadcn/ui

**Backend**: Next.js API Routes • Supabase (PostgreSQL + Auth)

**External APIs**: Deezer API (music) • Last.fm API (tags/metadata)

**Hosting**: Vercel (app) • Supabase Cloud (database)

**Cost**: 100% Free (using free tiers)

See [tech-stack.md](./docs/architecture/tech-stack.md) for details.

---

## Roadmap

### Phase 1: Foundation ✅ Complete
- [x] Research and methodology selection
- [x] Project structure setup
- [x] Tech stack selection
- [x] Architecture design
- [x] Data models definition

### Phase 2: Specifications ✅ Complete
- [x] Mood Input Interface specification
- [x] Music Recommendation Engine specification
- [x] Audio Player specification
- [x] User Preferences & Authentication specification
- [x] MVP features summary

### Phase 3: Technical Plans ✅ Complete
- [x] Mood Input Interface technical plan
- [x] Music Recommendation Engine technical plan
- [x] Audio Player technical plan
- [x] User Preferences technical plan

### Phase 4: Project Setup ✅ Complete
- [x] Next.js 14+ with TypeScript and Tailwind CSS
- [x] Supabase authentication and database client
- [x] shadcn/ui components
- [x] Zustand stores
- [x] Database schema with RLS policies
- [x] TypeScript types and constants

### Phase 5: MVP Implementation (Next)
- [ ] Implement mood input interface (3-4 days)
- [ ] Implement recommendation engine (4-5 days)
- [ ] Implement audio player (4-5 days)
- [ ] Implement user preferences (5-6 days)
- [ ] Integration testing
- [ ] MVP launch

### Phase 6: Enhancement
- [ ] Learning and improvement
- [ ] Playlist generation
- [ ] Enhanced mood input methods
- [ ] Performance optimization

### Phase 4: Growth
- [ ] Social features
- [ ] Multi-platform support
- [ ] Advanced analytics
- [ ] Third-party integrations

## License

TBD

## Contact

TBD

---

## MVP Features

Vibe-Song MVP consists of 4 core features:

1. **🎭 Mood Input Interface** - Express mood using emojis and sliders
2. **🎵 Music Recommendation Engine** - AI-powered mood-based recommendations
3. **▶️ Audio Player** - 30s preview playback with queue management
4. **👤 User Preferences** - Accounts, saved tracks, listening history

See [MVP Features Summary](./docs/PRPs/002-mvp-features.md) for complete details.

---

**Progress**:
1. ✅ Foundation research and setup - Complete
2. ✅ Tech stack decisions - Complete
3. ✅ Architecture documentation - Complete
4. ✅ MVP feature specifications - Complete (265+ pages)
5. ✅ Technical implementation plans - Complete (190+ pages)
6. ✅ Next.js + Supabase project setup - Complete
7. **Next**: Implement MVP features (estimated 16-20 days)

**Total Documentation**: 455+ pages
**Codebase**: Project foundation complete with 38 files, 9,400+ lines of configuration and infrastructure

**Last Updated**: 2025-10-22
