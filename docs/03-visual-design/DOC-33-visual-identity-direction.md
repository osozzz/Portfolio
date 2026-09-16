---
id: DOC-33
title: "Visual Identity & Design Direction"
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
  - ADR-001
decision_families:
  - VID
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-33 — Visual Identity & Design Direction


## 1. Purpose

Define the visual personality of the portfolio before choosing exact color values, fonts, radii, blur amounts or implementation tokens.

## 2. Visual north star

> **A calm future-facing personal computing environment where Alejandro's work becomes the world around the interface.**

Working direction name:

> **Soft Future Personal Computing**

The interface should feel advanced, tactile and alive while remaining warm, clear, professional and recognizably personal.

## 3. Direction blend

The recommended identity combines approximately:

- **65% Soft Future Console** — spatial selection, collections, depth, contextual artwork, modular surfaces, console-like exploration;
- **30% Personal Computing Editorial** — readable case studies, strong typographic hierarchy, professional evidence, architecture/content clarity;
- **5% Future Nostalgia** — controlled accents reserved mainly for Arcade, Retro-Lair, Terminal, Boot, 404 and secrets.

These percentages are design guidance, not literal measured output.

## 4. Core tension

The portfolio must balance an exploratory software environment with professional portfolio clarity. Too much console language becomes a fictional game UI; too much editorial restraint becomes another premium developer website. The identity exists in the controlled coexistence of both.

## 5. iiSU inspiration boundary

iiSU remains the strongest reference for **spatial browsing and personal-system feeling**: selectors, neighboring items, contextual widgets, persistent chrome, focus hierarchy and content that appears to inhabit a system.

Do not copy iiSU logos, proprietary artwork, icons, sounds, exact typography, exact layouts or branded assets. The final identity must be recognizably this portfolio rather than “iiSU with Alejandro's projects.”

## 6. Primary visual signatures

The highest-priority signatures are:

1. **Spatial Project Selector** — browsing feels like moving through a collection rather than changing cards.
2. **Personalizable Widget Field** — a central modular field that makes Home feel inhabited and personally arranged.
3. **Liquid Glass Global Dock** — persistent system navigation with a controlled moving selection material.
4. **DynamicBackdrop** — project-driven environmental atmosphere rather than wallpaper.
5. **Selected-object gravity** — selected objects gain perceptual mass through depth, definition, information and environmental influence.
6. **Human/editorial details** — restrained handwriting/annotations and editorial composition that keep the system personal.

## 7. Personal Widget Field

The central Widget Field is not a decorative sidebar. It is one of the primary reasons the interface should feel like personal computing. Expanded/Wide Home should read more like an inhabited modular space than `selector → content → sidebar`.

The selected Project Hero coexists with 2–4 contextual/system widget modules depending on responsive mode. Visual asymmetry is encouraged, but implementation remains a controlled grid/slot system.

### 7.1 Visual character

The field should:

- feel spatial and modular;
- allow varied but coherent widget spans;
- preserve open/negative space;
- avoid a uniform bento/SaaS dashboard appearance;
- let the selected Project Hero retain dominance;
- allow stable system widgets and selection-reactive context widgets to coexist;
- visibly benefit from local personalization without becoming a desktop window manager.

### 7.2 Controlled personalization

Approved behavior from ADR-001 includes pin/unpin, reorder, supported semantic sizes, local persistence and reset. Visual design must provide a distinct Customize mode and meaningful affordances without showing drag handles permanently during normal browsing.

Drag may be an enhancement, but explicit Move/Size controls remain available. The layout never exposes arbitrary pixel placement, overlaps or unconstrained resizing.

### 7.3 Responsive expression

- **Wide:** fullest expression; 3–4 widgets plus Project Hero and ambient space.
- **Expanded:** 2–3 widgets plus Project Hero.
- **Medium:** approximately 2 controlled widget modules.
- **Compact:** Project Hero + one priority widget; remaining eligible widgets move to a dedicated Widgets sheet/shelf.

Responsive design preserves personalization intent, not identical geometry.

## 8. Selected-object gravity

Selection should feel like an object acquiring perceptual mass. It may gain depth, size/promotion, definition, richer metadata, stronger artwork presence and subtle reflected light. Neighbors remain visible but recede.

## 9. System Identity vs Project Identity

**System Identity** remains stable: typography base, Dock/system controls, shape/material language, motion grammar, iconography and focus hierarchy.

**Project Identity** may contribute: accent, hero/environment artwork, secondary tint, visual motif and media.

Project identity influences the world without repainting every control/text/border.

## 10. Futurism

Future-facing behavior comes from material, depth, responsiveness and context awareness rather than cyberpunk clichés. Avoid neon-everywhere, HUD corners, matrix rain, decorative hexagons, fake technical readouts or generic Web3 styling.

## 11. Warm technology

Soft reflections, rounded-but-disciplined geometry, natural motion, project imagery and small human annotations prevent cold enterprise software. The system represents a person, not a fictional corporation.

## 12. Professionalism

Professionalism means clarity, readability, restraint, consistency, credible evidence and predictable interaction—not a generic corporate layout. Reading-heavy surfaces intentionally become calmer than expressive navigation/material surfaces.

## 13. Personality attributes

Curious, technical, tactile, calm, playful, precise, personal and premium in craft/quality rather than luxury. Avoid corporate, generic SaaS, crypto/Web3, cyberpunk, gamer-RGB, childish, Apple-clone, retro-only and unusable concept-art aesthetics.

## 14. Liquid Glass direction

Liquid Glass belongs to the selected environment. It can respond through depth, restrained refraction, contextual tint, reflection and internal light rather than simply using transparent rectangles. The goal is optical flexibility, not literal water/gelatin, and not an Apple clone.

The more important reading becomes, the quieter/more opaque the material becomes.

## 15. DynamicBackdrop

Backdrop creates atmosphere before literal poster display. Environmental art can be cropped, blurred, desaturated, gradient-washed or partially obscured. Hero Artwork can remain more recognizable than Environmental Artwork. Gradients are lighting/context tools, not the brand itself.

## 16. Light and Dark

Light and Dark are two lighting conditions of the same system, not simple inversion. Light is airy/luminous/frosted; Dark is deep charcoal/neutral with controlled environmental tint, not pure black + neon. Project accents may use perceptually tuned variants across themes.

## 17. Human layer / handwriting

Handwriting is a rare accent for Making Of notes, architecture callouts, tiny captions and sketch-like annotations. It is not navigation, body copy, forms, CV typography or universal headings.

## 18. Future nostalgia

Future Nostalgia is seasoning. Console terminology, terminal culture, memory-card references, pixel-era cues and subtle CRT/retro motifs can appear in Arcade, Retro-Lair, Terminal, secrets and Boot. Core UI remains modern.

## 19. Space-specific emotional temperature

- Home: calm/modular/project-driven.
- Achievements: collectible/symbolic but coherent.
- Arcade: most playful/expressive.
- Channel: information-focused, moderate density.
- Social: warmer/human/creative.
- Contact: calmest professional surface.
- CV: disciplined/printable/readable.
- Making Of: strongest editorial + annotations + diagrams blend.
- Admin: operational density over cinematicity.

## 20. Iconography direction

Exact set is deferred to DOC-35. Direction: simple, rounded-but-precise, consistent stroke, technical but friendly, recognizable small. Dock destination icons may receive custom signature variants.

## 21. Geometry direction

Use a hierarchy of soft large containers, compact capsules and precise internal alignment. Avoid one giant radius for everything. Exact geometry belongs to DOC-38.

## 22. Depth and lighting

Depth comes from scale, overlap, shadow, blur, contrast, light and motion—not huge box shadows alone. Exact optical light behavior belongs to DOC-39.

## 23. Calm at rest

The interface must retain personality with animation disabled. Energy rises at meaningful transitions and returns to calm.

## 24. Artwork strategy

Support screenshots, 3D renders, architecture diagrams, photography, logos, UI mockups and illustrations. Featured projects should receive prepared portfolio artwork when valuable; raw screenshots do not automatically become hero art.

## 25. Colombian identity

Do not force literal Colombian symbols, flag colors, coffee/mountain motifs or stereotypes. Identity remains globally legible; personal/cultural character can emerge naturally through language, stories and selected details.

## 26. Bilingual parity

Spanish and English are equal visual products. Components support Spanish expansion and English compactness without treating either as secondary.

## 27. Personal brand

Alejandro Osorno may appear clearly; a giant AO monogram is not required. A small system glyph may later support Boot/favicon/OG if exploration justifies it. Stronger branding comes from interaction, composition, material and motion.

## 28. Texture language

Three conceptual families:

- Optical — reflection/refraction/glow;
- Digital — grain/subtle dither;
- Human — handwriting/sketch marks.

Use selectively.

## 29. Visual anti-patterns

Reject by default:

- generic dark developer portfolio;
- purple-gradient-as-identity;
- neon cyberpunk;
- glass cards everywhere;
- random gradient blobs;
- unnecessary 3D;
- oversized typography as the only idea;
- giant “Hi, I'm Alejandro” hero/CTA template;
- trendy uniform bento grid;
- excessive pills;
- fake-terminal homepage;
- gamer RGB UI;
- constant particles/background movement;
- Apple Liquid Glass clone;
- iiSU visual copy;
- generic SaaS widget dashboard.

## 30. Landing hierarchy

Selected work is the hero. Personal identity lives in System Chrome/content rather than a conventional centered introduction CTA.

`selected work / Personal Field → primary information/actions → contextual modules → system chrome → ambient environment`

## 31. Identity equation

`iiSU spatial softness + personalizable Widget Field + selected-object gravity + personal computing + editorial professionalism + Liquid Glass depth + project atmosphere + small human imperfections + controlled future nostalgia = Alejandro Portfolio`

## 32. Evaluation questions

1. Does this reinforce Soft Future Personal Computing?
2. Does selected work remain protagonist?
3. Does the Widget Field feel personal/spatial instead of dashboard-like?
4. Does this look owned rather than trend-copied?
5. Is professional readability preserved?
6. Does it still work without animation?
7. Can Light/Dark both express it?
8. Can Compact recompose it without losing meaning?

## Decision registry

- VID-001 — Main direction is **Soft Future Personal Computing**.
- VID-002 — Identity blends Soft Future Console + Personal Computing Editorial, with Future Nostalgia as an accent.
- VID-003 — iiSU is an interaction/spatial reference, not a visual template to copy.
- VID-004 — Selected work is the primary Home hero.
- VID-005 — Selection visually behaves like a center of gravity.
- VID-006 — System Identity and Project Identity remain separate.
- VID-007 — Projects may influence artwork/environment/accents without recoloring the whole system.
- VID-008 — Futurism comes mainly from behavior/material/depth, not cyberpunk clichés.
- VID-009 — Identity is technical but warm/human.
- VID-010 — Liquid Glass is contextual to project/world and does not clone Apple.
- VID-011 — Reading surfaces reduce material expressiveness for clarity.
- VID-012 — DynamicBackdrop creates atmosphere before literal poster display.
- VID-013 — Light/Dark are two tuned lighting conditions of one system.
- VID-014 — Future Nostalgia is mainly reserved for Arcade/Retro-Lair/Terminal/Boot/secrets.
- VID-015 — Handwriting is a rare human accent, never primary functional typography.
- VID-016 — System supports diverse media/art types without forcing one visual medium.
- VID-017 — Featured projects receive prepared portfolio artwork where valuable.
- VID-018 — No forced literal Colombian iconography; identity remains global/personal.
- VID-019 — English and Spanish have equal visual priority.
- VID-020 — Personal brand comes primarily from interaction/composition/material/motion rather than a large monogram.
- VID-021 — Texture language is Optical / Digital / Human.
- VID-022 — Interface retains personality while completely still.
- VID-023 — Visual energy rises only at meaningful moments and returns to calm.
- VID-024 — Admin shares visual foundations but prioritizes density/operation.
- VID-025 — Personality comes from behavior/composition before decoration.
- VID-026 — DOC-33 visual anti-patterns are rejected by default.
- VID-027 — Home does not use a conventional giant “Hi, I'm Alejandro” hero.
- VID-028 — Selected work outranks chrome/environment visually.
- VID-029 — Identity deliberately contrasts digital precision with small human details.
- VID-030 — Visual north star is “A calm future-facing personal computing environment where Alejandro's work becomes the world around the interface.”
- VID-031 — Central Personal Widget Field is a primary visual signature.
- VID-032 — Widget Field must not degrade into a uniform SaaS dashboard.
- VID-033 — Visual asymmetry is built over a controlled responsive slot/grid system.
- VID-034 — Selected Project Hero may coexist spatially inside the Personal Field without becoming a widget.
- VID-035 — Expanded/Wide are the fullest expressions of the Widget Field.
- VID-036 — Compact recomposes the field to one primary widget plus a Widgets surface.
- VID-037 — Controlled personalization includes pin/unpin, logical order and supported sizes.
- VID-038 — Widget personalization persists locally without visitor accounts.
- VID-039 — V1.0 excludes unrestricted freeform desktop/pixel positioning/window management.
- VID-040 — System Widgets and Context Widgets may coexist in the same field.
