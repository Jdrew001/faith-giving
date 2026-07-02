---
name: Code Review
description: Reviews the currently staged Git changes and provides actionable feedback focused on quality, maintainability, correctness, and risk.
---

# Code Review Skill

## Purpose

This skill performs a professional code review of the **currently staged Git changes only**.

The goal is to improve code quality before the changes are committed. The review should be constructive, practical, and focused on improvements that provide real value.

---

# Scope

Review **only** the staged changes.

Before beginning, obtain the staged diff:

```bash
git diff --staged
```

Do **not** review:

- Unstaged changes
- Untracked files
- Other files in the repository
- Existing code that is unrelated to the staged diff

If additional context is required to understand a staged change, you may inspect nearby code, but your feedback should remain focused on the staged modifications.

---

# Review Philosophy

Act like an experienced senior engineer reviewing a pull request.

The purpose is to improve the code—not to criticize the author.

Only suggest changes that have a clear benefit.

Avoid "perfect code" suggestions that provide little practical value.

When the implementation is good, explicitly acknowledge it.

---

# Review Priorities

Review the staged changes in the following order.

## 1. Correctness

Look for:

- Logic errors
- Incorrect assumptions
- Bugs
- Edge cases
- Race conditions
- Null or undefined issues
- Async mistakes
- Resource leaks
- Broken state management

---

## 2. Maintainability

Determine whether the code will remain easy to understand six months from now.

Consider:

- Separation of concerns
- Cohesion
- Coupling
- Function length
- Class responsibilities
- Repeated logic
- Reusability

---

## 3. Readability

Review:

- Naming
- Simplicity
- Code organization
- Clear control flow
- Self-documenting code

Prefer straightforward code over clever code.

---

## 4. Architecture

Consider whether the staged changes fit naturally into the existing architecture.

Identify:

- Violations of existing patterns
- Tight coupling
- Hidden dependencies
- Poor abstractions
- Layering violations

Do **not** recommend architectural rewrites unless there is a significant issue.

---

## 5. Performance

Only mention performance when it is relevant.

Look for:

- Unnecessary allocations
- Repeated work
- Inefficient loops
- N+1 queries
- Expensive rendering
- Blocking operations
- Large object copies

Avoid premature optimization.

---

## 6. Error Handling

Review:

- Validation
- Exception handling
- Failure paths
- User-facing error messages
- Logging
- Recovery behavior

---

## 7. Security

Look for:

- Injection risks
- Authentication problems
- Authorization issues
- Secrets
- Unsafe deserialization
- Sensitive logging
- Path traversal
- XSS
- CSRF
- Unsafe redirects

---

## 8. Testing

Determine whether the staged changes require additional tests.

Consider:

- Happy paths
- Failure paths
- Edge cases
- Boundary conditions
- Regression tests

---

# Review Guidelines

## Be Specific

Avoid comments like:

> This could be improved.

Instead explain:

- What should change
- Why it should change
- What benefit the change provides

---

## Prioritize Important Feedback

Focus on issues that materially improve:

- Reliability
- Maintainability
- Readability
- Developer experience

Avoid trivial style comments unless they affect clarity or violate established project conventions.

---

## Respect Existing Patterns

If the staged changes follow the project's existing conventions, do not recommend changing them simply because another style is preferred.

Consistency is more important than personal preference.

---

## Avoid Overengineering

Do not recommend:

- New abstractions without clear benefit
- Extra interfaces
- Additional design patterns
- Future-proofing for hypothetical requirements

Favor simple solutions.

---

## Acknowledge Good Code

If something is well done, mention it.

Examples:

- Good separation of concerns
- Clear naming
- Clean control flow
- Appropriate abstractions
- Thoughtful error handling
- Good test coverage

A review should reinforce good engineering practices, not only identify problems.

---

# Output Format

## Summary

Provide a brief overview of:

- What the staged changes accomplish
- Overall code quality
- Overall risk level

---

## Strengths

List the things that were done well.

If none stand out, state:

> No notable strengths beyond meeting expected coding standards.

---

## Findings

Organize findings by severity.

### High Priority

Issues likely to cause:

- Bugs
- Security problems
- Data loss
- Production failures
- Significant maintenance problems

---

### Medium Priority

Issues affecting:

- Maintainability
- Readability
- Performance
- Architecture
- Testing

---

### Low Priority

Optional improvements such as:

- Small refactors
- Naming improvements
- Minor simplifications

---

## Suggested Improvements

Provide actionable recommendations.

Whenever appropriate, include example code.

---

## Testing Recommendations

List additional tests that should be added.

If no additional tests are needed, explicitly state that.

---

## Final Recommendation

Choose exactly one:

- ✅ Ready to Merge
- 🟡 Ready with Minor Changes
- 🔴 Needs Revision

Include a short explanation for the recommendation.

---

# Important Rules

- Review **only staged changes**.
- Never review the entire repository unless explicitly requested.
- Keep feedback objective and evidence-based.
- Explain *why* every recommendation matters.
- Do not invent issues simply to provide feedback.
- If the staged changes are excellent, say so.
- Optimize for helping the developer ship better code, not for maximizing the number of comments.