---
id: ADR-006
title: "three.js Signature 3D Layer and Asset Budget"
record_type: adr
decision_status: PROPOSED
date: 2026-11-09
owners:
  - Alejandro Osorno
scope: "Real-time 3D in the portfolio: where it may appear, how it renders, its fallbacks and its budget"
affects:
  - DOC-07
  - DOC-11
  - DOC-28
  - DOC-29
  - DOC-33
  - DOC-39
  - DOC-42
  - DOC-49
  - DOC-50
supersedes:
  - "DOC-33 'unnecessary 3D' rejection, only to the extent that the signature moments below are now necessary 3D"
---

# ADR-006 — three.js Signature 3D Layer and Asset Budget

## Context

The owner wants the first seconds to dazzle and asked for "a combination of both": real 3D with three.js together with refined 2D motion and materials (PROPOSAL-REOPEN-001 §3.2). DOC-33 rejects unnecessary 3D. Persepolis Reimagined is the anti-reference: a 40+ s loader that hung the browser.

## Decision

1. **Signature moments only.** 3D appears where it earns its place:
   - the Boot / first-impression scene;
   - project "objects" in the Home selector, used as physical covers;
   - an optional architecture viewer in Project Detail, drawn like a technical plan.

   Any other use needs a decision-proposal.
2. **2D chrome.** The Dock, overlays, text and Liquid Glass (DOC-39) stay 2D DOM.
3. **One stage.**
   - A single persistent WebGL context lives in the persistent shell (ADR-004) and survives navigation.
   - No page creates its own context.
4. **Loading and loop.**
   - three.js is lazy-loaded and never on the critical path.
   - The render loop runs on demand.
   - It pauses when the tab is hidden, the stage is off-screen, or the visitor prefers reduced motion.
5. **Fallbacks.** A static or 2D rendition replaces the stage when:
   - WebGL is unavailable;
   - the visitor prefers reduced motion;
   - Save-Data is on;
   - the device is low-power or low-memory.

   Content never depends on the 3D stage.
6. **Budget.**
   - Assets are compressed GLB (Meshopt or Draco) with KTX2 textures, under a per-route weight cap set in DOC-49.
   - NFR-001 (LCP < 2.5 s, CLS < 0.1, INP < 200 ms) does not relax and is measured with the stage active.
7. **Implementation.**
   - React Three Fiber inside the React stage island, so 3D shares state with the selector through nanostores.
   - Vanilla three.js is allowed if a prototype shows a concrete reason.
8. **Release.** The 3D layer ships in V1.0 (§9 Q2).

## Options considered

### Option A — Hybrid 2D + three.js signature moments (chosen)

This delivers the dazzle where it counts and keeps the chrome fast and accessible.

### Option B — 2D only

This has the lowest risk, but it fails the owner's stated intent.

### Option C — Full 3D world

This contradicts the confirmed interaction model. The portfolio is explorable but is not a walkable world, and the cost in performance and accessibility is the highest.

## Criteria and evidence

- Owner decision: "una combinación de ambas, también quiero usar three.js".
- Positive references: the A24 concept (3D objects used as a selector), Lusion (3D framed in a card) and Oryzo (CAD-style annotation).
- NFR-001, and DOC-49's performance architecture.

## Consequences

### Positive

- A distinctive first impression that also proves technical skill.
- One shared context avoids GPU memory churn between routes.

### Costs / risks

- 3D asset creation and optimization effort before V1.0.
- Risk to the GPU and battery budget on low-end devices, which the fallback matrix mitigates.
- Persistence across navigation depends on ADR-004 prototype gate 1.
- Glass rendered over a live canvas needs its own visual QA (DOC-39, DOC-50).

## Reversibility and migration

This is moderate. Because content never depends on the stage, removing it leaves the 2D fallbacks as the product.

## Security / privacy / accessibility / performance impact

- **Accessibility:** decorative 3D is hidden from assistive technology, and anything meaningful has a DOM equivalent (for example, the selector index). Reduced motion triggers the fallback.
- **Performance:** lazy-loaded, on-demand loop, per-route cap, measured as part of the V1.0 exit criteria.
- **Security:** models and textures are self-hosted static assets with no runtime third-party loaders.

## Follow-up

- DOC-33 gets the signature-moment rules, and DOC-29 the 3D motion and pause rules.
- DOC-28 gets the fallback matrix, and DOC-39 the glass-over-canvas rules.
- DOC-49 sets the numeric budget, and DOC-50 §86 adds the exit criteria.
- Open the prototype-gate issue "3D stage within DOC-49 budget" (owner-confirmed GitHub edit).
