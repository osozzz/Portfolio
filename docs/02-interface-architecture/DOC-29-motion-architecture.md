---
id: DOC-29
title: "Motion & Transition Architecture"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - MOT
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-29 — Motion & Transition Architecture


## Principle

> Motion explains relationships, confirms actions and reinforces hierarchy. It must never make the interface wait for itself.

Every meaningful animation should primarily serve:

- spatial orientation
- hierarchy
- feedback
- continuity

Pure decoration has a higher bar.

## Motion classes

- **M0 None** — no meaningful transition required.
- **M1 Micro** — immediate physical feedback.
- **M2 Control** — small local state changes.
- **M3 Navigation** — local selection/navigation.
- **M4 Scene** — major workspace/surface transition.
- **M5 Cinematic** — rare identity moments.

Provisional timing families:

- M1 ~80–150 ms
- M2 ~140–240 ms
- M3 ~220–420 ms
- M4 ~350–650 ms
- M5 ~650–1200 ms

These are relative expectations, not final visual tokens.

## Response time vs animation duration

Input/state acknowledgement happens immediately. Visual motion may continue afterward.

Never delay state mutation until an animation finishes.

## Interruptibility

All navigation/selection transitions are interruptible and retargetable.

Rapid input never queues complete animations. If selection moves A→B and immediately to C, transition from current visual state toward C.

## Springs vs easing

Use controlled springs for physical UI movement such as selected-object promotion, Dock selection material and widget expansion.

Use easing for opacity, backdrop crossfades and predictable content reveals.

Springs should feel soft/controlled, not bouncy/cartoonish.

Define semantic tokens such as `ease.enter`, `ease.exit`, `ease.move`, `ease.crossfade` rather than random per-component curves.

Exits are often faster than entries.

## Project selection choreography

Selection coordinates:

- selector
- project summary
- backdrop
- accent
- widgets
- action hints

Conceptual flow:

1. input acknowledged
2. new tile promotes / old tile demotes
3. title/metadata transition
4. backdrop crossfade begins
5. accent migrates
6. widgets retarget
7. secondary assets settle

These steps overlap; they are not a long sequential timeline.

## Selector motion

The selected focus slot remains conceptually stable while content moves through it.

Selected item receives spatial promotion toward the workspace.

Compact carousel uses direct manipulation, controlled momentum/snap and deliberate selection commitment instead of changing the full environment every drag pixel.

## DynamicBackdrop

Crossfade current/next artwork with restrained tint/readability changes. Background motion stays quieter than foreground selection.

If artwork is not ready, apply fallback/accent immediately and fade artwork in later.

No default continuous Ken Burns/drifting background motion.

## Liquid Glass motion

Glass may respond through:

- highlight movement
- subtle deformation
- reflection
- depth
- limited refraction

Goal:

> **optical flexibility, not gelatin.**

### Dock highlight

Signature motion. The internal Liquid Glass selection material may stretch, travel, compress and settle between destinations.

Rapid navigation retargets fluidly instead of completing a bounce at every intermediate item.

### Hover / press

Fine-pointer glass may respond subtly to cursor region. Touch uses press/selection feedback instead of fake hover.

Pressed state can lightly compress surface depth/material.

## Widgets

Widget motion patterns:

- appear/retarget
- focus
- expand/collapse

If the same widget persists across project selections, keep physical shell continuity and transition content/accent.

Widget→Overlay is a signature continuity opportunity.

## Route-backed Detail

Project Detail opens as an expansion of selected context: environment remains, overlay backdrop appears and Detail surface emerges.

Close is a quicker reverse preserving selected project.

Shared-element transitions are optional polish, not an architecture dependency.

## Major-space transitions

Major-space movement is stronger than local project/subsection movement. Workspaces may move laterally while persistent shell stays stable.

Do not force an infinite-carousel interpretation for non-adjacent/direct Dock navigation.

Rails/tabs use quieter M2/M3 transitions.

## Surface motion vocabulary

- Popover — fast anchored reveal, typically M2
- Sheet — controlled edge movement
- Overlay — depth/scale/fade scene motion
- Route Detail — contextual scene expansion
- Utility Workspace — workspace takeover
- Command Palette — fast system reveal

## Drawing

Entering Drawing Pad can use scene motion. Once drawing begins, surrounding motion becomes minimal.

Stroke rendering follows input directly with no artificial easing delay.

Undo/redo should be instant/quiet in V1.0 rather than replaying elaborate stroke animations.

## Arcade

Reduce unrelated system motion during active gameplay.

Library→Detail→Session progressively focuses the experience.

Result can use stronger score/personal-best feedback but remains fast and skippable.

## Achievements

Browsing uses normal M2/M3 behavior. Unlock may use stronger M4/M5 feedback without blocking navigation.

## Boot

Principal cinematic sequence:

- first visit only by default
- target around 1.5–2 seconds
- skippable
- reduced-motion variant
- replayable

Avoid long fake-terminal startup logs.

Returning visitors do not replay Boot automatically.

## Theme and language

Theme change can coordinate material/text/environment transition but must remain short. Never use `transition: all` globally.

Language switch should update/crossfade simply where useful. No character-by-character effect. Natural reflow is acceptable.

## Media / CV / forms

Media previous/next can use directional or crossfade transitions. Zoom/pan are direct manipulation.

CV language change replaces preview/content inside the same surface.

Forms use restrained feedback. Avoid exaggerated shake. Meaningful success can transition to a dedicated SuccessState.

## Scroll

Preserve native scrolling. Programmatic section scrolling may be smooth unless reduced motion is active.

Strongly limit parallax and scroll-linked cinematic timelines in V1.x.

## Idle animation budget

Very little should animate continuously at idle.

Avoid:

- looping gradient motion
- floating cards
- constant particles
- rotating icons
- permanent background zoom/drift

Rule of thumb: one visually dominant motion event at a time.

## Performance

Prefer transform and opacity where possible. Be cautious with width/height/top/left/filter/large blur animation.

Layout animation, FLIP-like transitions and shared layout IDs are acceptable where measured and justified.

Tooling direction:

- CSS — simple/local
- Motion — primary React interaction/layout animation system
- GSAP — only if a documented use case cannot reasonably be handled otherwise

View Transitions API should be evaluated as progressive enhancement.

## Reduced motion

Typical mapping:

- large translation → crossfade/minimal shift
- large scale → minimal/no scale
- parallax → off
- spring overshoot → off
- idle continuous motion → off
- Boot → shorter/simpler
- direct manipulation → remains direct

Durations also become shorter.

Potential setting:

- Automatic
- Full
- Reduced

Exact preference precedence is finalized with accessibility/settings architecture.

## Audio synchronization

Audio responds to semantic state events rather than exact animation timestamps so reduced-motion behavior remains correct.

## Motion ownership

Local components own local movement; global systems own global transitions.

Examples:

- ProjectTile — local scale/depth
- DynamicBackdrop — environment transition
- WidgetField/WidgetRegion — widget replacement/reflow
- RouteDetailSurface — detail scene

Avoid a giant global animation state machine except bounded cinematic flows such as Boot.

## Cancellation / visibility / hydration

Cancellation, unmount, route change, visibility change and reduced-motion changes must always leave valid final state.

Hidden tabs pause nonessential loops/gameplay and do not replay queued motion on return.

Hydration must not cause the whole interface to fly in accidentally.

Direct deep links initialize directly into correct state rather than replaying fake navigation history.

## Signature motion investment

Prioritize polish on:

1. Liquid Glass Dock highlight
2. ProjectTile spatial promotion
3. DynamicBackdrop transition
4. Widget→Overlay morph
5. Achievement Unlock
6. First-visit Boot

## Decision registry

- MOT-001 — Motion primarily communicates space, hierarchy, feedback or continuity.
- MOT-002 — Motion uses semantic classes M0–M5.
- MOT-003 — Input acknowledgement is immediate even when visual motion continues.
- MOT-004 — All navigation/selection motion is interruptible.
- MOT-005 — Rapid input retargets rather than queues transitions.
- MOT-006 — Springs are reserved mainly for physical UI movement.
- MOT-007 — Opacity/content transitions generally use controlled easing.
- MOT-008 — Springs remain controlled/non-cartoonish.
- MOT-009 — Project selection coordinates selector, summary, backdrop, accent and widgets.
- MOT-010 — Selector motion communicates ordered collection movement.
- MOT-011 — Compact project browsing uses direct manipulation + snap.
- MOT-012 — Backdrop transitions never block selection.
- MOT-013 — Continuous backdrop animation is avoided by default.
- MOT-014 — Liquid Glass responds subtly, not as exaggerated liquid.
- MOT-015 — Dock highlight motion is a signature interaction.
- MOT-016 — Widget expansion preserves spatial continuity where practical.
- MOT-017 — Major-space motion is stronger than subsection motion.
- MOT-018 — Surface motion follows DOC-26 taxonomy.
- MOT-019 — Drawing strokes follow input directly without artificial easing.
- MOT-020 — Arcade reduces unrelated system motion during gameplay.
- MOT-021 — Achievement unlock may use stronger motion without blocking navigation.
- MOT-022 — Boot is the principal cinematic sequence and stays short/skippable.
- MOT-023 — Theme/language changes avoid indiscriminate global transitions.
- MOT-024 — Native scrolling is preserved.
- MOT-025 — Scroll-linked cinematic effects are strongly limited.
- MOT-026 — Idle continuous animation is minimized.
- MOT-027 — Only one dominant motion event generally exists at a time.
- MOT-028 — Transform/opacity are preferred where possible.
- MOT-029 — Motion is the primary React animation system unless later evaluation changes this.
- MOT-030 — GSAP requires a specific justified use case.
- MOT-031 — View Transitions API is evaluated as progressive enhancement.
- MOT-032 — Shared-element transitions are optional polish, not dependency.
- MOT-033 — Reduced motion uses shorter/calmer equivalents.
- MOT-034 — Motion may adapt to viewport/input capability.
- MOT-035 — Semantic audio is independent from exact animation timelines.
- MOT-036 — Motion tokens are centralized.
- MOT-037 — Local components own local movement; global systems own global transitions.
- MOT-038 — Cancellation/failure always leaves valid final state.
- MOT-039 — Hydration does not trigger unnecessary entrance animation.
- MOT-040 — Signature motion effort concentrates on Dock, Project, Environment, Widget Expansion, Achievements and Boot.
