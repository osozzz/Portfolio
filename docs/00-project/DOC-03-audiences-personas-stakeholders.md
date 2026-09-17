---
id: DOC-03
title: "Audiences, Personas & Stakeholder Needs"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 00-project
depends_on:
  - DOC-01
  - DOC-02
decision_families:
  - AUD
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-03 — Audiences, Personas & Stakeholder Needs

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Audience model

The portfolio has no single “average user.” It must support quick professional evaluation and deeper technical exploration without forcing either behavior on the other.

## 2. Primary persona — Recruiter / Hiring reviewer

**Goal:** determine fit quickly and reach CV/contact.

Needs:

- immediate identity and role context;
- flagship projects with clear pitch/role/stack/status;
- Experience/Education/Certifications without puzzle navigation;
- fast, reliable CV download;
- accessible Contact path;
- good mobile experience from messaging/email links.

Failure modes: long intro, hidden navigation, game-like terminology replacing professional language, slow heavy effects, missing proof of role/impact.

## 3. Primary persona — Technical reviewer / Engineer

**Goal:** assess engineering maturity rather than only visual polish.

Needs:

- architecture and tradeoffs;
- project responsibilities and decisions;
- real stack evidence;
- performance/accessibility/security thinking;
- links to repository/demo when publicly available;
- Making Of and technical portfolio decisions.

Failure modes: generic tech-tag walls, invented metrics, screenshots with no explanation, inaccessible source evidence, fake system data.

## 4. Primary persona — Potential client / collaborator

**Goal:** understand what Alejandro can build and start a conversation.

Needs:

- concise capabilities demonstrated through projects;
- professional trust signals;
- usable Contact form;
- clarity about public vs private/client work;
- no need to understand Arcade/Easter eggs.

## 5. Secondary persona — Designer / Product-minded visitor

**Goal:** inspect interaction design, motion, responsive behavior and visual system.

Values:

- iiSU-inspired spatial grammar with original identity;
- Liquid Glass hierarchy;
- thoughtful responsive recomposition;
- Making Of and component/system rationale.

## 6. Secondary persona — Curious visitor / Peer

**Goal:** explore, play, leave a message/sketch and discover secrets.

Values:

- Achievements, Arcade, Guestbook, Sketch Wall, Terminal;
- lightweight nickname interactions without account creation;
- clear privacy boundaries;
- playful feedback that does not become spammy.

## 7. Owner persona — Alejandro

**Goal:** maintain portfolio content safely and efficiently.

Needs:

- structured canonical project/professional content;
- RenderCV generation from source instead of manually editing PDFs;
- predictable release process;
- moderation tools when community launches;
- ability to update `Currently Building` through the governed repository-authored managed-status workflow in the approved V1.x baseline, while canonical project facts/media/content remain repository-authored; runtime Admin editing of this status requires a future explicit source-of-truth migration ADR;
- observability for contact/integrations/community abuse;
- documentation that makes repeatable implementation safe and repeatable.

## 8. Admin/operator persona

Authenticated owner/operator only in V1.x. Needs quick moderation, reports, basic bans/rate limiting, audit trail and operational status. Admin UX prioritizes density and clarity over cinematic presentation.

## 9. Accessibility persona dimensions

Accessibility is not represented as a separate “special user.” Any persona may use:

- keyboard only;
- screen reader;
- zoom/text scaling;
- reduced motion;
- reduced transparency;
- touch/coarse pointer;
- gamepad as optional input;
- low-power hardware or poor network.

These conditions must not remove capability.

## 10. Stakeholders

- **Product/Owner:** Alejandro.
- **Implementation:** Alejandro is the accountable human owner; development tooling is non-authoring support only.
- **Public visitors:** professional and community audiences.
- **External services:** hosting, database/auth/storage, email, analytics/error reporting, GitHub/news sources, anti-bot service.
- **Content owners:** Alejandro for professional facts; external publishers for Tech Pulse headlines/links; visitors only for submitted UGC.

## 11. Audience priorities

If persona goals conflict, professional comprehension and accessibility win over playful novelty. The design should allow curious users to go deeper rather than require shallow users to opt out of complexity.

## 12. Audience decisions

- **AUD-001** Recruiter and technical-review journeys are equally first-class.
- **AUD-002** Community/Arcade visitors do not gain account identity.
- **AUD-003** Admin is owner/operator tooling, not a public persona.
- **AUD-004** Accessibility conditions apply across all personas.
- **AUD-005** Professional comprehension wins when delight competes with clarity.
