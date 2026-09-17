---
id: DOC-10
title: "Localization, Language & Bilingual Behavior"
document_status: APPROVED
reconstructed: true
canonical_format: markdown
phase: Product Foundation
folder: 01-product
depends_on:
  - DOC-06
  - DOC-09
decision_families:
  - L10N
last_updated: 2026-09-15
approved_at: 2026-09-15
---

# DOC-10 — Localization, Language & Bilingual Behavior

> [!IMPORTANT]
> **Approved reconstructed baseline.** This file was reconstructed from established portfolio planning and the approved Interface Architecture package (DOC-20–DOC-32), then approved as the canonical baseline on 2026-09-15. Its reconstructed provenance is preserved for traceability; it must not contradict later approved documents or ADRs.


## 1. Scope

The public product supports Spanish and English as first-class locales.

## 2. Routing

Public routes use locale prefixes: `/en/...` and `/es/...`. Technical path vocabulary remains stable English across locales (`/es/projects/...`, not duplicated translated path structures). The language toggle preserves the current destination and meaningful route state.

## 3. Translation coverage

Both locales cover:

- navigation/system labels;
- project/professional content;
- settings/onboarding;
- form labels/validation/errors/success;
- achievements and Easter-egg text;
- 404/status/changelog/terminal responses;
- accessibility labels;
- metadata/SEO and OG text;
- CV content/artifacts.

No essential flow ships as mixed-language UI.
## 3A. Root `/` locale negotiation

Canonical content always lives under locale-prefixed routes. Root `/` is a redirect-only negotiation endpoint with this deterministic order:

1. non-sensitive `portfolio_locale` cookie (`en` or `es`) created by an explicit language choice;
2. supported best match from `Accept-Language`;
3. fallback locale **English (`en`)**.

Root responds with a **307 temporary redirect** to `/en` or `/es`, uses no geolocation, and is not itself canonical content. The redirect response is private/non-cacheable (`Cache-Control: private, no-store`) and varies on `Cookie, Accept-Language` as applicable.

Language switching on a locale-prefixed page updates `portfolio_locale` and preserves the equivalent route/context. `hreflang` includes `en` and `es`; `x-default` points to the deterministic default `/en`, not to the negotiation endpoint.


## 4. Content source model

Exact canonical translation schema is defined in DOC-36. The direction is structured language variants rather than `if (lang === 'es')` conditionals scattered through components.

## 5. Fallback

A missing optional translation may fall back safely during development, but production content validation should detect missing required locale keys/fields. Public release should not silently show untranslated raw keys.

## 6. Formatting

Dates, relative time, numbers and accessible labels use locale-aware formatting. Project technology/product names remain proper names. External source headlines normally retain source language unless a summary/translation is intentionally provided and labeled.

## 7. Layout implications

Spanish/English length differences must not break fixed-height controls. Text reflow is normal; UI does not rely on pixel-identical label widths. Responsive testing includes both locales.

## 8. CV

Both `cv.en` and `cv.es` share design structure but localize content. Language switching inside the CV surface does not create separate competing implementations.

## 9. Terminal

Useful aliases may support both languages (`help/ayuda`, `projects/proyectos`, etc.). Unix-flavored joke commands such as `sudo` remain universal. Terminal is optional and never becomes a localization blocker for core content.

## 10. SEO localization

Localized routes define correct canonical/hreflang/alternate metadata. Language switch does not create duplicate or ambiguous canonical content.

## 11. Decisions

- **L10N-001** ES and EN are equal product locales.
- **L10N-002** Route structure uses stable English technical slugs beneath locale prefixes.
- **L10N-003** Locale switch preserves current destination/context.
- **L10N-004** Essential feedback/errors/metadata are localized, not only primary page copy.
- **L10N-005** Content validation should catch missing required translations before release.
