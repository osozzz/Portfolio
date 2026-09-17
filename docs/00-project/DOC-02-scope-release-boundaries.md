---
id: DOC-02
title: "Scope, Release Boundaries & Non-Goals"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 00-project
depends_on:
  - DOC-00
  - DOC-01
decision_families:
  - SCP
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-02 — Scope, Release Boundaries & Non-Goals

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

Define what is in scope, when it becomes deliverable and what is explicitly excluded so the portfolio can ship incrementally without losing architectural coherence.

## 2. Scope rule

A feature belongs in the portfolio only if it materially improves one of these outcomes: communicate professional evidence, demonstrate product/engineering craft, support contact/discovery, or create restrained personality that strengthens memorability. “It would be cool” alone is insufficient.

## 3. V0 — Foundation

V0 is not a public feature release. It establishes the ability to build safely and consistently:

- repository/project structure and documentation;
- approved interface architecture and design-system foundations;
- routing/i18n skeleton;
- content/data source conventions;
- dev/preview/prod environment strategy;
- database/project foundations where needed;
- CI, lint, typecheck, tests and security/dependency checks;
- RenderCV structured source and generation pipeline;
- secrets/config conventions;
- Implementation-tool rules, context entry points and ADR process.

## 4. V1.0 — Professional Portfolio

Must be useful even if no later release ships:

- first-visit Boot with skip/reduced-motion behavior;
- persistent shell, top identity/status controls and the six-space Dock in fixed order;
- deliberate localized Coming Soon route surfaces for Dock spaces whose full feature set ships later;
- Home with Projects default and Experience/Education/Certifications collections;
- project selection, contextual backdrop and Project Detail routes;
- project Media;
- controlled Personal Widget Field personalization: pin/unpin, logical reorder, supported `S/M/L` sizes, local versioned persistence and reset;
- ES/EN; light/dark; sound control; motion/transparency preferences;
- Contact form with real delivery and recovery on failure;
- `/[locale]/cv` with RenderCV preview/download in both languages;
- responsive Compact/Medium/Expanded/Wide behavior;
- accessibility baseline, SEO, metadata, sitemap/robots, 404;
- content-driven `Currently Building` foundation where useful.

Achievements may have an internal data/unlock foundation in V1.0 even if their full public feature set ships in V1.1.

The six primary Dock destinations are never dead controls. Before a later-release space is feature-complete, its major route resolves to a real localized **Coming Soon** surface with a stable back/home path. These pre-release surfaces are `noindex` and excluded from generated sitemaps until the owning feature release. See ADR-002 and DOC-31.

## 5. V1.1 — Personality

- Achievements space and detail;
- Command Palette;
- predefined safe Terminal;
- Making Of;
- Changelog;
- basic System Status;
- returning local name/personal greeting features beyond the V1.0 Widget Field layout preference;
- tasteful console message, Konami achievement and selected Easter eggs;
- optional custom-cursor polish for fine pointers.

## 6. V1.2 — Community

- Social Overview;
- Guestbook and composer;
- Sketch Wall;
- Drawing Pad utility workspace;
- reporting/reactions where approved;
- moderation workflow and admin authentication;
- moderation queue, hide/reject/approve and basic ban/rate-limit controls.

No arbitrary visitor image uploads are included.

## 7. V1.3 — Arcade

Exactly two initial games:

- Glitch Runner;
- Reflex Deploy.

Includes Game Session Shell, result flow, server-validated score sessions, leaderboards, nickname submission, plausibility checks and local Arcade achievements. A Coming Soon tile may tease future games; it is not permission to expand V1.3 scope.

## 8. V1.4 — Live System

- Tech Pulse with attributed/cached external technology sources;
- Dev Log with GitHub-derived and curated manual milestones;
- richer Currently Building context;
- dynamic project OG cards;
- richer integration/service status;
- robust cache/failure behavior for live integrations.

## 9. Release and route-gating contract

DOC-02 is the normative owner of release scope. Other documents may summarize releases, but when a summary differs, this document governs unless an approved ADR explicitly supersedes it.

The base public release is always named **V1.0**. `V1.x` refers to the complete release family (`V1.0` through later `V1.x` increments), never to the base release alone.

For the six fixed Dock spaces:

- Home and Contact are feature-complete in V1.0;
- Achievements resolves to a localized Coming Soon surface in V1.0 and becomes feature-complete in V1.1;
- Social resolves to a localized Coming Soon surface in V1.0 and becomes feature-complete in V1.2;
- Arcade resolves to a localized Coming Soon surface in V1.0 and becomes feature-complete in V1.3;
- Channel resolves to a localized Coming Soon surface in V1.0 and becomes feature-complete in V1.4;
- unreleased **subroutes** normally remain unavailable/404 until their owning release unless a separate scope decision explicitly publishes a teaser route;
- Coming Soon major-space routes remain navigable, localized, keyboard/touch accessible and compatible with Back/Home;
- Coming Soon routes are `noindex`, excluded from sitemap, and must not expose fabricated feature data;
- once a space ships, indexing/sitemap eligibility follows DOC-17 and its own content rules.

## 10. Explicit non-goals for V1.x

- visitor registration/login;
- visitor profiles, follow graphs or DMs;
- real-time public chat;
- full blog CMS;
- e-commerce/payments;
- public API;
- native iOS/Android app;
- arbitrary image/file uploads from visitors;
- third-party/user-authored widgets;
- unrestricted freeform widget desktops, arbitrary pixel placement or overlapping windows;
- marketplace/theme marketplace;
- more than two initial Arcade games;
- fake server telemetry or fake “hacker” terminal capabilities;
- background music as a core product feature.

## 11. Scope-change gate

A proposed feature must document: professional/product value, affected release, UI location, data/security/privacy impact, performance impact, accessibility, moderation needs, maintenance cost and whether it can reuse existing primitives. A feature that requires new top-level navigation or a new surface type requires architecture review.

## 12. De-scope order under schedule pressure

Protect core professional value in this order:

1. Projects / Project Detail / CV / Contact.
2. Responsive/accessibility/security/reliability.
3. Experience/Education/Certifications and project media.
4. Personality layers.
5. Community extras.
6. Arcade/live-data extras.

Do not “save time” by removing mobile support, keyboard accessibility, validation or security controls while keeping decorative polish.

## 13. Scope decisions

- **SCP-001** V1.0 is independently portfolio-complete.
- **SCP-002** V1.1–V1.4 are additive personality/depth releases.
- **SCP-003** Community and Arcade do not justify visitor accounts in V1.x.
- **SCP-004** Only two games ship in initial Arcade scope.
- **SCP-005** No arbitrary visitor image uploads ship in current community scope.
- **SCP-006** Payments/e-commerce are explicitly not applicable to current product scope.
- **SCP-007** New top-level spaces require architecture review rather than Dock overflow hacks.
- **SCP-008** Reliability/accessibility/security cannot be de-scoped in favor of visual polish.
