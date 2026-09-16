---
id: DOC-49
title: "Performance, Observability & Reliability Architecture"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Performance, Observability & Reliability"
canonical_domain_owner: performance_observability_reliability

depends_on:
  - DOC-00
  - DOC-02
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-11
  - DOC-12
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
  - DOC-34
  - DOC-38
  - DOC-39
  - DOC-40
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - DOC-45
  - DOC-46
  - DOC-47
  - DOC-48
  - ADR-001
  - ADR-002

decision_families:
  - POR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-49 — Performance, Observability & Reliability Architecture

> **Status:** APPROVED.  
> **Role:** Define measurable performance budgets, service-level objectives, reliability boundaries, telemetry architecture, alerting, recovery objectives and production-diagnostics rules for the portfolio without turning a personal portfolio into an overengineered operations platform.

---

## 1. Purpose

The portfolio is intentionally richer than a conventional static personal site: it contains a persistent system shell, a spatial project selector, a customizable Widget Field, Liquid Glass, contextual artwork, public community surfaces, Arcade, external integrations, Admin and generated CV artifacts.

That visual and functional ambition creates a risk: a technically impressive interface can still feel poor if it is slow, unstable, noisy, difficult to diagnose or dependent on too many providers.

DOC-49 establishes measurable rules so that the product remains:

- fast on ordinary devices and mobile networks;
- responsive while using motion and Liquid Glass;
- diagnostically observable without collecting invasive telemetry;
- resilient when optional providers fail;
- recoverable when persistent runtime data is damaged;
- measurable through a small number of meaningful indicators;
- operationally manageable by one owner;
- capable of evolving without silently weakening approved budgets.

This document owns:

- frontend performance budgets;
- Core Web Vitals targets;
- JavaScript/CSS/font/media budgets;
- interaction latency budgets;
- animation/high-frequency runtime performance;
- server and database latency objectives;
- integration timeout/retry observability;
- reliability tiers and service-level indicators;
- service-level objectives and error-budget policy;
- production error monitoring architecture;
- structured logging rules;
- operational metrics;
- tracing policy;
- synthetic monitoring;
- alert severity and routing;
- degradation behavior from an operational perspective;
- recovery objectives (RPO/RTO);
- incident classification and response;
- release/performance regression gates;
- telemetry privacy, redaction and retention;
- capacity/scaling triggers.

It intentionally does **not** own:

- the exact automated test suite implementation — DOC-50;
- exact GitHub Actions jobs and branch protection — DOC-51;
- application security control design — DOC-47;
- infrastructure topology — DOC-48;
- provider integration ownership/caching semantics — DOC-46;
- product analytics event definitions beyond operational boundaries — DOC-17;
- legal/privacy policy text — future privacy/legal readiness work.

---

## 2. North-star principle

> **The interface may look like a personal operating system, but it must perform like a disciplined website.**

Richness is not permission for:

- long startup delays;
- unnecessary JavaScript;
- permanent background work;
- animation jank;
- unreadable glass while resources load;
- hidden provider latency;
- provider outages taking down professional content;
- instrumentation that harms privacy or performance;
- alerts that nobody can act on.

---

## 3. Performance and reliability principles

1. **Professional content wins.** Projects, experience, education, certifications and CV remain the most reliable surfaces.
2. **Server-first architecture remains a performance tool.** Do not hydrate what can remain server-rendered.
3. **JavaScript is budgeted.** Rich interaction is selectively hydrated rather than globally enabled.
4. **Optional features fail locally.** A broken GitHub widget is not a broken Home page.
5. **Idle should be cheap.** The interface must not consume continuous CPU/GPU simply because it is open.
6. **Motion must preserve responsiveness.** Visual continuity never queues user input.
7. **Stale is often better than empty.** External integrations use the cache semantics from DOC-46.
8. **Measure before scaling.** Redis, queues, multi-region compute and additional databases require evidence.
9. **Telemetry must be actionable.** Every collected signal needs an operational or product purpose.
10. **Privacy applies to telemetry.** Diagnostics never become a shadow analytics/identity system.
11. **Reliability is tiered.** Optional live content does not receive the same recovery priority as domain/DNS or canonical portfolio content.
12. **No fake SLO precision.** Targets are operational objectives, not contractual guarantees.
13. **Budgets may tighten, not silently loosen.** A regression requires correction or an explicit approved exception.

---

## 4. Reliability tiers

The system is divided into operational tiers.

| Tier | Surfaces | Expected behavior |
|---|---|---|
| **R0 — Tier-0 control plane** | domain, DNS, GitHub, Vercel, Supabase production, recovery email | compromise/outage is a high-priority incident |
| **R1 — Professional Core** | Home canonical content, Project Detail, Experience, Education, Certifications, CV, Making Of static content, core navigation | must remain available during optional provider failure |
| **R2 — Essential interaction** | Contact submission, Admin authentication/moderation, Community read/write | may depend on runtime services but must fail clearly and preserve user effort where possible |
| **R3 — Enrichment** | GitHub activity, Tech Pulse, contextual live widgets and richer presentation around repository-authored Currently Building | stale/degraded external content is acceptable; managed-status authority remains repository-owned unless a future ADR migrates it |
| **R4 — Playful runtime** | Arcade score publication, Drawing publication, optional delight systems | failure must not damage professional core |

The tier describes recovery/diagnostic priority, not visual prominence.

---

## 5. SLI/SLO terminology

A **Service-Level Indicator (SLI)** is a measured signal such as:

- successful core-page requests;
- Contact delivery success rate;
- Arcade finalize success rate;
- p75 LCP;
- p95 server latency.

A **Service-Level Objective (SLO)** is the target over a defined window.

An **error budget** is the allowed amount of failure before reliability work takes priority over optional feature expansion.

The portfolio has no customer-facing SLA in V1.x.

---

## 6. Availability SLOs

Initial rolling 30-day operational targets:

| Capability | SLO | Measurement intent |
|---|---:|---|
| **Professional Core** | **99.9%** successful availability | canonical public routes respond successfully and remain usable |
| **Contact delivery path** | **99.5%** successful eligible submissions | excludes invalid input/human-verification rejection |
| **Community reads/writes** | **99.5%** | approved content read and eligible submission operations |
| **Admin authenticated operations** | **99.5%** | login/MFA dependencies and privileged mutations |
| **Arcade finalize/leaderboard publication** | **99.5%** | local gameplay completion is not counted as failed if publication is unavailable |
| **External live integration freshness** | target, not hard availability SLO | stale cache is an accepted state |

These are internal product objectives. Provider maintenance and user-side connectivity must be interpreted carefully rather than automatically counted as application defects.

---

## 7. Error-budget policy

For a 30-day period:

- 99.9% allows roughly 43 minutes of unsuccessful service;
- 99.5% allows roughly 3.6 hours.

The project does **not** need a formal SRE organization. Error budgets are used as a prioritization tool.

If a capability materially exceeds its error budget:

1. pause non-essential expansion in that capability;
2. identify the dominant failure mode;
3. fix reliability or simplify the design;
4. verify recovery/monitoring gaps;
5. document any accepted residual risk.

A single isolated user-side error does not consume the entire engineering focus.

---

## 8. Core Web Vitals objectives

DOC-07 provisional targets become the initial production budget for representative public routes.

At the 75th percentile of real-user measurements where sufficient sample exists:

| Metric | Baseline target | Stretch target |
|---|---:|---:|
| **LCP** | ≤ 2.5 s | ≤ 2.0 s |
| **INP** | ≤ 200 ms | ≤ 150 ms |
| **CLS** | ≤ 0.10 | ≤ 0.05 |

The baseline must be met separately where practical for:

- mobile;
- desktop;
- ES;
- EN;
- Home;
- Project Detail;
- Contact/CV representative routes.

Small sample sizes are labeled as insufficient rather than producing false conclusions.

---

## 9. Interaction acknowledgement budget

The approved input architecture requires meaningful input acknowledgement in approximately **100 ms or less**.

This includes:

- project-selection input;
- Dock destination input;
- widget focus/selection;
- opening settings/palette;
- keyboard/gamepad navigation;
- form submission state acknowledgement.

The final visual animation may continue after acknowledgement.

The system must never make the user wait for a cinematic transition before accepting the next valid navigation input.

---

## 10. TTFB and route-response objectives

Initial objectives for representative production traffic:

| Route class | Objective |
|---|---|
| static/cached professional route | p75 TTFB ≤ 800 ms |
| dynamic public runtime read | p95 application response ≤ 1.0 s |
| normal public mutation | p95 application response ≤ 2.5 s |
| Admin mutation | p95 application response ≤ 2.0 s |
| Arcade finalization | p95 application response ≤ 1.5 s |

These are application objectives, not provider guarantees.

When a provider must be contacted synchronously, provider latency is broken out separately so the application can distinguish:

```text
our compute
+
database
+
provider wait
```

---

## 11. JavaScript budget

JavaScript is a constrained resource.

For the V1.0 Professional Core:

- **soft target:** ≤ 180 KB compressed initial JavaScript transferred for a representative core route;
- **review threshold:** > 250 KB compressed initial JavaScript requires explicit investigation and justification;
- feature-only bundles do not count against the base route if they are not loaded before use;
- no base route loads Arcade, Drawing Pad, Admin, Terminal or all audio assets.

The budget is measured from actual production build output, not dependency package sizes.

Framework/runtime shared code is included because users still download it.

---

## 12. Lazy-feature budgets

Lazy loading is not permission for arbitrary bundle growth.

Each heavy feature receives its own budget report:

- Drawing Pad;
- Glitch Runner;
- Reflex Deploy;
- Terminal;
- Command Palette if separated;
- media viewer;
- Admin application.

A single lazy feature exceeding roughly **250 KB compressed JavaScript** triggers review for:

- dependency replacement;
- deeper code splitting;
- worker isolation;
- asset/data separation;
- feature simplification.

The threshold is a review trigger, not an automatic product veto.

---

## 13. CSS budget

The V1.x public shell should target:

- ≤ 80 KB compressed CSS initially required for a representative route;
- no feature importing an independent full design system;
- feature-specific CSS remains tree-shakeable/scopeable;
- glass/material effects do not require duplicated generated utility output across features.

A CSS budget regression is investigated alongside visual correctness rather than ignored as “just styles.”

---

## 14. Font budget

Manrope and IBM Plex Mono follow DOC-35.

Rules:

- subset to the character ranges actually required where practical;
- only the UI-critical font subset is eagerly loaded;
- monospace is not made render-blocking for routes that do not display it immediately;
- avoid shipping many static weights when a carefully configured variable font is smaller/adequate;
- use `font-display` behavior that preserves readable fallback rather than invisible text;
- font files are self-hosted/build-controlled where approved by the frontend architecture.

Initial critical-font transfer target: **≤ 160 KB compressed total** for the public shell before optional subsets.

---

## 15. Media budget

Media quality must be responsive to the actual rendered role.

For initial viewport assets:

- mobile LCP artwork target: ≤ 350 KB transferred when practical;
- larger desktop LCP artwork review threshold: ~700 KB;
- no initial-view autoplay video;
- no full-resolution gallery image when a responsive derivative is enough;
- image intrinsic dimensions are known to prevent layout shift;
- hero/backdrop have separate delivery logic even when sourced from one canonical asset;
- off-screen gallery/media is lazy;
- decorative backdrop quality may degrade before readable foreground content.

These are role budgets, not a mandate to visibly damage artwork.

---

## 16. DynamicBackdrop performance

DynamicBackdrop must not become a permanent GPU benchmark.

Rules:

- one centralized backdrop system;
- avoid multiple full-screen independently animated blur layers;
- project changes may crossfade/retarget rather than remount expensive trees;
- idle state is predominantly still;
- `prefers-reduced-motion`, Transparency and material-quality settings reduce work;
- art direction avoids unnecessarily decoding enormous images;
- blur/refraction quality follows DOC-39 degradation tiers;
- the professional content remains readable if advanced effects are disabled.

---

## 17. Liquid Glass performance budget

Glass is a visual material, not an excuse for unbounded compositing.

The implementation should:

- minimize nested backdrop-filter stacks;
- avoid animating blur radius over large surfaces when transform/opacity can create continuity;
- keep full-screen glass layers rare;
- use `will-change` only around real transitions, not permanently on every card;
- remove expensive optical effects first under REDUCED/SOLID quality;
- test integrated GPU/mobile hardware rather than only desktop development machines.

A screenshot-equivalent solid fallback must remain coherent.

---

## 18. Widget Field performance

The Widget Field is visually central but operationally bounded.

Rules:

- visible widget count follows DOC-28/DOC-38 budgets;
- widget resolution does not poll layout continuously;
- resize logic uses responsive CSS/container queries before JavaScript measurement;
- optional widget data loads independently;
- one failed/slow widget never blocks project content;
- reorder operations update logical state, not pixel-coordinates every frame;
- drag previews may use transient transforms rather than expensive layout mutation;
- hidden/unavailable widgets do not mount live subscriptions or timers;
- context changes should reuse shells where practical.

---

## 19. Project selection performance

A project selection change affects:

- selector state;
- title/metadata;
- hero artwork;
- DynamicBackdrop;
- project accent;
- contextual widgets.

This choreography is coordinated, but not one synchronous blocking transaction.

The selected project identity updates immediately; heavier artwork/widgets may settle progressively.

No provider call is required before selection visually changes.

---

## 20. Navigation performance

Public navigation should preserve Next.js/App Router behavior without creating a second SPA router.

Performance rules:

- route prefetch is used intentionally, not indiscriminately for every media-heavy page;
- Project Detail intercepted navigation must not duplicate large page payloads unnecessarily;
- direct deep links render correctly without first loading Home interaction state;
- route transitions remain cancellable by browser navigation;
- loading states preserve stable geometry.

---

## 21. Hydration performance

Hydration is treated as work that must be justified.

Client boundaries should be:

- small;
- feature-owned;
- stable;
- lazy where interaction is not initially necessary.

Avoid:

- giant root contexts that rerender the shell for pointer/game events;
- serial client waterfalls to rediscover server-known data;
- mounting all overlays “just in case”;
- hydrating static professional prose.

Hydration errors are release-blocking defects for core routes.

---

## 22. Long-task policy

Tasks longer than roughly **50 ms** on the main thread are treated as a diagnostic signal during core navigation and interaction.

Particular attention is paid to:

- parsing large project data;
- image processing in browser;
- widget drag logic;
- drawing serialization;
- game setup;
- terminal command parsing;
- oversized animation orchestration.

Heavy work may move to:

- lazy chunks;
- Web Workers where justified;
- server preprocessing;
- incremental processing.

Do not introduce workers solely to appear sophisticated.

---

## 23. Drawing runtime performance

Drawing is a high-frequency local workload.

Rules:

- pointer samples do not rerender the whole application shell;
- logical drawing state uses an appropriate local store/model;
- visible canvas rendering remains decoupled from React component reconciliation where useful;
- publish serialization occurs outside the pointer-critical path;
- logical resolution is independent of device pixel ratio;
- complexity limits from DOC-47 prevent path-count/point-count denial of service;
- resizing/rotation preserves logical state without reconstructing the entire document unnecessarily.

---

## 24. Arcade runtime performance

Game loops are isolated from general React UI state.

Rules:

- network is absent from the per-frame path;
- score validation occurs at session boundaries, not per event;
- gamepad polling is scoped to active gameplay/navigation contexts;
- inactive games are unmounted/suspended;
- visibility changes pause or lower work where appropriate;
- target visual frame cadence is approximately 60 FPS on representative supported devices, with adaptive visual simplification when necessary;
- gameplay correctness is prioritized over decorative particles/effects.

---

## 25. Server execution budget

Server-side application services should avoid accidental serial waterfalls.

For each server operation, telemetry may break down:

```text
request parsing
→ authorization / abuse controls
→ application service
→ database
→ external provider (if synchronous)
→ serialization
```

Parallelize independent reads only when it improves latency without increasing provider/database pressure irresponsibly.

---

## 26. Database performance objectives

PostgreSQL is not expected to carry high-scale workload in V1.x, but query behavior remains observable.

Initial expectations:

- indexed queue/leaderboard reads remain comfortably sub-second end to end;
- slow-query review threshold: approximately 250 ms database execution for routine runtime queries;
- queries repeatedly exceeding 500 ms are investigated immediately unless they are known maintenance/admin workloads;
- N+1 request patterns are prohibited;
- pagination is used for unbounded moderation/history/leaderboard lists;
- query plans are inspected before adding speculative indexes.

Database latency is separated from function/network latency when diagnosing.

---

## 27. Connection behavior

Serverless concurrency must not cause uncontrolled database connection growth.

The Supabase/client mode chosen by DOC-44/DOC-48 should use the provider-recommended pooled/serverless-compatible path where applicable.

The application must not create a brand-new unconstrained connection pool per request.

Connection failures become explicit operational events rather than generic `500` noise.

---

## 28. Provider timeout budgets

Provider calls need finite timeouts.

Initial guidance:

| Class | Typical timeout budget |
|---|---:|
| user-blocking verification/provider check | ~3 s |
| user-blocking email delivery | ~5 s |
| background GitHub/feed refresh | ~8–10 s |
| webhook/provider callback processing | bounded by provider contract, preferably short |

Exact values may be tuned from production telemetry.

No request waits indefinitely for an external provider.

---

## 29. Retry observability

DOC-46 owns retry semantics; DOC-49 owns visibility into them.

Metrics/logs distinguish:

- first attempt;
- retry attempt;
- provider rate limit;
- provider timeout;
- terminal failure;
- stale fallback served;
- recovery after cooldown.

A retry that eventually succeeds is still operationally visible because repeated retries can hide an unhealthy dependency.

---

## 30. Cache performance indicators

External-cache observability includes:

- hit/miss;
- fresh hit;
- stale-allowed hit;
- expired miss;
- refresh success/failure;
- age of last successful refresh;
- refresh duration;
- provider cooldown state.

No alert is triggered merely because cached data is stale within its approved stale window.

---

## 31. Cold-cache behavior

Cold cache must not create a “site unavailable until integrations warm up” scenario.

Professional pages render without live data.

Integration widgets may display:

- loading briefly;
- no-data state;
- curated fallback;
- cached stale state.

They do not block the route shell.

---

## 32. Capacity philosophy

V1.x is designed for normal portfolio traffic, not hypothetical viral scale.

Capacity planning begins from:

- actual request volume;
- p95 latency;
- provider limits;
- DB CPU/connections;
- error rate;
- function concurrency;
- bandwidth;
- cache efficiency.

Scaling mechanisms are added only when metrics show a real constraint.

---

## 33. Scaling triggers

Examples of evidence that can justify architectural expansion:

- persistent database saturation;
- repeated connection-limit pressure;
- provider quota exhaustion under legitimate usage;
- public write endpoints experiencing sustained queueing/latency;
- background refresh workload exceeding serverless execution model;
- inability to meet SLO with current single-region stateful topology;
- cache hot spots requiring explicit shared infrastructure.

Possible future actions include stronger pooling, dedicated queue/workers, Redis, additional regions or specialized storage — but none are pre-approved by this document.

---

## 34. Observability architecture

The architecture uses a small set of adapters instead of vendor SDK calls scattered across features.

Conceptually:

```text
Application / Browser
        │
        ├── ErrorReporter
        ├── PerformanceReporter
        ├── StructuredLogger
        ├── MetricRecorder
        └── Trace/Span helper (where useful)
                 │
                 ▼
        approved observability provider(s)
```

This preserves:

- redaction policy;
- environment behavior;
- provider replaceability;
- testing/no-op modes;
- consistent event taxonomy.

---

## 35. Error monitoring baseline

**Sentry** is the approved V0/V1.0 runtime error-monitoring baseline and is used through project wrappers rather than imported throughout feature code. Replacing it later does not change feature contracts because the wrapper remains authoritative.

Required capabilities:

- browser uncaught errors;
- server exceptions;
- React/error-boundary context;
- release metadata;
- environment metadata;
- source maps from CI/build;
- controlled performance sampling;
- alert routing.

The design remains provider-agnostic enough that changing the vendor does not rewrite domain code.

---

## 36. Source-map handling

Production source maps are generated/uploaded when needed for diagnostics but are not intentionally exposed as a public browsing feature.

Build secrets used to upload them remain CI/build-only.

Release identifiers match deploy metadata so an error maps to the exact code version.

---

## 37. Structured logging

Server logs use structured fields rather than concatenated prose where practical.

Safe baseline fields:

```text
timestamp
environment
release
request_id
operation_id (when applicable)
route / operation name
feature
safe error code
status
latency_ms
provider (if applicable)
retry_count
cache_state
```

Do **not** log:

- Contact message bodies;
- Guestbook message bodies unless a security-approved narrow diagnostic requires temporary redacted capture;
- unpublished drawing models;
- passwords/TOTP/tokens/cookies;
- raw Auth headers;
- Supabase secrets;
- full IP addresses as routine application identity;
- private provider payloads.

---

## 38. Error taxonomy

Errors use stable categories aligned with DOC-43.

Operational categories include:

- validation;
- authorization;
- abuse/rate limit;
- provider unavailable;
- delivery failure;
- database conflict;
- timeout;
- idempotency conflict;
- plausibility rejection;
- unexpected internal error.

Expected user mistakes do not flood the error-monitoring provider as exceptions.

---

## 39. Correlation identifiers

Every meaningful server operation receives a safe `requestId`/correlation identifier.

Longer logical operations may also have:

- `operationId` for idempotent public writes;
- `sessionId` for Arcade session protocol;
- `jobRunId` for scheduled work;
- provider request/reference identifier where safely available.

Correlation identifiers must not embed email, IP, user content or secret material.

---

## 40. Metrics taxonomy

Operational metrics are grouped into:

### 40.1 User-experience metrics

- LCP/INP/CLS;
- route/navigation timing;
- JS bundle size;
- hydration errors;
- long tasks;
- failed dynamic imports.

### 40.2 Backend metrics

- operation count;
- success/error ratio;
- p50/p95 latency;
- DB duration;
- conflict rate;
- rate-limit/abuse rejection count.

### 40.3 Integration metrics

- provider latency;
- timeout/error ratio;
- refresh success;
- stale age;
- rate-limit events.

### 40.4 Reliability metrics

- uptime/synthetic success;
- cron last success;
- backup/restore-test state;
- release error rate;
- incident count/time-to-recover.

### 40.5 Security-adjacent operational metrics

- failed Admin authorization at aggregate/safe level;
- repeated abuse blocks;
- webhook signature failures if webhooks exist;
- anomalous score rejection trends.

Security interpretation remains owned by DOC-47.

---

## 41. Product analytics separation

Operational telemetry and product analytics remain separate concerns. **Product analytics is disabled by default in V0/V1.0** until a separate privacy/provider decision explicitly enables a provider/event set; the analytics wrapper therefore defaults to a no-op implementation.

For example:

```text
"project_selected"
```

is a product-analytics event.

```text
"project route LCP = 1.8 s"
```

is performance telemetry.

```text
"provider_timeout GitHub"
```

is operational telemetry.

Do not route sensitive operational payloads into product analytics simply because the SDK is convenient.

---

## 42. Real User Monitoring (RUM)

RUM is preferred for answering whether the experience is actually fast for visitors.

It should capture aggregate performance dimensions such as:

- metric name/value;
- route template rather than sensitive arbitrary URL where possible;
- locale;
- coarse viewport/device class;
- release;
- environment;
- browser class if useful.

It should not capture:

- raw typed content;
- exact drawing data;
- exact location;
- persistent cross-feature visitor identity beyond what the chosen privacy model explicitly permits.

---

## 43. Synthetic monitoring

Synthetic checks complement RUM because RUM disappears when no one visits.

Baseline Production checks should cover:

- canonical Home availability;
- at least one English and one Spanish route;
- CV artifact availability;
- safe status/health surface;
- public professional navigation;
- optionally an authenticated/non-destructive Admin readiness path through a dedicated test strategy, not a hard-coded production password.

Synthetic monitoring must not:

- submit real Contact emails repeatedly;
- pollute Guestbook;
- create real Arcade scores;
- generate moderation noise.

Where mutation readiness must be tested, use an explicit test/dry-run capability or non-production environment.

---

## 44. Health endpoints

A public health endpoint/surface exposes only safe information such as:

- application reachable;
- release identifier/version if considered safe;
- high-level component state.

It never exposes:

- database credentials;
- provider tokens;
- raw provider responses;
- connection strings;
- internal stack traces;
- table names for no reason.

Deep dependency checks are reserved for trusted operational use or synthesized indirectly from known operations.

---

## 45. `/status` product surface

The approved public System Status surface may present a user-safe state such as:

```text
Portfolio Core        Operational
Contact               Operational / Degraded
Community             Operational / Degraded
Arcade Scores         Operational / Degraded
Live Integrations     Operational / Stale
```

It does not claim fake precision or show fabricated CPU/RAM/system telemetry.

The status page should be able to remain useful when one optional dependency is down.

---

## 46. Tracing policy

Full distributed tracing is **not mandatory** in V1.x.

Use tracing/spans selectively when they answer a real question, especially for:

- Contact delivery;
- Guestbook/Sketch submissions;
- Admin moderation transaction;
- Arcade finalization;
- external integration refresh;
- scheduled cleanup.

A typical trace may show:

```text
HTTP request
 → auth/abuse check
 → application service
 → database RPC/query
 → provider call
```

Sampling should remain low enough to avoid cost/privacy/performance problems.

---

## 47. Client performance instrumentation cost

Observability itself must be budgeted.

Rules:

- monitoring SDK must not dominate initial JS budget;
- expensive replay/session recording is off by default unless explicitly approved;
- no blanket DOM recording;
- no mouse-movement capture;
- sampling is configured deliberately;
- failed telemetry delivery never blocks product interaction.

The observability stack must fail open from the product-experience perspective.

---

## 48. Alert philosophy

Alerts exist only when a human can take an action.

Avoid:

- alerting on every single exception;
- alerting on expected validation failures;
- repeated alerts for the same root outage;
- provider health warnings that remain within accepted stale windows;
- low-priority overnight noise for a non-contractual personal portfolio.

The goal is **signal**, not an imitation of a 24/7 enterprise NOC.

---

## 49. Alert severity

| Severity | Meaning | Examples |
|---|---|---|
| **P0** | security/domain/core availability emergency | domain hijack, production secrets exposed, professional core unavailable |
| **P1** | major user-facing capability materially broken | Contact broadly failing, Admin unavailable during moderation need, DB runtime outage |
| **P2** | degraded optional capability / sustained regression | GitHub stale beyond limit, cron repeatedly failing, performance budget regression |
| **P3** | informational/trend | single integration transient failure, minor latency trend |

Security incident handling defers to DOC-47 when severity overlaps.

---

## 50. Alert routing

Initial owner model is intentionally simple:

- primary owner notification via configured monitoring/email channel;
- P0/P1 produce immediate/high-priority notification when supported;
- P2 can aggregate/digest if not urgent;
- P3 normally appears in dashboards/issues rather than paging.

There is no promise of staffed 24/7 on-call in V1.x.

---

## 51. Initial alert conditions

Candidate alerts include:

- Professional Core synthetic failure across multiple checks;
- sudden release-correlated server/client error spike;
- Contact delivery failures sustained above threshold;
- Supabase/database connectivity failure;
- repeated Admin auth/provider failure;
- scheduled integration job misses multiple expected runs;
- external cache passes maximum stale window;
- Arcade finalize errors spike materially;
- backup/restore validation becomes overdue;
- significant Core Web Vitals regression after release;
- certificate/domain/DNS incident evidence where provider tooling exposes it.

Exact numeric trigger windows are tuned after baseline telemetry to avoid noisy guesses.

---

## 52. Release health

Every production release carries:

- Git commit/release identifier;
- deployment environment;
- build timestamp where useful;
- migration version/history correlation;
- source-map release mapping.

Operational tooling should allow answering:

> “Did errors/latency/CWV get worse after release X?”

without manual guesswork.

---

## 53. Deployment verification window

After Production deployment, perform a short verification set before considering the release stable:

- Home loads;
- project navigation works;
- Contact readiness is intact without sending unnecessary real messages;
- Auth/Admin readiness where applicable;
- no immediate error spike;
- DB migration compatibility holds;
- current release visible in telemetry;
- key synthetic checks pass.

DOC-50/DOC-51 define automation details.

---

## 54. Performance regression policy

A release is blocked or corrected when it causes an unexplained material regression such as:

- core route crossing the 250 KB JS review threshold;
- clear LCP/INP/CLS deterioration;
- new long-task behavior in primary navigation;
- media size explosion;
- persistent server latency increase;
- provider waterfall added to Professional Core;
- glass/motion regression on representative lower-powered hardware.

A justified exception must document:

- why the cost is necessary;
- affected routes/devices;
- mitigation;
- follow-up plan.

---

## 55. Performance budget artifact

Build tooling should emit a machine-readable performance-budget artifact containing at least:

- initial JS by representative route;
- lazy feature chunk sizes;
- CSS size;
- critical font transfer estimate;
- major media size inventory where build-known.

DOC-50 defines how this is tested; DOC-51 defines CI integration.

---

## 56. Lab performance testing

Lab tests are useful for deterministic regression detection, not as a substitute for real-user data.

Representative profiles should include:

- mid-range Android/mobile viewport;
- desktop viewport;
- reduced CPU/network simulation;
- reduced motion/transparency where relevant;
- 200% text zoom for layout/performance interaction;
- short viewport/landscape cases where UI density is stressed.

The concrete testing/tooling enforcement is defined in DOC-50.

---

## 57. Accessibility and performance

Accessibility settings may **reduce** work but must never be used as the only way to make the product performant.

Examples:

- reduced motion shortens/changes transitions;
- reduced transparency lowers compositing cost;
- solid material fallback lowers GPU cost;
- keyboard use avoids pointer-heavy effects.

The default experience must still meet reasonable budgets.

---

## 58. Error-boundary observability

Each meaningful feature boundary reports failures with feature context.

Examples:

- `home.widget.github`;
- `channel.tech-pulse`;
- `social.guestbook`;
- `arcade.glitch-runner`;
- `contact.delivery`;
- `admin.moderation`.

The user sees a localized, calm degraded state.

Observability receives a safe diagnostic event.

---

## 59. Contact observability

Track only safe operational metadata such as:

- operation started;
- validation rejected;
- Turnstile verified/rejected/unavailable;
- email provider accepted/failed/timed out;
- retry count;
- total latency;
- safe provider error category.

Never send Contact name/email/message body to error monitoring or logs by default.

---

## 60. Community observability

Guestbook/Sketch operational signals include:

- submission success/failure;
- moderation queue size;
- moderation mutation conflicts;
- report volume aggregate;
- renderer failure/timeout;
- abuse rejection aggregate.

Do not export unpublished UGC bodies into monitoring systems.

---

## 61. Arcade observability

Useful signals:

- session creation success;
- session expiry rate;
- finalization success;
- replay/idempotency rejection;
- plausibility rejection aggregate;
- p95 finalization latency;
- leaderboard query latency;
- game runtime error rate;
- client crash/uncaught error.

Do not treat every rejected implausible score as a security incident.

---

## 62. Admin observability

Useful signals:

- AAL2/admin authorization failures at safe aggregate level;
- moderation mutation failures;
- optimistic-concurrency conflicts;
- audit persistence failures;
- Auth provider outage;
- privileged operation latency.

Never collect:

- password;
- TOTP code/secret;
- recovery tokens;
- session cookies;
- access/refresh tokens.

---

## 63. Integration observability

Each integration adapter reports a normalized health model:

```text
healthy
stale
rate_limited
degraded
unavailable
misconfigured
```

Provider-specific raw error codes may be preserved server-side where safe, but UI/alert policy uses normalized categories.

---

## 64. Cron/job observability

Every scheduled job records:

- job name;
- run id;
- started/finished timestamps;
- status;
- lease acquisition result;
- work-unit counts;
- failure category;
- next expected freshness boundary.

Alerting is based on missed health objectives, not one transient failed run that later recovers.

---

## 65. Backup observability

Backups are operational dependencies, not assumed facts.

Track/document:

- backup policy enabled;
- latest known successful backup/provider status where available;
- last restore drill date;
- restore drill result;
- current approved RPO tier.

A backup retention configuration change requires operational review.

---

## 66. Recovery Point Objectives (RPO)

Initial V1.x recovery objectives:

| Data class | RPO objective |
|---|---|
| Git-backed professional content/code | repository history; effectively no intentional data loss from runtime failure |
| Community submissions/reports/moderation/audit | **≤ 24 h** under managed daily-backup baseline |
| Arcade scores/sessions requiring durable history | **≤ 24 h** under baseline |
| Integration cache | no backup requirement; rebuild from provider/curated source |
| Contact message content | N/A — not persisted server-side by baseline design |
| local visitor preferences | N/A — device-local, not server-recovered |
| Auth/admin account state | provider-managed; recovery follows IAM/runbook rather than application DB restore alone |

If the community/Arcade value grows such that a 24-hour loss is unacceptable, **PITR becomes required before tightening the documented RPO**.

---

## 67. Recovery Time Objectives (RTO)

Operational recovery targets, not contractual guarantees:

| Capability | RTO objective |
|---|---:|
| Professional Core app regression | ≤ 1 h where rollback/provider control is available |
| Runtime database/community/admin recovery | ≤ 4 h |
| Contact provider outage workaround/recovery | ≤ 4 h if provider issue persists and workaround exists |
| Optional live integrations | ≤ 24 h before escalation beyond stale/degraded mode |
| domain/DNS/security control-plane incident | highest-priority restoration; target ≤ 4 h where account/provider access permits |

An incident postmortem records actual recovery time when objectives are missed.

---

## 68. RPO/RTO relationship to infrastructure

DOC-48 remains authoritative for the mechanisms.

DOC-49 sets the objectives.

Therefore:

- daily backups are sufficient for the initial ≤24h runtime-data RPO;
- PITR is not mandatory until we approve a tighter RPO or risk profile;
- application rollback is not a database restore;
- backups must be restore-tested.

---

## 69. Degraded-mode matrix

| Failure | Professional Core | Runtime behavior |
|---|---|---|
| Supabase unavailable | stays available where build/static content allows | Community/Admin/leaderboard unavailable or degraded |
| Resend unavailable | stays available | Contact preserves input and reports retryable failure |
| Turnstile unavailable | stays available | protected public writes fail closed while preserving user input |
| GitHub unavailable | stays available | cached/stale activity or degraded widget |
| Tech Pulse source unavailable | stays available | stale/partial feed |
| Sentry/monitoring unavailable | stays available | observability degraded only |
| analytics unavailable | stays available | analytics lost/degraded only |
| one Arcade game crashes | stays available | game boundary fails locally; other spaces unaffected |
| Drawing renderer unavailable | stays available | Drawing publish/preview degraded |

---

## 70. Reliability of local personalization

Widget layout, theme, sound, motion and returning-name preferences are local enhancements.

Corrupt/old local state must never make the site unusable.

Requirements:

- versioned schema;
- validation on read;
- safe migration;
- reset-to-default path;
- failure fallback to defaults;
- no startup crash because one localStorage entry is malformed.

---

## 71. Browser/device reliability

Client errors are segmented by:

- browser family/version class;
- mobile/desktop class;
- route/feature;
- release.

A bug concentrated on one environment should be diagnosable without collecting identifying fingerprints.

Unsupported/degraded browser capabilities use progressive fallback rather than a blank page.

---

## 72. Offline/network interruption behavior

The site is not required to be a full offline PWA in V1.x.

However:

- already-rendered professional content should not disappear because an optional fetch fails;
- Contact/Guestbook/Sketch form input remains in the UI after recoverable network failure;
- Arcade local result remains visible even if score publication fails;
- external widgets show stale/degraded state;
- retries are explicit rather than silently generating duplicate mutations.

---

## 73. Incident severity

Operational incidents use:

- **SEV-0:** security/control-plane compromise or full professional-core outage with significant risk;
- **SEV-1:** major runtime capability unavailable/sustained broad failure;
- **SEV-2:** optional feature degraded or significant performance regression;
- **SEV-3:** minor localized issue/trend.

Security incidents still follow DOC-47’s containment/remediation requirements.

---

## 74. Incident lifecycle

A production incident follows:

```text
Detect
→ Triage
→ Contain
→ Restore service
→ Verify
→ Root-cause review
→ Corrective action
→ Documentation/runbook update
```

During an incident, restoration is prioritized over aesthetic perfection.

Feature kill switches from DOC-48 may be used to preserve the professional core.

---

## 75. Incident communication

For a personal portfolio, public incident communication is proportional to impact.

Possible surfaces:

- `/status` high-level degradation;
- temporary in-product degraded message;
- no public communication for tiny/transient internal-only issues.

Never expose sensitive root-cause/security details while containment is ongoing.

---

## 76. Postmortems

A written postmortem is required for:

- SEV-0;
- significant SEV-1;
- repeated issue of the same root cause;
- data loss beyond objective;
- incident revealing a major documentation/runbook gap.

Postmortem structure:

1. impact;
2. timeline;
3. detection;
4. root cause;
5. contributing factors;
6. recovery;
7. what worked;
8. what failed;
9. corrective actions;
10. owner/status.

Blameless analysis focuses on system improvement.

---

## 77. Telemetry retention

Keep telemetry only as long as it remains useful for diagnostics/trend comparison.

Baseline retention:

- detailed error/performance/operational telemetry: **maximum 30 days** unless a shorter provider configuration is sufficient;
- de-identified/aggregated operational trends: **maximum 90 days** where useful for regression comparison;
- no indefinite retention merely because the provider allows it;
- security/audit/domain records are governed separately by DOC-44/DOC-47 and are not extended by this telemetry policy;
- Contact/UGC bodies are never copied into telemetry storage.

Any proposal to retain detailed telemetry longer than 30 days or aggregates longer than 90 days requires an explicit privacy/operational approval and documented purpose.

---

## 78. Telemetry sampling

Sampling is intentional.

Examples:

- errors: high/complete capture for unexpected errors subject to provider volume;
- performance spans: sampled;
- normal successful high-volume operations: metrics/aggregates instead of one event per action where possible;
- repeated identical provider errors: deduplicated/grouped.

Sampling configuration is documented and environment-specific.

---

## 79. Environment separation

Observability events include environment:

```text
local
preview
staging
production
```

Production alerts are not polluted by Preview exceptions.

Preview can have monitoring enabled for release testing but uses separate environment/project tags and sanitized non-production data.

Local development defaults to developer-console/no-op behavior unless explicit debugging integration is needed.

---

## 80. Privacy and redaction

Before any event leaves the application, apply redaction rules.

Sensitive keys are centrally denied/redacted.

Examples:

```text
password
passwd
token
secret
authorization
cookie
set-cookie
totp
email_body
message_body
drawing_model
```

Provider SDK “send default PII” settings must be reviewed rather than accepted blindly.

---

## 81. Session replay

Full session replay is **OFF by default** in V1.x.

It may be evaluated later only if:

- privacy impact is reviewed;
- input/content masking is demonstrably safe;
- value exceeds cost/complexity;
- community/contact/drawing surfaces are protected from capture.

The portfolio does not need surveillance-grade replay to diagnose normal bugs.

---

## 82. Cost observability

Provider usage/cost is monitored at a lightweight level:

- Vercel bandwidth/function usage;
- Supabase database/storage/auth usage;
- Resend message volume;
- monitoring event volume;
- Turnstile/provider limits where relevant.

Unexpected cost growth is treated as a reliability/security signal, especially when caused by abuse or runaway retries.

Exact budget amounts belong to financial/project planning, not this architecture document.

---

## 83. Performance versus cost

Do not buy infrastructure as the first response to slow code.

Investigation order generally prefers:

1. remove unnecessary work;
2. fix waterfalls/N+1;
3. improve caching;
4. optimize media/bundles;
5. tune queries/indexes;
6. then consider more expensive infrastructure.

---

## 84. Status freshness

The public status surface must distinguish:

- current measured signal;
- last successful integration refresh;
- stale/unknown.

“Unknown” is preferable to falsely reporting “Operational.”

---

## 85. Analytics/observability outage behavior

If analytics or monitoring providers are down:

- product functionality continues;
- requests are not blocked waiting for telemetry;
- no infinite retry queue is created;
- local logs/platform signals remain available where possible;
- outage is diagnosed from provider/platform evidence rather than causing cascading failure.

---

## 86. Failure injection

Before relying on degraded-mode claims, test them deliberately in non-production/controlled environments:

- Supabase unavailable;
- Resend timeout;
- Turnstile unavailable;
- GitHub/feed errors;
- stale cache;
- monitoring SDK blocked;
- slow network/image decode;
- game dynamic import failure.

DOC-50 owns the exact test implementation.

---

## 87. Reliability review for new features

Every substantial new feature answers:

1. What is its reliability tier?
2. What does it depend on?
3. What happens when each dependency fails?
4. Does it block Professional Core?
5. What telemetry indicates health?
6. Does it need a backup/RPO?
7. Does it add a new alert?
8. Does it change performance budgets?
9. Can it be disabled independently?

A feature without a failure story is incomplete.

---

## 88. Performance review for new dependencies

Before adding a significant client dependency, review:

- transferred size;
- parse/evaluation cost;
- tree-shaking;
- SSR compatibility;
- lazy-loading capability;
- duplicate dependency overlap;
- accessibility impact;
- maintenance/security posture.

“Popular library” is not sufficient justification.

---

## 89. Third-party script policy

Third-party scripts are treated as performance/reliability dependencies.

Rules:

- minimize count;
- defer/non-blocking where possible;
- no marketing script that delays professional content;
- no script receives more data than required;
- each script has an owner/purpose;
- removed providers have their scripts/env vars fully removed.

---

## 90. Browser resource hints

`preload`, `preconnect`, `prefetch` and similar hints are used only with evidence.

Over-preloading can compete with the actual LCP resource and degrade performance.

Priority is reserved for:

- truly critical font/resource;
- actual selected hero/LCP asset;
- likely route data when justified.

---

## 91. Image quality adaptation

Image delivery may adapt by:

- rendered width;
- DPR;
- art-directed crop;
- format support;
- save-data/network constraints where appropriate.

Do not make all users download desktop-quality background artwork on Compact.

---

## 92. Motion performance adaptation

Motion quality may reduce based on:

- user reduced-motion preference;
- lower material/transparency quality;
- device capability/performance evidence;
- compact geometry.

Capability reduction must preserve navigation/functionality.

---

## 93. Observability ownership

The owner is responsible for:

- reviewing P0/P1 alerts;
- periodically reviewing error trends;
- checking release regressions;
- validating backups/restore drills;
- keeping monitoring credentials secure;
- updating runbooks after incidents.

Automation supports, but does not replace, this ownership.

---

## 94. Dashboard minimum set

A small operational dashboard should answer:

1. Is Professional Core up?
2. Did the latest release increase errors?
3. Are Core Web Vitals within budget?
4. Is Contact delivering?
5. Is Community healthy?
6. Is Admin functioning?
7. Are Arcade finalizations healthy?
8. Are external integrations stale?
9. Did scheduled jobs run?
10. Is a provider dominating latency/errors?

A dashboard that cannot answer a real question should not exist.

---

## 95. Performance reporting cadence

During active implementation:

- review budgets on significant UI/system changes;
- compare representative route metrics before major release;
- investigate regressions immediately rather than quarterly.

After stabilization:

- periodic review can be lightweight/monthly or release-based;
- alerts remain event-driven for major incidents.

---

## 96. Reliability reporting cadence

At minimum, periodically review:

- incidents;
- SLO/error budget status;
- recurring provider failures;
- backup/restore readiness;
- stale integrations;
- top application errors;
- alert noise.

The process remains proportional to a personal product, not enterprise ceremony.

---

## 97. Implementation gates

Before relying on this architecture in Production, validate at least these gates.

## POR-GATE-01 — Core performance

Representative Home/Project/CV/Contact routes meet approved CWV/bundle budgets in lab baseline and do not contain accidental heavy feature chunks.

## POR-GATE-02 — Input responsiveness

Project selector, Dock, keyboard/gamepad navigation and Widget Field acknowledge interaction within the intended ~100 ms experience budget on representative hardware.

## POR-GATE-03 — Material/motion degradation

FULL → REDUCED/SOLID and Reduced Motion/Transparency produce measurably lower work without removing capability.

## POR-GATE-04 — Observability redaction

Synthetic sensitive payloads prove that Contact bodies, secrets, tokens, TOTP and unpublished drawing data do not reach logs/error monitoring.

## POR-GATE-05 — Failure containment

Simulated Supabase/Resend/Turnstile/GitHub/monitoring failure preserves Professional Core and yields documented degraded behavior.

## POR-GATE-06 — Release correlation

A controlled error in non-production can be mapped to environment, release and source code through the chosen monitoring setup.

## POR-GATE-07 — SLO/alert path

Synthetic/core availability failure produces the intended actionable notification without generating alert storms.

## POR-GATE-08 — Recovery

A restore drill demonstrates the current ≤24h persistent-runtime RPO strategy and the documented runtime recovery process.

## POR-GATE-09 — Regression gate

CI/release tooling can detect at least representative JS-size and core performance regressions; DOC-50/DOC-51 own exact implementation.

## POR-GATE-10 — High-frequency runtimes

Drawing and Arcade demonstrate isolated high-frequency state without root-shell rerender loops or network-per-frame behavior.

---

## 98. Decision registry

| ID | Decision |
|---|---|
| POR-001 | Professional content reliability and responsiveness take priority over visual/runtime enrichment. |
| POR-002 | JavaScript is explicitly budgeted rather than treated as free. |
| POR-003 | Optional provider failures must remain locally contained. |
| POR-004 | Idle UI should perform minimal continuous work. |
| POR-005 | Reliability is tiered R0–R4. |
| POR-006 | V1.x has internal SLOs but no customer-facing SLA. |
| POR-007 | Professional Core initial availability objective is 99.9% over a rolling 30-day view. |
| POR-008 | Contact, Community, Admin and Arcade runtime objectives begin at 99.5%. |
| POR-009 | Error budgets are prioritization tools, not enterprise ceremony. |
| POR-010 | Core Web Vitals baseline remains LCP ≤2.5s, INP ≤200ms, CLS ≤0.10 at p75 where sample is sufficient. |
| POR-011 | Stretch CWV targets are LCP ≤2.0s, INP ≤150ms and CLS ≤0.05. |
| POR-012 | Meaningful input should be acknowledged in roughly ≤100ms. |
| POR-013 | Static/cached professional routes target p75 TTFB ≤800ms. |
| POR-014 | Normal runtime reads target p95 ≤1s application response. |
| POR-015 | Normal public mutations target p95 ≤2.5s. |
| POR-016 | Admin mutations target p95 ≤2s. |
| POR-017 | Arcade finalize targets p95 ≤1.5s. |
| POR-018 | Core initial JS soft target is ≤180KB compressed with mandatory review above 250KB. |
| POR-019 | Heavy features remain lazy and individually size-reviewed. |
| POR-020 | Public-shell CSS targets ≤80KB compressed initial transfer. |
| POR-021 | Critical font transfer target is ≤160KB compressed. |
| POR-022 | Initial mobile LCP media should target ≤350KB when practical. |
| POR-023 | Large desktop LCP media around/above 700KB requires review. |
| POR-024 | Initial viewport has no autoplay video. |
| POR-025 | DynamicBackdrop is centralized and predominantly still at idle. |
| POR-026 | Liquid Glass avoids unbounded nested blur/compositing and degrades through approved material quality tiers. |
| POR-027 | Widget Field performance relies on responsive layout and bounded visible modules, not continuous measurement. |
| POR-028 | Project selection updates identity immediately while heavier context may settle progressively. |
| POR-029 | Hydration is minimized to interactive boundaries. |
| POR-030 | Main-thread tasks over ~50ms during core interaction are treated as diagnostic regressions. |
| POR-031 | Drawing high-frequency state is isolated from root React reconciliation. |
| POR-032 | Arcade has no per-frame network dependency and targets ~60 FPS on representative supported hardware. |
| POR-033 | Routine DB queries around/above 250ms execution are reviewed; repeated >500ms routine queries require investigation. |
| POR-034 | Provider calls always have finite timeouts. |
| POR-035 | Provider retries remain observable even when they eventually succeed. |
| POR-036 | Cache observability distinguishes fresh, stale-allowed and expired states. |
| POR-037 | Cold external caches never block Professional Core rendering. |
| POR-038 | Scaling is evidence-driven from measured constraints. |
| POR-039 | Redis/queues/multi-region are not introduced preemptively. |
| POR-040 | Observability is accessed through application adapters/wrappers. |
| POR-041 | Sentry is the approved V0/V1.0 runtime error-monitoring baseline behind centralized wrappers; product analytics remains disabled/no-op until separately enabled. |
| POR-042 | Production events carry environment and release metadata. |
| POR-043 | Source maps are controlled build artifacts for diagnostics. |
| POR-044 | Server logging is structured and redacted. |
| POR-045 | Raw Contact bodies, credentials, tokens and unpublished creative content never enter routine telemetry. |
| POR-046 | Stable error categories separate expected failures from unexpected exceptions. |
| POR-047 | Safe request/operation/session/job identifiers enable correlation without embedding PII. |
| POR-048 | Product analytics and operational telemetry remain separate systems/concerns. |
| POR-049 | RUM is preferred for real-user performance conclusions; lab testing is for deterministic regression detection. |
| POR-050 | Synthetic monitoring covers core public availability without polluting production content or email. |
| POR-051 | Public health/status output exposes only safe high-level state. |
| POR-052 | Full distributed tracing is optional; targeted sampled spans are sufficient initially. |
| POR-053 | Observability SDK cost counts against client performance budgets. |
| POR-054 | Session replay is disabled by default. |
| POR-055 | Alerts must correspond to actionable conditions. |
| POR-056 | Alert severities are P0–P3 with no implied 24/7 staffed on-call. |
| POR-057 | Release health is correlated to Git/deployment/migration metadata. |
| POR-058 | Material unexplained performance regressions block or trigger corrective release action. |
| POR-059 | Build output includes machine-readable performance-budget information. |
| POR-060 | Accessibility simplifications may improve performance but default mode must still be performant. |
| POR-061 | Error boundaries report feature context while presenting local degraded UI. |
| POR-062 | Contact telemetry records delivery mechanics, never message content. |
| POR-063 | Community telemetry avoids exporting unpublished UGC bodies. |
| POR-064 | Arcade telemetry tracks session/finalize/plausibility health without treating every rejection as an incident. |
| POR-065 | Admin telemetry never captures passwords, TOTP secrets/codes or session tokens. |
| POR-066 | Integration adapters expose normalized health states. |
| POR-067 | Cron/job health is based on expected completion/freshness, not one transient error. |
| POR-068 | Backup readiness includes restore testing, not backup existence alone. |
| POR-069 | Runtime Community/Admin/Arcade persistent-data RPO begins at ≤24h. |
| POR-070 | PITR becomes required before approving a materially tighter runtime-data RPO. |
| POR-071 | Professional Core app-regression RTO objective is ≤1h where provider access permits. |
| POR-072 | Runtime DB/community/admin recovery objective is ≤4h. |
| POR-073 | Optional integration recovery can tolerate up to ~24h while stale/degraded fallback remains valid. |
| POR-074 | Domain/DNS/security control-plane incidents have highest recovery priority with a ≤4h target where access permits. |
| POR-075 | Local preference corruption falls back safely rather than breaking startup. |
| POR-076 | Full offline PWA capability is not required in V1.x. |
| POR-077 | Mutation failure preserves user input/result context where technically possible. |
| POR-078 | Incident severities are SEV-0 through SEV-3 and remain compatible with security incident handling. |
| POR-079 | Significant incidents follow detect→triage→contain→restore→verify→review. |
| POR-080 | Significant incidents receive written postmortems. |
| POR-081 | Telemetry is retained only as long as operationally useful. |
| POR-082 | Performance/span telemetry is sampled deliberately. |
| POR-083 | Preview/local observability is separated from Production. |
| POR-084 | Telemetry redaction is centralized before export. |
| POR-085 | Provider-side “send default PII” behavior requires explicit review. |
| POR-086 | Provider usage/cost growth is an operational signal, especially for abuse/runaway retries. |
| POR-087 | Optimize code/data flow before buying more infrastructure. |
| POR-088 | Public status distinguishes operational, degraded, stale and unknown rather than fabricating health. |
| POR-089 | Analytics/monitoring provider outages never block user-facing product behavior. |
| POR-090 | Failure containment claims must be tested with deliberate dependency failure. |
| POR-091 | Every substantial new feature must define reliability tier, dependencies, degradation and telemetry. |
| POR-092 | Significant client dependencies receive bundle/runtime review before adoption. |
| POR-093 | Third-party scripts are minimized and non-blocking. |
| POR-094 | Resource hints are evidence-driven rather than blanket-preloaded. |
| POR-095 | Image delivery adapts to render role/viewport instead of shipping desktop assets universally. |
| POR-096 | Motion/material quality may adapt without removing product capability. |
| POR-097 | One owner is accountable for operational review/runbooks while automation remains supporting infrastructure. |
| POR-098 | Dashboards are kept small and question-driven. |
| POR-099 | Performance review is release/change driven during active development. |
| POR-100 | Reliability review periodically covers incidents, SLOs, backups, providers and alert noise. |
| POR-101 | Ten implementation gates in Section 97 validate the architecture before relying on it in Production. |
| POR-102 | Exact alert thresholds can be tuned after baseline production telemetry without changing the architectural model. |
| POR-103 | Detailed operational telemetry is retained at most 30 days by baseline; de-identified aggregate trends may be retained up to 90 days; longer retention requires explicit approval. |
| POR-104 | DOC-50 consumes these targets as test/quality acceptance constraints rather than redefining them. |
| POR-105 | DOC-51 consumes these targets as CI/CD gates rather than redefining them. |
| `POR-106` | Sentry is the V0/V1.0 runtime error-monitoring baseline behind wrappers; product analytics is disabled/no-op until separately enabled. |
| `POR-107` | Detailed operational telemetry defaults to at most 30-day retention, subject to shorter provider-plan limits; analytics remains disabled in V1.0. |

---

## 99. Implementation-tool rules

Development tooling or a contributor working on performance/observability/reliability must:

1. read DOC-49 plus the relevant frontend/backend/infrastructure/security domain owner before changing performance/telemetry behavior;
2. never weaken a budget simply to make CI pass without documenting an approved exception;
3. not add a monitoring/analytics SDK directly throughout feature code when a wrapper exists;
4. never send Contact bodies, credentials, TOTP, tokens, cookies or unpublished drawing data to monitoring/logging;
5. keep observability delivery non-blocking for product behavior;
6. preserve Professional Core when optional providers fail;
7. keep Arcade and Drawing high-frequency paths isolated from root React state;
8. maintain lazy boundaries for Arcade, Drawing, Terminal and Admin;
9. include release/environment metadata in production diagnostics;
10. treat expected validation/abuse rejection as domain outcomes, not automatically as exceptions;
11. preserve local user input/result state after recoverable network/provider failures;
12. not introduce Redis, queues, multi-region or tracing infrastructure without measured need/approved architecture change;
13. update performance-budget snapshots and runbook/monitoring docs when architecture materially changes;
14. keep synthetic checks non-destructive;
15. preserve the approved ≤24h runtime-data RPO until a later decision explicitly tightens it and provides the required recovery mechanism;
16. ensure public `/status` output never reveals secrets/internal diagnostics;
17. treat monitoring source maps/tokens as controlled build assets/secrets;
18. use safe correlation identifiers, never PII-derived identifiers.

---

## 100. Accepted baseline

DOC-49 recommends approving this performance/observability/reliability architecture before DOC-50 because the testing strategy needs stable acceptance targets.

The most consequential proposed baselines are:

- Professional Core availability objective **99.9%**;
- runtime capability objective **99.5%**;
- Core Web Vitals baseline **LCP ≤2.5s / INP ≤200ms / CLS ≤0.10 at p75**;
- input acknowledgement around **≤100ms**;
- core initial JS **soft target ≤180KB compressed; mandatory review >250KB**;
- no heavy Arcade/Drawing/Admin bundles on core routes;
- Sentry-or-equivalent error monitoring behind centralized adapters;
- no session replay by default;
- runtime persistent-data **RPO ≤24h** under the daily-backup baseline;
- Professional Core app-regression **RTO ≤1h**, runtime-data recovery **RTO ≤4h**;
- optional provider failures degrade locally rather than taking down the portfolio;
- observability must remain privacy-minimized and non-blocking.

These targets are intentionally ambitious enough to protect the product experience while remaining realistic for a single-owner portfolio built on managed infrastructure.
