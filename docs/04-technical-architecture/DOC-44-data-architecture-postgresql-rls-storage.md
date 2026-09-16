---
id: DOC-44
title: "Data Architecture, PostgreSQL, RLS & Storage"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Data Architecture"
canonical_domain_owner: data_architecture
depends_on:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-09
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-14
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-19
  - DOC-31
  - DOC-32
  - DOC-36
  - DOC-41
  - DOC-42
  - DOC-43
  - ADR-001
  - ADR-002
decision_families:
  - DTA
last_updated: 2026-09-15
---

# DOC-44 — Data Architecture, PostgreSQL, RLS & Storage

> **Status:** APPROVED.  
> **Role:** Define the persistent runtime data model, relational invariants, transaction strategy, Supabase access posture, Row Level Security baseline, storage policy, indexing, retention hooks and migration contract for the portfolio.

---

## 1. Purpose

DOC-36 defines canonical professional content. DOC-41 separates repository-owned facts from runtime state. DOC-43 defines application-service invariants. DOC-44 now converts the runtime-owned portion into a concrete PostgreSQL/Supabase persistence architecture.

This document defines:

- which data belongs in PostgreSQL and which explicitly does not;
- relational table boundaries and relationships;
- identifiers, timestamps, constraints and concurrency tokens;
- Guestbook/Sketch/report/moderation schemas;
- Arcade sessions, evidence and leaderboard scores;
- Admin profile/audit data;
- abuse-ban persistence without creating a hidden visitor profile;
- Contact idempotency metadata without storing Contact message bodies;
- atomic persistence procedures needed by DOC-43 transactions;
- grants and RLS posture for `anon`, `authenticated` and privileged server access;
- migration and generated-type conventions;
- indexing and pagination baselines;
- deletion, retention and cleanup hooks;
- Supabase Storage policy and why V1.x does not need arbitrary visitor uploads;
- database-level test gates.

It intentionally does **not** finalize:

- admin credential factors, MFA, passkeys, recovery or session rotation — DOC-45;
- external feed cache tables/jobs/TTLs and scheduled refresh — DOC-46;
- exact HMAC construction, key rotation, rate limits, Turnstile triggers, CSRF/CSP or threat mitigations — DOC-47;
- Supabase project/branch topology, backups, DNS and deployment wiring — DOC-48;
- production SLOs, query-alert thresholds and observability provider — DOC-49;
- the complete test pyramid/tool versions — DOC-50;
- CI workflow syntax, schema-diff automation and repository protection rules — DOC-51.

---

## 2. Data north star

> **Version-controlled facts stay in the repository. Runtime state is relational, explicit, least-privileged and transactional. Public participation never becomes an implicit identity graph.**

The database is not a dumping ground for every object visible in the UI.

The architecture must preserve four already-approved ownership classes:

```text
Repository / build-owned
→ professional facts, projects, achievements content, CV source, long-form narrative

PostgreSQL runtime-owned
→ moderated UGC, reports, Arcade authority, admin/audit, abuse-control state,
  narrow delivery/idempotency metadata

Local-device owned
→ Widget Field preferences, theme, sound, motion, onboarding, local achievements

External-derived cache owned
→ GitHub / Tech Pulse / provider cache data (DOC-46)
```

A database row must not become canonical merely because it is easier to edit in a dashboard.

---

## 3. Explicit non-database data

The following remain outside PostgreSQL in the baseline:

- profile biography and public identity facts;
- work experience;
- education;
- certifications;
- skills/technology catalog;
- canonical projects and project lifecycle;
- project visual context;
- project case-study narrative;
- professional achievements content;
- CV source data;
- project media manifests;
- static/localized core copy;
- visitor Widget Field preferences;
- local playful achievement unlocks;
- Contact message body/email/name after successful delivery;
- arbitrary uploaded visitor images.

If implementation proposes tables such as `projects`, `experience`, `skills` or `certifications` as a second source of truth, it requires an approved source-of-truth ADR rather than a migration shortcut.

---

## 4. PostgreSQL platform baseline

Runtime relational persistence uses PostgreSQL managed by Supabase.

Baseline principles:

- SQL migrations are source-controlled;
- database behavior is reproducible locally and in every environment;
- primary application tables live in the default application schema unless a concrete isolation need justifies another schema;
- helper/security functions that should not become Data API contracts may live in a non-exposed `private` schema;
- no application dependency on manually edited production-only tables;
- no direct browser SQL/database driver;
- no ORM-generated schema becomes authoritative over migrations.

The application may use Supabase-generated TypeScript database types, but those generated files are outputs, not hand-authored source.

---

## 5. Supabase API-key terminology

The implementation baseline uses current Supabase key terminology:

```text
Publishable key
→ browser-safe application key
→ maps unauthenticated requests to `anon`
→ authenticated user JWT may map to `authenticated`

Secret key
→ server-only elevated key
→ maps to `service_role`
→ bypasses RLS
```

Legacy `anon` / `service_role` JWT keys may still exist in older projects, but new implementation documentation and environment variables should prefer **publishable/secret** terminology.

A secret key is never placed in:

- browser bundles;
- `NEXT_PUBLIC_*` variables;
- source control;
- client logs;
- rendered HTML;
- public CI output.

---

## 6. Database access posture

The portfolio deliberately does **not** expose runtime tables directly to signed-out visitors.

Baseline:

```text
Browser public UI
→ no direct runtime-table reads/writes

Browser admin auth
→ Supabase Auth may use publishable key

Next.js application services/repositories
→ narrow server-owned database adapter
→ privileged secret-key database client when persistence access is required
```

Why this is preferred here:

- public content already server-renders through the app;
- every public mutation requires validation/abuse policy anyway;
- Guestbook/Sketch rows contain internal moderation/abuse fields that should not become browser-queryable contracts;
- Arcade tables contain anti-cheat/session evidence;
- direct admin writes would bypass mandatory audit/optimistic-concurrency services;
- reducing Data API grants reduces attack surface.

This is not permission to use privileged access casually. Secret-key use is confined to repository/infrastructure modules whose methods implement the narrow ports approved in DOC-43.

---

## 7. RLS and grants baseline

Every application table created in an exposed schema must:

1. explicitly enable RLS;
2. explicitly revoke unintended `anon` / `authenticated` grants;
3. receive only the grants/policies required by an approved access path;
4. be covered by allow/deny database tests.

The baseline is **deny by default**.

For most runtime domain tables:

```sql
alter table public.<table> enable row level security;
revoke all on table public.<table> from anon, authenticated;
```

There is no `anon` INSERT path for Guestbook, Sketches, Reports or Arcade scores. Public submissions pass through Next.js application services, which then use the privileged repository adapter.

---

## 8. Why RLS still matters with server-owned access

The server-owned secret key bypasses RLS, but RLS/grants still matter because they:

- prevent accidental future publishable-key table exposure;
- protect against feature code that incorrectly introduces a browser Supabase query;
- define the explicit Data API contract;
- preserve a safe baseline if Auth/browser use expands later;
- make security posture testable at the database boundary.

RLS is defense-in-depth, not a substitute for DOC-43 authorization.

---

## 9. Admin profile boundary

Supabase Auth owns credentials/session identity.

The application database owns only an allowlist-style admin profile:

```sql
public.admin_profiles
```

Baseline columns:

| Column | Type | Rule |
|---|---|---|
| `user_id` | `uuid` | PK; FK to `auth.users(id)`; stable admin actor ID |
| `display_name` | `text` | private operational label |
| `created_at` | `timestamptz` | server timestamp |
| `disabled_at` | `timestamptz null` | null means enabled |

Initial authorization meaning:

> an authenticated Auth user is an application admin only when a non-disabled `admin_profiles` row exists for that exact `auth.uid()`.

V1.x does not pre-build a generalized RBAC system. Future moderator/editor roles require DOC-45/ADR evolution.

---

## 10. Admin-profile RLS

`authenticated` may receive **read-only self lookup** on `admin_profiles` so server-auth plumbing can verify the session without granting domain mutations.

Conceptual policy:

```sql
create policy "admin can read own active profile"
on public.admin_profiles
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and disabled_at is null
);
```

No browser-authenticated role receives direct INSERT/UPDATE/DELETE grants on moderation, reports, bans, scores or audit tables.

Privileged changes must continue through application services so audit/idempotency/concurrency rules cannot be bypassed by a valid admin session.

---

## 11. Helper function security

If RLS/helper functions are introduced:

- place security-sensitive helpers in an unexposed `private` schema where practical;
- use `SECURITY DEFINER` only when required;
- set a fixed/empty `search_path` and fully qualify referenced objects;
- revoke broad `EXECUTE` grants;
- grant execution only to the role that needs it;
- test both allowed and denied callers.

No helper function may become an accidental privilege-escalation RPC.

---

## 12. Domain status representation

Application lifecycle/status values use `text` columns with named `CHECK` constraints rather than PostgreSQL native enums in the baseline.

Reasons:

- easier safe evolution across deployments;
- easier removal/rename than native enum values;
- stale-client protocol handling remains explicit;
- application schemas still provide TypeScript unions.

Example:

```sql
moderation_status text not null
  check (moderation_status in ('pending','approved','rejected','hidden'))
```

A migration must update database checks and application runtime schemas atomically when a status vocabulary changes.

---

## 13. Identifier strategy

Runtime entities use UUID primary keys generated server-side/database-side.

Baseline:

```sql
uuid primary key default gen_random_uuid()
```

V1.x does not introduce sequential public IDs merely for aesthetics.

UUIDs provide:

- opaque route/resource references;
- easy generation across transactional functions;
- low accidental enumeration value;
- consistent shape across domains.

UUID opacity is not authorization.

---

## 14. Operation identifiers

Retryable logical mutations receive a separate `operation_id uuid` supplied/generated by the application layer.

Resource ID and operation ID have different meanings:

```text
resource id
→ what record is this?

operation id
→ which logical user action created/changed it?
```

Operation IDs support idempotency and audit without overloading primary keys.

---

## 15. Request fingerprints

Where DOC-43 requires “same operation ID + materially different payload = conflict”, persistence stores a **keyed request fingerprint**, not the raw sensitive body.

The HMAC algorithm/domain-separation contract is defined in DOC-47; operational secret rotation is coordinated with DOC-48.

Database contract:

```text
request_fingerprint bytea
fingerprint_key_version smallint
```

A raw SHA-256 of low-entropy PII is not considered sufficient privacy protection.

---

## 16. Time model

Persistent timestamps use PostgreSQL `timestamptz`.

Baseline:

- database writes use `now()` / trusted server time;
- serialized API timestamps are ISO-8601 UTC per DOC-43;
- visitor-local formatting happens in the presentation layer;
- client-supplied timestamps are never accepted as authoritative creation/publication times.

Common fields:

```text
created_at
updated_at
published_at
resolved_at
expires_at
retention_until
```

Only use columns whose semantics are meaningful for that table.

---

## 17. `updated_at` policy

A single small database trigger/helper may maintain `updated_at` automatically on mutable rows.

This trigger is permitted because it enforces persistence metadata, not business transitions.

Version/concurrency increments are **not** hidden in the same trigger; they remain explicit in transactional mutations.

---

## 18. JSONB policy

JSONB is allowed only for data that is structurally bounded but game/drawing-specific enough that normalized columns would create artificial schema churn.

Approved baseline JSONB uses:

- validated Sketch logical drawing model;
- bounded Arcade display stats/evidence;
- safe audit change summaries where appropriate.

JSONB is not used to avoid relational modelling for:

- moderation status;
- reports;
- admin actors;
- timestamps;
- scores;
- nicknames;
- bans;
- foreign-key relationships.

Do not add a GIN index to JSONB merely because the column exists. Index only query patterns that actually exist.
## 18A. Repository-authored managed status is not a runtime table

`Currently Building` / `content/managed-status` remains repository-authored in the approved V1.x baseline. DOC-44 intentionally defines no `managed_status`/`currently_building` runtime table. A future move to DB authority requires a source-of-truth migration ADR before schema work begins.


---

## Community / UGC relational model

## 19. Common Community submission parent

Guestbook and Sketch share moderation/reporting behavior. Instead of duplicating those columns, use a common parent row:

```text
community_submissions
├── guestbook_entries (1:1 subtype)
└── sketches          (1:1 subtype)
```

Reports/reactions reference the parent submission.

This is a **UGC-domain abstraction**, not a visitor-profile abstraction.

---

## 20. `community_submissions`

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `submission_type` | `text` | `guestbook` or `sketch` |
| `public_nickname` | `text` | presentation metadata, not identity |
| `moderation_status` | `text` | pending/approved/rejected/hidden |
| `moderation_version` | `integer` | optimistic-concurrency token; starts at 1 |
| `operation_id` | `uuid` | logical submission action |
| `request_fingerprint` | `bytea` | keyed fingerprint |
| `fingerprint_key_version` | `smallint` | key-rotation metadata |
| `abuse_key` | `bytea` | feature-scoped pseudonymous abuse key |
| `abuse_key_version` | `smallint` | security key version |
| `deletion_token_hash` | `bytea` | SHA-256 digest of a server-generated 256-bit deletion capability returned once to the submitter |
| `created_at` | `timestamptz` | authoritative submission time |
| `updated_at` | `timestamptz` | persistence update time |
| `published_at` | `timestamptz null` | first public approval time |
| `last_moderated_at` | `timestamptz null` | latest moderation action |
| `last_moderated_by` | `uuid null` | FK to admin profile |
| `retention_until` | `timestamptz null` | policy hook, not universal auto-delete |

Key checks:

```text
submission_type ∈ guestbook, sketch
moderation_status ∈ pending, approved, rejected, hidden
moderation_version >= 1
trimmed nickname length within DB safety cap
approved => published_at is not null
```

Unique idempotency constraint:

```text
UNIQUE (submission_type, operation_id)
```

---

## 21. Public nickname limits

Backend/product validation owns user-facing grapheme rules.

The database adds a coarse safety cap, for example:

```sql
char_length(btrim(public_nickname)) between 1 and 40
```

The DB check is a corruption guard, not the only Unicode/text safety layer.

No email, Auth user ID or cross-feature visitor ID is attached to the nickname.

---

## 22. Feature-scoped abuse keys

`community_submissions.abuse_key` is generated by the Security layer from a **feature-specific namespace**.

The same browser/network context must not intentionally produce one universal correlation token across:

```text
guestbook
sketch
reports
arcade
contact
```

For example, a Guestbook-scoped key and Sketch-scoped key for the same visitor context should be cryptographically unlinkable without access to the server's keying scheme.

This preserves DOC-43's no-hidden-profile rule while still supporting rate/duplicate controls.

---

## 23. `guestbook_entries`

Guestbook-specific content lives in a strict 1:1 subtype table:

| Column | Type | Rule |
|---|---|---|
| `submission_id` | `uuid` | PK/FK → `community_submissions(id)` ON DELETE CASCADE |
| `message` | `text` | plain text only |
| `content_fingerprint` | `bytea` | optional keyed/normalized duplicate signal |

Database safety cap example:

```sql
char_length(message) between 1 and 1000
```

Application validation may use a smaller UX limit.

No HTML, Markdown execution, embedded script or arbitrary URL metadata is stored as trusted rich content.

---

## 24. `sketches`

Sketch-specific content stores the canonical validated logical drawing representation:

| Column | Type | Rule |
|---|---|---|
| `submission_id` | `uuid` | PK/FK → parent ON DELETE CASCADE |
| `drawing_schema_version` | `integer` | protocol version |
| `logical_width` | `integer` | bounded positive logical canvas width |
| `logical_height` | `integer` | bounded positive logical canvas height |
| `drawing_model` | `jsonb` | canonical server-validated logical drawing |
| `content_fingerprint` | `bytea` | canonical content digest/fingerprint |
| `render_revision` | `integer` | cache-busting renderer revision; starts at 1 |

Baseline DB guards include:

```text
jsonb_typeof(drawing_model) = 'object'
logical_width / logical_height within supported safe bounds
drawing_schema_version >= 1
render_revision >= 1
serialized JSON safety cap (for example <= 128 KiB)
```

Fine-grained stroke/object complexity is validated in the application service before persistence.

---

## 25. Exactly-one-subtype invariant

For every `community_submissions` row:

- `submission_type = guestbook` must have exactly one `guestbook_entries` row and no Sketch row;
- `submission_type = sketch` must have exactly one `sketches` row and no Guestbook row.

A cross-table `CHECK` cannot enforce this declaratively.

Therefore creation occurs through a single atomic database persistence function/RPC per submission type, and database integration tests assert the invariant.

Arbitrary repository code must not independently insert the parent and forget the subtype.

---

## 26. Moderation lifecycle

The persistent moderation vocabulary is exactly:

```text
pending
approved
rejected
hidden
```

Application-service transitions remain authoritative:

```text
pending  → approved
pending  → rejected
approved → hidden
## Hidden → approved restoration is not part of the V1.2 baseline
```

The database atomic procedure enforces expected-version matching and rejects impossible transitions even if a caller bypasses UI affordances.

`reported` is never a moderation status.

---

## 27. Publication timestamp semantics

`published_at` records the first time an item became publicly eligible.

When an approved item becomes hidden:

- preserve its historical `published_at`;
- public queries exclude it because `moderation_status != approved`;
- restoring it does not pretend it was first published today unless product policy explicitly changes.

This gives stable chronology and auditability.

---

## 28. Moderation optimistic concurrency

`moderation_version` is incremented only by authoritative moderation mutations.

Atomic update shape:

```sql
update ...
set moderation_status = :next,
    moderation_version = moderation_version + 1,
    ...
where id = :id
  and moderation_version = :expected_version;
```

Zero updated rows means conflict/not-found and must not be silently treated as success.

---

## 29. Public Community reads

Public Server Components/application services select only approved rows and only public-safe columns.

No public projection includes:

- abuse keys;
- request fingerprints;
- moderation version;
- admin IDs;
- retention metadata;
- report counts unless explicitly intended;
- rejected/hidden/pending rows.

The public DTO remains an application allowlist even though the DB repository is privileged.

---

## 30. Community pagination

Use cursor/keyset pagination rather than unbounded offset scans as lists grow.

Guestbook/Sketch baseline ordering:

```text
published_at DESC
id DESC
```

Cursor carries the last `(published_at, id)` pair.

Page size is bounded by backend schema.

---

## Reports / reactions

## 31. `community_reports`

Reports reference the common submission parent.

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `submission_id` | `uuid` | FK → community submission ON DELETE CASCADE |
| `reason_code` | `text` | allowlisted simple reason |
| `report_status` | `text` | open/resolved/dismissed |
| `report_version` | `integer` | optimistic concurrency |
| `operation_id` | `uuid` | retry identity |
| `request_fingerprint` | `bytea` | keyed payload fingerprint |
| `fingerprint_key_version` | `smallint` | key version |
| `reporter_abuse_key` | `bytea` | reports-scoped pseudonymous key |
| `abuse_key_version` | `smallint` | key version |
| `created_at` | `timestamptz` | authoritative time |
| `resolved_at` | `timestamptz null` | resolution/dismissal time |
| `resolved_by` | `uuid null` | admin FK |
| `resolution_note` | `text null` | bounded private admin note |
| `retention_until` | `timestamptz null` | policy hook |

Checks:

```text
report_status ∈ open, resolved, dismissed
report_version >= 1
reason_code belongs to approved allowlist
```
## 31A. Canonical report reason constraint

`community_reports.reason_code` is constrained to:

```text
spam
harassment_or_abuse
personal_data
inappropriate_content
deceptive_or_impersonation
other
```

Schema migrations enforce this allowlist through a named CHECK (or equivalent versioned lookup if a future migration requires extensibility).


---

## 32. Report deduplication

The database prevents obvious repeated open reports from the same reports-scoped pseudonymous context for the same item/reason.

Preferred partial unique index:

```text
(submission_id, reporter_abuse_key, abuse_key_version, reason_code)
WHERE report_status = 'open'
```

This is flood resistance, not proof that two reports come from the same real person.

---

## 33. Report independence

A report row never automatically changes `community_submissions.moderation_status` through a database trigger.

Any safety automation threshold must be explicitly approved in Security/Product architecture and implemented as an application policy.

The default remains:

```text
approved submission + open report
= valid database state
```

---

## 34. Optional reaction table

Reactions are optional V1.2 depth and do not need to exist in the initial schema migration.

If enabled, create:

```text
community_reactions
```

with at minimum:

```text
id
submission_id
reaction_code
reactor_abuse_key
abuse_key_version
created_at
```

Rules:

- reaction code is allowlisted;
- no public actor list;
- feature-scoped abuse key only;
- unique per `(submission, reaction, scoped actor)` if multiple reaction types are allowed;
- aggregate counts are derived from rows initially;
- no denormalized counters until measured need justifies them.
## 34A. Canonical reaction constraint

If reactions ship, `reaction_code` is constrained to:

```text
like
love
inspiring
```

Changing this set is a product/schema change, not an arbitrary frontend choice.


---

## 35. Social Activity

V1.2 Social Activity, if shipped, is initially a **derived projection** over approved/published Community rows and reaction events.

Do not create a second `social_activity` event table just to duplicate the same facts.

Introduce durable activity events only if a later requirement needs events that cannot be derived reliably.

---

## Admin / audit / abuse control

## 36. `admin_audit_events`

Privileged state changes create durable audit rows.

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `actor_admin_id` | `uuid` | FK → admin profile; admin profiles are disabled, not deleted |
| `action` | `text` | allowlisted audit action |
| `target_type` | `text` | submission/report/ban/etc. |
| `target_id` | `uuid` | intentionally no FK so history survives target purge |
| `before_summary` | `jsonb null` | minimal non-sensitive state summary |
| `after_summary` | `jsonb null` | minimal non-sensitive state summary |
| `reason` | `text null` | bounded operational reason |
| `operation_id` | `uuid` | idempotent admin command identity |
| `request_id` | `text` | correlation ID from backend |
| `occurred_at` | `timestamptz` | authoritative DB time |

Audit does not copy full Guestbook messages, drawing models, anti-cheat evidence or Contact content.
## 36A. Canonical audit action constraint

`admin_audit_events.action` uses the approved dotted codes:

```text
submission.approve
submission.reject
submission.hide
report.resolve
report.dismiss
ban.create
ban.revoke
privacy.delete_content
privacy.anonymize_content
score.remove
```

No `submission.restore` action exists in the V1.2 baseline.


---

## 37. Audit immutability posture

Application code receives no normal UPDATE/DELETE pathway for audit events.

Audit records are append-only during normal operation.

Retention/legal deletion exceptions, if ever required, are explicit privileged maintenance procedures documented by Security/Privacy architecture.

---

## 38. Audit operation uniqueness

An admin mutation's operation ID should not produce duplicate audit actions.

Use a unique constraint appropriate to the atomic mutation contract, normally:

```text
UNIQUE (operation_id)
```

when operation IDs are globally generated UUIDs for privileged commands.

---

## 39. `abuse_bans`

Bans store opaque privacy-conscious subjects, not identities.

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `subject_hash` | `bytea` | HMAC-derived opaque subject |
| `subject_key_version` | `smallint` | rotation metadata |
| `subject_namespace` | `text` | contact/guestbook/sketch/reports/reactions/arcade; feature-scoped in V1.x |
| `enforcement_scope` | `text` | same feature-scoped enforcement domain; no universal public-write subject in V1.x |
| `reason_code` | `text` | private operational reason class |
| `reason_note` | `text null` | bounded private note |
| `created_by` | `uuid` | admin FK |
| `created_at` | `timestamptz` | timestamp |
| `expires_at` | `timestamptz` | finite unless an approved policy permits otherwise |
| `revoked_at` | `timestamptz null` | null means not explicitly revoked |
| `revoked_by` | `uuid null` | admin FK |
| `revoke_reason` | `text null` | bounded note |

A ban row never claims “this is person X”.
## 39A. Canonical ban reason constraint

`abuse_bans.reason_code` is constrained to:

```text
spam
automation
abuse
security
other
```

Bans remain feature-scoped in V1.x.


---

## 40. Active-ban query

A ban is active when:

```text
revoked_at IS NULL
AND expires_at > now()
```

Do not attempt a partial unique index using `now()` as a predicate.

Instead use an index over stable columns such as:

```text
(subject_hash, subject_key_version, enforcement_scope, expires_at)
WHERE revoked_at IS NULL
```

Application policy handles overlapping/renewed bans idempotently.
## Abuse-rate persistence

## 40A. `abuse_rate_limit_buckets`

The serverless-safe V1.x baseline for `AbuseGuard` is a narrow PostgreSQL-backed fixed-window/rolling-window bucket model. Do not use process-memory Maps as authoritative rate-limit state.

Baseline logical columns:

| Column | Type | Notes |
|---|---|---|
| `policy_id` | `text` | stable central policy identifier |
| `subject_hash` | `bytea` | feature-scoped abuse HMAC subject |
| `subject_key_version` | `smallint` | abuse-key rotation version |
| `window_started_at` | `timestamptz` | normalized server-owned window boundary |
| `window_seconds` | `integer` | positive bounded window size |
| `count` | `integer` | atomic consumption count |
| `expires_at` | `timestamptz` | cleanup horizon; baseline = window end + 48h |
| `updated_at` | `timestamptz` | authoritative DB timestamp |

Primary/unique identity is the policy + scoped subject + key version + window boundary. No raw IP is stored.

## 40B. Atomic consumption RPC

Use a narrow privileged persistence function such as `app_consume_rate_limit(...)` to atomically insert/increment the bucket and return the resulting count/remaining decision. The Application/Security layer still owns policy selection and allow/deny semantics; SQL only supplies concurrency-safe counters.

Correctness requirements:

- one public request may consume multiple policy windows (for example burst + 24h rolling cap);
- retries cannot decrement/reset counts;
- bucket cleanup is operational and does not reset an active logical window early;
- public/anon/authenticated browser roles cannot invoke the privileged RPC directly;
- policy IDs and window lengths come from centrally versioned server configuration;
- a future Redis/edge limiter may replace this repository behind the same `AbuseGuard` interface only through evidence-backed change control.


---

## Contact delivery metadata

## 41. No Contact inbox table

DOC-43 is preserved:

> V1.0 does not persist Contact name, email and message body as a general-purpose database inbox.

There is no baseline table such as:

```text
contact_messages
contact_leads
contact_submissions_with_body
```

The Contact form is not a covert CRM.

---

## 42. Contact operation ledger

To make retry behavior more robust without retaining message content, use a narrow metadata ledger:

```text
contact_delivery_operations
```

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `operation_id` | `uuid` | PK |
| `request_fingerprint` | `bytea` | keyed fingerprint of normalized request |
| `fingerprint_key_version` | `smallint` | rotation metadata |
| `delivery_status` | `text` | claimed/accepted/retryable_failure/terminal_failure/unknown_outcome |
| `provider_code` | `text` | e.g. resend; no provider SDK type leakage |
| `provider_message_id` | `text null` | safe provider reference |
| `attempt_count` | `integer` | bounded >= 0 |
| `lease_until` | `timestamptz null` | crash/retry claim lease |
| `last_error_code` | `text null` | safe normalized code only |
| `created_at` | `timestamptz` | timestamp |
| `updated_at` | `timestamptz` | timestamp |
| `expires_at` | `timestamptz` | baseline seven-day local idempotency ledger horizon |

No name/email/message body is stored in this ledger.

---

## 43. Contact claim/send/complete flow

Conceptual persistence behavior:

```text
1. claim operation_id atomically
2. compare request fingerprint
3. if already accepted → return previous success
4. if another live lease exists → return/retry safely
5. send provider request outside DB transaction using stable provider idempotency key
6. mark accepted or normalized failure
7. keep the local ledger for seven days, then purge it through scheduled cleanup
```

If the server crashes after provider acceptance but before marking accepted, the next retry reuses the same provider idempotency identity.

Provider timeout/retry budgets follow DOC-49; cleanup scheduling follows DOC-46.
## 43A. Contact operation age and provider deduplication boundary

Contact operations carry `operationId` plus an `operationStartedAt` timestamp in the application command. The server accepts only a bounded clock skew and rejects operations older than the seven-day local ledger horizon as `OPERATION_EXPIRED`; a fresh user send intent receives a fresh operation ID.

The provider's current idempotency window is shorter than the local ledger (Resend: 24 hours as validated for this baseline). Therefore:

- an already `accepted` local operation returns previous success without another provider call;
- an operation with a known retryable pre-acceptance failure may retry according to provider policy;
- a `claimed`/ambiguous outcome is retried automatically only while the provider idempotency guarantee still covers the stable provider key;
- after that provider window, ambiguous operations become `unknown_outcome`/terminal for automatic retry rather than risking a duplicate email;
- the UI preserves the user's text and can offer a **new send intent** with a fresh operation ID if the user explicitly chooses to send again.

The seven-day ledger stores metadata only, never Contact name/email/message body.


---

## Arcade persistence

## 44. Arcade session authority table

Use:

```text
arcade_game_sessions
```

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK/server-issued session ID |
| `game_id` | `text` | glitch-runner/reflex-deploy initially |
| `protocol_version` | `integer` | transport/evidence schema |
| `rules_version` | `integer` | game rules |
| `leaderboard_version` | `integer` | comparable-score partition |
| `session_status` | `text` | issued/accepted/rejected/expired |
| `abuse_key` | `bytea` | Arcade-scoped pseudonymous key |
| `abuse_key_version` | `smallint` | key rotation |
| `issued_at` | `timestamptz` | authoritative time |
| `expires_at` | `timestamptz` | server-defined session expiry |
| `finalized_at` | `timestamptz null` | authoritative finalization time |
| `result_fingerprint` | `bytea null` | canonical accepted/rejected result fingerprint |
| `final_score` | `bigint null` | normalized accepted score for idempotent response |
| `observed_duration_ms` | `integer null` | bounded server/client plausibility datum |
| `rejection_code` | `text null` | safe internal reason code |
| `created_at` | `timestamptz` | record timestamp |
| `retention_until` | `timestamptz null` | cleanup policy hook |

Checks enforce positive versions, future expiry relative to issuance at creation, valid statuses and non-negative score/duration where present.

---

## 45. Rules versus leaderboard version

`rules_version` and `leaderboard_version` are separate intentionally.

A small implementation/protocol change may increment rules/protocol without invalidating score comparability.

A scoring rebalance that makes old scores incomparable increments `leaderboard_version`.

Public leaderboard queries never mix incompatible leaderboard versions unless a later product decision explicitly presents historical boards.

---

## 46. Arcade evidence table

Potentially sensitive/bulky submitted evidence is separated from the durable public score:

```text
arcade_session_evidence
```

Baseline:

| Column | Type | Notes |
|---|---|---|
| `session_id` | `uuid` | PK/FK → game session ON DELETE CASCADE |
| `result_summary` | `jsonb` | bounded normalized submitted summary |
| `evidence` | `jsonb null` | bounded game-specific evidence if required |
| `created_at` | `timestamptz` | timestamp |
| `retention_until` | `timestamptz` | short retention policy hook |

The system does not need to retain every raw input/frame trace.

If a game's plausibility checks do not require durable evidence, the evidence field may remain null or the row may be omitted.

---

## 47. Arcade score table

Accepted public leaderboard records use:

```text
arcade_scores
```

Baseline columns:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `session_id` | `uuid` | UNIQUE FK → accepted session; one score max |
| `game_id` | `text` | duplicated intentionally for efficient board query, validated from session |
| `leaderboard_version` | `integer` | comparable-score partition |
| `nickname` | `text` | server-validated public display nickname |
| `score` | `bigint` | normalized higher-is-better score |
| `display_stats` | `jsonb` | bounded safe game-specific public stats |
| `deletion_token_hash` | `bytea` | SHA-256 digest of a server-generated 256-bit deletion capability returned once with accepted score |
| `achieved_at` | `timestamptz` | authoritative finalization time |

Only safe nickname/content that passes the public text policy reaches this table.

No anti-cheat evidence or abuse key exists on the score row.

---

## 48. Leaderboard sorting

All games expose a normalized numeric `score` where higher is better.

Deterministic ordering:

```text
score DESC
achieved_at ASC
id ASC
```

This gives stable tie-breaking without pretending two simultaneous equal scores need hidden identity comparison.

Recommended composite index:

```text
(game_id, leaderboard_version, score DESC, achieved_at ASC, id ASC)
```

---

## 49. Leaderboard pagination

Use keyset pagination based on the deterministic sort tuple rather than arbitrarily large offsets.

Public query always filters:

```text
game_id = requested game
leaderboard_version = current public board version
```

Page size remains bounded.

---

## 50. Session finalization atomicity

The authoritative finalization procedure must atomically:

1. lock/read the session;
2. verify it is still `issued` or detect previous finalization;
3. compare canonical result fingerprint for idempotent retry;
4. update accepted/rejected session status;
5. create exactly one `arcade_scores` row if accepted;
6. commit both or neither.

`UNIQUE (session_id)` on `arcade_scores` is a final database backstop against duplicate scores.

---

## 51. Expired sessions

A session can become logically expired when `expires_at <= now()` even before a cleanup job updates `session_status`.

Finalization policy checks time directly.

A scheduled job may later normalize/purge old issued sessions, but correctness must not depend on a cleanup cron running exactly on time.

---

## Idempotency and atomic persistence

## 52. Domain-local idempotency

DOC-44 does **not** introduce one generic `idempotency_everything` table.

Preferred model:

- Guestbook/Sketch: `community_submissions.operation_id` unique per subtype;
- Reports: `community_reports.operation_id` unique;
- Arcade finalization: session ID is the natural idempotency resource;
- Admin: audit/mutation operation ID;
- Contact: dedicated short-lived delivery operation ledger;
- Reactions: deterministic actor/submission uniqueness if feature ships.

This keeps retry state close to the invariant it protects.

---

## 53. Atomic database functions / RPCs

Supabase Data API CRUD calls do not provide an application-level multi-call transaction boundary.

For DOC-43 operations that require multiple relational changes in one transaction, use narrow PostgreSQL functions invoked through the repository adapter.

Examples:

```text
app_submit_guestbook(...)
app_submit_sketch(...)
app_moderate_submission(...)
app_resolve_report(...)
app_create_ban(...)
app_revoke_ban(...)
app_finalize_arcade_session(...)
```

These functions are **persistence procedures**, not a second business-service layer.

They may enforce:

- row locking;
- expected version;
- unique operation identity;
- multi-table inserts;
- audit insert;
- relational invariants.

Business decisions such as profanity policy, report thresholds, game plausibility or who is authorized remain in application/security services.

---

## 54. RPC privilege policy

Transactional persistence functions callable through Supabase RPC must:

- have explicit argument types;
- return narrow result records/codes;
- never accept raw SQL identifiers/order clauses;
- revoke default execution from `public`, `anon` and `authenticated` unless an approved path requires otherwise;
- grant execution only to privileged server role for baseline mutations;
- use fully qualified object references;
- avoid unsafe dynamic SQL;
- be migration-controlled and integration-tested.

A browser must not be able to call `app_moderate_submission` directly with a publishable key.

---

## 55. Transaction isolation and row locks

Use ordinary PostgreSQL transactional semantics plus targeted row locking/conditional updates rather than globally increasing isolation level.

Examples:

- moderation locks/conditionally updates one submission version;
- report resolution checks report version;
- Arcade finalization locks one session row;
- Contact operation claim uses atomic insert/update semantics.

`SERIALIZABLE` is not the default for the whole application.

Retry serialization/deadlock errors only where the operation is safely idempotent.

---

## 56. External side effects stay outside DB transactions

No SQL function calls Resend, GitHub, Turnstile or another network provider.

Database transactions must remain short.

Contact provider delivery therefore uses the operation-ledger pattern rather than holding a SQL transaction open while sending email.

---

## Foreign keys / deletion / retention

## 57. Foreign-key policy

Use real foreign keys for authoritative relational ownership whenever both records share lifecycle.

Examples:

```text
guestbook_entries.submission_id → community_submissions.id CASCADE
sketches.submission_id          → community_submissions.id CASCADE
community_reports.submission_id → community_submissions.id CASCADE
arcade_session_evidence.session_id → arcade_game_sessions.id CASCADE
arcade_scores.session_id → arcade_game_sessions.id RESTRICT
```

Audit target IDs intentionally remain non-FK references so audit can outlive target purging.

---

## 58. Admin actor deletion

`admin_profiles` should normally be disabled rather than physically deleted.

Audit/ban/moderation actor foreign keys may use `ON DELETE RESTRICT` to preserve accountability.

If an Auth account needs removal, DOC-45/47 defines a deliberate archival/anonymization path rather than cascading away audit history.

---

## 59. No universal soft delete

There is no global `deleted_at` convention applied to every table.

Domain semantics are explicit:

- public UGC visibility uses moderation status;
- reports use report lifecycle;
- bans use revoked/expiry fields;
- Contact ledger expires and is physically purged;
- expired/rejected Arcade session evidence can be physically purged;
- audit is append-only under normal operation.

This preserves DOC-43's warning against soft-delete cargo culting.

---

## 60. Retention hooks

Tables containing private/abuse/evidence data may include `retention_until`/`expires_at` even before cleanup automation is implemented.

Exact durations are finalized in Security/Privacy Architecture.

Cleanup scheduling belongs to DOC-46.

Correctness rule:

> retention jobs may reduce stored data; they must not be required for ordinary application correctness.

---

## 61. Hard-purge behavior

When a Community submission is legitimately hard-purged under retention/privacy policy:

- subtype content cascades;
- associated reports/reactions may cascade according to the approved policy;
- audit history may retain only opaque target ID/action summary without the deleted payload;
- cached public projections/previews are invalidated.

Do not leave a supposedly deleted message duplicated inside audit JSON.

---

## Storage architecture

## 62. Baseline Storage decision

**Supabase Storage is not required for baseline Guestbook/Sketch publication.**

Reason:

- Sketch source is a controlled logical JSON model in PostgreSQL;
- visitor arbitrary images are prohibited;
- static project media is build/repository-owned;
- public Sketch previews can be rendered from approved logical data;
- avoiding a bucket removes upload, orphan-file, moderation-leak and cleanup complexity.

This is a deliberate simplification, not an omission.

---

## 63. Sketch preview delivery

Baseline gallery preview flow:

```text
approved Sketch row
→ server preview route/renderer
→ validated logical drawing model
→ safe SVG/PNG/WebP response
→ HTTP/CDN cache keyed by submission id + render revision
```

Pending/rejected/hidden Sketches fail the public-preview authorization check.

The renderer controls primitives and does not replay arbitrary visitor SVG/HTML.

---

## 64. Why not a public pending-assets bucket

A Supabase public bucket allows anyone with the asset URL to retrieve the object; download access does not honor per-object RLS in the same way as private-bucket retrieval.

Therefore never store pending/unmoderated Sketch artifacts in a public bucket under the assumption that “the URL is hard to guess”.

If runtime artifact storage is added later, publication state and bucket access model must be designed explicitly.

---

## 65. Future derived-artifact bucket model

If measured performance later justifies materialized Sketch previews, the preferred architecture is:

```text
sketch-private   # private moderation/working artifacts if truly needed
sketch-public    # public bucket containing approved derived previews only
```

Rules:

- no direct visitor upload;
- server-only creation;
- strict MIME allowlist;
- strict maximum object size;
- generated names, never trust user path names;
- public bucket contains **approved derived output only**;
- pending source remains logical data / private;
- cross-resource cleanup/repair is explicit because DB and object storage are not one transaction.

Adopting this optimization requires an implementation review and may require an ADR if it materially changes lifecycle/retention behavior.

---

## 66. Storage schema rule

Never directly mutate Supabase `storage.objects` metadata to perform uploads/moves/deletes.

Storage object operations go through the Storage API.

The Storage schema may be queried for metadata or receive custom indexes for policy performance where supported, but it is not application-owned schema.
## Canonical retention and privacy lifecycle

The V1.x baseline uses the following retention matrix. `retention_until` is set/recomputed by authoritative services when lifecycle state changes; cleanup jobs may execute later without changing public correctness.

| Data class | Baseline retention | Purge/anonymize behavior |
|---|---|---|
| approved Guestbook/Sketch payload | while publicly published | self-delete/Admin privacy action removes public visibility immediately; payload hard-purged within 30 days unless an open security/report hold applies |
| pending Community submission | 90 days max without moderation | purge parent/subtype and deletion token digest |
| rejected Community submission | 30 days after rejection | hard purge payload; retain only minimal audit target/action summary |
| hidden Community submission | 90 days after hide | hard purge payload; may extend up to 180 days only for open security/report investigation with an audited hold |
| open report | while open | retained until resolved/dismissed |
| resolved/dismissed report | 180 days | purge reporter abuse key and private note/report row; audit keeps only minimal action summary |
| reactions | while parent exists | cascade on parent purge; no independent long-term identity retention |
| Arcade issued/expired unfinalized session | 24 hours after expiry | hard purge unless security investigation hold |
| Arcade finalized/rejected session | 30 days | purge session/evidence linkage after public score requirements are satisfied |
| Arcade evidence | 30 days | hard purge; no permanent raw trace store |
| public Arcade score | while leaderboard version is published; then up to 365 days after board retirement | deletion-capability request may remove/anonymize earlier; old retired-board rows purge after horizon |
| Contact delivery operation metadata | 7 days | hard purge; no message/name/email body exists in DB |
| rate-limit buckets | window end + 48 hours | hard purge |
| expired/revoked feature-scoped ban subject | 180 days after expiry/revocation | purge subject hash/private notes; minimal Admin audit action remains |
| Admin audit event | 365 days | append-only during ordinary operation; privacy/security maintenance may remove payload summaries while preserving minimal action identity |
| integration cache entry | 30 days after `stale_until` | hard purge unless refreshed/reused |
| detailed operational telemetry | max 30 days by default, subject to provider plan being **shorter**, never silently longer | provider deletion/expiry; aggregate non-identifying trends may be retained up to 90 days |
| local Drawing drafts/preferences/privacy receipts | until visitor clears them or browser eviction | Settings can clear by domain; no server backup implied |

A documented security/legal hold is exceptional, narrowly scoped, time-bounded and auditable; it is not a general excuse for indefinite retention.

## Accountless deletion capability

For Community submissions and accepted Arcade scores the server generates a cryptographically random **256-bit deletion capability** and returns it exactly once. Persistence stores only `SHA-256(token)` because the token itself has high entropy. The client stores the capability in a local `PrivacyReceiptRepository`; it is never an identity and never links different resources.

A privacy deletion command requires `(resource type, resource id, deletion capability)` and verifies the digest in constant time. A successful request immediately removes public visibility and applies the retention matrix above. For a hidden/reported item, the public payload can be suppressed immediately while minimal report/audit evidence remains until its bounded retention expires.

If the visitor loses the capability, manual requests are best-effort: the visitor supplies the exact public URL/ID and supporting context, Admin may remove public content conservatively, but the system does not claim it can discover every action by the same person because cross-feature identity is intentionally absent.


---

## Indexing / query architecture

## 67. Index philosophy

Every non-primary index must correspond to a known query, constraint or RLS policy.

Avoid speculative indexes because they:

- increase write cost;
- increase storage;
- complicate migrations;
- can be ignored by the planner anyway.

Initial indexes are intentionally small and query-driven.

---

## 68. Baseline Community indexes

Recommended:

```text
community_submissions
- UNIQUE (submission_type, operation_id)
- (moderation_status, created_at DESC, id DESC)          # admin queue
- (submission_type, moderation_status, published_at DESC, id DESC) # public lists
- (abuse_key, abuse_key_version, created_at DESC)       # bounded abuse/rate lookup if DB policy needs it

community_reports
- UNIQUE (operation_id)
- (report_status, created_at DESC, id DESC)              # moderation queue
- (submission_id, report_status, created_at DESC)        # item report view
- partial open-report dedupe index described earlier
```

The final migrations should benchmark/inspect actual query plans rather than preserving unused indexes by tradition.

---

## 69. Baseline Arcade indexes

Recommended:

```text
arcade_game_sessions
- (session_status, expires_at)
- (game_id, issued_at DESC)
- (abuse_key, abuse_key_version, issued_at DESC)   # if required for server-side abuse checks

arcade_scores
- UNIQUE (session_id)
- (game_id, leaderboard_version, score DESC, achieved_at ASC, id ASC)
```

No index is added to raw evidence JSON by default.

---

## 70. Baseline Admin / retention indexes

Recommended:

```text
admin_audit_events
- UNIQUE (operation_id)
- (occurred_at DESC, id DESC)
- (target_type, target_id, occurred_at DESC)
- (actor_admin_id, occurred_at DESC)

abuse_bans
- (subject_hash, subject_key_version, enforcement_scope, expires_at)
  WHERE revoked_at IS NULL

contact_delivery_operations
- (expires_at)
- (delivery_status, lease_until)
```

Retention cleanup jobs should use indexed expiry fields.

---

## 71. RLS performance indexes

If a future RLS policy filters by a non-PK column, that filter column must be considered for indexing.

RLS functions such as `auth.uid()` should follow current Supabase/PostgreSQL best practices (including statement-level stable evaluation where appropriate) only after correctness is established.

Do not “optimize” RLS by weakening authorization predicates.

---

## 72. No unbounded `SELECT *`

Repository code should select explicit columns for each use case.

Benefits:

- private columns cannot silently enter DTOs;
- schema additions do not change data transfer contracts;
- lower transfer/serialization overhead;
- reviewable privacy surface.

A database generated type is not permission to return a full row publicly.

---

## 73. Admin moderation queue query

The moderation queue may query common parent data plus subtype-specific preview data and open-report counts.

Avoid N+1 calls per row.

The repository should use one bounded relational query/RPC or a small fixed number of batched queries.

Do not denormalize report counts onto Community rows until measured query cost warrants it.

---

## Migration / schema lifecycle

## 74. Migration source of truth

Every schema change lives in versioned SQL under:

```text
supabase/migrations/
```

Production dashboard edits are not source of truth.

If an emergency dashboard change occurs, immediately reverse-engineer/reconcile it into a migration before normal development continues.

---

## 75. Migration naming

Use chronological Supabase-compatible names plus intent, for example:

```text
20260915150000_create_admin_profiles.sql
20260915151000_create_community_submissions.sql
20260915152000_create_reports.sql
20260915153000_create_arcade.sql
20260915154000_create_rls_and_grants.sql
```

Exact timestamp generation is automated by tooling.

---

## 76. Migration composition

A migration introducing an exposed table must include in the same reviewed change:

- table/constraints;
- RLS enablement;
- grants/revocations;
- required policies;
- indexes needed for initial approved queries;
- comments for security-sensitive columns where useful;
- corresponding DB tests.

Do not create a table “open for now” and promise to add RLS later.

---

## 77. Backward-compatible deployment principle

Schema/application deploys may overlap during rollout.

Prefer additive sequence:

```text
1. add nullable/new compatible column or function
2. deploy code that understands both/starts writing it
3. backfill if required
4. enforce NOT NULL/check after data is valid
5. remove old contract only after no deployment depends on it
```

For V0/low traffic this may feel conservative, but it prevents avoidable preview/production deployment races and establishes good habits.

---

## 78. Constraint-first integrity

Use database constraints for facts PostgreSQL can prove reliably:

- FK ownership;
- uniqueness;
- non-negative counts/scores;
- allowed status vocabulary;
- required timestamps where state implies them;
- one score per session;
- bounded coarse text/model sizes.

Use application services for context-dependent business policy:

- profanity/safety classification;
- game plausibility;
- exact moderation transition permissions;
- feature release gating;
- abuse threshold decisions.

---

## 79. Generated database types

After migrations change schema, generate TypeScript database definitions through the Supabase CLI/tooling and commit them if the repository strategy chooses checked-in generated types.

Generated file concept:

```text
lib/db/database.types.ts
```

Rules:

- never hand-edit generated type output;
- application domain types remain separate;
- generated row types do not escape repository adapters as public DTOs.

---

## 80. No ORM schema drift

If a query builder/ORM is added later, it must consume/respect the migration-defined PostgreSQL schema.

Do not maintain two independent schema sources such as:

```text
supabase SQL migrations
+
ORM schema that can migrate independently
```

without a documented single-owner strategy.

The baseline does not require an ORM simply to access PostgreSQL through Supabase.

---

## 81. Database extensions

Keep extensions minimal.

Baseline UUID generation should use capabilities already available in the Supabase PostgreSQL environment (for example `gen_random_uuid()`).

Adding extensions such as full-text/vector/geospatial functionality requires an actual product/query need and migration review.

No vector database/pgvector is needed for this portfolio baseline.

---

## 82. Local/staging seed policy

Seeds may create deterministic non-sensitive fixtures for local/testing environments:

- Guestbook pending/approved/hidden examples;
- Sketch logical-model fixtures;
- report lifecycle examples;
- Arcade sessions/scores;
- audit records.

Do not seed:

- real private Contact messages;
- production abuse hashes;
- production credentials;
- private client/customer data.

Admin Auth test users are environment-specific setup, not a committed real credential.

---

## Data privacy / observability boundaries

## 83. Data classification map

Runtime tables fall into rough privacy classes:

| Data | Classification intent |
|---|---|
| approved public nickname/message | public UGC after moderation |
| pending/rejected UGC | private moderation data |
| drawing model before approval | private UGC |
| reports | admin-only moderation data |
| abuse keys/bans | sensitive security metadata |
| Arcade score nickname/score | public after validation |
| Arcade session/evidence | private security/game data |
| Contact operation ledger | private operational metadata, no message body |
| audit events | admin-only operational/security history |
| admin profiles | private auth-adjacent metadata |

DOC-47 finalizes retention and threat handling.

---

## 84. No cross-domain identity joins

The schema intentionally contains no table such as:

```text
visitors
users_public
visitor_profiles
identity_graph
```

that links Contact, Guestbook, Sketch, Arcade and Widget personalization.

Any abuse key in a domain is namespace-scoped.

Application analytics identifiers must not be used as a backdoor relational identity key.

---

## 85. Logging versus stored data

A value being stored in PostgreSQL does not authorize logging it.

Structured logs should generally contain:

- record ID;
- operation/request ID;
- safe status code;
- duration;
- provider category.

They should not contain raw:

- Guestbook message;
- drawing model;
- report private note;
- abuse hash;
- Arcade evidence;
- Contact message/email.

---

## 86. Data exports / admin download

V1.x does not include a generic “export all database data” admin feature.

If moderation/debug export is later needed, it must define:

- allowed fields;
- purpose;
- retention;
- authorization;
- audit event;
- safe filename/storage path.

---

## Reliability / failure behavior

## 87. Database outage behavior

A Supabase database outage may degrade:

- Guestbook;
- Sketch Wall/public previews;
- reports;
- Arcade sessions/leaderboards;
- Admin/moderation.

It must not make repository-owned:

- Home professional content;
- Project Detail;
- Experience/Education/Certifications;
- CV static artifact

unavailable.

This preserves DOC-41 failure-domain isolation.

---

## 88. Partial data corruption prevention

Use atomic procedures/constraints so application failure cannot leave states such as:

- Community parent with missing subtype after a successful response;
- approved moderation without its audit event;
- accepted Arcade session without a required score row;
- two scores for one session;
- report resolved twice by racing admin tabs;
- same logical UGC operation creating duplicate rows.

---

## 89. Orphan detection

Local/CI database tests should include queries that assert no impossible/orphan shapes exist.

Examples:

```text
community submission with zero/multiple subtype rows
score whose session is not accepted
approved submission without published_at
audit action with missing actor profile
resolved report without resolved_at
```

Production observability may periodically run lightweight integrity checks only if justified; do not build a complex repair daemon in V1.x.

---

## Database testing

## 90. Migration test gate

A clean local database must be able to:

```text
supabase db reset
→ apply all migrations
→ apply safe local fixtures
→ run DB tests
→ produce generated types
```

without manual dashboard steps.

Exact CLI syntax is pinned in DOC-51.

---

## 91. RLS/grant tests

For every exposed application table/function, database tests must assert both allow and deny behavior.

At minimum test:

```text
anon cannot select/insert/update/delete runtime tables
authenticated non-admin cannot access runtime domain tables
authenticated user can only read own active admin-profile row if that lookup is enabled
anon/authenticated cannot execute privileged persistence RPCs
privileged server role can execute approved repository operations
```

Do not treat “RLS enabled” as proof policies/grants are correct.

---

## 92. Constraint tests

Test that the database rejects:

- unsupported moderation/report/session status;
- duplicate UGC operation IDs;
- duplicate report operation IDs;
- duplicate Arcade score for same session;
- negative score/duration/version;
- oversized coarse payloads;
- invalid FK targets;
- approved item without required publication timestamp where the atomic procedure owns that invariant.

---

## 93. Transaction/concurrency tests

Run integration tests for:

- two concurrent moderation decisions with the same expected version;
- two concurrent Arcade finalizations;
- retrying same Guestbook/Sketch operation;
- same operation ID with different request fingerprint;
- report resolution races;
- Contact operation claim lease/retry;
- admin mutation + audit rollback together on failure.

The winner/loser semantics must match DOC-43 error contracts.

---

## 94. Query-plan checks

Before release, inspect `EXPLAIN (ANALYZE, BUFFERS)` or equivalent in representative local/staging data for:

- public Guestbook list;
- public Sketch list;
- moderation queue;
- open reports by target;
- leaderboard page;
- active ban lookup.

Do not optimize against empty-table timings.

DOC-49 owns production performance thresholds.

---

## Repository / folder direction

## 95. Suggested database source layout

```text
supabase/
├── config.toml
├── migrations/
├── seed.sql                 # local/test-safe only
└── tests/
    ├── grants_rls.sql
    ├── community.sql
    ├── reports.sql
    ├── arcade.sql
    └── admin_audit.sql

lib/
└── db/
    ├── database.types.ts    # generated
    ├── server-client.ts     # secret-key client, server-only
    ├── auth-client.ts       # authenticated/publishable context when needed
    └── repositories/
```

Exact filenames may change, but responsibilities must remain explicit.

---

## 96. Secret database client

The privileged database client module must:

- import `server-only`;
- read validated server config centrally;
- use the Supabase secret key (or approved equivalent);
- never be imported into a Client Component;
- never export a raw client to arbitrary feature code;
- be consumed through repository implementations.

Preferred:

```text
GuestbookRepository.createPending()
```

Not:

```text
feature code receives supabaseAdmin and runs any query
```

---

## 97. Auth-context client

A separate Supabase server Auth client may use the publishable key plus the request's authenticated session/cookies for identity verification.

Do not reuse the privileged secret client to answer “who is the signed-in admin?” because a secret client bypasses user RLS context.

DOC-45 finalizes this exact session-verification mechanism.

---

## Implementation-tool rules

## 98. Data implementation-tool rules

When implementing DOC-44, development tooling must:

- read DOC-36, DOC-41, DOC-43 and relevant ADRs before migrations;
- not create canonical professional tables;
- not expose public direct writes to Supabase tables;
- enable RLS and explicit grants in the same migration as every exposed table;
- use publishable/secret key terminology for new code unless migration compatibility requires legacy names;
- keep secret-key client server-only;
- never return raw DB rows as public DTOs;
- never create one global visitor identity table;
- use feature-scoped opaque abuse keys only;
- preserve reports as independent rows;
- preserve Guestbook/Sketch pending moderation;
- preserve exactly-one-score-per-Arcade-session;
- keep Contact body/email/name out of database persistence by default;
- use narrow atomic SQL functions where DOC-43 requires multi-row transactions;
- revoke function execution from unintended roles;
- not store arbitrary visitor SVG/image uploads;
- not modify Supabase Storage metadata directly with SQL;
- not add speculative JSONB/GIN/index complexity;
- update generated DB types after schema changes;
- add allow/deny RLS tests and invariant tests with every schema change;
- propose an ADR before changing source-of-truth or direct-browser-data-access strategy.

---

## 99. Initial implementation gates

### Gate D1 — clean migration

- clean local reset works;
- all migrations apply in order;
- no manual DB dashboard step required.

### Gate D2 — locked Data API

- signed-out publishable-key client cannot read or mutate runtime tables;
- authenticated non-admin cannot read/mutate runtime domain tables;
- privileged RPCs reject public/authenticated execution.

### Gate D3 — Community integrity

- Guestbook/Sketch parent + subtype created atomically;
- duplicate operation returns original semantic result;
- changed payload under same operation conflicts;
- pending is not public;
- approved becomes public;
- hidden disappears publicly without losing audit.

### Gate D4 — Reports

- report is independent from content status;
- duplicate open report from same scoped abuse context/reason is prevented;
- resolution uses version check and audit.

### Gate D5 — Arcade

- session issued once;
- two concurrent finalizations produce at most one accepted score;
- incompatible leaderboard versions never mix;
- public score contains no session/evidence/abuse data.

### Gate D6 — Contact ledger

- no message/email/name stored;
- same operation/fingerprint deduplicates;
- same operation/different fingerprint conflicts;
- expired ledger can be purged safely.

### Gate D7 — Storage absence is valid

- Sketch publication/gallery functions without a visitor-upload bucket;
- public preview refuses non-approved Sketch;
- renderer output is derived only from canonical validated primitives.

---

## 100. Deferred decisions

DOC-44 deliberately leaves downstream:

### DOC-45

- exact admin sign-in method;
- session cookie refresh/verification;
- MFA/passkey/recovery;
- future admin roles.

### DOC-46

- exact cleanup schedules for `expires_at` / `retention_until`;
- external cache tables and TTLs;
- scheduled feed refresh;
- outbox/background repair if needed;
- whether Sketch previews are ever materialized asynchronously.

### DOC-47

- abuse-key HMAC inputs/algorithm/secret rotation;
- exact UGC/report/Arcade retention periods;
- exact report reason allowlist if safety-sensitive;
- rate limits and suspicious-session thresholds;
- privacy deletion request process;
- database threat model.

### DOC-48

- production Supabase project/branch/environment topology;
- connection/network settings;
- backup/PITR availability by plan;
- restore exercises.

### DOC-49

- query latency budgets;
- DB pool/connection observability;
- alert thresholds;
- provider/DB availability SLOs.

### DOC-51

- exact Supabase CLI version;
- generated-type command;
- migration naming automation;
- CI DB reset/test workflow.

---

## 101. Acceptance criteria for DOC-44

DOC-44 is successfully implemented when:

- canonical professional data still lives outside runtime DB;
- all runtime tables have clear owner/lifecycle/privacy purpose;
- no publishable-key browser path can directly read/write runtime domain tables by default;
- secret-key access is server-only and repository-scoped;
- every exposed table has explicit RLS/grants;
- Guestbook/Sketch use one common moderation parent with strict subtypes;
- reports remain independent;
- admin mutations cannot bypass atomic audit via normal app paths;
- feature-scoped abuse identifiers do not create a visitor identity graph;
- Contact message body/email/name are not persisted;
- Arcade session finalization and score creation are atomic/idempotent;
- leaderboard queries are deterministic and indexed;
- schema changes are migration-controlled;
- public DTOs do not leak internal DB columns;
- Sketch can publish safely without arbitrary file uploads;
- retention fields/jobs do not become correctness dependencies;
- DB/RLS/concurrency tests prove the critical invariants.

---

## 102. Informative platform references

Implementation must verify exact APIs against pinned/current Supabase/PostgreSQL versions during V0.

Informative references validated while drafting this document:

- Supabase Row Level Security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase API keys: <https://supabase.com/docs/guides/getting-started/api-keys>
- Supabase Data API security: <https://supabase.com/docs/guides/api/securing-your-api>
- Supabase secure data access: <https://supabase.com/docs/guides/database/secure-data>
- Supabase Storage access control: <https://supabase.com/docs/guides/storage/security/access-control>
- Supabase Storage buckets: <https://supabase.com/docs/guides/storage/buckets/fundamentals>
- Supabase Storage schema: <https://supabase.com/docs/guides/storage/schema/design>
- PostgreSQL constraints, indexes, transactions and row locking: current PostgreSQL documentation matching the hosted engine version.

Provider documentation is informative. Approved product/application invariants remain authoritative if provider APIs evolve.

---

## DOC-44 — Decision Registry

| ID | Decision |
|---|---|
| `DTA-001` | PostgreSQL stores runtime state only; repository-owned professional facts remain outside the runtime database. |
| `DTA-002` | Supabase PostgreSQL is the managed relational persistence baseline. |
| `DTA-003` | SQL migrations in source control are the database schema source of truth. |
| `DTA-004` | Publishable/secret is the preferred current Supabase key terminology; legacy anon/service-role names are compatibility only. |
| `DTA-005` | Supabase secret keys remain server-only and map to privileged RLS-bypassing access. |
| `DTA-006` | Runtime tables are not directly exposed to signed-out browser reads/writes in the baseline. |
| `DTA-007` | Every application table in an exposed schema enables RLS and explicit least-privilege grants. |
| `DTA-008` | Deny-by-default grants/RLS are established in the same migration as table creation. |
| `DTA-009` | Secret-key DB clients are repository-scoped rather than handed to feature code. |
| `DTA-010` | Supabase Auth identity verification uses a separate authenticated/publishable context from privileged DB access. |
| `DTA-011` | `admin_profiles` is an allowlist-style application-admin profile, not a generalized V1.x RBAC system. |
| `DTA-012` | Admin domain mutations are not granted directly to authenticated browser clients because they must pass application audit/concurrency rules. |
| `DTA-013` | Security-definer/helper functions use explicit grants, fixed search paths and non-exposed schemas where practical. |
| `DTA-014` | Application statuses use text + named CHECK constraints rather than native Postgres enums by default. |
| `DTA-015` | Runtime primary keys use UUIDs generated by trusted server/database code. |
| `DTA-016` | Retryable mutations use separate operation UUIDs; resource ID and operation ID are distinct concepts. |
| `DTA-017` | Idempotency request comparisons store keyed fingerprints rather than raw sensitive payloads. |
| `DTA-018` | Persistent timestamps use `timestamptz` and trusted server/database time. |
| `DTA-019` | `updated_at` may use a shared persistence trigger; business/concurrency version increments remain explicit. |
| `DTA-020` | JSONB is used only for bounded drawing/game/audit structures, not to replace relational domain fields. |
| `DTA-021` | Guestbook and Sketch share `community_submissions` as a moderation/reporting parent. |
| `DTA-022` | Guestbook and Sketch content live in strict 1:1 subtype tables. |
| `DTA-023` | Community moderation status is exactly pending/approved/rejected/hidden unless an approved migration changes the contract. |
| `DTA-024` | `reported` is not a content moderation status. |
| `DTA-025` | `moderation_version` provides optimistic concurrency for privileged state changes. |
| `DTA-026` | Community submission creation uses atomic persistence procedures so parent/subtype cannot partially commit. |
| `DTA-027` | Guestbook stores plain text only with database safety caps. |
| `DTA-028` | Sketch stores the validated logical drawing model and protocol/render versions, not arbitrary uploaded image/SVG authority. |
| `DTA-029` | Feature-scoped abuse keys are cryptographically namespace-separated to prevent cross-domain visitor profiling. |
| `DTA-030` | Public UGC queries expose approved allowlisted projections only. |
| `DTA-031` | Public Community pagination uses bounded keyset pagination. |
| `DTA-032` | Reports are independent rows referencing Community submissions. |
| `DTA-033` | Report lifecycle is open/resolved/dismissed and has its own optimistic-concurrency version. |
| `DTA-034` | Duplicate equivalent open reports may be constrained using reporter-scoped pseudonymous keys without asserting identity. |
| `DTA-035` | Database triggers do not auto-hide content merely because a report exists. |
| `DTA-036` | Reactions remain optional and are introduced by a later migration only if the feature ships. |
| `DTA-037` | Social Activity is derived initially rather than duplicated into a new activity table. |
| `DTA-038` | Admin audit is durable, append-only in normal operation and does not copy sensitive full payloads. |
| `DTA-039` | Audit target IDs intentionally need not be foreign keys so history can survive target purging. |
| `DTA-040` | Admin operation IDs prevent duplicate privileged audit/actions. |
| `DTA-041` | Abuse bans store opaque HMAC-derived subjects, key versions, namespaces/scopes and expiry/revocation metadata. |
| `DTA-042` | Ban persistence never claims real-person identity. |
| `DTA-043` | Contact message/name/email are not persisted as a database inbox in V1.0. |
| `DTA-044` | Contact uses a short-lived operation ledger containing idempotency/delivery metadata only. |
| `DTA-045` | Contact provider calls occur outside database transactions and reuse stable provider idempotency identity. |
| `DTA-046` | Arcade authoritative state is stored in `arcade_game_sessions`. |
| `DTA-047` | Arcade protocol, rules and leaderboard comparability versions are explicit fields. |
| `DTA-048` | Potentially sensitive Arcade evidence is separated from public scores and is retention-bounded. |
| `DTA-049` | One Arcade session can have at most one authoritative score through a UNIQUE session FK. |
| `DTA-050` | Leaderboard rows contain only safe display data, not session/evidence/abuse metadata. |
| `DTA-051` | Leaderboards sort deterministically by score DESC, achieved_at ASC, id ASC. |
| `DTA-052` | Leaderboard queries are partitioned by game and leaderboard version. |
| `DTA-053` | Arcade finalization + accepted score insertion occur atomically. |
| `DTA-054` | Session expiry correctness checks timestamps directly and does not depend on cleanup jobs. |
| `DTA-055` | Idempotency is domain-local rather than forced into one generic global table. |
| `DTA-056` | Multi-row invariants use narrow PostgreSQL transactional functions/RPCs when Supabase Data API multi-call CRUD would not be atomic. |
| `DTA-057` | Database RPCs are persistence procedures, not a duplicate business-service layer. |
| `DTA-058` | Privileged persistence RPC execution is revoked from public/anon/authenticated roles by default. |
| `DTA-059` | Targeted row locks/conditional updates are preferred over making SERIALIZABLE the application default. |
| `DTA-060` | External network calls never occur inside PostgreSQL transactions. |
| `DTA-061` | Real foreign keys enforce shared-lifecycle relational ownership; audit target references intentionally differ. |
| `DTA-062` | Admin profiles are disabled rather than casually deleted when audit history references them. |
| `DTA-063` | There is no universal soft-delete column/policy. |
| `DTA-064` | Retention/expiry columns are policy hooks; cleanup jobs are not correctness dependencies. |
| `DTA-065` | Supabase Storage is not required for baseline Guestbook/Sketch publication. |
| `DTA-066` | Sketch public previews are derived server-side from approved validated logical models and may be HTTP/CDN cached. |
| `DTA-067` | Unmoderated/pending artifacts are never placed in a public bucket based on URL obscurity. |
| `DTA-068` | If materialized Sketch artifacts are later adopted, private/public derived-artifact buckets remain separated and visitor direct upload stays prohibited. |
| `DTA-069` | Supabase Storage object mutations go through Storage APIs; application code does not directly mutate `storage.objects`. |
| `DTA-070` | Every index must correspond to a real query, uniqueness rule, retention scan or RLS predicate. |
| `DTA-071` | Public/admin list queries use bounded deterministic pagination. |
| `DTA-072` | Repository queries select explicit fields; raw `SELECT *` rows are not public contracts. |
| `DTA-073` | Moderation queues avoid N+1 queries and do not denormalize counters without measured need. |
| `DTA-074` | Schema migrations are never replaced by manual production-dashboard state. |
| `DTA-075` | New exposed tables ship schema + RLS + grants + required indexes + DB tests together. |
| `DTA-076` | Deployment migrations prefer additive/backward-compatible sequencing where releases may overlap. |
| `DTA-077` | PostgreSQL constraints enforce database-provable invariants; contextual business policy remains in services. |
| `DTA-078` | Supabase-generated TypeScript DB types are generated outputs and do not replace domain/DTO types. |
| `DTA-079` | The baseline does not require an ORM; any future ORM cannot become a competing schema source. |
| `DTA-080` | Database extensions remain minimal and need a concrete requirement; pgvector is not part of the baseline. |
| `DTA-081` | Seeds contain local/test-safe fixtures only, never real private content or production credentials. |
| `DTA-082` | The database contains no cross-feature visitor/profile identity graph. |
| `DTA-083` | Stored private data is not automatically allowed in logs/traces/analytics. |
| `DTA-084` | V1.x does not include a generic admin export-all-data feature. |
| `DTA-085` | Runtime DB outage degrades runtime/social/Arcade/admin features without taking canonical professional content offline. |
| `DTA-086` | Integration tests assert orphan/impossible-state absence in addition to happy-path CRUD. |
| `DTA-087` | A clean local DB reset must reproduce schema/tests without manual dashboard steps. |
| `DTA-088` | RLS/grant tests verify both allowed and denied actors; “RLS enabled” alone is not a security proof. |
| `DTA-089` | Critical idempotency/concurrency paths receive real concurrent integration tests. |
| `DTA-090` | Representative query plans are inspected with non-trivial fixture data before release. |
| `DTA-091` | Privileged DB client modules are `server-only`, centrally configured and never exported as generic feature dependencies. |
| `DTA-092` | Auth-context and privileged-data clients remain separate responsibilities. |
| `DTA-093` | Data architecture changes that introduce direct browser DB access or move canonical professional data into DB require explicit review/ADR. |
| `DTA-094` | `Currently Building` remains outside runtime PostgreSQL in the approved V1.x baseline. |
| `DTA-095` | Public-write rate limits use PostgreSQL-backed atomic buckets/RPCs in the V1.x baseline; process memory is not authoritative. |
| `DTA-096` | Abuse bans are feature-scoped only in V1.x; no universal cross-feature ban subject is persisted. |
| `DTA-097` | Contact operation metadata is retained seven days and ambiguous provider outcomes are not blindly retried beyond the provider idempotency guarantee. |
| `DTA-098` | Community submissions and accepted Arcade scores store only a digest of a high-entropy one-resource deletion capability. |
| `DTA-099` | Domain retention horizons follow the canonical DOC-44 retention matrix and are exercised by cleanup jobs/tests. |
| `DTA-100` | Report/reaction/ban/audit machine-code allowlists are canonical and DB-enforced; hidden→approved restore is absent in V1.2. |

---

## Accepted baseline / change-control gate

Approval of DOC-44 closes the baseline relational persistence/RLS/storage model and allows DOC-45 to define Admin Auth/session architecture against a known database authorization boundary rather than inventing data access rules inside authentication code.
