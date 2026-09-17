---
id: DOC-16
title: "Contact, Email & Communication Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-06
  - DOC-12
  - DOC-15
decision_families:
  - MSG
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-16 — Contact, Email & Communication Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

Contact is a professional conversion path and should remain calm, reliable and conventional underneath the system visual language.

## 2. Public fields

Recommended V1.0 fields:

- Name;
- Email;
- Message;
- optional Subject only if later evidence shows value.

Do not require company/phone/account creation merely to send a message.

## 3. Validation

Client validation improves feedback; server validation is authoritative. Validate required fields, lengths, email syntax and request size. Preserve entered values on recoverable error.

## 4. Abuse controls

Rate limiting plus anti-bot challenge when justified. Do not leak whether an email address exists internally. Reject obviously oversized/malformed inputs before provider delivery.

## 5. Delivery flow

```text
Form
→ server validation
→ abuse controls
→ delivery provider
→ authoritative accepted/error result
→ Contact success or recoverable error
```

Optional confirmation email to sender can be evaluated later; it should not create extra deliverability/spam burden without value.

## 6. Data handling

Decide whether message content is stored in DB, delivered only by email, or both for reliability/audit. Minimize retention and document it. Contact identity remains separate from Guestbook/Sketch/leaderboard/local-personalization identity.

## 7. Deliverability

Production sending domain needs SPF/DKIM and an intentional DMARC policy. Monitor provider failures/bounces enough to know if Contact is broken. API keys remain server-side and separated by environment.

## 8. UX states

- ready;
- submitting;
- validation error;
- anti-bot issue;
- provider/network failure with text preserved;
- sent success state.

A Toast alone is not sufficient for the final meaningful completion state.

## 9. Accessibility

Visible labels, associated errors, logical tab order, mobile keyboard support, status announcement and no reliance on placeholders. Submission does not move focus unpredictably.

## 10. Decisions

- **MSG-001** Contact requires no visitor account.
- **MSG-002** Server validates before delivery.
- **MSG-003** Failure preserves the visitor's message whenever possible.
- **MSG-004** Contact identity is not reused for personalization/community identity.
- **MSG-005** SPF/DKIM/DMARC readiness is part of production email delivery.
- **MSG-006** Contact remains professionally restrained—no confetti/achievement gamification.
