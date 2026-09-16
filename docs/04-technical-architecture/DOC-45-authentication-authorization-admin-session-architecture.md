---
id: DOC-45
title: "Authentication, Authorization & Admin Session Architecture"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Identity & Access Architecture"
canonical_domain_owner: identity_access_architecture
depends_on:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-18
  - DOC-19
  - DOC-22
  - DOC-26
  - DOC-31
  - DOC-32
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - ADR-001
  - ADR-002
decision_families:
  - IAM
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-45 — Authentication, Authorization & Admin Session Architecture

> **Status:** APPROVED.  
> **Role:** Define the complete administrator identity boundary: credential factors, MFA, Supabase Auth SSR integration, route/session protection, application authorization, recovery, revocation and security-sensitive account operations.

---

## 1. Purpose

The public portfolio intentionally has no visitor accounts. Authentication exists only because the private Admin surface needs a trustworthy identity and authorization boundary for moderation and operational actions.

DOC-41 selected managed Supabase Auth. DOC-44 established `public.admin_profiles` as the application allowlist and deliberately prevented browser-authenticated users from mutating runtime domain tables directly. DOC-45 now defines exactly how an Auth identity becomes an authorized administrator session.

This document defines:

- the production admin sign-in factors;
- mandatory MFA policy and authenticator assurance level;
- initial account provisioning and bootstrap requirements;
- browser/server Supabase Auth clients for Next.js App Router;
- cookie-based SSR session handling and PKCE flows;
- trusted identity verification versus untrusted session objects;
- `/admin` route protection and redirect behavior;
- the application authorization contract built on `admin_profiles`;
- login, MFA challenge, logout and recovery flows;
- password/security-factor management;
- admin-profile disable/revocation behavior;
- session hardening and optional paid-plan controls;
- separation between Auth provider audit logs and application audit events;
- security behavior across development, preview, staging and production;
- testing gates for auth and authorization.

It intentionally does **not** finalize:

- exact generic IP/risk scoring, CSRF/CSP policy, HMAC abuse identifiers or complete threat model — DOC-47;
- Supabase project topology, custom auth domain, SMTP DNS and deployment environment wiring — DOC-48;
- auth SLOs/alerts/log export/incident monitoring — DOC-49;
- the complete automated test pyramid — DOC-50;
- dependency versions, workflow YAML and secret-injection mechanics — DOC-51.

---

## Identity scope

## 2. No public identity system

The portfolio does not create visitor accounts in V1.x.

There is no:

- visitor registration;
- visitor login;
- follower/friend identity;
- social profile;
- account required for Guestbook;
- account required for Drawing;
- account required for Arcade leaderboard;
- hidden cross-feature visitor account.

Public personalization remains local-device state under DOC-30/DOC-42.

Authentication is an **Admin-only subsystem**.

---

## 3. Identity authorities

Three identity concepts remain distinct:

```text
Supabase Auth identity
        ↓ proves
"which authenticated user is this?"

public.admin_profiles
        ↓ proves
"is this user currently allowed to administer this portfolio?"

Application service authorization
        ↓ proves
"may this admin perform this specific operation now?"
```

None replaces the others.

A valid Supabase user is not automatically an application administrator.

---

## 4. Initial authorization model

V1.x has one application role:

```text
ADMIN
```

Authorization condition:

```text
verified Supabase Auth identity
AND
current session at required assurance level
AND
active public.admin_profiles row for claims.sub
```

There is no generalized RBAC engine in V1.x.

If moderators/editors are ever introduced, role semantics require an explicit evolution of DOC-44/DOC-45, normally via ADR.

---

## Credential strategy

## 5. Production baseline

The approved baseline proposed by DOC-45 is:

```text
First factor
→ email + password

Second factor
→ TOTP authenticator

Required Admin assurance
→ AAL2
```

An administrator may not enter operational Admin surfaces at only `aal1`.

---

## 6. Why email + password remains the baseline first factor

For a single-administrator portfolio, email/password has several useful properties:

- stable managed implementation in Supabase Auth;
- straightforward recovery flow;
- password-manager compatibility;
- no dependence on a social identity provider;
- no phone-number requirement;
- works with mandatory TOTP MFA;
- predictable local/staging testing.

The password is not treated as sufficient security by itself. AAL2 is mandatory for Admin.

---

## 7. Password policy

Production configuration should require a strong password policy.

Baseline application policy:

- provider minimum length: **at least 14 characters**;
- mixed character classes where provider configuration supports them;
- actual administrator credential should be password-manager-generated and materially longer than the minimum;
- no password reuse;
- no personal phrase/date/name-based password;
- leaked-password protection should be enabled when available on the selected Supabase plan;
- changing a password should require the provider's current-password/reauthentication controls where available.

The repository never contains a real admin password.

---

## 8. TOTP is mandatory

TOTP MFA is required for every operational Admin session.

A session is considered sufficiently authenticated only when the verified Auth JWT reports:

```text
aal = aal2
```

The application does not merely check that a factor is enrolled; the current session must have completed the factor challenge.

---

## 9. Backup factor

Before production launch, the administrator must enroll **at least two verified TOTP factors** whose recovery paths are not stored in the same failure domain.

Example:

```text
Primary TOTP
→ authenticator/password manager normally used

Backup TOTP
→ separate secure device/account/location
```

A second TOTP factor is preferred over relying on experimental recovery-code APIs.

The portfolio never displays or stores TOTP secrets after provider enrollment beyond what the Auth provider requires.

---

## 10. SMS MFA is not baseline

Phone/SMS MFA is not used in V1.x because it adds:

- phone-provider dependency;
- recurring provider/country complexity;
- SIM-swap exposure;
- unnecessary operational surface for one administrator.

It can be reconsidered only as an explicit backup-factor decision.

---

## 11. Passkeys are deferred

Supabase currently exposes passkey/WebAuthn support as an **experimental** Auth capability.

Therefore:

- passkeys are **not** a V1.x production dependency;
- no production availability requirement depends on experimental passkey APIs;
- no Auth data model assumes passkeys exist;
- passkeys may be reconsidered when the provider API is stable and browser/device behavior is validated;
- adopting passkeys as primary Admin authentication requires an architecture review and, if it changes recovery/assurance assumptions, an ADR.

The long-term direction may prefer phishing-resistant credentials, but production architecture does not depend on an experimental provider surface.

---

## 12. Magic links / OTP are not primary login

The application does not expose magic-link or email-OTP login as a normal Admin sign-in method.

Reasons:

- email already participates in password recovery;
- a second normal sign-in path increases behavior to secure/test;
- password + mandatory TOTP already gives a clear two-factor model;
- recovery and login should not become indistinguishable.

This does not prevent Supabase Auth from using email for the controlled password-recovery flow.

---

## 13. Social login is disabled

Google/GitHub/Apple/etc. OAuth providers are not enabled for Admin V1.x.

Admin access does not depend on the lifecycle or security policy of a social account.

---

## 14. Public sign-up is disabled

Production must not expose public sign-up.

The normal product has no registration page, and Supabase Auth project configuration must reject arbitrary self-registration where applicable.

Admin users are provisioned deliberately out of band.

---

## 15. Anonymous and phone auth are disabled

Anonymous Auth and phone-first Auth are not required and should remain disabled.

Reducing enabled identity providers reduces attack surface and configuration ambiguity.

---

## Admin provisioning

## 16. Provisioning is an operational procedure

Creating an Admin is not an application feature available to the public.

Production provisioning is an owner-controlled procedure performed through trusted Supabase administration tooling and the application database.

The target sequence is:

```text
1. Create/confirm Auth user
2. Establish strong first-factor credential
3. Enroll primary TOTP
4. Enroll backup TOTP
5. Verify AAL2 works
6. Create/enable admin_profiles row
7. Verify /admin access
8. Remove/close bootstrap capability
```

---

## 17. No first-login enrollment race

Production must not launch with an active `admin_profiles` record whose Auth user has no verified second factor.

Otherwise, someone who obtained the first factor before the owner completed setup could potentially enroll their own factor.

Launch gate:

> No active production Admin profile until required TOTP factors are verified.

The normal production login UI does not provide unrestricted “become admin by enrolling MFA” behavior.

---

## 18. Bootstrap behavior

A temporary bootstrap experience may exist in local/staging while establishing the initial account, but it must not remain a general production path.

Acceptable bootstrap mechanisms include:

- controlled local/staging setup UI;
- temporary deployment gate available only during provisioning;
- provider administrative tooling plus a narrowly scoped setup route.

Whatever mechanism is selected in implementation must be removed/disabled after provisioning and tested as unreachable in the production baseline.

DOC-51 owns exact bootstrapping scripts; DOC-47 reviews the threat boundary.

---

## 19. Admin profile activation

`public.admin_profiles` remains the application authorization allowlist defined by DOC-44.

The Auth provider owns:

- email;
- password hash;
- identities;
- MFA factors;
- sessions.

The app profile owns only portfolio-specific authorization/operational metadata.

Do not duplicate password/MFA state into `admin_profiles`.

---

## Next.js / Supabase SSR architecture

## 20. Cookie-based SSR session

Admin Auth uses Supabase's SSR model with session material stored using the cookie integration expected by `@supabase/ssr`/current supported server package.

The site does **not** use browser `localStorage` as the authority for Admin authentication.

Public local personalization storage and Admin Auth session storage are separate systems.

---

## 21. PKCE

Redirect-based Auth flows such as password recovery use PKCE-compatible SSR handling.

The application does not implement the old implicit flow as its Admin SSR architecture.

---

## 22. Request-scoped Auth clients

Server-side Supabase Auth clients are created per request/context.

Do not place an authenticated server client in a module-level singleton that can accidentally leak one request's session into another.

Conceptual utility boundaries:

```text
lib/supabase/
├── browser-auth.ts
├── server-auth.ts
├── session-proxy.ts
└── privileged-data.ts   # separate DOC-44 server secret client
```

`privileged-data.ts` is never imported into client bundles.

---

## 23. Auth-context versus privileged-data client

Maintain the separation already established in DOC-44:

```text
Auth-context client
→ publishable key + current user's session/cookies
→ verifies identity / self-readable admin profile

Privileged-data client
→ server secret key
→ repositories / trusted runtime persistence
```

Do not use the privileged secret client to fake a user session.

Do not expose the secret key merely because Admin is authenticated.

---

## 24. Session refresh proxy is not authorization

Next.js request proxy/middleware may refresh cookies and perform coarse routing convenience.

It is **not** the final authorization boundary.

Every protected Server Component/layout, Server Action and Route Handler must enforce authorization in trusted server code.

A route remains secure even if the proxy is accidentally bypassed by a test, framework change or direct invocation.

---

## 25. Do not trust `getSession()` for authorization

Server authorization must not trust the user object returned from an unvalidated cookie-loaded session.

Identity verification uses the provider's validated JWT-claims path (`getClaims()` in the current Supabase API) or an equivalently strong provider-supported verification method.

`getSession()` may be used when raw token/session material is operationally needed, but not as proof of identity by itself.

---

## 26. Verified Admin principal

Server code should converge on one narrow internal type:

```ts
interface AdminPrincipal {
  userId: string
  displayName: string
  assuranceLevel: 'aal2'
  sessionId?: string
}
```

The principal is produced only after:

1. verified Auth claims;
2. active `admin_profiles` authorization;
3. required AAL.

Feature code consumes `AdminPrincipal`; it does not independently parse cookies/JWTs.

---

## Authorization guard

## 27. `requireAdmin()` contract

Provide one canonical server authorization primitive conceptually equivalent to:

```ts
requireAdmin({ minimumAal: 'aal2' })
```

It performs:

```text
verify JWT claims
      ↓
extract subject
      ↓
read active self admin profile
      ↓
verify required AAL
      ↓
return AdminPrincipal
```

Exact implementation can use server-only modules rather than literally this function signature.

---

## 28. Allowlist before feature access

An authenticated user without an active `admin_profiles` row receives no Admin capability.

The app must not assume:

```text
role = authenticated
→ admin
```

Supabase's `authenticated` database role means Auth user, not portfolio administrator.

---

## 29. AAL2 is required for operational Admin

Protected Admin screens and mutations require AAL2.

Examples:

- moderation queue;
- approve/reject/hide;
- report resolution;
- bans;
- audit history;
- any future runtime operational settings.

An AAL1 session may exist transiently only to complete an MFA challenge/recovery flow.

---

## 30. Server Actions re-authorize

Every privileged Server Action calls the canonical authorization guard at invocation time.

Do not assume that rendering the page while authenticated proves that a later Server Action call remains authorized.

---

## 31. Route Handlers re-authorize

Every privileged Admin Route Handler independently checks the Admin principal.

No Route Handler trusts a browser-supplied `adminId`, role or AAL.

---

## 32. Application services receive actor identity

After authorization, the transport passes the trusted principal/actor into application services.

Example:

```text
ApproveSubmissionCommand
  actor = AdminPrincipal.userId
```

Application audit records derive actor identity from this trusted server principal, never from request JSON.

---

## 33. No admin role custom JWT claim in baseline

V1.x does not copy the `admin_profiles` authorization state into a long-lived custom JWT claim.

Reason:

- profile disable should take effect immediately at the app boundary;
- claims can remain valid until token refresh;
- a database allowlist lookup is cheap for a one-admin system;
- avoiding duplicated role state reduces revocation ambiguity.

Per-request memoization is allowed. Cross-request authorization caches are not baseline.

---

## Route architecture

## 34. Admin route tree

Baseline routes:

```text
/admin/login
/admin/mfa
/admin/recover
/admin/auth/callback
/admin/update-password
/admin
/admin/moderation
/admin/security
```

Additional future Admin routes inherit the same guard.

Admin routes are intentionally outside `/[locale]`.

---

## 35. `/admin/login`

Publicly reachable but non-indexable.

Responsibilities:

- collect email/password;
- perform first-factor authentication;
- return generic credential errors;
- continue to Admin authorization/MFA routing;
- never expose whether a supplied email is the configured administrator;
- preserve only a validated internal `next` destination.

If a valid AAL2 Admin session already exists, redirect to the validated target or `/admin`.

---

## 36. Post-password routing

After successful first-factor sign-in:

```text
verified identity
      ↓
active admin profile?
  ├── no → deny + sign out/safe exit
  └── yes
        ↓
AAL status
  ├── aal1 → /admin/mfa
  └── aal2 → requested Admin route
```

If the active administrator unexpectedly has no verified MFA factor in production, treat it as a provisioning/security fault rather than automatically granting Admin at AAL1.

---

## 37. `/admin/mfa`

This route is available only to:

- a verified authenticated identity;
- with an active admin profile;
- whose current session is not yet AAL2;
- and who has an approved enrolled factor.

It performs challenge/verify and then re-checks assurance before redirecting.

A user may select among enrolled verified TOTP factors where the provider permits it.

---

## 38. MFA errors

The MFA surface distinguishes user-actionable states without exposing security internals:

- incorrect code;
- expired challenge;
- too many attempts/rate limited;
- no factor available;
- provider unavailable.

It does not display TOTP secret material after enrollment.

---

## 39. Safe `next` parameter

A `next`/return path is accepted only when it is a normalized same-origin Admin path.

Reject:

```text
https://attacker.example
//attacker.example
/admin/../../external
javascript:...
```

Fallback is `/admin`.

This avoids open-redirect behavior in login/MFA/recovery flows.

---

## 40. `/admin` protected layout

The protected Admin layout executes the server authorization guard before returning privileged UI/data.

It does not merely hide controls client-side.

Unauthorized states map to deliberate outcomes:

```text
no valid identity → /admin/login
allowed Admin at aal1 → /admin/mfa
not in allowlist/disabled → deny + safe sign-out path
valid aal2 Admin → render
```

---

## Logout / revocation

## 41. Logout

Admin exposes an explicit Logout action.

Normal logout must:

- terminate the current Auth session according to provider semantics;
- clear/expire relevant Auth cookies;
- redirect to `/admin/login` or public Home;
- not clear unrelated public portfolio personalization unless the user explicitly asks to reset local data.

---

## 42. Sign out all sessions

Security settings should provide an explicit high-friction **Sign out all sessions** operation where supported.

Use cases:

- lost device;
- suspected token theft;
- factor/password compromise;
- security reset.

This is separate from routine logout.

---

## 43. Admin-profile disable is an immediate kill switch

Setting:

```text
admin_profiles.disabled_at != null
```

must immediately cause the application authorization guard to reject future privileged requests, even if a previously issued Auth access token remains cryptographically valid.

This is one reason authorization is not encoded only in JWT custom claims.

---

## 44. Provider account revocation

If the underlying Supabase Auth user is banned/deleted/revoked, session refresh and provider identity checks will eventually fail according to provider behavior.

Operational response should normally also disable the `admin_profiles` row so application authorization does not depend solely on token expiry/refresh timing.

---

## Session policy

## 45. Access-token duration

Use a normal short-lived access-token lifetime rather than attempting extremely short JWT expirations.

Baseline target:

- provider default around one hour is acceptable;
- do not reduce below the provider's recommended operational range merely for perceived security;
- security-sensitive revocation relies additionally on `admin_profiles` checks.

Exact Supabase setting is environment configuration under DOC-48.

---

## 46. Refresh tokens

Refresh tokens are managed only through the supported Supabase Auth SDK/SSR integration.

Application code does not:

- copy refresh tokens into application DB tables;
- log them;
- place them in analytics events;
- expose them to application state stores;
- serialize them into custom response payloads.

---

## 47. No custom remember-me checkbox

V1.x does not implement a separate `Remember me` session mode.

Session lifetime follows the configured Auth policy.

Avoid having two session-lifetime systems that users and operators must reason about.

---

## 48. Optional provider session hardening

Supabase paid plans expose controls such as time-boxed sessions, inactivity timeouts and single-session enforcement.

Recommended production hardening **if the selected plan supports it**:

```text
single-session-per-user  → consider enabled for one-admin deployment
maximum session lifetime → finite (e.g. working-day scale)
inactivity timeout       → finite and operationally reasonable
```

The exact numbers are deployment/cost decisions in DOC-48.

Critical rule:

> Product correctness and authorization must not depend on paid-plan session controls being available.

---

## 49. Visibility / idle UI

The Admin UI may visually warn/lock itself after extended local inactivity, but a client-side idle timer is not the security authority.

Server requests still perform actual session + authorization checks.

Do not build a fake client logout that leaves server credentials valid while only hiding the UI.

---

## 50. Session state is not copied to Zustand

The frontend global UI store must not become the source of truth for Admin authentication.

It may derive presentation state such as:

```text
"checking"
"requires-mfa"
"authenticated"
```

but server authorization remains authoritative.

---

## MFA assurance handling

## 51. Assurance model

The current Supabase Auth model distinguishes:

```text
aal1 → conventional first-factor authentication
aal2 → first factor + approved MFA factor
```

Admin capability requires `aal2`.

---

## 52. Assurance inspection

Application code may use the provider's current AAL API to guide user experience.

Security checks ultimately verify trusted JWT claims/provider validation server-side.

Client-provided strings such as:

```json
{ "aal": "aal2" }
```

are meaningless and ignored.

---

## 53. Stale assurance state

If the provider reports inconsistent/stale assurance state — for example an `aal2` token after factor removal or an `aal1` session that should challenge — fail closed for privileged operations and drive the user through a fresh Auth flow.

Do not silently downgrade the Admin policy to restore convenience.

---

## 54. Factor management requires fresh proof

Adding/removing a TOTP factor is more sensitive than ordinary moderation.

The security settings flow must require:

- current active Admin profile;
- current AAL2 session;
- a **fresh factor challenge or provider-supported reauthentication step** before destructive factor changes;
- explicit confirmation;
- audit/operational logging appropriate to the provider/application split.

Do not invent a long-lived custom “recently authenticated” boolean in local storage.

---

## 55. Never remove the final recovery path casually

The security UI must not allow a user to accidentally remove the last verified recovery factor without an explicit warning and approved recovery policy.

Baseline production expectation remains at least two verified TOTP factors.

If provider API semantics make enforcement difficult, factor removal may be restricted to owner-controlled operational tooling rather than general in-app UI.

---

## Password recovery

## 56. `/admin/recover`

Password recovery is available because the baseline first factor is password-based.

The recovery request page:

- accepts email;
- triggers provider password-recovery mail;
- always returns a generic acknowledgement;
- does not reveal whether that email maps to an Auth user or Admin profile;
- is rate-limited by provider controls and additional security policy under DOC-47.

---

## 57. Production recovery email

Production password recovery must use a configured production-grade SMTP path rather than relying on the provider's trial/best-effort default email service.

SMTP/domain/DNS production wiring follows DOC-48. Reusing the project's transactional email provider is acceptable if it meets Supabase Auth requirements and sender separation is clear.

---

## 58. Recovery callback

Recovery email redirects only to an allowlisted production recovery URL, conceptually:

```text
/admin/auth/callback
        ↓
exchange PKCE code
        ↓
/admin/update-password
```

The callback validates expected flow/state and never honors arbitrary external return URLs.

---

## 59. Password reset does not bypass MFA

A recovered password returns control of the **first factor**.

It does not automatically grant operational Admin access.

After recovery:

```text
new first factor
+ active admin profile
+ required TOTP challenge
= Admin AAL2
```

This substantially reduces the consequence of email-only compromise.

---

## 60. Lost password + lost all MFA factors

There is no public self-service bypass that drops MFA because the administrator also lost every second factor.

Break-glass recovery is owner/operator controlled:

1. verify ownership out of band;
2. disable/revoke affected sessions;
3. reset/remove factors through trusted Supabase administrative tooling;
4. rotate the first-factor credential;
5. enroll new primary + backup TOTP factors;
6. verify AAL2;
7. review Auth/provider audit logs and application audit trail;
8. re-enable/confirm `admin_profiles` if it was disabled during incident handling.

This runbook is finalized operationally in DOC-47/DOC-48.

---

## 61. Password change while signed in

Admin security settings may expose password change.

Require provider-supported current-password/reauthentication checks plus AAL2.

After sensitive credential changes, prefer invalidating other sessions where provider semantics allow.

Do not echo passwords into logs or error telemetry.

---

## Security settings surface

## 62. `/admin/security`

This is a protected AAL2 surface, distinct from general Settings in the public portfolio.

Potential V1.x operations:

- view masked account identifier/email;
- list verified TOTP factors by safe friendly name;
- enroll additional backup factor;
- remove factor under fresh proof constraints;
- change password;
- logout;
- sign out other/all sessions where supported.

It is not a generalized user-account profile page.

---

## 63. Friendly factor names

Factor display names may identify a device/location conceptually, for example:

```text
Primary authenticator
Backup authenticator
```

Avoid exposing TOTP secrets, QR content or sensitive device details after enrollment.

---

## 64. Enrollment QR handling

During TOTP enrollment:

- QR/secret is displayed only inside the authenticated security/setup flow;
- no analytics event captures it;
- no screenshot automation is run against real production secret screens;
- no server/application log includes the secret;
- once verified, normal UI never offers the raw secret again.

---

## Auth errors / UX

## 65. Error taxonomy

The frontend maps provider errors into stable application categories, such as:

```text
AUTH_INVALID_CREDENTIALS
AUTH_MFA_REQUIRED
AUTH_MFA_INVALID
AUTH_MFA_RATE_LIMITED
AUTH_SESSION_EXPIRED
AUTH_NOT_ADMIN
AUTH_ACCOUNT_DISABLED
AUTH_RECOVERY_SENT
AUTH_PROVIDER_UNAVAILABLE
```

Provider error messages/codes may be logged safely where useful, but public/Admin UI copy remains controlled/localizable.

---

## 66. Enumeration resistance

Login and recovery surfaces must avoid exposing useful account-enumeration distinctions.

Examples:

Bad login:

```text
Could not sign in with those credentials.
```

Recovery:

```text
If that address is eligible, recovery instructions will be sent.
```

Do not say:

```text
That email is not the administrator.
```

---

## 67. AAL1 is not shown as a frightening security error

When a legitimate admin has completed password sign-in but not MFA, redirect to the MFA challenge flow rather than rendering a generic 403.

This matches the product's calm error-handling language while preserving security.

---

## 68. Disabled/not-admin behavior

If identity is valid but authorization fails:

- do not render Admin data;
- clear/terminate the application session where appropriate;
- present a generic access-denied/re-authentication state;
- avoid disclosing allowlist internals.

Operational logs may record a safe authorization-denied event without recording passwords/tokens.

---

## Redirect / indexing / public shell boundaries

## 69. Admin is not part of the public system shell

Admin Auth routes do not render:

- public Liquid Glass Dock;
- Widget Field;
- DynamicBackdrop project context;
- Arcade/secret features;
- public personalization greeting.

They use the restrained Admin visual language approved in DOC-33/DOC-40.

---

## 70. Auth routes are non-indexable

All `/admin/**` routes emit appropriate `noindex` behavior.

Admin routes are omitted from sitemap and public navigation.

Security does not rely on obscurity or route hiding.

---

## 71. Admin route existence is not secret

It is acceptable that `/admin/login` can be discovered.

Protection comes from:

- strong first factor;
- mandatory TOTP;
- active allowlist;
- server authorization;
- rate limits/abuse controls;
- secure recovery;
- monitoring.

Do not invent a secret Admin URL as an authentication factor.

---

## Database / RLS integration

## 72. `admin_profiles` remains minimal

DOC-45 does not add password/MFA/session columns to `public.admin_profiles`.

Provider-owned security state stays in Supabase Auth schemas/services.

Application-owned authorization remains:

```text
user_id
display_name
created_at
disabled_at
```

unless a future explicit authorization requirement justifies more.

---

## 73. Self-read policy

The authenticated session may read only its own active Admin profile through the narrow RLS policy established in DOC-44.

This read is used to establish application authorization.

No authenticated browser receives direct writes to the profile table.

---

## 74. Domain mutations stay server-owned

Even after AAL2 login, the browser does **not** gain direct table mutation rights for:

- community moderation;
- reports;
- bans;
- Arcade scores/sessions;
- audit;
- runtime system state.

AAL2 proves administrator identity; it does not bypass DOC-43 service architecture.

---

## 75. Audit identity

Application audit writes use:

```text
actor_user_id = AdminPrincipal.userId
```

The actor ID is derived server-side from verified Auth claims.

The client never submits an authoritative actor ID.

---

## Provider Auth audit versus application audit

## 76. Supabase Auth audit responsibility

Provider Auth audit logs are the source for low-level identity events such as:

- sign-ins;
- token refresh/revocation;
- recovery requests;
- password changes;
- MFA enrollment/challenges/verifications;
- factor deletion.

Do not duplicate every provider event into `admin_audit_events` merely to have another copy.

---

## 77. Application audit responsibility

`admin_audit_events` remains the source for portfolio domain actions such as:

- approve/reject/hide submission;
- resolve/dismiss report;
- create/revoke ban;
- future operational domain settings.

Together the two audit sources answer different questions.

---

## 78. No secrets in telemetry

Never log:

- passwords;
- TOTP codes;
- TOTP enrollment secrets;
- QR payloads;
- refresh tokens;
- full access tokens;
- password-recovery codes/PKCE verifiers;
- raw Auth cookies.

If a JWT identifier is needed operationally, prefer safe request/session correlation rather than logging the token itself.

---

## Abuse / brute-force boundary

## 79. Provider rate limits are baseline protection

Supabase Auth rate limits remain enabled for login/token/recovery/MFA endpoints.

The application does not attempt to bypass provider rate limits.

DOC-47 may add application/WAF/risk controls around `/admin/login`, `/admin/mfa` and recovery.

---

## 80. No user-controlled unlimited MFA loop

The MFA UI respects provider challenge limits and does not automatically retry failed challenges in a tight loop.

Rate-limited state provides a calm wait/retry response.

---

## 81. Turnstile/captcha decision deferred

A bot challenge may be added to Admin login/recovery under attack, but it is not part of the fundamental identity model.

The trigger/security policy is owned by DOC-47.

---

## Cross-site / transport boundaries

## 82. Same-origin Admin

Admin UI and its Auth callbacks live under the same trusted portfolio origin by default.

Do not create a separate auth frontend domain unless Infrastructure/Security Architecture demonstrates a need.

---

## 83. Redirect allowlist

Supabase Auth redirect URLs are explicit by environment.

Production should not use an uncontrolled wildcard that allows arbitrary Vercel preview URLs to receive production recovery/auth codes.

Preview/staging Auth uses separate approved origins/identity configuration.

---

## 84. No credentials in query strings

Passwords, TOTP codes, access tokens and refresh tokens are never intentionally placed into ordinary query parameters or analytics-visible URLs.

PKCE/provider callback parameters are handled according to the Auth SDK's secure redirect flow and stripped/consumed as appropriate.

---

## Environment separation

## 85. Production identity isolation

Production Admin identity is not automatically copied into every development/preview environment.

Each environment owns its own Auth users/factors as appropriate.

---

## 86. Local development

Local development may create an ephemeral/test Auth Admin.

Rules:

- no real production password;
- no production TOTP secret;
- no committed credentials;
- Mailpit/local email tooling can be used for recovery tests;
- local `admin_profiles` uses test user IDs only.

---

## 87. Preview deployments

Untrusted pull-request previews must not receive production Auth secrets or production Admin sessions.

Preferred options:

- Admin disabled on generic PR previews; or
- preview tied to isolated development Supabase/Auth environment with test credentials.

DOC-48/51 finalizes preview topology.

---

## 88. Staging

If a persistent staging environment exists, give it a separate Auth admin/test account and TOTP factors.

Do not reuse production sessions/cookies across staging and production.

---

## 89. Cookie/domain isolation

Auth cookie domain/scope must prevent a staging/preview host from accidentally sharing the production Admin session.

Exact cookie configuration is finalized with domain topology in DOC-48 and security headers in DOC-47.

---

## Availability / failure behavior

## 90. Auth provider unavailable

If Supabase Auth is unavailable:

```text
public portfolio → continues operating as far as its own dependencies allow
Admin login      → unavailable/degraded
existing Admin privileged requests → fail closed if identity cannot be safely verified
```

Do not fall back to an insecure local bypass because the provider is down.

---

## 91. Database unavailable during authorization

If Auth claims are valid but `admin_profiles` cannot be checked safely, Admin access fails closed.

The public portfolio should remain independent where DOC-41 permits.

---

## 92. MFA service unavailable

An AAL1 user cannot be promoted to Admin while the factor challenge is unavailable.

Show a retry/degraded-state message; do not temporarily accept AAL1.

---

## Client architecture

## 93. Browser Auth client scope

A browser Supabase client exists only for Auth experiences that genuinely need browser interaction, such as:

- password sign-in;
- MFA challenge/verification;
- TOTP enrollment/security settings;
- recovery session state where SDK requires it;
- logout.

It is not a general data-access client for Admin domain tables.

---

## 94. Auth UI feature folder

Suggested frontend structure:

```text
features/admin-auth/
├── components/
│   ├── LoginForm.tsx
│   ├── MfaChallengeForm.tsx
│   ├── RecoveryForm.tsx
│   ├── UpdatePasswordForm.tsx
│   └── FactorManager.tsx
├── actions/
├── client/
├── server/
│   ├── require-admin.ts
│   ├── get-admin-principal.ts
│   └── redirects.ts
├── schemas/
└── errors/
```

Do not place Auth logic inside arbitrary moderation components.

---

## 95. Form behavior

Auth forms use standard accessible HTML form semantics.

Requirements:

- visible labels;
- password-manager compatible fields;
- autocomplete attributes appropriate to login/new-password/OTP flows;
- paste allowed for passwords and TOTP;
- no keyboard traps;
- stable focus on validation errors;
- no animation required to understand success/failure.

Do not disable password-manager paste/autofill in the name of “security”.

---

## 96. MFA input

The TOTP challenge accepts the complete code with standard input behavior and supports paste.

Visual segmented digits are allowed only if they preserve one coherent accessible input model or equivalent robust semantics.

Do not create six fragile one-character inputs unless accessibility/testing proves them superior.

---

## Sensitive account operations

## 97. Email change

Changing the Admin login email is not required for normal V1.x operation.

If exposed later, treat it as a high-risk security operation requiring:

- AAL2;
- fresh proof;
- provider confirmation;
- session review/revocation as appropriate;
- incident-safe audit visibility.

It must not be a casual profile-edit field.

---

## 98. Factor enrollment

Adding a new TOTP factor requires AAL2 for an already provisioned Admin, except the tightly controlled initial bootstrap.

Enrollment finishes only after the provider verifies a generated code.

An unverified enrollment is not considered a recovery factor.

---

## 99. Factor deletion

Deleting a factor requires:

- active Admin profile;
- AAL2;
- fresh TOTP/reauth proof;
- explicit confirmation;
- protection against accidentally removing all recovery factors.

If this cannot be robustly enforced in-app using stable provider APIs, factor deletion is an operational/provider-dashboard action instead.

---

## 100. Account disable / break-glass

Normal Admin UI does not expose a one-click “delete my only admin account” control.

Owner-level disable/deletion is an operational procedure because it can permanently remove moderation access.

`admin_profiles.disabled_at` provides the application kill switch without immediately destroying audit identity.

---

## Session revocation semantics

## 101. Password compromise response

If password compromise is suspected:

1. disable Admin profile if active incident containment is needed;
2. revoke/sign out sessions;
3. change password;
4. confirm MFA factors;
5. review provider Auth audit logs;
6. review application audit actions;
7. re-enable profile only after confidence is restored.

---

## 102. TOTP compromise response

If one TOTP factor is compromised:

1. use unaffected backup factor;
2. remove compromised factor under fresh proof/provider tooling;
3. enroll replacement backup;
4. revoke other sessions where prudent;
5. review Auth/application audit events.

If all factors are compromised, use break-glass procedure.

---

## 103. Lost device response

A lost browser/device does not require deleting the Auth user.

Use session revocation/sign-out-all and credential rotation based on risk.

The Admin profile remains stable unless incident containment requires disabling it.

---

## Authorization failure semantics

## 104. Distinguish authentication and authorization internally

Internally:

```text
401-like condition
→ no valid verified identity/session

403-like condition
→ valid identity but not authorized / insufficient assurance
```

UI may redirect rather than expose raw status pages, especially AAL1 → MFA.

API/Server Action errors use stable codes and do not reveal allowlist details.

---

## 105. Mutation-time profile recheck

Even if an Admin page was rendered five minutes ago, each sensitive mutation rechecks that the `admin_profiles` row is still active.

This allows `disabled_at` to work as a near-immediate application kill switch.

---

## 106. Request memoization

Within a single server request/render pass, authorization/profile verification may be memoized to avoid repeated queries.

Do not cache active-Admin authorization across requests for a long TTL.

---

## Interaction with RLS

## 107. AAL2 RLS is defense-in-depth, not the app service

If future browser reads use authenticated RLS, policies may include the JWT `aal` claim as an additional condition.

However, normal privileged domain mutations still go through Next.js application services.

Do not redesign the entire Admin backend into browser-to-database calls merely because Supabase can express MFA in RLS.

---

## 108. Secret-key bypass awareness

The privileged Supabase server secret bypasses ordinary RLS.

Therefore every privileged repository call must sit behind application authorization/service boundaries.

MFA/RLS does not magically constrain a secret-key repository call after it has been invoked incorrectly.

---

## Localization / content

## 109. Admin language

Admin may initially use one operational language if implementation scope requires it, but Auth error keys must not hard-code provider English strings into components.

Public ES/EN equality requirements do not imply that hidden internal Admin must duplicate every screen before launch.

If Admin is bilingual, translations use the same controlled i18n infrastructure.

---

## 110. Security copy

Security copy must be precise and non-alarmist.

Examples:

- “Enter the code from your authenticator app.”
- “Your session expired. Sign in again.”
- “This account is not authorized for Admin access.”

Avoid exposing technical details such as:

- JWT validation failed;
- row policy denied;
- user UUID;
- factor IDs;
- Supabase table names.

---

## Accessibility

## 111. Auth accessibility

Login, recovery and MFA are critical capabilities and must remain usable with:

- keyboard only;
- screen reader;
- 200% zoom;
- reduced motion;
- reduced transparency;
- high-contrast/forced-colors where applicable;
- password managers;
- mobile browsers.

A beautiful glass Auth form cannot reduce authentication usability.

---

## 112. Timeout messaging

If a session expires while the Admin is working, preserve unsent form text locally/in-memory where safe and clearly explain reauthentication.

Never silently discard a moderation note merely because the Auth refresh failed.

Do not preserve sensitive passwords/TOTP values.

---

## Security headers / CSRF handoff

## 113. Security-document boundary

DOC-45 requires privileged requests to be same-origin and server-authorized, but exact details for:

- CSRF token/origin strategy;
- CSP;
- HSTS;
- frame ancestors;
- cookie hardening details;
- Trusted Types;
- WAF/Turnstile;
- brute-force thresholds;

belong to DOC-47.

Auth implementation must leave room for those controls and must not introduce cross-origin mutation dependencies without review.

---

## Dependency / API stability

## 114. `@supabase/ssr` stability boundary

Current Supabase documentation recommends `@supabase/ssr` for SSR integration but labels the package beta/subject to change.

Therefore:

- hide client creation behind our own `lib/supabase/*` utilities;
- do not scatter package-specific cookie logic through features;
- pin exact dependency versions in DOC-51 implementation;
- upgrade only with Auth integration tests;
- if Supabase replaces the package/API, adapters change without rewriting moderation features.

---

## 115. Experimental Auth APIs

Experimental capabilities — currently including passkeys and experimental recovery-code APIs — do not become production requirements without explicit approval.

Stable TOTP is the baseline second factor.

---

## Cost boundary

## 116. Auth architecture must work without paid-only session controls

The minimum secure Admin architecture requires:

- managed Auth;
- password first factor;
- TOTP MFA;
- active Admin allowlist;
- server authorization;
- proper recovery;
- provider/basic rate limits.

Paid options such as advanced session time-boxing or leaked-password protection improve hardening but must not be required for authorization correctness unless the project explicitly budgets for them in DOC-48.

---

## Performance

## 117. Auth checks are intentionally small

Admin traffic is extremely low compared with public traffic.

Favor correctness over micro-optimizing one allowlist lookup.

Expected guard work:

```text
verify JWT claims
+ one narrow active-profile read
+ optional AAL/factor state check
```

No need for Redis/session cache solely for one administrator.

---

## 118. Public routes do not pay Admin Auth cost

The global public shell should not perform Admin session/database checks on every visitor request.

Auth refresh/proxy matcher should be scoped so unrelated static/public asset traffic is not unnecessarily coupled to Supabase Auth.

Exact matcher topology is an implementation detail validated in DOC-51.

---

## Testing gates

## 119. Gate A — unauthorized route protection

Verify:

- anonymous `/admin/moderation` redirects to login;
- direct route requests cannot bypass the guard;
- Server Actions cannot be invoked without authorization;
- Route Handlers cannot be invoked without authorization.

---

## 120. Gate B — allowlist protection

Create a valid Supabase authenticated test user without `admin_profiles`.

Verify that even with a valid session they cannot:

- render Admin data;
- moderate content;
- read privileged audit data;
- create bans.

---

## 121. Gate C — MFA enforcement

Test:

```text
admin + aal1
→ cannot access operational Admin
→ redirected to MFA

admin + aal2
→ operational Admin available
```

Also test stale/removed factor behavior.

---

## 122. Gate D — disabled profile revocation

With an otherwise valid AAL2 session:

1. disable the `admin_profiles` row;
2. submit a privileged action;
3. confirm the action is rejected immediately at application authorization;
4. confirm no domain mutation/audit action is falsely committed.

---

## 123. Gate E — recovery

Test complete recovery:

```text
request recovery
→ generic response
→ approved callback
→ password update
→ still no operational Admin until MFA/AAL2
```

Test invalid/expired callback and open-redirect attempts.

---

## 124. Gate F — factor recovery

Test owner-approved backup factor flow:

- primary unavailable;
- backup can establish AAL2;
- compromised factor can be removed/replaced under fresh proof;
- zero-factor production state does not silently grant Admin.

---

## 125. Gate G — environment isolation

Verify:

- generic PR preview receives no production Auth secret;
- production Auth cookie is not accepted by staging/preview origin;
- local test credentials are not in repository;
- production redirect allowlist excludes uncontrolled origins.

---

## 126. Gate H — sensitive data leakage

Automated/manual review confirms:

- passwords/TOTP not in logs;
- refresh/access tokens not in Sentry/analytics;
- Auth query params not retained in app-generated links;
- no TOTP QR/secret in visual regression artifacts from production.

---

## 127. Gate I — session expiry / refresh

Test:

- normal token refresh;
- expired session redirects safely;
- failed refresh cannot leave UI believing it can mutate;
- drafts/notes are preserved where safe;
- no infinite redirect between login/MFA/Admin.

---

## Implementation invariants

## 128. Invariant summary

The following must remain true regardless of implementation details:

1. No visitor accounts are introduced accidentally.
2. Public sign-up remains disabled.
3. Admin first factor alone never grants operational access.
4. TOTP AAL2 is mandatory for operational Admin.
5. Active `admin_profiles` membership is checked server-side.
6. Admin-profile disable revokes app authorization independently of JWT freshness.
7. Privileged transports re-authorize per invocation.
8. AAL2 never grants direct browser DB mutation authority.
9. Production launch requires backup MFA recovery capability.
10. Password recovery never bypasses MFA.
11. Lost-all-factors recovery is controlled break-glass, not public bypass.
12. Experimental passkeys/recovery-code APIs are not production dependencies.
13. Server code validates claims; it does not trust cookie-loaded session user objects blindly.
14. Auth and privileged DB clients remain separate.
15. No token/password/TOTP secret enters logs or analytics.
16. Production Auth does not leak into PR previews.

---

## Proposed decision registry

## 129. IAM decisions

| ID | Decision |
|---|---|
| `IAM-001` | Authentication exists only for private Admin; V1.x has no visitor accounts. |
| `IAM-002` | Supabase Auth is the managed identity provider selected by DOC-41. |
| `IAM-003` | Production Admin first factor is email + password. |
| `IAM-004` | Operational Admin requires TOTP MFA and an `aal2` session. |
| `IAM-005` | Production administrator must have at least two verified TOTP factors before launch. |
| `IAM-006` | SMS MFA is not baseline. |
| `IAM-007` | Experimental Supabase passkeys are deferred and are not a production dependency. |
| `IAM-008` | Magic-link/email-OTP and social providers are not normal Admin login methods. |
| `IAM-009` | Public signup, anonymous auth and phone-first auth remain disabled. |
| `IAM-010` | Admin provisioning is an owner-controlled operational process, not a public feature. |
| `IAM-011` | No active production `admin_profiles` row exists before required MFA provisioning is complete. |
| `IAM-012` | Supabase Auth owns credential/MFA/session state; `admin_profiles` owns only application authorization metadata. |
| `IAM-013` | Admin SSR uses cookie-based Supabase integration and PKCE for redirect flows. |
| `IAM-014` | Server Auth clients are request-scoped; no authenticated module singleton. |
| `IAM-015` | Auth-context and privileged-data Supabase clients remain separate. |
| `IAM-016` | Proxy/middleware may refresh Auth state but is never the final authorization boundary. |
| `IAM-017` | Server authorization uses validated claims (`getClaims` or equivalent), not unvalidated `getSession` user data. |
| `IAM-018` | Feature code receives a trusted `AdminPrincipal` instead of parsing Auth state independently. |
| `IAM-019` | A canonical `requireAdmin`-style server guard enforces identity, allowlist and AAL. |
| `IAM-020` | `authenticated` Supabase role never means portfolio Admin by itself. |
| `IAM-021` | All operational Admin pages and mutations require AAL2. |
| `IAM-022` | Every privileged Server Action and Route Handler re-authorizes at invocation time. |
| `IAM-023` | Audit actor identity is derived server-side from the verified principal. |
| `IAM-024` | Baseline authorization does not duplicate Admin role into custom JWT claims. |
| `IAM-025` | `/admin/login`, `/admin/mfa`, `/admin/recover`, callback and update-password flows are distinct. |
| `IAM-026` | `next` redirects accept only normalized same-origin `/admin` destinations. |
| `IAM-027` | Protected Admin layout renders only after server authorization. |
| `IAM-028` | Normal logout terminates Auth session without wiping unrelated public personalization. |
| `IAM-029` | Security settings provide explicit sign-out-all behavior where supported. |
| `IAM-030` | `admin_profiles.disabled_at` is an application-level authorization kill switch. |
| `IAM-031` | Access-token lifetime remains within provider-recommended short-lived ranges; extreme JWT shortening is rejected. |
| `IAM-032` | Refresh tokens are handled only by supported Auth SDK/session infrastructure and never copied into app storage/logging. |
| `IAM-033` | V1.x has no custom Remember Me session mode. |
| `IAM-034` | Paid Supabase session controls are optional hardening, not correctness dependencies. |
| `IAM-035` | Client-side idle locking cannot substitute for server session/authorization checks. |
| `IAM-036` | Admin auth source of truth is never a Zustand/client store. |
| `IAM-037` | AAL2 is enforced from trusted Auth state; client-supplied assurance values are ignored. |
| `IAM-038` | Security-factor changes require AAL2 plus fresh proof/reauthentication. |
| `IAM-039` | The security flow protects against casually deleting the final recovery factor. |
| `IAM-040` | Password recovery is generic/enumeration-resistant and uses provider recovery flow. |
| `IAM-041` | Production recovery email uses production-grade custom SMTP rather than provider trial delivery. |
| `IAM-042` | Recovery callback uses allowlisted PKCE redirect handling. |
| `IAM-043` | Password reset restores first factor only; operational Admin still requires AAL2. |
| `IAM-044` | Loss of password plus all MFA factors uses controlled break-glass recovery, never a public MFA bypass. |
| `IAM-045` | Password change requires provider-supported reauthentication/current-password controls plus AAL2. |
| `IAM-046` | `/admin/security` is a dedicated AAL2-only security surface. |
| `IAM-047` | TOTP enrollment secrets/QR payloads never enter logs, analytics or ordinary post-enrollment UI. |
| `IAM-048` | Auth provider errors map to stable application error codes/localizable copy. |
| `IAM-049` | Login/recovery responses resist account enumeration. |
| `IAM-050` | Legitimate AAL1 Admin sessions are redirected to MFA instead of receiving a generic authorization dead end. |
| `IAM-051` | `/admin/**` is noindex and outside public navigation, but route obscurity is not a security mechanism. |
| `IAM-052` | `admin_profiles` remains minimal and does not duplicate password/MFA/session state. |
| `IAM-053` | An AAL2 browser still receives no direct domain-table mutation authority. |
| `IAM-054` | Supabase Auth audit logs cover provider identity events; `admin_audit_events` covers portfolio domain actions. |
| `IAM-055` | Passwords, TOTP data and Auth tokens are prohibited from logs/analytics. |
| `IAM-056` | Provider Auth rate limits remain enabled; additional anti-abuse policy is delegated to DOC-47. |
| `IAM-057` | Admin Auth callbacks use explicit environment redirect allowlists, not uncontrolled preview wildcards. |
| `IAM-058` | Production, staging, preview and local Auth identities/sessions are isolated. |
| `IAM-059` | Generic PR previews receive no production Admin Auth secrets/session access. |
| `IAM-060` | Auth/provider outages fail Admin closed while preserving public-site independence. |
| `IAM-061` | Browser Supabase usage is constrained to Auth UX, not generic Admin data access. |
| `IAM-062` | Auth forms preserve password-manager, paste, keyboard and screen-reader compatibility. |
| `IAM-063` | Factor enrollment after production provisioning requires an already authorized AAL2 Admin. |
| `IAM-064` | High-risk email/factor/account changes are not ordinary profile edits. |
| `IAM-065` | Each sensitive mutation rechecks active Admin profile state. |
| `IAM-066` | Cross-request long-TTL caching of Admin authorization is not baseline. |
| `IAM-067` | RLS/AAL conditions remain defense-in-depth and do not replace application services. |
| `IAM-068` | Secret-key database access makes server application authorization mandatory. |
| `IAM-069` | Current `@supabase/ssr` integration is wrapped behind internal adapters because its API is still marked beta. |
| `IAM-070` | Experimental recovery-code/passkey APIs do not become V1.x security dependencies without approval. |
| `IAM-071` | Auth architecture remains secure without paid-only Supabase session features. |
| `IAM-072` | Public routes do not perform unnecessary Admin Auth work. |
| `IAM-073` | Auth/authorization implementation must pass the nine gates defined in DOC-45 before production. |

---

## Approval consequences

## 130. Approval consequences

Approval closes the baseline identity/access model and gives downstream documents these fixed assumptions:

- DOC-46 integrations/jobs must not invent a second identity provider;
- DOC-47 threat modeling can assume password + mandatory TOTP/AAL2 + active Admin allowlist;
- DOC-48 can configure domains/SMTP/session hardening against a known Auth flow;
- DOC-49 can monitor Auth failure without redefining authorization;
- DOC-50 can build the Auth/security test matrix against explicit invariants;
- DOC-51 can implement the exact Supabase/Next.js utilities without deciding credential policy ad hoc.

The next canonical document is:

**DOC-46 — Integrations, Caching, Jobs & Provider Resilience**.

---

## Current provider reference validation

These references are implementation context, not higher authority than approved project decisions:

- Supabase Auth overview: <https://supabase.com/docs/guides/auth>
- Supabase server-side Auth / SSR: <https://supabase.com/docs/guides/auth/server-side>
- Supabase SSR client creation / `getClaims`: <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- Supabase MFA overview: <https://supabase.com/docs/guides/auth/auth-mfa>
- Supabase TOTP MFA: <https://supabase.com/docs/guides/auth/auth-mfa/totp>
- Supabase password Auth/recovery: <https://supabase.com/docs/guides/auth/passwords>
- Supabase password security: <https://supabase.com/docs/guides/auth/password-security>
- Supabase sessions: <https://supabase.com/docs/guides/auth/sessions>
- Supabase Auth rate limits: <https://supabase.com/docs/guides/auth/rate-limits>
- Supabase passkeys (currently experimental): <https://supabase.com/docs/guides/auth/passkeys>

---

**End of DOC-45 — APPROVED**
