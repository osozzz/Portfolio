---
id: DOC-13
title: "Community, UGC & Moderation Product Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-02
  - DOC-12
  - DOC-31
decision_families:
  - COM
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-13 — Community, UGC & Moderation Product Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Scope

Community adds lightweight human presence without turning the portfolio into a social network. Initial public capabilities: Social Overview, Guestbook, Sketch Wall, optional Activity and restrained reactions/reporting.

## 2. Identity model

No visitor accounts. A submission may ask for a public nickname; nickname is presentation metadata, not authenticated identity. Contact email is not required for Guestbook/sketch/score merely to build a hidden user profile.

## 3. Guestbook

Fields: nickname and message, with length limits and optional anti-bot challenge. Server creates moderation state. Public read APIs return only approved entries and allowed public fields.

Content moderation status is one axis: `pending`, `approved`, `rejected`, `hidden`.

Reports are separate records associated with content and have their own lifecycle (for example `open`, `resolved`, `dismissed`). An `approved` public item can receive an open report without immediately changing its content moderation status. Exact transitions and thresholds are defined in Data/Security Architecture.

## 4. Sketch Wall

Drawings originate from Drawing Pad only in V1.x. Public tile may show drawing preview, nickname, date, reaction count and report action. Pending/rejected/private moderation metadata is not public.

## 5. Publication semantics

`Submit`/`Publish for review` means the content is sent to moderation. UI must say `Submitted for review` until public approval is true. An achievement such as “On the Wall” must unlock only when actual approval/publication is confirmed.

## 6. Reporting

Visitors can report applicable content with a simple reason. Report submission is rate-limited and itself abuse-resistant. A report does not automatically remove content unless a documented safety rule/threshold says so.

## 7. Reactions

If enabled, use a small curated set. Reactions must not require accounts, should resist trivial flooding and should not become a competitive popularity system. They are optional V1.2 depth, not a blocker for Guestbook/Sketch Wall.
## 7A. Canonical moderation/reaction codes

V1.2 uses stable machine codes with localized UI labels.

**Report reasons:**

```text
spam
harassment_or_abuse
personal_data
inappropriate_content
deceptive_or_impersonation
other
```

**Optional reaction codes (only if Reactions ship):**

```text
like
love
inspiring
```

**Private ban reason classes:**

```text
spam
automation
abuse
security
other
```

The baseline moderation state machine does **not** include a public/Admin restore operation from `hidden` back to `approved`. Hidden content stays hidden unless a future audited restore workflow is approved explicitly.


## 8. Social Activity

Can aggregate approved Guestbook/sketch/reaction events. It is optional within V1.2 and should be deferred before core moderation/UGC safety if scope is pressured.

## 9. Moderation admin

Core admin needs:

- pending queue;
- content preview;
- type/submission time/risk signals and separate open-report counts/details;
- approve/reject/hide;
- report resolution;
- basic ban/rate-limit controls;
- audit history.

Admin prioritizes efficient functional UX rather than cinematic public interactions.

## 10. Bans/abuse identifiers

Because no visitor account exists, bans use the feature-scoped pseudonymous abuse model defined by DOC-44/DOC-47, with bounded expiration/retention and no universal visitor subject. Never imply strong person identity from a browser fingerprint.

## 11. UGC safety

No HTML, scripts or arbitrary embedded URLs in public message content. Drawing export formats and dimensions are constrained. Moderation can remove public visibility without destroying audit evidence immediately if data policy requires retention.
## 11A. Accountless deletion capability

Because visitors have no account, Guestbook/Sketch publication and accepted Arcade scores issue a high-entropy one-time **deletion capability** to the submitting browser. The server stores only its digest; the browser stores the capability in local privacy receipts. Possession of that capability authorizes removal/anonymization of that specific resource only and does not create cross-feature identity.

If the capability is lost, a visitor may submit a best-effort manual privacy request referencing the exact public item, but the portfolio must not pretend it can identify or correlate all content created by the same person.


## 12. Community success criteria

Community succeeds when it makes the portfolio feel visited/living without creating substantial abuse, privacy or operational burden. If moderation becomes disproportionate, reduce features rather than weakening safety.

## 13. Decisions

- **COM-001** Community is lightweight participation, not a social network.
- **COM-002** No visitor accounts/profiles/follows/DMs in V1.x.
- **COM-003** Public Guestbook/Sketch content is moderation-aware and safe-projected.
- **COM-004** Submission acknowledgement distinguishes pending from published.
- **COM-005** Social Activity is optional V1.2 scope behind Guestbook/Sketch/moderation.
- **COM-006** Admin moderation is operational tooling, not a public-style cinematic experience.
