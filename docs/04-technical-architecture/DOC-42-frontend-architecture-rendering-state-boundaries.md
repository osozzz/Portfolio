---
id: DOC-42
title: "Frontend Architecture, Rendering & State Boundaries"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Frontend Architecture"
canonical_domain_owner: frontend_architecture
depends_on:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-10
  - DOC-11
  - DOC-17
  - DOC-19
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
  - DOC-35
  - DOC-36
  - DOC-38
  - DOC-39
  - DOC-40
  - DOC-41
  - ADR-001
  - ADR-002
decision_families:
  - FEA
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-42 — Frontend Architecture, Rendering & State Boundaries

> **Status:** APPROVED.  
> **Role:** Define the concrete frontend architecture that implements the approved app-like interaction model without turning the portfolio into a client-only SPA, a global-state monolith, or an accessibility/performance regression.

---

## 1. Purpose

DOC-41 established the portfolio as a modular full-stack Next.js application with Server Components by default and deliberate client interaction islands. DOC-42 turns that principle into an implementation contract for the public frontend and the admin frontend.

This document defines:

- App Router route/layout topology;
- Server Component versus Client Component boundaries;
- route-backed versus ephemeral UI state;
- the public System Shell runtime;
- state ownership and state-management rules;
- SelectionContext implementation boundaries;
- navigation/history behavior;
- InputManager, AudioManager and preference-runtime integration;
- Widget Field registry/resolver/persistence architecture;
- DynamicBackdrop and selected-project presentation boundaries;
- responsive implementation strategy;
- localization implementation baseline;
- loading, streaming, error and not-found boundaries;
- lazy loading and bundle ownership;
- frontend content rendering;
- CSS/token/material implementation structure;
- font/icon asset strategy;
- accessibility implementation rules;
- public/admin frontend separation;
- frontend testing hooks and observability boundaries;
- folder/module conventions implementation tooling must follow.

It intentionally does **not** finalize database tables, RLS policies, backend service contracts, admin authentication factors, abuse-control thresholds, CSP policy, CI workflow syntax or infrastructure topology. Those belong to DOC-43 through DOC-51. Runtime error monitoring is now resolved downstream as Sentry behind the frontend observability wrapper; product analytics remains a no-op until separately enabled.

---

## 2. Frontend north star

The frontend must satisfy two goals that often conflict:

> **Feel like a persistent personal computing environment while retaining the rendering, semantics, routing, SEO and resilience of a high-quality website.**

Therefore the implementation must not assume:

```text
app-like feeling
=
client-only application
```

The target is instead:

```text
server-rendered semantic document
+
route-aware persistent shell
+
small deliberate client runtimes
+
interruptible motion
+
local personalization
=
app-like portfolio
```

The portfolio must still expose useful project, experience, CV and Contact content if optional client enhancements fail.

---

## 3. Frontend architecture goals

The frontend architecture must:

1. keep professional content server-renderable and indexable;
2. keep initial JavaScript proportional to the current route rather than the entire product;
3. preserve Dock/Shell continuity across public navigation;
4. avoid global hydration of content that does not require browser behavior;
5. let route-backed Project Detail reconstruct correctly on refresh/deep link;
6. preserve the distinction between URL state, selection state, overlay state and local preferences;
7. support keyboard, pointer, touch and gamepad through one semantic action layer;
8. preserve focus/history semantics during route-like overlays;
9. keep high-frequency Drawing/Arcade loops out of general React render state;
10. let Widget Field personalization survive responsive recomposition without pixel coordinates;
11. preserve ES/EN parity and route-level locale;
12. ensure reduced motion/transparency and high-contrast fallbacks do not require alternate feature code paths;
13. isolate failures so external widgets do not block the shell or professional core;
14. keep Admin out of public bundles and public shell assumptions;
15. make architectural boundaries obvious enough that an implementer cannot casually violate them.

---

## 4. Frontend non-goals

DOC-42 does not authorize:

- converting the site into a traditional SPA with a custom router;
- placing all application state in one global store;
- placing server-fetched canonical content in a global client cache by default;
- shipping Redux, TanStack Query, XState or another large state layer without a concrete need;
- client-side database access as a convenience shortcut;
- using JavaScript breakpoints for ordinary layout composition;
- implementing a freeform desktop/window manager;
- globally intercepting browser Back in ways that break native history;
- hydration-gating the whole UI behind `useEffect`;
- loading Arcade, Drawing, Terminal and all media runtimes on Home;
- storing focus state separately from actual DOM focus;
- allowing components to attach competing global keyboard/gamepad listeners;
- using executable MDX as the default canonical professional-content format;
- making a browser-only translation system that hides meaningful text until hydration.

---

## 5. Framework baseline

DOC-41 selected Next.js App Router. DOC-42 assumes the implementation version is pinned during V0 to a currently patched supported release, rather than hard-coding a version into architecture prose.

As of this document's validation date, current Next.js documentation continues to support the architectural primitives used here:

- App Router file-system routing;
- Server Components by default;
- Client Components through explicit `'use client'` boundaries;
- nested layouts and route groups;
- streaming with `loading.tsx` and Suspense;
- `error.tsx` / `not-found.tsx` boundaries;
- route-level code splitting and prefetching;
- Server Actions for same-application mutations;
- current `proxy.ts` convention where request interception is actually required.

Version-specific features such as newer cache/navigation optimizers may be evaluated at implementation time, but they must not become hidden dependencies of core product semantics.

---

## 6. Public route topology

The approved public route tree remains defined by DOC-31. The implementation baseline uses one locale segment and one persistent public System Shell route group.

Conceptual structure:

```text
app/
├── layout.tsx
├── page.tsx                         # locale negotiation / redirect only
│
├── [locale]/
│   ├── layout.tsx                   # locale validation + message/data setup
│   │
│   └── (system)/
│       ├── layout.tsx               # persistent PublicSystemShell
│       ├── error.tsx
│       ├── loading.tsx              # shell-safe route fallback, never full-screen spinner
│       ├── not-found.tsx
│       │
│       ├── @detail/
│       │   ├── default.tsx
│       │   └── (.)projects/[slug]/page.tsx
│       │
│       ├── page.tsx                 # Home
│       ├── projects/[slug]/page.tsx
│       ├── achievements/page.tsx
│       ├── arcade/page.tsx
│       ├── arcade/glitch-runner/page.tsx
│       ├── arcade/reflex-deploy/page.tsx
│       ├── channel/page.tsx
│       ├── social/page.tsx
│       ├── social/guestbook/page.tsx
│       ├── social/sketches/page.tsx
│       ├── social/activity/page.tsx
│       ├── contact/page.tsx
│       ├── cv/page.tsx
│       ├── making-of/page.tsx
│       ├── changelog/page.tsx
│       └── status/page.tsx
│
├── admin/
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── (protected)/...
│
├── api/...
├── robots.ts
└── sitemap.ts
```

Route groups exist for implementation organization; they do not create public URL segments.

---

## 7. Root layout responsibilities

`app/layout.tsx` must stay deliberately small.

It owns only concerns that truly span every route, including Admin:

- `<html>` / `<body>`;
- foundational metadata defaults that are not locale-specific;
- global token/style imports;
- font variables;
- platform-wide error/telemetry bootstrap where later approved;
- minimum theme/appearance bootstrap needed to avoid a destructive flash, implemented in a CSP-compatible way defined with DOC-47.

It must **not** mount the public Dock, public InputManager, public Widget state or public AudioManager because Admin does not share those runtimes.

---

## 8. Locale layout responsibilities

`app/[locale]/layout.tsx` owns locale-specific server concerns:

- validate `locale` against the approved locale registry;
- load the correct UI-message namespace;
- set locale-aware metadata context;
- expose language/direction information;
- provide localized system messages where Client Components genuinely require them;
- never infer locale from IP/geolocation.

The URL remains the canonical locale state.

Invalid locale values are handled deliberately through the localization routing layer rather than silently falling back inside every component.

---

## 9. Public System Shell layout

`app/[locale]/(system)/layout.tsx` is the persistent public environment.

Its conceptual composition is:

```tsx
<PublicSystemShell>
  <SystemBackdrop />
  <SystemChrome />
  <MainWorkspace>{children}</MainWorkspace>
  <RouteDetailSlot>{detail}</RouteDetailSlot>
  <GlobalDock />
  <SystemTransientLayer />
</PublicSystemShell>
```

This is conceptual, not required literal JSX.

The Shell must preserve:

- Dock continuity;
- top identity/system controls where applicable;
- DynamicBackdrop host;
- global toast host;
- Command Palette host;
- Settings host;
- Terminal host when loaded;
- URL-independent major overlay host;
- semantic input scope management.

It must not force every child route into a Client Component.

---

## 10. Server shell plus client runtime

The public shell is split into two layers:

```text
PublicSystemShell          Server Component
        │
        ├── server-rendered shell structure
        ├── semantic landmarks
        ├── route-derived initial state
        ├── system messages / feature metadata
        │
        └── SystemClientRuntime     Client boundary
                ├── cross-cutting interaction store
                ├── InputManager
                ├── AudioManager
                ├── local preferences bridge
                ├── transient surface manager
                └── motion/environment controllers
```

The Client Runtime enhances the shell; it is not allowed to replace the entire server shell after hydration.

---

## 11. Client boundary rule

A module receives `'use client'` only when it requires one or more browser/client capabilities such as:

- state/effect hooks;
- DOM event handling;
- DOM measurement;
- localStorage/sessionStorage;
- Canvas/Web APIs;
- pointer capture;
- Gamepad API;
- Web Audio;
- browser media queries needed for behavior rather than CSS layout;
- client-only third-party components.

The preferred boundary is the **smallest stable interactive island**, not the page root.

A parent being interactive is not justification to import server-only data access beneath it.

---

## 12. Server Component rule

A component should remain a Server Component when it primarily:

- renders canonical professional content;
- renders headings/prose/metadata;
- resolves project/media descriptors;
- prepares serializable view models;
- performs server-only content access;
- generates SEO-relevant markup;
- composes noninteractive surfaces.

Server Components may pass serializable data and server-rendered children into Client Components.

They must not import client-only services merely to simplify a component tree.

---

## 13. `server-only` and `client-only` enforcement

Sensitive or environment-specific modules must advertise their runtime boundary explicitly.

Expected patterns:

```text
lib/server/*
lib/content/server/*
lib/integrations/server/*
```

use server-only enforcement where appropriate.

Likewise browser-only managers such as Gamepad, Web Audio and local preference adapters remain inside client-only modules.

Crossing this boundary must fail during development/build rather than silently bundling secrets or browser code into the wrong graph.

---

## 14. Route-backed Project Detail

Project Detail is both:

- a real shareable route: `/[locale]/projects/[slug]`;
- an iiSU-like route-backed detail surface during in-app navigation.

The implementation baseline uses **Parallel Routes + Intercepting Routes** specifically for this use case.

Expected behavior:

```text
Home / current public space
        │
        └─ client navigation → /en/projects/dex-sphere
                              │
                              ▼
                    intercepted @detail slot
                    background remains recognizable

Direct URL / refresh
        │
        ▼
/en/projects/dex-sphere
        │
        ▼
canonical project detail page
```

The visual surface may be floating/overlay-like in Expanded/Wide and effectively full-screen in Compact, while retaining the same URL/content semantics.

A V0 prototype must validate browser Back, refresh, focus restoration and responsive behavior before this pattern is duplicated elsewhere.

---

## 15. Intercepting-route restraint

Intercepting/parallel routes are **not** the generic solution for every modal.

Use route-backed interception only when all are true:

- the destination deserves its own URL;
- direct navigation must reconstruct meaningful content;
- browser Back/Forward should represent the transition;
- preserving background context materially improves the experience.

Settings, Command Palette, Terminal, temporary Achievement preview and ordinary confirmation dialogs remain URL-independent transient surfaces.

---

## 16. Route state versus UI state

State ownership follows this hierarchy:

### URL state

Use the URL for state that should be:

- shareable;
- refresh-safe;
- Back/Forward navigable;
- crawlable/indexable where public;
- directly addressable.

Examples:

- locale;
- current major space;
- project detail slug;
- Arcade game route;
- Social subsection route when defined by DOC-31.

### Ephemeral UI state

Use client runtime state for:

- Command Palette open/closed;
- Settings open/closed;
- temporary popover;
- transient achievement preview;
- active Customize Mode;
- current input mode;
- temporary focus-return target.

### Local preference state

Use versioned local persistence for:

- theme;
- sound enabled/volume;
- motion preference override;
- transparency preference;
- widget layout preferences;
- onboarding/boot completion;
- explicit remembered visitor name.

### Domain-local runtime state

Keep feature-specific transient state inside the owning domain:

- drawing strokes/tool history;
- active Arcade frame/session state;
- media-viewer ephemeral controls.

No single store owns all four classes.

---

## 17. URL state must not be mirrored unnecessarily

Do not duplicate route truth into a global store just because a component needs to know where it is.

Bad:

```text
Next router says /channel
+
shellStore.currentPage = "channel"
```

unless there is a narrow, documented transitional need.

Major-space identity should normally derive from route segments/path utilities.

This prevents router/store divergence.

---

## 18. Frontend state-management stack

DOC-42 proposes the following explicit stack:

### React local state

Use `useState` / `useReducer` for state whose lifetime and consumers are local to one component/subtree.

### Selector-based external store

Use **Zustand as the baseline** for small cross-cutting browser state that must be observed by multiple distant interactive components.

Prefer a vanilla store instance plus selector hooks rather than a module-global store where practical.

Candidate state includes:

- selected contextual entity ID on Home;
- current transient surface descriptor;
- Customize Mode;
- last meaningful input mode;
- low-frequency shell coordination flags;
- focus-return descriptors.

### Domain engines/stores

Drawing and Arcade may own dedicated high-frequency engines/stores optimized for their needs; they must not pump every frame/pointer point through the general shell store.

### Server/remote data

Do **not** put repository content, admin DB lists or generic server data into Zustand as a default cache.

No Redux or TanStack Query is part of the V0 baseline. Either can be proposed later through an ADR if a concrete data-flow problem justifies it.

---

## 19. Store creation and SSR safety

Cross-cutting client stores must not leak state between requests.

The preferred pattern is:

```text
SystemClientRuntime mounts
        ↓
create shell store instance
        ↓
provide store reference to client descendants
        ↓
components subscribe with narrow selectors
```

Avoid server-shared mutable module singletons.

Browser-only service singletons may exist only after entering the client runtime and must have explicit lifecycle/reset behavior.

---

## 20. Selector discipline

A component subscribes only to the slice it needs.

Bad:

```ts
const shell = useShellStore();
```

for a component that only needs `inputMode`.

Preferred conceptual form:

```ts
const inputMode = useShellStore(selectInputMode);
```

The purpose is not micro-optimization everywhere; it is preventing the Personal Widget Field, Dock and DynamicBackdrop from all rerendering on unrelated state changes.

---

## 21. SelectionContext implementation

DOC-24 and DOC-32 define conceptual `SelectionContext`. The frontend implementation stores the **minimum stable selection identity**, then derives presentation from canonical registries/data.

Preferred state:

```ts
type SelectionState = {
  kind: 'project' | 'experience' | 'education' | 'certification';
  id: string;
};
```

Derived selectors/services resolve:

- accent/environment data;
- backdrop descriptors;
- allowed actions;
- widget context;
- project metadata;
- media descriptors.

Do not persist a giant duplicated project object inside the shell store.

---

## 22. Home selection lifetime

Home selection follows the approved behavior:

- fresh visit starts from the configured featured/default project;
- browsing selection does not mutate browser history;
- ordinary focus/hover is not globally committed selection unless the input-mode rules say selection follows focus for that selector;
- route navigation to a Project Detail can remember the prior Home selection for restoration;
- returning to Home in the same active session may restore that selection;
- this session selection is not a permanent cross-device user profile.

If selection restoration conflicts with an explicit route/deep-link context, route context wins.

---

## 23. InputManager architecture

Global interaction events are centralized.

Conceptual pipeline:

```text
Keyboard / Pointer / Touch / Gamepad
              ↓
         input adapters
              ↓
        InputManager
              ↓
    semantic action dispatcher
              ↓
      active context/scope
              ↓
      feature component/service
```

Components must not each attach their own document-level keydown/gamepad loops for global navigation.

---

## 24. Input scope stack

Input contexts follow DOC-23 priority semantics.

Conceptual order from highest to lowest:

```text
SystemDialog
TransientOverlay / Palette
UtilityWorkspace
ArcadeActiveSession
RouteDetail
CurrentWorkspace
GlobalShell
```

Only the highest eligible scope handles an action unless an action is explicitly global and safe.

Text entry suppresses navigation shortcuts that would interfere with editing.

---

## 25. Input-mode detection

`inputMode` represents the last **meaningful** navigation/interaction mode, not the last raw browser event.

Examples:

- incidental mouse movement of one pixel should not instantly replace keyboard hints;
- gamepad mode begins after meaningful axis/button intent beyond deadzone;
- touch mode begins on actual touch/pointer interaction;
- focus may remain valid when hints change.

Input-mode changes are low-frequency store updates. Raw pointer movement and gamepad polling are not.

---

## 26. Gamepad polling

Gamepad support is progressive enhancement.

The polling loop:

- runs only while gamepad support is relevant/connected;
- pauses when the document is hidden;
- centralizes deadzone and repeat behavior;
- emits semantic actions rather than synthetic keyboard events;
- stops cleanly on disconnect;
- never becomes required to access a feature.

Arcade may temporarily own a more specialized game input adapter while an active game session has input priority.

---

## 27. AudioManager architecture

Audio is a client-only service with semantic events, not direct asset playback from components.

Conceptual interface:

```text
AudioManager.emit('navigate')
AudioManager.emit('select')
AudioManager.emit('open')
AudioManager.emit('achievement')
AudioManager.emit('success')
```

The service owns:

- user-gesture unlock;
- sound enabled state;
- volume;
- rate limiting/coalescing;
- lazy asset loading;
- visibility suspension;
- semantic event-to-sound mapping.

Sound stays OFF on first visit as approved.

---

## 28. Preference persistence architecture

Local personalization is accessed through a typed preference repository rather than scattered `localStorage.getItem()` calls.

Conceptual domains:

```text
portfolio.appearance.v1
portfolio.widgets.v1
portfolio.onboarding.v1
portfolio.personalization.v1
portfolio.arcade-local.v1
```

Each domain defines:

- version;
- schema;
- default;
- migration/reset behavior;
- privacy meaning;
- whether it may be cleared independently.

Components do not know storage keys.

---

## 29. Hydration and local preferences

Local preferences cannot be trusted as server-rendered values unless deliberately mirrored to a request-visible mechanism, which V1.0 does not require.

Therefore:

- markup renders with deterministic safe defaults;
- CSS `prefers-*` capabilities should handle system defaults where possible;
- appearance-critical local overrides need a minimal, CSP-compatible pre-paint bootstrap so theme/transparency do not visibly flash;
- the full UI is **not** hidden until localStorage is read;
- `suppressHydrationWarning` is used only at a narrowly justified root attribute boundary, never as a blanket fix.

The exact CSP-compatible bootstrap mechanism is finalized with DOC-47.
## 29A. Durable local Drawing drafts

`Save Local` is backed by a typed `DrawingDraftRepository` using **IndexedDB** in the V1.2 baseline. High-frequency canvas state remains in the Drawing runtime and is not synchronized through React/global shell state on every pointer event.

Logical draft record:

```ts
type DrawingDraftRecord = {
  id: string;
  schemaVersion: number;
  model: DrawingLogicalModel;
  createdAt: string;
  updatedAt: string;
};
```

Repository contract:

- `list`, `get`, `create`, `save`, `delete`, `clearAll`;
- stable draft IDs and explicit drawing-model schema version;
- app-level logical cap of **20 drafts / 20 MiB total serialized logical data**, with graceful `quota_exceeded` handling before browser hard quota;
- no arbitrary image/blob upload authority inside a local draft;
- known schema versions migrate deliberately; an incompatible/corrupt individual draft is isolated and may be deleted/reset without wiping unrelated preferences;
- Settings → Local Data can clear local sketches independently;
- drafts are device-local, may be evicted by the browser, are not cloud backup, and are never published without explicit `Publish`.

Components never call IndexedDB directly; the repository owns storage/versioning/migration behavior.

## 29B. Local privacy receipts

A typed `PrivacyReceiptRepository` stores only local capabilities needed to manage a visitor's own accountless content/score:

```ts
type PrivacyReceipt = {
  resourceType: 'guestbook' | 'sketch' | 'arcade-score';
  resourceId: string;
  deletionToken: string;
  createdAt: string;
};
```

The repository uses IndexedDB alongside Drawing drafts (separate object store/domain), is never synced to the server automatically, and can be cleared from Settings → Local Data. Losing the local receipt may remove self-service deletion capability; therefore the UI may offer a one-time copy/export of the deletion code after creation without creating an account.


---

## 30. Widget Registry

The Personal Widget Field uses a typed static registry owned by the frontend feature architecture.

Conceptual record:

```ts
type WidgetDefinition = {
  id: WidgetId;
  kind: 'system' | 'context';
  release: ReleaseId;
  supportedSizes: Array<'S' | 'M' | 'L'>;
  defaultSize: 'S' | 'M' | 'L';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  spaces: SpaceId[];
  eligibility: EligibilityRule;
  load: WidgetLoader;
};
```

The registry describes capability. It does not contain the visitor's layout.

---

## 31. Widget Resolver

The resolver is a deterministic pure layer where possible.

Inputs:

```text
Widget Registry
+
current space
+
selected context
+
release registry
+
visitor preferences
+
responsive capability mode
+
data availability hints
```

Output:

```text
ordered eligible widget placements
+
semantic sizes
+
priority/overflow decisions
```

The resolver never writes persistence as a side effect.

---

## 32. Widget layout persistence

In accordance with ADR-001 and DOC-38, persisted widget intent contains only logical information such as:

```ts
{
  order: ['currently-building', 'project-media', 'dev-activity'],
  hidden: ['related-achievement'],
  pinned: ['currently-building'],
  sizes: {
    'currently-building': 'M',
    'project-media': 'L'
  }
}
```

It never contains:

```text
x / y
pixel width
pixel height
absolute coordinates
```

Responsive layout is recomputed from intent.

---

## 33. Widget Customize Mode

Customize Mode is an explicit UI state.

Requirements:

- Field Grid may become visible;
- drag/reorder may exist as enhancement;
- keyboard/touch-accessible move controls are mandatory;
- size changes expose only widget-supported S/M/L options;
- unavailable/release-gated widgets cannot be force-enabled by corrupted local storage;
- Reset returns to current-version defaults;
- changes persist only after valid normalization;
- layout changes never alter professional canonical content.

---

## 34. Widget runtime boundaries

Widgets are small surfaces, not miniature autonomous applications.

A widget should receive a narrow view model and callback/action surface.

Bad:

```text
Widget
→ reads route directly
→ reads localStorage directly
→ queries GitHub directly
→ knows Supabase table
→ owns global keyboard listener
```

Preferred:

```text
Resolver / server loader / adapter
→ WidgetViewModel
→ Widget
→ semantic action
```

External-data widgets use independent Suspense/error/degraded boundaries so one provider cannot block Home.

---

## 35. DynamicBackdrop architecture

DynamicBackdrop is one centralized environmental renderer beneath the public shell.

It consumes a derived environment descriptor rather than arbitrary component CSS.

Conceptual model:

```ts
type BackdropDescriptor = {
  contextId: string;
  artwork?: MediaDescriptor;
  accentToken: string;
  environmentToken: string;
  focalPoint?: {x: number; y: number};
  readabilityProfile: 'light' | 'dark' | 'balanced';
  motionProfile: 'still' | 'transition';
};
```

Exact canonical fields remain owned by DOC-36/DOC-34/DOC-39.

The renderer may use layered images, gradients, masks and material effects, but other features do not independently create competing full-screen project backdrops.

---

## 36. Backdrop loading strategy

The environment should feel responsive without preloading the entire project catalog.

Baseline:

- initial selected artwork is part of initial render/preload strategy;
- nearest likely selector neighbors may be opportunistically prefetched after critical content;
- all project artwork is not eagerly loaded;
- low-data / save-data conditions reduce speculative media work;
- artwork failure falls back to the approved color/environment model;
- backdrop transitions never block selection response.

Exact image quality/sizes belong to performance implementation in DOC-49.

---

## 37. Motion ownership

Motion remains primarily implemented with Motion inside client interaction islands.

Ownership rules:

- local component motion belongs to the component;
- selected-project choreography belongs to the Home/Selection controller;
- DynamicBackdrop transitions belong to DynamicBackdrop;
- Dock bubble transition belongs to Dock;
- route-detail continuity belongs to the detail surface/navigation layer;
- global motion preference is exposed as configuration, not re-read independently everywhere.

GSAP remains prohibited without a documented case per DOC-29/DOC-41.

---

## 38. View Transitions and framework-specific navigation enhancements

View Transitions and newer Next.js navigation/cache primitives are progressive enhancements, not product dependencies.

A future implementation may use them when the pinned framework release is verified to provide:

- correct browser Back behavior;
- accessibility-compatible focus behavior;
- interruptibility;
- reduced-motion fallback;
- no duplicate visual state with Motion;
- measurable benefit.

They must not produce a second competing navigation architecture.

---

## 39. Responsive implementation rule

Layout is CSS-first.

Use:

- CSS Grid/Flexbox;
- approved custom properties/tokens;
- container queries for component recomposition;
- media queries for broad shell modes and capabilities;
- logical properties;
- safe-area environment variables;
- dynamic viewport units.

Do not use `window.innerWidth` as the primary source of layout truth.

---

## 40. JavaScript responsiveness

JavaScript may observe media/capability queries only when behavior genuinely changes, for example:

- input hints;
- whether a complex overlay behavior is appropriate;
- reduced motion/transparency behavior that affects runtime animation/audio logic;
- game-specific control adaptation.

When JS needs a breakpoint-like semantic mode, it must subscribe to the same named breakpoint contract used by CSS rather than duplicate arbitrary numbers in components.

---

## 41. Personal Widget Field layout implementation

Expanded/Wide uses the approved deterministic grid from DOC-38.

Implementation principles:

- CSS Grid is the placement substrate;
- server markup order follows meaningful/accessibility order;
- CSS placement may create controlled visual asymmetry;
- Project Hero is a first-class field participant but not a `WidgetDefinition`;
- compact layout recomposes rather than shrinking desktop coordinates;
- DOM reorder is avoided when CSS can preserve logical reading order;
- user logical order influences accessible visual order where the user explicitly customized it.

---

## 42. Dock implementation

The Dock is one persistent semantic navigation component.

Requirements:

- six destinations always represented from V1.0;
- current destination derived from route;
- active bubble/lens is one moving visual object;
- each item remains a real accessible link/control target;
- Coming Soon routes remain navigable and correctly marked;
- gamepad/keyboard focus is DOM focus, not a duplicate fake focus index;
- Compact feasibility is verified at narrow widths/zoom per DOC-38;
- visual bubble movement cannot delay navigation.

---

## 43. Coming Soon frontend gating

ADR-002 requires all six Dock routes to exist from V1.0.

A centralized typed Release Registry controls whether a major feature is:

```text
AVAILABLE
COMING_SOON
HIDDEN_INTERNAL
```

Public routes for later releases render `ComingSoonSpace` while gated.

The same registry feeds:

- Dock presentation;
- route metadata (`noindex` while Coming Soon where approved);
- sitemap inclusion;
- Command Palette availability;
- Widget eligibility;
- lazy runtime eligibility.

Do not create separate ad-hoc booleans for the same release state in each component.

---

## 44. Lazy feature boundaries

Heavy or later-release capabilities load only on intent/route need.

Mandatory lazy boundaries include, at minimum:

- Drawing Pad runtime;
- Glitch Runner runtime;
- Reflex Deploy runtime;
- Terminal runtime;
- large syntax/code presentation helpers if used;
- noncritical rich media viewers;
- optional advanced visual effects.

`dynamic(..., {ssr: false})` is **not** a generic optimization switch. Disable SSR only when the feature is genuinely browser-only.

---

## 45. Route prefetch policy

Next.js route prefetching is useful for the app-like feel, but it is controlled by route weight and user intent.

Baseline:

- normal professional routes may use framework prefetch defaults;
- Dock destinations should feel immediate;
- heavy game runtime chunks must not be fetched merely because the Arcade link exists in the Dock;
- a route shell/detail may prefetch without prefetching the active game engine;
- low-data/save-data conditions reduce speculative media/runtime prefetch;
- manual prefetch is justified by measured navigation benefit, not used everywhere.

---

## 46. Loading and streaming architecture

The public shell must never disappear behind a post-entry full-page spinner.

Use:

- route `loading.tsx` only for meaningful route content fallback;
- granular Suspense around slow/external regions;
- geometry-preserving skeletons per DOC-40;
- independent widget loading;
- stable shell/Dock during streamed route changes.

Canonical build-owned professional content should usually be available without remote fetch latency.

---

## 47. Suspense boundary placement

Suspense boundaries should align with real failure/loading domains.

Good candidates:

- GitHub-derived Dev Activity widget;
- Tech Pulse feed;
- optional public leaderboard projection;
- noncritical media sections;
- admin data panels.

Avoid one giant Suspense boundary around an entire route when only one provider-backed subsection is slow.

---

## 48. Error boundary architecture

Use route/feature boundaries intentionally:

```text
global-error                catastrophic application/root failure
(locale)/(system)/error     public route-space failure
feature boundary            isolated external/complex feature failure
widget boundary             external widget degradation
```

Known empty/not-found states are not exceptions.

A missing project slug uses `notFound()` / localized not-found treatment rather than throwing a generic server error.

---

## 49. Error recovery

Error surfaces should provide the narrowest useful recovery:

- retry current widget/provider;
- reset route segment where supported;
- return to prior/parent surface;
- continue using professional core.

Do not make “refresh the entire website” the default recovery for a failed secondary widget.

---

## 50. Localization library baseline

DOC-42 proposes **next-intl** as the implementation baseline for system/UI localization because it supports App Router, Server Components, Client Components, locale routing and ICU-style messages without making the entire application client-rendered.

The package version is pinned during V0.

System messages and canonical professional narratives remain conceptually separate:

```text
messages/
├── en.json
└── es.json

content/
├── canonical/...
└── projects/<slug>/en.md + es.md
```

`next-intl` does not become the source of truth for professional project facts.

---

## 51. Locale routing

Approved locales:

```text
en
es
```

The canonical public route always contains the locale.

Root `/` is redirect-only and follows DOC-10 exactly: explicit `portfolio_locale` cookie → supported `Accept-Language` match → English fallback; it issues a 307 redirect, uses no geolocation, and is private/no-store to avoid incorrect shared-cache locale redirects.

Once on a localized route, locale switching preserves the semantic destination and relevant route parameters where that route exists in both locales.

Technical route slugs remain the approved stable English slugs unless a future ADR explicitly introduces localized pathnames.

---

## 52. Translation-message boundaries

Client message payloads must stay scoped.

Do not serialize the entire translation catalog into every client island.

Server Components should resolve translations on the server when possible. Client Components receive only the provider/messages necessary for their interactive subtree or use the framework/library mechanism that preserves selective loading.

Localized professional Markdown is rendered server-side.

---

## 53. Content compilation layer

Canonical YAML/Markdown from DOC-36 should not be repeatedly parsed ad hoc in arbitrary page components.

V0 must create a typed content pipeline:

```text
source YAML/Markdown
        ↓
schema validation
        ↓
normalization
        ↓
typed immutable content model
        ↓
server selectors/view models
        ↓
route/component rendering
```

Validation failures fail CI/build for canonical professional content.

The exact generated-artifact format may be implementation-specific, but there is one content API surface rather than direct filesystem parsing scattered through routes.

---

## 54. Markdown versus MDX

Canonical project narrative uses Markdown/content data as approved by DOC-36.

Executable MDX is **not** the default because arbitrary executable content:

- increases coupling between editorial content and React internals;
- complicates validation/security;
- makes content migration harder;
- can encourage one-off page logic hidden inside prose files.

If structured rich blocks are needed, use an explicit allowed block schema or a safe Markdown renderer with controlled components.

A future MDX proposal requires a documented need and bounded component whitelist.

---

## 55. Content rendering semantics

Long-form Project Detail / Making Of content must render semantic document structure:

- actual headings in hierarchical order;
- paragraphs/lists/tables where appropriate;
- code blocks with accessible text;
- figures with captions;
- architecture diagrams with text alternatives;
- links with meaningful labels.

Visual “system” styling does not replace document semantics.

---

## 56. Frontend view models

Route components should not pass raw persistence/provider records directly to presentation components.

Use frontend view models such as:

```text
ProjectSelectorItemVM
ProjectHeroVM
ProjectDetailVM
AchievementTileVM
WidgetVM
LeaderboardEntryVM
GuestbookEntryPublicVM
```

They:

- expose only fields a surface needs;
- combine canonical localized content where appropriate;
- remove internal/private fields;
- stabilize component contracts against backend/provider changes.

Exact backend DTOs are defined with DOC-43/44.

---

## 57. CSS architecture

Approved styling stack:

```text
Tailwind utilities
+
CSS custom-property design tokens
+
targeted authored CSS for materials/effects/layouts that are clearer in CSS
```

Suggested organization:

```text
styles/
├── globals.css
├── tokens.css
├── themes.css
├── materials.css
├── motion.css
├── utilities.css
└── accessibility.css
```

Feature-specific complex styling may colocate with the feature when it is not a global token/material concern.

---

## 58. Token consumption

Approved DOC-34/35/38/39/40 tokens are exposed as semantic CSS variables/utilities.

Components should consume concepts such as:

```text
--surface-fill-liquid
--space-6
--radius-lg
--focus-color
--context-accent
--context-environment
```

not scatter one-off raw visual values.

A raw literal is acceptable for a truly local calculation only when it is not an approved reusable token and cannot create visual drift.

---

## 59. Tailwind boundary

Tailwind is a composition/utility layer, not the canonical source of every visual truth.

Use Tailwind effectively for:

- layout;
- spacing bindings;
- responsive composition;
- typography classes;
- simple state styles.

Use dedicated CSS/custom properties for:

- Liquid Glass material recipes;
- dynamic project context variables;
- complex masks/gradients;
- field-grid optical treatment;
- browser-specific material fallbacks;
- animation details where class strings reduce clarity.

Avoid giant unreadable class expressions encoding an entire material system inline.

---

## 60. Theme and project context propagation

Theme/system state should be represented through root/shell attributes and semantic CSS variables rather than prop-drilling colors through every component.

Conceptual attributes:

```html
<html data-theme="dark">
<body data-transparency="automatic">
<div data-motion="full" data-context-project="dex-sphere">
```

Exact attribute names are implementation detail.

Project context updates semantic variables at the appropriate shell scope. It does not mutate unrelated semantic colors such as error/focus.

---

## 61. Font loading

DOC-35 approved Manrope + IBM Plex Mono.

Frontend baseline:

- use `next/font` or equivalently build-time self-hosted font handling;
- no runtime request to Google Fonts/CDN is required for approved primary fonts;
- expose font families as CSS variables;
- load only required subsets/weights/axes;
- avoid layout shift from late font replacement;
- handwriting accents are authored assets, not a globally loaded decorative font.

Font files themselves must never be exposed as downloadable project artifacts in documentation packages.

---

## 62. Icon implementation

Phosphor is the baseline general icon set from DOC-35.

Rules:

- import icons in a tree-shakable way;
- do not load an icon-font bundle;
- custom six Dock glyphs are first-party SVG/React components using the same optical grid;
- decorative icons use `aria-hidden`;
- standalone icon controls require accessible names;
- icon choice remains semantic and does not substitute for ambiguous unlabeled navigation.

---

## 63. Image/media implementation

Curated project images should use the framework image pipeline where it provides benefit.

Rules:

- media descriptors provide dimensions/aspect/focal information where available;
- responsive `sizes` reflects real rendered geometry;
- Hero/Backdrop roles may use different crops/presentations;
- do not use enormous source images as CSS backgrounds by default;
- priority/preload is reserved for actual above-the-fold critical media;
- gallery content lazy-loads;
- failure has a designed fallback;
- animations/video never auto-block primary content.

Detailed media performance budgets belong to DOC-49.

---

## 64. Forms frontend architecture

Public/admin forms use native semantic `<form>` behavior first.

For same-app mutations, Server Actions may provide the transport adapter per DOC-41/DOC-43.

Frontend behavior includes:

- shared schema-derived client hints where useful;
- authoritative server validation always;
- progressive enhancement where feasible;
- visible pending state;
- field-linked error messages;
- focus management after submission/error;
- no fake success before server acknowledgment.

Avoid converting every input into controlled React state when native/uncontrolled behavior is sufficient.

---

## 65. Contact form rendering

The Contact route is intentionally calm and low-runtime.

It should not require:

- Widget Field runtime;
- project media preload;
- Arcade/Drawing code;
- large client-side form framework.

The form can receive a small Client Component only for interaction affordances/pending feedback while preserving native semantics and server-authoritative submission.

---

## 66. CV frontend architecture

`/[locale]/cv` is route-backed and server-rendered.

It consumes the generated/verified RenderCV artifacts from DOC-37.

Desktop may present:

- calm route surface;
- language choice;
- preview;
- view/download actions.

Compact does not render a microscopic full PDF as the only usable content. It may provide structured summary/preview plus direct PDF actions.

The PDF generation runtime is not shipped to the browser.

---

## 67. Drawing frontend boundary

Drawing Pad is a lazy client-only Utility Workspace.

Architecture:

```text
Drawing route/surface trigger
        ↓
lazy DrawingWorkspace
        ↓
Drawing engine / canvas model
        ↓
local stroke/history state
        ↓
explicit Save / Publish adapter
```

React owns tool UI and coarse state; high-frequency pointer stroke data should use an engine/model that does not cause React rerender for every sample.

Resize/orientation remaps the logical drawing model rather than clearing it.

---

## 68. Arcade frontend boundary

Each game runtime is a separately lazy-loaded feature package/module.

Architecture:

```text
Arcade Library (server/light client)
        ↓
Game Detail
        ↓
server-created eligible session
        ↓
lazy Game Runtime
        ↓
local high-frequency engine
        ↓
result summary
        ↓
server submission/validation
```

The global shell store does not own game physics, frame time, raw controls or score increments.

Paused/Finished states can expose coarse UI state back to React.

---

## 69. High-frequency state rule

The following must not cause broad React tree rerenders at input/frame frequency:

- pointer coordinates;
- drawing points;
- game position/velocity;
- gamepad axis samples;
- audio analyzer values if later introduced;
- continuous scroll position unless a specific visual needs it.

Use refs, dedicated engines, requestAnimationFrame-owned state, canvas state or narrow external-store subscriptions as appropriate.

---

## 70. Admin frontend separation

Admin is a separate frontend shell under `/admin`.

It may reuse:

- primitives;
- typography;
- tokens;
- form controls;
- focus/accessibility utilities;
- restrained material components.

It does **not** reuse by default:

- public DynamicBackdrop;
- public Dock;
- public Widget Field;
- public Boot/Onboarding;
- public Easter eggs;
- public InputManager gamepad navigation unless explicitly useful.

Admin route imports must not leak into public bundles.

---

## 71. Component layers in code

The approved L0→L3 model from DOC-27 maps to code as follows:

### L0 — Foundations

```text
styles/
tokens/
types/foundations/
```

### L1 — Primitives

```text
components/primitives/
```

Examples: Button, IconButton, Stack, Grid, Text, Heading, Surface, Badge, Toggle.

### L2 — System components

```text
components/system/
```

Examples: Dock, SystemChrome, WidgetShell, OverlaySurface, SurfaceHeader, ToastHost, DynamicBackdrop.

### L3 — Feature components

```text
features/<domain>/
```

Examples: ProjectSelector, AchievementGrid, GuestbookWall, DrawingWorkspace, GameSessionShell.

Dependency direction remains L3 → L2 → L1 → L0, not the reverse.

---

## 72. Feature folder contract

A feature may contain:

```text
features/projects/
├── components/
├── server/
├── client/
├── models/
├── selectors/
├── actions/
├── tests/
└── index.ts
```

Not every feature needs every folder.

The rule is ownership, not folder ceremony.

Feature internals should be private unless intentionally exported through the feature boundary.

---

## 73. Import-boundary rules

Expected import direction:

```text
route
 ↓
feature public API
 ↓
feature internals
 ↓
system/primitives
 ↓
foundations
```

Server layers may additionally depend on application/content/integration layers defined by DOC-41/43.

Disallowed patterns include:

- primitives importing `features/projects`;
- generic `components/system` importing a specific game's engine;
- one feature deep-importing another feature's private file;
- client components importing `lib/server`;
- public shell importing protected Admin modules.

ESLint/build rules should enforce key boundaries in DOC-51.

---

## 74. No generic dumping grounds

Avoid folders/files such as:

```text
utils/everything.ts
helpers.ts
common.tsx
misc.ts
store.ts    # containing unrelated domains
```

A utility should have a semantic owner/name, e.g.:

```text
lib/routing/locale-path.ts
lib/media/build-srcset.ts
features/home/widget-layout/normalize-preferences.ts
```

---

## 75. Navigation implementation

Use Next.js routing as the authoritative route engine.

Navigation adapters may wrap routing to provide semantic behavior such as:

```ts
navigateToSpace('channel')
openProjectDetail(projectId)
changeLocale('es')
```

but they ultimately call framework/browser navigation and do not maintain a shadow router.

Semantic action dispatchers should not embed hard-coded URL strings throughout unrelated components.

---

## 76. Browser Back semantics

Back follows DOC-22 sacred semantics:

1. if a URL-independent transient surface owns Back, close that surface;
2. otherwise route-backed detail relies on browser/router history;
3. otherwise Back remains native browser behavior.

Do not globally call `preventDefault` on browser navigation.

Focus restoration metadata may be tracked for transient surfaces and intercepted route detail, but it cannot rewrite user history.

---

## 77. Focus architecture

Actual DOM focus is the source of truth for `FOCUS`.

Frontend services may store:

- focus return target descriptors;
- roving-tabindex active item identity inside a composite;
- last interaction scope.

They must not store a second “visual focus” that diverges from the DOM.

For route transitions:

- meaningful route headings/content receive appropriate focus/announcement behavior;
- intercepted detail traps/contains focus when behaving as a modal surface;
- closing restores focus to the triggering project when still present;
- direct detail navigation does not pretend there is an underlying trigger to restore to.

---

## 78. Roving tabindex

Composite controls such as project selectors or toolbars may use roving tabindex when appropriate.

Rules:

- one tabbable item within the composite;
- arrow keys move focus according to documented orientation;
- DOM focus is actually moved;
- Home/End behavior may exist where conventional;
- pointer click updates the roving active item;
- disabled/locked semantics remain correct;
- no hidden focus trap outside overlays/dialogs.

---

## 79. Command Palette architecture

Command Palette is one lazy global client surface.

Commands are data-driven descriptors:

```ts
type Command = {
  id: string;
  labelKey: string;
  keywords: string[];
  availability: AvailabilityRule;
  execute: SemanticAction;
};
```

It reuses semantic navigation/actions rather than having a parallel implementation.

It respects release gating, locale and capability.

---

## 80. Terminal architecture

Terminal is a discoverable/secret client surface, not a shell emulator.

Its command registry maps predefined strings to safe semantic actions/output.

It must not use:

- `eval`;
- `Function` constructor;
- arbitrary server command execution;
- visitor-provided command interpolation into system processes.

The Terminal bundle is lazy and absent from the initial professional route bundle.

---

## 81. Boot and onboarding architecture

Boot/onboarding are client enhancement layers over a ready application shell.

Boot must not be an actual prerequisite for rendering content.

First-visit logic:

```text
server shell/content rendered
        +
client preference check
        ↓
show short boot/onboarding if eligible
```

Skip/reduced-motion preferences bypass/simplify presentation without changing capability.

Boot replay is an explicit Settings action.

---

## 82. Appearance preferences

Theme, Transparency and Motion are independent dimensions.

The client runtime exposes normalized values such as:

```text
theme: system | light | dark
transparency: automatic | full | reduced | off
motion: automatic | full | reduced
```

Exact Motion enum wording must remain aligned with the approved Settings/content contract when implemented.

Platform media queries participate when value is `automatic/system`.

No component reads localStorage directly to decide its own theme.

---

## 83. Reduced-capability rendering

Accessibility/performance quality tiers must be handled by tokens/CSS/runtime capability flags, not by maintaining separate component trees for “accessible mode.”

For example:

```text
same WidgetShell
→ FULL glass
→ REDUCED glass
→ SOLID fallback
```

not three unrelated widget implementations.

This preserves the approved principle that accessibility may simplify presentation but never remove capability.

---

## 84. System status and live-data widgets

Dynamic external data is enhancement-only.

Frontend widgets consume a normalized state model:

```ts
type RemoteDataState<T> =
  | {status: 'loading'}
  | {status: 'fresh'; data: T; fetchedAt: string}
  | {status: 'stale'; data: T; fetchedAt: string}
  | {status: 'empty'}
  | {status: 'error'; fallback?: T};
```

Exact server cache/provider transport belongs to DOC-46.

The UI must not display fake technical health metrics when no real data exists.

---

## 85. SEO and metadata frontend boundary

Metadata is generated server-side from canonical content and release state.

Each indexable public route must support:

- localized title/description;
- canonical URL;
- alternate locale links where appropriate;
- social metadata;
- noindex for gated Coming Soon routes per ADR-002;
- structured data only when truthful/relevant.

Client selection changes that do not change URL do not pretend to be separate indexable pages.

---

## 86. Dynamic OG architecture boundary

Dynamic OG generation is a server route/rendering concern.

Frontend components may share presentation tokens/assets, but the browser does not render or upload screenshots to generate OG images.

OG templates must degrade without external live data and should derive from canonical project metadata.

Detailed generation/cache implementation belongs to DOC-43/46/49.

---

## 87. Accessibility architecture

The frontend must encode accessibility at primitive/system-component level.

Examples:

- Button owns button semantics and focus treatment;
- Dialog/OverlaySurface owns dialog semantics where appropriate;
- Dock owns navigation landmark and current-page state;
- WidgetShell does not become a focus stop unless it has a meaningful action;
- form primitives own label/error relationships;
- Toast system owns restrained live-region behavior;
- selectors own roving tabindex/keyboard semantics.

Do not add accessibility as route-specific patches after visual implementation.

---

## 88. Landmarks and document structure

The app-like shell still uses conventional landmarks:

- `<header>` where applicable;
- `<nav>` for Dock/global navigation;
- one meaningful `<main>` per rendered page/surface context;
- `<aside>` only for genuinely complementary content;
- headings reflect document hierarchy.

Skip navigation remains available even when the visual layout is spatial.

---

## 89. Live-region policy

Live regions are centralized and restrained.

Use them for important asynchronous outcomes such as:

- form success/error summary;
- achievement unlock announcement;
- meaningful background data update where user action depends on it.

Do not announce:

- every hover;
- every focus move already announced by the browser;
- decorative backdrop changes;
- every game frame/score tick.

---

## 90. Security boundaries in frontend code

Frontend modules must assume all browser-visible values are public.

Never include:

- Supabase service-role key;
- Resend API key;
- private provider tokens;
- moderation secrets;
- raw temporary IP HMAC keys;
- server-only environment configuration.

Public environment variables require explicit classification and must be safe to disclose.

Client-side validation/sanitization is UX defense-in-depth, never the authorization boundary.

---

## 91. HTML/content safety

Canonical Markdown rendering should avoid raw HTML by default or sanitize it through an explicit allowlist if a real authoring need exists.

UGC must never be inserted through unsafe raw HTML rendering.

React escaping remains the default.

Link/media protocols and externally sourced rich text require validation in the owning server/content layer.

Detailed XSS/CSP controls belong to DOC-47.

---

## 92. Dependency policy — frontend

Baseline frontend dependencies should each own a clear capability.

Approved/proposed categories:

- Next.js / React — framework/runtime;
- Motion — interaction motion;
- Tailwind — styling utilities;
- Zustand — small cross-cutting client state;
- next-intl — i18n;
- Phosphor — general icon system;
- schema validation library chosen/pinned with backend/content architecture;
- testing/component tooling defined by DOC-50/51.

Avoid overlapping libraries that solve the same problem.

Examples requiring explicit justification:

- second animation engine;
- second global state library;
- second i18n library;
- large UI component framework that overrides our design system;
- client data-cache library without a client-server-state problem.

---

## 93. Story/component environment boundary

DOC-27 requires an isolated component environment; Storybook remains the preferred baseline.

DOC-42 requires that the environment can render/test:

- primitive states;
- WidgetShell S/M/L;
- Dock states;
- theme/transparency tiers;
- focus/selection combinations;
- reduced motion;
- ES/EN text expansion;
- Compact/Medium/Expanded/Wide container conditions.

Exact package setup and visual-regression integration belongs to DOC-50/51.

---

## 94. Frontend observability hooks

Components must not call a vendor SDK everywhere.

Expose narrow internal adapters for:

- captured UI errors;
- route/performance measurements;
- significant interaction telemetry if approved;
- non-sensitive feature failures.

Drawing content, Contact message text, email addresses and unpublished UGC are not default telemetry payloads.

Runtime error monitoring uses the Sentry-backed wrapper approved in DOC-49. Product analytics remains disabled/no-op until a separate privacy/provider decision enables it.

---

## 95. Analytics event architecture

If analytics is enabled, semantic events are emitted through one typed analytics facade.

Examples:

```text
space_viewed
project_selected
project_detail_opened
cv_downloaded
contact_submission_outcome
widget_customized
arcade_session_started
```

Do not track raw keyboard commands, Terminal text, drawing strokes or form field contents.

Analytics consent/privacy details remain owned by DOC-17/DOC-47.

---

## 96. Performance guardrails — frontend

In addition to DOC-07/DOC-49 budgets:

- Server Components remain default;
- route-level code splitting is preserved;
- browser-only libraries are not imported into server/static content paths;
- dynamic imports align with real heavy feature boundaries;
- no broad root provider rerenders the whole application on pointer/input events;
- backdrop media is not all eager;
- font/icon delivery is bounded;
- no autoplay media/background animation is required for identity;
- material quality degrades before responsiveness.

---

## 97. Hydration guardrails

Avoid hydration mismatch patterns such as rendering directly from:

```text
Date.now()
Math.random()
window size
localStorage
browser-only time formatting
```

inside server/client shared initial markup without deterministic handling.

Visitor local time may be a small client-enhanced status value; it must not cause the entire system header to mismatch/re-render unpredictably.

Use deterministic IDs/data for SSR, and browser-only values in narrow islands.

---

## 98. Time/date presentation

Professional canonical dates render from canonical locale-aware data on the server where possible.

Visitor-local clock/status is client-only enhancement.

Do not infer Alejandro's current live timezone from the visitor's browser.

Any explicit Alejandro location/time data is canonical professional/contact content and must remain distinct from visitor device time.

---

## 99. Public shell failure strategy

If SystemClientRuntime fails to hydrate:

- canonical content remains visible;
- links remain usable where server markup can provide them;
- Contact/CV/project pages remain understandable;
- advanced selector motion, custom widgets, gamepad, audio and ephemeral overlays may degrade;
- a fatal opaque blank screen is unacceptable.

This is a guiding progressive-enhancement requirement, not a promise that every advanced interaction works without JS.

---

## 100. No-JS expectations

The portfolio is not required to provide full Arcade/Drawing functionality with JavaScript disabled.

However, meaningful professional navigation/content should degrade as far as practical to conventional links/document content.

At minimum, disabling/losing client JS should not intentionally hide:

- project titles/details;
- experience/education/certifications;
- Contact information/form fallback where feasible;
- CV links;
- public route navigation.

---

## 101. Proposed source structure

A concrete baseline:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── [locale]/...
│   ├── admin/...
│   └── api/...
│
├── components/
│   ├── primitives/
│   └── system/
│
├── features/
│   ├── home/
│   ├── projects/
│   ├── achievements/
│   ├── arcade/
│   ├── channel/
│   ├── social/
│   ├── contact/
│   ├── cv/
│   ├── settings/
│   ├── command-palette/
│   └── terminal/
│
├── runtime/
│   ├── shell/
│   ├── input/
│   ├── audio/
│   ├── preferences/
│   ├── overlays/
│   └── analytics/
│
├── lib/
│   ├── content/
│   ├── routing/
│   ├── validation/
│   ├── media/
│   ├── server/
│   └── integrations/
│
├── i18n/
├── messages/
├── styles/
└── types/

content/
cv/
public/
supabase/
tests/
docs/
```

The exact use of `src/` versus repository-root source files is not architecturally meaningful; V0 chooses one and remains consistent.

---

## 102. Public feature API convention

Each feature should expose a small intentional public API.

Example:

```ts
// features/projects/index.ts
export {ProjectSelector} from './components/project-selector';
export {ProjectDetail} from './components/project-detail';
export {getProjectDetailVM} from './server/get-project-detail-vm';
```

Consumers should not routinely deep-import private implementation files.

This makes future refactors and tool-generated changes less likely to create tangled dependencies.

---

## 103. Server and client filenames

Where useful for clarity, runtime-specific modules may use conventions such as:

```text
*.server.ts
*.client.tsx
```

or runtime-owned folders.

The project should not rely solely on naming for security; import/runtime enforcement still applies.

Do not suffix every file mechanically if it adds no clarity.

---

## 104. Type ownership

Types live with the narrowest stable owner.

Examples:

- Project canonical type → content/domain owner;
- ProjectSelector VM → project frontend feature;
- WidgetDefinition → widget system;
- SemanticAction → input/navigation runtime;
- Material tokens → visual foundation/generated type layer;
- DB row types → data/repository layer, not UI.

Avoid a single `types.ts` containing the whole application.

---

## 105. Generated types

Generated artifacts are allowed for:

- validated canonical content;
- database schema types;
- route/translation tooling where supported;
- token definitions.

Generated files must:

- be clearly marked;
- not be manually edited;
- have reproducible generation commands;
- be excluded/committed according to a documented repo rule in DOC-51.

UI business rules may not be hidden in generated code.

---

## 106. Frontend testing seams

Architecture must make the following testable without a full production stack:

- Widget Resolver as pure logic;
- preference migration/normalization;
- route-to-Dock mapping;
- locale path preservation;
- SelectionContext derivation;
- semantic input dispatch;
- Gamepad deadzone/repeat mapping;
- Command Palette command availability;
- release gating;
- DynamicBackdrop descriptor derivation;
- component visual/state contracts.

Detailed test matrix/tooling belongs to DOC-50.

---

## 107. Frontend prototype gates

Before broad implementation, V0 should prototype the highest-risk frontend ideas:

1. six-item Dock at 320 CSS px and 200% zoom;
2. Project Detail intercepted route with Back/refresh/focus restoration;
3. Personal Widget Field recomposition Wide → Compact with persisted logical preferences;
4. selected-project → DynamicBackdrop → widget retarget choreography without broad rerenders;
5. reduced-motion/transparency fallback;
6. gamepad semantic navigation through the Dock/project selector;
7. client hydration with local theme/preferences without destructive flash.

A failed prototype changes implementation detail through an ADR; it does not silently drop the approved capability.

---

## 108. Frontend anti-patterns

The following are explicitly rejected:

```text
'use client' on every page/layout
one giant AppContext containing everything
one giant Zustand store containing everything
server content copied into global client state
window.innerWidth-driven layout
pixel-based persisted Widget positions
multiple global keydown listeners
fake visual focus separate from DOM focus
full-page spinner after shell entry
all project art eager-loaded
Arcade bundle loaded on Home
Terminal loaded on first visit
raw localStorage calls inside components
raw provider fetches inside widgets
raw DB rows passed into UI
CSS magic numbers replacing approved tokens
all-glass every surface
a custom router on top of Next.js
URL and store both claiming to own current route
executable arbitrary MDX as canonical source
client-only translations for SEO-relevant content
hydration gate that renders nothing until useEffect
```

---

## 109. Accepted baseline criteria

DOC-42 is approved with the following accepted baseline:

- App Router and server-first rendering remain the frontend foundation;
- the public System Shell persists without forcing all route content client-side;
- Project Detail uses a route-backed intercepted/parallel-route baseline with a required prototype gate;
- URL state, ephemeral UI state, local preferences and domain-local high-frequency state remain separate;
- Zustand is acceptable as the small cross-cutting client-state baseline, not a server-data cache;
- InputManager/AudioManager are centralized client runtime services;
- Widget Field personalization uses a typed registry/resolver and logical local persistence;
- responsive layout is CSS/container-query first;
- next-intl is acceptable as the ES/EN UI localization baseline;
- canonical professional content passes through a typed validated server content layer;
- Markdown remains non-executable by default;
- heavy features are explicitly lazy bounded;
- Admin remains a separate shell/bundle domain;
- focus is real DOM focus and browser history remains authoritative;
- the frontend is progressively enhanced enough that professional content is not hostage to optional client runtime success.
## Storybook isolated-component baseline

V0 uses **Storybook** as the isolated component environment. Use the official Storybook integration compatible with the pinned Next.js version at bootstrap; the architecture does not pin a package version in this document.

Required global decorators/controls cover:

- Light / Dark;
- ES / EN;
- Compact / Medium / Expanded / Wide container contexts;
- Motion Full / Reduced;
- Transparency Full / Reduced / Off;
- release/feature eligibility context;
- focus / selected / locked / loading / error states;
- Widget Field S/M/L shells;
- MAT-0/1/2/3 and quality fallbacks where meaningful.

Storybook is development/CI tooling, not a Production route or public dependency.


---

## DOC-42 — Decision Registry

| ID | Decision |
|---|---|
| `FEA-001` | The frontend uses Next.js App Router as the authoritative routing/rendering system; no shadow/custom SPA router is introduced. |
| `FEA-002` | Server Components remain the default and `'use client'` is applied at the smallest stable interactive boundary. |
| `FEA-003` | The public System Shell is server-rendered and enhanced by a bounded `SystemClientRuntime` rather than being a fully client-rendered app root. |
| `FEA-004` | Root layout stays minimal and does not mount public-only interaction runtimes for Admin. |
| `FEA-005` | Locale is a route-level server-readable segment under `/[locale]`. |
| `FEA-006` | Project Detail uses a Parallel/Intercepting Route baseline so in-app navigation can preserve background context while direct URLs remain canonical. |
| `FEA-007` | The intercepted Project Detail architecture requires a V0 Back/refresh/focus/responsive prototype gate before broad reuse. |
| `FEA-008` | Route-backed interception is reserved for genuinely shareable/history-worthy surfaces; ordinary Settings/Palette/Terminal/dialogs remain transient state. |
| `FEA-009` | URL state, ephemeral UI state, persisted local preferences and domain-local runtime state are separate ownership classes. |
| `FEA-010` | Route identity is normally derived from the router and is not duplicated into a global store. |
| `FEA-011` | React local state is preferred for subtree-local state. |
| `FEA-012` | Zustand is the baseline selector-based store for small cross-cutting client interaction state; it is not the generic server-data cache. |
| `FEA-013` | Cross-cutting stores are instantiated client-side with request-safe lifecycle rather than server-shared mutable singleton state. |
| `FEA-014` | Components subscribe to narrow store selectors to avoid unrelated Shell/Widget/Backdrop rerenders. |
| `FEA-015` | Selection state persists minimum identity and derives rich presentation/context from canonical registries/data. |
| `FEA-016` | Home browsing selection does not create browser history entries; route state wins on conflict. |
| `FEA-017` | Global keyboard/pointer/touch/gamepad navigation passes through one InputManager and semantic action layer. |
| `FEA-018` | Input scope priority follows the approved overlay/workspace/game/shell context stack. |
| `FEA-019` | Input mode changes only on meaningful interaction; raw pointer/gamepad samples are not global-store updates. |
| `FEA-020` | Gamepad polling is centralized, visibility-aware and only active when relevant. |
| `FEA-021` | Audio playback is centralized in a semantic AudioManager; components do not play sound assets directly. |
| `FEA-022` | Local preferences are accessed through versioned typed repositories rather than direct scattered storage-key access. |
| `FEA-023` | The application renders deterministic safe defaults and never hides the whole UI while waiting for localStorage hydration. |
| `FEA-024` | Appearance preference pre-paint handling must be CSP-compatible and is finalized with DOC-47. |
| `FEA-025` | Personal Widget Field capability comes from a typed Widget Registry; visitor layout is separate preference data. |
| `FEA-026` | Widget Resolver deterministically combines registry, context, release state, preferences and responsive mode without persistence side effects. |
| `FEA-027` | Widget persistence stores logical order/visibility/pinning/S-M-L size only, never pixel geometry. |
| `FEA-028` | Widget Customize Mode supports accessible non-drag reordering and validates persisted preferences against current registry/release capability. |
| `FEA-029` | Widgets receive narrow view models/actions and do not directly own routing, storage, provider fetches or database knowledge by default. |
| `FEA-030` | DynamicBackdrop is a centralized environmental renderer driven by derived context descriptors. |
| `FEA-031` | Backdrop loading preloads only critical/likely-neighbor media and degrades to context color/environment when media fails. |
| `FEA-032` | Motion ownership is domain-specific; global motion preference is shared configuration and GSAP remains exception-only. |
| `FEA-033` | View Transitions/new framework navigation optimizations are progressive enhancements, not product-semantic dependencies. |
| `FEA-034` | Responsive layout is CSS/Grid/Flex/container-query first; JavaScript breakpoint logic is behavior-only and uses named shared contracts. |
| `FEA-035` | Personal Widget Field uses deterministic CSS Grid with semantic DOM/source order and controlled visual asymmetry. |
| `FEA-036` | The six-destination Dock is one persistent navigation component whose active state derives from the route. |
| `FEA-037` | One centralized Release Registry drives Coming Soon routing, Dock state, metadata, sitemap, command availability and runtime eligibility. |
| `FEA-038` | Drawing, each Arcade game, Terminal and other heavy optional experiences are explicit lazy feature boundaries. |
| `FEA-039` | Heavy game engines are not prefetched simply because an Arcade/Dock link is visible. |
| `FEA-040` | Streaming/Suspense boundaries align with real slow/failure domains and never replace the post-entry shell with a full-page spinner. |
| `FEA-041` | Missing resources use localized not-found semantics; provider/widget failures are contained by narrow error boundaries. |
| `FEA-042` | next-intl is the baseline implementation library for ES/EN system/UI localization and is pinned during V0. |
| `FEA-043` | System UI messages remain separate from canonical localized professional content. |
| `FEA-044` | Root locale negotiation is deterministic: `portfolio_locale` cookie → supported `Accept-Language` → English fallback, with a 307 private/no-store redirect and no geolocation; canonical routes remain locale-prefixed. |
| `FEA-045` | Canonical YAML/Markdown passes through one validated typed content compilation/access layer rather than ad-hoc parsing in routes. |
| `FEA-046` | Canonical professional Markdown is non-executable by default; arbitrary MDX is not part of the baseline. |
| `FEA-047` | Presentation components consume narrow frontend view models rather than raw provider/database records. |
| `FEA-048` | Tailwind + semantic CSS custom properties + targeted authored CSS implement layout/material/effect styling. |
| `FEA-049` | Approved design tokens are consumed semantically; Tailwind class strings do not become the hidden source of material-system truth. |
| `FEA-050` | Theme/context propagation uses scoped semantic variables/attributes rather than prop-drilling raw colors. |
| `FEA-051` | Manrope and IBM Plex Mono are build-time/self-hosted through the framework font pipeline with bounded subsets/weights. |
| `FEA-052` | Phosphor uses tree-shakable icon imports; custom Dock glyphs are first-party vector components rather than an icon font. |
| `FEA-053` | Media uses explicit descriptors, responsive sizing and role-aware loading rather than indiscriminate eager full-resolution assets. |
| `FEA-054` | Forms remain semantic/progressively enhanced where feasible and never show success before authoritative server acknowledgment. |
| `FEA-055` | RenderCV generation remains server/build tooling and is never shipped into the browser CV route. |
| `FEA-056` | Drawing and Arcade high-frequency state lives in dedicated engines/stores and does not drive broad React rerenders. |
| `FEA-057` | Admin uses a separate shell/bundle domain while reusing only appropriate primitives/tokens/accessibility utilities. |
| `FEA-058` | Code follows the approved L0 Foundations → L1 Primitives → L2 System → L3 Feature dependency direction. |
| `FEA-059` | Features expose intentional public APIs; cross-feature deep imports and generic dumping-ground helpers are prohibited. |
| `FEA-060` | Framework/browser routing remains authoritative for Back/Forward; transient surfaces may consume Back only according to the approved priority. |
| `FEA-061` | Actual DOM focus is the source of truth for Focus; no separate fake visual-focus state is maintained. |
| `FEA-062` | Composite selectors/toolbars may use roving tabindex while moving real DOM focus and preserving conventional keyboard behavior. |
| `FEA-063` | Command Palette and Terminal reuse semantic action/navigation registries rather than implementing parallel navigation logic. |
| `FEA-064` | Boot/onboarding enhance an already-rendered shell and never block the existence of professional content. |
| `FEA-065` | Accessibility/performance quality tiers modify shared components/tokens rather than fork accessible versus decorative component trees. |
| `FEA-066` | External-data UI consumes normalized fresh/stale/error states and never fabricates technical status. |
| `FEA-067` | SEO metadata is server-derived from canonical content/release state; non-URL selection is not treated as an indexable page. |
| `FEA-068` | Accessibility semantics are implemented primarily at primitive/system-component level and retained despite spatial visual composition. |
| `FEA-069` | Browser-visible code/config contains no privileged credentials; client validation is never the authorization boundary. |
| `FEA-070` | Canonical/UGC content avoids unsafe raw HTML by default; any rich HTML path requires explicit sanitization policy. |
| `FEA-071` | Frontend dependencies must have non-overlapping ownership; second state/i18n/animation/UI frameworks require documented justification. |
| `FEA-072` | Storybook remains the preferred isolated component environment, with exact testing integration defined by DOC-50/51. |
| `FEA-073` | Observability/analytics are accessed through internal typed facades rather than vendor calls scattered through components. |
| `FEA-074` | High-frequency inputs, drawing points, game simulation and continuous pointer samples are excluded from broad React/store rerender paths. |
| `FEA-075` | Hydration-sensitive browser values are isolated to deterministic/narrow client islands; hydration mismatches are not suppressed globally. |
| `FEA-076` | Professional core content must remain understandable if optional client runtime hydration fails, even though Arcade/Drawing require JavaScript. |
| `FEA-077` | Import/runtime boundaries are enforceable through structure/lint/build rules and client modules may not import server-only modules. |
| `FEA-078` | Types are owned by the narrowest stable domain; a global application-wide `types.ts` is prohibited. |
| `FEA-079` | Generated types/content artifacts are reproducible, clearly marked and never manually edited. |
| `FEA-080` | V0 must prototype Dock narrow-width behavior, intercepted Project Detail, Widget recomposition, selection/backdrop coordination, accessibility tiers, gamepad navigation and preference hydration before scaling implementation. |
| `FEA-081` | `Save Local` Drawing drafts use a versioned IndexedDB-backed `DrawingDraftRepository`, separate from high-frequency canvas state. |
| `FEA-082` | Accountless content deletion capabilities are stored only in a typed local `PrivacyReceiptRepository`; they do not create visitor identity. |
| `FEA-083` | Storybook is the approved V0 isolated-component environment. |

---

## 110. Decisions explicitly deferred from DOC-42

The following remain downstream decisions rather than implementer discretion:

- exact pinned Next.js/React/Tailwind/Motion/Zustand/next-intl versions → DOC-51 implementation bootstrap;
- exact Server Action/Route Handler contracts → DOC-43;
- exact request/response schemas and DTOs → DOC-43;
- exact PostgreSQL schema / generated DB types → DOC-44;
- exact Admin session/proxy/auth route protection → DOC-45;
- exact external cache TTL/revalidation mechanisms → DOC-46;
- CSP nonce/bootstrap mechanism and Trusted Types/sanitization policy → DOC-47;
- exact Vercel environment/runtime settings → DOC-48;
- exact JS/image/font budgets plus Sentry wrapper/scrubbing/performance-monitoring policy → DOC-49;
- exact unit/component/E2E/visual test toolchain → DOC-50;
- exact ESLint/import-boundary rules, Storybook config and CI scripts → DOC-51;
- whether a future second state/data library becomes justified → ADR required;
- whether localized technical pathnames are later desired → ADR required.

---

## 111. External implementation references

Informative references validated while drafting this document:

- Next.js App Router documentation: <https://nextjs.org/docs>
- Next.js Server/Client rendering guidance: <https://nextjs.org/learn/react-foundations/server-and-client-components>
- Next.js layouts/pages: <https://nextjs.org/learn/dashboard-app/creating-layouts-and-pages>
- Next.js navigation/code splitting/prefetch: <https://nextjs.org/learn/dashboard-app/navigating-between-pages>
- Next.js streaming/Suspense: <https://nextjs.org/learn/dashboard-app/streaming>
- Next.js errors/not-found: <https://nextjs.org/learn/dashboard-app/error-handling>
- Next.js Server Actions/mutations: <https://nextjs.org/learn/dashboard-app/mutating-data>
- React Server Components: <https://react.dev/reference/rsc/server-components>
- React `use client`: <https://react.dev/reference/rsc/use-client>
- next-intl: <https://next-intl.dev/>

Provider/framework references are informative. The approved product/interface behavior remains authoritative if framework implementation guidance changes.
