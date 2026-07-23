# Architecture & Backend Conventions

> Derived from [PLAN.md](PLAN.md). Design/implementation reference. Data model is in [SCHEMA.md](SCHEMA.md).
> Produced 2026-07-22.

## Stack

| Surface | Technology |
|---|---|
| Web application | **Laravel + Inertia v3 + React 19** (the starter kit already in this repo) |
| Mobile (location/transfer app, §6.9) | **Flutter**, targeting **Android** for v1 (Flutter keeps an iOS build possible later without a rewrite) |
| System ↔ app contract | **Versioned REST API** (`/api/v1`) — versioning is in place from **day one of coding**, not retrofitted |

## Two surfaces, one core

The web app and the mobile app are **two entry layers over one shared core of Services.** Business logic lives in Services and nowhere else, so the two surfaces can never drift apart.

```
Web (Inertia) Controller  ┐
                          ├──→ Service ──→ Repository (interface) ──→ Eloquent implementation
API v1 (JSON) Controller  ┘         │
                                    └──→ other logic (traits, helpers)
```

- **Inertia controllers** return `Inertia::render(...)` pages.
- **API v1 controllers** return JSON for the Flutter app.
- Both do the same thin job and call the **same Services**. A Service has no idea which surface invoked it.

## Request flow (both surfaces)

```
Controller
  → validates (Form Request)
  → translates validated input into a DTO
  → calls a Service (passing the DTO)
      → Service runs business logic, calls Repositories through their interfaces
  → Service returns a result
Controller
  → shapes the response (Inertia page or JSON resource)
```

The controller does **only**: validation, DTO creation, calling a Service, and returning a response. No business logic, no direct Eloquent queries.

## Layers and directories

| Layer | Location | Rule |
|---|---|---|
| **Repository interfaces** | `app/Repositories/Interface/` | Class/file named for the module **without an `Interface` suffix** — e.g. `app/Repositories/Interface/Document.php`, `interface Document` |
| **Eloquent implementations** | `app/Repositories/Eloquent/` | Named `Eloquent{Module}` — e.g. `app/Repositories/Eloquent/EloquentDocument.php`, `class EloquentDocument implements Document` |
| **Binding** | a dedicated `ServiceProvider` | One provider class binds each interface to its Eloquent implementation (interface → `Eloquent{Module}`) |
| **Services** | `app/Services/` | **All** business logic. Services depend on repository *interfaces*, never on Eloquent implementations directly |
| **DTOs** | `app/DTOs/` | Immutable carriers of validated input from controller to service |
| **Traits** | `app/Traits/` | Reusable behaviour shared across classes |
| **Controllers** | `app/Http/Controllers/` (web), `app/Http/Controllers/Api/V1/` (API) | Thin; validate → DTO → Service → response |

**Naming example (Document module):**

```
app/Repositories/Interface/Document.php        interface Document { ... }
app/Repositories/Eloquent/EloquentDocument.php class EloquentDocument implements Document { ... }
app/Providers/RepositoryServiceProvider.php    $this->app->bind(Document::class, EloquentDocument::class);
app/Services/DocumentService.php               class DocumentService { public function __construct(private Document $documents) {} }
app/DTOs/...                                    validated input carriers
```

Services receive repositories by their **interface** through constructor injection, so the Eloquent layer can be swapped or mocked without touching business logic.

## Conventions

- **Laravel Boost** guidelines (embedded in [CLAUDE.md](CLAUDE.md)) are the baseline for all backend code style, on top of the layering above.
- `vendor/bin/pint --dirty --format agent` after any PHP change; PHPStan (Larastan) level 7 must pass.
- Every behaviour is covered by a **Pest** test (feature tests preferred), per CLAUDE.md.

## Testing

- **Backend:** Pest feature/unit tests against in-memory SQLite (existing setup).
- **Frontend:** **Playwright MCP** only, for now — used for browser-level checks. No other frontend test tooling is adopted yet.

## API versioning

- `/api/v1` prefix and a `app/Http/Controllers/Api/V1/` namespace exist from the first API commit.
- The v1 endpoints are fixed in PLAN.md §6.9; payload shapes are the remaining open item (§10 / SCHEMA.md).
- The Flutter app pins the versioned base URL (`http://<static-server-ip>:<port>/api/v1`, §6.9 / §8.10).

## Consequence to accept

The interface + Eloquent + binding trio means **every repository is three artifacts**, not one. That is deliberate — it buys testability and a swappable data layer — but it only pays off if applied **consistently**: a module that skips the interface and queries Eloquent from a Service breaks the pattern and the mockability that justifies it. Consistency is the whole value here.
