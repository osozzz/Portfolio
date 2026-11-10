---
id: PROPOSAL-REOPEN-001
title: "Baseline Reopening — Direction, Scope, Stack & Gap Closure"
document_status: APPROVED
canonical_format: markdown
phase: "Baseline Revision"
folder: reviews
owner: Alejandro Osorno
created: 2026-11-09
approved: 2026-11-09
supersedes_gate: "V0 CLEARED_FOR_REPOSITORY_BOOTSTRAP (suspended until this revision closes)"
---

# PROPOSAL-REOPEN-001 — Baseline Reopening

> **Status: APPROVED by the owner on 2026-11-09.** The V0 gate is suspended until this revision closes. Approving this proposal authorizes the revision work it
> describes. It does not approve any document change by itself. Each change still goes through its
> ADR or amendment and the normal DOC-00 approval rules.

## 1. Why this exists

DOC-00–DOC-51 and ADR-001–003 were approved, and the V0 gate was cleared for repository bootstrap.
On 2026-11-09 the owner decided to **reopen the baseline** before any application code is written, for these reasons:

1. **Ownership.** The owner wants to understand and own every decision before implementation, not
   inherit a baseline he did not shape end to end.
2. **New direction.** The owner's references (§3.3) push the first impression toward something more
   cinematic than the approved iiSU/Liquid Glass softness, and include real 3D (three.js) and background music.
3. **Stack change.** The application will be built with **Astro**, not Next.js. The reason is owner
   preference: Astro is the framework he enjoys working in and will maintain.
4. **Open gaps.** Several compliance/coverage items were never closed: the SRS deliverable, the
   Colombian legal framework, terms, minors and some explicit N/A records.

The phase order the owner wants: **documentation → environment preparation → architecture validation →
Wiki/Project hygiene → coding.** No mockups or prototypes until the documentation is settled.

## 2. Experience intent (owner's words, interpreted)

The governing north star stays: *"It should feel like software you inhabit, while remaining as easy to
understand as a good website."*

In the first seconds, a visitor should think: **"how cool", "what attention to detail", "how technical",
"how well organized the information is", "what good product sense".**

- **Impact** ("cool", "detail") comes from the first impression, the materials, the motion, the sound and the hidden details.
- **Judgment** ("technical", "organized", "product sense") comes from findability, the way projects tell
  problem → decisions → architecture, and from the way the site itself is built (speed, accessibility, craft).
  *Proposal's read: product sense is the differentiator the owner most wants to prove.*

**Owner decision: the first impression leans to dazzle.** The visitor is wowed for the first seconds,
then reaches the content. The dazzle **requires no action from the visitor** ("no tiene que hacer nada").
There is no mandatory "Enter" gate and everything stays accessible and intuitive.

**Owner decision: the interaction model is unchanged.** It is a console-like interface in the spirit of iiSU.
The visitor moves through the Dock spaces, selectors, focus and widgets. The portfolio is an explorable space that stays fully functional.
It is **not** a walkable 3D world.

## 3. Decisions

Legend: **[Owner]** = decided by Alejandro in conversation. **[Proposed]** = a recommendation the owner accepted in principle ("me parece perfecto" / "como tú lo recomiendes"), which he can still overturn.

### 3.1 First impression / Boot

- **[Owner]** Dazzle first, content right after. No mandatory gate and no required action.
- **[Proposed]** These existing rules stay in force (DOC-29 MOT-022, DOC-31 Boot):
  - Boot is short, skippable and reduced-motion aware;
  - it has **no critical network dependency**;
  - it never strands the visitor;
  - returning visitors get a shortened Boot or none.
- **[Proposed]** The dazzle must not delay the content's LCP. The HTML content renders first and the cinematic
  layer enhances it. Anti-reference: Persepolis Reimagined (40+ s loader, browser hang).

### 3.2 Visual intensity: hybrid 2D + three.js

- **[Owner]** A combination of real 3D (three.js) and refined 2D motion and materials.
- **[Proposed]** Rules:
  - 3D appears only in **signature moments** where it earns its place (DOC-33 already rejects
    "unnecessary 3D"). Candidates:
    - the Boot/first-impression scene;
    - project "objects" in the Home selector (A24-style physical covers);
    - an optional architecture viewer in Project Detail (Oryzo-style technical drawing).
  - The UI chrome stays 2D: Dock, overlays, text and Liquid Glass (DOC-39).
  - There is **one persistent 3D stage** (a single WebGL context) that survives navigation instead of
    creating a context per page.
  - three.js is lazy-loaded and never part of the critical path.
  - The render loop runs on demand and pauses when the tab is hidden, the stage is off-screen or the
    visitor prefers reduced motion.
  - A static or 2D fallback is used when WebGL is unavailable, under reduced motion, when Save-Data is on,
    or on low-power/low-memory devices.
  - The 3D asset budget is set in DOC-49: compressed GLB (Meshopt/Draco) and KTX2 textures, with
    a per-route weight cap. NFR-001 (LCP < 2.5 s, CLS < 0.1, INP < 200 ms) **does not relax**.
- **[Proposed]** Implementation choice: React Three Fiber inside the React stage island, so 3D shares state
  with the selector. The builder may choose vanilla three.js if a prototype gate shows a reason to.

### 3.3 References

Local, untracked `references/` folder (never committed). It is organized by DOC-31 screen, with `notas.md`
per folder and `_web/enlaces.md` for the 10 web references (A24 concept, Lusion, Oryzo, Opal, Kode,
Persepolis, Lando Norris, Messenger/Abeto, Mana, Prometheus). The references inform **grammar, not assets**
(DOC-20/32/33 inspiration boundary unchanged).

### 3.4 Background music (reverses DOC-02 §10 and DOC-30 AFD-003)

- **[Owner]** Background music is wanted. It must be mutable and designed around the visitor's experience.
- **[Owner]** The music is royalty-free.
- **[Owner]** The site **asks** the visitor whether they want music, with a **Yes** button and a **No**
  button. A separate sound control that turns music on or off stays available at all times.
- **[Proposed]** Music prompt rules:
  - Sound stays **off until the visitor says Yes**, so DOC-30 AFD-002 (sound OFF by default) still holds.
    The Yes click is also the user gesture that browsers require before audio can play.
  - The prompt is **not a gate**. It is non-modal, does not trap focus, and the site is fully usable
    behind it. Ignoring it means no music.
  - It appears once the first impression has settled (after Boot), never on top of the LCP content.
  - The answer, Yes or No, is remembered locally. A returning visitor is not asked again and keeps
    using the always-visible control.
  - Both buttons are keyboard and screen-reader operable, labelled in ES/EN (DOC-10), and No has the
    same visual weight as Yes (no dark pattern).
- **[Proposed]** Playback rules:
  - It never starts abruptly: after Yes, low volume with a fade-in.
  - A sound control is always visible in the top chrome, operable by keyboard and screen reader, and
    satisfies WCAG 2.2 SC 1.4.2.
  - Settings exposes **Music** and **UI sounds** as separate controls.
  - The muted or unmuted choice persists locally across visits.
  - Music pauses when the tab is hidden, ducks or pauses during Project Media video, and yields to
    Arcade game audio.
  - Music **does not stop on navigation**: the audio player lives in the persistent shell (see §3.6).
- **[Proposed]** Licensing rules:
  - Only licenses that allow public web use are acceptable, with CC0 preferred.
  - When a license requires attribution (e.g. CC-BY), the credits appear in Making Of or the footer.
  - A committed **audio license register** records each track's title, source URL, license and the
    retrieval date or proof.
  - Audio files obey the DOC-19/DOC-47 asset rules.

### 3.5 Non-goal revision (DOC-02 §10)

| Non-goal | Decision | Notes |
|---|---|---|
| Background music as a core feature | **[Owner] Adopt** | §3.4 |
| Full blog CMS | **[Proposed] Adapt** → a Markdown blog in Astro Content Collections, with no CMS | Connects to Dev Log/Channel and proves "technical". **Release: V1.1** (Personality, alongside Making Of/Changelog) |
| Marketplace/theme marketplace | **[Proposed] Adapt** → **curated themes** (palette, backdrop, optional track) in Settings | No marketplace, uploads or user-authored themes. **Release: V1.1** |
| Real-time public chat / follow graph | **[Proposed] Adapt partially** → **anonymous presence** ("3 people exploring now", subtle visitor traces) | No chat, identity or messages. **Release: V1.4** (Live System), because it needs realtime infrastructure |
| More than two Arcade games | **[Proposed] Adapt** → allowed **after V1.3** | V1.3 stays at two games |
| Visitor registration/login, profiles, DMs | **Keep out** | These would bring age verification, password recovery, heavy moderation and legal liability |
| E-commerce/payments | **Keep out** | DOC-08 N/A remains |
| Arbitrary visitor uploads | **Keep out** | |
| Native iOS/Android app | **Keep out** | PWA installability may still be evaluated |
| Public API | **Keep out** | |
| Third-party/user-authored widgets | **Keep out** | |
| Freeform widget desktop | **Keep out** | ADR-001 stands |
| Fake telemetry / fake hacker terminal | **Keep out** | It contradicts "technical" |

### 3.6 Stack: Astro

- **[Owner]** **Astro** replaces Next.js as the application framework.
- **[Proposed]** The resulting baseline:
  - **Output:** static by default. Server rendering (Vercel adapter) only for the routes and endpoints
    that need it: Contact, Guestbook/Sketch submissions, moderation/admin, Arcade score sessions,
    presence, and live-data refresh where it isn't static.
  - **Persistent shell:** Astro View Transitions (`ClientRouter`) with persisted elements for the
    chrome, Dock, audio player and 3D stage. This replaces the Next.js App Router layout persistence and
    is a **prototype gate**.
  - **Project Detail over Home:** the Next.js Parallel + Intercepting Routes design (DOC-42 §14–15)
    must be re-specified. Proposed: a real `/[locale]/projects/[slug]` route that renders full-page when
    opened directly, and appears as a floating surface over a persisted Home via View Transitions when
    opened from Home. This needs a **prototype gate** (replaces the current #101 premise).
  - **Islands:** React for complex interactive islands (selector, widgets, Settings, overlays, audio
    player, 3D stage). Plain Astro with no client JS for content pages, CV, blog and project text.
    **Plain TypeScript + canvas** for the Drawing Pad and Arcade games, outside React (consistent with
    DOC-19).
  - **Cross-island state:** nanostores, so islands share state such as selection → backdrop → widgets
    without coupling.
  - **Content:** Astro Content Collections with schema validation for the canonical professional
    data (DOC-36), the blog and the Dev Log manual entries.
  - **Unchanged:**
    - TypeScript, Tailwind/CSS variables/tokens, Motion for React islands;
    - Supabase/PostgreSQL + RLS (admin-only auth), Vercel hosting, Resend email, Sentry;
    - Vitest, Storybook (Astro-compatible setup), Playwright, pgTAP;
    - GitHub Actions FAST/STANDARD/DEEP.
  - **Server mutations:** Astro Actions and/or API endpoints, as thin transports over the application
    services (DOC-43's layering principle stays, its Next.js mechanics do not).

### 3.7 Legal framework: Colombia

The owner operates from **Medellín, Colombia**.

- **[Proposed]** The applicable baseline is **Ley 1581 de 2012** (Habeas Data) and its regulation
  (Decreto 1377 de 2013, compiled in Decreto 1074 de 2015). The authority is the **SIC**.
- **[Proposed]** Consequences:
  - A **Personal Data Processing Policy** (Política de Tratamiento de Datos Personales) is published
    **from V1.0**, because Contact already collects name and email. This is earlier than DOC-08's
    "before UGC".
  - **Prior, express and informed authorization** is collected at every point where personal data is
    collected.
  - There is a channel for consulting, updating, rectifying and deleting data, with the response times
    the law sets.
  - **Terms of Use** are required before V1.2 (UGC and nicknames).
  - **Minors:** the site does not ask for age (data minimization). Before posting to Guestbook or Sketch
    Wall, the visitor ticks a short declaration ("I am 18+ or have my legal representative's
    authorization"). Pre-moderation stays as specified in DOC-13.
  - **RNBD** (Registro Nacional de Bases de Datos): believed not to apply to a natural person below
    the asset threshold. **Verify** it.
  - **GDPR:** not directly triggered while analytics are disabled and the site offers no goods or
    services. The design follows it as good practice.
  - **Legal review by a lawyer** before V1.0 production (privacy policy) and before V1.2 (terms).
    This section is a starting point, not legal advice.

### 3.8 Gap closure

| Gap | Resolution |
|---|---|
| SRS deliverable | **[Proposed]** New **DOC-52 — Software Requirements Specification (index)**. It follows the ISO/IEC/IEEE 29148 SRS outline and each section links to the canonical owner docs (DOC-01–17, DOC-41–51), with no duplicated requirements |
| Terms & conditions | §3.7: required before V1.2 |
| Legal framework | §3.7 |
| Minimum age for UGC | §3.7 declaration approach |
| Marketing email unsubscribe / postal address (CAN-SPAM-style) | Record as **N/A**: there is no newsletter or marketing email, and Contact replies are transactional. Re-evaluate if a newsletter is ever added |
| Subscription renewal terms | Record as **N/A**: there are no payments or subscriptions |
| Session replay keystroke masking | Replay stays OFF. Record that if it is ever enabled, all inputs and keystrokes are masked and the provider decision requires an ADR |
| Self-hosted fonts | Already covered (DOC-35/DOC-42 self-hosting); re-express for Astro |
| Own avatar placeholders | **[Proposed]** Generated, original placeholder avatars for Guestbook entries and leaderboard nicknames (no gravatar or third-party avatars). Specify in DOC-35 |
| Postmortems, blog, releases | Already covered (DOC-49 §76, DOC-18). The blog is now in scope (§3.5) |

## 4. Goals, non-goals, anti-goals of this revision

**Goals**
- A coherent, re-approved baseline that reflects §3, with every change traceable to an ADR or amendment.
- The owner can explain every major decision.

**Non-goals**
- Mockups, prototypes or application code (they belong after re-approval).
- Rewriting documents or sections that the decisions above do not affect.
- Redesigning the interaction model (it is confirmed unchanged).

**Anti-goals (failure even if "done")**
- A dazzling site that is slow, inaccessible or blocks content (the Persepolis failure mode).
- Music or 3D that a recruiter cannot silence or skip in one action.
- Copying third-party assets from the references.
- Tool authorship or provenance credits anywhere in the repo (DOC-19 TLG-008/009).
- Silent drift: a document changed without its owner, ADR or dependent docs being updated together.

## 5. Impact map

| Change | Primary owner docs to revise | Also touch |
|---|---|---|
| Astro stack (§3.6) | DOC-08 §2, DOC-41, DOC-42 (largest), DOC-43 | DOC-44, DOC-45, DOC-46, DOC-47, DOC-48, DOC-49, DOC-50, DOC-51, DOC-27, DOC-23, DOC-29, DOC-40, DOC-13, DOC-19, DOC-06, DOC-02, DOC-36, DOC-31, DOC-33 (≈355 Next/React-specific lines in ≈30 files) |
| Background music (§3.4) | DOC-30 (AFD-002/003), DOC-02 §10 | DOC-11 (1.4.2), DOC-07 (weight), DOC-31 (Settings + music prompt), DOC-21 (chrome control), DOC-26 (non-modal prompt), DOC-10 (ES/EN labels), DOC-42 (persistent player), DOC-47/DOC-19 (asset licensing) |
| three.js layer (§3.2) | DOC-33, DOC-29, DOC-42 | DOC-07, DOC-49 (asset budget), DOC-28 (fallbacks), DOC-39 (glass over 3D), DOC-11, DOC-50 (visual/perf tests) |
| Boot / first impression (§3.1) | DOC-29 Boot, DOC-31 Boot | DOC-04 journeys, DOC-07 |
| Blog (§3.5) | DOC-02, DOC-15 (Dev Log/Channel), DOC-31 routes | DOC-17 SEO/RSS, DOC-36, DOC-09 |
| Curated themes (§3.5) | DOC-34 | DOC-30 (per-theme track), DOC-31 Settings, ADR-001 check |
| Anonymous presence (§3.5) | DOC-02 (release), DOC-13 | DOC-15, DOC-44, DOC-46, DOC-47, DOC-12 |
| Arcade expansion (§3.5) | DOC-02 §7, DOC-14 | — |
| Legal (§3.7) | DOC-12, DOC-08 §13/§17 | DOC-13, DOC-16, DOC-44, DOC-31 (privacy/terms pages) |
| V1.0 release scope (§9 Q2) | DOC-02 (release table), DOC-50 §86 (release exit criteria) | DOC-07 (budgets measured with dazzle active), DOC-49 |
| SRS (§3.8) | **New DOC-52** | DOC-00 and docs/README index |
| Gate & status | DOC-00, docs/README, README.md | MANIFEST.json |

## 6. Process

1. **Approve this proposal** (owner). Set it to `APPROVED`. The V0 gate becomes *suspended pending revision*.
2. **Record decisions as ADRs**, each `PROPOSED` → `APPROVED` by the owner:
   - ADR-004 — Astro application framework and island architecture (§3.6)
   - ADR-005 — Background music and audio defaults (§3.4)
   - ADR-006 — three.js signature 3D layer and its budget (§3.2)
   - ADR-007 — DOC-02 non-goal revision: blog, curated themes, anonymous presence, Arcade expansion (§3.5)
   - ADR-008 — Colombian legal baseline and minors handling (§3.7)
3. **Revise documents in dependency order.** Each affected doc moves to `document_status: REVIEW`
   while being edited and returns to `APPROVED` on owner sign-off:
   1. Direction & scope: DOC-01, DOC-02, DOC-04, DOC-07, DOC-08
   2. Experience: DOC-29, DOC-30, DOC-31, DOC-33, DOC-34, DOC-35
   3. Technical: DOC-41 → DOC-42 → DOC-43 → DOC-44–DOC-51
   4. Compliance: DOC-11, DOC-12, DOC-13, DOC-15, DOC-16, DOC-17
   5. New DOC-52 SRS index
4. **Write one amendment record**, `AMENDMENT-REOPEN-001`, that lists every changed section, mirroring
   the existing `AMENDMENT-PRE-V0-CONSISTENCY-001` style.
5. **Run a cross-document consistency review**, `REVIEW-CROSS-DOCUMENT-CONSISTENCY-003`, in the style of
   the previous audits, with a P0–P3 findings table. It must PASS before the gate is re-cleared.
6. **Re-clear the V0 gate** in DOC-00 and docs/README.
7. **Update GitHub after re-approval** (each edit confirmed with the owner before it is made):
   - retitle #88 from Next.js to Astro;
   - rewrite #95 and #101 for the Astro Project-Detail design;
   - add prototype gates for the persistent shell + audio across navigation and the 3D stage budget;
   - keep the existing milestones, Project and labels.
8. **Branching and tracking [Proposed]:**
   - Do the revision on a dedicated short-lived branch from `main`, e.g. `docs/reopen-baseline-revision`,
     not on `chore/88-nextjs-workspace-bootstrap`.
   - Open **one PR per phase** of step 3 (plus one for the ADRs), each squash-merged after owner review.
   - Owner approval of a PR is the sign-off that moves its docs from `REVIEW` back to `APPROVED`.
   - Track the work with one coordination issue ("Reopen and revise the documentation baseline"),
     created only with owner confirmation, per CONTRIBUTING ("work starts from an Issue").
   - Revised documents stay in **English**, like the rest of `/docs`.

**Note on current state:** the GitHub Project, the six sprint milestones, labels, templates and the
Sprint 0 issues **already exist** from the earlier bootstrap. The Wiki (#87) and `main` protection (#85)
are still pending. Those stay in the "after documentation" phase the owner described.

## 7. Constraints

- DOC-00 authority, status vocabulary and atomic-update rule. A change updates its owner and its
  dependents together.
- DOC-19: no tool authorship or provenance in commits, PRs or docs.
- Public repo with no open-source license: no third-party assets committed, and `references/` stays local.
- WCAG 2.2 AA-compatible target (DOC-11), NFR-001 performance budgets (DOC-07), bilingual ES/EN (DOC-10).
- No application code, scaffolding or dependency installs during the revision.

## 8. Left to the builder

- The exact wording and structure inside each revised doc, provided the decisions in §3 are reflected faithfully.
- The exact Astro APIs (`ClientRouter`, `transition:persist`, Actions vs. endpoints) and the versions,
  which are pinned at bootstrap and verified against current Astro docs at that time.
- The exact numeric 3D asset budgets, proposed in DOC-49 and confirmed by the owner.
- The DOC-52 section mapping.

## 9. Owner answers to the open questions

- **Q1 — Music default. Answered [Owner]:** the site asks the visitor with explicit Yes / No buttons,
  and a separate on/off control is always available. See §3.4 for the rules derived from that answer.
- **Q2 — Release of the dazzle. Answered [Owner]:** "everything must be right before it is published."
  - **[Proposed] interpretation:** the cinematic Boot, the three.js stage and the music ship **in V1.0**.
    V1.0 goes public only when the whole first impression passes its quality gate, not on a date, and
    there is no "launch now, polish later".
  - **[Proposed] consequence:** until V1.0 passes, deployments stay as previews and are not announced as
    the public portfolio. The V1.0 release gate (DOC-50 §86, release exit criteria) gains the dazzle items:
    - Boot;
    - the 3D stage with its fallbacks;
    - the music prompt and control;
    - the audio license register.
    NFR-001 budgets are measured with all of them active.
  - **[Proposed] scope:** blog and curated themes stay in V1.1. Anonymous presence stays in V1.4. The
    impact map gains a "V1.0 release scope" row for this.
