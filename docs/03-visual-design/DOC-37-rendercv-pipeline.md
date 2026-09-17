---
id: DOC-37
title: "RenderCV Pipeline"
document_status: APPROVED
canonical_format: markdown
phase: "Visual Design Foundation"
folder: 03-visual-design
cross_cutting: true
domain: "CV Build Pipeline"
depends_on:
  - DOC-09
  - DOC-10
  - DOC-17
  - DOC-18
  - DOC-19
  - DOC-31
  - DOC-35
  - DOC-36
decision_families:
  - CVP
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-37 — RenderCV Pipeline

> **Purpose:** Define a reproducible bilingual CV generation pipeline in which public professional facts originate from canonical portfolio data and RenderCV produces versioned, validated PDF artifacts without manual PDF maintenance.

---

## 1. Pipeline thesis

The public CV is a generated projection of canonical professional data, not an independently maintained document.

> **Canonical professional facts → CV projection → RenderCV source → validation → generated artifacts → portfolio delivery.**

The pipeline must make it harder to publish inconsistent, stale or invented professional information than to publish correct information.

---

## 2. Core invariants

The following are mandatory:

1. The PDF is never edited manually.
2. English and Spanish CVs share one structural model and one design system.
3. Professional facts come from DOC-36 canonical sources where they overlap with the portfolio.
4. Localized narrative may differ editorially, but may not contradict canonical facts.
5. RenderCV is version-pinned in the project environment.
6. Both locales are validated before either public artifact is considered releasable.
7. Generated artifacts are reproducible from repository sources.
8. A failed CV build does not prevent the rest of the portfolio from being developed locally, but it blocks a release that changes CV inputs.
9. Development tooling must never invent dates, titles, employers, certifications, metrics or technologies to satisfy a template.
10. Public-safe data rules apply before content reaches RenderCV.

---

## 3. Source-of-truth boundary

DOC-36 remains authoritative for shared professional facts.

```text
content/canonical/*
        │
        ├── Portfolio projections
        │
        └── CV projection builder
                 │
                 ▼
             cv/source/*
                 │
                 ▼
              RenderCV
                 │
        ┌────────┴────────┐
        ▼                 ▼
      EN PDF            ES PDF
```

RenderCV source files are treated as **build inputs/projections**, not a second professional database.

---

## 4. Proposed repository structure

```text
cv/
├── README.md
├── source/
│   ├── cv.en.yaml
│   └── cv.es.yaml
├── design/
│   └── portfolio-theme.yaml
├── locale/
│   ├── en.yaml
│   └── es.yaml
├── settings/
│   └── settings.yaml
├── generated/
│   └── .gitkeep
└── scripts/
    ├── project-cv-content.*
    ├── validate-cv.*
    ├── build-cv.*
    └── verify-artifacts.*

public/
└── cv/
    ├── Alejandro-Osorno-CV-EN.pdf
    ├── Alejandro-Osorno-CV-ES.pdf
    └── previews/
        ├── en/
        └── es/
```

Exact script language is a technical implementation decision. The repository-level contract is what matters.

---

## 5. Canonical input domains

The CV projection may consume, where public and selected:

```text
Profile
Public links
Experience
Education
Certifications
Languages
Core skills
Selected project highlights
Verified professional metrics
```

It must not directly consume:

```text
Guestbook content
Sketch Wall content
Arcade scores
visitor achievements
private contact submissions
unreviewed GitHub activity
raw external feeds
private client information
```

---

## 6. Projection layer

A dedicated projection step converts canonical content into the structure expected by the CV source.

Responsibilities include:

- selecting which canonical records appear in the CV;
- ordering experience and education;
- selecting CV-safe skill groups;
- applying locale-specific narrative;
- formatting dates without changing their meaning;
- omitting private fields;
- attaching verified links;
- rejecting missing required facts;
- ensuring stable record identifiers remain traceable during generation.

The projection layer is the correct place for CV-specific selection. It must not mutate the canonical source.

---

## 7. Locale model

Two public CV outputs exist:

```text
English
Spanish
```

They share:

```text
record identities
chronology
dates
organizations
credentials
verified metrics
links
section architecture
design tokens
```

They may differ in:

```text
role-title translation where semantically correct
summary prose
project descriptions
skill category labels
section labels
natural-language date presentation
```

Semantic parity is required; literal sentence parity is not.

---

## 8. Structural parity validation

The validation step should compare locale projections and detect accidental drift.

Examples of failures:

```text
experience record exists in EN but not ES
same record has different date range
certification ID differs between locales
public link exists only because one YAML was manually edited
verified metric value differs across locales
```

Intentional locale-specific omission requires explicit metadata/rationale rather than silent divergence.

---

## 9. RenderCV design boundary

The CV should visually relate to the portfolio without becoming a screenshot of it.

Shared identity may include:

```text
Manrope-based typographic sensibility where compatible
precise spacing
clean hierarchy
restrained use of system accent
consistent naming and metadata style
```

The PDF must prioritize:

```text
printability
readability
professional credibility
simple scanning
high contrast
reasonable ATS compatibility
```

It should not import:

```text
Liquid Glass backgrounds
DynamicBackdrop
large environmental artwork
Widget Field layout
animation-dependent meaning
custom Dock navigation
low-contrast translucent text
```

The portfolio presents the CV; the PDF remains a professional document.

---

## 10. Public-safe data policy

CV generation must exclude by default:

- street address;
- government identifiers;
- personal account identifiers;
- private client contact details;
- private references;
- secrets or credentials;
- internal URLs;
- confidential project names/details;
- phone number unless intentionally approved for public distribution.

A field being present in a private authoring source does not make it eligible for the public CV.

---

## 11. Verified metrics

Metrics included in the CV must satisfy DOC-36 evidence rules.

Examples:

```text
reduced processing time by X%
served N users
integrated N systems
managed N projects
```

A metric may be included only when its value and context are defensible.

If evidence is insufficient, use a qualitative statement rather than manufacturing precision.

---

## 12. Project-level commands

The repository should expose stable package-level commands regardless of the underlying RenderCV CLI syntax:

```text
pnpm cv:project
pnpm cv:validate
pnpm cv:build
pnpm cv:preview
pnpm cv:verify
```

Meaning:

- `cv:project` — generate/update RenderCV source projections from canonical data;
- `cv:validate` — validate both locale projections and project rules;
- `cv:build` — generate the public artifacts for both locales;
- `cv:preview` — developer convenience for reviewing current output;
- `cv:verify` — assert expected artifacts exist and satisfy release checks.

The exact internal implementation may call Python/RenderCV directly, but contributors and implementation tooling use the stable repository commands.

---

## 13. Build sequence

Canonical pipeline:

```text
1. Validate canonical professional data
2. Build EN/ES CV projections
3. Compare structural parity
4. Validate public-safe fields
5. Run RenderCV validation
6. Render EN
7. Render ES
8. Verify expected files
9. Produce preview assets if enabled
10. Publish/copy artifacts to public/cv
```

No step may silently repair factual discrepancies by inventing content.

---

## 14. Deterministic outputs

The pipeline should minimize sources of nondeterminism.

Pin:

```text
RenderCV version
Python/tooling version where practical
project scripts
font/design dependencies required by the CV pipeline
```

Generated output metadata that changes on every run without content changes should be avoided where the toolchain permits it.

This improves reproducibility and prevents noisy diffs.

---

## 15. Generated-file policy

Generated PDFs and preview assets are not manually editable sources.

Each generated artifact should have a clear header/source rule in documentation:

> Generated from canonical content and RenderCV configuration. Do not edit manually.

If the PDF is wrong, fix:

```text
canonical data
localized narrative
projection logic
RenderCV design/settings
```

and rebuild.

---

## 16. Version control policy

Recommended policy:

- source/config/scripts: versioned;
- public release PDFs: versioned when useful for deterministic deployment and review;
- temporary intermediate RenderCV files: ignored;
- local preview scratch files: ignored;
- generated preview images: versioned only if required by the deployed portfolio strategy.

Generated PDF binaries are **not committed to Git** in the V0/V1.x baseline. Canonical CV/content/design sources are committed; `pnpm cv:build` generates EN/ES PDFs during local review and the authoritative CI/deployment build. CI exposes generated PDFs as review artifacts when CV inputs change. A future change to commit generated binaries requires explicit Engineering Platform change control.

---

## 17. CI validation

A PR touching any of the following should trigger the CV pipeline:

```text
content/canonical/**
relevant localized professional content
cv/**
CV projection scripts
CV design/settings
```

CI should at minimum:

```text
install pinned CV toolchain
run canonical content validation
project EN + ES
run parity checks
run RenderCV validation
render both CVs
verify expected artifacts
fail on factual/schema inconsistencies
```

A change to Experience should not be mergeable while only one locale's CV is valid.

---

## 18. CI artifact review

For pull requests that modify CV output, CI should make generated PDFs available as review artifacts where the platform allows.

This enables a human reviewer to inspect:

```text
page breaks
overflow
unexpected wrapping
visual hierarchy
language-specific expansion
broken links
missing sections
```

Schema validity is necessary but not sufficient for a professional CV.

---

## 19. Preview generation

The public portfolio should not rely on squeezing a desktop PDF viewer into a phone.

Potential preview strategy:

```text
Generated PDF
     │
     ├── desktop PDF/page preview
     │
     └── optional generated page images
             ↓
        Compact CV preview
```

Preview images are derivatives of the generated PDF, never independent design sources.

The exact PDF/image rendering implementation is deferred to technical prototyping.

---

## 20. Public artifact names

Stable public names:

```text
/public/cv/Alejandro-Osorno-CV-EN.pdf
/public/cv/Alejandro-Osorno-CV-ES.pdf
```

Stable filenames are useful for bookmarks, recruiter links and metadata.

If historical snapshots are ever exposed, versioned filenames belong to a separate archive strategy rather than changing the main public URL on every release.

---

## 21. CV route contract

`/[locale]/cv` consumes generated artifacts and metadata.

It should expose:

```text
current language
switch language
preview
open/view action where appropriate
download
last content update date
```

It should not generate the CV in the browser.

The web route remains available even if a preview renderer fails; direct PDF actions should remain usable when artifacts exist.

---

## 22. Language behavior

From `/en/cv`:

```text
primary preview = EN
primary download = EN
secondary language action = ES
```

From `/es/cv`:

```text
primary preview = ES
primary download = ES
secondary language action = EN
```

Changing site language while on the CV route preserves the CV context.

---

## 23. CV metadata

The pipeline should expose machine-readable build metadata to the portfolio, for example conceptually:

```text
locale
artifact path
content revision
content updated date
build status
page count if reliably available
```

The UI should not claim a last-updated date based merely on deployment time if the CV content did not change.

---

## 24. Failure model

### Projection failure

Block the CV build and show actionable diagnostics.

### One locale invalid

Neither locale is considered a complete release candidate until parity/validation succeeds.

### Render failure

Keep the last known-good public artifact during deployment rather than publishing a partial/broken replacement where deployment architecture supports this.

### Preview generation failure

Do not invalidate a correct PDF if preview images are an optional derivative; fall back to direct PDF/view/download behavior.

---

## 25. Content freshness

CV freshness is author-controlled, not inferred from GitHub activity.

A professional fact changes only when the canonical source is updated intentionally.

`Currently Building` and Dev Log do not automatically become CV bullets.

---

## 26. CV selection policy

The CV is a projection, not an exhaustive database dump.

It may select:

```text
most relevant projects
core skills
selected achievements
concise experience bullets
```

while the portfolio contains deeper case studies.

Omission for relevance is allowed. Contradicting facts is not.

---

## 27. Page-count philosophy

The pipeline should support concise professional output rather than force every canonical record into the PDF.

The target page count is a content/editorial decision informed by the user's career stage and target roles, not a hard architecture constant.

The system should make it easy to keep the document concise through projection rules rather than tiny typography.

---

## 28. Links

Public links included in the CV should be validated for:

```text
HTTPS where applicable
public reachability assumptions
no private tokens/query secrets
stable labels
correct locale-independent destination where appropriate
```

QR codes are not a baseline requirement.

---

## 29. Accessibility and PDF quality

Where supported by the toolchain, the CV design should preserve:

```text
logical reading order
actual text rather than flattened images
clear headings
sufficient contrast
meaningful link text
print readability
```

The web CV route remains responsible for web accessibility independently of PDF accessibility support.

---

## 30. ATS considerations

The CV should avoid design choices known to make machine parsing unnecessarily difficult.

Baseline approach:

```text
real text
clear section labels
conventional chronology
restrained layout complexity
no essential information represented only by icons
```

The portfolio can be visually experimental; the CV does not need to prove the same point twice.

---

## 31. Security model

RenderCV runs as a build-time tool, not as a public arbitrary-document generation service.

Public visitors cannot submit YAML/templates to the pipeline.

CI/build inputs are repository-controlled.

No secrets should be required in source CV content. If CI credentials are ever needed for unrelated deployment steps, they remain outside RenderCV source files.

---

## 32. Dependency/supply-chain rules

RenderCV and any supporting renderer are third-party build dependencies and therefore must follow project dependency governance:

```text
version pinning
upgrade review
changelog review
CI verification
license review
vulnerability monitoring where applicable
```

Upgrades that materially change output should include visual review of both locales.

---

## 33. Local developer workflow

Expected workflow after changing a professional fact:

```text
edit canonical source
↓
pnpm cv:project
↓
pnpm cv:validate
↓
pnpm cv:preview
↓
review EN + ES
↓
pnpm cv:build
```

CI performs the authoritative validation again.

---

## 34. Implementation-tool rules

Implementation tooling must follow these rules when touching CV content:

```text
- Read DOC-36 and DOC-37 first.
- Never edit generated PDFs manually.
- Never invent missing professional facts.
- Update canonical data before generated projections when a shared fact changes.
- Keep EN/ES structurally synchronized.
- Preserve explicit privacy/public-safe rules.
- Run CV validation after relevant changes.
- Build both locales, not only the one requested in a code task.
- Do not change RenderCV version or design pipeline casually.
- Treat generated-artifact differences as reviewable outputs, not truth sources.
```

---

## 35. Review checklist

A CV-related PR is not complete until relevant checks answer yes:

```text
Are shared facts sourced canonically?
Are EN and ES semantically aligned?
Were any metrics added with evidence?
Are public-safe fields respected?
Did both projections validate?
Did both PDFs render?
Were layout/page breaks reviewed?
Are links correct?
Were generated files left unedited by hand?
Does the public /cv route still work responsively?
```

---

## 36. Future extensions

Possible later additions that do not alter the baseline:

```text
role-targeted CV projections
public version history
one-click recruiter-specific export
additional language
automated link checker
visual PDF regression snapshots
signed release artifacts
```

Each requires explicit product justification before implementation.

---

## 37. Out of scope

DOC-37 does not decide:

```text
exact RenderCV version number
exact internal RenderCV CLI flags
final CV wording
final page count
how the Vercel/CI build image supplies the pinned RenderCV toolchain while preserving the approved generate-at-build/no-committed-PDF contract
exact PDF-preview renderer
role-specific CV variants
```

Those can be decided without changing the canonical-source architecture.

---

## DOC-37 — Decision Registry

| ID | Decision |
|---|---|
| `CVP-001` | All public CV PDFs are generated through RenderCV rather than manually maintained |
| `CVP-002` | Canonical professional data remains the source of truth for shared facts |
| `CVP-003` | EN and ES CVs share structure/design and require semantic parity |
| `CVP-004` | CV-specific selection occurs in a projection layer without mutating canonical data |
| `CVP-005` | RenderCV/toolchain versions are pinned and upgrades reviewed |
| `CVP-006` | Project-level `pnpm cv:*` commands provide a stable developer interface |
| `CVP-007` | Validation and rendering always cover both locales |
| `CVP-008` | Generated PDFs are never manually edited |
| `CVP-009` | Public-safe/privacy filtering happens before generation |
| `CVP-010` | Development tooling may not invent professional facts to satisfy CV templates |
| `CVP-011` | Verified metrics require evidence inherited from DOC-36 |
| `CVP-012` | CV design is related to the portfolio but prioritizes print/readability/ATS practicality over Liquid Glass expression |
| `CVP-013` | Stable public artifact filenames are used for EN and ES |
| `CVP-014` | `/[locale]/cv` consumes generated artifacts; it does not generate CVs in the browser |
| `CVP-015` | Compact CV UX must not depend on squeezing a desktop PDF viewport |
| `CVP-016` | Preview assets, when used, are derivatives of generated PDFs |
| `CVP-017` | CI is triggered by changes to canonical professional data, CV sources, scripts or design settings |
| `CVP-018` | CV-affecting CI validates, renders and verifies both locales |
| `CVP-019` | Human visual review remains required for layout quality despite schema validation |
| `CVP-020` | Last-updated metadata reflects content revision rather than arbitrary deployment time |
| `CVP-021` | A preview failure may degrade gracefully without invalidating an otherwise correct PDF |
| `CVP-022` | Dev Log/GitHub activity never automatically becomes CV content |
| `CVP-023` | CV projection may omit canonical records for relevance but may not contradict them |
| `CVP-024` | RenderCV is build-time tooling, never an arbitrary public document-generation endpoint |
| `CVP-025` | Dependency/license/security governance applies to the CV toolchain |
| `CVP-026` | Implementation tooling must consult DOC-36 and DOC-37 before CV changes |
| `CVP-027` | Future role-specific or additional-language variants require explicit product decisions |

---

## 38. Change-control gate

DOC-37 is ready for approval when the project accepts:

```text
canonical facts
→ deterministic bilingual projections
→ pinned RenderCV pipeline
→ validated EN + ES artifacts
→ responsive web delivery
```

without creating an independent CV source of truth.
