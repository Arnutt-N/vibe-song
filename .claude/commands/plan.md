# Plan Command

Create a technical implementation plan for a specified feature.

## Instructions

When user runs `/plan [FEATURE_NAME]`, perform the following:

1. **Load Context**
   - Read specification from `openspec/changes/[feature-name].md` or `openspec/specs/[feature-name].md`
   - Review project architecture in `docs/architecture/`
   - Check tech stack in `docs/architecture/tech-stack.md`
   - Review constitution in `.claude/CLAUDE.md`

2. **Analyze Requirements**
   - Understand all functional and non-functional requirements
   - Identify technical challenges
   - Consider edge cases

3. **Create Technical Plan**
   Create a plan file in `docs/PRPs/[feature-name]-plan.md` with:

   ```markdown
   # Technical Plan: [Feature Name]

   ## Specification Reference
   - Spec file: `openspec/[specs|changes]/[feature-name].md`
   - Created: [date]

   ## Technical Approach

   ### Architecture Overview
   Brief overview of how this feature fits in the system

   ### Components/Modules
   1. **[Component Name]**
      - Purpose: [purpose]
      - Responsibilities: [what it does]
      - Dependencies: [what it depends on]

   ### Data Models
   ```
   [Data structure or schema]
   ```

   ### API/Interfaces
   ```
   [API definitions if applicable]
   ```

   ### Technology Choices
   - [Technology 1]: [reason for choice]
   - [Technology 2]: [reason for choice]

   ## Implementation Strategy

   ### Phase 1: [Phase Name]
   - Task 1
   - Task 2

   ### Phase 2: [Phase Name]
   - Task 1
   - Task 2

   ## Testing Strategy
   - Unit tests for: [components]
   - Integration tests for: [integrations]
   - E2E tests for: [scenarios]

   ## Migration/Deployment Plan
   - [Steps for deployment]
   - [Data migration if needed]
   - [Rollback plan]

   ## Performance Considerations
   - [Performance implications]
   - [Optimization strategies]
   - [Performance metrics to track]

   ## Security Considerations
   - [Security implications]
   - [Security measures]

   ## Dependencies
   - External: [external dependencies]
   - Internal: [other features/modules]

   ## Risks & Mitigations
   - **Risk 1**: [description]
     - Mitigation: [how to mitigate]

   ## Timeline Estimate
   - Development: [estimate]
   - Testing: [estimate]
   - Total: [estimate]

   ## Open Questions
   - [Questions needing technical decisions]
   ```

4. **Review with User**
   - Present the technical plan
   - Discuss approach and alternatives
   - Get approval on technical direction

5. **Checklist**
   - [ ] Plan aligns with specification
   - [ ] Architecture is sound and scalable
   - [ ] All requirements are addressed
   - [ ] Testing strategy is comprehensive
   - [ ] Security considerations are covered
   - [ ] Performance implications understood
   - [ ] Follows project constitution
   - [ ] User has approved the plan

## Considerations

- **Existing Architecture**: Ensure plan fits with current system design
- **Tech Stack**: Use established technologies unless there's good reason to add new ones
- **Code Examples**: Check `.claude/examples/` for patterns to follow
- **Constitution**: Adhere to principles in `.claude/CLAUDE.md`

## Output

Save the plan to: `docs/PRPs/[feature-name]-plan.md`

This plan will be used as context during implementation.
