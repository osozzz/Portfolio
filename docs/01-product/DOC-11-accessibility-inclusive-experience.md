---
id: DOC-11
title: "Accessibility & Inclusive Experience Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-07
  - DOC-20
  - DOC-23
  - DOC-28
decision_families:
  - A11Y
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-11 — Accessibility & Inclusive Experience Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Governing rule

> **Accessibility may simplify presentation, but must never remove capability.**

The public core should be built toward WCAG 2.2 AA-compatible behavior, with manual review for interaction patterns that automated tools cannot validate.

## 2. Semantic structure

Use native semantic HTML wherever possible: headings, links, buttons, forms, landmarks and lists. Custom application-like composites use established ARIA patterns only when native semantics do not fit. Do not create `div`-button interfaces unnecessarily.

## 3. Keyboard

- Tab/Shift+Tab retain normal focus traversal.
- Arrow keys navigate composite controls such as selectors/grids, not the whole page indiscriminately.
- Enter/Space activation follows control semantics.
- Escape/Back follows documented least-destructive surface hierarchy.
- Skip-to-main and logical landmark navigation exist.
- No keyboard traps.

## 4. Focus

Focus is always visibly distinguishable from selection/active state. Focus styling must work over bright/dark dynamic backgrounds, reduced transparency and forced/high-contrast modes. Opening transient surfaces moves focus intentionally and restores it on close.

## 5. Screen readers

Controls have meaningful names describing action (`Open Dex-Sphere media`, not just `Media`). Dynamic selection updates avoid noisy full-panel live announcements. Status/success/achievement feedback uses restrained live regions. Important content relationships do not rely on glass color/glow alone.

## 6. Motion

Honor OS/browser `prefers-reduced-motion` and product setting. Remove or shorten large translations, parallax, spring overshoot and continuous ambient motion. Direct manipulation (drawing/dragging) remains immediate rather than disabled.

## 7. Transparency/readability

Reduced/off transparency uses opaque/solid materials, visible boundaries and focus outlines. Text-heavy reading surfaces can use MAT-0/MAT-1 even when surrounding UI uses glass.

## 8. Touch and motor accessibility

- comfortable hit areas;
- no required double tap/click;
- no required long press;
- swipe/drag essentials have visible alternatives;
- system edge gestures win over custom gestures;
- coarse-pointer control sizing can differ from fine pointer.

## 9. Zoom/text scaling

Core workflows must remain usable at 125%, 150% and 200% browser/text scaling. Avoid fixed-height text boxes and disabling mobile text adjustment just to preserve screenshots.

## 10. Color/contrast

Color is never the sole state signal. Final visual design must verify text, focus and control contrast against variable project artwork and both themes. Locked/secret/new/error states include structural/icon/text cues.

## 11. Forms

Persistent visible labels; clear errors associated to fields; required status communicated semantically; autocomplete/input types where appropriate; errors preserve user-entered data; software keyboard does not hide focused fields/actions.

## 12. Media

Images require meaningful alt text when informative and empty alt when decorative. Videos need captions/transcripts if they carry essential information. Architecture diagrams need textual summaries or equivalent accessible explanation.

## 13. Orientation

No public capability requires orientation lock. Portrait remains functional even if landscape is recommended for Drawing/Arcade/Media.

## 14. Gamepad

Gamepad is progressive enhancement. Controller prompts never replace keyboard/touch access. Focus is particularly visible for gamepad users.

## 15. Testing

Release review includes automated scanning plus manual keyboard, zoom, reduced-motion/transparency and representative screen-reader review for core routes. Drawing/Arcade need specialized accessibility review rather than assuming standard form patterns apply.

## 16. Decisions

- **A11Y-001** Accessibility is a cross-cutting acceptance criterion, not post-launch remediation.
- **A11Y-002** WCAG 2.2 AA-compatible public core is the target direction.
- **A11Y-003** Native semantics are preferred over custom ARIA widgets.
- **A11Y-004** Reduced presentation never removes route/action capability.
- **A11Y-005** Essential actions never depend exclusively on hover, sound, color, gamepad or gesture.
