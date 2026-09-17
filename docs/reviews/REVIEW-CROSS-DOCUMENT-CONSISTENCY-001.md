---
id: REVIEW-CROSS-DOCUMENT-CONSISTENCY-001
record_type: review
review_status: COMPLETE
review_result: FAIL
date: '2026-09-15'
scope: DOC-00 through DOC-40 + ADR-001 + package governance
remediation_status: REMEDIATED
remediated_by: REVIEW-CROSS-DOCUMENT-CONSISTENCY-002
---

# REVIEW-CROSS-DOCUMENT-CONSISTENCY-001 — Deep Baseline Audit

**Scope:** DOC-00 through DOC-40, ADR-001, package READMEs, prior review records and MANIFEST  
**Purpose:** Detect contradictions, stale decisions, schema drift, release ambiguity, accessibility conflicts, governance weaknesses and implementation hazards before Technical Architecture begins.

---

## 1. Executive result

The documentation baseline is **structurally strong and largely coherent**, but it is **not yet safe to hand directly to implementation as a contradiction-free source of truth**.

The audit found four classes of work:

- **P0 — blocking consistency issues:** must be resolved before Technical Architecture/Data Architecture because they alter release behavior, canonical state semantics or data modelling.
- **P1 — high-priority normalization issues:** should be resolved in the same consistency patch because they can create split-brain implementations or incompatible schemas.
- **P2 — medium implementation risks:** do not invalidate the product direction, but should be normalized before code-generation rules are frozen.
- **P3 — documentation/governance hygiene:** mostly mechanical/staleness issues that make automation and source-of-truth enforcement unreliable.

This audit **does not recommend redesigning the product**. Most of the product vision, interface model, Widget Field direction, responsive philosophy, material system, CV pipeline and security/accessibility intent remain consistent. The required work is primarily a **normalization and authority pass**.

> **Audit gate:** Do not begin Technical Architecture until P0 items are resolved and the affected approved docs are patched together in one consistency amendment.

---

## 2. Audit methods

The package was checked using:

1. full-file inventory and DOC-ID presence checks;
2. status and approval scans;
3. cross-document keyword and enum comparison;
4. release-map comparison across DOC-00, DOC-02, DOC-25, DOC-31, DOC-32 and ADR-001;
5. route and locale notation comparison;
6. Widget Field budget/size/personalization comparison;
7. focus/selection/state grammar comparison;
8. project/content/moderation schema comparison;
9. source-of-truth and future Admin/CMS boundary comparison;
10. CV route/artifact/source checks;
11. decision-family continuity checks;
12. MANIFEST path/byte validation;
13. WCAG contrast calculations for the currently proposed baseline color tokens;
14. searches for stale approval language, future-roadmap text and outdated phase status.

---

# 3. P0 — Blocking issues

## P0-01 — Widget personalization release contradiction

**Affected:** ADR-001, DOC-02, DOC-25, DOC-31/DOC-32 release summaries.  
**Finding:** ADR-001 explicitly says **“V1 supports controlled personalization”**. DOC-25 WDG-032 repeats that V1 supports it. DOC-02 places **controlled Widget Field personalization in V1.1 — Personality** instead of the base V1 release.

**Why it matters:** ADR-001 is the highest-authority decision in this topic. Implementation cannot know whether V1.0 must include persistence, Customize mode, accessible reorder and size controls, or whether those are deferred.

**Recommended resolution:** Normalize release naming to `V1.0` for the base release and place controlled Widget Field personalization in **V1.0**, honoring ADR-001, unless a new ADR intentionally defers it.

---

## P0-02 — Fixed six-destination Dock conflicts with staged feature releases

**Affected:** DOC-06 FR-003, DOC-21, DOC-22, DOC-31, DOC-38 GEO-015, DOC-02.  
**Finding:** The IA and geometry require the six destinations **Home / Achievements / Arcade / Channel / Social / Contact** in fixed order, and DOC-38 says the Dock always exposes all six primary destinations in V1. However, the release map ships Achievements in V1.1, Social in V1.2, Arcade in V1.3 and Channel in V1.4.

**Missing contract:** What happens when a V1.0 visitor activates an unreleased Dock destination?

**Why it matters:** This affects routing, focus, onboarding, command palette, analytics, sitemap/noindex policy and accessibility.

**Recommended resolution:** Keep the six-space Dock from V1.0, but define unreleased spaces as deliberate localized **Coming Soon route surfaces** that are excluded from sitemap/indexing until launch. This preserves the console/system identity without creating dead destinations. Alternative approaches require changing approved Dock constraints.

---

## P0-03 — `ACTIVE` state semantics conflict

**Affected:** DOC-24, DOC-40 and master/interface state language.  
**Finding:** DOC-24 defines `ACTIVE` as **persistent current mode/space/tool** and explicitly frames it as “Where am I in the system?”. DOC-40 defines it as a **control/action currently operating or toggled on**, including wording such as “in progress”.

**Why it matters:** This conflates current location/mode, toggle state and asynchronous busy/operating state. It will produce inconsistent ARIA/state styling and component APIs.

**Recommended resolution:** Preserve DOC-24 semantics: `ACTIVE = persistent currently engaged mode/tool/setting/space`. Use `LOADING/BUSY` or feature-specific progress state for operations in progress. A Dock “active bubble” can remain a visual term but should map semantically to current space.

---

## P0-04 — Project lifecycle enum is missing `concept` in canonical content schema

**Affected:** DOC-06 FR-009, DOC-24, DOC-31, DOC-36.  
**Finding:** Product/interface docs include **Concept** as a valid project status. DOC-36 canonical project status enum omits it.

**Recommended resolution:** Add canonical `concept` status to DOC-36 and ensure UI/status copy derives from one lifecycle enum.

---

## P0-05 — Publication, visibility and lifecycle are mixed into one field

**Affected:** DOC-36.  
**Finding:** Several records use `visibility: public | private | draft`, while a later section discusses `draft / public / private / archived`. `draft` is a publication workflow state, `private/public` is access/visibility, and `archived` can be lifecycle/publication state. Project lifecycle separately already contains `archived`.

**Why it matters:** Data Architecture cannot safely create constraints, queries or admin workflows while these dimensions are conflated.

**Recommended resolution:** Split the axes, for example:

- `publication_state: draft | published | archived`
- `visibility: public | private/internal`
- project `status: concept | planning | in-development | private-beta | live | paused | archived | coming-soon`

Exact names may change, but the dimensions must be orthogonal.

---

## P0-06 — `reported` is incorrectly modelled as a mutually exclusive moderation lifecycle state

**Affected:** DOC-06 FR-031, DOC-13, DOC-31.  
**Finding:** Moderation is described as `pending / approved / rejected / reported / hidden`. A public approved item can be reported while still remaining approved/visible until moderation action. Reporting is an event/relationship/flag, not the same axis as publication/moderation status.

**Recommended resolution:** Use a moderation status such as `pending | approved | rejected | hidden` and model reports separately with their own open/resolved lifecycle and audit trail.

---

## P0-07 — Canonical project/content schema contains undefined relations

**Affected:** DOC-36.  
**Finding:** The project schema contains `role_ids`, but no canonical Role entity is defined. Experience contains `highlight_ids`, but no Highlight entity/schema is defined.

**Why it matters:** These IDs cannot be validated or migrated and would force the Technical/Data Architecture phase to invent missing entities.

**Recommended resolution:** Either define the referenced canonical entities with stable IDs and ownership, or replace the IDs with explicit inline fields/relations that already exist. Do not leave dangling relation types.

---

## P0-08 — Visual-context contract has incompatible enums and fields across owning docs

**Affected:** DOC-34, DOC-36, DOC-39.  
**Finding:** `readabilityBias` differs:

- DOC-36: `auto | light | dark | neutral`
- DOC-39: `light | dark | balanced`

DOC-34 also proposes `accentOnLight/accentOnDark`, while DOC-39 expects `backdropComplexity` and `preferredScrim`; DOC-36 does not own a complete superset.

**Why it matters:** Project media/content cannot be authored reliably if visual rendering expects a different schema.

**Recommended resolution:** DOC-36 should become the canonical authored visual-context schema. DOC-34/DOC-39 should consume it. Recommended canonical set: explicit accent/environment tokens, foreground/accent-on-background support, focal point, `readability_bias: auto | light | dark | balanced`, `backdrop_complexity`, and `preferred_scrim`.

---

## P0-09 — Approved color baseline violates its own normal-text contrast target

**Affected:** DOC-34, later MAT/STA usage.  
**Finding:** DOC-34 targets normal text at `>= 4.5:1`. Calculated WCAG contrast for current `muted` tokens:

| Pair | Contrast |
|---|---:|
| Light muted `#7C878D` / base `#EEF2F2` | **3.26:1** |
| Light muted / raised `#F5F7F7` | **3.42:1** |
| Light muted / solid `#FCFDFD` | **3.61:1** |
| Light muted / sunken `#E6EBEC` | **3.06:1** |
| Dark muted `#768188` / solid `#171C20` | **4.30:1** |

`Signal #287F7B` on Light base is about `4.22:1`; Light Warning `#9A6718` on base is about `4.30:1`, so these should not automatically become normal-sized text foregrounds either.

**Recommended resolution:** Darken the Light muted token, slightly lighten the Dark muted token, and explicitly distinguish semantic hue tokens from accessible semantic text/ink tokens. Re-test against every MAT-0/MAT-1 reading surface before freezing palette tokens.

---

## P0-10 — Future Admin editing can create a second source of truth

**Affected:** DOC-25, DOC-36.  
**Finding:** DOC-25 allows future Admin editing of project status/featured project, while DOC-36 says repository-authored YAML/Markdown is canonical and a CMS must not become a second source of truth without migration.

**Why it matters:** If Admin writes DB state while repo YAML remains canonical, the same project can have two conflicting statuses/featured states.

**Recommended resolution:** Keep V1 Admin runtime-managed only for UGC/moderation and explicitly managed status such as Currently Building. Any future Admin editing of canonical project facts must either write back to canonical repository content or be introduced through a source-of-truth migration ADR.

---

# 4. P1 — High-priority normalization issues

## P1-01 — Widget size taxonomy is ambiguous (`S/M/L` vs `S/M/L/XL`)

ADR-001 and DOC-38 make personalized Widget Field sizes `S/M/L`. DOC-25 also defines `XL` as a widget complexity/expanded-workspace class.

**Resolution:** Keep `S/M/L` as the only field/personalization sizes. Treat `XL` as an expanded presentation/surface state outside the field, or remove it in favor of DOC-26 Overlay/Route/Utility surfaces.

---

## P1-02 — DOC-25 retains stale “Normally only 1–2 display simultaneously” language

Canonical budgets now allow Expanded `2–3` and Wide `3–4`. The initial Home widget section still says normally only `1–2` display simultaneously.

**Resolution:** Replace this with the responsive mode budgets and release-aware eligibility.

---

## P1-03 — Initial Widget Registry references features that ship later

DOC-25’s initial widgets include Dev Activity (live/GitHub work) and Related Achievement, while public live integrations and Achievements ship later than V1.0.

**Resolution:** Add `min_release`/feature-gate metadata to widget registration and define a useful V1.0 default registry that does not depend on unavailable later features.

---

## P1-04 — Project category, facets and featured ordering are not represented canonically

DOC-09 requires category/featured order, and DOC-31 discusses Featured/Personal Product/Professional/Academic/Experiment/Open Source/Archived facets. DOC-36 has `featured: true|false` but no canonical category/facet field or featured order.

**Resolution:** Define category/facets and explicit `featured_order`/priority. Do not treat `Archived` as a category; derive it from lifecycle status.

---

## P1-05 — Localized project narrative has potential dual source

DOC-36 shows a localized `content.en/es` area in project metadata while also declaring `project.yaml + en.md + es.md + media.yaml`, with long narrative in locale Markdown.

**Resolution:** Define a single ownership rule: project YAML owns language-neutral metadata and short localized metadata only if explicitly modelled; long narrative lives only in locale Markdown. Avoid duplicate title/pitch/body values in two files unless one is generated.

---

## P1-06 — Certification skill relation conflicts with stable-ID rule

DOC-36 certification records use `skills: [...]`, while the same document says relationships use IDs rather than display strings.

**Resolution:** Rename to `skill_ids`/`technology_ids` or explicitly type the values as stable canonical IDs.

---

## P1-07 — Achievement references exist without a canonical achievement schema

DOC-36 references `related_achievement_ids` and `content/achievements/`, but does not define the achievement content record that projects/content must point to.

**Resolution:** Before Data Architecture, define the minimum authored achievement schema: stable ID/slug, class/category, localized title/description, secret/public rules, art/icon reference, professional evidence or local unlock rule, related IDs, ordering and visibility/publication fields.

---

## P1-08 — Privacy classification vocabularies do not map to one another

DOC-09 uses concepts such as `public`, `admin-only`, `derived-public`, `local-only`, `sensitive/private`. DOC-36 proposes `PUBLIC`, `PUBLIC_REDACTED`, `INTERNAL_REFERENCE`, `PRIVATE_NEVER_EXPORT`. These may represent different axes but no mapping says so.

**Resolution:** Explicitly separate publication/visibility, privacy class, provenance/source class and runtime locality. Do not overload one enum.

---

## P1-09 — Pre-release route/feature-gating contract is absent

The route inventory includes later/optional routes, but docs do not consistently say whether unreleased routes 404, render Coming Soon, use `noindex`, appear in sitemap, or appear in command palette.

**Resolution:** Add one canonical route feature-gating policy owned by DOC-31/DOC-02 and consumed by SEO/navigation.

---

## P1-10 — Gameplay model mixes navigation states, session states and actions

Examples include `Game Detail → Ready → Active → Paused → Finished → Result` and `Ready/Active/Pause/Resume/Exit/Result`.

**Resolution:** Normalize:

- navigation: Library → Game Detail → Session → Result;
- session states: `ready → active ↔ paused → finished`;
- actions: `start`, `pause`, `resume`, `exit`, `retry`;
- result presentation is post-session unless intentionally made a session state.

---

## P1-11 — DOC-40 adds `SUCCESS` and `WARNING` without updating the earlier canonical state owner

DOC-24’s approved canonical list does not include `SUCCESS`/`WARNING`; DOC-40 does. Adding them is reasonable, but the authority chain does not explicitly record the extension.

**Resolution:** Update DOC-24/DOC-32 state registry or explicitly declare DOC-40 as the visual/semantic extension owner while preserving DOC-24’s interaction semantics.

---

## P1-12 — “Currently Building project status” wording can be confused with project lifecycle status

DOC-36 correctly treats Currently Building as managed contextual status, but some Widget/Admin language calls it a project status.

**Resolution:** Use “current-work status/update” for Currently Building and reserve “project status” for the canonical lifecycle enum.

---

# 5. P2 — Medium implementation risks

## P2-01 — Locale route placeholder syntax drifts

Normative route style is `/[locale]/...`, but examples include `/<locale>/cv`, `/{locale}/cv`, and unprefixed routes.

**Resolution:** Normalize normative route examples to `/[locale]/...`; label unprefixed examples as shorthand.

---

## P2-02 — DOC-31 route inventory table omits locale prefix without saying it is shorthand

Later sections use `/[locale]/...`, so the table looks like a second canonical route definition.

**Resolution:** Add a note that table route cells omit `/[locale]` only for brevity.

---

## P2-03 — Six-item Compact Dock needs an explicit narrow-width feasibility gate

Six `48×48` targets consume 288 px before shell padding/gaps/safe-area constraints. This is tight at 320 CSS px and may conflict with large text/zoom conditions.

**Resolution:** Make 320 px, short landscape and 200% zoom a prototype gate. Preserve six destinations, but permit 44 px minimum hit geometry in constrained modes if required by the already documented accessibility minimum, or adapt internal spacing.

---

## P2-04 — DOC-05 calls stories implementation-ready but stores only catalog summaries

DOC-05 says implementation stories should include release, acceptance, security/privacy, accessibility, analytics and test level, but USR entries are mostly one-line stories.

**Resolution:** Either declare DOC-05 a **story catalog** whose GitHub issues expand the template, or enrich each story. At minimum map epics/story groups to V1.0/V1.x releases.

---

## P2-05 — `V1` terminology is ambiguous next to `V1.1–V1.4`

“V1 supports X” can mean either base V1.0 or the complete V1.x family. This materially contributed to the Widget Field contradiction.

**Resolution:** Rename the initial milestone everywhere to **V1.0** and reserve **V1.x** for the release family.

---

## P2-06 — Performance budget is not yet measurable enough for implementation

The documentation keeps strong Web Vitals intent but currently avoids a concrete initial JS/CSS/image budget.

**Resolution:** This can remain deferred, but Technical/Performance Architecture must set measurable budgets and CI/perf-regression gates rather than leaving “intentionally small” as the final standard.

---

## P2-07 — SEO/indexing needs release-aware behaviour

Eventual route candidates are listed for indexing, but later-release/Coming Soon route indexing is not normalized.

**Resolution:** Combine with the feature-gating policy: unreleased spaces should normally be `noindex` and excluded from sitemap until public launch.

---

## P2-08 — DOC-36 and DOC-37 live under Visual Design despite being cross-cutting architecture/build documents

This is not functionally wrong, but phase ownership is misleading and could weaken task-aware reading rules.

**Resolution:** Keep numbering/paths stable for now, but label them as cross-cutting Content/CV specifications in the documentation map.

---

# 6. P3 — Documentation/governance hygiene

## P3-01 — File-level approval metadata was stale

Before this audit, DOC-34 through DOC-40 still contained `**Status:** DRAFT` even though DOC-34–DOC-39 had already been explicitly approved and the user approved DOC-40 immediately before this audit. READMEs partially disagreed with the files.

**Mechanical correction applied during audit:** DOC-34–DOC-40 status headers and current-phase README summaries were synchronized to `APPROVED`. No substantive decision was changed.

---

## P3-02 — DOC-00 lifecycle paragraph is stale

DOC-00 still says reconstructed DOC-00–19 “starts at REVIEW” even though those documents are approved.

**Resolution:** Rewrite the paragraph as historical provenance rather than current lifecycle state.

---

## P3-03 — DOC-00 still labels DOC-33–DOC-40 as a planned next package

Visual Design is now complete and approved.

**Resolution:** Replace that roadmap section with completed visual phase + Technical Architecture as the next phase, gated by this audit.

---

## P3-04 — Approved documents retain “approval recommendation/gate/after approval” language

DOC-35 through DOC-40 and DOC-32 contain drafting-era wording despite approval.

**Resolution:** Convert these to `Approval record`, `Accepted baseline`, or historical “At approval…” wording. This is editorial only unless the passage contains an unresolved decision.

---

## P3-05 — Prior Widget Field consistency review incorrectly reports full PASS

`REVIEW-WIDGET-FIELD-AMENDMENT-001.md` says ADR-001 is reflected across scope/release docs, but DOC-02 still places personalization in V1.1 while ADR-001 says V1.

**Resolution:** Amend that review to `PASS WITH CORRECTION` or supersede it with this audit once the release contradiction is patched.

---

## P3-06 — Metadata formats are inconsistent across document generations

DOC-00–DOC-19 use YAML frontmatter; DOC-20–DOC-40 use bold pseudo-metadata lines.

**Why it matters:** Automated status/owner/dependency validation becomes unreliable; the stale status issue is evidence of that weakness.

**Resolution:** Normalize all documents to one machine-readable frontmatter schema, preferably during the consistency patch without changing content semantics.

---

## P3-07 — Decision-family registry is stale

DOC-00 lists Product and Interface Architecture prefixes but not later families such as `VID`, `CLR`, `TYP`, `ICO`, `GFX`, `CVP`, `GEO`, `MAT`, `STA`. `CNT` ownership is also ambiguous because DOC-09 metadata references it while the actual `CNT-*` registry lives in DOC-36.

**Resolution:** Register every family and a single canonical owner document. DOC-36 should own `CNT-*` if that is where the registry lives.

---

## P3-08 — Global authority wording does not fully account for DOC-33–DOC-40

DOC-32’s authority order is interface-centric and can be read as globally superseding later visual/content specs. DOC-00 is more domain-aware.

**Resolution:** Define one global rule such as: **approved ADR > canonical domain owner for the concern > dependent approved specifications > implementation/code**. DOC-32 remains master for interface behavior, not color/content/CV concerns.

---

## P3-09 — “One normative owner per topic” is undermined by repeated release maps

Release scope is restated in DOC-00, DOC-02, DOC-31, DOC-32 and feature docs. This duplication caused real drift.

**Resolution:** Make DOC-02 the normative release/scope owner. Other docs should state “summary only; DOC-02 governs” or generate the summary automatically.

---

## P3-10 — Implementation-tool mandatory reading order is stale

DOC-19 says to inspect ADRs last and does not require relevant DOC-33–DOC-40 specifications for UI work.

**Resolution:** Recommended task-aware order:

1. governing ADRs;
2. DOC-00 authority/index;
3. domain master (DOC-32 for interface);
4. relevant detailed interface + visual/content docs;
5. product/security requirements;
6. code/inventory;
7. implementation.

For frontend visual work, DOC-34/35/38/39/40 should be mandatory when applicable.

---

## P3-11 — Status vocabularies are not explicitly separated

Document lifecycle uses one vocabulary, ADR/decision status another, and review records another. This is legitimate but not machine-documented.

**Resolution:** Define separate enums for `document_status`, `decision_status`, `review_status/result` in documentation governance.

---

## P3-12 — MANIFEST is valid but too weak as a governance artifact

The current MANIFEST was verified to match paths and byte sizes, but it stores no file hash, DOC ID, status, owner, approval date or decision-family ownership.

**Resolution:** Generate MANIFEST from metadata and include SHA-256 + lifecycle status + canonical owner. Generate README status tables from the same source to prevent drift.

---

# 7. Cross-checks that passed

The audit also confirmed substantial consistency:

- DOC-00 through DOC-40 all exist; no numbered document is missing.
- Decision-family registries are generally continuous and non-duplicated within their families.
- The fixed Dock order is consistent wherever it is named.
- No visitor account/social graph requirement has leaked back into scope.
- Admin remains the only authenticated class.
- Arcade V1.3 consistently contains exactly **Glitch Runner** and **Reflex Deploy**.
- Achievement category vocabulary is consistent.
- Sound is OFF on first visit.
- Theme remains System/Light/Dark.
- Transparency remains Automatic/Full/Reduced/Off.
- Motion preference remains Automatic/Full/Reduced.
- MAT-0 through MAT-3 semantics remain coherent across visual/interface docs.
- Widget visible budgets are consistently `1 / up to 2 / 2–3 / 3–4` except the stale DOC-25 sentence identified above.
- Arbitrary pixel/freeform Widget Field placement remains out of scope.
- CV source-of-truth/projection/generated-artifact direction remains coherent.
- CV EN/ES filenames are consistent.
- Contact server-authoritative success/failure behavior is coherent.
- Currently Building is consistently intended to be curated rather than inferred from commit count.
- System Status consistently forbids fake CPU/RAM telemetry.
- Arbitrary visitor image uploads remain excluded.
- The responsive principle “components recompose before they shrink” remains coherent.
- The accessibility principle “presentation may simplify but capability must remain” remains coherent.
- MANIFEST path and byte-size validation passed before audit modifications.

---

# 8. Proposed consistency patch order

Do not fix findings piecemeal. Apply one reviewed consistency patch in this order:

1. **Release semantics:** rename base to V1.0; resolve Widget personalization; resolve six-Dock pre-release behavior.
2. **Canonical state semantics:** ACTIVE + SUCCESS/WARNING ownership.
3. **Canonical data dimensions:** project lifecycle, publication/visibility/privacy, moderation/reporting.
4. **Content schemas:** undefined relations, categories/order, achievements, localized narrative ownership, visual-context contract.
5. **Widget normalization:** S/M/L vs XL, release-aware registry, stale budget sentence.
6. **Routes/game states:** locale syntax, prerelease gating, gameplay state/action taxonomy.
7. **Accessibility token correction:** muted/semantic text contrast and narrow Dock prototype gate.
8. **Source-of-truth boundaries:** future Admin/CMS behaviour.
9. **Governance:** metadata normalization, authority, family owners, implementation-tool reading order, generated MANIFEST/status tables.
10. **Editorial stale-state cleanup:** old “planned/approval gate/review” language.

After this patch, run the same automated scans again and require **zero P0 findings** before starting Technical Architecture.

---

# 9. Decisions that require explicit owner approval

Most findings have deterministic corrections, but two changes materially affect release/user behaviour and should be explicitly approved before patching:

### Decision A — Widget personalization release

**Recommended:** V1.0, preserving ADR-001.

### Decision B — Unreleased Dock destinations

**Recommended:** all six Dock destinations remain visible from V1.0; unreleased spaces open intentional localized Coming Soon surfaces, are excluded from sitemap and use `noindex` until their feature release.

Everything else in the recommended patch is primarily normalization of already-approved intent rather than a new product direction.

---

# 10. Audit conclusion

The baseline has a strong architecture and does **not** require a redesign. The most important issue is that several independently approved documents have evolved faster than the master/release/content schemas that were supposed to govern them.

The correct next move is therefore **not Technical Architecture yet**. The correct next move is a **Consistency Amendment** that resolves the P0/P1 findings across all affected documents in one atomic documentation update, followed by a second verification pass.


# Remediation record

Owner approved the recommended solutions on 2026-09-15. The findings in this document were remediated atomically across the affected approved documents, including the two owner-approval decisions: controlled Widget Field personalization in V1.0 and route-backed Coming Soon surfaces for unreleased fixed-Dock spaces. Verification evidence is recorded in `REVIEW-CROSS-DOCUMENT-CONSISTENCY-002.md`.
