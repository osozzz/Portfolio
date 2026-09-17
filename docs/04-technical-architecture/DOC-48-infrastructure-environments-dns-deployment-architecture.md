---
id: DOC-48
title: "Infrastructure, Environments, DNS & Deployment Architecture"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Infrastructure, Environments, DNS & Deployment"
canonical_domain_owner: infrastructure_architecture

depends_on:
  - DOC-00
  - DOC-02
  - DOC-07
  - DOC-08
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-18
  - DOC-19
  - DOC-31
  - DOC-32
  - DOC-36
  - DOC-37
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - DOC-45
  - DOC-46
  - DOC-47
  - ADR-001
  - ADR-002

decision_families:
  - INF
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-48 — Infrastructure, Environments, DNS & Deployment Architecture

> **Status:** APPROVED.  
> **Role:** Define where the portfolio runs, how environments are isolated, how `alejosorno.dev` reaches the application, how production is deployed and recovered, how secrets/configuration cross environment boundaries, and which infrastructure responsibilities are intentionally delegated to managed providers.

---

## 1. Purpose

The portfolio is deliberately designed as a managed, serverless-first web system rather than a self-hosted cluster. DOC-41 selected Next.js/Vercel and Supabase as the main runtime platforms; DOC-44 through DOC-47 defined data, identity, integrations and security. DOC-48 turns those decisions into a concrete deployment topology.

This document owns:

- production and non-production environment topology;
- Vercel project/environment strategy;
- Supabase local, preview/staging and production topology;
- cloud-region placement and latency rules;
- canonical domains, redirects, DNS authority and TLS;
- environment-variable and secret boundaries;
- deployment sequencing and promotion rules;
- database migration deployment safety;
- infrastructure-level network exposure;
- provider firewall/WAF posture;
- backups and recovery responsibilities;
- rollback versus database recovery semantics;
- scheduled-job placement;
- operational access to provider dashboards;
- production bootstrap and launch sequence;
- infrastructure inventory and configuration drift controls;
- failure-domain and disaster-recovery boundaries.

It intentionally does **not** finalize:

- exact SLO/SLI targets, alert thresholds, synthetic-monitor cadence or telemetry retention — DOC-49;
- the complete test matrix and release-validation suites — DOC-50;
- exact GitHub Actions workflows, branch protection, dependency automation or release scripts — DOC-51;
- provider billing budgets and subscription purchasing decisions — tracked separately from architecture, although this document identifies features that are plan-dependent.

---

## 2. Infrastructure north star

> **Use managed infrastructure for undifferentiated operations, but keep deployment state reproducible enough that the portfolio is not trapped inside dashboard-only knowledge.**

The portfolio should not require Alejandro to operate Linux servers, Kubernetes, reverse proxies, certificate renewal daemons, database replicas or queues simply to keep a personal site online.

At the same time, "managed" must not mean "mysterious". The repository must retain the migrations, provider configuration expectations, environment inventory and recovery procedures needed to recreate the system.

The intended balance is:

```text
Managed edge/CDN/TLS/compute     → Vercel
Managed PostgreSQL/Auth          → Supabase
Email delivery                   → provider adapter (baseline Resend)
Human verification              → provider adapter (baseline Turnstile)
Source / CI                      → GitHub

Canonical architecture/config    → repository documentation + code
Database structure               → versioned migrations
Runtime professional content     → repository
Secrets                          → provider secret stores, never Git
```

---

## 3. Infrastructure principles

1. **Production is boring on purpose.** Infrastructure should be easier to recover than the UI is to design.
2. **No self-hosted servers in V1.x.** There is no VPS, Kubernetes cluster, Nginx host or manually patched database VM.
3. **The professional core is deployable without runtime providers.** Projects, experience, CV and authored content remain repository/build-backed.
4. **Runtime providers fail independently.** Supabase, Resend, GitHub or Turnstile outages must not erase the professional portfolio shell.
5. **Environment isolation is stronger than naming conventions.** Preview must never receive production secrets or production data merely because both run the same commit.
6. **Schema changes are versioned.** Production database edits are migrations, not undocumented dashboard clicks.
7. **Secrets are scoped by environment and purpose.** A preview token cannot mutate production.
8. **DNS and domain ownership are security assets.** Registrar/DNS accounts require MFA and recovery procedures.
9. **TLS is mandatory everywhere.** HTTP exists only as a redirect path controlled by the platform.
10. **Static/global work stays global; stateful compute stays near data.** Function placement follows the database, not the visitor's animation frame.
11. **Deployment rollback and data recovery are different operations.** Vercel rollback does not roll back PostgreSQL.
12. **Database deploys use expand/contract compatibility.** App/database race ordering must not be able to destroy production.
13. **Preview environments contain synthetic/seed data by default.** Production copies are not casually cloned into PRs.
14. **Infrastructure correctness does not depend on premium-only conveniences.** Paid features may improve freshness, isolation or recovery, but the architecture documents the fallback.
15. **No multi-cloud theater.** A personal portfolio does not need active-active application hosting across providers unless evidence later justifies it.

---

## 4. System deployment context

```text
                              Internet
                                 │
                                 ▼
                       Authoritative DNS
                                 │
                        alejosorno.dev
                                 │
                                 ▼
                       Vercel Global Edge
                  CDN / TLS / request routing
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
          Static / cached output         Node.js Functions
                                                │
                                                │ region aligned
                                                ▼
                                      Supabase project
                               PostgreSQL / Auth / Data API
                                                │
                         ┌──────────────────────┼─────────────────────┐
                         ▼                      ▼                     ▼
                      Resend                 GitHub             Turnstile
                    (outbound)            / feeds              verification
```

The browser never receives privileged Supabase credentials, email provider secrets, cron secrets or database connection strings.

---

## 5. Environment taxonomy

The architecture recognizes four environment classes, but only three must necessarily exist as persistent remote infrastructure.

| Environment | Purpose | Persistence | Production data | Publicly trusted? |
|---|---|---:|---:|---:|
| Local | development and tests | local | no | no |
| Preview | per-branch/PR validation | ephemeral | no | no |
| Staging | optional integration/release candidate | persistent optional | no | no |
| Production | public portfolio | persistent | yes | yes |

`development`, `preview`, `staging` and `production` are semantic classes. They must not be collapsed into one database differentiated only by a column.

---

## 6. Local development

Local development is the default engineering environment.

Baseline:

```text
Next.js local process
Supabase CLI local stack
local Postgres migrations
seeded synthetic runtime data
provider fakes/sandboxes where practical
local .env.local generated from documented template
```

The local environment must support the majority of feature development without network access to production resources.

## 6.1 Local database

The repository owns:

```text
supabase/
├── config.toml
├── migrations/
├── seed.sql
└── tests/
```

A clean `supabase start` + migration application + seed should create a usable local backend from scratch.

## 6.2 Local provider strategy

Provider behavior falls into three classes:

- **fake/local adapter** — deterministic tests and normal feature work;
- **sandbox/test credential** — integration verification;
- **real production provider** — never the default local path.

A developer running the site locally must not accidentally send real Contact emails, publish production data or consume production admin sessions.

---

## 7. Vercel environment model

Vercel supplies the hosting/deployment plane for the Next.js application.

The architecture maps its default environment classes as follows:

```text
Local       → local development
Preview     → branch / pull-request deployment
Production  → canonical public deployment
```

A custom persistent `staging` environment is optional and only introduced if release behavior warrants its operational cost/plan dependency.

## 7.1 Preview deployments

Every pull request should produce a Vercel Preview deployment after required CI checks reach the appropriate stage.

Preview deployments exist to validate:

- responsive UI on real HTTPS;
- routing and intercepted routes;
- server rendering;
- provider integration against non-production credentials;
- database migrations against isolated/non-production schema;
- CSP and browser headers;
- OG/social output;
- accessibility/manual QA.

Preview URLs are **not** assumed private merely because they are difficult to guess.

Therefore Preview must contain:

- no production service secrets;
- no production Admin identity;
- no production runtime data;
- `noindex` behavior;
- environment-identifying banner/metadata where operationally useful;
- deployment protection if the selected Vercel plan provides it, as defense in depth rather than a data-boundary substitute.

---

## 8. Supabase environment model

## 8.1 Production

Production uses one dedicated Supabase project/production branch.

It contains only runtime data approved by DOC-44:

- community submissions;
- reports/moderation state;
- Arcade sessions/scores;
- audit events;
- abuse-control state;
- Contact delivery metadata;
- Admin Auth/account state.

It does not become the canonical store for Projects/Experience/CV content.

## 8.2 Preview branches — preferred model

When Supabase Branching is enabled, each relevant pull request receives an isolated preview branch paired with the Vercel Preview deployment.

Branch properties:

- separate database instance/schema state;
- separate API credentials;
- separate Auth configuration/state;
- isolated Storage namespace when Storage is used;
- no production data/storage copied by default;
- deterministic seed data;
- branch deleted after PR close/merge unless intentionally persistent.

This is the preferred V1.x workflow because it allows schema-changing pull requests to be tested end-to-end without sharing mutable state across PRs.

## 8.3 Branching fallback

Supabase Branching is plan-dependent. Infrastructure correctness must still have a fallback.

If preview branches are unavailable:

1. schema and database tests run against a fresh local/CI Supabase stack;
2. Vercel Preview builds run with no production credentials;
3. DB-dependent preview behavior uses a dedicated non-production Supabase project only when necessary;
4. schema-changing PRs are serialized or tested locally so two branches do not fight over one shared remote schema;
5. production is never used as a preview backend.

A shared remote staging project is a compromise, not the canonical ideal.

---

## 9. Persistent staging — optional

A long-lived staging environment is **not required on day one**.

Introduce it only when one or more become true:

- Admin/community features need repeated human QA against persistent state;
- provider integrations require stable callback URLs;
- release candidates need soak time independent of PR lifetime;
- migration sequences need realistic multi-release rehearsal;
- a second contributor needs a stable integration target.

If created:

```text
staging.alejosorno.dev
```

may be used as a stable alias, subject to:

- noindex;
- deployment protection/authentication where available;
- synthetic data only;
- separate secrets;
- separate Supabase persistent branch/project;
- no production email recipients by default.

Staging must never become a forgotten semi-production environment with stale credentials.

---

## 10. Canonical production domains

The public canonical origin is:

```text
https://alejosorno.dev
```

The canonical redirect origin is:

```text
https://www.alejosorno.dev
    → 308 → https://alejosorno.dev
```

The apex domain is canonical for:

- SEO canonical URLs;
- Open Graph URLs;
- sitemap URLs;
- CV links;
- Contact links;
- Web App Manifest if one is later introduced.

Admin remains route-based:

```text
https://alejosorno.dev/admin
```

There is no `admin.alejosorno.dev` baseline because a subdomain adds certificate/DNS/cookie complexity without creating a security boundary.

---

## 11. Registrar versus authoritative DNS

Domain registration and DNS authority are deliberately treated as separate responsibilities.

The registrar may be any reputable provider selected for cost/support. The architecture does not require the registrar to host DNS.

## 11.1 Recommended DNS authority

Preferred baseline:

> **Cloudflare authoritative DNS, DNS-only for Vercel application records.**

Reasons:

- registrar independence;
- strong DNS management and DNSSEC support;
- convenient management of TXT/CNAME records for email/providers;
- same organization can host Turnstile configuration without making Turnstile depend on proxying site traffic;
- avoids adding a second CDN/proxy layer in front of Vercel by default.

For application records pointing to Vercel, Cloudflare proxying (`orange cloud`) remains **off** unless a later ADR deliberately introduces it.

Why:

```text
Browser
→ Cloudflare proxy
→ Vercel edge
```

would introduce another cache/WAF/TLS layer, complicate debugging, client IP semantics, cache invalidation and incident ownership without a demonstrated requirement.

## 11.2 Acceptable alternative

Vercel DNS is also acceptable if domain operations are simpler there. Choosing between Cloudflare DNS and Vercel DNS is an operational choice, not a change to application architecture, provided the DNS/security requirements in this document remain satisfied.

---

## 12. DNS record model

Exact values must be obtained from the active provider during setup; documentation must not freeze stale IPs/CNAME targets as architectural constants.

Conceptual zone:

```text
alejosorno.dev.            A/ALIAS → Vercel-required apex target
www.alejosorno.dev.        CNAME   → Vercel-required target

## Email/provider verification
<dkim selectors>           CNAME/TXT → email provider
alejosorno.dev.            TXT       → SPF/verification as required
_dmarc.alejosorno.dev.     TXT       → DMARC policy

## Optional provider verification
<provider-specific>        TXT/CNAME → documented provider target
```

Rules:

- never copy a DNS target from an old tutorial;
- inspect the Vercel domain configuration at setup time;
- changes to SPF must preserve the one-record SPF rule;
- DMARC rollout should be deliberate;
- DKIM selectors belong to the sending provider;
- DNS records are documented in an infrastructure inventory without publishing secret tokens unnecessarily.

---

## 13. `.dev` and HTTPS

`alejosorno.dev` is a `.dev` domain and must be treated as HTTPS-only from inception.

Production must never depend on "HTTP first, certificate later" testing.

The launch order is:

```text
Vercel project ready
→ domain added
→ DNS verified
→ TLS certificate issued
→ HTTPS verified
→ production traffic announced
```

---

## 14. TLS certificate management

Vercel is responsible for managed certificate provisioning and renewal for the application domain.

The project does **not** manually manage PEM files, Certbot or certificate renewal jobs.

Requirements:

- certificate issuance verified after domain setup;
- renewal remains under platform management;
- HTTPS redirect verified;
- TLS failure is part of the launch checklist;
- certificates are not copied into repository secrets.

## 14.1 HSTS

HSTS is enabled at the application/security-header layer after HTTPS is verified consistently.

Rollout:

1. start with a safe `max-age`;
2. confirm every intended subdomain is HTTPS-ready;
3. consider `includeSubDomains` only when subdomain inventory is controlled;
4. `preload` is **not** enabled casually because removal/recovery is intentionally slow.

DOC-47 remains the security-policy owner for the exact header posture.

---

## 15. DNSSEC and domain account security

Where the selected DNS/registrar supports it safely:

- enable DNSSEC;
- enable MFA on registrar and DNS accounts;
- store recovery codes offline;
- enable domain auto-renew;
- keep billing method valid;
- enable registrar/domain lock;
- restrict account recovery email/phone access;
- avoid shared credentials.

Domain ownership is a Tier-0 asset. A compromised DNS account can defeat otherwise correct application security.

---

## 16. Email DNS separation

Contact delivery and Supabase Auth recovery may use the same email delivery provider but they are separate logical channels.

Recommended sending-domain strategy:

```text
public identity / links:       alejosorno.dev
transactional sending domain:  mail.alejosorno.dev  (or another documented subdomain)
```

The exact sender address is decided during email setup, but production requires:

- SPF alignment;
- DKIM verification;
- DMARC record/policy;
- tested From/Reply-To behavior;
- separation between visitor Reply-To and provider-authenticated From domain;
- no production credentials in Preview.

DOC-16/DOC-46 own application/email behavior; DOC-48 owns DNS deployment of the required records.

---

## 17. Region strategy

Static assets and cached output are globally distributed by Vercel. Stateful server functions should run close to the authoritative data source.

The guiding rule is:

> **Choose the Supabase production region first from measured audience/data needs, then place database-intensive Vercel compute in the closest compatible Vercel region.**

## 17.1 Candidate pairing

Two sensible candidates for the expected Colombia + international audience are evaluated before production data exists:

```text
Candidate A
Supabase: us-east-1 (North Virginia)
Vercel:   iad1

Candidate B
Supabase: sa-east-1 (São Paulo)
Vercel:   gru1
```

DOC-48 does **not** pretend geography alone answers latency. Before production launch, benchmark representative flows from Colombia and at least one international location.

Unless measurements materially favor another pairing, the initial baseline candidate is:

```text
Supabase production: us-east-1
Vercel stateful compute: iad1
```

because it aligns with Vercel's default serverless region and provides a broadly connected global location. The decision must be finalized before meaningful production runtime data accumulates because database region migration is operationally significant.

## 17.2 Region benchmark gate

Measure at minimum:

- Home/project SSR path with no DB dependency;
- Guestbook list;
- Guestbook submit;
- Admin moderation list/action;
- Arcade finalize;
- Auth login/MFA round trips.

Prefer end-to-end p50/p95 observation over synthetic ping alone.

---

## 18. Function placement

The default is one primary Vercel function region aligned with Supabase.

Do not deploy the same stateful mutation indiscriminately to many regions merely because multi-region sounds faster.

Benefits of a single data-near region:

- lower DB latency;
- simpler consistency semantics;
- simpler abuse/idempotency behavior;
- fewer cross-region connections;
- lower operational complexity.

Static/cached content remains global through the edge/CDN.

A function may intentionally run elsewhere only when its dependency is elsewhere and the reason is documented.

---

## 19. Runtime classes

DOC-41 already selected Node.js as the default runtime. Infrastructure reinforces:

```text
Node.js Functions → default server execution
Edge runtime      → exception requiring measured justification
Static/CDN        → preferred for authored/public read content
```

Edge is not used merely to label architecture "global".

---

## 20. Vercel project topology

Baseline: **one Vercel project** for the portfolio application.

Do not create separate Vercel projects for Home, Admin, Arcade or CV.

Reasons:

- one deployment graph;
- shared canonical domain;
- route-level code splitting already provides workload separation;
- consistent environment variables;
- simpler preview deployments;
- simpler rollback.

A second project requires a material deployment/security need, not organizational aesthetics.

---

## 21. Supabase project topology

Baseline production topology:

```text
Supabase organization
└── portfolio-production project
    └── production branch/project data
```

Development uses local CLI. Preview uses preview branches when available.

Do **not** create a separate Supabase project for each feature.

Runtime domains are isolated by schema/table/service boundaries, permissions and application services rather than by multiplying projects.

---

## 22. Production data is never a development fixture

A preview/staging environment may use realistic **shape**, but not production visitor data.

Seed data may include:

- fabricated guestbook submissions;
- fabricated sketches;
- fabricated reports;
- known Arcade scores;
- fake admin account(s) scoped to non-prod;
- fake provider responses.

It must not include copied:

- visitor emails;
- production request fingerprints;
- moderation history containing sensitive context;
- Auth secrets/tokens;
- raw production database dumps.

---

## 23. Environment variables taxonomy

Variables are classified by both secrecy and environment.

## 23.1 Public configuration

Safe for the browser only when intentionally prefixed/exposed:

```text
NEXT_PUBLIC_SITE_ORIGIN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
NEXT_PUBLIC_ANALYTICS_ID   (if applicable)
```

The existence of `NEXT_PUBLIC_` is a security review event: anything with that prefix is treated as public.

## 23.2 Server secrets

Examples:

```text
SUPABASE_SECRET_KEY
RESEND_API_KEY
TURNSTILE_SECRET_KEY
CRON_SECRET
ABUSE_HMAC_KEY_V1
REQUEST_FINGERPRINT_HMAC_KEY_V1
GITHUB_READ_TOKEN          (if used)
SENTRY_AUTH_TOKEN          (build/CI only where possible)
```

Never:

- import into Client Components;
- expose through error payloads;
- serialize into page data;
- echo in logs;
- include in `.env.example` values;
- reuse between Preview and Production.

## 23.3 Build-only credentials

A secret needed by CI/build should not automatically become a runtime function environment variable.

Examples may include source-map upload tokens or deployment automation credentials.

---

## 24. Environment-variable ownership

Each variable requires an inventory entry:

```yaml
name: RESEND_API_KEY
classification: secret
consumer: server-runtime
provider: Resend
environments:
  local: test/sandbox
  preview: test/sandbox
  production: production
rotation: provider-managed-manual
owner: project-owner
```

The inventory lives in repository documentation without the secret value.

Unknown environment variables found only in provider dashboards are configuration drift.

---

## 25. Secret storage

Production secrets are stored in the managed secret/environment stores of Vercel/Supabase/provider dashboards as appropriate.

Rules:

- `.env.local` is gitignored;
- `.env.example` contains names and dummy placeholders only;
- screenshots/tutorials must not expose real values;
- secrets are not placed in Markdown docs;
- GitHub Actions receives only the minimum credentials required for a workflow;
- provider account API tokens use least privilege;
- old credentials are revoked after rotation rather than left active "just in case".

---

## 26. Secret environment isolation

Production and Preview use different credentials whenever the provider permits it.

At minimum separate:

- Supabase project/branch keys;
- email API key or sending behavior;
- Turnstile secret/site configuration where useful;
- abuse-HMAC keys;
- cron secret;
- Admin Auth users;
- OAuth/provider callback configuration.

Preview must not be able to accidentally write to production through a copied secret.

---

## 27. Secret rotation

Secrets are rotated when:

- suspected exposed;
- collaborator access changes;
- provider reports compromise;
- repository secret scanning detects a value;
- a defined periodic policy later requires it;
- cryptographic abuse-key rotation is intentionally performed.

Rotation procedure should support overlap only where the protocol requires verification of old values. Long-lived "v1" and "v2" abuse HMAC keys follow DOC-47's versioned design.

---

## 28. Deployment source of truth

Production application deployments originate from the Git repository.

No production fix should exist only as a manual change in the Vercel dashboard if it can be represented in code/configuration.

Acceptable dashboard-managed state includes:

- secrets;
- domain ownership;
- provider plan settings;
- managed platform features that have no repository representation.

Every such item belongs in the infrastructure inventory/runbook.

---

## 29. Production branch

`main` is the production source branch.

Conceptual flow:

```text
feature branch
      ↓
Pull Request
      ↓
CI + Preview + review
      ↓
merge main
      ↓
production deployment
```

Direct unreviewed pushes to production should be prevented by the GitHub governance implemented in DOC-51.

---

## 30. Deployment pipeline responsibilities

A production deployment must validate, at minimum:

1. repository integrity;
2. dependency installation from lockfile;
3. content schema validation;
4. bilingual content checks;
5. RenderCV validation/build when affected;
6. TypeScript/lint/static checks;
7. unit/integration security/data tests;
8. migration validation;
9. production build;
10. smoke tests;
11. database migration application under the compatibility policy;
12. application deployment/promotion;
13. post-deploy verification.

Exact GitHub Actions jobs belong to DOC-51.

---

## 31. Database migration deployment rule

The database and application can deploy at slightly different times in managed CI. Therefore migrations must follow **expand/contract** compatibility.

## 31.1 Expand

Release N may:

- add nullable column;
- add table/index;
- add new enum-compatible representation;
- add function/procedure version;
- dual-read/dual-write during transition.

Old application code must continue functioning during rollout.

## 31.2 Migrate/backfill

Backfills are explicit, bounded operations. Large backfills do not hide inside a request handler.

## 31.3 Contract

Only after all deployed code no longer relies on the old shape may a later release:

- drop column;
- drop table;
- remove old procedure;
- strengthen non-null constraint after data is ready.

Destructive migration in the same release as the code switch is prohibited unless an explicit migration plan proves ordering safety.

---

## 32. Migration ownership

Production schema changes come from:

```text
supabase/migrations/*.sql
```

not ad-hoc dashboard edits.

If an emergency dashboard change occurs:

1. record incident/change;
2. immediately reconcile it into a migration/source-control representation;
3. verify other environments;
4. eliminate drift.

---

## 33. Supabase deployment integration

Preferred workflow:

- local migration creation/test;
- preview branch migration for PR when Branching is enabled;
- merge to `main` applies reviewed migrations to production through the selected Supabase GitHub/CLI deployment path;
- Vercel deploy consumes a schema that remains backward compatible during the rollout.

The project does not rely on exact provider race ordering for correctness.

---

## 34. Production promotion versus automatic deployment

Normal releases may deploy automatically after a protected merge to `main` if all gates are satisfied.

High-risk releases may use explicit promotion:

```text
validated production candidate
→ manual approval
→ production promotion
```

Examples:

- Auth changes;
- RLS/grant changes;
- destructive migration phase;
- Admin authorization changes;
- major CSP/security-header change;
- new public write endpoint.

The policy is risk-based, not ceremony for every CSS change.

---

## 35. Application rollback

Application rollback is a Vercel deployment operation.

Rollback may restore the previous application build quickly.

However:

> **Rollback must only be used when the database remains compatible with the previous build.**

This is another reason expand/contract is mandatory.

---

## 36. Database rollback is not app rollback

Routine database changes are not automatically "rolled back" by applying down migrations.

Preferred responses:

1. forward-fix migration;
2. feature disable/kill switch;
3. application rollback if schema remains compatible;
4. backup/PITR restore only for actual data-loss/corruption disaster.

Restoring a database rewinds data and is an incident operation, not a normal release control.

---

## 37. Backup architecture

Production backup posture depends on the value of runtime data, not the portfolio's static content.

Repository-backed professional content is recoverable from Git.

Runtime data requires database backups.

## 37.1 Baseline production backup

Once persistent community/Admin/Arcade data is live, production should run on a Supabase plan that provides managed daily backups, or an equivalent independently verified backup process.

Current Supabase managed plan behavior must be verified at purchase time; the architecture does not hard-code a commercial retention promise forever.

## 37.2 PITR

Point-in-Time Recovery is optional hardening when:

- runtime activity volume grows;
- losing up to one day of community/Arcade state becomes unacceptable;
- Admin/audit history becomes operationally important;
- cost is justified.

DOC-49 will establish the RPO that determines whether PITR is required.

---

## 38. Backup restoration tests

A backup that has never been restored is not proven recoverable.

At defined intervals (set by DOC-49/operations), perform a restore drill into an isolated non-production target and verify:

- schema exists;
- community data reads correctly;
- moderation states survive;
- Arcade scores/session constraints remain consistent;
- audit records are readable;
- Auth recovery procedure is understood;
- application can connect to the recovered copy using non-production credentials.

Never overwrite production merely to "test restore".

---

## 39. Source and artifact backup

The recovery set includes more than PostgreSQL:

```text
Git repository
canonical content
migrations
RenderCV sources
public media/assets
provider configuration inventory
DNS inventory
secret names/rotation runbook
Admin recovery runbook
```

Provider secrets themselves stay in secret stores/recovery systems, not in the repository.

---

## 40. Storage recovery

V1.x Sketch does not require durable user-upload storage under DOC-44, reducing backup complexity.

If future approved features introduce Supabase Storage:

- bucket creation must be config/migration documented;
- object lifecycle/retention documented;
- private/public distinction reviewed;
- database-to-object recovery consistency defined;
- backup behavior verified rather than assumed.

---

## 41. Infrastructure failure domains

| Failure | Expected impact |
|---|---|
| GitHub API down | cached/stale Dev Activity only |
| Resend down | Contact/Auth-email delivery degraded |
| Turnstile down | protected public writes fail safely, authored text preserved client-side |
| Supabase down | runtime/community/Admin/Arcade degraded; repository professional content remains usable where deployment/cache permits |
| Vercel regional function issue | platform routing/failover behavior applies; static/cached content may remain available |
| Vercel global outage | application unavailable; no active-active second host baseline |
| DNS outage/misconfiguration | canonical origin unavailable even if app healthy |
| Registrar compromise | critical domain takeover risk |

Infrastructure design focuses effort on preventing/recovering the failures proportionate to this personal product.

---

## 42. No active-active multi-cloud baseline

The portfolio does not maintain a continuously synchronized second application host.

Reasons:

- operational complexity exceeds value;
- database remains a central dependency anyway;
- DNS failover introduces its own complexity;
- the site is not a life-safety or revenue-critical system.

Recovery portability instead comes from:

- Git source;
- standard Next.js application;
- SQL migrations;
- portable content;
- provider adapters;
- documented DNS/configuration.

A prolonged provider outage could be handled by redeploying the professional core elsewhere, but this is a disaster procedure rather than active redundancy.

---

## 43. Database connectivity

Application runtime should prefer the supported Supabase HTTP/Data API/client path established in DOC-44 rather than opening arbitrary direct Postgres connections from every server function.

Direct database connections are limited to deliberate infrastructure tasks such as migrations/administration when required.

Benefits:

- reduces connection-management complexity in serverless compute;
- preserves repository/data access abstractions;
- avoids exposing raw connection credentials broadly.

---

## 44. Postgres SSL

Any direct PostgreSQL connection used for migrations/operations must require encrypted transport.

If Supabase SSL enforcement is enabled for the project, CI and operator tooling must be verified before enabling it in production.

There is no legitimate production workflow that depends on plaintext Postgres transport.

---

## 45. Database network restrictions

Supabase supports IP restrictions for direct Postgres/pooler connections, but managed CI/serverless egress may not use stable IP ranges.

Therefore:

- do not enable a brittle allowlist that breaks deploy/recovery;
- keep application runtime on the HTTPS API path where possible;
- use network restrictions when the actual set of direct DB clients can be represented safely;
- re-evaluate if fixed egress or dedicated infrastructure is later introduced.

Network restrictions are defense in depth, not a substitute for credentials, grants, RLS and application authorization.

---

## 46. Vercel edge, DDoS and WAF posture

Vercel's managed edge provides the first infrastructure-level request boundary and platform DDoS protections.

Application correctness must still assume hostile traffic.

Rate limits, idempotency, validation, Turnstile and authorization remain required even if a provider WAF is enabled.

Managed WAF/rulesets may be enabled where the selected plan supports them, but:

- they must not become the only control;
- rules must be tested against Admin/Auth/Arcade traffic;
- false positives need an operational disable path;
- no architecture depends on a premium WAF feature to be secure.

---

## 47. Cloudflare role

Under the preferred baseline Cloudflare provides:

```text
authoritative DNS
Turnstile
```

It does **not** provide by default:

```text
reverse proxy
application CDN
HTML cache
application WAF layer
```

Vercel remains the application edge.

This separation makes ownership clear:

```text
DNS issue      → DNS provider
App edge issue → Vercel
Human verify   → Turnstile
```

---

## 48. CDN/cache ownership

Vercel owns delivery of static assets and framework cache behavior.

Do not add a second CDN cache layer in front without a concrete need because it complicates:

- cache tags/revalidation;
- dynamic route behavior;
- auth cookies;
- CSP/header debugging;
- real client IP interpretation;
- incident response.

DOC-42/DOC-46 own application cache semantics.

---

## 49. Scheduled jobs

Scheduled jobs run through the Vercel/Next.js job paths designed in DOC-46.

Initial jobs:

```text
refresh-external-integrations
cleanup-expired-runtime-state
```

Infrastructure responsibilities:

- schedule configured in version-controlled platform config where practical;
- `CRON_SECRET` stored only in production secret store;
- handler verifies cron authentication;
- job obtains logical lease before work;
- schedule frequency may differ by plan without changing correctness.

No standalone worker fleet exists in V1.x.

---

## 50. Background work

`after()`/request-lifetime background tasks are treated as best-effort execution on Vercel Functions.

They are not used for:

- Contact delivery correctness;
- moderation audit persistence;
- Arcade score commit;
- Auth recovery correctness;
- anything whose loss violates a transactional invariant.

Guaranteed business operations remain synchronous/transactional or gain an actual durable job architecture in a future ADR.

---

## 51. Deployment protection for non-production

If platform deployment-protection features are available, enable them for Preview/Staging where they improve privacy and reduce accidental exposure.

But the fundamental rule remains:

> **A Preview deployment must be safe even if an unknown person obtains its URL.**

Therefore protection never justifies production secrets/data in Preview.

---

## 52. Search-engine isolation

Non-production origins must not compete with production SEO.

Use layered protection:

- Preview/staging canonical points appropriately or emits noindex;
- `robots` metadata prevents indexing;
- non-production origins are excluded from production sitemap;
- provider deployment URLs are never emitted as canonical URLs;
- OG metadata uses configured environment origin deliberately.

Production's canonical origin is always `https://alejosorno.dev`.

---

## 53. Preview callback URLs

Auth/provider callbacks are environment-specific.

Do not create an unsafe wildcard callback solely because PR URLs change.

For features needing stable callback origins, use one of:

- approved provider preview wildcard with strict host pattern;
- stable staging origin;
- generated branch-specific allowlist managed by integration;
- local development callback.

Production callback allowlists contain only production origins required for production.

---

## 54. Admin environment isolation

Production Admin account/factors exist only in production Auth.

Preview/staging use separate seeded/test admin identities.

Do not copy:

- production password;
- production TOTP factors;
- production recovery state;
- production sessions.

Testing Auth requires non-production identities even when the same human operates them.

---

## 55. Email behavior by environment

Local:

- fake transport by default;
- optional sandbox provider test.

Preview/Staging:

- provider test/sandbox key or restricted recipient allowlist;
- environment-labelled subject/header where useful;
- never email arbitrary visitor-entered addresses unless the feature explicitly requires it.

Production:

- verified domain;
- real Contact destination;
- production Auth SMTP channel;
- SPF/DKIM/DMARC verified.

---

## 56. Analytics by environment

Production analytics are not contaminated by Preview traffic.

Local/Preview analytics are disabled or use a distinct environment/project.

No QA session should appear as a real production visitor merely because the same frontend package was deployed.

DOC-17/DOC-49 own analytics semantics and retention.

---

## 57. Error/observability environment isolation

Sentry/observability events include environment/release metadata.

Preview errors must be distinguishable from production.

Production secrets, Auth tokens and visitor content remain subject to DOC-47 redaction regardless of environment.

---

## 58. Public asset deployment

Repository-controlled public assets are immutable/versioned through the build pipeline where possible.

Large media follows DOC-36 media roles and performance rules.

Do not use arbitrary external image hosts at runtime for core project artwork when an approved local/managed asset can be deployed with the application.

External feed imagery, if ever introduced, requires explicit remote-host and security policy.

---

## 59. RenderCV infrastructure

RenderCV is a build pipeline, not a production runtime service.

Generated PDFs are produced in CI/build from canonical sources and deployed as versioned/static public artifacts.

Production requests do not invoke Python/Typst/RenderCV on demand.

This reduces runtime attack surface and failure modes.

---

## 60. Dynamic OG infrastructure

Dynamic OG generation, when released, runs inside the application deployment and uses trusted canonical content/context.

It must not become a generic remote-URL image renderer.

Cache/compute placement follows DOC-46/DOC-49.

---

## 61. Environment naming standard

Use consistent names across providers and code:

```text
local
preview
staging
production
```

Avoid simultaneous synonyms such as:

```text
prod / live / main
stage / qa / test
```

in environment variables and logs unless mapping is explicit.

Git branch `main` is not itself the same concept as environment `production`; it is the source branch that produces it.

---

## 62. Environment detection

Application code consumes one normalized environment abstraction.

Conceptually:

```ts
RuntimeEnvironment =
  | "local"
  | "preview"
  | "staging"
  | "production";
```

Components do not scatter checks against provider-specific variables such as `VERCEL_ENV` throughout the UI.

Provider-specific signals are normalized once in server configuration.

---

## 63. Configuration validation

The application fails early on missing or malformed **required** production configuration.

Use a typed environment/config schema at startup/build where possible.

Example categories:

```text
required everywhere
required server-only
required production-only
optional integration
public browser-safe
```

A missing optional GitHub token should degrade Dev Activity, not crash the entire build.

A missing production Supabase server secret when Admin/community is enabled should fail the relevant deployment gate rather than create a partially unsafe system.

---

## 64. Feature-gated infrastructure dependencies

Later-release spaces remain Coming Soon before their release, so their infrastructure may also remain absent.

Examples:

```text
V1.0
No requirement for public Guestbook database traffic.

V1.2
Community schema + moderation + Admin operations become active.

V1.3
Arcade session/score infrastructure becomes active.

V1.4
scheduled GitHub/Tech Pulse refresh becomes active.
```

Infrastructure is deployed when the feature is released, not months earlier without consumers.

---

## 65. Health endpoint strategy

A minimal application health endpoint may expose only non-sensitive liveness/release metadata.

Example public shape:

```json
{
  "status": "ok",
  "release": "<safe build id>"
}
```

It must not expose:

- environment variables;
- provider keys;
- database host names if unnecessary;
- detailed internal exceptions;
- dependency inventories useful for attack reconnaissance.

Deep dependency checks used by operations may be separate/protected and are specified with DOC-49.

---

## 66. Maintenance and kill switches

Infrastructure must support disabling individual runtime features without removing the professional core.

Examples:

```text
community writes disabled
Arcade score submissions disabled
Contact delivery disabled
external integrations frozen on stale cache
```

Kill switches are server-controlled configuration, not browser-only toggles.

A global maintenance page is a last resort, not the first response to a partial provider failure.

---

## 67. Production bootstrap sequence

The first production launch follows an ordered runbook.

## Phase A — accounts and ownership

1. GitHub repository ownership/MFA verified.
2. Domain registrar ownership/MFA/recovery verified.
3. DNS account ownership/MFA/recovery verified.
4. Vercel account/team created and protected.
5. Supabase organization/project created and protected.
6. email/Turnstile/monitoring providers protected.

## Phase B — infrastructure

7. select final production region after benchmark gate;
8. create Supabase production project;
9. apply migrations from empty database;
10. configure Auth production settings;
11. provision Admin using DOC-45 sequence;
12. create Vercel project and production environment variables;
13. configure provider production keys;

## Phase C — domain

14. add `alejosorno.dev` to Vercel;
15. configure DNS records;
16. verify TLS;
17. configure `www` redirect;
18. verify canonical/SEO output;
19. configure email DNS and verify provider;

## Phase D — validation

20. production build/deploy;
21. security-header/CSP verification;
22. Admin AAL2 login verification;
23. Contact delivery test;
24. environment isolation test;
25. backup visibility/restore procedure verification;
26. final smoke/accessibility/performance checks;
27. public launch.

---

## 68. Production readiness infrastructure gate

Production is not ready if any are unresolved:

- domain ownership unclear;
- MFA missing on Tier-0 provider accounts;
- production region not finalized;
- production secrets copied from Preview;
- direct production DB manual changes not captured in migrations;
- TLS/canonical redirect broken;
- production Auth redirect allowlist accepts unsafe origins;
- backup policy unknown;
- Admin provisioned without MFA;
- Contact sender domain unverified;
- Preview can access production runtime data;
- rollback/recovery ownership unknown.

---

## 69. Provider account access

Provider accounts use individual identity rather than shared passwords wherever possible.

For a single-owner project today, that still means:

- password manager;
- MFA;
- recovery codes;
- separate recovery email protection;
- API tokens instead of sharing account passwords with automation.

Future collaborators receive least-privilege invitations rather than Alejandro's credentials.

---

## 70. Tier-0 provider classification

Tier-0 assets can effectively take over the portfolio:

```text
Domain registrar
Authoritative DNS
GitHub repository/organization
Vercel production project/account
Supabase production organization/project
Primary email/recovery account
```

Compromise of one requires incident response even if application code is unchanged.

Resend/Turnstile/analytics are important but usually have narrower blast radius.

---

## 71. Infrastructure inventory

The repository should maintain a non-secret inventory similar to:

```yaml
production:
  domain: alejosorno.dev
  app_host: vercel
  app_region: <chosen>
  database: supabase
  database_region: <chosen>
  dns: cloudflare|vercel
  email: resend
  human_verification: turnstile
  source: github
  monitoring: <provider>
```

Also record:

- provider project names/IDs where safe;
- owner account;
- purpose;
- environment;
- secret names (not values);
- backup mode;
- renewal/billing dependency;
- relevant runbook link.

---

## 72. Configuration drift policy

Drift examples:

- RLS changed manually but migration unchanged;
- Vercel env var added with no inventory entry;
- DNS record changed without documentation;
- Auth redirect URL changed only in dashboard;
- production cron schedule differs from repository expectation.

When drift is discovered:

1. determine intended truth;
2. capture approved state in code/docs where possible;
3. update provider;
4. verify environments;
5. record incident if security-sensitive.

---

## 73. Infrastructure as code boundary

V1.x does **not** mandate Terraform/Pulumi.

The architecture already has meaningful declarative state:

- Git repository;
- `supabase/migrations`;
- `supabase/config.toml`;
- Next/Vercel configuration files where necessary;
- env-var inventory;
- DNS inventory/runbook;
- provider setup checklists.

Introduce full IaC when provider count/team size/drift frequency makes it genuinely simpler than documented managed configuration.

Do not add Terraform solely so the portfolio can claim to use Terraform.

---

## 74. Vercel configuration policy

Prefer framework defaults until a real need requires `vercel.json` or route-level deployment configuration.

Version-control settings such as:

- function region override;
- cron routes/schedules;
- redirects/rewrites not better represented by Next.js;
- function duration/memory override when measured.

Do not copy provider defaults into config without purpose.

---

## 75. Function resource sizing

Memory and max duration are changed only from observed workloads.

Potential heavier operations:

- safe Sketch preview render;
- Dynamic OG render;
- integration refresh batch.

Normal CRUD/Contact/Admin handlers should remain modest.

DOC-49 measures and sets resource budgets.

---

## 76. Build reproducibility

Deployment must use:

- committed package-manager lockfile;
- pinned/controlled Node version policy;
- pinned RenderCV/Python toolchain policy from DOC-37;
- deterministic content validation;
- generated artifacts recreated in CI rather than hand-edited.

"Works on my machine" is not an acceptable deployment dependency.

---

## 77. Immutable deployment principle

A Vercel deployment corresponds to a specific source revision/build configuration.

Production promotion/rollback should select immutable deployments rather than mutate files on a running server.

Runtime mutable state lives in approved databases/provider systems, never in a function filesystem.

---

## 78. Serverless filesystem rule

No feature assumes durable local disk in Vercel Functions.

Temporary files may exist only within documented runtime limits for one invocation.

Durable state goes to:

- repository/build artifact;
- PostgreSQL;
- approved Storage provider if later introduced.

This is especially relevant to CV generation and Sketch previews: neither may rely on a persistent server directory.

---

## 79. Connection and concurrency behavior

Serverless scaling means multiple requests/processes can run concurrently.

Therefore infrastructure never assumes:

- in-memory singleton locks are globally authoritative;
- a process-level rate limiter covers all instances;
- job execution happens once just because one timer fired;
- global mutable memory persists between requests.

Use PostgreSQL constraints/leases/idempotency designed in DOC-43/44/46.

---

## 80. Provider rate/usage limits

Infrastructure is cost-aware but correctness-first.

When a provider quota is reached:

- external data degrades to cache;
- Contact reports unavailable rather than duplicating mail;
- scheduled refresh backs off;
- public professional content remains accessible.

No feature should create an unbounded provider call per visitor when caching can convert it into shared work.

---

## 81. Cost containment hooks

Exact budgets belong outside this document, but infrastructure must expose containment controls:

- Vercel usage alerts/limits where available;
- Supabase spend controls/usage alerts where available;
- bounded cron frequency;
- provider rate limits;
- no arbitrary large uploads;
- bounded Sketch model size;
- cached integration data;
- no unbounded database retention without policy;
- feature kill switches.

Unexpected traffic must not silently become unlimited spend.

---

## 82. Disaster recovery classes

## DR-A — application regression

Response:

```text
Vercel rollback / forward fix
```

No data restore.

## DR-B — bad database migration, no data loss

Response:

```text
feature disable
+ forward-fix migration
+ app compatibility handling
```

## DR-C — data corruption/deletion

Response:

```text
contain writes
+ assess recovery point
+ restore backup/PITR into isolated target
+ validate
+ controlled cutover/recovery
```

## DR-D — provider/account compromise

Response:

```text
revoke credentials
+ rotate secrets
+ disable affected integration
+ audit access
+ recover account ownership
```

## DR-E — domain/DNS compromise

Response is Tier-0 incident:

```text
registrar/DNS recovery
+ credential rotation
+ DNS verification
+ certificate/origin checks
+ user-facing integrity review
```

---

## 83. Recovery priorities

Recovery order favors professional availability and integrity:

1. domain/DNS ownership;
2. clean public professional shell/content;
3. Admin security/control;
4. Contact;
5. community/moderation;
6. Arcade scores;
7. external live-data enhancements.

A GitHub widget is not restored before domain ownership.

---

## 84. Runtime data export portability

Database schemas avoid provider-specific coupling where ordinary PostgreSQL constructs suffice.

Supabase-specific Auth/RLS/integration behavior is intentionally used, but core runtime content should remain exportable as PostgreSQL data.

This is not a promise of one-click migration; it is a guard against unnecessary proprietary data formats.

---

## 85. Provider-exit posture

The portfolio can theoretically move:

- Next.js application to another compatible host;
- PostgreSQL data to another PostgreSQL service;
- email adapter to another provider;
- verification adapter to another provider;
- DNS to another authoritative service.

Provider adapters/configuration boundaries in DOC-41/43/46 exist partly for this reason.

Do not build provider abstraction layers so generic they obscure normal code, but do avoid provider calls scattered through components.
## 85A. Trusted client-network derivation

For the approved production topology (Cloudflare authoritative DNS in **DNS-only** mode → Vercel application edge), the canonical network source used by `AbuseGuard` is Vercel's trusted `x-vercel-forwarded-for` request header.

Rules:

- accept the Vercel-provided value only in the Vercel runtime adapter;
- expect a single valid public IP value under the current platform contract and reject/ignore malformed unexpected multi-value input rather than guessing;
- never fall back to an arbitrary internet-supplied left-most forwarding header in Production;
- Local/Test use an explicit injected network-context adapter/fixture rather than pretending untrusted headers are Vercel;
- raw IP is held only long enough to derive feature-scoped HMAC abuse keys and is not persisted by default;
- if Cloudflare proxy mode, another reverse proxy or a different host is introduced, this trust decision must be reopened before deployment.

As of the 2026-09-15 provider contract, Vercel documents `x-vercel-forwarded-for` as its Vercel-specific equivalent of the client IP forwarding header and notes that it remains Vercel-sourced where an upstream proxy could otherwise affect ordinary `x-forwarded-for`.


---

## 86. Dependency on Vercel-specific features

Using Vercel-specific operational capabilities is acceptable when they materially help the portfolio.

Examples:

- Preview deployments;
- Cron;
- deployment promotion/rollback;
- managed domains/TLS;
- function region controls.

But business data/logic does not become irreversibly encoded inside a proprietary dashboard workflow.

---

## 87. Dependency on Supabase-specific features

Approved uses include:

- Auth;
- RLS/grants;
- Data API/client;
- database functions for transactional persistence;
- branching if available.

Core schema remains SQL migrations in source control.

No production schema exists only because someone clicked a table editor.

---

## 88. Production access from developer machine

Routine application development should not require direct production database access.

When production investigation requires access:

- use provider dashboard/read-only tools where adequate;
- avoid bulk exports of visitor data;
- use least-privilege connection/token;
- do not save production connection strings into shell history or project `.env.local` permanently;
- record security-sensitive manual changes.

---

## 89. Production console changes

Emergency provider-console changes are permitted when necessary to restore security/availability.

They are followed by reconciliation into canonical configuration/migrations/docs.

Examples:

- revoke API key;
- disable compromised Auth user;
- update DNS during incident;
- disable cron;
- rollback deployment.

"Never touch production manually" is less useful than "never leave undocumented drift after an emergency."

---

## 90. Logs at infrastructure boundary

Vercel/Supabase/provider logs are operational evidence but not canonical business data.

Domain-data retention follows DOC-44/DOC-47; telemetry retention/redaction follows DOC-49.

Never rely on platform logs as the only record of a moderation action; DOC-44 audit events remain canonical for privileged business actions.

---

## 91. Infrastructure release metadata

Each production deployment should expose/record enough safe metadata to correlate:

- Git commit SHA;
- application release/build ID;
- deployment timestamp;
- environment;
- migration set/schema version where practical.

This metadata is for debugging and rollback, not for leaking secrets/dependency internals publicly.

---

## 92. Migration-to-deployment correlation

Operationally, it must be possible to answer:

> Which migrations had been applied when deployment X was serving production?

Maintain this through migration history plus deployment commit SHA.

A database schema with uncommitted manual edits breaks this property and is prohibited as steady state.

---

## 93. Domain redirects and origin consistency

All public absolute URLs derive from a single canonical site-origin configuration.

Production:

```text
SITE_ORIGIN=https://alejosorno.dev
```

Preview uses its actual preview origin for internal runtime needs, but generated canonical SEO output must follow DOC-17 policy and must not accidentally promote preview URLs.

Avoid reconstructing origin from untrusted Host headers for security-sensitive callbacks.

---

## 94. Trusted host policy

Server-side code that builds security-sensitive absolute callback URLs uses configured trusted origins or a validated allowlist.

It must not blindly accept:

```text
X-Forwarded-Host
Host
Origin
```

as a redirect destination.

DOC-47's open-redirect/host-header threat controls apply.

---

## 95. Cookies across environments

Production Auth cookies belong to the production origin.

Do not deliberately widen cookie Domain to `.alejosorno.dev` unless required.

Host-only cookies reduce accidental sharing with future subdomains such as staging or email-related hosts.

Preview/staging Auth sessions remain independent.

---

## 96. Subdomain inventory

Every live subdomain should have an owner/purpose.

Potential approved values:

```text
www.alejosorno.dev       redirect only
mail.alejosorno.dev      email authentication/sending domain
staging.alejosorno.dev   optional, non-production
```

Avoid forgotten subdomains pointing at retired services because they create takeover/security risk.

Retired DNS records are removed intentionally.

---

## 97. CAA policy

CAA records may be used to restrict certificate authorities **only after** confirming all Vercel/provider certificate issuers required by the domain.

A mistaken CAA policy can cause certificate renewal failure, so it is hardening, not a copy-paste requirement.

---

## 98. DNS TTL policy

Normal records use provider-reasonable TTLs.

Before a planned DNS migration, TTL may be lowered in advance.

Do not permanently keep extremely low TTL solely for imagined failover; it increases DNS traffic and does not create real multi-provider redundancy by itself.

---

## 99. Release freeze during critical infrastructure changes

Avoid simultaneously changing:

- DNS authority;
- production region;
- Auth provider settings;
- major database migration;
- application release.

during one uncontrolled operation.

Separate changes so failure attribution and rollback remain understandable.

---

## 100. Infrastructure changes requiring explicit review

The following are material architecture changes and require ADR/update rather than silent implementation:

- changing production host from Vercel;
- adding Cloudflare proxy in front of Vercel;
- changing authoritative database provider;
- moving production data region after launch;
- introducing Redis/queue/worker fleet;
- adding user-upload object storage;
- introducing active-active multi-region database/application;
- adding persistent staging if it changes cost/security boundaries materially;
- introducing a public API gateway;
- moving canonical professional content from Git to a runtime CMS/database.

---

## 101. Infrastructure prototype / verification gates

Before scaling implementation, validate:

## INF-GATE-01 — Clean local bootstrap

From a clean machine/repository checkout:

- install dependencies;
- start local Supabase;
- apply migrations;
- seed data;
- build/run portfolio;
- execute representative runtime flows.

**Pass:** no undocumented dashboard state is required.

## INF-GATE-02 — Preview isolation

Create a PR Preview.

Verify:

- no production Supabase credentials;
- no production Admin account;
- no production analytics pollution;
- noindex;
- callback origins correct;
- seeded runtime data works.

## INF-GATE-03 — Region benchmark

Compare candidate data/compute pairings with representative Colombia + international traffic before final production project placement.

## INF-GATE-04 — Domain/TLS

Verify:

```text
https://alejosorno.dev
https://www.alejosorno.dev → canonical redirect
certificate valid
HTTP → HTTPS
canonical URLs correct
```

## INF-GATE-05 — Migration compatibility

Deploy an expand migration while old app version remains valid, then new app, then later contract cleanup in a test environment.

**Pass:** deployment ordering does not create downtime.

## INF-GATE-06 — Application rollback

Deploy release A → B, then rollback application to A against B-compatible schema.

**Pass:** rollback procedure is known and safe.

## INF-GATE-07 — Backup restore

Restore production-like backup into isolated non-production environment and run integrity/smoke checks.

## INF-GATE-08 — Provider outage isolation

Simulate Supabase/Resend/Turnstile/GitHub unavailability.

**Pass:** failure matches documented feature boundary; professional core does not collapse from unrelated provider outage.

## INF-GATE-09 — Secret leak response

Use a fake key and execute the documented revoke/rotate/redeploy verification sequence.

## INF-GATE-10 — DNS/account recovery tabletop

Confirm registrar/DNS MFA recovery, ownership contacts and emergency access are actually available.

---

## 102. Required production runbooks

Before launch, maintain concise runbooks for:

```text
RUN-01 Deploy / promote / rollback application
RUN-02 Apply / verify database migration
RUN-03 Restore database backup
RUN-04 Rotate Supabase secret
RUN-05 Rotate Resend / Turnstile / GitHub tokens
RUN-06 Recover Admin access
RUN-07 Domain/DNS incident
RUN-08 Disable Community writes
RUN-09 Disable Arcade score submissions
RUN-10 Provider outage / degraded mode
```

They may initially live as sections under `docs/runbooks/` rather than becoming numbered architecture documents.

---

## 103. Infrastructure acceptance checklist

Before DOC-48 is considered implemented:

- [ ] canonical production domain decided and configured;
- [ ] registrar ownership secured with MFA;
- [ ] authoritative DNS provider documented;
- [ ] DNSSEC decision recorded;
- [ ] Vercel project linked to repository;
- [ ] production/preview environment scopes verified;
- [ ] final Vercel/Supabase region pairing benchmarked and recorded;
- [ ] local Supabase bootstrap works from clean state;
- [ ] production migrations originate from repository;
- [ ] Preview cannot reach production data/secrets;
- [ ] production Admin is AAL2-protected;
- [ ] TLS/canonical redirect verified;
- [ ] email SPF/DKIM/DMARC verified before real sending;
- [ ] cron endpoints authenticated;
- [ ] backup capability active before persistent UGC is considered durable;
- [ ] restore drill completed before depending on backup claims;
- [ ] application rollback tested;
- [ ] feature kill switches tested;
- [ ] infrastructure inventory current;
- [ ] required runbooks exist;
- [ ] provider account recovery paths verified.

---

## 104. Plan-dependent capabilities

Architecture separates **required behavior** from **provider convenience**.

| Capability | Architectural requirement | Plan-dependent implementation |
|---|---|---|
| Preview app deployment | yes | Vercel provides Preview broadly |
| Persistent custom staging | optional | Vercel custom environments may require paid plan |
| Isolated Supabase PR branches | preferred | Supabase Branching plan-dependent |
| Daily managed DB backup | required once durability matters, or equivalent | Supabase managed backup depends on plan |
| PITR | optional until RPO requires it | paid/add-on |
| Multi-region function deployment | not required | Vercel paid capability |
| Vercel WAF advanced controls | optional defense-in-depth | plan-dependent |
| Deployment protection | optional defense-in-depth | plan-dependent/features vary |

A plan upgrade may improve implementation quality without redefining product semantics.

---

## 105. Current provider notes — validated 2026-09-15

These notes are **informational snapshots**, not immutable architecture:

- Vercel currently defines Local, Preview and Production as its three default environments; Pro/Enterprise can add custom environments.
- Vercel automatically provisions TLS certificates for verified custom domains.
- Vercel Functions default to `iad1`; function placement can be configured closer to the data source.
- Supabase recommends local development plus production, with optional Preview/Staging; Branching can create isolated PR environments.
- Supabase preview branches are isolated and data-less by default unless seed/data options are explicitly used.
- Supabase production projects have a single primary region; current specific choices include `us-east-1` and `sa-east-1`.
- Supabase currently provides daily managed backups on paid production plans, with PITR available as additional recovery hardening.
- Supabase network restrictions apply to direct Postgres/pooler connections, not its HTTPS APIs.

Provider details must be re-checked at implementation/purchase time.

Official references:

- Vercel Environments: https://vercel.com/docs/deployments/environments
- Vercel Domains: https://vercel.com/docs/domains/set-up-custom-domain
- Vercel Regions: https://vercel.com/docs/regions
- Vercel Functions configuration: https://vercel.com/docs/functions/configuring-functions
- Supabase Deployment: https://supabase.com/docs/guides/deployment
- Supabase Branching: https://supabase.com/docs/guides/deployment/branching
- Supabase Regions: https://supabase.com/docs/guides/platform/regions
- Supabase Database Backups: https://supabase.com/docs/guides/platform/backups
- Supabase Network Restrictions: https://supabase.com/docs/guides/platform/network-restrictions

---

## 106. Decision registry

The following decisions are proposed by DOC-48.

| ID | Decision |
|---|---|
| INF-001 | Vercel is the application hosting/deployment plane for V1.x. |
| INF-002 | Supabase is the managed runtime database/Auth plane approved by Technical Architecture. |
| INF-003 | No VPS, Kubernetes or manually operated reverse-proxy/server fleet exists in V1.x. |
| INF-004 | Infrastructure knowledge must remain reconstructable from repository docs/config/migrations even when providers are managed. |
| INF-005 | Environments are Local, Preview, optional Staging and Production. |
| INF-006 | Production data/secrets never enter Preview merely for convenience. |
| INF-007 | Local development uses Supabase CLI/local services and synthetic seed data. |
| INF-008 | Every relevant PR receives a Vercel Preview deployment. |
| INF-009 | Preview URLs are considered potentially public and contain no production-sensitive state. |
| INF-010 | Supabase isolated preview branches are the preferred DB preview topology when available. |
| INF-011 | If Branching is unavailable, CI/local isolation is mandatory and production cannot be used as Preview backend. |
| INF-012 | Persistent Staging is optional and introduced only when stable integration/QA needs justify it. |
| INF-013 | `https://alejosorno.dev` is the canonical production origin. |
| INF-014 | `www.alejosorno.dev` permanently redirects to the apex canonical origin. |
| INF-015 | Admin remains `/admin`; no Admin subdomain baseline exists. |
| INF-016 | Registrar and authoritative DNS are separate responsibilities. |
| INF-017 | Cloudflare authoritative DNS in DNS-only mode is the preferred baseline; Vercel DNS is an acceptable simpler alternative. |
| INF-018 | Cloudflare proxy/CDN is not placed in front of Vercel without a later ADR. |
| INF-019 | DNS target values are resolved from current provider configuration, not frozen tutorial values. |
| INF-020 | `.dev` production launch is HTTPS-only from inception. |
| INF-021 | Vercel manages application TLS certificates; no manual certificate daemon is operated. |
| INF-022 | HSTS is rolled out after HTTPS verification; preload is deferred unless deliberately approved. |
| INF-023 | Registrar and DNS accounts require MFA, recovery and auto-renew controls. |
| INF-024 | DNSSEC is enabled where supported/validated. |
| INF-025 | Email authentication DNS is separated/documented and production requires SPF/DKIM/DMARC verification. |
| INF-026 | Static/cached delivery remains global while stateful functions run near the primary database. |
| INF-027 | Final production region pairing is selected using measured representative latency before meaningful production data accumulates. |
| INF-028 | Initial region candidate is Supabase `us-east-1` + Vercel `iad1`, compared against São Paulo pairing before final lock. |
| INF-029 | One primary function region is preferred over indiscriminate multi-region stateful compute. |
| INF-030 | Node.js remains default runtime; Edge is an evidence-driven exception. |
| INF-031 | One Vercel project hosts the public site, Admin, Arcade and other application routes. |
| INF-032 | One production Supabase project owns runtime data; features do not each get their own project. |
| INF-033 | Production visitor data is never copied into normal preview seed data. |
| INF-034 | Environment variables are classified as public, server-secret or build-only. |
| INF-035 | `NEXT_PUBLIC_*` is treated as intentionally public and receives explicit review. |
| INF-036 | Environment-variable names/purpose/consumers are documented without recording values. |
| INF-037 | Production secrets live in managed secret stores, never Git/Markdown. |
| INF-038 | Preview and Production use separate credentials where providers permit it. |
| INF-039 | Secret rotation revokes old credentials rather than accumulating active historical keys. |
| INF-040 | Git repository is the production application deployment source of truth. |
| INF-041 | `main` is the production source branch, subject to DOC-51 protections. |
| INF-042 | Deployments run content, code, migration and production-build gates before release. |
| INF-043 | Database migrations follow expand/backfill/contract compatibility. |
| INF-044 | Destructive schema contraction does not occur in the same rollout unless ordering safety is explicitly proven. |
| INF-045 | Production schema changes originate from versioned migrations; emergency manual changes are reconciled immediately. |
| INF-046 | App/database correctness does not depend on exact provider deployment race ordering. |
| INF-047 | High-risk infrastructure/security releases may require explicit production promotion. |
| INF-048 | Vercel rollback is application rollback, not database rollback. |
| INF-049 | Routine DB recovery favors forward fixes; backup/PITR restore is a disaster operation. |
| INF-050 | Managed daily database backup or an equivalent verified process is required once persistent runtime data is treated as durable. |
| INF-051 | PITR becomes required only when the RPO in DOC-49 justifies it. |
| INF-052 | Backup restoration is periodically tested into isolated non-production infrastructure. |
| INF-053 | Recovery inventory includes Git/content/migrations/config/runbooks in addition to database backups. |
| INF-054 | Future Storage adoption must define object recovery semantics explicitly. |
| INF-055 | No active-active multi-cloud application baseline is maintained. |
| INF-056 | Provider portability comes from source/migrations/adapters/documentation rather than live duplicate infrastructure. |
| INF-057 | Runtime app access prefers Supabase's supported API path; direct Postgres access is limited to deliberate operational tasks. |
| INF-058 | Direct Postgres connections require encrypted transport. |
| INF-059 | Database network IP restrictions are enabled only when they can be operated without breaking managed CI/runtime. |
| INF-060 | Vercel edge/WAF protections are defense-in-depth; application-level security remains authoritative. |
| INF-061 | Cloudflare baseline role is DNS + Turnstile, not an extra application proxy/CDN. |
| INF-062 | Vercel remains the single application CDN/cache ownership plane. |
| INF-063 | Scheduled jobs run through the DOC-46 Vercel/Next job architecture; no worker fleet baseline exists. |
| INF-064 | Best-effort `after()` work never carries transactional correctness obligations. |
| INF-065 | Preview protection is defense-in-depth; Preview must remain safe if its URL becomes known. |
| INF-066 | Non-production origins are noindex and excluded from production sitemap/canonical output. |
| INF-067 | Callback allowlists are environment-specific and do not use unsafe broad wildcards. |
| INF-068 | Production Admin credentials/factors are never copied to non-production Auth. |
| INF-069 | Non-production email uses fake/sandbox/restricted behavior; Production alone uses real delivery configuration. |
| INF-070 | Preview/local analytics are disabled or isolated from production analytics. |
| INF-071 | Observability events carry environment/release metadata. |
| INF-072 | Core project assets are repository/managed assets rather than runtime hotlinks to arbitrary remote hosts. |
| INF-073 | RenderCV generation is build-time, never a production request-time dependency. |
| INF-074 | Dynamic OG is not a generic remote-URL rendering proxy. |
| INF-075 | Environment names are standardized as local/preview/staging/production. |
| INF-076 | Provider environment variables are normalized behind one application environment abstraction. |
| INF-077 | Required production configuration is typed/validated and fails early when unsafe to continue. |
| INF-078 | Feature infrastructure is activated according to release gating rather than provisioned without consumers. |
| INF-079 | Public health responses expose only safe liveness/release information. |
| INF-080 | Individual runtime features have server-controlled kill switches where failure containment needs them. |
| INF-081 | First production launch follows an ordered bootstrap runbook. |
| INF-082 | Production readiness is blocked by unresolved domain, region, secret isolation, TLS, Auth, backup or migration invariants. |
| INF-083 | Provider accounts use individual MFA-protected access; automation uses tokens, not shared passwords. |
| INF-084 | Registrar/DNS/GitHub/Vercel/Supabase/recovery email are Tier-0 infrastructure assets. |
| INF-085 | A non-secret infrastructure inventory is maintained in repository documentation. |
| INF-086 | Provider/dashboard configuration drift is reconciled into canonical code/docs. |
| INF-087 | Terraform/Pulumi are not mandatory in V1.x; IaC is introduced when it reduces real complexity. |
| INF-088 | Vercel configuration remains minimal and purpose-driven. |
| INF-089 | Function memory/duration are tuned from measurements, not pre-optimized guesses. |
| INF-090 | Deployments use reproducible package/toolchain inputs. |
| INF-091 | Deployments are immutable artifacts; runtime mutable state never depends on serverless local disk. |
| INF-092 | Global correctness never depends on process-local locks or memory. |
| INF-093 | Provider quota exhaustion degrades optional features rather than triggering unbounded retry/cost. |
| INF-094 | Infrastructure exposes usage/cost containment hooks without compromising product correctness. |
| INF-095 | Disaster recovery distinguishes app regression, schema issue, data corruption, provider compromise and domain compromise. |
| INF-096 | Recovery priority puts domain/public professional integrity before optional live integrations. |
| INF-097 | Runtime data remains reasonably PostgreSQL-exportable; provider-specific coupling is deliberate rather than accidental. |
| INF-098 | Provider exit is enabled by source/data/adapters, not over-generalized abstraction. |
| INF-099 | Vercel/Supabase provider-specific operational features are acceptable when documented and non-secret source remains reproducible. |
| INF-100 | Routine development does not require direct production database credentials. |
| INF-101 | Emergency console changes are allowed for restoration but must be reconciled afterward. |
| INF-102 | Platform logs are operational evidence, not canonical moderation/audit data. |
| INF-103 | Production deployments are correlated to Git release metadata and migration history. |
| INF-104 | Absolute public URLs derive from configured canonical origin, not untrusted request Host headers. |
| INF-105 | Production Auth cookies remain host-scoped unless a reviewed requirement proves subdomain sharing necessary. |
| INF-106 | Every live subdomain has an explicit purpose/owner and retired records are removed. |
| INF-107 | CAA is optional hardening only after certificate issuer compatibility is confirmed. |
| INF-108 | DNS TTL is operationally reasonable; low TTL does not substitute for a real failover design. |
| INF-109 | Critical infrastructure changes are separated rather than bundled into an opaque mega-change. |
| INF-110 | Host/provider/region/proxy/storage/multi-region changes listed in Section 100 require explicit architecture review/ADR. |
| INF-111 | Ten infrastructure gates in Section 101 must be validated progressively before relying on Production. |
| INF-112 | Production launch requires the operational runbook set in Section 102. |
| INF-113 | Paid provider features may improve isolation/recovery but correctness has documented fallbacks. |
| INF-114 | Current provider-plan facts are implementation-time validated and not treated as immutable architectural law. |
| `INF-115` | Under DNS-only→Vercel topology, `x-vercel-forwarded-for` is the canonical trusted production client-network source for `AbuseGuard`. |
| `INF-116` | `REQUEST_FINGERPRINT_HMAC_KEY_V1` is a distinct server secret from `ABUSE_HMAC_KEY_V1`. |

---

## 107. Implementation-tool rules

Development tooling or a contributor working on infrastructure must:

1. read DOC-48 plus DOC-47 and the relevant data/auth/integration domain owner before changing provider/deployment behavior;
2. never invent production DNS targets, project IDs or secrets;
3. never commit `.env.local` or real provider credentials;
4. never point Preview at production Supabase as a shortcut;
5. create schema changes as migrations;
6. preserve expand/contract compatibility;
7. avoid adding Terraform, Redis, queues, proxies or multi-region infrastructure without an approved need;
8. treat `alejosorno.dev` as canonical Production origin;
9. keep Cloudflare proxy disabled under the baseline if Cloudflare DNS is selected;
10. never change the final production region silently after it has been approved/provisioned;
11. validate env configuration with typed schemas rather than scattering `process.env!` assertions;
12. keep direct provider SDK/configuration inside the appropriate infrastructure/integration boundary;
13. update infrastructure inventory/runbooks in the same change when provider configuration changes;
14. preserve non-production noindex and data isolation;
15. never use app rollback as an implicit database rollback;
16. document and test recovery-relevant changes.

---

## 108. Approved baseline

DOC-48 is the approved infrastructure posture that DOC-49 uses as the stable deployment/recovery baseline because performance/reliability targets need a defined understanding of:

- where compute and data live;
- which failure domains exist;
- what backup/recovery mechanisms are available;
- which environments are isolated;
- how production deploys and rolls back;
- which provider behaviors are architectural versus optional conveniences.

The only implementation-time item intentionally left behind a required gate is the final **production region pair**: benchmark `iad1/us-east-1` against `gru1/sa-east-1` before production runtime data is established, with `iad1/us-east-1` as the starting candidate rather than an untested permanent assumption.
