# Interactive Portfolio — Documentation Map

This directory is the Markdown-first source-of-truth package for the interactive personal portfolio.

> **Current state:** DOC-00–DOC-51 and ADR-001–ADR-003 are `APPROVED`. `REVIEW-FINAL-DOC00-51-AUDIT-002` is `PASS` with no unresolved P0–P3 findings. `AMENDMENT-PRE-REPO-GOVERNANCE-002` adds human issue ownership, required Project/Wiki boundaries and tool-neutral authorship rules. The V0 gate is **CLEARED_FOR_REPOSITORY_BOOTSTRAP**; DOC-51 requires repository/project setup before normal feature code.

## Governing north star

> **It should feel like software you inhabit, while remaining as easy to understand as a good website.**

## Master index

| ID | Document | Folder | Status |
|---|---|---|---|
| DOC-00 | Master Guide, Governance & Documentation Map | `00-project` | **APPROVED** |
| DOC-01 | Product Vision, Positioning & Success Criteria | `00-project` | **APPROVED** |
| DOC-02 | Scope, Release Boundaries & Non-Goals | `00-project` | **APPROVED** |
| DOC-03 | Audiences, Personas & Stakeholder Needs | `00-project` | **APPROVED** |
| DOC-04 | User Journeys & Experience Outcomes | `00-project` | **APPROVED** |
| DOC-05 | User Stories, Epics & Acceptance Framework | `01-product` | **APPROVED** |
| DOC-06 | Functional Requirements | `01-product` | **APPROVED** |
| DOC-07 | Non-Functional Requirements | `01-product` | **APPROVED** |
| DOC-08 | Engineering Coverage Register & Technical Constraints | `01-product` | **APPROVED** |
| DOC-09 | Professional & Public Content Requirements | `01-product` | **APPROVED** |
| DOC-10 | Localization, Language & Bilingual Behavior | `01-product` | **APPROVED** |
| DOC-11 | Accessibility & Inclusive Experience Requirements | `01-product` | **APPROVED** |
| DOC-12 | Security, Privacy & Abuse-Prevention Requirements | `01-product` | **APPROVED** |
| DOC-13 | Community, UGC & Moderation Product Requirements | `01-product` | **APPROVED** |
| DOC-14 | Arcade, Achievements & Playful Progression Requirements | `01-product` | **APPROVED** |
| DOC-15 | External Integrations & Live-Data Requirements | `01-product` | **APPROVED** |
| DOC-16 | Contact, Email & Communication Requirements | `01-product` | **APPROVED** |
| DOC-17 | SEO, Metadata, Analytics & Discoverability Requirements | `01-product` | **APPROVED** |
| DOC-18 | Delivery Roadmap, GitHub Workflow & Release Governance | `01-product` | **APPROVED** |
| DOC-19 | Implementation Tooling, Automation & Authorship Governance | `01-product` | **APPROVED** |
| DOC-20 | Interface Philosophy & Interaction Model | `02-interface-architecture` | **APPROVED** |
| DOC-21 | Screen Anatomy | `02-interface-architecture` | **APPROVED** |
| DOC-22 | Navigation Grammar | `02-interface-architecture` | **APPROVED** |
| DOC-23 | Input System | `02-interface-architecture` | **APPROVED** |
| DOC-24 | Focus & Selection System | `02-interface-architecture` | **APPROVED** |
| DOC-25 | Widget System | `02-interface-architecture` | **APPROVED** |
| DOC-26 | Overlay & Surface System | `02-interface-architecture` | **APPROVED** |
| DOC-27 | Component Inventory & UI Primitives | `02-interface-architecture` | **APPROVED** |
| DOC-28 | Responsive Behavior & Layout Rules | `02-interface-architecture` | **APPROVED** |
| DOC-29 | Motion & Transition Architecture | `02-interface-architecture` | **APPROVED** |
| DOC-30 | Audio, Feedback & Delight System | `02-interface-architecture` | **APPROVED** |
| DOC-31 | Screen & Workspace Inventory | `02-interface-architecture` | **APPROVED** |
| DOC-32 | Interface Architecture Master Specification & Decision Registry | `02-interface-architecture` | **APPROVED** |
| DOC-33 | Visual Identity & Design Direction | `03-visual-design` | **APPROVED** |
| DOC-34 | Color, Theme & Environmental Palette | `03-visual-design` | **APPROVED** |
| DOC-35 | Typography, Iconography & Graphic Language | `03-visual-design` | **APPROVED** |
| DOC-36 | Content Architecture & Canonical Professional Data | `03-visual-design` | **APPROVED** |
| DOC-37 | RenderCV Pipeline | `03-visual-design` | **APPROVED** |
| DOC-38 | Geometry, Spacing & Layout Tokens | `03-visual-design` | **APPROVED** |
| DOC-39 | Liquid Glass Material Specification | `03-visual-design` | **APPROVED** |
| DOC-40 | Visual States, Focus & Effects | `03-visual-design` | **APPROVED** |
| DOC-41 | Technical Architecture Master Blueprint & System Context | `04-technical-architecture` | **APPROVED** |
| DOC-42 | Frontend Architecture, Rendering & State Boundaries | `04-technical-architecture` | **APPROVED** |
| DOC-43 | Backend, API & Application Service Architecture | `04-technical-architecture` | **APPROVED** |
| DOC-44 | Data Architecture, PostgreSQL, RLS & Storage | `04-technical-architecture` | **APPROVED** |
| DOC-45 | Authentication, Authorization & Admin Session Architecture | `04-technical-architecture` | **APPROVED** |
| DOC-46 | Integrations, Caching, Jobs & Provider Resilience | `04-technical-architecture` | **APPROVED** |
| DOC-47 | Security Architecture & Threat Model | `04-technical-architecture` | **APPROVED** |
| DOC-48 | Infrastructure, Environments, DNS & Deployment Architecture | `04-technical-architecture` | **APPROVED** |
| DOC-49 | Performance, Observability & Reliability Architecture | `04-technical-architecture` | **APPROVED** |
| DOC-50 | Testing & Quality Engineering Strategy | `04-technical-architecture` | **APPROVED** |
| DOC-51 | Repository, CI/CD & Developer Experience Implementation | `04-technical-architecture` | **APPROVED** |

## Domain-aware authority and implementation reading order

For implementation or future specification work, do not rely on numeric order alone:

1. read approved ADRs that govern the task;
2. read DOC-00 for authority/source-of-truth mapping;
3. read the canonical domain owner (for example DOC-02 release scope, DOC-32 interface behavior, DOC-36 canonical professional/content schemas);
4. read dependent subsystem specifications (including DOC-34/35/38/39/40 for visual UI work);
5. read product/accessibility/security/content/delivery constraints relevant to the task;
6. inspect existing implementation only after the documentation contract is understood.

DOC-19 contains the implementation-tooling and authorship-governance version of this rule. Existing code cannot silently override an approved source-of-truth decision.

## Release terminology

- `V1.0` = base Professional Portfolio release.
- `V1.x` = the complete V1 release family.
- DOC-02 is the normative release owner.
- All six Dock destinations exist from V1.0; pre-release major spaces use the ADR-002 Coming Soon contract.

## Repository documentation conventions

- Markdown is canonical.
- Numbered docs use machine-readable `document_status`.
- ADRs use `decision_status`; reviews use `review_status` + `review_result`.
- Generated assets are never manually edited as source.
- Material architecture/source-of-truth changes receive an ADR where appropriate.
- A PR changing a canonical decision updates its owner and dependent docs atomically.
- Do not place secrets, private customer/client information or non-public credentials in documentation.

## Review gate

Latest operational verification: `reviews/REVIEW-PRE-REPO-GOVERNANCE-001.md` — **PASS**. It confirms the post-audit governance amendment, human issue ownership, required Project/Wiki boundaries and no tool-authorship attribution while preserving the cleared V0 repository-bootstrap gate.

`REVIEW-FINAL-DOC00-51-AUDIT-002.md` remains the deep final architecture consistency audit with P0/P1/P2/P3 = 0.


## Technical Architecture current status

- DOC-41 — Technical Architecture Master Blueprint & System Context: **APPROVED**
- DOC-42 — Frontend Architecture, Rendering & State Boundaries: **APPROVED**
- DOC-43 — Backend, API & Application Service Architecture: **APPROVED**
- DOC-44 — Data Architecture, PostgreSQL, RLS & Storage: **APPROVED**
- DOC-45 — Authentication, Authorization & Admin Session Architecture: **APPROVED**
- DOC-46 — Integrations, Caching, Jobs & Provider Resilience: **APPROVED**
- DOC-47 — Security Architecture & Threat Model: **APPROVED**
- DOC-48 — Infrastructure, Environments, DNS & Deployment Architecture: **APPROVED**
- DOC-49 — Performance, Observability & Reliability Architecture: **APPROVED**
- DOC-50 — Testing & Quality Engineering Strategy: **APPROVED**
- DOC-51 — Repository, CI/CD & Developer Experience Implementation: **APPROVED**
