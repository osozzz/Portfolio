---
id: DOC-28
title: "Responsive Behavior & Layout Rules"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - RSP
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-28 — Responsive Behavior & Layout Rules


## Principle

> The portfolio is one responsive interactive system, not a desktop interface with a mobile version attached afterward.

Responsive behavior preserves interaction intent, content priority and state. Components recompose before shrinking.

## Semantic modes

- **Compact** — phones / constrained windows; touch-first and one dominant region.
- **Medium** — large phones/tablets/small windows; hybrid composition.
- **Expanded** — canonical laptop/desktop multi-region layout.
- **Wide** — large/ultrawide; additional ambience/context without stretched reading lines.

These are layout capabilities, not device categories.

## Breakpoints

Exact CSS breakpoint values remain implementation details. Design documents use semantic modes rather than framework names as architecture language.

## Container responsiveness

Two layers:

`Viewport Mode → system composition`  
`Container Size → component composition`

Use container queries for widgets, media, shelves and panels where allocated space matters more than viewport width.

## Shell compositions

### Compact

- simplified top chrome
- one dominant content region
- horizontal Project carousel
- one visible priority widget from the logical Widget Field
- additional eligible widgets through a Widgets sheet/shelf
- bottom safe-area Dock
- no permanent vertical rail

### Medium

- selector + project hero combined as space permits
- Personal Widget Field maps to up to two controlled slots below/alongside
- orientation-aware flexibility

### Expanded

- identity/status top-left
- controls top-right
- selector left
- central Personal Field with Project Hero + 2–3 widget slots
- optional peripheral context only when useful
- Dock bottom-center

### Wide

- bounded system content area
- central Personal Field can expose 3–4 widget modules around/alongside the Project Hero
- more ambience/media/context without uniform dashboard fill
- no excessive line length or unrelated regions

## State preservation

Viewport/orientation changes never reset:

- current major space
- selected project/entity
- active detail/overlay
- detail section
- form values
- drawing
- Arcade session where feasible
- language/theme/preferences
- logical Widget Field preferences (pin/order/supported size)

Only presentation changes.

## DOM philosophy

Prefer shared semantic content recomposed through CSS/layout. Avoid duplicate mobile/desktop trees unless interaction structure genuinely requires it.

## Project selector

### Expanded

Vertical iiSU-style selector with spatial promotion and visible neighbors.

### Medium

Fewer neighbors; metadata moves closer/below selected object.

### Compact

Centered horizontal carousel with swipe plus visible/tappable alternatives. Same semantic previous/next actions as desktop.

Typical neighbors:

- Compact — partial previous/next or arrows
- Medium — one each side
- Expanded — 1–2 each side
- Wide — up to 2 each side where useful

## Project summary

Expanded may show title, pitch, status, stack and primary/secondary actions. Compact prioritizes title, pitch, top technologies, status and Explore; secondary metadata moves to Detail.

## DynamicBackdrop art direction

Backdrop data supports focal point and optionally distinct sources/crops for major aspect-ratio differences. Do not blindly center-crop desktop artwork on phone.

Compact may use stronger readability wash, more blur or lower artwork contrast because foreground overlap is greater.

## Liquid Glass responsiveness

Compact may use:

- slightly higher opacity
- less heavy blur/refraction
- fewer simultaneous glass layers

Wide/high-capability contexts may expose richer optics, but capability is independent from viewport size.

Quality tiers:

- FULL
- STANDARD
- REDUCED
- SOLID

Signals may include explicit preference, accessibility settings, browser support and measured performance.

## Global Dock

Compact keeps six direct destinations where practical and respects safe-area bottom inset. The Dock does not horizontally scroll and does not use a More menu in V1.x.

If top-level spaces exceed the six-item model, revisit IA instead of silently overflowing the Dock.

## Top chrome

Compact may permanently show only minimal identity + compact controls. Theme/Sound/Transparency/Motion/Language can move into Settings. Clock may disappear.

Expanded can expose richer system feel and local-time clock.

## Personal Widget Field

Visible widget modules (excluding the Project Hero):

- Compact: 1 primary visible; additional eligible widgets through a Widgets sheet/shelf
- Medium: up to 2
- Expanded: 2–3
- Wide: 3–4

The field does not persist viewport-specific geometry. It persists logical pin/order/size preferences and maps them into current slots. A Wide arrangement therefore does not need an identical Compact geometry.

Visual asymmetry may change by mode while semantic order remains stable. No second always-visible widget carousel inside Compact Home in V1.x.

Customization mode must remain usable at every mode: Compact may use a list/sheet with Move Earlier/Move Later and size controls instead of spatial drag.

## Achievements

Expanded uses readable trophy grid + progress/detail. Compact adapts columns by container and moves detail into a secondary surface instead of tiny side-by-side presentation.

## Arcade

Arcade Library reflows like other selectors. Each game gets an explicit responsive gameplay spec.

### Reflex Deploy

Large interaction target and broadly aspect-ratio tolerant.

### Glitch Runner

Use a controlled logical game world/aspect strategy with letterbox/ambient fill rather than stretching physics with viewport.

Touch controls appear only when needed.

No orientation lock. Landscape may be recommended but portrait remains functional.

## Landscape phones

Treat as a first-class state, especially for Drawing, Arcade, Media and Architecture Viewer. Landscape may approximate Medium composition.

## Drawing Pad

Compact portrait:

- canvas dominates
- tools/palette/actions near bottom

Expanded:

- vertical tool rail
- large central canvas
- secondary palette/actions

Drawing data must survive resize/orientation. Use logical coordinate/model representation independent from current bitmap and account for high-DPI rendering.

## Project Detail

Compact: full-screen reading workspace.  
Medium: near-full overlay.  
Expanded/Wide: large floating route detail with constrained reading width.

Internal tabs/segments may become horizontally scrollable compact navigation where needed.

## Media

Compact grids become 1–2 columns as container permits. Viewer becomes full-screen. Architecture media supports fit/zoom/pan/reset without forcing page-level horizontal scroll.

## CV

Compact prioritizes language/preview/download actions and opens an appropriate full-screen preview. Never squeeze a desktop PDF.

Expanded may show preview and controls side-by-side. Generated page images can be considered if PDF embedding is inconsistent.

## Contact

Compact stacks profile + form and accounts for the software keyboard. Focused field, validation and Send remain reachable.

Expanded can use identity/availability alongside the form.

## Social

Expanded: left rail + active workspace.  
Compact: segmented/top navigation.

Guestbook composer may open as sheet/full form. Sketch Wall adapts grid columns; sketch detail opens a viewer/surface.

## Channel

Expanded may coordinate multiple information regions. Compact presents one primary feed at a time through segmented navigation.

## Settings and Command Palette

Settings: Compact sheet/full-height; Expanded overlay.  
Command Palette: desktop centered/keyboard-first; Compact full-width search/action sheet.

## Toasts

Compact toasts avoid Dock/safe-area collision. Achievement Toast may be larger/longer than trivial notifications.

## Safe areas and viewport units

Respect:

- `env(safe-area-inset-*)`
- dynamic viewport units (`dvh/svh/lvh`) where appropriate
- software keyboard changes

Do not use blind `height: 100vh` for every full-screen workspace.

## Text/browser zoom

Test at 100/125/150/200%. Avoid unnecessary fixed heights around text. Do not disable text scaling to preserve screenshot-perfect layouts.

High zoom may naturally trigger smaller layout modes.

## Pointer capability

Touch targets remain comfortable. Fine/coarse pointer capability may influence hit areas independently from viewport size.

Use hover capability media queries so touch devices do not get sticky hover behavior.

## Foldables / ultrawide / short windows

No bespoke foldable UX in V1.0, but avoid fixed aspect assumptions and leave room for future hinge-aware support.

Ultrawide uses bounded central system width plus ambient backdrop.

Short viewports show fewer selector neighbors/reduce spacing rather than overflow important controls.

## Images, video and data usage

Use responsive image sizes, intrinsic dimensions, modern formats and correct loading priority.

Avoid transferring unnecessary desktop-resolution backdrops to mobile.

No autoplay project video backgrounds. Use poster and user-initiated playback.

Consider Save-Data/constrained network behavior later: smaller assets, reduced preloading, no optional video previews.

## Responsive motion

Compact generally uses shorter travel distance, fewer simultaneous layers and less optical distortion. Semantic transition remains the same.

Touch prioritizes direct manipulation; pointer-only reflective hover effects do not need fake touch equivalents.

## Accessibility/source order

Visual reordering must not produce nonsensical focus/screen-reader order. Preserve logical source order and landmarks. Where structure truly changes, design it intentionally rather than relying on extreme CSS ordering.

## Admin

Admin is responsive too but prioritizes density/clarity. Dense tables may become stacked record layouts/sheets on Compact.

## Performance as responsiveness

A screen is not “responsive” if it fits but runs at 15fps. Evaluate render cost, glass complexity, assets, memory, input latency and animation cost.

Degrade decorative optics before focus, functionality or content.

## Test categories

Representative QA:

- small phone portrait
- modern phone portrait
- phone landscape
- tablet portrait/landscape
- small laptop
- desktop
- ultrawide
- narrow desktop window
- short desktop window
- high zoom/text scaling

## Decision registry

- RSP-001 — Responsive behavior is architecture, not post-build CSS cleanup.
- RSP-002 — Semantic modes are Compact, Medium, Expanded and Wide.
- RSP-003 — Exact breakpoint values remain implementation details.
- RSP-004 — Container queries are preferred when allocated space matters.
- RSP-005 — Components recompose before shrinking.
- RSP-006 — Responsive changes preserve application/selection/form state.
- RSP-007 — Project selection transforms from vertical Expanded selector to Compact carousel.
- RSP-008 — Dynamic backdrops support responsive art direction/focal positioning.
- RSP-009 — Liquid Glass may reduce optical complexity in constrained contexts.
- RSP-010 — Performance capability is independent from viewport mode.
- RSP-011 — Six-item global Dock remains directly accessible on Compact.
- RSP-012 — Compact system chrome hides lower-priority permanent controls intentionally.
- RSP-013 — Compact Home exposes one primary contextual widget while additional eligible widgets remain reachable through a Widgets surface.
- RSP-014 — Achievement grids adapt by container and move detail to secondary surfaces on Compact.
- RSP-015 — Arcade gameplay has explicit portrait and landscape strategies.
- RSP-016 — No public experience requires orientation lock.
- RSP-017 — Drawing uses resolution-independent logical data so resize/orientation does not destroy content.
- RSP-018 — Project Detail is full-screen on Compact and floating route detail on larger layouts.
- RSP-019 — Compact CV prioritizes actions instead of squeezing a desktop PDF.
- RSP-020 — Social rails become Compact segmented navigation.
- RSP-021 — Channel uses one primary feed at a time on Compact.
- RSP-022 — Major surfaces transform according to DOC-26 mapping.
- RSP-023 — Mobile safe areas are respected.
- RSP-024 — Modern dynamic viewport behavior replaces blind 100vh.
- RSP-025 — Virtual-keyboard behavior is explicitly tested for text-entry experiences.
- RSP-026 — Browser/text zoom must not break functionality.
- RSP-027 — Coarse/fine pointer capability may influence sizing independently from viewport.
- RSP-028 — Wide layouts increase ambience/context rather than stretching reading content.
- RSP-029 — Height/aspect ratio may influence composition.
- RSP-030 — Core capabilities are never desktop-only or gesture-only.
- RSP-031 — Responsive accessibility/source order remains logical.
- RSP-032 — Expensive effects degrade before functionality/focus.
- RSP-033 — Responsive assets avoid unnecessary desktop-resolution transfer to mobile.
- RSP-034 — Server rendering does not depend on fragile user-agent device branching.
- RSP-035 — Every major component receives an explicit responsive contract.

- RSP-036 — Expanded/Wide Home use a central Personal Field rather than a fixed right-hand widget sidebar.
- RSP-037 — Widget personalization persists logical intent and is remapped per responsive mode; pixel coordinates are never portable state.
- RSP-038 — Widget customization remains accessible without spatial drag and recomposes to list/sheet controls on Compact when needed.
