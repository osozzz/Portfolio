---
id: ADR-001
title: "Controlled Personal Widget Field"
record_type: adr
decision_status: APPROVED
date: 2026-09-15
affects:
  - DOC-00
  - DOC-01
  - DOC-02
  - DOC-04
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-19
  - DOC-20
  - DOC-21
  - DOC-25
  - DOC-27
  - DOC-28
  - DOC-29
  - DOC-31
  - DOC-32
  - DOC-33
---

# ADR-001 — Controlled Personal Widget Field


## Context

A central grid/field of widgets is one of the qualities that makes iiSU feel like a personal system rather than a conventional content page. The previous architecture correctly treated widgets as contextual secondary surfaces, but placed too much emphasis on right-side contextual widgets and contained a blanket V1.0 prohibition on visitor repositioning. That would weaken a core experiential goal: Home should feel inhabited and personally arranged.

At the same time, a completely free desktop/window manager would create disproportionate complexity, accessibility problems, responsive-state conflicts and a generic dashboard/windowing product that is not the portfolio's purpose.

## Decision

Home uses a **central Personal Widget Field** as a signature spatial structure. The selected Project Hero remains the primary gravitational object and can coexist within the same Personal Field.

V1.0 supports **controlled personalization**:

- pin/unpin eligible widgets;
- logical reorder;
- supported semantic size variants (`S/M/L` only where declared);
- local, versioned persistence;
- reset to defaults;
- explicit Customize mode;
- non-drag accessible controls equivalent to drag reorder.

The system retains authority over widget eligibility, safety, responsive budgets and supported sizes. User preferences never force an ineligible widget into a context.

## Responsive model

- Compact: one priority widget visible; additional eligible widgets through a Widgets sheet/shelf.
- Medium: up to two widget modules.
- Expanded: two to three widget modules around/alongside the Project Hero.
- Wide: three to four widget modules.

Preferences store logical intent (pin/order/size), **not pixel coordinates**. Responsive layout maps that intent into controlled slots.

## Explicit exclusions

V1.0 does not include:

- arbitrary x/y widget placement;
- overlap/z-order window management;
- unconstrained drag resize;
- third-party or visitor-authored widgets;
- scripting/plugin widgets;
- a freeform desktop/window manager;
- breakpoint-specific saved pixel layouts.

## Rationale

This preserves the personal, modular iiSU-like feeling while keeping the system deterministic, responsive, accessible, maintainable and portfolio-first. It creates a stronger visual signature than the earlier `primary content + right widget sidebar` interpretation.

## Consequences

Positive:

- Home feels more personal and system-like;
- returning visitors can retain lightweight ownership without accounts;
- widget placement becomes a visible product-quality feature;
- system/context widgets can coexist in stable spatial patterns;
- responsive behavior remains governed.

Costs:

- requires a versioned local preference schema/migrations;
- requires Customize-mode accessibility and focus management;
- requires responsive slot mapping and state tests;
- adds layout/reflow motion cases and visual-regression scenarios.

## Supersession

This ADR supersedes the literal interpretation of WDG-013 (“Visitors cannot build or freely reposition widgets in V1.0”). The retained intent is that **unrestricted freeform positioning remains prohibited**. WDG-013 is marked superseded and replaced by WDG-031–WDG-038.
