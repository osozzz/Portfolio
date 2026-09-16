---
id: DOC-43
title: "Backend, API & Application Service Architecture"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Backend Architecture"
canonical_domain_owner: backend_architecture
depends_on:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-14
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-19
  - DOC-22
  - DOC-23
  - DOC-25
  - DOC-30
  - DOC-31
  - DOC-32
  - DOC-36
  - DOC-41
  - DOC-42
  - ADR-001
  - ADR-002
decision_families:
  - BEA
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-43 — Backend, API & Application Service Architecture

> **Status:** APPROVED.  
> **Role:** Define the server-side application contract that turns public/admin requests into validated, authorized, idempotent domain operations without coupling UI code directly to PostgreSQL, Supabase SDK calls, Resend, provider payloads or route-file business logic.

---

## 1. Purpose

DOC-41 established the portfolio as a modular full-stack web application and defined the service-first mutation rule. DOC-42 defined the frontend rendering, routing and state boundaries. DOC-43 now defines the server-side application layer that sits between those interfaces and the persistence/provider layers that will be finalized in DOC-44 through DOC-47.

This document defines:

- backend layering and dependency direction;
- command/query application-service boundaries;
- Server Action versus Route Handler ownership;
- explicit HTTP/application protocols;
- request-context construction;
- validation and normalization;
- DTO/public projection rules;
- error contracts and HTTP mappings;
- idempotency/replay semantics;
- transaction and concurrency boundaries;
- repository and provider interfaces;
- Contact delivery architecture;
- Guestbook, Sketch, report and optional reaction workflows;
- Arcade session/result protocols;
- admin moderation application services;
- audit-event requirements;
- release/feature gating at the server boundary;
- webhook ingestion rules;
- logging/privacy boundaries;
- test seams and backend acceptance gates.

It intentionally does **not** finalize:

- exact PostgreSQL tables, columns, indexes, triggers or RLS policies — DOC-44;
- admin credential factors/session rotation/MFA/recovery — DOC-45;
- concrete external caching schedules/jobs/provider refresh strategy — DOC-46;
- final CSP, CSRF implementation details, rate-limit thresholds, abuse-key cryptography or threat-model mitigations — DOC-47;
- Vercel/Supabase environment topology, DNS and deployment wiring — DOC-48;
- final observability provider, SLOs and alert thresholds — DOC-49;
- complete test pyramid/tooling — DOC-50;
- CI/CD workflow syntax and repository automation — DOC-51.

---

## 2. Backend north star

> **Thin transports, explicit application services, narrow repositories and safe provider adapters.**

The backend must not become a collection of route files that directly perform SQL/provider calls.

Preferred shape:

```text
Browser / Server-rendered UI
        ↓
Transport Adapter
Server Action / Route Handler
        ↓
Request Context + Validation
        ↓
Application Service
        ↓
Domain Policy / Transaction Boundary
        ↓
Repository / Provider Port
        ↓
Supabase PostgreSQL / Storage / Resend / External Provider
```

The transport knows HTTP/framework mechanics. The application service knows the use case. The repository/provider adapter knows infrastructure.

No layer should reach upward.

---

## 3. Architectural style

The backend is a **modular application layer inside the modular monolith**, not a second standalone service.

We deliberately reject, for V1.x:

- microservices;
- GraphQL merely to avoid defining a few explicit contracts;
- a public developer API;
- generic event-bus infrastructure;
- CQRS infrastructure with separate databases;
- a generic enterprise `UnitOfWork` abstraction;
- an ORM/repository abstraction so broad that domain-specific queries become harder to understand;
- internal HTTP calls from the Next.js server to its own `/api` endpoints;
- direct database writes from browser code.

“Service-first” does **not** mean “enterprise framework.” It means business rules have a stable home.

---

## 4. Dependency direction

The allowed direction is:

```text
transport
   ↓
application
   ↓
domain policy / typed ports
   ↓
infrastructure adapters
```

Infrastructure adapters may implement interfaces defined by the application/domain boundary, but application services do not import concrete Supabase or Resend clients.

Forbidden examples:

```text
submitGuestbookAction.ts
→ supabase.from("guestbook_entries").insert(...)
```

```text
GameResultRoute
→ directly inserts leaderboard score
```

```text
ContactForm component
→ Resend SDK
```

Preferred:

```text
submitGuestbookAction
→ SubmitGuestbookService.execute(...)
→ GuestbookRepository.createPending(...)
```

---

## 5. Backend module boundaries

Initial backend domains:

```text
server/
├── contact/
├── social/
│   ├── guestbook/
│   ├── sketches/
│   ├── reports/
│   └── reactions/        # optional V1.2
├── arcade/
├── moderation/
├── audit/
├── abuse/
├── auth-context/
├── content-projections/
├── release-gating/
└── integrations/
```

Cross-cutting primitives should remain small and explicit:

```text
server/core/
├── errors/
├── result/
├── request-context/
├── idempotency/
├── clock/
└── transactions/
```

Avoid a giant `services.ts` or `server-utils.ts` file.

---

## 6. Command/query separation without CQRS ceremony

We distinguish two conceptual operations:

### Commands

Commands attempt to change authoritative state or trigger a side effect.

Examples:

- submit Contact;
- submit Guestbook entry;
- publish Sketch for review;
- report public content;
- start Arcade session;
- finalize Arcade session;
- approve/hide/reject UGC;
- resolve a report;
- create/revoke an abuse ban.

### Queries

Queries return projections without changing business state.

Examples:

- list approved Guestbook entries;
- list approved Sketches;
- read leaderboard;
- read moderation queue;
- read report detail;
- read audit history.

This distinction improves naming/testing but does **not** require separate databases, buses or frameworks.

---

## 7. Application service contract

Each material use case gets an application service with a narrow command/query input and typed result.

Conceptual pattern:

```ts
interface ApplicationService<I, O> {
  execute(input: I, context: RequestContext): Promise<AppResult<O>>;
}
```

Implementation may use functions instead of classes when simpler. The architectural requirement is boundary clarity, not object-oriented ceremony.

A service owns:

- business preconditions;
- authorization requirement invocation;
- idempotency semantics where applicable;
- transaction boundary;
- repository/provider orchestration;
- stable application error mapping;
- audit-event creation when privileged state changes.

A service does **not** own:

- React rendering;
- HTTP header parsing;
- raw cookie/session decoding;
- SQL strings scattered through logic;
- provider SDK response shapes;
- localized UI copy.

---

## 8. RequestContext

Transport adapters build one normalized context before calling application services.

Conceptual contract:

```ts
type PublicActor = {
  kind: "public";
};

type AdminActor = {
  kind: "admin";
  adminId: string;
  sessionId?: string;
};

type RequestContext = {
  requestId: string;
  now: Date;
  locale?: "en" | "es";
  actor: PublicActor | AdminActor;
  abuseContext?: AbuseContext;
  operationId?: string;
};
```

Rules:

- application services receive an actor abstraction, not raw cookies;
- raw IP is not part of the domain contract;
- exact pseudonymous abuse-key derivation is DOC-47;
- `requestId` is generated/trusted server-side;
- time comes through a clock/context seam so tests can control it;
- `operationId` identifies a mutation attempt when idempotency is required;
- untrusted client headers are never copied wholesale into domain context.

---

## 9. Transport taxonomy

### 9.1 Server Actions

Baseline for same-application form mutations where progressive enhancement and direct UI integration are useful.

Primary V1.0 use:

- Contact submission.

Likely admin uses:

- approve/reject/hide forms;
- report resolution;
- basic ban/revoke operations;

provided the UI does not require a reusable JSON protocol.

### 9.2 Route Handlers

Baseline for explicit JSON/binary application protocols.

Primary uses:

- Arcade session creation;
- Arcade session finalization;
- leaderboard pagination/client refresh where needed;
- Sketch publication payload;
- public content report submission;
- optional reaction protocol;
- provider webhooks;
- specialized health/integration endpoints only when safe and useful.

### 9.3 Server-rendered reads

A Server Component or server page that already executes in the application should call the query service/repository path directly.

Do **not** do:

```text
Server Component
→ fetch("https://our-own-site/api/guestbook")
→ Route Handler
→ database
```

Use:

```text
Server Component
→ ListApprovedGuestbookQuery
→ repository
```

Internal HTTP is unnecessary latency and duplicates auth/cache/error semantics.

---

## 10. Transport decision matrix

| Use case | Baseline transport | Why |
|---|---|---|
| Contact submit | Server Action | same-origin form, progressive enhancement, no external API contract |
| Guestbook submit | Server Action by default | simple form semantics; can later expose Route Handler only if client workflow proves necessary |
| Guestbook list | direct server query; Route Handler only for client pagination | avoid self-HTTP |
| Sketch publish | Route Handler | structured drawing payload and explicit protocol |
| Sketch list | direct server query; Route Handler for incremental client loading if needed | same reason |
| Report content | Route Handler | reusable from Guestbook/Sketch detail surfaces |
| Reactions | Route Handler if feature ships | explicit accountless mutation protocol |
| Arcade create session | Route Handler | explicit protocol |
| Arcade finalize session | Route Handler | explicit protocol + idempotent result contract |
| Leaderboard | direct server query; Route Handler for refresh/pagination | public read projection |
| Admin simple mutations | Server Action | same-app authenticated tooling |
| Provider webhook | Route Handler | external HTTP contract |

Transport may change only when the use case changes; it must not duplicate business logic.

---

## 11. No public API commitment

Routes under `/api/...` are **application protocols**, not a supported third-party developer API.

Therefore V1.x does not promise:

- public API keys;
- external consumer SLAs;
- backwards-compatible third-party versioning;
- Swagger/OpenAPI publication;
- cross-origin browser access.

Internal protocol schemas are still versioned/tested deliberately enough to avoid breaking our own frontend.

If Dex-Sphere or another product later needs to consume portfolio data externally, that is a new scope/ADR rather than an accidental reliance on private routes.

---

## 12. Route naming baseline

Exact Next.js folder syntax belongs to implementation, but the conceptual protocol names are:

```text
POST /api/arcade/sessions
POST /api/arcade/sessions/[sessionId]/finalize
GET  /api/arcade/leaderboards/[gameId]

POST /api/social/sketches
POST /api/social/reports
POST /api/social/reactions        # only if feature ships

POST /api/webhooks/resend         # only when webhook processing is enabled
```

Guestbook submission remains a Server Action baseline rather than adding an API route just for symmetry.

No `/api/admin/*` route family is required merely because Admin exists; authenticated Server Actions can remain the simpler boundary for V1.x moderation mutations.

---

## 13. AppResult

Application services return a stable discriminated result rather than throwing provider-specific errors through the transport.

Conceptual contract:

```ts
type AppResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: AppError;
    };
```

Expected `AppError` shape:

```ts
type AppError = {
  code: AppErrorCode;
  messageKey: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
};
```

`messageKey` is a localization key or stable semantic key, not raw exception text.

Do not send stack traces, SQL errors, provider request IDs containing secrets or internal table names to the browser.

---

## 14. Stable application error codes

Initial cross-domain codes:

```text
VALIDATION_FAILED
PAYLOAD_TOO_LARGE
UNSUPPORTED_MEDIA
FEATURE_NOT_AVAILABLE
RATE_LIMITED
ABUSE_CHALLENGE_REQUIRED
ABUSE_CHALLENGE_FAILED
NOT_AUTHENTICATED
NOT_AUTHORIZED
NOT_FOUND
CONFLICT
IDEMPOTENCY_CONFLICT
ALREADY_FINALIZED
SESSION_EXPIRED
SESSION_INVALID
PLAUSIBILITY_REJECTED
PROVIDER_UNAVAILABLE
DELIVERY_FAILED
STORAGE_FAILED
INTERNAL_ERROR
```

Domain-specific codes may extend this list but must remain stable and documented.

---

## 15. Route Handler HTTP mapping

Baseline mappings:

| Application error | HTTP |
|---|---:|
| `VALIDATION_FAILED` | 400 |
| `PAYLOAD_TOO_LARGE` | 413 |
| `FEATURE_NOT_AVAILABLE` | 404 or 409 based on route semantics; prefer 404 for unreleased protocol |
| `RATE_LIMITED` | 429 |
| `ABUSE_CHALLENGE_REQUIRED/FAILED` | 403 |
| `NOT_AUTHENTICATED` | 401 |
| `NOT_AUTHORIZED` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` / `IDEMPOTENCY_CONFLICT` | 409 |
| expired Arcade session | 410 |
| semantically invalid/plausibility failure | 422 |
| provider temporarily unavailable | 503 |
| unexpected internal error | 500 |

Do not return HTTP 200 with `{success:false}` for an explicit JSON protocol unless there is a specific protocol reason.

---

## 16. JSON response envelope

Route Handlers use one small shape:

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Failure:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "messageKey": "errors.validation",
    "retryable": false,
    "requestId": "..."
  }
}
```

Field errors may be included when useful.

Do not add generic pagination/meta fields to every response if the use case does not need them.

---

## 17. Server Action return contract

Server Actions use the same semantic `AppResult<T>` family but do not pretend to expose HTTP status codes to the component.

A Contact form receives enough data to render:

- field errors;
- challenge required/failed;
- rate limit;
- recoverable provider failure;
- authoritative sent success.

The browser does not receive internal provider exceptions.

---

## 18. Validation layers

Every mutation crosses these layers:

```text
transport parse
→ schema validation
→ normalization
→ application policy
→ persistence/provider validation
```

### Schema validation

Covers:

- expected object shape;
- allowed enum values;
- required fields;
- string lengths;
- payload byte/structural limits;
- UUID/operation-id format;
- drawing/game evidence structure.

### Normalization

Examples:

- trim accidental leading/trailing whitespace where appropriate;
- normalize line endings;
- normalize text to Unicode NFC where useful;
- preserve display spelling while deriving separate normalized values for comparisons/risk checks;
- validate email syntax without assuming the email local-part is globally case-insensitive;
- never convert arbitrary user text to HTML.

### Application policy

Examples:

- feature released;
- session not expired;
- score plausible;
- moderation transition allowed;
- report target publicly exists;
- admin has required authorization;
- operation not already finalized.

---

## 19. Validation schema ownership

Transport schemas should live next to the backend domain/application contract, not inside React components.

Conceptual structure:

```text
features/contact/contracts/
├── contact-command.schema.ts
└── contact-result.ts

features/arcade/server/contracts/
├── create-session.schema.ts
├── finalize-session.schema.ts
└── leaderboard.dto.ts
```

Client-side validation may reuse a safe subset/shared schema, but server validation remains authoritative.

No schema may import secrets or server-only adapters into a client bundle.

---

## 20. DTO and projection rule

Database entities are **not** automatically API responses.

Public DTOs are allowlists.

Example conceptual public Guestbook DTO:

```ts
type PublicGuestbookEntry = {
  id: string;
  nickname: string;
  message: string;
  publishedAt: string;
};
```

It must not accidentally expose:

- moderation notes;
- abuse key;
- reporter data;
- raw creation IP;
- internal risk score;
- rejected/hidden reason;
- admin IDs.

Admin DTOs are separate and may expose only the operational fields required for moderation.

---

## 21. Date/time serialization

External JSON contracts use ISO-8601 strings in UTC unless a use case explicitly requires another representation.

Application/domain logic uses real date/time types where practical.

The UI localizes presentation separately.

Do not persist formatted strings such as `September 15, 2026` as canonical timestamps.

---

## 22. Authentication boundary

DOC-45 owns exact admin session architecture.

DOC-43 establishes one rule:

> Application services never decide admin identity from route visibility or client-provided admin IDs.

Transport/auth middleware/server helpers construct an authenticated `AdminActor` only after session verification.

Public services receive `PublicActor`.

No visitor pseudo-account is created behind the scenes.

---

## 23. Authorization boundary

Privileged application services explicitly require an admin actor/authorization check.

Examples:

```text
ModerateSubmission
ResolveReport
CreateBan
RevokeBan
ReadModerationQueue
ReadAuditHistory
```

Public route access and database RLS are defense layers, but service-level authorization remains explicit for privileged operations.

RLS design itself is DOC-44.

---

## 24. AbuseGuard port

Public mutation services may invoke a common policy port:

```ts
interface AbuseGuard {
  evaluate(input: AbuseEvaluationInput): Promise<AbuseDecision>;
}
```

Possible decisions:

```text
ALLOW
CHALLENGE_REQUIRED
RATE_LIMIT
BLOCK
FLAG_FOR_REVIEW
```

Exact thresholds, storage and challenge provider belong to DOC-47.

Important rules:

- abuse guard consumes pseudonymous/server-derived context rather than treating browser fingerprinting as identity;
- a challenge is not required on every request by default;
- moderation risk flags do not silently become public user profiles;
- logs do not persist raw message/sketch bodies merely for abuse analytics.

---

## 25. Idempotency model

Idempotency is applied to operations where browser retries, timeouts or duplicate taps could repeat a meaningful side effect.

We define three patterns.

### 25.1 Client operation ID

The frontend generates an operation UUID once when the user initiates an eligible mutation and reuses it for retry of **the same logical operation**.

Used for:

- Contact submit;
- Guestbook submit;
- Sketch publish;
- report submission where appropriate.

It is validated but is not trusted as identity.

### 25.2 Resource-state idempotency

Some operations are naturally keyed by an authoritative resource/session.

Arcade finalization uses the server-issued session ID. A session can reach one final authoritative result only once.

### 25.3 Privileged operation idempotency/concurrency

Moderation/admin changes use expected-version/concurrency guards and optionally an operation ID for audit/retry safety.

Exact persistence mechanics and unique constraints belong to DOC-44.

---

## 26. Idempotency semantics

For an idempotent command:

- first valid execution performs the side effect;
- same operation ID + semantically same payload returns/reconstructs the same result where practical;
- same operation ID + materially different payload returns `IDEMPOTENCY_CONFLICT`;
- expired idempotency retention may be treated as a new operation only according to domain policy;
- the server, not the browser, defines equivalence and retention.

Never generate a brand-new operation ID automatically inside a retry loop for the same logical action.

---

## 27. Contact architecture decision

V1.0 baseline favors **data minimization**:

> Contact message content is delivered through the email provider and is not stored as a general-purpose portfolio database inbox by default.

The server may retain minimal operational/idempotency metadata if required, but should not persist the full `name + email + message` body merely because PostgreSQL exists.

If future reliability/CRM requirements justify durable message storage, that is a deliberate DOC-44/47 amendment with retention/access policy.

---

## 28. Contact submission flow

Baseline:

```text
Contact form
→ Server Action
→ schema validation + normalization
→ release/abuse policy
→ stable operation ID
→ ContactApplicationService
→ EmailGateway
→ Resend
→ authoritative accepted/error result
```

Important behavior:

- browser preserves entered text on recoverable failure;
- server never logs raw message content;
- email provider key stays server-only;
- provider timeout/error maps to `DELIVERY_FAILED`/`PROVIDER_UNAVAILABLE`;
- successful provider acceptance is the success boundary shown to the user;
- optional sender confirmation remains deferred.

---

## 29. Contact email idempotency

The provider adapter receives a stable idempotency key derived from the logical Contact operation.

Conceptual:

```text
contact-delivery/<operationId>
```

Resend supports idempotency keys for send requests, allowing a retry of the same email request to avoid duplicate sending within the provider's idempotency window. Provider-specific details remain inside `EmailGateway`; the application service only expresses “deliver this contact message exactly-once-as-practical.”

This is defense-in-depth with our own operation semantics, not permission to let the provider define our application contract.

---

## 30. EmailGateway port

Conceptual interface:

```ts
interface EmailGateway {
  sendContactMessage(input: ContactDelivery): Promise<EmailDeliveryResult>;
}
```

`ContactDelivery` contains only what the provider needs.

`EmailDeliveryResult` normalizes provider response into:

```text
accepted + providerMessageId?
temporary failure
permanent validation/config failure
```

The rest of the application never imports Resend response types.

---

## 31. Guestbook submission service

Conceptual flow:

```text
Guestbook form
→ Server Action
→ schema/size validation
→ abuse evaluation
→ idempotency check
→ create pending entry
→ return SubmittedForReview
```

Rules:

- no visitor account;
- nickname is presentation data, not identity proof;
- submitted entry does not appear publicly until approved;
- client success copy must say submitted/pending, not published;
- public reads query only approved projection;
- profanity/spam checks may flag risk but do not replace moderation model;
- no HTML or arbitrary embedded markup.

---

## 32. Guestbook public query

`ListApprovedGuestbook` returns a public-safe projection ordered/paginated by a documented policy.

Requirements:

- approved only;
- no hidden/rejected/pending leakage;
- stable cursor pagination preferred if pagination is needed;
- bounded page size;
- deterministic ordering;
- separate public cache policy from admin queue;
- server rendering can call the query directly.

Exact index/cursor columns belong to DOC-44.

---

## 33. Sketch publication boundary

The browser publishes the **logical controlled drawing model**, not an arbitrary image upload.

Conceptual input:

```text
DrawingModel
├── dimensions/logical viewport
├── strokes
├── shapes
├── text objects
└── style values from allowed palette/ranges
```

Server workflow:

```text
validated drawing model
→ canonicalization
→ structural/complexity limits
→ trusted rendering/serialization step
→ pending Sketch persistence
→ moderation
→ approved public projection
```

The server does not accept visitor-authored SVG/HTML and trust it as safe.

---

## 34. Trusted Sketch representation

Preferred architectural direction:

- persist the validated canonical drawing model;
- derive the public visual representation from server-controlled primitives;
- a trusted generated SVG or another deterministic rendering artifact is acceptable if generated by our code from allowlisted primitives;
- all visitor text is escaped as text;
- arbitrary script/event/url attributes are impossible by construction.

Whether the derived artifact lives in PostgreSQL or Supabase Storage is finalized in DOC-44.

The public wall must never render arbitrary client-supplied SVG source.

---

## 35. Drawing complexity controls

Application validation must allow hard limits on:

- total payload bytes;
- stroke count;
- points per stroke;
- total point count;
- text object count/length;
- shape count;
- coordinate ranges;
- numeric precision where useful;
- supported tools/version.

Exact numeric thresholds are performance/security tuning owned by DOC-47/49/prototype evidence.

A rejected oversized drawing returns a useful application error instead of exhausting server memory.

---

## 36. Sketch submission result

Successful publication means:

```text
SUBMITTED_FOR_REVIEW
```

not:

```text
PUBLISHED
```

A later moderation approval changes the public projection.

If local visitor achievements depend on actual publication, the frontend may confirm public approval later; submission alone cannot unlock “published” semantics.

---

## 37. Reporting service

`ReportContent` supports reportable public UGC types without merging reports into content status.

Conceptual command:

```ts
type ReportContentCommand = {
  operationId: string;
  targetType: "guestbook" | "sketch";
  targetId: string;
  reason: ReportReason;
  details?: string;
};
```

Rules:

- target must be a reportable public item;
- report has independent lifecycle;
- report does not automatically hide content by default;
- abuse guard applies to reports themselves;
- duplicate/flood control may deduplicate equivalent reports from the same pseudonymous abuse context/window;
- public response does not reveal how many reports exist or moderation thresholds.

Exact report schema/lifecycle/indexes are DOC-44.

---

## 38. Optional reactions

Reactions are optional V1.2 and must not force architecture into the core release.

If shipped:

- small allowlisted reaction enum;
- accountless anti-flood policy;
- idempotent/upsert-like semantics per abuse context as appropriate;
- public response exposes aggregate counts only;
- no public list of “who reacted”;
- no popularity ranking that changes the portfolio's purpose.

The endpoint/service is not deployed merely because the schema is documented.

---

## 39. Arcade protocol overview

Arcade uses server authority only at session/result boundaries.

```text
POST create session
→ server issues authoritative session
→ client plays locally
→ POST finalize session
→ server validates one-time session + plausibility
→ accepted score is persisted
→ leaderboard projection becomes eligible
```

No database table is directly writable by the browser.

---

## 40. CreateGameSession service

Input concept:

```text
gameId
rulesVersion/client protocol version
optional operation metadata
```

Server creates/returns:

```text
sessionId
canonical gameId
rulesVersion
serverIssuedAt
expiresAt
public session parameters needed by game
```

The session identifier is opaque and unguessable enough for its role.

Token/persistence strategy follows DOC-44/DOC-47.

---

## 41. Arcade session state

Backend lifecycle is distinct from UI gameplay state.

Conceptually:

```text
issued
→ finalized-accepted
→ finalized-rejected
or
→ expired
```

A browser `paused` state does not need a server write.

Do not sync every pause/input/frame to the backend.

---

## 42. FinalizeGameSession service

Input concept:

```text
sessionId
gameId
result summary
client-observed duration/evidence
rulesVersion
optional bounded evidence payload
public nickname only when an accepted score is being submitted/displayed
```

Server checks at minimum:

- session exists;
- game/rules version matches;
- not expired;
- not already finalized with conflicting payload;
- server-observed timing envelope is plausible;
- score/stat combination respects game-specific maxima/invariants;
- evidence structure is valid;
- abuse/rate policy passes.

Then one transaction finalizes the session and, if accepted, creates the score/public leaderboard record.

---

## 43. Pragmatic anti-cheat honesty

No browser evidence can prove honesty against a determined attacker who controls the client.

Therefore the backend targets:

- no trivial direct DB score injection;
- no reused session IDs;
- no impossible timing/score combinations;
- no naive request replay;
- no unlimited session spam;
- rule-version validation;
- suspicious/rejected outcomes that do not corrupt leaderboard data.

Do not claim e-sports-grade cheat prevention.

---

## 44. Arcade finalization idempotency

`sessionId` is the natural idempotency resource.

Rules:

- same finalized session + same canonical result can return the previous accepted/rejected result;
- same finalized session + materially different result returns `IDEMPOTENCY_CONFLICT`/`ALREADY_FINALIZED`;
- two concurrent finalize requests cannot create two scores;
- session finalization and score creation are transactionally coupled.

DOC-44 defines the uniqueness/locking implementation.

---

## 45. Leaderboard query

Public leaderboard DTO contains only public-safe fields such as:

```text
rank
nickname
score
achievedAt
optional game-specific display stats
```

Do not expose:

- session token/evidence;
- abuse data;
- rejected attempts;
- internal plausibility flags;
- IP/network identifiers.

Query policy includes bounded page size and deterministic tie-breaking.

Ranking/index implementation follows DOC-44.

---

## 46. Admin moderation service catalog

Initial privileged services:

```text
ListModerationQueue
GetModerationItem
ApproveSubmission
RejectSubmission
HideSubmission
ResolveReport
DismissReport
CreateBan
RevokeBan
ListActiveBans
ReadAuditHistory
```

Optional later services should not be added as a generic “admin CRUD everything” layer.

Admin editing of canonical professional project data remains forbidden by DOC-36 unless source-of-truth architecture changes through ADR.

---

## 47. Moderation transition policy

Application services own allowed transitions.

Conceptually:

```text
pending → approved
pending → rejected
approved → hidden

## No hidden → approved restore transition in the V1.2 baseline
```

Forbidden or nonsensical transitions return `CONFLICT` rather than silently rewriting state.

Reports remain independent:

```text
open → resolved
open → dismissed
```

Exact enum names in persistence are DOC-44, but semantics must preserve DOC-13.
## 47A. Stable moderation code sets

Application schemas use the DOC-13 canonical report/reaction/ban codes. Admin audit action codes are stable dotted identifiers:

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

Localized labels are presentation data; transports and persistence use the machine codes. There is no `submission.restore` command in the V1.2 baseline.


---

## 48. Optimistic concurrency for admin mutations

A moderation command should carry an expected version or equivalent last-known concurrency token.

Example:

```ts
type ModerateCommand = {
  targetId: string;
  expectedVersion: number;
  decision: "approve" | "reject" | "hide";
  reason?: string;
  operationId: string;
};
```

If another admin/session has changed the resource, return `CONFLICT` and ask the UI to refresh rather than overwriting silently.

This remains useful even if Alejandro is initially the only admin; it prevents double-submit/race corruption and supports future expansion.

---

## 49. Audit boundary

Every privileged state-changing service creates a durable audit event in the same database transaction as the authoritative state change whenever technically possible.

Audit event minimum concept:

```text
actorAdminId
action
targetType
targetId
before/after summary or changed fields where appropriate
reason
operationId
occurredAt
requestId
```

Audit must not blindly duplicate sensitive full payloads.

Exact table/retention are DOC-44/47.

---

## 50. Bans and abuse-control mutations

A ban is not a claim of legal/person identity.

Application service receives an internal abuse subject/identifier produced by the security layer, not a raw fingerprint assembled by the admin UI.

Conceptual operations:

```text
CreateBan(subject, scope, expiresAt, reason)
RevokeBan(banId, reason)
```

V1.x enforcement scopes are feature-local:

```text
contact
guestbook
sketch
reports
reactions
arcade
```

There is no persisted `global-public-writes` subject in V1.x. If one transient network context must be blocked across several surfaces during an incident, the server creates separate feature-scoped enforcement records while the trusted network value is still in memory.

Exact abuse identifier, HMAC/key rotation and retention belong to DOC-47.

---

## 51. Release gating on the backend

ADR-002 is not only a frontend rule.

For unreleased major features:

- route-backed Coming Soon pages may exist;
- mutating backend protocols must not become usable merely because code is deployed;
- server-side release registry/policy gates feature services;
- public write endpoints may be absent or resolve as `FEATURE_NOT_AVAILABLE`/404;
- hidden UI is never the only gate.

A preview/staging environment may explicitly enable features through environment-controlled release configuration.

---

## 52. Transactions

Application services own transaction boundaries based on business invariants.

Must be one database transaction where possible:

- Arcade finalize session + accepted score creation;
- moderation state change + audit event;
- report resolution + audit event;
- ban creation/revocation + audit event;
- any idempotency record + mutation whose duplicate would violate correctness.

Do not start a transaction around long external provider calls such as email delivery.

---

## 53. External side effects and transactions

PostgreSQL transactions cannot atomically include Resend or another external provider.

Therefore application design must not pretend distributed atomicity exists.

Patterns:

- use stable idempotency keys for retryable provider operations;
- commit database invariants separately from external calls when persistence is required;
- record delivery intent/status only if the use case needs durable repair;
- define compensating cleanup for storage artifacts when cross-resource writes can orphan data;
- introduce outbox/background repair only when concrete reliability requirements justify it.

V1.0 Contact currently avoids a DB message inbox, reducing distributed consistency complexity.

---

## 54. Repository philosophy

Repositories are domain-specific ports, not a generic CRUD abstraction.

Good:

```ts
interface GuestbookRepository {
  createPending(...): Promise<...>;
  listApproved(...): Promise<...>;
  getForModeration(...): Promise<...>;
}
```

Avoid:

```ts
interface Repository<T> {
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  find(query: any): Promise<any>;
}
```

The generic version hides domain invariants rather than helping.

---

## 55. Initial repository ports

Expected conceptual ports:

```text
GuestbookRepository
SketchRepository
ReportRepository
ReactionRepository          # only if shipped
GameSessionRepository
LeaderboardRepository
ModerationRepository
BanRepository
AuditRepository
IdempotencyRepository       # if persistence needed per domain
```

Contact does **not** require `ContactSubmissionRepository` in the V1.0 baseline merely to store PII.

DOC-44 may collapse/compose ports where one PostgreSQL transaction is clearer.

---

## 56. Provider adapter ports

Infrastructure-facing ports include:

```text
EmailGateway
DrawingArtifactRenderer
ObjectStorageGateway        # if DOC-44 chooses storage for derived assets
AntiBotVerifier
ExternalFeedGateway         # detailed in DOC-46
GitHubGateway               # detailed in DOC-46
```

The application layer does not expose provider SDK types.

---

## 57. Provider response validation

Every third-party response is untrusted external data.

Adapters normalize:

- success/error categories;
- provider IDs;
- retryability;
- timestamps;
- webhook event types.

Never:

```ts
const result = response.json() as TrustedInternalType;
```

without runtime validation where the payload influences application behavior.

---

## 58. Webhook architecture

A provider webhook endpoint follows:

```text
HTTP request
→ bounded body read
→ signature verification
→ event schema validation
→ provider event-id idempotency
→ application service
→ minimal acknowledgement
```

Rules:

- verify signature before trusting payload;
- do not expose secrets in logs;
- duplicate provider event IDs are safe;
- unknown event types are handled deliberately;
- long-running work should not block acknowledgement if/when background infrastructure is introduced;
- provider webhook support is implemented only when we actually consume useful events.

Resend webhook ingestion is optional until delivery-status use cases justify it.

---

## 59. CORS and same-origin policy

V1.x public write protocols are intended for the portfolio origin, not arbitrary third-party websites.

Baseline:

- no `Access-Control-Allow-Origin: *` for mutation routes;
- same-origin expectations checked at the transport/security boundary where appropriate;
- authenticated admin writes receive stronger origin/CSRF protections defined in DOC-47;
- external webhooks are explicitly exempt from browser-origin assumptions and instead use provider signature verification.

---

## 60. Cache behavior by backend use case

### Public stable reads

May use bounded/shared caching according to DOC-41/46/49.

Examples:

- approved Guestbook list;
- approved Sketch list;
- leaderboard.

### Mutations

No shared cache of mutation responses containing request/user-specific state.

### Admin

No public/shared caching of moderation/report/audit projections.

### Provider-backed reads

Use normalized cached snapshots; provider calls do not occur independently from every component.

Precise Next.js cache APIs are implementation-version-specific and remain downstream detail.

---

## 61. Cache invalidation responsibility

When a mutation changes a public projection, the application layer emits/returns enough information for the transport/invalidation adapter to refresh the affected surface.

Examples:

- approving Guestbook → invalidate Guestbook public projection;
- approving Sketch → invalidate Sketch Wall;
- accepting score → invalidate that game leaderboard;
- hiding previously public content → invalidate affected public list/detail immediately enough for moderation needs.

Do not hide invalidation calls deep inside random repository methods.

---

## 62. Retry policy

Retries are explicit and bounded.

Allowed examples:

- retry provider delivery with same idempotency key after retryable error;
- retry safe provider read after transient network failure according to DOC-46;
- browser retry of mutation with same operation ID.

Forbidden:

- automatic unlimited retry loop;
- retrying non-idempotent mutation with a fresh operation ID;
- retrying plausibility-rejected Arcade results;
- silently retrying validation/auth failures.

---

## 63. Timeout policy

Every external provider call has a bounded timeout appropriate to request UX.

A Contact submission should fail recoverably rather than hanging indefinitely because the email provider is slow.

Exact timeout values are performance/reliability tuning in DOC-49.

Database/query timeouts and provider timeout instrumentation should be observable without logging raw visitor content.

---

## 64. Concurrency principles

The backend assumes concurrent requests can happen even with low traffic.

Protect against:

- double-click submissions;
- mobile retry after timeout;
- two Arcade finalizations;
- two moderation tabs acting on same entry;
- duplicate webhooks;
- reaction/report flooding.

Use database uniqueness/transactions/locking or optimistic concurrency according to invariant; exact implementation is DOC-44.

---

## 65. Privacy classification at service boundaries

Services must distinguish sensitive/task-specific payloads from operational metadata.

Sensitive examples:

- Contact name/email/message;
- Guestbook message/nickname;
- Sketch text/drawing data;
- report details;
- abuse-control identifiers.

Operational examples:

- request ID;
- application error code;
- duration;
- feature/service name;
- provider outcome category.

Do not automatically copy sensitive payloads into logs, analytics, traces or audit events.

---

## 66. Structured logging boundary

Transport/application services may emit structured operational events such as:

```text
contact.submit.accepted
contact.submit.provider_failed
guestbook.submit.pending
sketch.submit.pending
report.created
arcade.session.created
arcade.session.accepted
arcade.session.rejected
moderation.submission.approved
```

Recommended metadata:

```text
requestId
service/useCase
outcome
errorCode
durationMs
resourceId where safe
```

Never raw Contact messages or full UGC payloads.

Detailed observability/Sentry scrubbing follows DOC-49.

---

## 67. Error logging versus audit logging

These are different systems.

**Operational/error logs** answer:

> Did the backend function correctly?

**Audit records** answer:

> Which authorized admin changed protected state, and what did they do?

Do not use Sentry logs as moderation audit history.

Do not fill durable audit tables with every public 400/429 request.

---

## 68. Security-sensitive failure behavior

Public failures must avoid information disclosure.

Examples:

- report target missing/private may use generic `NOT_FOUND`;
- admin auth failure does not reveal hidden moderation data;
- email delivery failure does not expose provider credential/config detail;
- database conflict does not expose SQL/table names;
- anti-bot failure does not reveal scoring/rate-limit thresholds;
- Arcade rejection may give user-safe reason class without exposing full anti-cheat heuristics.

---

## 69. Content-Type and body policy

Mutation Route Handlers accept only their documented media type.

Baseline JSON protocols use:

```text
Content-Type: application/json
```

Sketch publication is structured JSON/logical drawing data, not `multipart/form-data` arbitrary file upload in V1.x.

Unsupported content types return a controlled error.

Request bodies are bounded before expensive parsing/processing where framework facilities permit.

---

## 70. No unsafe HTML backend contract

UGC text stays text.

The backend does not offer fields such as:

```text
html
customCss
script
embedCode
iframeUrl
```

for public submissions.

If a future rich-text feature exists, it requires a separate constrained content model/security review.

---

## 71. Localization boundary

Application services return semantic result/error codes, not final Spanish/English prose.

The UI owns localized display messages.

Exceptions:

- user-generated content remains exactly the user's content (subject to normalization/moderation), not automatically translated;
- provider email template content may be localized deliberately at the email adapter/template layer.

Do not store translated copies of Guestbook messages merely for interface parity.

---

## 72. Feature protocol versioning

Protocol evolution is explicit where state spans client/server deployments.

Arcade sessions include a `rulesVersion`/protocol version so a stale browser cannot submit results under ambiguous scoring rules.

Drawing model includes a schema/tool version so the server knows how to validate/upgrade/reject it.

Operation DTOs that are deployment-local do not need arbitrary `/v1/` URL prefixes purely for aesthetics.

---

## 73. Backward compatibility during deployment

Because users may keep a page open while a new deployment occurs:

- Arcade session protocol/rules version detects incompatible stale clients;
- drawing schema version detects incompatible payloads;
- idempotency/retry semantics survive short deployment transitions;
- user-facing errors should ask for refresh/retry rather than corrupt state.

We do not guarantee indefinitely old browser sessions.

---

## 74. Application service examples

### Contact

```text
SubmitContact
```

### Social

```text
SubmitGuestbookEntry
ListApprovedGuestbook
PublishSketch
ListApprovedSketches
ReportContent
ReactToContent           # optional
```

### Arcade

```text
CreateGameSession
FinalizeGameSession
GetLeaderboard
```

### Moderation

```text
ListModerationQueue
GetModerationItem
ModerateSubmission
ResolveReport
CreateBan
RevokeBan
ReadAuditHistory
```

### Runtime/status

Provider-backed read services are specified further in DOC-46.

---

## 75. Example service composition

Conceptual only:

```ts
export async function submitGuestbook(
  command: SubmitGuestbookCommand,
  ctx: RequestContext,
  deps: {
    guestbook: GuestbookRepository;
    abuse: AbuseGuard;
    idempotency: IdempotencyRepository;
  }
): Promise<AppResult<SubmitGuestbookResult>> {
  // 1. release policy
  // 2. abuse decision
  // 3. idempotency
  // 4. transactionally create pending record
  // 5. return public-safe result
}
```

Implementation tooling may choose class/function syntax, but may not collapse those concerns back into the action file.

---

## 76. Backend folder direction

Recommended feature-first implementation:

```text
src/
├── features/
│   ├── contact/
│   │   ├── server/
│   │   │   ├── actions/
│   │   │   ├── services/
│   │   │   ├── contracts/
│   │   │   └── ports/
│   │   └── ui/
│   │
│   ├── social/
│   │   ├── guestbook/server/
│   │   ├── sketches/server/
│   │   └── reports/server/
│   │
│   ├── arcade/
│   │   └── server/
│   └── admin/
│       └── server/
│
├── server/
│   ├── core/
│   ├── auth/
│   ├── abuse/
│   ├── db/
│   └── integrations/
│
└── app/
    └── api/
        └── ... thin route adapters ...
```

Exact `src/` usage is implementation convention; dependency direction is normative.

---

## 77. `server-only` boundary

Modules importing:

- database service credentials;
- provider API keys;
- admin session internals;
- server-only environment values;
- privileged repositories;

must live behind server-only module boundaries so accidental client imports fail during development/build.

DOC-42's client/server boundary rules remain authoritative.

---

## 78. Environment configuration access

Application services do not read `process.env` ad hoc.

Server configuration is validated centrally at startup/build/runtime as appropriate and injected through adapters/config modules.

Bad:

```ts
if (process.env.RESEND_API_KEY) ...
```

scattered in feature files.

Preferred:

```text
validated server config
→ Resend adapter construction
→ EmailGateway
```

Exact environment topology is DOC-48.

---

## 79. Secret-redaction rule

Provider errors are normalized before logging/returning.

Never expose/log:

- Supabase service-role key;
- Resend API key;
- webhook signing secret;
- admin session token;
- anti-bot secret;
- HMAC abuse key secret;
- raw Authorization/Cookie headers.

This requirement applies even in preview logs.

---

## 80. Backend test seams

DOC-50 owns full testing strategy, but DOC-43 requires architecture that enables:

- application-service unit tests with fake/in-memory ports;
- repository integration tests against isolated database environment;
- Route Handler contract tests;
- Server Action behavior tests where practical;
- idempotency/concurrency tests;
- provider adapter tests with mocked provider responses;
- webhook signature/idempotency tests;
- abuse decision mapping tests;
- authorization tests for every privileged service;
- no-public-leak projection tests.

If a use case can only be tested through a full browser because all logic lives in a route file, the architecture is wrong.

---

## 81. Backend prototype/implementation gates

Before broad V1.x feature expansion, verify at least:

### Gate B1 — Contact

- valid Contact reaches provider;
- provider timeout preserves browser text;
- duplicate retry with same operation ID does not send duplicate email within supported provider semantics;
- raw message is absent from logs.

### Gate B2 — Guestbook

- submission becomes pending;
- public query cannot see it;
- approval makes it public;
- hidden/rejected content never leaks.

### Gate B3 — Sketch

- arbitrary file upload is rejected/not accepted;
- canonical drawing payload validates;
- malicious/unsupported primitives cannot become executable public markup;
- oversized drawing fails safely.

### Gate B4 — Reports

- report does not mutate content moderation state automatically;
- duplicate/flood policy works;
- admin sees report independently.

### Gate B5 — Arcade

- direct fake score without eligible session cannot persist;
- duplicate finalize creates at most one authoritative score;
- impossible result is rejected;
- accepted result appears in public leaderboard.

### Gate B6 — Admin concurrency

- stale moderation command returns conflict;
- successful moderation state change and audit event stay consistent.

### Gate B7 — Release gating

- Coming Soon UI cannot bypass unreleased server mutation capability.

---

## 82. Performance principles

The backend should be boringly fast rather than theatrically distributed.

Rules:

- avoid internal HTTP;
- select only required public fields;
- bound list queries;
- use indexes designed in DOC-44;
- do not hold DB transactions open across provider network calls;
- do not serialize huge raw domain objects into client responses;
- drawings/games have explicit payload limits;
- provider-backed data is cached/normalized in DOC-46;
- expensive work is measured before introducing queue infrastructure.

---

## 83. Failure-domain principles

Backend feature failure is localized.

Examples:

```text
Resend down
→ Contact degraded
→ Projects/CV/Home unaffected
```

```text
Supabase runtime unavailable
→ Guestbook/Arcade/Admin degraded
→ repository-backed professional content/CV remain available
```

```text
GitHub provider down
→ cached/stale Channel/Widget state
→ UGC/contact unaffected
```

Application services should not create accidental cross-feature dependencies.

---

## 84. Data source-of-truth protection

DOC-36 remains authoritative for canonical professional content.

Backend/Admin must not introduce mutations such as:

```text
UpdateProjectTitle
UpdateExperienceDates
EditCertification
```

against a runtime database unless a future ADR explicitly migrates those source-of-truth domains.

This prevents split-brain between repository content and database state.
## 84A. Managed-status source-of-truth boundary

`Currently Building` is repository-authored managed status in the approved V1.x baseline. DOC-43 therefore defines **no** `UpdateCurrentlyBuilding` runtime command, API or Admin mutation. If a future product decision still needs Admin editing, a source-of-truth migration ADR must first define the runtime table/service, migration, fallback and rollback semantics. Until then, edits happen through the governed repository authoring workflow.


---

## 85. No hidden visitor profile

Backend services must not join task-specific identities into a universal profile.

Prohibited implicit linkage:

```text
Contact email
→ Guestbook nickname
→ Arcade nickname
→ Sketch identity
→ returning local name
```

Any abuse correlation needed for safety uses privacy-conscious security-layer identifiers and does not become public/product identity.

---

## 86. Deletion/hiding semantics

Backend architecture must preserve the distinction between:

- public visibility;
- moderation state;
- retention/audit obligation;
- physical deletion.

`hide` does not necessarily mean immediate physical delete.

`reject` does not imply the record becomes publicly queryable.

Exact retention/anonymization windows belong to DOC-44/47.
## 86A. Accountless privacy-deletion protocol

The public backend exposes a narrow same-origin deletion capability protocol for eligible Community submissions and Arcade scores, conceptually:

```text
POST /api/privacy/delete
(resourceType, resourceId, deletionToken)
```

The service verifies the high-entropy capability digest, applies rate/size controls, removes public visibility immediately, and invokes the DOC-47/DOC-44 retention/anonymization policy. The token authorizes only that exact resource and does not authenticate a person.

The response never reveals whether unrelated resources exist. Manual Admin privacy actions use the same domain policy and produce `privacy.delete_content`, `privacy.anonymize_content` or `score.remove` audit actions as appropriate.


---

## 87. Soft-delete caution

Do not apply a universal `deleted_at` column to every table by habit.

Use lifecycle semantics that match each domain.

Examples:

- moderation content may need hidden/rejected state + later purge;
- audit history should generally be append-only/retention-controlled;
- expired Arcade sessions may be purged by policy;
- Contact full message is not persisted in the baseline at all.

DOC-44 decides physical data model per entity.

---

## 88. Provider webhook versus polling choice

DOC-43 defines safe webhook ingestion but does not require webhooks for every provider.

Use webhook when:

- provider emits a meaningful state transition we need promptly;
- signature verification/idempotency are supported;
- polling would be wasteful or stale.

Use scheduled/pull refresh when:

- external content is cacheable;
- eventual freshness is acceptable;
- provider webhook complexity has no product value.

DOC-46 chooses per integration.

---

## 89. API discovery/privacy

Because mutation routes are public web endpoints, obscurity is not protection.

Security comes from:

- validation;
- server authorization where privileged;
- release gate;
- abuse controls;
- idempotency;
- size limits;
- origin/signature policy;
- least-privilege persistence.

Robots/noindex do not secure APIs.

---

## 90. Backend implementation review checklist

Every new command must answer:

1. Which release owns it?
2. Who is the actor: public or admin?
3. What is the authoritative validation schema?
4. Is it idempotent/retryable?
5. What is the transaction invariant?
6. What repositories/providers does it use?
7. What public/private DTO leaves the service?
8. What abuse/authorization policy applies?
9. What sensitive data must never be logged?
10. What cache/projection must be invalidated?
11. What happens if the provider/database fails halfway?
12. How is it tested without a browser?

A PR that cannot answer these questions is not backend-ready.

---

## 91. Implementation-tool rules

Implementation tooling must:

- read DOC-41, DOC-42, DOC-43 and relevant product/security docs before backend work;
- keep Route Handlers/Server Actions thin;
- not call Supabase directly from public/client components;
- not create generic CRUD repositories merely for speed;
- not create new `/api` routes for server-internal reads;
- not invent visitor accounts;
- not persist Contact PII/message body without an approved architecture change;
- not expose service-role/provider secrets;
- not reuse Contact/UGC identities for personalization;
- use stable operation IDs where idempotency is required;
- preserve pending/public moderation semantics;
- treat reports separately from content status;
- prevent direct authoritative leaderboard writes;
- add explicit error codes rather than returning raw exceptions;
- update this document/ADR if implementation needs a material architecture change.

---

## 92. Deferred decisions

DOC-43 deliberately leaves these downstream:

### DOC-44

- physical table names;
- UUID strategy;
- indexes;
- constraints;
- RLS;
- exact idempotency tables;
- moderation/report schemas;
- drawing storage location;
- session/score table design;
- retention columns/jobs.

### DOC-45

- admin sign-in factor;
- MFA/passkeys;
- cookie/session refresh;
- recovery;
- authorization roles beyond initial admin.

### DOC-46

- GitHub/news cache TTL;
- scheduled refresh;
- provider-specific backoff;
- webhook adoption;
- background repair/outbox if later needed.

### DOC-47

- exact rate limits;
- Turnstile trigger policy;
- HMAC abuse-key construction;
- CSRF implementation;
- CSP/security headers;
- threat model.

### DOC-49

- timeouts;
- SLOs;
- tracing/alert thresholds;
- detailed retry budgets.

---

## 93. Acceptance criteria for DOC-43

DOC-43 is successfully implemented when:

- business rules do not live directly in route/action files;
- server code does not call the application's own API routes for internal reads;
- public/admin DTOs are explicit allowlists;
- public mutations are schema-validated and abuse-aware;
- privileged mutations require verified admin actor;
- retries cannot trivially duplicate Contact email, UGC records or scores;
- reports remain independent from moderation status;
- Sketch publication never accepts arbitrary visitor image/SVG upload as authoritative content;
- Arcade score requires a valid server-issued session;
- moderation state changes are concurrency-safe and audited;
- unreleased feature protocols are server-gated;
- raw private payloads do not leak into logs/errors;
- provider/database failures remain localized;
- application services can be tested independently from React and provider SDKs.

---

## 94. Reference baseline

Implementation should verify exact current APIs against pinned dependency/provider versions during V0.

Primary references:

- Next.js App Router / Server Actions / Route Handlers documentation: `https://nextjs.org/docs/app`
- Supabase server-side/auth/database documentation: `https://supabase.com/docs`
- Resend Email API: `https://resend.com/docs/api-reference/emails/send-email`
- Resend idempotency keys: `https://resend.com/docs/dashboard/emails/idempotency-keys`

Documentation examples are references, not permission to override this architecture contract.

---

## DOC-43 — Decision Registry

| ID | Decision |
|---|---|
| `BEA-001` | Backend uses thin transports over explicit application services and infrastructure ports. |
| `BEA-002` | The backend remains part of the modular monolith; V1.x does not introduce microservices. |
| `BEA-003` | Business rules do not live directly in Server Actions or Route Handlers. |
| `BEA-004` | Server-rendered code calls query/application services directly rather than self-fetching the app's own API. |
| `BEA-005` | Commands and queries are conceptually separated without adopting CQRS infrastructure. |
| `BEA-006` | Application services may use functions or classes; boundary clarity matters more than OOP ceremony. |
| `BEA-007` | RequestContext is normalized server-side and does not expose raw cookies/IP to domain logic. |
| `BEA-008` | Server Actions are the baseline for same-app form mutations such as Contact. |
| `BEA-009` | Route Handlers own explicit JSON/webhook/game/drawing protocols. |
| `BEA-010` | V1.x does not promise a supported third-party public API. |
| `BEA-011` | API transports use explicit typed response/error contracts and meaningful HTTP status codes. |
| `BEA-012` | Provider/database exceptions are normalized and never returned raw to clients. |
| `BEA-013` | Request validation, normalization and application policy are separate layers. |
| `BEA-014` | Runtime validation schemas are owned by backend feature contracts; client validation never replaces server validation. |
| `BEA-015` | Database entities are never automatically exposed as public/admin DTOs. |
| `BEA-016` | Public DTOs are allowlists and exclude moderation/abuse/internal fields. |
| `BEA-017` | ISO-8601 UTC is the baseline JSON timestamp representation. |
| `BEA-018` | Application services receive verified actor abstractions; client-supplied admin IDs are not authorization. |
| `BEA-019` | Privileged services enforce authorization independently of hidden routes/UI. |
| `BEA-020` | Public mutation services integrate through an AbuseGuard policy port; exact thresholds belong to Security Architecture. |
| `BEA-021` | Eligible public mutations use a stable logical operation ID for safe retries. |
| `BEA-022` | Same idempotency key with materially different payload is a conflict. |
| `BEA-023` | Contact full message content is not persisted in a portfolio database inbox by default in V1.0. |
| `BEA-024` | Contact success means the email provider authoritatively accepted the send request. |
| `BEA-025` | Contact provider retry uses a stable provider idempotency key derived from the logical operation. |
| `BEA-026` | Resend remains behind an EmailGateway adapter; provider types do not leak into application services. |
| `BEA-027` | Guestbook submissions are pending until moderation approval; submission success is not publication. |
| `BEA-028` | Public Guestbook queries return approved public projections only. |
| `BEA-029` | Sketch publication sends a controlled logical drawing model, not an arbitrary image upload. |
| `BEA-030` | Public Sketch rendering is derived from validated server-controlled primitives; arbitrary client SVG is never trusted. |
| `BEA-031` | Drawing payload complexity/size is bounded before expensive processing. |
| `BEA-032` | Reports are independent records/lifecycle and do not automatically replace content moderation status. |
| `BEA-033` | Reports themselves are abuse-controlled and may be deduplicated without revealing thresholds publicly. |
| `BEA-034` | Reactions remain optional and do not create visitor identities or popularity infrastructure. |
| `BEA-035` | Arcade authority exists at session creation/finalization boundaries; gameplay remains local. |
| `BEA-036` | Arcade sessions carry a rules/protocol version. |
| `BEA-037` | Arcade finalization checks session validity, expiry, version and game-specific plausibility. |
| `BEA-038` | One Arcade session can produce at most one authoritative final score. |
| `BEA-039` | Session finalization and accepted score persistence are one database transaction. |
| `BEA-040` | Leaderboard DTOs never expose anti-cheat/session/abuse evidence. |
| `BEA-041` | Initial Admin backend is moderation-focused, not generic CRUD over all portfolio data. |
| `BEA-042` | Admin cannot mutate canonical professional content without a source-of-truth ADR. |
| `BEA-043` | Moderation transitions are explicit application policy and invalid transitions return conflict. |
| `BEA-044` | Admin moderation uses optimistic concurrency/expected version semantics. |
| `BEA-045` | Privileged state change and its audit record occur in one DB transaction where possible. |
| `BEA-046` | Audit logging is distinct from operational/error logging. |
| `BEA-047` | Abuse bans target privacy-conscious internal subjects, not asserted person identity. |
| `BEA-048` | ADR-002 release gating is enforced server-side, not only through Coming Soon UI. |
| `BEA-049` | External provider calls are not performed inside long-running DB transactions. |
| `BEA-050` | Cross-provider atomicity is never assumed; idempotency/repair/compensation are used where needed. |
| `BEA-051` | Repositories are domain-specific ports rather than generic CRUD abstractions. |
| `BEA-052` | Application services do not import concrete Supabase/Resend SDK response types. |
| `BEA-053` | Third-party responses/webhooks receive runtime validation/normalization before application use. |
| `BEA-054` | Webhook processing verifies signatures, deduplicates provider event IDs and keeps acknowledgements minimal. |
| `BEA-055` | Public mutation routes are same-origin application protocols, not wildcard-CORS endpoints. |
| `BEA-056` | Public/admin cache policies stay separated; admin projections are never publicly/shared cached. |
| `BEA-057` | Public projection invalidation is explicit after moderation/score/publication state changes. |
| `BEA-058` | Retries are bounded and reuse the same idempotency identity for the same logical side effect. |
| `BEA-059` | External provider calls use bounded timeouts; exact budgets are defined in Reliability Architecture. |
| `BEA-060` | Backend invariants assume concurrency even at low traffic. |
| `BEA-061` | Sensitive/task-specific payloads are excluded from routine logs, analytics and traces. |
| `BEA-062` | Security-sensitive errors expose stable safe codes rather than thresholds/internal implementation. |
| `BEA-063` | Sketch Route Handler accepts structured controlled data, not arbitrary multipart image upload in V1.x. |
| `BEA-064` | UGC backend contracts do not accept arbitrary HTML/script/embed fields. |
| `BEA-065` | Application services return semantic codes; UI owns ES/EN localization. |
| `BEA-066` | Protocols spanning deployments use explicit schema/rules versions where needed, especially Arcade and Drawing. |
| `BEA-067` | Stale open clients fail recoverably on incompatible protocol versions rather than corrupting state. |
| `BEA-068` | Server-only credentials/config remain behind validated server-only modules. |
| `BEA-069` | Application services do not read environment variables ad hoc. |
| `BEA-070` | Backend architecture must enable service-level unit tests without requiring a browser. |
| `BEA-071` | Backend features fail locally; Contact/UGC/Arcade/provider failures do not make professional repository content unavailable. |
| `BEA-072` | Task-specific Contact/Guestbook/Sketch/Arcade identities are never silently joined into a visitor profile. |
| `BEA-073` | Visibility/moderation/retention/physical deletion remain separate concepts. |
| `BEA-074` | Soft delete is not applied universally; lifecycle semantics are domain-specific. |
| `BEA-075` | Provider webhook versus polling is chosen per integration in DOC-46, not assumed globally. |
| `BEA-076` | Endpoint obscurity/noindex is never a security control. |
| `BEA-077` | Every new mutation must document actor, validation, idempotency, transaction, failure, privacy and test behavior. |
| `BEA-078` | `Currently Building` has no runtime mutation/API in the approved V1.x baseline. |
| `BEA-079` | V1.2 moderation has no hidden→approved restore command unless future product policy explicitly adds one. |
| `BEA-080` | Eligible accountless resources support capability-based self-deletion without creating person identity. |

---

## Accepted baseline / change-control gate

DOC-43 was approved on 2026-09-15. This closes the backend/application-service architecture layer and authorizes DOC-44 to design PostgreSQL, RLS and Storage against stable use-case/invariant contracts instead of inventing domain behavior at the table level.

