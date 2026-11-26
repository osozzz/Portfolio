---
id: PROPOSAL-CONTACT-001
title: "Contact Without a Form"
document_status: APPROVED
canonical_format: markdown
phase: "Baseline Revision"
folder: reviews
owner: Alejandro Osorno
created: 2026-11-25
approved: 2026-11-25
---

# PROPOSAL-CONTACT-001 — Contact Without a Form

> Status: APPROVED by the owner. Option B was chosen on 2026-11-19 and its details on 2026-11-25. Approving this proposal authorizes the revision it describes. Document changes still go through ADR-009, `AMENDMENT-CONTACT-001` and `REVIEW-CROSS-DOCUMENT-CONSISTENCY-004`.

## 1. Why

The V1.0 Contact form is the only place where the site collects personal data in V1.0: a name, an email and a message, plus an authorization checkbox (DOC-16, ADR-008). That single form drives most of the V1.0 compliance and engineering cost:

- the full Personal Data Processing Policy, a lawyer review and the RNBD check before V1.0 production (ADR-008 §2, §7, §9);
- an authorization record and its proof (FR-070, MSG-007);
- server validation, rate limiting, an anti-bot challenge, a delivery provider (Resend), sending-domain SPF/DKIM/DMARC, retries, failure alerts and tests for all of the above.

The owner asked whether the lawyer would still be needed if Contact collected nothing, and chose to remove the form.

## 2. Owner decisions

| Date | Decision |
|---|---|
| 2026-11-19 | Option B. Contact uses a visible email address and a `mailto:` link instead of a form. V1.0 ships a short privacy notice. The lawyer review is optional until V1.2. |
| 2026-11-25 | Contact shows the address, a Copy button and a `mailto:` link. |
| 2026-11-25 | The published address belongs to the `alejosorno.dev` domain and forwards to the owner's mailbox. |
| 2026-11-25 | The change is formalized as ADR-009 plus an amendment and a consistency review, like the reopening. |

## 3. Scope

- ADR-009 records the decision. It supersedes the timing items of ADR-008 and the Contact part of ADR-008 §3.
- Every baseline document that specifies the form, its delivery, its abuse controls, its data or its tests is revised. That covers DOC-16 and its dependents in product, interface, visual and technical architecture.
- Retired requirement and decision IDs are kept and marked `Retired (ADR-009)`, so their history stays traceable.

## 4. Non-goals

- Community writes (Guestbook, Sketch Wall, V1.2) keep their abuse controls, moderation, Terms and minors declaration unchanged.
- The privacy notice copy and the real address are content, written with V1.0 content.
- Configuring forwarding at the DNS provider is an owner operation. The baseline only states the requirement.

## 5. Exit criteria

- The baseline has no line that ties Contact to a form, a delivery provider or form abuse controls, except lines that cite ADR-009.
- `REVIEW-CROSS-DOCUMENT-CONSISTENCY-004` passes.
