# Contributing to Vibe-Song

Thank you for your interest in contributing to Vibe-Song! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A Supabase account (for database features)
- A Last.fm API key (for music metadata)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibe-song.git
   cd vibe-song
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Arnutt-N/vibe-song.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Fill in your API credentials
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Development Workflow

This project follows a specification-driven development approach:

### 1. Specification First

Before implementing any feature:

1. **Check existing specs** in `openspec/specs/`
2. **Create or update specification** if needed
3. **Get feedback** on the spec before coding

### 2. Plan Before Code

1. **Review technical plans** in `docs/PRPs/`
2. **Create implementation plan** if it's a new feature
3. **Break down into tasks**

### 3. Implement

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write code following** project standards (see below)

3. **Test your changes** thoroughly

4. **Commit regularly** with clear messages

### 4. Review and Iterate

1. **Self-review** your code
2. **Run type checks**: `npm run type-check`
3. **Run linter**: `npm run lint`
4. **Test all features** affected by your changes

### 5. Submit

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

## Code Standards

### TypeScript

- **Use strict mode** (already configured)
- **Avoid `any` types** unless absolutely necessary
- **Define interfaces** for all data structures
- **Use type inference** where possible
- **Export types** that might be used elsewhere

Example:
```typescript
// Good
interface TrackCardProps {
  track: DeezerTrack
  onPlay?: (track: DeezerTrack) => void
  isPlaying?: boolean
}

export function TrackCard({ track, onPlay, isPlaying }: TrackCardProps) {
  // ...
}

// Bad
export function TrackCard(props: any) {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **Prefer composition** over prop drilling
- **Keep components focused** (single responsibility)
- **Use semantic HTML**
- **Make components accessible** (ARIA labels, keyboard navigation)

Example:
```typescript
// Good - focused, accessible component
export function PlayButton({ onClick, isPlaying }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isPlaying ? "Pause" : "Play"}
      className="..."
    >
      {isPlaying ? <Pause /> : <Play />}
    </button>
  )
}
```

### State Management

- **Use Zustand stores** for global state
- **Use React hooks** for component state
- **Use React Query** for server state
- **Keep state minimal** and derived values computed

### Styling

- **Use Tailwind CSS** utility classes
- **Follow shadcn/ui patterns** for components
- **Use `cn()` helper** for conditional classes
- **Prefer responsive design** (mobile-first)

Example:
```typescript
<div className={cn(
  "flex items-center gap-4",
  isActive && "bg-primary",
  className
)}>
```

### File Naming

- **Components**: PascalCase (`TrackCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`use-audio-player.ts`)
- **Services**: kebab-case with service suffix (`mood-service.ts`)
- **Types**: kebab-case (`index.ts` in types folder)
- **Constants**: kebab-case (`moods.ts`)

### Code Organization

```
src/
├── app/              # Next.js routes
├── components/       # React components
│   ├── mood/        # Feature-specific components
│   ├── player/      # Feature-specific components
│   └── ui/          # Reusable UI components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and config
├── services/        # API services
├── store/           # Zustand stores
└── types/           # TypeScript types
```

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Good commits
feat: add playlist generation feature
fix: resolve audio player skip issue on last track
docs: update API documentation for recommendation service
refactor: extract mood mapping logic into separate function

# Bad commits
update stuff
fix bug
changes
wip
```

### Commit Message Guidelines

- **Use imperative mood** ("add" not "added")
- **Keep subject line under 50 characters**
- **Capitalize subject line**
- **No period at the end of subject**
- **Separate subject from body** with blank line
- **Wrap body at 72 characters**
- **Explain what and why**, not how

## Pull Request Process

### Before Submitting

1. ✅ **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. ✅ **Run type check**
   ```bash
   npm run type-check
   ```

3. ✅ **Run linter**
   ```bash
   npm run lint
   ```

4. ✅ **Test your changes** manually

5. ✅ **Update documentation** if needed

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Changes Made
- Bullet point list of changes

## Testing
- How you tested these changes
- What scenarios you covered

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings
- [ ] TypeScript compilation passes
```

### Review Process

1. **Automated checks** will run (linting, type checking)
2. **Maintainers will review** your code
3. **Address feedback** if requested
4. **Once approved**, your PR will be merged

### After Your PR is Merged

1. **Delete your feature branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Sync your fork**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

## Project Structure

### Key Directories

- `.claude/` - AI assistant configuration and examples
- `docs/` - Project documentation
  - `PRPs/` - Product Requirements and technical plans
  - `architecture/` - Architecture documentation
  - `guides/` - Development guides
- `openspec/` - Feature specifications
- `src/` - Source code
- `supabase/` - Database migrations and configuration

### Important Files

- `.claude/CLAUDE.md` - **Project constitution** (read this!)
- `SETUP.md` - Development setup guide
- `CHANGELOG.md` - Version history
- `README.md` - Project overview

## Testing Guidelines

### Manual Testing

For now, the project relies on manual testing. When testing your changes:

1. **Test happy paths** - Normal user flows
2. **Test edge cases** - Empty states, errors, boundaries
3. **Test different screen sizes** - Mobile, tablet, desktop
4. **Test keyboard navigation** - All features should work without mouse
5. **Test authentication flows** - Both anonymous and authenticated
6. **Test error handling** - Network errors, API failures

### Future: Automated Testing

We plan to add automated tests in the future. If you'd like to contribute test infrastructure:

- Unit tests: Jest + React Testing Library
- E2E tests: Playwright or Cypress
- Check `.claude/examples/tests/` for patterns

## Areas to Contribute

### High Priority

- 🐛 **Bug fixes** - Check GitHub issues
- 📖 **Documentation** - Improve guides and examples
- ♿ **Accessibility** - Improve ARIA labels, keyboard navigation
- 🎨 **UI/UX improvements** - Better animations, transitions
- 🧪 **Testing** - Help set up test infrastructure

### Medium Priority

- ⚡ **Performance** - Optimize loading times, bundle size
- 📱 **Mobile experience** - Improve mobile UI
- 🌐 **Internationalization** - Add multi-language support
- 🔍 **Search functionality** - Add track search

### Future Enhancements

- 🎵 **Playlist generation** - Create playlists from moods
- 🤖 **ML improvements** - Better recommendation algorithm
- 👥 **Social features** - Share moods, playlists
- 📊 **Analytics** - User insights and statistics

## Getting Help

### Resources

- **Documentation**: Check `docs/` directory
- **Examples**: See `.claude/examples/`
- **Architecture**: Read `docs/architecture/`
- **Issues**: Browse GitHub issues

### Questions?

- **Check existing issues** first
- **Create a new issue** with "question" label
- **Be specific** about what you need help with

## Recognition

Contributors will be recognized in:
- README.md contributors section
- CHANGELOG.md for their contributions
- GitHub contributors page

## License

By contributing to Vibe-Song, you agree that your contributions will be licensed under the same license as the project (TBD).

---

## Thank You!

Your contributions make Vibe-Song better for everyone. Whether it's a bug fix, new feature, or documentation improvement - every contribution is valuable and appreciated! 🎵✨

Happy coding! 🚀
