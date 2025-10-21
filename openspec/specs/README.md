# Specifications

This directory contains the **current truth** - approved specifications that represent the project's actual state and intent.

## Purpose

Specifications in this directory are:
- ✅ Reviewed and approved
- ✅ The source of truth for implementation
- ✅ Used as context for AI assistants
- ✅ Reference for what features should do

## Delta Format

Specifications use the Delta Format to track evolution:

```markdown
ADDED:
- New requirements or scenarios

MODIFIED:
- Changes to existing requirements

REMOVED:
- Removed requirements or scenarios
```

When a specification from `openspec/changes/` is approved and implemented, it moves here with delta markers removed (it becomes the new truth).

## File Naming

Use descriptive, kebab-case names:
- `mood-input-interface.md`
- `music-recommendation-engine.md`
- `user-preference-storage.md`

## Spec Template

See `.claude/commands/specify.md` for the specification template.

Each spec should include:
- Overview
- User Need
- Requirements (Functional & Non-functional)
- User Scenarios
- Success Criteria
- Out of Scope
- Dependencies
- Open Questions (before approval)

## Workflow

```
1. Create spec in openspec/changes/
2. Review and refine
3. Approve
4. Implement
5. Move to openspec/specs/ (remove delta markers)
```

## Current Specifications

None yet - project is in initial setup phase.

## Next Steps

1. Answer questions in `docs/PRPs/001-initial-vision.md`
2. Create specifications for MVP features using `/specify`
3. Review and approve specifications
4. Begin implementation

---

**Status**: Empty - Awaiting feature specifications
**Last Updated**: 2025-10-21
