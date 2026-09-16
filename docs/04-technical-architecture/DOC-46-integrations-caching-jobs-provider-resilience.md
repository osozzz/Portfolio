---
id: DOC-46
title: "Integrations, Caching, Jobs & Provider Resilience"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Integrations, Caching & Background Work"
canonical_domain_owner: integrations_caching_jobs

depends_on:
  - DOC-00
  - DOC-02
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-18
  - DOC-19
  - DOC-25
  - DOC-31
  - DOC-32
  - DOC-36
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - DOC-45
  - ADR-001
  - ADR-002

decision_families:
  - ICJ
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-46 — Integrations, Caching, Jobs & Provider Resilience

> **Status:** APPROVED.  
> **Role:** Define how the portfolio communicates with external providers, how provider-derived and first-party read data is cached, how scheduled/best-effort background work runs, and how every integration degrades without taking the professional portfolio down.

---

## 1. Purpose

The portfolio deliberately depends on a small number of managed/external services, but those services must remain **enhancement or delivery boundaries**, not hidden single points of failure for the professional core.

DOC-41 established the architectural rule:

```text
Canonical professional content
        ↓ remains available
Portfolio shell / projects / experience / CV

External providers
        ↓ enhance or deliver
GitHub / Tech Pulse / email / anti-bot / analytics / monitoring
```

DOC-46 turns that rule into a concrete integration architecture.

This document defines:

- the integration boundary and provider-adapter contract;
- GitHub public activity synchronization;
- curated Tech Pulse ingestion;
- Contact delivery through Resend;
- Supabase Auth recovery-email delivery boundary;
- Cloudflare Turnstile verification integration;
- cache ownership and cache layers;
- Next.js public read caching and invalidation;
- durable external-feed snapshots in PostgreSQL;
- conditional requests, ETags and source freshness;
- stale-while-error behavior;
- scheduled refresh and cleanup jobs;
- request-triggered best-effort refresh;
- job leases and overlap prevention;
- provider rate-limit behavior;
- retries, cooldowns and failure classification;
- webhook policy;
- release gating of integrations;
- environment isolation;
- integration testing and resilience gates.

It intentionally does **not** finalize:

- complete threat model, SSRF controls, CSP, CSRF, generic request-rate policy or HMAC abuse-key construction — DOC-47;
- DNS records, Vercel/Supabase project topology, production domains, environment variable wiring or SMTP DNS — DOC-48;
- exact timeout numbers, SLOs, alert thresholds, tracing, analytics vendor and error-monitoring vendor — DOC-49;
- the full automated test matrix — DOC-50;
- exact package versions, workflow YAML and deployment pipeline mechanics — DOC-51.

---

## 2. Core integration principle

Every external system is represented behind a narrow adapter owned by the server.

```text
Feature / Application Service
        ↓
Provider-neutral port
        ↓
Provider adapter
        ↓
HTTP / SDK / SMTP / feed protocol
        ↓
External provider
```

The application does not allow provider response shapes, SDK errors, tokens or naming conventions to spread through feature code.

Examples:

```text
ContactService
→ EmailDeliveryGateway
→ ResendEmailAdapter

DevLogService
→ GitHubActivityGateway
→ GitHubRestAdapter

TechPulseService
→ TechFeedGateway
→ RssAtomFeedAdapter

AbuseGuard
→ HumanVerificationGateway
→ TurnstileAdapter
```

Provider replacement should require changes primarily inside the adapter and environment configuration, not throughout UI/application logic.

---

## 3. No provider owns the professional core

The following remain usable when all runtime third-party integrations are unavailable:

- Home shell;
- Projects and Project Detail;
- Experience;
- Education;
- Certifications;
- canonical professional achievements already shipped with the site;
- CV route and generated PDF artifacts;
- Making Of authored content;
- local settings and Widget Field layout;
- route navigation;
- theme/motion/sound preferences;
- core SEO metadata derived from repository content.

This is a hard architectural invariant.

---

## 4. Provider inventory

The baseline provider/integration inventory is:

| Integration | Product role | Release | Runtime criticality |
|---|---|---:|---|
| GitHub REST | Dev Log/public project activity enhancement | V1.4 | Non-critical |
| Curated RSS/Atom/API sources | Tech Pulse | V1.4 | Non-critical |
| Resend API | Contact delivery | V1.0 | Critical only to Contact submit |
| Production SMTP for Supabase Auth | Password recovery/security mail | V0/V1.x Admin | Critical only to recovery flow |
| Cloudflare Turnstile | Human-verification adapter for selected public writes | capability from V1.0; policy by feature | Critical only when policy requires verification |
| Supabase | runtime DB/Auth boundary | earlier canonical docs | Feature-scoped, not professional-core-wide |
| RenderCV | build-time CV generation | V0 | Build-time only |
| Product analytics wrapper | aggregate product analytics | disabled/no-op in V0/V1.0 until explicit privacy/provider decision | Non-critical |
| Sentry | production errors/performance behind centralized monitoring wrapper | V0/V1.0 baseline per DOC-49 | Non-critical to user request correctness |
| Dynamic OG renderer | share-card generation | V1.4 | Non-critical; static fallback exists |

No additional external service becomes a production dependency merely because an SDK is convenient.

---

## 5. Integration classification

Integrations fall into four operational classes.

## 5.1 Delivery integrations

Examples:

- Resend Contact email;
- Auth SMTP.

A user operation causes an external side effect.

Requirements:

- explicit idempotency where available;
- bounded retry;
- stable operation identity;
- no false success;
- user-visible recovery path.

## 5.2 Enrichment integrations

Examples:

- GitHub;
- Tech Pulse.

They enrich public content but are not required for route correctness.

Requirements:

- normalized durable snapshots;
- cache-first reads;
- stale data preferred over blocking/failure where safe;
- no provider fetch on every visitor request.

## 5.3 Verification integrations

Example:

- Turnstile.

They return a trust signal used by application policy.

Requirements:

- server-side verification;
- no secret in browser;
- token replay/expiry semantics respected;
- integration returns a provider-neutral result;
- caller/security policy decides whether `UNAVAILABLE` fails closed or uses an approved fallback.

## 5.4 Tool/build integrations

Example:

- RenderCV.

They run outside ordinary visitor runtime and must not be imported into visitor request paths.

---

## Provider boundary

## 6. Provider-neutral gateway contracts

Provider contracts should expose portfolio concepts, not SDK objects.

Example conceptual contracts:

```ts
interface EmailDeliveryGateway {
  sendContactMessage(input: ContactDeliveryRequest): Promise<DeliveryResult>
}

interface GitHubActivityGateway {
  fetchActivity(input: GitHubActivityRequest): Promise<ProviderFetchResult<GitHubActivitySnapshot>>
}

interface TechFeedGateway {
  fetchSource(source: TechFeedSource): Promise<ProviderFetchResult<TechFeedSnapshot>>
}

interface HumanVerificationGateway {
  verify(input: HumanVerificationRequest): Promise<HumanVerificationResult>
}
```

These are architectural shapes, not mandatory exact TypeScript declarations.

---

## 7. Stable provider result envelope

Provider adapters normalize transport behavior into a small result vocabulary:

```text
SUCCESS
NOT_MODIFIED
RATE_LIMITED
TEMPORARY_FAILURE
PERMANENT_FAILURE
UNAVAILABLE
INVALID_RESPONSE
```

Application code should not branch directly on:

```text
403 from GitHub
429 from feed source
Resend SDK exception class
Cloudflare JSON field names
```

The adapter maps those details first.

---

## 8. Provider error taxonomy

At minimum classify provider failures as:

```text
AUTH_CONFIGURATION
RATE_LIMIT
TIMEOUT
NETWORK
PROVIDER_5XX
INVALID_REMOTE_DATA
REMOTE_NOT_FOUND
REMOTE_REJECTED
LOCAL_VALIDATION
UNKNOWN
```

The provider-specific raw error may be logged in a scrubbed internal event, but the application receives a stable code.

---

## 9. Secrets

All provider secrets are server-only unless the provider explicitly defines a public/publishable key.

Examples:

```text
Server-only
→ RESEND_API_KEY
→ TURNSTILE_SECRET_KEY
→ GITHUB_READ_TOKEN (if enabled)
→ CRON_SECRET

Browser-safe when required
→ TURNSTILE_SITE_KEY
→ analytics public/site identifier if selected
```

No secret is copied into canonical content files, Client Components, localStorage, analytics or error payloads.

---

## 10. Environment-specific credentials

Production, staging and local/development integrations use separate credentials/configuration wherever the provider supports it.

At minimum:

- Turnstile production and non-production configurations are separated;
- email sender/provider credentials are not shared carelessly across preview environments;
- GitHub access token, if used, is scoped and environment-controlled;
- cron secret is production-specific;
- Auth SMTP production credentials are not injected into generic PR previews.

Environment wiring follows the approved DOC-48 deployment/environment contract.

---

## Cache architecture

## 11. Why caching is part of correctness

Caching here is not merely a performance trick.

For provider-derived content it also gives:

- outage isolation;
- lower rate-limit pressure;
- stable response shapes;
- predictable UI latency;
- stale fallback;
- protection against provider bursts;
- fewer third-party calls per visitor.

Therefore cache policy is part of the integration contract.

---

## 12. Cache layers

The portfolio may use four distinct cache layers:

```text
L1 — Browser/CDN/static asset cache
L2 — Next.js server/read-model cache
L3 — Durable integration snapshot in PostgreSQL
L4 — Remote-provider conditional cache semantics (ETag / Last-Modified)
```

They serve different purposes and must not be conflated.

---

## 13. L1 — immutable/static assets

Examples:

- hashed JS/CSS;
- project media with revisioned filenames;
- generated CV PDFs with controlled release path;
- locally hosted fonts/icons;
- revisioned static OG fallback.

These may use long-lived immutable browser/CDN caching when filenames or URLs change with content revision.

---

## 14. L2 — Next.js read-model cache

For public server-rendered data that can be shared across visitors, the preferred current Next.js 16-era model is Cache Components using stable framework primitives such as:

```text
'use cache'
cacheLife(...)
cacheTag(...)
revalidateTag(..., 'max')
updateTag(...) where read-your-own-writes is required
```

The architectural requirement is broader than any one API:

> Public read models may be cached by explicit lifetime/tag policy; authenticated/private state is never accidentally promoted into a shared public cache.

If the pinned Next.js version changes, equivalent stable APIs may be used without changing this invariant.

---

## 15. Cache Components baseline

When the project pins a Next.js release supporting stable Cache Components, `cacheComponents: true` is the preferred baseline.

Reasons:

- caching is opt-in and explicit;
- public cached boundaries can coexist with dynamic server islands;
- cache lifetime and tagging remain visible near the read model;
- revalidation can be targeted rather than route-wide by default.

A prototype/upgrade gate must verify behavior against the actually pinned framework version before production.

---

## 16. Request data and cached functions

Cached functions/components must not accidentally capture visitor-specific request state.

Do not read:

```text
cookies()
headers()
Admin identity
visitor-specific personalization
```

inside a shared public cache boundary.

If a cacheable function needs a stable input, pass the explicit safe argument.

---

## 17. Public runtime read-model cache

Suitable candidates include:

- approved Guestbook projection;
- approved Sketch Wall projection;
- Arcade leaderboard projection;
- GitHub normalized snapshot;
- Tech Pulse normalized snapshot;
- public System Status summary where safe;
- dynamic OG inputs derived from public canonical data.

Not every query needs caching. Use it where the read is shared and freshness policy is meaningful.

---

## 18. Public mutation invalidation

A mutation should invalidate only the read models it affects.

Examples:

```text
Admin approves Guestbook entry
→ invalidate guestbook-public
→ invalidate moderation-queue if cached privately in-request only / not public shared

Admin hides Sketch
→ invalidate sketches-public

Accepted Arcade score
→ invalidate leaderboard:<game>:<leaderboard_version>
```

Avoid global `revalidatePath('/')`-style invalidation as a default.

---

## 19. Read-your-own-writes

When a Server Action requires immediate fresh data for the actor after a successful mutation, `updateTag`-style semantics may be used where supported.

For public shared feeds where slight delay is acceptable, stale-while-revalidate semantics are preferred.

Example:

```text
Admin moderation action
→ mutation response already contains authoritative new state
→ public Guestbook cache can revalidate asynchronously
```

The user should not wait for a global cache purge before receiving confirmation.

---

## 20. Private/admin cache rule

Admin authorization, moderation detail, security settings and other privileged state are not placed in a public shared cache.

Per-request memoization is acceptable.

Cross-request Admin caching requires a separate explicit review because revocation correctness is more important than marginal latency.

This preserves DOC-45's immediate `admin_profiles.disabled_at` kill-switch behavior.

---

## Durable external integration cache

## 21. Why provider data needs a durable snapshot

Next.js server cache alone is not the canonical resilience layer for GitHub/Tech Pulse.

A deployment, cache eviction or runtime instance change should not erase the last known good external feed and force the next visitor to depend on the provider.

Therefore external feed normalization uses a small PostgreSQL-owned durable snapshot.

---

## 22. `integration_cache_entries`

DOC-46 adds a server-only runtime table conceptually shaped as:

```text
integration_cache_entries
```

Recommended columns:

| Column | Purpose |
|---|---|
| `provider_code` | `github`, `tech_feed`, etc. |
| `cache_key` | stable logical key, unique with provider |
| `schema_version` | normalized-payload contract version |
| `normalized_payload` | validated provider-neutral JSONB snapshot |
| `content_hash` | optional dedupe/change detection |
| `etag` | provider conditional-request metadata |
| `last_modified` | provider conditional-request metadata |
| `source_updated_at` | newest meaningful source timestamp when known |
| `fetched_at` | last successful/304 provider contact |
| `fresh_until` | normal freshness boundary |
| `stale_until` | hard stale-serving boundary |
| `retry_after_at` | provider/backoff cooldown |
| `consecutive_failures` | resilience state |
| `last_error_code` | safe normalized error category |
| `refresh_lease_id` | current refresh owner if any |
| `refresh_lease_until` | anti-stampede lease expiry |
| `created_at` / `updated_at` | operational timestamps |

Primary/unique identity:

```text
(provider_code, cache_key)
```

The exact SQL migration belongs to implementation under DOC-44 conventions, but the ownership and semantics are canonical here.

---

## 23. External cache is server-only

`integration_cache_entries` receives no direct public browser grants.

Public UI reads a normalized public projection through application services.

Provider metadata such as internal error details, auth headers or cooldown internals are never serialized to the visitor.

---

## 24. Cache payload is normalized, not raw provider storage

Do not store an entire raw GitHub/API/feed response “just in case”.

Persist only the fields required by the portfolio's normalized contract.

Benefits:

- less accidental PII/internal metadata;
- less provider coupling;
- smaller payloads;
- easier schema validation;
- simpler UI;
- safer future provider replacement.

A scrubbed raw fixture may exist in tests, not production cache rows.

---

## 25. Cache schema versioning

Every normalized durable payload has a `schema_version`.

If application code encounters a snapshot with an incompatible version:

```text
incompatible cache
→ do not crash route
→ treat as unavailable/stale-invalid
→ schedule refresh
→ show degraded/empty provider state if no compatible snapshot exists
```

Do not attempt ad-hoc shape guessing in UI components.

---

## 26. Freshness states

Each durable integration cache entry has three meaningful states:

```text
FRESH
now <= fresh_until

STALE_ALLOWED
fresh_until < now <= stale_until

EXPIRED
now > stale_until
```

Behavior:

| State | UI | Refresh behavior |
|---|---|---|
| Fresh | Serve snapshot | no visitor-blocking refresh |
| Stale allowed | Serve stale snapshot | trigger/allow background refresh |
| Expired | Do not present as current | degraded/empty state + refresh attempt |

Stale data must not masquerade indefinitely as fresh.

---

## 27. Baseline freshness profiles

The exact production intervals can be tuned by DOC-49 metrics, but the initial architectural profiles are:

| Profile | Typical use | Fresh target | Stale tolerance |
|---|---|---|---|
| `near-live-public` | GitHub Dev activity | minutes, not seconds | hours/day-scale |
| `curated-feed` | Tech Pulse | tens of minutes | day-scale |
| `runtime-public` | Guestbook/leaderboards | short shared cache + mutation invalidation | short |
| `build-static` | canonical projects/CV metadata | deployment/content revision | until next deploy |

Concrete starting values may be set in configuration and must be testable, not scattered literals.

---

## 28. Initial suggested integration defaults

For implementation planning, a reasonable **starting** configuration is:

```text
GitHub activity
fresh target: 15 minutes
stale-allowed: up to 24 hours
hard expiry: 72 hours

Tech Pulse
fresh target: 30 minutes
stale-allowed: up to 24 hours
hard expiry: 72 hours
```

These are operational defaults, not product promises.

DOC-49 may tune them based on traffic, cost, source behavior and observed staleness without changing the product contract.

---

## 29. Stale presentation

When provider data is stale but still within the allowed stale window:

- the widget/feed remains usable;
- a subtle freshness indication may appear if staleness is meaningful;
- the shell does not show a dramatic full-page error;
- links remain usable;
- provider attribution remains intact.

Avoid showing a scary “SYSTEM OFFLINE” state because one feed has not refreshed recently.

---

## Conditional provider fetching

## 30. Conditional requests

Where providers support them, adapters persist and send:

```text
ETag → If-None-Match
Last-Modified → If-Modified-Since
```

A `304 Not Modified` is treated as a successful freshness refresh:

```text
payload unchanged
fetched_at updated
fresh_until extended
failure count reset
provider response body not rewritten
```

This is especially valuable for GitHub and standards-compliant feeds/HTTP sources.

---

## 31. Cache stampede prevention

If several visitor requests discover the same stale snapshot, they must not all call the provider.

The refresh path first tries to acquire a short lease on the cache key:

```text
stale cache
  ↓
acquire refresh lease atomically
  ├─ acquired → one refresher
  └─ not acquired → serve existing stale data; do nothing
```

Lease expiration protects against crashed refresh workers.

---

## 32. No visitor request fan-out

A visitor opening Channel must not cause:

```text
5 GitHub requests
+ 8 RSS requests
+ analytics call
+ image probe
```

before HTML can render.

Visitor reads use normalized snapshots/read caches.

Refresh is scheduled or best-effort background work.

---

## GitHub integration

## 33. Product purpose

GitHub data supports:

- Dev Log context;
- recent activity for selected public projects;
- repository/release evidence;
- contextual widgets.

It does **not** determine:

- project completion;
- project lifecycle status;
- productivity score;
- “currently building” status;
- skill level.

Canonical authored data remains authoritative.

---

## 34. Repository allowlist

GitHub ingestion operates only on repositories explicitly approved for public portfolio use.

A repository may declare canonical metadata such as:

```yaml
repository:
  provider: github
  owner: ...
  name: ...
  show_in_dev_log: true
```

The integration never discovers and publishes every repository visible to a token.

---

## 35. Public-only data policy

The baseline GitHub integration ingests only public-safe repository information.

If an authenticated GitHub credential is used, it must not become a backdoor for private-project disclosure.

Prefer:

- unauthenticated public endpoints when operationally sufficient; or
- a least-privilege server-side credential that cannot read unrelated private repositories/content.

A broad personal token with unnecessary private-repository scope is rejected.

---

## 36. Authentication strategy

Because unauthenticated GitHub REST calls have a much smaller shared rate budget, production may use a server-side least-privilege authenticated credential for stability.

Baseline preference for this personal portfolio:

```text
fine-grained, read-only GitHub credential
scoped to the minimum intended repositories/permissions
```

If the integration grows to many repositories/users or requires webhook/application lifecycle, migrate the adapter to a GitHub App through an explicit architecture change.

No GitHub credential reaches the browser.

---

## 37. GitHub API versioning

The adapter pins the supported GitHub REST API version header in one integration configuration location.

Feature code does not hardcode provider API versions.

API-version upgrades are tested against stored fixtures before production rollout.

---

## 38. GitHub normalized item

A GitHub-derived Dev Log item should contain only the portfolio-safe projection needed by the UI, for example:

```text
id
kind               # commit | release | repository_update, controlled enum
repository
project_id?         # canonical project relation where mapped
title
summary?            # normalized, bounded plain text
occurred_at
external_url
commit_sha_short?   # when relevant
release_tag?        # when relevant
```

Do not render arbitrary commit HTML.

---

## 39. Curated plus derived Dev Log

The Dev Log is a merged projection:

```text
Curated milestones
        +
GitHub-derived public activity
        ↓
normalized chronological Dev Log
```

Curated milestones remain visible even if GitHub is unavailable.

Provider-derived activity is visibly distinguishable where useful.

---

## 40. GitHub request efficiency

The adapter follows low-frequency efficient polling:

- stable, specific requests;
- conditional requests with ETag/Last-Modified when available;
- pagination bounded to what the UI actually needs;
- no tight polling;
- no concurrency burst across many endpoints;
- rate-limit headers recorded as operational metadata;
- `Retry-After`/reset boundaries respected.

---

## 41. GitHub rate limits

When GitHub returns rate-limit exhaustion:

```text
RATE_LIMITED
→ preserve last good snapshot
→ set retry_after_at from provider guidance
→ do not hammer provider
→ serve stale if allowed
```

The system does not retry repeatedly while remaining rate-limited.

---

## 42. GitHub outage behavior

If GitHub is unavailable:

```text
Home/projects/core
→ unaffected

Channel Dev Log
→ curated milestones still render
→ cached GitHub activity remains if stale-allowed
→ provider-specific activity may show a quiet degraded state
```

No route becomes a full-page 500 merely because GitHub failed.

---

## Tech Pulse

## 43. Product purpose

Tech Pulse is a **curated technology feed**, not a general web scraper and not a recommendation engine inferred from visitor identity.

Its job is to surface a small, trustworthy set of external technology updates relevant to Alejandro's interests/work.

---

## 44. Source registry

Tech Pulse sources are explicitly allowlisted in repository configuration.

Suggested source contract:

```yaml
id: nextjs-blog
name: Next.js
kind: rss
url: https://...
enabled: true
category: web-platform
attribution_url: https://...
```

Potential future kinds:

```text
rss
atom
json_api
```

Arbitrary user-supplied feed URLs are not supported.

---

## 45. No visitor-time arbitrary scraping

The site never takes a URL from a visitor and fetches it server-side.

Tech Pulse refreshes only configured sources.

HTML scraping of arbitrary sites is not a baseline ingestion method.

If a source lacks a stable feed/API, adding a scraper requires explicit legal/technical review rather than ad-hoc CSS selectors.

---

## 46. Safe feed normalization

A normalized Tech Pulse item contains a bounded projection such as:

```text
source_id
provider_item_id?
title
canonical_url
published_at
category
source_name
summary?        # short provider-supplied plain text only when permitted
```

Do not store/render full article bodies.

Provider HTML descriptions are sanitized/converted to bounded plain text rather than injected into the portfolio.

---

## 47. Attribution

Every Tech Pulse item preserves visible source attribution and an external canonical link.

The portfolio does not present third-party reporting as its own authored article.

---

## 48. External images

Tech Pulse V1.4 does not require hotlinking arbitrary article images.

Preferred baseline:

- source icon/logo only when licensed/locally managed appropriately;
- text-first feed cards;
- no invisible third-party tracking pixels;
- no remote media required for layout correctness.

This keeps CSP, performance, privacy and attribution simpler.

---

## 49. Feed deduplication

Items are deduplicated using stable source identity where available, otherwise a normalized tuple such as:

```text
source_id
+ canonical_url
+ published_at/title hash
```

Do not merge distinct articles merely because titles are similar.

---

## 50. Feed source failure

One broken source must not invalidate the whole Tech Pulse snapshot.

Refresh is source-partitioned:

```text
Source A success
Source B 500
Source C invalid XML
        ↓
A/C? handled independently
        ↓
aggregate from last good source snapshots
```

The public feed may be partial.

---

## 51. Invalid remote data

Malformed feed content is treated as provider input, never trusted data.

The adapter validates:

- URL scheme/domain against configured source;
- date parseability;
- maximum string lengths;
- item count bounds;
- expected MIME/body size;
- XML/JSON structure;
- allowed fields.

Detailed SSRF/XML parser hardening follows DOC-47.

---

## Email delivery

## 52. Contact delivery provider

Resend remains the baseline Contact email provider selected behind `EmailDeliveryGateway`.

Flow:

```text
validated Contact operation
        ↓
ContactService
        ↓
ResendEmailAdapter
        ↓
Resend API
```

Provider SDK objects never cross into UI DTOs.

---

## 53. Contact email idempotency

DOC-43/44 already define an application `operation_id` and Contact delivery ledger.

The Resend adapter reuses the same stable provider idempotency identity for retries of the same logical send.

Conceptually:

```text
contact-delivery/<operation_id>
```

Never generate a new idempotency key merely because the first response timed out.

---

## 54. Provider acceptance versus inbox delivery

A successful API response means the provider accepted the message for delivery.

The Contact UI must not claim stronger knowledge such as:

```text
"Delivered to Alejandro's inbox"
```

unless the system actually tracks a verified delivery event.

Baseline success language should correspond to:

```text
accepted / sent for delivery
```

---

## 55. Contact retry behavior

Retries are allowed only when the operation is safe to retry.

Because the send uses a stable idempotency key:

- transient network/provider failures may receive a small bounded retry within the operation budget;
- otherwise the client can retry the same logical operation safely;
- permanent validation/rejection errors are not retried blindly;
- `429` respects provider retry guidance;
- provider idempotency conflicts are mapped to stable application semantics.

Exact timeout/retry counts belong to DOC-49.

---

## 56. No email queue baseline

V1.0 does not add a durable general email queue.

Reasons:

- Contact volume is expected to be low;
- Resend supports provider-side idempotency;
- the application ledger protects retries;
- the visitor can retry a preserved draft;
- a queue would create worker/dead-letter/monitoring obligations disproportionate to the use case.

If evidence later shows a need for guaranteed delayed delivery, add a purpose-built durable workflow through ADR.

---

## 57. Contact outage behavior

If Resend is unavailable:

- Contact fields remain preserved in the browser;
- the user receives a recoverable delivery-unavailable state;
- the site does not falsely mark the message as sent;
- browsing/Projects/CV remain unaffected;
- retry uses the same logical operation where applicable.

---

## 58. Auth email channel

Supabase Auth recovery/security email is a separate delivery path from the application's Contact API.

Conceptually:

```text
Contact
→ application Resend API adapter

Auth recovery
→ Supabase Auth
→ configured production SMTP
→ email provider
```

The same vendor may serve both, but sender/configuration responsibilities remain separate.

DOC-48 owns exact SMTP and DNS wiring.

---

## 59. Sender separation

Production should be able to distinguish operational sender identities, for example:

```text
contact / portfolio correspondence
vs
security / Auth recovery
```

Exact mailbox names are deferred to DOC-48/content decisions.

Security email should not be indistinguishable from playful portfolio notifications.

---

## 60. Email webhooks are not baseline

Contact correctness does not require an inbound Resend webhook in V1.0.

Provider dashboard/monitoring can initially surface delivery/bounce issues.

If inbound delivery events are added later:

- verify provider signature;
- deduplicate events;
- store only operational metadata necessary for the use case;
- do not create a hidden Contact-message archive;
- process asynchronously/idempotently.

---

## Human verification / Turnstile

## 61. Turnstile role

Cloudflare Turnstile is the baseline `HumanVerificationGateway` candidate formalized by this document.

It is a **signal used by abuse policy**, not the entire abuse-prevention architecture.

Rate limiting, request validation, feature-scoped abuse keys and moderation remain separate controls.

---

## 62. Server-side verification is mandatory

A browser Turnstile token has no authority until the server validates it through Siteverify.

The flow is:

```text
browser challenge
→ token
→ public write request
→ server Turnstile adapter
→ Siteverify
→ normalized verification result
→ AbuseGuard/security policy
```

The client cannot submit `verified: true` as proof.

---

## 63. Turnstile key boundary

```text
Site key
→ browser-safe

Secret key
→ server-only
```

The secret never reaches rendered HTML, Client Components or browser logs.

---

## 64. Token lifetime/replay semantics

The integration treats Turnstile tokens as short-lived and single-use.

Current provider behavior is approximately:

```text
validity window: 5 minutes
single redemption
```

A `timeout-or-duplicate` style result requires a fresh challenge rather than replaying the same token indefinitely.

Provider behavior is checked again when implementation versions are pinned.

---

## 65. Turnstile request context

Where configured, server verification checks provider-returned context such as:

- success;
- expected hostname;
- expected action;
- token age/provider result;
- other explicitly supported verification metadata.

The app does not accept a token solved for an unrelated action/hostname when the provider exposes that context.

---

## 66. Turnstile idempotent verification retry

If Siteverify itself experiences a transient network/internal failure, the adapter may use the provider-supported idempotency key for safe validation retry.

The retry identity should derive from the current verification operation, not a random new identity per attempt.

---

## 67. Verification result contract

The adapter returns a small application result:

```text
VERIFIED
REJECTED
EXPIRED_OR_USED
UNAVAILABLE
MISCONFIGURED
```

The integration layer itself does not decide the business/security consequence of `UNAVAILABLE`.

DOC-47 defines which protected writes fail closed, degrade to other controls or temporarily disable submission.

---

## 68. Accessible failure

If a challenge expires or the provider is unavailable:

- preserve Contact/Guestbook/Sketch input where possible;
- provide textual recovery instructions;
- allow obtaining a new challenge;
- never trap keyboard/screen-reader users in an infinite retry loop;
- do not discard a drawing because the anti-bot token expired.

---

## 69. Environment separation

Development/staging use provider test/non-production configuration where supported.

Production keys are never required merely to render a generic PR preview.

Hostname restrictions should include only intended origins.

---

## Jobs and background work

## 70. No general queue baseline

DOC-41's decision remains unchanged:

> V0/V1.x does not pre-build a general-purpose queue or worker fleet.

Background work uses the smallest mechanism that satisfies its durability requirements.

Available mechanisms are:

```text
request-time synchronous work
build/CI work
Next.js after() best-effort post-response work
Vercel Cron scheduled jobs
provider-native delivery/idempotency
narrow database transactions/functions
```

A queue is introduced only when a real workflow requires durable asynchronous retries independent of visitor requests.

---

## 71. `after()` role

Current stable Next.js `after()` semantics may be used for **best-effort, non-critical post-response work**.

Suitable examples:

- request-triggered stale external-feed refresh;
- low-value integration telemetry after the response;
- non-authoritative cache warming.

Not suitable as the sole mechanism for:

- Contact delivery the user is awaiting;
- moderation mutation/audit commit;
- Arcade score finalization;
- security-factor change;
- any task whose completion must survive process termination with durable retry.

---

## 72. Scheduled job provider

Vercel Cron is the baseline scheduler for production periodic jobs while Vercel remains the deployment platform.

Jobs are declared in source-controlled deployment configuration.

Cron is a scheduler only; job correctness remains in application/database services.

---

## 73. Cron authentication

Cron endpoints require `CRON_SECRET` verification.

Vercel sends the configured secret as a Bearer `Authorization` header when invoking the job.

The endpoint:

- compares the header server-side;
- returns `401` on mismatch;
- never exposes the secret;
- uses `Cache-Control: no-store`;
- does not treat route obscurity as authorization.

DOC-47 can add further hardening.

---

## 74. Production-only cron

Scheduled Vercel Cron executes only against production deployments.

Preview/staging/local testing uses explicit scripts/test triggers rather than pretending production cron is active everywhere.

This prevents accidental preview jobs from mutating production data.

---

## 75. Baseline job catalog

The initial job catalog is intentionally small:

```text
refresh-external-integrations
cleanup-expired-runtime-state
```

Potential decomposition later:

```text
refresh-github
refresh-tech-pulse
cleanup-contact-operations
cleanup-expired-arcade-sessions
cleanup-expired-idempotency/operational state
```

Split jobs only when independent schedules/failure isolation justify it.

---

## 76. `refresh-external-integrations`

Purpose:

- refresh GitHub cache entries due for refresh;
- refresh Tech Pulse sources due for refresh;
- respect per-provider cooldown/rate limits;
- update durable snapshots atomically per source/cache key;
- continue other independent sources when one fails.

The job never blocks public route rendering while it runs.

---

## 77. Cleanup job

Daily cleanup may remove or transition records according to DOC-44 retention rules, for example:

- expired Contact delivery-operation metadata after retention window;
- old expired Arcade sessions/evidence according to retention policy;
- expired operational leases;
- obsolete integration-cache entries for removed source keys after a safety period.

Cleanup is idempotent.

It does not delete canonical audit/security records merely because they are old without the approved retention policy.

---

## 78. `job_leases`

DOC-46 introduces a minimal server-only operational lease concept to prevent overlapping scheduled runs.

Recommended table:

```text
job_leases
```

Possible columns:

| Column | Purpose |
|---|---|
| `job_key` | primary logical job identity |
| `lease_id` | current invocation identity |
| `lease_until` | expiration for crash recovery |
| `last_started_at` | operational visibility |
| `last_completed_at` | operational visibility |
| `last_status` | safe coarse result |
| `last_error_code` | safe normalized error |
| `updated_at` | bookkeeping |

This is operational state, not the canonical historical observability store.

DOC-49 owns logs/metrics/history.

---

## 79. Job lease acquisition

A job must atomically acquire or renew its lease before doing work.

```text
Cron invocation A
→ acquires job lease

Cron invocation B overlaps
→ cannot acquire active lease
→ exits cleanly without duplicate work
```

A crashed job eventually releases itself through lease expiration.

---

## 80. Per-cache refresh lease

Even within one integration job, individual provider cache entries use their own refresh lease.

This protects against overlap between:

```text
scheduled refresh
and
request-triggered best-effort refresh
```

for the same cache key.

---

## 81. Cron plan independence

Portfolio correctness must not require a high-frequency paid cron schedule.

Current Vercel Hobby scheduling permits only a daily cron cadence, while paid plans can schedule more frequently.

Therefore integration freshness has two cooperating mechanisms:

```text
Scheduled refresh
+
request-triggered stale refresh via after()
```

A low-cost deployment can remain correct with daily scheduling; higher-frequency cron improves freshness, not correctness.

---

## 82. Operational schedule profiles

Define schedules centrally rather than scattering cron literals.

Two useful deployment profiles are:

```text
LEAN / low-cost
→ daily scheduled integration refresh
→ request-triggered stale refresh
→ daily cleanup

ENHANCED freshness
→ GitHub approximately every 15 minutes
→ Tech Pulse approximately every 30 minutes
→ daily cleanup
→ request-triggered stale refresh remains backup
```

Exact schedules are deployment configuration and may be tuned without changing product scope.

---

## 83. Cold cache behavior

If no compatible external snapshot exists:

- public page still renders;
- the integration surface shows a bounded loading/updating/degraded state;
- refresh can be scheduled or triggered after the response;
- the page does not synchronously fan out to every provider before first paint.

Canonical/curated Channel content remains visible.

---

## 84. Manual refresh

A manual “refresh integration” control is not required for public users.

A future Admin/operations control may request a refresh, but it must:

- require Admin AAL2;
- honor provider cooldowns unless an explicit safe override exists;
- use the same refresh service/lease logic;
- create observable operational events;
- never reveal provider secrets.

Not baseline for V1.0.

---

## Retry, cooldown and resilience

## 85. Retry principle

Retry only when all are true:

1. the failure appears transient;
2. the operation is safe/idempotent to retry;
3. the provider has not told us to wait longer;
4. the overall request/job time budget remains healthy;
5. a retry is likely to add value.

“Retry everything three times” is not acceptable architecture.

---

## 86. No retry for ordinary permanent errors

Do not automatically retry:

- invalid credentials/configuration;
- malformed request;
- remote 404 representing removed content;
- provider validation rejection;
- invalid Turnstile token;
- payload rejected by local schema;
- idempotency-key payload conflict.

These require correction/new input, not backoff.

---

## 87. Rate-limit behavior

For `429` or provider-specific rate-limit responses:

- respect `Retry-After` when present;
- respect GitHub `x-ratelimit-reset` semantics where applicable;
- set `retry_after_at`;
- stop repeated attempts until allowed;
- serve stale cache where safe;
- record a normalized rate-limit event.

Do not busy-loop against provider limits.

---

## 88. Exponential backoff with jitter

Background/provider transient retries use bounded exponential backoff with jitter.

There is always:

- a max attempt count;
- a max elapsed budget;
- a terminal degraded outcome.

Exact values belong to DOC-49 and provider-specific implementation tests.

---

## 89. Pragmatic cooldown instead of a distributed circuit-breaker platform

V1.x does not introduce a generic circuit-breaker service/library across the whole application.

Provider cache state already tracks enough to implement a pragmatic cooldown:

```text
consecutive_failures
retry_after_at
last_error_code
```

When failures exceed the configured threshold:

```text
skip remote call until cooldown
→ serve stale if allowed
→ periodic probe after retry_after_at
```

This achieves the needed behavior without building a distributed resilience subsystem.

---

## 90. Success resets cooldown state

A successful provider response or valid `304 Not Modified` resets:

```text
consecutive_failures = 0
last_error_code = null
retry_after_at = null
```

and extends freshness according to policy.

---

## 91. Provider timeout ownership

Every adapter has an explicit timeout budget.

No external call waits indefinitely.

DOC-49 sets/tunes concrete budgets for:

- user-facing verification;
- user-facing email delivery;
- background GitHub calls;
- background feed source fetch;
- webhook/provider calls if later added.

---

## 92. Partial success

Batch refresh operations use partial-success semantics where sources are independent.

Example:

```text
GitHub repo A → success
GitHub repo B → rate limited
Tech source C → invalid feed
Tech source D → success
```

The job records per-source outcome and preserves successful snapshots.

One source does not roll back all other source refreshes.

---

## Webhook policy

## 93. Webhooks are selected per integration

There is no global “webhooks everywhere” rule.

Use webhooks only when event-driven behavior materially improves the product or reliability.

---

## 94. GitHub webhook decision

V1.4 baseline uses low-frequency conditional polling rather than GitHub webhooks.

Rationale:

- the portfolio does not need real-time commit propagation;
- repository set is small and explicitly allowlisted;
- polling can use conditional requests and durable cache;
- webhook setup/signature/secret/retry handling adds operational surface;
- stale GitHub activity is acceptable.

If future requirements demand near-real-time project events, GitHub webhooks can replace/augment polling behind the same gateway.

---

## 95. Generic webhook requirements

Any future provider webhook must have:

- HTTPS endpoint;
- provider signature verification where available;
- raw-body handling when required by signature scheme;
- replay/idempotency key/event-id deduplication;
- bounded request body;
- safe normalized event type;
- asynchronous/short processing where appropriate;
- no trust in client-supplied provider identity;
- logs without secret/signature leakage.

DOC-47 owns security detail.

---

## 96. Webhook success semantics

A webhook endpoint should acknowledge only after the event is safely accepted for its chosen processing model.

If processing is synchronous and transactional, acknowledge after commit.

If a durable async mechanism is ever introduced, acknowledge after durable enqueue/persistence, not before.

Because V1.x has no generic queue, do not pretend to have durable background webhook processing that does not exist.

---

## Release gating

## 97. Provider features are release-aware

External integrations follow DOC-02 release ownership.

```text
V1.0
→ Contact/Resend
→ anti-bot capability where required

V1.1–V1.3
→ no GitHub/Tech Pulse dependency required

V1.4
→ GitHub Dev Log enrichment
→ Tech Pulse
→ dynamic OG improvements
→ richer integration/status behavior
```

Earlier releases must not ship hidden provider dependencies simply because the adapter already exists.

---

## 98. Release Registry integration

The same Release Registry concept used by frontend routing/widgets also gates provider-backed features.

A feature disabled for the current release does not:

- show its live-data widget;
- schedule its provider jobs;
- require its secret;
- fail deployment because the provider is unconfigured.

This is important for incremental release delivery.

---

## 99. Optional integration configuration

Provider configuration is validated conditionally.

Example:

```text
GitHub feature disabled
→ no GITHUB token required

GitHub feature enabled
→ required config validated at startup/deploy
```

Do not make V1.0 Contact fail to deploy because V1.4 Tech Pulse sources are not configured yet.

---

## Environment behavior

## 100. Local development

Local development supports deterministic provider testing through:

- test fixtures;
- provider adapters pointed to documented test modes where available;
- explicit opt-in real-provider integration tests;
- local scripts for scheduled jobs;
- no production secret requirement for ordinary UI development.

---

## 101. Preview deployments

Generic PR previews:

- do not run production cron;
- do not receive broad production GitHub/email/Auth credentials;
- can use mocked/fixture integrations;
- can use provider test keys where safe;
- cannot mutate production integration cache.

DOC-48 defines exact environment topology.

---

## 102. Staging

If a persistent staging environment exists, it may use:

- staging Turnstile configuration;
- staging Supabase;
- non-production email recipient routing/sandbox;
- real public GitHub/read-only feeds if safe;
- its own cache rows/jobs.

Never send test Contact submissions to unintended real recipients.

---

## 103. Production

Production provider configuration requires:

- correct secrets;
- source allowlists;
- job authentication;
- sender/domain verification;
- expected hostnames/actions;
- observability hooks;
- explicit failure behavior.

A missing critical integration configuration should fail fast at deploy/startup for the feature that is enabled rather than fail mysteriously after launch.

---

## Provider data safety

## 104. Remote input is untrusted

Data arriving from GitHub, feeds, email-provider callbacks or verification APIs is still external input.

Validate before persistence/rendering.

Provider reputation does not replace schema validation.

---

## 105. External URLs

Normalized external links must:

- use allowed `http/https` semantics as appropriate, with `https` preferred/required for configured sources;
- reject dangerous schemes;
- not become server fetch targets unless they come from explicit integration configuration;
- open with appropriate external-link safety semantics in UI.

Detailed URL/SSRF rules belong to DOC-47.

---

## 106. Provider HTML

Do not render remote HTML directly from Tech Pulse, GitHub text fields or email-provider payloads.

Normalize to plain text or a narrowly controlled safe representation.

This avoids turning feed markup into an XSS surface.

---

## 107. Body and item limits

Every provider adapter defines:

- max response body size;
- max item count processed;
- max string lengths;
- max pagination depth;
- max redirects;
- content type expectations.

This prevents a malformed/hostile remote source from turning refresh into an unbounded memory/CPU job.

Exact numeric limits are implementation constants reviewed in DOC-47/49.

---

## Analytics and monitoring integration boundary

## 108. Product analytics baseline

Product analytics is **disabled/no-op in V0/V1.0**. Feature code uses a provider-neutral analytics wrapper so a future provider can be introduced without coupling features to an SDK. Enabling analytics requires an explicit privacy/provider/event-set decision that addresses consent/cookies, script weight, cost and retention before production activation.

---

## 109. Error monitoring baseline

**Sentry** is the approved V0/V1.0 runtime error-monitoring baseline behind centralized wrappers, as owned by DOC-49. Integration adapters emit normalized errors/metadata so monitoring can observe:

```text
provider
operation
result category
latency bucket
cache state
request/job id
```

without recording raw Contact bodies, Auth tokens, Turnstile tokens or provider secrets.

---

## 110. Integration health signals

At minimum expose internal metrics/log events for:

- refresh success/failure by provider/source;
- age of last successful snapshot;
- stale/expired cache reads;
- provider rate-limit events;
- email provider acceptance/failure;
- Turnstile verification outcomes by coarse category;
- scheduled job acquisition/success/failure;
- refresh lease contention;
- normalized provider latency.

DOC-49 determines dashboards/alerts.

---

## Dynamic OG and build-time integrations

## 111. Dynamic OG

Dynamic OG rendering in V1.4 derives from canonical public project metadata.

It should be deterministic for a given:

```text
locale
project/content revision
theme/template revision
```

Prefer revisioned/cacheable output.

If OG generation fails, use a static portfolio fallback instead of failing the destination route.

---

## 112. RenderCV remains build-time

RenderCV never moves into visitor runtime merely because DOC-46 introduces jobs.

The canonical flow remains:

```text
content
→ CI/build validation
→ RenderCV
→ static PDF artifacts
```

No scheduled job regenerates CV in production from mutable runtime data.

---
## Rate-limit bucket cleanup

The scheduled cleanup job also purges expired `abuse_rate_limit_buckets` after the DOC-47/DOC-44 retention grace. Cleanup is not correctness-critical: an expired bucket is ignored by policy even if physical deletion is delayed.


## Failure-domain matrix

## 113. Failure behavior

| Failure | Must keep working | Degraded surface |
|---|---|---|
| GitHub API down | entire professional portfolio | GitHub-derived Dev Log/widget |
| GitHub rate limited | entire professional portfolio | stale/cached GitHub activity |
| one Tech Pulse source broken | entire site + other sources | that source only |
| all Tech Pulse sources down | entire site | stale/empty Tech Pulse |
| Resend Contact API down | browsing/CV/projects | Contact delivery only |
| Auth SMTP down | current Admin login with password+TOTP if otherwise valid | password recovery/security email |
| Turnstile down | browsing | protected writes according to DOC-47 policy |
| Vercel Cron missed | browsing + stale cache | freshness until request-triggered/scheduled recovery |
| `after()` refresh fails | current response | external freshness only |
| integration cache row incompatible | core site | corresponding provider data until refresh |
| analytics down | everything | analytics only |
| monitoring down | everything | observability only |

---

## 114. No fake success

Failure isolation never means lying.

Examples:

- Contact cannot show success if provider acceptance is unknown;
- Tech Pulse cannot label expired data “Latest” without freshness context;
- GitHub cannot infer a current project status from old commits;
- Turnstile unavailable cannot be treated as “verified” merely to avoid UX friction.

---

## Implementation structure

## 115. Suggested integration layout

```text
lib/
└── integrations/
    ├── email/
    │   ├── email-delivery.gateway.ts
    │   └── resend.adapter.ts
    ├── github/
    │   ├── github-activity.gateway.ts
    │   ├── github-rest.adapter.ts
    │   ├── github.mapper.ts
    │   └── github.schemas.ts
    ├── tech-pulse/
    │   ├── tech-feed.gateway.ts
    │   ├── rss-atom.adapter.ts
    │   ├── feed.mapper.ts
    │   └── feed.schemas.ts
    ├── verification/
    │   ├── human-verification.gateway.ts
    │   └── turnstile.adapter.ts
    └── shared/
        ├── provider-result.ts
        ├── retry-policy.ts
        └── request-limits.ts

features/
└── channel/
    └── application/
        ├── get-dev-log.ts
        └── get-tech-pulse.ts

lib/server/jobs/
├── job-lease.repository.ts
├── refresh-external-integrations.ts
└── cleanup-expired-runtime-state.ts
```

Exact paths may evolve while respecting the dependency direction.

---

## 116. No provider SDK in feature components

Forbidden:

```ts
// ChannelWidget.tsx
import { Octokit } from '...'

// ContactForm.tsx
import { Resend } from 'resend'
```

Allowed dependency direction:

```text
UI
→ application service
→ gateway
→ adapter
```

---

## 117. Server-only module boundaries

Adapters containing secrets/network-provider clients are marked/imported as server-only.

Build tooling/lint rules should make accidental Client Component imports fail early.

---

## Testing gates

## 118. Gate A — GitHub cache/resilience

Test with fixture/mock provider:

1. first refresh stores normalized snapshot;
2. second fetch with matching ETag returns `304` and extends freshness without replacing payload;
3. provider `429` sets cooldown;
4. repeated public reads do not trigger repeated provider calls;
5. stale snapshot serves during provider outage;
6. expired snapshot produces degraded state rather than route failure;
7. private/unallowlisted repo data cannot enter the public projection.

---

## 119. Gate B — Tech Pulse source isolation

Test:

- valid RSS source;
- valid Atom source;
- malformed XML;
- oversized body;
- source timeout;
- duplicate item;
- bad URL/scheme in item;
- one failed source while others succeed;
- remote HTML never reaches render as executable markup.

---

## 120. Gate C — Contact delivery

Verify:

- same Contact `operation_id` maps to same provider idempotency identity;
- provider timeout does not cause duplicate send on retry;
- permanent provider rejection maps correctly;
- `429` respects retry policy;
- browser message remains recoverable on failure;
- no Contact body appears in integration logs.

---

## 121. Gate D — Turnstile

Verify:

- client token without Siteverify is never accepted;
- valid test token maps to `VERIFIED`;
- expired/duplicate token maps correctly;
- wrong hostname/action is rejected when configured;
- provider-unavailable path maps to `UNAVAILABLE` rather than `VERIFIED`;
- secret never appears in client bundle/log output;
- input survives challenge refresh.

---

## 122. Gate E — scheduled jobs

Verify:

- invalid/missing Cron Bearer secret receives `401`;
- valid cron acquires job lease;
- overlapping invocation exits without duplicate work;
- expired lease can be recovered after simulated crash;
- one provider failure does not prevent independent provider refresh;
- cleanup is idempotent;
- preview deployment does not run production schedule.

---

## 123. Gate F — request-triggered stale refresh

Simulate stale cache and concurrent page loads.

Verify:

- all visitors receive stale snapshot promptly;
- only one refresh lease is acquired;
- refresh happens after response/best-effort path;
- refresh failure does not fail rendered page;
- next successful refresh replaces snapshot and clears cooldown.

---

## 124. Gate G — cache privacy

Verify:

- no Admin/authenticated response enters a shared public cache;
- cache keys do not include raw email/IP/token values;
- integration cache table has no browser grants;
- raw provider secrets/responses are absent from public payloads;
- locale-specific public cache keys are correct where content differs.

---

## 125. Gate H — release gating

For a V1.0 configuration:

- GitHub/Tech Pulse secrets are not required;
- GitHub/Tech Pulse jobs are not scheduled;
- Contact delivery works;
- disabled V1.4 widgets do not attempt provider requests.

For V1.4:

- source registry validates;
- provider jobs/features activate only with required config.

---

## 126. Gate I — plan/frequency independence

Test a low-frequency schedule profile:

- daily cron only;
- cache becomes stale between cron runs;
- visitor still receives last safe snapshot;
- `after()` refresh can improve freshness;
- correctness does not depend on minute-level cron.

---

## Implementation invariants

## 127. Invariant summary

The following remain true regardless of provider/SDK details:

1. External providers never own the professional core.
2. Provider calls are server-owned and adapter-normalized.
3. GitHub/Tech Pulse never fetch directly from Client Components.
4. External feed reads prefer durable normalized snapshots over visitor-time provider calls.
5. Provider cache supports fresh, stale-allowed and expired states.
6. Stale data is bounded and never presented forever as current.
7. Conditional requests are used where supported.
8. Cache refresh is protected from stampedes by leases.
9. GitHub only exposes explicitly allowlisted public-safe repositories/data.
10. GitHub activity never becomes an automated progress/completion metric.
11. Tech Pulse uses configured feeds/APIs, not arbitrary visitor-supplied scraping.
12. Third-party article bodies/HTML are not rendered directly.
13. Contact delivery preserves stable application/provider idempotency identity.
14. Contact provider acceptance is not misrepresented as guaranteed inbox delivery.
15. V1.0 has no general email queue.
16. Auth SMTP and Contact delivery are separate operational channels even if the same vendor is used.
17. Turnstile always validates server-side before its signal is trusted.
18. Turnstile secret remains server-only.
19. Turnstile provider availability and security policy are separate concerns.
20. `after()` is best-effort and never the sole mechanism for correctness-critical durable work.
21. Vercel Cron schedules jobs; application/database services own job logic.
22. Cron endpoints authenticate with a secret and are not protected by obscurity.
23. Overlapping scheduled work is lease-controlled.
24. Portfolio correctness does not require a paid/high-frequency cron plan.
25. Retries are bounded, idempotency-aware and rate-limit-aware.
26. Provider cooldown is pragmatic state, not a prebuilt distributed circuit-breaker platform.
27. One source/provider failure degrades locally.
28. No general queue is introduced without a concrete durable async requirement.
29. Public shared caches never contain Admin/private request state.
30. Provider data is validated as untrusted remote input.
31. Provider secrets/tokens never enter logs, analytics or public payloads.
32. Release-disabled integrations require neither secrets nor jobs.
33. Analytics/error-monitoring providers remain replaceable and cannot break user correctness.
34. Dynamic OG and other enhancement generation always have a fallback.
35. RenderCV stays build-time and is not moved into runtime jobs.

---

## Proposed decision registry

## 128. ICJ decisions

| ID | Decision |
|---|---|
| `ICJ-001` | External systems are server-owned adapters and do not become the professional-core source of truth. |
| `ICJ-002` | Integration adapters expose provider-neutral gateway contracts/results. |
| `ICJ-003` | Provider raw SDK/HTTP shapes do not leak into feature UI/application DTOs. |
| `ICJ-004` | Provider secrets are server-only except explicitly public/publishable identifiers. |
| `ICJ-005` | Provider configuration is environment-scoped and release-aware. |
| `ICJ-006` | Integrations are classified as delivery, enrichment, verification or build/tool boundaries. |
| `ICJ-007` | Provider failures map into stable normalized error categories. |
| `ICJ-008` | Caching is part of external-provider resilience, not only performance optimization. |
| `ICJ-009` | Cache architecture distinguishes static/CDN, Next.js read cache, durable provider snapshot and remote conditional-cache semantics. |
| `ICJ-010` | Current Next.js Cache Components APIs are the preferred public shared-cache baseline when supported by the pinned stable framework version. |
| `ICJ-011` | Shared public cache scopes never read/capture Admin identity or visitor-specific private request state. |
| `ICJ-012` | Public runtime read models use targeted tags/invalidation rather than broad global invalidation by default. |
| `ICJ-013` | `updateTag`-style immediate invalidation is reserved for read-your-own-writes use where supported; public feeds may use SWR. |
| `ICJ-014` | Admin authorization/security state is not placed in a cross-request public shared cache. |
| `ICJ-015` | GitHub/Tech Pulse use durable normalized PostgreSQL snapshots so deployment/cache eviction does not erase the last good provider state. |
| `ICJ-016` | DOC-46 introduces server-only `integration_cache_entries` with explicit freshness/cooldown/lease metadata. |
| `ICJ-017` | Durable integration cache stores normalized required fields, not complete raw provider responses. |
| `ICJ-018` | Integration cache payloads are schema-versioned. |
| `ICJ-019` | Integration snapshot states are `FRESH`, `STALE_ALLOWED` and `EXPIRED`. |
| `ICJ-020` | Stale provider data may be served only within its bounded stale window. |
| `ICJ-021` | Initial GitHub freshness target is approximately 15 minutes with bounded stale fallback; DOC-49 may tune operational values. |
| `ICJ-022` | Initial Tech Pulse freshness target is approximately 30 minutes with bounded stale fallback; DOC-49 may tune operational values. |
| `ICJ-023` | Provider ETag/Last-Modified conditional requests are used where supported. |
| `ICJ-024` | A valid `304 Not Modified` counts as a successful freshness refresh and resets failure state. |
| `ICJ-025` | Refresh stampedes are prevented with per-cache refresh leases. |
| `ICJ-026` | Visitor page rendering never fans out synchronously to all external providers. |
| `ICJ-027` | GitHub is an enhancement to Dev Log/project context, never project lifecycle/completion authority. |
| `ICJ-028` | Only explicitly allowlisted repositories may enter GitHub-derived public portfolio data. |
| `ICJ-029` | GitHub ingestion is public-safe even when an authenticated server credential is used. |
| `ICJ-030` | Production GitHub may use a least-privilege read-only fine-grained credential; broad private-repo token scope is rejected. |
| `ICJ-031` | GitHub provider API version configuration is centralized in the adapter. |
| `ICJ-032` | GitHub-derived activity is normalized to a bounded portfolio DTO. |
| `ICJ-033` | Dev Log merges curated milestones with provider-derived activity without letting commits infer progress/status. |
| `ICJ-034` | GitHub polling is low-frequency, conditional, bounded and rate-limit-aware. |
| `ICJ-035` | GitHub rate-limit responses set provider cooldown and do not trigger repeated retry loops. |
| `ICJ-036` | GitHub outage degrades only GitHub-derived surfaces; curated/core content remains. |
| `ICJ-037` | Tech Pulse is an explicitly curated external-feed system, not an arbitrary web scraper. |
| `ICJ-038` | Tech Pulse sources live in an allowlisted repository configuration. |
| `ICJ-039` | V1.4 Tech Pulse supports stable feeds/APIs; arbitrary visitor-supplied URLs are forbidden. |
| `ICJ-040` | Tech Pulse stores/renders bounded metadata and optional permitted short summaries, not full article bodies. |
| `ICJ-041` | Tech Pulse visibly attributes the original source/canonical link. |
| `ICJ-042` | Tech Pulse does not require arbitrary remote article imagery/hotlinking. |
| `ICJ-043` | Feed deduplication uses source identity/canonical URL, not fuzzy-title merging alone. |
| `ICJ-044` | One Tech Pulse source failure does not invalidate successful independent sources. |
| `ICJ-045` | Remote provider/feed data is schema/size/type validated before persistence. |
| `ICJ-046` | Resend remains the Contact delivery provider behind `EmailDeliveryGateway`. |
| `ICJ-047` | Contact retries reuse the same stable provider idempotency identity for the same application operation. |
| `ICJ-048` | Provider acceptance is not described as guaranteed inbox delivery. |
| `ICJ-049` | Contact transient retries are bounded and only performed when safe/idempotent. |
| `ICJ-050` | V1.0 does not add a durable general email queue. |
| `ICJ-051` | Contact provider outage preserves visitor input and does not falsely report success. |
| `ICJ-052` | Supabase Auth email delivery is an operationally separate SMTP path from application Contact delivery. |
| `ICJ-053` | Security/Auth and Contact sender identities/configuration remain separable. |
| `ICJ-054` | Resend delivery webhooks are not required for V1.0 Contact correctness. |
| `ICJ-055` | Cloudflare Turnstile is the baseline `HumanVerificationGateway`, subject to DOC-47 feature policy. |
| `ICJ-056` | Turnstile tokens receive mandatory server-side Siteverify validation. |
| `ICJ-057` | Turnstile site key may be public; Turnstile secret remains server-only. |
| `ICJ-058` | Turnstile tokens are treated as short-lived/single-use and are refreshed after expiry/reuse. |
| `ICJ-059` | Turnstile verification checks configured hostname/action context where supported. |
| `ICJ-060` | Siteverify transient retries may use provider-supported idempotency identity. |
| `ICJ-061` | Human verification returns provider-neutral `VERIFIED/REJECTED/EXPIRED/UNAVAILABLE/MISCONFIGURED` outcomes. |
| `ICJ-062` | DOC-47, not the Turnstile adapter, owns fail-open/fail-closed policy for `UNAVAILABLE`. |
| `ICJ-063` | Human-verification failure preserves user input and remains accessible/recoverable. |
| `ICJ-064` | Turnstile production/non-production configurations are isolated. |
| `ICJ-065` | No general-purpose queue/worker fleet is introduced in V1.x. |
| `ICJ-066` | Stable Next.js `after()` may perform best-effort non-critical post-response refresh/work only. |
| `ICJ-067` | `after()` is never the sole correctness mechanism for Contact delivery, moderation audit, Arcade finalization or security mutations. |
| `ICJ-068` | Vercel Cron is the baseline scheduled-job provider while Vercel remains the deployment platform. |
| `ICJ-069` | Cron endpoints require `CRON_SECRET` Bearer verification and `no-store` behavior. |
| `ICJ-070` | Production cron is not assumed to run on preview deployments. |
| `ICJ-071` | Initial scheduled-job catalog is deliberately small: external refresh plus runtime cleanup. |
| `ICJ-072` | External refresh proceeds independently per provider/source; partial success is valid. |
| `ICJ-073` | Runtime cleanup is idempotent and follows DOC-44 retention ownership. |
| `ICJ-074` | DOC-46 introduces minimal server-only `job_leases` state for overlap protection. |
| `ICJ-075` | Scheduled jobs must acquire a lease; overlapping invocations exit safely. |
| `ICJ-076` | Per-cache refresh leases coordinate scheduled and request-triggered refresh. |
| `ICJ-077` | Portfolio correctness does not require high-frequency paid cron; daily schedule plus request-triggered SWR remains viable. |
| `ICJ-078` | Schedule profiles are centrally configured and may vary by deployment plan without changing product semantics. |
| `ICJ-079` | Cold external cache never blocks the professional-core page on synchronous provider fan-out. |
| `ICJ-080` | Any future Admin manual refresh reuses the same refresh services/leases and requires AAL2. |
| `ICJ-081` | Retries require transient failure, safe idempotency, provider permission and remaining time budget. |
| `ICJ-082` | Permanent/validation/configuration failures are not retried blindly. |
| `ICJ-083` | `Retry-After` and GitHub rate-reset guidance are respected. |
| `ICJ-084` | Background retries use bounded exponential backoff with jitter. |
| `ICJ-085` | V1.x uses pragmatic provider cooldown state instead of a distributed circuit-breaker platform. |
| `ICJ-086` | Successful/304 refresh clears provider failure/cooldown state. |
| `ICJ-087` | Every provider adapter has a finite timeout budget tuned in DOC-49. |
| `ICJ-088` | Webhook usage is chosen per integration rather than assumed globally. |
| `ICJ-089` | V1.4 GitHub baseline uses conditional scheduled polling; near-real-time webhooks are deferred. |
| `ICJ-090` | Future webhooks require signature verification, dedupe/idempotency, bounded bodies and safe processing. |
| `ICJ-091` | Provider features and secrets/jobs are release-gated through the Release Registry. |
| `ICJ-092` | Disabled future integrations do not become deployment prerequisites. |
| `ICJ-093` | Generic PR previews do not receive production integration secrets or execute production cron. |
| `ICJ-094` | Remote provider content is treated as untrusted input even when the provider is reputable. |
| `ICJ-095` | Remote HTML is not directly injected into Tech Pulse/GitHub UI. |
| `ICJ-096` | Every adapter enforces bounded response/item/redirect processing. |
| `ICJ-097` | Product analytics is disabled/no-op in V0/V1.0; feature code uses a provider-neutral wrapper and enabling a provider requires a separate privacy/provider decision. |
| `ICJ-098` | Sentry is the V0/V1.0 error-monitoring baseline behind centralized wrappers; integrations emit scrubbed normalized telemetry. |
| `ICJ-099` | Integration health includes refresh age, failures, stale reads, rate limits, delivery/verification outcomes and job outcomes. |
| `ICJ-100` | Dynamic OG generation is deterministic/cacheable where possible and always has a static fallback. |
| `ICJ-101` | RenderCV remains build/CI-time and is not moved into runtime scheduled jobs. |
| `ICJ-102` | Integration failure never justifies fake success or stronger freshness/delivery claims than the system knows. |
| `ICJ-103` | Provider SDKs are prohibited from feature/client components; adapters are server-only boundaries. |
| `ICJ-104` | DOC-46 implementation must pass the nine integration/cache/job gates before production. |

---

## Approval consequences

## 129. If DOC-46 is approved

Approval closes the baseline integration/caching/background-work architecture and gives downstream documents these fixed assumptions:

- DOC-47 can threat-model a known set of server-owned external adapters, configured sources, cron routes and verification boundaries;
- DOC-48 can wire domains/secrets/schedules knowing which integrations are required by each release/environment;
- DOC-49 can set concrete timeout/SLO/alert/cache-age thresholds without redesigning provider ownership;
- DOC-50 can build deterministic provider/cache/job failure tests from explicit contracts;
- DOC-51 can implement workflows/scripts without deciding whether cron/queues/provider polling architecture should change ad hoc.

The next canonical document is:

**DOC-47 — Security Architecture & Threat Model**.

---

## Current provider/framework reference validation

These references are implementation context, not higher authority than approved project decisions:

- Next.js Cache Components: <https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents>
- Next.js `use cache`: <https://nextjs.org/docs/app/api-reference/directives/use-cache>
- Next.js cache tags/revalidation: <https://nextjs.org/docs/app/getting-started/revalidating>
- Next.js `after()`: <https://nextjs.org/docs/app/api-reference/functions/after>
- GitHub REST API best practices: <https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api>
- GitHub REST API rate limits: <https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api>
- GitHub REST authentication: <https://docs.github.com/en/rest/authentication/authenticating-to-the-rest-api>
- Resend idempotency keys: <https://resend.com/changelog/idempotency-keys>
- Cloudflare Turnstile server-side validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Vercel Cron Jobs: <https://vercel.com/docs/cron-jobs>
- Vercel Cron management/security: <https://vercel.com/docs/cron-jobs/manage-cron-jobs>
- Vercel Cron usage/plan cadence: <https://vercel.com/docs/cron-jobs/usage-and-pricing>

Provider/framework behavior must be revalidated when implementation dependencies and deployment plans are pinned.

---

**End of DOC-46 — APPROVED**
