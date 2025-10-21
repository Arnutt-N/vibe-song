# Development Workflow Guide

## Overview

This guide explains the development workflow for Vibe-Song, combining Spec-Driven Development with Context Engineering principles.

## Workflow Phases

### 1. Specify Phase

**Goal**: Define what to build and why

**Process**:
1. Run `/specify [feature-name]` command
2. AI assistant creates initial specification
3. Review and refine the specification
4. Approve specification

**Output**: `openspec/changes/[feature-name].md`

**Checklist**:
- [ ] Feature purpose is clear
- [ ] User needs are identified
- [ ] Requirements are specific and testable
- [ ] User scenarios cover main use cases
- [ ] Success criteria are measurable
- [ ] Out of scope is defined
- [ ] All stakeholders have reviewed

### 2. Plan Phase

**Goal**: Define how to build it

**Process**:
1. Run `/plan [feature-name]` command
2. AI assistant creates technical plan based on spec
3. Review architecture and approach
4. Discuss alternatives if needed
5. Approve technical plan

**Output**: `docs/PRPs/[feature-name]-plan.md`

**Checklist**:
- [ ] Aligns with specification
- [ ] Fits with existing architecture
- [ ] Uses appropriate technologies
- [ ] Testing strategy is defined
- [ ] Performance considered
- [ ] Security considered
- [ ] Dependencies identified
- [ ] Risks and mitigations listed

### 3. Implement Phase

**Goal**: Build the feature

**Process**:
1. Run `/implement [feature-name]` command
2. AI assistant implements with full context:
   - Specification
   - Technical plan
   - Code examples
   - Test examples
   - Project rules
3. Review implementation
4. Test thoroughly
5. Refine if needed

**Output**:
- Code in `src/`
- Tests in `tests/`
- Updated specs in `openspec/specs/`
- Updated documentation

**Checklist**:
- [ ] All requirements implemented
- [ ] Follows code examples patterns
- [ ] Tests are written and passing
- [ ] Code follows project constitution
- [ ] Documentation is updated
- [ ] No unnecessary features added
- [ ] Performance is acceptable
- [ ] Security best practices followed

### 4. Review Phase

**Goal**: Verify quality and correctness

**Process**:
1. Self-review against spec and plan
2. Run all tests
3. Check code quality
4. Verify documentation
5. Test user scenarios

**Checklist**:
- [ ] Meets all requirements from spec
- [ ] Follows technical plan
- [ ] All tests pass
- [ ] Code quality is good
- [ ] Documentation is complete
- [ ] User scenarios work as expected
- [ ] No regression in existing features

### 5. Archive Phase

**Goal**: Update project knowledge

**Process**:
1. Move spec from `openspec/changes/` to `openspec/specs/`
2. Update related documentation
3. Add examples if new patterns emerged
4. Create git commit

**Output**:
- Updated `openspec/specs/`
- Updated documentation
- New examples if applicable
- Git commit

## Commands Reference

### `/specify [feature-name]`
Creates a detailed specification for a feature.

**When to use**: Before starting any new feature or enhancement

**Example**: `/specify mood-input-interface`

### `/plan [feature-name]`
Creates technical implementation plan.

**When to use**: After specification is approved, before implementation

**Example**: `/plan mood-input-interface`

### `/implement [feature-name]`
Implements the feature based on spec and plan.

**When to use**: After both spec and plan are approved

**Example**: `/implement mood-input-interface`

## Context Sources

AI assistants use context from multiple sources:

### Specifications
- **Location**: `openspec/specs/` and `openspec/changes/`
- **Purpose**: What to build, why, and success criteria

### Technical Plans
- **Location**: `docs/PRPs/`
- **Purpose**: How to build, architecture, technology choices

### Examples
- **Location**: `.claude/examples/`
- **Purpose**: Patterns to follow, coding style

### Constitution
- **Location**: `.claude/CLAUDE.md`
- **Purpose**: Project rules, principles, standards

### Architecture
- **Location**: `docs/architecture/`
- **Purpose**: System design, technology stack

## Best Practices

### 1. Always Start with Spec
Don't skip the specification phase. Clear specs prevent:
- Scope creep
- Misunderstandings
- Wasted effort
- Unexpected features

### 2. Maintain Examples
Keep examples up to date:
- Add examples for new patterns
- Update examples when patterns change
- Remove outdated examples

### 3. Keep Specs Current
Specifications are living documents:
- Update specs when requirements change
- Use delta format for changes
- Archive completed changes to specs

### 4. Context is King
More context = better results:
- Maintain comprehensive documentation
- Keep examples realistic and current
- Update constitution as project evolves

### 5. Review Thoroughly
Don't rush the review phase:
- Verify against specification
- Test all scenarios
- Check for regressions
- Ensure quality

## Common Workflows

### New Feature
```
/specify feature-name
→ Review & approve spec
→ /plan feature-name
→ Review & approve plan
→ /implement feature-name
→ Review & test
→ Archive & commit
```

### Bug Fix
```
Create spec for fix (if significant)
→ Implement fix
→ Add test to prevent regression
→ Update examples if pattern changed
→ Commit
```

### Refactoring
```
Create spec describing desired state
→ Create plan for refactoring
→ Implement refactoring
→ Verify all tests still pass
→ Update examples if needed
→ Commit
```

### Tech Debt
```
Document the debt in spec
→ Plan the solution
→ Prioritize and schedule
→ Implement when scheduled
→ Update examples and docs
→ Commit
```

## Tips for Success

1. **Be Specific**: Vague specs lead to vague implementations
2. **Ask Questions**: Better to clarify early than rework later
3. **Follow Patterns**: Consistency makes code easier to understand
4. **Test Early**: Write tests as you code, not after
5. **Document Why**: Code shows what, comments should explain why
6. **Iterate**: Perfect is the enemy of good, iterate and improve

## Troubleshooting

### AI is not following patterns
- Check if examples are up to date
- Verify examples are in correct location
- Make sure patterns are clearly demonstrated
- Add more examples if needed

### Implementation doesn't match spec
- Review specification clarity
- Check if spec was updated
- Verify AI loaded correct spec file
- Refine spec and re-run implementation

### Tests are failing
- Check if requirements changed
- Verify test examples are correct
- Review testing strategy in plan
- Update tests if requirements evolved

### Scope creep
- Review specification
- Check if extra features were added
- Remind about staying within spec
- Update spec if new features are actually needed

## Questions?

If you're unsure about the workflow:
1. Review this guide
2. Check the project constitution (`.claude/CLAUDE.md`)
3. Look at similar past features
4. Ask for clarification

---

**Remember**: The workflow exists to ensure quality and consistency. It's okay to adapt it to what works best, but maintain the core principles of spec-driven, context-rich development.

**Last Updated**: 2025-10-21
