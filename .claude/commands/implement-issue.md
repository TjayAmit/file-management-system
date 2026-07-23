---
description: Review a GitHub issue, implement it per the plan, and verify all quality gates pass before concluding it met.
argument-hint: <issue-number>
---

# Implement Issue

Implement GitHub issue **#$ARGUMENTS** end to end. An issue is **not** "met" until lint, format, types, tests, and build all pass. Do not claim completion on description alone.

## 1. Review — understand before writing

1. Read the issue: `gh issue view $ARGUMENTS`.
2. Read every plan section it references — [PLAN.md](../../PLAN.md), [SCHEMA.md](../../SCHEMA.md), [ARCHITECTURE.md](../../ARCHITECTURE.md) — and the acceptance criteria.
3. Review the existing code the issue touches. Check sibling files for the established structure, naming, and conventions ([CLAUDE.md](../../CLAUDE.md)).
4. If the issue depends on earlier issues that are not yet implemented, say so and stop — do not build on a missing foundation.

## 2. Implement — follow the architecture

- Follow the layering in [ARCHITECTURE.md](../../ARCHITECTURE.md): thin controller (validate → DTO → Service → response), all business logic in `app/Services/`, repositories via `Repositories/Interface/{Module}` bound to `Repositories/Eloquent/Eloquent{Module}`. No business logic or Eloquent queries in controllers.
- Match the data model in [SCHEMA.md](../../SCHEMA.md) exactly (table/column names, relationships, soft deletes, indexes).
- Use `php artisan make:` generators; reuse existing components/primitives before writing new ones.
- **Tests are a requirement, not optional.** Write or update Pest tests covering every behavior in the issue's acceptance criteria. Most tests are feature tests.

## 3. Verify — every gate must pass

Run the full check and **do not stop until it is green**:

```bash
composer run ci:check
npm run build
```

`composer run ci:check` runs JS lint/format/types plus PHP pint (format) + PHPStan level 7 (types) + the test suite. `npm run build` confirms the production build.

If any step fails: fix it and re-run the **whole** gate from the top. A partial pass is a fail. Do not paper over a failing test by weakening it — fix the cause.

## 4. Conclude — only when everything is green

The issue is met **only** when all of the following are true:

- [ ] Every acceptance criterion in the issue is implemented.
- [ ] New/updated tests exist and cover the acceptance criteria.
- [ ] `composer run ci:check` passes (lint, format, types, tests — JS and PHP).
- [ ] `npm run build` passes.

Then report: what was implemented, which files changed, which tests were added, and the final gate output proving each check passed. If anything is not green, report it as **not met** with the failing output — never conclude on the description alone.
