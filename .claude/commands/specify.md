# Specify Command

Create a detailed specification for a new feature or enhancement.

## Instructions

When user runs `/specify [FEATURE_NAME]`, perform the following:

1. **Understand the Need**
   - Ask clarifying questions if needed
   - Understand user context and goals
   - Identify the problem being solved

2. **Create Specification**
   Create a specification file in `openspec/changes/[feature-name].md` with:

   ```markdown
   # [Feature Name]

   ## Overview
   Brief description of the feature

   ## User Need
   Why this feature is needed

   ## Requirements

   ### Functional Requirements
   ADDED:
   - [Requirement 1]
   - [Requirement 2]

   ### Non-Functional Requirements
   ADDED:
   - [Performance requirement]
   - [Security requirement]
   - [Usability requirement]

   ## User Scenarios

   ADDED:
   ### Scenario 1: [Name]
   - As a [user type]
   - I want to [action]
   - So that [benefit]

   Steps:
   1. [Step 1]
   2. [Step 2]

   Expected outcome: [outcome]

   ## Success Criteria
   - [Criterion 1]
   - [Criterion 2]

   ## Out of Scope
   - [What this feature will NOT do]

   ## Dependencies
   - [Any dependencies on other features/systems]

   ## Open Questions
   - [Questions that need answering]
   ```

3. **Review with User**
   - Present the specification
   - Ask for feedback
   - Iterate until approved

4. **Checklist**
   - [ ] Specification is clear and unambiguous
   - [ ] Requirements are testable
   - [ ] User scenarios cover main use cases
   - [ ] Success criteria are measurable
   - [ ] Follows project constitution (`.claude/CLAUDE.md`)
   - [ ] User has approved the specification

## Delta Format

Use the Delta format (ADDED/MODIFIED/REMOVED) to track changes:
- **ADDED**: New requirements or scenarios
- **MODIFIED**: Changes to existing requirements
- **REMOVED**: Removed requirements or scenarios

This format helps track evolution of specifications over time.

## Output

Save the specification to: `openspec/changes/[feature-name].md`

After user approval, the spec will be moved to `openspec/specs/` during implementation.
