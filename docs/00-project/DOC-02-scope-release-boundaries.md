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
last_updated: 2026-11-10
approved_at: 2026-11-10
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

- first-visit cinematic Boot with skip/reduced-motion behavior that never delays the content's LCP (ADR-006, ADR-007);
- the three.js signature 3D stage in its approved moments, with static/2D fallbacks (ADR-006);
- background music offered through a non-blocking Yes/No music prompt plus an always-available sound control, with a committed audio license register (ADR-005);
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
- Personal Data Processing Policy page in ES/EN (ADR-008);
- content-driven `Currently Building` foundation where useful.

Achievements may have an internal data/unlock foundation in V1.0 even if their full public feature set ships in V1.1.

**Publication rule (ADR-007).** V1.0 is published only when the whole release, including the first impression (Boot, 3D stage and fallbacks, music prompt and control), passes its exit criteria (DOC-50 §86). It is gated on quality, not on a date. Until then deployments remain previews and are not announced as the public portfolio.

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
- optional custom-cursor polish for fine pointers;
- Markdown blog authored in Astro Content Collections, with no CMS (ADR-007);
- curated themes (palette, backdrop, optional music track) chosen in Settings; no marketplace, uploads or user-authored themes (ADR-007).

## 6. V1.2 — Community

- Social Overview;
- Guestbook and composer;
- Sketch Wall;
- Drawing Pad utility workspace;
- reporting/reactions where approved;
- Terms of Use page in ES/EN and the UGC age declaration (ADR-008);
- moderation workflow and admin authentication;
- moderation queue, hide/reject/approve and basic ban/rate-limit controls.

No arbitrary visitor image uploads are included.

## 7. V1.3 — Arcade

Exactly two initial games:

- Glitch Runner;
- Reflex Deploy.

Includes Game Session Shell, result flow, server-validated score sessions, leaderboards, nickname submission, plausibility checks and local Arcade achievements. A Coming Soon tile may tease future games; it is not permission to expand V1.3 scope. Additional games may be proposed **after** V1.3 ships, each through the §11 scope-change gate (ADR-007).

## 8. V1.4 — Live System

- Tech Pulse with attributed/cached external technology sources;
- Dev Log with GitHub-derived and curated manual milestones;
- richer Currently Building context;
- dynamic project OG cards;
- richer integration/service status;
- robust cache/failure behavior for live integrations;
- anonymous presence ("3 people exploring now", subtle visitor traces), with no chat, identity or messages (ADR-007).

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
- real-time public chat (anonymous presence in V1.4 is not chat; ADR-007);
- full blog CMS (the V1.1 Markdown blog uses no CMS; ADR-007);
- e-commerce/payments;
- public API;
- native iOS/Android app;
- arbitrary image/file uploads from visitors;
- third-party/user-authored widgets;
- unrestricted freeform widget desktops, arbitrary pixel placement or overlapping windows;
- marketplace/theme marketplace (curated themes in V1.1 are not a marketplace; ADR-007);
- more than two initial Arcade games (expansion after V1.3 follows §11; ADR-007);
- fake server telemetry or fake “hacker” terminal capabilities;
- ~~background music as a core product feature~~ — **SUPERSEDED by ADR-005 / ADR-007**: background music ships in V1.0 behind the Yes/No music prompt.

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
- **SCP-009** V1.0 includes the first impression (cinematic Boot, 3D stage with fallbacks, music prompt and control) and is published only after passing its exit criteria (ADR-007).
- **SCP-010** A Markdown blog without CMS ships in V1.1 (ADR-007).
- **SCP-011** Curated themes ship in V1.1; a theme marketplace stays out of scope (ADR-007).
- **SCP-012** Anonymous presence ships in V1.4; real-time chat, identity and messages stay out of scope (ADR-007).
- **SCP-013** Arcade expansion beyond two games may be proposed only after V1.3 ships (ADR-007).
- **SCP-014** The Personal Data Processing Policy ships in V1.0 and the Terms of Use before V1.2 (ADR-008).
