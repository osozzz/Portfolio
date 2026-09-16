---
id: AMENDMENT-PRE-V0-CONSISTENCY-001
record_type: amendment
decision_status: APPROVED
date: 2026-09-15
scope: "Accepted remediation of REVIEW-FINAL-DOC00-51-AUDIT-001"
applies_to: "DOC-00 through DOC-51 + ADR-003"
---

# AMENDMENT-PRE-V0-CONSISTENCY-001 — Pre-V0 Consistency Amendment

## Purpose

Apply the user-approved remediation set from `REVIEW-FINAL-DOC00-51-AUDIT-001` atomically before V0 repository/code implementation.

## Resolutions applied

1. `Currently Building` is repository-authored managed status in the V1.x baseline; ADR-003 prevents split-brain.
2. Public-write rate limiting uses PostgreSQL-backed atomic buckets/RPCs with an initial centrally configured policy matrix.
3. Domain-data retention and accountless deletion/anonymization now have bounded operational contracts.
4. Contact idempotency metadata is retained seven days; ambiguous retries stop after the provider deduplication guarantee.
5. `x-vercel-forwarded-for` is the trusted production network source under the approved DNS-only→Vercel topology.
6. V1.x bans are feature-scoped only; no universal visitor/public-write subject is persisted.
7. Request fingerprints use a separate `REQUEST_FINGERPRINT_HMAC_KEY_V1` and canonical HMAC domain.
8. `Save Local` Drawing drafts use a versioned IndexedDB repository.
9. Storybook is the V0 isolated-component environment.
10. Root-locale negotiation is deterministic (`portfolio_locale` → `Accept-Language` → English, 307, no geolocation).
11. Report/reaction/ban/audit code sets are canonical and `hidden → approved` restoration is removed from V1.2.
12. RenderCV PDF binaries are build outputs, not committed Git sources.
13. Dock accessibility QA separates viewport width, browser zoom, text scaling and short-landscape cases.
14. DOC-12↔DOC-13 dependency cycle is removed.
15. Sentry is the V0/V1.0 operational monitoring baseline; product analytics is disabled/no-op until separately approved.
16. Accountless privacy management uses one-resource deletion capabilities/local receipts and never invents a universal identity.
17. Approved-document hygiene was normalized: one H1 per technical document and stale draft/approval wording removed where identified.
18. DOC-08 was reconciled with the now-approved DOC-41–DOC-51 stack/providers/ownership instead of retaining “future/candidate” technical wording.
19. Sentry/product-analytics decisions were propagated back into DOC-42/DOC-46/DOC-49 and telemetry retention was fixed at ≤30d detailed / ≤90d aggregate baseline.
20. Accountless deletion and Local Data behavior were propagated into Arcade/Settings documentation.
21. DOC-51 now makes repository/project-operations bootstrap an explicit pre-code V0 step and keeps the GitHub Wiki non-canonical.

## Change-control principle

These changes close missing contracts and contradictions; they do not redesign the approved public product. Future changes to these resolved boundaries require the canonical owner and, where source-of-truth/security architecture materially changes, an ADR.
