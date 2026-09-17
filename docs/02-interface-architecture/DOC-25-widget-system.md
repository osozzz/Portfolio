---
id: DOC-25
title: "Widget System"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - WDG
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-25 — Widget System


## Definition

> A widget is a contextual secondary surface that presents useful information or a small interaction without replacing the current workspace.

Widgets are not generic cards, dashboard filler, project tiles, navigation items or miniature applications.

On Home, widgets form a **central Personal Widget Field**. This field is a primary visual signature of the portfolio: spatial, modular and personalizable while remaining subordinate to the selected Project Hero. It must not collapse into a uniform SaaS-card dashboard.

## Conceptual anatomy

A widget may define:

- identity: type/title/icon
- content: primary value, secondary information, visualization
- state: loading, ready, empty, stale, error
- interaction: focus, primary action, expand
- behavior: context rules, responsive mode, refresh policy

## WidgetShell

Use one reusable `WidgetShell` for:

- Liquid Glass material
- focus treatment
- spacing/padding
- header/title treatment
- loading/error boundaries
- expansion hooks
- accessibility
- responsive constraints

Feature widgets own their actual data presentation.

## Materials

Standard widgets primarily use MAT-2 Liquid Glass. Expanded widgets may transition toward MAT-3. Reading-heavy internals may intentionally use MAT-0/MAT-1.

Selected project accent may enter as subtle reflected tint, not wholesale recoloring.

## Semantic size classes

- **S** — glanceable status
- **M** — standard information
- **L** — richer interactive widget

`S/M/L` are the only Widget Field/personalization sizes. An expanded widget presentation is **not** an `XL` field size; it leaves the field through the approved Inline Expand / Overlay / Route / Utility Surface model in DOC-26.

These are semantic complexity classes, not fixed pixel dimensions.

## Priority

- P0 — critical to current experience
- P1 — very relevant
- P2 — useful enhancement
- P3 — optional delight

Responsive layout removes/recomposes lower-priority content first.

## Widget Field budget

Visible widget modules, excluding the selected Project Hero:

- Compact: max 1 primary visible; additional eligible widgets can be opened from a Widgets surface
- Medium: max 2
- Expanded: max 2–3
- Wide: max 3–4

Maxima, not targets. The field may intentionally leave open space and use asymmetric slot sizes. A useful composition with two widgets is preferable to filling four slots.

## Context resolution

A conceptual `WidgetResolver` receives current space, selected entity, subsection, layout mode and data availability, then returns the eligible prioritized widget set.

Home then applies **Widget Preferences** over that eligible set: pinned/hidden state, logical order and supported preferred size. The resolver remains authoritative about eligibility and safety; preferences never force an irrelevant/unsupported widget into a context.

Widgets never independently decide global selection.

## Expansion

Supported behaviors:

- Inline Expand
- Overlay Expand
- Route Expand

Where practical, an expanded surface visually originates from the widget. Reduced motion uses calmer crossfade.

## Registry

Maintain a central registry with metadata such as:

- supported contexts
- minimum layout
- priority
- default size
- supported persistent sizes
- whether it may be pinned/hidden
- expand capability
- data source
- refresh strategy
- `min_release` / feature gate
- fallback eligibility when a dependent feature is unreleased

## Controlled personalization

V1.0 exposes an explicit **Customize Widget Field** mode with:

- pin/unpin eligible widgets
- logical reorder
- supported semantic size variants (`S/M/L` where a widget opts in)
- local persistence
- reset to default

Customization is intentionally constrained. V1.0 does **not** provide arbitrary pixel positioning, overlapping widgets, free resize handles, freeform windows, third-party/user-authored widgets or scripting.

Reorder may support drag in pointer/touch contexts, but drag is never the only path. Keyboard/gamepad/touch-accessible Move Earlier/Move Later and size controls must exist. Normal browsing mode never reorders widgets accidentally.

## Personal Widget Field architecture

The Home field is a controlled spatial composition rather than a uniform grid. Conceptually:

`HomeWorkspace → PersonalField → ProjectHeroSlot + WidgetField → WidgetSlots`

- `ProjectHeroSlot` is not a widget and remains the primary gravitational object.
- `WidgetField` owns logical slot composition, preferences and responsive mapping.
- `WidgetSlot` renders one eligible widget at a supported semantic size.
- system widgets may keep a stable slot while content retargets across project selection.
- context widgets may enter/leave when eligibility changes.

Visual asymmetry is encouraged through controlled spans/slot patterns, not through unbounded x/y coordinates.

## Preference persistence

Persist only logical intent, for example:

```ts
type WidgetPreferencesV1 = {
  version: 1;
  pinned: string[];
  hidden: string[];
  order: string[];
  sizes: Record<string, 'S' | 'M' | 'L'>;
};
```

Do not persist pixel coordinates, CSS grid line numbers tied to one viewport, or transient context data. The responsive layout engine maps logical preferences into current slots. Preferences remain local in V1.0 and require no visitor account.

Compact may use the highest-ranked/pinned eligible widget as the visible primary widget and expose the remainder in a dedicated Widgets sheet/shelf.

## Initial Home widgets

### Currently Building

Explicitly curated **current-work status/update**. It may reference a canonical project but is not the canonical project lifecycle status. Do not infer completion from Git commit count.

`min_release: V1.0`.

### Project Media

Featured preview plus screenshot/video/architecture counts. No autoplay video.

`min_release: V1.0`.

### Dev Activity

Human-readable normalized GitHub/public development activity.

`min_release: V1.4` because it depends on the live-data/GitHub normalization layer.

### Related Achievement

Connects selected project with relevant achievement/accomplishment.

`min_release: V1.1` because public Achievements ships in V1.1.

The registry is release-aware: unavailable widgets are not empty shells and are never forced by persisted preferences. V1.0 therefore has a useful default field using only V1.0-eligible widgets (for example Currently Building + Project Media, with open space allowed). Visible counts always follow the responsive budget: Compact `1`, Medium up to `2`, Expanded `2–3`, Wide `3–4`.

## Other spaces

Achievements may expose completion/recent unlock widgets. Arcade may use Personal Best / Global Leader / challenge context. Channel may need few/no widgets because it is already information-dense. Contact may use none.

A space does not need widgets just because the system supports them.

## CV

No permanent ResumeWidget is required. CV remains accessible through shell/commands/contact and its route-backed surface.

## Data classifications

- Static — build-time/project content
- Managed — Supabase/admin-controlled
- Cached external — GitHub/news
- Live-ish — scores/recent approved social submissions

Refresh strategy follows data type.

## External data architecture

Preferred flow:

`Widget → our server/data layer → cache/normalization → external provider`

Benefits include credential safety, rate-limit control, normalization, caching, provider replacement and stale fallback.

## GitHub

May expose public commits/releases/repository events. Do not present raw commit volume as a productivity/skill metric. Private activity remains private unless a deliberately safe aggregate is designed later.

## Tech Pulse

Server periodically fetches/normalizes/caches external news. Browser widgets read our normalized source rather than calling multiple providers directly.

## Stale/loading/error/empty

Stale cached data can be preferable to empty failure.

Widgets load independently; Home never waits on GitHub/news/social counts.

Errors remain local. Empty-state policy is widget-specific; some empty widgets should not render.

Refresh scheduling belongs to centralized data logic, not component `setInterval()` calls.

## Interaction

Widgets are Tier-B. Focus is noticeable but subordinate to hero project selection.

Pointer: local hover, click/confirm to activate or expand.  
Keyboard/gamepad: one focus stop by default unless expanded/internal controls require more.  
Compact touch: one near/full-width contextual widget.

## Container-aware rendering

Widgets adapt to allocated container size. Same component can have wide/narrow internal compositions independent from viewport mode.

Do not add a second mobile widget carousel to Home in V1.0 because it conflicts with the project carousel gesture model.

## Wide mode

Wide may expose a third widget in peripheral space but does not simply inflate widget dimensions.

## Admin/content control

`Currently Building` is repository-authored managed status in the approved V1.x baseline. Admin does **not** edit it through runtime database state unless a future source-of-truth migration ADR explicitly moves that authority. Canonical project lifecycle, featured ordering, media metadata and professional facts also remain repository-authored in V1.x. A future Admin/CMS may edit those facts only by writing back to the canonical source or after an approved source-of-truth migration ADR. Do not build a second-source CMS prematurely.

## Security/privacy

- no privileged DB credentials in public widgets
- public Supabase access protected by RLS
- service keys stay server-side
- only approved moderated UGC appears in high-visibility widgets
- never expose raw IP/email/moderation/private analytics data

## Accessibility

Widgets require meaningful names/action labels. Tint/refraction cannot carry essential meaning.

Reduced transparency makes widgets more opaque. Reduced motion simplifies expansion/replacement without changing destination/functionality.

## Lifecycle/performance

Conceptual lifecycle:

`eligible → resolved → mounted → loading → ready/stale/empty/error → unmounted`

Abort/retarget obsolete data work when selection changes quickly.

Rules:

- lazy-load expensive widget code
- defer noncritical APIs
- optimize preview images
- no autoplay video
- no permanent WebGL/canvas loops in tiny widgets
- avoid continuous decorative animation

## Widget implementation contract

Each widget defines:

- purpose
- context eligibility
- priority
- semantic size
- material
- data source
- refresh policy
- loading/empty/stale/error
- primary action
- expansion behavior
- accessible name
- Compact/Medium/Expanded/Wide composition
- personalization eligibility / supported sizes
- logical persistence behavior

## Decision registry

- WDG-001 — Widgets are contextual secondary surfaces, not dashboard cards.
- WDG-002 — Widgets use a common WidgetShell.
- WDG-003 — Standard widgets primarily use MAT-2 Liquid Glass.
- WDG-004 — Widget material may inherit restrained contextual accent.
- WDG-005 — Widget Field complexity uses semantic S/M/L classes; expanded presentation leaves the field through DOC-26 surfaces.
- WDG-006 — Widget relevance uses explicit priority levels.
- WDG-007 — Layout modes enforce maximum visible Widget Field budgets: Compact 1 primary, Medium 2, Expanded 2–3, Wide 3–4.
- WDG-008 — Context determines the eligible widget set.
- WDG-009 — Widget focus never changes global selection.
- WDG-010 — Widgets may expand inline, as overlays, or as route-backed details.
- WDG-011 — Expansion preserves spatial continuity where appropriate.
- WDG-012 — Widget metadata lives in a central registry/resolver.
- WDG-013 — **SUPERSEDED by WDG-031/WDG-032.** Unrestricted freeform widget positioning remains prohibited, but controlled personalization is supported.
- WDG-014 — Compact shows one primary contextual widget and may expose additional eligible widgets through a dedicated Widgets surface.
- WDG-015 — Home priority candidates include Currently Building, Project Media, Dev Activity and Related Achievement only when each widget is eligible for the active release/context; `min_release` gating is authoritative.
- WDG-016 — Widget data is classified by source/freshness needs.
- WDG-017 — External integrations normally pass through our server/data layer.
- WDG-018 — External data supports loading, stale, empty and error states.
- WDG-019 — Widgets never block primary workspace interaction while loading.
- WDG-020 — Widget refresh strategy is centralized rather than component polling.
- WDG-021 — Widget interactions use Tier-B focus/selection intensity.
- WDG-022 — Mobile widgets recompose instead of shrinking desktop cards.
- WDG-023 — Container-aware layouts are preferred for widget adaptation.
- WDG-024 — User-generated widget content only surfaces after moderation where applicable.
- WDG-025 — Privileged/private data is never exposed through public widgets.
- WDG-026 — Reduced transparency/motion preserve functionality.
- WDG-027 — Widget requests should be abortable/retargetable when context changes.
- WDG-028 — Widgets have explicit performance budgets.
- WDG-029 — Continuous decorative animation is discouraged.
- WDG-030 — Widgets must answer a useful contextual question or not exist.

- WDG-031 — Home uses a central Personal Widget Field as a signature spatial structure.
- WDG-032 — V1.0 supports controlled Widget Field personalization: pin/unpin, logical reorder, supported semantic size variants, local persistence and reset.
- WDG-033 — Widget personalization stores logical intent, never viewport-specific pixel coordinates.
- WDG-034 — The selected Project Hero may coexist inside the Personal Field but is not itself a widget.
- WDG-035 — Visual asymmetry is implemented through controlled responsive slots/spans, not arbitrary x/y placement.
- WDG-036 — System widgets and context widgets can coexist; eligibility remains authoritative over user preference.
- WDG-037 — Widget customization has non-drag accessible controls and explicit Customize mode.
- WDG-038 — Widget preferences are local-only in V1.0 and require no visitor account.

- WDG-039 — Widget Field/personalization sizes are S/M/L only; expanded presentation uses DOC-26 surfaces rather than XL field sizing.
- WDG-040 — Widget registration is release-aware through `min_release`/feature gating; persisted preferences cannot instantiate unavailable widgets.
- WDG-041 — Currently Building is a curated current-work update, not the canonical project lifecycle status.
- WDG-042 — Admin does not mutate repository-canonical project facts in V1.x; future canonical editing requires write-back or a source-of-truth migration ADR.
- WDG-043 — `Currently Building` is repository-authored managed status in the approved V1.x baseline; runtime Admin editing requires an explicit future source-of-truth migration ADR.
