---
id: ADR-009
title: "Contact Without a Form"
record_type: adr
decision_status: APPROVED
date: 2026-11-25
owners:
  - Alejandro Osorno
scope: "How visitors reach the owner in V1.x, and the privacy, legal-review and RNBD timing that follows from it"
affects:
  - DOC-06
  - DOC-08
  - DOC-10
  - DOC-12
  - DOC-16
  - DOC-27
  - DOC-31
  - DOC-36
  - DOC-41
  - DOC-43
  - DOC-44
  - DOC-46
  - DOC-47
  - DOC-48
  - DOC-49
  - DOC-50
supersedes:
  - "ADR-008 §2 timing: the full Personal Data Processing Policy moves from V1.0 to before V1.2; V1.0 publishes a short privacy notice"
  - "ADR-008 §3 for Contact: Contact collects no data, so it has no authorization checkbox"
  - "ADR-008 §7 timing: the RNBD check moves to before V1.2"
  - "ADR-008 §9 timing: the lawyer reviews the policy before V1.2 instead of before V1.0"
  - "DOC-16 Contact form, FR-015, FR-016, FR-070, MSG-002, MSG-003 and MSG-007"
---

# ADR-009 — Contact Without a Form

## Context

In the approved baseline, Contact in V1.0 is a form with a name, an email, a message and an authorization checkbox. Messages are delivered through Resend (DOC-16, DOC-43, DOC-46). It is the only point in V1.0 where the site collects personal data. Because of it, ADR-008 requires the full Personal Data Processing Policy, a lawyer review and the RNBD check before V1.0 production. It also brings server validation, rate limiting, an anti-bot challenge, a sending domain with SPF/DKIM/DMARC, retries, delivery alerts and their tests.

The owner asked whether the lawyer would still be needed if Contact collected nothing (PROPOSAL-CONTACT-001). On 2026-11-19 he chose to remove the form, and on 2026-11-25 he chose the details.

## Decision

1. **Contact surface.** The Contact space shows the published address as visible text, a Copy button and a `mailto:` link. There is no form, no server endpoint and no stored message.
2. **Address.** The published address belongs to the `alejosorno.dev` domain (for example `hello@alejosorno.dev`). The final local part is content, not a baseline value. It forwards to the owner's mailbox, so it can be rotated or redirected without changing the site. It is canonical content with a single source (DOC-36).
3. **No sending in V1.x.** The domain only receives mail. There is no Resend or other transactional email provider in V1.x. A sending provider comes back only through a new ADR.
4. **Short privacy notice in V1.0.** `/[locale]/privacy` publishes a short notice in ES and EN. It states:
   - that the site collects no personal data through forms in V1.0;
   - that an email a visitor chooses to send is ordinary correspondence, answered and kept only as long as needed;
   - that the hosting provider keeps technical access logs;
   - that preferences such as theme, sound and Widget Field layout stay in the visitor's browser;
   - that product analytics is disabled (DOC-17);
   - that the published address is the channel for data-subject requests.
5. **Timing moved to before V1.2.** V1.2 is the first release that collects personal data (community nicknames and UGC). These move to before V1.2:
   - the full Personal Data Processing Policy;
   - the lawyer review;
   - the RNBD applicability check.
6. **What stays from ADR-008.** These remain in force unchanged:
   - §1 framework (Ley 1581 de 2012, SIC);
   - §4 the data-subject rights channel;
   - §5 Terms before V1.2;
   - §6 the minors declaration for Guestbook and Sketch Wall;
   - §8 GDPR as good practice.
   ADR-008 §3 (prior authorization at every collection point) still applies to every future collection point.

## Options considered

### Option A — Visible address, Copy and `mailto:` (chosen)

It works without JavaScript, works when the visitor has no configured mail client (they copy the address), and collects nothing.

### Option B — `mailto:` link only

It is simpler, but it fails silently on devices without a configured mail client.

### Option C — Obfuscated address assembled with JavaScript

It deters some harvesting, but without JavaScript the visitor sees no address, and it makes the address harder to reach with assistive technology.

### Option D — Keep the form

It is the most conventional, but it keeps the full policy, the lawyer and the RNBD check as V1.0 production dependencies, plus the whole delivery and abuse stack.

## Criteria and evidence

- Data minimization (DOC-12) and the owner's cost concern (PROPOSAL-CONTACT-001 §1).
- DOC-17 keeps analytics disabled in V1.0, so the form was the only collection point.
- Contact must stay calm, reliable and conventional (DOC-16 §1). A visible address is the most conventional option of all.

## Consequences

### Positive

- V1.0 has no personal-data collection point and no transactional email.
- The lawyer review and the full policy are no longer V1.0 production dependencies.
- Contact has no server code path, so there is no spam relay, header injection or provider outage to handle.

### Costs / risks

- The published address can be harvested by spam bots. This is mitigated by forwarding: the address can be rotated.
- Visitors without a mail client must copy the address.
- There is no in-site success state. The visitor's own mail client confirms the send.

## Reversibility and migration

A form can be reintroduced through a new ADR. That ADR must bring back the authorization checkbox (ADR-008 §3), the full policy and the lawyer review before the form ships.

## Security / privacy / accessibility / performance impact

- **Security:** removes the Contact write path and its threats (DOC-47). The domain publishes anti-spoofing records, because it does not send (DOC-48).
- **Privacy:** no stored contact data and no authorization ledger (DOC-44).
- **Accessibility:** the address is plain text and the Copy button is a real button with a polite announcement (DOC-16).
- **Performance:** Contact needs no island beyond the Copy enhancement.

## Follow-up

- DOC-16 is rewritten. FR-015, FR-016, FR-070, MSG-002, MSG-003 and MSG-007 are retired.
- The dependent product, interface, visual and technical documents are revised (`AMENDMENT-CONTACT-001`).
- Owner tasks:
  - set up domain forwarding and the inbound and anti-spoofing DNS records before V1.0 production;
  - book the lawyer review and the RNBD check before V1.2.
