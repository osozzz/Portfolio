---
id: DOC-38
title: "Geometry, Spacing & Layout Tokens"
document_status: APPROVED
canonical_format: markdown
phase: "Visual Design Foundation"
folder: 03-visual-design
depends_on:
  - DOC-20
  - DOC-21
  - DOC-25
  - DOC-27
  - DOC-28
  - DOC-33
  - DOC-34
  - DOC-35
decision_families:
  - GEO
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-38 — Geometry, Spacing & Layout Tokens

> **Purpose:** Define the geometric language, spacing scale, responsive layout tokens, Personal Widget Field grid, control sizing and composition constraints that translate the approved interface architecture into a consistent, implementation-ready spatial system.

---

## 1. Geometry thesis

The portfolio must feel spatial and personal without becoming an arbitrary desktop.

> **Geometry creates the system; asymmetry creates the personality.**

The implementation therefore uses a deterministic grid, semantic size classes and bounded containers underneath a composition that may appear visually loose, layered and asymmetric.

The layout must never collapse into a generic SaaS dashboard or a set of uniformly sized bento cards.

---

## 2. Core spatial principles

1. **Recompose before shrink.** Compact is not a scaled-down Expanded layout.
2. **Selected work owns the most visual mass.** Widgets support it; they do not compete with it.
3. **The Personal Widget Field is a primary spatial signature.** It is central to Expanded/Wide Home.
4. **Visual asymmetry sits on a controlled grid.** No arbitrary pixel placement in V1.x.
5. **Reading surfaces are bounded.** Wide screens add atmosphere, not unreadably long lines.
6. **Interaction targets remain comfortable regardless of visual compactness.**
7. **Spacing communicates hierarchy.** Related items sit closer than unrelated systems.
8. **Safe areas and dynamic viewport units are first-class layout inputs.**
9. **Height and aspect ratio matter in addition to width.**
10. **Geometry tokens are semantic.** Feature components do not invent one-off gaps and radii.

---

## 3. Base spatial unit

The system uses a **4 px base unit** for fine alignment.

This does not mean every distance must be a multiple of four at runtime; optical alignment may occasionally require a one- or two-pixel correction. Those corrections belong inside design-system primitives rather than feature components.

Primary spacing values use a restrained progression:

| Token | px | Typical use |
|---|---:|---|
| `space-0` | 0 | No separation |
| `space-0_5` | 2 | Optical/internal micro adjustment |
| `space-1` | 4 | Icon/internal micro gap |
| `space-2` | 8 | Tight control grouping |
| `space-3` | 12 | Compact internal padding |
| `space-4` | 16 | Default small gap / compact gutter |
| `space-5` | 20 | Comfortable control padding |
| `space-6` | 24 | Standard component separation |
| `space-8` | 32 | Section/component gap |
| `space-10` | 40 | Large composition gap |
| `space-12` | 48 | Major group separation |
| `space-16` | 64 | Scene-level separation |
| `space-20` | 80 | Large environmental breathing room |
| `space-24` | 96 | Wide/hero separation |

Values larger than `space-24` should normally be expressed through layout/container logic rather than adding arbitrary spacing tokens.

---

## 4. Spacing roles

Raw spacing values should be consumed through semantic roles where practical:

```text
--gap-control
--gap-cluster
--gap-widget
--gap-section
--gap-scene
--padding-control-x
--padding-control-y
--padding-panel
--gutter-shell
--gutter-reading
```

The same semantic role may map to a different raw token by responsive mode.

Example:

```text
Compact  --gutter-shell → space-4
Medium   --gutter-shell → space-6
Expanded --gutter-shell → space-8 / space-10
Wide     --gutter-shell → space-12 / space-16
```

---

## 5. Radius hierarchy

The portfolio uses a small radius family rather than applying a huge rounded rectangle to everything.

| Token | Baseline | Role |
|---|---:|---|
| `radius-xs` | 6 px | Tiny chips, technical markers |
| `radius-sm` | 10 px | Inputs, compact controls |
| `radius-md` | 14 px | Buttons, small surfaces |
| `radius-lg` | 20 px | Widgets, cards, sheets |
| `radius-xl` | 28 px | Major glass surfaces, Dock shell |
| `radius-2xl` | 36 px | Rare hero/major-overlay geometry |
| `radius-pill` | 999 px | Capsules, selected Dock material, status pills |

The visual design should normally use **two adjacent radius levels** within one component hierarchy rather than many unrelated values.

Example:

```text
WidgetShell        radius-lg
Widget inner media radius-md
Widget chip        radius-pill
```

---

## 6. Radius rules

- Large radius does not imply importance by itself.
- Reading panels should generally use `radius-md` or `radius-lg`, not `radius-2xl`.
- `radius-2xl` is rare and reserved for major spatial objects.
- Inputs must not look like unrelated pills unless their function is genuinely capsule-like.
- The Dock may use pill/continuous-surface geometry because it behaves as one continuous control object.
- Project artwork can use stronger radius than dense technical diagrams, which benefit from cleaner rectangular framing.

---

## 7. Responsive layout modes

The approved semantic modes remain:

```text
Compact
Medium
Expanded
Wide
```

For implementation, the initial viewport-width mapping is:

| Mode | Initial baseline |
|---|---|
| Compact | `< 640px` |
| Medium | `640–1023px` |
| Expanded | `1024–1599px` |
| Wide | `>= 1600px` |

These are **implementation baselines, not product identities**. They may be tuned during prototype QA without an ADR if the semantic behavior of each mode remains unchanged.

Container queries remain authoritative for components that respond to allocated space rather than viewport width.

---

## 8. Height-constrained modifier

Width mode alone is insufficient.

A layout enters a height-constrained treatment when vertical space cannot comfortably support the normal composition. The exact threshold is implementation-tuned, but typical triggers include:

- laptop windows with browser chrome/DevTools;
- landscape phones;
- split-screen windows;
- virtual keyboard presence;
- embedded or short browser windows.

Height-constrained behavior may:

- reduce selector neighbor count;
- reduce scene gaps;
- compact top chrome;
- move secondary widgets below the fold/into a shelf;
- minimize Dock labels;
- preserve primary controls and content first.

It may **not** remove capability.

---

## 9. Shell width model

The shell uses nested max-width concepts rather than one global `max-width`.

| Token | Baseline | Purpose |
|---|---:|---|
| `measure-reading` | 68ch | Long-form prose |
| `width-reading` | 760 px | Reading plane / case-study text |
| `width-detail` | 1120 px | Project detail structured content |
| `width-workspace` | 1440 px | Primary multi-region application workspace |
| `width-shell` | 1680 px | Main bounded system shell |
| `width-environment` | none | Dynamic backdrop / ambience can fill viewport |

Wide displays keep the functional shell bounded while allowing environment/artwork to use remaining space.

---

## 10. Shell gutters

Initial baseline:

```text
Compact   16 px, may rise to 20 px on comfortable phones
Medium    24 px
Expanded  32–40 px
Wide      48–64 px
```

Use `clamp()` where appropriate rather than abrupt jumps.

The shell must also add:

```text
safe-area-inset-left
safe-area-inset-right
safe-area-inset-top
safe-area-inset-bottom
```

where relevant.

---

## 11. Vertical scene spacing

Major vertical relationships use a looser rhythm than local component spacing.

Typical roles:

```text
Top chrome → workspace      24–40 px
Workspace internal groups   16–32 px
Workspace → Dock clearance  24–48 px + safe area
Detail section separation   48–80 px
Long-form subsection gap    24–40 px
```

Exact values may adapt to mode and content density.

---

## 12. Personal Widget Field grid

The Personal Widget Field must appear flexible while remaining deterministic.

Initial logical grid:

| Mode | Columns | Widget-field behavior |
|---|---:|---|
| Compact | 4 | One primary visible widget; no multi-widget field |
| Medium | 8 | Up to two coordinated widgets |
| Expanded | 12 | Full field; 2–3 widgets + selected work |
| Wide | 12 | Full field; 3–4 widgets + selected work + more breathing room |

Expanded/Wide use the same conceptual 12-column grammar so preferences can survive between them without storing pixel coordinates.

---

## 13. Widget Field tracks

The implementation may use CSS Grid with implicit rows.

Initial track guidance:

```text
column gap: 16–24 px
row gap:    16–24 px
implicit row unit: ~72–96 px depending on mode
```

The row unit exists to create predictable S/M/L footprints. It is not exposed to users.

Widgets should not all snap to identical rectangles; different valid spans create controlled asymmetry.

---

## 14. Widget semantic sizes

Widgets declare supported semantic sizes, not arbitrary width/height.

### S — glanceable

Typical content:

```text
status
small achievement
availability
single metric
```

Expanded/Wide starting footprint:

```text
3–4 columns
~2 logical rows
```

### M — standard

Typical content:

```text
Currently Building
Dev Activity
compact media
related achievement
```

Starting footprint:

```text
4–6 columns
~2–3 logical rows
```

### L — rich contextual

Typical content:

```text
Project Media
architecture snapshot
larger activity/media composition
```

Starting footprint:

```text
6–8 columns
~3–4 logical rows
```

A widget may support only a subset of `S | M | L`.

---

## 15. Widget size ownership

A user can select only sizes explicitly supported by that widget.

Example:

```text
AvailabilityWidget      S
RelatedAchievement      S | M
CurrentlyBuilding       M | L
ProjectMedia            M | L
```

The layout engine chooses the actual responsive footprint.

User preferences store:

```text
widget id
visibility/pinned intent
order
preferred semantic size
```

They do **not** store `x`, `y`, pixel width or pixel height.

---

## 16. Project Hero inside the field

The selected project is not a widget, but may occupy the same geometric field.

Expanded/Wide default guidance:

```text
Project Hero
≈ 6–8 columns
≈ 4–5 logical rows
```

Its exact footprint depends on artwork aspect ratio and neighboring widgets.

Rules:

- Project Hero owns the largest uninterrupted visual mass.
- No individual widget should visually exceed it on Home.
- Widgets may flank, precede or partially align around it.
- Hero geometry may shift with project media but must preserve overall shell stability.
- The field should feel arranged, not tiled.

---

## 17. Default Expanded composition

Conceptually:

```text
┌──────────────────────────────────────────────────────────┐
│ Selector      [ Currently Building ] [ Related / Status ]│
│                                                          │
│ Selector      [        SELECTED PROJECT HERO          ]  │
│               [                                       ]  │
│               [                                       ]  │
│                                                          │
│               [ Dev Activity ] [ Project Media        ]  │
└──────────────────────────────────────────────────────────┘
```

This diagram expresses hierarchy, not a fixed template.

The resolver may select a different approved composition according to content and user preferences.

---

## 18. Default Wide composition

Wide adds breathing room rather than maximizing density.

It may support:

```text
3–4 widgets
larger artwork crop
more environmental space
more generous gaps
```

It should **not** automatically add more information simply because space exists.

The functional content remains bounded by `width-shell`.

---

## 19. Medium composition

Medium is a deliberate hybrid.

Preferred patterns:

```text
Selector + Hero
Widgets below
```

or:

```text
Hero
Widget + Widget
```

depending on available width and height.

Widgets lose spatial privilege before the selected project does.

The full 12-column Expanded composition is not compressed into Medium.

---

## 20. Compact composition

Compact prioritizes:

```text
System Chrome
Project Carousel
Selected Project Summary
Primary Widget
Global Dock
```

The Personal Widget Field is represented by one prioritized widget in the main flow.

Additional available widgets live behind an explicit **Widgets** Sheet/Shelf.

The user's pinned/order/size preferences remain stored and reappear when a larger mode becomes available.

---

## 21. Project selector geometry — Expanded/Wide

The iiSU-inspired selector is a spatial list, not a sidebar menu.

Guidance:

```text
selector zone: ~240–360 px
selected item: strongest width/depth footprint
neighbors: 1–2 meaningful items visible above/below
```

The selector may visually overlap the workspace field and should not require a hard vertical divider.

Selected promotion must not cause the rest of the shell to jump unpredictably.

---

## 22. Project selector geometry — Compact

Compact uses a centered horizontal carousel.

Guidance:

```text
selected card width: ~72–82vw
hard max: ~340 px
adjacent cards: partially visible
carousel side padding: shell gutter + visual peek allowance
```

The center slot establishes selection.

Swipe, buttons and keyboard semantic actions all resolve to the same geometry.

---

## 23. Project Summary geometry

The Compact summary should prioritize:

```text
Title
Pitch
Top technologies
Status
Primary action
```

It should normally fit without requiring a horizontally scrolling metadata row.

Expanded summary may sit adjacent to or overlap visually with the project artwork, but long copy belongs in Project Detail.

---

## 24. Global Dock geometry

The Dock is one continuous Liquid Glass object.

Baseline geometry:

### Compact

```text
minimum DockItem hit area: 48 × 48 px
icon: 22–24 px optical size
Dock visual height: ~56–64 px + safe-area bottom
six destinations always visible
labels normally hidden except when useful/accessible
```

### Expanded/Wide

```text
DockItem hit area: ~52–56 px minimum
icon: 22–26 px
Dock shell height: ~64–72 px
internal horizontal padding: 8–16 px
```

The active/focus material moves within this stable shell.

---

## 25. Dock constraints

### Narrow-width feasibility gate

The six destinations remain visible, but implementation must prototype the Dock under **separate** stress cases before token freeze: (1) 320 CSS-px viewport at normal page zoom; (2) 200% browser page zoom on a documented baseline viewport; (3) 200% text scaling where the platform exposes independent text scaling; and (4) compact short landscape. Six preferred `48×48` targets consume 288 px before gaps/padding/safe areas; constrained layouts may use the already-approved **44×44 CSS px minimum** and tighter internal spacing while preserving all six direct destinations. Overflow, clipped labels, hidden destinations or horizontal scrolling are not acceptable default outcomes.


- No horizontal scrolling in V1.x.
- No `More` destination in V1.x.
- The six-space IA is a hard geometry constraint.
- Safe-area padding is additive, not a replacement for minimum control size.
- The Dock may minimize during Drawing/active Arcade/full media but must preserve a predictable Back/Exit mechanism.

---

## 26. Top system chrome

Baseline control height:

```text
Compact:   44–48 px interaction target
Expanded:  44–48 px interaction target
```

Visual chrome may appear lighter/smaller than its hit area.

Expanded top composition may include:

```text
Identity / Status           Language Theme Sound Time Settings
```

Compact reduces visible controls and moves secondary settings into Settings.

---

## 27. Minimum interaction target

Baseline requirement:

> **44 × 44 CSS px minimum; 48 × 48 preferred for primary touch controls.**

Small visual icons may sit inside larger invisible/transparent hit areas.

Exceptions require an accessible adjacent control or browser-native interaction and must be reviewed.

---

## 28. Control heights

Baseline:

| Component | Height guidance |
|---|---:|
| Compact icon control | 44–48 px |
| Standard button | 44–48 px |
| Primary touch button | 48–52 px |
| Text input | 48–52 px |
| Segmented control item | 40–48 px visual, >=44 px target |
| Small chip/tag | 28–34 px visual; not primary action |

Tags are labels first; if they become interactive filters their target must meet interaction sizing rules.

---

## 29. Form geometry

Forms should feel calm and conventional.

Baseline:

```text
input min height: 48 px
textarea min height: ~144 px
field vertical gap: 16–20 px
label → control gap: 8 px
control → help/error gap: 6–8 px
form group gap: 24–32 px
```

Contact and Admin may use different density presets but share primitives.

---

## 30. Density presets

Three semantic density levels are allowed:

```text
Relaxed
Default
Dense
```

Typical mapping:

```text
Home / Contact        Relaxed
Project Detail        Default
Channel / Social      Default
Admin / moderation    Dense
```

Dense does not reduce touch targets below accessibility minimums; it primarily reduces surrounding gaps and secondary padding.

---

## 31. Reading geometry

Long-form case-study content targets approximately:

```text
55–75 characters per line
preferred center near 65–70ch
```

Body text does not stretch with the entire overlay.

Wide Project Detail may use:

```text
main reading column
+
secondary metadata/architecture rail
```

without widening the prose itself.

---

## 32. Project Detail geometry

### Expanded/Wide

Route-backed detail may appear as a large spatial surface with:

```text
outer shell: up to width-detail / context-dependent wider media region
reading plane: width-reading
media/architecture: may break wider
sticky/context metadata: optional when useful
```

### Compact

It becomes a full-screen route workspace using normal shell gutters and one dominant vertical scroll container.

---

## 33. Surface sizing classes

Instead of arbitrary modal widths:

```text
surface-narrow   ~ 420–520 px
surface-medium   ~ 640–760 px
surface-wide     ~ 960–1120 px
surface-hero     context/layout-bound
surface-full     viewport/safe-area bound
```

These values are baseline ranges. Surface type from DOC-26 determines which classes are valid.

---

## 34. Popover and sheet geometry

Popover:

```text
min useful width: ~220 px
max typical width: ~360 px
```

Sheet:

```text
Compact: full-width minus safe gutter, bottom anchored
Medium: may be side/bottom depending context
Expanded: use sheet only when behavior genuinely benefits from edge attachment
```

Complex reading/content should become Overlay/Route Detail rather than an oversized popover.

---

## 35. Media geometry

Default media ratios:

```text
Project hero artwork: 16:10 preferred, adaptable
Standard video/media: 16:9
Architecture diagrams: intrinsic / fit-to-content
Achievement badge: 1:1
Avatar/profile: 1:1
```

Artwork metadata may define focal points so crops preserve important content.

Do not force diagrams or screenshots into a fashionable ratio that damages legibility.

---

## 36. Media grids

Expanded media gallery:

```text
2–3 columns depending container
```

Compact:

```text
1 column by default
2 only for naturally thumbnail-like media and sufficient width
```

The media viewer itself is full utility mode when opened.

---

## 37. Achievement grid

The achievement grid should feel collectible without becoming a dense icon matrix.

Baseline:

```text
Compact: 2 columns, possibly 3 on comfortable widths if labels remain legible
Medium: 3–4
Expanded: 4–6 depending container
Wide: capped by useful badge size; do not endlessly add columns
```

Locked/secret states preserve tile geometry to prevent layout shifts.

---

## 38. Social / Sketch Wall grid

Sketch Wall:

```text
Compact: 1–2 columns
Medium: 2–3
Expanded/Wide: 3–5 based on card/media ratio
```

Avoid masonry in V1.0 unless drawings have strongly variable aspect ratios and accessibility/reading order remains deterministic.

Source order must remain logical even if visual placement is asymmetric.

---

## 39. Drawing Workspace geometry

Expanded:

```text
left tool rail
center canvas
bottom/adjacent palette/actions
```

Compact portrait:

```text
canvas dominates
bottom tool dock
palette/action sheets as needed
```

The logical drawing coordinate system remains independent from rendered CSS size.

Orientation/resize must not clear content.

---

## 40. Arcade geometry

Games use a bounded logical arena.

The game world must not stretch physics to fill arbitrary viewport dimensions.

Use:

```text
logical game aspect
responsive camera/viewport
ambient/letterbox space when needed
```

Touch controls sit outside critical game content where practical and respect safe areas.

---

## 41. Grid versus free placement

V1.0 explicitly rejects:

```text
absolute-positioned user widgets
pixel coordinates in preferences
free resize handles
widget overlap
infinite canvas desktop
window stacking
```

The visual result may look loose, but the underlying model stays deterministic and responsive.

---

## 42. Widget customization geometry

When customization mode is active:

- Field Grid becomes more visible.
- Valid drop/placement regions are indicated.
- Widgets show supported size controls.
- Reordering has keyboard-accessible equivalents.
- Invalid placement never results in overlap.
- The resolver may reflow nearby widgets to satisfy constraints.
- Save is immediate/local unless later UX chooses explicit Done/Cancel.

The user customizes **priority and arrangement**, not raw CSS geometry.

---

## 43. Field Grid visual role

DOC-35 introduced `Field Grid` as a graphic motif.

Geometry contract:

- The real layout grid exists at all times.
- In normal mode it is mostly invisible.
- In Customize mode it may surface as subtle alignment guides/slot hints.
- It must not resemble a permanent spreadsheet grid.
- Its graphic rhythm should correspond to actual layout logic rather than decorative fake lines.

---

## 44. Alignment rules

Primary alignments should derive from a small number of anchors:

```text
shell edges
selector focus axis
Widget Field columns
Project Hero edges
reading plane
Dock center axis
```

Small components align to their local container, not to unrelated distant objects.

Intentional overlap is allowed only when hierarchy remains clear and interaction hit areas do not conflict.

---

## 45. Optical alignment

Icons and circular glyphs often require visual rather than mathematical centering.

Optical correction belongs inside:

```text
Icon
DockItem
Badge
Avatar
```

not scattered as feature-level `translateX(1px)` hacks.

---

## 46. Borders and separators

Exact color/effect lives in DOC-39/40, but geometry defines:

```text
hairline/base border: 1 px
strong state border: up to 2 px where needed
```

Separators should be used sparingly. Spacing and material depth should perform most grouping.

A full vertical divider between Project Selector and workspace is not part of the default Home language.

---

## 47. Focus geometry reservation

Controls must reserve enough space for a visible focus treatment without clipping.

Focus outline/glow may sit outside visual bounds.

Parent containers must not use `overflow: hidden` merely for radius if it clips keyboard/gamepad focus; use wrapper composition where necessary.

DOC-40 defines the exact treatment.

---

## 48. Scroll geometry

System Shell is generally viewport-bound while content regions own scrolling.

Rules:

- Avoid nested vertical scroll containers unless the interaction genuinely requires them.
- One dominant vertical scroll region per major surface.
- Horizontal scrolling is reserved for explicit shelves/carousels/segments.
- Scrollbars may be visually refined but browser usability remains intact.
- Dock and critical Back actions remain reachable while content scrolls.

---

## 49. Dynamic viewport sizing

Full-height surfaces use modern viewport units with fallbacks:

```text
dvh for active dynamic height
svh where a stable minimum is useful
safe-area env() values
```

Avoid treating `100vh` as universally correct.

Virtual keyboard appearance must not trap fields or submit actions below the viewport.

---

## 50. Foldables and split-screen

No bespoke foldable layout is required in V1.x.

However:

- components are container-aware;
- content avoids assuming full device width;
- hinge/gap-specific enhancements may be added later;
- narrow desktop/split-screen should behave through the same semantic modes.

---

## 51. Text zoom and geometry

At 125%, 150% and 200% browser/text zoom:

- fixed-height text containers must expand;
- Dock destinations remain reachable;
- labels may wrap where appropriate;
- selectors preserve navigation even if fewer neighbors fit;
- widgets may grow/reflow rather than clip;
- the layout may move to a more compact semantic mode earlier.

Exact visual geometry is subordinate to content accessibility.

---

## 52. Project-specific art direction

Project artwork can alter perceived composition but not base geometry contracts.

A portrait-heavy project may use different crop/alignment from a wide UI screenshot, but:

```text
Project Hero remains primary
Widget Field remains valid
System Chrome remains stable
Dock remains stable
```

Artwork must adapt to the system rather than forcing a one-off layout for every project.

---

## 53. Layout presets versus fixed templates

Home may define a small set of approved layout presets for the resolver, for example:

```text
Hero Center + 2 Side Widgets
Hero Large + Bottom Widgets
Hero Left + Context Cluster
Media-rich Hero + Utility Cluster
```

These are not user-facing themes in V1.x.

They allow variety without arbitrary layout generation.

Project metadata may recommend a preset, while user widget preferences still influence available slots.

---

## 54. Layout stability

The system should minimize unexpected movement.

Reserve geometry for:

```text
artwork
widget skeletons
media thumbnails
achievement tiles
system chrome
```

Remote content updates should not radically reflow the primary workspace after the user begins interacting.

This supports the existing CLS target and perceived quality.

---

## 55. Density and motion interaction

Motion may visually promote selected objects without permanently changing every layout measurement.

Where possible:

```text
layout owns stable footprint
motion owns temporary transform/depth
```

If selection genuinely changes content footprint, the layout transition must be bounded and interruptible per DOC-29.

---

## 56. Material and geometry interaction

DOC-39 defines the approved optical material behavior; DOC-38 establishes the complementary geometry constraints:

- Stronger glass does not automatically mean larger radius.
- Blur cannot compensate for poor spacing.
- Multiple nested rounded glass shells should be avoided.
- Reading planes may be geometrically simpler than their outer Hero Glass shell.
- Dock is a continuous glass object, not six separate floating glass circles.

---

## 57. CSS token proposal

Implementation naming may look conceptually like:

```css
:root {
  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-xs: .375rem;
  --radius-sm: .625rem;
  --radius-md: .875rem;
  --radius-lg: 1.25rem;
  --radius-xl: 1.75rem;
  --radius-2xl: 2.25rem;

  --measure-reading: 68ch;
  --width-reading: 47.5rem;
  --width-detail: 70rem;
  --width-workspace: 90rem;
  --width-shell: 105rem;
}
```

Exact implementation syntax may differ. The semantic system is normative; this code block is illustrative.

---

## 58. Component geometry contract

Every major component specification should state:

```text
minimum size
preferred size
maximum useful size
padding
supported semantic sizes
container behavior
Compact behavior
Medium behavior
Expanded behavior
Wide behavior
height-constrained behavior
text zoom behavior
touch target behavior
safe-area behavior if relevant
```

A component without this contract is not visually implementation-ready.

---

## 59. Geometry anti-patterns

Explicitly prohibited:

```text
one-off random margins in features
uniform bento grid as the Home identity
all cards same radius/size
arbitrary absolute widget positioning
pixel coordinates persisted for widgets
shrinking desktop layout into mobile
reading lines spanning ultrawide screens
44px-looking control with 24px actual hit target
100vh assumptions on mobile
fixed-height text containers
focus rings clipped by overflow
horizontal Dock scrolling
More menu hiding a primary Dock destination
excessive nested scroll areas
masonry that destroys logical reading order
layout jumping when remote widgets load
```

---

## 60. Prototype validation checklist

Before freezing geometry tokens in implementation, prototypes must validate at least:

```text
320–360 px narrow phone
modern 390–430 px phone
phone landscape
small tablet
large tablet
1366×768 class laptop
1440px desktop
large desktop
>= 1920px / ultrawide
short desktop window
split-screen/narrow desktop
125/150/200% zoom
coarse pointer
keyboard-only
```

The exact device model is less important than covering the geometry classes.

---

## 61. Decision registry

| ID | Decision |
|---|---|
| GEO-001 | The spatial system uses a 4px base unit with semantic spacing roles. |
| GEO-002 | Geometry must recompose before it shrinks. |
| GEO-003 | The Personal Widget Field uses a deterministic grid with controlled visual asymmetry. |
| GEO-004 | V1.0 stores semantic widget intent, never pixel coordinates. |
| GEO-005 | Expanded/Wide use a 12-column Widget Field grammar. |
| GEO-006 | Medium uses an 8-column hybrid grammar. |
| GEO-007 | Compact exposes one primary widget in-flow and additional widgets through a Sheet/Shelf. |
| GEO-008 | The selected Project Hero may occupy the same field but is not a widget. |
| GEO-009 | The Project Hero owns the largest visual mass on Home. |
| GEO-010 | Widget sizes are semantic S/M/L and widgets declare supported sizes. |
| GEO-011 | Wide increases breathing room before information density. |
| GEO-012 | Reading content remains bounded around a 68ch measure. |
| GEO-013 | The initial semantic mode mapping is <640 Compact, 640–1023 Medium, 1024–1599 Expanded, >=1600 Wide, subject to prototype tuning. |
| GEO-014 | Height-constrained layouts are treated separately from width mode. |
| GEO-015 | The Dock always exposes all six primary destinations throughout V1.x, beginning in V1.0. |
| GEO-016 | Minimum interactive target is 44×44 CSS px; 48×48 is preferred for primary touch controls. |
| GEO-017 | The Dock is one continuous object rather than six independent glass buttons. |
| GEO-018 | Project Selector is spatial rather than a rigid sidebar and uses no default divider. |
| GEO-019 | Compact Project Selector becomes a centered horizontal carousel with adjacent-item peeking. |
| GEO-020 | Surface widths use semantic classes instead of arbitrary per-feature modal widths. |
| GEO-021 | Safe areas and dynamic viewport units are mandatory inputs for full-height/mobile geometry. |
| GEO-022 | Orientation changes and resize must preserve Drawing content. |
| GEO-023 | Arcade uses a logical game arena rather than stretching game physics to viewport size. |
| GEO-024 | Widget customization may reveal the real Field Grid but cannot permit overlap or unrestricted free placement. |
| GEO-025 | Layout source/focus order remains logical even when visual composition is asymmetric. |
| GEO-026 | Focus treatments must have unclipped geometric space. |
| GEO-027 | One dominant vertical scroll container is preferred per major surface. |
| GEO-028 | Project media uses adaptable ratios; diagrams are never forced into decorative aspect ratios. |
| GEO-029 | Layout reserves geometry for remote/media content to reduce reflow and CLS. |
| GEO-030 | User text scaling may change geometry/mode but never remove capability. |
| GEO-031 | A small set of resolver layout presets may create composition variety without arbitrary placement. |
| GEO-032 | Material strength and border radius are independent design dimensions. |
| GEO-033 | Feature components consume shared spacing/radius/layout tokens instead of inventing local values. |
| GEO-034 | Geometry must be validated across width, height, zoom and input-capability classes before implementation freeze. |
| GEO-035 | Six-item Compact Dock geometry is validated as separate 320 CSS-px, 200% browser-zoom, independent 200% text-scaling (where supported), and short-landscape cases; 44 px minimum targets may be used in constrained modes while preserving six direct destinations. |

---

## 62. Approval record

DOC-38 is approved with the following geometric baseline:

```text
4px base geometry
+
controlled radius hierarchy
+
bounded reading/system widths
+
12-column central Widget Field on Expanded/Wide
+
semantic S/M/L widget footprints
+
selected Project Hero embedded in the same spatial field
+
responsive recomposition instead of scaled layouts
+
44/48px accessibility-aware interaction sizing
+
no arbitrary freeform desktop geometry
```

DOC-39 defines how Liquid Glass, Frost, Solid and Hero Glass render inside these geometric boundaries.

