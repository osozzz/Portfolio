---
id: ADR-005
title: "Background Music, Music Prompt and Audio Defaults"
record_type: adr
decision_status: APPROVED
date: 2026-11-09
owners:
  - Alejandro Osorno
scope: "Background music, the first-visit music prompt, the persistent sound control and audio licensing for V1.0 onward"
affects:
  - DOC-02
  - DOC-04
  - DOC-07
  - DOC-10
  - DOC-11
  - DOC-19
  - DOC-21
  - DOC-26
  - DOC-29
  - DOC-30
  - DOC-31
  - DOC-34
  - DOC-42
  - DOC-47
  - DOC-50
supersedes:
  - "DOC-30 AFD-003 — No persistent background music in V1.x"
  - "DOC-02 §10 background-music non-goal"
---

# ADR-005 — Background Music, Music Prompt and Audio Defaults

## Context

DOC-02 §10 and DOC-30 AFD-003 excluded persistent background music from V1.x. The owner now wants background music as part of the first impression (PROPOSAL-REOPEN-001 §3.4). Three constraints shape how it works:

- **Autoplay:** browsers block audio until the visitor makes a gesture.
- **Context:** recruiters often open links at work.
- **Accessibility:** WCAG 2.2 SC 1.4.2 requires a way to stop any audio that plays automatically.

DOC-30 AFD-002 (sound defaults OFF for first-time visitors) remains in force.

## Decision

1. **Music is in scope.** It is royalty-free and ships in V1.0 (§9 Q2).
2. **The site asks.** It offers the visitor a choice with two buttons, **Yes** and **No**. A sound control that turns music on or off is also available at all times.
3. **The prompt is not a gate.**
   - Sound stays off until the visitor answers Yes, so AFD-002 still holds.
   - The Yes click is the gesture that unlocks audio.
   - The prompt is non-modal and never traps focus. The site is fully usable behind it.
   - Ignoring the prompt means no music.
4. **Placement.** The prompt appears once the first impression has settled, after Boot. It never covers the LCP content.
5. **Memory.** The answer, Yes or No, is stored locally. A returning visitor is not asked again and uses the always-visible control.
6. **Equal choice.** Both buttons work with keyboard and screen reader and are labelled in ES and EN (DOC-10). No has the same visual weight as Yes, so the prompt is not a dark pattern.
7. **Playback.**
   - After Yes, music starts at low volume with a fade-in.
   - The sound control lives in the top chrome and is keyboard and screen-reader operable (SC 1.4.2).
   - Settings exposes **Music** and **UI sounds** as separate controls.
   - The current choice persists locally across visits.
   - Music pauses when the tab is hidden, ducks or pauses during Project Media video, and yields to Arcade game audio.
   - Music does not stop on navigation: the player lives in the persistent shell (ADR-004).
8. **Licensing.**
   - Only licenses that allow public web use are acceptable, and CC0 is preferred.
   - When a license requires attribution (e.g. CC-BY), the credit appears in Making Of or the footer.
   - A committed **audio license register** records each track's title, source URL, license and the retrieval date or proof.
   - Audio files follow the DOC-19/DOC-47 asset rules.

## Options considered

### Option A — Ask with Yes / No plus a persistent control (chosen, owner decision)

The visitor makes an explicit choice, and the choice itself unlocks autoplay. AFD-002 survives.

### Option B — Start softly on the first interaction, with mute always visible

This dazzles more on first contact. However, it surprises visitors in a workplace context and conflicts with AFD-002.

### Option C — Off until the visitor finds and uses the control

This is the safest option, but most visitors would never hear the music.

## Criteria and evidence

- Owner decision (2026-11-09): "Debe preguntar si desea escuchar música… un botón para sí y un botón para no, aparte del botón que la activa o la desactiva siempre."
- Browser autoplay policy: audio needs a user gesture.
- WCAG 2.2 SC 1.4.2 Audio Control.

## Consequences

### Positive

- Music becomes part of the experience without overriding the visitor's choice.
- The prompt gives a natural moment of interaction to the first impression.

### Costs / risks

- One extra surface on the first visit. It must not read as a cookie-banner-style gate.
- Audio weight must stay off the critical path (DOC-07, DOC-49).
- Sourcing and licensing tracks takes owner effort before V1.0.
- Persisting playback across navigation depends on ADR-004 prototype gate 1.

## Reversibility and migration

Reversing is easy: remove the prompt and player and restore AFD-003. Stored preferences become harmless leftovers.

## Security / privacy / accessibility / performance impact

- **Privacy:** only the local preference is stored, and no analytics are attached.
- **Accessibility:** SC 1.4.2; non-modal prompt; screen-reader labels; meaning never depends on audio (AFD-001).
- **Performance:** the audio file loads lazily after Yes and never before first paint.
- **Security:** audio files are self-hosted static assets under the existing CSP.

## Follow-up

- DOC-30 gains a music-prompt section and new AFD IDs, and AFD-003 becomes SUPERSEDED.
- DOC-31, DOC-21, DOC-26, DOC-10 and DOC-11 specify the prompt surface, the control and the copy.
- DOC-50 §86 adds the music prompt, the control and the license register to the V1.0 exit criteria.
