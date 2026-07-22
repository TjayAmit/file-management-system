# File Management System — Project Definition

> **Status:** Planning and Requirements. Covers *problem, solution, scope, success criteria, requirements, and limitations*.
> Design, data model, and implementation are **not yet defined** and are deliberately absent (§10).
> Produced 2026-07-22 across two design-review sessions. Supersedes all earlier plans in this repo.

**Design principle agreed in review:** *the system's job is to make work findable, not to eliminate work.*
Where a choice is between "less staff effort" and "more reliable data," this project chooses reliable data.

---

## 1. Problem

A provincial office keeps **100% of its records on paper**. Roughly **95% of the archive has no soft copy at all.**

Retrieving a document is slow and unreliable:

1. **Searching is physical.** Locating a file from 2022 means walking into a storage room and going through a large volume of paper by hand. It takes **15–30 minutes**, and going faster means pulling **additional staff off their own work** to search alongside.
2. **The search can end in a guess.** After 30 minutes, someone may conclude the file "is probably at the storage building" — **without assurance**. Acting on that guess means a trip across the city that may be wasted.
3. **The paper does not stay put.** After **3–4 years**, documents are transferred out of the office to a **central storage building elsewhere in the city** — a shared archive for the whole organization, not a neighboring room. A clerk can spend 30 minutes searching the office for a file **that was never there**.
4. **There is no record of what exists.** The office cannot answer "do we have this document, and where is it right now?" without a manual search.

**The underlying problem is not that documents are on paper. It is that the office has no index of what it holds or where it is.**

### 1.1 Why nothing has solved this already

- **No IT support** — not in this office, and not in the wider organization. Provincial area.
- **No authority to compel one.** The office head cannot demand support from other units; every unit is focused on its own work.
- **The office has been skipped.** Other offices in the organization have systems; this one has never had anything built for it.
- **Shared network drives are not practiced** and there is no one to administer them.

Left alone, this problem persists for another decade.

---

## 2. Goal

A locally-hosted web application that acts as a **searchable index over the paper archive**, so that staff can:

- find whether a document exists, in seconds, by searching its details;
- open and read a scanned copy without leaving their desk;
- **know where the paper original physically is** — still in the office, or already moved to the central storage building — *before* anyone walks anywhere.

---

## 3. Proposed solution (v1)

### 3.1 How documents get in

1. Office staff scan paper using a scanning machine. **PDF conversion happens outside the system.**
2. A staff member with **editor** access uploads the PDF and fills in its details.
3. Two things are stored: **the PDF file** (the payload) and **a metadata record** (the index card) pointing to it.

The primary engine for filling the archive is the **retrieval workflow itself** — see §6.3.

### 3.2 How documents are found

Search queries **the metadata only** — the system never reads inside the PDF. Documents are described by:

- **Business name** and **location**
- Document **date**
- Document **type**
- Title / subject, person or entity concerned

Search matches these fields, returns the matching records, and opening a result serves the PDF.

> **Consequence, accepted deliberately:** the metadata card is the *only* way in. A document with no card, or a wrong card, is invisible even though the file exists on disk.

### 3.3 Keeping business names consistent

Business name and location are the primary way documents are found, so they cannot be free-typed inconsistently. `ABC Corp` and `ABC Corporation` as two separate entries would split a business's history in half and make searches return only part of it.

**v1 approach — controlled vocabulary with typeahead suggestion:** when a user types a business name, the system shows existing matches so they select the established entry instead of retyping it.

**This is suggest-only, not enforced.** A user may still create a new entry despite a suggested match. Duplicates become *rare*, not impossible — chosen knowingly, to avoid blocking legitimately similar new businesses and to keep backlog encoding fast.

The same business list also powers the three-state search result in §6.1.

### 3.4 Tracking where the paper is

Each document record carries the **current physical location** of its paper original — in the office, or transferred to the central storage building.

To keep this accurate, updates are **driven by the paper itself**, not by memory:

- A **QR code is generated and attached to the physical document.**
- Documents are **consolidated into a batch first**, then transferred.
- An editor **scans each document's QR code** to mark its new status/location.

Scanning each document is manual effort, and that is accepted — it is effort that produces truth.

### 3.5 Access and accountability

- **Viewing is open to all staff accounts.** This mirrors physical reality: the storage room is not locked to individuals; the *office* is. Any employee of the office can already access any file.
- **Editing is restricted**, so responsibility for any change has a clear owner.
- **Access is logged at the point the PDF is served** — recording who, which document, when, and the action (view / download / print). Search result listings are *not* logged; they are metadata only and logging them would be noise.

### 3.6 Deployment and connectivity

**On-premises, local server only.** The application is installed and run on a machine inside the office. It is **not hosted in the cloud and not reachable from outside the office network.** The data is sensitive business information the office wants to keep physically within the office.

**Normal operation requires no internet.** Scanning, uploading, searching, viewing, printing, and QR status updates all work on the local network with the connection down.

**One deliberate exception — outbound email.** Password recovery sends mail through an external SMTP service (Google). This is outbound only; it does not expose the system to inbound access. It is the single feature that depends on the office's internet connection, and it degrades gracefully: if the connection is down, **admin-initiated password reset (§6.5) remains available in person**, so no one is ever locked out waiting for a network.

---

## 4. Scope

### 4.1 In scope for v1

- PDF upload with metadata entry
- Metadata-based search with three-state results (§6.1)
- Controlled business vocabulary with typeahead duplicate suggestion
- Known-business list, seeded before launch and grown by use (§6.2)
- Physical location tracking (office / central storage building)
- QR code generation and scan-to-update-status
- Roles: viewer, editor, admin (§6.4)
- Account administration, password recovery, and session revocation (§6.5)
- Access logging on document serving (view / download / print)
- Search logging for success measurement (§5.3)
- Metadata change history with revert (§6.7)
- File version history on scan replacement (§6.7)
- Deletion request/approval workflow with soft delete and 90-day retention (§6.7)
- Local on-premises deployment

### 4.2 Out of scope for v1 (explicit)

| Excluded | Note |
|---|---|
| **OCR / full-text search of scan contents** | **Deferred to v2, not abandoned.** See §4.4. |
| Cloud hosting or access from outside the office | Contradicts §3.6 |
| Issuing certified/official copies | Printouts are internal reference only (§7.6) |
| Blocking or auto-merging duplicate business entries | Suggest-only by decision (§3.3) |
| Second-person verification of entered metadata | Would stall backlog throughput |
| Confirmed-miss tracking (linking an upload to the failed search that caused it) | Would add labor to a rushed clerk; search logs alone are accepted (§5.3) |
| Automated backups inside the application | Handled outside the app — and unowned (§8.1) |
| The scanning and encoding labor itself | An operational effort, not a deliverable |
| Retroactive QR tagging of undigitized backlog | Only digitized documents get QR codes |
| Self-registration | Accounts are created by an admin (§6.5) |

### 4.3 Rollout scope — what exists on launch day

The system launches **neither empty nor complete**: approximately **10% of the archive — the most in-demand documents — is pre-scanned before go-live.**

Rationale: a system requiring the full backlog before launch is unusable for the year-plus it takes to fill, while a system launched empty has nothing to offer. Seeding the hot 10% lets real usage begin immediately and tests the encoding process on a small batch before the whole archive is committed to it.

**Priority rule (a clerk can follow this without asking):**

1. **All businesses that made a request at the office this year** — highest demand.
2. **Previous year**, active business requests not yet case-closed.
3. **2024**, then progressively older years.
4. **2024 and older:** included at the decision of the office head/manager.
5. **Demand-trigger override:** any document, however old, whose business makes a request **this year** becomes in-demand *by definition* and is uploaded and included.

The **office head defines which businesses qualify.**

After go-live, the archive fills through the retrieval workflow itself (§6.3) rather than through a separate encoding project.

### 4.4 Planned for v2 — OCR

OCR is **deliberately sequenced after v1, not dropped.** With OCR, a third artifact is stored per upload: the **text extracted from the scan**, making documents searchable by their actual contents — a permit number, an address, a name buried mid-page.

Its value is that it **backs up the metadata rather than replacing it**: a mistagged document remains findable by its text, so the person doing data entry stops being a single point of failure.

It is deferred because OCR quality on old, faded, stamped, or handwritten paper is unreliable, it adds background processing and deployment complexity, and PDF conversion currently happens outside the system entirely. v1 must ship the reliable path first.

---

## 5. Success criteria

### 5.1 Baseline (measured from current practice)

| Measure | Today |
|---|---|
| Time to retrieve one document | **15–30 minutes** |
| Staff required to go faster | Additional staff pulled off their own work |
| Outcome quality | Search can end in an **unverified guess** that the file is at the central storage building — leading to a possibly wasted trip across the city |

### 5.2 Targets

1. **Retrieval time — under 1–2 minutes** for any document that has been encoded. This is a deliberately conservative target (the software itself answers in seconds); it accounts for real conditions — a staff member logging in, typing, reading results, and printing.
2. **Hit rate — at least 60%** of searches return the document the staff member wanted.
   *Why a threshold matters:* below it, clerks stop opening the system first and walk straight to the storage room. A tool that fails more often than it succeeds trains people not to use it, and adoption is close to unrecoverable once lost.
3. **No false denials.** The system must never tell staff a document does not exist (§6.1). A wrong "we have no record" told to a member of the public is a worse outcome than a slow search.

### 5.3 How success is measured

**Search logging is a v1 requirement**, not an afterthought — without it, the 60% target is unverifiable and the project falls back to opinion.

Each search records: what was searched, how many results were returned, and **whether the user opened a result.** "Searched and opened a document" is treated as a hit; "searched and opened nothing" is treated as a probable miss.

**Known weakness, accepted:** this yields *probable* misses, not confirmed ones — the system cannot tell whether a clerk who opened nothing gave up, found it elsewhere, or simply changed their mind. A stronger method exists (linking each upload back to the failed search that prompted it) but was **rejected because it adds work to an already-rushed employee** (§4.2). Trend direction over time is considered sufficient.

**Location accuracy has no automated measurement** and remains an open risk (§8.3).

---

## 6. Requirements

### 6.1 Search must return one of three states — never a bare blank

A blank result is useless: the clerk cannot tell "not encoded yet" from "does not exist," so they walk to the storage room anyway. Search therefore resolves to one of:

| State | Meaning | What the clerk does |
|---|---|---|
| **Found** | Business known, documents encoded | Open, read, print |
| **Known business, nothing encoded** | The business is real; its papers are physical | Go to the room or storage building — **this converts a useless blank into a directive** |
| **Not in the known list** | May be an older or inactive business | Check the ledger — **this is not a denial** |

**The system must never state that a document or business does not exist.** The known-business list is built partly from staff recollection, which is reliable for active businesses and unreliable for dormant ones (§7.11) — precisely the case where a confident denial would do the most damage.

### 6.2 A known-business list must exist before launch

This list is what makes §6.1 possible, and it doubles as the controlled vocabulary of §3.3 — **one artifact solves both problems.**

- **Source:** the office's existing transaction logs and notebook ledgers, plus staff knowledge. The city is provincial, not a metro center, so the universe of businesses is small enough for staff to enumerate.
- **Produced by:** staff with **editor/create** access — the same people accountable for other changes. Not viewers.
- **When:** before go-live, alongside the 10% pilot encoding.
- **Growth:** the list expands automatically as documents are encoded and requests are handled, so the dormant tail fills in over time rather than requiring anyone to recall it up front.

### 6.3 Retrieval workflow — the archive fills itself

The office **never releases original documents**; every client request already requires producing a copy. The system substitutes a scan for that photocopy, so encoding costs almost no additional labor.

**Required order when a searched document is not in the system:**

1. Staff searches the system → not found.
2. Staff retrieves the paper original.
3. Staff scans it.
4. **Staff uploads the scan with its metadata.**
5. **Staff prints the client's copy from the system.**
6. Paper original is returned; the client receives the printout.

**The upload must precede the print.** If uploading came last — after the client is served and the clerk's real task is done — it would be a step performed *after the reward*, and such steps get skipped under pressure. Skipped uploads would mean the most in-demand documents, the ones flowing through this exact path, never enter the archive and the hit rate never climbs.

Putting the upload **on the critical path to printing** makes the correct behavior the path of least resistance. A published office rule — *upload first, then print, for any document not yet in the system* — covers the remaining gap (§7.12).

### 6.4 Roles

| Role | Can do |
|---|---|
| **Viewer** | Search, view, download, print any document |
| **Editor** | Everything a viewer does, plus: upload documents and enter metadata, add and maintain business entries, generate QR codes, update physical location/status |
| **Admin** | Everything an editor does, plus: create accounts, assign and change roles, reset passwords, deactivate users |

Viewing is intentionally unrestricted across all roles (§3.5, §7.5).

### 6.5 Account administration

- **No self-registration.** Accounts are created by an admin.
- **Two password recovery paths**, so no single dependency can lock anyone out:
  - **Email reset** via outbound SMTP (§3.6) — convenient, but depends on the office's internet.
  - **Admin-initiated reset** — the admin sets a temporary password that the user must change at next login. Requires no internet and matches how this office already operates: everyone is in the same building.
- **Deactivation revokes access immediately.** A deactivated user's session is invalidated on their next request, so a departing staff member cannot continue browsing the archive. The account is deactivated, **not deleted**, so their upload and edit history remains attributable.

### 6.6 Access and search logging

- **Access log** — recorded when the PDF is served: who, which document, when, action (view / download / print). See §3.5 and §7.4 for what this log can and cannot prove.
- **Search log** — recorded per search: query, result count, whether a result was opened. Feeds §5.3.

### 6.7 Correcting mistakes

Governing principle: **corrections stay fast and unblocked; destructive acts require authority; nothing inside 90 days is irreversible.**

**Metadata changes — free, but never silent.**
Editors may correct metadata without approval. Requiring approval for every typo, date, or misspelled subject would queue routine work behind the office head and stall encoding throughput.

Instead, **every change records the old value, the new value, who changed it, and when.**

*Why this matters more than it appears:* the metadata card is the only way into a document (§3.2), and v1 has no OCR to recover it by content. So changing a business name to a wrong value makes a document **exactly as unfindable as deleting it** — and would do so without triggering any approval. Silent re-tagging is deletion by another name. Change history does not prevent it; it makes it **visible, attributable, and reversible**, which is the achievable goal.

**Revert.**
- The **original editor** may revert their own change. Their justification is their own — consistent with §3.5, where the person who made a change owns it.
- **Admin fallback:** an admin may revert any change, recorded as an admin action rather than as the original editor's. This is required because deactivated accounts persist (§6.5) — without a fallback, a departed clerk's mis-tagged records would be **permanently unrevertable**, leaving only manual retyping, which appears in history as a fresh edit rather than an undo.

**Replacing a scan (wrong PDF uploaded).**
The superseded file is **retained as a previous version, never overwritten.** Without this, replacing a file would be a destructive act that bypasses the deletion approval gate below — the same hole one layer down — and revert would have nothing to revert to.

**Deletion — requires approval.**
1. The person who made the mistake files a **deletion request with a written justification.** Requiring the reason to be stated is what prevents a mistake from being quietly removed.
2. The request triggers **approval by the office head** in the system. Both the request and the decision are logged.
3. **On filing, the system automatically hides the document from search; on rejection, it restores it.** Hiding is a *state produced by the workflow*, not an action any user can invoke — so no one can hide a document unilaterally or silently, while a wrong document is not left exposed to every staff account (§7.5) for however many days the office head is away.
4. An approved deletion is a **soft delete**, not immediate removal.

**90-day retention window.**

| Item | Retention |
|---|---|
| Current file version | Never purged |
| Superseded file versions | 90 days, then purged automatically |
| Soft-deleted documents | 90 days, then purged automatically |

Purging is **automatic and scheduled — no user holds a permanent-delete button.** This is deliberate: a manual purge would become the quiet bypass that file replacement almost became, and it keeps an approval given carelessly on a busy day recoverable.

90 days is chosen because mistake recovery is a **short-horizon need** — a wrong scan surfaces within hours or days, not years — while unbounded retention grows the disk on a single local server and makes the already-unowned backup task (§7.7) heavier every month. After the window, the paper original remains the fallback (§7.10).

---

## 7. Limitations (accepted, and to be stated to the office before launch)

**7.1 Search quality equals data-entry quality.** The system searches typed metadata, not document contents. A document tagged wrongly is unfindable, and v1 has no OCR safety net to catch it.

**7.2 Duplicate business entries will occur.** Typeahead suggestion reduces them; it does not prevent them. When a business is entered twice under slightly different names, its documents split across both and a search finds only part.

**7.3 Data quality depends on user training, and training decays.** Trained staff leave; temporary staff are hired to encode backlog without the same briefing; under time pressure, people click past suggestions. **Nothing in the software resists this** — it is a policy responsibility the office owns.

**7.4 The access log is a deterrent and a record, not a protection.** Any user who can view a document can copy it by other means — browser save, screenshot, or photographing the screen. Printing without downloading does not change this, because the file must reach the user's machine to be displayed at all. Confidentiality ultimately depends on office policy, not on the software.

**7.5 There are no visibility restrictions between staff.** Every account can view every document. This is intentional and matches current physical practice, but it means the system converts a physically-guarded archive into a queryable one, and that change is not reversible once made.

**7.6 Printouts are for internal reference only.** They are not certified true copies and carry no seal, signature, or issuing mark. Official copies must still be produced from the paper original.

**7.7 The local server is a single point of failure, and backups are a manual human habit.** Local hosting brings no cloud redundancy. A drive failure, theft, ransomware, or flood destroys the index and every hour of encoding work — while the paper originals survive, returning the office to the storage room. **Backups must be taken off the machine on a schedule and stored elsewhere, by a named person.**

**7.8 Administration currently depends on one unpaid non-employee.** See §7.13.

**7.9 Location data covers only digitized documents.** Roughly 90% of the backlog has no QR code, so transfers of those documents to central storage remain untracked. This gap shrinks only as the backlog is encoded.

**7.10 Paper originals are never destroyed.** The scan is a retrieval index, not a legal replacement. The storage room and central storage building remain the source of truth — which is also the safety net behind every limitation above.

**7.11 "Not in the known list" is permanently weaker than "does not exist."** The business list is seeded from transaction logs and staff recollection, both of which favour active businesses over dormant ones. The system answers strongly for active businesses and weakly for old or closed ones — and by design it never converts that weakness into a denial (§6.1).

**7.12 The upload-before-print rule can still be bypassed.** The office has a copier. A rushed clerk can photocopy the original and skip the system entirely. The workflow in §6.3 makes uploading the path of least resistance; it does not make bypassing impossible.

**7.13 The system depends on a single unpaid, non-employee administrator with no succession plan.** During the interim period the developer administers the system — creating accounts, resetting passwords, deactivating leavers — without pay, without an employment relationship, and without formal IT authority. If that person becomes unavailable before the organization absorbs the system, **no one can perform those functions.**

This arrangement is temporary by intent and is **built with the consent of the office head**, with transparency about what the administrator can technically access. But consent is not a control: the interim administrator necessarily holds access to data that only an employee of the organization should hold. **That is the primary reason the role must transfer**, independent of whether the system works well.

**Handover condition (to be agreed in writing before go-live):** the developer administers the system for **six (6) months from go-live**. Before that period ends, the organization must name an internal administrator and the role transfers to them. Identifying and qualifying that person is the organization's HR responsibility, not a system feature.

> **Note for the organization:** an office that has never staffed IT for this unit (§1.1) is unlikely to create the role spontaneously. The most probable outcome of a *successful* launch is an expectation that the unpaid arrangement continues indefinitely. The handover condition exists to prevent that by default.

---

## 8. Open risks (challenged in review, not resolved)

**8.1 No one is named as owner of backups.** This is the highest unresolved risk in the project. Local-only hosting, no IT support anywhere in the organization, and no authority to compel a policy — combined with a system the office will depend on within a year. *Must be assigned before real data goes in.*

**8.2 No one is named as owner of duplicate cleanup.** Suggest-only dedupe was chosen on the assumption that duplicates would be merged periodically. No role has been assigned to do it.

**8.3 A stale location gives a confident wrong answer, and nothing verifies it.** This is a worse failure mode than a missing record: a wrong tag returns *nothing* and the clerk knows to keep looking, but a stale location sends them to the wrong building. QR-driven updates mitigate this for digitized documents only (§7.9), and there is **no automated way to check location accuracy** short of physically verifying files.

**8.4 The "most in-demand 10%" is a judgment call with no data behind it.** The office keeps no retrieval log, so demand is estimated from experience, not measured. If the pilot set is chosen wrongly, staff search, fail to find, and conclude the system is useless — a failure with nothing to do with the software's quality.

**8.5 Adoption is unproven.** The office has never run any system. Nothing about this project has been tested against how staff actually behave under workload.

**8.6 Approval fatigue will hollow out the deletion gate.** The office head approves deletion requests while also running the office. The realistic failure is not refusal but **routine approval without reading the justification** — at which point the gate is theatre and the written reason is a formality. The 90-day soft delete (§6.7) limits the damage of a careless approval but does not address the cause. Nothing currently tracks approval rates or flags an unusual volume of requests from one editor.

**8.7 Disk capacity is unmonitored.** Version history and soft-deleted documents bound the growth rate but the archive only grows. On a single local server, a full disk means **uploads fail during the retrieval workflow, with a client waiting.** No one is assigned to watch free space, and no alert exists.

**8.8 The six-month handover has no named successor and no enforcement.** §7.13 now sets the duration, but nothing obliges the organization to name an internal administrator by month six, and the developer has no leverage once the system is working and depended upon. The realistic failure is silent drift past the deadline rather than a refusal.

---

## 9. Kill criteria — when to stop and rethink

- **Hit rate stays below 60% after the pilot period** → the encoding strategy is wrong, not the software. Revisit what gets encoded before building anything further.
- **Metadata search fails during the pilot** (staff cannot find documents they know exist) → OCR becomes v1's centerpiece. Do not bolt it on mid-build.
- **Staff stop searching the system first and go straight to the storage room** → adoption is failing; stop adding features and find out why.
- **Duplicate business entries accumulate unmerged during the pilot** → suggest-only was the wrong call; enforcement or a mandatory merge process must be designed before scaling up.
- **The office asks for certified or official copies to issue to clients** → stop; copy certification (watermark, reference number, issuing officer, date) is a requirement to design deliberately, not a feature to add after launch.
- **No one accepts ownership of backups** → do not allow the system to hold sole-copy data; it stays a convenience index over surviving paper, and that must be said explicitly to the office.
- **Location tracking proves unreliable in the pilot** → remove the feature rather than let the system state a location it cannot stand behind.
- **The office requires per-user or per-department document restrictions** → stop and design authorization first; §7.5 flat access is a structural assumption, not a setting.
- **Deletion requests become routine volume rather than rare exceptions** → the problem is upstream in encoding quality or training (§7.3), not in the deletion workflow. Fix the cause; do not streamline the gate.
- **The organization declines to name an internal administrator at the end of the six-month interim** → escalate before extending; §7.13 exists precisely so this is a decision, not a drift.

---

## 10. Not yet defined

The following must be worked through before implementation begins:

- The exact metadata field list and which fields are mandatory
- Document type list and business/location data structure
- Data model and schema
- Architecture and technical design
- QR code format, generation, and scanning mechanism
- Test strategy, deployment procedure, and operations
- Who the internal administrator will be at the end of the six-month interim (§8.8)
- Whether anyone monitors disk capacity, and how they are alerted (§8.7)
