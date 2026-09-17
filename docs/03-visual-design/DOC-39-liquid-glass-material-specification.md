---
id: DOC-39
title: "Liquid Glass Material Specification"
document_status: APPROVED
canonical_format: markdown
phase: "Visual Design Foundation"
folder: 03-visual-design
depends_on:
  - DOC-20
  - DOC-21
  - DOC-25
  - DOC-26
  - DOC-28
  - DOC-29
  - DOC-33
  - DOC-34
  - DOC-35
  - DOC-38
decision_families:
  - MAT
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-39 — Liquid Glass Material Specification

> **Purpose:** Define the material system that gives the portfolio its tactile, iiSU-inspired spatial character while preserving readability, performance, accessibility and a visual identity distinct from both generic glassmorphism and direct Apple/iisu imitation.

---

## 1. Material thesis

The portfolio uses glass as a **behavioral material**, not as decoration.

> **Glass communicates hierarchy, context and physical relationship to the environment.**

The system must feel translucent, layered and responsive to the selected project without turning every surface into a blurred card.

The target is neither generic glassmorphism nor an Apple Liquid Glass clone. The material language is defined by the portfolio's own spatial rules:

```text
selected-project atmosphere
+
controlled optical depth
+
central Personal Widget Field
+
console-like shell continuity
+
editorial reading restraint
=
portfolio material identity
```

---

## 2. Material principles

1. **Not everything is glass.** Solid surfaces are required for reading, accessibility and fallback states.
2. **Material strength follows role.** A Dock, widget, article body and project hero should not share the same treatment.
3. **Context may tint glass, but never destroy system identity.**
4. **Transparency is subordinate to readability.**
5. **Glass must remain convincing when static.** Motion is not required to sell the material.
6. **The material system degrades gracefully.** Unsupported blur/refraction must still look intentional.
7. **Optical complexity is budgeted.** Full-screen stacked blur is prohibited.
8. **Light and Dark are separately tuned lighting conditions, not inversion.**
9. **Selected state may change optical response without changing semantic meaning.**
10. **Accessibility may simplify presentation, but must never remove capability.**

---

## 3. Material hierarchy

The approved material family has four semantic levels:

| Token | Name | Primary role |
|---|---|---|
| `MAT-0` | Solid | Reading, accessibility fallback, dense/critical information |
| `MAT-1` | Frost | Secondary/passive surfaces, calm containers |
| `MAT-2` | Liquid | Interactive chrome, Dock, widgets, popovers |
| `MAT-3` | Hero Glass | Sparse major overlays and cinematic selected surfaces |

Material level is a semantic property. It is **not** shorthand for border radius, elevation or size.

---

## 4. MAT-0 — Solid

MAT-0 is intentionally opaque or nearly opaque.

Use it for:

```text
long-form case-study reading planes
CV preview/document surfaces
forms that require maximum clarity
admin tables / moderation queues
critical alerts and confirmations
high-contrast accessibility fallback
content shown over highly complex artwork
```

MAT-0 still belongs to the visual system through:

```text
system neutrals
typography
radius hierarchy
edge treatment
spacing
motion
```

It must never feel like a foreign flat card pasted over the interface.

---

## 5. MAT-1 — Frost

MAT-1 provides softened separation from the environment with limited transparency.

Best for:

```text
secondary panels
passive metadata groups
reading-adjacent containers
quiet settings groups
achievement metadata
contact supporting blocks
inactive contextual surfaces
```

Visual character:

```text
high readability
low optical drama
soft blur or fallback tint
subtle internal light
restrained border
```

MAT-1 should remain visually useful even when backdrop-filter is unavailable.

---

## 6. MAT-2 — Liquid

MAT-2 is the system's primary interactive glass.

Canonical uses:

```text
Global Dock
WidgetShell
Top controls
PopoverSurface
Command Palette shell
Settings controls/surfaces
selected system capsules
small contextual overlays
```

MAT-2 should communicate:

```text
presence
interactivity
layering
context reflection
physical continuity
```

It must not become a generic `rgba(255,255,255,.1) + blur(20px)` recipe reused everywhere.

---

## 7. MAT-3 — Hero Glass

MAT-3 is rare.

Use only when a surface needs significant visual authority:

```text
major route-backed project overlay
achievement reveal
feature media overlay
large contextual project surface
special cinematic selection state
```

MAT-3 may use stronger optical depth, local tint, layered highlights and more environmental response than MAT-2.

Rule:

> **If three MAT-3 surfaces are simultaneously competing for attention, the composition is wrong.**

Normally one MAT-3 surface maximum should dominate a scene.

---

## 8. Material quality tiers

The implementation supports four render-quality tiers independent from responsive width:

| Tier | Meaning |
|---|---|
| `FULL` | Complete approved material treatment |
| `STANDARD` | Reduced optical complexity, same hierarchy |
| `REDUCED` | Simplified blur/highlights/refraction |
| `SOLID` | Opaque fallback preserving geometry and hierarchy |

The system must never decide quality solely from `mobile vs desktop`.

Inputs may include:

```text
user Transparency setting
prefers-reduced-transparency when available
prefers-reduced-motion where motion-based optics are involved
Save-Data / low-data behavior when relevant
browser feature support
runtime performance observations
battery/device constraints only when reliably available and privacy-safe
```

---

## 9. User Transparency setting

Settings exposes:

```text
Automatic
Full
Reduced
Off
```

Interpretation:

- **Automatic:** resolver chooses an appropriate quality tier.
- **Full:** request the richest supported material without violating accessibility/performance safeguards.
- **Reduced:** preserve material identity with less transparency/blur/refraction.
- **Off:** use Solid/Frost equivalents with no dependency on translucent backdrops.

Changing Transparency must not change information architecture or available actions.

---

## 10. Optical composition model

A glass surface is conceptually composed from layers rather than one CSS declaration:

```text
Backdrop content
    ↓
Backdrop softening / blur
    ↓
Material fill
    ↓
Context tint
    ↓
Internal luminance gradient
    ↓
Edge / rim response
    ↓
Local highlight
    ↓
Texture / grain
    ↓
Content foreground
```

Not every layer is active at every material level or quality tier.

---

## 11. Baseline token families

The implementation should expose semantic token families such as:

```text
--material-fill
--material-fill-strong
--material-border
--material-border-highlight
--material-blur
--material-saturation
--material-tint
--material-shadow
--material-inner-light
--material-noise-opacity
--material-highlight-opacity
--material-refraction-strength
```

Feature components do not hard-code bespoke blur/alpha values.

Exact production values remain prototype-tunable, but the hierarchy defined here is architectural.

---

## 12. Initial blur baselines

Prototype baselines:

| Material | Full | Standard | Reduced | Solid |
|---|---:|---:|---:|---:|
| MAT-0 | 0 px | 0 px | 0 px | 0 px |
| MAT-1 | 10–14 px | 8–12 px | 0–6 px | 0 px |
| MAT-2 | 18–28 px | 14–20 px | 6–10 px | 0 px |
| MAT-3 | 28–44 px | 20–30 px | 8–14 px | 0 px |

These are design baselines, not immutable constants. Final values must be validated against real artwork and real devices.

Blur alone is never considered sufficient to create the material.

---

## 13. Fill-opacity direction

The system uses stronger material fill whenever backdrop complexity increases.

Conceptual ranges:

```text
MAT-0  → opaque / near opaque
MAT-1  → high fill, low transparency
MAT-2  → medium fill, visible environment
MAT-3  → context-dependent; richer optics but protected content plane
```

There must be no global rule like `MAT-3 = lowest opacity` because major surfaces may require **more**, not less, fill to protect content.

---

## 14. Backdrop saturation

Backdrop saturation may be slightly adjusted so context color appears intentional through glass.

Rules:

- never use aggressive saturation that turns imagery neon;
- System Widgets remain more neutral than Context Widgets;
- selected project atmosphere may influence saturation locally;
- reading surfaces suppress background chroma more strongly;
- semantic status colors are not generated from backdrop saturation.

---

## 15. Environmental tint

DOC-34 Project Context may feed glass through semantic context tokens:

```text
--context-accent
--context-environment
--context-accent-soft
```

Material surfaces may use these as **reflections/tints**, not as full replacement fills.

A project should feel like it is illuminating the system rather than repainting it.

---

## 16. System versus Context widgets

Within the Personal Widget Field:

**System Widgets** favor neutral MAT-2 behavior.

Examples:

```text
Currently Building
Dev Activity
Availability / status
Latest Achievement
```

**Context Widgets** may receive a stronger project-reflective tint.

Examples:

```text
Project Media
Architecture Snapshot
Project Release State
Related Achievement
```

Even then, all widgets must feel like one material family.

---

## 17. The central Widget Field

The Widget Field is a key material composition, not a collection of disconnected glass cards.

The scene should feel as though multiple modules exist in the **same optical atmosphere**.

Therefore:

- shared environmental light direction;
- related edge luminance;
- coordinated tint strength;
- compatible blur scale;
- shared grain family;
- no random per-widget glow colors;
- no independent glass recipes by feature team.

The grid may be visible during Customize Mode, but the material remains unified.

---

## 18. Selected Project Hero

The Project Hero is not automatically glass.

It may combine:

```text
artwork
solid/opaque media plane
glass metadata capsule
MAT-3 contextual overlay
ambient halo
```

The goal is to preserve the artwork as the primary object rather than burying it behind translucent material.

Its selected state may increase:

```text
edge clarity
local contrast
context tint response
foreground sharpness
```

while neighboring items recede.

---

## 19. Global Dock material

The Dock is the most persistent MAT-2 signature.

It is one continuous material object, not six unrelated buttons.

Composition:

```text
continuous glass shell
+
subtle environment transmission
+
internal active-selection material
+
controlled rim light
+
soft separation shadow
```

The selected destination uses a moving internal bubble/region rather than replacing the entire Dock's material.

The active bubble may be optically denser or brighter, but it must not resemble a separate pill pasted on top.

---

## 20. Dock environmental response

The Dock may subtly reflect the current environment/project.

Limits:

- no strong project-colored Dock background;
- icons remain readable and system-consistent;
- focus state remains independent from project accent;
- environmental tint remains subordinate to active navigation state;
- no continuous animated rainbow/reflection pass.

---

## 21. Top controls

Language, Theme, Sound and Settings controls use quiet MAT-2 or MAT-1 depending on grouping.

They should visually belong to the Dock family while being lower in hierarchy.

They must not compete with the central Widget Field or selected project.

---

## 22. Major overlays

Route-backed project details and major overlays may use MAT-3 for the shell while placing long-form content on MAT-0/MAT-1 reading planes.

Recommended pattern:

```text
MAT-3 outer environment
    └── MAT-0/1 content plane
        └── media / text / architecture
```

This creates premium depth without forcing paragraphs to sit directly over translucent art.

---

## 23. Popovers and sheets

Popovers generally use MAT-2.

Sheets may use MAT-1 or MAT-2 depending on content density.

Compact-mode sheets should favor stronger fill than desktop popovers because:

```text
smaller viewport
more content behind surface
higher chance of visual competition
```

Responsive mode may change **fill/blur balance** without changing semantic material role.

---

## 24. Reading surfaces

Long-form text must never rely on strong transparency.

Case studies, CV, documentation-like sections and dense architecture explanations use MAT-0 or restrained MAT-1.

Rule:

> **The more a user must read, the less the material should ask for attention.**

---

## 25. Forms

Inputs and Contact forms prioritize clarity.

Inputs may visually reference Frost/Liquid through border and subtle fill, but:

- labels must remain stable;
- errors must not depend on background color;
- focus cannot be replaced by a glow;
- autofill must remain readable;
- browser native affordances must not be broken for aesthetics.

---

## 26. Achievement surfaces

Achievement previews may use richer MAT-2/MAT-3 treatment because the collectible/reveal moment benefits from optical emphasis.

Locked/secret achievements must remain understandable without using opacity alone.

Unlocked/reveal effects may briefly increase highlight/luminance but return to the normal material system.

---

## 27. Arcade

Arcade may increase chroma and environmental energy, but interactive system chrome remains governed by the same material tokens.

During active gameplay:

- game surface owns attention;
- Dock/chrome may minimize;
- glass effects should not consume unnecessary GPU budget;
- game canvas itself is not required to use glass.

Performance takes priority over decorative optics during play.

---

## 28. Drawing workspace

Drawing must preserve direct input fidelity.

The canvas is not glass.

Tool rails/palettes may use MAT-2, but pointer/pen events must not trigger material effects that introduce latency or visual wobble.

---

## 29. Admin

Admin uses primarily MAT-0/MAT-1 with restrained MAT-2 chrome.

Moderation and data operations prioritize density, contrast and predictable state over cinematic material richness.

---

## 30. Light-mode material behavior

Light mode should feel like:

```text
luminous frost
translucent mineral
soft ceramic/glass hybrid
natural diffuse light
```

Avoid:

```text
pure-white translucent cards
washed-out gray text
harsh white borders
milky opacity that erases environmental depth
```

Highlights should normally be subtle because light surfaces already contain high luminance.

---

## 31. Dark-mode material behavior

Dark mode should feel like:

```text
smoked glass
graphite depth
controlled luminous rim
soft environmental reflection
```

Avoid:

```text
black panels with neon outline
bright cyan edge on every surface
glow as the only depth cue
transparent black over complex artwork without readability protection
```

Dark glass often requires slightly stronger fill than expected to preserve legibility.

---

## 32. Same room, different lighting

Light/Dark materials must preserve:

```text
hierarchy
geometry
relative depth
interaction grammar
context relationships
```

They do not need identical alpha, blur or highlight values.

The target is perceptual equivalence, not numeric symmetry.

---

## 33. Edge treatment

Edges should provide structure without producing obvious card borders everywhere.

Possible edge components:

```text
low-opacity base border
localized highlight edge
subtle dark-side edge
inner light
selected-state accent response
```

A surface should rarely have a uniformly bright 1px border on all sides.

---

## 34. Light direction

The system should use one dominant environmental light direction, tentatively upper-left/top, plus context-driven local illumination.

This is not meant to simulate photorealistic ray tracing.

It simply prevents every component from inventing unrelated highlights.

Local project artwork may bias reflected color but not reverse the entire system's physical logic.

---

## 35. Highlights

Highlights should appear as optical consequences, not decorative streaks.

Allowed:

```text
edge glint
localized soft reflection
selected-state luminance response
brief motion-linked highlight when opening/moving a surface
```

Avoid:

```text
constant diagonal shine animation
specular sweep on every hover
large white gradient stripe across all cards
```

---

## 36. Shadow model

Glass still needs separation from adjacent layers.

Shadows should be broad and low-contrast rather than heavy black card shadows.

The depth stack can combine:

```text
ambient shadow
contact shadow
edge contrast
backdrop blur
local luminance
scale / overlap
```

No single box-shadow should carry the full illusion of depth.

---

## 37. Inner light

MAT-2/MAT-3 may use a subtle inner luminance treatment to imply thickness.

It must remain restrained and tied to the global light direction.

The treatment should become weaker or disappear in REDUCED/SOLID quality tiers.

---

## 38. Refraction policy

True or simulated refraction is optional enhancement, not a requirement for core usability.

If used, it should be constrained to:

```text
Dock active region
selected high-value controls
Hero Glass edges
special achievement/boot moments
```

Refraction must never distort text, icons or hit targets.

No feature should require custom WebGL solely to make basic glass work.

---

## 39. Distortion and lensing

Very subtle optical lensing may be explored in prototypes, but:

- never alter actual layout geometry;
- never obscure text;
- never cause pointer mismatch;
- never run continuously on all widgets;
- disable in Reduced Transparency or performance-constrained modes.

This remains an enhancement layer.

---

## 40. Grain / microtexture

A subtle digital grain may help surfaces avoid sterile CSS-glass appearance.

Rules:

```text
extremely low contrast
shared system texture family
no VHS noise
no animated static by default
no texture over small text
no texture that materially affects contrast
```

The texture should be difficult to notice consciously.

---

## 41. Chromatic response

A small amount of color separation/reflection may be considered for special MAT-3 edges or secrets.

It is not a base property of MAT-2.

Avoid turning glass into RGB chromatic-aberration aesthetics.

---

## 42. Motion-material relationship

Motion may help communicate material continuity, especially:

```text
Dock active bubble travel
Widget → Overlay expansion
selected project promotion
popover emergence
```

But the material must not wobble like gelatin.

The object may flex visually through scale/highlight/blur transitions while retaining perceived structural integrity.

Motion timing remains governed by DOC-29.

---

## 43. Hover behavior

Hover may alter:

```text
edge luminance
local fill density
slight elevation perception
icon/text contrast
```

Hover must not trigger a full project-context change or large glass deformation.

Pointer hover is preview, not selection.

---

## 44. Focus behavior

Focus is not a glass effect.

The accessible focus indicator defined in DOC-34/DOC-40 remains visually distinct from:

```text
material highlight
project accent reflection
hover glow
selected edge
```

Glass must never lower the contrast of focus rings.

---

## 45. Selected behavior

Selection may influence material more strongly than hover:

```text
sharper edge hierarchy
slightly stronger fill/contrast
context-accent reflection
stronger environmental relationship
spatial promotion
```

This supports the selected-object gravity model from DOC-24/DOC-33.

---

## 46. Disabled, locked and secret states

Disabled controls do not become transparent to the point of invisibility.

Locked and Secret achievement states are semantic states, not merely material opacity variants.

Use iconography, labels, shape/state treatment and content changes together.

---

## 47. Transparency and contrast adaptation

The renderer may adapt material density according to backdrop complexity or luminance.

Possible inputs:

```text
known artwork metadata
precomputed readability bias
local surface role
Light/Dark theme
selected project context
```

Preferred method is deterministic metadata/tokens rather than continuous expensive pixel sampling.

---

## 48. Artwork readability metadata

Project media may declare values such as:

```text
readability_bias: auto | light | dark | balanced
backdrop_complexity: low | medium | high
preferred_scrim: subtle | standard | strong
focal_point
```

These values are authored through the canonical `ProjectVisualContext` contract in DOC-36 and may influence environmental wash and material density. DOC-39 consumes them and does not redefine their enum.

They must not override WCAG requirements.

---

## 49. Scrims

Scrims are legitimate parts of the material system.

Use them when glass alone cannot guarantee readability.

A scrim may be:

```text
localized gradient
radial protection behind text
environment wash
surface-specific dimming layer
```

A readable scrim is preferable to aggressively blurring an entire scene.

---

## 50. Stacking policy

Avoid multiple overlapping backdrop-filter surfaces because they:

```text
increase GPU cost
produce muddy visual results
create inconsistent blur accumulation
complicate contrast reasoning
```

Preferred pattern:

```text
one environmental blur/material plane
+
opaque/near-opaque inner content surfaces
```

rather than several nested transparent blurs.

---

## 51. Blur isolation

Where possible, material components should isolate backdrop effects to the actual visible shell rather than large off-screen containers.

Do not apply full-viewport blur simply because only a 320px widget requires glass.

---

## 52. Performance budget

The material system must preserve DOC-07 performance goals.

Rules:

- no unbounded number of simultaneous live backdrop filters;
- no always-running canvas/WebGL material simulation for ordinary UI;
- no constant filter animation;
- prefer transform/opacity for movement;
- blur value should not be animated frame-by-frame over large regions unless prototype testing proves acceptable;
- simplify effects during Arcade active gameplay;
- lazy-load optional visual enhancements.

---

## 53. Runtime material resolver

Conceptual resolver:

```ts
resolveMaterial({
  role,
  level,
  theme,
  quality,
  context,
  state,
  backdropComplexity: context.backdrop_complexity
})
```

The resolver yields semantic tokens/classes, not arbitrary inline style recipes.

This keeps system-wide behavior consistent.

---

## 54. SSR and hydration

Initial server-rendered markup must use a visually stable material baseline.

Hydration must not cause surfaces to jump from opaque to transparent in a distracting flash.

Preferred strategy:

```text
SSR stable STANDARD/SOLID-compatible appearance
→ client capability confirmation
→ progressive enhancement to richer quality if warranted
```

No blank shell while waiting for material capability detection.

---

## 55. Unsupported backdrop-filter

If backdrop blur is unavailable:

```text
MAT-1 → stronger translucent/opaque Frost fill
MAT-2 → denser context-aware fill + edge treatment
MAT-3 → denser shell + environmental tint + shadow hierarchy
```

The result must still look designed.

Support failure is not allowed to produce transparent unreadable panels.

---

## 56. Reduced transparency behavior

Reduced transparency removes or strongly reduces environmental transmission while preserving:

```text
hierarchy
shape
state
context identity
navigation
```

It may use:

```text
opaque tinted fills
simpler highlights
stronger borders where needed
static contextual accent
```

No functionality disappears.

---

## 57. Reduced motion interaction

`prefers-reduced-motion` does not automatically disable all glass.

It should disable motion-dependent material behavior such as:

```text
long optical sweeps
animated distortion
complex highlight travel
cinematic material morphs
```

Static translucency may remain if the user's Transparency setting allows it.

---

## 58. High contrast and forced colors

Forced-colors/high-contrast environments override decorative material assumptions.

The interface must preserve:

```text
visible boundaries
readable text
focus
selected state
interactive controls
```

Glass fidelity is explicitly lower priority than platform accessibility behavior.

---

## 59. Contrast requirements

Material output must uphold the contrast targets established in DOC-34/DOC-11.

Do not certify a component by testing it on one neutral background only.

Test against:

```text
light artwork
dark artwork
high-chroma artwork
busy screenshot
plain neutral fallback
Light theme
Dark theme
Reduced transparency
```

---

## 60. Material testing matrix

At minimum, validate:

```text
Light / Dark
Full / Standard / Reduced / Solid
neutral environment / multiple project contexts
Compact / Medium / Expanded / Wide
keyboard / pointer / touch
reduced motion
200% text zoom
backdrop-filter supported / unsupported
slow integrated-GPU class device where available
Arcade active gameplay
```

---

## 61. Material component contract

Every glass-capable component should document:

```text
semantic material level
allowed quality tiers
context tint behavior
selected/hover/focus behavior
fallback behavior
backdrop complexity assumptions
nested-material rules
performance notes
Light tuning
Dark tuning
```

Components without this contract should not introduce new glass recipes.

---

## 62. Recommended implementation shape

Possible system primitives:

```text
MaterialSurface
FrostSurface
LiquidSurface
HeroGlassSurface
MaterialBackdrop
MaterialRim
ContextTint
ReadabilityScrim
```

Exact component names may evolve, but material logic must remain centralized.

Avoid copy-pasted Tailwind utility strings defining independent glass formulas across features.

---

## 63. CSS implementation direction

Prefer tokenized CSS custom properties and shared component variants.

Possible conceptual pattern:

```css
[data-material="liquid"] {
  background: var(--material-fill);
  border-color: var(--material-border);
  backdrop-filter:
    blur(var(--material-blur))
    saturate(var(--material-saturation));
}
```

This is illustrative, not the final implementation recipe.

Project context enters through semantic variables rather than feature-specific colors.

---

## 64. Progressive enhancement

Richer material behavior may use:

```text
CSS backdrop-filter
CSS masks/gradients
View Transitions interaction continuity
small shader/canvas experiments only if justified
```

The first usable rendering cannot depend on advanced effects.

---

## 65. Asset policy

Material textures/highlights must be:

```text
original
procedural
appropriately licensed
small in transfer size
```

No Apple/iisu proprietary texture, shader, sound or artwork may be reused.

---

## 66. Material anti-patterns

Explicitly prohibited:

```text
glass on every surface
same glass recipe for Dock, forms, CV and case-study body
transparent text containers over busy artwork
pure Apple Liquid Glass imitation
iiSU asset/material copy
random colored glows per widget
bright 1px white border around every card
constant shine sweeps
large blur animation during normal navigation
nested backdrop-filter stacks
WebGL required for ordinary navigation
project accent replacing semantic/focus colors
neon-black cyberpunk glass
per-feature hard-coded opacity/blur values
unreadable glass justified as “premium”
performance mode removing capabilities
```

---

## 67. Visual prototype requirements

Before freezing production tokens, create material prototype scenes covering at least:

1. Home with Project Hero + 3–4 Widget Field modules.
2. Global Dock over both calm and busy project backdrops.
3. Project Detail MAT-3 shell + MAT-0/1 reading plane.
4. Command Palette / Settings.
5. Contact form.
6. Achievement reveal.
7. Compact mobile Home.
8. Reduced Transparency.
9. No `backdrop-filter` fallback.
10. Light and Dark with the same project context.

These prototypes should use representative real/simulated project artwork rather than only neutral gradients.

---

## 68. Acceptance criteria

DOC-39 implementation is successful when:

- a user can distinguish material hierarchy without labels;
- glass feels related to project context without losing system consistency;
- Widget Field modules feel like one environment rather than independent cards;
- long-form reading remains calm and high contrast;
- disabling transparency preserves a complete experience;
- unsupported blur still looks intentional;
- Dark does not become black+neon;
- Light does not become washed-out white glass;
- the Dock remains a recognizable signature;
- motion is not required for the material to feel convincing;
- material complexity does not jeopardize interaction responsiveness.

---

## 69. Decision registry

| ID | Decision |
|---|---|
| MAT-001 | The portfolio uses four semantic material levels: MAT-0 Solid, MAT-1 Frost, MAT-2 Liquid and MAT-3 Hero Glass. |
| MAT-002 | Glass is a behavioral hierarchy/context material, not a universal decoration. |
| MAT-003 | Not every surface is glass; long-form reading favors MAT-0/MAT-1. |
| MAT-004 | Material quality uses FULL/STANDARD/REDUCED/SOLID tiers independent from responsive width. |
| MAT-005 | Transparency setting exposes Automatic, Full, Reduced and Off. |
| MAT-006 | Accessibility/performance degradation may simplify presentation but never capability. |
| MAT-007 | Project Context may tint/refelect glass but cannot replace semantic, focus or core system colors. |
| MAT-008 | System Widgets remain more neutral than Context Widgets. |
| MAT-009 | Widget Field modules share one coordinated optical atmosphere. |
| MAT-010 | The Global Dock is one continuous MAT-2 material object with an internal active region. |
| MAT-011 | Project Hero is not automatically glass; artwork remains primary. |
| MAT-012 | Major overlays may combine MAT-3 outer shell with MAT-0/1 reading planes. |
| MAT-013 | Light and Dark use perceptually equivalent but separately tuned material values. |
| MAT-014 | One dominant environmental light direction governs highlights. |
| MAT-015 | Highlights are optical consequences, not constant decorative sweeps. |
| MAT-016 | Glass depth uses multiple cues rather than relying only on box-shadow. |
| MAT-017 | Refraction/distortion are optional progressive enhancements and may not affect text/hit geometry. |
| MAT-018 | Grain/microtexture is subtle, static by default and never allowed to compromise text. |
| MAT-019 | Focus remains semantically independent from material highlight and project accent. |
| MAT-020 | Selected state may strengthen material response consistent with selected-object gravity. |
| MAT-021 | Readability adaptation prefers deterministic metadata/scrims over expensive continuous pixel sampling. |
| MAT-022 | Stacked/nested backdrop-filter surfaces are minimized. |
| MAT-023 | Blur/filter work is scoped to visible surfaces and constrained by a performance budget. |
| MAT-024 | Material resolution is centralized through shared tokens/primitives rather than per-feature recipes. |
| MAT-025 | SSR provides a stable material baseline and progressively enhances after capability confirmation. |
| MAT-026 | Unsupported backdrop-filter must fall back to an intentional denser material, never unreadable transparency. |
| MAT-027 | Reduced Transparency preserves hierarchy and context using opaque/tinted equivalents. |
| MAT-028 | Reduced Motion removes motion-dependent optics without necessarily removing static translucency. |
| MAT-029 | High-contrast/forced-colors platform behavior takes priority over glass fidelity. |
| MAT-030 | Material must be tested against multiple artwork complexities, themes, quality tiers and input/responsive modes. |
| MAT-031 | Material assets must be original/procedural/licensed; no proprietary Apple/iisu assets are reused. |
| MAT-032 | Exact blur/opacity/highlight values remain prototype-tunable without changing the semantic material architecture. |

---

## 70. Approval record

DOC-39 is approved with Liquid Glass implemented as:

```text
semantic material hierarchy
+
project-aware optical response
+
unified Widget Field atmosphere
+
continuous Dock glass
+
separate Light/Dark tuning
+
accessible Solid/Frost fallbacks
+
performance-aware quality tiers
+
optional, restrained refraction
```

DOC-40 defines the visual state language for Rest, Hover, Focus, Selected, Pressed, Active, Disabled, Locked, Secret, New, Updated, Loading, Success, Warning and Error, including focus geometry, state layering, effects and accessibility precedence.
