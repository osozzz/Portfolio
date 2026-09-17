---
id: DOC-17
title: "SEO, Metadata, Analytics & Discoverability Requirements"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-10
  - DOC-12
  - DOC-31
decision_families:
  - SEO
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-17 — SEO, Metadata, Analytics & Discoverability Requirements

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. SEO philosophy

The interface may feel like an app, but public professional content must remain indexable/shareable like a high-quality website. Routing and server rendering should not sacrifice discoverability for cinematic transitions.

## 2. Indexable route set

Index candidates include locale Home, public Project Detail, Achievements, Arcade landing/game information, Channel, Social public pages, Contact, CV, Making Of, Changelog and Status where meaningful. Admin/transient/settings/palette/Terminal/moderation states are not indexable.

Final indexing policy may exclude low-value or duplicate live/status pages, but the decision is explicit.

## 3. Metadata

Each meaningful route defines localized title, description, canonical, locale alternates, Open Graph/Twitter-style metadata, appropriate social image and public robots behavior.

Project routes use project-specific metadata. Direct entry must produce meaningful HTML/meta without requiring prior client selection state.

## 4. Structured data

Evaluate schema.org `Person`, `CreativeWork`/`SoftwareApplication` or related structured data only where facts are truthful and supported. Avoid spammy markup or fake reviews/ratings.
## 4A. Locale alternates and root redirect

Locale-prefixed pages emit canonical/alternate metadata for both supported languages. `hreflang="x-default"` points to the English default equivalent (`/en/...`) rather than the redirect-only `/`. Root `/` is not indexed as duplicate content; it only negotiates and 307-redirects according to DOC-10.


## 5. Sitemap/robots

Generate locale-aware sitemap for public canonical routes. Keep admin/private/generated internal endpoints out. Robots policy should not be used as a security mechanism.

## 6. Dynamic OG

V1.4 may generate project-context OG cards from canonical title/pitch/artwork/accent. Generation should be deterministic, cached and fall back to a general portfolio image when unavailable.

## 7. Analytics philosophy

**V0/V1.0 baseline:** product analytics is disabled/no-op. No analytics consent/banner is introduced solely for a disabled analytics provider. Local preferences are first-party product state, not a substitute for analytics consent. Enabling analytics later requires the provider/event/privacy decision defined by DOC-49.

Use privacy-friendly, purposeful events rather than exhaustive surveillance. Useful aggregates may include:

- project detail opened;
- CV preview/download language;
- Contact attempt/success/failure category;
- Arcade game started/completed;
- Guestbook/sketch submit success;
- Making Of/Terminal/Command Palette opened;
- input-mode aggregate adoption if genuinely useful;
- Boot skipped/replayed.

Browsing past a project in a selector is not automatically a page view.

## 8. Prohibited analytics payloads

Do not log/send raw:

- Contact message bodies;
- Guestbook message bodies just for analytics;
- unpublished sketches;
- Terminal command text;
- Konami key sequence;
- precise cursor trails;
- full IP/precise location unless technically necessary and governed separately.

## 9. Error monitoring separation

Error monitoring may capture technical context, route/version/error category, but should scrub/redact PII and UGC payloads. Production source maps/secrets are configured securely.

## 10. Consent/privacy

Exact consent/banner requirements depend on analytics provider, cookies/storage and applicable policy. Prefer a configuration that minimizes tracking/consent burden. Local functional preferences are distinct from analytics.

## 11. Search/navigation discoverability

Command Palette can act as internal navigation/search but does not replace crawlable links/routes. Important content must be reachable through conventional anchors/navigation structures as well.

## 12. Decisions

- **SEO-001** App-like UX does not justify SPA-only undiscoverable content.
- **SEO-002** Important project detail is a stable indexable/shareable route.
- **SEO-003** Locale alternates/canonicals are explicit.
- **SEO-004** Analytics is minimal and excludes raw private creative/message input.
- **SEO-005** Robots/noindex is never treated as authorization.
- **SEO-006** Dynamic OG is enhancement; route rendering does not depend on it.
