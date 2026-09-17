---
id: DOC-08
title: "Engineering Coverage Register & Technical Constraints"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-06
  - DOC-07
decision_families:
  - ENG
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-08 — Engineering Coverage Register & Technical Constraints

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

This is the anti-omission register for engineering concerns. It records what must be addressed and points to the approved canonical technical owners. Exact package/runtime versions may still be selected at V0 bootstrap, but provider and architectural baselines already closed by DOC-41–DOC-51 are no longer described as hypothetical.

## 2. Approved stack baseline

> **Platform scope:** The portfolio is a responsive **web application**. The current product scope does not include a native iOS or Android app. Desktop, mobile and tablet browsers are first-class targets. PWA/installability may be evaluated later as a web capability, but does not imply native-store delivery.

The approved V1.x technical baseline is:

- **Language:** TypeScript.
- **Web application:** React with Next.js.
- **Styling:** Tailwind/CSS variables/design tokens; avoid hardcoding design values in feature components.
- **Motion:** CSS for simple local transitions; Motion as primary React animation system; GSAP only if a documented prototype demonstrates a need.
- **Database/Auth/Storage:** Supabase/PostgreSQL with admin auth only, server-first runtime data access, RLS/grants/least privilege and controlled Storage only where a feature actually requires it.
- **Hosting:** Vercel managed deployment/runtime, with Cloudflare DNS-only authoritative DNS preferred and Vercel DNS acceptable as the simpler alternative.
- **Email:** Resend behind a server-side provider adapter with domain authentication and idempotent Contact delivery.
- **Product analytics:** disabled/no-op in V0/V1.0. Enabling a provider/event set later requires an explicit privacy/provider decision; feature code keeps a provider-neutral wrapper.
- **Error monitoring:** Sentry is the V0/V1.0 baseline behind centralized wrappers and strict scrubbing.
- **Testing:** Vitest + React Testing Library, Storybook isolated components, Playwright E2E/accessibility/visual testing, PostgreSQL/pgTAP, plus release-specific security/performance/resilience gates.
- **CI/CD:** GitHub Actions with FAST/STANDARD/DEEP quality layers, Vercel Preview/Production and serialized migration workflow.

Exact compatible package/runtime versions are pinned during V0 bootstrap and then governed through lockfiles and dependency policy. Provider implementation never overrides the product/security contracts in this package or their canonical downstream owners.

## 3. Architecture coverage matrix

| Concern | Current requirement/direction | Status owner |
|---|---|---|
| Frontend architecture | Server-render by default; deliberate client islands; feature/system boundaries. | DOC-41 / DOC-42 |
| Backend/API | Thin transports over application services/repositories; browser does not hold privileged provider secrets. | DOC-43 |
| Database | PostgreSQL runtime model for UGC/moderation/Arcade/admin/abuse state; professional canonical content remains repository-authored. | DOC-36 / DOC-44 |
| Migrations | Reproducible versioned Supabase/PostgreSQL migrations using expand → migrate → contract. | DOC-44 / DOC-51 |
| Indexes/constraints | Designed from access patterns and integrity, not added randomly after launch. | DOC-44 |
| Relations | Explicit ownership/cardinality and foreign keys where appropriate. | DOC-44 |
| File storage | Static professional media is repository/public asset driven; Sketch V1.x stores validated logical models and does not require Storage. Future buckets require explicit policy. | DOC-36 / DOC-44 |
| Caching | External GitHub/Tech Pulse data normalized into durable cache; route/data caching follows freshness and reliability classes. | DOC-46 / DOC-49 |
| Queues/background work | No queue baseline in V1.x; use synchronous work, `after()` only for best-effort post-response tasks and scheduled jobs for bounded periodic work. | DOC-46 |

## 4. Security coverage matrix

Must address explicitly:

- admin authentication and secure session handling;
- server-side authorization and RLS/least privilege;
- secret storage/rotation; service credentials never shipped to browser;
- input schema validation and request-size limits;
- SQL injection prevention through parameterized access/ORM patterns;
- XSS escaping/sanitization, especially UGC;
- CSRF/origin protection where cookie-based state-changing endpoints apply;
- SSRF prevention for any server-side URL fetches;
- mass-assignment/IDOR prevention;
- rate limits/Turnstile or equivalent anti-bot controls for public writes;
- CSP, HSTS, X-Content-Type-Options and appropriate Referrer Policy;
- temporary HMAC/pseudonymous network identifiers rather than unnecessary raw IP retention where workable;
- moderation/report abuse controls;
- dependency/supply-chain scanning;
- audit logging for privileged actions.

The canonical threat model and security control ownership are in DOC-47; DOC-50/51 define verification and CI enforcement.

## 5. Infrastructure/operations coverage

Must evaluate:

- dev, preview/staging-equivalent and production separation;
- DNS/domain and managed TLS;
- CDN/edge behavior;
- firewall/WAF/rate-limiting capabilities appropriate to provider;
- backups and restore tests for persistent DB/storage once public UGC exists;
- redundancy and provider SPOFs proportional to actual traffic/risk;
- RPO/RTO for community/contact data;
- horizontal/vertical scaling only from measurements;
- environment secrets and rotation;
- rollback path for deployments and migrations;
- cost budgets/alerts before infrastructure becomes complex.

A traditional dedicated load balancer/server fleet is not assumed for a managed serverless/edge deployment; the concern is explicitly evaluated rather than cargo-cult implemented.

## 6. Environment model

Minimum conceptual environments:

- **Development:** local/dev data, non-production credentials.
- **Preview:** per-PR/deployment preview; must not accidentally write to production UGC or use production secrets without explicit policy.
- **Production:** public data and privileged credentials with restricted access.

A dedicated long-lived staging environment is optional if preview + isolated test data meets needs; the decision must be explicit.

## 7. CI/CD and version-control coverage

Before public launch, pipelines should include applicable:

- install with lockfile integrity;
- format/lint/typecheck;
- unit/component tests;
- integration tests;
- production build;
- E2E critical smoke paths;
- dependency/security scanning;
- migration checks;
- RenderCV validation/build for both languages;
- optional accessibility/performance regression gates as tooling matures;
- deploy/preview and post-deploy smoke/rollback capability.

## 8. Testing coverage

Required categories:

- unit tests for pure business/validation/state logic;
- component tests for focus/input/state contracts;
- integration tests for DB/auth/email/cache/moderation/score submission;
- E2E for critical public/admin journeys;
- accessibility automated + manual keyboard/screen-reader review;
- load/performance tests for public write endpoints/leaderboards when traffic justifies;
- security tests for authorization, abuse and malicious inputs;
- visual regression for signature component states;
- game/drawing specialized tests.

## 9. Observability coverage

Production needs enough signal to diagnose:

- route/server exceptions;
- contact email failures;
- moderation/public-write failures and rate-limit patterns;
- GitHub/news refresh failures;
- score validation errors;
- DB/storage failures;
- deployment/version context.

Use structured logs/metrics/errors without storing message bodies, unpublished sketches, raw terminal inputs or unnecessary PII. Distributed tracing is evaluated only if architecture complexity warrants it.

## 10. Payments and commerce assessment

**Current status: NOT APPLICABLE.** The portfolio has no payment, subscription, purchase, refund or settlement flows in V1.x. Therefore payment webhooks, reconciliation and refunds are not implemented. The engineering checklist explicitly records this as N/A instead of silently forgetting it. If commerce ever enters scope, it requires a new threat/data/legal architecture review.

## 11. Email/deliverability assessment

Contact email is applicable. Before public production delivery, configure/verify sending-domain SPF, DKIM and DMARC strategy, bounce/error handling and provider credentials. Do not expose provider API keys client-side.

## 12. Mobile-store assessment

Native mobile certificates, provisioning profiles, App Store/Play Store signing/review and mobile build numbers are **NOT APPLICABLE** to the current web portfolio. PWA/installability may be evaluated separately but does not turn the project into a native store-delivered app.

## 13. Privacy/data lifecycle assessment

Must explicitly define retention/deletion for:

- contact submissions or delivery metadata;
- Guestbook/sketch submissions and moderation records;
- reports/bans/pseudonymous abuse identifiers;
- leaderboard nickname/score/session records;
- admin audit logs;
- local visitor preferences/achievements.

Retention, accountless self-deletion capability, hard-delete/anonymization behavior and operational evidence windows are now defined in DOC-44/DOC-47. “Keep forever” is not a default.

## 14. Browser/device compatibility

Target current mainstream evergreen browsers. Gamepad, View Transitions and advanced glass/refraction remain progressive enhancement. Core routes must not depend on a single browser API.

## 15. Dependency/change management

Use lockfiles, automated dependency update proposals where useful, CVE/SCA scanning, changelog/release review and explicit upgrades for framework/runtime/provider API changes. Avoid unbounded “latest” dependencies in reproducible CI.

## 16. Engineering decisions

- **ENG-001** The architecture/provider baseline is approved in DOC-41–DOC-51; V0 bootstrap pins exact compatible versions and validates prototype gates without reopening the product architecture by default.
- **ENG-002** Managed/simple infrastructure is preferred until evidence requires additional moving parts.
- **ENG-003** Payments and native-store delivery are explicitly N/A for V1.x.
- **ENG-004** Contact email deliverability and domain authentication are applicable release concerns.
- **ENG-005** Preview environments must not casually share production write credentials/data.
- **ENG-006** Heavy observability/queue/cache infrastructure is introduced from concrete need, not checklist theater.
- **ENG-007** Security/testing/backup concerns become stronger as community persistence launches.

## 17. Full engineering completeness register

This matrix mirrors the project's explicit engineering checklist so a concern cannot disappear merely because it is deferred or not applicable.

| Concern | Current classification | Where it must be closed |
|---|---|---|
| Functional requirements | Applicable | DOC-06 + feature specs/tests |
| Non-functional requirements | Applicable | DOC-07 + quality gates |
| Technical requirements | Applicable | DOC-08 + DOC-41–DOC-51 |
| Language/framework | Baseline approved; exact compatible versions pinned at V0 bootstrap | DOC-41 / DOC-42 / DOC-51 |
| Frontend architecture | Applicable | DOC-42 |
| Backend architecture | Applicable for writes/integrations/admin | DOC-43 |
| API design/versioning/errors | Applicable | DOC-43 |
| DB schema | Applicable from persistent features | DOC-44 |
| Migrations | Applicable | DOC-44 / DOC-51 |
| Indexes | Applicable | DOC-44 / DOC-49 |
| Relations/cardinality/constraints | Applicable | DOC-44 |
| Authentication | Admin only in V1.x | DOC-45 |
| Authorization | Applicable, server/data enforced | DOC-43 / DOC-44 / DOC-45 |
| Sessions | Applicable to admin auth | DOC-45 |
| Password recovery | Applicable to approved password + TOTP admin auth | DOC-45 |
| Secure storage | Applicable to secrets/admin/session/storage credentials | DOC-45 / DOC-47 / DOC-48 |
| Credentials/secrets | Applicable | DOC-47 / DOC-48 / DOC-51 |
| Encryption in transit | Applicable: HTTPS/TLS | DOC-47 / DOC-48 |
| Encryption at rest | Provider capability + sensitive-data review | DOC-44 / DOC-47 / DOC-48 |
| Application-level encryption | Conditional, only if data sensitivity justifies | DOC-47 / ADR if introduced |
| Input validation | Applicable to all public/admin writes | DOC-43 / DOC-47 |
| SQL injection | Applicable | DOC-43 / DOC-44 / DOC-50 |
| XSS | Applicable, especially UGC | DOC-42 / DOC-47 / DOC-50 |
| CSRF | Applicable where state-changing authenticated/cookie contexts require it | DOC-43 / DOC-45 / DOC-47 |
| SSRF | Applicable to controlled external fetch integrations | DOC-46 / DOC-47 |
| IDOR/mass assignment | Applicable | DOC-43 / DOC-45 / DOC-47 / DOC-50 |
| Cloud/servers | Applicable; managed-first | DOC-48 |
| Network topology | Applicable proportionally | DOC-47 / DOC-48 |
| DNS/domain | Applicable | Production readiness |
| SSL/TLS certificates | Applicable, managed preferred | Production readiness |
| Load balancing | Provider-managed in baseline; no dedicated LB | DOC-48 |
| Firewall/WAF | Provider/platform controls + app rate limiting | DOC-47 / DOC-48 |
| Backups | Applicable once persistent production data exists | DOC-44 / DOC-48 / DOC-49 |
| Restore drills | Applicable before community data is relied on | DOC-48 / DOC-50 |
| Redundancy | Risk/traffic-based | DOC-48 / DOC-49 |
| Disaster recovery | RPO/RTO/runbooks required as persistence grows | DOC-48 / DOC-49 |
| Horizontal scaling | Metrics-driven, not preemptive | DOC-48 / DOC-49 |
| Vertical scaling | Metrics-driven | DOC-48 / DOC-49 |
| Cache/CDN | Applicable | DOC-46 / DOC-48 / DOC-49 |
| Queues | Not baseline; introduce only from evidence/ADR | DOC-46 |
| Background jobs | Applicable only for bounded scheduled/best-effort work | DOC-46 / DOC-48 |
| DEV environment | Required | V0 |
| Preview environment | Required | V0 |
| Dedicated staging | Conditional | Add if preview isolation is insufficient |
| Production environment | Required | V0/V1.0 |
| Environment secrets | Required and isolated | V0 |
| CI | Required | V0 |
| CD/deployment automation | Required at useful baseline | V0/V1.0 |
| Version control | Required | Git repository |
| Branch strategy | Short-lived branches/mainline direction | DOC-18 |
| Unit tests | Required where logic merits | DOC-50 |
| Component tests | Required for stateful UI primitives | DOC-27 / DOC-50 |
| Integration tests | Required for DB/auth/email/integrations | DOC-50 |
| E2E tests | Required for critical journeys | DOC-50 |
| Load tests | Conditional before/after high-traffic public write endpoints | DOC-49 / DOC-50 |
| Accessibility tests | Required automated + manual | DOC-11 / quality plan |
| Security tests | Required for public writes/admin/authz | DOC-47 / DOC-50 |
| Visual regression | Required for selected signature surfaces/states | DOC-27 / DOC-50 |
| Logging | Required, structured/redacted | DOC-49 |
| Monitoring | Required for core availability/failures; Sentry baseline | DOC-49 |
| Metrics | Required when actionable; product analytics remains disabled/no-op until explicitly enabled | DOC-17 / DOC-49 |
| Alerts | Required for meaningful production failures, not alert spam | DOC-49 |
| Tracing | Conditional on complexity | DOC-49 |
| Error reporting | Required; Sentry baseline behind wrapper | DOC-49 |
| RCA/postmortem | Required for material incidents as product matures | DOC-49 |
| Payments | **N/A current scope** | Requires new ADR if introduced |
| Payment webhooks | **N/A current scope** | Same |
| Payment idempotency | **N/A current scope** | Same |
| Payment reconciliation | **N/A current scope** | Same |
| Refunds | **N/A current scope** | Same |
| Failed payment states | **N/A current scope** | Same |
| Non-payment webhook validation | Conditional if provider webhooks are added | DOC-43 / DOC-46 / DOC-47 |
| General idempotency | Applicable to retryable side effects/submissions where needed | DOC-43 / DOC-44 / DOC-46 |
| Email provider | Applicable; Resend baseline | DOC-16 / DOC-43 / DOC-46 |
| SPF | Applicable before production email | DOC-16 / production readiness |
| DKIM | Applicable before production email | DOC-16 / production readiness |
| DMARC | Applicable before production email | DOC-16 / production readiness |
| Native mobile certificates | **N/A web portfolio** | Reassess only if native app enters scope |
| Provisioning profiles | **N/A web portfolio** | Same |
| Native app signing | **N/A web portfolio** | Same |
| App Store / Play Store review | **N/A web portfolio** | Same |
| Native build numbers | **N/A web portfolio** | Same |
| Web builds/versioning | Applicable | DOC-51 |
| Privacy policy | Required before public UGC/data collection; product/data contracts already define minimization/retention | DOC-12 / DOC-13 / DOC-44 + pre-launch legal readiness |
| Terms & conditions | Evaluate before Community launch based on UGC/legal need | DOC-13 + pre-launch legal readiness |
| UGC/community policy | Applicable before public community launch | DOC-13 + V1.2 readiness |
| Soft delete | Conditional by record/data type | DOC-44 |
| Hard delete/anonymization | Applicable to data lifecycle decisions | DOC-13 / DOC-44 / DOC-47 |
| Data retention | Applicable | DOC-44 / DOC-49 |
| Data export/access requests | Evaluate before Community production based on stored data/applicable law | DOC-13 / DOC-44 + pre-launch legal readiness |
| Performance budgets | Required | DOC-07 / DOC-49 / DOC-50 |
| Device/browser compatibility | Required | DOC-28 / DOC-50 |
| Touch UX | Required | DOC-23/DOC-28 |
| Gamepad compatibility | Progressive enhancement, applicable where documented | Input/Arcade tests |
| Analytics | Capability exists behind wrapper; disabled/no-op in V0/V1.0 until separately approved | DOC-17 / DOC-49 |
| Analytics consent/cookies | Not applicable while analytics is disabled; must be reevaluated before enabling a provider | DOC-17 / privacy readiness |
| Dependency updates | Required governance | DOC-18 / DOC-51 |
| Third-party vulnerabilities | Required scanning/review | DOC-47 / DOC-50 / DOC-51 |
| SBOM | Optional initially; evaluate as dependency surface grows | DOC-47 / DOC-51 |
| Infrastructure cost/FinOps | Required lightweight budget awareness | DOC-48 / DOC-49 |
| Performance regressions | Required detection on critical paths/signature UI | DOC-49 / DOC-50 |
| Bugs/hotfix workflow | Required | DOC-18 / DOC-51 |
| OS/browser changes | Continuous watch through testing/upgrade cadence | DOC-50 / DOC-51 |
| External API/provider changes | Adapter/cache/tests + dependency watch | DOC-46 / DOC-50 / DOC-51 |
| User stories | Required | DOC-05 |
| Issues | Required for implementation work | DOC-18 / DOC-51 |
| Milestones | Required, aligned to releases | DOC-18 / DOC-51 |
| Roadmap | Required | DOC-02 / DOC-18 / DOC-51 |
| Labels | Curated, not overgrown | DOC-18 / DOC-51 |
| Tags/releases | Applicable to meaningful releases | DOC-18 / DOC-51 |
| GitFlow | Classic long-lived GitFlow **not preferred** | DOC-18 |
| Automation | Required where it reduces repeatable manual risk | DOC-37 / DOC-46 / DOC-51 |
| Onboarding (developer) | Required via README/docs/commands/local operator instructions | DOC-19 + repo README |
| Onboarding (visitor) | Applicable, contextual and dismissible | DOC-31 / interface docs |

The register is intentionally exhaustive. A row marked N/A is still considered reviewed; changing that classification requires scope/architecture review.

