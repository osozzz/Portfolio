---
id: DOC-14
title: "Arcade, Achievements & Playful Progression Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-02
  - DOC-12
  - DOC-30
  - DOC-31
decision_families:
  - ARC
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-14 — Arcade, Achievements & Playful Progression Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

Define playful systems that demonstrate interaction engineering and personality without redefining the portfolio as a game platform.

## 2. Arcade scope

Initial public games are exactly:

1. **Glitch Runner** — compact runner-style experience designed for cross-device controls.
2. **Reflex Deploy** — reaction/timing game with large, simple interaction target.

A Coming Soon tile may exist. Bug Hunt or other games require later scope approval.

## 3. Game architecture requirements

Both games use a shared `GameSessionShell`. Keep three concepts separate:

- navigation: `Library → Game Detail → Session → Result`;
- session states: `ready → active ↔ paused → finished`;
- actions: `start`, `pause`, `resume`, `exit`, `retry`.

The shell also owns input-mode integration, visibility pause, score/result submission and contextual system chrome. `Result` is post-session presentation, not a session-state enum value.

Game logic should not be entangled with global navigation state or direct DB writes.

## 4. Input

Keyboard/touch are required; gamepad is progressive enhancement. Portrait remains functional; landscape may be recommended. Touch controls only appear where appropriate. Gamepad disconnect does not destroy session/navigation state.

## Accountless score privacy control

An accepted public leaderboard score issues a one-resource accountless deletion capability to the submitting browser, consistent with DOC-13/DOC-44. The capability authorizes removal/anonymization of that score only, does not establish a visitor account and cannot be used to look up unrelated Guestbook/Sketch/Arcade activity. Losing the local receipt does not cause the system to invent a cross-feature identity.

## 5. Leaderboards

No account is required. A server-authoritative session establishes eligible result context. Score submission includes plausibility checks and rate limits. Nickname is requested only when needed to display an accepted score.

Leaderboards should not imply identity certainty beyond the provided nickname.

## 6. Anti-cheat level

Goal: prevent trivial forged HTTP/database score insertion and implausible/replayed sessions. Non-goal: guarantee competitive e-sports anti-cheat against a determined reverse engineer controlling the browser.

## 7. Achievement domains

Separate categories such as:

- Engineering;
- Career;
- Academic;
- Exploration;
- Secrets.

Professional achievements belong to Alejandro. Exploration/Secrets may be local visitor progression. The UI must make this distinction obvious.

## 8. Local achievements

Examples can include:

- `OLD SCHOOL` — Konami code;
- `CURIOUS MIND` — discover Terminal;
- `FIRST MARK` — create a local sketch;
- `ARCADE`-specific score/play milestones;
- `DEEP DIVE` — open Making Of.

Exact catalog is future content work. Unlock state can be local storage; no visitor account is required.

## 9. Achievement state model

Support unlocked, locked, secret, progress/new where meaningful. Locked content can explain requirements; secret content must not leak the name/condition unless designed to.

## 10. Feedback

Achievement unlock uses a non-blocking toast/signature motion/sound when enabled. Missing/dismissing the toast never loses state. Achievements do not interrupt gameplay at unsafe moments.

## 11. Professional restraint

Contact/CV should not trigger game achievements/confetti. Real certifications are not presented as playful badges. Arcade should remain a secondary space and lazy-load its code/assets.

## 12. Decisions

- **ARC-001** Initial Arcade contains two games only.
- **ARC-002** Scores are server-validated, not direct public DB writes.
- **ARC-003** Arcade identity is nickname-based and accountless.
- **ARC-004** Visitor achievements can remain local.
- **ARC-005** Real professional accomplishments and playful progression are visually/domain-separated.
- **ARC-006** Arcade code/audio is lazy-loaded and must not burden CV/project-only visitors.
