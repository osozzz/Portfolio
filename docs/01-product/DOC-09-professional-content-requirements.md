---
id: DOC-09
title: "Professional & Public Content Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-01
  - DOC-02
decision_families:
  - CNTREQ
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-09 — Professional & Public Content Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

Define which facts/content the product needs and the integrity rules around publishing them. Exact canonical schemas and synchronization between portfolio/RenderCV are intentionally deferred to DOC-36.

## 2. Public identity content

Required configurable fields include: public display name, concise professional descriptor, short pitch, public-safe location/time-zone only if intentionally published, avatar/profile artwork, availability/current-status phrase, social/professional links and Contact/CV actions.

Do not publish street address, identification numbers, private phone/email unless intentionally chosen for public use, private client references, credentials or secrets.

## 3. Project content requirements

A project can define:

- stable slug and localized title;
- one-line pitch and longer overview;
- project status and timeline;
- category/featured order;
- role/responsibilities;
- problem/solution;
- architecture and important decisions;
- stack/technologies with evidence;
- challenges/tradeoffs;
- screenshots/video/diagrams;
- metrics only when real and supportable;
- lessons;
- repository/demo/live links only when public;
- contextual accent/backdrop/hero/media metadata;
- preferred contextual widgets;
- related achievements;
- visibility/publication flags.

Not every project must have every section. Empty sections do not create empty navigation tabs.

## 4. Professional history

Experience should support organization, public role title, dates/period, concise responsibilities/outcomes and related projects/technologies where public-safe. Client names/details must be omitted/generalized if not appropriate to publish.

Education should support institution, program, period/status and selected relevant work. Certifications support issuer, date, credential/public verification URL when appropriate.

## 5. Skill evidence

Avoid percentage skill bars. A future Skill Constellation or skill presentation should link a technology to projects/experience where it was actually used. A long logo wall without evidence is insufficient.

## 6. Currently Building

This is curated state, not inferred from commit count. May include project, milestone/current focus, next target, optional explicit progress and last-updated date. Never invent a percentage automatically from GitHub activity.

## 7. Dev Log

Supports normalized GitHub-derived events and curated human-authored milestones. Curated entries can explain architecture/design decisions that commits do not communicate well.

## 8. Tech Pulse

External technology content is clearly attributed to original sources. The portfolio may summarize/classify/link but does not impersonate publisher ownership or reproduce full copyrighted articles.

## 9. Achievements

Separate domains clearly:

- professional/engineering/career/academic achievements owned by Alejandro;
- exploration/local interaction achievements earned by the visitor;
- secrets.

Do not present playful badges in a way that could be confused with formal certifications.

## 10. Making Of

May expose concept, iiSU inspiration boundary, interaction architecture, Liquid Glass decisions, responsive/accessibility strategy, technical architecture, security/performance choices, RenderCV workflow and selected ADRs. It should reveal enough to demonstrate thinking without exposing secrets or private infrastructure details.

## 11. Content integrity rules

- Never invent dates, roles, organizations, certifications, metrics, technologies or outcomes.
- Mark unknown/TBD content rather than filling plausible text.
- Generated copy must be reviewed against source facts before publication.
- Portfolio and CV should share canonical professional facts where practical.
- Generated PDFs/images are derived artifacts, not sources.
- Content translations preserve meaning, not word-for-word awkwardness.
- External sources retain attribution.

## 12. Public-data distribution classification

The labels `public`, `admin-only`, `derived-public`, `local-only` and `sensitive/private` describe **delivery/storage handling**, not one authored publication-status enum.

They map onto separate axes formalized by DOC-36:

- editorial `publication_state` (`draft / published / archived`);
- public `visibility` (`public / private`);
- `privacy_class` for disclosure/redaction risk;
- runtime locality/authorization for `admin-only` or `local-only` data;
- provenance for generated `derived-public` output.

Public UI must never receive admin-only/private fields merely hidden by CSS. A generated public projection must trace back to an allowed source classification.
