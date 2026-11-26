---
id: REVIEW-CROSS-DOCUMENT-CONSISTENCY-004
record_type: review
review_status: COMPLETE
review_result: PASS
date: 2026-11-25
scope: DOC-00 through DOC-52 + ADR-001 through ADR-009 after AMENDMENT-CONTACT-001
supersedes_gate_from: PROPOSAL-CONTACT-001
v0_implementation_gate: CLEARED_FOR_REPOSITORY_BOOTSTRAP
---

# REVIEW-CROSS-DOCUMENT-CONSISTENCY-004 — Post-Contact-Revision Verification

## 1. Purpose

Verify that the baseline revised under `PROPOSAL-CONTACT-001` and `AMENDMENT-CONTACT-001` is internally consistent. That proposal removed the Contact form in favor of a visible domain address, a Copy button and a `mailto:` link (ADR-009).

## 2. Executive result

**PASS.** P0 = 0, P1 = 0, P2 = 0, P3 = 0 unresolved. The V0 gate stays `CLEARED_FOR_REPOSITORY_BOOTSTRAP`; this revision does not touch the bootstrap.

## 3. Method

- Automated checks over the baseline:
  - status (`document_status` valid on every DOC);
  - references (every `DOC-NN` and `ADR-NNN` resolves);
  - the Contact check: no line ties Contact to a form, a submission, Turnstile, Resend, rate limits, an authorization checkbox, a delivery provider or form validation unless it cites ADR-009, and no Resend mention remains outside ADR-009 citations;
  - the attribution check on every added line.
- Manifest: the bytes and sha256 of every hashed file match.
- An independent full-branch review read the diff in context against ADR-009 and checked the five review-focus items below.

## 4. Review focus results

| # | Focus | Evidence | Result |
|---|---|---|---|
| 1 | Community anti-abuse survives | Lines tying Turnstile or rate limits to Guestbook, Sketch, community or public writes: 13 before the revision, 13 after. DOC-12 §7, the DOC-47 rate-limit table, SECARC-046, the kill switches and DTA-101 are intact. | PASS |
| 2 | Hidden personal data in V1.0 | ADR-009 §4 and DOC-12 §10A list the controller, hosting logs including IP addresses, local preferences, analytics status, Sentry and the rights channel. | PASS |
| 3 | Retired IDs stay coherent | Every retired ID is marked `Retired (ADR-009)`; no other document relies on its old meaning (see AMENDMENT-CONTACT-001). | PASS |
| 4 | No JavaScript and clipboard denied | DOC-16 §3, §7 and §8, DOC-42 §65 and DOC-50 §47 agree: the address and `mailto:` work without JavaScript, Copy renders only where the Clipboard API exists, and a rejected write shows the inline message and selects the address. | PASS |
| 5 | ADR-008 obligations still in force | ADR-009 §6 keeps ADR-008 §1, §4, §5, §6 and §8; DOC-50 §86 adds the V1.2 exit criteria for the full policy, lawyer review, RNBD check and Auth SMTP. | PASS |

## 5. Findings and corrections

The independent review found no critical findings and no collateral damage to community features. Its important findings were corrected before this record:

- ADR-004 §9 (Resend) and the ADR-007 V1.0 policy item were added to ADR-009 `supersedes`. Both ADRs are marked superseded in part.
- The V1.2 admin Auth recovery email is described consistently. The root domain never sends; recovery uses a dedicated subdomain (ADR-009 §3, DOC-08, DOC-15, DOC-16, DOC-41, DOC-45 §57, DOC-46, DOC-48).
- The root-domain SPF rule is defined once in DOC-48 §16, including the case where the forwarder requires an include, and cited everywhere else.
- The privacy notice scope is the same in ADR-009 §4 and DOC-12 §10A.

Minor findings were also corrected:

- residual wording in DOC-01, DOC-07, DOC-31, DOC-43, DOC-46, DOC-49 and DOC-50;
- Turnstile timing (from V1.2);
- the Copy failure definition and the tab order;
- retirement markers on headings;
- the DKIM record name;
- the option label in ADR-009;
- the V1.2 exit criteria.

## 6. Declined to judge

- Whether a site that collects no data through forms needs specific Decreto 1377 content in its notice, and the RNBD timing. Both are part of the lawyer review before V1.2.
