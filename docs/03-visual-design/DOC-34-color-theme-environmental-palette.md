---
id: DOC-34
title: "Color, Theme & Environmental Palette"
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
  - DOC-27
  - DOC-28
  - DOC-29
  - DOC-30
  - DOC-31
  - DOC-32
  - DOC-33
  - ADR-001
decision_families:
  - CLR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-34 — Color, Theme & Environmental Palette

> **Purpose:** Define the chromatic system, Light/Dark theme behavior, semantic colors and the contract by which selected projects influence the environment without taking ownership of the entire interface.

## 1. Color north star

Color must support the visual identity established in DOC-33:

> **Soft Future Personal Computing**

The base system is calm, neutral and material-driven. Color appears with intent: to communicate state, create environmental atmosphere, identify a selected project, establish focus or provide rare expressive moments.

The portfolio must not depend on a permanent saturated brand gradient. The selected work should be able to influence the world while the system itself remains recognizable.

## 2. Core color model

The chromatic architecture has five layers:

1. **System Neutrals** — canvas, text, reading surfaces, lines and structural chrome.
2. **System Signal** — restrained persistent system accent used for selected system controls, status and small identity moments.
3. **Semantic Colors** — success, warning, error and informational meaning.
4. **Project Context** — runtime accent/environment values supplied by the currently selected project.
5. **Space Bias** — very subtle temperature shifts by major space where useful; these never override project or semantic meaning.

Conceptually:

```text
System Neutrals
      +
System Signal
      +
Semantic State
      +
Project Context
      +
Environmental Artwork
      =
Rendered Interface
```

## 3. Theme modes

The public product supports:

- `system` — follows the operating system/browser preference;
- `light` — explicitly selected Light theme;
- `dark` — explicitly selected Dark theme.

The Theme control never resets current space, selection, widget layout or route.

Theme preference is local and may be persisted independently from other personalization.

## 4. Light and Dark are lighting states

DOC-33 defines Light and Dark as two lighting conditions of one system, not inversions.

Both themes preserve:

- information hierarchy;
- semantic state meaning;
- material levels;
- project relationships;
- selected-object gravity;
- Widget Field composition;
- focus visibility;
- typography hierarchy.

They differ in luminance distribution, material opacity, shadow treatment, highlight behavior and the way contextual accents are tuned.

## 5. Base neutral philosophy

The application canvas avoids absolute black and stark browser-white as the dominant environmental background.

The base should feel slightly mineral/graphite rather than sterile digital white/black.

Solid reading planes, exported documents and special media contexts may legitimately use pure or near-pure white/black where it improves function.

## 6. Baseline Light palette

The following values are the **initial visual baseline** for prototyping. They become design tokens rather than feature-level literals.

| Token | Value | Purpose |
|---|---|---|
| `light.canvas.base` | `#EEF2F2` | Main environmental canvas |
| `light.canvas.raised` | `#F5F7F7` | Raised non-glass structural plane |
| `light.surface.solid` | `#FCFDFD` | High-readability surface |
| `light.surface.sunken` | `#E6EBEC` | Recessed/control wells |
| `light.ink.primary` | `#171C1F` | Primary text |
| `light.ink.secondary` | `#59646A` | Secondary text |
| `light.ink.muted` | `#5F6A70` | Muted metadata; passes normal-text contrast on baseline opaque reading surfaces |
| `light.line.subtle` | `rgba(23,28,31,0.08)` | Quiet separators |
| `light.line.default` | `rgba(23,28,31,0.14)` | Standard boundaries |
| `light.line.strong` | `rgba(23,28,31,0.24)` | Stronger control/focus support |
| `light.scrim` | `rgba(239,243,243,0.72)` | Artwork readability wash |

The visual goal is soft daylight rather than paper-white UI.

## 7. Baseline Dark palette

| Token | Value | Purpose |
|---|---|---|
| `dark.canvas.base` | `#0B0E10` | Main environmental canvas |
| `dark.canvas.raised` | `#111619` | Raised structural plane |
| `dark.surface.solid` | `#171C20` | High-readability surface |
| `dark.surface.sunken` | `#080A0C` | Recessed/control wells |
| `dark.ink.primary` | `#F2F5F5` | Primary text |
| `dark.ink.secondary` | `#A5AFB4` | Secondary text |
| `dark.ink.muted` | `#828D93` | Muted metadata; passes normal-text contrast on baseline opaque reading surfaces |
| `dark.line.subtle` | `rgba(242,245,245,0.08)` | Quiet separators |
| `dark.line.default` | `rgba(242,245,245,0.14)` | Standard boundaries |
| `dark.line.strong` | `rgba(242,245,245,0.24)` | Stronger boundaries |
| `dark.scrim` | `rgba(8,11,13,0.68)` | Artwork readability wash |

The visual goal is deep graphite with environmental color, not pure black plus neon.

## 8. System Signal color

The system receives one restrained persistent accent family, provisionally named **Signal**.

Signal should feel mineral/aquatic rather than gaming-neon. Recommended starting pair:

| Token | Light | Dark |
|---|---|---|
| `signal.primary` | `#287F7B` | `#78D3CC` |
| `signal.hover` | `#1F6F6B` | `#8DE0D9` |
| `signal.soft` | `rgba(40,127,123,0.12)` | `rgba(120,211,204,0.14)` |
| `signal.line` | `rgba(40,127,123,0.34)` | `rgba(120,211,204,0.38)` |
| `signal.ink` | `#1F6F6B` | `#78D3CC` |

Signal is **not** the color of every interactive control. It is reserved for small system identity moments, active system controls, status and selected system-level affordances. `signal.primary` is an accent/material hue; normal-sized Signal-colored text uses `signal.ink` (or neutral ink) rather than assuming the accent hue is readable.

Project selections use project context rather than Signal where appropriate.

## 9. Focus color is independent from brand/context accent

Keyboard/gamepad focus cannot rely on whatever accent a project happens to provide.

Use a dedicated high-visibility focus family:

| Token | Light | Dark |
|---|---|---|
| `focus.ring` | `#2167D5` | `#83B9FF` |
| `focus.outer` | `rgba(33,103,213,0.22)` | `rgba(131,185,255,0.28)` |

The exact optical implementation belongs to DOC-40, but its semantic color independence is mandatory.

## 10. Semantic state colors

Semantic colors remain stable across project contexts.

Initial baseline:

| State | Light accent | Light ink | Dark accent/ink | Meaning |
|---|---|---|---|---|
| Success | `#267A53` | `#236B49` | `#69C99A` | Completion/healthy |
| Warning | `#9A6718` | `#8A580F` | `#E3B45C` | Attention/degraded |
| Error | `#B33F4B` | `#A93642` | `#F07C86` | Failure/destructive |
| Info | `#356FA8` | `#2E6397` | `#7EB5E5` | Neutral information |

Semantic **accent** tokens may color icons, borders, status marks and material highlights. Normal-sized semantic text must use the corresponding accessible `ink` token or neutral text. Dark accent values already exceed the baseline normal-text target on the documented dark opaque surfaces, but still require QA on glass/artwork. Every semantic state also uses text/icon/structure; color alone never communicates state.

## 11. Link color

Textual links require a stable, accessible treatment even inside project-colored environments.

Recommended default:

- Light: `#245F9E`
- Dark: `#80B6E8`

Links also receive underline or another explicit affordance where context requires it. Project accent must not silently recolor body links into low contrast.

## 12. Project Context contract

DOC-36 is the **canonical authored owner** of `ProjectVisualContext`. Color/material rendering consumes the following normalized fields rather than defining a second schema:

```text
accent_light
accent_dark
accent_on_light?
accent_on_dark?
environment_light
environment_dark
secondary_tint?
backdrop_media_id?
hero_media_id?
focal_point?
readability_bias: auto | light | dark | balanced
backdrop_complexity: low | medium | high
preferred_scrim: subtle | standard | strong
```

DOC-34 owns how those values participate in palette/environment composition; it does not redefine their storage contract.

## 13. Project accent is authored, not blindly generated

A single HEX from a logo is not enough to build a usable environmental palette.

For important projects, Light and Dark contextual variants should be deliberately authored or validated. Automatic derivation may assist, but must enforce:

- contrast;
- chroma limits;
- minimum/maximum luminance;
- compatibility with glass;
- readable selected states;
- Light/Dark perceptual equivalence.

## 14. Project accent influence zones

Project context may influence:

- DynamicBackdrop tint;
- selected ProjectTile edge/highlight;
- contextual Widget Field reflections;
- small selected metadata accents;
- project-specific progress/highlight marks;
- environment glow/reflection;
- Project Detail hero treatment.

It does **not** automatically recolor:

- all body text;
- all links;
- all Dock icons;
- all system toggles;
- semantic errors/successes;
- focus rings;
- form fields;
- Admin controls.

## 15. Contextual color intensity hierarchy

Project color influence follows information hierarchy:

```text
Environment       strongest chromatic presence
Selected Hero     strong/controlled
Context Widgets   moderate/subtle
Metadata accents  small
System Chrome     minimal
Reading surfaces  near-neutral
```

This prevents a project identity from swallowing the portfolio identity.

## 16. Contextual mixing limits

As a design guideline rather than a final rendering formula:

- canvas/environment tint may reach roughly 12–22% perceptual influence;
- glass surfaces roughly 4–12%;
- border/highlight details roughly 12–28%;
- large reading surfaces generally 0–6%.

DOC-39 owns final material mixing behavior.

## 17. Environment palette

DynamicBackdrop should construct atmosphere with several roles rather than one `background-color`:

```text
Neutral Base
+ Project Environmental Tint
+ Artwork
+ Readability Wash
+ Local Light/Reflection
+ Optional Texture
```

The system should remain visually coherent when artwork is missing.

## 18. Missing-artwork fallback

Every project context requires a valid non-image fallback:

```text
neutral system base
+
project accent wash
+
subtle environmental gradient
```

A failed image request must not produce a blank black rectangle or destroy text contrast.

## 19. Environmental gradients

Gradients exist to model light/depth, not to become the brand.

Allowed roles:

- localized illumination;
- contextual color falloff;
- artwork integration;
- readability transitions;
- selected-object reflection.

Avoid permanent saturated multi-color gradient backgrounds with no contextual reason.

## 20. Space color bias

Major spaces may have a subtle baseline temperature when no stronger project context is active:

- **Home:** neutral/context-driven;
- **Achievements:** slightly warm/mineral when neutral;
- **Arcade:** deeper and slightly higher-chroma capacity;
- **Channel:** cool/technical neutral;
- **Social:** slightly warmer/human neutral;
- **Contact:** calm neutral;
- **CV:** neutral/print-oriented;
- **Admin:** strictly functional neutral.

These are biases, not fixed page colors.

## 21. Widget Field coloration

The Personal Widget Field must feel like one environment rather than independent branded cards.

Rules:

- widgets share the same neutral/material foundation;
- contextual widgets may reflect selected project color subtly;
- system widgets should not suddenly look like project-owned components;
- a widget can have a local semantic accent only when meaningful;
- personalization changes layout, not arbitrary widget color themes in V1.x.

## 22. No user-selected global accent in V1.x.0

Widget personalization does not include arbitrary color customization in V1.x.

Allowing per-user global accent colors would multiply theme/material/focus/accessibility combinations before the visual system is mature. Revisit only through an ADR if later evidence justifies it.

## 23. Project artwork luminance handling

Artwork behind text must not determine raw text color directly per pixel.

Prefer stable foreground tokens plus an adaptive environmental treatment:

- scrim/wash;
- local gradient;
- glass/solid reading plane;
- selective blur/desaturation;
- artwork repositioning/crop.

This is more predictable and accessible than trying to dynamically invert text over arbitrary imagery.

## 24. Readability adaptation

The environment may classify an artwork region broadly as `light`, `mixed` or `dark`, but the final reading treatment must still satisfy contrast requirements.

Potential response:

```text
bright artwork
→ stronger light-theme wash / darker foreground plane

dark artwork
→ controlled dark wash / light foreground

busy artwork
→ more blur/desaturation/opacity
```

The exact algorithm is technical-design work, not a visual requirement to sample every frame continuously.

## 25. Contrast requirements

As baseline accessibility targets:

- normal text: at least **4.5:1**;
- large text: at least **3:1**;
- essential UI boundaries/icons/focus: at least **3:1** against adjacent colors where WCAG applies;
- critical focus should target stronger contrast when practical.

Glass never excuses insufficient contrast.

## 26. Color independence

Information must remain understandable under common color-vision deficiencies and with saturation reduced.

Therefore:

- errors include icon/text, not red alone;
- locked/unlocked achievements differ structurally, not only hue;
- selected widgets use geometry/depth/focus, not only color;
- charts/diagrams later require labels/patterns when color distinction is essential;
- Arcade mechanics cannot depend solely on red/green distinction.

## 27. Reduced transparency

Reducing transparency does not remove project/context color completely.

Instead:

- glass becomes more opaque;
- environmental reflections reduce;
- accent remains through borders, small fills, artwork and selected-state details;
- semantic state remains unchanged.

`Transparency Off` still looks intentionally themed rather than like an unstyled fallback.

## 28. Reduced motion and color

Motion preference does not alter color meaning. Crossfades may shorten, but selected/project/environment target colors remain equivalent.

No flashing hue transitions are required to understand state.

## 29. Theme transition

Light/Dark transition may animate selected safe color properties briefly, but must avoid `transition: all` and large expensive full-screen filter animation.

Theme changes should feel like lighting changing within the same environment.

Reduced motion uses immediate or near-immediate transition.

## 30. System Chrome

Top controls and Dock remain mostly neutral so they can coexist with any project environment.

The Dock active material may receive:

- neutral optical highlight;
- very restrained contextual reflection;
- Signal/system accent where necessary.

The active destination must never become unreadable because the selected project's accent is low contrast.

## 31. Selected ProjectTile

The selected ProjectTile can use project accent more strongly than system controls because it belongs directly to Project Context.

Color works together with:

- promotion/depth;
- artwork;
- metadata reveal;
- focus/selection state;
- environment response.

Selection must remain recognizable when chroma is removed.

## 32. Achievements

Achievement artwork may have broad color diversity. Surrounding UI stays system-neutral.

Locked state must use more than grayscale alone; structural/icon/text treatment differentiates it. Secret achievements may intentionally suppress color/details until revealed.

## 33. Arcade

Arcade allows higher chroma and stronger local game palettes inside gameplay/artwork.

The System Shell remains recognizable. Strong flashes, rapid hue cycles and intense contrast changes require accessibility review and must be reducible where they are nonessential.

## 34. Channel

Channel content should not inherit arbitrary colors from external sources. External cards normalize into the portfolio's neutral content system; provider/site logos remain their own assets where allowed.

## 35. Social and Drawing

Social may use a slightly warmer neutral atmosphere, but user-generated drawings retain their authored colors inside controlled presentation surfaces.

The surrounding UI must not tint drawings so strongly that their artwork is misrepresented.

## 36. Contact

Contact is deliberately low-chroma. Project context does not dominate the form. Semantic form states use stable system semantic colors.

## 37. CV

The portfolio chrome around CV may use current theme/material tokens; the RenderCV document itself has its own print-first palette and must not blindly inherit dynamic project context.

The print/PDF palette is defined with DOC-37.

## 38. Admin

Admin uses neutral functional colors and semantic state colors. Project context is absent unless displaying a project-specific preview. Operational severity must not be confused with decorative accents.

## 39. Media and video

Image/video viewers can move toward neutral black/near-black presentation when needed to preserve media fidelity. Viewer chrome still uses system controls and accessible focus.

## 40. Texture color

Optical/Digital/Human textures from DOC-33 should usually be near-neutral or context-derived at very low opacity.

Texture must not introduce meaningful hue noise that competes with typography or selected state.

## 41. Shadows and chromatic shadows

Shadow color generally derives from neutral black/ambient environment rather than project accent.

Very subtle contextual shadow/reflection color may exist in expressive MAT-2/MAT-3 surfaces. Exact values belong to DOC-39.

## 42. Selection versus focus coloration

Selection may be project/context colored.

Focus remains system-accessible and input-oriented.

When both coexist, they must be visually distinguishable:

```text
SELECTED
→ context/material/depth

FOCUSED
→ dedicated focus ring/outline treatment
```

## 43. Hover coloration

Hover may slightly increase local contrast or contextual reflection on fine-pointer devices. It must not produce a full environmental color transition and must never be the sole indication that an action exists.

## 44. Disabled coloration

Disabled controls use reduced emphasis while maintaining readability. Do not use opacity so low that labels become inaccessible.

Disabled is visually distinct from:

- Locked;
- Loading;
- Unavailable due to network;
- Coming Soon.

## 45. Loading and stale data

Loading surfaces remain neutral. Stale/cached state uses restrained informational treatment rather than warning-red/yellow unless action is required.

External-data failure must not recolor the whole space.

## 46. Theme metadata and browser chrome

Browser metadata such as `theme-color` may adapt to Light/Dark and major environment state conservatively. Avoid updating browser chrome to every small project accent shift if it causes distracting flashes or platform inconsistencies.

## 47. Open Graph color

Dynamic OG cards may use project accents/artwork, but maintain a stable portfolio identity layer so shared cards remain recognizably related.

Exact OG compositions come later.

## 48. Color token architecture

Feature components consume semantic aliases, not raw palette names.

Preferred pattern:

```text
--color-canvas
--color-surface-solid
--color-ink-primary
--color-ink-secondary
--color-line
--color-signal
--color-focus
--color-success
--color-warning
--color-error
--color-info
--color-context-accent
--color-context-environment
```

Avoid feature code using literals such as `#78D3CC` directly.

## 49. Color spaces

Authoring/processing should prefer perceptual color spaces such as OKLCH where practical for controlled lightness/chroma transformations. Hex/sRGB values remain useful as documented/reference fallbacks.

Do not rely on naive HSL lightening/darkening for accessible theme variants.

## 50. Runtime context aliases

At runtime, the selected project can expose aliases such as:

```css
--context-accent
--context-accent-soft
--context-environment
--context-on-accent
```

Components consume aliases, never project-specific names such as `--dex-purple`.

## 51. Server rendering and first paint

The initial response should render a valid neutral theme even before client-side project/context enhancement executes.

Avoid a bright default page that flashes into Dark, or an unthemed neutral page that waits for hydration to become readable.

Theme restoration strategy is technical architecture, but preventing theme flash is an explicit UX requirement.

## 52. Persistence and privacy

Theme preference is local preference data. It does not require visitor identity or server profile.

No behavioral inference is needed to choose a theme beyond OS preference when `system` is selected.

## 53. Testing matrix

Color QA must include at minimum:

- Light and Dark;
- neutral/no-artwork project fallback;
- bright artwork;
- dark artwork;
- highly saturated artwork;
- reduced transparency;
- reduced motion;
- 200% text zoom where relevant;
- keyboard focus over variable backgrounds;
- common color-vision-deficiency simulation;
- media viewer;
- Compact and Expanded modes.

## 54. Color anti-patterns

Reject by default:

- one purple/cyan gradient used as universal identity;
- pure-black + neon as Dark theme;
- pure-white canvas everywhere in Light theme;
- project accent applied to all buttons/text;
- semantic error/success recolored by project;
- text color dynamically changing per image pixel without stable readability planes;
- low-opacity glass text justified as “aesthetic”;
- using color alone for locked/selected/error state;
- arbitrary widget color customization in V1.x.0;
- literal colors embedded throughout feature components;
- inaccessible project accents accepted because they match a logo exactly.

## 55. Implementation handoff rules

Before implementation of color-heavy components:

1. use semantic tokens;
2. test both themes;
3. test neutral and at least two very different project contexts;
4. verify focus independently from selection;
5. verify reduced transparency;
6. validate contrast;
7. avoid raw provider/project colors in generic system components.

## 56. Open items intentionally deferred

DOC-34 does not finalize:

- exact Liquid Glass opacity/blur/refraction values — DOC-39;
- shadows/elevation numeric tokens — DOC-38/39;
- typography — DOC-35;
- focus geometry/effects — DOC-40;
- individual project final accent values — project content/visual packages;
- RenderCV print palette — DOC-37;
- detailed OG templates.

## 30. Contrast verification baseline

The corrected baseline tokens were checked against the four opaque Light/Dark structural surfaces defined in this document. Normal-sized muted text now meets or exceeds the `4.5:1` target on those surfaces:

- Light muted `#5F6A70`: approximately `4.62:1–5.45:1` across Light baseline opaque surfaces.
- Dark muted `#828D93`: approximately `5.05:1–5.84:1` across Dark baseline opaque surfaces.

Accessible semantic text inks are intentionally distinct from decorative/accent hues. Glass/artwork combinations still require runtime/design QA because backdrop composition changes effective contrast.

## Decision registry

- CLR-001 — Color architecture separates System Neutrals, System Signal, Semantic Colors, Project Context and Space Bias.
- CLR-002 — Public theme modes are System, Light and Dark.
- CLR-003 — Light/Dark are tuned lighting states of one system, not inversions.
- CLR-004 — Environmental canvas avoids absolute black/white as its dominant base.
- CLR-005 — DOC-34 establishes initial Light/Dark neutral baseline tokens.
- CLR-006 — The persistent system accent family is provisionally named Signal and is used sparingly.
- CLR-007 — Focus color is independent from project/brand accent.
- CLR-008 — Success/Warning/Error/Info remain semantically stable across project contexts, with distinct accent hues and accessible text-ink tokens where required.
- CLR-009 — Text links use a stable accessible treatment rather than arbitrary project accents.
- CLR-010 — Every featured project may define separate Light/Dark visual context values using the canonical authored schema owned by DOC-36.
- CLR-011 — Important project accents are authored/validated rather than blindly derived from a logo HEX.
- CLR-012 — Project context influence is strongest in environment/hero and weakest in reading/system chrome.
- CLR-013 — Project context never automatically recolors semantic states, focus, forms or generic system controls.
- CLR-014 — DynamicBackdrop composes neutral base + project tint + artwork + readability wash + light/texture.
- CLR-015 — Every project has a valid non-image environmental fallback.
- CLR-016 — Gradients model light/depth/context rather than act as the universal brand identity.
- CLR-017 — Major spaces may have subtle neutral temperature biases but no hard independent color brand.
- CLR-018 — Widget Field shares one material/environment system; widgets do not become unrelated colored cards.
- CLR-019 — V1.0 does not expose arbitrary user-selected system/widget colors.
- CLR-020 — Artwork readability is handled through stable planes/scrims/treatments rather than per-pixel text inversion.
- CLR-021 — Accessibility contrast requirements apply equally to glass and opaque surfaces.
- CLR-022 — Meaning never relies on color alone.
- CLR-023 — Reduced Transparency preserves hierarchy/context while increasing opacity and reducing optical effects.
- CLR-024 — Theme transition feels like lighting change and respects reduced motion.
- CLR-025 — System Chrome remains mostly neutral across project contexts.
- CLR-026 — Selected ProjectTile may use contextual color more strongly than system controls.
- CLR-027 — Arcade may use higher chroma locally without changing global semantic rules.
- CLR-028 — External Channel content is normalized into system presentation rather than importing arbitrary page colors.
- CLR-029 — User drawings/media retain faithful color presentation within neutral surrounding UI.
- CLR-030 — Contact/Admin/CV favor low-chroma, functional presentation.
- CLR-031 — Selection coloration and focus coloration are semantically distinct.
- CLR-032 — Feature code consumes semantic color aliases rather than raw literal palette values.
- CLR-033 — Perceptual color spaces such as OKLCH are preferred for transformations when practical.
- CLR-034 — Runtime project context uses generic aliases rather than project-named CSS variables.
- CLR-035 — First paint must have a valid readable theme without waiting for client enhancement.
- CLR-036 — Theme preference is local and requires no account/profile.
- CLR-037 — Color QA includes variable artwork, themes, transparency, focus and color-vision testing.
- CLR-038 — Individual project final palettes remain separate visual-content decisions under this contract.

- CLR-039 — Baseline muted text tokens are `#5F6A70` (Light) and `#828D93` (Dark) to satisfy normal-text contrast on baseline opaque reading surfaces.
- CLR-040 — Semantic/material accent colors are not automatically text colors; accessible `ink` tokens are used for normal-sized semantic text.
