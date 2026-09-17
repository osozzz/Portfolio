---
id: DOC-04
title: "User Journeys & Experience Outcomes"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 00-project
depends_on:
  - DOC-03
decision_families:
  - JRN
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-04 — User Journeys & Experience Outcomes

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Journey principles

Journeys describe goals and outcomes, not fixed page-by-page choreography. Interface implementation must follow approved DOC-20–DOC-32 navigation/surface rules.

## 2. JRN-01 — First visit / professional scan

1. Visitor lands on locale route or a shared project URL.
2. First-visit Boot runs briefly or is skipped/reduced.
3. Home presents a featured project immediately.
4. Visitor browses projects without changing browser history for each selection.
5. `Explore` opens a stable Project Detail route.
6. Visitor reviews Overview/Architecture/Challenges/Media as available.
7. Visitor returns and opens Experience/Education/Certifications or CV.
8. Contact is directly reachable from Dock.

**Outcome:** professional value is clear within minutes even if the visitor never touches Arcade/Social.

## 3. JRN-02 — Recruiter from direct CV/contact link

A direct `/en/cv`, `/es/cv` or `/[locale]/contact` entry must construct correct shell/context without requiring entry through Home. CV supports preview/download and Contact supports real submission. Browser Back/Forward remain coherent.

## 4. JRN-03 — Technical reviewer deep dive

Home → flagship project → Architecture/Challenges → repository/demo when public → related achievement → Making Of → selected architecture/accessibility/security/performance decisions.

**Outcome:** reviewer can distinguish real engineering work from visual decoration.

## 5. JRN-04 — Returning visitor

Boot is skipped by default. Local preferences restore. Optional explicit remembered display name may produce one small greeting. Last Home selection may be remembered for the session, not necessarily permanently. User can clear local personalization.

## 6. JRN-05 — Mobile project exploration

Compact shell → horizontal centered project carousel → explicit Explore → full-screen route detail → Back returns to same selected project. One priority widget at most. Safe areas and mobile browser chrome never cover controls.

## 7. JRN-06 — Keyboard/gamepad exploration

Keyboard/gamepad focus is obvious. Primary selector movement changes selection directly; Dock and major-space movement use semantic actions. Input hints update based on latest meaningful input. Essential functionality remains usable without controller.

## 8. JRN-07 — Contact submission

Contact → enter name/email/message → client hints + authoritative server validation → anti-spam → delivery → in-context success. On network/provider failure, text remains and a retry is offered. Contact data is not silently repurposed into personalization.

## 9. JRN-08 — Guestbook contribution

Social → Guestbook → composer → nickname/message → anti-abuse validation → submission → pending/accepted status according to moderation policy. Public wall displays only approved content. Visitor can report content without creating an account.

## 10. JRN-09 — Sketch creation/publication

Social → Sketch Wall → Draw → Utility Workspace → draw using canvas → optional local save → Publish → nickname/confirmation → moderation → pending acknowledgement. Public appearance only after approval. Resize/orientation cannot erase work.

## 11. JRN-10 — Arcade score

Arcade → select game → details → server starts signed/validated session → play → result → plausibility/server validation → optional nickname → accepted score appears in leaderboard. Client cannot directly create arbitrary leaderboard scores. Losing tab focus pauses safely.

## 12. JRN-11 — Achievement / secret

Visitor triggers eligible event (for example Konami) → local achievement state changes → non-blocking achievement toast → Achievement exists later in the appropriate category. Missing toast does not lose unlock state.

## 13. JRN-12 — Live-data degradation

GitHub/news unavailable → shell and project content remain fully usable → affected widget/feed shows cached stale data or local recoverable error → no global loading screen. Status may reflect integration degradation.

## 14. JRN-13 — Reduced-motion/transparency visitor

System honors preferences from entry. Spatial motion becomes calmer crossfades/instant states; materials become more opaque/solid; capabilities and routes remain identical.

## 15. JRN-14 — 404 / recovery

Invalid public URL → themed system 404 with direct recovery to Home/Projects and Command Palette where appropriate. No dead end.

## 16. JRN-15 — Admin moderation

Admin login → authorization → moderation dashboard → inspect a pending submission or approved/hidden content with an open report → approve/reject/hide/ban where allowed → audit action → public cache/view reflects approved state. Public client never receives privileged moderation metadata.

## 17. Journey acceptance rule

Each journey is eventually covered by at least one manual acceptance path and, for critical flows, automated E2E tests. Accessibility variants of core journeys are part of the same journey definition, not separate optional QA.

## Widget Field personalization journey

Expanded/Wide Home exposes a central personal Widget Field around the selected project. A visitor may enter an explicit Customize mode, pin/unpin eligible widgets, reorder them and choose only supported semantic size variants. Changes persist locally with a versioned schema and can be reset. Normal browsing never accidentally reorders widgets. Keyboard/non-drag controls provide an equivalent customization path. Compact does not squeeze the whole grid; it surfaces one priority widget and a Widgets surface/shelf while preserving the same logical preferences.
