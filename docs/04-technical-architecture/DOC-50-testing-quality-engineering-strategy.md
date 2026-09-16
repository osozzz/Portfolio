---
id: DOC-50
title: "Testing & Quality Engineering Strategy"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Testing & Quality Engineering"
canonical_domain_owner: testing_quality_engineering

depends_on:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-07
  - DOC-08
  - DOC-09
  - DOC-10
  - DOC-11
  - DOC-12
  - DOC-13
  - DOC-14
  - DOC-15
  - DOC-16
  - DOC-17
  - DOC-18
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
  - DOC-34
  - DOC-35
  - DOC-36
  - DOC-37
  - DOC-38
  - DOC-39
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
  - ADR-001
  - ADR-002

decision_families:
  - TQE
approved_at: 2026-09-15
last_updated: 2026-09-15
---

# DOC-50 — Testing & Quality Engineering Strategy

> **Status:** APPROVED.  
> **Role:** Convert the approved product, interface, visual, technical, security, performance and reliability architecture into a layered, deterministic and maintainable verification system. This document defines what must be tested, at which layer, with which class of tool, against which environments, and which failures block release.

---

## 1. Purpose

The portfolio is not a static brochure. It contains a persistent system shell, route-backed overlays, bilingual canonical content, local personalization, a customizable Widget Field, public mutations, moderation, Admin authentication, Drawing, Arcade, external integrations, generated CV artifacts, Liquid Glass, motion, accessibility modes and production observability.

A project with this many interaction and trust boundaries can appear correct in a happy-path browser session while still failing in important ways:

- keyboard focus can drift away from visual selection;
- Spanish can render correctly while English breaks layout;
- a Widget layout can survive Wide but corrupt Compact;
- a Guestbook entry can bypass moderation;
- two Arcade finalization requests can create duplicate scores;
- a Drawing payload can become a renderer denial-of-service vector;
- a visual refactor can silently destroy contrast;
- a provider outage can unexpectedly take down Home;
- a valid Admin password can be accepted without AAL2;
- a migration can pass locally but violate production RLS assumptions;
- a beautiful route can ship a 700 KB initial JavaScript regression.

DOC-50 defines the quality system that makes these failures visible before they become production behavior.

---

## 2. Quality north star

The testing philosophy is:

> **Test behavior at the lowest reliable layer, then prove critical journeys again at the real system boundary.**

This means:

- pure business rules are not tested only through the browser;
- browser behavior is not assumed correct because unit tests pass;
- database security is not inferred from repository mocks;
- visual quality is not inferred from DOM assertions;
- accessibility is not reduced to an automated axe scan;
- performance is not inferred from bundle size alone;
- security is not reduced to dependency scanning;
- provider resilience is not trusted until dependency failure is deliberately exercised.

The objective is not “maximum number of tests.” The objective is **high confidence per unit of maintenance cost**.

---

## 3. Quality attributes under test

The test system must verify at least these approved quality attributes:

1. **Functional correctness** — DOC-05/DOC-06.
2. **Release boundaries and feature gating** — DOC-02 + ADR-002.
3. **Accessibility and inclusive behavior** — DOC-11.
4. **Security/privacy/abuse prevention** — DOC-12 + DOC-47.
5. **Bilingual parity** — DOC-10 + DOC-36.
6. **Interaction grammar** — DOC-20 through DOC-32.
7. **Visual system correctness** — DOC-34/35/38/39/40.
8. **Canonical content integrity** — DOC-36.
9. **RenderCV correctness** — DOC-37.
10. **Frontend boundaries/state behavior** — DOC-42.
11. **Backend/API contracts and idempotency** — DOC-43.
12. **Database constraints/RLS/transactions** — DOC-44.
13. **Authentication/authorization/AAL2** — DOC-45.
14. **Integration resilience/cache semantics** — DOC-46.
15. **Threat mitigations** — DOC-47.
16. **Environment/deployment/recovery behavior** — DOC-48.
17. **Performance/SLO/reliability budgets** — DOC-49.

A requirement is not considered safely implemented merely because one layer has a passing test.

---

## 4. Verification layers

The project uses the following verification stack.

| Layer | Primary purpose | Typical tool class |
|---|---|---|
| Static | Types, lint, schema, content, dependency boundaries | TypeScript, ESLint, custom validators |
| Unit | Pure logic and deterministic state | Vitest |
| Component | Interactive Client Components/primitives | Vitest + Testing Library |
| Service integration | Application services + repositories/adapters | Vitest + controlled fakes/local dependencies |
| Database | Constraints, RLS, SQL functions, migrations | Supabase CLI + pgTAP |
| Contract | DTO/provider/protocol/schema compatibility | Vitest/schema fixtures |
| E2E | Real browser journeys against production build | Playwright |
| Accessibility | Automated + manual inclusive verification | axe + Playwright + manual AT |
| Visual | Layout/material/state regression | Playwright screenshots |
| Performance | Bundles, Lighthouse, targeted interaction/perf checks | build analysis + Lighthouse CI + browser metrics |
| Security | Static, behavioral and targeted adversarial tests | scanners + Playwright/API tests + manual review |
| Resilience | Provider/database/failure-mode behavior | controlled fault injection |
| Recovery | Backup/restore/runbook correctness | isolated environment drills |
| Exploratory | Human perception and unexpected interaction | manual charters |

No single layer replaces the others.

---

## 5. Baseline toolchain

The proposed baseline is:

```text
TypeScript compiler
ESLint
project-specific static validators
Vitest
React Testing Library
user-event
Playwright
@axe-core/playwright
Supabase CLI
pgTAP
Lighthouse CI or equivalent deterministic lab runner
```

Additional specialized tools may be introduced only when a gap is demonstrated.

Examples:

- targeted property-based testing may use `fast-check` if it materially improves protocol/geometry/parser testing;
- a targeted HTTP load tool such as k6 may be adopted when concurrency validation becomes necessary;
- a passive DAST baseline scanner may be used against Preview before important releases.

These are not mandatory dependencies merely because they exist.

---

## 6. Why Vitest is the unit baseline

Vitest aligns with the TypeScript/modern frontend stack and is the baseline for:

- pure domain functions;
- validators;
- resolvers;
- state reducers/stores;
- adapters with fakes;
- synchronous Client Components;
- deterministic service tests.

Vitest is **not** used to pretend we have fully tested every Next.js runtime behavior.

In particular, async Server Components are verified primarily through browser/system-level tests and focused lower-level logic extraction rather than brittle synthetic component harnesses.

---

## 7. Why Playwright is the browser baseline

Playwright is the canonical browser-level framework because the portfolio depends on:

- real focus behavior;
- real URL/history behavior;
- pointer/touch/keyboard interactions;
- Chromium/Firefox/WebKit compatibility;
- screenshot comparison;
- network interception/failure simulation;
- production-build behavior;
- responsive viewport verification.

The E2E suite should normally run against a **production build**, not rely exclusively on the development server.

---

## 8. Unit-test scope

Unit tests are mandatory where a rule is deterministic and valuable independent of framework rendering.

High-value candidates include:

- release eligibility;
- route/locale helpers;
- SelectionContext derivation;
- Widget Registry filtering;
- Widget Resolver ordering;
- semantic size remapping;
- preference migrations;
- InputManager action mapping;
- gamepad deadzone/repeat helpers;
- AudioManager event policy;
- DynamicBackdrop context derivation;
- project visual-context normalization;
- content schema validation;
- CV projection logic;
- report/moderation state transitions;
- idempotency-key rules;
- Arcade plausibility calculations;
- leaderboard ordering;
- abuse-key namespace construction;
- cache fresh/stale/expired classification;
- retry/backoff calculations;
- provider normalized error mapping;
- telemetry redaction.

A pure function with meaningful branches should normally be tested without opening a browser.

---

## 9. State-machine testing

Stateful features must be tested as explicit transition systems where practical.

Examples:

```text
Guestbook
pending → approved
pending → rejected
approved → hidden
```

```text
Arcade session
ready → active ↔ paused → finished
```

```text
Report
open → resolved
open → dismissed
```

```text
Admin authorization
unauthenticated
→ AAL1
→ AAL2
→ active admin
```

Invalid transitions must be tested as aggressively as valid transitions.

---

## 10. Component-test scope

Component tests focus on interactive Client Components and visual semantics that do not require a complete browser navigation stack.

Good component-test subjects:

- Button/IconButton semantics;
- Toggle/SegmentedControl;
- focus-visible behavior at the DOM level;
- Widget shell controls;
- Settings controls;
- Project selector keyboard mechanics;
- Toast queue/coalescing logic;
- input validation rendering;
- local loading/error states;
- accessible names/roles;
- compact composition logic where DOM structure is deterministic.

Component tests should interact through public semantics such as roles, labels and user events rather than implementation selectors.

---

## 11. Async Server Components

Async Server Components are not forced into unit/component tools that do not model them reliably.

The testing strategy is:

1. extract pure business/content transformation into unit-testable modules;
2. validate server-side schemas and services independently;
3. verify the assembled async Server Component through E2E against a built Next.js application.

This prevents a false sense of coverage created by mocks that do not match the actual React/Next runtime.

---

## 12. Snapshot policy

Large structural snapshots are discouraged.

Avoid:

```text
expect(entireRenderedApp).toMatchSnapshot()
```

because such snapshots become approval noise.

Snapshots are appropriate for:

- compact serialized protocol fixtures;
- normalized provider payloads;
- generated metadata where exact shape matters;
- visual screenshots through Playwright;
- tightly scoped stable textual output.

Every snapshot update must be reviewable as a semantic change, not an automatic `-u` ritual.

---

## 13. Coverage philosophy

Code coverage is a diagnostic, not the quality objective.

The project does **not** use one global percentage as proof of correctness.

Instead:

- critical pure policy/security/validation modules require strong branch coverage;
- important state machines must cover valid and invalid transitions;
- UI quality is judged through behavioral, accessibility and E2E coverage rather than line percentage;
- uncovered branches in security/idempotency/moderation/Arcade validators are review signals;
- generated code, framework glue and trivial declarations may be excluded deliberately.

Coverage must not be inflated with meaningless tests.

---

## 14. Suggested coverage review bands

These are review bands rather than immutable contractual percentages:

```text
Critical deterministic policy/security modules
→ target ≈90%+ branch coverage

General unit-testable application/domain modules
→ target ≈80%+ meaningful statement/function coverage

UI composition/framework glue
→ no numeric target; verify behavior instead
```

Any exception in a critical module should be explainable from the uncovered report.

---

## 15. Static verification

Every normal PR should run at least:

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm content:validate
pnpm cv:validate
```

Static validation also includes:

- forbidden imports/client-server boundary checks;
- no accidental server secret in client module graph;
- canonical route/locale validation;
- duplicate stable IDs;
- broken internal documentation/content references;
- image/media metadata completeness where required;
- release registry consistency;
- environment schema validation.

Static checks should fail early before expensive browser jobs.

---

## 16. Architectural boundary tests

Architecture rules should be machine-checkable where practical.

Examples:

- Client Components cannot import server-only repositories;
- feature code cannot import provider SDKs directly when an adapter is required;
- UI cannot import Supabase secret clients;
- Admin shell cannot be imported into public shell;
- Arcade runtime cannot be part of Home's initial dependency graph;
- direct `localStorage` access outside the approved preference repository is forbidden;
- components cannot call `supabase.from(...)` directly;
- provider adapters do not leak vendor-specific DTOs into UI types.

A documented architecture rule that is easy to enforce automatically should not rely only on memory.

---

## 17. Canonical content tests

DOC-36 content requires validation for:

- schema correctness;
- stable IDs;
- unique slugs;
- valid project status values;
- valid publication/visibility/privacy dimensions;
- referenced skill/certification/project IDs exist;
- required EN/ES counterparts exist;
- semantic parity where required;
- project visual context conforms to one canonical schema;
- media roles/focal points/alt text are valid;
- no forbidden private content is included in public projection;
- featured order is deterministic;
- route generation succeeds for all published content.

A broken content relationship should fail CI before deployment.

---

## 18. Localization tests

Localization requires both schema and browser testing.

Static checks verify:

- translation keys exist in both supported locales;
- no unexpected orphan keys where parity is required;
- canonical content projections exist in EN/ES;
- locale-safe route helpers are deterministic.

E2E verifies:

- `/en` and `/es` routing;
- language switch preserves equivalent route/context;
- project detail deep links preserve locale;
- no hydration mismatch from locale state;
- long Spanish strings do not break control geometry;
- document `lang` is correct;
- metadata/canonical/hreflang behavior is correct where applicable.

---

## 19. RenderCV tests

DOC-37 receives a dedicated verification chain:

```text
canonical content
→ project EN/ES CV model
→ validate RenderCV input
→ render PDFs
→ verify artifacts exist and are non-empty
→ verify expected public names
```

Additional checks should detect:

- missing locale output;
- accidental manual PDF divergence;
- invalid dates/sections;
- build failure;
- structurally missing required sections;
- broken public link from `/[locale]/cv`.

PDF visual/print review remains a manual release check when the CV template changes materially.

---

## 20. Service integration tests

Application services should be tested with real domain policies and deterministic repository/provider substitutes.

Examples:

- `SubmitGuestbookEntry` creates `pending`, not `approved`;
- Contact retry preserves `operationId`;
- `FinalizeArcadeSession` rejects expired/replayed sessions;
- `ApproveSubmission` writes audit intent;
- reports remain independent from moderation state;
- provider failure is normalized to approved error codes;
- stale cache behavior follows DOC-46.

Fakes must mimic the contract, not vendor implementation trivia.

---

## 21. Contract tests

Contract tests protect boundaries that change independently.

They are appropriate for:

- public/internal DTO schemas;
- Arcade session protocol versions;
- Drawing model versions;
- normalized GitHub records;
- normalized Tech Pulse items;
- error envelope shape;
- cache-entry schema versions;
- RenderCV projection schema;
- provider adapter inputs/outputs.

Fixtures should be versioned and small enough to understand.

---

## 22. Provider tests

CI must not depend on live third-party providers for routine correctness.

Default behavior:

```text
unit/service tests
→ fake adapter

contract tests
→ captured/sanitized fixture

selected integration smoke
→ real provider sandbox/non-production only when useful
```

Routine test runs must not:

- send real Contact emails;
- post real content;
- mutate production GitHub data;
- consume unnecessary provider quotas;
- depend on external uptime.

---

## 23. Database test baseline

PostgreSQL receives first-class tests through the local Supabase stack and pgTAP.

Database tests cover:

- tables/columns/types;
- constraints;
- foreign keys;
- unique constraints;
- indexes that are contractually required;
- RLS enabled state;
- grants;
- policies;
- transactional functions/RPCs;
- moderation version checks;
- Arcade session uniqueness;
- report independence;
- audit-write behavior;
- migration assumptions.

Database security is not considered proven by TypeScript repository tests.

---

## 24. Database negative tests

Every authorization/storage rule should test what is **forbidden**, not only what succeeds.

Examples:

- anonymous/public role cannot read moderation queue;
- browser role cannot call privileged Admin mutations directly;
- non-admin authenticated user cannot become Admin merely by having Auth identity;
- direct runtime-table access does not bypass the application policy;
- a second Arcade score cannot be inserted for one session;
- stale moderation version cannot overwrite newer state;
- unsafe report/content relationship cannot violate FK constraints;
- secret-only operations are not executable by exposed roles.

Negative RLS/grant tests are mandatory release evidence.

---

## 25. Migration tests

Every schema change should be validated from a clean database.

The standard sequence is:

```text
start local Supabase
reset database
apply all migrations from zero
seed synthetic data
run pgTAP
run repository/integration tests
```

For material production migrations, also test an upgrade path from a representative previous schema/data state.

Expand→migrate→contract changes require tests at each compatibility stage.

---

## 26. Seed-data rules

Test seeds must be:

- synthetic;
- deterministic where useful;
- free of production PII;
- safe to commit;
- sufficient to exercise moderation, Arcade, Admin and integration states;
- clearly marked as non-production.

Never copy a production database into CI merely for realism.

---

## 27. Test isolation

Tests must not depend on order.

Preferred mechanisms:

- transactions/rollback for pgTAP;
- unique IDs/namespaces for application-level DB tests;
- dedicated test users/factors where Auth is exercised;
- local Supabase reset at suite boundaries rather than per tiny test;
- isolated browser contexts in Playwright;
- deterministic clock/randomness where protocols depend on time.

A test that only passes after another test is defective.

---

## 28. Time control

Time-sensitive behavior requires explicit testing.

Examples:

- Arcade session expiry;
- cache fresh/stale/expired windows;
- idempotency retention;
- moderation timestamps;
- recovery links/session behavior;
- Coming Soon/release availability if date-driven in future.

Unit tests should inject a clock rather than scatter `Date.now()` assumptions across logic.

---

## 29. Randomness control

Random values used for gameplay/session/security-related non-secret test behavior should support deterministic test seams.

Production cryptographic randomness is never replaced with predictable randomness merely to simplify implementation.

Tests should inject controlled factories at the domain boundary when determinism is needed.

---

## 30. E2E philosophy

E2E tests cover **user journeys and framework integration**, not every permutation already proven below.

High-value E2E flows include:

- enter Home in EN/ES;
- select a project;
- open route-backed Project Detail and use browser Back;
- navigate all six Dock destinations;
- verify Coming Soon gating where applicable;
- customize Widget Field and reload;
- switch theme/language/transparency/motion/sound preferences;
- open CV and artifact link;
- submit Contact through a controlled test provider/fake;
- publish Guestbook/Sketch into pending state;
- moderate content as Admin;
- report content;
- create/finalize Arcade session;
- exercise AAL1→AAL2 Admin flow in non-production;
- verify degraded provider behavior.

The suite should remain focused enough to finish predictably.

---

## 31. Browser matrix

Baseline browser coverage:

| Browser engine | Role |
|---|---|
| Chromium | Primary full E2E on PR |
| WebKit | Critical smoke and compatibility |
| Firefox | Critical smoke and compatibility |

Broader cross-browser suites may run on merge/nightly/release if PR cost becomes excessive.

A feature cannot silently become Chromium-only merely because development happened in Chrome.

---

## 32. Device/viewport matrix

Representative automated viewport checks should include at least:

```text
320×568       compact stress
360×800       common compact
390×844       modern compact
768×1024      medium/tablet
1024×768      short expanded/tablet landscape
1440×900      expanded desktop
1920×1080     wide desktop
```

Additional manual checks cover:

- very short landscape phones;
- safe-area devices;
- 200% text/browser zoom;
- ultrawide composition;
- touch + pointer hybrids.

The purpose is capability coverage, not device-brand simulation.

---

## 33. Dock geometry gate

The six-destination Dock must receive explicit automated and manual verification at:

- 320 CSS px width at normal page zoom;
- 200% browser page zoom on a documented baseline viewport;
- independent 200% text scaling where the platform supports it;
- compact short-height landscape;
- touch target constraints;
- long translated labels/tooltips where applicable.

No Dock destination may become inaccessible to make the geometry fit.

---

## 34. Widget Field tests

The Widget Field requires tests for:

- default resolver output;
- release-aware eligibility;
- System vs Context widget behavior;
- pin/unpin;
- reorder;
- S/M/L size constraints;
- local persistence;
- schema migration;
- corrupted local data fallback;
- reset layout;
- Wide→Expanded→Medium→Compact remapping;
- one-primary-widget Compact behavior;
- keyboard-accessible reorder alternative;
- hidden widgets not performing unnecessary work.

No test persists pixel coordinates because the product does not support them.

---

## 35. Selection/focus tests

Critical interaction tests must prove:

```text
hover ≠ focus ≠ selected ≠ active
```

Verify:

- pointer hover does not permanently change global selection;
- keyboard focus is visible and DOM-real;
- primary selectors update selection according to approved input grammar;
- overlay close restores focus;
- route navigation restores meaningful focus;
- project selection updates contextual backdrop/widgets;
- focus color remains independent from project accent;
- selected styling remains distinguishable without motion/sound.

---

## 36. Navigation/history tests

Playwright must verify:

- Dock navigation;
- direct deep links;
- intercepted Project Detail from Home;
- direct Project Detail full-page load;
- browser Back behavior;
- temporary overlay dismissal;
- language switching without route loss;
- no synthetic history pollution from simple project browsing selection;
- 404 behavior;
- Coming Soon route behavior;
- Admin isolation from public Shell.

The browser remains the source of truth for route history.

---

## 37. Input-system tests

Automated testing covers semantic action dispatch for:

- keyboard;
- pointer;
- touch-equivalent pointer events;
- gamepad adapter logic where browser automation permits deterministic simulation.

Manual/hardware verification remains required for:

- physical gamepads;
- stylus behavior;
- platform-specific browser quirks;
- disconnect/reconnect behavior.

No essential action may exist only through a gesture or gamepad shortcut.

---

## 38. Audio tests

Audio tests verify policy, not subjective speaker quality.

Automated checks include:

- first-visit sound OFF;
- user gesture requirement respected;
- mute persisted;
- semantic event mapping;
- rate limiting/coalescing;
- no hover spam;
- no sound as sole feedback channel.

Manual checks validate loudness balance, unpleasant repetition and device behavior.

---

## 39. Motion tests

Motion verification covers:

- state remains correct if animation is interrupted;
- rapid retargeting does not queue stale transitions;
- Reduced Motion preserves capability;
- route/overlay focus is not delayed by animation;
- no idle animation causes sustained heavy work;
- theme/language changes avoid blanket `transition: all` artifacts;
- navigation remains usable if the animation library fails or is disabled.

Screenshots normally capture stable end states, not arbitrary animation frames.

---

## 40. Liquid Glass tests

Material testing includes:

- FULL/STANDARD/REDUCED/SOLID modes;
- `backdrop-filter` unsupported fallback;
- Reduced Transparency;
- Forced Colors behavior;
- contrast over complex artwork;
- no nested blur explosion in common surfaces;
- MAT-0/MAT-1 reading-surface legibility;
- Light/Dark tuning.

A visual effect is never accepted if the fallback removes capability or readable hierarchy.

---

## 41. Accessibility automated baseline

Playwright + axe should scan representative stable states, including:

- Home;
- Project Detail;
- Achievements;
- Channel;
- Social/Guestbook;
- Contact;
- CV;
- Settings;
- Admin login;
- moderation UI.

Automated scans are a floor, not accessibility sign-off.

Known false positives/waivers must be documented, narrow and periodically re-evaluated.

---

## 42. Accessibility manual matrix

Manual verification includes at least:

- keyboard-only navigation;
- visible focus;
- skip navigation;
- browser zoom 200%;
- text zoom where platform supports it;
- Reduced Motion;
- Reduced Transparency/Solid material;
- high-contrast/Forced Colors where practical;
- screen-reader smoke with at least one Windows/browser combination and one Apple platform over release milestones;
- form errors/announcements;
- overlay focus trap/restore;
- Drawing alternatives and controls;
- Arcade non-gameplay navigation.

Automated tooling cannot prove reading order, comprehension, focus experience or announcement quality by itself.

---

## 43. Contrast tests

Critical token combinations must be mechanically checked where possible.

Verify at minimum:

- normal text baseline ≥4.5:1 where required;
- large text ≥3:1 where applicable;
- focus/UI boundaries ≥3:1 where applicable;
- semantic text colors do not assume icon-color contrast suitability;
- contextual project accents cannot override accessible system ink;
- fallback material modes remain compliant.

Dynamic artwork should be tested using worst-case representative backgrounds, not only neutral mocks.

---

## 44. Visual regression strategy

Playwright screenshot comparisons are used for stable, high-value visual contracts.

Representative baselines include:

- Home Expanded/Wide/Compact;
- selected project states;
- Widget Field presets;
- Project Detail overlay/fullscreen;
- Light/Dark;
- MAT quality variants;
- Settings;
- Achievements states;
- Contact;
- CV route shell;
- Social moderation states;
- Admin queue.

Visual tests run in a controlled environment because fonts, browser version and OS rendering differences can create noise.

---

## 45. Visual baseline governance

A changed screenshot is not automatically a failed design and not automatically acceptable.

Process:

1. inspect diff;
2. determine whether change is intended;
3. verify responsive/accessibility implications;
4. update baseline only with review;
5. avoid mass regeneration without understanding.

Visual snapshots are source-controlled test evidence.

---

## 46. Theme/mode matrix

Not every E2E test runs across every visual combination.

A curated matrix covers:

```text
Light + default material
Dark + default material
Reduced Motion
Reduced Transparency/SOLID
Compact
Expanded/Wide
```

Pairwise/targeted coverage is preferred over Cartesian explosion.

Critical accessibility behavior receives stronger combination coverage than decorative effects.

---

## 47. Contact tests

Contact must verify:

- valid submission;
- invalid schema;
- oversize payload;
- human-verification rejection;
- human-verification provider unavailable behavior;
- operation-id reuse;
- timeout then safe retry;
- provider duplicate prevention/idempotency;
- delivery failure preserves user text locally;
- no message body in routine logs/telemetry;
- no DB persistence of message/name/email under the approved baseline;
- safe localized error copy.

No routine automated suite sends real production emails.

---

## 48. Guestbook tests

Guestbook tests include:

- valid submit → `pending`;
- spam/abuse rejection;
- XSS-like text remains inert;
- moderation approve/reject/hide;
- optimistic concurrency conflict;
- audit event creation;
- approved-only public projection;
- report independence;
- duplicate/idempotency handling;
- nickname treated as display text, not identity;
- release gating/Coming Soon behavior before launch.

---

## 49. Sketch/Drawing security tests

Drawing is treated as an adversarial structured-input surface.

Tests include:

- maximum stroke count;
- maximum points/stroke;
- maximum text objects/length;
- invalid coordinates;
- unsupported style values;
- malformed versions;
- deeply nested/unexpected payloads;
- canonicalization;
- renderer time/size limits;
- script/event/URL injection attempts;
- public preview contains no executable arbitrary visitor SVG/HTML;
- publication remains pending until moderation.

A fuzz/property-oriented suite is strongly recommended for the logical drawing validator/renderer boundary.

---

## 50. Report tests

Reports verify:

- valid target type/id;
- duplicate behavior;
- open→resolved/dismissed transitions;
- content remains independently moderated;
- unauthorized Admin resolution fails;
- optimistic concurrency where relevant;
- audit behavior;
- public reporter never receives private moderation information.

---

## 51. Admin authentication tests

Auth tests cover at least:

```text
anonymous → denied
valid password/AAL1 → MFA required
valid TOTP/AAL2 + active admin profile → allowed
AAL2 + disabled admin profile → denied
expired/revoked session → denied
password recovery → still requires MFA
```

Also verify:

- generic recovery responses;
- safe redirect targets;
- `/admin/**` noindex;
- no secrets/tokens in telemetry;
- privileged mutation rechecks authorization;
- browser cannot obtain privileged Supabase secret.

---

## 52. MFA operational tests

Before launch and periodically after relevant Auth changes:

- primary TOTP enrollment works;
- backup TOTP works independently;
- removing/replacing factors follows the approved policy;
- break-glass runbook is understandable and feasible;
- AAL2 state is correctly detected server-side;
- Admin access is not granted merely because `auth.users` contains the user.

Do not automate destructive production-factor reset as a routine test.

---

## 53. Arcade test architecture

Arcade requires multiple test layers.

## Unit

- score rules;
- timing/rule versions;
- plausibility checks;
- deterministic world/state helpers where applicable.

## Protocol

- create session;
- expiration;
- version mismatch;
- duplicate finalize;
- replay;
- malformed evidence;
- impossible results.

## Database

- one score/session uniqueness;
- atomic finalize;
- leaderboard ordering.

## Browser

- ready→active→paused→finished→result;
- retry;
- keyboard/gamepad navigation shell;
- responsive landscape/portrait behavior.

The client is assumed tamperable throughout testing.

---

## 54. Arcade cheating test catalog

At minimum attempt:

- arbitrary huge score;
- negative/impossible timing;
- reused session;
- expired session;
- duplicate concurrent finalization;
- mismatched game/rules version;
- result mutation after first accepted finalize;
- malformed evidence payload;
- direct score-table insertion from exposed role;
- replay of captured valid request.

A rejected implausible score is expected product behavior, not automatically a security incident.

---

## 55. Leaderboard tests

Verify:

- deterministic sort order;
- version isolation;
- nickname sanitization/escaping;
- pagination/limits;
- equal-score tie ordering;
- no hidden moderation/admin data leakage;
- stale/failed backend renders graceful state.

---

## 56. External integration tests

GitHub/Tech Pulse tests cover:

- allowed-source registry;
- normalized data schema;
- ETag/304 handling;
- fresh/stale/expired classification;
- rate-limit response;
- provider timeout;
- malformed feed/provider payload;
- partial source failure;
- stale fallback;
- no remote HTML execution;
- no professional-core blocking on cold/failing integration.

---

## 57. Cache tests

Cache tests verify:

```text
fresh → serve
stale_allowed → serve stale + refresh opportunity
expired → controlled degraded/refresh path
```

Also test:

- stampede/lease behavior;
- schema-version mismatch;
- invalid cached payload;
- explicit invalidation tags where applicable;
- one provider cache cannot poison another source;
- no Admin/private data enters public cache.

---

## 58. Job/Cron tests

Scheduled work verifies:

- authenticated invocation;
- lease acquisition;
- duplicate concurrent invocation;
- partial provider failure;
- safe retry;
- stale job detection;
- cleanup idempotency;
- no production-only assumptions in Preview;
- safe metrics/logging.

A cron URL being hard to guess is never considered authentication.

---
## Rate-limit persistence tests

Integration tests exercise the real PostgreSQL rate-limit repository/RPC, including concurrent increments, burst + daily windows, expiry semantics, key-version separation, and denial of direct public RPC execution. A test using an in-memory counter does not satisfy the V1.x security gate.

## Retention/privacy lifecycle tests

Database/integration/E2E coverage verifies representative lifecycle horizons with a controllable clock: pending/rejected/hidden Community purge, resolved-report purge, Arcade evidence/session cleanup, Contact seven-day ledger cleanup, rate-limit bucket cleanup, ban-hash expiry, cache invalidation after deletion, and one-resource deletion capabilities.

Privacy tests prove that a deletion token for resource A cannot delete resource B, token plaintext is absent from logs/analytics/URLs, and loss of a local receipt does not cause the application to invent a cross-feature identity lookup.


## 59. Security verification classes

DOC-47 controls are verified through a combination of:

- unit policy tests;
- DB/RLS tests;
- E2E adversarial journeys;
- static dependency/secret/code analysis;
- browser header/CSP checks;
- targeted payload tests;
- manual threat-model review;
- optional passive DAST against non-production.

No single “security scanner passed” badge is considered sufficient.

---

## 60. XSS tests

Payload corpus should exercise visitor-controlled fields with patterns such as:

- HTML tags;
- event-handler strings;
- script-like text;
- SVG payload strings;
- URLs with unsafe schemes;
- template-like braces;
- Unicode edge cases.

Expected outcome is context-safe inert display or validation rejection, never execution.

Testing must cover both public rendering and Admin moderation rendering because Admin impact is higher.

---

## 61. CSRF/origin tests

Protected mutations test:

- missing/invalid origin where policy requires it;
- cross-origin form/request attempts;
- authenticated Admin mutation without approved CSRF/origin semantics;
- same-origin valid mutation;
- replay/idempotency interactions.

CORS behavior is also asserted so an accidental wildcard does not silently appear.

---

## 62. SSRF tests

Because the system intentionally avoids arbitrary URL-fetch endpoints, tests should ensure that this invariant remains true.

If future functionality accepts a URL:

- allowlist/protocol rules are tested;
- localhost/private network targets are rejected where applicable;
- redirects are bounded/revalidated;
- response sizes/timeouts are constrained.

A generic server-side fetch proxy requires a new security review.

---

## 63. CSP/header tests

Production-like E2E checks should assert key security headers such as:

- Content-Security-Policy;
- HSTS where appropriate on production domain;
- X-Content-Type-Options;
- Referrer-Policy;
- frame/embedding policy as designed;
- secure cookie characteristics where observable.

Tests should detect accidental weakening such as `unsafe-eval` in Production.

---

## 64. Secret-scanning tests

CI/repository quality controls must detect likely committed secrets.

Additionally:

- `.env*` handling is verified;
- Preview does not use Production secrets;
- secret-valued variables are never included in client bundles;
- sample configuration contains placeholders only;
- build output is inspected for accidental server secret leakage when relevant.

A rotated secret still counts as a repository incident if it was committed.

---

## 65. Dependency security

Dependency verification includes:

- lockfile integrity;
- known-vulnerability scanning;
- framework/support-status review;
- direct dependency necessity;
- high/critical vulnerability triage;
- transitive dependency awareness for browser-shipped code.

Automated vulnerability findings are triaged rather than blindly accepted or ignored.

---

## 66. Performance regression tests

DOC-49 budgets become executable checks.

At minimum CI/release tooling should detect:

- initial JS size regression;
- heavy feature leaking into core route;
- CSS/font budget regression;
- Lighthouse/Core route performance regression;
- image/media budget violations where deterministically measurable.

Lab performance gates are stable regression detectors; production RUM remains the source for real-user conclusions.

---

## 67. Lighthouse strategy

Lighthouse CI or equivalent should run against a built application with deterministic routes such as:

- `/en`;
- `/es`;
- one representative Project Detail;
- `/en/contact`;
- `/en/cv`.

Use repeated runs/appropriate tolerance to avoid treating natural lab variance as a design failure.

Budget assertions matter more than chasing a cosmetic 100 score.

---

## 68. Bundle graph tests

The build should verify that core routes do **not** include chunks for:

- Drawing runtime;
- either Arcade game;
- Admin-only modules;
- Terminal implementation;
- unnecessary provider SDKs;
- optional audio assets.

This is a stronger assertion than only checking total bundle size.

---

## 69. Interaction performance tests

For project selection, Dock and Widget interaction, targeted browser tests should detect:

- long tasks around interaction;
- obvious input delay regressions;
- excessive root rerenders;
- repeated layout measurement loops;
- continuous work while idle.

Where exact INP cannot be reproduced deterministically in CI, use stable proxies/profiling plus RUM after release.

---

## 70. Drawing performance tests

Representative stress cases should test:

- sustained pointer input;
- maximum approved stroke/point limits;
- resize/orientation remapping;
- undo/redo depth;
- preview generation;
- no shell-wide React rerender per pointer sample.

Stress cases must stay within the approved product limits rather than inventing impossible payloads only to create a benchmark.

---

## 71. Arcade performance tests

Representative automated/manual checks measure:

- stable loop under supported viewport;
- no network per frame;
- pause/resume correctness;
- reduced decorative effects before gameplay degradation;
- no page-level scroll/focus conflict during active gameplay;
- session finalize latency.

Hardware-specific FPS conclusions require representative devices, not CI alone.

---

## 72. Load/concurrency testing

The project does not need enterprise-scale load testing on every PR.

Targeted concurrency tests become mandatory for operations whose correctness depends on races:

- Arcade double finalize;
- moderation optimistic concurrency;
- idempotent Contact/UGC submission;
- job lease acquisition;
- cache stampede prevention.

Before meaningful public exposure of Community/Arcade, run a bounded non-production load exercise to identify obvious connection/latency/rate-limit bottlenecks.

Do not load-test Production without an explicit safe plan.

---

## 73. Resilience testing

Failure injection should prove documented degraded behavior.

Simulate:

- Supabase unavailable;
- Resend timeout/error;
- Turnstile unavailable;
- GitHub rate limit/outage;
- Tech Pulse malformed/slow source;
- observability provider failure;
- corrupted local preferences;
- stale cache;
- missing artwork/media.

Professional Core should remain usable according to DOC-46/DOC-49.

---

## 74. Recovery tests

Recovery quality is tested separately from normal runtime tests.

At scheduled milestones:

- restore a database backup to an isolated environment;
- verify expected schema/data integrity;
- validate core Admin/Community reads;
- rehearse application rollback;
- verify forward-fix migration procedure;
- test selected secret-rotation runbook in non-production.

A written runbook that has never been exercised is incomplete operational evidence.

---

## 75. Environment strategy

Tests are divided by environment.

## Local/CI

- static checks;
- unit/component;
- local Supabase/pgTAP;
- service integration;
- built-app Playwright;
- accessibility;
- most visual/performance/security tests.

## Preview

- provider/environment smoke;
- deployment configuration;
- domain-independent integration checks;
- optional DAST;
- manual design QA.

## Production

- non-destructive smoke/synthetic checks only;
- RUM/telemetry;
- no content-polluting E2E flows.

Production is not the primary test environment.

---

## 76. Preview acceptance

A Preview URL is not considered acceptable solely because Vercel reports a successful deployment.

Before merge/release, relevant Preview checks may include:

- route load;
- environment validation;
- no Production backend credential;
- provider sandbox behavior;
- visual review;
- Admin access policy if feature is touched;
- release-gating behavior.

DOC-51 defines exact CI wiring.

---

## 77. Test-data factories

Central factories/fixtures should create valid domain objects for:

- project content;
- Guestbook submission;
- Sketch logical model;
- report;
- Arcade session/result;
- admin profile;
- integration cache entry.

Tests override only the field relevant to the scenario.

This reduces duplicated brittle fixtures while keeping invalid-case tests explicit.

---

## 78. No production PII in fixtures

Committed fixtures must never contain:

- real Contact messages/emails;
- real visitor IPs/identifiers;
- real TOTP secrets;
- access/refresh tokens;
- non-public client/customer information;
- unpublished personal data.

Sanitized provider fixtures should be reviewed before commit.

---

## 79. Test naming

Test names describe behavior:

```text
rejects a finalized Arcade session replay
preserves selected project when language changes
keeps approved content visible while an open report exists
requires AAL2 even after password recovery
```

Avoid names such as:

```text
test1
works
button test
edge case
```

A failed test should communicate the violated contract without opening the implementation first.

---

## 80. Test file placement

Recommended structure:

```text
src/feature/.../*.test.ts(x)          unit/component colocated where useful

tests/
├── e2e/
├── accessibility/
├── visual/
├── performance/
├── security/
├── resilience/
├── contracts/
└── fixtures/

supabase/
└── tests/
    ├── schema/
    ├── rls/
    ├── functions/
    └── transactions/
```

Exact naming can evolve, but ownership should remain obvious.

---

## 81. Public test selectors

Prefer:

1. accessible role/name;
2. visible user-facing label;
3. stable semantic locator;
4. `data-testid` only where semantics are insufficient.

Do not couple E2E tests to Tailwind classes, generated CSS names or DOM nesting trivia.

---

## 82. Deterministic visual tests

Visual suites should stabilize:

- fonts;
- browser version;
- viewport;
- animations;
- clock when visible;
- dynamic external feeds;
- random content;
- user preferences;
- device scale assumptions.

Do not “solve” flaky screenshots with a huge global pixel-difference tolerance that hides real regressions.

---

## 83. Flaky-test policy

A flaky test is a defect in the quality system.

When detected:

1. capture evidence;
2. determine whether product or test is nondeterministic;
3. fix root cause;
4. temporarily quarantine only if necessary to unblock unrelated work;
5. assign a tracked expiry/owner;
6. do not silently retry until green and call it solved.

Retries may collect diagnostic evidence, but repeated retries are not correctness.

---

## 84. Quarantine rules

A quarantined test:

- remains visible in CI reporting;
- references a tracked issue;
- has a reason;
- has an expiry/review date;
- cannot cover a critical security/auth/data-integrity release gate indefinitely.

Critical gates cannot be permanently bypassed through quarantine.

---

## 85. Defect severity

Use a compact severity model compatible with incident priorities.

| Severity | Example |
|---|---|
| Blocker | Auth bypass, stored XSS, data corruption, core route unusable |
| Critical | Major accessibility/navigation failure, duplicate score transaction, severe performance regression |
| Major | Important feature broken with workaround/degraded path |
| Minor | Localized visual/copy issue without functional loss |

Security severity still follows DOC-47 risk treatment where stricter.

---

## 86. Release exit criteria

A release is not “ready” merely because build succeeds.

Minimum applicable exit criteria:

- required static checks pass;
- applicable unit/integration/DB suites pass;
- critical E2E journeys pass;
- no unresolved applicable Blocker/Critical defect;
- accessibility release checks pass;
- security gates pass;
- performance budgets remain within approved thresholds or documented approved exception;
- migrations are validated;
- observability/release metadata exists;
- rollback/recovery path remains valid;
- required manual QA charter completed.

DOC-51 defines which checks are merge-blocking vs release-only.

---

## 87. V1.0 test emphasis

V1.0 Professional Core prioritizes:

- Home/System Shell;
- Projects/Experience/Education/Certifications;
- Project Detail routing;
- Widget Field personalization;
- bilingual behavior;
- Light/Dark/settings;
- Contact;
- CV/RenderCV;
- responsive/accessibility;
- SEO/meta basics;
- Coming Soon routes;
- performance/security fundamentals.

Community/Arcade tests should not be required for a feature that is not yet released, except foundation contracts that already exist.

---

## 88. V1.1 test emphasis

V1.1 adds emphasis on:

- Achievements;
- Command Palette;
- Terminal predefined commands;
- Making Of;
- Changelog/Status;
- secrets/easter eggs;
- returning personalization.

Secrets remain nonessential; their failure cannot block core navigation.

---

## 89. V1.2 test emphasis

V1.2 adds:

- Guestbook;
- Sketch Wall;
- Drawing publication;
- reports;
- moderation;
- Admin operational flows;
- abuse controls;
- UGC XSS/safety;
- backup/restore significance.

This release materially expands security and persistence gates.

---

## 90. V1.3 test emphasis

V1.3 adds:

- Glitch Runner;
- Reflex Deploy;
- game session protocol;
- plausibility/anti-replay;
- leaderboards;
- gamepad/manual hardware QA;
- gameplay performance;
- versioned score rules.

Arcade correctness is isolated from Professional Core release health.

---

## 91. V1.4 test emphasis

V1.4 adds stronger integration verification for:

- GitHub-derived Dev Log;
- Tech Pulse;
- cached external data;
- stale fallback;
- job health;
- rate-limit behavior;
- provider outage containment.

External data never becomes the only source of professional facts.

---

## 92. Manual exploratory charters

Before major releases, run short focused human charters such as:

- “Explore the entire site keyboard-only.”
- “Use Compact at 200% zoom and try to reach every destination.”
- “Rapidly change projects while opening/closing detail.”
- “Break external-network requests and continue browsing.”
- “Use Dark + Reduced Motion + Reduced Transparency.”
- “Moderate hostile-looking UGC in Admin.”
- “Play Arcade with keyboard and physical gamepad.”
- “Draw quickly, rotate viewport, undo/redo, then publish.”

Exploratory testing is documented with findings, not treated as casual clicking.

---

## 93. Real-device QA

Emulation does not replace all physical-device testing.

Release milestones should include representative checks on:

- at least one real Android/Chromium device;
- at least one real iOS/Safari device when accessible;
- desktop Chromium;
- desktop Firefox or WebKit/Safari environment;
- physical keyboard;
- physical gamepad for Arcade milestones.

The matrix remains proportional; we are not creating a device lab.

---

## 94. Browser/version support changes

When a supported browser or OS materially changes behavior:

1. reproduce against the supported matrix;
2. classify whether issue is our regression or platform change;
3. add a regression test when stable/valuable;
4. document any support adjustment rather than silently degrading capability.

---

## 95. Observability verification

DOC-49 telemetry must itself be tested.

Verify:

- errors carry release/environment;
- request/operation correlation works;
- redaction removes sensitive payloads;
- expected user errors are not reported as fatal exceptions;
- provider failures are categorized correctly;
- monitoring provider failure does not break application flow;
- source maps resolve only through intended diagnostic pipeline;
- Production/Preview events remain separable.

---

## 96. Synthetic monitoring verification

Synthetic checks must be tested before relying on alerts.

Verify:

- expected core-route failure produces signal;
- recovery clears condition;
- check does not submit Contact/UGC;
- false positive from optional provider outage does not mark full Professional Core down;
- alert routing is actionable.

---

## 97. Regression-after-incident rule

A material production defect should normally produce at least one durable regression control at the lowest appropriate layer.

Examples:

- a route-history bug → Playwright regression test;
- an RLS exposure → pgTAP negative test;
- duplicate email → idempotency service test;
- provider parsing failure → contract fixture;
- visual clipping → targeted screenshot/responsive test.

Postmortem without regression prevention is incomplete when the failure is testable.

---

## 98. Tool-assisted test generation

Development tooling may draft tests, but generated tests are not trusted merely because they pass.

The reviewer must verify that a generated test:

- asserts an approved requirement;
- fails when the behavior is intentionally broken;
- does not simply mirror the implementation;
- does not overmock the behavior being claimed;
- uses public contracts rather than internals where possible;
- does not weaken assertions to obtain green CI;
- does not approve/update visual snapshots automatically without review.

A green test that cannot detect the corresponding defect is negative value.

---

## 99. Mutation sanity check for critical tests

For especially important policy tests, periodically perform a simple mutation sanity check manually or with tooling:

- invert an authorization condition;
- remove an idempotency check;
- accept an invalid state transition;
- weaken a score plausibility bound.

The relevant tests should fail.

Full mutation-testing infrastructure is not required in V1.x unless it proves worthwhile.

---

## 100. Test command contract

The repository should expose stable developer-facing commands conceptually equivalent to:

```text
pnpm typecheck
pnpm lint
pnpm format:check
pnpm content:validate
pnpm cv:validate
pnpm test
pnpm test:unit
pnpm test:coverage
pnpm test:db
pnpm test:integration
pnpm test:e2e
pnpm test:a11y
pnpm test:visual
pnpm test:perf
pnpm test:security
pnpm test:resilience
pnpm test:ci
```

The concrete repository/CI implementation is defined in DOC-51.

The command names should remain stable enough for humans and CI to share the same workflows.

---

## 101. Fast feedback versus full confidence

Not every check runs at the same cadence.

Conceptual tiers:

## FAST — local/early PR

- typecheck;
- lint;
- schema/content validation;
- unit tests.

## STANDARD — every PR before merge

- build;
- integration;
- database tests;
- core Chromium E2E;
- accessibility baseline;
- critical security/static checks.

## DEEP — main/release/nightly as justified

- cross-browser wider matrix;
- visual matrix;
- Lighthouse repeated runs;
- resilience/fault injection;
- optional DAST;
- broader dependency/security scans.

## MANUAL RELEASE

- real-device;
- screen reader;
- physical gamepad;
- visual/material review;
- recovery drill when release/risk warrants it.

DOC-51 owns scheduling and parallelization.

---

## 102. Required evidence retention

CI should retain useful failure evidence for a bounded period, such as:

- Playwright traces on failure;
- screenshots/diffs;
- videos only where valuable and privacy-safe;
- test reports;
- coverage reports;
- Lighthouse results;
- DB test output;
- build/bundle reports.

Artifacts must not contain secrets or real private payloads.

---

## 103. Test observability

The quality system itself should expose enough information to diagnose failures:

- suite/test name;
- environment;
- browser/project;
- seed/build/release identifier;
- retry count;
- trace/screenshot artifact pointers;
- duration.

Avoid dumping full environment variables or sensitive HTTP bodies into test logs.

---

## 104. Slow-suite governance

If tests become slow:

1. profile the suite;
2. reduce redundant E2E permutations;
3. move deterministic logic down to unit/integration tests;
4. parallelize independent browser tests;
5. shard only when scale justifies it;
6. preserve critical coverage.

Do not solve slow CI by deleting security/accessibility/database tests indiscriminately.

---

## 105. Flake versus race discovery

Apparent flake may reveal a real race.

Examples:

- moderation version conflict;
- duplicate finalize;
- transition timing;
- hydration/persistence race;
- overlay focus restoration;
- provider refresh lease.

Investigate whether nondeterminism belongs to the product before adding waits to the test.

Avoid arbitrary `sleep(2000)` as a synchronization strategy.

---

## 106. Accessibility and visual test interaction

Visual baselines must not encourage inaccessible behavior.

When a focus ring, error label, larger text, forced-color fallback or reduced-transparency surface changes a screenshot, accessibility correctness has priority over preserving the old image.

The screenshot is evidence, not the design authority.

---

## 107. Performance and visual test interaction

A visual effect that passes screenshot comparison can still fail performance budgets.

A performance optimization that passes Lighthouse can still fail visual identity.

Material/motion changes therefore need both:

```text
visual acceptance
+
performance acceptance
```

where the affected surface is performance-sensitive.

---

## 108. Security and functional-test interaction

Security tests must not be isolated from normal flows.

Examples:

- Contact must be both usable and abuse-resistant;
- Admin must be both recoverable and AAL2-protected;
- Drawing must be expressive and bounded;
- Arcade must be responsive and server-authoritative at finalize;
- Guestbook must accept ordinary text while neutralizing hostile payloads.

A security control that makes an approved core journey unusable requires redesign, not a test waiver.

---

## 109. Documentation traceability

Material automated tests should reference the requirement/decision they protect when practical.

Examples:

```text
TQE test metadata/comment:
DOC-22 NAV-...
DOC-45 IAM-...
DOC-47 SECARC-...
DOC-49 POR-...
```

Not every low-level unit assertion needs a documentation citation, but critical architecture/security/release gates should be traceable.

---

## 110. Acceptance-test mapping

For each release epic, maintain a compact map:

```text
requirement
→ verification layer
→ automated/manual test
→ release gate
```

This prevents two failure modes:

- requirements with no verification;
- large test suites that verify implementation trivia but miss product outcomes.

---

## 111. Test ownership

The project may have one primary developer, but ownership still matters.

Every failing gate must have a clear action:

- fix product;
- fix test;
- update approved requirement through governance;
- create time-bounded accepted risk.

“No one owns this test” is not a valid state.

---

## 112. Quality exception process

A test/gate may be bypassed only when:

- the failure is understood;
- risk is documented;
- scope is narrow;
- an owner exists;
- an expiry/review date exists;
- security-critical exceptions follow DOC-47 stricter policy;
- the exception does not silently rewrite an approved requirement.

Permanent `skip` is not architecture.

---

## 113. Quality gates before V1.0 launch

Before V1.0 Production, demonstrate at minimum:

1. clean build from fresh checkout;
2. canonical content + CV validation;
3. unit/integration suite passing;
4. migrations from zero + pgTAP passing;
5. core E2E in production build;
6. critical Chromium + Firefox/WebKit smoke;
7. keyboard and accessibility automated/manual pass;
8. 320px/200% Dock gate;
9. Widget Field persistence/recomposition gate;
10. Project Detail history/deep-link gate;
11. Contact idempotency/failure-preservation gate;
12. Admin AAL2 gate;
13. CSP/security-header baseline;
14. secret/client-boundary checks;
15. core performance/bundle budgets;
16. degraded provider behavior;
17. Production synthetic/observability smoke;
18. deploy rollback runbook tested.

Community/Arcade-specific gates activate when those releases activate.

---

## 114. Quality gates before V1.2 Community

Before V1.2:

- Guestbook pending/moderation flow;
- Sketch limits/safe renderer;
- XSS corpus in public + Admin rendering;
- report independence;
- moderation concurrency;
- audit atomicity;
- abuse/human-verification behavior;
- backup/restore drill for runtime data;
- Admin recovery/MFA validation;
- UGC telemetry redaction.

---

## 115. Quality gates before V1.3 Arcade

Before V1.3:

- session creation/finalize protocol;
- replay/expiry/version rejection;
- concurrent double-finalize;
- leaderboard deterministic ordering;
- plausibility corpus;
- direct DB write denied;
- browser responsive gameplay;
- keyboard + physical gamepad QA;
- representative gameplay performance;
- score publication outage/degraded behavior.

---

## 116. Quality gates before V1.4 integrations

Before V1.4:

- GitHub/feed normalization contracts;
- fresh/stale/expired cache behavior;
- conditional-request behavior where provider supports it;
- rate-limit and Retry-After handling;
- malformed source containment;
- scheduled refresh/lease behavior;
- cold-cache Professional Core independence;
- provider outage/stale UI;
- job health observability.

---

## 117. Non-goals

DOC-50 does not require:

- 100% code coverage;
- a giant device lab;
- every browser × locale × theme × viewport combination on every PR;
- enterprise chaos engineering platforms;
- mutation testing of the entire repository;
- full load testing on every commit;
- production DAST against destructive routes;
- screenshot testing of every component;
- brittle mocks of every Next.js internal;
- tests whose only purpose is increasing a metric.

Quality engineering remains proportional to the product's real risks.

---

## 118. Implementation gates for the test system itself

## TQE-GATE-01 — Fresh checkout

A clean machine/CI job can install dependencies and execute the FAST suite from documented commands.

## TQE-GATE-02 — Local database

A fresh local Supabase stack can apply all migrations and pass pgTAP without Production data.

## TQE-GATE-03 — Production-build E2E

Playwright runs critical user journeys against `next build`/production-like server behavior.

## TQE-GATE-04 — Accessibility

Automated axe coverage plus a documented manual keyboard/zoom/reduced-motion review exists for the core route set.

## TQE-GATE-05 — Visual determinism

Representative screenshot tests run reproducibly in the controlled CI environment and produce reviewable diffs.

## TQE-GATE-06 — Performance

Core route bundle/Lighthouse regressions can fail the intended release/CI gate.

## TQE-GATE-07 — Security

RLS negative tests, Auth/AAL2 journey, XSS corpus and client-secret-boundary checks demonstrably fail when protections are intentionally broken.

## TQE-GATE-08 — Resilience

At least Supabase, Resend/Contact, Turnstile and one external-content provider failure path are exercised without taking down Professional Core.

## TQE-GATE-09 — Traceability

A representative set of critical requirements/decisions can be followed to concrete automated/manual verification evidence.

## TQE-GATE-10 — Flake discipline

CI retries/quarantine behavior does not hide persistent critical-suite instability.

---

## 119. Decision registry

| ID | Decision |
|---|---|
| TQE-001 | Quality engineering tests behavior at the lowest reliable layer and critical journeys again at real system boundaries. |
| TQE-002 | No single test layer is sufficient evidence for the full system. |
| TQE-003 | Vitest is the baseline unit/service/component test runner. |
| TQE-004 | React Testing Library is the baseline for semantic Client Component testing. |
| TQE-005 | Playwright is the canonical E2E/browser/visual automation framework. |
| TQE-006 | Browser E2E normally runs against a production build. |
| TQE-007 | Async Server Components are primarily verified through extracted lower-level logic plus E2E rather than forced synthetic unit rendering. |
| TQE-008 | Supabase CLI + pgTAP are first-class database verification tools. |
| TQE-009 | Lighthouse CI or equivalent deterministic lab tooling enforces representative performance regressions. |
| TQE-010 | Automated accessibility uses axe/Playwright but never replaces manual accessibility assessment. |
| TQE-011 | Pure business/state/policy logic is unit-tested independently of UI. |
| TQE-012 | Invalid state transitions receive explicit negative tests. |
| TQE-013 | Large implementation snapshots are discouraged. |
| TQE-014 | Coverage is a diagnostic; there is no single vanity global coverage percentage as proof of quality. |
| TQE-015 | Critical policy/security/validation modules target very strong branch coverage and explicit negative cases. |
| TQE-016 | Static validation runs before expensive browser checks. |
| TQE-017 | Machine-enforceable architecture boundaries should be automated where practical. |
| TQE-018 | Canonical professional content and all cross-record references are CI-validated. |
| TQE-019 | EN/ES parity is verified statically and through representative browser journeys. |
| TQE-020 | RenderCV validates and renders both language artifacts in the quality pipeline. |
| TQE-021 | Routine CI correctness must not depend on live third-party provider availability. |
| TQE-022 | Provider fixtures are sanitized and versioned. |
| TQE-023 | Database tests cover schema, constraints, grants, RLS and transactional functions. |
| TQE-024 | Database authorization requires negative tests for forbidden roles/actions. |
| TQE-025 | All migrations must apply cleanly from zero in CI/local verification. |
| TQE-026 | Material migrations also test representative upgrade compatibility where risk warrants it. |
| TQE-027 | Test seeds contain synthetic data only. |
| TQE-028 | Tests are order-independent. |
| TQE-029 | Time-sensitive domain logic uses testable clock seams where practical. |
| TQE-030 | Production cryptographic randomness is never weakened for test convenience. |
| TQE-031 | E2E focuses on user journeys/framework integration rather than duplicating every unit permutation. |
| TQE-032 | Chromium is the primary full PR browser baseline; Firefox/WebKit receive critical compatibility coverage. |
| TQE-033 | The viewport matrix includes 320px stress, common compact, medium/tablet, expanded and wide states. |
| TQE-034 | Six-destination Dock behavior has separate 320 CSS-px, 200% browser-zoom, independent text-scaling and short-landscape release gates. |
| TQE-035 | Widget Field personalization/recomposition has dedicated automated coverage. |
| TQE-036 | Focus, selection, hover and active state distinctions are explicitly tested. |
| TQE-037 | Route history, deep links, intercepted Project Detail and Back behavior are browser-tested. |
| TQE-038 | Physical gamepad/stylus checks remain manual where automation cannot represent real hardware confidently. |
| TQE-039 | Audio tests verify policy/state; subjective audio quality receives manual QA. |
| TQE-040 | Motion correctness includes interruption/retargeting and Reduced Motion capability preservation. |
| TQE-041 | Liquid Glass testing covers full degradation through SOLID/fallback modes. |
| TQE-042 | Automated accessibility scans cover representative public and Admin states. |
| TQE-043 | Manual accessibility includes keyboard, zoom, reduced preferences and representative screen-reader verification. |
| TQE-044 | Critical contrast combinations are mechanically checked where practical. |
| TQE-045 | Playwright visual comparisons protect high-value stable visual contracts. |
| TQE-046 | Visual baselines update only after human review of diffs. |
| TQE-047 | Test combination strategy is curated/pairwise rather than full Cartesian explosion. |
| TQE-048 | Contact tests verify idempotency, provider failure, input preservation and telemetry redaction. |
| TQE-049 | Guestbook submit creates pending content and public projection remains approved-only. |
| TQE-050 | Sketch/Drawing validators and renderers receive adversarial structural-limit tests. |
| TQE-051 | Property/fuzz-oriented testing is recommended for Drawing logical validation/render boundaries. |
| TQE-052 | Reports are tested independently from content moderation state. |
| TQE-053 | Admin Auth tests require AAL2 plus active admin profile. |
| TQE-054 | Password recovery does not bypass MFA in test expectations. |
| TQE-055 | MFA operational verification covers both primary and backup TOTP before launch. |
| TQE-056 | Arcade testing spans rules, protocol, DB transactionality, browser flow and anti-cheat cases. |
| TQE-057 | Arcade cheating tests assume a fully tamperable browser client. |
| TQE-058 | Leaderboard ordering is deterministic and version-aware. |
| TQE-059 | External integration tests exercise stale fallback and malformed/rate-limited providers. |
| TQE-060 | Cache testing explicitly covers fresh, stale-allowed and expired states. |
| TQE-061 | Cron/jobs are tested for authentication, leases, duplicate execution and partial failure. |
| TQE-062 | Security verification combines behavioral, static, DB and manual techniques; no scanner alone is sufficient. |
| TQE-063 | UGC XSS corpus is tested in both public and Admin rendering surfaces. |
| TQE-064 | CSRF/origin/CORS protections receive explicit negative tests. |
| TQE-065 | The absence of arbitrary URL-fetch/SSRF surfaces is treated as an invariant and future URL-fetch features require review. |
| TQE-066 | Production-like tests assert CSP and other key security headers. |
| TQE-067 | CI includes secret-leak and client/server-secret-boundary checks. |
| TQE-068 | Dependency vulnerabilities are triaged rather than blindly ignored or used as sole security proof. |
| TQE-069 | DOC-49 bundle/performance budgets become executable regression checks. |
| TQE-070 | Core-route tests verify heavy feature chunks do not leak into initial bundles. |
| TQE-071 | Interaction performance tests detect long tasks/rerender/layout-loop regressions using deterministic proxies where possible. |
| TQE-072 | Drawing stress testing verifies high-frequency isolation. |
| TQE-073 | Arcade performance verification separates CI protocol checks from representative-device FPS conclusions. |
| TQE-074 | Concurrency tests are mandatory for race-sensitive operations. |
| TQE-075 | Load exercises are targeted, non-production and proportional to expected public risk. |
| TQE-076 | Failure injection verifies documented degraded behavior for major optional dependencies. |
| TQE-077 | Recovery quality includes actual isolated restore/runbook drills. |
| TQE-078 | Local/CI is the primary correctness environment; Production receives non-destructive smoke/RUM only. |
| TQE-079 | Preview deployment success alone is not acceptance. |
| TQE-080 | Central test factories provide valid defaults while invalid scenarios remain explicit. |
| TQE-081 | Production PII/secrets never enter committed test fixtures. |
| TQE-082 | Test names describe user/domain behavior. |
| TQE-083 | Browser locators prefer accessible semantics over implementation CSS/DOM structure. |
| TQE-084 | Visual tests stabilize dynamic factors instead of masking them with huge tolerances. |
| TQE-085 | Flaky tests are quality defects and must be root-caused. |
| TQE-086 | Quarantined tests remain visible, tracked and time-bounded. |
| TQE-087 | Critical security/auth/data-integrity gates cannot be indefinitely quarantined. |
| TQE-088 | Release readiness requires applicable static, DB, browser, accessibility, security, performance and manual gates—not merely a successful build. |
| TQE-089 | Release-specific test requirements activate with DOC-02 feature release boundaries. |
| TQE-090 | V1.2 materially expands UGC/moderation/security/recovery testing. |
| TQE-091 | V1.3 materially expands Arcade protocol/anti-cheat/gamepad/performance testing. |
| TQE-092 | V1.4 materially expands external integration/cache/job resilience testing. |
| TQE-093 | Major releases include focused exploratory charters. |
| TQE-094 | Representative real-device testing supplements emulation. |
| TQE-095 | Material platform/browser regressions receive durable regression tests when feasible. |
| TQE-096 | Observability/redaction behavior is itself tested. |
| TQE-097 | Synthetic monitoring must be verified not to pollute user-facing production data. |
| TQE-098 | Material production incidents normally add a regression control at the lowest appropriate layer. |
| TQE-099 | Generated tests require human verification that they can detect the intended defect. |
| TQE-100 | Critical test effectiveness may be sanity-checked through deliberate small mutations. |
| TQE-101 | Stable `pnpm test:*` commands form the human/CI contract; DOC-51 owns exact wiring. |
| TQE-102 | Quality checks are tiered FAST/STANDARD/DEEP/MANUAL to balance feedback speed and confidence. |
| TQE-103 | CI retains bounded diagnostic artifacts such as traces/diffs/reports without secrets. |
| TQE-104 | Slow suites are optimized by reducing redundant high-level testing before deleting critical coverage. |
| TQE-105 | Apparent flakiness is investigated as a possible real race before adding waits/retries. |
| TQE-106 | Accessibility correctness outranks preserving obsolete visual snapshots. |
| TQE-107 | Material changes may require both visual and performance acceptance. |
| TQE-108 | Security controls are tested together with the approved usable journey, not in isolation. |
| TQE-109 | Critical automated/manual verification should be traceable to approved requirements/decisions. |
| TQE-110 | Release epics maintain requirement→verification→gate mapping. |
| TQE-111 | Quality exceptions are documented, narrow, owned and time-bounded. |
| TQE-112 | V1.0 has explicit pre-launch quality gates for Core, Auth, Contact, accessibility, performance, security and rollback. |
| TQE-113 | Community/Arcade/Integration release gates activate when their corresponding releases activate. |
| TQE-114 | The quality system remains proportional: no mandatory 100% coverage, full Cartesian browser matrix, enterprise chaos platform or test-for-metric behavior. |
| `TQE-115` | Real PostgreSQL rate-limit concurrency/expiry behavior is an integration/security test gate. |
| `TQE-116` | Retention, capability-based deletion, Drawing IndexedDB persistence and privacy-receipt behavior receive explicit tests. |
| `TQE-117` | Dock zoom QA separates 320 CSS-px, browser page zoom, independent text scaling and short-landscape cases. |

---

## 120. External implementation notes

The current tool choices align with the upstream ecosystem at the time of this specification:

- Next.js documents Vitest + React Testing Library for unit testing and recommends E2E for async Server Components where unit tooling does not fully model them.
- Next.js documents Playwright as a supported E2E path and recommends running tests against production code when practical.
- Playwright supports Chromium, Firefox and WebKit, accessibility integration with `@axe-core/playwright`, screenshot comparison and CI sharding when scale requires it.
- Supabase documents pgTAP and `supabase test db` for database structure, RLS, functions and integrity verification.
- Lighthouse CI supports repeated automated Lighthouse runs and performance/resource-budget assertions.

Exact package versions are intentionally not pinned in this architecture document; DOC-51/build setup will pin supported versions in the repository.

---

## 121. Approved outcome

DOC-50 is approved with the following quality commitments:

1. testing is layered rather than browser-only;
2. database security receives real pgTAP/RLS negative tests;
3. Playwright is the primary browser/visual E2E framework;
4. accessibility includes manual verification beyond axe;
5. performance/security/reliability budgets become executable gates;
6. UGC, Admin and Arcade receive dedicated adversarial/concurrency testing;
7. routine CI remains deterministic and does not depend on live providers;
8. quality gates activate according to the product release roadmap;
9. flaky tests are defects rather than accepted background noise;
10. a successful build alone is never release acceptance.

DOC-51 now defines the concrete repository, GitHub Actions, branch protection, command wiring, artifact retention, release flow and developer/implementation-tool workflow that executes this strategy.
