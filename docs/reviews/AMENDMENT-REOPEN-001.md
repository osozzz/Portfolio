---
id: AMENDMENT-REOPEN-001
record_type: amendment
decision_status: APPROVED
date: 2026-11-10
scope: "Baseline reopening approved in PROPOSAL-REOPEN-001"
applies_to: "DOC-00 through DOC-52 + ADR-004–ADR-008"
---

# AMENDMENT-REOPEN-001 — Baseline Reopening Amendment

## Purpose

Record every document change made under `PROPOSAL-REOPEN-001` (approved by the owner on 2026-11-09). The changes:

- replace Next.js with Astro;
- adopt background music behind a Yes/No prompt;
- add a signature three.js layer;
- revise the DOC-02 non-goals;
- adopt the Colombian legal baseline;
- close the documentation gaps, including the SRS.

Each change cites its governing ADR.

## Approval

The owner approved the proposal on 2026-11-09. On 2026-11-10 the owner delegated review and merge of the revision pull requests:

| PR | Phase | Merged |
|---|---|---|
| #107 | ADR-004–ADR-008 + V0 gate suspension | 2026-11-10 |
| #108 | Phase 1: direction and scope | 2026-11-10 |
| #109 | Phase 2: experience layer | 2026-11-10 |
| #110 | Phase 3: technical architecture | 2026-11-10 |
| #111 | Phase 4: compliance | 2026-11-10 |
| this PR | Phase 5: DOC-52, this amendment, REVIEW-CROSS-DOCUMENT-CONSISTENCY-003, gate re-clear | 2026-11-10 |

## Resolutions applied

### Decisions

1. **ADR-004** Astro application framework and island architecture. It supersedes the earlier framework baseline in DOC-08 §2 and the DOC-42 §14–15 Project Detail mechanism.
2. **ADR-005** Background music, the music prompt and audio defaults. It supersedes DOC-30 AFD-003 and the DOC-02 §10 music non-goal.
3. **ADR-006** three.js signature 3D layer and its asset budget.
4. **ADR-007** DOC-02 non-goal revision and the V1.0 release scope.
5. **ADR-008** Colombian legal baseline and minors handling.

### Direction and scope

6. **DOC-00:**
   - V0 gate suspended during the revision, then re-cleared (see 49);
   - release summary synchronized;
   - DOC-52 added to the map and the `SRS` family registered.
7. **DOC-01:** first-seconds intent, principle 11 "Dazzle without demands", and VIS-009 (renumbered from a VIS-005 collision found in review).
8. **DOC-02:**
   - V1.0 gains the first impression, music, the privacy policy and a quality-gated publication rule;
   - V1.1 gains the blog and curated themes; V1.2 gains Terms of Use and the UGC declaration; V1.3 allows expansion after it ships; V1.4 gains presence;
   - §10 rows are annotated or superseded;
   - SCP-009 to SCP-014 added.
9. **DOC-04:** JRN-01 non-modal music prompt and JRN-04 returning-visitor behavior.
10. **DOC-05:** USR-006 to USR-008, USR-024, USR-025, USR-045, USR-046, USR-056, USR-073.
11. **DOC-06:** FR-002 and FR-019 revised; FR-066 to FR-074 added.
12. **DOC-07:** NFR-001 measured with the first impression active; NFR-034 to NFR-038 added.
13. **DOC-08:**
    - Astro and 3D stack;
    - legal baseline and register rows (privacy from V1.0, terms before V1.2, minimum age, data-subject rights);
    - N/A rows for newsletter unsubscribe and subscription renewal;
    - rows for session replay masking, self-hosted fonts and audio/3D licensing;
    - ENG-008 and ENG-009.
14. **DOC-14:** ARC-001 allows expansion after V1.3.
15. **DOC-32:** release summary and music line synchronized.

### Experience

16. **DOC-30:**
    - music prompt and background-music playback sections;
    - AudioManager music channel;
    - Settings Music / UI sounds;
    - AFD-003 superseded; AFD-036 to AFD-042 added.
17. **DOC-29:**
    - cinematic Boot rules and 3D stage motion;
    - Astro View Transitions in the tooling list;
    - MOT-041 to MOT-044.
18. **DOC-31:**
    - music prompt;
    - `/blog`, `/blog/[slug]`, `/privacy`, `/terms` and the presence indicator;
    - Project Detail presentations, Settings and release map;
    - SCR-038 to SCR-042.
19. **DOC-21:** the Sound/Music control is always visible (SA-016).
20. **DOC-26:** the music prompt is a non-modal Popover, or a card on Compact. Adds SUR-031 and SUR-032.
21. **DOC-27:**
    - MusicPrompt, MusicPlayer, ThreeStage and PresenceIndicator components;
    - Astro rendering and island boundaries;
    - CMP-022 revised, CMP-035 added.
22. **DOC-28:** 3D fallback matrix (RSP-039, RSP-040).
23. **DOC-33:** 3D signature moments (VID-041 to VID-043).
24. **DOC-34:** curated themes (§3.1, CLR-041).
25. **DOC-35:** original avatar placeholders and self-hosted fonts (GFX-011, GFX-012).
26. **DOC-36:** Astro Content Collections and the blog collection (CNT-041, CNT-042).
27. **DOC-39:** glass over the 3D stage (§64.1, MAT-033).

### Technical

28. **DOC-41:**
    - Astro baseline;
    - static/island rendering;
    - Actions/endpoints transports;
    - TAM-004/005/009/016/017 revised; TAM-042 to TAM-045 added.
29. **DOC-42:**
    - Astro route tree and persistent `PublicSystemShell`;
    - island and hydration rules;
    - nanostores replace the earlier store library;
    - §14 one-route Project Detail with a prototype gate; §15 restraint kept;
    - Astro i18n with typed catalogs; fonts; Actions for forms;
    - FEA registry updated; FEA-084 to FEA-086 added.
30. **DOC-43:** Astro Actions and API endpoints are the transports.
31. **DOC-44:**
    - UGC legal fields;
    - Contact proof of authorization;
    - ephemeral presence;
    - DTA-101 to DTA-103.
32. **DOC-45:** Astro middleware is not authorization; Actions and endpoints re-authorize.
33. **DOC-46:**
    - CDN response cache with cache tags replaces the framework data cache;
    - `waitUntil()` for post-response work.
34. **DOC-47:**
    - Astro server boundary and `security.checkOrigin`;
    - `astro:assets` image policy;
    - §45A audio/3D assets and §45B presence plus data-subject rights.
35. **DOC-48:** Astro adapter, local development and portability.
36. **DOC-49:** §16A 3D budget and §16B music budget (POR-108 to POR-110).
37. **DOC-50:**
    - Astro testing approach;
    - §86 V1.0 first-impression and legal exit criteria;
    - TQE-118 to TQE-120.
38. **DOC-51:** Astro build.
39. **DOC-19:** audio/3D license-register rule (TLG-011).

### Compliance

40. **DOC-12:** §10A Colombian legal baseline, marked "pending lawyer review" (SEC-008 to SEC-010).
41. **DOC-13:** UGC age declaration and presence boundary (COM-007, COM-008).
42. **DOC-16:** Contact authorization checkbox (MSG-007).
43. **DOC-15:** blog and presence (INT-007, INT-008).
44. **DOC-17:** blog and legal indexing, RSS (SEO-007, SEO-008).
45. **DOC-11:** audio control, music prompt, 3D accessibility, legal pages (A11Y-006 to A11Y-009).
46. **DOC-10:** ES/EN copy for the new surfaces; single-locale blog posts (L10N-006, L10N-007).
47. **DOC-09:** blog voice.

### Closure

48. **DOC-52:** new SRS index following the ISO/IEC/IEEE 29148 outline (SRS-001 to SRS-003).
49. **Gate:** after `REVIEW-CROSS-DOCUMENT-CONSISTENCY-003` passed, the V0 gate returns to `CLEARED_FOR_REPOSITORY_BOOTSTRAP` in DOC-00, docs/README and MANIFEST.json.

### Post-closure correction

50. While the GitHub issues were being updated, wording left over from the old Project Detail mechanism ("intercepted route/detail") was found in DOC-42, DOC-47, DOC-48, DOC-49, DOC-50 and DOC-51, and was rewritten for the one-route presentation (ADR-004). DOC-42 §107 and FEA-080 gain prototype gates 8 (persistent shell with music/3D across navigation) and 9 (3D stage within the DOC-49 budget). These gates were already required by ADR-004/ADR-006 and FEA-084, so this correction only makes the list complete.

## Owner follow-ups (not documentation defects)

- Confirm or tighten the initial DOC-49 §16A/§16B numeric budgets.
- Book a lawyer review of the privacy policy before V1.0 production and of the terms before V1.2. Verify RNBD applicability.
- Source royalty-free music tracks (CC0 preferred) and start the audio license register.
- GitHub updates, each confirmed by the owner:
  - retitle #88 to the Astro bootstrap;
  - rewrite #95 and #101 for the Astro Project Detail design;
  - open prototype-gate issues for "persistent shell + music across navigation" and "3D stage within DOC-49 budget".

## Change-control principle

These changes implement the owner-approved reopening. They do not redesign the confirmed console-like interaction model. Further changes to these boundaries go through the canonical owner documents and, where they are material, an ADR.
