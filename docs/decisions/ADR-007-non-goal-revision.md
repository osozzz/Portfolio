---
id: ADR-007
title: "DOC-02 Non-Goal Revision"
record_type: adr
decision_status: PROPOSED
date: 2026-11-09
owners:
  - Alejandro Osorno
scope: "Which DOC-02 §10 non-goals are adopted, adapted or kept out, and the release placement of each change"
affects:
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-09
  - DOC-13
  - DOC-14
  - DOC-15
  - DOC-17
  - DOC-31
  - DOC-34
  - DOC-36
  - DOC-44
  - DOC-46
  - DOC-47
  - DOC-50
supersedes:
  - "DOC-02 §10 rows: background music, full blog CMS, theme marketplace, real-time public chat / follow graph (partially), more than two Arcade games"
---

# ADR-007 — DOC-02 Non-Goal Revision

## Context

When the owner reopened the baseline, he asked for every DOC-02 §10 non-goal to be reviewed, to see which could be adapted to the new direction (PROPOSAL-REOPEN-001 §3.5). He also decided that "everything must be right before it is published" (§9 Q2), which places the dazzle in V1.0.

## Decision

| Non-goal | Decision | Release |
|---|---|---|
| Background music as a core feature | **Adopt** (ADR-005) | V1.0 |
| Full blog CMS | **Adapt:** a Markdown blog in Astro Content Collections, with no CMS | V1.1 |
| Theme marketplace | **Adapt:** curated themes (palette, backdrop, optional track) chosen in Settings. No marketplace, uploads or user-authored themes | V1.1 |
| Real-time public chat / follow graph | **Adapt partially:** anonymous presence ("3 people exploring now", subtle visitor traces). No chat, identity or messages | V1.4 |
| More than two Arcade games | **Adapt:** allowed after V1.3. V1.3 stays at two games | after V1.3 |
| Visitor registration/login, profiles, DMs | **Keep out** | — |
| E-commerce/payments | **Keep out** | — |
| Arbitrary visitor uploads | **Keep out** | — |
| Native iOS/Android app | **Keep out.** PWA installability may still be evaluated | — |
| Public API | **Keep out** | — |
| Third-party/user-authored widgets | **Keep out** | — |
| Freeform widget desktop | **Keep out** (ADR-001 stands) | — |
| Fake telemetry / fake hacker terminal | **Keep out** | — |

**V1.0 release scope** additionally includes:

- the cinematic Boot;
- the 3D stage with its fallbacks (ADR-006);
- the music prompt and control;
- the audio license register;
- the Personal Data Processing Policy (ADR-008).

V1.0 is published only when the whole first impression passes its exit criteria (DOC-50 §86), not on a date. Until then, deployments remain previews and are not announced as the public portfolio.

## Options considered

### Option A — The table above (chosen)

Each adaptation reinforces "technical" and "product sense" without bringing in accounts, payments or open UGC.

### Option B — Keep every non-goal

This contradicts the owner's request for background music and his wish to adapt the others.

## Criteria and evidence

- Owner's request to review the non-goals, and his acceptance of the proposed table ("me parece perfecto").
- Every keep-out row would bring in identity, payments, uploads or third-party code. Each of these multiplies the legal, moderation and security load (DOC-12, DOC-13, DOC-47).

## Consequences

### Positive

- The blog and curated themes give the portfolio depth without new trust boundaries.
- Presence adds "I'm not alone here" without identities.

### Costs / risks

- Presence needs realtime infrastructure and abuse limits (DOC-44, DOC-46, DOC-47) and is held until V1.4.
- Placing the dazzle in V1.0 makes the first release larger. This is accepted in exchange for a single quality-gated launch.

## Reversibility and migration

Each adaptation can be descoped independently by moving it back to §10. DOC-02 §12's de-scope order applies.

## Security / privacy / accessibility / performance impact

- **Privacy:** presence counts are anonymous and aggregated, so no visitor identifier is shown.
- **Security:** presence endpoints are rate-limited like the other public endpoints (DOC-47).
- **Accessibility:** blog content follows DOC-11. Themes keep contrast within DOC-34's limits.

## Follow-up

- DOC-02 §4/§5/§7/§8/§10/§13 are revised. Superseded §10 rows stay listed with a pointer to this ADR.
- The DOC-02 release copies in DOC-05, DOC-06, DOC-31, DOC-41 and DOC-50 are synchronized.
