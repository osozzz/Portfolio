---
id: DOC-24
title: "Focus & Selection System"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - FCS
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-24 — Focus & Selection System


## Core states

Distinguish:

- REST
- HOVER
- FOCUS
- SELECTED
- PRESSED
- ACTIVE
- DISABLED
- LOCKED
- SECRET
- NEW
- UPDATED
- LOADING
- SUCCESS
- WARNING
- ERROR

These may combine when semantically valid.

## Definitions

**REST** — available but not currently interacted with.  
**HOVER** — pointer is temporarily inspecting.  
**FOCUS** — current interaction target.  
**SELECTED** — entity controlling workspace context.  
**ACTIVE** — persistent currently engaged mode/space/tool/setting; it answers what mode or system destination is engaged, not whether an asynchronous operation is running.  
**PRESSED** — transient physical activation feedback.  
**SUCCESS** — operation/input has completed successfully and needs semantic confirmation.  
**WARNING** — attention/degraded condition that does not necessarily block operation.  
**LOADING** — unresolved data/work with reserved geometry; operational `aria-busy` may accompany it where appropriate.

The user should be able to answer:

- Focus: *What will my next action affect?*
- Selected: *What am I currently exploring?*
- Active: *Where am I in the system?*

## Combined states

Examples:

- SELECTED + FOCUS
- ACTIVE + FOCUS
- LOCKED + FOCUS
- NEW + SELECTED
- ERROR + FOCUS
- WARNING + SELECTED
- SUCCESS + FOCUS

Model orthogonal properties where needed instead of forcing every component into one mutually exclusive state string.

## Selection dominance

Selected primary content receives physical/contextual promotion through some combination of:

- larger scale
- stronger edge
- foreground positioning
- higher contrast/opacity
- depth
- richer metadata
- environmental influence

Exact values remain visual-design work.

## Spatial Promotion

Selected hero content may move into a privileged spatial region while neighbors recede/compress slightly. Selection should affect the surrounding collection, not only border color.

## Selection Context

```ts
SelectionContext {
  id
  type
  title
  accent
  backdrop
  metadata
  actions
  widgets
}
```

Selection updates context atomically so title, artwork, accent and widgets do not display mismatched states.

## Accent propagation

Projects may define contextual accents. Accents influence edges, highlights, progress, subtle glass reflection and ambient tint. They do not recolor the whole shell.

Project artwork remains the strongest project identity.

## Hover policy

Hover never performs a full SelectionContext/environment swap. It may provide local preview or lightweight tile response.

## Selection policies

Primary browse selectors use `selection follows navigation` for keyboard/gamepad.

Pointer:

`hover != selected`  
`click → selected`

Compact touch carousel:

`centered/swiped item → selected`

Selection never automatically opens Detail.

## Auto-centering and scroll commitment

Primary selectors bring the selected item into the principal focus slot. Touch/carousel selection commits only after a meaningful threshold/nearest-item decision, not every drag pixel.

## Focus tiers

Use tiered focus treatment:

- Tier 1 — small controls
- Tier 2 — navigation/widgets
- Tier 3 — hero/content selections

Potential ingredients include outline, halo, edge highlight, contextual accent and modest scale/depth.

Focus must remain visible on bright/dark artwork and under reduced-transparency/forced-color conditions.

Selected is the strongest **content/context** state. Keyboard/gamepad focus remains the clearest **interaction-target** signal and need not scale larger than selected.

## Liquid Glass response

Glass may become optically clearer/sharper on focus and receive contextual reflection on selection. Pressed state can subtly compress the material.

Never turn the interface into exaggerated goo/jelly.

Reduced-transparency/solid fallbacks use outline, contrast, geometry and shadow. Reduced motion preserves state clarity without large translation/scale.

## Locked vs Secret

**LOCKED** — known but unavailable; may show requirement/progress/description.  
**SECRET** — intentionally obscured; does not leak title, condition or description unless designed to.

Locked content is not automatically disabled and may remain focusable/selectable if the detail is useful.

## New vs Updated

**NEW** — content not yet acknowledged.  
**UPDATED** — existing content changed.

Use subtle dot/badge/label treatment.

## Loading, success, warning and error

Loading preserves geometry. Remote widget/data loading never cancels primary selection. An operation in progress uses loading/busy semantics rather than redefining `ACTIVE`.

Success and warning are semantic feedback conditions that may coexist with interaction states such as Focus/Selected. They are not navigation/location states.

Errors remain local/recoverable. Project selection can stay valid while GitHub/media independently loads or fails.

## Disabled

Reserve Disabled for actions genuinely unavailable due to current system state and explain why where practical.

`DISABLED != LOCKED`

## Domain statuses

Project status is metadata, not interaction state:

- Concept
- Planning
- In Development
- Private Beta
- Live
- Paused
- Archived
- Coming Soon

Coming Soon is an intentional content type, not merely a disabled tile. It can contain controlled hints/progress but never fake details.

## Selection choreography

State updates immediately. Visual systems coordinate afterward:

1. old tile demotes / new tile promotes
2. summary updates
3. environment crossfades
4. accent migrates
5. widgets retarget
6. secondary assets settle

Transitions remain interruptible/retargetable.

## Neighbor visibility

Typical guidance:

- Compact — partial previous/next or arrows
- Medium — one each side
- Expanded/Wide — 1–2 each side

Neighbors remain recognizable, not nearly invisible ghosts.

## Context influence levels

- **I0** — local component only
- **I1** — workspace metadata
- **I2** — workspace + widgets
- **I3** — environment + accent + widgets

Examples:

- Button → I0
- Achievement → I1
- Arcade game → I2/I3
- Project → I3

## Interaction tiers

- **Tier A — Hero** — ProjectTile, major game selection.
- **Tier B — Navigation/Widget** — Dock, widget, achievement, media card.
- **Tier C — Control** — button, toggle, field, menu item.

State intensity follows the tier.

## Focus containment/restoration

Opening an overlay preserves the underlying selection but makes the background interaction-inactive. Closing restores focus to the opener or equivalent element.

Overlays do not reset project selection.

## Selection memory and URL

Session state may remember selected project/category/subsection. Fresh visit starts with the featured project.

Browsing selection does not change URL/history. Opening Detail does.

## Accessibility

Use appropriate semantics:

- `aria-current` for current route where applicable
- `aria-selected` for composites
- `aria-pressed` only for toggle semantics
- intentional locked/secret descriptions

Avoid noisy full-panel `aria-live` announcements on every arrow move.

High-contrast/forced-colors modes must retain visible distinctions without blur/color alone.

## Performance

Focus changes should be cheap. Prefer transform/opacity for local response. Preload only nearby heavy backdrops.

If selected artwork is not ready, apply fallback/accent immediately and crossfade artwork later.

## Decision registry

- FCS-001 — Hover, focus, selected, active and pressed are distinct states.
- FCS-002 — Focus identifies the next interaction target.
- FCS-003 — Selection identifies the entity controlling workspace context.
- FCS-004 — Active identifies the current persistent mode/space.
- FCS-005 — Focus and selection may coexist on different elements.
- FCS-006 — Primary selections use spatial promotion rather than color alone.
- FCS-007 — Selected primary entities may influence backdrop, accent, widgets and actions.
- FCS-008 — Hover never changes the global environment.
- FCS-009 — Keyboard/gamepad navigation in primary selectors updates selection directly.
- FCS-010 — Pointer hover previews; pointer click selects.
- FCS-011 — Touch carousel position determines selected item.
- FCS-012 — Selection never automatically implies opening Detail.
- FCS-013 — Contextual accents remain restrained.
- FCS-014 — Focus uses a common tiered design system.
- FCS-015 — Liquid Glass may respond optically to focus/selection.
- FCS-016 — Glass focus effects have solid/reduced-transparency fallbacks.
- FCS-017 — Locked and Secret are separate states.
- FCS-018 — New and Updated are separate attention states.
- FCS-019 — Loading preserves component geometry.
- FCS-020 — External widget loading never cancels primary selection.
- FCS-021 — Components are assigned Hero, Navigation/Widget or Control interaction tiers.
- FCS-022 — Selected entities have defined environment-influence levels.
- FCS-023 — Global context effects are owned by global systems, not individual tiles.
- FCS-024 — Selection transitions are interruptible.
- FCS-025 — Nearby selector assets may be intelligently prefetched.
- FCS-026 — Responsive recomposition preserves selection.
- FCS-027 — Focus transfers to equivalent controls after responsive recomposition where possible.
- FCS-028 — Gamepad focus must be especially visible.
- FCS-029 — Reduced motion/transparency changes presentation but not meaning.
- FCS-030 — Every component specification lists supported interaction states.
- FCS-031 — Success and Warning are canonical semantic-feedback states that may combine with interaction states.
- FCS-032 — Active means a persistently engaged mode/space/tool/setting; operations in progress use Loading/busy semantics instead.
