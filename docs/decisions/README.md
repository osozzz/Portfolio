# Architecture Decision Records

Use ADRs for material decisions that supersede approved behavior/architecture, change public contracts, alter source-of-truth boundaries, or introduce consequential provider/security/data choices.

ADRs use YAML frontmatter with `record_type: adr` and a separate `decision_status`. Use `ADR-TEMPLATE.md`.

## Approved ADRs

- `ADR-001-controlled-widget-field-personalization.md` — controlled central Personal Widget Field; local logical personalization; no unrestricted freeform desktop.
- `ADR-002-release-gating-six-space-dock.md` — V1.0 naming plus route-backed Coming Soon behavior for later-release fixed-Dock major spaces.
- `ADR-003-currently-building-source-of-truth.md` — repository-authored `Currently Building` authority in the V1.x baseline; runtime/Admin editing requires a future migration ADR.

An approved ADR outranks a conflicting earlier decision only where it explicitly applies/supersedes.
