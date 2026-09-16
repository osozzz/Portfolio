---
id: DOC-36
title: "Content Architecture & Canonical Professional Data"
document_status: APPROVED
canonical_format: markdown
phase: "Visual Design Foundation"
folder: 03-visual-design
cross_cutting: true
domain: "Content Architecture"
depends_on:
  - DOC-00
  - DOC-01
  - DOC-02
  - DOC-03
  - DOC-04
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
  - DOC-33
  - DOC-34
  - DOC-35
  - ADR-001
decision_families:
  - CNT
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-36 — Content Architecture & Canonical Professional Data

> **Purpose:** Define the source-of-truth model for professional facts, project case studies, localized content and content projections consumed by the portfolio, RenderCV, SEO, Channel and other public surfaces without duplicating or inventing information.

---

## 1. Content thesis

The portfolio is not only a visual shell. It is a public representation of Alejandro's real work, experience and capabilities. Therefore content must be modeled with the same discipline as application state.

The governing rule is:

> **Facts are canonical once; surfaces render projections of those facts.**

The portfolio, CV, metadata, project cards, timelines and future public exports must not each maintain independent copies of the same professional claim.

This document separates **facts**, **localized narrative**, **visual presentation**, **dynamic external data** and **visitor-generated content** so that one category cannot silently become another.

---

## 2. Content classes

All content belongs to one of five classes.

| Class | Examples | Authority |
|---|---|---|
| `CANONICAL_FACT` | role, employer, dates, education, certification, skill, public link | repository-owned canonical data |
| `CURATED_NARRATIVE` | project problem, solution, challenge, lesson, Making Of note | authored localized content |
| `MANAGED_STATUS` | Currently Building/current-work update, availability, operational status | explicitly maintained portfolio state; repository-authored in the approved V1.x baseline unless a future ADR migrates a specific field to runtime storage |
| `EXTERNAL_DYNAMIC` | GitHub activity, Tech Pulse source item | normalized/cache layer; never professional source of truth |
| `UGC` | Guestbook entries, approved sketches, reactions | database/moderation system |

These classes may be displayed together, but their ownership and truth guarantees remain separate.

---

## 3. Canonical professional source of truth

The canonical professional dataset should own facts that may appear in more than one surface.

Baseline domains:

```text
Profile
Contact/Public Links
Experience
Education
Certifications
Languages
Skills/Technologies
Projects
Professional Highlights
Availability/Public Status
```

The following should **not** be maintained independently in both Portfolio and CV:

```text
role names
organization names
dates
education facts
certification facts
language proficiency
public professional links
core skill names
selected verified metrics
```

A surface may omit a fact or present it differently, but it should not redefine it.

---

## 4. Facts versus narrative

A fact answers questions such as:

```text
Where did Alejandro work?
What was the role?
When did it happen?
Which certification was earned?
Which technologies were used?
```

A narrative answers:

```text
What problem was being solved?
Why did the architecture take this shape?
What trade-off mattered?
What was learned?
```

Facts should be structured.

Narrative may be authored in richer localized Markdown/MDX-like content where it improves readability.

This prevents long prose from becoming an unmaintainable YAML object while preserving structured reuse where it matters.

---

## 5. No invented professional claims

A hard content rule:

> **The build system, development tooling and content transformations must never invent dates, roles, certifications, metrics, employers, technologies, clients or outcomes.**

When information is unknown, use one of:

```text
unknown / omitted
TBD in authoring workflow
qualitative description
explicitly approximate wording if factually justified
```

Never fill a blank with a plausible value simply to complete a layout.

Implementation tooling receives this as a hard rule.

---

## 6. Stable identifiers

Canonical records require stable IDs independent from labels and translations.

Examples:

```yaml
id: exp-vision-tecno
id: edu-eafit-systems-engineering
id: cert-example-provider-2026
id: skill-typescript
id: project-dex-sphere
```

Rules:

- IDs are machine-stable and locale-independent.
- Renaming visible content does not change the ID.
- Relationships use IDs, not display strings.
- Slugs may change through explicit redirects; IDs should almost never change.
- IDs are not database secrets and may be public where useful.

---

## 7. Canonical profile model

Conceptual contract:

```yaml
profile:
  id: alejandro-osorno
  display_name: Alejandro Osorno
  short_name: Alejandro
  professional_headline:
    en: ...
    es: ...
  location_public:
    enabled: true|false
    label:
      en: ...
      es: ...
  availability_status_id: ...
  public_links: [...]
```

Only public-safe information belongs here.

A precise home address, personal IDs, private phone numbers, private references or non-public employer/client information are never canonical public profile data.

---

## 8. Contact and public links

Public links are structured records rather than hard-coded footer strings.

```yaml
- id: github
  kind: github
  label: GitHub
  url: ...
  publication_state: published
  visibility: public
  privacy_class: PUBLIC
  order: 10
```

Potential kinds:

```text
email
github
linkedin
website
repository
live_demo
credential
other
```

Contact form submission data is **not** canonical professional content and never feeds the profile automatically.

---

## 9. Experience model

Each experience record should support:

```yaml
id: exp-...
organization: ...
role:
  en: ...
  es: ...
start_date: YYYY-MM
end_date: YYYY-MM | null
current: true|false
location_mode: onsite | hybrid | remote | mixed | null
public_location: ... | null
summary:
  en: ...
  es: ...
highlight_ids: [...]
technology_ids: [...]
related_project_ids: [...]
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

Rules:

- Dates use structured values, not localized strings.
- `current` and `end_date` must remain logically consistent.
- Portfolio copy may be richer than CV copy.
- Client names are only public if intentionally approved.
- Confidential project detail must be abstracted rather than leaked through examples/screenshots.

---

## 10. Professional highlights and evidence

Claims such as:

```text
reduced processing time by X%
served N users
built N integrations
increased performance by X
```

need an evidence classification.

Proposed field:

```yaml
evidence_level: verified | supported | qualitative
```

Meaning:

- `verified`: a defensible exact metric exists.
- `supported`: approximate/range claim has reasonable source support.
- `qualitative`: outcome is real but should not be expressed as an unsupported number.

The UI does not need to expose the evidence level, but authoring/review does.

A referenced `highlight_ids` relation points to a canonical `ProfessionalHighlight` record rather than an undefined string:

```yaml
id: highlight-...
statement:
  en: ...
  es: ...
evidence_level: verified | supported | qualitative
evidence_note: ... | null
metric_value: ... | null
metric_unit: ... | null
related_experience_ids: [...]
related_project_ids: [...]
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

`evidence_note` is authoring-only unless deliberately projected. This definition closes the `highlight_ids` relationship and enables shared Portfolio/CV evidence without duplicating claims.

---

## 11. Education model

Conceptual fields:

```yaml
id: edu-...
institution: ...
program:
  en: ...
  es: ...
degree_type: ... | null
start_date: YYYY-MM | YYYY
end_date: YYYY-MM | YYYY | null
current: true|false
summary:
  en: ...
  es: ...
related_project_ids: [...]
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

The portfolio should not become an academic transcript unless explicitly desired later.

Coursework is included only when it materially supports the professional story or a project case study.

---

## 12. Certifications model

Conceptual fields:

```yaml
id: cert-...
name: ...
issuer: ...
issue_date: YYYY-MM | YYYY
expiration_date: ... | null
credential_id: ... | null
verification_url: ... | null
skill_ids: [...]
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

`credential_id` is public only when it is intended to be shared.

Certificates must not be presented as active when expired/revoked if that status is known.

---

## 13. Languages model

Language proficiency should use structured, human-readable values rather than decorative percentages.

Example:

```yaml
- id: lang-es
  language: Spanish
  level: native
- id: lang-en
  language: English
  level: professional-working
```

Accepted vocabulary should be documented and stable. The UI may localize the visible label.

Avoid percentage meters such as `English 87%` unless they represent a real standardized score with context.

---

## 14. Skills and technologies

Skills are not ratings.

Conceptual model:

```yaml
id: skill-typescript
name: TypeScript
category: language
publication_state: published
visibility: public
privacy_class: PUBLIC
```

Relationships provide evidence:

```text
skill
→ projects where used
→ experience where used
→ architecture/case-study references
```

This supports the approved **Skill Constellation** direction: show *where a technology was used* rather than an arbitrary mastery percentage.

Potential categories:

```text
language
framework
platform
database
cloud
tool
integration
design
methodology
```

Categories remain content taxonomy, not an excuse to show dozens of colored pills.

---

## 15. Project canonical model

Projects are richer than resume facts and have their own structured source.

Baseline project record:

```yaml
id: project-dex-sphere
slug: dex-sphere
name: Dex-Sphere
status: concept | planning | in-development | private-beta | live | paused | archived | coming-soon
category: personal-product | professional | academic | experiment | open-source
facets: [...]
featured: true|false
featured_order: integer | null
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
start_date: ... | null
end_date: ... | null
role_summary:
  en: ... | null
  es: ... | null
pitch:
  en: ...
  es: ...
technology_ids: [...]
related_experience_ids: [...]
related_achievement_ids: [...]
preferred_widget_ids: [...]
repository_url: ... | null
live_url: ... | null
visual_context: ...
```

The project record owns identity and relationships; long case-study narrative may live in locale-specific content files.

---

## 16. Project case-study content contract

A project may provide these sections:

```text
Overview
Problem
Solution
Role
Architecture
Stack
Challenges
Decisions
Media
Metrics
Timeline
Lessons
Links
Making Of
```

DOC-31 already defines the smaller visible navigation. This larger content contract is the authoring model; the UI groups/omits sections intelligently.

No project must contain filler simply to satisfy every field.

Rule:

> **Missing optional content is better than fabricated or repetitive content.**

---

## 17. Localized project content

For rich case studies, use locale-separated narrative rather than one giant object with every paragraph duplicated inline.

Recommended conceptual structure:

```text
content/
  projects/
    dex-sphere/
      project.yaml
      en.md
      es.md
      media.yaml
```

`project.yaml` stores locale-independent facts/relationships plus only explicitly modelled short localized metadata needed by multiple projections (for example `pitch` or a short `role_summary`).

`en.md` / `es.md` are the **only source** for long case-study narrative. They must not duplicate the canonical short metadata as competing frontmatter values; page headings/short summaries are generated from `project.yaml` or clearly designated content slots.

The exact parser can be Markdown, MDX or another build-time format chosen later, but the separation is architectural.

---

## 18. Translation parity

Bilingual does not mean every sentence must be mechanically identical.

The rule is **semantic parity**:

- same factual claims;
- same project status;
- same major sections where applicable;
- equivalent warnings/limitations;
- no language receives hidden extra professional claims.

Localized copy may differ in sentence structure and tone to sound natural.

A translation QA workflow should detect missing required locale content before production build.

---

## 19. Content fallback policy

For core professional content:

```text
missing ES or EN required translation
→ build/content validation error
```

Do **not** silently mix languages in production project details or CV output.

For optional external data:

```text
missing translated source summary
→ present original source title with clear attribution, or omit according to feature policy
```

The exact Tech Pulse behavior is owned by its integration/content rules.

---

## 20. Canonical dates and localization

Store dates canonically:

```text
2026-09
2026-09-15
```

Render localized strings at presentation time:

```text
Sep 2026
Septiembre de 2026
```

Do not store display strings such as `Sept 2026` as the source date.

Date precision must be honest. If only a year is known, do not invent month/day precision.

---

## 21. Publication, visibility, lifecycle and privacy axes

These dimensions are orthogonal and must never be collapsed into one field.

### 21.1 Editorial publication state

```text
draft
published
archived
```

`publication_state` answers whether an authored record is editorially ready/current. `archived` here means the authored record is retained historically and is no longer part of the normal active editorial set; it does not by itself determine public visibility.

### 21.2 Visibility

```text
public
private
```

`visibility` answers whether an eligible projection may be served publicly. A `published + private` record can be internally valid but intentionally excluded from public output.

### 21.3 Project lifecycle

Projects additionally own a domain lifecycle independent from the axes above:

```text
concept
planning
in-development
private-beta
live
paused
archived
coming-soon
```

A project whose lifecycle is `archived` may still be `publication_state: published` and `visibility: public` as historical work. Never infer publication or visibility from lifecycle.

### 21.4 Privacy class

Privacy classification governs disclosure/redaction handling and is defined in section 23. It is not a synonym for `visibility`.

---

## 22. Content provenance

Important professional records should optionally track authoring provenance:

```yaml
source_note: ...
last_verified_at: YYYY-MM-DD
```

These are internal authoring fields and do not have to ship publicly.

The goal is to make later maintenance answer:

> “Where did this claim come from, and when was it last checked?”

without relying on memory.

---

## 23. Privacy classification

Every content domain must distinguish public information from private source material.

Suggested authoring classifications:

```text
PUBLIC
PUBLIC_REDACTED
INTERNAL_REFERENCE
PRIVATE_NEVER_EXPORT
```

Only public-safe projections enter the static/public build.

### 23.1 Mapping to DOC-09 delivery/storage classifications

DOC-09's `public`, `admin-only`, `derived-public`, `local-only` and `sensitive/private` labels are **delivery/storage handling classes**, not additional authored publication states. Their relationship is:

| DOC-09 handling class | Relationship to canonical axes |
|---|---|
| `public` | may enter a public projection only when `publication_state: published`, `visibility: public` and `privacy_class` permits disclosure |
| `admin-only` | runtime authorization/delivery constraint; it does not replace authored publication/visibility/privacy axes |
| `derived-public` | provenance class for generated output; the source still must satisfy its canonical disclosure rules |
| `local-only` | runtime locality/storage constraint; it is not a public/private publication flag |
| `sensitive/private` | requires a restrictive `privacy_class` and must not be emitted publicly unless an explicit reviewed redaction creates a separate public-safe projection |

These classifications compose with, rather than compete with, the canonical axes.

Examples of material that should default to private:

- private contact details;
- internal client documents;
- credentials/secrets;
- confidential architecture screenshots;
- private repository information;
- customer personal data;
- internal metrics not approved for publication.

---

## 24. Client/confidentiality boundary

Professional work may involve named clients or systems that are not safe to expose publicly.

The content model must allow:

```yaml
public_client_name: null
public_context:
  en: "Healthcare technology client"
  es: "Cliente de tecnología para salud"
```

rather than forcing either total omission or accidental disclosure.

Screenshots and diagrams receive the same review, not only text.

---

## 25. Media metadata

Project media is content, not merely files.

Each media item should support:

```yaml
id: media-...
type: image | video | diagram | document
src: ...
thumbnail: ... | null
alt:
  en: ...
  es: ...
caption:
  en: ...
  es: ...
focal_point: [x, y] | null
role: thumbnail | hero | backdrop | gallery | architecture
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

Accessibility text and captions are authored deliberately.

The filename is never the alt text.

---

## 26. Visual context belongs to the project source

DOC-34 defines how project context affects the UI. The project content model owns the data needed to supply it.

Conceptual fields:

```yaml
visual_context:
  accent_light: ...
  accent_dark: ...
  accent_on_light: ... | null
  accent_on_dark: ... | null
  environment_light: ...
  environment_dark: ...
  secondary_tint: ... | null
  backdrop_media_id: ... | null
  hero_media_id: ... | null
  focal_point: [x, y] | null
  readability_bias: auto | light | dark | balanced
  backdrop_complexity: low | medium | high
  preferred_scrim: subtle | standard | strong
```

These values are design-authoring data, not business facts. **This is the canonical authored `ProjectVisualContext` contract.** DOC-34 and DOC-39 consume this schema and must not define incompatible enums/fields.

`accent_on_light` / `accent_on_dark` are optional accessible foreground inks for content intentionally placed on the contextual accent. `readability_bias` is guidance for environmental composition, never permission to violate contrast. A later visual tooling workflow may generate or validate values but cannot silently change the authored contract.

---

## 27. Achievements content boundary

Achievements have two content classes:

### Professional achievements

Real facts such as career, academic or engineering accomplishments.

They may relate to projects/experience and must obey the same evidence/no-invention rules.

### Interaction achievements

Portfolio-local playful progression such as `Old School` or Arcade accomplishments.

These are product content and local state, not resume facts.

They must never be exported to RenderCV as professional accomplishments unless explicitly reclassified through a content decision.

Minimum canonical authored achievement record:

```yaml
id: achievement-...
slug: ...
kind: professional | interaction
category: engineering | career | academic | exploration | secrets
title:
  en: ...
  es: ...
description:
  en: ...
  es: ...
secret: true|false
icon_or_art_id: ... | null
evidence_level: verified | supported | qualitative | null
unlock_rule_id: ... | null
related_project_ids: [...]
related_experience_ids: [...]
order: integer
publication_state: draft | published | archived
visibility: public | private
privacy_class: PUBLIC | PUBLIC_REDACTED | INTERNAL_REFERENCE | PRIVATE_NEVER_EXPORT
```

Professional achievements require evidence discipline. Interaction achievements may use a local `unlock_rule_id`; secret records must not leak concealed title/description through public list projections before discovery.

---

## 28. Currently Building

`Currently Building` is a manually curated **current-work update** in the `MANAGED_STATUS` class. It is not the canonical project lifecycle `status`. In the approved V1.x baseline its source of truth is the repository-authored `managed-status` content domain; it is build/deploy-updated, not a writable runtime DB record.

It may reference canonical projects but owns its own current-status message.

Example:

```yaml
project_id: project-dex-sphere
headline:
  en: "Designing the input architecture"
  es: "Diseñando la arquitectura de entrada"
progress: null | 0..100
updated_at: ...
```

If `progress` is used, it must represent an intentionally maintained estimate. It must never be derived automatically from commit count.

---

## 29. Dev Log

Dev Log combines two possible sources:

```text
CURATED milestone entries
+
normalized GitHub-derived events
```

Curated entries are owned by the portfolio content system.

GitHub events remain external dynamic data and do not rewrite canonical project facts.

A commit message is not automatically a public professional claim.

---

## 30. Tech Pulse

Tech Pulse is **curated/normalized external content**, not professional biography.

It may store:

```text
source URL
source title
publisher
author/date where available
topics
Alejandro's optional short commentary
fetch/cache metadata
```

External article text is never copied wholesale into canonical content.

Attribution and copyright constraints are respected.

---

## 31. UGC isolation

Guestbook and Sketch Wall content never lives in the repository canonical professional dataset.

It remains in the moderated application data layer.

No approved UGC automatically becomes:

```text
professional testimonial
CV quote
project claim
profile fact
```

without an explicit authoring decision.

---

## 32. SEO projection

SEO metadata is generated from canonical/localized content where possible.

For projects:

```text
canonical name
localized pitch/summary
hero/OG asset
public status
slug
```

feed:

```text
title
description
Open Graph
twitter/social preview
structured metadata where appropriate
```

SEO copy may be optimized for length, but it cannot introduce claims absent from canonical/narrative source content.

---

## 33. RenderCV projection

RenderCV consumes a **professional projection** of the canonical content model.

Conceptually:

```text
Canonical Professional Data
        ↓
CV Selection/Ordering Rules
        ↓
Locale Projection
        ↓
RenderCV-compatible source
        ↓
Validation
        ↓
PDF
```

The PDF is never edited manually.

DOC-37 owns the exact RenderCV file layout, generation commands, CI behavior and theme configuration.

---

## 34. Portfolio versus CV selection

Not everything public belongs in the CV.

Examples:

| Content | Portfolio | CV |
|---|---:|---:|
| Full project case study | Yes | No |
| Selected project summary | Yes | Yes, selective |
| Architecture diagrams | Yes | No |
| Experience facts | Yes | Yes |
| Education facts | Yes | Yes |
| Certifications | Yes | Selective/all depending length |
| Arcade achievements | Yes | No |
| Guestbook | Yes | No |
| Making Of | Yes | No |
| Skill evidence relationships | Yes | Condensed |

CV inclusion is an explicit projection rule, not a side effect of `visibility: public`.

---

## 35. Recommended repository structure

Conceptual baseline:

```text
content/
├── canonical/
│   ├── profile.yaml
│   ├── experience.yaml
│   ├── education.yaml
│   ├── certifications.yaml
│   ├── languages.yaml
│   ├── skills.yaml
│   ├── highlights.yaml
│   └── links.yaml
│
├── projects/
│   └── <slug>/
│       ├── project.yaml
│       ├── en.md
│       ├── es.md
│       └── media.yaml
│
├── site/
│   ├── en/
│   └── es/
│
├── achievements/
├── dev-log/
└── managed-status/
```

This is a content architecture contract, not a final filesystem mandate. Technical Architecture may refine exact paths without collapsing source-of-truth boundaries.

---

## 36. Structured data format

Recommendation:

- YAML for human-authored structured canonical records;
- Markdown/MDX-like files for long localized narrative;
- TypeScript schemas generated/validated at build time;
- database only for runtime/UGC/admin-managed data that needs runtime persistence.

Why not put all professional content in Supabase?

Because V1.0 professional facts are version-controlled editorial source, benefit from review/diffs, and should deploy atomically with the site.

A future CMS can be introduced if authoring needs justify it; it is not required now.

---

## 37. Validation layer

Every structured content source must pass schema validation before build.

Validation should catch at minimum:

```text
missing required IDs
duplicate IDs
invalid dates
current=true with incompatible end date
broken relationships
unknown technology IDs
missing required locale content
invalid URLs
private records referenced by public projections
missing public media alt text
unsupported project states
CV selection referencing non-public facts
```

Content validation is a CI gate, not a best-effort warning for critical errors.

---

## 38. Broken relationship policy

Relationships such as:

```text
project → skill
experience → project
achievement → project
```

use referential validation similar to foreign keys.

A deleted/renamed ID that leaves broken references fails validation.

This gives repository content some of the integrity normally expected from a relational model.

---

## 39. Sorting and ordering

Do not depend on source-file order accidentally.

Collections should use explicit rules:

```text
featured + `featured_order` field
start/end date
published/updated date
manual priority
```

The intended rule is documented per collection.

Examples:

- Experience: reverse chronological.
- Education: reverse chronological or curated.
- Featured projects: explicit priority.
- Certifications: date/category ordering.

---

## 40. Draft content workflow

A record may exist in repository while not being public.

Typical workflow:

```text
create draft
↓
fill canonical facts
↓
write EN/ES narrative
↓
review privacy/evidence
↓
attach public media
↓
validate
↓
set `publication_state: published` and confirm intended `visibility`
↓
build/deploy
```

This supports preparing projects before publication without maintaining a separate private document copy.

---

## 41. Content review gates

Before a professional record becomes public, review:

```text
Accuracy
Privacy/confidentiality
Evidence for quantitative claims
EN/ES semantic parity
Spelling/voice
Media rights
Alt text/accessibility
Links
Project lifecycle / publication state / visibility / privacy class
CV inclusion if applicable
```

This is especially important for client work.

---

## 42. Generated content policy

Generated/derived files are never manually maintained as source.

Examples:

```text
RenderCV PDFs
RenderCV intermediate source if generated
search indexes
Open Graph images
RSS/feeds
sitemaps
JSON-LD
```

They must trace back to canonical/curated sources and build configuration.

---

## 43. Generated/tool-assisted content policy

Development tooling may help:

- rewrite prose;
- translate drafts;
- detect inconsistencies;
- suggest summaries;
- validate tone/length;
- generate structural scaffolding.

Development tooling may **not** independently create factual professional data.

Any generated claim must be checked against canonical facts before publication.

---

## 44. Content tone

Portfolio writing should be:

```text
clear
specific
technical when useful
human
confident without exaggeration
concise at surface level
more detailed inside case studies
```

Avoid:

```text
generic generated filler
"passionate developer" clichés
unsupported superlatives
corporate jargon
needless buzzwords
pretending every project was revolutionary
```

The user's real decision-making and architecture are more convincing than inflated adjectives.

---

## 45. Progressive disclosure

Content should be authored for multiple depth levels.

Example Project:

```text
Tile
→ name + short pitch

Home Summary
→ pitch + status + top technologies

Project Detail
→ case study

Making Of / Architecture
→ deeper technical reasoning
```

These are projections of one content domain, not four unrelated descriptions.

Short descriptions should be intentionally authored/derived, not arbitrary string truncation.

---

## 46. Content budgets

Initial writing budgets should exist to protect layouts, while responsive design must still handle overflow.

Examples to refine later:

```text
Project tile label        very short
Project one-line pitch    ~1–2 lines
Widget status             concise
SEO description           search/social appropriate
Achievement title         compact
Achievement description   short
```

Content budgets guide authoring; they never justify inaccessible clipping.

---

## 47. Public link health

Repository validation should periodically check important public URLs where practical:

```text
live demos
repositories
credential verification
professional links
```

A broken external URL should be surfaced during maintenance rather than silently remaining for years.

Network-dependent checks can run separately from deterministic local build validation.

---

## 48. Content versioning

Content evolves with code through Git history.

Material factual corrections should be reviewable.

If a claim is removed because it is no longer public-safe, generated outputs must remove it on the same release.

No separate invisible CV copy should preserve stale facts.

---

## 49. Runtime boundary

Static/canonical professional content should preferably be available without waiting for runtime APIs.

This supports:

```text
fast SSR/static rendering
SEO
resilience
progressive enhancement
```

External/live content and UGC may hydrate/fetch independently after the core professional experience is available.

---

## 50. Future CMS boundary

A CMS is not prohibited, but it is `DEFERRED`.

A future CMS must preserve:

```text
stable IDs
schema validation
localization parity
privacy classification
content review
RenderCV projection
Git/audit or equivalent history
```

A CMS/Admin is not allowed to become a second source of truth alongside repository content without an explicit migration decision. In the approved V1.x baseline, Admin mutates UGC/moderation and other explicitly runtime-owned domains only; `Currently Building`, canonical project lifecycle, featured order, media metadata and professional facts change through the repository authoring workflow. A future editor must either write back to that canonical source or be introduced by an ADR that migrates the source of truth.

---

## 51. Implementation-tool content rules

Implementation tooling follows rules equivalent to:

```text
Never invent professional facts.
Never duplicate canonical professional facts in feature-local files.
Use stable IDs for cross-content relationships.
Do not expose private/internal content through public projections.
Do not silently fall back from ES to EN for required professional content.
Do not edit generated CV PDFs or generated metadata as source.
Validate all content schemas before build.
When a content field is missing, omit/recompose rather than fabricate.
Preserve evidence/privacy notes in authoring data even when they are not rendered publicly.
Do not infer Currently Building progress from Git commit volume.
```

---

## 52. Initial implementation contracts

At minimum, the content layer should expose typed queries equivalent to:

```text
getProfile(locale)
getPublicProjects(locale)
getProjectBySlug(slug, locale)
getExperience(locale)
getEducation(locale)
getCertifications(locale)
getSkillsWithEvidence(locale)
getCVProjection(locale)
getCurrentlyBuilding(locale)
```

Concrete module/function names are implementation details under DOC-42/DOC-43, but the validated content-layer boundary and query capabilities above are canonical.

The important decision is that components consume a validated content layer rather than importing random YAML/Markdown from arbitrary locations.

---

## 53. Content architecture acceptance tests

The future implementation should prove at least:

1. changing an experience date changes Portfolio and regenerated CV consistently;
2. a missing required Spanish project translation fails validation;
3. a project that is not `publication_state: published` and `visibility: public` cannot appear in sitemap/SEO/project listings;
4. a broken skill/project reference fails validation;
5. an unpublished media asset cannot appear publicly;
6. a project can render without optional metrics/lessons/media;
7. generated PDF output never becomes source-of-truth;
8. GitHub feed failure does not affect canonical project content;
9. UGC cannot enter CV/professional content automatically;
10. an inaccessible/missing public project accent is caught or safely normalized by design validation.

---

## DOC-36 — Decision Registry

| ID | Decision |
|---|---|
| CNT-001 | Professional facts are canonical once and surfaces consume projections of those facts |
| CNT-002 | Content is classified as Canonical Fact, Curated Narrative, Managed Status, External Dynamic or UGC |
| CNT-003 | Development/build tooling must never invent professional facts, dates, metrics, roles, certifications or technologies |
| CNT-004 | Canonical records use stable locale-independent IDs |
| CNT-005 | Structured facts and rich narrative are modeled separately |
| CNT-006 | Experience, education, certifications, languages, skills, links and reusable profile facts belong to canonical professional data |
| CNT-007 | Quantitative professional claims use an internal evidence classification and unsupported metrics are prohibited |
| CNT-008 | Skills show evidence/usage relationships rather than arbitrary percentage mastery |
| CNT-009 | Projects own structured identity/relationships while rich case-study narrative may live in locale-specific Markdown/MDX-like files |
| CNT-010 | Required professional EN/ES content must maintain semantic parity and missing required translations fail validation |
| CNT-011 | Dates are stored canonically and localized only at presentation time |
| CNT-012 | Publication state, visibility, project lifecycle and privacy class are explicit orthogonal axes |
| CNT-013 | Public content is privacy-classified; private/internal material never enters public projections automatically |
| CNT-014 | Confidential client/project information can be represented through deliberately redacted public context |
| CNT-015 | Project media carries structured role, alt text, caption, visibility and focal metadata |
| CNT-016 | DOC-36 owns the canonical authored ProjectVisualContext schema; DOC-34/DOC-39 consume it without incompatible enums |
| CNT-017 | Professional achievements and playful portfolio achievements remain separate content classes |
| CNT-018 | Currently Building is an explicitly curated current-work update, separate from project lifecycle status, and is never inferred from commit count |
| CNT-019 | Dev Log may combine curated milestones and normalized GitHub events without GitHub becoming professional source of truth |
| CNT-020 | Tech Pulse is external curated/normalized content with attribution, not biography |
| CNT-021 | UGC never automatically becomes a testimonial, CV claim or professional fact |
| CNT-022 | SEO metadata is derived from canonical/localized source and cannot introduce new claims |
| CNT-023 | RenderCV consumes a professional projection of canonical content; PDF output is generated and never manually maintained |
| CNT-024 | `public` does not imply `include in CV`; CV selection is an explicit projection rule |
| CNT-025 | Repository-authored YAML + localized Markdown/MDX-like narrative is the V1.0 content baseline; runtime DB is for runtime/UGC needs |
| CNT-026 | Structured content is schema-validated in CI with referential integrity checks |
| CNT-027 | Collection ordering is explicit rather than dependent on accidental source order |
| CNT-028 | Draft-to-public content passes accuracy, privacy, evidence, localization, rights and accessibility review |
| CNT-029 | Generated assets/metadata are derivatives and never source-of-truth |
| CNT-030 | Core professional content is available independently from runtime external APIs |
| CNT-031 | CMS adoption is deferred and may not create a second source of truth without an explicit migration decision |
| CNT-032 | Components consume a typed validated content layer rather than arbitrary source files |
| CNT-033 | `ProfessionalHighlight` is a defined canonical entity and closes `highlight_ids`; project roles use explicit localized `role_summary` rather than undefined `role_ids` |
| CNT-034 | Project lifecycle includes `concept`; Archived is lifecycle/publication semantics, not a project category |
| CNT-035 | Projects canonically define category/facets plus explicit `featured_order`; source-file order is not featured order |
| CNT-036 | Certification-to-skill relations use stable `skill_ids` |
| CNT-037 | Achievements have a minimum canonical authored schema before cross-content references are valid |
| CNT-038 | Long project narrative lives only in locale Markdown; project YAML owns facts/relations and explicitly modelled short localized metadata |
| CNT-039 | V1.x Admin changes runtime-managed data only; canonical professional/project facts require repository write-back or an approved source-of-truth migration ADR |
| CNT-040 | `Currently Building` is repository-authored managed status in the approved V1.x baseline; no runtime table/Admin editor becomes authoritative without a future source-of-truth migration ADR. |

---

## 54. Approval record

DOC-36 is approved as the canonical content architecture. The exact schema library, Markdown/MDX parser and physical directory names may be refined during Technical Architecture as long as the single-source, localization, validation, privacy and RenderCV projection contracts remain intact.
