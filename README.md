# File Management System

A locally-hosted document management system for a provincial office whose records are entirely on paper. It acts as a **searchable index over the paper archive**: scanned documents are described by metadata, found in seconds, and tracked to where the physical original currently sits — replacing 15–30 minute searches through a storage room (and trips to a central storage building across the city) with a metadata search.

> **Status: planning complete, implementation not started.** The current codebase is the Laravel React starter kit foundation (auth, settings, dashboard shell). The file-management domain is fully specified in the planning documents below and broken into GitHub issues, but no domain code has been written yet.

## What it does (v1)

- **Encode** scanned PDFs with metadata — business, branch/location, request type, and date.
- **Search** by a three-state result that never returns a bare blank: *found* · *known business, nothing encoded yet* · *not in the known list* (never a false "does not exist").
- **Consistent data** — businesses, branches, and request types are controlled vocabularies with typeahead suggestion and merge, so one entity never fragments across spellings.
- **Track the paper** — each document's current physical location (drawer / central storage building) is recorded; a QR code on the paper is scanned by a companion Android app to update it.
- **Accountability** — access logging (view/download/print), an append-only activity log, metadata change history with revert, and an approval-gated deletion workflow with 90-day recoverable retention.
- **Local & offline** — runs on a single on-premises server; no cloud, reachable only on the office network.

**Deferred to v2:** OCR / full-text search of scan contents (metadata search is the v1 answer).

## Documentation

Read these before working on domain features:

| Document | What it covers |
|---|---|
| [PLAN.md](PLAN.md) | Problem, solution, scope, success criteria, requirements, limitations, open risks, kill criteria |
| [SCHEMA.md](SCHEMA.md) | Data model — tables, relationships, and the three distinct meanings of "location" |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, backend layering conventions, and the shared-core web + API design |
| [CLAUDE.md](CLAUDE.md) | Working guidance, commands, and conventions for this repo |

## Tech stack

- **Web:** Laravel 13 · Inertia v3 · React 19 · Tailwind CSS v4 · MySQL 8
- **Auth:** Laravel Fortify (headless) — email verification, TOTP two-factor, passkeys
- **Mobile:** Flutter (Android) companion app for QR scanning and location updates, over a versioned `/api/v1` REST API
- **Backend layering:** thin controllers → DTOs → Services → repository interfaces → Eloquent implementations ([ARCHITECTURE.md](ARCHITECTURE.md))

## Getting started

Requires PHP 8.4, Composer, Node, and a database.

```bash
composer run setup   # install deps, .env, app key, migrate, build
composer run dev      # PHP server + queue listener + Vite (local dev)
```

## Common commands

```bash
php artisan test --compact          # run tests (in-memory SQLite)
vendor/bin/pint --dirty --format agent   # format PHP (required after PHP changes)
composer run types:check            # PHPStan (Larastan, level 7)

npm run lint                        # ESLint --fix
npm run types:check                 # tsc --noEmit
npm run build                       # Vite production build

composer run ci:check               # everything CI runs: JS + PHP lint/types/tests
```

## Development workflow

Work is organized into **9 phase milestones** (Phase 0 Foundation → Phase 8 Access Control & Pilot) covering the full v1 build. Custom Claude Code commands drive the loop:

- `/next-issue` — pick the next unblocked issue in phase order.
- `/scaffold-module <Name>` — generate the layered skeleton (interface + Eloquent repo + binding + service + DTO + test) for a module.
- `/implement-issue <n>` — review → implement → verify. An issue is **not** done until lint, format, types, tests, and build all pass.

Every change is tested (Pest feature tests preferred), and `composer run ci:check` + `npm run build` must be green before an issue is considered met.

## Deployment

On-premises single server, deployed by hand — no cloud, no CI/CD pipeline (deliberate, given the office has no IT support). Deployment and operations are out of scope for the current build phase; see [PLAN.md](PLAN.md) §10.
