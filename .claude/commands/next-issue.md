---
description: Pick the next unblocked GitHub issue in phase/milestone order and start implementing it.
argument-hint: (optional) milestone or phase number to scope to
---

# Next Issue

Find the next issue to work on, respecting build order, then implement it.

## 1. Determine what is ready

1. List open issues with their milestones:
   ```bash
   gh issue list --state open --limit 100 --json number,title,milestone,labels
   ```
2. Order by **phase**: Phase 0 → Phase 8 (milestone title order), then by issue number within a phase.
3. **Respect dependencies** — the phases are a build order (ARCHITECTURE/SCHEMA foundation before features; a module's upload before its edit/revert). Do not pick an issue whose prerequisites are still open. If the earliest-phase open issue depends on an unfinished one, say so.
4. If `$ARGUMENTS` is given, scope the search to that phase/milestone.

## 2. Confirm the pick

State the chosen issue (number + title + milestone) and **why it is next** (earliest unblocked in phase order). Briefly note its prerequisites and confirm they are closed. If nothing is unblocked, report that and list what is blocking.

## 3. Implement

Hand off to the implementation flow — run `/implement-issue <number>` for the chosen issue, which reviews, implements, and verifies **all quality gates (lint, format, types, tests, build) pass before concluding it met**.

Do not mark the issue done or close it until that gate is green. When it is, note the issue number so it can be referenced in the commit/PR.
