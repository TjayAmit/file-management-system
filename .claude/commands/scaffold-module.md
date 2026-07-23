---
description: Scaffold the layered backend skeleton (interface + Eloquent repo + binding + service + DTO + test) for a module, per ARCHITECTURE.md.
argument-hint: <ModuleName>   e.g. Document, Business, Branch
---

# Scaffold Module: $ARGUMENTS

Generate the full layered skeleton for the **$ARGUMENTS** module following [ARCHITECTURE.md](../../ARCHITECTURE.md). Every backend module is several artifacts; the value is in creating them **consistently** — a Service that skips the interface breaks the pattern. This command exists so that never happens by hand.

Use `{Module}` = `$ARGUMENTS` (TitleCase, singular). Confirm the model already exists in [SCHEMA.md](../../SCHEMA.md); if the module has no table there, stop and ask.

## Create these artifacts

1. **Repository interface** — `app/Repositories/Interface/{Module}.php`
   - `interface {Module}` — **no `Interface` suffix** on the name.
   - Declare the methods this module needs (start from the issue's acceptance criteria; at minimum the queries the Service will call).

2. **Eloquent implementation** — `app/Repositories/Eloquent/Eloquent{Module}.php`
   - `class Eloquent{Module} implements {Module}` — all Eloquent queries live here, nowhere else.

3. **Binding** — in a dedicated `RepositoryServiceProvider`
   - If `app/Providers/RepositoryServiceProvider.php` does not exist, create it (`php artisan make:provider RepositoryServiceProvider`) and register it.
   - Bind `{Module}::class` → `Eloquent{Module}::class`.

4. **Service** — `app/Services/{Module}Service.php`
   - **All business logic here.** Depends on the `{Module}` **interface** via constructor injection — never on `Eloquent{Module}` directly.

5. **DTO(s)** — `app/DTOs/`
   - Immutable carrier(s) for validated input passed controller → service.

6. **Test** — a Pest feature test
   - `php artisan make:test {Module}Test` (or a focused feature test). Cover the module's core behavior. Tests are required, not optional.

## Conventions

- Use `php artisan make:` generators where one exists; pass `--no-interaction`.
- Constructor property promotion, explicit return types and param type hints, curly braces always ([CLAUDE.md](../../CLAUDE.md) PHP rules).
- Match [SCHEMA.md](../../SCHEMA.md) names exactly.

## Verify before finishing

```bash
vendor/bin/pint --dirty --format agent
composer run types:check
php artisan test --compact --filter={Module}
```

All three must pass. Then report the files created and how they wire together (controller → DTO → `{Module}Service` → `{Module}` interface → `Eloquent{Module}`). Leave method bodies as focused stubs where the issue hasn't specified behavior — this command scaffolds structure, the implementing issue fills logic.
