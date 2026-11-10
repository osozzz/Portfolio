---
id: DOC-12
title: "Security, Privacy & Abuse-Prevention Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-07
  - DOC-08
decision_families:
  - SEC
last_updated: 2026-11-10
approved_at: 2026-11-10
---

# DOC-12 — Security, Privacy & Abuse-Prevention Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Security posture

The public product is intentionally accountless for visitors. Admin is the only authenticated user class in V1.x. This reduces attack surface but does not remove the need for robust authorization, validation and abuse controls on public write endpoints.

## 2. Trust boundaries

At minimum distinguish:

- untrusted browser/client;
- public server/API layer;
- database/storage;
- privileged service credentials;
- admin authenticated session;
- external GitHub/news/email/anti-bot providers.

Client-side hidden UI, route obscurity and TypeScript types are not trust boundaries.

## 3. Authentication

Admin authentication may use managed auth (candidate Supabase Auth). Requirements include secure session handling, revocation/logout, protected server/data access and no public registration unless architecture later changes explicitly.

Password recovery/MFA decisions are part of detailed auth architecture. If password auth is used, secure managed recovery is required; admin security may justify MFA/passkeys later.

## 4. Authorization

- server-side/resource-level checks for every privileged operation;
- database RLS/least privilege where provider supports it;
- service-role credentials never exposed client-side;
- public reads return only public/approved projections;
- admin API responses are not merely hidden in UI.

## 5. Input and content security

All public writes validate schema, type, length and allowed values server-side. UGC is rendered as text/safe structured content, not arbitrary HTML. Prevent XSS through escaping/sanitization and restrictive content handling. SQL queries remain parameterized/ORM-safe.

## 6. Web security controls

Evaluate/configure:

- HTTPS/TLS and HSTS;
- CSP suitable for the Astro build/integrations;
- X-Content-Type-Options;
- Referrer Policy;
- frame/embedding policy where appropriate;
- origin/CSRF protection for cookie-authenticated state changes;
- SSRF protection for server-side external fetches;
- secure cookies if cookies are used;
- appropriate CORS rather than `*` by default.

## 7. Abuse prevention

Guestbook, reports, sketch publication, contact and score endpoints need risk-appropriate:

- rate limits;
- request size limits;
- anti-bot challenge such as Turnstile where justified;
- profanity/spam heuristics/moderation;
- replay/idempotency protection where retried actions matter;
- pseudonymous abuse keys (e.g. HMAC-derived IP/token) rather than indefinite raw IP storage when feasible.

## 8. Drawing/storage safety

V1.x does not accept arbitrary visitor image files for Sketch Wall. Drawing data comes from controlled canvas serialization/export with server-side validation/size limits. Storage access paths/policies prevent overwrite/enumeration of private/pending content.

## 9. Score integrity

A public client never receives database write authority for arbitrary leaderboard scores. Server-issued session data and plausibility checks make direct `score=999999` submission ineffective. This is pragmatic portfolio anti-cheat, not e-sports-grade trusted computing.

## 10. Privacy/data minimization

Task-specific data remains separate:

- Contact name/email/message;
- Guestbook nickname/message;
- Sketch nickname/drawing;
- score nickname/score;
- local remembered display name.

These do not become a universal visitor profile. Contact/Guestbook data is never automatically used for returning personalization.

## 10A. Legal baseline — Colombia (ADR-008)

> **Pending lawyer review — not legal advice.** This section fixes the product/engineering baseline; the published legal texts are reviewed by a lawyer before V1.0 production (privacy policy) and before V1.2 (terms).

- **Framework.** Ley 1581 de 2012 (Habeas Data) and its regulation, Decreto 1377 de 2013 (compiled in Decreto 1074 de 2015). Supervisory authority: Superintendencia de Industria y Comercio (SIC). The owner (Medellín, Colombia) is the data controller (*responsable del tratamiento*).
- **Personal Data Processing Policy** (*Política de Tratamiento de Datos Personales*) is published at `/[locale]/privacy` **from V1.0** in ES and EN. Minimum content: controller identity and contact channel; categories of data and purposes per feature (Contact, Guestbook, Sketch Wall, leaderboards); processors (Supabase, Vercel, Resend, Sentry, Turnstile); retention per category (DOC-44); data-subject rights and how to exercise them; response times; policy version and effective date.
- **Authorization.** Prior, express and informed authorization is collected at every collection point (Contact from V1.0; Guestbook/Sketch/leaderboard nickname from V1.2/V1.3) with a short notice linking to the policy; proof is kept as policy version + time (DOC-44 §41A, DTA-101/102).
- **Data-subject rights channel.** Visitors can consult, update, rectify and delete their data through a published channel (email to the controller plus the accountless deletion capabilities for UGC). Response times follow the law: consultations within 10 business days, claims within 15 business days, extendable as the law allows.
- **Terms of Use** (`/[locale]/terms`) are published **before V1.2** in ES and EN, covering UGC rules, moderation, licensing of submitted content and liability limits.
- **Minors.** The site does not collect age (data minimization). Before posting to Guestbook or Sketch Wall the visitor ticks: EN "I am 18 or older, or I have my legal representative's authorization." / ES "Soy mayor de 18 años o cuento con la autorización de mi representante legal." Pre-moderation stays as specified in DOC-13.
- **RNBD.** Registration in the Registro Nacional de Bases de Datos is believed not to apply to a natural person below the asset threshold; **verify before V1.0 production**.
- **GDPR.** Not directly triggered while analytics are disabled and no goods/services are offered to EU residents; the design follows it as good practice (minimization, purpose limitation, rights, retention).

## 11. Retention/deletion

Detailed periods are deferred, but every persistent category must later define retention, deletion/anonymization and moderation/audit needs. Raw IP retention is not the default. Local visitor data must be clearable from Settings.

## 12. Secrets

Environment/provider secrets live in managed secret stores/environment configuration, separated by environment. Never commit `.env` values, service-role keys, email keys or moderation credentials. Rotation process is required after accidental exposure.

## 13. Supply chain

Lock dependencies; review install scripts where risk warrants; run vulnerability/dependency scanning; avoid unnecessary packages; verify licenses. Advanced glass/game packages do not justify unmaintained dependencies.

## 14. Admin security

Admin route secrecy is only UX obscurity. Server authorization is mandatory. Moderation actions are audited. Destructive actions use deliberate confirmation. Admin content is not indexed or cached publicly.

## 15. Privacy analytics

Do not record raw typed Terminal commands, unpublished sketches, contact message contents, precise cursor trails or secret-key sequences for analytics. Aggregate feature-use events may be collected only when useful and consistent with privacy policy.

## 16. Security review gates

Security review intensifies before:

- first production Contact form;
- first public UGC/community write;
- admin/moderation launch;
- leaderboard launch;
- any new external provider with sensitive credentials/data.

## 17. Decisions

- **SEC-001** No visitor auth in V1.x; admin is the sole authenticated user class.
- **SEC-002** Hidden admin URL is never authorization.
- **SEC-003** Public UGC is approved/safe-projected before high-visibility rendering.
- **SEC-004** Arbitrary image upload is excluded from current Sketch Wall.
- **SEC-005** Privileged provider/database secrets never reach browser bundles.
- **SEC-006** Public-write abuse controls are mandatory, not optional polish.
- **SEC-007** Task-specific identities are not silently linked into a profile.
- **SEC-008** Colombian Ley 1581 is the legal baseline; the privacy policy ships in V1.0 and terms before V1.2, both ES/EN and lawyer-reviewed (ADR-008).
- **SEC-009** Authorization is collected at every collection point and proven by policy version + time, without extra personal data.
- **SEC-010** No age is collected; UGC requires an 18+/legal-representative declaration (ADR-008).
