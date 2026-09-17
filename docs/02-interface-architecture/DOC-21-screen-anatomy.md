---
id: DOC-21
title: "Screen Anatomy"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - SA
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-21 — Screen Anatomy


## Normal screen regions

A normal public screen may contain six responsibilities:

- **A — Identity / Status**
- **B — System Controls**
- **C — Context Selector**
- **D — Primary Workspace**
- **E — Context Widgets**
- **F — Global Navigation / Dock**

`DynamicBackdrop` sits underneath them as an independent lower layer.

## Identity / Status

Communicates Alejandro/system identity and concise current status. It is not an About page.

## System Controls

Global controls include ES/EN, Theme, Sound, time where space permits and Settings. They are global rather than selection-specific.

## Context Selector

Changes the item currently explored inside the workspace. Expanded Home uses an iiSU-like vertical selector with a promoted selected item. Compact Projects becomes a centered horizontal carousel.

## Primary Workspace

Each screen has one dominant task/object. Avoid two competing primary regions.

## Personal Widget Field / Context Widgets

Home treats contextual/system widgets as a central **Personal Widget Field**, not merely a right sidebar. The selected project remains the hero, while eligible widgets occupy controlled responsive slots around/alongside it. Other spaces may still use a simpler Widget Region.

The field can be personalized through explicit Customize mode (pin/unpin, order, supported size variants) and saved locally. Normal browsing never accidentally rearranges widgets.

## Global Dock

Persistent major destinations:

`Home / Achievements / Arcade / Channel / Social / Contact`

## Expanded canonical composition

Conceptually:

- identity/status and system controls across the top
- selector toward the left
- **Personal Field in the center**, combining selected-project hero + controlled Widget Field
- optional secondary widget/content slots toward the right only when composition benefits
- Dock centered near the bottom

The selector may overlap the workspace spatially; it is not a rigid enterprise sidebar. The selected tile can extend/promote into the workspace. The center should feel inhabited by a project and modular widgets rather than `main content + dashboard sidebar`.

## Wide

Use bounded content widths. Extra width becomes ambience, artwork, media capacity and optional context rather than excessively long text lines.

## Medium

Selector + project hero remain primary. The Personal Widget Field compresses to roughly two controlled slots below/alongside the hero. User logical order/pinning remains intact even if physical placement changes.

## Compact

Projects become a centered horizontal carousel. Prioritize title, pitch, essential technologies/status, primary action and one priority widget. Additional eligible widgets remain reachable through a dedicated Widgets sheet/shelf rather than a squeezed desktop grid. The six-item Dock stays directly reachable where practical.

System chrome simplifies; Theme/Sound/Transparency/Motion/Language can move into Settings. Clock may disappear.

## Widget Field budgets

Visible widget modules (not counting the selected Project Hero):

- Compact: 1 primary visible; additional eligible widgets via Widgets surface
- Medium: up to 2
- Expanded: 2–3
- Wide: 3–4

These are maxima, not quotas. User pin/order/size preferences are interpreted within the current mode; the layout may show fewer when space, relevance or performance requires it.

## Context coordination

When project selection changes, ProjectTile, summary, backdrop, accent, actions and widgets update as one contextual system. Remote widgets never block the core selection state.

## Home collections

Home contains:

- Projects
- Experience
- Education
- Certifications

Projects is the default collection.

## Project Home minimum information

Expose immediately:

- artwork
- title
- one-line pitch
- primary technologies
- status
- primary action

## Project Detail

Route-backed:

`/[locale]/projects/[slug]`

Expanded/Wide: large contextual surface with Home environment still visible behind it.  
Compact: full-screen detail workspace.

Potential sections:

- Overview
- Architecture
- Challenges
- Media
- Making / Lessons where meaningful

Use internal navigation only for substantive sections.

## Media

Desktop can organize Screenshots / Videos / Architecture. Compact uses responsive grid/list and full-screen viewer mode.

## Achievements

Uses category navigation, progress, badge grid and selected/detail surface. Locked/unlocked/secret states remain distinct.

## Arcade

Library and Gameplay are separate interaction states. Active gameplay may minimize Dock/status chrome but must expose predictable escape.

## Channel

Primary content:

- Tech Pulse
- Dev Log
- Currently Building as contextual/status information

Compact shows one primary feed at a time.

## Social

Expanded may use a left rail:

- Overview
- Guestbook
- Sketch Wall
- Activity

Compact transforms this into segmented navigation.

## Drawing Pad

Expanded: left tools + central canvas + lower palette/actions.  
Compact: canvas dominates + bottom tool dock/palette/actions.

## Contact

Messaging-inspired presentation but conventional accessible form behavior.

## CV

Responsive RenderCV experience. Expanded can show preview plus controls. Compact must not squeeze a desktop PDF frame.

## Settings

Potential sections:

- Appearance
- Language
- Sound
- Motion
- Transparency
- Privacy
- Local Data
- About/System

## Command Palette

Fast global system overlay; keyboard-centric on desktop, touch-accessible on Compact.

## Toast

Transient, non-blocking and generally non-focus-stealing.

## Semantic z-layers

- Z0 Environment
- Z1 Workspace
- Z2 System Chrome
- Z3 Widgets
- Z4 Popovers
- Z5 Major Overlay / Route Detail
- Z6 Command Palette / System Dialog
- Z7 Toast

Use semantic tokens instead of arbitrary z-index values.

## Material mapping

Typical mapping:

- environment — artwork/no glass
- project tile — MAT-1 / MAT-2 selected
- status/system controls — MAT-2
- widgets — MAT-2
- Dock — MAT-2
- major overlay shell — MAT-3
- forms/reading surfaces — MAT-0 / MAT-1
- toast — MAT-2

## Scrolling

The shell is generally viewport-bound. Individual content regions own scroll where needed. Preserve native scrolling; no scroll-jacking.

## Mobile surfaces

Desktop overlays recompose into large/full workspaces or sheets on Compact instead of tiny modal replicas.

## Component ownership

Responsive behavior belongs to components/containers. The shell provides available space rather than hardcoding every feature's internal layout.

## Decision registry

- SA-001 — Normal screens have six foreground responsibilities.
- SA-002 — DynamicBackdrop is an independent lower layer.
- SA-003 — Expanded mode defines canonical spatial composition, not rigid coordinates.
- SA-004 — Compact selectors recompose into carousel/collection patterns.
- SA-005 — Main navigation remains directly reachable on Compact where practical.
- SA-006 — Widget count is limited per responsive mode.
- SA-007 — Project Detail is route-backed, overlay-like on desktop and full-screen on Compact.
- SA-008 — Shell is generally viewport-bound while content regions own scrolling.
- SA-009 — Complex rails exist only where justified and become segmented navigation on Compact.
- SA-010 — Glass strength follows information hierarchy.
- SA-011 — Drawing Pad is a dedicated utility workspace.
- SA-012 — CV is a responsive RenderCV experience; never a squeezed desktop PDF.
- SA-013 — Semantic z-layers replace arbitrary z-index values.
- SA-014 — Every screen defines Compact/Medium/Expanded/Wide behavior before implementation.
- SA-015 — Every screen has one primary focus; competing primary regions are rejected.

## Coming Soon workspace state

From V1.0, the six fixed Dock spaces are all real destinations. A space whose full release is later uses the same shell/anatomy but replaces feature content with a localized route-backed Coming Soon workspace: concise identity, release-safe teaser/context, and clear Home/Back recovery. It does not imitate a disabled screen or fabricated live feature.
