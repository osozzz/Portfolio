---
id: AMENDMENT-CONTACT-001
record_type: amendment
decision_status: APPROVED
date: 2026-11-25
scope: "Contact without a form, approved in PROPOSAL-CONTACT-001"
applies_to: "DOC-00 through DOC-52 + ADR-008, ADR-009"
---

# AMENDMENT-CONTACT-001 — Contact Without a Form

## Purpose

Record every document change made under `PROPOSAL-CONTACT-001`. Contact in V1.0 has no form. It shows a visible domain address that forwards to the owner, a Copy button and a `mailto:` link. Every change cites ADR-009.

## Approval

The owner chose option B on 2026-11-19 and its details on 2026-11-25. On 2026-11-25 the owner delegated the review and merge of the revision pull request.

## Retired identifiers

Retired IDs are kept and marked `Retired (ADR-009)` so their history stays traceable.

| Document | Retired |
|---|---|
| DOC-05 | USR-024 |
| DOC-06 | FR-015, FR-016, FR-070 |
| DOC-16 | MSG-002, MSG-003, MSG-007 |
| DOC-41 | TAM-010 |
| DOC-43 | BEA-023 (reworded), BEA-024, BEA-025, BEA-026; §28–§30; Gate B1 |
| DOC-44 | DTA-044, DTA-045, DTA-097, DTA-102; §41A, §42, §43, §43A; Gate D6 |
| DOC-46 | ICJ-046, ICJ-047, ICJ-049, ICJ-051, ICJ-054; §52–§55, §57; Gate C |
| DOC-47 | SECARC-051, SECARC-052; §70 for Contact |
| DOC-49 | POR-062 |

## New identifiers

| Document | New |
|---|---|
| DOC-06 | FR-075 Contact address, FR-076 Copy address |
| DOC-16 | MSG-008 works without JavaScript, MSG-009 canonical rotatable address |
| DOC-10 | `contact.intro`, `contact.copy`, `contact.copied`, `contact.copyFailed`, `contact.emailMe`, `contact.subject` (replace `contact.authorization`) |

## Changes by document

| Document | Change |
|---|---|
| ADR-004, ADR-007, ADR-008 | Marked superseded in part by ADR-009 (ADR-004 §9 Resend; ADR-007 V1.0 policy; ADR-008 timing and Contact authorization); bodies unchanged. |
| ADR-009 | New. Contact without a form; no email to visitors; short privacy notice in V1.0; full policy, lawyer review and RNBD check before V1.2; admin Auth recovery from V1.2 is the only outbound email, on a dedicated sending subdomain. |
| DOC-00, DOC-02, DOC-32 | V1.0 scope says Contact by email and short privacy notice; DOC-02 V1.2 adds the full policy; SCP-014 updated. |
| DOC-01, DOC-03, DOC-04 | Visitor goals and JRN-07 describe the address, Copy and `mailto:`. |
| DOC-05, DOC-06 | Contact stories and requirements rewritten; FR-069 becomes the V1.0 notice and the later full policy. |
| DOC-07 | NFR-013 describes Contact reliability without a runtime path. |
| DOC-08 | Email provider N/A for visitors; SPF/DKIM/DMARC rows split between the receive-only root and the V1.2 Auth subdomain; legal timing and ENG-004/ENG-009 updated. |
| DOC-10 | Contact copy strings in EN/ES. |
| DOC-12 | §10A has the V1.0 short notice (logs, local preferences, analytics, Sentry, rights channel) and moves the full policy and RNBD to before V1.2; Contact leaves the abuse and security-gate lists; SEC-008 updated. |
| DOC-13, DOC-15, DOC-17, DOC-52 | Contact email references removed or replaced; Resend removed from the interface list. |
| DOC-16 | Rewritten for the address, Copy and `mailto:`, with no-JS and copy-failed behavior. |
| DOC-20, DOC-27, DOC-30, DOC-31, DOC-34, DOC-36, DOC-37, DOC-39, DOC-40 | `ContactForm`/`ContactSuccess` replaced by `ContactCard` + `CopyButton`; the address is the canonical `contact-email` public link in DOC-36; the privacy route row is updated. |
| DOC-41, DOC-42 | Contact is a prerendered route with a small Copy island; no Resend in the system map or secrets. |
| DOC-45 | §57 sends admin recovery email from the dedicated subdomain in DOC-48 §16. |
| DOC-43, DOC-44, DOC-46 | Contact service, operation ledger, Resend adapter, jobs and gates retired; examples moved to Guestbook. |
| DOC-47 | Contact threat model is now harvesting and spoofing; Contact leaves rate-limit, verification and namespace lists; Gate S2 rewritten. |
| DOC-48 | Email DNS is receive-only on the root (MX, SPF `-all`, DMARC `p=reject`) plus the V1.2 Auth sending subdomain; `RESEND_API_KEY` removed. |
| DOC-49, DOC-50, DOC-51 | Contact SLO, alerts and delivery tests removed; Contact tests cover the address, `mailto:`, no-JS and Copy states; DOC-50 §86 adds V1.2 exit criteria for the full policy, lawyer review, RNBD check and Auth SMTP. |

## What did not change

- Community writes keep their abuse controls, Turnstile, rate limits, moderation, Terms before V1.2 and the minors declaration.
- ADR-008 §1, §4, §5, §6 and §8 stay in force.
