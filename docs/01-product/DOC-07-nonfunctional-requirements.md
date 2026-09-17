---
id: DOC-07
title: "Non-Functional Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-06
decision_families:
  - NFR
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-07 — Non-Functional Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Purpose

These requirements define quality boundaries that apply across features. A feature that “works” but violates applicable NFRs is incomplete.

## 2. Requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-001 | Performance | Target good Core Web Vitals on representative hardware; provisional LCP <2.5s, CLS <0.1, INP <200ms for core routes. |
| NFR-002 | Initial payload | Keep core initial JS intentionally small; heavy Drawing/Arcade/admin/viewer code must not load for unrelated visits. |
| NFR-003 | Media | No autoplay heavy video; responsive images, intrinsic dimensions, modern formats and deliberate preload/lazy-load policy. |
| NFR-004 | Responsiveness | Compact/Medium/Expanded/Wide are first-class; layouts recompose before shrinking. |
| NFR-005 | Input latency | Navigation/selection acknowledges meaningful input within roughly 100ms even if visual motion continues. |
| NFR-006 | Accessibility | Aim for WCAG 2.2 AA-compatible implementation for public core experiences; deviations require documented rationale. |
| NFR-007 | Keyboard | All essential actions have keyboard-accessible paths; no focus traps/dead ends. |
| NFR-008 | Touch | No essential hover, double-tap, long-press or swipe-only behavior; comfortable target sizes. |
| NFR-009 | Text zoom | Core UI survives 125%, 150% and 200% zoom/text scaling without lost capability. |
| NFR-010 | Motion | Reduced-motion preference removes/shortens large spatial motion while preserving meaning/capability. |
| NFR-011 | Transparency | Reduced/off transparency preserves hierarchy/readability/focus using solid fallbacks. |
| NFR-012 | Reliability | Failure of a noncritical integration remains local; core project/CV/contact navigation does not depend on live feeds. |
| NFR-013 | Contact reliability | Contact failures preserve user text and communicate retryable/non-retryable state clearly. |
| NFR-014 | Security | No known critical/high exploitable issue is accepted for public release without explicit risk decision. |
| NFR-015 | Privacy | Collect minimum data, separate task-specific identity, avoid raw IP retention where not required, and never sell/share conversation-like visitor data. |
| NFR-016 | Abuse resistance | Public write endpoints have server validation, size limits, rate limits and anti-automation controls appropriate to risk. |
| NFR-017 | Authorization | Admin privileges are enforced server-side/data-layer; hidden routes/UI are never treated as authorization. |
| NFR-018 | Localization | ES/EN parity for essential content and feedback; locale switch preserves route/context. |
| NFR-019 | SEO | Important public content is crawlable/shareable with canonical/localized metadata; transient/private admin states are not indexed. |
| NFR-020 | Maintainability | Typed domain models, migrations, modular feature boundaries, documented primitives and no unnecessary framework-within-framework abstractions. |
| NFR-021 | Testability | Core logic, security boundaries and critical journeys have automated tests appropriate to risk. |
| NFR-022 | Observability | Production errors and critical external-delivery/integration failures are diagnosable without exposing sensitive payloads. |
| NFR-023 | Compatibility | Support current mainstream evergreen browsers; advanced effects progressively degrade when APIs/effects are unavailable. |
| NFR-024 | Safe areas/viewports | Mobile persistent controls account for safe-area and dynamic viewport/keyboard behavior. |
| NFR-025 | Cost | Architecture starts managed/simple and avoids always-on infrastructure whose value is not justified by actual traffic. |
| NFR-026 | Data integrity | Score/moderation/contact state changes are server-authoritative; idempotency is used for externally retried operations where relevant. |
| NFR-027 | Content truth | No invented roles, dates, credentials, project metrics, technologies or completion percentages. |
| NFR-028 | Licensing | Fonts, icons, sounds, images and third-party assets require documented rights/licenses; no copied iiSU assets. |
| NFR-029 | Supply chain | Dependencies are pinned/locked, updated deliberately and scanned for known vulnerabilities. |
| NFR-030 | Graceful JS failure | Core public content should remain meaningful through server-rendering/progressive enhancement where feasible. |
| NFR-031 | Widget layout portability | Persist widget intent as logical pin/order/size preferences, never viewport-specific pixel coordinates, so preferences remain valid across responsive modes and future layout tuning. |
| NFR-032 | Customization accessibility | Widget customization must be operable without drag-and-drop, preserve focus, announce meaningful changes and remain usable with reduced motion/transparency. |
| NFR-033 | Widget-field performance | Personalization must not introduce continuous layout polling, expensive drag loops in normal browsing, or block initial project content; expensive widget data remains independently lazy/cached. |

## 3. Measurement policy

Performance/accessibility/reliability/security goals become release gates with representative devices and synthetic/real telemetry as the product matures. Exact thresholds can tighten after baselines exist; they should not be silently weakened to make a release pass.

## 4. Priority under constraint

When quality goals conflict with decorative richness, preserve capability, comprehension, accessibility, security and responsiveness before advanced visual effects.
