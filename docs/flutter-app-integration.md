# Flutter App Integration (Issue #27)

Companion Android app (PLAN.md §6.9, ARCHITECTURE.md) is a **separate Flutter project**, not part of this Laravel repo. Nothing needs to be built here for issue #27 — the backend contract it depends on (login, token auth, network gate) already shipped in #25 and #26. This doc is the integration reference for that project's own session.

## What already exists on the backend

- `POST /api/v1/auth/login` — `{ email, password }` → `{ success, message, data: { user, token } }` (200) or `{ success: false, message }` (401). Token is a Sanctum bearer token (`app/Http/Controllers/Api/V1/AuthController.php`).
- All `/api/v1/*` routes sit behind `EnsureRequestIsOnOfficeNetwork` (registered globally in `bootstrap/app.php`), applied **before** auth. Off-network requests get `403 { success: false, message: "This system is only accessible from the office network." }` — this is what makes "off-network login fails" true with zero app-side logic.
- Mutating routes require `auth:sanctum` + `role:editor,admin` — pass the token as `Authorization: Bearer <token>`.
- Relevant endpoints for later Flutter issues: `GET /api/v1/documents/{reference}` (resolve scan), `PATCH /api/v1/documents/{reference}/location` (single update), `POST /api/v1/transfers` (batch).

## What the Flutter project needs to do (issue #27 scope)

1. `flutter create` an Android-targeted project (own repo/session — not this one).
2. Pin the base URL `http://<office-server-static-ip>:<port>/api/v1` as a build-time constant (§8.10 — the developer sets this at deployment; not a user-facing setting).
3. Login screen calling `POST /api/v1/auth/login`; on success, persist the bearer token (e.g. `flutter_secure_storage`) and attach it to subsequent requests.
4. Surface the network-gate 403 and connection failures (timeout/unreachable) as a clear "not on the office network" error — no special client logic needed beyond handling the response the server already sends.

## Config needed on the server side when deploying

- `NETWORK_ALLOWED_CIDRS` (`.env`) must include the office LAN range the phones sit on, or the gate stays disabled.
- The server's static local IP (§8.10) is what gets hard-coded into the app's base URL at build time.
