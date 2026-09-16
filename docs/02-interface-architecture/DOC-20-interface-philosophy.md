---
id: DOC-20
title: "Interface Philosophy & Interaction Model"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - UI
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-20 — Interface Philosophy & Interaction Model

> **Purpose:** Define the interaction philosophy, product metaphor and non-negotiable UX principles for the portfolio.

## Product definition

The portfolio is a **responsive web-based personal interactive system** for presenting Alejandro's work, experience and technical identity. It is not a conventional portfolio with visual effects added afterward.

The product metaphor combines:

- **Console launcher** — spatial browsing, deliberate selection, strong focus hierarchy.
- **Personal operating system** — persistent shell, status, settings, utilities and contextual state.
- **Interactive portfolio** — clear professional information, shareable project detail, CV and Contact.

The public product should not overuse a literal “Alejandro OS” metaphor. The metaphor organizes the experience; it is not a gimmick.

## Inspiration boundary

iiSU is the main interaction reference for softness, spatial browsing, selectors, widgets and console-like system behavior. The implementation may borrow interaction grammar and hierarchy, but must not copy iiSU logos, icons, sound files, proprietary artwork, exact typography or exact layouts.

## Experience pillars

The interface should feel:

- spatial
- tactile
- contextual
- playful
- premium
- responsive
- technically credible
- easy to understand as a professional website

Tone: technical, playful, confident, clean and curious. Avoid corporate stiffness, cyberpunk cliché, excessive gamer aesthetics and childish gamification.

## System layers

- **L0 Environment** — backdrop, artwork, ambient tint and texture.
- **L1 System Shell** — persistent system identity and navigation.
- **L2 Workspace** — the current major space and its primary content.
- **L3 Overlay** — temporary/detail surfaces above the workspace.

Later documents refine these into the final semantic z-layer model.

## Global spaces

The six persistent spaces are:

`Home → Achievements → Arcade → Channel → Social → Contact`

**Projects is not a Dock destination.** Home contains:

- Projects
- Experience
- Education
- Certifications

“Channel” is the official name; do not use “iiChannel”.

## Navigation depth

Preferred conceptual depth:

`Space → Content → Detail`

Avoid unnecessarily deep application trees.

## Spatial interaction

On desktop/controller-oriented layouts:

- horizontal movement generally changes major context;
- vertical movement generally changes items inside the current context.

These are semantic relationships, not rigid geometry. Compact layouts may change physical axis while preserving intent.

## Semantic actions

Physical input maps into logical actions such as:

- previousSection / nextSection
- previousItem / nextItem
- confirm
- back
- openDetails
- openMenu

Mouse, keyboard, touch and gamepad are adapters to these actions.

## Responsive modes

The system uses four semantic modes:

- **Compact**
- **Medium**
- **Expanded**
- **Wide**

Core rules:

> Responsive preserves interaction intent, not identical geometry.

> Components recompose before they shrink.

## Normal shell anatomy

A normal workspace may contain:

- Identity / Status
- System Controls
- Context Selector
- Primary Workspace / Personal Field
- Context Widgets / Widget Field
- Global Dock

`DynamicBackdrop` exists below the foreground layers.

The system clock represents the visitor's local time. Alejandro's own location/time can appear contextually in Contact instead of masquerading as the visitor's system clock.

## Dock

The global Dock is generally persistent. It may minimize during active gameplay, Drawing Pad or full-screen media, but back/exit behavior must remain predictable.

Complex spaces such as Social and Admin may use rails. The public interface should not become sidebar-heavy.

## Selector families

- **Linear Selector** — ordered iiSU-like browsing, especially Projects.
- **Shelf Selector** — horizontal collection browsing for secondary collections.

## Hover, focus and selection

Hard distinction:

`Hover != Focus != Selected`

Selected is the strongest physical/contextual state. Hover never replaces selection semantics.

## Selection Context

Conceptually:

```ts
SelectionContext {
  entity
  accent
  backdrop
  actions
  widgets
  metadata
}
```

Selected content propagates context through this shared model rather than individual components manipulating each other directly.

## DynamicBackdrop

May combine:

- base layer
- selected artwork
- responsive focal positioning
- blur/desaturation
- contextual tint
- readability wash
- texture
- foreground treatment

Project changes crossfade/retarget the environment. Pointer hover does not trigger full-screen backdrop swaps.

## Liquid Glass

The core material language combines iiSU softness with a deeper Liquid Glass identity of our own. It must not become a generic Apple-glass imitation.

Possible ingredients:

- transparency
- backdrop blur
- saturation
- edge highlights
- internal gradients
- selective refraction where performant
- depth shadow
- faint border
- contextual tint
- restrained animated optical response

Not everything is glass.

Material levels:

- **MAT-0 Solid** — critical text, forms, accessibility fallback, drawing/media surfaces.
- **MAT-1 Frost** — passive/secondary cards.
- **MAT-2 Liquid** — Dock, widgets, controls, popovers.
- **MAT-3 Hero Glass** — sparse major overlays/feature surfaces.

Quality can degrade through:

`FULL → STANDARD → REDUCED → SOLID`

without changing information hierarchy or capability.

Transparency setting:

- Automatic
- Full
- Reduced
- Off

Light and dark are individually tuned, not simple inversion.

## Personal Field and Widgets

A widget is a contextual secondary surface, not dashboard filler. On Home, widgets participate in a **central Personal Widget Field** that is one of the system's signature spatial structures. The field may visually surround/coexist with the selected Project Hero and use asymmetric composition, but its underlying placement is a controlled responsive grid.

The default experience should feel inhabited and personal rather than like `selector + content + sidebar`. Visitors may customize the eligible Widget Field within defined constraints: pin/unpin, logical order and supported semantic size variants. Preferences persist locally and recompose across responsive modes. V1.0 does **not** provide arbitrary pixel placement, overlapping windows, third-party/user-authored widgets or a freeform desktop/window manager.

System widgets may remain conceptually stable while their content retargets; context widgets may enter/leave according to the current selection. The selected project remains the primary focus and is not itself reduced to a generic dashboard card.

## Overlays

Overlays are a first-class part of the interaction architecture. Only one major overlay should exist at a time. Avoid nested major modals.

## Drawing Pad

Drawing Pad is an iShade-inspired utility workspace: predictable canvas, clear tools, palette and responsive recomposition. It should feel like a real focused tool, not a form inside a modal.

## Multimodal feedback

Visual, motion, audio and interaction feedback can reinforce each other, but no capability may depend on sound. Audio is semantic and optional.

## Forms

Contact, Guestbook and Admin use conventional accessible form semantics beneath the visual system. Do not sacrifice form usability to the console metaphor.

## Accessibility

Canonical rule:

> **Accessibility may simplify presentation, but must never remove capability.**

Requirements include keyboard, touch, screen-reader semantics, strong focus, reduced motion, reduced transparency, contrast, skip navigation, semantic HTML and robust text scaling.

## Degraded operation

The shell and core portfolio remain usable when optional systems fail. Gracefully handle failures of network, external APIs, images, GitHub/news, audio, gamepad, blur/refraction and constrained mobile GPU capability.

Dynamic data is enhancement. Do not show a full-page spinner after entry just because one widget is waiting.

## Boot and returning visitors

Boot:

- first visit only by default
- target roughly 1.5–2 seconds maximum
- skippable
- reduced-motion version
- replayable later

Returning personalization is local and optional.

## Home default hierarchy

Home opens to Projects with a manually featured project selected.

Expanded/Wide hierarchy:

`selected project + central Personal Widget Field → project information/actions → shell`

The selected project remains the gravitational hero while 2–4 eligible widgets can occupy controlled slots around/alongside it according to responsive mode and user preferences.

Compact hierarchy:

`selected project → title/pitch → one priority widget → optional Widgets surface → compact global controls`

## Anti-patterns

Reject:

- generic SaaS dashboard layouts
- giant hero CTA templates
- glass everywhere
- random gradient blobs
- unnecessary 3D
- scroll-jacking
- excessive parallax
- hidden essential information
- desktop merely shrunk for mobile
- hover-only requirements
- nested major modals
- blocking animation
- permanent background motion
- autoplay audio
- skill percentages as fake proficiency precision

## North star

> **It should feel like software you inhabit, while remaining as easy to understand as a good website.**

## Decision summary

- UI-001 — The product is an interactive personal system whose primary purpose is a professional portfolio.
- UI-002 — Global spaces are Home, Achievements, Arcade, Channel, Social and Contact.
- UI-003 — Projects, Experience, Education and Certifications live inside Home.
- UI-004 — iiSU informs interaction grammar, not copied assets or proprietary identity.
- UI-005 — The interface uses persistent shell, contextual workspace, dynamic environment and temporary surfaces.
- UI-006 — Hover, Focus and Selected are distinct.
- UI-007 — Selection Context drives environment, accent, widgets and contextual actions.
- UI-008 — Liquid Glass uses MAT-0..MAT-3 with graceful capability degradation.
- UI-009 — Compact/Medium/Expanded/Wide are the semantic responsive modes.
- UI-010 — Gamepad support is a V1.0 progressive enhancement for navigation/confirm/back/space switching.
- UI-011 — Accessibility may simplify presentation but never remove capability.
- UI-012 — Core portfolio content remains usable when optional external/delight systems fail.

- UI-013 — Home uses a central Personal Widget Field as a signature spatial structure.
- UI-014 — Widget Field personalization is controlled: pin/unpin, logical reorder and supported sizes; no arbitrary freeform desktop.
- UI-015 — Widget preferences persist locally and recompose responsively without visitor accounts.
