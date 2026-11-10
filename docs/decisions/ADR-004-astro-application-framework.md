---
id: ADR-004
title: "Astro Application Framework and Island Architecture"
record_type: adr
decision_status: PROPOSED
date: 2026-11-09
owners:
  - Alejandro Osorno
scope: "Application framework, rendering model, cross-island state and Project Detail presentation for V0–V1.x"
affects:
  - DOC-02
  - DOC-06
  - DOC-08
  - DOC-13
  - DOC-19
  - DOC-23
  - DOC-27
  - DOC-29
  - DOC-31
  - DOC-33
  - DOC-36
  - DOC-40
  - DOC-41
  - DOC-42
  - DOC-43
  - DOC-44
  - DOC-45
  - DOC-46
  - DOC-47
  - DOC-48
  - DOC-49
  - DOC-50
  - DOC-51
supersedes:
  - "DOC-08 §2 'Web application: React with Next.js' and every Next.js App Router mechanism derived from it"
  - "DOC-42 §14–15 parallel/intercepting-route Project Detail design"
---

# ADR-004 — Astro Application Framework and Island Architecture

## Context

The approved baseline (DOC-08 §2, DOC-41–DOC-51) assumed React with the Next.js App Router. About 210 lines in roughly 16 documents depend on Next.js mechanisms: Server Components, `use client`, Route Handlers, Server Actions, parallel and intercepting routes, `next/*` modules and `revalidatePath`/`revalidateTag`.

The owner prefers to build on Astro (PROPOSAL-REOPEN-001 §3.6). Most of the portfolio is static, content-heavy pages with a few rich interactive surfaces, which suits an islands model. The parts that must survive navigation are the Dock, the chrome, the audio player (ADR-005) and the 3D stage (ADR-006).

## Decision

1. **Framework.** Astro replaces Next.js as the application framework. TypeScript remains the language.
2. **Output.** Pages are static by default. Server rendering through the Vercel adapter is used only for the routes and endpoints that need it:
   - Contact;
   - Guestbook and Sketch submissions;
   - moderation and Admin;
   - Arcade score sessions;
   - anonymous presence (V1.4);
   - live-data refresh where it cannot be static.
3. **Persistent shell.** Astro View Transitions (`ClientRouter`) with persisted elements keep the chrome, Dock, audio player and 3D stage alive across navigation. This is a **prototype gate**: it must be proven before feature work depends on it.
4. **Islands.**
   - React handles the complex interactive islands: project selector, widgets, Settings, overlays, audio player, 3D stage.
   - Plain Astro, with no client JavaScript, renders content pages, the CV, the blog and project text.
   - Plain TypeScript with canvas, outside React, powers the Drawing Pad and the Arcade games.
5. **Cross-island state.** nanostores carry shared state, such as selection → backdrop → widgets, so islands stay decoupled.
6. **Content.** Astro Content Collections with schema validation hold the canonical professional data (DOC-36), the blog (ADR-007) and the manual Dev Log entries.
7. **Server mutations.** Astro Actions and/or API endpoints are thin transports over the application services. DOC-43's layering stays and only its Next.js mechanics change.
8. **Project Detail over Home.** This replaces DOC-42 §14–15.
   - Project Detail is a real route, `/[locale]/projects/[slug]`. Opened directly, it renders as a full page.
   - Opened from Home, it appears as a floating surface over the persisted Home through View Transitions.
   - This is a **prototype gate** and replaces the premise of issue #101.
9. **Unchanged.**
   - Tailwind, CSS variables and design tokens.
   - Motion inside React islands.
   - Supabase/PostgreSQL with RLS and admin-only auth.
   - Vercel, Resend, Sentry.
   - Vitest, Storybook with an Astro-compatible setup, Playwright, pgTAP.
   - GitHub Actions FAST/STANDARD/DEEP.

## Options considered

### Option A — Astro hybrid + React islands + nanostores (chosen)

This option is static-first, with no client JavaScript on content pages and React only where interaction needs it. It matches the owner's preference.

### Option B — Keep Next.js App Router

The baseline is already written for it, and layout persistence and intercepting routes are built in. The owner rejected it, and it ships more client runtime than the content pages need.

### Option C — Astro with framework-free islands only

This has the lowest JavaScript cost. However, the selector, widgets, overlays and 3D stage would lose React's ecosystem: Motion, React Three Fiber and testing tooling.

## Criteria and evidence

- Owner preference ("me gusta más trabajar sobre Astro que sobre Next.js").
- NFR-001 budgets (LCP < 2.5 s, CLS < 0.1, INP < 200 ms) favor static HTML with partial hydration.
- The current Astro documentation is checked at bootstrap for `ClientRouter`, `transition:persist`, Actions and the Vercel adapter. Versions are pinned then (DOC-51).

## Consequences

### Positive

- Content pages ship no framework runtime.
- Each island's hydration is explicit, which keeps INP and bundle budgets visible.
- Content Collections give typed, validated content without a CMS.

### Costs / risks

- **Prototype gate 1:** the persistent shell, with music continuing across navigation and the 3D stage keeping a single WebGL context.
- **Prototype gate 2:** Project Detail as a floating surface over the persisted Home, with correct focus, history and deep links.
- Cross-island state moves from React context to nanostores, so the state boundaries in DOC-42 must be re-specified.
- Every technical document needs its Next.js mechanics replaced (PROPOSAL-REOPEN-001 §5).

## Reversibility and migration

There is no code yet (#88 has not started), so changing direction now is cheap. Once implementation exists, reversing would mean rewriting routing, data loading and persistence. The application-service layer (DOC-43) and the UI components inside React islands would carry over.

## Security / privacy / accessibility / performance impact

- **Security:** the server-rendered surface shrinks to the listed routes. CSP, origin checks and server-only secrets (DOC-47) apply to Actions and endpoints exactly as they did to Route Handlers.
- **Accessibility:** View Transitions must respect reduced motion. Focus and route announcements after client navigation become an explicit requirement (DOC-11, DOC-24).
- **Performance:** expected to improve on content routes. The 3D and audio islands stay lazy (ADR-005, ADR-006).

## Follow-up

- Re-specify DOC-41–DOC-51, DOC-08 §2 and the dependent interface documents (AMENDMENT-REOPEN-001).
- Retitle #88 to the Astro bootstrap and rewrite #95/#101 for this design. These are GitHub edits the owner confirms.
- Open the two prototype-gate issues listed under "Costs / risks".
