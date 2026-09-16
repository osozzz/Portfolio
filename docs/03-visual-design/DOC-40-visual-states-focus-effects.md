---
id: DOC-40
title: "Visual States, Focus & Effects"
document_status: APPROVED
canonical_format: markdown
phase: "Visual Design Foundation"
folder: 03-visual-design
depends_on:
  - DOC-20
  - DOC-21
  - DOC-22
  - DOC-23
  - DOC-24
  - DOC-25
  - DOC-26
  - DOC-28
  - DOC-29
  - DOC-30
  - DOC-33
  - DOC-34
  - DOC-35
  - DOC-38
  - DOC-39
decision_families:
  - STA
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-40 — Visual States, Focus & Effects

> **Purpose:** Define the visual grammar for interaction states, focus, selection, feedback and restrained effects so every surface communicates intent consistently across pointer, keyboard, touch and gamepad input without sacrificing accessibility or the calm system identity.

---

## 1. State-system thesis

The portfolio must never rely on animation, color or hover alone to tell a visitor what is happening.

> **Every meaningful state must remain understandable while static, keyboard-accessible and visually distinguishable from adjacent states.**

The state system combines:

```text
geometry
+
contrast
+
material response
+
edge/focus treatment
+
semantic color
+
optional motion/audio
=
clear interaction feedback
```

Motion and sound reinforce state. They do not create state.

---

## 2. Canonical visual states

The system recognizes the following canonical states. They can be combined when the semantics allow it.

| State | Meaning |
|---|---|
| `REST` | Available, idle, not currently targeted |
| `HOVER` | Pointer is previewing an interactive target |
| `FOCUS` | Keyboard/gamepad focus is on the target |
| `SELECTED` | Target defines current persistent context |
| `PRESSED` | Pointer/key/gamepad activation is physically in progress |
| `ACTIVE` | Persistent currently engaged mode/space/tool/setting; not an asynchronous operation-in-progress state |
| `DISABLED` | Control exists but cannot currently be activated |
| `LOCKED` | Content exists but requires an unmet condition |
| `SECRET` | Content intentionally conceals identity until discovered |
| `NEW` | Recently introduced content deserves restrained attention |
| `UPDATED` | Existing content materially changed |
| `LOADING` | Data/action is unresolved but geometry is reserved |
| `SUCCESS` | Operation completed successfully |
| `WARNING` | Attention is required but operation is not necessarily blocked |
| `ERROR` | Operation failed or input is invalid |

These are semantic states, not CSS class names that must map one-to-one to implementation.

---

## 3. State priority

When several states overlap, semantic priority is approximately:

```text
ERROR / WARNING
    ↓
DISABLED / LOCKED
    ↓
PRESSED
    ↓
FOCUS
    ↓
SELECTED / ACTIVE
    ↓
HOVER
    ↓
NEW / UPDATED
    ↓
REST
```

This does **not** mean lower states disappear. It means higher-priority states must remain legible.

Example:

```text
SELECTED + FOCUS
```

must still look selected while displaying an unmistakable focus indicator.

---

## 4. Focus is not selection

Focus and selection remain fundamentally different concepts.

```text
FOCUS
= where the next keyboard/gamepad action will occur

SELECTED
= what currently defines context
```

A selected project may remain selected while keyboard focus moves to a widget, Dock item or action.

Therefore:

- selection may influence the environment;
- focus must remain local and explicit;
- focus never silently changes global context unless the component's navigation grammar explicitly defines focus-follow-selection;
- pointer hover never becomes focus;
- focus never disappears simply because the target is also selected.

---

## 5. Focus visual language

Focus uses a system-owned signal independent from project accent.

Approved baseline from DOC-34:

```text
Light focus: #2167D5
Dark focus:  #83B9FF
```

The focus treatment is built from multiple cues:

```text
focus color
+
visible outline/ring
+
small local contrast increase
+
optional material response
```

The project color must never replace the focus color.

---

## 6. Focus geometry

Default focus treatment:

- external outline/ring rather than an inset-only border;
- offset sufficient to remain visible against component edges;
- geometry follows the interactive target's shape;
- focus may use a subtle two-layer strategy where needed: a high-contrast separator plus focus color;
- outline must not be clipped by parent overflow;
- focus indicators remain visible at 200% zoom.

Tentative implementation baseline:

```text
primary ring: 2 CSS px
optical offset: 2–3 CSS px
high-contrast separator when required: 1 CSS px
```

Exact token values remain subject to prototype/contrast testing, but `outline: none` without an equivalent visible replacement is prohibited.

---

## 7. `:focus-visible`

Pointer clicks should not unnecessarily produce keyboard-style focus rings when the platform/browser correctly supports `:focus-visible`.

Implementation should prefer native focus-visible behavior rather than custom input heuristics where possible.

However:

- keyboard focus must always be visible;
- gamepad focus must always be visible;
- programmatic focus after opening/closing overlays must be visible when it represents navigation context;
- forms may use local field-focus treatment in addition to the global ring grammar.

---

## 8. Hover

Hover is a preview state, never a prerequisite.

Hover may produce:

```text
small contrast lift
subtle optical highlight
minimal elevation/depth response
cursor response where appropriate
short M1/M2 transition
```

Hover must **not**:

```text
open critical information permanently
change route
change global project selection by itself
trigger audio
cause major backdrop transitions
hide content required on touch
```

The interface must remain complete on devices with no hover capability.

---

## 9. Pressed state

Pressed feedback should feel immediate.

The control may use:

```text
slight scale compression
reduced elevation
stronger local edge response
material compression illusion
```

Suggested scale range for applicable controls:

```text
0.97–0.99
```

Large cards/project objects should use more restrained compression than small buttons.

Pressed state starts on input acceptance, not after business logic completes.

---

## 10. Selected state

Selected is one of the portfolio's signature visual states.

Selection is represented through **spatial promotion**, not simply a border.

Possible cues:

```text
increased scale or visual mass
higher artwork definition
stronger local contrast
context accent
material response
metadata reveal
neighbor de-emphasis
DynamicBackdrop influence
contextual widget retargeting
```

Only selections with context influence level `I2`/`I3` may modify larger portions of the environment as defined in DOC-24.

Hover never receives this level of influence.

---

## 11. Selected Project — signature behavior

A selected ProjectTile or Project Hero should feel as if it has gained gravitational mass.

Visual grammar:

```text
neighbor items remain present
selected item moves optically forward
artwork becomes more legible
accent reflection becomes stronger
environment transitions toward project context
supporting metadata/actions become available
```

The system must avoid a cheap treatment such as:

```text
selected = 3px colored border
```

A border may participate, but cannot be the sole selection cue.

---

## 12. Dock states

The Global Dock behaves as one continuous MAT-2 object.

Dock destinations support:

```text
REST
HOVER
FOCUS
PRESSED
SELECTED
```

The selected destination is represented by a **moving internal active bubble / optical lens**, not six independent selected cards.

Rules:

- only one destination is selected;
- focus can move independently across destinations;
- the active bubble remains anchored to selected destination while focus explores another item;
- selection transition follows DOC-29 and remains interruptible;
- icons retain legibility even when project environment colors are strong;
- Compact preserves all six destinations without replacing them with a hidden `More` control in V1.x.

---

## 13. Widget states

A `WidgetShell` may be:

```text
rest
focused
selected/active where its semantics require it
loading
stale
degraded
error
customize-targeted
```

Widget focus affects the widget itself, not the global environment.

Contextual data updates may use a small `UPDATED` marker but must not repeatedly animate the entire widget.

Widgets in Customize Mode gain additional placement controls and grid affordances without changing their content semantics.

---

## 14. Widget Customize Mode

Customize Mode is a temporary spatial-editing state.

It may reveal:

```text
Field Grid
slot boundaries
drag/reorder affordance
size control
pin/unpin action
move before/after controls
reset layout access
```

The mode must remain keyboard-accessible.

Drag-and-drop is optional convenience, not the only mechanism.

Recommended non-drag controls include:

```text
Move left/right/up/down where spatially meaningful
Move before/after in logical order
Change size S/M/L where supported
Pin/Unpin
```

Customize Mode should slightly quiet project ambience so spatial controls remain clear.

---

## 15. Active state

`ACTIVE` represents the persistent mode, space, tool or setting that is currently engaged. It does **not** mean an asynchronous action is merely in progress; use `LOADING` and/or `aria-busy` for unresolved work.

Examples:

```text
current Dock space
Drawing tool selected
Filter enabled
Arcade pause mode
Transparency setting selected
```

Active is not identical to Selected in all components.

A tool palette may use `ACTIVE` while Project Selector uses `SELECTED`.

---

## 16. Disabled state

Disabled controls must remain recognizable but visually recede.

Requirements:

- not communicated by opacity alone;
- label/icon remains readable where the control must be understood;
- native `disabled` semantics used where valid;
- disabled targets are removed from activation/focus behavior according to native semantics;
- a reason should be available when the disabled state is non-obvious and relevant.

Avoid excessively low opacity such as making disabled text unreadable.

---

## 17. Locked state

Locked means:

> the user can understand that content exists, but cannot access it yet.

Examples include unreached achievements.

Locked state may show:

```text
recognizable container
lock glyph
condition/progress when not secret
reduced artwork clarity
neutral material treatment
```

Locked content remains semantically different from disabled controls.

---

## 18. Secret state

Secret is not simply a darker Locked state.

Secret content intentionally conceals its identity.

Allowed presentation:

```text
unknown glyph
masked title
ambiguous silhouette
"???" sparingly
minimal hint if product design calls for it
```

The UI must not leak secret titles through accessible labels, HTML metadata, alt text or client-side payloads when secrecy materially matters.

If the secret is purely playful and not security-sensitive, implementation may be less strict, but the visual contract remains the same.

---

## 19. New and Updated

`NEW` and `UPDATED` are temporary attention states.

Use restrained indicators such as:

```text
small signal dot
compact badge
short first-seen highlight
```

Avoid:

```text
continuous pulsing
blinking labels
large neon banners
```

Once acknowledged/seen, local state may suppress the marker where appropriate.

---

## 20. Loading state

Loading must preserve geometry.

Preferred strategies:

```text
stable shell
skeleton only where content shape is predictable
subtle placeholder
cached/stale content with refresh indicator
```

Avoid:

```text
full-page spinner after initial entry
layout collapse
repeated shimmer across many widgets
blank white/black surfaces
```

Dynamic external data must never block the System Shell.

---

## 21. Skeleton language

Skeletons should inherit the geometry of the content they represent.

They use calm neutral material and minimal animation.

When `prefers-reduced-motion` is active:

```text
static skeleton > shimmer
```

Skeleton shimmer, when used, is local and low-frequency.

---

## 22. Stale and degraded data

The product explicitly prefers stale-but-useful external data over empty UI where safe.

A stale/degraded widget should communicate:

```text
content remains available
freshness is limited
refresh/retry if useful
```

The state should be visually quieter than Warning/Error unless user action is required.

---

## 23. Success

Success feedback is proportional to importance.

Minor success:

```text
field-level confirmation
small in-context message
Toast
```

Major success:

```text
published drawing accepted
contact message sent
achievement unlock
```

may receive stronger motion/audio where appropriate.

Generic confetti is not part of the system language.

---

## 24. Warning

Warnings use semantic color from DOC-34 plus iconography and text.

Warnings should explain:

```text
what happened
why it matters
what the user can do
```

A warning is not automatically a blocking dialog.

Use a modal/system dialog only when continuing could materially cause loss or a consequential action.

---

## 25. Error

Errors must remain specific and recoverable where possible.

Visual grammar:

```text
error color
+
icon/label
+
plain-language message
+
recovery action when available
```

Forms use field-level errors near the relevant field plus summary/focus management when multiple errors occur.

No red-only communication.

No raw stack traces, provider messages or implementation details in public UI.

---

## 26. Form-field states

Inputs support at minimum:

```text
REST
HOVER
FOCUS
FILLED
DISABLED
ERROR
SUCCESS where meaningful
```

Field focus should be visually clear without transforming every input into MAT-3.

Recommended hierarchy:

```text
rest = quiet border/surface
hover = small edge lift
focus = system focus ring + local border response
error = semantic border/message + retained focus visibility
success = restrained confirmation only when useful
```

Placeholder text is not a substitute for labels.

---

## 27. Links

Text links must remain identifiable without relying exclusively on project accent.

Depending on context they may use:

```text
underline
text-decoration thickness/offset
system link color
icon + label
```

Long-form reading surfaces should favor conventional, accessible link affordances over experimental treatment.

---

## 28. Cursor behavior

The optional custom cursor is an enhancement, never required for understanding.

Rules:

- native cursor semantics are preserved or faithfully represented;
- text selection retains text cursor behavior;
- links/buttons retain pointer semantics where expected;
- drawing surfaces use appropriate tool cursors;
- custom cursor can be disabled automatically on touch/no-hover devices;
- reduced motion may simplify cursor interpolation;
- cursor visuals cannot obscure focus or content.

The custom cursor must not become a large trailing decorative blob.

---

## 29. Context Halo

`Context Halo` from DOC-35 is a restrained visual effect representing selected-project influence around selected objects or contextual glass.

It may be produced with:

```text
soft radial light
controlled color bleed
subtle edge reflection
localized backdrop tint
```

It is **not** a neon outer glow.

Rules:

- strongest around selected Project Hero or sparse MAT-3 surfaces;
- moderate/low around contextual widgets;
- absent on long-form reading body;
- suppressed or simplified in Reduced/Off transparency modes;
- never used as the only selection cue.

---

## 30. Edge-light effects

MAT-2/MAT-3 may use local edge lighting to sell depth.

Edge light must respect a coherent environmental lighting model rather than placing white highlights uniformly on every side.

It may respond subtly to:

```text
Light/Dark theme
project context
surface orientation/role
selected state
```

The exact optical recipe belongs to implementation tokens derived from DOC-39.

---

## 31. Shadow effects

Shadows communicate separation, not decoration.

Preferred approach:

```text
few shadow tiers
broad/soft ambient separation
small contact shadow when an object is promoted
```

Avoid:

```text
heavy black card shadows everywhere
colored neon drop shadows
different arbitrary shadows per component
```

A surface can feel elevated through material/contrast/overlap even with little or no shadow.

---

## 32. Glow policy

Glow is rare and contextual.

Allowed:

```text
Context Halo
achievement reveal accent
secret discovery
small System Signal indication
Arcade-specific expressive moments
```

Not allowed as default:

```text
all buttons glow
all selected tabs glow
all glass edges glow
all text glow
```

---

## 33. Blur policy

Blur is a material tool defined by DOC-39, not a state indicator by itself.

States may alter blur only subtly.

For example, selected content may gain artwork clarity while its environment remains softened.

Do not animate large backdrop blur values continuously during ordinary focus movement.

---

## 34. Artwork clarity as state

Artwork clarity can help express hierarchy:

```text
REST neighbor
→ slightly subdued

SELECTED
→ clearer, better contrast, intentional focal crop
```

But content must not become so blurred that users cannot understand available choices.

In `prefers-reduced-transparency` / `Transparency: Off`, hierarchy shifts toward solid contrast, geometry and scale rather than blur.

---

## 35. Neighbor de-emphasis

When one project becomes selected, neighbors may recede through:

```text
slight scale reduction
lower contrast
reduced artwork saturation/clarity
z-depth
```

Do not reduce neighboring controls below accessible readability or make them appear disabled.

---

## 36. Overlay states

A major Overlay/RouteSurface must clearly communicate that it sits above the current workspace.

Use:

```text
surface depth
backdrop treatment
focus containment where semantically required
visible close/back affordance
preserved underlying context
```

The background may be visually quieted, but should remain recognizable in Expanded/Wide where DOC-26 calls for overlay continuity.

Nested major overlays remain prohibited.

---

## 37. Popovers and sheets

Popovers and sheets use shorter, quieter effects than major overlays.

They should not trigger global background transformations.

Focus placement/return follows DOC-22/DOC-26.

Compact may transform desktop popovers into sheets without changing their semantic function.

---

## 38. Toasts

Toast classes:

```text
Info
Success
Warning
Error
Achievement
```

Rules:

- do not steal focus for ordinary notifications;
- accessible live-region behavior is restrained;
- duplicate messages coalesce where possible;
- actions are keyboard accessible;
- timers pause where accessibility standards/user interaction require;
- critical information must not exist only in a disappearing toast.

Achievement Toast may be visually more expressive than ordinary system toasts.

---

## 39. Achievement reveal

Achievement unlock is a rare high-energy state.

It may combine:

```text
badge reveal
MAT-3 or special surface moment
context accent
M4/M5 motion
semantic audio if sound is enabled
```

But:

- it remains skippable/short;
- reduced motion receives a calm alternative;
- it does not block essential navigation for an extended period;
- the revealed achievement becomes accessible as normal content afterward.

---

## 40. Secret discovery

Secret discovery can use stronger visual personality than normal navigation, especially for Konami/Terminal-related achievements.

Allowed effects may include:

```text
brief digital artifact
controlled scan/dither accent
short system glyph reveal
special sound when enabled
```

Avoid prolonged screen distortion or flashing.

---

## 41. Theme transition effects

Theme change should feel intentional but fast.

Avoid global `transition: all`.

Preferred:

```text
token-driven color transition
short local material adaptation
optional View Transition enhancement when safe
```

Requirements:

- no white flash during Dark transition;
- no long full-screen crossfade that delays use;
- reduced motion simplifies or removes transition;
- project context remains coherent across theme change.

---

## 42. Language-change effects

Language change prioritizes content stability.

Use minimal transition, if any.

Do not animate individual letters/words.

Layout may reflow naturally for ES/EN text length differences.

Focus/selection/context should remain where logically possible.

---

## 43. DynamicBackdrop state effects

DynamicBackdrop may react to `SELECTED` project context, major space changes and specific cinematic moments.

It must **not** react globally to every:

```text
hover
focus movement
button press
widget update
```

This protects both calmness and performance.

---

## 44. Reduced motion

With `prefers-reduced-motion`, the system keeps all capability but simplifies transitions.

Typical transformations:

```text
large spatial travel → short fade/instant reposition
spring overshoot → direct settle
parallax → static composition
continuous decorative motion → off
achievement cinematic → compact reveal
custom cursor interpolation → simplified/disabled
```

Focus, selection and feedback remain visible.

---

## 45. Reduced transparency

Reduced transparency prioritizes stable reading surfaces.

Effects adapt by:

```text
higher surface opacity
less environmental bleed
less blur/refraction
stronger edge separation
```

Selected/context states remain identifiable via scale, geometry, contrast, accents and artwork hierarchy.

---

## 46. Transparency Off / SOLID tier

When transparency is Off or material quality resolves to SOLID:

```text
MAT-2/MAT-3 semantics remain
```

but their optical implementation becomes opaque.

The visual state system must still work completely.

This is a hard acceptance criterion.

---

## 47. Forced colors and high-contrast environments

In forced-colors/high-contrast environments:

- respect system colors;
- remove decorative effects that interfere;
- preserve native focus affordances where stronger;
- do not force custom color values that reduce legibility;
- ensure selected and checked states remain understandable with structure/text/icons.

---

## 48. Touch feedback

Touch lacks hover.

Touch interaction uses:

```text
pressed feedback
selection promotion
clear post-activation state
```

Do not emulate persistent hover after tap unless the component genuinely becomes selected.

Targets follow DOC-38 minimum size rules.

---

## 49. Gamepad feedback

Gamepad primarily depends on visible focus.

Rules:

- one clear focus owner inside active navigation scope;
- focus movement receives immediate visual response;
- ActionHint updates according to context;
- selected state remains independent;
- disconnect preserves state and does not strand focus;
- gameplay input scope suppresses shell focus movement until exited/paused as defined in DOC-23.

---

## 50. Keyboard feedback

Keyboard interactions preserve standard browser semantics first.

For composite controls:

```text
Tab enters/leaves component
Arrow keys move internal focus
Enter/Space activate according to control semantics
Escape performs deterministic Back/Close behavior
```

Visual focus follows actual DOM/programmatic focus.

Fake focus painted separately from focus state is prohibited.

---

## 51. Pointer feedback

Pointer affordances should be subtle and predictable.

Pointer hover may preview interactive potential, but click is what commits selection/activation unless explicitly documented otherwise.

The application should not continuously chase pointer position with large lighting effects across the whole viewport.

---

## 52. Transition interruption

State effects must tolerate interruption.

Examples:

```text
rapid project changes
fast Dock movement
opening then immediately closing a surface
resizing while a selection transition occurs
```

No queue of outdated visual states should play after the user has moved on.

Implementation must favor retargetable animations and cancellation-safe state transitions.

---

## 53. Performance constraints

Effects must not compromise the performance goals defined in DOC-07/DOC-39.

Rules:

- transform/opacity preferred for motion;
- avoid large continuously animated blur/filter areas;
- avoid multiple simultaneous full-screen compositing layers;
- high-frequency pointer/drawing/game state must not trigger whole-tree React rerenders;
- visual state changes should remain responsive to input, ideally perceived immediately;
- optional optical effects may degrade before interaction quality degrades.

---

## 54. Visual-effect token families

Implementation should expose semantic token families rather than arbitrary effect literals.

Conceptual groups:

```text
--focus-*
--selection-*
--hover-*
--pressed-*
--state-success-*
--state-warning-*
--state-error-*
--context-halo-*
--shadow-*
--edge-light-*
--scrim-*
```

Exact naming can evolve during implementation, but raw ad-hoc shadows/glows/rings scattered through feature components are prohibited.

---

## 55. Component state contract

Every reusable interactive component should document:

```text
supported states
state precedence
keyboard semantics
pointer semantics
touch semantics
gamepad behavior if applicable
focus behavior
selected behavior
reduced-motion behavior
reduced-transparency behavior
loading/error behavior
```

Not every component supports every canonical state.

---

## 56. State test matrix

At minimum, visual/accessibility testing should cover:

```text
Light / Dark
Compact / Expanded
pointer / keyboard
focus + selected
focus + error
selected + hover
loading / error / disabled
reduced motion
reduced transparency / transparency off
200% zoom
forced-colors where practical
```

Key signature components additionally require visual-regression coverage:

```text
ProjectTile / Project Hero
Global Dock
WidgetShell
OverlaySurface
Achievement card/reveal
FormField
Drawing controls
Arcade shell
```

---

## 57. Visual regression strategy

The isolated component environment required by DOC-27 should provide deterministic examples for important states.

Examples:

```text
ProjectTile/rest
ProjectTile/hover
ProjectTile/focus
ProjectTile/selected
ProjectTile/selected+focus
Widget/loading
Widget/error
Dock/home-selected+arcade-focused
FormField/error+focus
Achievement/locked
Achievement/secret
```

Animations should be freezeable or deterministically stepped for screenshot testing.

---

## 58. Anti-patterns

The following are explicitly prohibited:

```text
focus removed for aesthetics
selected = color only
hover-only functionality
neon glow around every active control
pulsing everything marked new
permanent animated gradients for state
continuous large blur animation
project accent replacing focus/error/success semantics
opacity-only disabled state with unreadable text
fake disabled controls that remain activatable
focus and selection visually indistinguishable
nested major overlay effects
confetti as generic success language
green-on-black terminal as universal technical state
screen-wide cursor-following spotlight
```

---

## 59. Acceptance principles

A visual-state implementation is acceptable only if:

1. A keyboard user can always identify current focus.
2. A selected item remains identifiable while another item is focused.
3. Touch users lose no capability when hover is absent.
4. Project accents cannot make system focus or semantic errors ambiguous.
5. The state system remains complete with transparency off.
6. Reduced motion preserves hierarchy and understanding.
7. Loading/error states do not collapse the shell or major layout geometry.
8. Effects remain calm during idle use.
9. Signature selections feel spatial rather than merely bordered.
10. Visual feedback begins quickly enough that the interface feels direct.

---

## 60. Decision registry

| ID | Decision |
|---|---|
| `STA-001` | Canonical visual states are defined centrally and may combine when semantics allow. |
| `STA-002` | Focus and Selection are distinct visual/semantic states. |
| `STA-003` | Focus uses a system-owned color independent from Project Accent. |
| `STA-004` | Keyboard and gamepad focus must always be visibly identifiable. |
| `STA-005` | `:focus-visible` is preferred where platform behavior is appropriate. |
| `STA-006` | Hover is preview-only and cannot contain exclusive functionality. |
| `STA-007` | Pressed feedback is immediate and may use restrained physical compression. |
| `STA-008` | Selection uses spatial promotion and cannot be represented solely by a colored border. |
| `STA-009` | Selected Project is a signature high-influence state that may affect DynamicBackdrop and contextual widgets. |
| `STA-010` | Dock selection uses a continuous moving internal active bubble/lens. |
| `STA-011` | Widget focus remains local and does not alter global environment. |
| `STA-012` | Widget Customize Mode exposes grid/placement controls and must support non-drag reordering. |
| `STA-013` | Disabled, Locked and Secret are visually and semantically distinct. |
| `STA-014` | New/Updated attention indicators are temporary and non-pulsing by default. |
| `STA-015` | Loading reserves geometry and does not block the System Shell after entry. |
| `STA-016` | Stale/degraded external data may remain visible with freshness messaging. |
| `STA-017` | Semantic Success/Warning/Error always use more than color alone. |
| `STA-018` | Form errors are local, descriptive and compatible with visible focus. |
| `STA-019` | Context Halo is a restrained environmental reflection, not neon glow. |
| `STA-020` | Shadow and edge-light use a small shared token system rather than arbitrary per-component recipes. |
| `STA-021` | Glow is rare and reserved for contextual or exceptional moments. |
| `STA-022` | DynamicBackdrop responds to meaningful context changes, not ordinary hover/focus events. |
| `STA-023` | Reduced Motion simplifies presentation without removing capability. |
| `STA-024` | Reduced Transparency and Transparency Off preserve the full state hierarchy through non-glass cues. |
| `STA-025` | Forced-colors/high-contrast modes may override decorative branding to preserve clarity. |
| `STA-026` | Touch does not emulate hover; post-tap state depends on real selection/activation semantics. |
| `STA-027` | Gamepad navigation always exposes a single clear focus owner inside the active scope. |
| `STA-028` | Visual focus must reflect actual focus, not a separate fake-focus state. |
| `STA-029` | Navigation/selection effects are interruptible and retargetable. |
| `STA-030` | Optional optical effects degrade before input responsiveness or readability. |
| `STA-031` | Effect values are represented through semantic tokens, not scattered raw literals. |
| `STA-032` | Reusable interactive components document their state contract. |
| `STA-033` | Signature components require deterministic visual-regression coverage for key state combinations. |
| `STA-034` | The visual-state system must remain fully understandable while static and with sound disabled. |
| `STA-035` | `ACTIVE` preserves DOC-24 semantics: persistent engaged mode/space/tool/setting; asynchronous progress uses Loading/busy semantics. |

---

## 61. Approval record and continuing implementation constraints

DOC-40 is `APPROVED`; implementation must preserve:

- the canonical state vocabulary;
- the separation of Focus and Selection;
- the dedicated system focus language;
- the Selected Project spatial-promotion model;
- Dock/Widget state behavior;
- disabled/locked/secret distinctions;
- semantic feedback rules;
- Context Halo/glow/shadow policy;
- reduced-motion/transparency/high-contrast adaptations;
- the effect token strategy;
- the test/acceptance rules.

Exact CSS recipes and final optical calibration can be tuned during prototype implementation as long as these semantic decisions remain intact.

