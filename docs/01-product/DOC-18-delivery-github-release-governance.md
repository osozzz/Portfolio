---
id: DOC-18
title: "Delivery Roadmap, GitHub Workflow & Release Governance"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-00
  - DOC-02
  - DOC-07
  - DOC-08
decision_families:
  - DLV
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-18 — Delivery Roadmap, GitHub Workflow & Release Governance

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Delivery philosophy

Documentation/design decisions precede large implementation, but delivery remains incremental. Avoid a months-long hidden build that attempts V1.4 at once.

## 2. Milestones

Use project milestones aligned with V0, V1.0, V1.1, V1.2, V1.3 and V1.4. Within each milestone, create vertical feature slices with acceptance/test criteria rather than horizontal “all frontend/all backend” phases.

## 3. Git strategy

Recommended current direction: trunk-based/mainline development with short-lived feature branches and pull requests rather than long-running classic GitFlow.

Suggested branch patterns:

- `feat/...`
- `fix/...`
- `docs/...`
- `chore/...`
- `spike/...`

`main` stays releasable/protected. Exact protection rules depend on repo hosting/account capabilities.

## 4. Issues

Issue templates should capture: outcome, scope, affected docs/decision IDs, acceptance criteria, design/reference links, security/privacy considerations, accessibility, test plan, dependencies and release milestone.

Implementation Issues default to **Alejandro** as the accountable human assignee unless he explicitly assigns another human collaborator. Tooling/automation may update checks or maintenance state but is not the project owner/author.

## 5. Labels

Keep labels useful and limited. Candidate dimensions:

- type: feature/fix/docs/refactor/spike;
- area: home/projects/social/arcade/channel/contact/cv/admin/design-system;
- concern: security/a11y/performance/data/infra;
- status/priority only where project tooling needs it.

Avoid a hundred labels nobody maintains.

## 5A. GitHub Project and Wiki

Use a GitHub Project as the execution view for Issues across release/status/priority/area/risk. It never becomes a second requirements source.

Use a GitHub Wiki as a **required, non-canonical help/navigation layer**. It should contain concise summaries, onboarding, useful links, troubleshooting, glossary/FAQ and links back to exact `/docs` sources. Canonical requirements/architecture/decisions remain in repository Markdown and ADRs.

The Wiki must not introduce new product or architecture decisions independently.

## 6. Pull requests

PR template should ask:

- what user outcome changes;
- which requirement/decision IDs apply;
- screenshots/video for visual changes;
- Compact + Expanded evidence for major UI;
- keyboard/accessibility impact;
- security/data impact;
- tests run;
- docs/ADR updates;
- migration/rollback notes where applicable.

## 7. CI gates

Baseline pipeline: install/lock validation, lint, typecheck, unit/component tests, build, RenderCV validation/build, security/dependency checks and applicable E2E smoke. Add visual/a11y/performance regression stages as components stabilize.

## 8. Database changes

Every schema change uses a versioned migration. PR explains forward/backward compatibility, seed/test impact and rollback/repair strategy. Preview environments should not accidentally mutate production DB.

## 9. Release versioning

The public Changelog can use semantic-ish product versioning (`v1.1.0`, etc.) even if every deployment does not create a public release. Public release notes are curated for visitor relevance, not raw commit logs.

## 10. Rollback

Every release should have a practical rollback path for app code. DB migrations that cannot be automatically reversed require documented forward-fix/restoration strategy. Contact/community launches require extra smoke validation.

## 11. Dependency maintenance

Automated dependency update PRs may be used, but never blindly auto-merge major framework/security-sensitive changes. Review release notes, tests, bundle/performance and API deprecations.

## 12. Environment promotion

Typical flow:

```text
local branch
→ PR / preview
→ CI + review
→ main
→ production deployment
→ smoke/monitoring
```

A dedicated staging environment can be added when preview deployments are insufficient for DB/provider integration testing.

## 13. Roadmap gates

Do not start V1.2 community persistence before security/data/moderation foundations exist. Do not launch V1.3 leaderboard before score/session validation exists. Do not launch V1.4 live feeds before cache/degraded-state behavior exists.

## 14. Definition of Done

A public feature is done when code, docs, content, responsive states, localization, accessibility, tests, monitoring/error handling, security review and release notes (when public) are complete.

## 14A. Authorship and project attribution

Alejandro is the project author/owner unless he explicitly credits another human collaborator. Development tools, generators, IDEs and automation services are not authors/co-authors and must not add permanent creative-credit/provenance statements to README, Wiki, public site, changelog, release notes, commit trailers, PR metadata, badges or controllable artifact metadata.

Tool-specific local operator configuration remains outside committed project history.

## 15. Decisions

- **DLV-001** Use short-lived branches/mainline rather than long-lived classic GitFlow by default.
- **DLV-002** Milestones align to V0/V1.0/V1.1/V1.2/V1.3/V1.4.
- **DLV-003** Architecture-changing PRs update docs/ADR in the same change.
- **DLV-004** Schema changes are migration-driven from the first persistent feature.
- **DLV-005** Public Changelog is curated, not a commit dump.
- **DLV-006** Community/Arcade/live-data releases have prerequisite security/integrity gates.
- **DLV-007** Implementation Issues default to Alejandro as accountable human assignee unless another human collaborator is explicitly assigned.
- **DLV-008** GitHub Project is the execution view; GitHub Wiki is a required non-canonical summary/help/navigation layer; `/docs` + ADRs remain authoritative.
- **DLV-009** Development tools and automation receive no creative authorship/co-authorship attribution in project-visible metadata or public surfaces.
