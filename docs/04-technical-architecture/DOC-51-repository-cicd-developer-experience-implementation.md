---
id: DOC-51
title: "Repository, CI/CD & Developer Experience Implementation"
document_status: APPROVED
canonical_format: markdown
phase: "Technical Architecture"
folder: 04-technical-architecture
domain: "Repository, CI/CD & Developer Experience"
canonical_domain_owner: repository_cicd_developer_experience

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
  - DOC-32
  - DOC-36
  - DOC-37
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
  - ADR-001
  - ADR-002

decision_families:
  - RDX
approved_at: 2026-09-15
last_updated: 2026-09-15
---

# DOC-51 — Repository, CI/CD & Developer Experience Implementation

> **Status:** APPROVED.  
> **Role:** Define the executable development operating system for the portfolio: repository structure, Git workflow, pull-request governance, GitHub Actions, dependency automation, Supabase/Vercel release choreography, environment/secrets handling, developer commands, issue/milestone conventions and implementation-tool governance.

---

## 1. Purpose

DOC-41 through DOC-50 define what the system is, how it behaves, where its trust boundaries live, how it is tested and what reliability/security qualities it must preserve. DOC-51 defines **how changes safely move from an idea to production**.

Without this document, the implementation could still drift through process rather than architecture:

- a developer may push directly to `main`;
- development tooling may change a canonical decision without updating its owner;
- a migration may be edited in Supabase Dashboard and never enter Git history;
- Preview may accidentally use Production credentials;
- a production deploy may race a breaking schema change;
- required CI checks may have ambiguous names;
- an Action may silently change because it is referenced by a mutable tag;
- an expensive test suite may run on every keystroke while important security checks are skipped;
- a generated PDF or manifest may be manually edited;
- dependency updates may accumulate for months;
- an emergency fix may bypass all traceability.

The objective is not enterprise ceremony. The objective is **a small, reliable, auditable delivery system that one person can operate correctly with supporting development tooling**.

---

## 2. Delivery north star

> **Small branches, explicit contracts, deterministic checks, protected production, reversible releases.**

The repository should optimize for:

1. short feedback loops;
2. small reviewable changes;
3. low operational complexity;
4. high confidence at merge time;
5. clear source-of-truth ownership;
6. safe database evolution;
7. reproducible local/CI behavior;
8. tool-assisted implementation without silent architectural drift.

The process must remain proportional to a personal portfolio. We do **not** introduce heavyweight release trains, multi-team approval matrices, long-lived environment branches or enterprise tooling without a demonstrated need.

---

## 3. Repository model

The project uses **one Git repository and one web application** for V1.x.

Baseline:

```text
alejandro-portfolio/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   ├── dependabot.yml
│   └── PULL_REQUEST_TEMPLATE.md
│
├── app/
├── features/
├── components/
├── lib/
├── content/
├── cv/
├── public/
├── supabase/
│   ├── migrations/
│   ├── tests/
│   ├── seed.sql
│   └── config.toml
├── tests/
├── scripts/
├── docs/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── ...
```

This is **not a monorepo** in V1.x.

A monorepo becomes valid only if independently versioned/deployed packages create a real operational benefit. The existence of `features/`, games, RenderCV or Admin does not by itself justify multiple workspaces.

---

## 4. Source-of-truth hierarchy inside the repository

The repository contains several distinct source classes:

```text
Approved docs / ADRs
        ↓
Canonical professional content
        ↓
Schema migrations / configuration
        ↓
Application source
        ↓
Generated artifacts
```

Generated outputs never outrank their source.

Examples:

```text
content/canonical/*
→ source

public/cv/*.pdf
→ generated
```

```text
supabase/migrations/*
→ source

remote production schema
→ deployed result
```

```text
docs/*.md
→ source

planning ZIP snapshot
→ distribution artifact only
```

Once implementation begins, the Git repository becomes the canonical home of the Markdown documentation. Planning ZIPs remain historical handoff artifacts, not a parallel editable source.

---

## 5. Package/runtime version policy

The repository pins the development toolchain deliberately.

Required controls:

- `packageManager` in `package.json` pins pnpm major/minor policy;
- Node major is pinned with a repository-readable mechanism such as `.nvmrc` or `.node-version` plus `engines.node`;
- `pnpm-lock.yaml` is committed;
- CI installs from the lockfile with frozen-lockfile semantics;
- supported tool versions are changed through explicit dependency/toolchain PRs;
- production never runs `latest` as an intentional version selector.

Example conceptual metadata:

```json
{
  "packageManager": "pnpm@<approved-version>",
  "engines": {
    "node": "<approved-major-range>"
  }
}
```

Exact versions are selected during V0 bootstrap from currently supported stable releases and then pinned in Git.

---

## 6. Core local prerequisites

A development machine needs only the tools that support the approved architecture:

- Git;
- supported Node.js;
- pnpm;
- Docker-compatible runtime for local Supabase;
- Supabase CLI, preferably invoked through the repository/toolchain contract;
- browser(s) required by Playwright;
- Python/RenderCV toolchain where DOC-37 requires it.

No developer should need a globally installed collection of undocumented CLI versions to make the repository work.

---

## 7. Bootstrap contract

The project provides one documented onboarding path.

Conceptually:

```bash
git clone <repo>
cd <repo>
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm supabase:start
pnpm db:reset
pnpm dev
```

The exact commands may evolve, but `README.md`, repository docs and local operator instructions must stay aligned with the real scripts.

A new machine should be able to reach a usable local state without editing production services.

---

## 8. Environment file policy

Committed:

```text
.env.example
```

Never committed:

```text
.env
.env.local
.env.*.local
provider credentials
Supabase secret keys
TOTP secrets
recovery material
```

`.env.example` contains **names and safe descriptions**, never usable credentials.

Environment validation is executable at startup/build rather than relying on undefined variables failing later in a request.

---

## 9. Trunk-based Git model

The repository uses a **trunk-based workflow** centered on `main`.

There is no permanent `develop` branch.

Normal flow:

```text
main
  ↓
short-lived task branch
  ↓
Pull Request
  ↓
required verification
  ↓
squash merge
  ↓
main
```

This matches DOC-18/DOC-41 and keeps Vercel/Supabase release behavior easy to reason about.

---

## 10. Branch lifetime

Task branches should normally live hours or a few days, not weeks.

If a branch becomes large enough that it cannot be safely reviewed, the preferred response is to split the change behind backward-compatible contracts or feature gates rather than preserve a long-lived integration branch.

Long-lived release branches are not part of the V1.x baseline.

---

## 11. Branch naming

Use short descriptive branches:

```text
feat/widget-customization
feat/project-detail-routing
fix/contact-retry
fix/dock-320-zoom
refactor/input-manager
security/admin-csrf
perf/home-js-budget
docs/doc-51-cicd
chore/dependency-refresh
```

The prefix communicates intent; the issue number may be included when useful but is not required to make a branch understandable.

---

## 12. Direct pushes to `main`

Normal direct pushes to `main` are prohibited.

`main` changes arrive through a Pull Request so that:

- required checks execute;
- Preview exists;
- the diff is reviewable;
- migration/documentation impacts are visible;
- the merge event becomes the deployment boundary.

A break-glass path may exist for a genuine production emergency, but it must be exceptional, auditable and followed by a normalizing PR/post-incident record.

---

## 13. Pull Request as the change boundary

A PR is the unit where implementation, documentation, migration and verification effects are reviewed together.

The PR template requires at least:

- intent/problem;
- linked issue/milestone when applicable;
- approved docs/decision IDs affected;
- screenshots/video for material visual changes;
- accessibility impact;
- security/privacy impact;
- database/migration impact;
- rollback/degradation considerations;
- tests/checks executed;
- known follow-ups.

The template is concise enough to be used rather than bypassed.

---

## 14. Solo-project review policy

The project is initially operated by one primary developer.

Therefore the baseline **does not require one external human approval** merely to satisfy a process metric that the project cannot reliably provide.

Instead `main` requires:

- PR;
- required status checks;
- resolved conversations;
- no unresolved release-blocking findings;
- manual self-review of the final diff.

If regular collaborators join the repository, the ruleset should be amended to require at least one independent approving review for material changes.

---

## 15. Merge strategy

Baseline merge method:

> **Squash merge into `main`.**

Benefits:

- one coherent commit per PR;
- linear readable history;
- easy rollback/cherry-pick reasoning;
- noisy intermediate implementation commits do not become permanent history.

Merge commits and rebase merges are disabled unless a future workflow demonstrates a concrete need.

---

## 16. Commit discipline inside branches

Intermediate commits may be frequent but should remain meaningful enough to support local rollback and debugging.

Preferred commit language follows Conventional Commit-style intent:

```text
feat: add widget layout resolver
fix: preserve focus after project detail closes
test: cover duplicate arcade finalization
docs: approve DOC-50
chore: update pnpm lockfile
```

This is a development convention, not a reason to reject a correct emergency change solely because punctuation differs.

---

## 17. Public changelog is curated

Conventional commits do **not** automatically become the user-facing portfolio changelog.

DOC-31/DOC-36 define a curated Changelog/Dev Log experience. Internal commit history can assist curation, but the public surface must not dump implementation noise or sensitive operational detail.

---

## 18. `main` repository ruleset

The preferred GitHub mechanism is a repository ruleset targeting `main`.

Baseline protections:

- require Pull Request before merge;
- require configured status checks;
- require conversation resolution;
- block force pushes;
- block branch deletion;
- preserve linear history;
- restrict bypass to the minimum practical set;
- optionally require deployments/checks only when they provide real safety rather than deadlocks.

Signed commits may be enabled later as hardening, but are not a baseline correctness dependency because automation/tooling flows can otherwise create unnecessary friction.

---

## 19. Required checks must have unique stable names

GitHub required checks depend on check names. Therefore required job/check names are unique across workflows.

Good:

```text
quality / fast
quality / standard
security / supply-chain
release / migration-safety
```

Avoid two workflows both publishing:

```text
test
```

Renaming a required check is a repository-governance change and must update the ruleset atomically.

---

## 20. Merge queue

Merge queue is **not required initially**.

It becomes useful when concurrent merges from multiple contributors frequently invalidate each other. For a single-developer repository it adds process without material benefit.

If repository activity reaches that point, GitHub's merge queue can be adopted through an ADR/process amendment.

---

## 21. Issue model

Issues are used for work that benefits from persistent scope/acceptance/traceability.

Typical issue classes:

```text
Feature
Bug
Security
Performance
Accessibility
Technical debt
Documentation
Operational task
```

A five-minute typo does not need ceremony. A migration, security control, major interaction, release gate or architectural change does.

**Default assignee:** Alejandro. Issues remain assigned to the accountable human owner. Automation may update status/checks or open maintenance PRs, but it is not the project owner and must not become the creative author/assignee of implementation work.

---

## 22. Issue template

A material implementation issue should answer:

1. Problem/context.
2. Desired outcome.
3. Scope / non-scope.
4. Relevant approved docs/decision IDs.
5. Acceptance criteria.
6. UX/accessibility considerations.
7. Security/privacy/data considerations.
8. Test expectations.
9. Migration/release implications.
10. Evidence/artifacts expected.

This translates the project's decision discipline into executable work without duplicating entire architecture documents in every issue.

---

## 23. Milestones

GitHub Milestones map to approved release boundaries rather than arbitrary calendar sprints:

```text
V0 Foundation
V1.0 Professional Core
V1.1 Personality
V1.2 Community
V1.3 Arcade
V1.4 Live Integrations
```

DOC-02 remains release authority; the milestone is an execution view of that approved roadmap.

---

## 24. Labels

Use a small composable label taxonomy.

Suggested families:

```text
type:feature
type:bug
type:security
type:docs
type:tech-debt
type:chore

area:shell
area:widgets
area:projects
area:achievements
area:arcade
area:channel
area:social
area:contact
area:admin
area:data
area:infra
area:a11y

risk:high
risk:security

status:blocked
status:needs-decision
```

Avoid dozens of near-duplicate labels that become more expensive to maintain than the work itself.

---

## 25. GitHub Project board

A GitHub Project board is part of V0 repository bootstrap.

It visualizes issues across releases/states; it does not become a second source of product requirements.

Baseline workflow states:

```text
Backlog
Ready
In Progress
Review
Blocked
Done
```

Recommended fields include Release, Priority, Area and Risk. The docs and Issues remain authoritative for decisions and acceptance respectively.

---

## 25A. GitHub Wiki

The GitHub Wiki is **required as a human-friendly companion layer**, but it is deliberately non-canonical.

Its purpose is orientation, summaries, quick help and useful links. It must not duplicate the complete specification set or introduce requirements/decisions that do not exist in `/docs`.

Baseline Wiki pages:

```text
Home
Start Here
Project Overview
Roadmap
Architecture at a Glance
Design System at a Glance
Local Development Quickstart
Release & Deployment Guide
Troubleshooting
Useful Links
Glossary
FAQ
```

Rules:

- `/docs` + approved ADRs remain source of truth;
- Wiki pages summarize and link back to exact canonical documents/sections;
- if a Wiki edit would change product/architecture behavior, update the canonical doc/ADR first;
- avoid copying large canonical sections verbatim;
- Wiki content must follow the same authorship/attribution policy as the rest of the project;
- Wiki can be more conversational and onboarding-oriented than canonical specs.

---

## 26. ADR trigger inside delivery workflow

A PR must not silently change an approved architectural decision.

When implementation reveals that an approved rule is wrong or infeasible:

```text
Implementation discovery
        ↓
Proposal / impact analysis
        ↓
ADR or canonical-doc amendment
        ↓
approval
        ↓
implementation
```

Code does not win merely because it already exists.

---

## 27. Documentation changes are atomic with implementation

If a PR changes a canonical contract, it updates the governing Markdown in the same PR.

Examples:

- new project lifecycle state → DOC-36 + schemas/tests;
- new global input semantic action → DOC-23/32 + implementation/tests;
- new runtime table → DOC-44 + migration/RLS/tests;
- new provider → DOC-46/47/48 where applicable;
- new performance exception → DOC-49 + budget rationale.

A follow-up documentation issue is not the default for a known contract change.

---

## 28. Documentation validation

CI validates at least:

- frontmatter parseability;
- unique DOC/ADR IDs;
- dependency references;
- `document_status`/`decision_status` enums;
- Markdown fence balance/basic structure;
- decision-family uniqueness where applicable;
- README/index/manifest consistency;
- absence of obvious secret patterns.

The current hand-built planning manifest becomes a reproducible repository script such as:

```bash
pnpm docs:validate
pnpm docs:manifest
```

---

## 29. Generated documentation artifacts

`MANIFEST.json` is generated from repository files and may be committed if it continues serving integrity/navigation purposes.

If committed:

- CI regenerates it;
- CI fails when the committed version differs;
- developers do not hand-edit hashes/counts.

ZIP handoff packages are release/handoff artifacts, not edited source files.

---

## 30. Stable repository command contract

Humans, CI and development tooling use the same `pnpm` scripts wherever practical.

Baseline command surface:

```text
pnpm dev
pnpm build
pnpm start

pnpm lint
pnpm typecheck
pnpm format:check
pnpm content:validate
pnpm docs:validate

pnpm test:unit
pnpm test:component
pnpm test:db
pnpm test:e2e
pnpm test:a11y
pnpm test:visual
pnpm test:perf
pnpm test:security

pnpm verify:fast
pnpm verify:standard
pnpm verify:deep

pnpm cv:project
pnpm cv:validate
pnpm cv:build
pnpm cv:verify

pnpm supabase:start
pnpm supabase:stop
pnpm db:reset
pnpm db:test
```

Exact implementation may combine scripts internally, but the human/automation contract stays stable.

---

## 31. `verify:fast`

FAST is optimized for immediate developer/PR feedback.

Typical contents:

```text
format check
lint
typecheck
content/schema validation
docs validation
focused unit tests
architecture/import-boundary checks
```

Target: fast enough to run routinely before pushing.

FAST never receives production secrets.

---

## 32. `verify:standard`

STANDARD is the normal merge-confidence tier.

Typical contents:

```text
FAST
+
full unit/component suite
local database reset + pgTAP
RenderCV validation/build checks
Next.js production build
critical Chromium E2E
critical accessibility automation
security/static/supply-chain checks available to the repository
bundle/resource budget checks
```

STANDARD is required for normal merges to `main`.

---

## 33. `verify:deep`

DEEP is the expensive/high-confidence tier.

It may include:

```text
Firefox/WebKit critical journeys
expanded visual regression
full accessibility matrix
Lighthouse/performance lab suite
Drawing fuzz/property corpus
Arcade adversarial/concurrency suite
provider failure injection
resilience checks
selected load exercises
security deep checks
```

DEEP runs:

- manually before material releases;
- on sensitive/risk-tagged changes where practical;
- on a scheduled cadence;
- when a regression investigation requires it.

Not every typo PR needs the full matrix.

---

## 34. CI workflow decomposition

Prefer several purpose-specific workflows over one 1,500-line YAML file.

Conceptual structure:

```text
.github/workflows/
├── quality.yml
├── database.yml
├── e2e.yml
├── security.yml
├── deep-quality.yml
├── production-db.yml
├── post-deploy-smoke.yml
└── scheduled-maintenance.yml
```

Reusable local scripts contain domain logic; Actions YAML orchestrates rather than reimplements validation rules.

---

## 35. Pull Request CI

Every normal PR receives at minimum:

```text
quality / fast
quality / standard
```

Additional jobs may be activated by changed paths/risk labels, but fundamental compile/type/content/doc/security invariants are not skipped merely because a path filter guessed incorrectly.

---

## 36. CI concurrency

For PR verification, stale runs should be cancelled when a newer commit reaches the same PR.

Conceptually:

```yaml
concurrency:
  group: pr-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

For production migrations/deploy/recovery operations, `cancel-in-progress` is **not** used blindly. A half-cancelled schema deployment is more dangerous than finishing an older job.

---

## 37. GitHub Actions permissions

Default workflow token posture is read-only.

Conceptually:

```yaml
permissions:
  contents: read
```

Jobs request only the additional permission they need.

Examples:

- test job: read repository;
- PR annotation job: possibly `pull-requests: write`;
- security upload: only the specific security permission required;
- release/tag automation: explicit narrow write permission.

No workflow gets broad write permission by habit.

---

## 38. Actions supply-chain policy

Third-party and GitHub Actions used in security/deployment workflows are pinned to **full immutable commit SHAs** where practical.

A comment may record the human-readable release:

```yaml
uses: actions/checkout@<full-sha> # vX.Y.Z
```

Automated dependency tooling keeps those pins maintainable.

Mutable branches such as `@main` are prohibited in production workflows.

---

## 39. Workflow source restrictions

Prefer:

1. repository-local scripts/actions;
2. GitHub-authored verified actions;
3. well-established third-party actions with narrow responsibility.

A new action that receives secrets or write permissions is treated as a dependency with security impact, not as a harmless YAML convenience.

---

## 40. `pull_request_target`

`pull_request_target` is prohibited by default for workflows that check out or execute untrusted PR code.

If a future automation requires it, the workflow receives a focused security review and must not combine privileged secrets with attacker-controlled code execution.

---

## 41. Fork/untrusted PR safety

Routine Pull Request verification must remain useful without production secrets.

Therefore tests rely on:

- synthetic fixtures;
- local Supabase;
- local/mock provider adapters;
- safe public configuration only.

A contributor PR should not need Resend, production Supabase, Turnstile secret or production monitoring credentials to prove correctness.

---

## 42. Dependency installation in CI

CI uses the committed lockfile and deterministic install:

```bash
pnpm install --frozen-lockfile
```

Dependency caching may use the package-manager cache exposed by the official setup tooling.

Caches are performance optimizations, never sources of correctness and never containers for secrets.

---

## 43. Build reproducibility

The same commit should produce materially equivalent application output given the same pinned toolchain and approved environment class.

Build-time variability such as generated dates, random IDs or live-provider content must be controlled where it would make tests/artifacts nondeterministic.

---

## 44. Vercel Git integration

Baseline deployment uses Vercel's Git integration:

```text
PR branch
→ Preview deployment

main
→ Production deployment
```

Every PR receives a Preview URL when the build succeeds.

Preview is a review surface, **not proof that quality checks passed**.

---

## 45. Preview environment contract

Preview uses Preview-scoped configuration and must not inherit Production secrets/data.

Baseline:

```text
Vercel Preview
+
Supabase Preview Branch when available
```

Fallback without Supabase Branching:

```text
Preview UI
+
local/CI database correctness
+
dedicated non-production remote backend only when a remote integration test is genuinely needed
```

Never:

```text
Preview
→ Production database
```

---

## 46. Preview protection

Where available and useful, Vercel Deployment Protection should restrict non-public Preview environments.

However, Preview security does not depend solely on URL secrecy or deployment protection; Preview must remain isolated from Production credentials even if its URL becomes known.

---

## 47. Production merge boundary

A merge to `main` means:

> the change has passed the required repository gates and is eligible for production deployment.

Do not merge intentionally broken/incomplete code into `main` unless the code is safely feature-gated and all existing production behavior remains valid.

---

## 48. Production application deployment

Vercel production deployment may remain automatic on `main`.

This is safe only because:

- `main` is protected;
- STANDARD gates run before merge;
- schema evolution is backward-compatible across deploy ordering;
- risky capabilities can be release/feature-gated;
- rollback exists.

The project does not create a manual “click deploy” ritual for every CSS change solely to look enterprise-grade.

---

## 49. Database deployment authority

Production database migrations are applied through CI/release automation, not from a developer laptop during normal operation.

Supabase migration files in Git are the deployment source.

Remote Dashboard/Table Editor schema changes are prohibited once migration-managed development begins.

---

## 50. Migration PR contract

A PR containing `supabase/migrations/**` must demonstrate:

- local reset from zero succeeds;
- DB tests/pgTAP pass;
- grants/RLS are included in the same review;
- old and new application compatibility is considered;
- destructive changes have an explicit phased plan;
- rollback/recovery impact is understood.

Schema changes are not “just SQL files.”

---

## 51. Migration categories

Classify material migrations conceptually as:

```text
ADDITIVE
new nullable column/table/index/policy-compatible expansion

DATA
backfill/transform requiring operational awareness

CONTRACT
remove/rename/tighten old structure
```

ADDITIVE changes are easiest to automate.

DATA and especially CONTRACT changes receive stronger release review.

---

## 52. Expand → migrate → contract in CI/CD

The approved DOC-48 pattern becomes an execution rule.

Example:

```text
PR/Release A
ADD new_column
app tolerates old + new

↓

Backfill / migrate data

↓

PR/Release B
app reads new_column

↓

PR/Release C
DROP obsolete column
```

A breaking rename/drop and code dependency are not shipped as one timing-sensitive deploy.

---

## 53. Production migration workflow

Conceptually:

```text
merge to main
    ↓
production-db workflow
    ↓
validate expected environment
    ↓
supabase db push --dry-run
    ↓
supabase db push
    ↓
record result / migration version
```

Production credentials exist only in the production deployment context.

The exact CLI invocation is pinned to the repository's approved Supabase CLI version.

---

## 54. Migration concurrency

Only one production database deployment may run at a time.

Use a non-cancelling concurrency group/lease for production migrations.

Two `db push` operations must never race because two merges happened close together.

---

## 55. Application/DB deployment race policy

Vercel and the production DB workflow may complete in either order.

Therefore correctness **cannot depend on one always winning the race**.

Any change that requires a newly migrated structure immediately must either:

- remain backward-compatible until both sides are ready; or
- be protected by an explicit feature/release gate activated after migration success.

This is the practical enforcement of expand/migrate/contract.

---

## 56. Failed production migration

If production application deployment succeeds but a migration fails:

1. the existing production path must remain compatible;
2. the dependent feature remains disabled/unavailable;
3. the failure alerts the operator;
4. diagnose and issue a forward fix;
5. do not repeatedly click rerun without understanding state.

The architecture deliberately prevents a normal migration failure from taking down the Professional Core.

---

## 57. Destructive migration gate

A CONTRACT/destructive migration cannot be an invisible automated side effect.

It requires:

- explicit PR label/checklist;
- evidence old code no longer depends on the structure;
- current backup/restore confidence appropriate to the data;
- production release note/runbook step;
- manual authorization where the platform/workflow allows it.

---

## 58. Supabase seeds

`supabase/seed.sql` contains synthetic development/test data only.

Production deployment never uses `--include-seed`.

Remote production data is never copied into the repository as a seed shortcut.

---

## 59. Production schema drift

CI/operations include a way to detect or investigate migration-history drift.

When drift appears:

- stop applying new migrations blindly;
- compare Git migration history and remote migration history;
- repair deliberately;
- document the cause.

The solution is not to normalize Dashboard edits as a second migration source.

---

## 60. Post-deploy smoke verification

After production deployment, non-destructive smoke checks verify at minimum:

- canonical Home loads;
- ES and EN representative routes load;
- a Project Detail route loads;
- CV artifact is reachable;
- security headers/basic health are present;
- no obvious server exception spike appears.

Smoke tests do not send real Contact messages or create fake public UGC.

---

## 61. Production rollback

Application rollback uses Vercel deployment rollback/redeploy semantics.

Database rollback remains separate and follows DOC-48:

```text
bad app release
→ application rollback

bad migration/data issue
→ forward fix or restore when truly required
```

The release workflow never implies that reverting Git automatically rewinds PostgreSQL.

---

## 62. Release versioning

The public product follows SemVer-like release tags aligned with DOC-02:

```text
v0.x.y   foundation/pre-public work
v1.0.0   Professional Core
v1.1.0   Personality
v1.2.0   Community
v1.3.0   Arcade
v1.4.0   Live Integrations
```

Patch releases are compatible fixes/hardening.

The release version is useful for telemetry, changelog correlation and incident diagnosis even though the portfolio is not an npm library.

---

## 63. Git tags and GitHub Releases

Material public releases receive an immutable Git tag and optional GitHub Release entry.

Tags point to the exact production commit.

Do not move an existing public release tag to a different commit.

---

## 64. Release notes

Release notes summarize user-visible/product/operational changes and known limitations.

They do not expose:

- secrets;
- exploit-enabling operational detail;
- private data;
- raw internal incident notes.

The public in-portfolio Changelog can consume a curated subset rather than mirror GitHub Releases verbatim.

---

## 65. Hotfix flow

A production hotfix still begins from current `main` whenever possible:

```text
main
→ fix/<issue>
→ focused PR
→ minimum safe required verification
→ merge
→ production
```

Urgency can reduce nonessential ceremony; it does not justify bypassing type/security/data-integrity checks relevant to the fix.

Break-glass direct push is last resort, not “hotfix process.”

---

## 66. Feature flags / release gates

Feature/release gating is small and explicit.

Appropriate uses:

- Dock spaces before their approved release;
- schema-dependent capability waiting for migration;
- temporarily disabling Community/Arcade/integration during incident response.

The project does not adopt a remote enterprise feature-flag platform by default.

---

## 67. CI secrets and environments

Secrets are scoped to the narrowest environment/job that needs them.

Examples:

```text
PR quality
→ no production secrets

Preview
→ preview/non-prod credentials

production-db
→ production Supabase deployment credential

production smoke
→ only safe read/synthetic credentials if required
```

GitHub Environments may be used for secret separation/approval where plan capabilities make them useful, but baseline correctness does not depend on a paid approval feature.

---

## 68. Secret naming and ownership

Each secret has:

- purpose;
- provider;
- environment;
- owner;
- rotation procedure;
- consumers.

Avoid generic names such as:

```text
API_KEY
TOKEN
SECRET
```

Prefer explicit names aligned with DOC-48/47.

---

## 69. Secret rotation changes

Secret rotation is an operational change with verification.

Sequence:

```text
create/rotate provider credential
↓
update correct environment
↓
verify consumer
↓
revoke old credential
↓
record completion
```

Do not revoke first and then discover which workflow depended on the value.

---

## 70. Dependency automation baseline

Use **Dependabot** as the baseline native dependency automation.

Responsibilities:

- npm/pnpm ecosystem updates;
- GitHub Actions updates;
- security update visibility;
- bounded grouped routine updates where practical.

Renovate is deferred unless the project later needs policy sophistication that Dependabot cannot provide cleanly.

---

## 71. Dependency update cadence

Suggested baseline:

```text
security updates
→ triage promptly

routine patch/minor
→ weekly grouped PRs where safe

major updates
→ separate intentional PR
```

A framework major upgrade is not merged as noise inside a 25-package dependency batch.

---

## 72. Lockfile update review

Dependency PR review checks:

- package reason/source;
- unexpected transitive growth;
- bundle impact where relevant;
- license/security changes;
- framework/runtime compatibility;
- changed native/postinstall behavior.

A green lockfile diff is not automatically harmless.

---

## 73. Dependency review and scanning

When available for the repository/plan, enable GitHub dependency review to prevent introducing known vulnerable versions in PRs.

Also enable applicable:

- Dependabot alerts;
- secret scanning;
- code scanning/CodeQL where supported and useful.

The architecture does not assume a paid GitHub security feature is available; unavailable premium controls must have proportionate baseline alternatives rather than silently disappear.

---

## 74. Vulnerability triage

A vulnerability alert is evaluated by:

- affected package/path;
- exploitability in our usage;
- runtime/build/dev-only exposure;
- upstream fix availability;
- workaround/mitigation;
- severity.

Do not blindly ignore alerts and do not blindly break the project with every automated major update.

---

## 75. License awareness

New production dependencies should use licenses compatible with the project and distribution model.

Dependency review may enforce denied licenses if this becomes necessary, but V1.x does not create a heavyweight legal scanning system for a small portfolio.

---

## 76. Dependency budget

A dependency must earn its place.

Before adding one, ask:

- Is this already provided by platform/framework?
- Is the package maintained?
- Does it add meaningful client JS?
- Does it execute install/build scripts?
- What is the security surface?
- Could 30 lines of stable code be safer than a dependency?

Avoid both dependency maximalism and unnecessary reinvention.

---

## 77. Repository security settings

Baseline GitHub settings should include where supported:

- default branch `main`;
- protected/ruleset main;
- Actions default token permissions read-only;
- secret scanning / push protection if available;
- dependency graph/Dependabot;
- allowed Actions policy proportional to the project;
- full-SHA Action pinning policy where practical.

Repository settings themselves are part of infrastructure documentation/readiness, not invisible tribal knowledge.

---

## 78. Workflow logs and artifacts

CI artifacts are retained only when useful for debugging/review:

```text
Playwright traces on failure
visual diffs
Lighthouse reports
coverage reports where useful
build/bundle reports
```

Artifacts must not contain secrets, production PII, raw tokens or unpublished user content.

Retention stays bounded; CI is not archival storage.

---

## 79. Source maps

Production source maps may be uploaded privately to the observability provider for release correlation while not being intentionally exposed as public assets when configuration permits.

The upload credential is CI/server-only.

---

## 80. CI performance policy

The CI system itself has a performance budget.

Targets are not absolute SLAs, but the workflow should aim for:

- FAST feedback in a few minutes;
- STANDARD merge confidence without becoming a 45-minute tax;
- DEEP work moved out of every trivial PR unless risk requires it.

When CI becomes slow, first remove redundant high-level tests and improve caching/parallelism—not critical security/data checks.

---

## 81. Matrix strategy

Use matrices deliberately.

Example:

```text
PR STANDARD
→ Node approved version
→ Chromium critical browser

DEEP
→ Chromium + Firefox + WebKit
→ representative viewport/a11y/performance combinations
```

Avoid Cartesian explosion across every theme × locale × viewport × browser × input mode.

DOC-50's curated/pairwise strategy remains authoritative.

---

## 82. Scheduled verification

A scheduled workflow may run deeper checks that are expensive or dependency-sensitive:

- full cross-browser suite;
- dependency/security scans;
- selected visual/performance checks;
- provider fixture freshness checks;
- stale TODO/exception reports.

Scheduled failure creates a visible issue/alert if material; it is not allowed to fail silently for months.

---

## 83. Live-provider tests

Normal CI does not depend on GitHub API, Resend, live RSS, Turnstile or production Supabase being available.

Provider contracts use fixtures/adapters.

Small scheduled/manual integration smoke checks may call non-production provider environments when that yields meaningful confidence.

---

## 84. Production data in CI

Production user/runtime data is never downloaded into CI for ordinary test realism.

Use synthetic factories and sanitized fixtures.

A production incident requiring data analysis follows a dedicated privacy/security process rather than normal test setup.

---

## 85. Developer pre-push workflow

Before opening/updating a PR, normal expectation is:

```bash
pnpm verify:fast
```

Before requesting final merge of a material change:

```bash
pnpm verify:standard
```

CI remains authoritative; local success does not bypass CI.

---

## 86. Git hooks

Git hooks are optional conveniences, not correctness boundaries.

A lightweight formatter/lint-staged hook may improve feedback, but the repository must remain correct if hooks are skipped or unavailable because CI reruns the real gates.

Avoid pre-commit hooks that launch minutes of browser/database tests.

---

## 87. Formatting

Formatting is automated and deterministic.

A PR should not mix broad unrelated formatting churn with a functional change.

Formatting tool changes receive their own focused update because they can rewrite large portions of the repository.

---

## 88. TypeScript strictness

The project keeps strict TypeScript settings unless a specific library boundary requires a justified exception.

`any`, unchecked casts and blanket `@ts-ignore` are not normal escape hatches.

Exceptions should be local, documented and preferably covered by runtime validation at untrusted boundaries.

---

## 89. Lint/architecture rules

Linting should enforce high-value invariants, not subjective style wars.

Useful examples:

- no forbidden client imports of server modules;
- no arbitrary Supabase repository access from components;
- no raw `localStorage` outside the approved persistence adapter;
- no direct provider SDK usage outside integration adapters;
- no unsafe HTML APIs without an approved wrapper;
- no unapproved cross-feature dependency direction.

Architecture tests may complement ESLint when static import rules need more clarity.

---

## 90. TODO policy

A `TODO` is acceptable when it is specific and bounded.

Material deferred work should reference an issue or clear decision context.

Avoid permanent comments such as:

```text
TODO: fix later
TODO: security
TODO: optimize
```

with no owner/trigger.

---

## 91. Dead code and abandoned experiments

Experiments that are not part of the accepted product should not accumulate inside production bundles behind commented code.

Use Git history/branches for discarded experiments.

A future experiment can live behind a deliberate dev-only flag if active research requires it.

---

## 92. Local tool-specific instructions remain untracked

The committed repository stays tool-neutral. Tool-specific operator instruction files may exist locally for Alejandro, but they are not committed and must not appear as project provenance or authorship metadata.

Local instructions may summarize:

- project north star;
- mandatory reading order;
- canonical source owners;
- repository structure;
- stable `pnpm` commands;
- branch/PR expectations;
- security/privacy prohibitions;
- DB migration rules;
- generated-file rules;
- documentation/ADR update rules;
- Definition of Done;
- completion/reporting expectations.

DOC-19 remains the canonical implementation-tooling/authorship governance owner. Local tool-specific files operationalize it only for the developer's workstation and remain outside version control through local exclude/global ignore.

---

## 93. Tool-assisted task start protocol

Before editing a material feature, the implementer or development tooling should:

1. read the issue/task completely;
2. identify relevant ADRs;
3. read DOC-00 authority guidance;
4. read the canonical domain docs;
5. inspect existing code only after understanding the contract;
6. state/maintain a short implementation plan for nontrivial work;
7. identify migrations/security/release impacts before changing files.

“Search code and guess the design” is not an acceptable default.

---

## 94. Implementation-tool protocol

During implementation, development tooling should:

- make the smallest coherent change that satisfies acceptance;
- preserve architecture boundaries;
- add/update tests at the lowest reliable layer;
- update canonical docs when changing contracts;
- avoid broad unrelated refactors;
- avoid introducing new dependencies without rationale;
- never use production credentials or modify production directly;
- never claim a test passed unless it ran successfully;
- surface unresolved uncertainty rather than inventing a value.

---

## 95. Tool-assisted Definition of Done

A material task is not done because the code compiles.

A completion report should cover applicable items:

```text
Changed
Tests run
Build/type/lint status
Docs/ADR impact
Migration impact
Security/privacy impact
Known limitations/follow-ups
```

If a required check could not be run, state that explicitly.

---

## 96. Generated/tool-produced code review

Generated or tool-produced code receives the same review standard as any other code.

Review behavior, architecture, tests, security and maintainability. The implementation method does not change acceptance criteria.

---

## 97. Tool-proposed dependency changes

Before adding a new package, the change must explain:

- why the existing stack is insufficient;
- bundle/runtime impact;
- maintenance status;
- license/security implications;
- whether it is client-side or server-only.

No dependency is added merely because it makes code generation easier.

---

## 98. Tool-produced migrations

Generated/tool-produced migration SQL must never:

- apply production migrations directly;
- edit remote schema through Dashboard as a shortcut;
- rewrite applied migration history casually;
- generate destructive SQL without flagging its classification/impact.

Local reset + DB tests are part of completion.

---

## 99. Tooling and secrets

Development tooling must not request that real secrets be pasted into source/docs/task context when a placeholder or local secret setup is sufficient.

Secrets are referenced by environment-variable name, not copied into examples.

If a secret is accidentally exposed, the response is rotation/revocation, not merely deleting the line from Git.

---

## 100. Tooling and canonical professional facts

DOC-36 rules remain absolute:

Development tooling must never invent or “improve” professional dates, roles, metrics, certifications, technologies or project outcomes.

Missing fact → ask/mark unresolved.

Not:

```text
looks plausible → add it
```

---

## 101. Tooling and visual fidelity

When implementing approved UI, relevant DOC-20–40 contracts are read rather than approximating the product from screenshots alone.

A generated component that resembles the design but violates focus semantics, Widget Field logic, Glass degradation or responsive recomposition is not complete.

---

## 102. Tooling and test integrity

Development tooling must not make a failing test pass by:

- deleting it;
- massively loosening assertions;
- increasing arbitrary sleeps/retries;
- updating screenshots without inspecting the visual change;
- mocking away the behavior under test.

If the test is wrong, explain why and change the contract/test deliberately.

---

## 102A. Authorship and attribution

Alejandro is the human author/owner of the portfolio project unless another human collaborator is explicitly credited by him. Development tools, generators, IDEs, assistants and automation services are not authors or co-authors.

Repository-visible and public surfaces must not add tool credit/provenance such as:

```text
Made with <tool>
Built by <tool>
Generated by <tool>
Co-authored-by: <tool or bot>
```

This applies to README, Wiki, public Making Of/Credits, changelog, release notes, commit trailers, PR metadata intended as permanent attribution, source comments used only as provenance advertising, badges and controllable artifact metadata.

Operational service/bot identities may appear where technically unavoidable, but never as creative authorship or ownership.

---

## 103. Local development data

Local Supabase seeds/factories provide representative synthetic:

- pending/approved/hidden submissions;
- reports;
- moderation history;
- Arcade sessions/scores;
- admin test profile where safe;
- cache/provider states.

No real visitor or private production data is needed to develop the UI.

---

## 104. Test Admin identity

Local/CI Admin authentication uses dedicated non-production identity/factors/fixtures.

Production Admin credentials/factors are never reused in CI.

Browser E2E may use controlled local authentication helpers that preserve the authorization semantics DOC-45 requires rather than disabling Auth globally.

---

## 105. Preview UGC behavior

Preview environments must not publish test Guestbook/Sketch content into Production.

When a remote preview backend exists, it has isolated runtime data and disposable moderation state.

This is part of environment correctness, not just cleanliness.

---

## 106. Preview email behavior

Preview must not accidentally send Contact messages as if they came from Production.

Preferred options:

- provider test/sandbox semantics;
- allowlisted recipient;
- adapter sink/log in Preview;
- clearly prefixed non-production delivery.

The exact provider capability is selected during setup, but Production recipients/behavior are not silently reused.

---

## 107. Analytics in Preview

Preview and local environments do not pollute Production analytics.

Either analytics is disabled, uses a separate environment/project, or includes a robust environment partition that the analytics product actually supports.

---

## 108. Sentry/observability environments

Errors include release + environment.

Preview failures must be distinguishable from Production.

Source-map upload uses the same release identity that the deployed application emits.

---

## 109. Release correlation

A production runtime should expose internally/operationally enough metadata to correlate:

```text
Git SHA
release version
Vercel deployment
observability release
DB migration state
```

This does not mean displaying sensitive infrastructure details publicly.

---

## 110. Build metadata

Safe build metadata may be injected server-side at build/deploy time:

```text
APP_RELEASE
GIT_SHA
DEPLOY_ENV
```

Never put secrets into public runtime config under the excuse of “build metadata.”

---

## 111. Release readiness checklist

Before a material public release:

1. release milestone acceptance complete;
2. required PR checks green;
3. DEEP applicable gates green;
4. manual accessibility/device checks complete;
5. migrations reviewed/applied as planned;
6. backups/recovery gate appropriate to active data tier;
7. security HIGH/CRITICAL blockers resolved;
8. Preview reviewed;
9. release notes/changelog curated;
10. rollback path known;
11. post-deploy smoke prepared.

---

## 112. V1.0 delivery gate

Before V1.0:

- repository rules active;
- CI FAST/STANDARD active;
- Vercel Preview/Production connected;
- Production secrets isolated;
- canonical content/CV generation validated;
- responsive/a11y/performance/security V1.0 gates pass;
- domain/TLS/DNS ready;
- rollback runbook tested;
- no unreleased Dock route accidentally indexable.

---

## 113. V1.2 delivery gate

Before Community release:

- production DB backup policy active;
- moderation/admin CI gates active;
- AAL2 operational verification complete;
- UGC XSS/Drawing/Report/RLS tests green;
- abuse controls/Turnstile production configuration verified;
- disable-Community runbook tested.

---

## 114. V1.3 delivery gate

Before Arcade release:

- session/finalize/anti-replay concurrency tests green;
- leaderboard version configured;
- representative gameplay performance/device checks complete;
- score disable/degraded mode tested;
- no direct public DB score insert path exists.

---

## 115. V1.4 delivery gate

Before Live Integrations release:

- source registry reviewed;
- cache jobs/leasing active;
- stale/degraded behavior tested;
- cron authentication verified;
- provider credentials minimal/read-only where possible;
- external outage does not fail Professional Core.

---

## 116. Quality exceptions

A merge/release exception must be:

- specific;
- justified;
- time-bounded;
- owned;
- visible in the PR/issue;
- accompanied by a follow-up if debt remains.

“CI is annoying” is not an exception rationale.

Security/data-integrity bypasses require especially strong justification.

---

## 117. CI outage policy

If GitHub Actions itself is unavailable, the default response is to wait rather than normalize unverified merges.

For a genuine emergency production fix, execute the relevant stable repository commands locally, preserve evidence, use the narrow break-glass path and backfill normal CI/PR traceability once service recovers.

---

## 118. Vercel outage policy

A Vercel deployment outage does not justify changing DNS to an unreviewed ad-hoc server during a routine incident.

Use existing stable production while provider recovers where possible.

A sustained provider disaster requiring platform migration is a separate DR decision/runbook, not an improvised hotfix.

---

## 119. Supabase outage policy during deployment

If Supabase is unavailable while a schema-dependent release is pending:

- do not merge/activate the dependent capability simply hoping the DB catches up;
- preserve current Professional Core;
- delay or keep feature gate off;
- resume after DB health returns and migration state is verified.

---

## 120. Repository backups and ownership

GitHub is the working remote, but important assets are not trusted to one account with weak recovery.

Tier-0 controls from DOC-48 apply:

- account MFA;
- recovery material;
- repository ownership understood;
- local/secondary Git clone or backup path feasible;
- domain/DNS/Vercel/Supabase recovery independent of one browser session.

---

## 121. Repository visibility

Public vs private repository is a separate product/security choice.

The architecture must remain safe in either case:

> **Private repository is not a secret-management strategy.**

No production credential or private client information is committed even if the repository is private.

If the repository becomes public, documentation/content must already be classified as public-safe per DOC-36/47.

---

## 122. Large binary policy

The repository avoids committing large raw media/build artifacts without reason.

Public optimized assets required by the product may live in `public/` when appropriate.

Source media too large for ordinary Git should use an intentional asset workflow; do not accidentally create a multi-gigabyte repository history.

`node_modules`, build output, Playwright reports and generated temporary assets are ignored.

---

## 123. Git LFS

Git LFS is **not baseline-required**.

Adopt it only if real source asset sizes/history make ordinary Git unsuitable. Do not add LFS preemptively and then route routine web assets through unnecessary infrastructure.

---

## 124. Generated CV artifacts

DOC-37 remains authoritative:

```text
canonical facts
→ projection
→ RenderCV
→ PDF
```

Generated RenderCV PDFs are **build/CI/deployment artifacts and are not committed as editable Git sources**. CI validates both locales, builds the PDFs, verifies expected artifact names, and makes the generated output available to the site/deployment and as review artifacts where useful. Manual PDF editing is prohibited.

---

## 125. Database generated types

If Supabase/Postgres types are generated into the repository:

- their generation command is scripted;
- CI checks drift where useful;
- they are never manually edited;
- regeneration occurs with schema changes.

The exact generated-type strategy is an implementation detail under DOC-44/42 boundaries.

---

## 126. Schema/client contract drift

A migration changing a consumed DB/RPC shape must update:

- generated/static types as applicable;
- repository adapter;
- tests/contracts;
- affected application service;
- canonical documentation if the domain contract changes.

A green SQL migration with a broken TypeScript repository is not a successful change.

---

## 127. Release branch avoidance

Do not create permanent branches such as:

```text
dev
staging
production
release
```

solely to represent environments.

Environments are deployment/configuration concepts; Git branches are change-integration concepts.

Tags/releases identify shipped versions.

---

## 128. Environment promotion

We promote **a commit**, not manually reproduce changes.

The same reviewed Git SHA is the basis for Preview/Production release behavior, with environment-specific configuration.

Do not copy files from one branch/environment to another as a deployment method.

---

## 129. Staging introduction criterion

A persistent Staging environment is introduced only when DOC-48's stated needs become real:

- stable callback endpoint;
- prolonged Admin QA;
- migration rehearsal;
- soak testing;
- multi-step external integration validation.

If added, Staging receives its own credentials/data and deployment workflow. It is not Production with a different hostname.

---

## 130. Infrastructure-as-code boundary

V1.x does not require Terraform merely to configure one Vercel project, Supabase project and DNS zone.

Repository-tracked artifacts already include:

- migrations;
- app configs;
- workflow configs;
- environment inventory;
- runbooks;
- DNS records documentation.

Adopt broader IaC when drift/recreation complexity justifies it.

---

## 131. Manual provider configuration register

Infrastructure settings not naturally stored in Git are recorded in a readiness/operations document or runbook, including:

- canonical Vercel project/team;
- production domain;
- Supabase project/environment refs (non-secret identifiers only);
- DNS authority;
- required Auth redirect URLs;
- enabled GitHub repository rules/settings;
- backup policy;
- cron/jobs configured outside code if any.

This avoids configuration knowledge existing only in the operator's memory.

---

## 132. CI/CD changes are production changes

A PR modifying:

```text
.github/workflows/**
Vercel deployment config
Supabase deployment scripts
security scanning
release scripts
```

receives elevated review because it can alter how trusted code reaches production or what secrets are exposed.

Workflow YAML is executable infrastructure.

---

## 133. Deployment script safety

Deployment scripts should fail loudly on ambiguous environment selection.

A command capable of touching Production should verify environment/project identity before destructive work.

Avoid scripts where a missing variable silently defaults to Production.

---

## 134. Destructive local commands

Commands such as remote DB reset are never wrapped in deceptively easy generic aliases.

Good:

```text
pnpm db:reset
→ local only
```

A remote destructive operation should be named explicitly and protected, if it exists at all.

---

## 135. Release automation does not author product decisions

Automation may:

- validate;
- build;
- package;
- deploy;
- tag;
- publish approved release notes.

Automation may not infer that a project moved from `in-development` to `live`, that a feature is product-approved, or that a professional metric changed.

Those remain human/canonical decisions.

---

## 136. Automated changelog boundaries

Internal GitHub release notes may be generated/assisted from merged PRs.

The portfolio's user-facing Changelog remains curated and bilingual where exposed publicly.

Do not publish raw security fix descriptions before remediation/disclosure considerations are complete.

---

## 137. CI status in production UI

The public portfolio does not expose internal CI failures, repository secrets, branch names or deployment diagnostics as decorative “system status.”

DOC-30/31's System Status displays truthful public-safe service information only.

---

## 138. Developer experience metric

The DX system succeeds when a contributor can answer quickly:

```text
What is the source of truth?
What command validates this?
What environment am I touching?
What must pass before merge?
How does this reach production?
How do I roll it back?
```

If those answers require tribal knowledge, DOC-51 implementation is incomplete.

---

## 139. Definition of Ready for implementation

An issue is sufficiently ready when the implementer can identify:

- desired behavior;
- governing docs/ADR;
- acceptance criteria;
- relevant risks/boundaries;
- whether a design/decision is still open.

Do not force implementation to invent an unresolved product decision in code.

---

## 140. Definition of Done for a PR

Applicable checklist:

- acceptance criteria met;
- docs/ADR synchronized;
- code follows boundaries;
- tests added/updated;
- `verify:fast` and applicable STANDARD checks pass;
- content ES/EN synchronized when relevant;
- accessibility behavior verified;
- no secrets/PII added;
- migration/RLS included when relevant;
- Preview reviewed for visual material changes;
- observability/release effects considered;
- known follow-ups tracked.

---

## 141. Required repository artifacts before V0 implementation scales

Before major implementation begins, create:

```text
README.md
.env.example
.github/PULL_REQUEST_TEMPLATE.md
.github/ISSUE_TEMPLATE/*
.github/dependabot.yml
.github/workflows/*
scripts/validate-docs.*
scripts/generate-manifest.*
```

plus the approved source/application directories from DOC-41/42.

---

## 142. CI implementation order

Recommended bootstrap order:

```text
1. install/toolchain pinning
2. format/lint/typecheck
3. docs/content validation
4. unit/component tests
5. local Supabase + DB tests
6. production build
7. critical Playwright E2E
8. accessibility/security checks
9. visual/performance/deep suites
10. production migration/post-deploy workflows
```

Do not begin with a giant all-at-once workflow that is impossible to debug.

---

## 143. Prototype gates from earlier architecture become tracked issues

The prototype gates from DOC-42/DOC-43/DOC-44/etc. should become V0/V1 implementation issues with explicit evidence.

Examples:

- Dock at 320px + 200% zoom;
- intercepted Project Detail route;
- Widget Field Wide→Compact;
- Guestbook pending→approved;
- Sketch safe renderer;
- Arcade duplicate finalize;
- AAL2 Admin;
- restore drill.

Approving architecture does not mark the prototype gate as completed.

---

## 144. Branch cleanup

Merged task branches are deleted automatically/regularly.

Git history retains the work; stale branches should not become an unofficial archive of abandoned product states.

---

## 145. Release evidence

For a material release retain enough evidence to reconstruct:

- release/tag/SHA;
- required CI results;
- migration result;
- Vercel deployment identity;
- major manual gate completion;
- known exceptions;
- incident/rollback if applicable.

This can be lightweight GitHub/CI metadata rather than a manually assembled compliance binder.

---

## 146. External implementation notes

At the time of this specification, the proposed operating model aligns with current platform capabilities:

- GitHub repository rulesets/branch protections can require PRs and status checks, prevent force pushes/deletions and enforce other merge rules.
- GitHub recommends least-privilege `GITHUB_TOKEN` permissions and full-length commit SHA pinning for immutable Actions references.
- GitHub dependency review can block introduction of vulnerable dependency versions when available for the repository/plan.
- Vercel Git integration creates Preview deployments for non-production branches/PRs and Production deployments from the configured production branch.
- Supabase recommends migration-driven remote schema management and CI/CD for production migration deployment; `supabase db push` applies unapplied migrations and supports a dry-run preview.
- Supabase Branching can provide PR-specific backend environments when enabled; CLI-based migration workflows remain available without Branching.

Exact Action SHAs, Node/pnpm/framework versions and plan-dependent controls are intentionally selected/pinned during repository bootstrap rather than frozen in this architectural Markdown.

---

## 147. Initial workflow sketch

A representative PR topology is:

```text
Pull Request
     │
     ├── quality / fast
     │      ├─ format
     │      ├─ lint
     │      ├─ typecheck
     │      ├─ docs/content
     │      └─ unit focus
     │
     ├── quality / standard
     │      ├─ unit/component
     │      ├─ Supabase reset + pgTAP
     │      ├─ RenderCV verify
     │      ├─ production build
     │      ├─ critical Chromium E2E
     │      └─ a11y/security/budgets
     │
     ├── Vercel Preview
     │
     └── deep/risk-specific checks when applicable
             ↓
          MERGEABLE
```

Production:

```text
main merge
    │
    ├── Vercel Production
    │
    ├── production-db (serialized, when migrations exist)
    │
    └── post-deploy smoke
             ↓
        release observable
```

Correctness does not depend on Vercel and database jobs finishing in a fixed order because schema changes must preserve cross-version compatibility.
## Storybook in V0

The repository includes Storybook from V0. CI at minimum verifies that Storybook builds successfully. Stories are required for system primitives/components whose state matrix cannot be reviewed efficiently only through full pages. Storybook deployment to a public hosted URL is **not** required by the baseline.

## RenderCV generated-artifact repository policy

`public/cv/*.pdf` and generated preview artifacts are build outputs and are **not committed** in the V0/V1.x baseline. CI validates/renders both locales and attaches changed CV artifacts for review; the deployment build runs the same pinned RenderCV pipeline before the Next.js build packages public artifacts.

V0 bootstrap must prove the selected Vercel build image can run the pinned RenderCV toolchain reproducibly. If that gate fails, change the deployment artifact choreography deliberately; do not silently commit stale PDF binaries as a workaround.


---

## 148. Decision registry

| ID | Decision |
|---|---|
| RDX-001 | V1.x uses one Git repository and one application rather than a monorepo. |
| RDX-002 | Approved docs/ADRs and canonical content/configuration remain repository source-of-truth; generated artifacts never outrank source. |
| RDX-003 | Planning ZIP packages become handoff artifacts once the Git repository is active, not parallel editable sources. |
| RDX-004 | Node, pnpm and dependency state are deliberately pinned/versioned in repository metadata and lockfiles. |
| RDX-005 | CI uses deterministic frozen-lockfile installs. |
| RDX-006 | Local setup must be reproducible without undocumented global tool versions or Production access. |
| RDX-007 | `.env.example` contains safe variable names/descriptions only; real environment files/secrets are never committed. |
| RDX-008 | Development follows trunk-based Git centered on protected `main`. |
| RDX-009 | There is no permanent `develop` branch in V1.x. |
| RDX-010 | Task branches are short-lived and descriptive. |
| RDX-011 | Normal direct pushes to `main` are prohibited. |
| RDX-012 | Pull Requests are the atomic review boundary for implementation, docs, migrations and verification effects. |
| RDX-013 | Solo operation requires PR + checks + self-review, not a fictitious external approval requirement. |
| RDX-014 | If regular collaborators join, independent review requirements should be strengthened. |
| RDX-015 | Squash merge is the baseline merge strategy and main history remains linear. |
| RDX-016 | Conventional Commit-style intent is preferred for working commits but does not define the public changelog. |
| RDX-017 | GitHub Milestones map to DOC-02 release boundaries. |
| RDX-018 | Labels remain a small composable taxonomy rather than an exhaustive bureaucracy. |
| RDX-019 | A GitHub Project board is required in V0 as the execution view and never becomes a second requirements source. |
| RDX-020 | Approved architecture cannot be silently overridden by implementation; material changes require the canonical amendment/ADR path. |
| RDX-021 | Documentation contract changes are updated atomically with implementation. |
| RDX-022 | Documentation frontmatter/IDs/dependencies/index/manifest integrity are CI-validated. |
| RDX-023 | `MANIFEST.json` is generated, not manually maintained. |
| RDX-024 | Stable `pnpm` scripts are the shared human/CI/development-tool execution contract. |
| RDX-025 | Verification is tiered FAST/STANDARD/DEEP consistent with DOC-50. |
| RDX-026 | FAST covers cheap high-value static/content/unit feedback. |
| RDX-027 | STANDARD is required normal merge confidence and covers build, DB, critical E2E/a11y/security/budgets. |
| RDX-028 | DEEP covers expensive cross-browser/visual/performance/fuzz/resilience/security work and is risk/release/schedule driven. |
| RDX-029 | CI orchestration is split into purpose-specific workflows while domain logic lives in repository scripts. |
| RDX-030 | Fundamental invariants are not skipped solely due fragile path filtering. |
| RDX-031 | Stale PR workflow runs may be cancelled; production migration/deployment jobs are not blindly cancelled. |
| RDX-032 | `GITHUB_TOKEN` permissions are least privilege and read-only by default. |
| RDX-033 | GitHub/third-party Actions in trusted workflows are pinned to full commit SHAs where practical. |
| RDX-034 | Mutable Action branches such as `@main` are prohibited in production workflows. |
| RDX-035 | `pull_request_target` is prohibited by default for workflows executing untrusted PR content. |
| RDX-036 | Routine PR CI must not require Production secrets or live third-party providers. |
| RDX-037 | CI dependency caching is optimization only and never stores secrets or becomes a correctness source. |
| RDX-038 | PRs receive Vercel Preview deployments through Git integration. |
| RDX-039 | Preview success does not substitute for required quality gates. |
| RDX-040 | Preview environments never use Production database/secrets/runtime data. |
| RDX-041 | Vercel Deployment Protection may protect Previews but isolation remains mandatory even if a Preview URL leaks. |
| RDX-042 | Merge to `main` means production-eligible code; intentionally broken code must remain safely feature-gated. |
| RDX-043 | Vercel may deploy Production automatically from protected `main`. |
| RDX-044 | Production Supabase migrations are applied through CI/release automation rather than routine laptop deployment. |
| RDX-045 | Remote production schema edits outside migration history are prohibited. |
| RDX-046 | Migration PRs prove zero-reset, DB tests, RLS/grants and compatibility. |
| RDX-047 | Migrations are classified conceptually as ADDITIVE, DATA or CONTRACT for release-risk handling. |
| RDX-048 | Expand→migrate→contract is the mandatory breaking-schema evolution pattern. |
| RDX-049 | Production `db push` is serialized so migration jobs cannot race. |
| RDX-050 | App/DB deployment correctness cannot depend on deterministic completion order. |
| RDX-051 | Schema-dependent features remain backward-compatible or gated until required migrations succeed. |
| RDX-052 | Failed production migrations preserve existing Professional Core and are handled by diagnosis/forward fix, not blind reruns. |
| RDX-053 | Destructive CONTRACT migrations require explicit release review/backup awareness/manual authorization where appropriate. |
| RDX-054 | Production never applies development seed data. |
| RDX-055 | Migration-history/schema drift is investigated deliberately rather than normalized through ad-hoc Dashboard edits. |
| RDX-056 | Production deploys receive non-destructive post-deploy smoke verification. |
| RDX-057 | Application rollback and database restore are separate operational concepts. |
| RDX-058 | Public release tags follow SemVer-like versions aligned with DOC-02 release family. |
| RDX-059 | Public release tags are immutable. |
| RDX-060 | Hotfixes normally use focused PRs from current main; break-glass direct push is last resort. |
| RDX-061 | Feature/release gating stays small/local and supports unreleased Dock spaces, schema readiness and incident disablement. |
| RDX-062 | CI secrets are scoped to environment/job and PR verification receives no Production secrets. |
| RDX-063 | Secret inventory includes purpose/environment/owner/rotation/consumers. |
| RDX-064 | Secret rotation follows create/update/verify/revoke ordering. |
| RDX-065 | Dependabot is the baseline dependency automation; Renovate is deferred until policy complexity justifies it. |
| RDX-066 | Security dependency updates are triaged promptly, routine patch/minor updates may be grouped weekly, majors are intentional. |
| RDX-067 | Dependency PRs consider bundle/runtime/license/security/toolchain impact, not only lockfile success. |
| RDX-068 | Dependency review/Dependabot/secret scanning/code scanning are enabled where plan/repository capabilities permit. |
| RDX-069 | Paid GitHub security features are useful enhancements, not silent baseline correctness dependencies. |
| RDX-070 | New dependencies require an explicit maintenance/security/bundle rationale. |
| RDX-071 | GitHub repository settings/rules are part of operational readiness and are documented. |
| RDX-072 | CI diagnostic artifacts are bounded and contain no secrets/production PII. |
| RDX-073 | Production source maps may be privately uploaded to observability under matching release identity. |
| RDX-074 | CI feedback time is treated as a DX budget; redundant high-level checks are optimized before critical controls are removed. |
| RDX-075 | Browser/environment matrices remain curated rather than Cartesian. |
| RDX-076 | Scheduled workflows run selected expensive/security/deep checks and material failures remain visible. |
| RDX-077 | Routine CI uses fixtures/adapters instead of live-provider correctness dependencies. |
| RDX-078 | Production visitor/runtime data never becomes routine CI fixture data. |
| RDX-079 | Developers normally run `verify:fast` before push and `verify:standard` before final merge of material work. |
| RDX-080 | Git hooks are optional feedback conveniences and never replace CI correctness. |
| RDX-081 | Formatting is deterministic and unrelated mass-format churn is separated from functional changes. |
| RDX-082 | TypeScript remains strict; unsafe exceptions stay local/justified/validated. |
| RDX-083 | Lint/architecture tooling should encode high-value boundaries such as server/client/provider/storage rules. |
| RDX-084 | Material deferred TODOs are specific and traceable. |
| RDX-085 | Abandoned experiments do not remain as production dead/commented code. |
| RDX-086 | Tool-specific operator instruction files remain local/untracked; DOC-19 is the committed tool-neutral governance source. |
| RDX-087 | Implementation tooling begins material tasks by reading ADRs/authority/domain docs before guessing from code. |
| RDX-088 | Implementation tooling makes small coherent changes, preserves boundaries, updates tests/docs and reports uncertainty rather than inventing. |
| RDX-089 | Tool-assisted completion reports truthfully list checks run, docs/migration/security impacts and unresolved limitations. |
| RDX-090 | Generated/tool-produced code receives the same review standard as any other code. |
| RDX-091 | Tool-proposed dependencies require rationale before installation. |
| RDX-092 | Tool-produced migrations never deploy Production schema directly or casually rewrite applied history. |
| RDX-093 | Development tooling never requests/commits real secrets when placeholders/environment setup suffice. |
| RDX-094 | Development tooling never invents canonical professional facts. |
| RDX-095 | Tool-assisted visual implementation must read approved interface/visual contracts, not approximate screenshots alone. |
| RDX-096 | Development tooling cannot “fix” tests by deleting/loosening/masking them without contract justification. |
| RDX-097 | Local development/runtime data is synthetic. |
| RDX-098 | Local/CI Admin identities/factors are isolated from Production Admin credentials. |
| RDX-099 | Preview UGC cannot leak into Production runtime tables. |
| RDX-100 | Preview Contact cannot silently send as Production behavior/recipient. |
| RDX-101 | Preview/local analytics do not pollute Production analytics. |
| RDX-102 | Observability differentiates environment and correlates source maps with release identity. |
| RDX-103 | Safe build metadata correlates Git SHA, release and deployment without exposing secrets. |
| RDX-104 | Material public releases follow the DOC-51 release-readiness checklist. |
| RDX-105 | Release-specific V1.0/V1.2/V1.3/V1.4 gates activate with DOC-02 functionality. |
| RDX-106 | Quality exceptions are narrow, visible, owned and time-bounded. |
| RDX-107 | CI outages default to waiting; emergency break-glass preserves local evidence and backfills normal traceability. |
| RDX-108 | Provider deployment outages do not justify improvised unreviewed infrastructure changes. |
| RDX-109 | Supabase outage delays/schema-gates dependent releases rather than risking incompatible production. |
| RDX-110 | GitHub/repository access is protected as a Tier-0 operational asset. |
| RDX-111 | Repository privacy never substitutes for secret hygiene. |
| RDX-112 | Large binaries/build outputs are controlled and not casually committed; Git LFS is deferred until real need. |
| RDX-113 | RenderCV PDFs/generated DB types are generated artifacts and are never manually edited. |
| RDX-114 | DB/RPC schema changes update client/repository contracts and tests atomically. |
| RDX-115 | Environments are not represented by long-lived `dev/staging/production` Git branches. |
| RDX-116 | Environments promote reviewed commits/configuration, not manual file copying. |
| RDX-117 | Persistent Staging is introduced only when approved operational needs justify it. |
| RDX-118 | Terraform/broader IaC is deferred until manual-provider drift/recreation complexity justifies it. |
| RDX-119 | Non-Git provider configuration is recorded in a public-safe operations/readiness register. |
| RDX-120 | CI/CD workflow/config changes are treated as production-capable infrastructure changes. |
| RDX-121 | Deployment scripts fail on ambiguous environment identity and never default missing values to Production. |
| RDX-122 | Destructive remote commands are explicit/protected; ordinary aliases target local environments. |
| RDX-123 | Automation validates/deploys approved state but never authors product/professional decisions. |
| RDX-124 | Public Changelog remains curated/bilingual rather than raw automated commit output. |
| RDX-125 | Public System Status does not expose internal CI/branch/deployment diagnostics. |
| RDX-126 | DX success requires clear answers for authority, validation, environment, merge, deploy and rollback. |
| RDX-127 | Definition of Ready prevents unresolved product decisions from being invented in implementation. |
| RDX-128 | Definition of Done includes acceptance, docs, tests, accessibility, secrets, migration and Preview impacts as applicable. |
| RDX-129 | V0 repository bootstrap includes README, env example, PR/issues, Project, Wiki, dependency automation, workflows and docs tooling. |
| RDX-130 | CI is introduced incrementally in a diagnosable order rather than as one giant workflow. |
| RDX-131 | Approved architecture prototype gates become tracked implementation evidence; architecture approval does not mark them complete. |
| RDX-132 | Merged task branches are cleaned up rather than becoming an unofficial archive. |
| RDX-133 | Material release evidence correlates SHA, CI, migration, deployment, manual gates and exceptions. |
| `RDX-134` | Storybook is installed in V0 and its build is a CI quality check. |
| `RDX-135` | RenderCV PDF binaries are generated in CI/deployment and are not committed in the baseline repository. |
| `RDX-136` | After audit clearance, repository/project-operations bootstrap is completed before normal feature code begins. |
| `RDX-137` | `/docs` remains canonical; GitHub Wiki is required as a summary/help/navigation layer and never a second specification source. |
| `RDX-138` | Implementation Issues default to Alejandro as accountable human assignee unless another human collaborator is explicitly assigned. |
| `RDX-139` | Development tools/generators/automation receive no creative authorship or co-authorship credit in repository-visible or public project surfaces. |
| `RDX-140` | Permanent tool-provenance phrases, co-author trailers, badges and equivalent attribution metadata are prohibited. |
| `RDX-141` | Tool-specific operator configuration remains untracked/local and is not committed as project provenance. |
## 148A. Pre-code repository bootstrap sequence

After the final consistency audit clears the implementation gate, **repository/project operations are created before feature code**. This is part of V0 Foundation, not an administrative afterthought.

Canonical sequence:

1. create the GitHub repository with `main` as the only long-lived branch;
2. commit the approved documentation package, root README, `.env.example`, license decision and governance files; keep tool-specific local instruction files untracked;
3. configure repository Ruleset/required checks and merge policy before normal feature work;
4. create the GitHub Project board and workflow fields/statuses;
5. create milestones `V0`, `V1.0`, `V1.1`, `V1.2`, `V1.3`, `V1.4`;
6. create the curated label taxonomy (`type:*`, `area:*`, `risk:*`, `priority:*`, `status:*`, `release:*` where useful);
7. create Issue Forms/templates and the Pull Request template;
8. decompose approved requirements/prototype gates into epics/issues, assign them to Alejandro by default, and link them to milestones/project views;
9. create the GitHub Wiki with the approved summary/help/navigation structure and links back to `/docs`;
10. configure dependency/security automation and Preview wiring;
11. only then open the first short-lived implementation branch for the V0 application bootstrap.

Rules:

- do **not** create a permanent `develop`, `staging` or per-release branch unless a later documented need justifies one;
- the GitHub Wiki is **required but non-canonical**; `/docs` remains authoritative. The Wiki contains concise summaries, onboarding/help and links to versioned repository docs, never independent product/architecture decisions;
- GitHub Project is the execution view; Issues are the atomic work records and default to Alejandro as human assignee; Milestones are release/gate groupings; Markdown docs/ADRs remain the specification and decision source of truth;
- no issue may silently override an approved architecture decision; change requests follow DOC-00 authority/ADR rules.

This bootstrap sequence is required before normal feature coding, although small throwaway prototype spikes may occur only where an approved V0 prototype gate explicitly calls for them.


---

## 149. Implementation gates

Before DOC-51 can be considered implemented (not merely approved architecturally), verify:

### Gate RDX-G1 — Fresh clone

A clean machine/repository clone can install, configure safe local env, start local Supabase and run the app using documented commands.

### Gate RDX-G2 — Protected `main`

A test PR cannot merge while a required check fails; direct force-push/delete is blocked under normal permissions.

### Gate RDX-G3 — Deterministic CI

FAST/STANDARD pass on a clean runner without Production credentials or live-provider dependency.

### Gate RDX-G4 — Preview isolation

A PR Preview proves it does not use Production Supabase, Production analytics or Production email behavior.

### Gate RDX-G5 — Migration lifecycle

An additive sample migration applies from zero, passes pgTAP, deploys through the non-production/production mechanism, and cannot race a second production migration run.

### Gate RDX-G6 — Cross-version compatibility

A representative schema-dependent feature demonstrates application-old/schema-new and application-new/schema-old-safe/gated behavior as applicable.

### Gate RDX-G7 — Action security

Trusted workflows show least-privilege permissions, immutable Action pins and no unsafe privileged execution of PR code.

### Gate RDX-G8 — Dependency automation

Dependabot creates expected ecosystem/Actions update PRs and security alerts reach the operator.

### Gate RDX-G9 — Tool-assisted implementation workflow

A representative tool-assisted task follows authority → plan → implementation → tests/docs → truthful completion reporting without touching Production or creating tool authorship attribution.

### Gate RDX-G10 — Release rehearsal

A V0 rehearsal reaches Preview, merge, Production, post-deploy smoke and rollback using documented commands/runbooks, with release/SHA correlation visible in observability/deployment metadata.

---

## 150. Accepted baseline

DOC-51 is approved with the following accepted baseline:

1. `main` is protected trunk and all normal work flows through short-lived PR branches;
2. CI is tiered FAST/STANDARD/DEEP and uses stable repository commands shared with developers and local development tooling;
3. Vercel Git integration handles Preview/Production while Preview remains isolated from Production secrets/data;
4. Supabase migrations are Git/CI-controlled, serialized and backward-compatible through expand→migrate→contract;
5. production correctness never depends on Vercel and DB deployment finishing in a fixed order;
6. GitHub Actions follow least privilege and immutable Action pinning practices;
7. Dependabot is the baseline dependency automation;
8. release tags/versioning map to the approved V1.x roadmap;
9. DOC-19 governs implementation tooling; tool-specific local instructions stay untracked, and tooling cannot silently change architecture, facts, tests, Production state or project authorship metadata;
10. repository process remains intentionally lightweight and only gains merge queue, staging, monorepo, Terraform or heavier governance when measured need appears.

Approval of DOC-51 closes the planned DOC-41–DOC-51 Technical Architecture specification set. Implementation may then begin from V0 Foundation using the approved documents as the source of truth, subject to a final cross-document technical consistency review if desired before code bootstrap.
