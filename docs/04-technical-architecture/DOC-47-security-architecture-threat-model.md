---
id: DOC-47
title: "Security Architecture & Threat Model"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Application Security & Threat Modeling"
canonical_domain_owner: security_architecture

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
  - DOC-14
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-18
  - DOC-19
  - DOC-20
  - DOC-22
  - DOC-23
  - DOC-24
  - DOC-25
  - DOC-26
  - DOC-30
  - DOC-31
  - DOC-32
  - DOC-36
  - DOC-37
  - DOC-39
  - DOC-40
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - DOC-45
  - DOC-46
  - ADR-001
  - ADR-002

decision_families:
  - SECARC
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-47 — Security Architecture & Threat Model

> **Status:** APPROVED.  
> **Role:** Define the portfolio's security architecture, threat model, trust boundaries, abuse controls and production security invariants across the public site, Admin, community features, Arcade, integrations, data, build/deployment and browser runtime.

---

## 1. Purpose

The portfolio is public, interactive and deliberately richer than a static brochure. It contains public write surfaces, moderation, an authenticated Admin, a drawing system, leaderboards, external providers and a highly interactive browser shell. That combination means security must be designed as a **cross-cutting architecture**, not added later as a list of headers.

DOC-12 established the product-level requirements. DOC-41 through DOC-46 established the concrete application, data, identity and provider architecture. DOC-47 turns those decisions into one security model.

This document defines:

- security objectives and non-objectives;
- protected assets and data classes;
- attacker/threat-actor assumptions;
- trust boundaries and security zones;
- threat-model methodology and risk treatment;
- public-read and public-write security;
- XSS/content-injection controls;
- SQL/command/path/prototype-pollution defenses;
- CSRF, same-origin and CORS policy;
- SSRF and remote-fetch controls;
- request-size and resource-exhaustion controls;
- Content Security Policy and browser security headers;
- secrets and privileged-server-client handling;
- pseudonymous abuse-key construction and rotation;
- rate-limit architecture;
- Cloudflare Turnstile enforcement/failure policy;
- Contact, Guestbook, Sketch, Reports and Reaction abuse controls;
- Arcade anti-cheat/security boundaries;
- Admin/Auth attack controls;
- webhook and cron security;
- external-provider/content security;
- cache-poisoning/data-leak controls;
- supply-chain/build security;
- logging/privacy boundaries;
- incident containment and emergency controls;
- security verification and release gates.

It intentionally does **not** finalize:

- production network/DNS/WAF topology, exact managed-firewall configuration or certificate/DNS records — DOC-48;
- concrete SLOs, operational alert thresholds and performance/provider timeout tuning — DOC-49; domain retention is owned by DOC-44 and the initial public-write rate policy is owned here in DOC-47;
- the complete automated/manual security test matrix and tooling — DOC-50;
- exact CI workflow files, dependency-bot configuration, branch protection or release automation — DOC-51.

---

## 2. Security north star

The core assumption is simple:

> **Everything that arrives from a browser, URL, provider, feed, webhook or external network is untrusted until the server validates it for the exact operation being performed.**

The public client is never a security authority.

A visitor can inspect and modify JavaScript, replay HTTP requests, forge fields, bypass UI states, call endpoints directly and automate interactions. The design must remain correct under those conditions.

---

## 3. Security goals

The architecture prioritizes:

1. **Confidentiality** — admin credentials, tokens, private moderation data, abuse metadata and provider secrets do not leak.
2. **Integrity** — public submissions, moderation state, audit history and Arcade scores cannot be changed outside authorized flows.
3. **Availability** — abuse or provider failure degrades bounded features rather than taking the professional core down.
4. **Authenticity** — privileged Admin actions require a valid AAL2 Admin identity; provider/webhook claims are verified.
5. **Privacy** — the system minimizes retained personal data and does not create a hidden cross-feature visitor identity graph.
6. **Accountability** — privileged moderation actions are auditable without logging sensitive payloads unnecessarily.
7. **Safe failure** — security/control failures do not silently become success.

---

## 4. Explicit non-goals

The portfolio is not attempting to provide:

- e-sports-grade trusted game execution;
- anonymous publishing that is impossible to moderate;
- end-to-end encrypted messaging;
- high-assurance multi-tenant enterprise RBAC;
- malware-safe arbitrary visitor file hosting;
- a public API platform for third parties;
- a generic URL fetch/proxy service;
- a generic HTML/Markdown publishing platform for visitors;
- a custom authentication or cryptographic protocol;
- perfect bot prevention;
- perfect anonymity against infrastructure providers that necessarily observe network traffic.

Security controls must match the actual product rather than pretending to solve problems outside scope.

---

## 5. Verification standard

OWASP ASVS 5.0 is the primary external verification catalog for implementation reviews.

Baseline target:

- applicable **ASVS Level 1** requirements across the public application;
- applicable **Level 2** controls for Admin/Auth, privileged mutations, sensitive runtime data and other higher-risk boundaries;
- additional project-specific controls in this document where ASVS does not capture the portfolio's exact abuse/game/community model.

ASVS is a verification framework, not a substitute for the product threat model.

---

## 6. Protected assets

## 6.1 High-value assets

Highest-value assets include:

- Supabase secret/server credentials;
- Resend/API provider secrets;
- Turnstile secret;
- GitHub private server credential if one is introduced;
- `CRON_SECRET`;
- abuse-HMAC keys;
- Admin password/MFA factors/tokens/cookies;
- Supabase Auth recovery/session artifacts;
- production environment configuration;
- Admin authorization state;
- moderation/audit integrity;
- Arcade session/signing/verification state;
- private provider/webhook signing secrets.

These must never be serialized into public HTML/RSC payloads, client bundles, browser storage, analytics or ordinary logs.

## 6.2 Sensitive runtime data

Sensitive-but-not-secret data includes:

- pending/rejected/hidden community submissions;
- reports and private moderation notes;
- scoped abuse hashes and bans;
- Arcade evidence/session metadata;
- admin audit events;
- provider delivery IDs and safe error metadata;
- admin profile identifiers;
- contact operation metadata;
- security incident evidence.

## 6.3 Public data

Public data includes only deliberate projections such as:

- canonical professional content;
- approved Guestbook entries;
- approved safe Sketch previews;
- accepted leaderboard rows;
- curated/normalized provider-derived public data;
- public status/Changelog/SEO information.

The existence of a row in PostgreSQL does not make that row public.

---

## 7. Threat actors

The model considers at least these actors:

### T1 — opportunistic web attacker

Uses standard scanners, common exploit payloads and publicly known framework vulnerabilities.

### T2 — spam/bot operator

Automates Contact, Guestbook, Sketch, Report, Reaction or Arcade endpoints for spam, abuse, resource consumption or visibility.

### T3 — game cheater

Modifies client code, requests and local state to forge/replay scores or bypass gameplay rules.

### T4 — malicious content submitter

Attempts stored XSS, visual spoofing, oversized drawings, Unicode tricks, moderation bypass or harmful content.

### T5 — credential attacker

Attempts password stuffing, account recovery abuse, session theft, MFA bypass or Admin route probing.

### T6 — malicious/compromised provider or feed

Returns malformed, oversized, deceptive or hostile remote data.

### T7 — supply-chain attacker

Targets npm/pnpm dependencies, build scripts, GitHub Actions, compromised maintainer packages or source-control secrets.

### T8 — accidental operator/developer error

Misconfigures RLS, exposes a secret, weakens CSP, deploys wrong environment values or introduces unsafe code.

The architecture does not assume sophisticated nation-state targeting but should avoid controls that collapse under trivial targeted abuse.

---

## 8. Trust boundaries

The canonical trust model is:

```text
UNTRUSTED INTERNET
    │
    ├── browser visitor
    ├── bots/attackers
    ├── provider callbacks
    └── remote feeds/APIs
    │
    ▼
┌────────────────────────────────────────────┐
│ EDGE / HOSTING BOUNDARY                    │
│ TLS / platform request processing          │
└────────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────────┐
│ NEXT.JS SERVER BOUNDARY                    │
│ validation / origin / auth / abuse policy  │
│ application services / provider adapters   │
└────────────────────────────────────────────┘
    │                    │
    │                    ├── verified providers
    │                    │
    ▼                    ▼
┌─────────────────┐  ┌───────────────────────┐
│ SUPABASE        │  │ EXTERNAL SERVICES     │
│ Postgres/Auth   │  │ Resend/GitHub/etc.    │
└─────────────────┘  └───────────────────────┘
    │
    ▼
PRIVILEGED DATA/SECRET ZONE
```

An authenticated browser remains **partially untrusted**. Admin authentication proves identity; it does not make browser input safe.

---

## 9. Security zones

## Zone Z0 — public static/core content

Lowest risk, read-only, repository-derived.

## Zone Z1 — public interactive local state

Theme, Widget Field layout, input mode, local achievements and other device-only preferences. Untrusted but normally not server-persistent.

## Zone Z2 — public server writes

Contact, Guestbook, Sketch, Reports, Reactions, Arcade session/finalization. Highest public abuse pressure.

## Zone Z3 — privileged Admin

AAL2 authenticated, allowlisted user, server authorization on every privileged action.

## Zone Z4 — privileged infrastructure/data

Secret-key Supabase access, database functions, provider secrets, cron, build/deployment secrets.

Crossing into a higher zone always requires an explicit server-side policy gate.

---

## 10. STRIDE-oriented threat categories

The project uses STRIDE as a brainstorming tool, not as a rigid documentation bureaucracy.

| Category | Portfolio examples |
|---|---|
| Spoofing | fake Admin identity, forged webhook, forged Turnstile claim |
| Tampering | score manipulation, moderation-state mutation, request-field modification |
| Repudiation | privileged action without audit trail |
| Information Disclosure | secret in client bundle, hidden moderation content leaked, verbose error |
| Denial of Service | oversized Sketch, public-write flood, provider fan-out, expensive leaderboard query |
| Elevation of Privilege | browser invoking privileged RPC, AAL1 accessing Admin, secret-key exposure |

Every implementation review should ask these six questions at each trust boundary.

---

## 11. Risk classification

Security findings use four project-level severities:

- **CRITICAL** — direct privileged compromise, secret leakage with broad access, RCE or equivalent catastrophic integrity loss;
- **HIGH** — Admin bypass, persistent XSS reaching Admin, public access to private runtime data, meaningful leaderboard/moderation tampering;
- **MEDIUM** — bounded abuse, limited data disclosure, CSRF on non-critical state, resource-exhaustion paths with constraints;
- **LOW** — low-impact hardening gaps with no meaningful exploit path alone.

CRITICAL/HIGH production findings block release until fixed or explicitly accepted through an ADR/security exception with scope, owner and expiration.

---

## 12. Security ownership by layer

Security is intentionally duplicated as **defense in depth**, but ownership is not ambiguous.

```text
Browser UX
→ helpful validation only

Next.js transport boundary
→ origin/body/auth/request checks

Application service
→ operation authorization/abuse/business policy

Repository / DB
→ constraints/grants/transaction integrity

Provider adapter
→ provider authentication/response validation
```

No layer assumes another makes untrusted input trustworthy forever.

---

## 13. Server-only module boundary

Privileged code must use explicit server-only boundaries.

Server-only modules include:

- privileged Supabase client;
- secrets/config loaders;
- provider adapters containing secrets;
- Admin authorization helpers;
- abuse-key derivation;
- rate-limit persistence/decision logic;
- Arcade server verification;
- webhook verification;
- cron execution logic.

They must not be imported from Client Components.

Build/test gates must detect accidental client exposure.

---

## 14. Public DTO rule

A server object containing a secret/sensitive field must never be passed wholesale into a Client Component and then “ignored” there.

Use deliberate projections:

```text
Database/Admin model
        ↓ explicit mapper
Public DTO
        ↓
Client Component
```

Serialization is a security boundary.

---

## Input and injection security

## 15. Server validation is authoritative

Every write validates server-side:

- type;
- requiredness;
- length;
- enum membership;
- numeric bounds;
- collection size;
- nested depth;
- identifier format;
- locale/value normalization;
- operation/version metadata;
- cross-field invariants.

Client validation exists for UX only.

---

## 16. Unknown-field policy

Public write schemas reject or strip unknown fields deliberately; they do not persist arbitrary JSON sent by a client.

Security-sensitive protocols such as Arcade and Sketch should prefer rejection for unknown protocol fields so version drift cannot silently introduce behavior.

---

## 17. Unicode normalization

User-visible strings preserve legitimate display form where possible, but comparison/risk paths may maintain a normalized representation for:

- duplicate/spam checks;
- profanity heuristics;
- nickname comparisons;
- suspicious invisible/control characters.

Normalization must not rewrite content silently for publication without clear rules.

Control characters not required for the feature are rejected.

---

## 18. HTML policy

Visitor-generated content does not accept arbitrary HTML.

Baseline:

- Guestbook message → plain text;
- nickname → plain text;
- Report details → plain text;
- Sketch text objects → plain text;
- Arcade nickname → plain text;
- Contact fields → plain text/validated email;
- external feed summaries → normalized text only unless a separately audited sanitizer is introduced.

No UGC feature requires HTML in V1.x.

---

## 19. `dangerouslySetInnerHTML`

`dangerouslySetInnerHTML` is prohibited for visitor/provider content.

If a future framework/library use genuinely requires it, usage must be isolated in one audited utility/component with a documented trusted source or sanitizer and a security test.

---

## 20. Stored-XSS priority

Stored XSS that reaches `/admin` is treated as a **HIGH** risk because Admin renders untrusted pending/reported content.

Therefore:

- Admin previews escape UGC exactly like public views;
- moderation does not render “raw HTML for convenience”;
- provider/feed content remains text-safe in Admin;
- no privileged page assumes content is safe because it came from PostgreSQL.

---

## 21. Authored Markdown policy

Repository-authored professional Markdown is trusted project source, but the renderer remains constrained:

- MDX/arbitrary executable JSX is not required by default;
- raw HTML is disabled unless a specific authored use is reviewed;
- component embedding uses an allowlisted mapping;
- external links receive safe link attributes;
- build-time validation catches malformed content.

Repository authorship is a stronger trust boundary than public UGC, not a reason to permit arbitrary runtime execution.

---

## 22. SQL injection

SQL injection defenses are structural:

- Supabase/PostgREST SDK parameters rather than string-built SQL;
- fixed SQL in migrations/functions;
- function arguments for values;
- no client-controlled table/column/order SQL identifiers;
- dynamic SQL avoided; where unavoidable, identifiers come only from server-owned allowlists and are safely quoted;
- no raw SQL endpoint accepts a query fragment.

The privileged secret client does not make unsafe SQL safe.

---

## 23. Command injection

Runtime requests must not construct shell commands from visitor/provider input.

RenderCV/Typst and build tooling operate on repository-controlled source in CI/build contexts, not arbitrary public request bodies.

If any future feature introduces child-process execution, it requires a separate threat-model amendment.

---

## 24. Path traversal

File paths are never constructed directly from raw request values.

Project/content slugs are resolved through validated registries, not `../`-capable filesystem concatenation.

Any download/artifact route maps stable identifiers to known server-owned files.

---

## 25. Prototype-pollution/object merge safety

Untrusted JSON is schema-parsed into fresh typed objects.

Do not recursively merge arbitrary request/provider objects into configuration/application state.

Keys such as `__proto__`, `constructor` or unexpected nested structures never become trusted configuration through generic merge helpers.

---

## Browser/content security

## 26. Content Security Policy objective

Production must enforce a deliberate CSP designed around actual required origins.

The target characteristics are:

- `default-src 'self'` baseline;
- `object-src 'none'`;
- `base-uri 'none'` or `'self'` only if a concrete need exists;
- `frame-ancestors 'none'`;
- `form-action 'self'`;
- scripts restricted to self and explicitly required trusted mechanisms/origins;
- **no `unsafe-eval` in production**;
- styles/fonts/images/connect/frame/worker directives explicitly bounded;
- Turnstile origins added only to the directives it actually requires;
- no broad `https:`/`*` shortcuts as a substitute for maintaining policy.

---

## 27. CSP implementation strategy

Exact nonce/hash/SRI mechanics depend on the pinned Next.js release and caching model.

Before production, a prototype gate must compare:

1. strict nonce-based CSP;
2. build-generated hashes/SRI where supported;
3. any required framework-safe hybrid.

The chosen mechanism must preserve the approved caching/rendering architecture without weakening script policy casually.

CSP initially runs in `Report-Only` during hardening, then moves to enforcement before public UGC/Admin launch.

---

## 28. CSP waiver rule

Any need for `unsafe-inline` in `script-src` or `unsafe-eval` requires a documented security exception and remediation path.

A temporary `style-src` concession, if framework/runtime styling requires it, is distinct from script execution and still must be minimized.

---

## 29. Trusted Types

Trusted Types / `require-trusted-types-for 'script'` may be enabled as an additional XSS defense only after Next.js/library compatibility is verified.

It is a hardening enhancement, not a reason to delay the baseline CSP/XSS controls.

---

## 30. Security headers

Production responses establish at least:

- `Content-Security-Policy`;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: strict-origin-when-cross-origin` unless a stricter tested policy is suitable;
- `Permissions-Policy` disabling capabilities the portfolio does not use;
- HSTS after HTTPS/domain readiness is verified;
- anti-framing through CSP `frame-ancestors` (with legacy `X-Frame-Options: DENY` acceptable as defense in depth);
- explicit caching rules on private/Admin/security responses.

`robots.txt`/`noindex` are discoverability controls, never security controls.

---

## 31. HSTS rollout

Do not enable irreversible/preload-style HSTS configuration blindly on a domain before all required subdomains and HTTPS behavior are ready.

DOC-48 owns the rollout sequence.

---

## 32. Permissions Policy

Disable unused capabilities such as camera, microphone, geolocation, payment, USB/sensors and other powerful features unless a documented feature needs them.

Do not accidentally disable Gamepad/fullscreen/clipboard behavior required by approved features; the final header is tested against Arcade and utility experiences.

---

## 33. Cross-origin isolation

COOP/COEP/CORP are not enabled merely as fashionable headers.

If a future WebAssembly/shared-memory or other capability requires cross-origin isolation, it receives compatibility/security review because these headers can affect Auth/provider popups/resources.

---

## 34. Mixed content

Production assets/providers use HTTPS.

No feature relies on active mixed content or HTTP downgrade behavior.

---

## CSRF, origin and browser-request policy

## 35. Same-origin baseline

The portfolio does not expose a general cross-origin browser API.

Browser writes are same-origin by default.

CORS is not configured as `*` for credentialed/private routes.

---

## 36. Public writes and cross-site abuse

Even accountless public writes can be abused through cross-site form/request triggering.

Contact, Guestbook, Sketch, Reports and Arcade mutations therefore use defense in depth:

- accepted HTTP method/content type;
- Origin/Host validation where browser-originated;
- Fetch Metadata (`Sec-Fetch-*`) as supporting signal where reliably present;
- CSRF-resistant framework behavior where applicable;
- Turnstile/rate/idempotency controls according to feature policy;
- no sensitive mutation via GET.

---

## 37. Admin CSRF policy

Every cookie-authenticated privileged mutation must be CSRF-resistant.

For Server Actions:

- use the framework's current Server Action origin protections;
- configure any allowed-origin override narrowly;
- re-check Admin authorization inside the action;
- never treat framework CSRF behavior as a replacement for authorization.

For any cookie-authenticated Route Handler:

- enforce same-origin Origin/Host policy;
- use Fetch Metadata defense where appropriate;
- add a dedicated CSRF token mechanism if the endpoint cannot rely safely on the framework's action protections.

---

## 38. Origin parsing

Origin/Host comparison uses canonical configured origins, not substring/suffix tricks.

Production allowed origins are explicit.

Preview/local origins are environment-scoped and cannot become production wildcards.

---

## 39. CORS policy

Default CORS policy is **no cross-origin access** beyond browser navigation/public asset behavior.

If a future external consumer requires CORS, it receives a route-specific allowlist and an ADR rather than enabling broad global CORS.

---

## SSRF and remote-resource security

## 40. SSRF baseline

V1.x intentionally avoids public user-supplied server fetch URLs.

This is the strongest SSRF defense for the current product.

GitHub/Tech Pulse/provider endpoints come from server-owned allowlisted configuration.

---

## 41. Allowed remote schemes

External HTTP integrations use `https:` by default.

Reject unexpected schemes such as:

- `file:`;
- `ftp:`;
- `gopher:`;
- `data:`;
- `javascript:`;
- local socket/custom schemes.

Any exceptional provider protocol requires review.

---

## 42. Remote host allowlist

Provider/feed hosts are configured explicitly.

The application must not accept a visitor query like:

```text
/api/fetch?url=https://...
```

for arbitrary server-side fetching.

---

## 43. Private-network protection

If future requirements introduce partially dynamic remote URLs, the fetch layer must additionally reject loopback, link-local, private/reserved destinations and unsafe redirects after DNS resolution.

The current allowlist architecture means this complexity is not required for normal V1.x behavior.

---

## 44. Redirect policy

Provider adapters bound redirect count and validate the final destination against the integration's permitted policy.

A trusted initial URL does not automatically make every redirect target trusted.

---

## 45. Next/Image remote policy

Remote image optimization patterns are explicit and narrow.

Tech Pulse does not proxy arbitrary article images in the baseline. Project media is controlled repository/public content.

Do not solve image convenience by configuring an unrestricted remote image wildcard.

---

## Request/resource exhaustion controls

## 46. Request body limits

Every public write has a finite body limit appropriate to the feature.

The exact byte/shape limits are implementation constants verified by DOC-50 and may be tuned within the approved security posture; categories remain separate:

- Contact/Guestbook/Reports/Reactions → small;
- Admin commands → small;
- Arcade protocol → small/bounded;
- Sketch logical model → larger but still strictly bounded.

The Drawing route does not inherit an unnecessarily large global body limit simply because Sketch needs more capacity.

---

## 47. Structural complexity limits

Sketch validation limits:

- total object/stroke count;
- points per stroke;
- total points;
- text objects and text length;
- coordinate magnitude;
- allowed tool/style enum values;
- nesting depth;
- serialized byte size;
- renderer time/output dimensions.

This protects both persistence and server preview rendering.

---

## 48. Pagination/bounded queries

Public and Admin list endpoints use explicit maximum page sizes.

No public request can ask for `limit=1000000` or an unbounded moderation/leaderboard scan.

---

## 49. Expensive provider work

A visitor request does not synchronously fan out to multiple providers.

DOC-46 cache/lease architecture is part of DoS defense as well as performance.

---

## 50. Regex/ReDoS

Validation/profanity patterns must avoid attacker-controlled catastrophic-backtracking expressions.

Prefer bounded parsing, simple patterns and tested libraries for complex validation.

---

## Pseudonymous abuse context

## 51. Raw IP policy

The application does not persist raw visitor IP addresses as its default abuse identity.

Infrastructure providers may necessarily process network addresses, but application persistence should derive an opaque scoped key and discard raw request IP after immediate request/security processing unless an active incident/legal requirement justifies short-lived retention.

---

## 52. Trusted client-network source

The server derives client network information only from the hosting platform's trusted request context/forwarding headers.

It does not blindly trust an arbitrary left-most `X-Forwarded-For` supplied by the internet.

DOC-48 documents the deployment-specific trusted proxy model.

---

## 53. Abuse-key construction

Baseline conceptual derivation:

```text
canonical client network value
        +
feature namespace
        +
key version/domain separation
        ↓
HMAC-SHA-256 with server-only abuse key
        ↓
opaque byte value
```

Use a dedicated abuse-HMAC secret, not a database/provider/Auth secret.

---

## 54. Feature namespaces

Separate namespace/domain keys are used for at least:

- `contact`;
- `guestbook`;
- `sketch`;
- `reports`;
- `reactions`;
- `arcade`.

A hash from one feature must not become the natural join key for another feature.

---

## 55. No fingerprint identity

The abuse key is not a visitor account and does not combine broad browser fingerprinting signals to create a persistent identity.

User-Agent, canvas fingerprint, installed-font fingerprint and precise device fingerprints are not baseline identity material.

Additional risk signals may be used transiently for abuse decisions without creating a durable cross-feature profile.

---

## 56. Key rotation

Abuse-HMAC storage already carries a key version.

Rotation policy:

- new writes use the current key version;
- for a bounded migration/enforcement window, checks may compare current and previous versions where required;
- old keys are retired after the retention/enforcement window;
- rotation does not require deanonymizing stored subjects.

Exact secret/key rotation cadence is operational policy in DOC-48; retention compatibility for data carrying a key version follows DOC-44/DOC-47.

---

## 57. Ban scope

A ban is explicit about:

- subject namespace;
- enforcement scope;
- reason category;
- creation/revocation audit;
- expiration or permanence decision.

A Guestbook abuse signal does not silently ban Arcade. The V1.x baseline supports **feature-scoped bans only**. If a live incident requires blocking the same transient network context across multiple public-write surfaces, the server may create separate feature-scoped ban rows while that trusted network value is still in memory; it does not persist a universal cross-feature subject.
## 57A. Request/payload fingerprint cryptography

Idempotency/content fingerprints are **not** abuse identities and use a separate cryptographic domain.

Baseline:

```text
canonical operation-specific payload bytes
+ operation-kind domain label
+ fingerprint key version
        ↓
HMAC-SHA-256 using REQUEST_FINGERPRINT_HMAC_KEY_V1
        ↓
stored request_fingerprint + fingerprint_key_version
```

Canonicalization rules:

- validate against the operation schema first;
- normalize line endings to LF and text to Unicode NFC where semantically safe;
- trim only fields whose product schema already defines trimming;
- serialize a fixed field order/canonical JSON representation;
- include an operation domain label such as `contact:v1`, `guestbook:v1`, `report:v1`;
- never include unrelated network-abuse subject material;
- do not reuse `ABUSE_HMAC_KEY_V1` as the fingerprint key.

New writes use the current fingerprint key version. Previous keys may remain available only for the bounded retention interval needed to compare existing idempotency rows, then are retired.


---

## Rate-limit architecture

## 58. Rate limiting is layered

No single universal `10 requests/minute` rule fits the product.

Controls may combine:

- short burst limits;
- longer rolling-window limits;
- per-operation cooldown;
- per-abuse-key counters;
- global/provider-safety caps;
- Arcade session concurrency;
- ban checks;
- Turnstile/risk gates.

Exact thresholds are configured centrally and tuned from evidence.

---

## 59. Feature-specific policy

Risk order is roughly:

```text
read-only public GET
< reactions/report initiation
< contact/community submission
< sketch publication
< arcade session/finalization
< admin/security mutation
```

Admin is protected mainly through authentication/authorization rather than anonymous rate identity, but sensitive endpoints still receive brute-force/provider rate controls.

---

## 60. Rate-limit result

A rate-limited operation returns a stable application error such as `RATE_LIMITED`, not a database/provider exception.

Where appropriate the UI may receive a safe retry-after duration.

Do not reveal detailed anti-abuse thresholds that make bypass materially easier.

---

## 61. Rate limiting is not authorization

Passing a rate limit never means a request is valid/authorized/human.

Rate limiting is one signal/control in a broader chain.
## 61A. Initial public-write rate-limit policy

The initial V1.x server policy is deterministic and centrally configured. Values are operational defaults, not public contractual entitlements, and may be tightened/relaxed through measured security operations without changing product semantics.

| Policy ID | Scoped subject | Burst/short window | Rolling/day window | Additional invariant |
|---|---|---:|---:|---|
| `contact_submit` | `contact` abuse key | 3 / 15 min | 10 / 24 h | human verification + provider/global safety cap |
| `guestbook_submit` | `guestbook` abuse key | 3 / 15 min | 10 / 24 h | pending moderation |
| `sketch_publish` | `sketch` abuse key | 2 / 15 min | 6 / 24 h | drawing complexity limits + moderation |
| `report_submit` | `reports` abuse key | 5 / 15 min | 20 / 24 h | dedup/open-report constraints |
| `reaction_write` | `reactions` abuse key | 30 / 10 min | 200 / 24 h | only if reactions ship |
| `arcade_session_issue` | `arcade` abuse key | 20 / 10 min | 250 / 24 h | session concurrency cap also applies |
| `arcade_finalize` | `arcade` abuse key | 30 / 10 min | 250 / 24 h | session single-finalize/idempotency also applies |
| `admin_login_edge` | `admin-auth` abuse key | 10 / 15 min | 30 / 24 h | Supabase/provider Auth controls remain authoritative too |

Global/provider safety caps are separately configured to protect quotas/reputation and are not used as a substitute for feature-scoped controls. `RATE_LIMITED` may include a coarse safe retry-after value but not internal counter state.

Rate-limit buckets are persisted through DOC-44's PostgreSQL-backed atomic repository/RPC baseline and are purged 48 hours after their window ends.

## 61B. Data-retention and accountless privacy policy

DOC-44's retention matrix is the canonical operational schedule consumed by Security. Security requirements add these invariants:

- retention is purpose-limited and no listed horizon silently becomes “forever”;
- security/legal holds are exceptional, scoped and audited;
- self-service deletion capability is random high-entropy authorization for one resource, not user identity;
- deletion-token plaintext is never logged, sent to analytics, included in URLs/referrers, or stored server-side;
- capability digests are not used as cross-feature join keys;
- hard-purge jobs invalidate/refresh any public cached projection/preview derived from deleted content;
- Admin/audit may preserve minimal action/target metadata after payload deletion, but not a hidden copy of the deleted message/drawing;
- the portfolio makes no promise to correlate all contributions from one person because it intentionally lacks universal visitor identity.

Manual privacy requests without a valid capability are handled conservatively and cannot weaken abuse/security evidence beyond the bounded retention policy without an explicit Admin decision and audit event.


---

## Human verification / Turnstile policy

## 62. Turnstile role

Turnstile is an anti-automation signal, not identity and not authorization.

Every token is verified server-side through DOC-46's `HumanVerificationGateway` before it influences policy.

---

## 63. Mandatory verification surfaces

Baseline public side-effect operations require successful human verification before durable/external effect at launch:

- Contact send;
- Guestbook submit;
- Sketch publish;
- Report submit.

A Reaction endpoint may use a lighter/adaptive policy because its effect is low-value and reversible, but still receives rate/abuse controls.

---

## 64. Arcade Turnstile policy

Turnstile is **not required on every gameplay result** because that would damage gameplay UX.

Arcade primarily relies on:

- server-issued sessions;
- expiry;
- protocol/rules versions;
- plausibility/evidence;
- replay/idempotency defenses;
- scoped rate limits.

Turnstile may be required at session issuance or adaptively for suspicious/high-volume contexts. If the challenge is invoked, successful verification is required before issuing the protected session.

---

## 65. Admin does not use Turnstile as MFA

Admin security uses Supabase Auth + password + mandatory TOTP AAL2 + allowlist.

Turnstile may reduce login abuse at the provider/app edge if introduced, but it never replaces a factor or authorization.

---

## 66. Turnstile unavailable policy

For mandatory human-verification public writes:

```text
HumanVerification = UNAVAILABLE/MISCONFIGURED
        ↓
FAIL CLOSED for the side effect
        ↓
preserve visitor input
show clear temporary-unavailable state
allow retry when verification recovers
```

The system must not silently send/publish because the anti-bot provider is unavailable.

For Contact, the UI should expose existing alternative public professional contact links where appropriate so provider outage does not trap the visitor completely.

---

## 67. Turnstile reject/expiry behavior

`REJECTED` or `EXPIRED_OR_USED` does not erase user input.

The client obtains a fresh challenge and retries with the same logical `operationId` where idempotency semantics allow it.

---

## 68. Turnstile privacy

Do not persist the raw Turnstile token.

Store only bounded verification outcome/diagnostic metadata if operationally necessary and privacy-appropriate.

---

## Feature-specific security

## 69. Contact threat model

Primary threats:

- automated spam/mail flooding;
- email-header injection;
- duplicate delivery/retry amplification;
- PII leakage through logs/database;
- cross-site submission;
- provider outage misreported as success.

Controls:

- strict Name/Email/Message schemas and limits;
- fixed destination address;
- fixed/allowlisted subject model;
- visitor email validated and passed only through structured provider fields;
- Turnstile mandatory;
- feature-scoped rate limit;
- same-origin policy;
- stable `operationId`/provider idempotency;
- no message-body persistence baseline;
- no body logging/analytics;
- safe provider error mapping.

---

## 70. Email header safety

Untrusted values are never concatenated into raw email headers.

The application uses provider SDK/API structured fields. `from` and recipient destinations are server-owned. Any visitor `replyTo` value is validated as an email address and handled through the provider's typed field.

---

## 71. Guestbook threat model

Primary threats:

- stored XSS;
- spam/profanity/flooding;
- impersonation-by-nickname;
- malicious links/social engineering;
- moderation bypass;
- duplicate/replay submissions.

Controls:

- plain text only;
- bounded nickname/message;
- no verified-identity implication for nickname;
- no automatic trusted rich-link rendering;
- Turnstile;
- scoped rate/bans;
- pending moderation by default;
- idempotent submission;
- public projection only from `approved` state.

---

## 72. Nickname semantics

Public nicknames are labels, not authenticated identities.

UI copy/styling must not imply that `Alejandro`, a company name or another person's name is verified merely because someone typed it.

Reserved/system names may be blocked when impersonation/confusion risk is meaningful.

---

## 73. Sketch threat model

Primary threats:

- JSON/resource bombs;
- unsafe SVG/script generation;
- stored text XSS;
- inappropriate visual content;
- renderer DoS;
- arbitrary upload/storage abuse;
- publication bypass.

Controls:

- logical model only, not arbitrary files;
- strict schema/complexity/size limits;
- allowlisted drawing primitives/styles;
- plain-text objects escaped by renderer;
- server canonicalization;
- moderation before public gallery;
- safe server-generated preview;
- Turnstile + scoped rate/bans;
- no external image/reference primitive in V1.x.

---

## 74. Sketch preview format

Preferred public preview is a rasterized PNG/WebP generated from the validated model when practical.

If SVG is used:

- it is generated exclusively by our renderer;
- no `<script>`;
- no event handler attributes;
- no `foreignObject`;
- no external URLs/resources;
- no user-controlled element/attribute names;
- text is escaped;
- response has explicit safe content type and `nosniff`;
- renderer security tests verify the output grammar.

Client-supplied SVG is never served.

---

## 75. Reports threat model

Reports can themselves be abused for harassment/flooding.

Controls:

- reports remain independent from content state;
- plain-text bounded reason/details;
- reason enum where possible;
- Turnstile;
- scoped rate limits/deduplication;
- duplicate open-report suppression per approved abuse context/reason;
- no automatic hiding solely because report count crosses a trivial threshold unless a future documented policy intentionally adds it.

---

## 76. Reactions threat model

Reactions are low-trust social signals.

They must not become a hidden popularity/identity system.

Baseline controls:

- bounded reaction enum;
- rate limit;
- scoped dedupe where appropriate;
- no raw IP storage;
- no user-profile creation;
- display counts treated as approximate community activity, not identity verification.

---

## Arcade security

## 77. Arcade trust boundary

The entire game client is attacker-controlled from the server's perspective.

It may honestly render/gameplay for normal visitors, but it cannot attest that code, timers or local state were not modified.

---

## 78. Session authority

Only the server creates an eligible Arcade session.

A session binds at least:

- session ID;
- game ID;
- protocol version;
- rules version;
- leaderboard version;
- issued/expiry times;
- server-known eligibility metadata;
- scoped abuse context where required.

Client-generated “sessions” are invalid.

---

## 79. Finalization one-time rule

A session finalizes at most once.

Replay/concurrent finalization is defeated by:

- session state check/lock;
- result fingerprint/idempotency;
- atomic session + score transaction;
- unique score `session_id` constraint.

---

## 80. Plausibility checks

Checks may include game-specific relationships such as:

- score bounds;
- elapsed-time bounds;
- event/count relationships;
- impossible-rate detection;
- protocol/rules compatibility;
- evidence consistency;
- expiry/session lifecycle;
- abnormal repeated-session behavior.

Exact game formulas live with each game rules implementation/tests, not as client-only code.

---

## 81. Anti-cheat honesty

A passed plausibility check means “accepted under portfolio anti-cheat policy,” not cryptographically proven legitimate human gameplay.

Leaderboard UI/content must not imply stronger assurance.

---

## 82. Arcade evidence privacy

Anti-cheat evidence is bounded to what is required for plausibility/security.

Do not record full keystroke histories, precise continuous mouse trajectories or other invasive behavior merely to increase anti-cheat confidence.

---

## 83. Arcade session theft

A public session token/ID is treated as a bearer-like temporary capability if possession is sufficient to finalize.

Therefore:

- high entropy/unpredictability;
- short expiry;
- no exposure in third-party analytics/URLs/referrers unnecessarily;
- finalize only under the expected game/version/session state;
- rate/abuse checks around issuance/finalization.

Do not place sensitive session secrets into shareable URL query strings.

---

## Admin/Auth security

## 84. Admin baseline

DOC-45 remains authoritative:

```text
password
+
TOTP MFA
+
AAL2
+
active admin_profiles allowlist
=
AdminPrincipal
```

No UI visibility/route secrecy substitutes for this chain.

---

## 85. Reauthorization on mutations

Every privileged mutation reconstructs/verifies the Admin principal at request time.

A page rendered while authorized does not grant future mutation permission automatically.

---

## 86. Admin cache policy

Admin/security routes are private and `no-store` by default unless a specifically proven safe private caching mechanism is introduced.

No shared cache may capture:

- Admin identity;
- moderation queue;
- reports;
- audit events;
- security state.

---

## 87. AAL downgrade/revocation

If the current Auth state is no longer AAL2 or `admin_profiles.disabled_at` becomes non-null, privileged operations fail immediately at the next server authorization check.

Long-lived UI state never overrides current authorization.

---

## 88. Login enumeration

Login/recovery UX avoids unnecessary account-existence disclosure.

Recovery responses remain generic where the provider supports this behavior.

---

## 89. Open redirect prevention

Auth callback/recovery `returnTo`/next destinations are validated against server-owned relative routes/allowlisted origins.

No arbitrary external redirect is accepted from a query parameter.

---

## 90. Session/token handling

Auth access/refresh tokens and cookies:

- never enter analytics;
- never enter error messages;
- never enter ordinary logs;
- are not copied into localStorage manually outside the Auth architecture;
- are not passed to Client Components unless the Auth client genuinely requires its standard managed session mechanism;
- are excluded from URLs whenever possible.

---

## 91. Admin UGC rendering

Admin is the most dangerous place to render untrusted UGC because successful stored XSS there can become privilege escalation.

All pending/report content uses the same escaping/safe-rendering rules as public content or stricter ones.

---

## 92. Destructive/admin security actions

Actions such as hide, reject, ban, revoke ban or security changes require:

- authenticated AAL2 Admin;
- server authorization;
- explicit target/version;
- optimistic concurrency where defined;
- audit event;
- user confirmation when destructive/high-impact.

---

## 93. Security settings

Any future UI that changes Admin email, password, MFA factors or other security-sensitive account settings requires recent/appropriate Auth verification and is not treated like an ordinary profile edit.

Exact provider flow follows current Supabase Auth guarantees.

---

## Database/security boundary

## 94. Browser database access

DOC-44 baseline remains:

> Public/runtime domain tables are not a direct browser data API.

Public/visitor features go through the Next.js backend/application services.

Authenticated Admin browser code also does not receive privileged DB authority.

---

## 95. Secret-key client

Supabase secret-key client is server-only and bypasses RLS by design.

Therefore every use requires an application/repository boundary that has already performed appropriate authorization/policy checks.

It must never be treated as “safe because RLS exists.”

---

## 96. RLS and grants

RLS/grants remain defense in depth and are tested even when normal traffic uses server repositories.

Migration rule:

```text
new table/function
→ grants
→ RLS/policies if exposed
→ privilege revocation
→ security tests
```

No production table is temporarily left permissive pending later hardening.

---

## 97. PostgreSQL function security

Privileged SQL functions/RPCs:

- fixed purpose;
- typed arguments;
- no arbitrary identifiers/SQL;
- explicit execution grants;
- safe `search_path` treatment where security-definer semantics are used;
- ownership reviewed;
- cannot be executed by public/authenticated browser roles unless explicitly intended;
- return only required fields.

---

## 98. Audit integrity

Admin audit rows are append-only during normal application behavior.

A privileged mutation and its audit event are committed atomically when the persistence model supports it.

Admin UI does not expose normal edit/delete controls for audit history.

---

## Secrets and cryptographic material

## 99. Secret classes

Separate secrets by purpose:

- Supabase server secret;
- provider/API secrets;
- Turnstile secret;
- cron secret;
- abuse-HMAC secret;
- webhook signing secrets;
- CI/deployment credentials.

One leaked provider key should not automatically compromise unrelated cryptographic controls.

---

## 100. Environment separation

Production, preview/staging and development use separate secrets/credentials where providers support it.

Production secrets are not injected into generic PR previews.

---

## 101. Public environment variable naming

Only values intentionally safe for the browser receive `NEXT_PUBLIC_*` or equivalent client exposure.

A variable being “needed by frontend code” is not sufficient reason to expose a server secret; the architecture should route the operation through the server.

---

## 102. Secret rotation

Every secret class has a known rotation/revocation path before launch.

After suspected exposure:

1. revoke/rotate affected secret;
2. deploy updated config;
3. invalidate/review affected sessions if applicable;
4. search logs/repository/build artifacts for exposure;
5. assess data/action scope;
6. document the incident and preventive action.

---

## 103. No home-grown crypto

Use standard HMAC/hash/token APIs and provider Auth primitives.

Do not invent custom encryption/signature algorithms or store reversible “encrypted passwords.”

---

## External provider/feed security

## 104. Provider responses remain untrusted

GitHub, RSS/Atom feeds, Turnstile responses, Resend responses and future providers are schema/size validated.

A reputable provider can be compromised or return unexpected data.

---

## 105. External HTML

Tech Pulse/provider content does not inject raw external HTML into the DOM.

Store/render bounded normalized metadata/text.

---

## 106. External links

Provider/article links are normalized to approved HTTP(S) URLs.

Links opening new tabs use appropriate `rel` protections and cannot execute `javascript:` URLs.

---

## 107. Cache poisoning

Shared caches must not key public output on attacker-controlled headers/cookies ambiguously.

Cache keys include the actual dimensions that affect output (such as locale/content ID/version) and exclude private request state.

Provider-derived durable snapshots are validated before becoming cacheable public data.

---

## 108. Stale data security

Serving stale provider data is allowed only from a previously validated stored snapshot.

A failed refresh does not cause the system to cache an error page, malformed payload or unvalidated provider body as the new good snapshot.

---

## Cron and webhook security

## 109. Cron authentication

Cron endpoints require server-held `CRON_SECRET` Bearer verification as defined in DOC-46.

They are:

- `no-store`;
- not linked publicly;
- safe to invoke repeatedly/idempotently;
- bounded by job leases.

Route obscurity is not considered authentication.

---

## 110. Webhook baseline

No webhook is trusted solely because it calls the expected URL.

Future webhooks require:

- provider signature/auth verification;
- verification using the exact/raw body representation required by the provider;
- timestamp/freshness checks when supported;
- replay/idempotency handling;
- bounded request size;
- normalized parsed event schema;
- secret rotation support.

---

## 111. Webhook failure behavior

Invalid signatures are rejected before event business logic.

Unknown event types are ignored/rejected safely; they do not pass through to generic object mutation.

---

## Dynamic content and media security

## 112. Dynamic OG

Dynamic OG routes treat all strings as data:

- bounded length;
- safe font/rendering path;
- no arbitrary remote HTML;
- no arbitrary remote image URL fetching;
- fallback asset on failure;
- cache key based on validated content identity.

---

## 113. Media viewer

Portfolio media comes from controlled project assets/allowlisted sources.

The Media Viewer does not become a general arbitrary URL embed frame.

Untrusted iframes are not introduced without sandbox/origin analysis.

---

## 114. Downloadable CV/artifacts

Generated CV artifacts use known static paths and content types.

User-controlled input does not select arbitrary filesystem paths.

---

## Local browser state security/privacy

## 115. LocalStorage is untrusted

Theme, Widget Field, onboarding, sound and other local preferences may be modified arbitrarily by users/extensions.

Every read:

- parses through versioned schema;
- clamps enums/sizes;
- resets invalid state safely;
- never turns local state into server authorization.

---

## 116. Remembered name

The locally remembered visitor display name:

- is explicit opt-in/local only;
- is treated as untrusted text;
- is escaped when rendered;
- is never sent automatically with Contact/Guestbook/analytics;
- can be cleared through `Forget me`/local-data reset.

---

## 117. Terminal security

The Easter-egg Terminal is a command palette with predefined commands, not a shell.

It must not implement:

- `eval`;
- arbitrary JavaScript execution;
- OS/process commands;
- arbitrary network requests;
- SQL;
- file access.

Arguments are parsed only for explicitly supported semantic commands.

---

## Privacy and logging

## 118. Data-minimization security rule

If data is not required for the product/security function, do not collect it “because it may be useful later.”

This applies especially to:

- raw IP;
- browser fingerprints;
- Contact message bodies;
- full game input traces;
- precise pointer trajectories;
- unpublished sketches;
- raw Terminal text beyond defined local command execution;
- Auth tokens/factors.

---

## 119. Security logging allowlist

Useful security/operational metadata may include:

- request ID;
- operation ID;
- route/feature;
- safe outcome/error code;
- duration;
- provider normalized outcome;
- abuse-key version/opaque key only where justified;
- Admin ID for privileged audit/security events;
- session/game IDs where appropriate;
- rate-limit decision category.

---

## 120. Log denylist

Never intentionally log:

- passwords;
- TOTP codes/secrets;
- QR enrollment secret;
- access/refresh tokens;
- Auth cookies;
- provider secret keys;
- Turnstile raw token;
- raw Contact message/email unless a narrowly scoped incident process explicitly requires it;
- unpublished raw Sketch body in general logs;
- full abuse input/raw IP by default;
- SQL/database secret connection strings.

---

## 121. Error responses

Public errors expose stable safe codes/messages.

They do not expose:

- stack traces;
- SQL text;
- table/function names;
- internal filesystem paths;
- provider tokens;
- configuration values;
- exact anti-abuse thresholds;
- sensitive moderation state.

---

## Dependency and supply-chain security

## 122. Supported framework requirement

Production must run a supported Next.js/React/runtime combination and include current security fixes for the pinned supported major.

A known critical framework security advisory is a release blocker until the deployment is on a fixed version or the issue is proven inapplicable with documented evidence.

---

## 123. Lockfile reproducibility

Production/CI installation uses the committed lockfile and fails on unexpected lock drift.

Dependency versions are changed through reviewed commits, not opportunistically during deployment.

---

## 124. Dependency minimization

Every dependency increases supply-chain/client/runtime surface.

Prefer:

- platform/framework capability;
- small maintained libraries;
- packages with active support and compatible licenses;
- no unnecessary transitive package for trivial helpers.

A design effect is not sufficient justification for an abandoned package.

---

## 125. Install/build scripts

New dependencies with lifecycle/install scripts, native binaries or broad build behavior receive extra review.

CI must not expose production secrets to arbitrary third-party build code unnecessarily.

---

## 126. Security scanning policy

Repository automation should include, as supported by the hosting/source-control plan:

- dependency vulnerability alerts/scanning;
- secret scanning;
- static analysis/SAST for relevant languages;
- dependency review for PRs changing packages;
- license awareness;
- container/image scanning only if containers become part of deployment.

Exact GitHub workflow/tooling is DOC-51.

---

## 127. Coding-tool security

Development tooling must follow DOC-19 and additionally:

- never paste real secrets into generated code/tests/docs;
- never “fix” RLS/authorization by making it permissive;
- never disable CSP/CSRF/MFA/rate controls merely to make a failing test pass;
- never add `dangerouslySetInnerHTML` for convenience;
- never expose privileged Supabase clients in Client Components;
- never fetch arbitrary user URLs server-side without an approved architecture change;
- never log request bodies/tokens while debugging security issues;
- treat security architecture changes as ADR-worthy when they alter trust boundaries.

---

## Availability and abuse containment

## 128. Professional-core isolation

Security/abuse outage in runtime features must not take down:

- Projects;
- Experience;
- Education;
- Certifications;
- CV;
- authored Making Of;
- public canonical content.

If necessary, runtime writes can be temporarily disabled while the portfolio remains read-only functional.

---

## 129. Emergency write kill switch

Production architecture should support quickly disabling categories such as:

- Contact writes;
- Community submissions;
- Reports/Reactions;
- Arcade session issuance/score finalization;
- external feed refresh.

A kill switch fails the targeted feature clearly; it must not return fake success.

Implementation/config ownership is DOC-48/49.

---

## 130. Admin kill switch

`admin_profiles.disabled_at` remains the immediate application-level Admin revocation control.

If identity compromise is suspected, incident response also revokes provider sessions/factors as appropriate.

---

## Security incident response baseline

## 131. Incident priorities

For a suspected security incident:

1. contain ongoing access/abuse;
2. preserve necessary evidence without increasing sensitive-data collection;
3. rotate/revoke affected secrets/sessions;
4. determine impacted data/actions/time window;
5. patch root cause;
6. verify controls/tests;
7. restore disabled features deliberately;
8. document lessons and architecture changes.

---

## 132. Secret leak playbook

If a secret appears in source/history/logs/artifact:

- assume exposure according to where it was published;
- rotate first, not merely delete the line;
- remove/scrub artifact/history where appropriate after rotation;
- review provider access/audit data;
- add/strengthen scanning/prevention.

Git history deletion without key rotation is insufficient.

---

## 133. Admin compromise playbook

If Admin compromise is suspected:

- set `disabled_at`;
- revoke Supabase Auth sessions;
- reset password;
- remove/re-enroll MFA factors through controlled recovery;
- rotate related credentials if exposed;
- inspect moderation/audit/security logs;
- restore access only after verified AAL2 setup.

---

## 134. Abuse surge playbook

For community/Arcade abuse:

- enable feature kill switch or stricter policy;
- preserve core read experience;
- tighten feature rate/Turnstile gates;
- create scoped bans where justified;
- avoid global fingerprinting escalation as the first response;
- review false-positive/accessibility effects before permanent policy changes.

---

## Security testing and verification gates

## 135. Gate S1 — security baseline before any public launch

Verify:

- supported patched framework/runtime;
- HTTPS production only;
- no secrets in client bundle/repository;
- baseline security headers/CSP Report-Only at minimum;
- error responses scrub internals;
- repository content rendering has no unexpected raw HTML execution;
- Admin routes `noindex`/private cache policy.

---

## 136. Gate S2 — Contact launch

Test:

- schema/size bounds;
- header injection attempts;
- CSRF/cross-origin attempts;
- Turnstile server verification + fail-closed outage path;
- rate limiting;
- duplicate/retry idempotency;
- PII absent from DB/logging baseline;
- provider outage preserves message/input and does not claim success.

---

## 137. Gate S3 — Community launch

Test Guestbook/Sketch/Reports/Reactions for:

- stored/reflected XSS payloads;
- HTML/script/event-handler input;
- oversized/deep JSON;
- Unicode/control-character edge cases;
- moderation bypass;
- direct API calls without UI;
- Turnstile/rate/bans;
- report independence;
- pending/private content leakage;
- Admin rendering of malicious pending content;
- Sketch renderer output grammar and resource limits.

---

## 138. Gate S4 — Admin launch

Verify:

- no public signup;
- password + two verified TOTP factors before launch as DOC-45 requires;
- AAL1 rejected from protected Admin actions;
- disabled Admin rejected immediately;
- same-origin/CSRF protections;
- open-redirect attempts rejected;
- Auth token/cookie not logged;
- privileged DB RPC/browser calls denied;
- moderation concurrency/audit invariant;
- malicious UGC cannot XSS Admin.

---

## 139. Gate S5 — Arcade launch

Verify:

- session cannot be invented;
- expired session rejected;
- reused/finalized session rejected;
- race produces max one score;
- score bounds/plausibility tests;
- protocol/rules/leaderboard version checks;
- direct score insertion impossible;
- session identifiers absent from analytics/referrers where sensitive;
- rate/abuse/session issuance controls;
- no invasive evidence collection.

---

## 140. Gate S6 — Integrations/Channel launch

Verify:

- configured URL allowlists;
- unsafe schemes/redirects rejected;
- feed/GitHub response size/schema bounded;
- malicious remote HTML rendered as text/not executed;
- provider secret absent client-side;
- stale validated cache cannot be replaced by malformed/error body;
- cron auth/lease works;
- provider failure degrades locally.

---

## 141. Gate S7 — CSP enforcement

Before moving CSP from Report-Only to enforced:

- all six public spaces;
- Project Detail intercept/direct routes;
- Turnstile;
- Supabase Auth Admin flows;
- Drawing;
- Arcade;
- Dynamic OG/media;
- reduced-motion/transparency paths;
- browser matrix

must function without requiring an unjustified wildcard/unsafe script policy.

---

## 142. Gate S8 — database/grant verification

Reuse DOC-44's database tests plus security review:

- publishable/anon/authenticated roles cannot execute privileged RPCs;
- secret client remains server-only;
- no broad grants drift after migrations;
- `SECURITY DEFINER` functions reviewed for execution/search-path safety;
- Admin audit cannot be edited through normal application path.

---

## 143. Gate S9 — supply-chain/release verification

Before production deployment:

- lockfile clean;
- dependency/security scans reviewed;
- no unresolved CRITICAL/HIGH applicable advisories;
- secret scan clean;
- build output checked for leaked environment values;
- current Next.js/React security status reviewed;
- security-sensitive dependency upgrades include relevant regression tests.

---

## Threat register

## 144. Initial threat register

| ID | Threat | Primary assets | Baseline risk | Key mitigations |
|---|---|---|---|---|
| `THR-001` | Stored XSS via Guestbook/Sketch text | Admin session, visitors | HIGH | plain text, escaping, strict renderer, CSP |
| `THR-002` | Admin credential stuffing/password compromise | Admin | HIGH | strong password, TOTP AAL2, provider controls |
| `THR-003` | CSRF privileged action | moderation/audit | HIGH | same-origin, Server Action protections, authorization |
| `THR-004` | Supabase secret exposed client-side | all runtime DB data | CRITICAL | server-only boundary, build scan, secret rotation |
| `THR-005` | RLS/grant/RPC privilege error | private runtime data | HIGH | deny-by-default, migration tests, server data path |
| `THR-006` | Contact spam/email amplification | provider quota/reputation | MEDIUM/HIGH | Turnstile, rate limits, idempotency |
| `THR-007` | Community submission flood | DB/mod queue | MEDIUM | Turnstile, bounds, rate/bans |
| `THR-008` | Sketch JSON/renderer DoS | availability | MEDIUM/HIGH | structural/byte/render limits |
| `THR-009` | Forged/replayed Arcade score | leaderboard integrity | HIGH | server session, expiry, atomic finalize, plausibility |
| `THR-010` | Public SSRF through remote URL | cloud/internal network | HIGH | no public URL fetch, allowlist, scheme/redirect policy |
| `THR-011` | Malicious remote feed content | visitors/Admin | HIGH | normalization/text-only/no raw HTML |
| `THR-012` | Webhook forgery/replay | future integrations | HIGH | signatures, raw-body verify, timestamp/idempotency |
| `THR-013` | Cache leak of Admin/private data | private data | HIGH | no shared cache for private state, explicit DTOs |
| `THR-014` | Dependency/framework RCE | server/secrets | CRITICAL | supported patched versions, scans, rapid upgrades |
| `THR-015` | Secret committed to repository | provider/DB/Auth | CRITICAL/HIGH | secret scanning, rotation, environment stores |
| `THR-016` | Cross-feature visitor tracking via abuse IDs | privacy | MEDIUM | feature-scoped HMAC namespaces, no universal ID |
| `THR-017` | Turnstile outage silently fails open | public writes | MEDIUM/HIGH | fail closed, input preservation, clear UX |
| `THR-018` | Audit tampering/privileged action without audit | accountability | HIGH | atomic audit, append-only app path |
| `THR-019` | Open redirect in Auth recovery | credentials/trust | MEDIUM | relative/allowlisted destinations |
| `THR-020` | Terminal easter egg becomes code execution | browser/user | HIGH | predefined semantic commands only, no eval/shell |

This register is updated as implementation introduces concrete components/providers.

---

## Security architecture invariants

## 145. Invariant summary

The following must remain true:

1. Browser state/input is never an authorization authority.
2. All writes are server-validated.
3. Public UGC is plain/safe structured content, not arbitrary HTML.
4. Stored XSS reaching Admin is treated as a high-priority threat.
5. Privileged secrets never enter browser bundles/RSC props/logs/analytics.
6. Public/runtime tables are not directly writable by browser clients in the baseline.
7. Admin mutations require current AAL2 + active allowlist authorization.
8. Route secrecy/noindex never counts as security.
9. Cookie-authenticated privileged mutations are CSRF-resistant.
10. Same-origin is the default browser API policy.
11. Arbitrary public server-side URL fetching does not exist.
12. Provider/feed URLs are server configured/allowlisted.
13. External provider data is always untrusted input.
14. Raw remote HTML is not rendered.
15. CSP is enforced before public UGC/Admin production launch.
16. Production does not rely on `unsafe-eval`.
17. Public request bodies/collections/queries are finite and bounded.
18. Sketch complexity/rendering is bounded independently of byte size.
19. Raw IP is not the application's default persisted abuse identity.
20. Abuse HMACs are feature scoped and key-versioned.
21. Abuse identity is not used to build a hidden visitor profile.
22. Rate limiting is feature-specific and is not authorization.
23. Contact, Guestbook, Sketch and Reports require server-verified human verification at baseline launch.
24. Mandatory verification fails closed while preserving user input.
25. Arcade does not require Turnstile on every result; server session/plausibility is primary.
26. Arcade scores can only arise from valid one-time server sessions.
27. Anti-cheat does not claim cryptographic proof of fair play.
28. Contact recipient/from headers are server-owned and structured.
29. Contact message bodies are not persisted/logged in the baseline.
30. Guestbook nicknames are not verified identities.
31. Pending/rejected/hidden community data never leaks via public projections/caches.
32. Client-supplied SVG/files are not served as Sketch output.
33. Reports do not automatically become content moderation status.
34. Admin renders UGC through safe escaping/rendering.
35. Admin/private data is `no-store`/never placed in shared public cache.
36. RLS/grants remain tested defense in depth even behind a server backend.
37. Privileged SQL functions have narrow grants and no client-controlled dynamic SQL.
38. Audit history is append-only in normal application flows.
39. Secrets are purpose-separated and environment-scoped.
40. Key/credential exposure triggers rotation, not only deletion from source.
41. Cron requires authentication; obscurity is not enough.
42. Webhooks require signature/auth + replay/idempotency controls before use.
43. LocalStorage is schema-validated and never controls server privileges.
44. Terminal has no eval/shell/network proxy semantics.
45. Framework/runtime must be on a supported patched release.
46. Lockfile/dependency/security scanning is part of release security.
47. CRITICAL/HIGH applicable security findings block release unless explicitly accepted with expiration.
48. Runtime security incidents can disable writes while preserving professional-core reads.
49. Logs/errors never intentionally contain Auth factors/tokens/provider secrets.
50. Security controls must remain accessible and preserve user-entered data on recoverable challenge/failure states.

---

## Proposed decision registry

## 146. SECARC decisions

| ID | Decision |
|---|---|
| `SECARC-001` | All browser/provider/network input is untrusted until validated for the exact server operation. |
| `SECARC-002` | OWASP ASVS 5.0 is the primary external verification catalog; applicable L1 is baseline and applicable L2 is targeted for higher-risk Admin/Auth/data boundaries. |
| `SECARC-003` | Security uses defense in depth across transport, application service, repository/database and provider boundaries. |
| `SECARC-004` | Privileged server code is isolated in explicit server-only modules. |
| `SECARC-005` | Sensitive server models are explicitly projected to public DTOs before client serialization. |
| `SECARC-006` | Every public/admin write has authoritative server schema and invariant validation. |
| `SECARC-007` | Public protocol schemas bound unknown fields, length, collections and nesting; sensitive protocols prefer reject-on-unknown. |
| `SECARC-008` | UGC is plain text or safe structured data; arbitrary visitor HTML is excluded in V1.x. |
| `SECARC-009` | `dangerouslySetInnerHTML` is prohibited for visitor/provider content and requires an isolated audited exception for any future use. |
| `SECARC-010` | Stored XSS that can reach Admin is treated as HIGH risk. |
| `SECARC-011` | Repository-authored Markdown does not imply public/runtime MDX execution; executable/raw HTML remains constrained. |
| `SECARC-012` | SQL uses parameterized/fixed queries/functions; client-controlled SQL identifiers/fragments are prohibited. |
| `SECARC-013` | Runtime public input never constructs OS/shell commands. |
| `SECARC-014` | Filesystem paths resolve through server registries/validated IDs, not raw request concatenation. |
| `SECARC-015` | Untrusted objects are schema parsed; generic recursive merge into trusted configuration is prohibited. |
| `SECARC-016` | Production enforces a deliberate CSP; broad wildcard script policies are rejected. |
| `SECARC-017` | `unsafe-eval` is prohibited in production. |
| `SECARC-018` | CSP nonce/hash/SRI strategy must be prototyped against the pinned Next.js caching/rendering architecture before enforcement. |
| `SECARC-019` | CSP progresses through Report-Only hardening to enforcement before public UGC/Admin production launch. |
| `SECARC-020` | Script `unsafe-inline` requires an explicit documented security exception/remediation path. |
| `SECARC-021` | Trusted Types is optional hardening after compatibility verification, not baseline correctness. |
| `SECARC-022` | Production uses nosniff, deliberate Referrer Policy, least-privilege Permissions Policy, anti-framing and HSTS after safe rollout. |
| `SECARC-023` | HSTS preload/subdomain rollout is deferred to DOC-48 and is never enabled blindly. |
| `SECARC-024` | COOP/COEP/cross-origin isolation is enabled only for a concrete capability with provider/Auth compatibility review. |
| `SECARC-025` | Browser mutation APIs are same-origin by default; global permissive CORS is prohibited. |
| `SECARC-026` | Accountless public writes still enforce origin/request-integrity controls in addition to abuse controls. |
| `SECARC-027` | Cookie-authenticated Admin mutations are CSRF-resistant and reauthorize server-side on every mutation. |
| `SECARC-028` | Allowed-origin comparison uses exact configured origins, not unsafe substring matching. |
| `SECARC-029` | V1.x exposes no arbitrary public server-side URL fetch/proxy. |
| `SECARC-030` | Server external fetches use configured HTTPS provider/feed allowlists and bounded redirect policy. |
| `SECARC-031` | Future dynamic remote-fetch capability must reject private/loopback/link-local/reserved destinations and unsafe redirects. |
| `SECARC-032` | Next/Image/remote media patterns remain narrow; arbitrary remote image proxying is prohibited. |
| `SECARC-033` | Every public write/query has finite request/body/page/collection limits. |
| `SECARC-034` | Sketch has structural complexity/render-budget limits in addition to serialized byte limits. |
| `SECARC-035` | ReDoS-prone validation/heuristics are avoided and security-sensitive patterns are tested with adversarial input. |
| `SECARC-036` | Application persistence does not retain raw visitor IP by default. |
| `SECARC-037` | Client network identity is derived only from trusted deployment/platform request context. |
| `SECARC-038` | Abuse subjects use dedicated HMAC-SHA-256 with feature namespace and key version; no unrelated secret is reused. |
| `SECARC-039` | Abuse keys are feature-scoped and are not a universal cross-feature visitor identifier. |
| `SECARC-040` | Broad browser fingerprinting is excluded from baseline persistent identity. |
| `SECARC-041` | Abuse-key rotation supports current/previous bounded verification where required and retires old keys deliberately. |
| `SECARC-042` | Bans declare subject namespace and enforcement scope; feature abuse does not silently become a global ban. |
| `SECARC-043` | Rate limiting is layered/feature-specific and centrally configured; one universal threshold is rejected. |
| `SECARC-044` | Rate-limit success is never treated as authorization or human verification. |
| `SECARC-045` | Turnstile is an anti-automation signal and never identity/authorization. |
| `SECARC-046` | Contact, Guestbook, Sketch publication and Reports require successful server-verified human verification at baseline launch. |
| `SECARC-047` | Arcade relies primarily on server sessions/plausibility; Turnstile may protect issuance adaptively but is not required for every result. |
| `SECARC-048` | Admin MFA is Supabase Auth AAL2; Turnstile never substitutes for MFA. |
| `SECARC-049` | Mandatory human-verification provider `UNAVAILABLE/MISCONFIGURED` fails closed for the public side effect while preserving user input. |
| `SECARC-050` | Raw Turnstile tokens are never persisted. |
| `SECARC-051` | Contact uses fixed server-owned sender/destination structure and validated structured reply-to fields; raw header concatenation is prohibited. |
| `SECARC-052` | Contact combines schema, Turnstile, rate, same-origin controls and stable idempotency without persisting/logging message bodies. |
| `SECARC-053` | Guestbook remains plain text, pending-by-default and does not imply verified identity from nickname. |
| `SECARC-054` | Sketch accepts only the bounded logical drawing model; arbitrary file/image/SVG upload remains excluded. |
| `SECARC-055` | Public Sketch previews prefer safe server-generated raster output; any SVG output is generated from a restricted no-script/no-external-resource grammar. |
| `SECARC-056` | Reports are themselves abuse-controlled and remain independent from content moderation status. |
| `SECARC-057` | Reactions remain low-trust approximate signals and do not create visitor profiles. |
| `SECARC-058` | Arcade client is attacker-controlled from the server perspective. |
| `SECARC-059` | Only server-issued Arcade sessions are eligible for finalization/leaderboard scores. |
| `SECARC-060` | Arcade sessions finalize at most once via lock/state/idempotency/unique score constraint. |
| `SECARC-061` | Arcade plausibility checks are server-owned, game/version-aware and cannot rely only on client assertions. |
| `SECARC-062` | Leaderboard acceptance does not claim cryptographic/e-sports proof of fair play. |
| `SECARC-063` | Anti-cheat evidence is privacy-bounded and does not collect invasive full input traces. |
| `SECARC-064` | Arcade session capabilities are high-entropy, short-lived and not intentionally leaked through analytics/referrers/shareable URLs. |
| `SECARC-065` | Admin security remains password + TOTP AAL2 + active admin-profile allowlist as defined by DOC-45. |
| `SECARC-066` | Privileged mutations reconstruct/recheck Admin authorization at execution time. |
| `SECARC-067` | Admin/security responses are private/no-store and never enter shared public caches. |
| `SECARC-068` | AAL downgrade or admin-profile disablement immediately blocks subsequent privileged server operations. |
| `SECARC-069` | Auth recovery/login avoids unnecessary account enumeration and validates redirect destinations. |
| `SECARC-070` | Auth tokens/cookies/MFA secrets never enter analytics/general logs or arbitrary browser storage. |
| `SECARC-071` | Admin renders all UGC/provider content through safe escaping/sanitized structured views; raw moderation preview is prohibited. |
| `SECARC-072` | Destructive Admin actions require AAL2 authorization, target/version checks, audit and deliberate confirmation where appropriate. |
| `SECARC-073` | Public/runtime PostgreSQL domain tables are not direct browser write/read surfaces in the baseline. |
| `SECARC-074` | Supabase secret client is server-only and bypasses RLS, so authorization must occur before privileged repository calls. |
| `SECARC-075` | RLS/grants remain tested defense in depth and ship atomically with schema/function changes. |
| `SECARC-076` | Privileged PostgreSQL functions have narrow typed purpose, execution grants and reviewed security-definer/search-path behavior. |
| `SECARC-077` | Admin audit is append-only in normal application behavior and is transactionally coupled to privileged mutations when possible. |
| `SECARC-078` | Secrets are separated by purpose/environment and are never reused casually across unrelated controls. |
| `SECARC-079` | Only intentionally public values use client-public environment variable exposure. |
| `SECARC-080` | Every production secret class has a documented revoke/rotation path before launch. |
| `SECARC-081` | Standard provider/Auth/crypto primitives are used; custom cryptographic protocols are prohibited. |
| `SECARC-082` | Provider/feed responses remain untrusted and are schema/size validated before use/persistence. |
| `SECARC-083` | Remote HTML is not injected; external links are safe HTTP(S) URLs with appropriate new-tab protections. |
| `SECARC-084` | Shared public caches never capture Admin/private request state and cache keys contain every output-relevant public dimension. |
| `SECARC-085` | Only previously validated provider snapshots may be served stale; malformed/error refreshes never replace the last-good snapshot. |
| `SECARC-086` | Cron requires authenticated secret verification, no-store semantics and idempotent/lease-controlled execution. |
| `SECARC-087` | Future webhooks require raw-body signature/auth verification, freshness/replay/idempotency and bounded body handling. |
| `SECARC-088` | Dynamic OG/media routes do not become arbitrary remote-fetch/HTML embed surfaces. |
| `SECARC-089` | LocalStorage/preferences are schema-validated and never grant server privileges. |
| `SECARC-090` | Remembered-name personalization is local/explicit/untrusted and never silently reused across Contact/UGC/analytics. |
| `SECARC-091` | Terminal is predefined semantic commands only; eval, shell, file, SQL and arbitrary network execution are prohibited. |
| `SECARC-092` | Security/privacy data collection follows minimization; raw IP/fingerprints/contact bodies/full game traces are not collected by default. |
| `SECARC-093` | Security logging uses an allowlist of safe metadata and a denylist for credentials/tokens/secrets/private bodies. |
| `SECARC-094` | Public errors expose stable safe codes, not stack traces/SQL/internal paths/security thresholds. |
| `SECARC-095` | Production framework/runtime versions must remain supported and patched for known applicable critical security issues. |
| `SECARC-096` | CI/production installs are lockfile-reproducible and dependency changes are reviewed. |
| `SECARC-097` | Dependency minimization/maintenance/security status is an architecture concern, not only developer preference. |
| `SECARC-098` | Supply-chain automation includes dependency, secret and static security scanning as supported; exact workflows are DOC-51. |
| `SECARC-099` | Development tooling may not weaken security controls to satisfy implementation/tests and must escalate trust-boundary changes. |
| `SECARC-100` | Security/abuse incidents may disable runtime writes while the professional core remains available. |
| `SECARC-101` | Production supports targeted emergency write kill switches that fail explicitly rather than returning fake success. |
| `SECARC-102` | `admin_profiles.disabled_at` is the immediate app-level Admin kill switch alongside provider session/factor revocation. |
| `SECARC-103` | Security incidents follow contain → preserve evidence → rotate/revoke → scope → patch → verify → restore → learn. |
| `SECARC-104` | A leaked secret is rotated/revoked; deleting it from source/history alone is insufficient. |
| `SECARC-105` | CRITICAL/HIGH applicable findings block release unless an explicit scoped/owned/expiring security exception is approved. |
| `SECARC-106` | Contact launch must pass Gate S2. |
| `SECARC-107` | Community launch must pass Gate S3 including malicious-content rendering in Admin. |
| `SECARC-108` | Admin launch must pass Gate S4 including AAL2/CSRF/RPC-deny/XSS tests. |
| `SECARC-109` | Arcade launch must pass Gate S5 including replay/race/plausibility tests. |
| `SECARC-110` | Channel/integrations launch must pass Gate S6 including SSRF/remote-content/cache poisoning tests. |
| `SECARC-111` | CSP enforcement requires Gate S7 across all major spaces/providers. |
| `SECARC-112` | Data-security release requires Gate S8 RLS/grant/function verification. |
| `SECARC-113` | Every production release requires Gate S9 supply-chain/framework security review. |
| `SECARC-114` | The initial threat register is living security documentation and must be updated when new trust boundaries/providers/features are introduced. |
| `SECARC-115` | Request fingerprints use a cryptographic key/domain separate from feature abuse-identity HMACs. |
| `SECARC-116` | The initial public-write rate-limit policy is centrally configured and persisted through DOC-44 atomic PostgreSQL buckets. |
| `SECARC-117` | Feature-scoped bans preserve unlinkability; V1.x persists no universal public-write ban subject. |
| `SECARC-118` | Data retention/deletion follows the approved bounded matrix and accountless deletion capabilities authorize only one exact resource. |

---

## Approval consequences

## 147. If DOC-47 is approved

Approval closes the baseline security/threat-model architecture and gives downstream documents fixed assumptions:

- DOC-48 can design DNS, environment and deployment topology around known trust/secret/proxy/firewall boundaries;
- DOC-49 assigns SLOs, performance/provider timeout budgets, alert thresholds and operational telemetry; rate-limit policy is already fixed here and domain retention is owned by DOC-44;
- DOC-50 can create a complete security test suite/gates from explicit threats/invariants;
- DOC-51 can implement dependency/secret/SAST/release controls without redefining the security posture.

The next canonical document is:

**DOC-48 — Infrastructure, Environments, DNS & Deployment Architecture**.

---

## Current security reference validation

These external references provide current implementation context but are subordinate to approved project decisions and must be revalidated when dependencies are pinned:

- OWASP Application Security Verification Standard 5.0: <https://owasp.org/projects/asvs>
- OWASP Content Security Policy Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html>
- OWASP CSRF Prevention Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html>
- OWASP SSRF Prevention Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html>
- Supabase API key/security guidance: <https://supabase.com/docs/guides/getting-started/api-keys>
- Supabase secure-data guidance: <https://supabase.com/docs/guides/database/secure-data>
- Cloudflare Turnstile server-side validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Next.js support/security release policy: <https://nextjs.org/support-policy>

The implementation must also review security advisories for the **exact pinned Next.js/React version immediately before production/release**.

---

**End of DOC-47 — APPROVED**
