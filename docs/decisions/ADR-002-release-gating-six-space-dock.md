---
id: ADR-002
title: "V1.0 Release Naming & Fixed-Dock Pre-release Route Gating"
record_type: adr
decision_status: APPROVED
date: 2026-09-15
affects:
  - DOC-00
  - DOC-02
  - DOC-05
  - DOC-06
  - DOC-17
  - DOC-21
  - DOC-22
  - DOC-31
  - DOC-32
---

# ADR-002 — V1.0 Release Naming & Fixed-Dock Pre-release Route Gating

## Context

The approved interface requires a fixed six-destination Dock: Home, Achievements, Arcade, Channel, Social and Contact. The release roadmap intentionally ships the full feature bodies at different increments. Earlier documents did not define what happened when a V1.0 visitor activated Achievements/Arcade/Channel/Social before their feature release, and the label `V1` was ambiguous next to V1.1–V1.4.

## Decision

1. The base public release is named **V1.0**. `V1.x` refers to the release family, not to V1.0 alone.
2. All six fixed Dock destinations exist and are activatable from V1.0.
3. A later-release major space resolves to a real localized, route-backed **Coming Soon** workspace until its feature release. The Dock control is not disabled/dead.
4. Coming Soon major routes preserve shell navigation, focus/keyboard/touch/gamepad access where applicable, Back/Home recovery and truthful release-safe copy.
5. Pre-release major routes are `noindex` and excluded from generated sitemaps until launch.
6. Unreleased subroutes normally remain unavailable/404 until their owning release unless separately approved.
7. Coming Soon surfaces never fabricate feature data, fake activity or imply an unavailable capability is live.
8. DOC-02 is the normative release owner; DOC-31 owns the route inventory and DOC-17 owns indexing mechanics.

## Release mapping

- Home — full in V1.0
- Contact — full in V1.0
- Achievements — Coming Soon in V1.0, full in V1.1
- Social — Coming Soon in V1.0, full in V1.2
- Arcade — Coming Soon in V1.0, full in V1.3
- Channel — Coming Soon in V1.0, full in V1.4

## Consequences

Positive: fixed navigation never contains dead destinations; shell identity is stable from launch; deep links are deterministic; accessibility and analytics have a real destination; release staging remains intact.

Costs: pre-release route surfaces need localized content, metadata/noindex handling and tests; sitemap generation must be release-aware; command/search surfaces must label unavailable feature bodies truthfully.

## Supersession

This ADR resolves the ambiguity in earlier release summaries. It does not accelerate the full feature releases themselves.
