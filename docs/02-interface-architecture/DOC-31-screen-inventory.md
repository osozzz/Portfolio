---
id: DOC-31
title: "Screen & Workspace Inventory"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - SCR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-31 — Screen & Workspace Inventory


## Route philosophy

All public routes use a locale prefix:

`/en/...`  
`/es/...`

Technical route vocabulary remains English across languages. Example: `/es/projects/dex-sphere`. Visible UI is localized.

## Public route tree

```text
/[locale]
│
├── /projects/[slug]
├── /achievements
├── /arcade
│   ├── /glitch-runner
│   └── /reflex-deploy
├── /channel
├── /social
│   ├── /guestbook
│   ├── /sketches
│   └── /activity
├── /contact
├── /cv
├── /making-of
├── /changelog
└── /status
```

Admin is separate:

```text
/admin
/admin/login
/admin/moderation
```

Further admin subdivisions appear only when justified.

## Transient global experiences

No dedicated public route initially:

- Boot Sequence
- Onboarding
- Settings
- Command Palette
- Terminal
- Achievement Toast
- System Dialogs
- quick Popovers
- Drawing Pad
- Media Viewer mode

## Master inventory

> Route cells below may omit the `/[locale]` prefix for brevity. Unless a row explicitly says otherwise, public routes are locale-prefixed according to the route tree above.

| Experience | Route | Surface | Auth | Release |
|---|---|---|---|---|
| Boot | None | System/Cinematic | Public | V1.0 |
| Onboarding | None | Overlay/Coach Marks | Public | V1.0 |
| Home / Projects | `/[locale]` | Primary Workspace | Public | V1.0 |
| Experience | Home collection | Primary subcontext | Public | V1.0 |
| Education | Home collection | Primary subcontext | Public | V1.0 |
| Certifications | Home collection | Primary subcontext | Public | V1.0 |
| Project Detail | `/projects/[slug]` | Route Detail | Public | V1.0 |
| Project Media | project context | Overlay/Detail mode | Public | V1.0 |
| Achievements | `/achievements` | Primary Workspace | Public | V1.0 Coming Soon → V1.1 full |
| Achievement Detail | transient | Overlay | Public | V1.1 |
| Arcade Library | `/arcade` | Primary Workspace | Public | V1.0 Coming Soon → V1.3 full |
| Glitch Runner | `/arcade/glitch-runner` | Utility Workspace | Public | V1.3 |
| Reflex Deploy | `/arcade/reflex-deploy` | Utility Workspace | Public | V1.3 |
| Leaderboards | Arcade context | Overlay/Workspace | Public | V1.3 |
| Channel | `/channel` | Primary Workspace | Public | V1.0 Coming Soon → V1.4 full |
| Tech Pulse | Channel context | Feed | Public | V1.4 |
| Dev Log | Channel context | Feed | Public | V1.4 |
| Social Overview | `/social` | Primary Workspace | Public | V1.0 Coming Soon → V1.2 full |
| Guestbook | `/social/guestbook` | Workspace | Public | V1.2 |
| Sketch Wall | `/social/sketches` | Workspace | Public | V1.2 |
| Drawing Pad | transient | Utility Workspace | Public | V1.2 |
| Social Activity | `/social/activity` | Workspace | Public | V1.2 optional |
| Contact | `/contact` | Primary Workspace | Public | V1.0 |
| CV | `/cv` | Route Detail | Public | V1.0 |
| Settings | None | Overlay/Sheet | Public | V1.0 |
| Command Palette | None | System Overlay | Public | V1.1 |
| Terminal | None | System Overlay | Public | V1.1 |
| Making Of | `/making-of` | Route Detail | Public | V1.1 |
| Changelog | `/changelog` | Route Content | Public | V1.1 |
| System Status | `/status` | Route Content | Public | V1.1/V1.4 |
| 404 | framework fallback | Primary Workspace | Public | V1.0 |
| Admin | `/admin/...` | Admin Workspace | Admin only | V1.2 |

## Pre-release major-space surfaces

The six fixed Dock major routes exist from V1.0. Before a later-release space is feature-complete, its **major route** renders a localized route-backed Coming Soon workspace rather than a dead/disabled destination. Coming Soon surfaces preserve shell navigation, Back/Home recovery and accessibility, but expose no fabricated live data.

Unreleased subroutes normally 404 until their owning release. Coming Soon major routes are `noindex` and excluded from sitemap until launch. DOC-02 is the normative release owner; ADR-002 records this behavior.

## Boot

First-visit cinematic only, skippable and reduced-motion aware. It has no critical network dependency; a service failure can never strand the visitor at an initialization screen.

## Onboarding

Use contextual coach marks instead of a long tutorial. Introduce Home browsing, Dock and current input method first, then explain features such as Drawing only when first encountered.

## Home

Route: `/[locale]`

Collections:

- Projects — default
- Experience
- Education
- Certifications

Home/Projects is the strongest iiSU-inspired workspace.

Primary objects:

- ProjectSelector
- ProjectTile
- ProjectSummary
- DynamicBackdrop
- PersonalField
- ProjectHeroSlot
- WidgetField

Primary actions vary by project: Explore, Media, Repository, Live Demo when available.

### Home Personal Widget Field

Expanded/Wide Home uses a central controlled Personal Field in which the selected Project Hero coexists with contextual/system widgets. Default widget candidates may include Currently Building, Project Media, Dev Activity and Related Achievement when their `min_release`/context eligibility is satisfied. Visitors may enter explicit Customize mode to pin/unpin eligible widgets, reorder them and choose supported semantic size variants. Preferences persist locally and can be reset.

The field is visually asymmetric but technically deterministic. It does not permit arbitrary x/y placement, overlap, freeform resize, third-party widgets or a window-manager desktop. Compact renders one priority widget and exposes additional eligible widgets through a dedicated Widgets surface.

Project discovery metadata may include canonical categories/facets such as Personal Product, Professional, Academic, Experiment or Open Source plus explicit Featured ordering. `Archived` is **not** a category: it derives from the project lifecycle status. These remain metadata/filtering concepts first, not additional major navigation by default.

## Project Detail

Route: `/[locale]/projects/[slug]`

Expanded: route-backed floating surface.  
Compact: full-screen detail workspace.

Potential content:

- Overview: pitch, problem, solution, role, timeline, stack
- Architecture
- Challenges
- Media
- Lessons / Making

Only expose internal navigation for meaningful sections.

Architecture may range from responsive static SVG to a richer interactive viewer for major projects.

## Project Media

Screenshots, videos, architecture imagery and selected documents/diagrams. Opening individual media enters Viewer mode within the current major-surface architecture rather than stacking another generic modal.

## Experience

Lives inside Home. May expose organization, role, period, public-safe client/project information, responsibilities, technologies and accomplishments.

Respect confidentiality; do not publish private client details merely because they exist in work history.

## Education

Institution, program, period, current status and relevant academic work. Link meaningful academic projects where useful; avoid transcript-dump presentation.

## Certifications

Certificate name, issuer, date, public-safe credential metadata and verification link where useful.

## Achievements

Route: `/[locale]/achievements`

Categories:

- Engineering
- Career
- Academic
- Exploration
- Secrets

Real professional accomplishments and playful visitor/local achievements must be visibly distinguishable.

States:

- Unlocked
- Locked
- Secret
- Progress
- New

Achievement Detail remains transient in V1.1.

## Arcade

Route: `/[locale]/arcade`

V1.3 games:

- Glitch Runner
- Reflex Deploy
- Coming Soon tile

`Bug Hunt` remains a future candidate, not V1.3 scope.

Game routes:

- `/[locale]/arcade/glitch-runner`
- `/[locale]/arcade/reflex-deploy`

Arcade flow is deliberately split into three concepts:

- navigation: `Library → Game Detail → Session → Result`;
- session states: `ready → active ↔ paused → finished`;
- session actions: `start`, `pause`, `resume`, `exit`, `retry`.

`Result` is post-session presentation, not a session-state enum value.

Leaderboard identity can use a temporary public nickname. No account/email required.

Client cannot directly write arbitrary score values; server-created/validated session/result flow is required.

## Channel

Route: `/[locale]/channel`

Primary feeds:

- Tech Pulse
- Dev Log

Currently Building may appear as contextual/status information rather than a third full feed.

### Tech Pulse

Curated technology topics Alejandro currently cares about, not a generic news clone. Possible topics: AI, Web, Mobile, Cloud, Security, Developer Tools.

Sources are visibly attributed and cached/stale fallback is supported.

### Dev Log

Can combine public GitHub-derived activity and manually curated milestones. Development storytelling is not reduced to commit counts.

## Social

Route: `/[locale]/social`

Subsections:

- Overview
- Guestbook
- Sketch Wall
- Activity — lower priority / optional V1.2

This is a lightweight community area, not a social network. No visitor accounts, profiles, follows or DMs.

### Guestbook

Route: `/[locale]/social/guestbook`

Composer:

- nickname
- message
- spam protection
- submit

Content moderation states:

- pending
- approved
- rejected
- hidden

Reports are separate records/signals with their own open/resolved lifecycle; an approved item can have an open report without becoming a `reported` content state. Public client receives only approved public-safe data.

### Sketch Wall

Route: `/[locale]/social/sketches`

Shows approved Drawing Pad creations with nickname/date/light reactions/report. No arbitrary image uploads.

### Drawing Pad

Transient Utility Workspace launched from Sketch Wall.

Flow:

`Create → Save Local optional → Publish → nickname/confirmation → moderation → Pending → Approved → Sketch Wall`

Never claim Published before approval.

## Contact

Route: `/[locale]/contact`

Primary content:

- ContactProfile
- ContactForm

Recommended fields:

- Name
- Email
- Message
- Subject optional or omitted V1.0

Submission flow:

`client validation → server validation → anti-spam/rate limit → minimal persistence if needed → email delivery → success state`

Preserve typed content if sending fails.

## CV

Route: `/[locale]/cv`

Consumes RenderCV-generated English and Spanish artifacts.

Pipeline begins in V0:

`canonical professional content → RenderCV source → validation → RenderCV/Typst → EN/ES PDF`

Public CV route/presentation ships in V1.0.

Generated PDFs are artifacts, never the editable source.

## Settings

Transient sections:

- Appearance
- Language
- Sound
- Motion
- Transparency
- Privacy
- Widget Layout / Customize
- Local Data
- About/System

Potential local data includes theme, language, sound, volume, motion, transparency, onboarding, optional remembered name, local achievements, versioned Widget Field pin/order/size preferences, Drawing drafts and accountless privacy receipts. `Local Data` must distinguish harmless preferences from user-created drafts and deletion capabilities, offer appropriate clear/reset/export/copy actions, and use versioned local schemas rather than one unstructured blob.

## Command Palette

Global transient system surface accessible through Cmd/Ctrl+K plus a touch path.

Search/actions include Projects, spaces, Settings, CV, Arcade and system commands.

## Terminal

Discoverable through Command Palette. Safe predefined commands only. No `eval`, shell or arbitrary server calls.

Add an explicit security test ensuring command parsing cannot escape the command registry.

## Making Of

Route: `/[locale]/making-of`

Potential sections:

- Concept
- iiSU inspiration
- Interaction philosophy
- Liquid Glass
- Responsive strategy
- Architecture
- Accessibility
- RenderCV
- Security
- Performance
- implementation workflow
- selected ADRs

The portfolio itself becomes a case study.

## Changelog

Route: `/[locale]/changelog`

Curated versioned releases grouped by Added / Improved / Fixed / Changed. GitHub release metadata may assist, but public storytelling remains curated.

## System Status

Route: `/[locale]/status`

Potential systems:

- Portfolio Core
- GitHub Integration
- Tech Pulse
- Guestbook
- Sketch Wall
- Arcade Scores
- Contact Delivery

Early versions can expose build/deployment/integration state without pretending to run enterprise monitoring. No fake CPU/RAM telemetry.

## 404 and global errors

404 remains inside the visual system:

`SIGNAL LOST — This location doesn't exist.`

Expose obvious Home/Projects/Palette recovery.

Global error boundary preserves the shell where possible and may show Retry/Home plus a technical error ID. Never expose production stack traces.

## Admin / authentication

Admin is the only authenticated user class in V1.x. Visitors never need accounts to browse, play, draw, submit, contact or download CV.

Admin may use Supabase Auth.

Initial V1.2 scope:

- `/admin/login`
- `/admin`
- `/admin/moderation`
- guestbook/sketch/report moderation
- basic ban management

Prioritize moderation rather than building a full CMS before the public product exists.

Because visitors lack accounts, ban design must use privacy-conscious server identifiers such as temporary IP-derived HMAC/rate-limit keys instead of casually storing raw IP indefinitely.

Moderation actions produce audit records.

## Task-specific identity

Guestbook nickname, score nickname, sketch nickname and Contact identity remain separate. No implicit universal visitor profile.

## Release map

> **Summary only. DOC-02 is the normative release/scope owner.** This section mirrors DOC-02 for screen-planning convenience and must be updated atomically when release scope changes.

### V0 — Foundation

- repository/docs
- design/system foundations
- routing/i18n
- data/content model
- Supabase baseline
- CI/CD/testing
- RenderCV pipeline
- security baseline
- implementation-tool rules

### V1.0 — Professional Portfolio

- Boot/onboarding
- System Shell
- fixed six-space Dock with route-backed Coming Soon surfaces for unreleased spaces
- Home Projects
- Experience/Education/Certifications
- Project Detail/Media
- controlled Personal Widget Field personalization
- Contact
- CV
- Settings
- ES/EN
- light/dark
- sound preference
- responsive system
- SEO/404

### V1.1 — Personality

- Achievements
- Command Palette
- Terminal
- Making Of
- Changelog
- basic Status
- Easter eggs
- custom cursor
- returning personalization

Achievement data/local persistence foundation may be prepared internally in V1.0 before public Achievements ships.

### V1.2 — Community

- Social
- Guestbook
- Sketch Wall
- Drawing
- reporting
- moderation
- Admin

Activity is optional if scope pressure exists.

### V1.3 — Arcade

- Arcade Library
- Glitch Runner
- Reflex Deploy
- server sessions
- leaderboard
- anti-cheat plausibility
- Arcade achievements

### V1.4 — Live System

- Tech Pulse
- Dev Log
- GitHub integration
- advanced Currently Building
- dynamic OG
- richer System Status
- external caching

V1.0 must already stand alone as a complete professional portfolio.

## Explicit non-goals

Current scope excludes:

- visitor registration/login
- visitor profiles
- followers
- visitor DMs
- real-time public chat
- project comments
- e-commerce
- public API
- native mobile app
- theme marketplace
- third-party/user-authored widgets
- unrestricted freeform dashboards, arbitrary pixel placement, overlapping widget windows or unconstrained resizing
- more than two initial Arcade games

Future inclusion requires deliberate ADR/scope review.

## Completion contract

A workspace is not done until it is:

- content complete
- functional
- responsive
- keyboard accessible
- touch accessible
- relevant gamepad behavior implemented
- loading/empty/error states handled
- localized EN/ES
- performance checked
- analytics defined where appropriate
- security reviewed where applicable
- tested

A public route additionally needs metadata, canonical URL, Open Graph, locale alternates, direct-entry behavior, history behavior and explicit SEO index decision.

## Decision registry

- SCR-001 — All public routes use a locale prefix.
- SCR-002 — Technical route vocabulary remains English across locales.
- SCR-003 — Home remains `/[locale]` and defaults to Projects.
- SCR-004 — Experience/Education/Certifications remain Home collections.
- SCR-005 — Project Detail uses `/projects/[slug]`.
- SCR-006 — Project Detail navigation exposes only meaningful sections.
- SCR-007 — Achievements has its own major route.
- SCR-008 — Real accomplishments and playful visitor achievements remain visibly categorized.
- SCR-009 — Arcade games receive stable routes while gameplay uses Utility Workspace behavior.
- SCR-010 — Arcade V1.3 contains two games only.
- SCR-011 — Channel consists primarily of Tech Pulse and Dev Log.
- SCR-012 — Dev Log supports curated/manual milestones plus GitHub-derived activity.
- SCR-013 — Social contains Overview, Guestbook, Sketch Wall and optional Activity.
- SCR-014 — Drawing Pad remains a transient Utility Workspace.
- SCR-015 — Drawings are never presented as published before moderation approval.
- SCR-016 — Contact is a dedicated major route and remains professionally restrained.
- SCR-017 — CV uses `/cv` and consumes RenderCV-generated EN/ES artifacts.
- SCR-018 — RenderCV infrastructure begins in V0.
- SCR-019 — Settings, Command Palette and Terminal remain transient system surfaces.
- SCR-020 — Making Of, Changelog and Status receive stable public routes.
- SCR-021 — Admin is the only authenticated user class in V1.x.
- SCR-022 — Visitors require no accounts for public/community functionality.
- SCR-023 — Task-specific identities do not form an implicit visitor identity.
- SCR-024 — Initial Admin scope prioritizes moderation over a general CMS.
- SCR-025 — Recoverable failures preserve the System Shell.
- SCR-026 — V1.0 already stands alone as a complete professional portfolio.
- SCR-027 — V1.1–V1.4 add personality/community/play/live data progressively.
- SCR-028 — Achievement foundations may exist internally in V1.0 before public Achievements ships.
- SCR-029 — Excluded features require future ADR review.
- SCR-030 — Every public screen satisfies responsive/accessibility/localization/state contract before completion.

- SCR-031 — Home includes a central Personal Widget Field around/alongside the selected Project Hero.
- SCR-032 — Widget Field customization is an explicit local-only feature and requires no visitor account.
- SCR-033 — Compact exposes one priority widget plus a dedicated Widgets surface instead of shrinking the desktop field.

- SCR-034 — All six major Dock routes exist from V1.0; unreleased major spaces render localized Coming Soon route surfaces rather than dead controls.
- SCR-035 — Unreleased major-space Coming Soon routes are noindex/sitemap-excluded until feature launch; unreleased subroutes normally remain unavailable.
- SCR-036 — Arcade navigation, session states and session actions are separate taxonomies.
- SCR-037 — UGC reporting is a separate report lifecycle and not a mutually exclusive content moderation state.
