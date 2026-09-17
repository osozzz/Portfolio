---
id: DOC-06
title: "Functional Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-05
  - DOC-20
  - DOC-31
decision_families:
  - FR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-06 — Functional Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Requirement policy

Functional requirements define externally observable capability. Interface geometry/interaction details are governed by DOC-20–DOC-32; exact backend/provider mechanisms remain technical-architecture decisions unless stated as security invariants.

## 2. Requirements

| ID | Capability | Requirement |
|---|---|---|
| FR-001 | Locale-prefixed public routing | All public core routes resolve under `/en` and `/es`; language changes preserve meaningful destination/context. |
| FR-002 | Boot | First visit may show a short skippable Boot; returning visit skips by default; reduced-motion alternative exists. |
| FR-003 | Global Dock | Expose Home, Achievements, Arcade, Channel, Social, Contact in a fixed order from V1.0. A later-release major space remains activatable and resolves to a localized route-backed Coming Soon surface until its feature release; it is never a dead control. |
| FR-004 | Home collections | Home exposes Projects, Experience, Education and Certifications; Projects is default. |
| FR-005 | Project selection | Browsing changes selected project/context without automatically opening detail or polluting history. |
| FR-006 | Project detail routes | Each public project can expose a stable `/projects/[slug]` route supporting direct entry/reload/back/forward. |
| FR-007 | Project media | Project detail can expose screenshots, video, diagrams and architecture media with accessible viewer behavior. |
| FR-008 | Project links | Repository/live/demo/external links appear only when available and are clearly marked as external. |
| FR-009 | Project lifecycle status | Support the canonical lifecycle vocabulary: Concept, Planning, In Development, Private Beta, Live, Paused, Archived, Coming Soon. Lifecycle is independent from publication state and visibility. |
| FR-010 | Experience | Display role/organization/period/public-safe description and evidence. |
| FR-011 | Education | Display institution/program/period/status/relevant work where intentionally public. |
| FR-012 | Certifications | Display issuer/date/verification details when public-safe. |
| FR-013 | CV route | Expose `/cv` in each locale with preview/download actions for EN and ES generated artifacts. |
| FR-014 | RenderCV artifacts | Public CV PDFs are generated from structured source and never manually maintained as source. |
| FR-015 | Contact form | Accept name, email and message; validate server-side; deliver real email; preserve text on failure. |
| FR-016 | Contact success | Show an in-context success result after authoritative server acceptance. |
| FR-017 | Settings | Expose theme, language, sound, motion, transparency and applicable privacy/local-data controls. |
| FR-018 | Theme | Support light, dark and system behavior with separately tuned visual states. |
| FR-019 | Sound | Sound defaults off first visit; user can enable/mute and control volume. |
| FR-020 | Motion preference | Support automatic/full/reduced behavior; system preference is respected conservatively. |
| FR-021 | Transparency preference | Support Automatic, Full, Reduced and Off. |
| FR-022 | Command Palette | Provide alternative navigation/actions via keyboard and a touch-accessible entry path. |
| FR-023 | Terminal | Provide predefined safe commands mapped to existing semantic actions; no shell/eval. |
| FR-024 | Achievements | Expose categorized real/playful/secret achievement experiences with locked/unlocked/secret/progress states. |
| FR-025 | Achievement toast | Live unlock feedback is non-blocking and state survives missed/dismissed toast. |
| FR-026 | Konami | Recognize the optional code and unlock the Old School local secret achievement. |
| FR-027 | Making Of | Expose a route documenting selected design/architecture/accessibility/performance/security decisions. |
| FR-028 | Changelog | Expose curated public release notes. |
| FR-029 | Status | Expose truthful product/integration status and version/build context where meaningful. |
| FR-030 | Guestbook | Allow nickname/message submission without account; public list returns approved content only. |
| FR-031 | Guestbook moderation | Support `pending / approved / rejected / hidden` content moderation status. Reports are separate records/signals with their own open/resolved lifecycle and do not replace the content status. |
| FR-032 | Sketch Wall | Show approved drawings generated by the controlled Drawing Pad. |
| FR-033 | Drawing Pad | Support Pen, Eraser, Text, basic Shape, color/stroke controls, Undo/Redo/Clear, local Save and explicit Publish. |
| FR-034 | Drawing resilience | Resize/orientation does not erase logical drawing content. |
| FR-035 | Drawing moderation | Publishing creates a submission/pending state before public approval. |
| FR-036 | Reporting | Visitors can report applicable public UGC; reporting is rate-limited and does not automatically grant moderation authority. |
| FR-037 | Reactions | If enabled, lightweight reactions are constrained, abuse-resistant and accountless. |
| FR-038 | Admin authentication | Only authenticated authorized admin users can access moderation tooling. |
| FR-039 | Admin moderation | Admin can inspect/approve/reject/hide submissions/reports and apply supported bans. |
| FR-040 | Audit | Privileged moderation actions are recorded. |
| FR-041 | Arcade library | Expose exactly Glitch Runner and Reflex Deploy in initial Arcade release plus optional Coming Soon presentation. |
| FR-042 | Game sessions | Separate navigation, session state and actions: navigation is Library → Game Detail → Session → Result; session states are `ready → active ↔ paused → finished`; actions include `start`, `pause`, `resume`, `exit`, `retry`. Result is post-session presentation, not a session state. |
| FR-043 | Score validation | Leaderboard submission uses server-issued/session-aware validation and plausibility checks. |
| FR-044 | Leaderboard | Expose validated rankings and personal/current-session best as appropriate without visitor accounts. |
| FR-045 | Game nickname | Collect only a public nickname when needed for leaderboard submission. |
| FR-046 | Visibility pause | Active game safely pauses/reconciles when document visibility is lost. |
| FR-047 | Tech Pulse | Expose curated external tech items with source attribution and safe external links. |
| FR-048 | Dev Log | Expose GitHub-derived activity plus manually curated milestones. |
| FR-049 | Currently Building | Expose explicitly maintained current work/milestone/status; do not infer completion solely from commit count. |
| FR-050 | GitHub cache | External GitHub data is normalized/cached server-side where appropriate. |
| FR-051 | External-data degradation | Core shell/content remain usable when GitHub/news services fail. |
| FR-052 | Dynamic OG | Important project routes can generate contextual Open Graph metadata/cards. |
| FR-053 | 404 | Invalid routes resolve to an in-system recovery experience, not a dead end. |
| FR-054 | Onboarding | Coach marks adapt to input mode, can be dismissed and are remembered locally. |
| FR-055 | Input modes | Support pointer, keyboard, touch and progressive-enhancement gamepad semantics where defined. |
| FR-056 | Local personalization | Safe local preferences/progress can persist; visitor can clear them. |
| FR-057 | Explicit remembered name | Name personalization is local/explicit and never inferred from Contact/Guestbook. |
| FR-058 | No visitor auth | All public portfolio/community/Arcade flows work without visitor registration/login. |
| FR-059 | Content localization | All essential navigation, content, errors, settings and feedback exist in ES and EN. |
| FR-060 | Progressive enhancement | Core professional routes remain understandable even when advanced JS effects or external integrations degrade. |
| FR-061 | Widget Field | Expanded/Wide Home exposes a central controlled Widget Field that combines the selected-project hero with contextual/system widget slots without becoming a uniform SaaS dashboard. |
| FR-062 | Widget customization | Visitors can pin/unpin eligible widgets, reorder them and select only supported semantic size variants through an explicit Customize mode. |
| FR-063 | Widget preference persistence | Widget preferences persist locally using a versioned logical schema and can be reset; they do not require visitor authentication. |
| FR-064 | Widget responsive mapping | The same logical widget preferences recompose across Compact/Medium/Expanded/Wide; Compact surfaces one priority widget plus access to additional eligible widgets rather than shrinking the desktop field. |
| FR-065 | Accessible widget editing | Reorder/size/pin operations provide keyboard and explicit control alternatives; drag is never the sole customization path. |

## 3. Traceability rule

Every implementation issue should cite at least one `FR-*` or explicit non-functional requirement. New observable behavior without a requirement ID should trigger a documentation update rather than remaining an undocumented side effect.

## 4. Requirement acceptance

A requirement is complete only when its applicable loading/error/empty path, responsive behavior, localization, accessibility and security constraints are satisfied. Visual presence alone is not completion.
