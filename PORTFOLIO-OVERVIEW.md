# Portfolio — System Overview

**Repository:** osozzz/Portfolio  
**Canonical branch:** main  
**Snapshot commit:** 8cc5c9e01a71925fb44d9abd6f7f50e7267db06f  
**Snapshot date:** 2026-10-15  
**Canonical detailed documentation:** /docs + approved ADRs

## 1. What we are building

This portfolio is not a conventional developer landing page. It is a responsive interactive personal portfolio presented as a premium digital system/console interface: a web product that should feel like software you inhabit while remaining as understandable, navigable, semantic, indexable and resilient as a high-quality website.

Its professional purpose is primary: communicate Alejandro's projects, experience, education, certifications, CV, technical thinking, capabilities and contact paths. The system-like shell, spatial navigation, Widget Field, Arcade, achievements, community surfaces, Terminal, secrets and delight layers exist to demonstrate product, design and engineering ability without making the professional portfolio harder to use.

The approved metaphor is:

**Console Launcher + Personal Operating System + Interactive Portfolio**

The product must not become a literal parody OS, a freeform desktop/window manager, a client-only SPA, or a game platform that hides the professional content.

## 2. Documentation and decision model

The documentation is intentionally architecture-first and traceable. Markdown is canonical. Generated PDFs, screenshots, exports and snapshots are artifacts rather than editable sources of truth.

The documentation is divided into:

- DOC-00–DOC-04: project foundation, vision, scope, audiences and journeys.
- DOC-05–DOC-19: product requirements, accessibility, security, community, Arcade, integrations, SEO, delivery and tooling governance.
- DOC-20–DOC-32: interface architecture: interaction philosophy, navigation, input, focus, widgets, surfaces, responsive behavior, motion, audio and screen inventory.
- DOC-33–DOC-40: visual design, color, typography, content architecture, CV, geometry, Liquid Glass and visual states.
- DOC-41–DOC-51: technical architecture: frontend, backend, persistence, auth, integrations, security, infrastructure, reliability, testing and CI/CD/developer experience.
- /docs/decisions: approved ADRs.
- /docs/reviews: audits, amendments and evidence.

Authority is domain-aware. An approved ADR that explicitly supersedes a decision wins first; then the canonical domain owner for the concern; then dependent specifications, requirements, implementation notes and finally existing code. Existing code cannot silently override approved architecture.

## 3. Release roadmap

### V0 — Foundation

Repository/documentation governance, reproducible Next.js workspace, routing and i18n foundations, Storybook/design-system groundwork, local database foundation, canonical content pipeline, RenderCV pipeline, testing, CI/CD and developer tooling.

### V1.0 — Professional Portfolio

Boot, persistent public shell, fixed six-space Dock, Home/Projects, Experience, Education, Certifications, Project Detail, Project Media, controlled Widget Field personalization, Contact, CV, Settings, EN/ES, themes, sound controls, responsive behavior, SEO and 404.

### V1.1 — Personality

Achievements, Command Palette, Terminal, Making Of, Changelog, basic Status, custom-cursor polish, Easter eggs and returning-visitor personalization.

### V1.2 — Community

Social Overview, Guestbook, Sketch Wall, Drawing Pad, reports, moderation and Admin. Social Activity and reactions may remain optional depth.

### V1.3 — Arcade

Arcade Library, Glitch Runner, Reflex Deploy, server-issued eligible sessions, leaderboard validation/publication and Arcade-related achievements.

### V1.4 — Live System

Channel, Tech Pulse, Dev Log/GitHub activity, richer live widgets, dynamic OG and integration/status improvements.

V1.0 must already work as a complete professional portfolio. Later releases add personality and depth rather than rescuing missing core utility.

## 4. Global navigation

The fixed Dock order is:

**Home → Achievements → Arcade → Channel → Social → Contact**

Projects is not a Dock destination. Home contains Projects, Experience, Education and Certifications, with Projects as the default collection.

All six Dock destinations exist from V1.0. If a later-release major space is not yet complete, its route renders a truthful, localized, route-backed Coming Soon workspace rather than a dead or disabled control.

## 5. Home and spatial project discovery

Home/Projects is the strongest system-like workspace. The central interaction is a Spatial Project Selector rather than a conventional card grid.

Selection is not activation. Browsing a project can update the Project Hero, DynamicBackdrop, project metadata and eligible contextual widgets without opening Project Detail.

Project Detail is a real shareable route in both locales and may appear as a route-backed floating detail surface during in-app navigation while remaining reconstructible from a direct URL or refresh.

## 6. Personal Widget Field

The Personal Widget Field is one of the defining product signatures. It is a central controlled modular space in Home where the selected Project Hero coexists with eligible contextual/system widgets.

Initial widget priorities include:

- Currently Building.
- Project Media.
- Dev Activity.
- Related Achievement.

V1.0 personalization supports pin/unpin, logical reorder, declared semantic sizes, versioned local persistence, reset and an explicit Customize mode. Drag can enhance customization, but accessible non-drag controls remain required.

The layout is not a free desktop. Arbitrary x/y coordinates, overlap, z-order windows, unconstrained resize, scripting and third-party or visitor-authored widgets are explicitly excluded.

Responsive widget budgets are approximately:

- Compact: one primary widget visible, with additional eligible widgets through a dedicated Widgets surface.
- Medium: up to two.
- Expanded: two to three.
- Wide: three to four.

Preferences store logical intent such as pin/order/size rather than breakpoint-specific pixel coordinates.

## 7. Interaction and input model

The interface keeps these states distinct:

**Hover != Focus != Selected != Active != Pressed**

- Active: where am I?
- Selected: what am I exploring?
- Focus: what will the next action affect?
- Pressed: what action is currently being performed?

Input follows a semantic pipeline:

**Physical Input → Adapter → Semantic Action → Context → Response**

Supported modes are pointer, keyboard, touch and progressive-enhancement gamepad. DOM focus remains the real source of focus truth.

## 8. Responsive architecture

The four responsive modes are Compact, Medium, Expanded and Wide.

The governing rule is **recompose before shrinking**. Layout may change orientation and composition while preserving capability and logical state.

Core capability cannot be desktop-only. Safe areas, dynamic viewport units, text/zoom resilience and orientation independence are required.

## 9. Visual identity

The approved direction is **Soft Future Personal Computing**: a calm, future-facing personal-computing environment where Alejandro's work becomes the world around the interface.

The conceptual blend is approximately:

- 65% Soft Future Console.
- 30% Personal Computing Editorial.
- 5% Future Nostalgia.

The strongest visual signatures are:

- Spatial Project Selector.
- Personalizable Widget Field.
- Liquid Glass Global Dock.
- DynamicBackdrop.
- Selected-object gravity.
- Restrained human/editorial details.

iiSU is an inspiration for spatial browsing, contextual widgets, focus hierarchy and personal-system feeling; its logos, proprietary artwork, icons, sounds, typography and exact layouts are not copied.

The product explicitly avoids generic dark-developer-portfolio styling, neon cyberpunk, gamer RGB, Web3/HUD clichés, an Apple clone and unusable concept-art aesthetics.

## 10. System identity, project identity and Liquid Glass

System Identity remains stable across projects: typography base, Dock/system controls, material/shape language, motion grammar, iconography and focus hierarchy.

Project Identity may influence accent, environmental artwork, secondary tint, motifs and media, but does not repaint every semantic control or status color.

Liquid Glass is an optical material system rather than a generic backdrop-blur card style. Important reading surfaces become quieter and more opaque. Reduced and solid fallbacks preserve capability.

## 11. Component architecture

Frontend component layers are:

- L0 Foundations: tokens, types and foundational styles.
- L1 Primitives: Button, IconButton, Stack, Grid, Text, Heading, Surface, Badge, Toggle and similar.
- L2 System Components: Dock, SystemChrome, WidgetShell, OverlaySurface, ToastHost, DynamicBackdrop.
- L3 Feature Components: ProjectSelector, AchievementGrid, GuestbookWall, DrawingWorkspace, GameSessionShell and similar.

Dependency direction is **L3 → L2 → L1 → L0**.

Feature folders own their internals and expose intentional public APIs. Generic system components must not depend on a specific feature or game. Client components must not import server-only modules.

## 12. Frontend rendering model

The implementation baseline is Next.js App Router + React + TypeScript. Server Components are the default. Client Components are introduced only at the smallest stable interactive boundary that genuinely requires browser behavior.

The public experience is conceptually:

**server-rendered semantic document + route-aware persistent shell + small deliberate client runtimes + interruptible motion + local personalization**

The portfolio must still expose useful project, experience, CV and Contact content if optional client enhancements fail.

## 13. Localization

English and Spanish are equal first-class locales.

Canonical public routes use locale prefixes /en/... and /es/.... Technical slugs remain stable English across both locales.

Root / is redirect-only and selects locale in this order:

1. explicit portfolio_locale cookie,
2. supported Accept-Language match,
3. English fallback.

No geolocation is used for language selection.

Localization includes navigation, professional content, settings, onboarding, forms, errors/success, achievements, secret text, 404/status/changelog/Terminal responses, accessibility labels, SEO/OG text and CV artifacts.

## 14. Accessibility

Accessibility is a cross-cutting acceptance criterion and targets WCAG 2.2 AA-compatible public-core behavior.

The governing rule is:

**Accessibility may simplify presentation, but must never remove capability.**

Requirements include native semantics, logical landmarks, keyboard operation, visible focus, intentional focus restoration, restrained live regions, reduced motion/transparency, high-contrast fallbacks, touch/motor alternatives, functional zoom, non-color-only state communication, accessible forms/media and no orientation lock.

Gamepad remains progressive enhancement and never replaces keyboard/touch access.

## 15. Canonical professional content

Professional facts are maintained once and projected into surfaces.

The central rule is:

**Facts are canonical once; surfaces render projections of those facts.**

Content classes are:

- CANONICAL_FACT: role, employer, dates, education, certification, skill, public link.
- CURATED_NARRATIVE: project problem, solution, challenges and lessons.
- MANAGED_STATUS: Currently Building/current-work status.
- EXTERNAL_DYNAMIC: GitHub activity and Tech Pulse items.
- UGC: Guestbook, approved Sketches and optional reactions.

Canonical professional domains include Profile, Public Links, Experience, Education, Certifications, Languages, Skills/Technologies, Projects, Professional Highlights and public Availability/Status.

The system and implementation tooling must never invent employers, dates, roles, certifications, metrics, technologies, clients or outcomes simply to complete a layout.

## 16. RenderCV pipeline

The public CV is a generated projection of the canonical professional dataset, not an independently edited document.

Pipeline:

**Canonical professional facts → CV projection → RenderCV source → validation → generated EN/ES artifacts**

The PDFs are never manually edited. EN and ES share identities, chronology, dates, organizations, credentials, links, section architecture and design; localized narrative can differ naturally without contradicting facts.

## 17. Currently Building source of truth

Through the approved V1.x baseline, Currently Building is repository-authored managed status. It is build/deploy updated, may reference canonical projects and is distinct from canonical project lifecycle status.

There is no runtime managed_status table and no V1.2 Admin editor for this field. Moving it to runtime authority later requires a new source-of-truth migration ADR. Two writable authorities are never permitted simultaneously.

## 18. Community

Community introduces lightweight human presence rather than a social network.

V1.2 includes Social Overview, Guestbook, Sketch Wall, Drawing Pad, reports and moderation. Reactions and Social Activity are optional depth.

Visitors do not have accounts. Nicknames are presentation metadata, not authenticated identity. Contact data is not reused to build a hidden visitor profile.

Moderation states are pending, approved, rejected and hidden. Report lifecycle is separate: open, resolved or dismissed.

## 19. Accountless deletion

Because visitors do not have accounts, accepted/published Guestbook, Sketch and Arcade resources can issue a high-entropy resource-specific deletion capability to the submitting browser. The server stores only its digest.

Possession authorizes deletion/anonymization of that specific resource and does not create a cross-feature visitor identity.

## 20. Arcade

Initial public games are exactly:

- Glitch Runner.
- Reflex Deploy.

Navigation flow is **Library → Game Detail → Session → Result** while session state is **ready → active ↔ paused → finished**.

Gameplay remains local/high-frequency; authoritative score publication uses server-issued session context, plausibility validation, rate limits and idempotent finalization. The objective is pragmatic anti-cheat against trivial forged score insertion, not e-sports-grade trusted computing.

## 21. Runtime data model

PostgreSQL via Supabase owns runtime data, not canonical professional content. Tables such as projects, experience, skills or certifications cannot become a second source of truth without an approved ADR.

Runtime persistence covers Community, reports/moderation, Arcade, Admin/audit, abuse controls, Contact delivery metadata and external cache/job state.

IDs are UUIDs; persistent timestamps are timestamptz; migrations are version-controlled. Lifecycle/status values use text plus named CHECK constraints in the baseline.

## 22. Community data model

The main UGC model uses a common parent:

**community_submissions → guestbook_entries | sketches**

The parent owns shared moderation, idempotency, abuse and deletion metadata. Reports and optional reactions reference the parent. This is a UGC-domain abstraction, not a visitor-profile abstraction.

Other runtime structures include community_reports, optional community_reactions, admin_audit_events, abuse_bans and PostgreSQL-backed rate-limit buckets.

## 23. Arcade persistence

The Arcade domain separates:

- arcade_game_sessions: server-issued authoritative session state.
- arcade_session_evidence: short-retention/internal plausibility evidence where needed.
- arcade_scores: safe accepted public leaderboard rows.

Accepted score rows do not contain anti-cheat evidence or abuse identifiers. Session finalization atomically transitions the session and creates at most one score.

## 24. Contact architecture

Contact is not a covert CRM. V1.0 does not retain Contact name/email/message body in a general database inbox after delivery.

Delivery is performed through the email-provider boundary, with Resend as the baseline. A narrow contact_delivery_operations metadata ledger supports idempotency/retry handling without storing the message body.

## 25. Authentication and Admin

Visitors do not authenticate in V1.x. Admin is the only authenticated product identity.

Identity is deliberately layered:

**Supabase Auth identity → active admin_profiles allowlist → application-service authorization**

A valid Auth user is not automatically an application Admin.

The production baseline is email/password as first factor plus mandatory TOTP, with operational Admin sessions requiring AAL2. There is no generalized RBAC system in V1.x; one ADMIN role is sufficient until requirements change.

Admin focuses on moderation/runtime safety and does not silently become a CMS for repository-owned professional data.

## 26. Security posture

The browser is untrusted. Client-hidden UI, obscure routes and TypeScript types are not authorization boundaries.

Public writes receive server-side schema validation, size limits, abuse/rate controls and anti-bot verification where justified. UGC renders as safe text/structured data rather than arbitrary HTML. Privileged provider/database secrets never reach client bundles.

The project uses deny-by-default database grants/RLS, feature-scoped pseudonymous abuse identifiers rather than a universal visitor profile, minimal retention and explicit security gates before Contact, Community/Admin and leaderboards launch.

## 27. Technical architecture

The product is a modular full-stack web application / modular monolith rather than microservices.

Conceptual topology:

**Browser → Next.js on Vercel → application services/adapters → Supabase / Resend / GitHub / Tech feeds / Turnstile / Sentry**

External provider shapes, errors and tokens remain behind narrow provider-neutral adapters. Optional integrations enhance the professional core; they do not become hidden availability dependencies.

## 28. Technology baseline

- TypeScript.
- pnpm.
- Next.js App Router.
- React.
- Tailwind CSS + CSS Custom Properties + targeted authored CSS.
- Motion.
- PostgreSQL via Supabase.
- Supabase Auth.
- Supabase Storage where runtime storage is genuinely needed.
- Vercel.
- Resend.
- Turnstile or equivalent risk-based anti-bot.
- Sentry behind a centralized observability wrapper.
- Vitest and Testing Library.
- Playwright.
- Supabase CLI + pgTAP.
- RenderCV/Typst pipeline for bilingual CV artifacts.

Product analytics is disabled by default in V0/V1.0 behind a no-op wrapper until a separate privacy/provider decision enables it.

## 29. Infrastructure

Infrastructure is managed/serverless-first. The product intentionally avoids VPS administration, Kubernetes, self-managed reverse proxies and self-hosted database operations in V1.x.

Environment classes are Local, Preview, optional Staging and Production. Preview never receives production data/secrets by convenience. Local development should reproduce most behavior with local Supabase, migrations, synthetic data and provider fakes/sandboxes.

Canonical public domain: **alejosorno.dev**.

Vercel owns global edge/CDN/TLS/application hosting; Supabase owns managed PostgreSQL/Auth/data services; repository code, docs and migrations preserve reproducibility.

## 30. Reliability and graceful degradation

Canonical professional content and core navigation receive higher reliability priority than optional external/live/game systems.

Optional provider failures are localized: a GitHub or Tech Pulse outage cannot erase Projects, Experience or CV; a leaderboard publication failure should not necessarily destroy a completed local game; widgets can show stale/degraded data independently.

The interface may look like a personal operating system, but it must perform like a disciplined website.

## 31. Testing and quality engineering

Quality is layered:

- Static: TypeScript, ESLint, schemas, content and boundary validators.
- Unit: Vitest.
- Component: Vitest + Testing Library/user-event.
- Service integration: application services with controlled dependencies.
- Database: Supabase CLI + pgTAP.
- Contract: schemas/provider fixtures.
- E2E: Playwright.
- Accessibility: axe + browser automation + manual assistive-technology review.
- Visual: screenshot regression.
- Performance: build analysis + Lighthouse/browser metrics.
- Security: static, behavioral and targeted adversarial verification.
- Resilience: controlled fault injection.
- Recovery: isolated restore/runbook drills.
- Exploratory: human review.

Tests should verify behavior at the lowest reliable layer and then prove critical journeys again at the real system boundary.

## 32. Git/GitHub delivery model

Normal work follows:

**Issue → short-lived branch → implementation/verification → Pull Request → review/checks → squash merge → main**

There is no permanent develop branch. Main stays releasable/protected.

GitHub Project is an execution view rather than a requirements source. The GitHub Wiki is a required human-friendly help/navigation layer but remains non-canonical; /docs + approved ADRs remain authoritative.

Milestones map to release boundaries V0, V1.0, V1.1, V1.2, V1.3 and V1.4.

## 33. Decision-making process

Implementation must not silently rewrite approved architecture. When code and docs disagree, code is the defect unless a decision is explicitly changed.

Typical change flow:

**Implementation discovery → proposal/impact analysis → ADR or canonical-doc amendment → approval → implementation**

Known contract changes update governing documentation in the same PR rather than leaving a future documentation issue by default.

## 34. Current ADRs

### ADR-001 — Controlled Personal Widget Field

Approves meaningful V1.0 local personalization—pin/unpin, reorder and supported semantic sizes—while retaining controlled responsive slots and explicitly rejecting a freeform desktop/window manager.

### ADR-002 — Fixed-Dock pre-release route gating

Defines V1.0 as the base release and requires all six Dock destinations to be real routes from V1.0. Later-release major spaces use accessible localized Coming Soon workspaces until launch.

### ADR-003 — Currently Building source of truth

Keeps Currently Building repository-authored through V1.x. Admin/runtime editing requires a future explicit source-of-truth migration ADR.

## 35. Explicit non-goals

The current baseline does not include visitor accounts, follower/friend graphs, visitor DMs, real-time public chat, e-commerce, payments, a public third-party API, native mobile backends, unrestricted freeform widget desktops, third-party/user-authored widget plugins, a theme marketplace, microservices/Kubernetes, arbitrary public image uploads or more than the two approved initial Arcade games.

## 36. Current implementation state

At this snapshot:

- Product specification: complete and approved.
- Interface architecture: complete and approved.
- Visual design foundation: complete and approved.
- Technical architecture: complete and approved.
- Final architecture consistency audit: PASS with no unresolved P0–P3 findings.
- Repository/GitHub governance and Project setup: completed.
- Approved documentation baseline: merged to main.
- Current implementation frontier: V0 workspace bootstrap, issue #88, Bootstrap a reproducible Next.js application workspace.

## 37. Recommended reading order

For a complete understanding, begin with:

1. docs/README.md
2. docs/00-project/DOC-00-master-guide.md
3. docs/00-project/DOC-02-scope-release-boundaries.md
4. docs/02-interface-architecture/DOC-32-interface-master-spec.md
5. docs/03-visual-design/DOC-33-visual-identity-direction.md
6. docs/03-visual-design/DOC-36-content-architecture-canonical-professional-data.md
7. docs/04-technical-architecture/DOC-41-technical-architecture-master-blueprint.md
8. docs/04-technical-architecture/DOC-42-frontend-architecture-rendering-state-boundaries.md
9. docs/04-technical-architecture/DOC-51-repository-cicd-developer-experience-implementation.md
10. Applicable ADRs and domain-specific documents for the feature being implemented.

For implementation tasks, always read the approved ADRs that affect the task, then DOC-00 authority rules, then the canonical domain owner and its relevant dependencies before treating existing code as guidance.
