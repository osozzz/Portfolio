---
id: DOC-22
title: "Navigation Grammar"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - NAV
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-22 — Navigation Grammar


## Navigation levels

- **N0 Global Dock** — major space navigation.
- **N1 Context Selector** — content browsing inside the current space.
- **N2 Rail / Segment** — subsection navigation.
- **N3 Detail Navigation** — meaningful internal detail sections.
- **N4 Temporary/System Navigation** — overlays, palette and utilities.

## Dock

Fixed order:

`Home → Achievements → Arcade → Channel → Social → Contact`

Order never changes by language, screen size, usage, auth or personalization.

Expanded/Wide: centered bottom Liquid Glass Dock.  
Medium: compact bottom Dock.  
Compact: safe-area-aware direct destinations.

The Dock is one continuous glass object with an internal moving selection/focus material.

States may include Rest, Hover, Focus, Active, Pressed, Attention and Disabled where truly necessary. Focus and Active are independent.

## Major-space movement

Major spaces are conceptually horizontal. Reduced motion may replace lateral movement with crossfade/instant transitions.

Focus and activation are distinct. Gamepad shoulder buttons may switch spaces directly when configured. Optional advanced shortcuts such as Cmd/Ctrl+1..6 can be documented later.

## Context selectors

Shared behavior applies to Projects, Arcade games, achievement categories and similar collections.

Primary iiSU-style selector:

- selected item receives scale/depth/promotion;
- neighbors remain visible where useful;
- selection may influence backdrop/widgets/details;
- no infinite wrap by default (`loop: false`).

Selecting is not opening. Selection updates preview/context; explicit confirm/open enters Detail.

Pointer:

- hover = lightweight preview only
- click = select
- no double-click semantics

Wheel:

- only maps to selector navigation on the explicit selector surface
- never globally hijacks page scroll

Compact:

- touch carousel uses horizontal swipe
- semantic previous/next remains equivalent to desktop vertical browsing
- visible/tappable alternatives exist

## Rails and segments

Rails are reserved for complex spaces such as Social/Admin. Compact uses horizontal/segmented equivalents. Channel does not need a permanent rail unless IA materially grows.

## Project detail navigation

Stable meaningful sections may include Overview, Architecture, Challenges, Media and Making/Lessons. Deep-link meaningful states, not every microstate.


## Pre-release Dock destinations

The fixed six-space Dock exists from V1.0. If a later-release major space is not feature-complete yet, activation still navigates to its stable localized major route and renders the approved **Coming Soon** surface. The destination remains keyboard/touch/gamepad reachable, Back remains normal, and the control is not styled/announced as disabled.

Coming Soon is route content, not a fake loading state. Unreleased subroutes are not automatically created. Indexing/sitemap rules are owned by DOC-17 and release timing by DOC-02/ADR-002.

## Back semantics

Browser Back is sacred. Meaningful navigational layers reflect real history.

Semantic BACK priority:

1. close popover
2. close dismissible overlay
3. exit detail
4. return from subsection where appropriate
5. otherwise no destructive app-specific behavior

Escape is always the least-destructive valid action.

Arcade Back/Escape pauses before leaving an active session. Drawing protects unsaved work.

Focus returns to the opener after a transient overlay closes.

## Keyboard

- arrows — current composite navigation
- Enter — Confirm where applicable
- Escape — Back
- Cmd/Ctrl+K — Command Palette
- `?` — controls/help candidate
- `/` — search candidate where meaningful
- avoid large sets of unmodified single-letter global shortcuts

Tab retains standard browser focus traversal. Composite controls use roving tabindex and arrows.

## Gamepad V1.0

- D-pad — navigate
- A / Cross — confirm
- B / Circle — back
- LB/RB — previous/next major space
- X / Square — secondary action
- Y / Triangle — tertiary action
- Menu/Start — system menu/pause where appropriate

Prompts adapt to current input mode and reliable controller mapping.

## Input mode

Track pointer, keyboard, touch and gamepad. Hints follow the latest meaningful input. Touch generally hides keyboard/controller hints.

First-use coach marks adapt to the active input mode and are remembered locally.

## Command Palette

Alternative global navigation, not another Dock item.

Can search/execute:

- spaces
- projects
- actions
- settings
- CV
- achievements
- Arcade
- Making Of

Examples include Go Home, Open Dex-Sphere, View/download CV EN/ES, Open Achievements, Play game, Contact Alejandro, toggle theme/sound/motion and open Making Of.

Palette availability is release-aware. A pre-release **major space** may appear as `Coming Soon` and navigates to its stable major route; unreleased subroutes/actions (for example a game that has not shipped) are not presented as executable capabilities.

## URLs and localization

Important content gets stable deep links.

Recommended style:

`/es/projects/dex-sphere`

Technical route vocabulary stays English; visible labels are localized.

Language switching preserves destination/context. Theme/sound/transparency/motion changes do not reset navigation.

External links are visually distinguished where appropriate.

All CV entry points call one shared semantic action/implementation.

## Drawing flow

`Social → Sketch Wall → Draw → Drawing Pad`

Browser Back and app Back both protect unsaved work.

## Arcade flow

`Library → Game Detail → Session → Result`

Back during Session pauses first.

## Loading/failure

The shell remains navigable while dynamic content loads. Failure preserves navigation and recovery.

## Selection and history

One active SelectionContext per workspace. Widget focus does not change selection.

Browsing selection does not create history entries. Opening meaningful Detail does.

Home remembers selected project for the current session. A fresh visit starts on the featured project.

Restore relevant scroll/context when navigating back.

Animations are interruptible and retargetable. Rapid key repeat changes selection immediately while backdrop/widgets settle around the final target.

## Accessibility

Use standard semantics where possible, strong focus visibility and skip-to-main. No dead ends/focus traps, including 404 and immersive surfaces.

Browser/system edge gestures win over custom gestures. Touch does not depend on hover.

## Navigation state model

Conceptually:

```ts
NavigationState {
  space
  subsection?
  selectedEntity?
  detail?
  overlay?
  inputMode
}
```

Avoid dozens of unrelated local state flags.

State layers:

- URL — meaningful navigation/deep links
- session — current selections/context
- localStorage — preferences/onboarding/personalization
- DB — persistent server data

Target perceived navigation response: under 100ms.

## Decision registry

- NAV-001 — Six persistent major spaces.
- NAV-002 — Projects remains inside Home.
- NAV-003 — Global navigation uses one Liquid Glass Dock.
- NAV-004 — Dock order never changes dynamically.
- NAV-005 — Major spaces are conceptually horizontal.
- NAV-006 — Content browsing is hierarchical/within-space.
- NAV-007 — Semantic actions are independent of physical input.
- NAV-008 — Same semantic actions support mouse, keyboard, touch and gamepad.
- NAV-009 — Selectors do not loop by default.
- NAV-010 — Selection never automatically opens Detail.
- NAV-011 — Selection browsing does not create browser history entries.
- NAV-012 — Important details receive stable deep links.
- NAV-013 — Browser/app Back remain coherent.
- NAV-014 — Focus restores to opener after temporary overlays.
- NAV-015 — Tab retains standard browser semantics.
- NAV-016 — Arrow keys operate within composite controls.
- NAV-017 — V1.0 gamepad supports navigation/confirm/back/space switching.
- NAV-018 — Touch gestures always have visible alternatives.
- NAV-019 — Rails are reserved for complex subsections.
- NAV-020 — Mobile rails become touch-friendly segment navigation.
- NAV-021 — Prompts reflect the latest meaningful input mode.
- NAV-022 — Command Palette is an alternate global navigation path.
- NAV-023 — Language switching preserves destination/context.
- NAV-024 — System settings do not reset navigation state.
- NAV-025 — Route state and ephemeral UI state remain separate.
- NAV-026 — Major navigation animation is interruptible.
- NAV-027 — Shell remains usable while external data loads.
- NAV-028 — No essential behavior depends on hover, swipe, sound or controller.
- NAV-029 — Core public content retains progressive access.
- NAV-030 — No dead ends or focus traps.
