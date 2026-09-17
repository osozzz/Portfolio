---
id: DOC-30
title: "Audio, Feedback & Delight System"
document_status: APPROVED
canonical_format: markdown
phase: "Interface Architecture"
folder: 02-interface-architecture
depends_on:
  - none
decision_families:
  - AFD
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-30 — Audio, Feedback & Delight System


## Principle

> Delight should reward attention, not demand attention.

Feedback channels:

- Visual
- Motion
- Audio
- Text
- Haptic-like visual response

No interaction requires all channels. Meaning always survives without sound.

## Audio character

Desired:

- soft
- digital
- warm
- short
- precise
- restrained

Avoid copied console sounds, arcade cliché, alarms, loud sci-fi effects or platform imitation.

## First-visit policy

**Sound defaults OFF for a new visitor.**

Reasons include autoplay restrictions, workplace/recruiter context, accessibility and mobile expectations.

Preference is remembered locally after explicit enablement.

No persistent background music in V1.x.

## Audio categories/events

Possible categories:

- Navigation
- Interaction
- System
- Achievement
- Feedback
- Secret
- Arcade

Semantic events:

- FOCUS_MOVE
- SELECTION_CHANGE
- CONFIRM
- BACK
- OVERLAY_OPEN
- OVERLAY_CLOSE
- SUCCESS
- ERROR
- ACHIEVEMENT_UNLOCK
- SECRET_FOUND
- BOOT_COMPLETE

Feature components never play hardcoded audio file paths directly.

## AudioManager

Central subsystem owns:

- enabled/muted state
- global volume
- semantic event mapping
- rate limiting/coalescing
- asset loading
- AudioContext unlock after valid user interaction
- document visibility handling

Top chrome needs only quick mute/unmute. Settings may expose Sound + Volume. Category mixer controls are unnecessary V1.0 complexity.

## Navigation audio

Very short/quiet cues.

No normal pointer-hover sound.

Keyboard/gamepad focus movement may use soft deliberate navigation audio. Pointer click/selection may use confirmation/selection audio.

Repeated held navigation is rate-limited. Small pitch/sample variation is optional and subtle.

## Glass / achievement / secret audio

Glass interactions may have a clean, soft, digital-material sound character but never literal glassware clinks.

Achievement unlock gets a stronger short signature. Secret discovery may have a subtly unusual/retro cue.

Boot never requests audio permission or waits for sound. Replay Boot may include audio if sound is already enabled.

## Feedback hierarchy

Minor success such as Copied, preference changed or saved locally → Toast.

Major completion such as Contact message sent, drawing submitted or accepted score → stronger in-context SuccessState when appropriate.

Errors are specific, calm, contextual and actionable. A GitHub outage does not become a full application error.

## Error severity

- Field — one validation issue
- Feature — one feature failed
- Service — dependency unavailable
- System — app-level failure

Presentation strength follows severity. Avoid loud buzzer-like error sounds.

## Toasts

Types:

- Info
- Success
- Warning
- Error
- Achievement

Rules:

- non-blocking
- do not steal focus
- avoid Dock overlap
- small visible stack, roughly 2–3
- duplicate messages coalesce
- reading time matches content importance

Achievement Toast is specialized but uses shared Toast infrastructure.

## Achievement state

Unlock state exists independently from Toast presentation. Dismissing/missing a Toast never loses the achievement.

## Feedback voice

Copy should be concise, human, lightly playful and technically clear.

Avoid childish “Oopsie!” language and sterile corporate boilerplate.

## Delight taxonomy

- **D1 Visible Personality** — Boot, Achievements, Arcade, Drawing, 404, system personality, returning greeting, Making Of.
- **D2 Discoverable** — Command Palette, Terminal, Changelog, Status, Credits, Controls/Help.
- **D3 Secret** — Konami, secret achievements, hidden commands, console message.

Easter eggs never contain essential portfolio information.

## Konami

Sequence:

`↑ ↑ ↓ ↓ ← → ← → B A`

Initial reward:

**Achievement Unlocked — OLD SCHOOL — You know the code.**

A secret theme is a future possibility, not a V1.0 requirement.

## Terminal

Discoverable through Command Palette and potentially `~` later when not typing.

It is a safe predefined-command interface over existing semantic actions — never a real shell, `eval`, JavaScript console or server terminal.

Potential commands:

- help / ayuda
- whoami
- projects / proyectos
- experience
- skills
- contact
- cv
- achievements
- clear
- theme
- sound
- coffee
- sudo

Playful examples are acceptable, e.g. `sudo hire alejandro` opening Contact. Do not build a full fake Unix parody.

Useful commands call existing navigation/actions instead of duplicating feature implementations.

## Browser console

Ship a tasteful developer message pointing curious visitors toward Command Palette/Terminal.

Do not use brittle DevTools-open detection hacks.

An optional safe global helper namespace may be considered later but must expose no privileged internals.

## Returning personalization

Do not automatically reuse Contact, Guestbook, score or sketch identity as a visitor profile.

Optional local personalization can remember a chosen display name only with explicit local consent. Otherwise “Welcome back.” is sufficient.

Provide a “Forget me on this device” / local reset path.

## Privacy boundaries

Contact identity belongs to Contact. Guestbook nickname belongs to that message. Score nickname belongs to that score. Sketch nickname belongs to that submission.

They do not form an implicit cross-feature visitor identity.

## Making Of / Credits / Changelog / Status

Making Of demonstrates concept, iiSU inspiration, design principles, architecture, accessibility, RenderCV, security, performance and selected ADRs.

Credits documents technologies, licenses, fonts/icons/services and design inspiration without implying iiSU affiliation.

Public Changelog presents curated product releases.

System Status displays only real/meaningful service/build information — never fake CPU/RAM telemetry.

## Secret/local achievements

Potential local exploration achievements include:

- OLD SCHOOL — Konami
- CURIOUS MIND — find Terminal
- FIRST MARK — create a local sketch
- ARCADE RAT — play both games
- DEEP DIVE — open Making Of

Real professional accomplishments and playful portfolio achievements remain clearly categorized.

Contact/CV stay professionally restrained: no contact-achievement, generic confetti or gamified CV download.

## Accessibility

Sound never carries exclusive meaning. Important transient events also have visible text and appropriate screen-reader announcement.

Use `aria-live` carefully:

- polite for routine status
- assertive only for critical errors

Do not announce every selector movement if that becomes noisy.

## Localization

All visible feedback/delight copy supports English and Spanish, including errors, toasts, achievements, terminal responses, 404, onboarding, Settings and Boot.

Terminal can accept useful ES/EN aliases; commands like `sudo` can remain universal.

## Licensing and performance

Every sound asset needs clear ownership/license. Do not copy proprietary console/UI sounds.

Load core SFX only after sound enablement/user interaction. Arcade-specific audio loads with the Arcade bundle. A CV-only visitor should not download game audio.

When the tab is hidden, pause/stop appropriate audio and gameplay. Do not replay queued sounds on return.

## Feedback budget

Routine interaction: visual + motion + optional subtle sound.  
Important completion: visual + text + motion + optional sound.  
Rare delight: visual + motion + text + optional signature sound.

Avoid feedback overload.

## Settings / reset

Expose real controls only:

- Sound On/Off
- Volume
- Motion Automatic/Full/Reduced
- Transparency Automatic/Full/Reduced/Off
- Theme
- Language

Local Data may offer Replay onboarding, Replay boot, reset local achievements/progress, forget personalization and clear local sketches/data with confirmation.

## Analytics/privacy

Privacy-friendly analytics may count aggregate events such as Boot skipped, Terminal opened, CV downloaded and Arcade played.

Do not record raw secret key sequences, terminal command text by default or unpublished drawing content.

## Decision registry

- AFD-001 — Feedback may combine visual/motion/audio/text but meaning never depends on audio.
- AFD-002 — Sound defaults OFF for first-time visitors.
- AFD-003 — No persistent background music in V1.x.
- AFD-004 — Audio is controlled through one semantic AudioManager.
- AFD-005 — Feature components never directly play specific audio files.
- AFD-006 — Normal pointer hover produces no sound.
- AFD-007 — Repeated navigation audio is rate-limited.
- AFD-008 — Achievement/secret events may use stronger signature sounds.
- AFD-009 — Boot never waits for audio permission.
- AFD-010 — Minor success uses Toast; major completion uses stronger in-context feedback.
- AFD-011 — Errors are contextual, specific and actionable.
- AFD-012 — Toasts have controlled stacking and duplicate coalescing.
- AFD-013 — Achievement state is independent from Achievement Toast presentation.
- AFD-014 — Delight is classified as Visible, Discoverable or Secret.
- AFD-015 — Easter eggs never contain essential portfolio information.
- AFD-016 — Konami unlocks the Old School secret achievement.
- AFD-017 — Secret/unlockable theme remains a future possibility.
- AFD-018 — Terminal is predefined-command UI, not a real shell.
- AFD-019 — Terminal commands invoke existing semantic application actions.
- AFD-020 — Browser console gets a tasteful developer Easter egg without DevTools hacks.
- AFD-021 — Returning personalization is local and explicit.
- AFD-022 — Contact/Guestbook info is never automatically reused for personalization.
- AFD-023 — Visitors can clear local personalization/progress.
- AFD-024 — 404, Making Of, Changelog and Status share system personality.
- AFD-025 — System Status only displays real/meaningful information.
- AFD-026 — Real accomplishments and playful local achievements remain clearly categorized.
- AFD-027 — Contact and CV remain professionally restrained.
- AFD-028 — Generic confetti is not part of the design system.
- AFD-029 — All textual feedback/delight supports English and Spanish.
- AFD-030 — Audio/delight assets have clear licensing/ownership.
- AFD-031 — Delight features are progressively loaded and do not inflate core performance.
- AFD-032 — Sound/animation pause appropriately with document visibility.
- AFD-033 — User settings override optional delight behavior.
- AFD-034 — Analytics do not record raw secret inputs or unpublished creative content.
- AFD-035 — Every delight feature passes accessibility/privacy/performance/responsive review.
