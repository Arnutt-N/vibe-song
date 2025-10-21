# Vibe-Song 🎵

> Discover music that matches your vibe

**Status**: 🚧 In Development (Setup Phase)

## Overview

Vibe-Song is a music recommendation system that helps users discover songs based on their current mood, preferences, and context. Instead of searching through endless playlists, let Vibe-Song understand your vibe and suggest the perfect tracks.

## Project Status

This project is currently in the initial setup phase. We're establishing the development methodology and project structure.

### Current Phase: Foundation Complete ✅

**Completed**:
- ✅ Research completed on development methodologies
- ✅ Project structure established
- ✅ Development workflow defined
- ✅ Tech stack selected and documented
- ✅ Architecture designed
- ✅ Data models defined

**Next**:
- ⏳ MVP feature specifications
- ⏳ Project setup (Next.js + Supabase)
- ⏳ Initial implementation

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
└── tests/              # Tests
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

TBD - Will be defined based on chosen tech stack

### Installation

TBD - Will be provided once initial implementation begins

### Usage

TBD - Will be documented as features are implemented

## Documentation

### Product & Planning
- **Vision & Requirements**: [docs/PRPs/001-initial-vision.md](./docs/PRPs/001-initial-vision.md)
- **Development Methodology**: [RESEARCH_ANALYSIS.md](./RESEARCH_ANALYSIS.md) (Thai)
- **Project Constitution**: [.claude/CLAUDE.md](./.claude/CLAUDE.md)

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

### Phase 2: MVP Development
- [ ] Core feature specifications
- [ ] Basic mood input interface
- [ ] Music recommendation engine
- [ ] Playback integration
- [ ] User preference storage

### Phase 3: Enhancement
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

**Next Steps**:
1. ✅ ~~Answer open questions~~ - Completed
2. ✅ ~~Select tech stack~~ - Completed
3. ✅ ~~Create architecture documentation~~ - Completed
4. **Next**: Create MVP feature specifications using `/specify`
5. **Next**: Set up Next.js project
6. **Next**: Configure Supabase
7. **Next**: Begin development

**Last Updated**: 2025-10-21
