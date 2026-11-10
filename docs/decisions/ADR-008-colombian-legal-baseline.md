---
id: ADR-008
title: "Colombian Legal Baseline and Minors Handling"
record_type: adr
decision_status: APPROVED
date: 2026-11-09
owners:
  - Alejandro Osorno
scope: "Personal-data law, published legal pages and minors handling for the public portfolio"
affects:
  - DOC-08
  - DOC-10
  - DOC-12
  - DOC-13
  - DOC-16
  - DOC-31
  - DOC-44
  - DOC-47
supersedes:
  - "DOC-08 timing 'Privacy policy: required before public UGC/data collection' (now required from V1.0)"
  - "DOC-08 'Terms & conditions: evaluate before Community launch' (now required before V1.2)"
---

# ADR-008 — Colombian Legal Baseline and Minors Handling

## Context

The owner operates from **Medellín, Colombia**. The baseline lacked a named legal framework, set the timing of the privacy policy around UGC, and left terms and minimum age open (PROPOSAL-REOPEN-001 §3.7, §3.8). Contact, which ships in V1.0, already collects a name and an email.

## Decision

1. **Framework.**
   - The applicable law is **Ley 1581 de 2012** (Habeas Data), with its regulation (Decreto 1377 de 2013, compiled in Decreto 1074 de 2015).
   - The supervisory authority is the **Superintendencia de Industria y Comercio (SIC)**.
2. **Personal Data Processing Policy.** The Política de Tratamiento de Datos Personales is published **from V1.0**, in ES and EN.
3. **Authorization.** Prior, express and informed authorization is collected at every point of collection, starting with Contact.
4. **Data subject rights.** A channel is published for consulting, updating, rectifying and deleting data, with the response times the law sets.
5. **Terms of Use** are published **before V1.2** (UGC and nicknames), in ES and EN.
6. **Minors.**
   - The site does not ask for age (data minimization).
   - Before posting to Guestbook or Sketch Wall, the visitor ticks a short declaration: "I am 18 or older, or I have my legal representative's authorization."
   - Pre-moderation stays as DOC-13 specifies.
7. **RNBD.** The Registro Nacional de Bases de Datos is believed not to apply to a natural person below the asset threshold. This must be **verified** before V1.0 production.
8. **GDPR.** It is not directly triggered while analytics are disabled and no goods or services are offered. The design follows it as good practice.
9. **Review.** A lawyer reviews the policy before V1.0 production and the terms before V1.2. This ADR and the documents derived from it are **not legal advice**.

## Options considered

### Option A — Ley 1581 baseline + GDPR as good practice (chosen)

It matches where the owner is and keeps a path open to European visitors.

### Option B — GDPR only

It ignores the jurisdiction where the owner is accountable.

### Option C — No policy until UGC (the previous timing)

Contact already collects personal data in V1.0, so this timing falls short of Ley 1581.

## Criteria and evidence

- The owner's location (Medellín, Colombia).
- Contact collects name and email from V1.0 (DOC-16).
- DOC-12 data minimization and DOC-13 pre-moderation already exist and are reused.

## Consequences

### Positive

- The legal pages ship with the first public release.
- The minors approach avoids collecting age while recording a declaration.

### Costs / risks

- Lawyer review is a V1.0 production dependency.
- The ES and EN legal copy needs translation and review.
- If the RNBD turns out to apply, a registration step is added before V1.0 production.

## Reversibility and migration

The documents can be revised at any time. Authorizations already collected stay valid for their stated purpose.

## Security / privacy / accessibility / performance impact

- **Privacy:** an explicit authorization record per collection point (DOC-44), and the rights channel handled under DOC-12's retention rules.
- **Accessibility:** legal pages are plain, readable content (DOC-11).
- **Security:** the declaration checkbox is validated server-side on submission (DOC-47).

## Follow-up

- DOC-12 gets the legal baseline, DOC-13 the declaration, and DOC-16 the Contact authorization notice.
- DOC-31 gets the privacy and terms routes, DOC-08 §13/§17 is updated, and DOC-10 gets the ES and EN copy.
- Verify RNBD applicability and book the lawyer review (owner).
