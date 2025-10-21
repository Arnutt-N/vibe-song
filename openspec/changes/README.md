# Specification Changes

This directory contains **proposed specifications** - specs that are being drafted, reviewed, or refined before approval.

## Purpose

Specifications in this directory are:
- 🔄 Work in progress
- 🔄 Under review
- 🔄 Awaiting approval
- 🔄 Being refined based on feedback

## Delta Format

Use the Delta Format to show what's being added, modified, or removed:

```markdown
ADDED:
- New requirements
- New scenarios

MODIFIED:
- Updated requirements
- Changed scenarios

REMOVED:
- Deprecated requirements
- Obsolete scenarios
```

## Workflow

### Creating New Spec

1. Run `/specify [feature-name]`
2. AI creates initial spec here
3. Review and refine
4. Iterate until satisfied
5. Approve

### Modifying Existing Spec

1. Create change file: `[feature-name]-update.md`
2. Use delta format to show changes
3. Reference original spec
4. Review and refine
5. Approve and merge into original spec

### After Approval

When a spec is approved and implemented:
1. Move from `changes/` to `specs/`
2. Remove delta markers (it's now the truth)
3. Update related documentation

## File Naming

Use descriptive, kebab-case names:
- `mood-input-interface.md` (new feature)
- `mood-input-interface-update.md` (modification)
- `recommendation-engine-v2.md` (major revision)

## Spec Template

See `.claude/commands/specify.md` for the specification template.

## Review Process

Before approving a spec:
- [ ] Requirements are clear and testable
- [ ] User scenarios are comprehensive
- [ ] Success criteria are measurable
- [ ] Out of scope is defined
- [ ] Dependencies are identified
- [ ] Technical feasibility confirmed
- [ ] Aligns with project constitution
- [ ] All questions answered

## Current Changes

None yet - project is in initial setup phase.

## Next Steps

1. Use `/specify` to create first feature specification
2. Review and refine
3. Approve and begin planning

---

**Status**: Empty - Ready for new specifications
**Last Updated**: 2025-10-21
