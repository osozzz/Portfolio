# Architecture Decision Records

Use ADRs for material decisions that supersede approved behavior/architecture, change public contracts, alter source-of-truth boundaries, or introduce consequential provider/security/data choices.

ADRs use YAML frontmatter with `record_type: adr` and a separate `decision_status`. Use `ADR-TEMPLATE.md`.

## Approved ADRs

- `ADR-001-controlled-widget-field-personalization.md` — controlled central Personal Widget Field; local logical personalization; no unrestricted freeform desktop.
- `ADR-002-release-gating-six-space-dock.md` — V1.0 naming plus route-backed Coming Soon behavior for later-release fixed-Dock major spaces.
- `ADR-003-currently-building-source-of-truth.md` — repository-authored `Currently Building` authority in the V1.x baseline; runtime/Admin editing requires a future migration ADR.

## Proposed ADRs (PROPOSAL-REOPEN-001)

- `ADR-004-astro-application-framework.md` — Astro replaces Next.js; static-first hybrid output, React islands + nanostores, persistent View Transitions shell, route-backed Project Detail over Home.
- `ADR-005-background-music-and-audio-defaults.md` — background music with a non-blocking Yes/No prompt, an always-available sound control and an audio license register; supersedes DOC-30 AFD-003.
- `ADR-006-three-js-signature-3d-layer.md` — three.js only in signature moments, one persistent WebGL stage, fallbacks and a DOC-49 asset budget.
- `ADR-007-non-goal-revision.md` — DOC-02 §10 revision (music, blog, curated themes, anonymous presence, Arcade expansion) and the V1.0 release scope.
- `ADR-008-colombian-legal-baseline.md` — Ley 1581 baseline, privacy policy from V1.0, terms before V1.2, minors declaration.

An approved ADR outranks a conflicting earlier decision only where it explicitly applies/supersedes.
