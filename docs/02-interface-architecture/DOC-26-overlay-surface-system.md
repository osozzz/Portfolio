---
id: DOC-26
title: "Overlay & Surface System"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - SUR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-26 — Overlay & Surface System


## Philosophy

The interface should feel like one continuous environment. Secondary content normally appears above or grows from the current workspace instead of replacing everything with an unrelated page.

## Surface taxonomy

- **S0 Inline Expansion** — small local disclosure.
- **S1 Popover** — small anchored interaction.
- **S2 Sheet** — edge surface, especially useful on Compact/Medium.
- **S3 Overlay** — rich temporary secondary content.
- **S4 Route-backed Detail** — meaningful deep-linkable/shareable detail with overlay-like desktop presentation.
- **S5 Utility Workspace** — attention-intensive task owning most/all workspace.

Primary Workspace remains the normal screen mode.

## Inline Expansion

Only for modest additional information. If the expansion materially reflows the whole shell, it should probably be an Overlay instead.

## Popovers and tooltips

Tooltip explains. Popover allows interaction.

Popovers:

- stay anchored to the invoking control;
- contain small amounts of content;
- close with Back/Escape;
- remain keyboard accessible;
- may become Sheets on Compact;
- never contain another major overlay.

## Sheets

Best for short Compact tasks such as quick settings, filters, report/share actions. Less common on Expanded unless content naturally behaves like an inspector.

## Major Overlay

Signature iiSU-inspired floating contextual surface. The underlying workspace stays visually recognizable through restrained dim/blur/texture.

Typical uses:

- achievement detail
- project media
- settings
- CV surface
- expanded widgets

Structural shell typically MAT-3; text-heavy regions may intentionally use MAT-0/MAT-1.

## Shared OverlayBackdrop

One reusable `OverlayBackdrop` owns:

- dim
- blur
- texture
- interaction blocking
- reduced-transparency fallback

Avoid stacking multiple full-screen `backdrop-filter` layers.

Underlying project/environment may remain faintly visible to preserve context.

## One-major-overlay rule

Only one major overlay at a time. No major-modal nesting.

When a child experience grows:

- navigate within current overlay;
- replace content/mode inside it;
- or close/replace the current major surface.

A small `SystemDialog` may appear above a major surface for confirmations.

## Route-backed Detail

Use when content needs SEO, direct URL entry, refresh survival, sharing and browser history.

Example:

`/[locale]/projects/dex-sphere`

Expanded/Wide: large contextual surface over Home environment.  
Compact: full-screen detail workspace.

Same route/content, different presentation.

Likely route-backed content:

- Project Detail
- CV
- Making Of
- other meaningful public content as justified

## Utility Workspace

Used for:

- Drawing Pad
- active Arcade gameplay
- full media viewer mode
- possibly interactive architecture explorer

May minimize system chrome, register its own input scope and occupy most of the viewport. Must expose predictable exit/back.

## Drawing Pad

Officially a Utility Workspace, not a generic modal/page/widget.

Flow:

`Social → Sketch Wall → Draw → Drawing Workspace`

Desktop may visually sit inside a large glass shell while behaviorally owning the workspace.

## Arcade

Arcade Library = Primary Workspace.  
Game Detail = Detail.  
Active game = Utility Workspace.  
Result = Utility/Detail state.

## Media

Project Media can start as Overlay/Detail mode. Opening an individual asset transitions the same surface into Viewer mode instead of stacking a second major modal.

## Project Detail

Route-backed. Internal navigation may use Overview / Architecture / Challenges / Media / Making-Lessons as substantive sections.

## CV

Recommended route:

`/[locale]/cv`

Desktop: RenderCV preview/details inside route-backed surface.  
Compact: full-screen CV workspace.

Do not squeeze a desktop PDF frame into a phone.

## Settings

Expanded/Wide: Major Overlay.  
Compact: Sheet/full-height surface as needed.  
No route required initially.

## Command Palette

High-priority global transient surface. It may appear above a detail/overlay. Executing a command closes the palette and performs normal semantic navigation/action.

## SystemDialog

Small deliberate confirmation for important/destructive decisions. Use specific copy instead of vague “Are you sure?”. It is not a container for complex forms.

## Mobile mapping

A surface becomes full-screen on Compact when it requires substantial reading, multi-step interaction, keyboard, canvas or complex internal navigation.

Sheets remain appropriate for short settings/actions/filters/report/share.

## Spatial continuity

Opening/closing should communicate origin where useful:

- widget → expanded overlay
- project tile → project detail
- settings control → settings surface

Reduced motion uses calm crossfade/instant equivalents.

## Focus management

Transient surface open:

- remember invoker
- move focus inside

Close:

- restore focus to invoker/equivalent

Route-backed full-screen details may use page/article semantics instead of `role=dialog` where appropriate. Semantics follow purpose, not appearance.

## Scrolling

Generally one dominant vertical scroll container per major surface. Modal-like surfaces lock background scroll while preserving its position.

Avoid nested-scroll hell.

## Dismissal

Typical major surface supports:

- visible close/back control
- Escape / semantic Back
- browser Back if route-backed

Backdrop-click dismissal is only for low-risk/no-data-loss surfaces. Swipe-to-dismiss is not universal.

## Headers and footers

Reusable concepts:

- `SurfaceHeader` — title/context/status/back-close/actions
- `SurfaceFooter` — only where task semantics justify it

Settings should generally autosave safe preferences instead of requiring a generic Save button.

## Geometry classes

Semantic ideas:

- Narrow — confirmations
- Medium — settings/detail
- Large — project/CV
- Full — drawing/media/gameplay

Exact dimensions belong to visual design.

## Media/canvas/text materials

- Drawing canvas is solid/predictable, not transparent glass.
- Video uses a predictable dark player surface inside glass framing.
- Long case-study reading prioritizes readability over transparency.

## Direct URL entry

Opening a route-backed detail directly must initialize the correct environment/selection without assuming prior Home JavaScript state.

Do not fake-replay the whole navigation history on direct entry.

## URL policy

Create URLs for meaningful content states, not temporary UI microstates.

Good:

- `/projects/dex-sphere`
- `/making-of`
- `/changelog`

Avoid history pollution for Settings, Popovers and other transient UI.

## Layer model

`Environment → Workspace → System Chrome → Widgets → Popover → Major/Route Surface → System Dialog/Command Palette → Toast`

## Performance and accessibility

Centralize expensive full-screen blur. Capability tiers may simplify blur/refraction on constrained devices. Reduced transparency makes surfaces more opaque. Reduced motion shortens/removes spatial transformation while preserving destination and capability.

## Decision registry

- SUR-001 — Secondary interfaces use a defined surface taxonomy.
- SUR-002 — Supported types are Inline, Popover, Sheet, Overlay, Route Detail and Utility Workspace.
- SUR-003 — Surface choice follows task/navigation meaning, not visual preference.
- SUR-004 — Only one major overlay may exist at a time.
- SUR-005 — Major overlay nesting is prohibited.
- SUR-006 — Small confirmation dialogs may appear above major surfaces.
- SUR-007 — Route-backed details provide shareable/deep-linkable content.
- SUR-008 — Route-backed details become full-screen on Compact when appropriate.
- SUR-009 — Drawing Pad and active Arcade games are Utility Workspaces.
- SUR-010 — Project Detail is route-backed.
- SUR-011 — CV is route-backed and generated via RenderCV.
- SUR-012 — Settings remain transient and do not require a route.
- SUR-013 — Command Palette is a high-priority global transient surface.
- SUR-014 — Shared OverlayBackdrop owns global dim/blur/texture behavior.
- SUR-015 — Liquid Glass strength follows task/readability.
- SUR-016 — Content-heavy surfaces may use solid/frosted reading regions.
- SUR-017 — Major surface animations preserve spatial origin where useful.
- SUR-018 — All surface animations remain interruptible.
- SUR-019 — Focus enters/exits transient surfaces predictably.
- SUR-020 — Background scrolling locks for modal-style surfaces.
- SUR-021 — One primary scrolling region should dominate each surface.
- SUR-022 — Backdrop-click dismissal is disabled when data loss is possible.
- SUR-023 — Mobile sheets are for short tasks; complex tasks become full-screen.
- SUR-024 — Route-backed surfaces support Back, Forward, Reload and direct entry.
- SUR-025 — Temporary UI does not create unnecessary browser history.
- SUR-026 — Surface geometry recomposes across Compact/Medium/Expanded/Wide.
- SUR-027 — Reduced motion/transparency preserve all functionality.
- SUR-028 — Full-screen blur layers are centralized for performance.
- SUR-029 — Important surfaces receive explicit accessibility semantics.
- SUR-030 — Every feature chooses a documented surface type before implementation.
