# Vibe-Song Project Constitution

This document defines the non-negotiable principles and guidelines for the Vibe-Song project.

## Project Vision
Vibe-Song is a music/song recommendation system that helps users discover music based on their mood and preferences.

## Core Principles

### 1. Code Quality
- All code must be readable and maintainable
- Follow consistent coding standards across the project
- Code should be self-documenting with clear variable and function names
- Comments should explain "why", not "what"

### 2. Testing Requirements
- All new features must include tests
- Aim for meaningful test coverage, not just high percentages
- Tests should be readable and serve as documentation
- Test files should follow examples in `.claude/examples/tests/`

### 3. Documentation
- Every public API must be documented
- README files should be kept up-to-date
- Architecture decisions should be documented in `docs/architecture/`
- User-facing features should have user documentation

### 4. Development Workflow
- Follow the Spec → Plan → Implement workflow
- All features must have a specification in `openspec/specs/` before implementation
- Technical plans should be created in `docs/PRPs/` before coding
- Use delta format for tracking changes in `openspec/changes/`

### 5. Git Practices
- Write clear, descriptive commit messages
- Commit related changes together
- Push to feature branches, not main
- Code review before merging

### 6. AI Assistant Guidelines
- When implementing features, always:
  1. Check `openspec/specs/` for current specifications
  2. Review `docs/PRPs/` for technical plans
  3. Follow patterns in `.claude/examples/`
  4. Adhere to project rules in this file

### 7. Code Style
- Use consistent indentation (to be defined based on chosen language)
- Maximum line length: 100 characters
- Prefer clarity over cleverness
- Follow language-specific best practices

### 8. Security
- Never commit secrets or API keys
- Validate all user inputs
- Follow security best practices for chosen tech stack
- Regular dependency updates for security patches

### 9. Performance
- Consider performance implications of design decisions
- Profile before optimizing
- Document performance-critical sections
- Set and track performance budgets

### 10. User Experience
- User experience is paramount
- Features should be intuitive
- Provide helpful error messages
- Consider accessibility from the start

## Tech Stack
To be determined and documented in `docs/architecture/tech-stack.md`

## Examples Location
Reference implementations can be found in:
- Code patterns: `.claude/examples/code/`
- Test patterns: `.claude/examples/tests/`
- Component patterns: `.claude/examples/components/`

## Review and Updates
This constitution should be reviewed and updated as the project evolves.
Changes to this document require careful consideration as they affect the entire project.

---
Last Updated: 2025-10-21
Version: 1.0
