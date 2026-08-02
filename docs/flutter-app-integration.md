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

## QR scan → resolve → show record (Issue #28)

Per PLAN.md §6.9. Nothing needs to be built here — the backend endpoint this depends on already exists (`GET /api/v1/documents/{reference}` in `app/Http/Controllers/Api/V1/DocumentController.php`). This is the integration reference for the Flutter project's own session.

**What already exists on the backend**

- `GET /api/v1/documents/{reference}` — resolves a document by its opaque QR reference. Requires `Authorization: Bearer <token>` (`auth:sanctum`). Returns `{ success: true, message, data: <document> }` (200) with the document's business (via `branch.business`), branch, request type, document date, and current storage location (`storageLocation`) eager-loaded/available via relations; or `{ success: false, message: "Document not found" }` (404) if the reference doesn't match any document.
- Sits behind the same office-network gate as all `/api/v1/*` routes (403 off-network, checked before auth).

**What the Flutter project needs to do**

1. Add a QR scanner screen (e.g. `mobile_scanner` package) that reads the opaque reference encoded in the document's QR code.
2. On scan, call `GET /api/v1/documents/{reference}` with the stored bearer token attached.
3. On success, show a record screen with: business name, branch, request type, document date, and current location (from `storageLocation`) so the editor can confirm it's the right paper before proceeding.
4. On 404, show a clear "document not found" state so the user can rescan.
5. Reuse the existing network-gate/timeout error handling from the login flow (#27) for off-network or unreachable-server cases during a scan.

## Update location + batch transfer (Issue #29)

Per PLAN.md §6.9. Nothing needs to be built here — both backend endpoints already exist (`app/Http/Controllers/Api/V1/DocumentController.php@updateLocation`, `app/Http/Controllers/Api/V1/TransferController.php@store`). This is the integration reference for the Flutter project's own session.

**What already exists on the backend**

- `PATCH /api/v1/documents/{reference}/location` — single-document update. Body: `{ to_storage_location_id, note? }`. Requires `Authorization: Bearer <token>` + `role:editor,admin`. Returns `{ success: true, message, data: <updated document> }` (200), or 404 if the reference doesn't resolve. Internally this is a batch-of-one transfer.
- `POST /api/v1/transfers` — batch update. Body: `{ references: string[], to_storage_location_id, note? }`. Same auth/role requirement. Returns `{ success: true, message, data: <transfer> }` (201). Every reference must already exist (`exists:documents,reference`) or validation fails for the whole batch.
- Every transfer (single or batch) is logged server-side as a change/activity — no client-side logging needed.

**What the Flutter project needs to do**

1. Single-document flow: after resolving a scanned document (#28), let the editor pick a target storage location and optional note, then call `PATCH /api/v1/documents/{reference}/location`.
2. Batch flow: let the editor scan multiple documents in sequence, collecting references into a list (dedupe as scanned), then pick one target location + optional note for the whole batch, and call `POST /api/v1/transfers` with all collected `references` at once.
3. On success, show a confirmation reflecting the new location for each affected document (single: the returned document; batch: refresh/refetch or trust the batch response).
4. On validation failure (e.g. an unknown reference in the batch), surface which reference(s) failed so the editor can rescan or drop them — the whole batch is rejected together.
5. Reuse the existing bearer-token auth and network-gate/timeout error handling from #27/#28 for these calls.
