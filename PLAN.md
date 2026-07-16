# Document Management System — Project Plan

> Structured by SDLC stage: Planning → Requirements → Design → Implementation → Testing → Deployment → Operations.
> Read top to bottom: it starts with why the project exists and ends with how it runs after delivery.
> Last revised 2026-07-16 after three design-review sessions (the third produced [SCHEMA.md](SCHEMA.md)).

## Roadmap at a glance

| # | SDLC stage | What happens | Exit criteria |
|---|---|---|---|
| 1 | Planning | Problem, goals, scope, success criteria agreed | This document approved |
| 2 | Requirements | What the system must do, for whom, under what constraints | Requirements below confirmed by stakeholders |
| 3 | Design | Architecture, data model, authorization, UI approach | Design reviewed; no open structural questions |
| 4 | Implementation | Build in 4 phases (A–D), each independently verifiable | Each phase passes its tests + quality gate |
| 5 | Testing | Automated suite + manual smoke + retrieval drill | All green; drill meets the 1-minute target |
| 6 | Deployment | Install on the on-premises server, seed accounts, go live | Departments can log in and encode documents |
| 7 | Operations | Backlog encoding, backups, monitoring, future needs | Ongoing — reviewed against success criteria |

---

## 1. Planning

### 1.1 The problem (starting point)

All of the organization's records are physical documents — roughly **1,500 letters, meeting minutes, memos, and official records** — and finding a specific one is slow and unreliable. Locating "the letter from the mayor's office about the March 2025 budget" means digging through cabinets. Documents are effectively invisible once filed; there is no access control, no recovery for misfiled papers, and no way to know what exists.

### 1.2 The goal (end point)

A web application where those documents live as scanned digital files, organized by department, **findable in seconds** by searching name, type, date, source, or description — with a pointer back to where each paper original physically lives. Think "private, on-premises Google Drive for a paper-based office."

### 1.3 Success criteria (how we know we arrived)

1. **Retrieval time**: a staff member locates any encoded document in under ~1 minute via search/metadata (vs. minutes-to-hours in cabinets).
2. **Adoption**: each department encodes its incoming documents and treats the system as the first place to look.
3. **Nothing lost**: every encoded document is retrievable — digitally, and physically via its location field; accidental deletions are recoverable from trash.
4. **Technical acceptance**: the full verification in §5 passes.

### 1.4 Scope

**In scope:** everything in §2 Requirements, built and verified per §4–§5. The system must make bulk encoding efficient (batch upload with shared metadata), because ~1,500 backlog documents will be encoded through it.

**Out of scope (explicit):**
- **The encoding labor itself** — scanning/uploading the 1,500-document backlog is an operational effort that starts after delivery (§7). The project is done when the system is ready, not when the archive is full.
- **OCR / full-text search** of scan contents (future enhancement; metadata search is the v1 answer).
- Per-folder/per-file permissions (access is per-department + role).
- External sharing links, self-registration, email flows, cloud storage, per-team quotas.
- Bulk import of existing digital files (there are none — the archive is paper).

### 1.5 Constraints

- Runs on a **single on-premises server**; no cloud services, no internet-dependent features, no email.
- Backups are handled **outside the app** (disk snapshots) — consciously accepted; must be verified before real documents go in (§7).
- Built on the existing Laravel 13 + Inertia v3 + React 19 starter kit already in this repo.

### 1.6 Key risks (accepted, with revisit triggers)

- **Metadata discipline**: search is only as good as the metadata typed in. Mitigated by batch defaults and a fixed type list; revisit (required fields or OCR) if searches start failing.
- **Encoding throughput**: ~1,500 documents at ~3 min each ≈ 75 hours of labor. Out of dev scope, but the org must staff it or success criteria 2–3 never happen.
- **No storage quota**: one department can fill the shared disk. Revisit when the dashboard storage stat (§4, Phase D) shows pressure.
- **Access granularity**: settled on department-wide read-only vs full roles; per-folder permissions would be a redesign, not an extension.

### 1.7 Kill criteria (when to stop and rethink)

- Per-folder/per-file permissions requested mid-build → stop and redesign authorization first.
- The retrieval drill (§5.3) fails — people can't find documents via metadata → OCR/full-text becomes v2's centerpiece; don't bolt it on mid-v1.
- Files >25 MB or a second app server required → the local-disk, single-request-upload approach needs rework (S3 / chunked upload).
- Users need self-registration or external share links → the local-only auth foundation is wrong.
- Stakeholders ask to log *downloads* in the activity log → don't just enable it; that reopens the volume/retention decision deliberately closed in the schema review.

---

## 2. Requirements

### 2.1 Users and roles

| User | What they can do |
|---|---|
| **Department staff — viewer** | Search, read, and download their department's documents |
| **Department staff — editor** | Everything a viewer does, plus upload documents, fill in metadata, organize folders, move items to trash and restore them |
| **Department admin** | Everything an editor does, plus manage who is in the department and their roles, permanently delete documents, empty the trash |
| **Super-admin (IT/records officer)** | Creates user accounts and departments; can do anything a department admin can |

No self-registration — accounts are created by the super-admin. A user can belong to multiple departments, with a possibly different role in each, and switches between them in the sidebar.

### 2.2 Functional requirements

1. **Store scanned documents** — multi-file upload (up to 25 MB per file) with a progress bar.
2. **Describe documents** — each file carries metadata: document type (letter, minutes, memo, …), document date, source/office, free-text description, and the **physical location of the paper original** (cabinet/box) so the signed original can still be retrieved.
3. **Batch encoding** — shared metadata can be entered once and applied to a whole upload batch (a box of similar documents), then refined per file.
4. **Find documents fast** — search matches file name, description, source; filter by type; results scoped to the user's department, never including trashed items.
5. **Organize** — folder tree per department (create, rename, move, delete), breadcrumb navigation. Renaming/moving never loses a file.
6. **Control access** — documents belong to a department; only its members see them; viewers cannot change anything.
7. **Recover mistakes** — deleted items go to trash with restore; only department admins can delete forever or empty the trash.
8. **Administer locally** — super-admin manages accounts (create/edit/deactivate), departments, and membership from an admin area; deactivated users are logged out but their upload history is preserved.
9. **Accountability** — every change to documents, folders, and membership is recorded (who, what, when) in an activity log. Mutations only — downloads are deliberately not logged. Team admins can review their department's activity.

### 2.3 Non-functional requirements

- **Security**: authenticated access only; every download authorized; cross-department access impossible; login supports two-factor and passkeys (already in the starter kit).
- **Storage**: files on the server's local private disk (`storage/app/private`), never publicly reachable.
- **Limits**: 25 MB/file, any file type, config-driven so it can change without code edits.
- **Quality**: automated tests for every behavior, static analysis (PHPStan level 7), formatted code — enforced by the repo's CI gate.

---

## 3. Design

### 3.1 Architecture

The existing starter kit provides auth, settings, and the dashboard shell. The domain is added on top:

- **Backend**: Laravel 13 — routes render Inertia pages; controllers + Form Requests; policies for authorization; local `Storage` disk for file contents.
- **Frontend**: React 19 + Inertia v3 pages under `resources/js/pages/`, composed from the existing shadcn/ui primitives; Wayfinder-generated route functions (never hardcoded URLs).
- **New route files**: `routes/files.php` and `routes/admin.php`, required from `web.php` (mirrors the existing `settings.php` pattern).

### 3.2 Data model

Full column-level schema with ER diagram and design rationale: **[SCHEMA.md](SCHEMA.md)**. Summary:

| Table | Purpose | Key columns |
|---|---|---|
| `teams` | A department | `name` |
| `team_user` | Membership + role | `team_id`, `user_id`, `role` (`admin`/`editor`/`viewer`), unique pair |
| `users` (extended) | Accounts | + `is_admin` (super-admin), `is_active`, `active_team_id` FK nullOnDelete |
| `folders` | DB-only folder tree | `team_id`, `parent_id` self-FK, `name`, softDeletes, index(`team_id`,`parent_id`) |
| `files` | One document | `team_id`, `folder_id` nullable, `uploaded_by` nullOnDelete, `name` (display), `path` (disk), `size`, `mime_type`, **`reference_number`, `document_type`, `document_date`, `source`, `description`, `physical_location`** (all nullable), softDeletes, indexed per SCHEMA.md |
| `activities` | Append-only audit log (mutations only) | `team_id`, `user_id` nullOnDelete, polymorphic `subject_type`/`subject_id`, `action`, `details` JSON, `created_at` only |

Sibling-name uniqueness for folders is enforced in Form Requests (nullable parent + soft deletes break a DB unique constraint). `source` is free text with UI autocomplete from the team's existing values (no lookup table).

### 3.3 Authorization model

- `Gate::define('admin')` = super-admin (`is_admin`).
- `TeamPolicy`: `view` = member or super-admin; `manageMembers` = team admin or super-admin; `update`/`delete` = super-admin.
- `FolderPolicy`/`FilePolicy`: **read** (view/download) = any member; **write** (create/update/trash/restore) = editor or team admin; **forceDelete** = team admin or super-admin. Controllers additionally scope every query to the active team.
- **Last-admin guard**: a team must always retain at least one team admin (cannot demote/remove the final one).
- Deactivation (`is_active` false) logs the user out via middleware instead of deleting the account, preserving upload history.

### 3.4 Storage design

- Physical layout is **flat per team**: `teams/{team_id}/{hashName}` — the folder tree exists only in the DB, so rename/move never touch the disk and can't lose files.
- Downloads go through an authenticated route (`Storage::download` with the display name); the disk is never web-accessible.
- Permanent delete removes the disk file via a model `forceDeleting` event.
- Upload display-name collisions auto-suffix `name (1).ext`; rename/move rejects duplicates via validation.
- Trash: folder delete soft-deletes the whole subtree in one transaction with a shared `deleted_at`; trash lists only top-level items; restore brings back the subtree (orphans restore to root, collisions get ` (n)` suffix).

### 3.5 Configuration

`config/files.php`: `max_size` (25 MB) and the `document_types` list (Letter, Memo, Minutes, Report, Contract, Other) — changeable without touching code.

### 3.6 UI design

- **Files page** (`pages/files/index.tsx`): breadcrumbs, search input + type filter, table of folders-then-files (name/type/date/size) with row menu: Download / Details / Rename / Move / Delete. Viewers see no write controls.
- **Upload dialog**: multi-file picker + optional shared metadata (reference number, type, date, source, physical location) applied to the batch; source field autocompletes from the team's existing values; progress bar; fields persist between batches for fast encoding.
- **Details dialog**: view/edit all metadata for one file (read-only for viewers).
- **Trash page**: restore (editors+), delete forever / empty trash (team admins only), with confirm dialogs; each row shows who trashed it and when (from the activity log).
- **Activity page**: team-scoped, paginated list of the department's activity log (team admins + super-admin).
- **Team switcher** in the sidebar; **Admin area** (users, departments, members with role selector) visible to super-admins; member management visible to team admins.
- New shadcn primitives needed: `table`, `alert-dialog`, `progress`, `context-menu`, `scroll-area`, `textarea`, date input.

---

## 4. Implementation

Built in four phases; each ends with its tests green and the quality gate clean before the next starts.

### Phase A — Foundation: auth strip-down, departments + roles, admin area

- **Migrations**: `create_teams_table`; `create_team_user_table` (with `role`, default `editor`); `add_columns_to_users_table` (`is_admin`, `is_active`, `active_team_id`) — ordered after teams; `create_activities_table` (per SCHEMA.md).
- **Models**: new `Team` (+factory), new `app/Enums/TeamRole.php`; extend `User` with `teams()` withPivot, `activeTeam()`, casts, helpers `belongsToTeam()`, `roleInTeam()`, `isTeamAdmin()`, `canEditIn()`.
- **Auth strip-down**: `config/fortify.php` keeps only 2FA + passkeys (drop registration, password reset, email verification); remove matching view closures in `FortifyServiceProvider`, links in `login.tsx`, the `'verified'` middleware in `routes/web.php` + `routes/settings.php`; delete unused auth pages and their tests. New `EnsureUserIsActive` middleware (logout if deactivated) appended to the web group.
- **Authorization**: `Gate::define('admin')`; `TeamPolicy` per §3.3.
- **Controllers**: `TeamSwitchController` (invokable), `TeamMemberController` (index/store/update/destroy with last-admin guard; detaching clears the user's `active_team_id`), `Admin/UserController` (index/store/update; cannot deactivate or demote self), `Admin/TeamController` (CRUD; store assigns an initial team admin). Form Requests under `app/Http/Requests/Admin/` + member requests (role validated against the enum).
- **Activity log foundation**: `create_activities_table` migration (per SCHEMA.md), `Activity` model, and `app/Actions/RecordActivity.php`; membership mutations record `member_added`/`member_removed`/`role_changed`.
- **Routes**: `routes/admin.php` (`auth` + `can:admin`); team switch + member routes in the `web.php` auth group.
- **Shared props**: `HandleInertiaRequests` adds `auth.isAdmin`, `currentTeam` (id/name/current user's role), `teams`; update TS types.
- **Frontend**: `team-switcher.tsx`; sidebar shows Admin nav for super-admins; pages `admin/users/index.tsx`, `admin/teams/index.tsx`, `teams/show.tsx` (member management with role selector).
- **Seeder**: super-admin `admin@example.com`/`password` with team "Workspace", plus one editor and one viewer.

### Phase B — Core domain: folders, documents, upload/download, metadata, browser UI

- **Migrations**: `folders` and `files` per SCHEMA.md (files includes `reference_number` and the metadata columns). **Config**: `config/files.php` per §3.5.
- **Models**: `Folder` (SoftDeletes; `parent()`, `children()`, `files()`, `ancestors()`, `isDescendantOf()`); `File` (SoftDeletes; `document_date` cast; disk cleanup on `forceDeleting`). Factories for both.
- **Policies**: `FolderPolicy`/`FilePolicy` per §3.3. **Middleware**: `EnsureHasActiveTeam` (fallback to first team; zero teams → notice page), aliased `active.team`.
- **Controllers** (Form Requests in `app/Http/Requests/Files/`): `FileBrowserController@index(?Folder)` (browse + search `?q=` across name/reference_number/description/source + `?type=` filter + flat folder list for the move dialog + distinct `source` values for autocomplete); `FolderController` (store/update/destroy — duplicate-sibling and move-into-self/descendant rejected; recursive soft delete in one transaction with shared `deleted_at`); `FileController` (multi-upload with batch metadata, `update` = rename + metadata, `destroy`); `FileDownloadController` (authorize then `Storage::download`); collision helper `app/Actions/Files/GenerateUniqueFileName.php`. All file/folder mutations record activities (`uploaded`, `renamed`, `moved`, `metadata_updated`, `trashed`) via `RecordActivity`.
- **Routes**: `routes/files.php` (`auth` + `active.team`).
- **Frontend**: files page, upload dialog, details dialog, new-folder/rename/move/delete dialogs per §3.6; sidebar gains Files + Trash items.

### Phase C — Trash

- **`TrashController`** + routes (bindings `->withTrashed()`): trash index (top-level items only, each with who/when trashed from the activity log), restore file/folder (editor+; subtree via shared `deleted_at`; orphans → root; collision suffix), delete forever file/folder and empty trash (team admin only; forceDelete + disk cleanup). Records `restored`, `force_deleted`, `trash_emptied` activities.
- **Frontend**: `pages/trash/index.tsx` with role-gated actions, confirm dialogs, and a "trashed by" column.

### Phase D — Polish and hardening

1. Dashboard: recent documents + storage-used stats for the active team (also the early-warning for the no-quota risk).
2. Activity page: team-scoped, paginated activity list (team admins + super-admin) per §3.6.
3. Toasts on all mutations, loading states, file-size formatter (`resources/js/lib/format.ts`), mime-type icons.
4. Full quality gate: `composer run ci:check`.

---

## 5. Testing

### 5.1 Automated (Pest, per phase; `RefreshDatabase`; `Storage::fake('local')` for files)

- **Phase A**: team switch (member ok, non-member 403); member management (team admin ok, editor/viewer 403, role change, last-admin guard on demote and remove); admin user CRUD (non-admin 403, deactivated user logged out, can't deactivate self); admin team CRUD; register route 404; login works unverified; membership mutations write activity rows.
- **Phase B**: folder CRUD incl. cycle and duplicate-name rejection; upload (path under `teams/{id}/`, DB row, oversize rejected, multi-file, `report (1).pdf` suffixing, batch metadata applied to all files, invalid type rejected); metadata update persists; download (member ok + filename header, cross-team 403, guest redirect) — **download writes no activity row**; search matches reference number, description, and source, type filter works; viewer 403 on every write endpoint, viewer can download; browse scoped to active team; each mutation writes the expected activity row.
- **Phase C**: cascade delete; top-level-only listing; subtree restore; orphan restore to root; restore collision suffix; permanent delete removes row **and** `Storage::assertMissing`; editor 403 on delete-forever and empty-trash; empty trash; trashed file download 404s; cross-team 403; search excludes trashed and other teams; trash/restore/force-delete write activity rows and `details` JSON preserves the name after force-delete.
- **Phase D**: activity page — team admin ok, editor/viewer 403, scoped to active team.
- **Authorization is the highest-risk area**: every controller test file includes at least one cross-team 403, one viewer-403 (write endpoints), and one guest-redirect case.

### 5.2 Quality gate (after every phase)

`php artisan test --compact` green · `composer run types:check` · `npm run build` clean · `vendor/bin/pint --dirty --format agent`.

### 5.3 Acceptance: manual smoke + retrieval drill

With `composer run dev` and the seeded accounts:

- **A**: log in; `/register` is 404; create a user in admin; switch teams; team admin changes a member's role; last admin cannot be removed.
- **B**: upload a batch with shared metadata (reference number, type "Letter", a source office) → progress bar → both files carry the metadata; search by reference number and by a word from the description finds it; type filter works; source field autocompletes; Details shows physical location; as viewer → no write controls, download + search still work; a user in another department sees nothing.
- **C**: delete → appears in trash showing who trashed it → restore → (as team admin) delete forever → file gone from `storage/app/private/teams/...`; editor sees no Delete forever / Empty trash; the Activity page lists every step just performed.
- **Retrieval drill (maps to success criterion 1)**: encode 10 sample documents from the real archive, then have someone else find 3 of them by description/source/type only — each in under a minute.

---

## 6. Deployment

1. Install on the on-premises server: `composer run setup` (deps, `.env`, key, migrations, build) with MySQL configured; `npm run build` for production assets; queue worker + scheduler as services.
2. Seed the super-admin, then **change the default password immediately**.
3. Super-admin creates the real departments and user accounts, assigning team admins.
4. Confirm the backup/snapshot routine covers both the MySQL database **and** `storage/app/private` before any real document is encoded.
5. Go-live check: one real user per department logs in, uploads a test document, finds it via search, and downloads it.

---

## 7. Operations (after delivery)

- **Backlog encoding**: departments scan and encode the ~1,500-document archive (out of project scope, §1.4). The batch-metadata upload flow exists specifically to make this fast; track progress informally via the dashboard counts.
- **Monitoring**: watch the dashboard storage-used stat — it is the early warning for the accepted no-quota risk.
- **Backups**: periodically test a restore (database + files together), not just the snapshot job.
- **Review against success criteria** (§1.3) once encoding is underway; the kill criteria (§1.7) name the signals that should trigger a v2 rethink (OCR/full-text being the most likely).
