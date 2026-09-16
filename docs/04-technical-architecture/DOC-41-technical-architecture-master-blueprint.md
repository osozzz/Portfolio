---
id: DOC-41
title: "Technical Architecture Master Blueprint & System Context"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Technical Architecture Master"
canonical_domain_owner: technical_architecture_master
depends_on:
  - DOC-00
  - DOC-01
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-14
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-18
  - DOC-19
  - DOC-20
  - DOC-21
  - DOC-22
  - DOC-23
  - DOC-24
  - DOC-25
  - DOC-26
  - DOC-27
  - DOC-28
  - DOC-29
  - DOC-30
  - DOC-31
  - DOC-32
  - DOC-33
  - DOC-34
  - DOC-35
  - DOC-36
  - DOC-37
  - DOC-38
  - DOC-39
  - DOC-40
  - ADR-001
  - ADR-002
decision_families:
  - TAM
last_updated: 2026-09-15
---

# DOC-41 — Technical Architecture Master Blueprint & System Context

> **Status:** APPROVED.  
> **Role:** Establish the implementation-level architecture contract for the portfolio before frontend, backend, data, auth, security and infrastructure are specified in deeper documents.

---

## 1. Purpose

The Product, Interface Architecture and Visual Design phases define **what the portfolio is, how it behaves and how it should feel**. DOC-41 begins the next layer: **how the system is technically organized so those decisions can be implemented without accidental coupling, security regressions or framework-driven redesign**.

This document is intentionally a **master blueprint**, not the final schema/API/security specification. It defines:

- system context and trust boundaries;
- selected platform direction;
- runtime and rendering classes;
- frontend/server/data ownership boundaries;
- mutation/API conventions;
- caching and external-integration philosophy;
- deployment topology at a high level;
- repository/module boundaries;
- release/feature-gating architecture;
- resilience and degradation rules;
- which concerns belong to the technical documents that follow.

The governing technical principle is:

> **Use the simplest architecture that preserves the approved product behavior, while creating explicit boundaries where security, persistence, external providers or high-frequency interaction make those boundaries necessary.**

---

## 2. Architecture goals

The architecture must optimize for the following, in order:

1. **Professional content availability.** Projects, experience, education, certifications, CV and contact paths remain reliable even when optional live systems fail.
2. **Fast initial experience.** The system-like interface cannot justify a large client bundle or delayed professional content.
3. **Strong trust boundaries.** Public visitors are unauthenticated; public writes, admin operations and provider secrets are server/data-authoritative.
4. **Progressive interactivity.** Rich client behavior is introduced only where the approved experience requires it.
5. **Maintainable source-of-truth separation.** Canonical professional content, runtime database state, external data and local visitor preferences do not become one undifferentiated data store.
6. **Release-compatible modularity.** V1.0 must ship without dragging V1.2/V1.3/V1.4 runtime cost into the base portfolio.
7. **Graceful provider failure.** GitHub/news/email/analytics/monitoring outages are localized.
8. **Accessibility and responsive parity.** Technical choices cannot make the interface architecture desktop-only, pointer-only or animation-dependent.
9. **Low operational burden.** Managed infrastructure is preferred over owning servers, queues and clusters without a concrete requirement.
10. **Implementation legibility.** Architectural boundaries must be obvious enough that a development tool or contributor can follow them without guessing.

---

## 3. Non-goals of this architecture phase

DOC-41 does **not** introduce:

- microservices;
- Kubernetes;
- a dedicated API gateway product;
- visitor accounts;
- real-time public chat;
- arbitrary user-uploaded image hosting;
- event streaming infrastructure;
- a generalized workflow engine;
- a headless CMS for canonical professional content;
- a bespoke authentication system;
- payment architecture;
- native mobile backends;
- a public third-party API;
- a freeform desktop/window-manager engine;
- more than the two approved initial Arcade games.

Any later need for these requires scope and architecture review rather than being prebuilt “for scale.”

---

## 4. Architecture style

The portfolio uses a **modular full-stack web application** architecture.

At the deployment level, the default shape is one Next.js application plus managed services:

```text
Browser
   │
   ▼
Next.js Application on Vercel
   │
   ├── Static/build-authored professional content
   ├── Server rendering / application services
   ├── Public mutation endpoints
   ├── Authenticated admin application services
   └── Integration adapters
        │
        ├── Supabase PostgreSQL / Auth / Storage
        ├── Resend (email)
        ├── GitHub / Tech Pulse sources
        ├── Anti-bot provider when enabled
        ├── Product analytics adapter (no-op in V0/V1.0)
        └── Sentry-backed error/observability adapter
```

This is a **modular monolith**, not a monolithic codebase in the negative sense. Domain boundaries remain explicit inside one deployable application until a real operational requirement justifies separating them.

---

## 5. System context and actors

### 5.1 Public visitor

Unauthenticated. Can:

- browse public professional content;
- configure local UI preferences;
- submit Contact;
- later submit Guestbook/Sketch/report content;
- later play Arcade and submit eligible leaderboard results;
- consume cached external/live information.

The visitor browser is never trusted to authorize privileged operations or establish authoritative score/moderation state.

### 5.2 Administrator

The only authenticated user class in V1.x.

Can later:

- moderate UGC;
- resolve reports;
- manage bans/risk controls within defined tooling;
- inspect limited operational metadata;
- manage explicitly runtime-owned status where allowed.

Admin does **not** silently replace the repository-owned canonical professional source of truth defined by DOC-36.

### 5.3 Build/CI system

Trusted automation that:

- validates canonical content;
- validates EN/ES parity;
- validates RenderCV;
- produces static/generated assets;
- runs tests and analysis;
- creates deployable Next.js output.

CI has environment-specific credentials only where required and must not make production data mutations during generic preview builds.

### 5.4 External providers

Untrusted from an availability/schema perspective and trusted only for their documented service role. Provider responses are validated/normalized before entering application domain models.

---

## 6. Primary technology direction

The stack is now promoted from “candidate” to **Technical Architecture baseline**, subject to version pinning during V0 setup.

| Concern | Baseline | Architectural role |
|---|---|---|
| Language | TypeScript | application and shared contracts |
| Package manager | pnpm | reproducible project commands/workspace dependency management |
| Web framework | Next.js App Router | routing, RSC, server rendering, route handlers, server actions, metadata |
| UI runtime | React | interface composition and interactive islands |
| Styling | Tailwind CSS + CSS Custom Properties + targeted CSS | composition + canonical design tokens + complex material/effect rules |
| Motion | Motion | primary React motion system |
| Database | PostgreSQL via Supabase | runtime relational persistence |
| Managed auth | Supabase Auth | admin authentication/session foundation |
| Object storage | Supabase Storage where runtime storage is needed | UGC/runtime media; exact bucket model later |
| Deployment | Vercel | Next.js hosting, functions, CDN/preview deployments |
| Email | Resend behind adapter | Contact delivery |
| Anti-bot | Turnstile or equivalent, risk-based | public-write abuse resistance |
| Analytics | **disabled by default in V0/V1.0** behind a no-op wrapper until a separate privacy/provider decision enables it | avoid accidental tracking while preserving a stable instrumentation seam |
| Error monitoring | **Sentry** behind centralized wrapper | runtime error/performance observability baseline |
| Unit/component tests | Vitest-compatible test stack | pure/domain/component verification |
| E2E | Playwright | route/interaction/accessibility-critical flow verification |
| CI/CD | GitHub Actions + Vercel deployment integration | automated verification and delivery |
| CV generation | RenderCV/Typst pipeline | build-time bilingual CV artifacts |

### 6.1 Version policy

DOC-41 deliberately does not hard-code framework/library versions that will become stale in prose.

At V0 initialization:

- production dependencies are pinned through `package.json` + lockfile;
- Node/pnpm/runtime versions are pinned through repository tooling;
- major upgrades are deliberate;
- architecture docs name capabilities, not floating “latest” versions;
- a framework change that invalidates an approved architectural boundary requires documentation review.

---

## 7. Current-framework validation notes

The architecture aligns with current official platform direction at the time of this document:

- Next.js App Router is the route model that supports React Server Components and current full-stack patterns.
- Supabase's current Next.js SSR guidance uses cookie-based server-side auth and separate browser/server clients; its `@supabase/ssr` helper remains an abstraction we will isolate behind our own module because provider APIs can evolve.
- Supabase recommends RLS for exposed relational data.
- Vercel's current guidance for new applications favors Vercel Functions with the Node.js runtime by default rather than designing around legacy Edge Functions.
- Resend supports sending-domain verification with SPF/DKIM and recommends intentional DMARC configuration.

These external facts are implementation references, not product authority.

---

## 8. Runtime classification

Every feature should be classified before implementation.

### R0 — Build/static

Examples:

- canonical profile facts;
- project case studies;
- experience/education/certifications;
- static achievement definitions;
- localized site content;
- RenderCV PDFs/previews;
- static artwork metadata;
- repository-authored `Currently Building` / managed-status content in the approved V1.x baseline.

Properties:

- validated during build/CI;
- no database request required for first render;
- cacheable and SEO-friendly;
- deploy updates when canonical repository content changes.

### R1 — Server-rendered/cacheable runtime

Examples:

- approved public Guestbook list;
- approved Sketch Wall list;
- leaderboard reads;
- GitHub normalized activity;
- Tech Pulse data;
- public operational status only where a future approved source-of-truth decision explicitly makes that status runtime-owned.

Properties:

- server/provider/data layer owns fetch;
- cache/freshness policy explicit;
- stale data may be preferable to empty UI;
- external provider outage does not fail the route shell.

### R2 — Server-authoritative mutation

Examples:

- Contact submission;
- Guestbook submission;
- Sketch publish;
- report submission;
- Arcade session issuance/result submission;
- admin moderation.

`Currently Building` is **not** a runtime mutation in the approved V1.x baseline; a future migration ADR is required before adding such a command.

Properties:

- server schema validation;
- security/abuse policy;
- explicit idempotency/deduplication where retries are possible;
- authoritative DB/provider side effect only after validation.

### R3 — High-frequency local interaction

Examples:

- Project selector movement;
- Widget Field rearrangement;
- Drawing canvas pointer stream;
- Arcade gameplay loop;
- gamepad polling;
- cursor effect;
- local sound playback;
- local visitor achievements.

Properties:

- client-owned hot path;
- no server roundtrip per frame/input;
- data sync only at meaningful boundaries;
- avoids global React rerender loops.

### R4 — Authenticated admin runtime

Examples:

- moderation queue;
- report resolution;
- destructive moderation;
- ban/risk management.

Properties:

- verified admin identity;
- dynamic/no shared public caching;
- server/data authorization;
- auditable mutation path.

---

## 9. Rendering strategy

### 9.1 Default rule

> **Server render by default; hydrate only the behavior that needs a browser.**

The app-like aesthetic does not justify turning the whole site into a client-rendered SPA.

### 9.2 Server Component candidates

Prefer Server Components for:

- route layouts;
- professional content;
- project data projection;
- SEO metadata inputs;
- public static/cached lists;
- CV route metadata/content;
- non-interactive case-study composition.

### 9.3 Client Component candidates

Use Client Components for explicit interaction domains:

- Dock active/transition state where needed;
- Project selector interactive controller;
- Personal Widget Field customization;
- command palette;
- terminal;
- settings/local preferences;
- audio manager;
- Drawing Pad;
- Arcade games;
- gamepad adapter;
- local achievement engine;
- interactive media viewer.

A parent does not become a Client Component merely because one descendant is interactive.

### 9.4 Client boundary rule

Client boundaries should be **feature islands**, not page-wide `"use client"` declarations.

Server-fetched/validated serializable data may cross into an island as props. Provider clients, privileged secrets and database service credentials never cross the boundary.

---

## 10. Route/runtime mapping

Baseline route behavior:

| Surface | Baseline rendering/runtime |
|---|---|
| `/[locale]` Home | server-rendered shell/content + client Project/Widget interaction island |
| `/[locale]/projects/[slug]` | static/server-rendered canonical project data + interactive media enhancements |
| `/[locale]/achievements` | V1.0 Coming Soon; V1.1 static definitions + local visitor progress island |
| `/[locale]/arcade` | V1.0 Coming Soon; V1.3 server shell + lazy client game bundles |
| `/[locale]/arcade/[game]` | server route shell + isolated client game runtime + server result protocol |
| `/[locale]/channel` | V1.0 Coming Soon; V1.4 cacheable normalized external/runtime data |
| `/[locale]/social` | V1.0 Coming Soon; V1.2 server reads + server-authoritative writes |
| `/[locale]/contact` | server-rendered form + progressive client UX + server mutation |
| `/[locale]/cv` | server-rendered route over build-generated static artifacts |
| `/[locale]/making-of` | canonical/static content |
| `/[locale]/changelog` | curated/static or managed cacheable data |
| `/[locale]/status` | static baseline + bounded runtime status where real |
| `/admin/*` | authenticated dynamic runtime; never shared public cache |

Coming Soon behavior follows ADR-002 and is not implemented as disabled Dock links.

---

## 11. Browser/server trust boundary

The browser may be trusted for:

- presentation state;
- transient selection/focus;
- local preferences;
- local achievements;
- canvas/game local computation;
- optimistic display that can be rejected by the server.

The browser is **not** trusted for:

- admin identity;
- moderation authorization;
- final public moderation state;
- final leaderboard eligibility;
- arbitrary DB row ownership assertions;
- anti-bot result truth without server verification;
- provider secret access;
- professional canonical facts;
- security/rate-limit decisions.

---

## 12. Supabase access boundary

### 12.1 Server-first data access

The baseline architecture prefers runtime database access through **server-owned services** rather than allowing every UI component to query Supabase directly.

Reasons:

- prevents provider response shapes from becoming UI contracts;
- centralizes validation, authorization and cache policy;
- makes data access testable;
- simplifies future provider/storage changes;
- reduces accidental public write exposure.

### 12.2 Browser Supabase client

A browser Supabase client may exist where the auth/session SDK requires it or a later explicitly approved realtime use case requires it.

It is **not** permission to query arbitrary tables from feature components.

### 12.3 Publishable versus privileged credentials

- publishable client credentials may exist in browser bundles only for intended provider client use;
- service-role/privileged database credentials are server-only;
- service-role access is not the default application data path merely because it is convenient;
- exact RLS/service-role/RPC patterns are defined in Data + Auth/Security Architecture.

### 12.4 RLS baseline

Any table exposed through Supabase's Data API must have intentional privileges and RLS policies appropriate to its access model. “The UI never calls it” is not a policy.

---

## 13. Canonical content versus database state

DOC-36 remains authoritative.

### Repository-owned canonical data

Examples:

- profile;
- experience;
- education;
- certifications;
- skills;
- projects;
- case studies;
- authored project visual context;
- core localized copy.

### Database/runtime-owned data

Examples:

- Guestbook submissions;
- Sketch publication/moderation;
- reports;
- Arcade sessions/scores;
- moderation actions;
- risk/ban records;
- runtime operational status only where explicitly designated by an approved source-of-truth decision;
- contact audit/retention state if persistence is chosen.

### Local-device data

Examples:

- Widget Field layout preferences;
- theme/language/motion/transparency/sound preferences;
- onboarding/boot state;
- explicit remembered visitor name;
- local achievements/progression where approved.

### External-derived cache data

Examples:

- GitHub activity;
- Tech Pulse items;
- provider delivery metadata where needed.

No subsystem may migrate data from one authority class to another implicitly.

---

## 14. Mutation architecture

### 14.1 Service-first rule

UI-facing mutation mechanisms are adapters. Business rules live in domain/application services.

```text
UI Form / Game / Admin UI
        ↓
Server Action or Route Handler
        ↓
Validation + Request Context
        ↓
Application Service
        ↓
Repository / Provider Adapter
        ↓
PostgreSQL / Storage / Email / External Provider
```

This avoids business rules being duplicated inside route files.

### 14.2 Server Actions

Prefer Server Actions for:

- same-origin form mutations tightly coupled to a rendered route;
- actions that do not require a stable external HTTP contract;
- progressive-enhancement-friendly interactions.

Likely examples:

- Contact submit;
- simple admin form mutations where an explicit protocol is unnecessary.

### 14.3 Route Handlers

Prefer Route Handlers for:

- explicit application protocols;
- Arcade session/result endpoints;
- report/submission endpoints where client workflows benefit from a JSON contract;
- external-provider callbacks/webhooks;
- dynamic OG endpoints where applicable;
- health/integration endpoints where explicitly public-safe.

### 14.4 No duplicated mutation logic

If both a Server Action and Route Handler expose the same capability, both call the same application service and validation schema.

---

## 15. Validation contract

Three different validation categories exist:

### 15.1 Authoring/build validation

Canonical YAML/Markdown and RenderCV sources validate in CI before deployment.

### 15.2 Request validation

Public/admin mutation payloads validate:

- type;
- required fields;
- allowed enum values;
- length/size;
- normalized email/nickname/reason fields where appropriate;
- structured drawing/game payload constraints;
- anti-bot/rate-limit context.

The exact schema library will be pinned during V0; a TypeScript-first schema validator such as Zod is the baseline choice unless a documented setup decision selects an equivalent.

### 15.3 Provider response validation

GitHub/news/webhook/provider payloads are treated as external data and normalized before use. Do not cast third-party JSON directly into internal domain types and trust it.

---

## 16. Local visitor state architecture

Local state is intentionally important to the product but is not a visitor-account substitute.

Persisted local domains remain versioned and separable:

```text
portfolio.preferences.v1
portfolio.widget-field.v1
portfolio.onboarding.v1
portfolio.identity.v1
portfolio.achievements.v1
```

The exact key names are implementation detail, but the architecture requires:

- schema versioning;
- migration/reset behavior;
- corruption-safe defaults;
- no sensitive Contact/UGC data copied into local personalization;
- “Forget me” removes explicit remembered identity;
- Reset Layout resets Widget Field state without deleting unrelated preferences.

Do not store one giant opaque `portfolioState` blob.

---

## 17. Personal Widget Field architecture

ADR-001 remains authoritative.

Technical implications:

- Widget definitions live in a registry with stable IDs.
- Registry entries declare release eligibility, supported sizes, context rules and data/runtime class.
- Layout preference stores logical intent: pinned/hidden/order/semantic size.
- Responsive layout resolves those preferences into current grid placement.
- No persisted pixel coordinates.
- Drag interaction is an input adapter over the same semantic reorder operations used by keyboard controls.
- Context widgets consume normalized SelectionContext/project data rather than independently fetching project records.
- External-data widgets load independently and cannot block Home.

The Widget Field is one of the primary reasons to keep local interaction state separate from server professional content.

---

## 18. Arcade architecture boundary

V1.3 Arcade is intentionally split into **local simulation** and **server authority at session/result boundaries**.

```text
Server issues eligible session context
        ↓
Client loads isolated game bundle
        ↓
Local deterministic/real-time gameplay
        ↓
Client submits result + session evidence
        ↓
Server validates session, timing/plausibility/rate limits
        ↓
Accepted result persists
```

Rules:

- no network call per frame/input;
- score table never accepts arbitrary direct browser insert as authoritative;
- game implementation does not share a global render loop with the portfolio shell;
- Arcade assets/audio load only for Arcade;
- server validation is pragmatic anti-cheat, not e-sports trusted execution.

Exact session token/evidence/data model belongs to Backend/Data/Security Architecture.

---

## 19. Drawing/Sketch architecture boundary

Drawing Pad is a high-frequency client tool.

Local drawing state:

- pointer samples;
- tool state;
- undo/redo;
- canvas model;
- local save/export.

Publication boundary:

```text
Local controlled drawing model/export
        ↓
Explicit Publish
        ↓
Server validation + size/type limits + abuse checks
        ↓
Pending moderation state
        ↓
Approved public projection
```

V1.x does not expose arbitrary visitor image-file upload as a shortcut around this model.

---

## 20. Community/UGC architecture boundary

V1.2 public UGC uses a moderated write model:

```text
public submission
→ validation
→ abuse controls
→ pending/reviewable persistence
→ moderation
→ approved public read projection
```

Reports are independent records from content moderation state, consistent with DOC-13 and the consistency amendment.

Public reads expose only approved public fields. Admin reads require authenticated authorization and must not share public caches.

---

## 21. Contact/email architecture boundary

Contact remains an R2 server-authoritative mutation.

Baseline flow:

```text
Form
→ client UX validation
→ server schema validation
→ abuse/rate policy
→ optional minimal persistence/idempotency record
→ Resend adapter
→ accepted/error result
```

Architecture rules:

- provider API key server-only;
- form message is never sent to analytics/error tools as raw payload;
- provider failure returns a useful recoverable state;
- exact “DB + email” versus “email only” retention choice is finalized in Backend/Data Architecture;
- production domain authentication is a release gate.

---

## 22. External live-data architecture

External data follows:

```text
Provider
→ Integration Adapter
→ Validation/Normalization
→ Cache/Stored Snapshot
→ Internal DTO
→ Server-rendered/Widget projection
```

Never:

```text
Component
→ provider API
→ raw provider JSON directly rendered everywhere
```

### GitHub

Used as evidence/activity, not an automated project completion metric.

### Tech Pulse

Uses curated sources/provider strategy. No arbitrary per-request scraping.

### Failure rule

External integrations have localized loading/stale/error states. Professional project content remains available.

---

## 23. Caching architecture

Caching is **data-class-driven**, not “cache everything.”

### C0 — immutable/build output

Canonical repository content/assets for a deployment.

### C1 — long-lived public cache

Stable public projections that change only on deployment or explicit revalidation.

### C2 — bounded stale cache

GitHub/news/public runtime lists where freshness matters but stale data is acceptable.

Expected policy includes:

- TTL/freshness class;
- stale behavior;
- provider-error fallback;
- invalidation trigger if one exists.

### C3 — no shared cache

- authenticated admin routes;
- session-refresh/auth responses;
- mutation responses containing user-specific state;
- sensitive request data.

The precise framework caching primitives are selected in Frontend/Backend Architecture after the Next.js version is pinned. We do not couple the architecture to one experimental cache API in prose.

---

## 24. Runtime choice: Node.js by default

The baseline Vercel function runtime is **Node.js**.

Reasons:

- broad package compatibility;
- database/provider SDK compatibility;
- current Vercel direction for new projects;
- simpler shared server code;
- avoids architectural fragmentation between runtimes.

Edge execution is an exception requiring a measured reason, such as a latency-sensitive request-routing concern that cannot be handled adequately otherwise.

We do not choose Edge merely because it sounds faster.

---

## 25. Background work and queues

No general queue infrastructure is required at V0/V1.0.

Background/async work may become justified for:

- external feed refresh;
- retried email/webhook processing;
- expensive dynamic OG generation;
- moderation processing if workload warrants it.

Decision rule:

> Add scheduled/background infrastructure only when a concrete workflow cannot be served reliably through request-time work, build-time work, provider-native delivery, or a small scheduled refresh.

If a later feature requires durable retry semantics, its architecture document must define idempotency, retry budget and dead-letter/repair behavior before a queue is introduced.

---

## 26. Authentication architecture baseline

DOC-41 selects **managed Supabase Auth** as the admin authentication foundation but defers credential-factor details to the dedicated Auth Architecture document.

Baseline rules already fixed:

- no visitor registration;
- public sign-up disabled/not exposed;
- admin identity verified server-side;
- cookie-based SSR session integration;
- authenticated routes are dynamic/private;
- authorization exists beyond route visibility;
- logout/revocation works;
- password recovery is required if password auth is selected;
- MFA/passkeys can be evaluated for the single administrator without changing public product scope.

---

## 27. Authorization architecture baseline

Authentication answers “who is this?” Authorization answers “may this identity do this?”

Admin authorization must exist at:

1. route/application-service boundary; and
2. data/storage boundary where applicable.

UI checks are convenience only.

Moderation operations should be modeled as explicit commands rather than arbitrary table editing from the browser.

---

## 28. Security boundary map

Primary trust boundaries:

```text
[Browser — untrusted]
        │ HTTPS
        ▼
[Next.js server boundary]
        │
        ├── [Public request validation / rate-limit boundary]
        ├── [Admin auth/authz boundary]
        ├── [Integration adapters]
        │
        ▼
[Supabase / providers]
```

Threat-specific design belongs to the Security Architecture document, but DOC-41 fixes these architecture requirements:

- server-side validation for public writes;
- no privileged secrets in client bundles;
- RLS/least privilege;
- CSP/security headers;
- SSRF controls on server-side URL fetches;
- CSRF/origin protection where cookie-authenticated mutations require it;
- anti-bot/rate limits for abuse-prone endpoints;
- storage policy isolation;
- audit trail for moderation/destructive admin actions.

---

## 29. Localization architecture

Locale remains a **route-level first-class dimension**, not a client-only translation toggle.

- public routes use `/[locale]/...`;
- supported initial locales: `en`, `es`;
- canonical structured facts remain locale-independent where possible;
- localized narrative/copy is resolved server-side for initial route rendering;
- locale switch preserves equivalent route/context;
- client islands receive already-resolved UI strings/data or typed translation access where necessary;
- no business logic branches on translated display strings.

---

## 30. SEO architecture

SEO follows the public-web nature of the product even though the UI feels like software.

- professional routes render meaningful server HTML;
- route metadata derives from canonical content;
- locale alternates/canonicals follow DOC-17;
- major pre-release Dock routes can exist but remain `noindex` and out of sitemap until release;
- admin/internal/mutation endpoints are not indexed;
- JS-only client transitions cannot be the only way to access project details;
- dynamic OG is enhancement and never blocks normal page delivery.

---

## 31. Accessibility architecture implications

Accessibility requirements constrain technical architecture:

- semantic HTML is produced by server/page structure, not reconstructed from canvas;
- keyboard navigation is implemented through semantic action adapters, not pointer emulation;
- focus state remains DOM-based and observable;
- Drawing/Arcade canvas regions have surrounding accessible controls/instructions/state;
- reduced-motion/transparency preferences are available before expensive effects initialize where feasible;
- no essential capability depends on WebGL, Gamepad, View Transitions, hover or custom cursor;
- interactive client islands preserve accessible server fallback/content.

> **Accessibility may simplify presentation, but must never remove capability.**

---

## 32. Performance architecture

The architecture treats client JavaScript as a budgeted resource.

### 32.1 Base route

V1.0 professional routes must not load:

- Arcade engines;
- Drawing Pad runtime;
- admin UI;
- unused social write clients;
- heavy external widgets;
- all audio files;
- GSAP without approved need.

### 32.2 Lazy domain boundaries

At minimum, the following are separate lazy chunks/feature boundaries:

- Drawing Pad;
- Glitch Runner;
- Reflex Deploy;
- Terminal;
- Command Palette if bundle analysis supports separation;
- media-heavy viewers;
- admin application.

### 32.3 Media

Responsive images, focal-point metadata, intrinsic dimensions, modern encoding and deliberate priority/lazy behavior remain required.

### 32.4 High-frequency code

Pointer/game loops use localized state/event loops and refs/store mechanisms appropriate to the workload rather than updating a root React context every frame.

---

## 33. Error and resilience architecture

### 33.1 Error containment

Errors are contained at the smallest meaningful feature boundary.

Examples:

- GitHub widget fails → widget degraded state;
- Tech Pulse fails → Channel shows stale/empty explanation;
- email fails → Contact keeps input and offers retry;
- leaderboard fails → game result can still finish locally, but score publication reports failure;
- admin provider failure → moderation operation reports explicit failure and does not falsely show success.

### 33.2 Professional-core resilience

Database/provider outage should not take down:

- Home canonical projects;
- Project Detail canonical content;
- Experience/Education/Certifications;
- CV static artifact;
- Making Of static content;

where those can be served from deployment/static content.

### 33.3 No fake success

Optimistic UI must reconcile with server rejection. No mutation shows durable success solely because the client animation completed.

---

## 34. Observability architecture baseline

Observability is centralized through adapters.

Potential categories:

- application errors;
- provider failures/timeouts;
- contact delivery outcomes without raw message bodies;
- public-write abuse/rate-limit events at aggregated/safe level;
- moderation mutation failures;
- integration refresh failures;
- performance/Core Web Vitals;
- release/version metadata.

Never send:

- raw Contact messages;
- unpublished drawings;
- secrets/tokens;
- full terminal input history where it may reveal user text;
- precise unnecessary location;
- admin credentials.

Exact provider/event taxonomy belongs to the Observability document.

---

## 35. Analytics architecture baseline

Analytics uses an internal wrapper such as:

```ts
track("project_selected", safeMetadata)
```

rather than importing a vendor SDK in every feature.

Goals:

- provider replaceability;
- schema consistency;
- privacy review;
- easier testing/no-op development behavior.

Analytics should answer product questions, not record every pointer movement in the Widget Field.

---

## 36. Deployment topology

Baseline production topology:

```text
DNS / HTTPS
    ↓
Vercel CDN / Routing
    ↓
Next.js static output + Vercel Functions
    ↓
Supabase + external providers
```

No manually managed VM/server fleet is assumed.

### Deployment classes

- local development;
- Preview deployment per PR/branch as appropriate;
- Production deployment from approved mainline flow.

Preview must never accidentally mutate production persistent data.

Exact Supabase preview/staging/branching mapping belongs to Infrastructure Architecture.

---

## 37. Environment model

Logical environments:

### Development

- local app;
- safe development credentials/data;
- developer observability either disabled or clearly separated.

### Preview

- deployable PR/review environment;
- non-production backend/resources or tightly read-only production-safe integrations where explicitly approved;
- no production mutation secrets by default.

### Production

- production domains;
- production Supabase/provider credentials;
- strict secrets/auth/security configuration;
- monitoring/alerting appropriate to actual impact.

Environment parity is desirable, but **data isolation takes priority over pretending every environment is identical**.

---

## 38. Secret/configuration architecture

Configuration is typed and split into:

### Public configuration

Values intentionally available to browser code, for example public origin or provider publishable identifier.

### Server configuration

Provider/API/database secrets required only server-side.

### Build configuration

Values needed by CI/build tooling such as RenderCV or content generation.

Rules:

- server modules fail fast on missing required production configuration;
- secrets are not read from arbitrary feature files;
- client/server env access is centralized;
- `.env*` secret values are never committed;
- preview/prod credentials are separated.

---

## 39. Repository structure — architectural baseline

Exact file names may evolve, but dependency direction should resemble:

```text
portfolio/
├── app/                         # Next.js routing/composition
│   ├── [locale]/
│   ├── admin/
│   └── api/                     # explicit route-handler protocols only
│
├── features/                    # feature/domain modules
│   ├── home/
│   ├── projects/
│   ├── achievements/
│   ├── arcade/
│   ├── channel/
│   ├── social/
│   ├── contact/
│   ├── cv/
│   └── admin/
│
├── components/
│   ├── primitives/              # L1 reusable primitives
│   └── system/                  # L2 system shell/material/navigation
│
├── lib/
│   ├── content/                 # canonical content loaders/projections
│   ├── validation/              # shared schema contracts
│   ├── server/                  # server-only shared infrastructure
│   ├── integrations/            # provider adapters
│   ├── observability/
│   └── config/
│
├── content/                     # DOC-36 canonical sources
├── cv/                          # DOC-37 RenderCV source/tooling
├── public/                      # deployable static assets/artifacts
├── supabase/
│   ├── migrations/
│   ├── seed.sql                 # if adopted
│   └── config.toml              # if local Supabase workflow adopted
│
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
│
└── docs/                        # this documentation package when added to repo
```

Do not create a generic `utils/` junk drawer for business logic.

---

## 40. Dependency direction

Preferred flow:

```text
Route/UI
  ↓
Feature application logic
  ↓
Domain/shared contracts
  ↓
Repositories / provider adapters
  ↓
Framework/provider SDKs
```

Forbidden direction examples:

```text
Database adapter → React component
Integration SDK → design-system primitive
Canonical content parser → admin UI
Game loop → global app router internals
```

Shared modules should be extracted only when two real consumers share stable semantics, not because two files contain similar lines.

---

## 41. Module boundary rules

### UI components

May depend on:

- typed feature view models;
- semantic actions;
- design tokens;
- safe client services.

Should not know:

- service-role credentials;
- SQL table structure;
- provider raw responses;
- email API details.

### Application services

Own use-case orchestration such as:

- submit contact;
- publish sketch;
- create game session;
- submit score;
- approve guestbook entry.

### Repositories

Own persistence semantics, not UI behavior.

### Integrations

Own provider-specific network/API details and normalization.

### Infrastructure helpers

Own framework/provider plumbing; they do not become the business-domain model.

---

## 42. Data transfer/view models

Database rows/provider responses should not automatically be rendered directly.

Use typed boundaries such as:

```text
DB row
→ repository domain record
→ application projection
→ public/admin view model
→ UI
```

This is particularly important for moderation content where admin-only fields, HMAC identifiers or risk signals must never leak into public payloads.

---

## 43. Database migration baseline

All schema changes use versioned migrations checked into the repository.

Requirements:

- no production-only dashboard edits as the canonical migration process;
- reviewable SQL;
- environment-safe migrations;
- indexes/constraints documented where behavior depends on them;
- seed/fixture strategy separated from production data;
- irreversible migration has forward-fix/restore plan.

Detailed schemas and indexing belong to Data Architecture.

---

## 44. Storage classes

Separate storage intent:

### S0 — Repository/static curated media

Small/stable authored assets that reasonably belong with the project source.

### S1 — Managed curated media

Larger project media if object storage becomes preferable; still authored/trusted content.

### S2 — Pending visitor-generated media

Private/non-public until moderation outcome.

### S3 — Approved public visitor-generated media

Public projection only after moderation.

### S4 — Temporary processing artifacts

Short retention; never treated as permanent source.

The exact bucket topology, signed/public URL policies and image-processing pipeline are defined in Data/Storage Architecture.

---

## 45. Feature gating and release architecture

DOC-02/ADR-002 define release scope.

Technical implementation should use a typed, centralized feature/release registry rather than scattered checks:

```text
space/feature
min_release
public_route_state
indexable
widget_eligible
```

Examples:

- Achievements: route exists V1.0, full capability V1.1;
- Social: route exists V1.0, full capability V1.2;
- Arcade: route exists V1.0, full capability V1.3;
- Channel: route exists V1.0, full capability V1.4.

A pre-release route must not import/load the unreleased feature's heavy client bundle merely to display Coming Soon.

No remote feature-flag SaaS is required for V1.x baseline.

---

## 46. Build pipeline architecture

V0 build verification conceptually performs:

```text
install locked dependencies
→ type/lint/static checks
→ canonical content validation
→ localization/parity validation
→ RenderCV projection/validation/build/verify
→ unit/integration tests
→ Next.js build
→ artifact checks
→ E2E/smoke against deployable environment where appropriate
```

Security/dependency scans are integrated without making every optional scanner a hard local-development dependency.

---

## 47. Test architecture baseline

The system requires different test layers because not everything belongs in E2E.

### Unit

- pure transformation logic;
- selection/release/widget resolver rules;
- validation schemas;
- local-state migration;
- scoring/plausibility pure rules where possible.

### Component/system UI

- focus/selection states;
- responsive variants;
- reduced motion/transparency;
- Widget Field controls;
- forms/error states.

### Integration

- Supabase repository behavior;
- auth/authz;
- email adapter;
- public-write pipelines;
- moderation transitions;
- external cache/normalization;
- Arcade session acceptance/rejection.

### E2E

- critical public journeys;
- locale navigation;
- Contact;
- admin sign-in/moderation when released;
- drawing publish/report when released;
- game result/leaderboard when released;
- keyboard/touch critical paths.

Exact coverage/gates belong to Quality Architecture.

---

## 48. Maintainability rules for implementation tooling

When implementation begins, development tooling must not:

- make a page `"use client"` just to simplify one interaction;
- bypass services and write directly to Supabase from arbitrary components;
- place service-role keys in browser code;
- create a new API endpoint when a server action/use-case service already owns the capability without explaining why;
- create one generic global store for all app state;
- store canonical professional content in DB “because a table exists”;
- infer project status from GitHub commits;
- enable a full provider SDK globally when a lazy adapter suffices;
- make authenticated pages cacheable as public static output;
- add queue/realtime infrastructure preemptively;
- duplicate validation across client/route/repository with inconsistent rules;
- import game/drawing runtime into V1.0 base bundles;
- treat preview as safe to mutate production.

---

## 49. Cost/scaling philosophy

The portfolio should scale primarily through:

- static delivery;
- CDN caching;
- bounded serverless functions;
- cache-normalized external data;
- PostgreSQL indexes/constraints appropriate to actual query shapes;
- lazy feature bundles.

Do not “scale” by adding infrastructure before load exists.

Potential cost drivers to monitor later:

- image/media transfer;
- function invocations/CPU;
- external API refresh frequency;
- database/storage growth from UGC;
- email volume/spam;
- observability event volume;
- preview environment resources.

Architecture should support setting sensible quotas/rate limits before upgrading infrastructure tiers.

---

## 50. Failure-domain table

| Failure | Must remain usable | Allowed degradation |
|---|---|---|
| Supabase runtime outage | canonical portfolio, Project Detail, CV | Social/leaderboard/admin unavailable |
| GitHub outage | portfolio/Channel shell | stale/empty GitHub activity |
| Tech Pulse source outage | portfolio/Channel shell | stale/partial feed |
| Resend outage | all browsing | Contact shows delivery failure/retry |
| Analytics outage | full product | analytics silently/noisily disabled without user impact |
| Error-monitoring outage | full product | logs/alerts reduced |
| Turnstile outage | browsing | protected write may use defined fallback or temporary unavailable state, never infinite challenge |
| RenderCV build failure | previous production deploy remains valid | new build should fail verification rather than publish broken/missing CV |
| localStorage unavailable/corrupt | all public capability | preferences reset/session-only behavior |

---

## 51. Architecture invariants

The following are hard invariants unless superseded by approved ADR:

1. Canonical professional data remains repository-owned in V1.x.
2. No visitor account exists in V1.x.
3. Admin is the only authenticated role class baseline.
4. Public mutations are server-authoritative.
5. Privileged provider/database secrets never reach client bundles.
6. Client-side app feel does not replace route-backed public content.
7. The default rendering model is server-first with interaction islands.
8. External provider responses are normalized behind adapters.
9. Optional live data never owns the professional core.
10. Widget personalization is local and versioned.
11. Arcade hot loops are client-local; results are server-validated at boundaries.
12. UGC visibility is moderation-controlled.
13. Preview does not mutate production by default.
14. Authenticated/admin responses are not shared public cache.
15. Managed platform services are preferred over self-managed infrastructure until a concrete requirement invalidates that choice.

---

## 52. Detailed technical documents that follow

DOC-41 is the master blueprint. The recommended next specification sequence is:

| ID | Proposed document | Normative ownership |
|---|---|---|
| DOC-42 | Frontend Architecture, Rendering & State Boundaries | App Router/RSC/client islands/state/modules |
| DOC-43 | Backend, API & Application Service Architecture | mutations, route handlers, actions, errors/idempotency |
| DOC-44 | Data Architecture, PostgreSQL, RLS & Storage | schema, migrations, indexes, storage, retention |
| DOC-45 | Authentication, Authorization & Admin Session Architecture | admin auth/session/recovery/MFA/authz |
| DOC-46 | Integrations, Caching, Jobs & Provider Resilience | GitHub/news/email/cache/webhooks/scheduling |
| DOC-47 | Security Architecture & Threat Model | trust boundaries, abuse, CSP/CSRF/SSRF/XSS/secrets |
| DOC-48 | Infrastructure, Environments, DNS & Deployment | Vercel/Supabase envs/preview/prod/domain/SSL/backups |
| DOC-49 | Performance, Observability & Reliability Architecture | budgets, metrics, monitoring, alerts, SLO-like goals |
| DOC-50 | Testing & Quality Engineering Strategy | unit/integration/E2E/accessibility/visual/load/security |
| DOC-51 | Repository, CI/CD & Developer Experience Implementation | repo tooling, checks, automation, release pipeline |

This sequence may be adjusted only if dependency ordering improves; IDs should not be reused for unrelated topics after materialization.

---

## 53. Decisions explicitly deferred from DOC-41

The following are intentionally not guessed here:

- exact PostgreSQL tables/columns/indexes;
- exact RLS policies;
- exact admin credential factor/MFA setup;
- Contact DB retention choice;
- exact Supabase project/branch mapping for Preview;
- future product-analytics provider/event set (analytics is disabled/no-op in V0/V1.0);
- exact Turnstile challenge thresholds;
- exact cache TTLs;
- exact scheduled refresh mechanism;
- exact dynamic OG implementation;
- exact schema-validation package version;
- exact state-management library, if any is needed beyond React/local stores;
- exact test/component-environment packages;
- final per-route bundle budgets beyond approved NFR goals;
- final backup/RPO/RTO policy.

These are deferred to named downstream documents, not left as implementer discretion.

---

## 54. Accepted baseline criteria

DOC-41 is approved with the following accepted baseline:

- the product remains a modular full-stack Next.js web app, not a microservice system;
- TypeScript/Next.js/Supabase/Vercel/Resend remain the intended baseline;
- server-first rendering with targeted client islands is the default;
- canonical professional content stays outside runtime DB authority;
- runtime DB access is server/service-oriented rather than arbitrary component-level Supabase access;
- public writes are server-authoritative;
- Node.js is the default server runtime;
- Server Actions and Route Handlers are adapters over reusable application services;
- external providers are normalized/cached behind adapters;
- local personalization remains a distinct versioned local-data domain;
- V1.x feature bundles remain release/lazy bounded;
- managed infrastructure is preferred and queues/microservices are not prebuilt;
- the proposed DOC-42→DOC-51 sequence is an acceptable decomposition for detailed engineering.

---

## 54.1 Approval record

DOC-41 was explicitly approved on **2026-09-15**. Its `TAM-*` decisions are therefore normative within the Technical Architecture Master domain, subject to the authority rules in DOC-00, DOC-32 and approved ADRs. Downstream DOC-42→DOC-51 may refine implementation detail but may not silently contradict DOC-41.

---

## DOC-41 — Decision Registry

| ID | Decision |
|---|---|
| `TAM-001` | The product uses a modular full-stack web application / modular-monolith architecture. |
| `TAM-002` | TypeScript is the application language baseline. |
| `TAM-003` | pnpm is the package-manager baseline, consistent with the approved RenderCV command interface. |
| `TAM-004` | Next.js App Router is the web-framework baseline. |
| `TAM-005` | Server rendering/React Server Components are the default; client components are deliberate interaction islands. |
| `TAM-006` | Tailwind + CSS custom properties + targeted CSS implement layout/tokens/material details. |
| `TAM-007` | Motion remains the primary React motion library; GSAP requires documented need. |
| `TAM-008` | Supabase PostgreSQL/Auth/Storage is the managed data/auth/storage baseline. |
| `TAM-009` | Vercel is the managed Next.js deployment baseline. |
| `TAM-010` | Resend behind an adapter is the Contact email baseline. |
| `TAM-011` | Node.js is the default server runtime; Edge requires a measured use case. |
| `TAM-012` | Canonical professional content remains repository/build-owned, separate from runtime DB state. |
| `TAM-013` | Runtime DB access is server/service-oriented; arbitrary component-level Supabase querying is not the default pattern. |
| `TAM-014` | Privileged/service-role secrets are server-only and are not the default convenience path for all data access. |
| `TAM-015` | Tables exposed through Supabase Data API require intentional privileges/RLS. |
| `TAM-016` | Server Actions are preferred for tightly coupled same-origin UI mutations; Route Handlers own explicit HTTP/application protocols. |
| `TAM-017` | Server Actions/Route Handlers delegate business rules to application services rather than duplicating them. |
| `TAM-018` | Request, authoring and external-provider validation are separate explicit validation layers. |
| `TAM-019` | Local visitor personalization is versioned and domain-separated rather than one global opaque blob. |
| `TAM-020` | Widget Field layout persistence stores logical intent, never pixel coordinates. |
| `TAM-021` | Arcade runs high-frequency gameplay locally and validates eligible results at server boundaries. |
| `TAM-022` | Drawing remains local until explicit publish; arbitrary visitor image uploads stay out of V1.x. |
| `TAM-023` | UGC public projection exposes only moderation-approved public fields. |
| `TAM-024` | External live data enters through provider adapters, validation/normalization and explicit cache policy. |
| `TAM-025` | Authenticated/admin responses are never shared as public cache. |
| `TAM-026` | No general queue/background infrastructure is added before a concrete durable async need. |
| `TAM-027` | Managed Supabase Auth is selected for admin auth; exact factors/recovery/MFA are deferred to DOC-45. |
| `TAM-028` | Locale remains route-level and server-renderable rather than client-only. |
| `TAM-029` | Public professional routes remain indexable/shareable and route-backed despite app-like transitions. |
| `TAM-030` | Feature code is release/lazy bounded so V1.0 does not download unreleased Arcade/Social/Channel runtime. |
| `TAM-031` | External/provider failures degrade locally and do not take down canonical professional content. |
| `TAM-032` | Observability/analytics use centralized wrappers and never receive raw sensitive user payloads by default. |
| `TAM-033` | Preview environments do not mutate production persistent data by default. |
| `TAM-034` | All schema changes use versioned repository migrations. |
| `TAM-035` | Repository modules follow explicit UI → application → repository/integration dependency direction. |
| `TAM-036` | No microservices/Kubernetes/API gateway architecture is introduced without a concrete later requirement. |
| `TAM-037` | V1.x scaling relies first on static delivery, caching, managed functions, PostgreSQL design and lazy bundles. |
| `TAM-038` | Technical stack versions are pinned in project tooling at V0 rather than frozen as stale version numbers in architecture prose. |
| `TAM-039` | DOC-42 through DOC-51 are the proposed detailed Technical Architecture decomposition. |
| `TAM-040` | Missing details listed as deferred in DOC-41 belong to named downstream documents and are not silent implementer discretion. |
| `TAM-041` | `Currently Building` remains repository-authored managed status in the approved V1.x baseline; adding runtime/Admin mutation requires a future source-of-truth migration ADR. |

---

## 55. External implementation references

These sources are **informative implementation references**, not normative product documents:

- Next.js documentation: <https://nextjs.org/docs>
- Supabase SSR Auth: <https://supabase.com/docs/guides/auth/server-side>
- Supabase Next.js guide: <https://supabase.com/docs/guides/getting-started/quickstarts/nextjs>
- Supabase Auth / RLS context: <https://supabase.com/docs/guides/auth>
- Vercel + Next.js: <https://vercel.com/frameworks/nextjs>
- Resend: <https://resend.com/>

If a provider's current implementation guidance changes, update the relevant downstream implementation document; do not reinterpret product behavior from a provider change.
