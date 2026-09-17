---
id: DOC-05
title: "User Stories, Epics & Acceptance Framework"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-02
  - DOC-03
  - DOC-04
decision_families:
  - USR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-05 — User Stories, Epics & Acceptance Framework

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

Translate product intent into a traceable **story catalog and acceptance framework** without prescribing visual geometry already owned by Interface Architecture. Individual GitHub implementation issues expand these catalog stories into issue-ready slices.

## 2. Story catalog and issue format

The `USR-*` entries in this document are canonical **story intents**, not fully expanded implementation tickets. When a story becomes implementation work, its GitHub issue (or equivalent task record) must include: `USR-*` ID, persona, intent, value, release target, detailed acceptance criteria, affected decisions/docs, security/privacy considerations, accessibility behavior, analytics event only if justified, and test level.

Normative epic release mapping (DOC-02 governs exact release scope):

| Epic | Primary release |
|---|---|
| A — Shell/discovery | V1.0; all six major spaces exist, later spaces may be Coming Soon |
| B — Projects/history | V1.0 |
| C — CV/contact | V1.0 |
| D — Local settings + controlled Widget Field personalization | V1.0 |
| E — Achievements/delight | V1.1 |
| F — Community | V1.2 |
| G — Arcade | V1.3 |
| H — Channel/live data | V1.4 |
| I — Owner/admin moderation | V1.2 |

## 3. Epic A — Portfolio shell and discovery

- **USR-001:** As a visitor, I can identify the portfolio owner and current professional context without entering an About maze.
- **USR-002:** As a visitor, I can switch among Home, Achievements, Arcade, Channel, Social and Contact using one stable global navigation model.
- **USR-003:** As a mobile visitor, I can access the same core destinations without hover or hidden gestures.
- **USR-004:** As a keyboard user, I can navigate global and composite controls with predictable focus.
- **USR-005:** As a visitor, I can change language/theme/sound/motion/transparency without losing my current destination.

## 4. Epic B — Projects and professional history

- **USR-010:** I can browse projects and immediately understand which project is selected.
- **USR-011:** Selecting a project updates contextual information without opening a new route.
- **USR-012:** I can explicitly open a project detail URL and share/reload it.
- **USR-013:** I can inspect architecture, challenges, media and lessons when that project has meaningful content.
- **USR-014:** I can browse Experience, Education and Certifications from Home.
- **USR-015:** I can identify Coming Soon content without fake project details.

## 5. Epic C — CV and contact

- **USR-020:** I can preview/download an English or Spanish CV.
- **USR-021:** A direct CV URL works without previous app state.
- **USR-022:** I can send a real contact message and receive clear success/failure feedback.
- **USR-023:** A failed send preserves my typed message.

## 6. Epic D — Personalization and system settings

- **USR-030:** My safe local preferences persist across visits.
- **USR-031:** I can reset/clear local personalization and progress.
- **USR-032:** First-time onboarding adapts to my input mode and does not repeat unnecessarily.
- **USR-033:** Reduced motion/transparency preserve function.
- **USR-034:** On larger layouts I can personalize the central Widget Field by pinning/unpinning eligible widgets.
- **USR-035:** I can reorder pinned widgets and choose only supported size variants without requiring pixel-perfect freeform placement.
- **USR-036:** Widget layout preferences persist locally, can be reset, and recompose safely across responsive modes.
- **USR-037:** I can customize widgets without drag-and-drop being the only accessible method.

## 7. Epic E — Achievements and delight

- **USR-040:** I can browse real professional achievements separately from playful interaction achievements.
- **USR-041:** Unlocking a local secret produces non-blocking feedback and persists locally.
- **USR-042:** I can use Command Palette as an alternative global navigation method.
- **USR-043:** I can open a safe predefined Terminal without real shell execution.
- **USR-044:** I can inspect Making Of, Changelog and Status as product evidence.

## 8. Epic F — Community

- **USR-050:** I can leave a Guestbook message without creating an account.
- **USR-051:** I can see only approved public Guestbook content.
- **USR-052:** I can report public content.
- **USR-053:** I can create a sketch with Drawing Pad without uploading arbitrary files.
- **USR-054:** I can save a sketch locally and intentionally submit it for moderation.
- **USR-055:** I am not told my sketch is published until approval occurs.

## 9. Epic G — Arcade

- **USR-060:** I can choose and play Glitch Runner or Reflex Deploy on supported inputs.
- **USR-061:** Gameplay has clear pause/exit behavior and survives focus changes safely.
- **USR-062:** I can submit an eligible validated score under a public nickname without an account.
- **USR-063:** Leaderboards reject trivial forged scores.

## 10. Epic H — Channel/live data

- **USR-070:** I can read a curated Tech Pulse with visible source attribution.
- **USR-071:** I can review a Dev Log that combines real GitHub activity with curated milestones.
- **USR-072:** Live-data outages do not prevent access to the portfolio core.

## 11. Epic I — Owner/admin

- **USR-080:** As the owner, I can authenticate to an admin area that public users cannot access.
- **USR-081:** I can review/approve/reject/hide community submissions.
- **USR-082:** I can review reports and apply basic bans/rate-limit controls where supported.
- **USR-083:** Moderation actions are auditable.

## 12. Cross-cutting acceptance criteria

A story is not accepted until all applicable criteria pass:

- primary happy path;
- loading, empty and failure path;
- Compact and Expanded at minimum;
- keyboard and touch; gamepad where relevant;
- accessible name/focus/order/error messaging;
- ES and EN content;
- no unauthorized data exposure;
- analytics only for approved minimal events;
- tests appropriate to risk.

## 13. Story slicing

Slice vertically by user-visible capability. Avoid “build all DB tables,” “build all components,” or “build all animations” as standalone product stories. Technical tasks may exist under a story but do not replace acceptance behavior.
