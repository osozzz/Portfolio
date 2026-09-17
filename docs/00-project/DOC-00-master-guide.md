---
id: DOC-00
title: "Master Guide, Governance & Documentation Map"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 00-project
depends_on:
  - none
decision_families:
  - PRJ
  - GOV
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-00 — Master Guide, Governance & Documentation Map

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

DOC-00 is the navigation and governance entry point for the interactive personal portfolio. It defines what the documentation set contains, which document is authoritative for each concern, how decisions are approved/superseded, and how contributors and implementation tooling must consume the specification before implementation.

The product is a **responsive interactive personal portfolio presented as a premium digital system/console interface**. Its professional purpose is primary: communicate Alejandro's work, experience, technical thinking and contact paths. Its system-like interaction, iiSU-inspired spatial grammar, Liquid Glass language, Arcade, achievements, community features and hidden delights exist to demonstrate product/design/engineering ability without making the portfolio harder to use.

## 2. Documentation principles

1. **Markdown is canonical.** Generated PDFs, screenshots, diagrams or exported documents are artifacts, not editable sources of truth.
2. **One normative owner per topic.** Documents may reference the same concern, but only one document should define the rule.
3. **Approved architecture beats existing code.** Code that contradicts an approved decision is a defect unless an approved ADR supersedes the decision.
4. **No silent architecture changes.** Material deviations require an explicit proposal, impact analysis, decision update and usually an ADR.
5. **Later decisions supersede explicitly.** Never leave two contradictory rules both marked current.
6. **Requirements are traceable.** User stories, requirements, routes, components, tests and releases should link back to stable IDs.
7. **Progressive detail.** Product documents define intent and constraints; interface documents define interaction; later architecture/security/infrastructure documents define exact implementation.
8. **Public-safe by design.** Project documentation must not accidentally publish credentials, private client information, personal identifiers or confidential work artifacts.

## 3. Authority order

Authority is **domain-aware**, not simply numeric. When sources disagree, use this order:

1. Approved ADR that explicitly supersedes a prior decision.
2. The approved **canonical domain owner** for the concern. Examples: DOC-02 owns release/scope; DOC-32 owns interface behavior; DOC-36 owns canonical professional/content schemas; DOC-42 owns frontend architecture; DOC-43 backend/application services; DOC-44 data/RLS/storage; DOC-45 Identity & Access; DOC-46 integrations/jobs/cache; DOC-47 security; DOC-48 infrastructure; DOC-49 reliability/observability; DOC-50 quality; DOC-51 repository/CI/CD/DX.
3. Approved dependent specifications for that concern (for example DOC-34/35/38/39/40 for visual implementation under the interface model).
4. Approved product/engineering requirements that constrain the concern.
5. Implementation notes and task descriptions.
6. Existing code.

A lower item cannot silently override a higher item. DOC-32 is not a blanket override for color, content, CV or future technical/security domains.

## 4. Document lifecycle

| Status | Meaning |
|---|---|
| DRAFT | Incomplete and expected to change. |
| REVIEW | Complete enough for review; not yet binding as a reconstructed baseline. |
| APPROVED | Accepted as current project direction. |
| DEFERRED | Valid concern intentionally postponed. |
| SUPERSEDED | Replaced by a later decision/document; retained for traceability. |
| ARCHIVED | Historical only. |

DOC-00–DOC-19 were historically reconstructed from prior planning and initially reviewed before approval; all numbered documents DOC-00–DOC-51 are now `APPROVED`. `reconstructed: true` records provenance only and does not reduce authority.

### Separate governance vocabularies

Machine-readable metadata keeps three independent vocabularies:

- `document_status`: `DRAFT | REVIEW | APPROVED | DEFERRED | SUPERSEDED | ARCHIVED`;
- `decision_status` (ADR/decision record): `PROPOSED | APPROVED | DEFERRED | SUPERSEDED | REJECTED`;
- `review_status`: `PLANNED | IN_PROGRESS | COMPLETE`, with a separate `review_result` such as `PASS | PASS_WITH_CORRECTIONS | FAIL | SUPERSEDED`.

Do not reuse a moderation/project lifecycle/status enum for documentation governance.

## 5. Master document map

### 00-project

| Doc | Source of truth |
|---|---|
| DOC-00 | Governance, documentation map, authority and change process. |
| DOC-01 | Product vision, positioning, principles and success definition. |
| DOC-02 | Scope, release boundaries, non-goals and scope-change rules. |
| DOC-03 | Audiences, personas and stakeholder needs. |
| DOC-04 | End-to-end user journeys and experience outcomes. |

### 01-product

| Doc | Source of truth |
|---|---|
| DOC-05 | User stories, epics and acceptance framework. |
| DOC-06 | Functional requirements. |
| DOC-07 | Non-functional requirements. |
| DOC-08 | Engineering coverage register and technical constraints. |
| DOC-09 | Professional/public content requirements. |
| DOC-10 | Localization and bilingual behavior. |
| DOC-11 | Accessibility and inclusive experience requirements. |
| DOC-12 | Security, privacy and abuse-prevention requirements. |
| DOC-13 | Community, UGC and moderation product requirements. |
| DOC-14 | Arcade, achievements and playful progression requirements. |
| DOC-15 | External integrations and live-data requirements. |
| DOC-16 | Contact, email and communication requirements. |
| DOC-17 | SEO, metadata, analytics and discoverability requirements. |
| DOC-18 | Delivery roadmap, GitHub workflow and release governance. |
| DOC-19 | Implementation tooling, automation and authorship governance. |

### 02-interface-architecture

DOC-20 through DOC-32 are the approved Interface Architecture package: philosophy, screen anatomy, navigation, input, focus/selection, widgets, surfaces, components, responsive behavior, motion, audio/delight, screen inventory and master specification.

### 03-visual-design / cross-cutting content

DOC-33 through DOC-40 are the approved Visual Design Foundation. DOC-36 (Content Architecture) and DOC-37 (RenderCV Pipeline) remain in this numbered/path block for stability but are explicitly **cross-cutting specifications** consumed by Product, SEO, CV and later Technical/Data Architecture.

### 04-technical-architecture — specification complete; consistency-amended

The Technical Architecture package is specification-complete after DOC-51 approval. DOC-41 is the approved master blueprint; DOC-42 owns frontend architecture; DOC-43 owns backend/application-service architecture; DOC-44 owns Data/PostgreSQL/RLS/Storage architecture; DOC-45 owns Authentication/Authorization/Admin Session architecture; DOC-46 owns Integrations/Caching/Jobs/Provider Resilience architecture; DOC-47 owns Security Architecture & Threat Model; DOC-48 owns Infrastructure/Environments/DNS/Deployment architecture; DOC-49 owns Performance/Observability/Reliability architecture; DOC-50 owns Testing & Quality Engineering; and DOC-51 owns Repository/CI/CD/Developer Experience. `REVIEW-FINAL-DOC00-51-AUDIT-001` identified pre-V0 gaps; `AMENDMENT-PRE-V0-CONSISTENCY-001` resolves them and `REVIEW-FINAL-DOC00-51-AUDIT-002` passes with no unresolved P0–P3 findings. The V0 gate is **CLEARED_FOR_REPOSITORY_BOOTSTRAP**; DOC-51 makes repository/project operations the next execution step before normal feature code. DOC-08 continues to record mandatory engineering coverage so those concerns are not forgotten.

## 6. Product release model

DOC-02 is the normative release/scope owner. The summary below is convenience only and must remain synchronized:

- **V0 — Foundation:** repository, documentation, design-system foundations, routing, i18n, content/data foundations, security baseline, CI/CD, testing, RenderCV pipeline and local implementation-tooling configuration.
- **V1.0 — Professional Portfolio:** Boot, shell, fixed six-space Dock with Coming Soon route surfaces for later spaces, Home/Projects, Experience, Education, Certifications, Project Detail, Media, controlled Widget Field personalization, Contact, CV, Settings, EN/ES, themes, sound controls, responsive experience, SEO and 404.
- **V1.1 — Personality:** Achievements, Command Palette, Terminal, Making Of, Changelog, basic Status, custom-cursor polish, Easter eggs and returning personalization.
- **V1.2 — Community:** Social, Guestbook, Sketch Wall, Drawing Pad, reports, moderation and Admin.
- **V1.3 — Arcade:** Arcade Library, Glitch Runner, Reflex Deploy, server-validated sessions, leaderboards and Arcade achievements.
- **V1.4 — Live System:** Tech Pulse, Dev Log, GitHub integration, richer Currently Building, dynamic OG and integration/status improvements.

V1.0 must already work as a complete professional portfolio. Later releases add personality rather than rescuing missing core utility.

## 7. Core non-goals

The current architecture does not include visitor accounts, follower graphs, visitor DMs, real-time public chat, e-commerce, public API, third-party/user-authored widgets, unrestricted freeform widget desktops or arbitrary pixel placement, native mobile apps, a theme marketplace or more than two initial Arcade games. New scope requires review rather than silent accumulation.

## 8. Decision families

The package uses stable prefixes for traceability. Canonical family owners are:

- Product/Foundation: `PRJ` (DOC-00), `VIS` (DOC-01), `SCP` (DOC-02), `AUD` (DOC-03), `JRN` (DOC-04), `USR` (DOC-05), `FR` (DOC-06), `NFR` (DOC-07), `ENG` (DOC-08), `CNTREQ` (DOC-09 content requirements), `L10N` (DOC-10), `A11Y` (DOC-11), `SEC` (DOC-12), `COM` (DOC-13), `ARC` (DOC-14), `INT` (DOC-15), `MSG` (DOC-16), `SEO` (DOC-17), `DLV` (DOC-18), `TLG` (DOC-19).
- Interface Architecture: `UI` (DOC-20), `SA` (DOC-21), `NAV` (DOC-22), `INP` (DOC-23), `FCS` (DOC-24), `WDG` (DOC-25), `SUR` (DOC-26), `CMP` (DOC-27), `RSP` (DOC-28), `MOT` (DOC-29), `AFD` (DOC-30), `SCR` (DOC-31), `MST` (DOC-32).
- Visual/Content/CV: `VID` (DOC-33), `CLR` (DOC-34), `TYP` / `ICO` / `GFX` (DOC-35), **`CNT` (DOC-36 canonical content architecture)**, `CVP` (DOC-37), `GEO` (DOC-38), `MAT` (DOC-39), `STA` (DOC-40).
- Technical Architecture: `TAM` (DOC-41 master blueprint), `FEA` (DOC-42 frontend), `BEA` (DOC-43 backend/application services), `DTA` (DOC-44 data/PostgreSQL/RLS/Storage), `IAM` (DOC-45 identity/access), `ICJ` (DOC-46 integrations/caching/jobs), `SECARC` (DOC-47 security architecture/threat model), `INF` (DOC-48 infrastructure/environments/DNS/deployment), `POR` (DOC-49 performance/observability/reliability), `TQE` (DOC-50 testing/quality engineering), `RDX` (DOC-51 repository/CI/CD/developer experience). Later families are registered when their canonical documents are created.

`CNTREQ` is intentionally distinct from DOC-36's canonical `CNT-*` registry: DOC-09 states public/professional content requirements, while DOC-36 owns canonical authored schemas and content-architecture decisions.

## 9. Change workflow

A material change should follow:

```text
Issue / proposal
    ↓
Affected source-of-truth identified
    ↓
Impact on product / UX / security / data / operations assessed
    ↓
Decision or ADR approved
    ↓
Docs updated
    ↓
Implementation + tests
    ↓
Release notes / changelog when public
```

A PR changing behavior must update documentation in the same PR when the source of truth changed.

## 10. Definition of implementation-ready

A feature is not ready for code until the team can answer: purpose, actor, acceptance criteria, route/surface, primary focus, state model, responsive behavior, keyboard/touch/gamepad behavior when relevant, accessibility, loading/empty/error behavior, data ownership, privacy/security requirements, localization, observability and tests.

For implementation work, development tooling follows the task-aware reading order in DOC-19: governing ADRs first, DOC-00 authority map, canonical domain owner, relevant detailed specifications, product/security constraints, then existing code. Frontend visual changes must include the applicable DOC-34/35/38/39/40 specifications.

## 11. Reconstruction note

DOC-00–DOC-19 were reconstructed because earlier planning existed in conversation but was not materialized as a durable Markdown package. The reconstruction deliberately preserves approved later architecture and records uncertain implementation choices as deferred rather than inventing certainty. DOC-20–DOC-32 were copied from the already materialized approved package without rewriting their substance. DOC-33–DOC-40 were subsequently authored and approved; the 2026-09-15 consistency amendment normalized cross-document contracts without redesigning the product.
