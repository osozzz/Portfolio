---
id: DOC-32
title: "Interface Architecture Master Specification & Decision Registry"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - DOC-20
  - DOC-31
decision_families:
  - MST
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-32 — Interface Architecture Master Specification & Decision Registry


## Purpose

This document is the authoritative consolidated map of the interface architecture. It does not replace the detailed source documents; it tells implementers what is canonical and where the full rule set lives.

## Product definition

> An interactive personal portfolio presented as a responsive digital system combining console-like spatial navigation, personal-OS characteristics and professional portfolio content.

North star:

> **It should feel like software you inhabit, while remaining as easy to understand as a good website.**

## Inspiration boundary

iiSU informs selectors, contextual widgets, focus hierarchy, softness and console-like exploration. Do not copy iiSU logos, sound files, icons, exact typography/layouts or proprietary artwork.

## System metaphor

`Console Launcher + Personal Operating System + Interactive Portfolio`

Do not turn the product into a literal “Alejandro OS” parody.

## Major spaces

Fixed order:

`Home → Achievements → Arcade → Channel → Social → Contact`

Projects is not a Dock item. Home contains Projects, Experience, Education and Certifications. Home defaults to Projects.

## Layers

- Z0 Environment
- Z1 Workspace
- Z2 System Chrome
- Z3 Widgets
- Z4 Popovers
- Z5 Major/Route Surface
- Z6 System Dialog / Command Palette
- Z7 Toast

Use semantic layer tokens, not arbitrary z-index values.

## Navigation grammar

- N0 Dock
- N1 Context Selector
- N2 Rail/Segment
- N3 Detail Navigation
- N4 Temporary/System Navigation

Browser Back remains coherent. Browsing selection does not create history; opening meaningful Detail does.

## Input architecture

`Physical Input → Adapter → Semantic Action → Context → Response`

Modes:

- pointer
- keyboard
- touch
- gamepad

Latest meaningful input controls hints/focus presentation. Tab remains native. Arrow keys operate composite controls. Text entry suppresses conflicting shortcuts. Gamepad is progressive enhancement.

## State model

Hard distinctions:

`Hover != Focus != Selected != Active != Pressed`

Interpretation:

- Active — where am I?
- Selected — what am I exploring?
- Focus — what will the next action affect?
- Pressed — action is being performed

Primary selectors may use selection-follows-navigation for keyboard/gamepad. Pointer hover never changes the global environment. Selection never automatically opens Detail.

## Context influence and interaction tiers

Influence:

- I0 local
- I1 workspace metadata
- I2 workspace + widgets
- I3 environment + accent + widgets

Interaction tiers:

- A Hero
- B Navigation/Widget
- C Control

ProjectTile = Tier A / I3.

## DynamicBackdrop

Dedicated global subsystem owning artwork, focal point, fallback, tint, readability, texture, responsive art direction and crossfade.

Hover never triggers full environment swap.

## Personal Widget Field

Widgets are contextual secondary surfaces, never dashboard filler. Home elevates them into a **central Personal Widget Field**, one of the product's signature spatial structures alongside the Project Selector and Global Dock. The selected Project Hero coexists in the same Personal Field but is not itself a widget.

Visible widget budget (excluding the Project Hero):

- Compact — 1 primary visible + additional eligible widgets via Widgets surface
- Medium — up to 2
- Expanded — 2–3
- Wide — 3–4

Initial Home priorities:

- Currently Building
- Project Media
- Dev Activity
- Related Achievement

Controlled V1.0 personalization is **APPROVED**:

- pin/unpin eligible widgets
- logical reorder
- supported semantic size variants
- local versioned persistence
- reset to default

The layout remains constrained by responsive slots. No arbitrary x/y placement, overlapping windows, unconstrained resize, scripting or third-party/user-authored widgets. Preferences never override context eligibility. Drag may enhance Customize mode, but equivalent explicit keyboard/touch/gamepad-accessible controls are required.

Widget preferences store logical intent, not viewport-specific coordinates; the system remaps them across responsive modes. Widgets load/fail independently and normally retrieve external data through our server/data/cache layer.

## Surface taxonomy

- S0 Inline Expansion
- S1 Popover
- S2 Sheet
- S3 Overlay
- S4 Route-backed Detail
- S5 Utility Workspace

Max one major overlay. No major-modal nesting.

Project Detail and CV are route-backed. Drawing Pad and active Arcade sessions are Utility Workspaces. Settings is transient. Command Palette is a high-priority global transient surface.

## Component architecture

- L0 Foundations
- L1 Primitives
- L2 System Components
- L3 Feature Components

Dependency direction:

`L3 → L2 → L1 → L0`

`Surface` is the fundamental visual primitive. Features do not implement Liquid Glass manually. Avoid a universal Card with dozens of semantic variants.

An isolated component environment is required; Storybook is the approved V0 baseline unless explicitly superseded by later technical change control.

## Responsive architecture

Modes:

- Compact
- Medium
- Expanded
- Wide

Rules:

- recompose before shrinking
- preserve state across resize/orientation
- use container queries where allocated space matters
- Compact Projects = centered horizontal carousel
- Expanded Projects = vertical iiSU-style selector
- Expanded/Wide Home = central Personal Field with selected Project Hero + controlled Widget Field
- Compact Home = one priority widget + additional Widgets surface
- six-item Dock stays directly accessible on Compact
- safe areas and dynamic viewport units are required
- no orientation lock
- no desktop-only core capability
- performance is part of responsiveness

## Materials

- MAT-0 Solid
- MAT-1 Frost
- MAT-2 Liquid
- MAT-3 Hero Glass

Capability levels:

- FULL
- STANDARD
- REDUCED
- SOLID

Transparency setting:

- Automatic
- Full
- Reduced
- Off

Light/dark are independently tuned.

## Motion

Classes:

- M0 None
- M1 Micro
- M2 Control
- M3 Navigation
- M4 Scene
- M5 Cinematic

All navigation/selection motion is interruptible and retargetable. Input acknowledgement is immediate. Motion primarily communicates space, hierarchy, feedback or continuity.

Tooling direction:

- CSS for simple/local transitions
- Motion as primary interaction/layout animation system
- GSAP only if a later documented use case requires it
- View Transitions API as progressive enhancement candidate

Signature motion:

- Dock highlight
- Project spatial promotion
- DynamicBackdrop
- Widget→Overlay
- Achievement Unlock
- Boot

## Audio / delight

First-visit sound = OFF. No persistent background music in V1.x.

Audio is semantic through AudioManager. No pointer-hover sound. Repeated navigation sound is rate-limited.

Delight levels:

- D1 Visible Personality
- D2 Discoverable
- D3 Secret

Konami unlocks the local `Old School` achievement. Terminal is safe predefined-command UI, never a real shell. Contact/CV remain professionally restrained; generic confetti is excluded.

## Accessibility

Canonical rule:

> **Accessibility may simplify presentation, but must never remove capability.**

Essential capability cannot depend on hover, swipe-only, sound, gamepad or heavy motion/glass effects.

Support keyboard, touch, screen readers, text scaling, reduced motion, reduced transparency, strong focus and semantic HTML.

## Routes

Canonical public tree:

```text
/[locale]
/[locale]/projects/[slug]
/[locale]/achievements
/[locale]/arcade
/[locale]/arcade/glitch-runner
/[locale]/arcade/reflex-deploy
/[locale]/channel
/[locale]/social
/[locale]/social/guestbook
/[locale]/social/sketches
/[locale]/social/activity
/[locale]/contact
/[locale]/cv
/[locale]/making-of
/[locale]/changelog
/[locale]/status
```

Technical route vocabulary stays English across locales.

Admin is separate (`/admin/...`) and is the only authenticated user class in V1.x.

## Authentication / privacy scope

Visitors do not register/login. Community tasks use task-specific nicknames/identity that are not automatically joined into one visitor profile.

Contact, Guestbook, score and sketch identity remain separate.

Admin auth may use Supabase Auth.

## Drawing

No arbitrary image uploads in V1.x. Sketches originate from Drawing Pad.

Drawing uses a logical action/model representation independent of current bitmap so resize/orientation/high-DPI does not destroy content.

Publication:

`local drawing → explicit submit → moderation → approved → public Sketch Wall`

Never claim publication before approval.

## Arcade

V1.3 contains exactly two games:

- Glitch Runner
- Reflex Deploy

Scores use server-created/validated sessions and plausibility checks. Client cannot arbitrarily write leaderboard scores.

## Channel

Primary feeds:

- Tech Pulse
- Dev Log

Currently Building is contextual/status information. Dev Log supports normalized GitHub activity plus manual curated milestones.

## CV / RenderCV

CV route is `/[locale]/cv`.

RenderCV pipeline starts in V0. Source is structured/canonical content, not manually edited PDF.

English and Spanish share design structure. Public UI offers appropriate preview/download behavior without squeezed mobile PDF.

Canonical professional data is formalized later in DOC-36; RenderCV pipeline in DOC-37.

## Releases

> **Summary only. DOC-02 remains the normative release owner.** Release summaries here describe interface impact and cannot override DOC-02/approved ADRs.

### V0 Foundation

Docs, repo, architecture/design foundations, routing/i18n, data/content model, Supabase/security baseline, CI/CD/testing, RenderCV and implementation-tool rules.

### V1.0 Professional Portfolio

Boot, fixed six-space Dock with localized route-backed Coming Soon surfaces for later spaces, Home/Projects, Experience/Education/Certifications, Project Detail/Media, controlled Personal Widget Field personalization, Contact, CV, Settings, ES/EN, theme/sound, responsive system, SEO/404.

### V1.1 Personality

Achievements, Palette, Terminal, Making Of, Changelog, basic Status, Easter eggs, returning personalization.

### V1.2 Community

Social, Guestbook, Sketch Wall, Drawing, reporting, moderation and Admin.

### V1.3 Arcade

Two games, sessions, leaderboards and validation.

### V1.4 Live System

Tech Pulse, Dev Log, GitHub integration, advanced Currently Building, dynamic OG and richer status/caching.

V1.0 must already be a complete professional portfolio.

## Explicit non-goals

Current scope excludes:

- visitor accounts/profiles
- followers/DMs
- real-time public chat
- project comments
- e-commerce
- public API
- native mobile app
- theme marketplace
- third-party/user-authored widgets
- unrestricted freeform dashboards, arbitrary pixel placement, overlap or unconstrained widget resizing
- more than two initial Arcade games

Future inclusion requires ADR/scope review.

## Coming Soon major-space contract

From V1.0 the global Dock exposes all six fixed major destinations. Achievements, Social, Arcade or Channel may be pre-release; their major routes still resolve to localized route-backed Coming Soon workspaces until their owning release. They are not disabled controls. Those pre-release routes are `noindex` and excluded from sitemap; unreleased subroutes normally remain unavailable. DOC-02 + ADR-002 govern release timing and feature-gating.

## Controlled Widget Field personalization

The earlier blanket prohibition on visitor widget repositioning is superseded. The canonical model is **controlled personalization**: logical pin/unpin, reorder and supported sizes inside a responsive slot system, persisted locally without accounts. Freeform desktop/window-manager behavior remains out of scope. See `ADR-001-controlled-widget-field-personalization.md` and DOC-25.

## State ownership clarification

DOC-24 owns interaction-state semantics (`FOCUS`, `SELECTED`, `ACTIVE`, etc.). DOC-40 extends the visual/semantic feedback vocabulary with `SUCCESS` and `WARNING` while preserving DOC-24 meanings. In particular, `ACTIVE` means the persistently engaged mode/space/tool/setting; asynchronous work in progress uses loading/busy semantics.

## Documentation authority

Global authority is domain-aware:

1. Approved ADR explicitly superseding a decision.
2. The canonical domain owner for the concern (DOC-32 for interface architecture; DOC-02 for release scope; DOC-36 for canonical content; relevant later owners for visual/security/data concerns).
3. Dependent approved specifications for that concern.
4. Approved implementation notes/task contracts.
5. Existing code.

DOC-32 is the master for **interface behavior**, not a blanket override of later color/content/CV specifications. Existing code never silently overrides approved documentation.

Architecture changes require proposal, impact analysis, decision and documentation update — normally an ADR.

Decision statuses:

- APPROVED
- DEFERRED
- SUPERSEDED
- REJECTED
- PROPOSED

Only APPROVED decisions are implementation mandates.

Decision families:

- UI — interface philosophy
- SA — screen anatomy
- NAV — navigation
- INP — input
- FCS — focus/selection
- WDG — widgets
- SUR — surfaces
- CMP — components
- RSP — responsive
- MOT — motion
- AFD — audio/feedback/delight
- SCR — screens/routes
- MST — master/governance

## Resolved evolved decisions

- Project Detail → route-backed; overlay-like desktop, full-screen Compact.
- CV → route-backed `/cv`, RenderCV-generated.
- Drawing Pad → transient Utility Workspace launched from Sketch Wall.
- Achievements → major space/route; individual detail overlay.
- Channel → Tech Pulse + Dev Log, Currently Building as contextual/status layer.
- Sound default → OFF on first visit.
- GSAP → not mandatory; deferred unless justified.
- Social Activity → architecture approved, delivery optional under V1.2 scope pressure.

## Implementation readiness gate — component

Before implementing a complex component, define:

- purpose
- interaction tier
- material
- context influence
- states
- inputs/actions
- responsive modes
- loading/error behavior
- accessibility
- motion
- data owner

Undefined critical fields mean specification first, implementation second.

## Implementation readiness gate — workspace

Before implementing a workspace, define:

- route
- surface type
- primary focus
- selector
- widgets
- Back behavior
- Compact/Medium/Expanded/Wide
- keyboard/touch/gamepad behavior
- loading/empty/error/offline
- reduced motion/transparency
- EN/ES

## Downstream approved specifications

The documentation sequence that originally followed DOC-32 is now complete:

- DOC-33 — Visual Identity & Design Direction
- DOC-34 — Color, Theme & Environmental Palette
- DOC-35 — Typography, Iconography & Graphic Language
- DOC-36 — Content Architecture & Canonical Professional Data
- DOC-37 — RenderCV Pipeline
- DOC-38 — Geometry, Spacing & Layout Tokens
- DOC-39 — Liquid Glass Material Specification
- DOC-40 — Visual States, Focus & Effects

DOC-32 remains the interface-behavior master, while those later documents own their declared visual/content/CV domains according to DOC-00's domain-aware authority model.

## Proposed Master decisions

- MST-001 — DOC-32 is the authoritative consolidated interface specification.
- MST-002 — DOC-20 through DOC-31 remain detailed source documents.
- MST-003 — Approved ADRs may explicitly supersede DOC-32 decisions.
- MST-004 — Existing implementation does not override approved architecture.
- MST-005 — Architecture changes cannot be introduced silently during implementation.
- MST-006 — All approved decision-family identifiers remain preserved.
- MST-007 — Contradictory decisions must be explicitly superseded and documentation updated.
- MST-008 — Only APPROVED decisions are mandatory implementation constraints.
- MST-009 — Current evolved decisions for Project Detail, CV, Drawing, Achievements, Channel and Sound replace earlier exploratory alternatives.
- MST-010 — Exact visual values remain intentionally deferred to Visual Design.
- MST-011 — Exact technical mechanisms remain deferred where they do not alter interaction architecture.
- MST-012 — Every complex component requires an implementation-readiness contract.
- MST-013 — Every workspace requires a screen-readiness contract.
- MST-014 — Implementation tooling follows DOC-19's task-aware order: governing ADRs and DOC-00 authority first; DOC-32 is mandatory when significant interface behavior/architecture is affected.
- MST-015 — Architecture-changing PRs require documentation updates and usually an ADR.
- MST-016 — North star balances interactive-system identity with conventional portfolio usability.
- MST-017 — Interface Architecture is considered closed once DOC-32 is approved.
- MST-018 — DOC-33 through DOC-40 are approved downstream Visual/Content/CV specifications and are consumed according to their domain ownership.
- MST-019 — DOC-36/37 preserve the canonical Content Architecture → RenderCV relationship.
- MST-020 — Documentation is maintained alongside code throughout the project lifecycle.

- MST-021 — Controlled Home Widget Field personalization supersedes the earlier blanket no-repositioning rule.
- MST-022 — Personal Widget Field is a signature central composition, not a generic right-sidebar dashboard.
