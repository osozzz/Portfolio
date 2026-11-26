---
id: DOC-16
title: "Contact, Email & Communication Requirements"
document_status: REVIEW
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
last_updated: 2026-11-25
approved_at: 2026-11-10
---

# DOC-16 — Contact, Email & Communication Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.
>
> **Revised by ADR-009 (2026-11-25).** Contact has no form. It shows a visible address, a Copy button and a `mailto:` link.

## 1. Purpose

Contact is a professional conversion path and should remain calm, reliable and conventional underneath the system visual language. The most conventional path is an email address the visitor can read, copy or open in their mail client (ADR-009).

## 2. Public surface

The Contact space shows, in this order:

- a short line in the visitor's locale explaining that email is the way to reach the owner;
- the published address as visible, selectable text;
- a **Copy** button;
- an **Email me** link (`mailto:`) with a localized `subject` (for example EN "Hello from alejosorno.dev", ES "Hola desde alejosorno.dev"). The final copy is owned by DOC-10.

There are no fields, no account and no submit step. The address is canonical content with a single source (DOC-36). It belongs to the `alejosorno.dev` domain and forwards to the owner's mailbox (ADR-009). The real local part is chosen when forwarding is configured, and examples use `hello@alejosorno.dev`.

## 3. Behavior

- **Without JavaScript:** the address text and the `mailto:` link work. Copy is a progressive enhancement and is not rendered until it can work.
- **Copy:** uses the Clipboard API. On success it shows the copied state. If the API is unavailable or permission is denied, it shows the copy failed state and selects the address text so the visitor can copy it by hand.
- **`mailto:`:** opens the visitor's mail client. The site cannot know whether a message was sent, so it shows no sent state.

## 4. Abuse

Contact has no write path, so there is nothing to rate-limit or challenge (ADR-009). Address harvesting by bots is an accepted risk, mitigated because the forwarded address can be rotated without a site change. The address is never put in metadata, structured data or the RenderCV output beyond what DOC-36 and DOC-37 allow.

## 5. Data handling

The site stores nothing about Contact. Mail arrives in the owner's mailbox as ordinary correspondence and is kept only as long as needed to reply (DOC-12, ADR-009). Contact identity remains separate from Guestbook/Sketch/leaderboard/local-personalization identity.

## 6. Domain mail records

The domain receives mail and does not send it in V1.x (ADR-009). Production needs the inbound records for forwarding (MX) and anti-spoofing records for a domain that does not send: SPF `v=spf1 -all` (unless the forwarder requires its own include) and DMARC `p=reject` (DOC-48).

## 7. UX states

- ready;
- copied (announced politely; the button label briefly reads "Copied");
- copy failed (inline message; the address text is selected).

A Toast alone is not sufficient for the copy failed state; the message stays next to the address.

## 8. Accessibility

- The address is real text, not an image.
- Copy is a native `<button>` with a visible label.
- The copied and copy failed states are announced through an `aria-live="polite"` region.
- The `mailto:` link text says what it opens (for example "Email me"), not only the address.
- Focus does not move when copying.
- Tab order: address, Copy, Email me.

## 9. Decisions

- **MSG-001** Contact requires no visitor account.
- **MSG-002** Retired (ADR-009): there is no form to validate on the server.
- **MSG-003** Retired (ADR-009): there is no message to preserve on failure; the visitor writes in their own mail client.
- **MSG-004** Contact identity is not reused for personalization/community identity.
- **MSG-005** The domain only receives mail; inbound (MX) and anti-spoofing records (SPF `-all`, DMARC `p=reject`) are part of production (ADR-009, DOC-48).
- **MSG-006** Contact remains professionally restrained—no confetti/achievement gamification.
- **MSG-007** Retired (ADR-009): Contact collects no data, so it has no authorization checkbox.
- **MSG-008** Contact works without JavaScript: the address and the `mailto:` link need no script; Copy is an enhancement.
- **MSG-009** The published address is canonical content (DOC-36) and can be rotated through forwarding without a site change.
