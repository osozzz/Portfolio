---
id: DOC-35
title: "Typography, Iconography & Graphic Language"
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
  - DOC-34
  - ADR-001
decision_families:
  - TYP
  - ICO
  - GFX
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-35 — Typography, Iconography & Graphic Language

> **Purpose:** Define the typographic system, iconographic language, editorial/handwritten accents and graphic motifs that make the portfolio readable, coherent and recognizably its own without copying iiSU or any platform UI.

---

## 1. Design thesis

Typography and iconography should make the interface feel like a personal computing system rather than a designed landing page. The system should be precise enough for technical content, soft enough to support Liquid Glass and spatial navigation, and quiet enough that project artwork remains the hero.

The visual language follows one rule:

> **Typography communicates hierarchy. Icons communicate action. Graphic motifs communicate identity. None of them should compete with the selected work.**

The system therefore avoids an ornamental display-font stack, multiple unrelated icon libraries, and decorative technical graphics that imitate a sci-fi HUD.

---

## 2. Typographic architecture

The baseline uses three typographic roles rather than three equally prominent font families.

| Role | Baseline | Purpose |
|---|---|---|
| `TYPE-SANS` | **Manrope Variable** | Primary interface, reading, headings, project titles and system chrome |
| `TYPE-MONO` | **IBM Plex Mono** | Terminal, code, architecture labels, technical identifiers and selective metrics |
| `TYPE-HUMAN` | **Authored handwriting assets, not a general UI font** | Rare personal annotations, Making Of notes and deliberate human marks |

The recommendation is intentionally a **single-sans system**. The portfolio should create editorial contrast through scale, weight, measure, spacing and composition before adding another display family.

### 2.1 Why Manrope

Manrope fits the approved `Soft Future Personal Computing` direction because it is geometric without becoming cold, rounded without becoming childish, and restrained enough for long case-study reading. It can carry both system UI and larger project titles, which keeps the product feeling like one operating environment rather than a portfolio assembled from several visual styles.

It is not used to make the interface look futuristic by itself. Futurism continues to come from material, spatial hierarchy, motion and contextual environments.

### 2.2 Why not a separate display face in V1.0

A second expressive sans or serif could produce attractive marketing compositions, but it would also pull the portfolio toward an editorial website rather than a personal software system. V1.0 therefore treats a separate display family as `DEFERRED`.

A future design review may introduce one only if prototypes prove that Manrope cannot create enough hierarchy without compromising the system identity.

### 2.3 IBM Plex Mono role

IBM Plex Mono is deliberately restricted. It does **not** become the default technical aesthetic of the site.

It is appropriate for:

- Terminal input/output;
- source-code snippets;
- architecture identifiers and short technical labels;
- build/version IDs;
- selected timestamps or data where fixed-width alignment is valuable.

Normal body copy, navigation, project metadata and status labels remain in the primary sans unless a fixed-width treatment serves a real purpose.

---

## 3. Font delivery and ownership rules

Production typography must be self-hostable or otherwise have a licensing/distribution model explicitly approved for the project. Exact font files and versions are implementation dependencies and must be pinned rather than silently changing with an upstream CDN.

Baseline delivery rules:

```text
prefer variable WOFF2
subset only when language coverage remains complete
support English + Spanish characters
font-display: swap or an equivalent non-blocking strategy
no runtime dependency on a third-party font CDN
fallback stack must remain usable during font failure
```

No font file is considered approved for production merely because a prototype can load it.

---

## 4. Primary typography roles

Typography uses semantic roles rather than components selecting arbitrary sizes.

| Token family | Intended role | Baseline character |
|---|---|---|
| `display.project` | Selected project title / rare major identity | Strong, compact, never full-screen typography for its own sake |
| `display.section` | Major workspace/route heading | Clear hierarchy, quieter than project title |
| `heading.lg` | Major subsection | Editorial but system-consistent |
| `heading.md` | Widget/detail section | Compact and readable |
| `heading.sm` | Card/widget heading | Functional |
| `body.lg` | Project pitch / introduction | Comfortable reading |
| `body.md` | Default copy | Primary long-form role |
| `body.sm` | Secondary metadata/help | Never critical information at illegible size |
| `label` | Controls/system metadata | Compact, slightly tracked |
| `overline` | Rare category/system label | Optional uppercase, never body copy |
| `mono` | Code/terminal/technical identifiers | Fixed width |
| `annotation` | Human accent | Non-functional / duplicated semantically if meaningful |

---

## 5. Provisional type scale

The following values are a visual-design baseline. Implementation may express them through `rem` + `clamp()` while preserving browser zoom and text scaling.

| Role | Compact baseline | Expanded/Wide baseline | Weight | Line height |
|---|---:|---:|---:|---:|
| Project Display | 34–44px | 48–64px | 650–750 | 0.98–1.08 |
| Section Display | 28–36px | 36–48px | 650–700 | 1.04–1.12 |
| Heading LG | 24–30px | 28–36px | 650 | 1.10–1.18 |
| Heading MD | 20–24px | 22–28px | 600–650 | 1.15–1.25 |
| Heading SM | 17–20px | 18–22px | 600 | 1.20–1.30 |
| Body LG | 17–19px | 18–20px | 400–500 | 1.50–1.65 |
| Body MD | 16px | 16–18px | 400–500 | 1.55–1.70 |
| Body SM | 14–15px | 14–16px | 450–500 | 1.45–1.60 |
| Label | 12–14px | 12–14px | 550–650 | 1.20–1.35 |
| Mono | 13–15px | 13–16px | 400–500 | 1.45–1.60 |

These values are not permission to use pixel-locked typography in implementation. They define optical targets.

### 5.1 No giant marketing headline

`display.project` is large enough to establish selected-work hierarchy, but the title should not occupy most of the viewport. Artwork, Widget Field, selector and environment remain part of the hero composition.

---

## 6. Weight system

The primary sans should rely on a small number of semantic weights.

| Weight role | Baseline use |
|---|---|
| `400` | Long-form reading |
| `500` | UI/body emphasis, metadata |
| `600` | Controls, widget headings, compact titles |
| `700` | Project/major headings |

Very light typography is prohibited for body or functional UI. Extra-black typography is not part of the normal visual language.

---

## 7. Tracking and casing

Typography should feel precise rather than aggressively branded.

```text
Large project/display text     slight negative tracking
Headings                       neutral to slight negative
Body                           neutral tracking
System labels                  slight positive tracking
Overlines                      stronger positive tracking when uppercase
Mono                           neutral
```

All-caps is restricted to short system/category signals such as `ACHIEVEMENT UNLOCKED`, not paragraphs, navigation labels or long Spanish phrases.

Uppercase must never be used merely to make small text seem “technical”.

---

## 8. Reading measure

Long-form Project Detail, Making Of and other editorial content should generally stay around **60–72 characters per line**. Wide mode expands environment and supporting content instead of stretching paragraphs across the display.

Compact mode may use nearly the available width while preserving safe horizontal padding.

---

## 9. Numeric language

Numbers are part of the system identity, particularly clock, build information, progress, Arcade scores and metrics.

Baseline behavior:

```text
System clock          primary sans + tabular numerals when supported
Project metrics       primary sans by default
Arcade scores         primary sans or mono according to game context
Build/version IDs     mono
Technical identifiers mono
Dates                 primary sans
```

The site must not become monospace-heavy simply because it contains technical information.

Tabular numerals are preferred for values that update in place so surrounding geometry does not shift unnecessarily.

---

## 10. Bilingual typography

English and Spanish share the same hierarchy and fonts. English is not the “design language” with Spanish treated as a fallback.

Rules:

```text
no hard-coded line breaks shared across locales
no fixed text containers that only fit English
allow Spanish expansion in navigation and controls
set the correct lang attribute for content
preserve accented characters and punctuation
avoid visual abbreviations that become unclear when localized
```

Translation may intentionally choose different line breaks or copy length when needed, but component geometry must not depend on identical strings.

Hyphenation may be enabled selectively in long-form narrow reading contexts using language-aware browser behavior; it is not a global visual effect.

---

## 11. Handwriting / human annotation language

The approved human accent remains, but DOC-35 makes an important decision:

> **V1.0 does not use a generic handwriting webfont as a fourth functional typeface.**

Handwritten notes should ideally be authored marks: SVG/vector strokes, small image assets, or later a limited set based on Alejandro's real handwriting if desired.

This makes the accent genuinely personal instead of looking like a common script font applied to random labels.

Appropriate contexts include Making Of, rare project callouts, sketch-related content and small annotations such as a short arrow/note beside an architecture decision.

If an annotation contains meaningful information, the same meaning must exist in accessible semantic text. Decorative handwriting is `aria-hidden`.

---

## 12. Iconography direction

**Phosphor Icons** is the recommended baseline icon family for system/interface icons.

Reasons for the design choice:

```text
rounded but precise geometry
large coherent vocabulary
multiple visual weights
strong small-size readability
compatible with the soft-future material language
```

The project must use one core icon family. Adding another general-purpose line icon library is prohibited unless an ADR documents a concrete gap.

### 12.1 Weight policy

Core interface icons use one optical language:

```text
Regular  → default UI
Fill     → selective active/strong state where it improves recognition
Bold     → exceptional small-size legibility case
Duotone  → not part of core system UI in V1.0
```

State should primarily come from material, focus and selection treatment. Swapping icon style is secondary and must not be the only indication of state.

---

## 13. Custom Dock glyphs

The six Global Dock destinations are signature navigation and deserve more identity than generic stock icons.

V1.0 should therefore use a **custom Dock glyph set**, either redrawn from first principles or heavily normalized from base concepts while following the same optical grid as the system icons.

| Space | Conceptual glyph direction |
|---|---|
| Home | Modular personal field / library-space symbol rather than a literal house if legibility remains strong |
| Achievements | Badge / seal / star-based collectible symbol |
| Arcade | Game-control symbol with simplified silhouette |
| Channel | Broadcast / pulse / signal symbol |
| Social | Connected people/nodes or conversational network |
| Contact | Message / send / direct-connection symbol |

Exact paths remain a visual asset task, but the policy is approved at DOC-35 level: **the Dock should feel owned by the portfolio.**

Custom glyphs require both outline/default and active treatment where needed, and they must remain recognizable without labels at common desktop sizes. Compact may expose labels when necessary.

---

## 14. Icon optical grid

System and custom icons should normalize around a common logical artboard, with **24×24** as the primary UI construction reference and larger signature glyphs scaling from the same proportions.

Preferred rendered sizes are a controlled token set such as:

```text
16  micro/supporting
20  compact controls
24  default controls
28  prominent control
32  Dock/signature contexts
```

Hit-target size is independent from icon size. A 20px icon can live inside a 44px+ touch target.

Arbitrary icon sizes per component are prohibited.

---

## 15. Icon stroke and geometry

The icon language is soft-technical:

```text
consistent visual stroke weight
rounded line endings where appropriate
simple silhouettes
limited internal detail
optical rather than purely mathematical centering
no faux-3D icon rendering in normal system controls
```

Project-specific artwork may be illustrative; system icons remain simpler.

---

## 16. Icon semantics and accessibility

Decorative icons are hidden from assistive technology. Icon-only controls require a programmatic accessible name and usually a tooltip or visible label in contexts where discovery is weak.

Icons never replace important text merely to save horizontal space if the symbol is ambiguous.

Semantic status cannot depend on icon shape alone; status copy and/or other visual treatment accompanies it where needed.

---

## 17. Brand/service icons

Third-party brands such as GitHub or LinkedIn are an exception to the single-icon-family rule. Where a brand identity is shown, an official/current brand mark should be preferred instead of forcing a visually similar generic Phosphor glyph.

Brand marks stay optically normalized inside our own control containers and do not bring third-party colors into every context unless the brand-specific presentation actually benefits from them.

---

## 18. Graphic-language primitives

The portfolio uses a small graphic motif vocabulary rather than generic decorative geometry.

| Motif | Purpose | Visibility |
|---|---|---|
| **Field Grid** | Reinforces Personal Widget Field structure and customization | Mostly hidden; clearer during Customize mode / Making Of |
| **Signal Dot** | Live/status/presence/system activity | Small and semantic |
| **Trace Line** | Architecture/data relationships and directional explanation | Technical/editorial contexts |
| **Annotation Stroke** | Human note, arrow, circle, underline | Rare |
| **System Capsule** | Metadata/status/control grouping | Common but restrained |
| **Context Halo** | Project color/light reflected into selected material | Environmental, not textual |

No motif is required on every screen.

---

## 19. Field Grid

The grid behind the Personal Widget Field is an important identity opportunity, but it must not turn Home into a dashboard editor.

Normal mode:

```text
mostly invisible
perhaps detectable through alignment / subtle anchor relationships
```

Customize mode:

```text
slot boundaries or anchor points become legible
valid drop regions become clear
movement has deterministic destinations
```

This makes personalization understandable without permanently displaying a spreadsheet-like grid.

---

## 20. Signal Dot

A small dot/pulse motif can represent statuses such as availability, live service, currently building or active integration.

It uses semantic or System Signal color according to meaning. Motion is optional and subtle; a static dot plus label remains fully understandable.

The Signal Dot is not a decorative glowing orb repeated across the page.

---

## 21. Trace Lines and architecture graphics

Technical diagrams should inherit the portfolio system rather than rendering as default Mermaid/diagram-tool output in final presentation.

Visual direction:

```text
Manrope labels by default
IBM Plex Mono for IDs/endpoints/code identifiers
neutral nodes/surfaces
thin controlled connectors
project accent highlights only the important path/context
clear arrow semantics
minimal decorative grid
```

Diagrams prioritize comprehension over visual spectacle.

---

## 22. Code blocks

Code blocks use IBM Plex Mono and calm solid/frosted reading surfaces rather than translucent high-motion glass.

They may include:

```text
language label
copy action
filename/context when useful
line highlighting when meaningful
```

They do not imitate a fake terminal window unless the content is actually terminal output.

---

## 23. Terminal language

Terminal uses IBM Plex Mono but rejects the classic `green text on black screen` trope as the default identity.

It inherits system neutrals and System Signal. Commands, output, errors and hints may use semantic colors carefully while preserving readability.

The Terminal should feel like a hidden interface inside the same operating environment, not a retro terminal theme pasted on top.

---

## 24. Badges and achievements

Achievement artwork is a separate collectible/illustrative layer and is not limited to the Phosphor icon vocabulary.

However, surrounding UI, progress indicators, locks, actions and category navigation continue using the system iconography.

This distinction allows achievements to feel collectible without making the full interface look like a game platform clone.

---

## 25. Labels, chips and capsules

Capsules are allowed for compact metadata such as project status, technology tags, contextual state and system controls, but they are not the universal container for all text.

Avoid the common pattern where every label becomes a pill.

Technology tags should generally remain visually subordinate to the project title/pitch. A stack of twenty brightly colored framework pills is prohibited.

---

## 26. Project-specific graphic language

Projects may contribute motifs in their own Hero/Detail environments, but system components remain stable.

Examples:

```text
Retro-Lair  → restrained retro/pixel/hardware accent
Dex-Sphere  → spatial/orbital/module motifs
Tourney     → competition/bracket/data motifs
ATS         → industrial/structural imagery
```

These are content-context layers, not replacements for system typography or icons.

---

## 27. Responsive typography

Typography recomposes with the interface rather than being uniformly scaled down.

Compact priorities:

```text
shorter visual hierarchy
project title remains strong but not dominant over the whole viewport
body never drops below comfortable reading size
labels may wrap or move rather than truncate essential meaning
```

Expanded/Wide priorities:

```text
more separation between hierarchy levels
larger project title / section titles
reading measure remains constrained
extra width goes to environment, Widget Field and media rather than giant text
```

Viewport width is not the only factor; text zoom and container width must be respected.

---

## 28. Text zoom and accessibility

Hard requirements:

```text
default body text target >= 16px equivalent
critical UI cannot rely on text below readable size
200% text zoom remains usable
no fixed-height text containers for meaningful content
no essential information encoded only in font weight/case/color
body copy avoids ultra-light weights
interactive labels remain understandable without icons
```

Truncation is permitted for clearly recoverable secondary data with an accessible full value; it is not the default solution for navigation or primary content.

---

## 29. Loading and font failure

The interface must remain functional if the custom fonts fail or arrive late.

Fallback typography should preserve approximate metrics as much as practical to reduce layout shift. Font loading may refine the interface; it must not reveal previously hidden content or gate interaction.

No text begins invisible solely waiting for a webfont.

---

## 30. Performance budget

Typography and iconography should stay lightweight enough that they do not undermine the portfolio's performance goals.

Baseline strategy:

```text
one primary variable sans
one mono family
no general handwriting webfont
icons imported/tree-shaken by use rather than shipping an unnecessary complete runtime set
custom Dock SVGs shipped as local assets/components
```

The actual bundle impact is validated during implementation.

---

## 31. Graphic anti-patterns

The following are explicitly outside the visual language:

```text
five unrelated icon libraries
Space Grotesk / monospace everywhere solely to look "tech"
giant typography used as a substitute for composition
all-caps navigation throughout the product
random handwritten notes on every screen
rainbow technology pills
HUD corner brackets on ordinary panels
fake command-line chrome around non-terminal content
permanent visible dashboard grid
neon outline icons
emoji as primary system icons
brand logos recolored into misleading states
icons without accessible names in interactive controls
```

---

## 32. Component implementation contract

Components should consume semantic typography/icon tokens rather than hard-coded visual values.

Conceptually:

```ts
TypographyRole =
  | "display-project"
  | "display-section"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "label"
  | "mono"

IconSize = "micro" | "compact" | "default" | "prominent" | "signature"
```

Exact implementation naming can change; the semantic separation must remain.

---

## 33. Implementation-tool rules

Implementation tooling follows rules equivalent to:

```text
Use the approved typography roles; do not invent component-local font scales.
Use Manrope for normal UI/content and IBM Plex Mono only for defined technical roles.
Do not add a new font family without design approval.
Do not add another general-purpose icon library without ADR review.
Use Phosphor for standard interface icons and the custom Dock glyph set for global navigation.
Do not use handwriting for functional UI.
Do not hard-code icon sizes outside approved size tokens.
Do not make project-specific branding override system typography/iconography.
Preserve ES/EN expansion and browser text zoom.
```

---

## 34. Validation scenarios

Before final implementation, typography/iconography must be visually checked against at least these scenarios:

| Scenario | What must hold |
|---|---|
| Home / Expanded | Project title, selector, Widget Field and Dock have distinct hierarchy |
| Home / Compact / ES | Spanish labels wrap/recompose without clipping |
| Project Detail | Long-form body remains comfortable and editorial |
| Making Of | Mono + annotation accents enrich but do not overwhelm |
| Terminal | Mono feels integrated, not retro cliché |
| Achievements | Badge art can be expressive while UI remains consistent |
| Contact | Typography becomes calm/professional |
| CV Surface | Portfolio chrome does not contaminate PDF readability |
| 200% text zoom | Navigation and content remain operable |
| Font failure | System fallback remains functional |

---

## DOC-35 — Decision Registry

| ID | Decision |
|---|---|
| TYP-001 | Primary typography baseline is **Manrope Variable** |
| TYP-002 | V1.0 uses one primary sans family across UI, headings and reading content rather than a separate display family |
| TYP-003 | **IBM Plex Mono** is the technical/terminal/code family |
| TYP-004 | Monospace usage is intentionally restricted and does not become the site's default technical aesthetic |
| TYP-005 | V1.0 does not ship a generic handwriting webfont for functional or decorative UI |
| TYP-006 | Human annotations are preferably authored vector/graphic marks and may later derive from Alejandro's handwriting |
| TYP-007 | Typography is consumed through semantic roles rather than component-local arbitrary sizes |
| TYP-008 | Project display typography remains strong but never becomes a giant marketing hero that replaces the spatial composition |
| TYP-009 | Default body reading target is at least 16px equivalent and supports 200% text zoom |
| TYP-010 | Long-form reading measure targets roughly 60–72 characters per line |
| TYP-011 | Weight hierarchy centers on 400/500/600/700 and avoids ultra-light functional text |
| TYP-012 | All-caps is restricted to short system/category signals |
| TYP-013 | Tabular numerals are preferred where updating numeric geometry benefits from fixed width |
| TYP-014 | English and Spanish share equal typographic priority; hard-coded shared line breaks are prohibited |
| ICO-001 | **Phosphor Icons** is the baseline general-purpose system icon family |
| ICO-002 | The interface uses one general-purpose icon family unless an ADR approves another |
| ICO-003 | Regular is the default icon weight; fill/bold are restricted semantic/optical variants; duotone is not core V1.0 UI |
| ICO-004 | The six Global Dock destinations receive a custom signature glyph set aligned to the system optical language |
| ICO-005 | Custom Dock glyphs prioritize recognition and system ownership over novelty |
| ICO-006 | 24×24 is the primary icon construction reference with a controlled rendered-size token set |
| ICO-007 | Icon hit target is independent from visual icon size |
| ICO-008 | Icon-only interactive controls require accessible names |
| ICO-009 | Official brand marks are permitted exceptions to the system icon family |
| GFX-001 | Graphic identity uses a restrained motif vocabulary: Field Grid, Signal Dot, Trace Line, Annotation Stroke, System Capsule and Context Halo |
| GFX-002 | The Field Grid is mostly invisible in normal use and becomes legible during Widget customization |
| GFX-003 | Architecture diagrams use portfolio typography/materials instead of unstyled diagram-tool defaults in final presentation |
| GFX-004 | Code surfaces are reading surfaces, not fake terminal windows |
| GFX-005 | Terminal inherits the portfolio palette rather than defaulting to green-on-black nostalgia |
| GFX-006 | Achievement badge artwork may be more illustrative than normal system icons |
| GFX-007 | Capsules/pills are used selectively and do not become the universal text container |
| GFX-008 | Project-specific motifs may affect content/environment but never replace global typography/iconography |
| GFX-009 | Typography and icon assets are performance-budgeted and must have approved licensing/distribution before production |
| GFX-010 | Font/icon failure must not prevent core portfolio use |

---

## 35. Approval record

DOC-35 is approved with **Manrope + IBM Plex Mono + authored human annotations + Phosphor system icons + custom Dock glyphs** as the baseline. Exact font package versions, custom Dock paths and final optical tuning remain implementation/asset work, not open architectural questions.
