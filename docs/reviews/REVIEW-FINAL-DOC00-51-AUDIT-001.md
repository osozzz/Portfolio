---
id: REVIEW-FINAL-DOC00-51-AUDIT-001
record_type: review
review_status: COMPLETE
review_result: REMEDIATION_REQUIRED
date: 2026-09-15
scope: DOC-00 through DOC-51 + ADR-001/ADR-002 + package/governance metadata + current-provider validation
supersedes_gate_from: REVIEW-CROSS-DOCUMENT-CONSISTENCY-002
v0_implementation_gate: HOLD
---

# REVIEW-FINAL-DOC00-51-AUDIT-001 — Final Cross-Phase Audit Before V0

## 1. Purpose

This review audits the complete approved planning baseline **DOC-00 through DOC-51** before implementation starts. It is intentionally broader than `REVIEW-CROSS-DOCUMENT-CONSISTENCY-002`: that previous review verified Product + Interface + Visual Design through DOC-40; this review adds the complete Technical Architecture package and asks whether the resulting system can be implemented without inventing missing contracts or choosing between conflicting approved authorities.

The audit does **not** modify approved numbered documents. It records findings and proposed remediations first. Any accepted remediation should be applied atomically in a separate consistency amendment, followed by another verification pass.

## 2. Executive result

**REMEDIATION REQUIRED. V0 implementation gate: HOLD.**

The baseline is structurally strong and substantially coherent, but Technical Architecture introduced or exposed a small set of unresolved cross-document contracts that should be closed before implementation. The most important issue is a source-of-truth conflict around `Currently Building` / `MANAGED_STATUS`. Several other findings are not product redesigns; they are missing implementation contracts in security/data/runtime behavior that downstream documents explicitly promised to close but did not.

Audit totals:

- **52/52 numbered documents present**;
- **52/52 numbered documents marked `APPROVED`**;
- **2 approved ADRs present**;
- **0 missing numbered-document dependencies**;
- **0 unresolved DOC references**;
- **1 dependency-graph cycle** (`DOC-12 ↔ DOC-13`);
- **0 manifest hash/byte mismatches** in the approved baseline;
- **0 Markdown fence-balance failures**;
- **1 P0 finding**;
- **8 P1 findings**;
- **8 P2 findings**;
- **3 P3 documentation-hygiene findings**.

The architecture should **not** be discarded or redesigned. Most fixes are narrow and can be applied without changing the portfolio's approved product experience.

## 3. Severity model

| Severity | Meaning in this review |
|---|---|
| **P0** | Approved contracts conflict or create two competing authorities; implementation would necessarily choose one and silently violate another. Must resolve before V0 starts. |
| **P1** | Required behavior/security/data contract is not implementable deterministically from the approved docs. Must resolve before the affected implementation begins; because V0 establishes these foundations, resolve before V0 baseline freeze. |
| **P2** | Important ambiguity, deferred choice or policy gap that is unlikely to corrupt architecture immediately but should be normalized before its release/feature is built. |
| **P3** | Documentation/governance hygiene; no material product/runtime contradiction, but cleanup improves machine-readability and future tooling reliability. |

## 4. Audit method

The review combined manual cross-phase inspection with scripted checks over the physical Markdown package.

The scripted pass checked:

1. DOC-00→DOC-51 presence and approval metadata;
2. frontmatter parsing;
3. `depends_on` graph and missing references;
4. dependency cycles;
5. explicit DOC references;
6. formal decision-ID collisions;
7. Markdown code-fence balance;
8. manifest-listed file presence, SHA-256 and byte sizes;
9. route/release/state keywords;
10. unresolved downstream-deferral chains.

The manual pass cross-checked:

- source-of-truth ownership;
- managed/runtime data versus repo-authored data;
- Contact idempotency/privacy;
- Community moderation/reporting/bans;
- Drawing local/public persistence;
- Arcade session authority;
- Admin Auth/AAL2 boundaries;
- Supabase grants/RLS/runtime access;
- pseudonymous abuse identifiers;
- rate limiting;
- privacy/retention/deletion;
- trusted proxy/client-network derivation;
- localization/SEO/root-route behavior;
- component-system/tooling requirements;
- RenderCV artifacts;
- performance/testing/CI gates;
- external provider assumptions.

Machine-readable structural evidence is stored at:

`docs/reviews/evidence/FINAL-AUDIT-001-STRUCTURAL.json`

---

# Blocking findings

## P0-01 — `Currently Building` has two plausible sources of truth and no Technical-Architecture persistence owner

### Evidence

DOC-36 classifies `Currently Building` as `MANAGED_STATUS`, explicitly separate from canonical project lifecycle, and states that V1.x Admin may mutate runtime-managed data such as Currently Building. It also shows a repository content tree containing `content/managed-status/`.

DOC-03 and DOC-25 likewise require the owner/Admin to update runtime-managed Currently Building/status data.

DOC-41 recognizes runtime operational status as a runtime-data class and mentions runtime status mutation.

However, DOC-44 defines the runtime database in detail and provides **no table/model for Managed Status / Currently Building / site status**, while DOC-43 provides no corresponding application service/command and DOC-45 provides no Admin workflow for editing it.

The result is an unresolved authority split:

```text
content/managed-status/       ?
        versus
runtime-managed Admin state   ?
```

The previous Product/Visual consistency audit intentionally prohibited source-of-truth split-brain. Technical Architecture currently reopens it.

### Impact

A V1.0 implementation must either read Currently Building from the repository or invent a runtime store. If an implementation later adds Admin editing without migrating authority, the same field can disagree between Git and PostgreSQL.

### Proposed remediation

Choose one explicit phased contract and update DOC-03/25/36/41/43/44/45/46/49/50/51 consistently.

**Recommended phased resolution:**

```text
V1.0
Currently Building source = repository-authored managed-status file
Admin does not yet exist publicly

V1.2 Admin introduction
→ ADR migrates Currently Building authority to runtime DB only if Admin editing is still desired
→ add managed_status table/service/Admin command
→ migrate initial state
→ remove repository-owned runtime value or keep only a generated/fallback snapshot
```

Alternative valid resolution: add a runtime `managed_status` table from V1.0 and make PostgreSQL authoritative immediately. If this path is chosen, the failure/fallback behavior must also be defined because Home can no longer treat that widget as purely build-owned content.

**Do not** keep both as writable authorities.

---

# P1 findings

## P1-01 — Rate limiting is required everywhere but has no concrete serverless-safe persistence model or initial threshold set

### Evidence

DOC-43 defines `AbuseGuard` and `RATE_LIMITED`, then defers exact thresholds/cryptography to DOC-47.

DOC-47 defines a robust layered model:

- short burst limits;
- rolling windows;
- operation cooldowns;
- per-abuse-key counters;
- provider/global safety caps;
- Arcade concurrency;
- ban checks;
- Turnstile/risk gates.

It also explicitly classifies “rate-limit persistence/decision logic” as server-only code and says exact thresholds are centrally configured.

DOC-44 stores feature-scoped abuse keys on some domain rows and provides indexes that *could* support bounded lookups, but it does not define a generic rate-limit bucket/counter model. Contact's operation ledger intentionally stores no Contact abuse key. DOC-49 does not provide the concrete public-write thresholds that DOC-47 says downstream reliability configuration will own.

No Redis/managed limiter has been approved either.

### Impact

Contact V1.0 already requires rate limiting. A developer/implementer must currently invent both:

1. where counters live across serverless invocations;
2. what initial policy is.

An in-memory Map would be incorrect on serverless infrastructure and can fail open under horizontal scale.

### Proposed remediation

Keep `AbuseGuard` provider-neutral but choose one baseline persistence implementation before V0 freeze.

**Recommended current-stack baseline:** narrow PostgreSQL-backed rate-limit buckets/RPCs keyed by feature-scoped opaque abuse key + policy/window, with finite expiry and atomic increment. This avoids a new Redis/provider dependency for expected portfolio scale.

Define centrally configured initial policies per feature (Contact, Guestbook, Sketch, Reports, Reactions, Arcade issuance/finalization, Admin Auth edge controls). Treat exact values as tunable configuration, but commit an initial safe set so code/tests have deterministic behavior.

If later load justifies an edge/Redis limiter, migrate behind the same interface through ADR/evidence.

---

## P1-02 — Retention and privacy-deletion policy is deferred in a loop and never becomes concrete

### Evidence

DOC-44 provides `retention_until` / `expires_at` hooks and explicitly defers:

- exact UGC/report/Arcade retention periods;
- privacy deletion request process;
- security-sensitive retention policy

to DOC-47.

DOC-47 then defers concrete retention windows to DOC-49.

DOC-49 defines **telemetry retention only** and says exact telemetry days can be finalized during provider/privacy configuration. It does not define the domain-data retention matrix promised by DOC-44/47.

DOC-46 has cleanup jobs that depend on those horizons, so scheduling exists without authoritative durations.

The same gap affects the approved Product requirement that persistent categories eventually define deletion/anonymization behavior rather than “keep forever”.

### Impact

The DB schema can be built, but cleanup, privacy requests, moderation evidence, Arcade evidence and audit retention cannot be implemented/tested consistently.

### Proposed remediation

Create one canonical **Data Retention & Deletion Matrix**, owned by Security/Data (preferably a new subsection/amendment to DOC-47 with DOC-44 consuming it).

At minimum define policy for:

- approved Community content;
- pending/rejected/hidden Community content;
- reports after resolution/dismissal;
- reactions;
- Arcade issued/expired/finalized sessions;
- Arcade evidence;
- public scores;
- Contact operation metadata;
- rate-limit buckets;
- abuse-ban metadata after expiry/revocation;
- Admin audit events;
- integration cache metadata;
- observability telemetry;
- local visitor data;
- deletion/anonymization request handling and cache invalidation.

Each row needs: purpose, data class, retention horizon, purge/anonymize behavior, exceptions, cleanup mechanism and audit effect.

---

## P1-03 — Contact idempotency horizon is undefined even though the provider deduplication window is 24 hours

### Evidence

DOC-44 defines `contact_delivery_operations.expires_at` as “short idempotency retention” and explicitly cleans it after a retention horizon, but no duration is approved.

Resend currently retains idempotency keys for **24 hours**. The portfolio relies on the local operation ledger + the provider key to recover safely from “provider accepted, app crashed before DB completion”.

### Impact

If local metadata expires earlier than or too close to the provider's deduplication boundary, a delayed/replayed client retry can create ambiguous behavior or duplicate delivery after the provider forgets the key.

### Proposed remediation

Approve an explicit local ledger horizon **greater than the provider deduplication/retry risk window**. A simple baseline such as 48–72 hours is appropriate for review, but the exact value should be approved rather than inferred by implementation.

Also define post-expiry semantics: an old operation ID is rejected/treated as expired rather than silently recreating the same logical operation with uncertain delivery history.

---

## P1-04 — Security requires a trusted client-network source, but Infrastructure never names the concrete Vercel source

### Evidence

DOC-47 says:

- client network context comes only from trusted platform request context/forwarding headers;
- arbitrary left-most `X-Forwarded-For` is not trusted;
- DOC-48 will document the deployment-specific trusted proxy model.

DOC-48 correctly chooses Cloudflare **DNS-only** and Vercel as the application edge, but it does not identify the header/API that `AbuseGuard` must consume.

Current Vercel documentation states that `x-forwarded-for` contains the public client IP and is overwritten by Vercel to prevent spoofing for direct Vercel traffic; `x-vercel-forwarded-for` is the Vercel-specific equivalent and is designed to remain Vercel-sourced even where another proxy can affect `x-forwarded-for`.

### Impact

A security-critical implementation detail remains open. Different developers could parse different headers or trust comma-separated values differently.

### Proposed remediation

For the approved DNS-only → Vercel topology, define the canonical production network source as **Vercel's trusted request header/context**, preferably `x-vercel-forwarded-for` under the current platform contract, with strict parsing and a documented local/test fallback.

If a reverse proxy is ever inserted in front of Vercel, reopen this trust-boundary decision instead of retaining the same parser blindly.

---

## P1-05 — “Global public-write ban” conflicts with the privacy rule that feature abuse hashes must be unlinkable

### Evidence

DOC-47 requires independent feature namespaces (`contact`, `guestbook`, `sketch`, `reports`, `reactions`, `arcade`) and explicitly prevents a hash from becoming a cross-feature join key.

DOC-44 nevertheless allows:

```text
subject_namespace = global
 enforcement_scope = global-public-writes
```

DOC-47 also says an Admin may deliberately create a global-public-writes ban.

But the application normally discards raw client IP after immediate processing. Given only a stored Guestbook-scoped HMAC, the Admin cannot later derive the corresponding Contact/Sketch/Arcade hashes without the original network value. Persisting a universal “global” HMAC would reintroduce the cross-feature identifier the privacy architecture forbids.

### Impact

The schema promises an operation that is not implementable from its own privacy constraints without inventing a universal identifier or retaining extra network data.

### Proposed remediation

**Recommended V1.x baseline:** support feature-scoped bans only. If an Admin wants to ban multiple public-write surfaces during the same live request/security event, create separate per-feature scoped ban subjects from transient trusted network context; do not store one universal subject.

Remove `global` / `global-public-writes` from the baseline schema until a privacy-reviewed mechanism is explicitly designed.

---

## P1-06 — Request/payload fingerprint HMAC cryptography is less specified than abuse-key cryptography

### Evidence

DOC-44 correctly states that request fingerprints must be keyed/versioned and that raw SHA-256 of low-entropy sensitive input is insufficient. It defers the exact HMAC/key rotation to DOC-47.

DOC-47 explicitly defines HMAC-SHA-256 and a dedicated secret/domain separation for **abuse keys**, but does not separately define:

- the request fingerprint HMAC key;
- canonical serialization/normalization input;
- domain separation between Contact/Guestbook/Report fingerprints and network-abuse identifiers;
- key-rotation handling for fingerprints.

DOC-48 lists `ABUSE_HMAC_KEY_V1` but no distinct fingerprint secret.

### Impact

Implementation may accidentally reuse the abuse-network secret, couple unrelated privacy domains, or generate fingerprints differently across retries.

### Proposed remediation

Define a dedicated `REQUEST_FINGERPRINT_HMAC_KEY_V1`, or a documented root-key derivation using strong domain separation (for example HKDF labels). Define canonical normalized serialization per operation before HMAC and rotation behavior for stored `fingerprint_key_version`.

Keep request fingerprinting cryptographically and semantically separate from network abuse identity.

---

## P1-07 — “Save sketch locally” is an approved feature with no durable local data contract

### Evidence

Product/Interface docs require:

```text
Create → Save Local optional → Publish → moderation
```

Settings must also be able to clear local sketches/data.

DOC-42 defines typed local-preference repositories for appearance, widgets, onboarding, personalization and Arcade-local state, but provides no Drawing draft repository, storage technology, model versioning, quota, migration, corrupt-data recovery or reset behavior.

Drawing high-frequency state is defined, but high-frequency in-memory state is not the same as a durable local saved sketch.

### Impact

V1.2 implementation must invent persistence behavior, and large drawing models are a poor fit for an unbounded ad-hoc `localStorage` key.

### Proposed remediation

Define a **versioned DrawingDraftRepository**, preferably backed by IndexedDB for logical drawing models. Specify:

- stable draft IDs;
- drawing schema version;
- bounded draft count/storage budget;
- save/update/delete/list;
- migration or reset on incompatible versions;
- corruption fallback;
- Settings “clear local sketches” behavior;
- no network publication without explicit Publish.

The in-memory drawing engine remains separate from durable draft persistence.

---

## P1-08 — An isolated component environment is mandatory, but Storybook/alternative is never finally selected

### Evidence

DOC-27 and DOC-32 state that an isolated component environment is **required**, with Storybook preferred pending technical confirmation.

DOC-42 repeats that Storybook remains preferred and explicitly delegates exact configuration/tool choice to DOC-50/51.

DOC-50 and DOC-51 define testing/CI in depth but never select Storybook or another isolated component harness.

### Impact

A mandatory V0 developer-experience requirement reaches the end of Technical Architecture still unresolved. Implementation tooling would have to choose the tool.

### Proposed remediation

Select **Storybook** as the V0 baseline unless there is a documented incompatible constraint. Define core decorators/stories for:

- Light/Dark;
- ES/EN;
- Compact/Medium/Expanded/Wide containers;
- Motion reduced/full;
- Transparency full/reduced/off;
- focus/selected/locked/error/loading states;
- Widget Field sizes;
- glass quality levels.

If a different harness is preferred, approve it explicitly instead of leaving “Storybook preferred” unresolved.

---

# P2 findings

## P2-01 — Root `/` locale negotiation is conceptually defined but not operationally deterministic enough

DOC-42 says root `/` uses request-language preference with a deterministic fallback and no geolocation. DOC-10 requires `/en/...` and `/es/...` canonical routes. The docs do not yet fix:

- whether an explicit saved language preference outranks `Accept-Language`;
- the actual fallback locale;
- whether the root redirect is temporary (`307`) versus permanent;
- `x-default`/root canonical behavior;
- cache variation implications.

### Proposed remediation

Approve one ordered algorithm. Example:

```text
1. explicit visitor locale cookie/preference, if present
2. Accept-Language supported match
3. deterministic fallback locale
4. 307 redirect to /en or /es
5. never infer from geolocation
```

Choose the actual fallback language deliberately and document SEO `x-default` behavior.

---

## P2-02 — Report/reaction/audit/ban “allowlisted” codes do not have canonical value sets

DOC-44 requires allowlisted `reason_code`, `reaction_code`, Admin audit `action` and ban reason classes, but the concrete enums/lookup contracts are not closed. The report allowlist was explicitly deferred to DOC-47 and never defined there.

### Proposed remediation

Create canonical versioned code sets before V1.2 schema freeze. Example report categories might include spam, harassment/abuse, personal-data exposure, inappropriate content and other; the exact product vocabulary should be approved rather than guessed in migrations.

The DB should enforce the approved set through `CHECK`, enum/lookup table, or a deliberately versioned policy mechanism.

---

## P2-03 — `hidden → approved` restoration exists in the state machine without a product policy or command

DOC-43/DOC-44 permit `hidden → approved` only “if policy allows restoration”, but no approved product rule says whether restoration exists, and the Admin command inventory does not clearly define `RestoreSubmission`.

### Proposed remediation

Simplest V1.2 baseline: **no restore command**; hidden content stays hidden unless a future ADR adds a deliberate audited restore workflow. Alternatively, add explicit restore policy, service, expected version check and audit action.

---

## P2-04 — RenderCV artifact generation is settled, but commit-vs-build ownership remains ambiguous

DOC-37 explicitly leaves open whether generated PDFs are committed or generated only in deployment CI. DOC-48 says PDFs are produced in CI/build and deployed as static public artifacts. DOC-51 says **“If PDFs are committed…”**, so repository policy never closes the question.

### Proposed remediation

Recommended: commit only canonical structured CV source; generate EN/ES PDFs in CI/build into `public/cv/` (or a pre-build generated directory copied there), validate both, and expose generated artifacts to PR review. Do not commit PDF binaries unless the hosting/build workflow proves that necessary.

Whichever model is chosen, DOC-37 and DOC-51 should agree explicitly.

---

## P2-05 — Dock stress gate mixes “200% text zoom” and “200% browser zoom” terminology

DOC-38 specifically requires 320 CSS px + **200% text zoom** for the six-destination Dock. DOC-50 alternates among `200% text/browser zoom`, `200% zoom`, and `browser zoom 200%`.

This is not necessarily geometrically impossible, but the QA procedure can produce different effective layout widths depending on browser and automation semantics.

### Proposed remediation

Separate test cases explicitly:

1. 320 CSS-px viewport at normal page zoom;
2. 200% browser page zoom on a documented physical/viewport baseline;
3. 200% text scaling where the platform supports independent text scaling;
4. short landscape.

All must preserve six direct destinations, but the Dock may recompose within the approved “responsive preserves capability, not identical geometry” rule if necessary.

---

## P2-06 — `DOC-12 ↔ DOC-13` creates the only dependency-graph cycle

Frontmatter currently states:

```text
DOC-12 depends_on DOC-13
DOC-13 depends_on DOC-12
```

Product requirements may cross-reference each other in prose, but `depends_on` should be directional if it is used for tooling reading order/topological processing.

### Proposed remediation

Keep DOC-13 depending on DOC-12 (Community builds on general Security/Privacy requirements). Remove DOC-13 from DOC-12 `depends_on`; DOC-12 may still reference DOC-13 as a specialization.

---

## P2-07 — Analytics and error-monitoring provider deferrals do not fully close

DOC-46 explicitly defers analytics-provider and error-monitoring-provider selection to DOC-49.

DOC-49 keeps analytics provider-neutral and recommends **“Sentry or equivalent”** rather than selecting a concrete monitoring provider. DOC-51 already contains Sentry-oriented environment/source-map guidance.

### Proposed remediation

Make one of these explicit:

```text
Analytics V1.0 = disabled until separate privacy/provider decision
Error monitoring V0/V1.0 = Sentry behind centralized wrappers
```

or select another provider deliberately. Provider-neutral interfaces should remain regardless.

For analytics, “disabled by default until selected” is preferable to accidentally adding a script during implementation.

---

## P2-08 — Privacy deletion/anonymization is required but no user/admin operational workflow is defined

This is related to P1-02 but distinct from retention duration. DOC-44 explicitly defers a “privacy deletion request process” to DOC-47, and DOC-47 does not define how a request is authenticated/verified or how Community content, reports, audit summaries and caches are handled.

Because visitors do not have accounts, deletion cannot simply mean “delete everything for user_id”.

### Proposed remediation

Define a narrow accountless privacy workflow before Community launch:

- what data is eligible for deletion/anonymization;
- what proof/reference a visitor can supply;
- what Admin can search safely;
- what cannot be correlated because the system intentionally avoids universal identity;
- treatment of public content versus moderation/audit evidence;
- cache/preview invalidation;
- response/audit procedure.

Do not promise impossible “delete everything this person ever did” semantics when the architecture intentionally cannot identify a person across features.

---

# P3 documentation/governance findings

## P3-01 — Approved technical documents retain draft/approval-gate language

Examples include:

- DOC-45/46/47: “references used for this draft”;
- DOC-49 and DOC-51: “Approval recommendation” headings;
- DOC-43/44 and earlier visual docs retain “Approval gate” sections.

No runtime impact, but the package is now approved and automated tooling may treat that language as unresolved state.

### Proposed remediation

Rename to `Reference validation`, `Accepted baseline`, or `Change-control gate` as appropriate. Do not alter substantive decisions.

---

## P3-02 — Technical docs use multiple H1 headings despite the earlier one-H1 document convention

The structural scan shows DOC-41→DOC-51 use `#` for many internal sections rather than one document H1 followed by `##` sections. This does not break Markdown, but it differs from earlier docs and from the package's previous structural assertion language.

### Proposed remediation

Normalize section hierarchy when doing the consistency amendment, or explicitly change the documentation style rule. Prefer one H1 per numbered document for navigation/accessibility/tooling consistency.

---

## P3-03 — Some deferral prose points to a document that no longer owns the final decision

Examples include earlier technical text saying DOC-49 will assign exact rate limits/retention, while DOC-49 did not. These are already captured substantively in P1 findings, but stale ownership arrows should be fixed even after a decision is added.

### Proposed remediation

After accepting the fixes, search all `defer`, `belongs to DOC-*`, `exact ... DOC-*`, `later document` phrases and make sure every arrow ends at the actual canonical owner rather than at a historical planning assumption.

---

# 5. Current-provider validation

The audit rechecked selected time-sensitive platform assumptions against current official documentation on 2026-09-15.

## Supabase

Validated:

- Passkey support is still marked **experimental**, so DOC-45 is correct to defer it as a production dependency.
- `@supabase/ssr` is still documented as **beta**, so wrapping it behind project adapters remains appropriate.
- Supabase is deprecating legacy `anon` / `service_role` keys by end of 2026 in favor of publishable / secret keys; DOC-44/48's newer terminology is directionally correct.
- Secret/service-role class credentials remain server-only/high privilege.

Official references:

- https://supabase.com/docs/guides/auth/passkeys
- https://supabase.com/docs/guides/auth/server-side
- https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
- https://supabase.com/docs/guides/getting-started/api-keys

## Vercel

Validated:

- current Vercel guidance favors Vercel Functions/Node.js for new projects; legacy Edge Functions are deprecated for new projects;
- direct Vercel request handling provides `x-forwarded-for` as public client IP and documents spoofing protection by overwriting it;
- `x-vercel-forwarded-for` is the Vercel-specific equivalent and is useful for the trusted-network remediation in P1-04.

Official references:

- https://vercel.com/docs/headers/request-headers
- https://vercel.com/changelog/edge-middleware-and-edge-functions-are-now-powered-by-vercel-functions

## Cloudflare Turnstile

Validated:

- Siteverify server validation is mandatory;
- tokens are single-use;
- token lifetime is 300 seconds / five minutes.

DOC-46/47 remain consistent with this.

Official reference:

- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## Resend

Validated:

- API idempotency keys deduplicate within the last **24 hours**.

This is why P1-03 requires the local Contact ledger to define an explicit horizon rather than “short retention”.

Official reference:

- https://resend.com/docs/dashboard/emails/idempotency-keys

## Next.js

Validated:

- `after()` is stable since Next.js 15.1;
- Cache Components in Next.js 16 use the `cacheComponents` flag with `use cache`, `cacheLife` and `cacheTag`.

The architecture's use of these capabilities remains reasonable, subject to pinning actual supported versions during V0 bootstrap as already planned.

Official references:

- https://nextjs.org/docs/app/api-reference/functions/after
- https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents

---

# 6. Confirmed coherent areas

The deep audit also found many contracts that remain aligned and should **not** be reopened unnecessarily:

1. Product remains a responsive web application; native App Store/Play Store delivery is N/A in V1.x.
2. Payments/e-commerce and payment webhooks/refunds/reconciliation remain explicitly N/A.
3. Fixed Dock order remains Home → Achievements → Arcade → Channel → Social → Contact.
4. Later-release major spaces remain real localized Coming Soon routes in V1.0, `noindex` and out of sitemap until launch.
5. Visitor accounts remain absent; Admin is the only authenticated class.
6. Controlled Widget Field personalization remains V1.0 and stores semantic intent, never x/y coordinates.
7. Widget responsive budgets remain Compact 1 / Medium ≤2 / Expanded 2–3 / Wide 3–4.
8. Project lifecycle remains separate from publication, visibility and privacy axes.
9. Community moderation state remains exactly pending/approved/rejected/hidden; reports stay independent.
10. Arbitrary visitor image/SVG uploads remain excluded from Sketch publication baseline.
11. No Supabase Storage bucket is required for baseline Sketch publication.
12. Arcade session authority, plausibility and one-score-per-session invariants remain coherent.
13. Admin remains password + TOTP AAL2 + active `admin_profiles` allowlist.
14. Production secret Supabase access remains server-only and does not become a browser convenience path.
15. Public/admin DB DTOs remain allowlisted projections rather than raw row exposure.
16. Repo-authored professional facts remain canonical and are not silently editable through Admin.
17. Vercel/Supabase Preview isolation remains separate from Production credentials/data.
18. Cloudflare remains DNS-only in the baseline; there is no accidental double-CDN design.
19. Production region choice remains an intentional benchmark gate rather than an unresolved contradiction.
20. RPO/RTO, degraded modes and Professional Core failure isolation are coherent at the architectural level.
21. Core performance budgets and lazy heavy-feature boundaries remain aligned.
22. Testing strategy covers unit/component/integration/database/E2E/a11y/visual/performance/security/resilience.
23. Trunk-based Git + PR/CI + Vercel Preview + migration-controlled Supabase remains coherent.
24. RenderCV structured sources remain canonical and generated PDFs never become editable source of truth.
25. Sound stays OFF first visit; background music is not required.
26. Liquid Glass degradation hierarchy and accessibility fallbacks remain consistent.
27. PWA/offline support remains non-required rather than silently entering V1.x scope.
28. CSP pre-paint/bootstrap exact mechanism remains a legitimate prototype/security gate, not a contradiction.
29. Exact package versions remain intentionally unpinned until V0 bootstrap validation.
30. The iad1/us-east-1 versus gru1/sa-east-1 region decision is intentionally evidence-gated and should remain so until benchmarked.

---

# 7. Recommended remediation order

Apply fixes in this order so one patch does not create another contradiction:

### Wave A — source of truth / data ownership

1. P0-01 Managed Status / Currently Building authority;
2. P1-02 Retention + deletion matrix;
3. P1-05 ban scope/privacy semantics;
4. P1-06 request fingerprint cryptography;
5. P2-02 allowlisted codes;
6. P2-03 restoration policy;
7. P2-08 accountless privacy deletion workflow.

### Wave B — request security / runtime correctness

8. P1-01 rate-limit persistence + initial policy;
9. P1-04 trusted client-network source;
10. P1-03 Contact idempotency retention.

### Wave C — frontend/DX/runtime contracts

11. P1-07 Drawing local draft persistence;
12. P1-08 Storybook/isolated component environment;
13. P2-01 root locale algorithm;
14. P2-04 CV artifact commit/build policy;
15. P2-05 Dock zoom test semantics;
16. P2-07 monitoring/analytics provider decision.

### Wave D — governance cleanup

17. P2-06 dependency cycle;
18. P3-01 stale draft/approval language;
19. P3-02 heading hierarchy;
20. P3-03 stale deferral ownership arrows.

After this atomic amendment, re-run:

- dependency graph;
- source-of-truth matrix;
- release/route matrix;
- privacy/retention matrix;
- runtime tables/services/commands coverage;
- security secrets/key-purpose map;
- rate-limit policy tests;
- route/localization tests;
- Markdown/manifest integrity;
- current-provider assumption validation where time-sensitive.

---

# 8. Implementation gate

**V0 implementation gate remains HOLD** until at least P0 and P1 findings are remediated and a post-remediation review confirms they are closed.

P2 findings should also be normalized in the same amendment where practical because most are cheap to fix now and expensive to discover through generated code later.

The correct next step is **not** to write production code and hope these details resolve themselves. The correct next step is an atomic consistency patch across the canonical owner documents, followed by `REVIEW-FINAL-DOC00-51-AUDIT-002`.

