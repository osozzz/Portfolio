---
id: DOC-23
title: "Input System"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - INP
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-23 — Input System


## Purpose

Map mouse/trackpad, keyboard, touch and gamepad into one logical interaction model.

`PHYSICAL INPUT → INPUT ADAPTER → SEMANTIC ACTION → INTERACTION CONTEXT → RESPONSE`

Avoid key-specific behavior scattered across features.

## Semantic action vocabulary

Navigation:

- PREVIOUS_ITEM / NEXT_ITEM
- PREVIOUS_SECTION / NEXT_SECTION
- PREVIOUS_TAB / NEXT_TAB
- GO_HOME

Interaction:

- CONFIRM
- BACK
- OPEN_DETAILS
- OPEN_MEDIA
- OPEN_CONTEXT

System:

- OPEN_COMMAND_PALETTE
- OPEN_SETTINGS
- TOGGLE_SOUND
- TOGGLE_THEME

Utility:

- UNDO
- REDO
- SAVE
- CANCEL

Arcade-scoped examples:

- MOVE_LEFT
- MOVE_RIGHT
- JUMP
- PAUSE

Actions are contextual rather than globally active everywhere.

## Interaction context stack

Conceptual stack:

`SYSTEM → WORKSPACE → DETAIL → OVERLAY / UTILITY`

The highest valid context handles an action.

Priority:

1. system-critical dialog
2. temporary overlay
3. major overlay/detail
4. utility/game scope
5. workspace
6. shell

## Input modes

- pointer
- keyboard
- touch
- gamepad

Trackpads are primarily pointer input.

The last meaningful input may change action hints, focus styling, cursor behavior and coach marks. Synthetic/noisy events must not cause unwanted mode switching.

Use a centralized `InputModeManager`; components do not independently detect input type.

## Keyboard

Preserve browser conventions:

- Tab / Shift+Tab — focus traversal
- Space / Enter — normal control activation
- arrows — app navigation only inside composite controls
- Escape — semantic BACK

Do not hijack arrows in text inputs, selects, contenteditable or Drawing text tools.

Use roving tabindex for composite components. Tab moves between logical groups; arrows move within them.

Text-entry contexts suppress conflicting global shortcuts. Typing a message must never accidentally mute audio or navigate.

Core shortcuts:

- Cmd/Ctrl+K — Command Palette
- Escape — Back
- Enter — Confirm where appropriate
- `?` — Help/Controls candidate
- optional Cmd/Ctrl+1..6 — direct major-space shortcuts

Avoid many unmodified single-letter global shortcuts in V1.x.

## Focus vs selection

Focus and selection remain independent. Example: Dex remains selected while a widget receives focus.

Primary browse selectors may use **selection follows navigation** for keyboard/gamepad. Leaving the selector with Tab does not change selection.

## Pointer

Pointer supports hover, click, drag, wheel and cursor feedback.

- hover = enhancement only
- click = select/activate as defined by component
- no required double-click behavior

Custom cursor is optional enhancement only. Keep the real system pointer usable; no delayed blob cursor.

Magnetic Dock effects, if any, are visual only; hitboxes remain stable.

Wheel maps to selection only on the explicit selector surface. Never globally capture normal scrolling.

## Touch

Touch is first-class input, not “mouse without hover”.

Supported concepts:

- tap
- swipe where appropriate
- drag where appropriate
- long press only as optional enhancement
- pinch only in explicit zoom contexts

No essential double-tap, long-press, swipe-only or drag-only action.

Compact Project carousel:

- swipe left → next
- swipe right → previous
- explicit arrows/tappable alternatives remain
- use axis locking and gesture thresholds
- system edge gestures win

Prefer Pointer Events API for shared pointer/touch/stylus behavior.

## Drawing input

V1.0 tools:

- Pen
- Eraser
- Text
- Basic shape
- Color
- Stroke width
- Undo
- Redo
- Clear
- Save
- Publish

Pointer flow:

`pointerdown → begin`  
`pointermove → append/update`  
`pointerup → commit`

Use pointer capture. One-finger drawing is core. Stylus works through Pointer Events; pressure is future enhancement.

Do not promise full palm rejection because browser/device support varies.

Undo granularity is semantic: one stroke, one shape, one text placement.

Save Local and Publish are distinct. Nothing uploads before explicit publication.

## Gamepad

Progressive enhancement through browser Gamepad API and centralized adapter/dispatcher.

Logical controls:

- PRIMARY / SECONDARY / TERTIARY / QUATERNARY
- BUMPER_LEFT / BUMPER_RIGHT
- DPAD_* 
- START / MENU

D-pad is primary V1.0 navigation. Analog is secondary.

Centralize dead zones and held-button repeat. A press fires immediately, followed by controlled repeats after a hold delay.

Disconnect never destroys state. Show a recoverable controller-disconnected state and allow keyboard/touch fallback.

Arcade owns a temporary scoped input context while global pause/back remains available.

Touch Arcade controls appear only for touch contexts.

## Action hints

Use semantic hints:

```tsx
<ActionHint action="CONFIRM" />
```

The system renders keyboard/controller/touch-appropriate output. Do not hardcode “Press A” inside feature components.

Screen readers receive meaningful labels such as “Open project details”, not raw key instructions.

## Input during animation

Input is accepted during visual transitions. Motion retargets instead of queueing complete actions.

High-frequency pointermove, drawing and gamepad polling should avoid global React re-renders. Prefer refs, requestAnimationFrame and local state machines where appropriate.

## Forms

Normal form semantics win.

- Enter may submit simple single-line forms when valid.
- Multiline Enter inserts newline.
- explicit Send remains available.
- optional Cmd/Ctrl+Enter requires deliberate documented use.

Destructive Admin/Local Data actions require deliberate confirmation regardless of input device.

## Focus presentation

Use `:focus-visible` and input-aware visual treatment:

- pointer — local hover/selected feedback
- keyboard — strong focus
- gamepad — strongest spatial focus
- touch — brief pressed/selected feedback

Never remove visible focus.

## Visibility/cancellation

Handle pointercancel, touch interruption, tab visibility and orientation changes without leaving stuck state.

On `visibilitychange`:

- pause Arcade
- safely finish/cancel active Drawing action
- reduce/stop gamepad polling
- avoid replaying queued transitions on return

## Privacy

Do not log raw keystrokes, cursor trails or unpublished drawing data for analytics. Aggregate input-mode adoption may be measured later if privacy-safe.

## Testing

Test mouse/trackpad, keyboard-only, touch, gamepad where applicable and screen-reader compatibility.

Unit test adapters separately from feature behavior. E2E covers keyboard and representative mobile touch flows. Gamepad can use mocks/specialized tests.

## Decision registry

- INP-001 — Major interactions map physical input to semantic actions.
- INP-002 — Supported input modes: pointer, keyboard, touch and gamepad.
- INP-003 — Latest meaningful input controls contextual hints.
- INP-004 — Noisy/synthetic events must not cause unwanted mode changes.
- INP-005 — Tab retains native focus semantics.
- INP-006 — Arrows navigate composite controls.
- INP-007 — Text contexts suppress conflicting shortcuts.
- INP-008 — Hover enhances but never gates capability.
- INP-009 — Double-tap/double-click is never required.
- INP-010 — Touch gestures always have visible alternatives.
- INP-011 — Pointer Events are preferred for shared pointer/touch/stylus input.
- INP-012 — Drawing uses pointer capture and stroke/action-level undo.
- INP-013 — Drawings remain local until explicit publication.
- INP-014 — Gamepad is progressive enhancement.
- INP-015 — D-pad is primary V1.0 gamepad navigation.
- INP-016 — Controller prompts adapt where reliably detected.
- INP-017 — Gamepad repeat/dead-zone logic is centralized.
- INP-018 — Arcade owns scoped game input.
- INP-019 — Action hints are semantic, not hardcoded strings.
- INP-020 — Input remains accepted during animations.
- INP-021 — Rapid input retargets rather than queues transitions.
- INP-022 — Reduced motion never changes functional behavior.
- INP-023 — Focus presentation adapts to input mode.
- INP-024 — Onboarding adapts to detected input.
- INP-025 — High-frequency input avoids unnecessary React state.
- INP-026 — Losing tab focus safely pauses/cancels active interactions.
- INP-027 — Disconnect never destroys navigation state.
- INP-028 — Custom cursor is optional enhancement only.
- INP-029 — Destructive actions require deliberate confirmation.
- INP-030 — Input abstraction remains simpler than the features it supports.
