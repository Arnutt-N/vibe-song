# Implement Command

Implement a feature based on its specification and technical plan.

## Instructions

When user runs `/implement [FEATURE_NAME]`, perform the following:

1. **Load Full Context**
   - Specification: `openspec/specs/[feature-name].md` or `openspec/changes/[feature-name].md`
   - Technical Plan: `docs/PRPs/[feature-name]-plan.md`
   - Project Rules: `.claude/CLAUDE.md`
   - Code Examples: `.claude/examples/code/`
   - Test Examples: `.claude/examples/tests/`
   - Architecture Docs: `docs/architecture/`

2. **Verify Prerequisites**
   - [ ] Specification exists and is approved
   - [ ] Technical plan exists and is approved
   - [ ] All dependencies are available
   - [ ] Development environment is ready

3. **Implementation Process**

   For each component/module in the plan:

   a. **Code Implementation**
      - Follow patterns from `.claude/examples/code/`
      - Adhere to project constitution rules
      - Write clean, readable code
      - Add appropriate comments
      - Consider edge cases

   b. **Test Implementation**
      - Follow patterns from `.claude/examples/tests/`
      - Cover all requirements from spec
      - Test happy path and edge cases
      - Ensure tests are readable

   c. **Documentation**
      - Add inline documentation
      - Update relevant README files
      - Document public APIs

4. **Implementation Checklist**
   - [ ] All requirements from spec are implemented
   - [ ] Code follows project constitution
   - [ ] Code follows patterns in examples
   - [ ] Tests are written and passing
   - [ ] Documentation is updated
   - [ ] No TODO or FIXME comments left
   - [ ] Code is reviewed (self-review)
   - [ ] Performance is acceptable
   - [ ] Security best practices followed

5. **Archive Specification**
   If spec was in `openspec/changes/`:
   - Move to `openspec/specs/[feature-name].md`
   - Remove ADDED/MODIFIED/REMOVED markers (now it's the truth)
   - Update any related specs

6. **Finalization**
   - Run all tests
   - Verify all checks pass
   - Create meaningful git commit
   - Update changelog if applicable

## Context-Rich Development

This command ensures AI has ALL necessary context:

### From Specification
- What to build
- Why it's needed
- Success criteria

### From Technical Plan
- How to build it
- Architecture decisions
- Technology choices

### From Examples
- Code patterns to follow
- Testing patterns
- Component structures

### From Constitution
- Project rules
- Quality standards
- Best practices

## Output

- Implemented code in `src/`
- Tests in `tests/`
- Updated documentation
- Updated specs in `openspec/specs/`
- Ready for commit

## Notes

- **Stay focused**: Implement only what's in the spec
- **Don't add extras**: Stick to requirements
- **Follow patterns**: Consistency is key
- **Test thoroughly**: Tests should give confidence

## After Implementation

Ask user if they want to:
1. Review the implementation
2. Run additional tests
3. Create a git commit
4. Start working on next feature
